const fail=(code,status=400)=>{throw Object.assign(new Error(code),{code,status})};
module.exports=({db,membership,notify,clock,id})=>{
 const clean=(s,max=120000)=>{if(typeof s!=='string'||Buffer.byteLength(s)>max)fail('invalid-profile');let v;try{v=JSON.parse(s)}catch{fail('invalid-profile')}if(!v||typeof v!=='object'||Array.isArray(v))fail('invalid-profile');return s};
 const limit=(group,member)=>Math.max(1,Math.min(100,Number(group.rules?.[member.role==='operator'?'operatorCharacterLimit':['owner','manager'].includes(member.role)?'managerCharacterLimit':'memberCharacterLimit'])||(['owner','manager','operator'].includes(member.role)?100:20)));
 async function apply(tx,root,p){
  const [sender,group,residents]=await Promise.all([tx.get(root.collection('members').doc(p.senderUid)),tx.get(root),tx.get(root.collection('residents'))]);
  if(!sender.exists)fail('recipient-left-group',409);
  if(p.kind==='admission'){
   if(group.data().ownerUid!==p.recipientUid)fail('recipient-changed',409);
   if(residents.docs.some(r=>r.id===p.sourceId))fail('already-resident',409);
   if(residents.docs.filter(r=>r.data().ownerUid===p.senderUid).length>=limit(group.data(),sender.data())||residents.docs.length>=200)fail('resident-limit',409);
   if(!group.data().towns?.some(t=>t.id===p.resident.townId))fail('town-missing',409);
   if(p.home){const old=await tx.get(root.collection('homes').doc(p.home.id));if(!old.exists)tx.create(root.collection('homes').doc(p.home.id),p.home)}
   tx.create(root.collection('residents').doc(p.sourceId),{...p.resident,ownerUid:p.senderUid,joinedAt:clock(),updatedAt:clock()});
  }else{
   const [resident,home]=await Promise.all([tx.get(root.collection('residents').doc(p.sourceId)),tx.get(root.collection('homes').doc(p.homeId))]);
   if(!resident.exists||resident.data().ownerUid!==p.senderUid||!home.exists||home.data().ownerUid!==p.recipientUid)fail('participants-changed',409);
   if((resident.data().sharedHomeId||'')!==p.previousHomeId)fail('residence-edit-conflict',409);
   tx.update(resident.ref||root.collection('residents').doc(p.sourceId),{sharedHomeId:p.homeId,residences:[{homeId:p.homeId,isPrimary:true,role:'주거지',stayPattern:'상시 거주',sleepRoomId:Object.keys(JSON.parse(home.data().layoutJson||'{}').rooms||{})[0]||'__none__',visitDays:[],notes:''}],residenceRevision:(Number(resident.data().residenceRevision)||0)+1,townId:home.data().townId,updatedAt:clock()});
  }
  tx.update(root,{lifeUpdatedAt:0});
 }
 return {
  requestResidence:async(uid,input)=>db.runTransaction(async tx=>{
   const {root,group,member}=await membership(tx,input.groupId,uid),key=id(input.requestId),kind=input.kind==='cohabitation'?'cohabitation':'admission',ref=root.collection('proposals').doc(key);
   if(kind==='cohabitation'&&group.rules?.allowCohabitation===false)fail('cohabitation-disabled',403);
   const old=await tx.get(ref);if(old.exists){if(old.data().senderUid!==uid)fail('request-id-conflict',409);return {id:key,status:old.data().status}}
   const recent=await tx.get(root.collection('proposals').where('senderUid','==',uid));if(recent.docs.filter(d=>d.data().createdAt>clock()-3600000).length>=20)fail('proposal-rate-limit',429);
   let p={kind,senderUid:uid,createdAt:clock(),status:'pending'};
   if(kind==='admission'){
    const r=input.resident;if(!r||typeof r.name!=='string'||!r.name.trim()||r.name.length>40)fail('invalid-profile');
    const source=id(r.sourceCharacterId),sourceId=uid+'_'+source.replace(/[^A-Za-z0-9_-]/g,'_');
    const resident={ownerName:String(member.displayName||'').slice(0,40),sourceCharacterId:source,name:r.name,job:String(r.job||'').slice(0,60),townId:id(r.townId),sourceHomeId:String(r.sourceHomeId||''),profileJson:clean(r.profileJson),scheduleJson:clean(r.scheduleJson),photo:String(r.photo||'').slice(0,2000),icon:String(r.icon||'').slice(0,2000)};
    p={...p,sourceId,sourceName:r.name,targetName:group.name||'',recipientUid:group.ownerUid,type:'입주 신청',resident};
    if(input.home){const h=input.home;if(h.sourceHomeId!==resident.sourceHomeId)fail('invalid-home');p.home={id:uid+'_'+id(h.sourceHomeId).replace(/[^A-Za-z0-9_-]/g,'_'),ownerUid:uid,ownerName:resident.ownerName,sourceHomeId:h.sourceHomeId,townId:resident.townId,name:String(h.name||'집').slice(0,60),layoutJson:clean(h.layoutJson),residentNames:[r.name],visitPolicy:'members'}}
   }else{
    const sourceId=id(input.sourceId),homeId=id(input.homeId),[r,h]=await Promise.all([tx.get(root.collection('residents').doc(sourceId)),tx.get(root.collection('homes').doc(homeId))]);
    if(!r.exists||r.data().ownerUid!==uid||!h.exists)fail('character-owner-required',403);
    p={...p,sourceId,homeId,previousHomeId:r.data().sharedHomeId||'',sourceName:r.data().name,targetName:h.data().name,recipientUid:h.data().ownerUid,type:'동거 제안'};
   }
   const recipient=await tx.get(root.collection('members').doc(p.recipientUid));if(!recipient.exists)fail('recipient-left-group',409);
   if(p.recipientUid===uid){await apply(tx,root,p);p.status='accepted'}
   tx.create(ref,p);if(p.status==='pending')notify(tx,p.recipientUid,root.id+'-'+key+'-residency',root.id,key,'residency-request');
   return {id:key,status:p.status};
  }),
  respond:async(tx,root,uid,input,p)=>{
   if(p.recipientUid!==uid)fail('recipient-required',403);const status=input.accept?'accepted':'declined';
   if(p.status!=='pending'){if(p.status!==status)fail('proposal-already-resolved',409);return {id:input.proposalId,status}}
   if(input.accept)await apply(tx,root,p);
   tx.update(root.collection('proposals').doc(input.proposalId),{status,reason:input.accept?'':String(input.reason||'').slice(0,500),respondedAt:clock()});
   notify(tx,p.senderUid,root.id+'-'+input.proposalId+'-'+status,root.id,input.proposalId,'residency-response');return {id:input.proposalId,status};
  }
 };
};
