const fail=(code,status=400)=>{throw Object.assign(Error(code),{code,status})};
module.exports=({db,clock=Date.now})=>async(uid,input)=>db.runTransaction(async tx=>{
 const code=String(input.inviteCode||'').replace(/[^A-Za-z0-9]/g,'').toUpperCase();if(code.length<6||code.length>32)fail('groups/code-invalid');
 const invite=await tx.get(db.collection('groupInvites').doc(code));if(!invite.exists||invite.data().active!==true)fail('groups/code-not-found',404);
 const groupId=invite.data().groupId;if(typeof groupId!=='string'||groupId.includes('/'))fail('groups/code-invalid');
 const root=db.collection('groups').doc(groupId),member=root.collection('members').doc(uid),index=db.collection('users').doc(uid).collection('groupMemberships').doc(groupId);
 const [group,existing]=await Promise.all([tx.get(root),tx.get(member)]);if(!group.exists)fail('groups/code-not-found',404);
 if(existing.exists){tx.set(index,{groupId,role:existing.data().role||'member',joinedAt:existing.data().joinedAt||clock()});return {groupId,alreadyJoined:true};}
 const slots=await require('./account-slots').usage(db,tx,uid);require('./account-slots').check(slots,'towns');
 const value={uid,displayName:String(input.displayName||'').trim().slice(0,60),role:'member',inviteCode:code,joinedAt:clock()};
 tx.create(member,value);tx.set(index,{groupId,role:'member',joinedAt:value.joinedAt});slots.reserve();return {groupId,joined:true};
});
