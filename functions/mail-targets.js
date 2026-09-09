const fail=(message,status=400)=>{throw Object.assign(Error(message),{status})};
module.exports=({db})=>({
 readMailTargets:async(uid,{groupId})=>{
  if(typeof groupId!=='string'||!groupId||/[\/]/.test(groupId))fail('invalid-id');
  const root=db.collection('groups').doc(groupId),member=await root.collection('members').doc(uid).get();if(!member.exists)fail('group-membership-required',403);
  const [group,members]=await Promise.all([root.get(),root.collection('members').get()]);
  return {groupId,memberGroups:group.data().memberGroups||[],members:members.docs.map(d=>({uid:d.id,displayName:d.data().displayName||'',role:d.data().role}))};
 },
 saveMemberGroups:async(uid,{groupId,memberGroups})=>db.runTransaction(async tx=>{
  if(typeof groupId!=='string'||!groupId||/[\/]/.test(groupId))fail('invalid-id');
  const root=db.collection('groups').doc(groupId),[group,member,members]=await Promise.all([tx.get(root),tx.get(root.collection('members').doc(uid)),tx.get(root.collection('members'))]);
  if(!member.exists||!['owner','manager','operator'].includes(member.data().role))fail('manager-required',403);
  if(!Array.isArray(memberGroups)||memberGroups.length>20)fail('member-group-limit');
  const ids=new Set(members.docs.map(d=>d.id)),seen=new Set();
  const clean=memberGroups.map(g=>{if(typeof g.id!=='string'||!g.id||g.id.length>80||seen.has(g.id)||typeof g.name!=='string'||!g.name.trim()||g.name.length>40||!Array.isArray(g.memberIds)||g.memberIds.some(id=>!ids.has(id)))fail('invalid-member-group');seen.add(g.id);return {id:g.id,name:g.name.trim(),memberIds:[...new Set(g.memberIds)]}});
  tx.update(root,{memberGroups:clean});return {saved:true,memberGroups:clean};
 })
});
