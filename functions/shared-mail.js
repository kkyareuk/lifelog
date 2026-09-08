const fail=(code,status=400)=>{throw Object.assign(new Error(code),{code,status})};
module.exports=({db,membership,notify,clock,id,engine})=>async(uid,input)=>db.runTransaction(async tx=>{
 const {root,group,member}=await membership(tx,input.groupId,uid);if(group.rules?.allowMail===false&&group.ownerUid!==uid&&!['owner','manager','operator'].includes(member.role))fail('mail-disabled',403);
 const rateRef=root.collection('mailRateLimits').doc(uid),rate=await tx.get(rateRef),sent=(rate.data()?.sent||[]).filter(t=>t>clock()-3600000);
 const reserve=()=>{if(sent.length>=30)fail('mail-rate-limit',429);tx.set(rateRef,{sent:[...sent,clock()]})};
 if(['member','announcement'].includes(input.audience)){
  const key=id(input.requestId),requestRef=root.collection('mailDispatches').doc(key),old=await tx.get(requestRef);if(old.exists){if(old.data().senderUid!==uid)fail('request-id-conflict',409);return {id:key}}
  const staff=group.ownerUid===uid||['owner','manager','operator'].includes(member.role);if(input.audience==='announcement'&&!staff)fail('manager-required',403);
  const members=await tx.get(root.collection('members'));
  const recipients=members.docs.filter(d=>d.id!==uid&&(input.audience==='announcement'||d.id===input.targetUid));if(!recipients.length)fail('recipient-missing',404);if(recipients.length>200)fail('recipient-limit');
  const subject=String(input.subject||'').trim().slice(0,80),body=String(input.body||'').slice(0,2000);if(!subject)fail('subject-required');
  reserve();tx.create(requestRef,{senderUid:uid,createdAt:clock()});for(const recipient of recipients){const mailId=key+'-'+recipient.id;tx.create(root.collection('mail').doc(mailId),{senderUid:uid,recipientUid:recipient.id,sourceName:member.displayName||group.ownerName||'Member',targetName:recipient.data().displayName||'Member',subject,body,announcement:input.audience==='announcement',dispatchId:key,recipientCount:recipients.length,createdAt:clock()});notify(tx,recipient.id,root.id+'-'+mailId+'-mail',root.id,mailId,'mail-received')}return {id:key};
 }
 const key=id(input.requestId),ref=root.collection('mail').doc(key),old=await tx.get(ref);if(old.exists){if(old.data().senderUid!==uid)fail('request-id-conflict',409);return {id:key}}
 const targetId=id(input.targetId),sourceId=input.sourceId?id(input.sourceId):'',[target,source]=await Promise.all([tx.get(root.collection('residents').doc(targetId)),sourceId?tx.get(root.collection('residents').doc(sourceId)):null]);
 if(!target.exists||sourceId&&(!source?.exists||source.data().ownerUid!==uid||sourceId===targetId))fail('character-owner-required',403);
 if(sent.length>=30)fail('mail-rate-limit',429);
 const recipientUid=target.data().ownerUid,recipient=await tx.get(root.collection('members').doc(recipientUid));if(!recipient.exists)fail('recipient-left-group',409);
 const subject=String(input.subject||'').trim().slice(0,80),body=String(input.body||'').slice(0,2000);if(!subject)fail('subject-required');
 let gift=null,catalogRef,catalogItems,profile;
 if(input.gift){if(group.rules?.allowGifts===false)fail('gifts-disabled',403);const {kind,item}=input.gift;if(!['food','drink','flower','misc','fashion','perfume','book','toy'].includes(kind)||!item?.name||typeof item.name!=='string')fail('invalid-gift');
  catalogRef=root.collection('catalog').doc(kind);const catalog=await tx.get(catalogRef);catalogItems=catalog.exists?catalog.data().items||[]:[];const itemId=id(item.id),existing=catalogItems.find(i=>i.id===itemId);const value=existing||{id:itemId,name:item.name.slice(0,80),image:/^https:\/\//.test(item.image||'')?item.image.slice(0,2000):''};if(!existing){if(catalogItems.length>=80)fail('catalog-limit',409);catalogItems=[...catalogItems,value]}gift={kind,item:value};try{profile=JSON.parse(target.data().profileJson||'{}')}catch{fail('invalid-profile')};profile.inventory??={};profile.inventory[kind]=Array.isArray(profile.inventory[kind])?profile.inventory[kind]:[];if(!profile.inventory[kind].includes(itemId))profile.inventory[kind].push(itemId);
 }
 let giftLives=[];if(gift&&source&&engine){const homes=await tx.get(root.collection("homes")),advance=await engine();giftLives=advance({group:{id:root.id,...group},residents:[{id:sourceId,...source.data()},{id:targetId,...target.data(),profileJson:JSON.stringify(profile)}],homes:homes.docs.map(d=>({id:d.id,...d.data()})),catalog:[{id:gift.kind,items:catalogItems}]},clock(),{characterId:sourceId,targetId,kind:"gift",positions:input.positions,topic:gift.item.name,itemId:gift.item.id,itemKind:gift.kind})}
 const value={senderUid:uid,recipientUid,sourceId,targetId,sourceName:source?.data().name||member.displayName||'Village owner',targetName:target.data().name,subject,body,gift,createdAt:clock()};
 reserve();if(gift){tx.set(catalogRef,{items:catalogItems},{merge:true});tx.update(root.collection('residents').doc(targetId),{profileJson:JSON.stringify(profile),updatedAt:clock()});tx.update(root,{lifeUpdatedAt:0})}
 for(const life of giftLives)tx.update(root.collection("residents").doc(life.id),{lifeJson:life.lifeJson});
 tx.create(ref,value);if(recipientUid!==uid)notify(tx,recipientUid,root.id+'-'+key+'-mail',root.id,key,'mail-received');return {id:key};
});
