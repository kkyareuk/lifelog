import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,existsSync,readdirSync,copyFileSync,rmSync} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {preflight,findBuild,saveStatus} from './ios-asc-status.mjs';

assert.equal(process.platform,'darwin','Signing only runs on the macOS runner');
assert.equal(process.env.GITHUB_REF,'refs/heads/dev','No production branch signing');
const request=JSON.parse(readFileSync('.github/ios-testflight-request.json','utf8'));
const release=JSON.parse(readFileSync('ios-release.json','utf8'));
assert.equal(request.uploadToTestFlight,true);
assert.equal(request.internalOnly,true);
assert.equal(request.submitForReview,false);
assert.equal(release.appStoreReady,false,'This path is an internal preview, not a store release');
assert.equal(request.build,release.build);
assert.equal(request.version,release.version);
const env=process.env;
const secretNames=['IOS_DISTRIBUTION_P12_BASE64','IOS_DISTRIBUTION_P12_PASSWORD','IOS_PROVISION_PROFILE_BASE64','ASC_KEY_ID','ASC_ISSUER_ID','ASC_PRIVATE_KEY'];
for(const name of secretNames)assert.ok(env[name]?.trim(),`Missing ${name}`);
const sensitive=secretNames.map(name=>env[name]);
function redact(value){
  let text=String(value||'');
  for(const secret of sensitive)if(secret)text=text.split(secret).join('[REDACTED]');
  return text.replace(/-----BEGIN [^-]*PRIVATE KEY-----[\s\S]*?-----END [^-]*PRIVATE KEY-----/g,'[PRIVATE KEY REDACTED]').replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,'[TOKEN REDACTED]');
}
function run(executable,args,options={}){
  try{return execFileSync(executable,args,{encoding:'utf8',maxBuffer:32*1024*1024,timeout:12*60*1000,stdio:['pipe','pipe','pipe'],...options});}
  catch(error){
    console.error(redact(`${error.stdout||''}\n${error.stderr||''}`).slice(-10000));
    throw new Error(`${path.basename(executable)} ${args[0]} failed; credentials suppressed`);
  }
}
function plist(value){
  const esc=text=>String(text).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  const node=v=>typeof v==='boolean'?`<${v}/>`:typeof v==='number'?`<integer>${v}</integer>`:typeof v==='object'?`<dict>${Object.entries(v).map(([k,x])=>`<key>${esc(k)}</key>${node(x)}`).join('')}</dict>`:`<string>${esc(v)}</string>`;
  return `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd"><plist version="1.0">${node(value)}</plist>`;
}
const tempParent=path.resolve(env.RUNNER_TEMP);
const temp=mkdtempSync(path.join(tempParent,'drawer-ios-signing-'));
const keychain=path.join(temp,'signing.keychain-db');
const p12=path.join(temp,'distribution.p12'),profileFile=path.join(temp,'profile.mobileprovision');
const projectFile='ios/App/App.xcodeproj/project.pbxproj';
const projectOriginal=readFileSync(projectFile,'utf8');
let installedProfile='',keychainCreated=false,uploadAccepted=false;
let stage='preflight';
try{
  const appId=await preflight();
  // The export setting below restricts this build to internal TestFlight.
  console.log(`Preparing internal TestFlight ${release.version} (${release.build}).`);
  stage='signing-import';
  writeFileSync(p12,Buffer.from(env.IOS_DISTRIBUTION_P12_BASE64,'base64'),{mode:0o600});
  writeFileSync(profileFile,Buffer.from(env.IOS_PROVISION_PROFILE_BASE64,'base64'),{mode:0o600});
  const decoded=run('security',['cms','-D','-i',profileFile]);
  // Provisioning plists include dates/data, which plutil cannot convert to JSON.
  const profile=JSON.parse(run('python3',['-c','import sys,plistlib,json,base64,datetime; print(json.dumps(plistlib.loads(sys.stdin.buffer.read()),default=lambda v: base64.b64encode(v).decode() if isinstance(v,bytes) else v.isoformat()+"Z"))'],{input:decoded}));
  const team='3KH3F66KQ3',bundle='com.drawervillage.app';
  assert.deepEqual(profile.TeamIdentifier,[team]);
  assert.equal(profile.Entitlements['application-identifier'],`${team}.${bundle}`);
  assert.equal(profile.Entitlements['get-task-allow'],false);
  assert.equal(profile.Entitlements['beta-reports-active'],true);
  assert.ok(!profile.ProvisionedDevices&&!profile.ProvisionsAllDevices);
  assert.ok(new Date(profile.ExpirationDate)>new Date());
  assert.match(profile.UUID,/^[A-Fa-f0-9-]+$/);
  const password=randomBytes(32).toString('hex'); sensitive.push(password);
  run('security',['create-keychain','-p',password,keychain]); keychainCreated=true;
  run('security',['set-keychain-settings','-lut','1800',keychain]);
  run('security',['unlock-keychain','-p',password,keychain]);
  run('security',['import',p12,'-P',env.IOS_DISTRIBUTION_P12_PASSWORD,'-A','-t','cert','-f','pkcs12','-k',keychain]);
  run('security',['set-key-partition-list','-S','apple-tool:,apple:','-k',password,keychain]);
  run('security',['list-keychains','-d','user','-s',keychain,path.join(os.homedir(),'Library/Keychains/login.keychain-db')]);
  const identities=run('security',['find-identity','-v','-p','codesigning',keychain]);
  assert.match(identities,/Apple Distribution:/,'No trusted Apple Distribution signing identity available');
  const profileDirectory=path.join(os.homedir(),'Library/MobileDevice/Provisioning Profiles');
  mkdirSync(profileDirectory,{recursive:true});
  const profileDestination=path.join(profileDirectory,`${profile.UUID}.mobileprovision`);
  assert.ok(!existsSync(profileDestination),'Refusing to overwrite a pre-existing profile');
  copyFileSync(profileFile,profileDestination);installedProfile=profileDestination;
  // Target-only settings prevent CocoaPods targets receiving an app profile.
  const replacements=projectOriginal.match(/CODE_SIGN_STYLE = Automatic;/g)||[];
  assert.equal(replacements.length,2);
  writeFileSync(projectFile,projectOriginal.replaceAll('CODE_SIGN_STYLE = Automatic;',`CODE_SIGN_STYLE = Manual;\n DEVELOPMENT_TEAM = ${team};\n CODE_SIGN_IDENTITY = "Apple Distribution";\n PROVISIONING_PROFILE_SPECIFIER = "${profile.UUID}";`));
  stage='archive';
  const archive=path.join(temp,'DrawerVillage.xcarchive'),exportDir=path.join(temp,'export');
  console.log('Signing identity imported. Building iPhone/iPad device archive.');
  run('xcodebuild',['-workspace','ios/App/App.xcworkspace','-scheme','App','-configuration','Release','-sdk','iphoneos','-destination','generic/platform=iOS','-archivePath',archive,'-derivedDataPath',path.join(temp,'DerivedData'),'archive']);
  const app=path.join(archive,'Products/Applications/App.app');
  run('codesign',['--verify','--deep','--strict',app]);
  const info=JSON.parse(run('plutil',['-convert','json','-o','-',path.join(app,'Info.plist')]));
  assert.equal(info.CFBundleIdentifier,bundle);
  assert.equal(info.CFBundleShortVersionString,release.version);
  assert.equal(info.CFBundleVersion,String(release.build));
  stage='export';
  const exportOptions=path.join(temp,'ExportOptions.plist');
  writeFileSync(exportOptions,plist({method:'app-store-connect',destination:'export',teamID:team,signingStyle:'manual',signingCertificate:'Apple Distribution',provisioningProfiles:{[bundle]:profile.UUID},manageAppVersionAndBuildNumber:false,stripSwiftSymbols:true,uploadSymbols:true,testFlightInternalTestingOnly:true}));
  run('xcodebuild',['-exportArchive','-archivePath',archive,'-exportPath',exportDir,'-exportOptionsPlist',exportOptions]);
  const ipas=readdirSync(exportDir).filter(name=>name.endsWith('.ipa'));
  assert.equal(ipas.length,1,'Expected one signed IPA');
  const ipa=path.join(exportDir,ipas[0]);
  const keys=path.join(temp,'private_keys');mkdirSync(keys,{mode:0o700});
  assert.match(env.ASC_KEY_ID.trim(),/^[A-Za-z0-9]+$/);
  writeFileSync(path.join(keys,`AuthKey_${env.ASC_KEY_ID.trim()}.p8`),env.ASC_PRIVATE_KEY.trim()+'\n',{mode:0o600});
  const uploadEnv={...env,API_PRIVATE_KEYS_DIR:keys};
  stage='validate';
  console.log('Signed archive and IPA ready. Validating with Apple.');
  const auth=['--apiKey',env.ASC_KEY_ID.trim(),'--apiIssuer',env.ASC_ISSUER_ID.trim()];
  run('xcrun',['altool','--validate-app','--file',ipa,'--type','ios',...auth],{env:uploadEnv});
  stage='upload';
  run('xcrun',['altool','--upload-app','--file',ipa,'--type','ios',...auth],{env:uploadEnv});
  uploadAccepted=true;
  saveStatus('upload',{appId,version:release.version,build:release.build,internalOnly:true,uploadAccepted:true,submittedForReview:false,source:env.GITHUB_SHA});
  console.log('Apple accepted the upload. Checking processing status (bounded wait).');
  stage='processing';
  let build=null;
  for(let attempt=0;attempt<12;attempt++){
    build=await findBuild(appId);
    if(build&&build.processingState!=='PROCESSING')break;
    await new Promise(resolve=>setTimeout(resolve,15000));
  }
  saveStatus('apple-build',{appId,build,uploadAccepted:true});
  console.log(JSON.stringify({appId,build,uploadAccepted:true}));
  if(build)assert.ok(!['FAILED','INVALID'].includes(build.processingState),'Apple build processing failed');
  // Never create public links, notify testers, answer encryption declarations,
  // or submit beta/App Store reviews automatically in this upload-only path.
}catch(error){
  saveStatus('failure',{stage,uploadAccepted,message:redact(error.message)});
  console.error(redact(error.message));process.exitCode=1;
}finally{
  writeFileSync(projectFile,projectOriginal);
  if(installedProfile)rmSync(installedProfile,{force:true});
  if(keychainCreated){try{run('security',['delete-keychain',keychain]);}catch{console.error('Keychain cleanup failed; hosted runner will be discarded.');}}
  assert.equal(path.dirname(temp),tempParent);
  assert.ok(path.basename(temp).startsWith('drawer-ios-signing-'));
  rmSync(temp,{recursive:true,force:true});
}
