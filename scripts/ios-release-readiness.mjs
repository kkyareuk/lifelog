import {appleGet} from './ios-asc-status.mjs';
import {writeFileSync,mkdirSync} from 'node:fs';
// Read-only release audit. Credentials stay in the environment, never in reports.
const appId='6808600866';
const versions=await appleGet(`/v1/apps/${appId}/appStoreVersions`);
const version=versions.data.find(v=>v.attributes.platform==='IOS'&&v.attributes.appStoreState==='PREPARE_FOR_SUBMISSION');
if(!version)throw Error('No editable iOS release found');
const [build,locales,review,products]=await Promise.all([
 appleGet(`/v1/appStoreVersions/${version.id}/build`),
 appleGet(`/v1/appStoreVersions/${version.id}/appStoreVersionLocalizations`),
 appleGet(`/v1/appStoreVersions/${version.id}/appStoreReviewDetail`),
 appleGet(`/v1/apps/${appId}/inAppPurchasesV2`)
]);
const a=review.data?.attributes||{};
const report={checkedAt:new Date().toISOString(),appId,version:version.attributes.versionString,state:version.attributes.appStoreState,releaseType:version.attributes.releaseType,
 build:build.data?{number:build.data.attributes.version,state:build.data.attributes.processingState,audience:build.data.attributes.buildAudienceType,encryptionAnswered:typeof build.data.attributes.usesNonExemptEncryption==='boolean'}:null,
 locales:locales.data.map(v=>({locale:v.attributes.locale,description:!!v.attributes.description,supportUrl:!!v.attributes.supportUrl})),
 review:{contactComplete:['contactFirstName','contactLastName','contactPhone','contactEmail'].every(k=>!!a[k]),demoAccountRequired:a.demoAccountRequired,demoAccountComplete:!!a.demoAccountName&&!!a.demoAccountPassword,notesPresent:!!a.notes},
 products:products.data.map(p=>({id:p.id,productId:p.attributes.productId,state:p.attributes.state})),ready:false,
 limitation:'This read-only audit cannot certify native login, account deletion, device purchases, screenshots, privacy declarations or review eligibility.'};
mkdirSync('ios/build/testflight-reports',{recursive:true});
writeFileSync('ios/build/testflight-reports/release-readiness.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
