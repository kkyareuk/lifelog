import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {appleGet,saveStatus} from './ios-asc-status.mjs';
assert.equal(process.env.GITHUB_REF,'refs/heads/dev');
const temp=mkdtempSync(join(tmpdir(),'drawer-profile-audit-'));
try{
 const path=join(temp,'profile.mobileprovision');writeFileSync(path,Buffer.from(process.env.IOS_PROVISION_PROFILE_BASE64,'base64'),{mode:0o600});
 const decoded=execFileSync('security',['cms','-D','-i',path]);
 const summary=JSON.parse(execFileSync('python3',['-c',`import sys,plistlib,json; p=plistlib.loads(sys.stdin.buffer.read()); e=p['Entitlements']; print(json.dumps({'appleSignIn':e.get('com.apple.developer.applesignin',[]),'bundleMatches':e.get('application-identifier','').endswith('.com.drawervillage.app'),'expires':p['ExpirationDate'].isoformat()}))`],{input:decoded,encoding:'utf8'}));
 const bundles=await appleGet('/v1/bundleIds?filter[identifier]=com.drawervillage.app&limit=2');assert.equal(bundles.data.length,1);
 const caps=await appleGet('/v1/bundleIds/'+bundles.data[0].id+'/bundleIdCapabilities?limit=100');
 summary.appleCapabilityEnabled=caps.data.some(x=>x.attributes.capabilityType==='APPLE_ID_AUTH');
 console.log(JSON.stringify(summary));saveStatus('signing-audit',summary);
}finally{rmSync(temp,{recursive:true,force:true})}
