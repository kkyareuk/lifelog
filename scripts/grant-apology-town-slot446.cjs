'use strict';
// Operator-only, dry run by default. Fixed campaign and cutoff prevent duplicate grants.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {CAMPAIGN,nextSlots,grant}=require('../functions/registration-town-slot');
const PROJECT='lifelog-98fff';
async function main(){
 const req=require('node:module').createRequire(path.join(__dirname,'../functions/package.json'));
 const {initializeApp}=req('firebase-admin/app'),{getAuth}=req('firebase-admin/auth'),{Firestore}=req('@google-cloud/firestore');
 const authModule=process.env.DRAWER_FIREBASE_AUTH_MODULE;
 if(!authModule)throw Error('Firebase CLI authentication module required');
 const cli=require(authModule),api=require(path.join(path.dirname(authModule),'api.js'));
 const login=JSON.parse(fs.readFileSync(path.join(os.homedir(),'.config/configstore/firebase-tools.json'),'utf8'));
 const app=initializeApp({projectId:PROJECT,credential:{getAccessToken:async()=>{const t=await cli.getAccessToken(login.tokens.refresh_token,login.tokens.scopes);return {access_token:t.access_token,expires_in:t.expires_in||3600}}}});
 const db=new Firestore({projectId:PROJECT,credentials:{type:'authorized_user',client_id:api.clientId(),client_secret:api.clientSecret(),refresh_token:login.tokens.refresh_token}});
 const campaign=db.collection('operatorCompensations').doc(CAMPAIGN),stored=await campaign.get();
 const cutoff=stored.data()?.cutoff||Date.now(),users=[];let pageToken;
 do{const page=await getAuth(app).listUsers(1000,pageToken);users.push(...page.users);pageToken=page.pageToken}while(pageToken);
 const deleted=new Set((await db.collection('deletedAccounts').select().get()).docs.map(d=>d.id));
 const recipients=users.filter(u=>Date.parse(u.metadata.creationTime)<=cutoff&&!deleted.has(u.uid));
 console.log(JSON.stringify({campaign:CAMPAIGN,cutoff,registered:users.length,recipients:recipients.length,mode:process.argv.includes('--grant')?'grant':'dry-run'}));
 if(!process.argv.includes('--grant'))return;
 await db.runTransaction(async tx=>{const existing=await tx.get(campaign);if(existing.exists&&existing.data().cutoff!==cutoff)throw Error('Campaign cutoff changed');if(!existing.exists)tx.create(campaign,{cutoff,amount:1,status:'granting',recipientCount:recipients.length})});
 const counts={granted:0,existing:0,deleted:0};
 for(let i=0;i<recipients.length;i+=15){const results=await Promise.all(recipients.slice(i,i+15).map(u=>grant(db,u.uid)));for(const result of results)counts[result]++;if(i%150===0)console.log(JSON.stringify({processed:Math.min(i+15,recipients.length),...counts}))}
 let verified=0;
 for(let i=0;i<recipients.length;i+=100){const chunk=recipients.slice(i,i+100);const receipts=await db.getAll(...chunk.map(u=>db.collection('users').doc(u.uid).collection('compensationGrants').doc(CAMPAIGN)));for(let j=0;j<receipts.length;j++){const r=receipts[j];if(r.exists&&r.data().amount===1)verified++;else if(!(await db.collection('deletedAccounts').doc(chunk[j].uid).get()).exists)throw Error('Missing compensation receipt')}}
 const result={campaign:CAMPAIGN,cutoff,recipients:recipients.length,...counts,verified,completedAt:Date.now()};
 await campaign.set({...result,status:'complete'},{merge:true});
 fs.writeFileSync(path.join(__dirname,'../docs/compensation446-result.json'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify(result));
}
module.exports={nextSlots,grant};
if(require.main===module)main().catch(e=>{console.error(e.code||'ERROR',e.message);process.exitCode=1});

