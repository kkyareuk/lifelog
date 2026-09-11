const fail=(code,status=400)=>{throw Object.assign(Error(code),{status,code})};
const id=v=>{if(typeof v!=='string'||!v||v.length>180||/[\/\\\x00-\x1f]/.test(v))fail('invalid-mail-id');return v};
module.exports=({db})=>async(uid,input)=>{
 if(!Array.isArray(input.items)||!input.items.length||input.items.length>50)fail('invalid-mail-selection');
 const refs=[...new Map(input.items.map(item=>{if(!['mail','proposals'].includes(item.kind))fail('invalid-mail-kind');const ref=db.collection('groups').doc(id(item.groupId)).collection(item.kind).doc(id(item.id));return [ref.path,ref]})).values()];
 return db.runTransaction(async tx=>{
  const docs=await Promise.all(refs.map(ref=>tx.get(ref)));
  for(const doc of docs){if(!doc.exists)fail('mail-missing',404);const p=doc.data();if(![p.senderUid,p.recipientUid].includes(uid))fail('mail-access-required',403);if(p.announcement===true)fail('announcement-not-deletable',403)}
  for(const doc of docs){const p=doc.data();tx.update(doc.ref,{hiddenFor:[...new Set([...(p.hiddenFor||[]),uid])].filter(x=>[p.senderUid,p.recipientUid].includes(x))})}
  return {deleted:docs.length};
 });
};
