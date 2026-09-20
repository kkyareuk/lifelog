const crypto=require('node:crypto');
const content=require('./court-content');
const fail=(code,status=400)=>{throw Object.assign(Error(code),{status})};
const id=v=>{if(typeof v!=='string'||!v||v.length>180||/[\/\\\x00-\x1f]/.test(v))fail('invalid-id');return v};
const rows=s=>s.docs.map(d=>({...d.data(),id:d.id}));
const json=v=>{try{return JSON.parse(v||'{}')}catch{return {}}};
const pairId=(a,b)=>crypto.createHash('sha256').update(JSON.stringify([a,b].sort())).digest('hex');
const defaults=r=>({closeness:r?.intimacy??0,affection:/연인|부부/.test(r?.type||'')?60:0,trust:r?40:10,comfort:r?40:10,tension:r?.conflict??0});
module.exports=function createCourtService({db,clock=Date.now}){
 async function context(tx,input,uid){
  const root=db.collection('groups').doc(id(input.groupId));
  const [g,m]=await Promise.all([tx.get(root),tx.get(root.collection('members').doc(uid))]);
  if(!g.exists||!m.exists)fail('group-membership-required',403);
  const group=g.data(),manager=group.ownerUid===uid||['owner','manager','operator'].includes(m.data().role);
  return {root,group,manager};
 }
 const enabled=group=>{if(group.courtTheme!=='court')fail('court-disabled',409)};
 async function participants(tx,root,uid,input){
  const a=id(input.actorId),b=id(input.targetId);if(a===b)fail('court-invalid-target');
  const [as,bs,ap,bp]=await Promise.all([tx.get(root.collection('residents').doc(a)),tx.get(root.collection('residents').doc(b)),tx.get(root.collection('courtProfiles').doc(a)),tx.get(root.collection('courtProfiles').doc(b))]);
  if(!as.exists||!bs.exists)fail('resident-missing',404);
  const actor={...as.data(),id:a},target={...bs.data(),id:b};
  if(actor.ownerUid!==uid)fail('character-owner-required',403);
  if(actor.townId!==target.townId)fail('court-invalid-target');
  const members=await Promise.all([tx.get(root.collection('members').doc(actor.ownerUid)),tx.get(root.collection('members').doc(target.ownerUid))]);
  if(members.some(s=>!s.exists))fail('group-membership-required',403);
  if(!ap.exists||!bp.exists||ap.data().ownerUid!==actor.ownerUid||bp.data().ownerUid!==target.ownerUid||!ap.data().enabled||!bp.data().enabled)fail('court-consent-required',409);
  await require('./user-safety').allowContact(db,tx,uid,target.ownerUid);
  return {actor,target,actorProfile:ap.data(),targetProfile:bp.data()};
 }
 async function relation(tx,root,actor,target,ap,bp,group){
  const ref=root.collection('perceptions').doc(target.id+'~'+actor.id),pairRef=root.collection('courtPairs').doc(pairId(actor.id,target.id));
  const [perception,pair,relationships]=await Promise.all([tx.get(ref),tx.get(pairRef),tx.get(root.collection('relationships'))]);
  const view=json(perception.data()?.viewJson),r=rows(relationships).find(r=>r.temporalStatus!=='past'&&[r.a,r.b].includes(actor.id)&&[r.a,r.b].includes(target.id));
  const initial={...defaults(r),...r?.metrics,...view.courtMetrics};
  const metrics=Object.fromEntries(content.metricKeys.map(k=>[k,content.clamp(initial[k])]));
  const socialDistance=Number.isInteger(pair.data()?.distance)?pair.data().distance:content.distance(ap,bp,group.courtRanks);
  return {ref,view,metrics,socialDistance};
 }
 return {
  readCourt:async(uid,input)=>db.runTransaction(async tx=>{
   const {root,group,manager}=await context(tx,input,uid);
   const [residents,profiles,pairs,journal]=await Promise.all([tx.get(root.collection('residents')),tx.get(root.collection('courtProfiles')),tx.get(root.collection('courtPairs')),tx.get(root.collection('courtJournals').doc(uid))]);
   const rs=rows(residents),ps=rows(profiles),mine=new Set(rs.filter(r=>r.ownerUid===uid).map(r=>r.id));
   return {theme:group.courtTheme||'basic',manager,roles:content.roles,factions:content.factions,traits:content.traits,
    residents:rs.map(r=>({id:r.id,name:r.name,ownerUid:r.ownerUid,townId:r.townId,profile:ps.find(p=>p.id===r.id&&p.ownerUid===r.ownerUid)||null})),
    pairs:rows(pairs).filter(p=>manager||p.members.some(i=>mine.has(i))),
    scenes:content.scenes.map(({id,title,formal})=>({id,title,formal})),history:(journal.data()?.entries||[]).slice(-20).reverse()};
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
  }),
  beginCourtDialogue:async(uid,input)=>db.runTransaction(async tx=>{
   const {root,group}=await context(tx,input,uid);enabled(group);
   const p=await participants(tx,root,uid,input),scene=content.scenes.find(s=>s.id===input.sceneId);if(!scene)fail('court-invalid-scene');
   const r=await relation(tx,root,p.actor,p.target,p.actorProfile,p.targetProfile,group),now=clock();
   const ref=root.collection('courtSessions').doc(uid),old=await tx.get(ref);
   if(now-Number(old.data()?.createdAt||0)<2000)fail('court-rate-limit',429);
   const session={token:crypto.randomUUID(),actorId:p.actor.id,targetId:p.target.id,sceneId:scene.id,createdAt:now,expiresAt:now+600000,actorRevision:p.actorProfile.revision,targetRevision:p.targetProfile.revision,result:null};
   tx.set(ref,session);
   return {token:session.token,targetName:p.target.name,scene:{id:scene.id,title:scene.title,prompt:scene.prompt,speech:scene.speech,formal:scene.formal,choices:scene.choices.map(({id,text})=>({id,text}))},metrics:r.metrics,socialDistance:r.socialDistance};
  }),
  chooseCourtDialogue:async(uid,input)=>db.runTransaction(async tx=>{
   const {root,group}=await context(tx,input,uid);enabled(group);
   const sessionRef=root.collection('courtSessions').doc(uid),ss=await tx.get(sessionRef),s=ss.data();
   if(!s||s.token!==input.token)fail('court-stale',409);
   const p=await participants(tx,root,uid,s);
   if(s.result){if(s.choiceId!==input.choiceId)fail('court-stale',409);return s.result;}
   if(clock()>s.expiresAt||s.actorRevision!==p.actorProfile.revision||s.targetRevision!==p.targetProfile.revision)fail('court-stale',409);
   const r=await relation(tx,root,p.actor,p.target,p.actorProfile,p.targetProfile,group),scene=content.scenes.find(x=>x.id===s.sceneId);
   const resolved=content.resolve(scene,input.choiceId,p.targetProfile,r.metrics,r.socialDistance),now=clock();
   const cooldownRef=root.collection('courtCooldowns').doc(pairId(s.actorId,s.targetId)),cooldown=await tx.get(cooldownRef);
   const rewarded=now-Number(cooldown.data()?.at||0)>=3600000&&group.rules?.relationshipChangeMode!=='fixed';
   const metrics=rewarded?resolved.metrics:r.metrics;
   const result={token:s.token,sceneId:scene.id,actorId:s.actorId,targetId:s.targetId,targetName:p.target.name,choiceId:input.choiceId,response:content.responses[resolved.reaction],metrics,socialDistance:r.socialDistance,delta:rewarded?resolved.delta:Object.fromEntries(content.metricKeys.map(k=>[k,0])),rewarded,at:now};
   const journalRef=root.collection('courtJournals').doc(uid),journal=await tx.get(journalRef);
   tx.set(r.ref,{sourceId:p.target.id,targetId:p.actor.id,viewJson:JSON.stringify({...r.view,courtMetrics:metrics}),updatedAt:now});
   if(rewarded)tx.set(cooldownRef,{at:now});
   tx.set(journalRef,{entries:[...(journal.data()?.entries||[]),result].slice(-30)});
   tx.update(sessionRef,{choiceId:input.choiceId,result});
   return result;
  })
 };
};
