const fail=(code,status=400)=>{throw Object.assign(new Error(code),{status,code})};
const id=v=>{if(typeof v!=='string'||!v||v.length>180||/[\/\\\x00-\x1f]/.test(v))fail('invalid-id');return v};
const safetyRef=(db,uid)=>db.collection('users').doc(id(uid)).collection('safety').doc('settings');
const reads=new WeakMap();
function read(tx,ref){if(!reads.has(tx))reads.set(tx,new Map());const cache=reads.get(tx);if(!cache.has(ref.path))cache.set(ref.path,tx.get(ref));return cache.get(ref.path)}
async function blocked(db,tx,a,b){if(a===b)return false;const docs=await Promise.all([read(tx,safetyRef(db,a)),read(tx,safetyRef(db,b))]);return docs.some((d,i)=>(d.data()?.blocked||[]).some(x=>x.uid===(i?a:b)))}
async function allowContact(db,tx,a,b){if(await blocked(db,tx,a,b))fail('contact-unavailable',403)}
function createSafety({db,clock=Date.now}){
 async function target(tx,uid,input){
  const root=db.collection('groups').doc(id(input.groupId)),kind=input.kind||'member',collection={member:'members',resident:'residents',mail:'mail',proposal:'proposals',group:'groups'}[kind];if(!collection)fail('invalid-report-target');
  const [membership,doc]=await Promise.all([tx.get(root.collection('members').doc(uid)),tx.get(kind==='group'?root:root.collection(collection).doc(id(input.targetId)))]);if(!doc.exists)fail('report-target-missing',404);
  const data=doc.data();if(!membership.exists&&(!['mail','proposal'].includes(kind)||![data.senderUid,data.recipientUid].includes(uid)))fail('group-membership-required',403);
  if(['mail','proposal'].includes(kind)&&![data.senderUid,data.recipientUid].includes(uid))fail('mail-access-required',403);
  const owner=kind==='member'?doc.id:kind==='group'?data.ownerUid:kind==='resident'?data.ownerUid:kind==='proposal'&&data.senderUid===uid&&data.respondedAt?data.recipientUid:data.senderUid;if(!owner||owner===uid)fail('invalid-report-target');
  const account=kind==='member'?doc:await tx.get(root.collection('members').doc(owner));return {uid:owner,name:String(account.data()?.displayName||owner.slice(0,8)).slice(0,80),evidence:JSON.stringify(data).slice(0,120000)};
 }
 return {
  readSafety:async uid=>({blocked:(await safetyRef(db,uid).get()).data()?.blocked||[]}),
  setUserBlock:async(uid,input)=>db.runTransaction(async tx=>{
   const ref=safetyRef(db,uid),old=await tx.get(ref),list=old.data()?.blocked||[];
   const person=input.block===false?{uid:id(input.targetUid)}:await target(tx,uid,input);
   const next=list.filter(x=>x.uid!==person.uid);if(input.block!==false){if(next.length>=200)fail('block-limit');next.push({uid:person.uid,name:person.name,at:clock()})}
   if(input.removeMember===true){
    if(input.block!==true||input.kind!=='member')fail('invalid-block-removal');
    await require('./remove-member').inTransaction({db,clock},tx,uid,{groupId:input.groupId,uid:person.uid});
   }
   tx.set(ref,{blocked:next},{merge:true});return {blocked:next};
  }),
  reportContent:async(uid,input)=>db.runTransaction(async tx=>{
   if(!['harassment','sexual','violence','hate','spam','other'].includes(input.reason))fail('report-reason-required');
   const person=await target(tx,uid,input),key=id(input.requestId),ref=db.collection('moderationReports').doc(uid+'-'+key),old=await tx.get(ref),rateRef=db.collection('moderationRateLimits').doc(uid),rate=await tx.get(rateRef);
   if(old.exists)return {id:ref.id};const recent=(rate.data()?.times||[]).filter(t=>t>clock()-86400000);if(recent.length>=20)fail('report-rate-limit',429);
   tx.create(ref,{reporterUid:uid,targetUid:person.uid,targetName:person.name,groupId:input.groupId,kind:input.kind||'member',targetId:input.targetId||input.groupId,reason:input.reason,details:String(input.details||'').slice(0,500),evidence:person.evidence,status:'pending',createdAt:clock()});tx.set(rateRef,{times:[...recent,clock()]});return {id:ref.id};
  })
 };
}
module.exports={createSafety,allowContact,blocked,safetyRef};
