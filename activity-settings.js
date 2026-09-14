import {lifeSettingsFields} from './life-settings.js';
import {state,save,updateCharacter} from './state.js?v=20260909dev305';
import {AUTONOMOUS_ACTIVITIES,ACTIVITY_SECTIONS} from './autonomous-activities.js?v=20260909dev305';
import {sharedDiscoveryCharacter} from './character-discovery.js?v=20260909dev305';
const labels={ko:['금지행동 설정','체크한 행동은 스스로 시작하지 않아요. 직접 지시한 행동과 등록한 일정은 유지해요.','저장','닫기','저장하지 못했어요. 다시 시도해 주세요.'],en:['Restricted activities','Checked activities will not start on their own. Direct commands and scheduled activities remain available.','Save','Close','Could not save. Please try again.'],ja:['禁止する自発行動','チェックした行動は自分から始めません。直接の指示と登録した予定は続けます。','保存','閉じる','保存できませんでした。再度お試しください。']};
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-activity-settings]');if(!b)return;
 const id=b.dataset.activitySettings,groupId=b.dataset.groupId||'',uid=window.ParallelCityAuth?.getInfo?.()?.user?.uid;
 const current=()=>groupId?sharedDiscoveryCharacter(groupId,id):state.characters[id],c=current();if(!c)return;
 const text=labels[state.uiLanguage]||labels.ko,d=document.createElement('dialog');d.className='character-discovery-dialog';
 const h=document.createElement('h2');h.textContent=text[0];const p=document.createElement('p');p.textContent=text[1];d.append(h,p);const selected=new Set(c.autonomousActivityBlocks||[]);
 const languageIndex={ko:0,en:1,ja:2}[state.uiLanguage]||0;
 for(const section of ACTIVITY_SECTIONS){
  const group=document.createElement('fieldset');group.className='activity-settings-section';
  const legend=document.createElement('legend');legend.textContent=section.names[languageIndex];group.append(legend);
  for(const key of section.keys){const row=document.createElement('label');row.className='discovery-group-lock';const box=document.createElement('input');box.type='checkbox';box.value=key;box.checked=selected.has(key);box.onchange=()=>box.checked?selected.add(key):selected.delete(key);row.append(box,document.createTextNode(AUTONOMOUS_ACTIVITIES[key][languageIndex]));group.append(row)}
  d.append(group);
 }
 const life=lifeSettingsFields(c,state.uiLanguage);d.prepend(life.root);
 const status=document.createElement('p'),done=document.createElement('button'),close=document.createElement('button');done.textContent=text[2];close.textContent=text[3];close.onclick=()=>d.close();done.onclick=async()=>{done.disabled=true;try{if(uid!==window.ParallelCityAuth?.getInfo?.()?.user?.uid||!current())throw Error();const patch={...life.patch(current()),autonomousActivityBlocks:[...selected]};if(groupId)await window.DrawerVillageGroups.saveResident({groupId,id,profile:{...current(),...patch}});else{const before=Object.fromEntries(Object.keys(patch).map(key=>[key,current()[key]]));updateCharacter(id,patch,false);if(!save(true)){Object.assign(current(),before);throw Error();}}d.close()}catch{status.textContent=text[4]}finally{done.disabled=false}};d.append(status,done,close);d.onclose=()=>d.remove();document.body.append(d);d.showModal();
});
