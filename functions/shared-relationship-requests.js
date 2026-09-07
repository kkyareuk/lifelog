const crypto=require('node:crypto');
const fail=(code,status=400)=>{throw Object.assign(new Error(code),{code,status})};
const clean=value=>Array.isArray(value)?value.map(clean):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().filter(k=>!['__proto__','constructor','prototype'].includes(k)).map(k=>[k,clean(value[k])])):value;
const hash=value=>crypto.createHash('sha256').update(JSON.stringify(clean(value||null))).digest('hex');
const fields=new Set('a b sourceRole targetRole name tags type temporalStatus stage faultParty faultReason legalStatus legalRegistration marriageRegistration socialAcceptance interactions interactionsAll cohabit stayTogether intimacy conflict updatedAt displayOrder animationPlacement directional groupId groupMembers parentId childId parentRole kinship kinshipByPair siblingOrder siblingKinshipByPair memberIds'.split(' '));
module.exports=({db,membership,notify,clock,id})=>{
 const collection=kind=>kind==='characterGroup'?'characterGroups':'relationships';
 const members=(patch,kind)=>[...new Set((kind==='characterGroup'?patch.memberIds:patch.groupMembers?.length?patch.groupMembers:[patch.a,patch.b])||[])];
 function apply(tx,root,request,key){
  tx.set(root.collection(collection(request.kind)).doc(request.targetId),{...request.patch,updatedAt:clock(),proposalId:key});
  tx.update(root,{lifeUpdatedAt:0});
  if(request.kind!=='characterGroup')tx.set(root.collection('declarations').doc(key),{participantIds:request.participantIds,sourceName:request.sourceName,targetName:request.targetName,type:request.patch.type,at:clock(),until:clock()+120000});
 }
 return {
  propose:async(uid,input)=>db.runTransaction(async tx=>{
   const gid=id(input.groupId),key=id(input.requestId),kind=input.kind==='characterGroup'?'characterGroup':'relationship';
   if(!input.patch||typeof input.patch!=='object'||Array.isArray(input.patch)||JSON.stringify(input.patch).length>50000)fail('invalid-relationship');
   const patch=clean(Object.fromEntries(Object.entries(input.patch).filter(([k])=>fields.has(k))));
   for(const key of ['memberIds','groupMembers','tags','interactions'])if(key in patch&&(!Array.isArray(patch[key])||patch[key].length>200||patch[key].some(v=>typeof v!=='string'||v.length>500)))fail('invalid-relationship');
   for(const key of ['a','b','type','name','sourceRole','targetRole','parentRole','temporalStatus','stage','faultReason'])if(key in patch&&(typeof patch[key]!=='string'||patch[key].length>2000))fail('invalid-relationship');
   for(const key of ['cohabit','stayTogether','interactionsAll','directional'])if(key in patch&&typeof patch[key]!=='boolean')fail('invalid-relationship');
   const ids=members(patch,kind);if(ids.length<(kind==='characterGroup'?1:2)||ids.length>200||ids.some(x=>typeof x!=='string'))fail('invalid-participants');ids.forEach(id);
   if(kind==='relationship'&&(!patch.type||!ids.includes(patch.a)||!ids.includes(patch.b)||patch.a===patch.b))fail('invalid-relationship');
   if(kind==='characterGroup'&&(!patch.name||String(patch.name).length>40))fail('name-required');
   const {root}=await membership(tx,gid,uid),requestRef=root.collection('relationshipRequests').doc(key),targetId=input.targetId?id(input.targetId):'accepted-'+key;
   const [existing,old,recent]=await Promise.all([tx.get(requestRef),tx.get(root.collection(collection(kind)).doc(targetId)),tx.get(root.collection('relationshipRequests').where('senderUid','==',uid))]);
   if(existing.exists){const r=existing.data();if(r.senderUid!==uid||hash(r.patch)!==hash(patch)||r.targetId!==targetId)fail('request-id-conflict',409);return {id:key,status:r.status}}
   if(input.targetId&&!old.exists)fail('relationship-missing',404);
   if(recent.docs.filter(d=>d.data().createdAt>clock()-3600000).length>=20)fail('proposal-rate-limit',429);
   const oldIds=old.exists?members(old.data(),kind):[],all=[...new Set([...ids,...oldIds])];
   const residents=await Promise.all(all.map(cid=>tx.get(root.collection('residents').doc(cid))));if(residents.some(r=>!r.exists))fail('resident-missing',404);
   const owners=Object.fromEntries(residents.map(r=>[r.id,r.data().ownerUid]));
   if(!(old.exists?oldIds:ids).some(cid=>owners[cid]===uid))fail('character-owner-required',403);
   const recipients=[...new Set(Object.values(owners))].filter(owner=>owner!==uid);
   const accounts=await Promise.all(recipients.map(owner=>tx.get(root.collection('members').doc(owner))));if(accounts.some(m=>!m.exists))fail('recipient-left-group',409);
   const sourceName=residents.filter(r=>r.data().ownerUid===uid).map(r=>r.data().name).join(' · '),targetName=residents.filter(r=>r.data().ownerUid!==uid).map(r=>r.data().name).join(' · ');
   const request={kind,targetId,patch,baseHash:hash(old.exists?old.data():null),participantIds:ids,owners,recipientUids:recipients,approvals:[],senderUid:uid,sourceName,targetName,status:recipients.length?'pending':'accepted',createdAt:clock()};
   tx.create(requestRef,request);
   for(const owner of recipients){const proposalId=key+'-'+owner;tx.create(root.collection('proposals').doc(proposalId),{requestRoot:key,sourceId:ids[0],targetId:ids[1]||ids[0],sourceName,targetName,senderUid:uid,recipientUid:owner,type:patch.type||patch.name,kind,editing:Boolean(input.targetId),patch,status:'pending',createdAt:clock()});notify(tx,owner,gid+'-'+proposalId+'-requested',gid,proposalId,'relationship-request')}
   if(!recipients.length)apply(tx,root,request,key);
   return {id:key,status:request.status};
  }),
  respond:async(tx,root,uid,input,proposal)=>{
   if(proposal.recipientUid!==uid)fail('recipient-required',403);
   const key=proposal.requestRoot,requestRef=root.collection('relationshipRequests').doc(key),snap=await tx.get(requestRef);if(!snap.exists)fail('proposal-missing',404);
   const request=snap.data();if(request.status!=='pending')return {id:input.proposalId,status:request.status};
   if(request.approvals.includes(uid))return {id:input.proposalId,status:'pending'};
   const [old,...residents]=await Promise.all([tx.get(root.collection(collection(request.kind)).doc(request.targetId)),...Object.keys(request.owners).map(cid=>tx.get(root.collection('residents').doc(cid)))]);
   if(hash(old.exists?old.data():null)!==request.baseHash)fail('relationship-edit-conflict',409);
   if(residents.some(r=>!r.exists||r.data().ownerUid!==request.owners[r.id]))fail('participants-changed',409);
   const accounts=await Promise.all([...new Set(Object.values(request.owners))].map(owner=>tx.get(root.collection('members').doc(owner))));if(accounts.some(a=>!a.exists))fail('recipient-left-group',409);
   const approvals=[...request.approvals,uid],status=!input.accept?'declined':request.recipientUids.every(owner=>approvals.includes(owner))?'accepted':'pending';
   tx.update(requestRef,{approvals:input.accept?approvals:request.approvals,status});
   const reason=input.accept?'':String(input.reason||'').trim().slice(0,500);
   if(status==='pending')tx.update(root.collection('proposals').doc(input.proposalId),{status:'accepted',awaitingOthers:true});
   else for(const owner of request.recipientUids)tx.update(root.collection('proposals').doc(key+'-'+owner),{status,reason,awaitingOthers:false,respondedAt:clock()});
   if(status==='accepted')apply(tx,root,request,key);
   if(status!=='pending')notify(tx,request.senderUid,root.id+'-'+key+'-'+status,root.id,input.proposalId,status==='accepted'?'relationship-accepted':'relationship-declined');
   return {id:input.proposalId,status};
  }
 };
};
