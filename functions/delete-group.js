'use strict';
// Detach the root atomically so concurrent edits fail their membership check.
// A private tombstone lets the owner safely retry an interrupted cleanup.
module.exports=({db,clock=Date.now})=>async(uid,input)=>{
 const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status})};
 const gid=input.groupId;if(typeof gid!=='string'||!gid||gid.length>180||/[\/\x00-\x1f]/.test(gid))fail('invalid-id');
 if(input.confirm!==true)fail('confirmation-required');
 const root=db.collection('groups').doc(gid),record=db.collection('deletedGroups').doc(gid);
 const deletion=await db.runTransaction(async tx=>{
  const [group,old]=await Promise.all([tx.get(root),tx.get(record)]);
  if(old.exists){if(old.data().ownerUid!==uid)fail('owner-required',403);return old.data()}
  if(!group.exists||group.data().ownerUid!==uid)fail('owner-required',403);
  const [members,residents,homes]=await Promise.all([tx.get(root.collection('members')),tx.get(root.collection('residents')),tx.get(root.collection('homes'))]);
  const restore=await require('./character-transfer').prepareReturn(db,tx,gid,residents.docs.map(d=>({id:d.id,...d.data()})),homes.docs.map(d=>({id:d.id,...d.data()})),clock());
  restore();
  const value={ownerUid:uid,memberIds:[...new Set([uid,...members.docs.map(d=>d.id)])],completedAt:0,requestedAt:clock()};
  tx.set(record,value);tx.delete(root);return value;
 });
 if(!deletion.completedAt){
  await db.recursiveDelete(root);
  for(const memberId of deletion.memberIds)await db.collection('users').doc(memberId).collection('groupMemberships').doc(gid).delete();
  for(;;){const page=await db.collection('groupInvites').where('groupId','==',gid).limit(100).get();if(page.empty)break;await Promise.all(page.docs.map(d=>d.ref.delete()))}
  await record.set({completedAt:clock(),memberIds:[]},{merge:true});
 }
 return {deleted:true};
};
