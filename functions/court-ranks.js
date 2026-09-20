const {ranks:defaults}=require('./court-world-content');
const fail=(code,status=400)=>{throw Object.assign(Error(code),{status})};
const key=v=>{if(typeof v!=='string'||!v||v.length>180||/[\/\\\x00-\x1f]/.test(v))fail('invalid-id');return v};
const rank=v=>{if(!v||typeof v.name!=='string'||!v.name.trim()||v.name.length>40||!Number.isInteger(v.level)||v.level<0||v.level>100)fail('court-invalid-rank');return {name:v.name.trim(),level:v.level}};
module.exports=({db,clock=Date.now})=>{
 async function context(tx,uid,input){const root=db.collection('groups').doc(key(input.groupId)),[g,m]=await Promise.all([tx.get(root),tx.get(root.collection('members').doc(uid))]);if(!g.exists||!m.exists)fail('group-membership-required',403);return {root,group:g.data(),manager:g.data().ownerUid===uid||['owner','manager','operator'].includes(m.data().role)}}
 return {
  saveCourtRank:async(uid,input)=>db.runTransaction(async tx=>{
   const {root,group,manager}=await context(tx,uid,input);if(!manager)fail('manager-required',403);
   const value=rank(input),ranks=structuredClone(group.courtRanks||defaults),id=input.rankId?key(input.rankId):'custom-'+key(input.requestId);
   if(ranks.some(r=>r.id!==id&&r.name===value.name))fail('court-duplicate-rank',409);
   if(input.rankId&&!ranks.some(r=>r.id===id))fail('court-rank-missing',409);
   if(Number(input.revision||0)!==Number(group.courtRankRevision||0))fail('court-stale',409);
   const index=ranks.findIndex(r=>r.id===id);if(index>=0)ranks[index]={id,...value};else {if(ranks.length>=80)fail('court-rank-limit');ranks.push({id,...value})}
   tx.update(root,{courtRanks:ranks,courtRankRevision:Number(group.courtRankRevision||0)+1});return {id};
  }),
  requestCourtRank:async(uid,input)=>db.runTransaction(async tx=>{
   const {root,group}=await context(tx,uid,input);if(group.courtTheme!=='court')fail('court-disabled',409);
   const value=rank(input),ref=root.collection('courtRankRequests').doc(uid),previous=await tx.get(ref);
   if((group.courtRanks||defaults).some(r=>r.name===value.name))fail('court-duplicate-rank',409);
   if(previous.data()?.status==='pending')fail('court-request-pending',409);
   tx.set(ref,{...value,uid,status:'pending',createdAt:clock(),requestId:key(input.requestId)});return {saved:true};
  }),
  respondCourtRank:async(uid,input)=>db.runTransaction(async tx=>{
   const {root,group,manager}=await context(tx,uid,input);if(!manager)fail('manager-required',403);
   if(typeof input.accept!=='boolean')fail('court-invalid-rank');
   const ref=root.collection('courtRankRequests').doc(key(input.memberId)),request=await tx.get(ref),r=request.data();
   if(!r||r.status!=='pending'||r.requestId!==input.requestId)fail('court-stale',409);
   const ranks=structuredClone(group.courtRanks||defaults);
   if(input.accept){if(ranks.length>=80)fail('court-rank-limit');if(ranks.some(v=>v.name===r.name))fail('court-duplicate-rank',409);ranks.push({id:'custom-'+r.requestId,...rank(r)});tx.update(root,{courtRanks:ranks,courtRankRevision:Number(group.courtRankRevision||0)+1})}
   tx.update(ref,{status:input.accept?'approved':'rejected',reviewedAt:clock()});return {saved:true};
  })
 };
};
