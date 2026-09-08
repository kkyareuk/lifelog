module.exports=({db,clock=Date.now})=>async uid=>{
 const cutoff=clock()-30*86400000,cache=new Map();
 const get=ref=>{if(!cache.has(ref.path))cache.set(ref.path,ref.get());return cache.get(ref.path)};
 const entries=await Promise.all([['mail','recipientUid','incomingMail'],['mail','senderUid','outgoingMail'],['proposals','recipientUid','incomingProposals'],['proposals','senderUid','outgoingProposals']].map(async([kind,field,key])=>{
  const snap=await db.collectionGroup(kind).where(field,'==',uid).where('createdAt','>',cutoff).orderBy('createdAt','desc').limit(500).get();
  const values=await Promise.all(snap.docs.map(async d=>{
   const p=d.data(),root=d.ref.parent.parent;if(root?.parent.id!=='groups')return null;
   const sender=await get(root.collection('members').doc(p.senderUid));
   const responder=p.respondedAt?await get(root.collection('members').doc(p.recipientUid)):null;
   const source=p.sourceId?await get(root.collection('residents').doc(p.sourceId)):null;
   let profile={};try{profile=JSON.parse(source?.data()?.profileJson||'{}')}catch{}
   return {id:d.id,...p,groupId:root.id,senderDisplayName:sender.data()?.displayName||'',responderDisplayName:responder?.data()?.displayName||'',senderPhoto:profile.icon||source?.data()?.icon||profile.photo||source?.data()?.photo||sender.data()?.photoURL||''};
  }));return [key,values.filter(Boolean)];
 }));return Object.fromEntries(entries);
};
