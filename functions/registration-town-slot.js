'use strict';
// One server-owned grant shared by the existing-account apology and new registrations.
const CAMPAIGN='apology-town-slot-20260917-v1';
function nextSlots(ent={}){
 const legacy=(Array.isArray(ent.purchases)?ent.purchases:[]).filter(x=>x==='town_slot_1').length;
 const before=Math.max(0,Number(ent.townSlotPacks)||legacy);
 if(!Number.isSafeInteger(before))throw Error('Invalid slot entitlement');
 return {before,after:before+1};
}
async function grant(db,uid){
 const account=db.collection('users').doc(uid),receipt=account.collection('compensationGrants').doc(CAMPAIGN),deleted=db.collection('deletedAccounts').doc(uid);
 return db.runTransaction(async tx=>{
  const [user,prior,tombstone]=await Promise.all([tx.get(account),tx.get(receipt),tx.get(deleted)]);
  if(tombstone.exists)return 'deleted';
  if(prior.exists)return 'existing';
  const values=nextSlots(user.data()?.entitlements);
  tx.set(account,{entitlements:{townSlotPacks:values.after}},{merge:true});
  tx.create(receipt,{campaign:CAMPAIGN,kind:'town_slot_1',amount:1,...values,grantedAt:Date.now()});
  return 'granted';
 });
}
module.exports={CAMPAIGN,nextSlots,grant};
