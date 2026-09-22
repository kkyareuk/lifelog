'use strict';
module.exports=({db,clock=Date.now,model=()=>import('./runtime/character-money.js')})=>async(uid,input)=>{
 const money=await model(),fail=(code,status=400)=>{throw Object.assign(Error(code),{status})};
 for(const k of ['groupId','id'])if(typeof input[k]!=='string'||!input[k]||input[k].length>180||/[\/]/.test(input[k]))fail('invalid-id');
 return db.runTransaction(async tx=>{
  const group=db.collection('groups').doc(input.groupId),ref=group.collection('residents').doc(input.id);
  const [groupDoc,member,doc]=await Promise.all([tx.get(group),tx.get(group.collection('members').doc(uid)),tx.get(ref)]);
  if(!member.exists||!doc.exists||doc.data().ownerUid!==uid)fail('character-owner-required',403);
  const record=doc.data(),profile=JSON.parse(record.profileJson||'{}'),life=JSON.parse(record.lifeJson||'{}'),character={...profile,id:input.id,homeId:record.sharedHomeId,residences:record.residences||[],wallet:life.wallet||profile.wallet},now=clock();
  const existingWallet=character.wallet;
  money.ensureWallet(character,now);
  const world={economy:groupDoc.data()?.economy};money.settleEmployment(world,character,now,true);
  const careers=await import('./runtime/career-world.js');careers.applyWorldCurrency(world,character);
  let homeRef,home,receiptRef,receipt;
  if(['share','deposit','withdraw'].includes(input.action)){
   if(typeof input.homeId!=='string'||!input.homeId||/[\/]/.test(input.homeId))fail('invalid-id');homeRef=group.collection('homes').doc(input.homeId);const h=await tx.get(homeRef);if(!h.exists)fail('home-missing',404);home={...JSON.parse(h.data().layoutJson||'{}'),id:input.homeId,commonWallet:h.data().commonWallet};
  }
  if(['deposit','withdraw'].includes(input.action)){
   if(typeof input.requestId!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(input.requestId))fail('invalid-request');
   receiptRef=group.collection('moneyReceipts').doc(uid+':'+input.requestId);receipt=await tx.get(receiptRef);
   if(receipt.exists){const old=receipt.data();if(old.characterId!==input.id||old.homeId!==input.homeId||old.amount!==input.amount||old.action!==input.action)fail('money-request-conflict',409);return {wallet:character.wallet,commonWallet:home.commonWallet};}
  }
  try{
   if(input.action==='employment'){const jobs=await import('./runtime/salary.js');jobs.assignEmployment(world,character,input.jobId,input.rankId,now,money.moneyEntry,{department:input.department,specialty:input.specialty,frequency:input.frequency});if(typeof input.jobTitle!=='string'||input.jobTitle.length>80)fail('career-invalid');character.jobTitle=input.jobTitle;}
   else if(input.action==='settings')money.updateMoneySettings(character,input.patch||{},now);
   else if(input.action==='share'){if(typeof input.enabled!=='boolean')fail('invalid-value');money.setWalletSharing({characters:{[input.id]:character},homes:{[input.homeId]:home}},input.id,input.homeId,input.enabled)}
   else if(['deposit','withdraw'].includes(input.action)){if(typeof input.requestId!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(input.requestId))fail('invalid-request');money.moveCommonMoney({characters:{[input.id]:character},homes:{[input.homeId]:home}},input.id,input.homeId,input.amount,input.action,uid+':'+input.requestId,now)}
   else if(input.action!=='read')fail('invalid-action');
  }catch(e){if(!e.status)e.status=400;throw e}
  if(input.action!=='read'||!existingWallet||character.wallet.employment)tx.update(ref,{lifeJson:JSON.stringify({...life,wallet:character.wallet}),...(input.action==='employment'?{profileJson:JSON.stringify({...profile,job:character.job,jobTitle:character.jobTitle})}:{}),...(input.action==='settings'?{profileJson:JSON.stringify({...profile,wealth:character.wealth,income:character.income})}:{})});if(homeRef)tx.update(homeRef,{commonWallet:home.commonWallet});
  if(receiptRef)tx.set(receiptRef,{characterId:input.id,homeId:input.homeId,amount:input.amount,action:input.action,createdAt:now});
  return {wallet:character.wallet,job:character.job,jobTitle:character.jobTitle,...(home?{commonWallet:home.commonWallet}:{})};
 });
};
