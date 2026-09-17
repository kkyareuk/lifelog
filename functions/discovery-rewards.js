'use strict';
const {randomUUID}=require('node:crypto');
const units={android:'ca-app-pub-2970618408876751/2312250750',ios:'ca-app-pub-2970618408876751/6097609211'};
const fail=message=>{throw Object.assign(Error(message),{status:400})};
const valid=value=>typeof value==='string'&&/^[a-zA-Z0-9_-]{1,150}$/.test(value);
function createDiscoveryRewards({db,clock=Date.now,random=randomUUID}){
 const root=uid=>db.collection('users').doc(uid),access=uid=>root(uid).collection('activityLimits').doc('discovery');
 async function prepareAd(uid,{platform}={}){
  if(!units[platform])fail('ads-invalid-platform');
  return db.runTransaction(async tx=>{
   const target=access(uid),[snapshot,deleted]=await Promise.all([tx.get(target),tx.get(db.collection('deletedAccounts').doc(uid))]);
   if(deleted.exists)fail('account-deleted');const old=snapshot.data()||{},now=clock();
   if(old.rewardCredits>0)fail('ads-credit-ready');
   if(old.adPreparedAt>now-60000)fail('ads-wait');
   const ticketId=random(),adUnit=units[platform];
   tx.set(target,{...old,adPreparedAt:now});
   tx.create(root(uid).collection('discoveryAdTickets').doc(ticketId),{adUnit,createdAt:now,expiresAt:now+3600000,used:false});
   return {ticketId,adUnit};
  });
 }
 // Only the signed Google callback can add credit. A native client event cannot.
 async function rewardAd(data){
  if(!valid(data.user_id)||!valid(data.custom_data)||!valid(data.transaction_id))fail('ads-invalid-reward');
  const uid=data.user_id,target=access(uid),ticket=root(uid).collection('discoveryAdTickets').doc(data.custom_data);
  const receipt=root(uid).collection('discoveryAdReceipts').doc(data.transaction_id);
  return db.runTransaction(async tx=>{
   const [t,r,a,deleted]=await Promise.all([tx.get(ticket),tx.get(receipt),tx.get(target),tx.get(db.collection('deletedAccounts').doc(uid))]);
   if(deleted.exists)fail('account-deleted');
   if(r.exists){if(r.data().ticketId!==data.custom_data)fail('ads-replay');return {alreadyApplied:true}}
   const v=t.data(),stamp=Number(data.timestamp);
   if(!v||v.used||v.expiresAt<clock()||!Number.isSafeInteger(stamp)||stamp<v.createdAt-60000||stamp>v.expiresAt||![v.adUnit,v.adUnit.split('/').at(-1)].includes(data.ad_unit)||Number(data.reward_amount)!==1)fail('ads-invalid-reward');
   tx.set(target,{...(a.data()||{}),rewardCredits:1});
   tx.update(ticket,{used:true,transactionId:data.transaction_id});
   tx.create(receipt,{ticketId:data.custom_data,createdAt:clock()});return {granted:1};
  });
 }
 return {prepareAd,rewardAd};
}
module.exports={createDiscoveryRewards};
