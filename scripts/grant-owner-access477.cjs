'use strict';
// Explicit operator grant. No client-side email exceptions; dry-run by default.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
function targetEntitlements(current={}){
 const count=value=>{const n=Number(value)||0;if(!Number.isSafeInteger(n)||n<0)throw Error('Invalid slot entitlement');return n};
 const packs=count(current.characterSlotPacks),single=count(current.characterSingleSlots);
 const towns=count(current.townSlotPacks||(current.purchases||[]).filter(x=>x==='town_slot_1').length);
 return {dlcPacks:[...new Set([...(current.dlcPacks||[]),'medieval'])],characterSingleSlots:Math.max(single,95-packs*5),townSlotPacks:Math.max(towns,48)};
}
async function main(){
 const email=process.env.DRAWER_GRANT_EMAIL;if(!email)throw Error('DRAWER_GRANT_EMAIL required');
 const req=require('node:module').createRequire(path.resolve(process.env.DRAWER_ADMIN_PACKAGE||'functions/package.json'));
 const {initializeApp}=req('firebase-admin/app'),{getAuth}=req('firebase-admin/auth'),{Firestore}=req('@google-cloud/firestore');
 const authModule=process.env.DRAWER_FIREBASE_AUTH_MODULE;if(!authModule)throw Error('Firebase CLI authentication module required');
 const cli=require(authModule),api=require(path.join(path.dirname(authModule),'api.js'));
 const login=JSON.parse(fs.readFileSync(path.join(os.homedir(),'.config/configstore/firebase-tools.json'),'utf8'));
 const app=initializeApp({projectId:'lifelog-98fff',credential:{getAccessToken:async()=>{const t=await cli.getAccessToken(login.tokens.refresh_token,login.tokens.scopes);return {access_token:t.access_token,expires_in:t.expires_in||3600}}}});
 const user=await getAuth(app).getUserByEmail(email);if(user.disabled||user.email.toLowerCase()!==email.toLowerCase())throw Error('Account unavailable');
 const db=new Firestore({projectId:'lifelog-98fff',credentials:{type:'authorized_user',client_id:api.clientId(),client_secret:api.clientSecret(),refresh_token:login.tokens.refresh_token}});
 try{
  const account=db.collection('users').doc(user.uid),receipt=account.collection('operatorGrants').doc('owner-access-20260923-v1');
  const result=await db.runTransaction(async tx=>{
   const [snap,prior,deleted]=await Promise.all([tx.get(account),tx.get(receipt),tx.get(db.collection('deletedAccounts').doc(user.uid))]);
   if(!snap.exists||deleted.exists)throw Error('Active account record required');
   const before=snap.data().entitlements||{},next=targetEntitlements(before);
   const summary={matchedAccount:true,dlcPacks:next.dlcPacks,characters:5+(Number(before.characterSlotPacks)||0)*5+next.characterSingleSlots,towns:2+next.townSlotPacks};
   if(process.argv.includes('--grant')){tx.set(account,{entitlements:next},{merge:true});if(!prior.exists)tx.create(receipt,{kind:'owner-access',before:{dlcPacks:before.dlcPacks||[],characterSingleSlots:before.characterSingleSlots||0,townSlotPacks:before.townSlotPacks||0},after:next,grantedAt:Date.now()});}
   return {...summary,mode:process.argv.includes('--grant')?'granted':'dry-run'};
  });
  if(process.argv.includes('--grant')){const saved=(await account.get()).data().entitlements;const expected=targetEntitlements(saved);for(const key of ['townSlotPacks','characterSingleSlots'])if(saved[key]!==expected[key])throw Error('Grant verification failed');if(!saved.dlcPacks.includes('medieval'))throw Error('DLC verification failed');result.verified=true;}
  console.log(JSON.stringify(result));
 }finally{await db.terminate()}
}
module.exports={targetEntitlements};
if(require.main===module)main().catch(e=>{console.error(e.code||'ERROR',e.message);process.exitCode=1});
