import {state,save,updateCharacter} from './state.js?v=20260909dev305';
import {AUTONOMOUS_ACTIVITIES} from './autonomous-activities.js?v=20260909dev305';
import {sharedDiscoveryCharacter} from './character-discovery.js?v=20260909dev305';
const labels={ko:['금지행동 설정','체크한 행동은 스스로 시작하지 않아요. 직접 지시한 행동과 일정, 수면·식사 같은 필수 행동은 유지해요.','저장','닫기','저장하지 못했어요. 다시 시도해 주세요.'],en:['Restricted activities','Checked activities will not start on their own. Commands, schedules and essentials such as sleep and meals remain available.','Save','Close','Could not save. Please try again.'],ja:['禁止する自発行動','チェックした行動は自分から始めません。指示・予定や睡眠・食事などの必須行動は続けます。','保存','閉じる','保存できませんでした。再度お試しください。']};
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-activity-settings]');if(!b)return;
 const id=b.dataset.activitySettings,groupId=b.dataset.groupId||'',uid=window.ParallelCityAuth?.getInfo?.()?.user?.uid;
 const current=()=>groupId?sharedDiscoveryCharacter(groupId,id):state.characters[id],c=current();if(!c)return;
 const text=labels[state.uiLanguage]||labels.ko,d=document.createElement('dialog');d.className='character-discovery-dialog';
 const h=document.createElement('h2');h.textContent=text[0];const p=document.createElement('p');p.textContent=text[1];d.append(h,p);const selected=new Set(c.autonomousActivityBlocks||[]);
 for(const [key,names] of Object.entries(AUTONOMOUS_ACTIVITIES)){const row=document.createElement('label');row.className='discovery-group-lock';const box=document.createElement('input');box.type='checkbox';box.checked=selected.has(key);box.onchange=()=>box.checked?selected.add(key):selected.delete(key);row.append(box,document.createTextNode(names[{ko:0,en:1,ja:2}[state.uiLanguage]||0]));d.append(row)}
 const status=document.createElement('p'),done=document.createElement('button'),close=document.createElement('button');done.textContent=text[2];close.textContent=text[3];close.onclick=()=>d.close();done.onclick=async()=>{done.disabled=true;try{if(uid!==window.ParallelCityAuth?.getInfo?.()?.user?.uid||!current())throw Error();const patch={autonomousActivityBlocks:[...selected]};if(groupId)await window.DrawerVillageGroups.saveResident({groupId,id,profile:{...current(),...patch}});else{const before=current().autonomousActivityBlocks;updateCharacter(id,patch,false);if(!save(true)){current().autonomousActivityBlocks=before;throw Error();}}d.close()}catch{status.textContent=text[4]}finally{done.disabled=false}};d.append(status,done,close);d.onclose=()=>d.remove();document.body.append(d);d.showModal();
});
