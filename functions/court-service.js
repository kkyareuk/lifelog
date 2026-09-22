const crypto=require('node:crypto');
const content=require('./court-content');
const fail=(code,status=400)=>{throw Object.assign(Error(code),{status})};
const id=v=>{if(typeof v!=='string'||!v||v.length>180||/[\/\\\x00-\x1f]/.test(v))fail('invalid-id');return v};
const rows=s=>s.docs.map(d=>({...d.data(),id:d.id}));
const json=v=>{try{return JSON.parse(v||'{}')}catch{return {}}};
const pairId=(a,b)=>crypto.createHash('sha256').update(JSON.stringify([a,b].sort())).digest('hex');
module.exports=function createCourtService({db,clock=Date.now}){
 async function context(tx,input,uid){
  const root=db.collection('groups').doc(id(input.groupId));
  const [g,m]=await Promise.all([tx.get(root),tx.get(root.collection('members').doc(uid))]);
  if(!g.exists||!m.exists)fail('group-membership-required',403);
  const group=g.data(),manager=group.ownerUid===uid||['owner','manager','operator'].includes(m.data().role);
  return {root,group,manager};
 }

 return {
  readCourt:async(uid,input)=>db.runTransaction(async tx=>{
   const {root,group,manager}=await context(tx,input,uid);
   const [residents,profiles,pairs,journal]=await Promise.all([tx.get(root.collection('residents')),tx.get(root.collection('courtProfiles')),tx.get(root.collection('courtPairs')),tx.get(root.collection('courtJournals').doc(uid))]);
   const rs=rows(residents),ps=rows(profiles),mine=new Set(rs.filter(r=>r.ownerUid===uid).map(r=>r.id));
   return {theme:group.courtTheme||'basic',manager,roles:content.roles,factions:content.factions,traits:content.traits,
    residents:rs.map(r=>({id:r.id,name:r.name,ownerUid:r.ownerUid,townId:r.townId,profile:ps.find(p=>p.id===r.id&&p.ownerUid===r.ownerUid)||null})),
    pairs:rows(pairs).filter(p=>manager||p.members.some(i=>mine.has(i))),
    history:(journal.data()?.entries||[]).slice(-20).reverse()};
  }),
  saveCourtTheme:async(uid,input)=>db.runTransaction(async tx=>{
   const {root,manager}=await context(tx,input,uid);if(!manager)fail('manager-required',403);
   if(!['basic','court'].includes(input.theme))fail('court-invalid-theme');
   tx.update(root,{courtTheme:input.theme});return {saved:true};
  }),
  saveCourtProfile:async(uid,input)=>db.runTransaction(async tx=>{
   const {root}=await context(tx,input,uid),resident=await tx.get(root.collection('residents').doc(id(input.characterId)));
   if(!resident.exists||resident.data().ownerUid!==uid)fail('character-owner-required',403);
   const p=input.profile;if(!p||!Object.hasOwn(content.roles,p.role)||!Object.hasOwn(content.factions,p.faction)||!Object.hasOwn(content.traits,p.trait)||typeof p.enabled!=='boolean'||typeof p.bio!=='string'||p.bio.length>500)fail('court-invalid-profile');
   const ref=root.collection('courtProfiles').doc(resident.id),old=await tx.get(ref);
   const revision=old.data()?.ownerUid===uid?Number(old.data()?.revision||0):0;
   if(Number(input.revision||0)!==revision)fail('court-stale',409);
   tx.set(ref,{...(old.data()?.ownerUid===uid?old.data():{}),ownerUid:uid,role:p.role,faction:p.faction,trait:p.trait,bio:p.bio.trim(),enabled:p.enabled,revision:revision+1});return {saved:true};
  }),
  saveCourtDistance:async(uid,input)=>db.runTransaction(async tx=>{
   const {root,manager}=await context(tx,input,uid);if(!manager)fail('manager-required',403);
   const members=[id(input.actorId),id(input.targetId)].sort();if(members[0]===members[1]||!Number.isInteger(input.distance)||input.distance<0||input.distance>100)fail('court-invalid-distance');
   const rs=await Promise.all(members.map(i=>tx.get(root.collection('residents').doc(i))));if(rs.some(r=>!r.exists))fail('resident-missing',404);
   tx.set(root.collection('courtPairs').doc(pairId(...members)),{members,distance:input.distance});return {saved:true};
  })
 };
};
