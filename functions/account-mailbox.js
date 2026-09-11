module.exports=({db,clock=Date.now})=>async (uid,input={})=>{
 const safety=await require('./user-safety').safetyRef(db,uid).get(),blocked=new Set((safety.data()?.blocked||[]).map(x=>x.uid));
 const cache=new Map(),mailCursors={},paging=input.cursors&&typeof input.cursors==='object'?input.cursors:null;
 const readPage=async(query,key,pattern)=>{if(paging&&(!Object.hasOwn(paging,key)||paging[key]===null)){mailCursors[key]=null;return {docs:[]}}const cursor=paging?.[key];query=query.orderBy('createdAt','desc').orderBy('__name__','desc');if(cursor){if(!Number.isFinite(cursor.at)||typeof cursor.path!=='string'||!pattern.test(cursor.path))throw Object.assign(Error('invalid-mail-cursor'),{status:400});query=query.startAfter(cursor.at,db.doc(cursor.path))}const page=await query.limit(50).get(),last=page.docs.at(-1);mailCursors[key]=page.docs.length===50?{at:last.data().createdAt,path:last.ref.path}:null;return page};
 const get=ref=>{if(!cache.has(ref.path))cache.set(ref.path,ref.get());return cache.get(ref.path)};
 const entries=await Promise.all([['mail','recipientUid','incomingMail'],['mail','senderUid','outgoingMail'],['proposals','recipientUid','incomingProposals'],['proposals','senderUid','outgoingProposals']].map(async([kind,field,key])=>{
  const snap=await readPage(db.collectionGroup(kind).where(field,'==',uid),key,new RegExp('^groups/[^/]+/'+kind+'/[^/]+$'));
  const values=await Promise.all(snap.docs.map(async d=>{
   const p=d.data(),root=d.ref.parent.parent;if(key==='outgoingProposals'&&p.kind==='create-resident'&&p.creationRoot!==d.id)return null;if(p.announcement!==true&&(blocked.has(p.senderUid)||blocked.has(p.recipientUid)))return null;if(p.announcement!==true&&p.hiddenFor?.includes(uid))return null;if(root?.parent.id!=='groups')return null;
   const sender=await get(root.collection('members').doc(p.senderUid));
   const recipient=kind==='proposals'?await get(root.collection('members').doc(p.recipientUid)):null;
   const responder=p.respondedAt?(p.responderUid?await get(root.collection('members').doc(p.responderUid)):recipient):null;
   const source=p.sourceId?await get(root.collection('residents').doc(p.sourceId)):null;
   let profile={};try{profile=JSON.parse(source?.data()?.profileJson||'{}')}catch{}
   return {id:d.id,...p,creationInput:undefined,groupId:root.id,senderDisplayName:sender.data()?.displayName||'',responderDisplayName:responder?.data()?.displayName||p.responderDisplayName||'',responderPhoto:responder?.data()?.photoURL||p.responderPhoto||'',recipientDisplayName:recipient?.data()?.displayName||p.recipientDisplayName||'',senderKind:kind==='proposals'?'user':p.sourceId?'character':'user',senderPhoto:p.senderPhoto||(kind==='proposals'?sender.data()?.photoURL:profile.icon||source?.data()?.icon||profile.photo||source?.data()?.photo||sender.data()?.photoURL)||''};
  }));return [key,values.filter(Boolean)];
 }));const notices=await readPage(db.collection('villageAnnouncements'),'notices',/^villageAnnouncements\/[^/]+$/);const incoming=entries.find(([key])=>key==='incomingMail');incoming[1].push(...notices.docs.map(d=>({id:'notice-'+d.id,...d.data(),recipientUid:uid})));const transfers=await db.collection('users').doc(uid).collection('characterTransfers').get();return {...Object.fromEntries(entries),mailCursors,characterTransfers:transfers.docs.map(d=>d.data())};
};
