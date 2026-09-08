const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status})};
const text=(value,max=500)=>{if(typeof value!=='string'||value.length>max)fail('invalid-member-field');return value};
const image=value=>{value=text(value,2000);if(value&&!/^https:\/\//.test(value))fail('invalid-member-image');return value};
module.exports=({context,clock,id})=>async(uid,input)=>{
 const {tx}=input; // The caller supplies the transaction, never the HTTP payload.
 const {ref,group,member}=await context(tx,input.groupId,uid),homeRef=ref.collection('homes').doc(id(input.homeId)),snap=await tx.get(homeRef);
 if(!snap.exists)fail('home-missing',404);
 const home=snap.data(),staff=group.ownerUid===uid||['owner','manager','operator'].includes(member.role);
 if(!staff&&home.ownerUid!==uid)fail('home-owner-required',403);
 const itemId=id(input.id),layout=JSON.parse(home.layoutJson||'{}'),rooms=layout.rooms||{};
 if(input.kind==='resident'){
  const residentRef=ref.collection('residents').doc(itemId),r=await tx.get(residentRef);if(!r.exists)fail('resident-missing',404);
  const resident=r.data();if(!staff&&resident.ownerUid!==uid)fail('character-owner-required',403);
  if(resident.townId!==home.townId)fail('resident-town-mismatch',409);
  const revision=Number(resident.residenceRevision)||0;if(Number(input.revision)!==revision)fail('groups/edit-conflict',409);
  const profile=JSON.parse(resident.profileJson||'{}');
  let legacyHomeId=resident.sharedHomeId||'';
  if(!Array.isArray(resident.residences)&&!legacyHomeId){const all=await tx.get(ref.collection('homes'));legacyHomeId=all.docs.find(h=>h.data().ownerUid===resident.ownerUid&&h.data().sourceHomeId===(resident.sourceHomeId||profile.homeId))?.id||''}
  let residences=Array.isArray(resident.residences)?resident.residences:legacyHomeId?[{homeId:legacyHomeId,isPrimary:true,stayPattern:'상시 거주',sleepRoomId:profile.sleepRoomId||'bedroom'}]:[];
  residences=residences.filter(r=>r.homeId!==homeRef.id);
  if(!input.remove){
   const p=input.item||{},room=text(p.sleepRoomId||'__none__',180);if(room!=='__none__'&&!rooms[room])fail('room-missing');
   const days=p.visitDays||[];if(!Array.isArray(days)||days.some(d=>!Number.isInteger(d)||d<0||d>6))fail('invalid-visit-days');
   const item={homeId:homeRef.id,role:text(p.role||'주거지',40),stayPattern:text(p.stayPattern||'상시 거주',40),sleepRoomId:room,notes:text(p.notes||'',200),visitDays:[...new Set(days)],isPrimary:!!p.isPrimary||!residences.length};
   if(!['상시 거주','평일 중심','주말 중심','요일 지정','필요할 때 방문'].includes(item.stayPattern))fail('invalid-stay-pattern');
   if(item.isPrimary)residences=residences.map(r=>({...r,isPrimary:false}));residences.push(item);
  }
  if(residences.length>50)fail('residence-limit');
  if(residences.length&&!residences.some(r=>r.isPrimary))residences[0]={...residences[0],isPrimary:true};
  const primary=residences.find(r=>r.isPrimary);
  tx.update(residentRef,{residences,sharedHomeId:primary?.homeId||'',residenceRevision:revision+1,updatedAt:clock()});
  tx.update(ref,{lifeUpdatedAt:0});return {revision:revision+1,residences,sharedHomeId:primary?.homeId||''};
 }
 if(!['pet','car'].includes(input.kind))fail('invalid-member-kind');
 const revision=Number(home.layoutRevision)||0;if(Number(input.revision)!==revision)fail('groups/edit-conflict',409);
 const key=input.kind==='pet'?'pets':'cars',items=(layout[key]||[]).filter(p=>p.id!==itemId),p=input.item||{};
 if(!input.remove){
  let item={id:itemId,name:text(p.name||'',80).trim()};if(!item.name)fail('name-required');
  if(input.kind==='pet'){
   for(const field of ['species','customSpecies','size','breed','sex'])item[field]=text(p[field]||'',field==='breed'?200:80);
   for(const field of ['temperaments','bodyTraits']){if(!Array.isArray(p[field]||[])||(p[field]||[]).length>20)fail('invalid-member-field');item[field]=(p[field]||[]).map(v=>text(v,80))}
   for(const field of ['neutered','needsWalk','rideable'])item[field]=!!p[field];
   for(const field of ['photo','icon'])item[field]=image(p[field]||'');
   item.room=text(p.room||'',180);if(!rooms[item.room])fail('room-missing');
  }else{
   item.type=text(p.type||'승용차',80);item.color=text(p.color||'',80);item.seats=Number(p.seats)||5;if(!Number.isInteger(item.seats)||item.seats<1||item.seats>12)fail('invalid-seats');item.image=image(p.image||'');item.ownerCharacterId=p.ownerCharacterId?id(p.ownerCharacterId):'';
   if(item.ownerCharacterId){const owner=await tx.get(ref.collection('residents').doc(item.ownerCharacterId));if(!owner.exists)fail('resident-missing',404)}
  }
  items.push(item);
 }
 if(items.length>80)fail('home-member-limit',409);
 const layoutJson=JSON.stringify({...layout,[key]:items});if(layoutJson.length>180000)fail('invalid-layout');
 tx.update(homeRef,{layoutJson,layoutRevision:revision+1,updatedAt:clock()});tx.update(ref,{lifeUpdatedAt:0});return {revision:revision+1,layoutJson};
};
