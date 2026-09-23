'use strict';
module.exports=({db,clock=Date.now,model=()=>import('./runtime/wallet-sharing.js'),moneyModel=()=>import('./runtime/character-money.js')})=>async(uid,input)=>{
 const fail=(message,status=400)=>{throw Object.assign(Error(message),{status})};
 if(typeof input.groupId!=='string'||!input.groupId||input.groupId.length>180||/[\/]/.test(input.groupId))fail('invalid-id');
 const [sharing,money]=await Promise.all([model(),moneyModel()]);
 return db.runTransaction(async tx=>{
  const root=db.collection('groups').doc(input.groupId),[g,member,residents]=await Promise.all([tx.get(root),tx.get(root.collection('members').doc(uid)),tx.get(root.collection('residents'))]);
  if(!g.exists||!member.exists)fail('group-membership-required',403);
  const records=new Map(residents.docs.map(d=>[d.id,d.data()])),characters={};
  for(const [id,r] of records){const life=JSON.parse(r.lifeJson||'{}'),profile=JSON.parse(r.profileJson||'{}');characters[id]={...profile,id,ownerUid:r.ownerUid,wallet:life.wallet||profile.wallet};}
  if(!characters[input.id]||characters[input.id].ownerUid!==uid)fail('character-owner-required',403);
  // Only owners may initialize their wallets. A recipient opts in by accepting.
  const request=g.data().walletSharing?.requests?.find(r=>r.id===input.requestId);
  const affected=new Set([input.id,input.targetId,...(request?.members||[])]);
  for(const id of affected){const c=characters[id];if(c){await require('./user-safety').allowContact(db,tx,uid,c.ownerUid);if(!c.wallet)money.ensureWallet(c,clock());}}
  const world={characters,walletSharing:g.data().walletSharing};
  try{sharing.sharingAction(world,uid,input,clock());}catch(e){e.status=400;throw e;}
  if(JSON.stringify(world.walletSharing).length>200000)fail('money-sharing-limit');
  for(const [id,c] of Object.entries(characters)){const record=records.get(id),life=JSON.parse(record.lifeJson||'{}');if(c.wallet&&JSON.stringify(life.wallet)!==JSON.stringify(c.wallet))tx.update(root.collection('residents').doc(id),{lifeJson:JSON.stringify({...life,wallet:c.wallet})});}
  tx.update(root,{walletSharing:world.walletSharing,lifeUpdatedAt:0,lifeNextAt:0});
  return {walletSharing:world.walletSharing,wallets:Object.fromEntries(Object.entries(characters).filter(([,c])=>c.wallet).map(([id,c])=>[id,c.wallet]))};
 });
};
