module.exports=({db,clock=Date.now})=>async uid=>{
 const safety=await require('./user-safety').safetyRef(db,uid).get(),blocked=new Set((safety.data()?.blocked||[]).map(x=>x.uid));
 const cutoff=clock()-30*86400000,cache=new Map();
 const get=ref=>{if(!cache.has(ref.path))cache.set(ref.path,ref.get());return cache.get(ref.path)};
 const entries=await Promise.all([['mail','recipientUid','incomingMail'],['mail','senderUid','outgoingMail'],['proposals','recipientUid','incomingProposals'],['proposals','senderUid','outgoingProposals']].map(async([kind,field,key])=>{
  const snap=await db.collectionGroup(kind).where(field,'==',uid).where('createdAt','>',cutoff).orderBy('createdAt','desc').limit(500).get();
  const values=await Promise.all(snap.docs.map(async d=>{
   const p=d.data(),root=d.ref.parent.parent;if(key==='outgoingProposals'&&p.kind==='create-resident'&&p.creationRoot!==d.id)return null;if(blocked.has(p.senderUid)||blocked.has(p.recipientUid))return null;if(root?.parent.id!=='groups')return null;
   const sender=await get(root.collection('members').doc(p.senderUid));
   const recipient=kind==='proposals'?await get(root.collection('members').doc(p.recipientUid)):null;
   const responder=p.respondedAt?(p.responderUid?await get(root.collection('members').doc(p.responderUid)):recipient):null;
   const source=p.sourceId?await get(root.collection('residents').doc(p.sourceId)):null;
   let profile={};try{profile=JSON.parse(source?.data()?.profileJson||'{}')}catch{}
   return {id:d.id,...p,creationInput:undefined,groupId:root.id,senderDisplayName:sender.data()?.displayName||'',responderDisplayName:responder?.data()?.displayName||p.responderDisplayName||'',responderPhoto:responder?.data()?.photoURL||p.responderPhoto||'',recipientDisplayName:recipient?.data()?.displayName||p.recipientDisplayName||'',senderKind:kind==='proposals'?'user':p.sourceId?'character':'user',senderPhoto:p.senderPhoto||(kind==='proposals'?sender.data()?.photoURL:profile.icon||source?.data()?.icon||profile.photo||source?.data()?.photo||sender.data()?.photoURL)||''};
  }));return [key,values.filter(Boolean)];
 }));const transfers=await db.collection('users').doc(uid).collection('characterTransfers').get();return {...Object.fromEntries(entries),characterTransfers:transfers.docs.map(d=>d.data())};
};
