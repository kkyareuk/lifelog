const crypto=require('node:crypto');
const fail=(code,status=400)=>{throw Object.assign(new Error(code),{code,status})};
const id=value=>{if(typeof value!=='string'||!value||value.length>180||/[\/\x00-\x1f]/.test(value))fail('invalid-id');return value};
const json=(value,max=120000)=>{if(typeof value!=='string'||Buffer.byteLength(value)>max)fail('payload-too-large');let data;try{data=JSON.parse(value)}catch{fail('invalid-json')}if(!data||typeof data!=='object'||Array.isArray(data))fail('invalid-json');return data};
const bounded=(value,max=120)=>String(value||'').trim().slice(0,max);
const data=snapshot=>snapshot.exists?{id:snapshot.id,...snapshot.data()}:null;
const rows=snapshot=>snapshot.docs.map(doc=>({id:doc.id,...doc.data()}));
const canonical=value=>Array.isArray(value)?value.map(canonical):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().filter(k=>!['__proto__','prototype','constructor'].includes(k)).map(k=>[k,canonical(value[k])])):value;

function createService({db,clock=Date.now,engine}){
  const groupRef=gid=>db.collection('groups').doc(id(gid));
  async function membership(tx,gid,uid){
    const root=groupRef(gid),[g,m]=await Promise.all([tx.get(root),tx.get(root.collection('members').doc(uid))]);
    const group=data(g),member=data(m);if(!group||!member)fail('group-membership-required',403);
    return {root,group,member};
  }
  const owned=(resident,uid)=>{if(!resident||resident.ownerUid!==uid)fail('character-owner-required',403)};
  const notify=(tx,uid,eventId,groupId,proposalId,kind)=>tx.set(db.collection('notificationOutbox').doc(eventId),{uid,groupId,proposalId,kind,createdAt:clock()});
  const requests=require('./shared-relationship-requests')({db,membership,notify,clock,id});
  async function propose(uid,input){
    if(input.patch)return requests.propose(uid,input);
    const gid=id(input.groupId),sourceId=id(input.sourceId),targetId=id(input.targetId),requestId=id(input.requestId);
    const type=bounded(input.type,80);if(!type||sourceId===targetId)fail('invalid-relationship');
    return db.runTransaction(async tx=>{
      const {root}=await membership(tx,gid,uid),ref=root.collection('proposals').doc(requestId);
      const [a,b,existing]=await Promise.all([tx.get(root.collection('residents').doc(sourceId)),tx.get(root.collection('residents').doc(targetId)),tx.get(ref)]);
      const source=data(a),target=data(b);owned(source,uid);if(!target||target.ownerUid===uid)fail('other-owner-required');
      const targetMember=await tx.get(root.collection('members').doc(target.ownerUid));if(!targetMember.exists)fail('recipient-left-group',409);
      if(existing.exists){const old=existing.data();if(old.senderUid!==uid||old.sourceId!==sourceId||old.targetId!==targetId||old.type!==type)fail('request-id-conflict',409);return {id:requestId,status:old.status}}
      const recent=await tx.get(root.collection('proposals').where('senderUid','==',uid));
      if(rows(recent).filter(x=>x.createdAt>clock()-3600000).length>=20)fail('proposal-rate-limit',429);
      const value={sourceId,targetId,sourceName:bounded(source.name),targetName:bounded(target.name),senderUid:uid,recipientUid:target.ownerUid,type,sourceRole:bounded(input.sourceRole,80),targetRole:bounded(input.targetRole,80),message:bounded(input.message,500),status:'pending',createdAt:clock()};
      tx.create(ref,value);notify(tx,target.ownerUid,`${gid}-${requestId}-requested`,gid,requestId,'relationship-request');
      return {id:requestId,status:'pending'};
    });
  }
  async function respond(uid,input){
    const gid=id(input.groupId),proposalId=id(input.proposalId),status=input.accept?'accepted':'declined';
    return db.runTransaction(async tx=>{
      const {root}=await membership(tx,gid,uid),ref=root.collection('proposals').doc(proposalId),snap=await tx.get(ref),proposal=data(snap);
      if(proposal?.requestRoot)return requests.respond(tx,root,uid,input,proposal);
      if(!proposal||proposal.recipientUid!==uid)fail('recipient-required',403);
      if(proposal.status!=='pending'){if(proposal.status!==status)fail('proposal-already-resolved',409);return {id:proposalId,status}}
      const [a,b,sender]=await Promise.all([tx.get(root.collection('residents').doc(proposal.sourceId)),tx.get(root.collection('residents').doc(proposal.targetId)),tx.get(root.collection('members').doc(proposal.senderUid))]);
      if(!sender.exists||!a.exists||!b.exists||a.data().ownerUid!==proposal.senderUid||b.data().ownerUid!==uid)fail('participants-changed',409);
      const now=clock(),relationId=`accepted-${proposalId}`;
      tx.update(ref,{status,reason:input.accept?'':bounded(input.reason,500),respondedAt:now});
      if(input.accept){
        tx.update(root,{lifeUpdatedAt:0});
        tx.create(root.collection('relationships').doc(relationId),{a:proposal.sourceId,b:proposal.targetId,type:proposal.type,sourceRole:proposal.sourceRole,targetRole:proposal.targetRole,temporalStatus:'current',stage:'관계 단계 미설정',intimacy:35,conflict:0,acceptedBy:[proposal.senderUid,uid],proposalId,createdAt:now});
        tx.create(root.collection('declarations').doc(relationId),{participantIds:[proposal.sourceId,proposal.targetId],sourceName:proposal.sourceName,targetName:proposal.targetName,type:proposal.type,at:now,until:now+120000});
      }
      notify(tx,proposal.senderUid,`${gid}-${proposalId}-${status}`,gid,proposalId,status==='accepted'?'relationship-accepted':'relationship-declined');
      return {id:proposalId,status};
    });
  }
  async function saveView(uid,input){
    return db.runTransaction(async tx=>{
      const {root}=await membership(tx,input.groupId,uid);
      const [a,b]=await Promise.all([tx.get(root.collection('residents').doc(id(input.sourceId))),tx.get(root.collection('residents').doc(id(input.targetId)))]);
      owned(data(a),uid);if(!b.exists||a.id===b.id)fail('invalid-target');
      const ref=root.collection('perceptions').doc(a.id+'~'+b.id),old=await tx.get(ref);
      const fields=['overall','importance','trust','closeness','comfort','awareness','mutualAwareness','fear','annoyance','attention','jealousy','conflictIntensity','expectation','touchIntensity','aggression','aggressionAction'];
      const field=input.field||'overall';if(!fields.includes(field))fail('invalid-view-field');
      let view={};try{view=JSON.parse(old.data()?.viewJson||'{}')}catch{}
      const value=bounded(input.value??input.overall,300);
      if(field==='touchIntensity'&&value==='성인 간 친밀한 접촉까지'&&[a,b].some(r=>{try{return ['영아','유아','어린이','청소년'].includes(JSON.parse(r.data().profileJson||'{}').ageGroup)}catch{return true}}))fail('adult-characters-required');
      if(input.reset)view={};else view[field]=value;
      tx.update(root,{lifeUpdatedAt:0});
      tx.set(ref,{sourceId:a.id,targetId:b.id,viewJson:JSON.stringify(view),updatedAt:clock()});return {saved:true};
    });
  }
  async function registerDevice(uid,input){
    const token=bounded(input.token,2000);if(token.length<20)fail('invalid-token');
    const ref=db.collection('pushDevices').doc(crypto.createHash('sha256').update(token).digest('hex'));
    await ref.set({uid,token,language:['ko','en','ja'].includes(input.language)?input.language:'ko',updatedAt:clock()});return {registered:true};
  }
  async function unregisterDevice(uid,input){
    const ref=db.collection('pushDevices').doc(crypto.createHash('sha256').update(bounded(input.token,2000)).digest('hex'));
    await db.runTransaction(async tx=>{const snap=await tx.get(ref);if(snap.exists&&snap.data().uid===uid)tx.delete(ref)});return {removed:true};
  }
  return {propose,respond,saveView,registerDevice,unregisterDevice};
}
module.exports={createService};
