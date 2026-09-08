'use strict';
// Only invoked after a recent provider reauthentication and explicit confirmation.
function createAccountDeletion({db,auth,bucket,clock=Date.now}){
 const fail=(code,status=400)=>{throw Object.assign(new Error(code),{status})};
 async function eraseQuery(query){while(true){const page=await query.limit(100).get();if(page.empty)return;for(const doc of page.docs)await db.recursiveDelete(doc.ref)}}
 async function preview(uid){const owned=await db.collection('groups').where('ownerUid','==',uid).get();return {ownedGroups:owned.docs.map(d=>({id:d.id,name:String(d.data().name||'')}))}}
 async function remove(identity,input){
  const uid=identity.uid;if(!uid||/[\/]/.test(uid))fail('invalid-user',401);
  if(!Number.isFinite(identity.auth_time)||clock()/1000-identity.auth_time>300)fail('recent-login-required',401);
  if(input.confirm!==true||input.deleteOwnedGroups!==true)fail('confirmation-required');
  // A server-only tombstone prevents other signed-in devices recreating the
  // data while cleanup runs. Repeated requests safely resume partial cleanup.
  await db.collection('deletedAccounts').doc(uid).set({requestedAt:clock()},{merge:true});
  const owned=await db.collection('groups').where('ownerUid','==',uid).get();
  for(const group of owned.docs){
   const members=await group.ref.collection('members').get();
   for(const member of members.docs)await db.collection('users').doc(member.id).collection('groupMemberships').doc(group.id).delete();
   await eraseQuery(db.collection('groupInvites').where('groupId','==',group.id));
   await db.recursiveDelete(group.ref);
  }
  const memberships=await db.collection('users').doc(uid).collection('groupMemberships').get();
  for(const membership of memberships.docs){
   const root=db.collection('groups').doc(membership.id);
   for(const kind of ['residents','homes','mail','proposals','relationshipRequests','mailDispatches','devices']){
    for(const field of ['ownerUid','senderUid','recipientUid','uid'])await eraseQuery(root.collection(kind).where(field,'==',uid));
   }
   await root.collection('members').doc(uid).delete();
  }
  for(const [kind,field] of [['characterCodes','ownerUid'],['feedback','uid'],['notificationOutbox','uid'],['groupInvites','ownerUid']])await eraseQuery(db.collection(kind).where(field,'==',uid));
  await bucket.deleteFiles({prefix:'users/'+uid+'/',force:true});
  await db.recursiveDelete(db.collection('appleSandboxAccounts').doc(uid));
  await db.recursiveDelete(db.collection('users').doc(uid));
  // Purchase ledgers remain server-only for refunds, tax and replay protection.
  try{await auth.revokeRefreshTokens(uid);await auth.deleteUser(uid)}catch(e){if(e.code!=='auth/user-not-found')throw e}
  return {deleted:true};
 }
 return {preview,remove};
}
module.exports={createAccountDeletion};
