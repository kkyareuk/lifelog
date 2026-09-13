import {state,save} from './state.js?v=20260909dev305';
const text=(ko,en,ja)=>({ko,en,ja}[state.uiLanguage]||ko);
export function giftError(error){
 const messages={
  'gift-daily-limit':['다른 이용자에게 보내는 선물은 계정당 하루 1개예요. 한국 시간 자정에 다시 보낼 수 있어요.','You can send one gift per account per day to another player. Resets at midnight in Korea.','他の利用者への贈り物はアカウントごとに1日1個です。韓国時間の午前0時にリセットされます。'],
  'gift-catalog-full':['내 사전이 가득 찼어요. 물품을 정리한 뒤 수락해 주세요.','Your dictionary is full. Free a slot before accepting.','自分の辞典がいっぱいです。枠を空けてから受け取ってください。'],
  'gift-sync-required':['내 사전을 동기화하지 못했어요. 다시 시도해 주세요.','Could not sync your dictionary. Please retry.','自分の辞典を同期できませんでした。再試行してください。']
 };return messages[error?.code||error?.message]?Error(text(...messages[error.code||error.message])):error;
}
export function giftStatus(gift){return gift?.status?text(...({pending:['수락 대기','Awaiting acceptance','受取待ち'],accepted:['사전에 추가됨','Added to dictionary','辞典に追加済み'],declined:['받지 않음','Declined','辞退済み']}[gift.status]||['','',''])):''}
export function bindGiftReceipt(dialog,mail,uid,render){
 if(!mail.gift?.status)return;
 const section=document.createElement('section'),status=document.createElement('p');section.className='mail-gift-receipt';status.className='mail-gift-status';const heading=document.createElement('strong');heading.textContent=text('도착한 선물','A gift for you','届いた贈り物');const item=document.createElement('div');item.className='mail-gift-item';const art=document.createElement('span');art.className='mail-gift-art';if(mail.gift.item?.image){const img=document.createElement('img');img.src=mail.gift.item.image;img.alt='';art.append(img)}else art.textContent='🎁';const name=document.createElement('b');name.textContent=mail.gift.item?.name||'';item.append(art,name);section.append(heading,item);status.textContent=giftStatus(mail.gift);section.append(status);dialog.querySelector('.mail-letter-content').append(section);
 if(mail.recipientUid!==uid||mail.gift.status!=='pending')return;
 const info=document.createElement('p');info.textContent=text('수락하면 내 개인 사전의 슬롯 1개를 사용해 추가해요. 거절하면 추가되지 않아요.','Accepting adds this item to your personal dictionary and uses one slot. Declining adds nothing.','受け取ると自分の個人辞典に追加され、枠を1つ使います。辞退すると追加されません。');section.append(info);
 const actions=document.createElement('div');actions.className='mail-gift-actions';section.append(actions);const buttons=[];
 for(const accept of [true,false]){const button=document.createElement('button');button.type='button';button.textContent=accept?text('수락하고 사전에 추가','Accept into my dictionary','受け取って辞典に追加'):text('거절','Decline','辞退');button.className=accept?'mail-gift-accept':'mail-gift-decline';buttons.push(button);actions.append(button);
 button.onclick=async()=>{buttons.forEach(b=>b.disabled=true);try{
  if(window.ParallelCityAuth?.getInfo?.()?.user?.uid!==uid)throw Error('Account changed');
  if(accept){const count=Object.entries(state.catalog).reduce((n,[kind,items])=>n+items.filter(i=>kind!=='fashion'||!i.ownerId).length,0);if(count>=80&&!state.catalog[mail.gift.kind]?.some(i=>i.id===mail.gift.item.id))throw Error('gift-catalog-full');if(!await window.ParallelCityAuth.upload({silent:true,reason:'선물 수락'}))throw Error('gift-sync-required')}
  const result=await window.DrawerVillageGroups.respondMailGift({groupId:mail.groupId,mailId:mail.id,accept});
  if(window.ParallelCityAuth?.getInfo?.()?.user?.uid!==uid)return;
  if(result.status==='accepted'){const {kind,item}=result.gift;state.catalog[kind]??=[];if(!state.catalog[kind].some(i=>i.id===item.id))state.catalog[kind].push(item);if(!await save(true))throw Error(text('기기에 저장하지 못했어요. 다시 시도해 주세요.','Could not save on this device. Please retry.','端末に保存できませんでした。再試行してください。'))}
  dialog.close();render();
 }catch(e){status.textContent=giftError(e).message;buttons.forEach(b=>b.disabled=false)}};
 }
}
