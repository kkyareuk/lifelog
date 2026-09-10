const fail=message=>{throw Object.assign(Error(message),{status:409})};
const array=v=>Array.isArray(v)?v:v&&typeof v==='object'?Object.values(v).find(Array.isArray)||[]:[];
async function usage(db,tx,uid){
 const root=db.collection('users').doc(uid),lock=root.collection('slotReservations').doc('revision');
 const [user,core,memberships,revision]=await Promise.all([tx.get(root),tx.get(root.collection('sync').doc('core')),tx.get(root.collection('groupMemberships')),tx.get(lock)]);
 const local=core.data()?.state||user.data()?.gameState||{},entitlements=user.data()?.entitlements||{},personalIds=new Set(array(local.order));
 const transferDocs=await tx.get(root.collection('characterTransfers'));
 const transfers=transferDocs.docs.map(d=>d.data());transfers.filter(t=>['group','deleted'].includes(t.location)).forEach(t=>personalIds.delete(t.personalId));
 transfers.filter(t=>t.location==='personal'&&Number(local.characterTransferVersions?.[t.personalId]||0)<Number(t.revision)).forEach(t=>personalIds.add(t.personalId));
 let characters=0,towns=0;
 await Promise.all(memberships.docs.map(async membership=>{const groupRef=db.collection('groups').doc(membership.id);const [group,residents]=await Promise.all([tx.get(groupRef),tx.get(groupRef.collection('residents').where('ownerUid','==',uid))]);if(!group.exists)return;
  const g=group.data();towns+=(g.towns||[]).filter(t=>(t.slotOwnerUid||g.ownerUid)===uid).length;characters+=residents.docs.filter(d=>d.data().independentCharacter).length;
 }));
 return {characters,towns,personalCharacters:personalIds.size,personalTowns:array(local.towns).length,characterLimit:5+Math.max(0,Number(entitlements.characterSlotPacks ?? (entitlements.purchases||[]).filter(x=>x==='character_slots_5').length)||0)*5+Math.max(0,Number(entitlements.characterSingleSlots)||0),townLimit:2+Math.max(0,Number(entitlements.townSlotPacks)||(entitlements.purchases||[]).filter(x=>x==='town_slot_1').length),reserve:()=>tx.set(lock,{value:(Number(revision.data()?.value)||0)+1})};
}
const check=(value,kind)=>{if(value[kind]+value[kind==='characters'?'personalCharacters':'personalTowns']>=value[kind==='characters'?'characterLimit':'townLimit'])fail(kind==='characters'?'character-slot-required':'groups/town-slot-required')};
module.exports={usage,check,read:db=>uid=>db.runTransaction(async tx=>{const {reserve,...value}=await usage(db,tx,uid);return value})};
