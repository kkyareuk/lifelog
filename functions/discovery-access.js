'use strict';
const INTERVAL=600000;
function createDiscoveryAccess({db,clock=Date.now}){
 const ref=uid=>db.collection('users').doc(uid).collection('activityLimits').doc('discovery');
 const view=value=>({lastAt:Number(value?.lastAt)||0,serverNow:clock(),interval:INTERVAL});
 async function read(uid){return view((await ref(uid).get()).data())}
 async function use(uid,{requestId}={}){
  if(typeof requestId!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(requestId))throw Object.assign(Error('discovery-invalid-request'),{status:400});
  return db.runTransaction(async tx=>{
   const target=ref(uid),[doc,deleted]=await Promise.all([tx.get(target),tx.get(db.collection('deletedAccounts').doc(uid))]);
   if(deleted.exists)throw Object.assign(Error('account-deleted'),{status:403});
   const old=doc.data()||{},now=clock();
   if(old.requestId===requestId)return {...view(old),granted:true};
   if(Number(old.lastAt)>now-INTERVAL)return {...view(old),granted:false};
   const next={lastAt:now,requestId};tx.set(target,next);return {...view(next),granted:true};
  });
 }
 return {read,use};
}
module.exports={createDiscoveryAccess,INTERVAL};
