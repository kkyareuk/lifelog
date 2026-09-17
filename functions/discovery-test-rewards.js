'use strict';
// Sample ads do not send signed SSV callbacks. Only a server-authorized QA
// account may redeem its one-use test ticket; normal users still require SSV.
exports.createDiscoveryTestRewards=({db,clock=Date.now})=>({
 async grant(identity,{ticketId}={}){
  const user=db.collection('users').doc(identity.uid);
  if(typeof ticketId!=='string'||!/^[a-zA-Z0-9_-]{1,150}$/.test(ticketId))throw Object.assign(Error('ads-invalid-reward'),{status:400});
  return db.runTransaction(async tx=>{
   const target=user.collection('activityLimits').doc('discovery'),ticket=user.collection('discoveryAdTickets').doc(ticketId);
   const [u,t,a,deleted]=await Promise.all([tx.get(user),tx.get(ticket),tx.get(target),tx.get(db.collection('deletedAccounts').doc(identity.uid))]);
   const owner=identity.email_verified===true&&identity.email==='kkyaareuk@gmail.com';
   if(deleted.exists||(!owner&&u.data()?.entitlements?.adTestAccess!==true))throw Object.assign(Error('ads-test-account-required'),{status:403});
   const v=t.data();if(!v||v.used||v.expiresAt<clock())throw Object.assign(Error('ads-invalid-reward'),{status:400});
   tx.update(ticket,{used:true,test:true,redeemedAt:clock()});tx.set(target,{...(a.data()||{}),rewardCredits:1,lastTestRewardAt:clock()});
   return {granted:1,test:true};
  });
 }
});
