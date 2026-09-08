const parse=value=>{try{return JSON.parse(value||'{}')}catch{return {}}};
const fail=(message,status=409)=>{throw Object.assign(Error(message),{status})};
const transferRef=(db,uid,id)=>db.collection('users').doc(uid).collection('characterTransfers').doc(id);
async function prepareMove(db,tx,p,gid,now){
 const id=p.resident.sourceCharacterId,ref=transferRef(db,p.senderUid,id),old=await tx.get(ref);
 if(old.exists&&old.data().location==='group')fail('character-already-moved');
 const core=await tx.get(db.collection('users').doc(p.senderUid).collection('sync').doc('core'));
 const order=core.data()?.state?.order,ids=Array.isArray(order)?order:Object.values(order||{}).find(Array.isArray)||[];
 if(!ids.includes(id))fail('personal-character-missing');
 const profile=parse(p.resident.profileJson);
 return ()=>tx.set(ref,{personalId:id,location:'group',groupId:gid,residentId:p.sourceId,homeId:profile.homeId||p.resident.sourceHomeId||id,homeTownId:profile.townId||'',revision:(old.data()?.revision||0)+1,updatedAt:now});
}
async function prepareReturn(db,tx,gid,residents,homes,now){
 const records=await Promise.all(residents.map(async r=>{const id=r.sourceCharacterId||r.id,ref=transferRef(db,r.ownerUid,id),old=await tx.get(ref),home=homes.find(h=>h.id===r.sharedHomeId)||homes.find(h=>h.ownerUid===r.ownerUid&&h.sourceHomeId===r.sourceHomeId);return {ref,value:{...old.data(),personalId:id,location:'personal',groupId:gid,residentId:r.id,profile:parse(r.profileJson),schedule:parse(r.scheduleJson),home:parse(home?.layoutJson),homeId:old.data()?.homeId||r.sourceHomeId||id,homeTownId:old.data()?.homeTownId||'',revision:(old.data()?.revision||0)+1,updatedAt:now}}}));
 return ()=>records.forEach(r=>tx.set(r.ref,r.value));
}
module.exports={prepareMove,prepareReturn};
