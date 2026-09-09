'use strict';
// Operator-only utility. Dry run by default; --send delivers the reviewed copy.
// Credentials stay in the existing Firebase CLI login and are never printed.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto');
const backendRequire=require('node:module').createRequire(path.join(__dirname,'../functions/package.json'));
const {initializeApp}=backendRequire('firebase-admin/app');
const {Firestore}=backendRequire('@google-cloud/firestore');
const {getAuth}=backendRequire('firebase-admin/auth');
const PROJECT='lifelog-98fff',DISPATCH='slot-price-20260914-v1',GROUP='_drawer_village_announcements',SENDER='_drawer_village_operator';
async function main(){
 if(process.argv.includes('--send')){const draft=JSON.parse(fs.readFileSync(path.join(__dirname,'../docs/slot-price-mail-20260910.json'),'utf8'));if(draft._delivery?.status!=='approved')throw Error('Mail is on hold: pricing is being reconsidered. No mail or push was sent.')}

 const authModule=process.env.DRAWER_FIREBASE_AUTH_MODULE;
 if(!authModule)throw Error('Set DRAWER_FIREBASE_AUTH_MODULE to the installed Firebase CLI lib/auth.js');
 const cli=require(authModule),login=JSON.parse(fs.readFileSync(path.join(os.homedir(),'.config/configstore/firebase-tools.json'),'utf8'));
 const app=initializeApp({projectId:PROJECT,credential:{getAccessToken:async()=>{const token=await cli.getAccessToken(login.tokens.refresh_token,login.tokens.scopes);return {access_token:token.access_token,expires_in:token.expires_in||3600}}}});
 const api=require(path.join(path.dirname(authModule),'api.js'));
 const db=new Firestore({projectId:PROJECT,credentials:{type:'authorized_user',client_id:api.clientId(),client_secret:api.clientSecret(),refresh_token:login.tokens.refresh_token}}),auth=getAuth(app),users=[];let pageToken;
 do{const page=await auth.listUsers(1000,pageToken);users.push(...page.users);pageToken=page.pageToken}while(pageToken);
 const deleted=new Set((await db.collection('deletedAccounts').select().get()).docs.map(d=>d.id));
 const recipients=users.filter(u=>!deleted.has(u.uid));
 console.log(JSON.stringify({project:PROJECT,dispatch:DISPATCH,registeredAccounts:users.length,deletedExcluded:users.length-recipients.length,recipients:recipients.length,mode:process.argv.includes('--send')?'send':'dry-run'}));
 const {google}=backendRequire('googleapis');
 const oauth=new google.auth.OAuth2(api.clientId(),api.clientSecret());oauth.setCredentials({refresh_token:login.tokens.refresh_token});
 const listed=await google.cloudfunctions({version:'v2',auth:oauth}).projects.locations.functions.list({parent:'projects/'+PROJECT+'/locations/-',pageSize:1000});
 if(listed.data.nextPageToken||listed.data.unreachable?.length)throw Error('Cannot fully inspect deployed notification triggers');
 const triggers=(listed.data.functions||[]).filter(f=>f.eventTrigger).map(f=>({name:f.name.split('/').at(-1),type:f.eventTrigger.eventType,filters:f.eventTrigger.eventFilters}));
 console.log(JSON.stringify({deployedTriggers:triggers}));
 for(const trigger of triggers){const document=trigger.filters?.find(f=>f.attribute==='document')?.value;if(trigger.type?.includes('firestore')&&document!=='notificationOutbox/{eventId}'&&document!=='moderationReports/{reportId}')throw Error('Unreviewed Firestore trigger: '+trigger.name)}
 if(!process.argv.includes('--send'))return;
 const copy=JSON.parse(fs.readFileSync(path.join(__dirname,'../docs/slot-price-mail-20260910.json'),'utf8'));
 const contentHash=crypto.createHash('sha256').update(JSON.stringify(copy)).digest('hex');
 const root=db.collection('groups').doc(GROUP),dispatch=root.collection('mailDispatches').doc(DISPATCH);
 await db.runTransaction(async tx=>{
  const prior=await tx.get(dispatch);
  if(prior.exists&&prior.data().contentHash!==contentHash)throw Error('Dispatch content differs from stored mail; stop to avoid inconsistent announcements');
  if(!prior.exists){tx.set(root,{name:'서랍마을 운영 공지',ownerUid:SENDER,systemAnnouncements:true,createdAt:Date.now()});tx.set(root.collection('members').doc(SENDER),{displayName:'서랍마을 운영팀',role:'owner'});tx.create(dispatch,{contentHash,createdAt:Date.now(),recipientCount:recipients.length,effectiveDate:'2026-09-14',status:'sending',pushNotification:false})}
 });
 let created=0,existing=0,skipped=0;const languages={ko:0,en:0,ja:0};
 for(let i=0;i<recipients.length;i+=100){
  const chunk=recipients.slice(i,i+100);
  const profiles=await db.getAll(...chunk.map(u=>db.collection('users').doc(u.uid).collection('sync').doc('core')),{fieldMask:['state.uiLanguage']});
  for(let j=0;j<chunk.length;j++){
   const u=chunk[j],language=profiles[j].data()?.state?.uiLanguage,lang=copy[language]?language:'ko',text=copy[lang];
   const mail=root.collection('mail').doc(DISPATCH+'-'+crypto.createHash('sha256').update(u.uid).digest('hex'));
   const result=await db.runTransaction(async tx=>{
    const [prior,tombstone]=await Promise.all([tx.get(mail),tx.get(db.collection('deletedAccounts').doc(u.uid))]);
    if(tombstone.exists)return 'skipped';if(prior.exists)return 'existing';
    tx.create(mail,{senderUid:SENDER,recipientUid:u.uid,sourceName:text.sender,targetName:text.recipient,subject:text.subject,body:text.body,announcement:true,dispatchId:DISPATCH,recipientCount:recipients.length,createdAt:Date.now(),language:lang,contentHash,pushNotification:false});return 'created';
   });
   if(result==='created')created++;else if(result==='existing')existing++;else skipped++;languages[lang]++;
  }
 }
 const all=await root.collection('mail').where('dispatchId','==',DISPATCH).get();
 const delivered=new Map(all.docs.map(d=>[d.data().recipientUid,d.data()]));
 for(const u of recipients){const item=delivered.get(u.uid);if(!item&&!((await db.collection('deletedAccounts').doc(u.uid).get()).exists))throw Error('Recipient missing after dispatch');if(item&&item.contentHash!==contentHash)throw Error('Stored content mismatch')}
 const sample=recipients.find(u=>delivered.has(u.uid));
 if(sample){const mailbox=await require('../functions/account-mailbox')({db})(sample.uid);if(!mailbox.incomingMail.some(m=>m.dispatchId===DISPATCH))throw Error('Mailbox readback failed')}
 const outbox=await db.collection('notificationOutbox').where('groupId','==',GROUP).limit(1).get();
 if(!outbox.empty)throw Error('Unexpected push outbox entry; review before marking complete');
 const result={pushNotificationsQueued:0,created,existing,skipped,stored:all.size,languages,verified:true,completedAt:Date.now()};
 await dispatch.set({...result,status:'complete'},{merge:true});console.log(JSON.stringify(result));
}
main().catch(e=>{console.error(e.code||'ERROR',e.message);process.exitCode=1});
