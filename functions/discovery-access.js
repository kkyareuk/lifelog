'use strict';
const INTERVAL=600000;
function createDiscoveryAccess({db,clock=Date.now}){
 const ref=uid=>db.collection('users').doc(uid).collection('activityLimits').doc('discovery');
 const view=(value,adFree=false)=>({lastAt:Number(value?.lastAt)||0,rewardCredits:Number(value?.rewardCredits)>0?1:0,serverNow:clock(),interval:adFree?60000:INTERVAL,adFree});
 async function read(uid){const [a,u]=await Promise.all([ref(uid).get(),db.collection('users').doc(uid).get()]);return view(a.data(),u.data()?.entitlements?.adFree===true)}
 async function use(uid,{requestId}={}){
  if(typeof requestId!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(requestId))throw Object.assign(Error('discovery-invalid-request'),{status:400});
  return db.runTransaction(async tx=>{
   const target=ref(uid),[doc,deleted,user]=await Promise.all([tx.get(target),tx.get(db.collection('deletedAccounts').doc(uid)),tx.get(db.collection('users').doc(uid))]);
   if(deleted.exists)throw Object.assign(Error('account-deleted'),{status:403});
   const old=doc.data()||{},now=clock(),adFree=user.data()?.entitlements?.adFree===true;
   if(old.requestId===requestId)return {...view(old,adFree),granted:true};
   const waiting=Number(old.lastAt)>now-(adFree?60000:INTERVAL);
   if(waiting&&!old.rewardCredits)return {...view(old,adFree),granted:false};
   const next={...old,lastAt:now,requestId,rewardCredits:waiting?0:(old.rewardCredits||0)};tx.set(target,next);return {...view(next,adFree),granted:true};
  });
 }
 return {read,use};
}
module.exports={createDiscoveryAccess,INTERVAL};
