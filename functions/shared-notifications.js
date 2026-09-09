const {onDocumentCreated}=require('firebase-functions/v2/firestore');
const {getMessaging}=require('firebase-admin/messaging');
module.exports=({db})=>{
  const deliver=onDocumentCreated({document:'notificationOutbox/{eventId}',region:'asia-northeast3',retry:true},async event=>{
    const item=event.data.data();if(item.deliveredAt)return;
    const member=await db.collection('groups').doc(item.groupId).collection('members').doc(item.uid).get();const returnMail=item.kind==='member-returned'?await db.collection('groups').doc(item.groupId).collection('mail').doc(item.proposalId).get():null;if(!member.exists&&returnMail?.data()?.recipientUid!==item.uid){await event.data.ref.update({deliveredAt:Date.now(),skipped:'member-left'});return;}
    const devices=await db.collection('pushDevices').where('uid','==',item.uid).get();
    const messages={ko:{'relationship-request':'새로운 공식 관계 제안이 도착했어요.','relationship-accepted':'상대가 관계 제안을 수락했어요.','relationship-declined':'관계 제안의 답변이 도착했어요.'},en:{'relationship-request':'A new relationship proposal has arrived.','relationship-accepted':'Your relationship proposal was accepted.','relationship-declined':'A response to your relationship proposal has arrived.'},ja:{'relationship-request':'新しい正式な関係の提案が届きました。','relationship-accepted':'関係の提案が承認されました。','relationship-declined':'関係の提案への返答が届きました。'}};
    for(const device of devices.docs){
      const value=device.data();
      try{await getMessaging().send({token:value.token,notification:{title:({ko:'서랍마을',en:'Drawer Village',ja:'引き出し村'})[value.language]||'Drawer Village',body:({'member-returned':{ko:'캐릭터가 내 마을로 돌아왔어요. 우편함에서 확인해 주세요.',en:'Your characters returned to your town. Check your mailbox.',ja:'キャラクターが自分の村に戻りました。郵便箱をご確認ください。'},'mail-received':{ko:'새 우편이 도착했어요.',en:'New mail has arrived.',ja:'新しい郵便が届きました。'},'schedule-request':{ko:'함께할 일정 제안이 도착했어요.',en:'A shared schedule proposal has arrived.',ja:'一緒に過ごす予定の提案が届きました。'},'schedule-accepted':{ko:'일정 제안이 수락되었어요.',en:'Your schedule proposal was accepted.',ja:'予定の提案が承認されました。'},'schedule-declined':{ko:'일정 제안의 답변이 도착했어요.',en:'A response to your schedule proposal has arrived.',ja:'予定の提案への返答が届きました。'},'residency-request':{ko:'새로운 입주·동거 제안이 도착했어요.',en:'A move-in or shared-home proposal has arrived.',ja:'入居・同居の提案が届きました。'},'residency-response':{ko:'입주·동거 제안의 답변이 도착했어요.',en:'A response to your residence proposal has arrived.',ja:'入居・同居の提案への返答が届きました。'}}[item.kind]?.[value.language])||(messages[value.language]||messages.ko)[item.kind]||'A new proposal has arrived.'},data:{groupId:item.groupId,proposalId:item.proposalId,eventId:event.params.eventId},android:{priority:'high',collapseKey:event.params.eventId,notification:{channelId:'relationships',tag:event.params.eventId}},apns:{headers:{'apns-collapse-id':event.params.eventId.slice(-64)}}})}
      catch(error){if(['messaging/registration-token-not-registered','messaging/invalid-registration-token'].includes(error.code))await device.ref.delete();else throw error}
    }
    await event.data.ref.update({deliveredAt:Date.now(),deviceCount:devices.size});
  });
return deliver;
};
