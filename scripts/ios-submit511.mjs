// One authorized iOS 511 production submission. No account, pricing, privacy,
// tester, permission, or agreement changes. Existing Apple keys stay in CI.
import assert from 'node:assert/strict';
import {makeToken,findApp,appleGet,saveStatus} from './ios-asc-status.mjs';
const appId=await findApp();assert.equal(appId,'6808600866');
const mode=process.argv[2]||'status';assert(['status','prepare','submit'].includes(mode));
const expectedVersion='1.0.459',expectedBuild='511';
async function write(path,method,data){
 assert(path.startsWith('/v1/'));const r=await fetch('https://api.appstoreconnect.apple.com'+path,{method,headers:{Authorization:'Bearer '+makeToken(),'Content-Type':'application/json'},body:JSON.stringify({data}),redirect:'error',signal:AbortSignal.timeout(45000)});
 const body=r.status===204?{}:await r.json();if(!r.ok)throw Error('Apple '+r.status+': '+JSON.stringify(body.errors?.map(e=>({code:e.code,title:e.title,source:e.source,detail:e.detail,associated:e.meta?.associatedErrors}))));return body;
}
const versions=(await appleGet(`/v1/apps/${appId}/appStoreVersions?limit=20`)).data;
const v=versions.find(v=>v.attributes.versionString===expectedVersion)||versions.find(v=>v.id===draftId);
assert(v,'Known draft missing');assert(['1.0.444',expectedVersion].includes(v.attributes.versionString));
const query=new URLSearchParams({'filter[app]':appId,'filter[version]':expectedBuild,'filter[buildAudienceType]':'APP_STORE_ELIGIBLE',include:'preReleaseVersion',limit:'100'});
const builds=await appleGet('/v1/builds?'+query);const build=builds.data.find(b=>builds.included?.some(p=>p.id===b.relationships.preReleaseVersion.data.id&&p.attributes.version===expectedVersion));
if(mode!=='status'){
 assert(build?.attributes.processingState==='VALID','511 build must be processed and valid');
 assert(['PREPARE_FOR_SUBMISSION','READY_FOR_REVIEW'].includes(v.attributes.appStoreState),'Only editable hotfix draft may be changed');
 if(mode==='prepare'){
  await write('/v1/appStoreVersions/'+v.id,'PATCH',{type:'appStoreVersions',id:v.id,attributes:{versionString:expectedVersion,releaseType:'AFTER_APPROVAL'},relationships:{build:{data:{type:'builds',id:build.id}}}});
  const notes=JSON.parse((await import('node:fs')).readFileSync(new URL('../docs/ios511-notes.json',import.meta.url),'utf8'));
  const locales=(await appleGet(`/v1/appStoreVersions/${v.id}/appStoreVersionLocalizations?limit=50`)).data;
  for(const [locale,whatsNew] of Object.entries(notes)){const entry=locales.find(l=>l.attributes.locale===locale);assert(entry,'Missing locale '+locale);await write('/v1/appStoreVersionLocalizations/'+entry.id,'PATCH',{type:'appStoreVersionLocalizations',id:entry.id,attributes:{whatsNew}});}
 }
 if(mode==='submit'){
  assert.equal(v.attributes.versionString,expectedVersion);
  if(build.attributes.usesNonExemptEncryption==null){
   const previous=(await appleGet('/v1/appStoreVersions/169ef378-ddb7-4f4e-b0f4-486ed14f12db/build')).data;
   assert.equal(previous.attributes.usesNonExemptEncryption,false,'Only carry forward the existing released507 declaration; never guess it');
   await write('/v1/builds/'+build.id,'PATCH',{type:'builds',id:build.id,attributes:{usesNonExemptEncryption:false}});
  }
  const attached=await appleGet(`/v1/appStoreVersions/${v.id}/build`);assert.equal(attached.data.id,build.id);
  const submissions=(await appleGet(`/v1/apps/${appId}/reviewSubmissions?limit=100`)).data;
  let submission,emptyDraft;
  for(const sub of submissions.filter(s=>s.attributes.state==='READY_FOR_REVIEW')){
   const items=(await appleGet(`/v1/reviewSubmissions/${sub.id}/items?include=appStoreVersion&limit=100`)).data;
   if(items.length===0 && sub.attributes.platform==='IOS')emptyDraft??=sub;
   if(items.some(i=>i.relationships?.appStoreVersion?.data?.id===v.id)){assert.equal(items.length,1,'Do not submit unrelated items');submission=sub;break;}
  }
  if(!submission){submission=emptyDraft||(await write('/v1/reviewSubmissions','POST',{type:'reviewSubmissions',attributes:{platform:'IOS'},relationships:{app:{data:{type:'apps',id:appId}}}})).data;await write('/v1/reviewSubmissionItems','POST',{type:'reviewSubmissionItems',relationships:{reviewSubmission:{data:{type:'reviewSubmissions',id:submission.id}},appStoreVersion:{data:{type:'appStoreVersions',id:v.id}}}});}
  await write('/v1/reviewSubmissions/'+submission.id,'PATCH',{type:'reviewSubmissions',id:submission.id,attributes:{submitted:true}});
 }
}
const final=(await appleGet('/v1/appStoreVersions/'+v.id)).data;
const report={appId,mode,versionId:final.id,version:final.attributes.versionString,state:final.attributes.appStoreState,releaseType:final.attributes.releaseType,build:build?{id:build.id,number:build.attributes.version,state:build.attributes.processingState}:null};
saveStatus('ios-production-submission',report);console.log(JSON.stringify(report));
