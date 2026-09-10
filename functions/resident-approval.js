const manager=(m,g,uid)=>g.ownerUid===uid||['owner','manager','operator'].includes(m.role);
const fail=message=>{throw Object.assign(Error(message),{status:409})};
const signal=(db,tx,uid,key,clock)=>tx.set(db.collection('users').doc(uid).collection('sync').doc('mailbox-signal'),{eventId:key,updatedAt:clock()});
exports.request=async({db,clock},tx,root,uid,input,member)=>{
 const key='create-'+uid+'_'+input.id,ref=root.collection('proposals').doc(key),old=await tx.get(ref);
 if(old.exists)return {id:uid+'_'+input.id,status:old.data().status,proposalId:key};
 const [members,g,recent]=await Promise.all([tx.get(root.collection('members')),tx.get(root),tx.get(root.collection('proposals').where('senderUid','==',uid))]);
 if(recent.docs.filter(d=>d.data().kind==='create-resident'&&d.data().creationRoot===d.id&&d.data().status==='pending').length>=5)fail('proposal-rate-limit');
 const managers=members.docs.filter(d=>manager(d.data(),g.data(),d.id));if(!managers.length)fail('manager-required');
 const ids=managers.map((m,i)=>i?key+'-'+i:key);
 for(let i=0;i<managers.length;i++){const p={kind:'create-resident',type:'캐릭터 생성 신청',senderUid:uid,recipientUid:managers[i].id,sourceId:uid+'_'+input.id,sourceName:input.profile.name,targetName:g.data().name||'',status:'pending',createdAt:clock(),creationRoot:key,creationCopies:ids,creationInput:input};tx.create(root.collection('proposals').doc(ids[i]),p);signal(db,tx,managers[i].id,ids[i],clock)}
 return {id:uid+'_'+input.id,status:'pending',proposalId:key};
};
exports.respond=async({db,clock},tx,root,uid,input,p)=>{
 const [member,g,canonical]=await Promise.all([tx.get(root.collection('members').doc(uid)),tx.get(root),tx.get(root.collection('proposals').doc(p.creationRoot))]);
 if(!member.exists||!g.exists||!manager(member.data(),g.data(),uid))fail('manager-required');
 const current=canonical.data();if(!current)fail('proposal-missing');if(current.status!=='pending')return {id:input.proposalId,status:current.status};
 const copies=await Promise.all(current.creationCopies.map(id=>tx.get(root.collection('proposals').doc(id))));
 if(input.accept)await require('./create-resident').inTransaction({db,clock},tx,current.senderUid,current.creationInput,true);
 const status=input.accept?'accepted':'declined',patch={status,respondedAt:clock(),responderUid:uid,responderDisplayName:member.data().displayName||'',reason:input.accept?'':String(input.reason||'').slice(0,500)};
 for(const c of copies){if(c.exists){tx.update(root.collection('proposals').doc(c.id),patch);signal(db,tx,c.data().recipientUid,c.id,clock)}}signal(db,tx,current.senderUid,p.creationRoot,clock);
 return {id:input.proposalId,status};
};
