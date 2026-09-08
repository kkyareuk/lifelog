const fail=(message,status=403)=>{throw Object.assign(Error(message),{status})};
module.exports=({db,clock=Date.now})=>async(uid,input)=>db.runTransaction(async tx=>{
 const gid=input.groupId,target=input.uid||uid;if(!gid||/[\/]/.test(gid)||!target||/[\/]/.test(target))fail('invalid-id',400);
 const root=db.collection('groups').doc(gid),[g,m,targetDoc,residents,homes]=await Promise.all([tx.get(root),tx.get(root.collection('members').doc(uid)),tx.get(root.collection('members').doc(target)),tx.get(root.collection('residents')),tx.get(root.collection('homes'))]);
 if(!g.exists||!m.exists)fail('group-membership-required');
 if(!input.residentId&&!targetDoc.exists)return {returned:0};
 const manager=g.data().ownerUid===uid||['owner','manager','operator'].includes(m.data().role);
 if(target!==uid&&!manager)fail('manager-required');
 if(!input.residentId&&g.data().ownerUid===target)fail('owner-cannot-leave');
 const selected=residents.docs.map(d=>({id:d.id,...d.data()})).filter(r=>input.residentId?r.id===input.residentId:r.ownerUid===target);
 if(selected.some(r=>r.ownerUid!==uid&&!manager))fail('manager-required');
 if(input.deletePermanently){if(input.confirm!==true||!input.residentId||selected.some(r=>r.ownerUid!==uid))fail('character-owner-required');for(const r of selected){tx.set(db.collection('users').doc(uid).collection('characterTransfers').doc(r.sourceCharacterId||r.id),{personalId:r.sourceCharacterId||r.id,location:'deleted',updatedAt:clock()});tx.delete(root.collection('residents').doc(r.id))}tx.update(root,{lifeUpdatedAt:0});return {deleted:true};}
 const now=clock(),restore=await require('./character-transfer').prepareReturn(db,tx,gid,selected,homes.docs.map(d=>({id:d.id,...d.data()})),now);
 restore();selected.forEach(r=>tx.delete(root.collection('residents').doc(r.id)));
 const owners=new Set(selected.map(r=>r.ownerUid));if(!input.residentId)owners.add(target);
 for(const owner of owners){const key='return-'+now+'-'+owner;tx.set(root.collection('mail').doc(key),{senderUid:uid,recipientUid:owner,senderPhoto:m.data()?.photoURL||'',senderKind:'user',subject:owner===uid?'캐릭터가 내 마을로 돌아왔습니다.':'멀티 마을에서 퇴거되었습니다.',body:(g.data().name||'멀티 마을')+'에서 떠나 내 마을로 돌아왔습니다. 캐릭터 탭에서 확인해 주세요.',createdAt:now,expiresAt:now+30*86400000,kind:'return',groupName:g.data().name||''});tx.set(db.collection('notificationOutbox').doc(gid+'-'+key),{uid:owner,groupId:gid,proposalId:key,kind:'member-returned',createdAt:now})}
 if(!input.residentId){tx.delete(root.collection('members').doc(target));tx.delete(db.collection('users').doc(target).collection('groupMemberships').doc(gid))}
 tx.update(root,{lifeUpdatedAt:0});return {returned:selected.length};
});
