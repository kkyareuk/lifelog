import {slotText} from './character-slots.js?v=20260909dev305';
import {state,emptyWorld,runIsolatedWorld,createCharacter} from './state.js?v=20260909dev305';
const pendingDrafts=new Map();
const t=(ko,en,ja)=>({ko,en,ja}[state.uiLanguage]||ko);
export function newSharedResidentInput(groupId,townId,name){
 return runIsolatedWorld(emptyWorld(),()=>{
  const id=createCharacter(),profile=structuredClone(state.characters[id]),home=structuredClone(state.homes[id]);
  profile.name=name.trim();profile.townId=townId;home.townId=townId;home.name=profile.name+'의 집';
  return {groupId,townId,id,profile,home,schedule:{routines:[],monthlyRoutines:[]}};
 });
}
export function showSharedResidentCreator(render){
 if(document.querySelector('[data-shared-create-dialog]'))return;
 const api=window.DrawerVillageGroups,s=api?.getSnapshot(),uid=window.ParallelCityAuth?.getInfo?.()?.user?.uid;
 if(!s?.activeGroupId||!uid)return;
 const groupId=s.activeGroupId,townId=s.selectedTownId||s.group?.towns?.[0]?.id;
 const dialog=document.createElement('dialog');dialog.className='directory-create-dialog';dialog.dataset.sharedCreateDialog='';
 const form=document.createElement('form'),title=document.createElement('h2'),label=document.createElement('label'),input=document.createElement('input'),help=document.createElement('p'),status=document.createElement('p'),submit=document.createElement('button'),cancel=document.createElement('button');
 title.textContent=t('새 캐릭터','New character','新しいキャラクター');label.textContent=t('이름','Name','名前');input.name='name';input.required=true;input.maxLength=40;
 help.textContent=t('이 멀티 마을에서 생활할 캐릭터를 만들어요. 캐릭터 슬롯 1개를 사용하며, 만든 뒤 성격과 외형을 설정할 수 있어요.','Create a character who lives in this multiplayer town. Uses one character slot; edit personality and appearance after creation.','このマルチの村で暮らすキャラクターを作成します。1枠を使用し、作成後に性格や外見を設定できます。');
 const manager=s.group?.ownerUid===uid||s.members?.some(m=>(m.uid||m.id)===uid&&['owner','manager','operator'].includes(m.role));if(!manager)help.textContent+=' '+t('일반 회원은 관리자나 방장의 승인이 필요해요.','Members need approval from a manager or the owner.','一般メンバーは管理者か村主の承認が必要です。');
 status.setAttribute('role','status');status.setAttribute('aria-live','polite');submit.type='submit';submit.textContent=manager?t('만들기','Create','作成'):t('생성 신청','Request creation','作成を申請');cancel.type='button';cancel.textContent=t('닫기','Close','閉じる');
 label.append(input);form.append(title,label,help,status,submit,cancel);dialog.append(form);document.body.append(dialog);
 const count=document.createElement('p');count.textContent=slotText(state,window.ParallelCityAuth?.getInfo?.()).text;help.after(count);api.refreshSlotUsage?.().then(v=>{if(dialog.isConnected)count.textContent=slotText(state,window.ParallelCityAuth?.getInfo?.(),v).text}).catch(()=>{});
 let pending=false,draft=pendingDrafts.get(uid+':'+groupId)||null;
 cancel.onclick=()=>dialog.close();dialog.onclose=()=>dialog.remove();
 form.onsubmit=async e=>{
  e.preventDefault();if(pending||!input.value.trim())return;
  if(api.getSnapshot().activeGroupId!==groupId||window.ParallelCityAuth?.getInfo?.()?.user?.uid!==uid){status.textContent=t('마을이나 계정이 바뀌었어요. 닫은 뒤 다시 열어 주세요.','Town or account changed. Close and reopen this window.','村またはアカウントが変わりました。閉じて開き直してください。');return}
  draft??=newSharedResidentInput(groupId,townId,input.value);pendingDrafts.set(uid+':'+groupId,draft);pending=true;input.disabled=true;submit.disabled=true;cancel.disabled=false;form.setAttribute('aria-busy','true');
  status.textContent=t('요청을 보내는 중이에요. 닫아도 처리는 계속돼요.','Sending your request. Processing continues if you close this window.','申請を送信中です。閉じても処理は続きます。');
  try{
   const result=await api.createResident(draft);pendingDrafts.delete(uid+':'+groupId);
   if(result.status==='pending'){status.textContent=t('생성 신청을 보냈어요. 관리자나 방장이 수락하면 나타나요.','Request sent. Your character will appear after a manager approves it.','作成申請を送りました。管理者の承認後に表示されます。');submit.hidden=true;return;}
   if(!dialog.isConnected)return;
   dialog.close();render();
  }catch(error){status.textContent=error.message||t('만들지 못했어요. 다시 시도해 주세요.','Could not create. Please retry.','作成できませんでした。再試行してください。');submit.textContent=t('다시 시도','Retry','再試行')}
  finally{pending=false;submit.disabled=false;cancel.disabled=false;form.removeAttribute('aria-busy')}
 };
 dialog.showModal();input.focus();
}
