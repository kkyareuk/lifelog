import {state,emptyWorld,runIsolatedWorld,createCharacter} from './state.js?v=20260909dev305';
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
 status.setAttribute('role','status');status.setAttribute('aria-live','polite');submit.type='submit';submit.textContent=t('만들기','Create','作成');cancel.type='button';cancel.textContent=t('닫기','Close','閉じる');
 label.append(input);form.append(title,label,help,status,submit,cancel);dialog.append(form);document.body.append(dialog);
 let pending=false,draft=null;
 cancel.onclick=()=>dialog.close();dialog.oncancel=e=>{if(pending)e.preventDefault()};dialog.onclose=()=>dialog.remove();
 form.onsubmit=async e=>{
  e.preventDefault();if(pending||!input.value.trim())return;
  if(api.getSnapshot().activeGroupId!==groupId||window.ParallelCityAuth?.getInfo?.()?.user?.uid!==uid){status.textContent=t('마을이나 계정이 바뀌었어요. 닫은 뒤 다시 열어 주세요.','Town or account changed. Close and reopen this window.','村またはアカウントが変わりました。閉じて開き直してください。');return}
  draft??=newSharedResidentInput(groupId,townId,input.value);pending=true;input.disabled=true;submit.disabled=true;cancel.disabled=true;form.setAttribute('aria-busy','true');
  status.textContent=t('캐릭터를 만드는 중이에요. 잠시 기다리면 나타나요.','Creating your character. Please wait for it to appear.','キャラクターを作成中です。表示されるまで少しお待ちください。');
  try{
   const result=await api.createResident(draft);
   // Wait for the authoritative subscription, rather than inserting an incomplete resident.
   const ready=()=>{const snapshot=api.getSnapshot(),resident=snapshot.residents?.find(r=>r.id===result.id);return resident&&snapshot.homes?.some(h=>h.id===(resident.sharedHomeId||result.id))};
   const deadline=Date.now()+20000;
   while(api.getSnapshot().activeGroupId===groupId&&!ready()&&Date.now()<deadline)await new Promise(resolve=>setTimeout(resolve,200));
   if(api.getSnapshot().activeGroupId!==groupId)throw Error(t('캐릭터는 원래 선택한 멀티 마을에 만들어졌어요.','Your character was created in the originally selected town.','キャラクターは最初に選んだ村に作成されました。'));
   if(!ready())throw Error(t('생성은 완료됐지만 목록을 불러오지 못했어요. 다시 시도하면 같은 캐릭터를 확인해요.','Created, but the list has not loaded. Retry to check the same character.','作成済みですが一覧を読み込めませんでした。再試行で同じキャラクターを確認します。'));
   state.activeTab='character';state.characterSettingsView='hub';location.hash='tab=character';dialog.close();render();state.activeId=result.id;render();
  }catch(error){status.textContent=error.message||t('만들지 못했어요. 다시 시도해 주세요.','Could not create. Please retry.','作成できませんでした。再試行してください。');submit.textContent=t('다시 시도','Retry','再試行')}
  finally{pending=false;submit.disabled=false;cancel.disabled=false;form.removeAttribute('aria-busy')}
 };
 dialog.showModal();input.focus();
}
