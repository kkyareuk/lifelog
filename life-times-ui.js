import {withSharedWorld} from './shared-world.js';
import {state,active,save,touchCharacterTimelines} from './state.js?v=20260909dev305';
import {minute} from './weekly-timetable.js';
export function bindLifeTimes(render){
 const scroll=document.querySelector(".timetable-scroll");if(scroll)scroll.scrollTop=6*48;
 document.querySelectorAll('[data-timetable-detail]:not([data-edit-routine])').forEach(b=>b.onclick=()=>{const d=document.createElement('dialog');d.className='timetable-detail';const p=document.createElement('p');p.textContent=b.dataset.timetableDetail;const close=document.createElement('button');close.textContent='×';close.onclick=()=>d.close();d.append(p,close);d.onclose=()=>d.remove();document.body.append(d);d.showModal()});
 const button=document.querySelector('[data-life-times]');if(!button)return;
 button.onclick=()=>{
  const openedSnapshot=window.DrawerVillageGroups?.getSnapshot?.(),groupId=openedSnapshot?.activeGroupId,c=groupId?withSharedWorld(openedSnapshot,()=>active()):active(),lang=state.uiLanguage||'ko',text={ko:['생활 시간 설정','기상','취침','점심 시작','점심 종료','저장','시각을 확인해 주세요. 점심 종료는 시작보다 늦어야 해요.','저장하지 못했어요. 다시 시도해 주세요.'],en:['Daily times','Wake','Bedtime','Lunch starts','Lunch ends','Save','Check the times. Lunch must end after it starts.','Could not save. Please retry.'],ja:['生活時間','起床','就寝','昼食の開始','昼食の終了','保存','時刻を確認してください。昼食の終了は開始より後にしてください。','保存できませんでした。再試行してください。']}[lang];
  const d=document.createElement('dialog');d.className='career-dialog';const f=document.createElement('form');f.className='career-body';const h=document.createElement('h2');h.textContent=text[0];f.append(h);
  const fields=['wake','sleep','lunchStart','lunchEnd'],defaults=['07:00','23:00','12:00','13:00'];
  fields.forEach((key,i)=>{const l=document.createElement('label');l.textContent=text[i+1];const input=document.createElement('input');input.type='time';input.name=key;input.required=true;input.value=c[key]||defaults[i];l.append(input);f.append(l)});
  const status=document.createElement('p'),submit=document.createElement('button'),close=document.createElement('button');submit.textContent=text[5];close.textContent='×';close.type='button';close.onclick=()=>d.close();f.append(status,submit,close);d.append(f);d.onclose=()=>d.remove();document.body.append(d);d.showModal();
  f.onsubmit=async e=>{e.preventDefault();const patch=Object.fromEntries(fields.map(k=>[k,f.elements.namedItem(k).value]));if(fields.some(k=>minute(patch[k])===null)||minute(patch.lunchEnd)<=minute(patch.lunchStart)){status.textContent=text[6];return}
   const prior=Object.fromEntries(fields.map(k=>[k,c[k]]));submit.disabled=true;
   try{const api=window.DrawerVillageGroups,snapshot=api?.getSnapshot?.();if((snapshot?.activeGroupId||'')!==(groupId||''))throw Error('context');if(snapshot?.activeGroupId){const record=snapshot.residents.find(r=>r.id===c.id);if(record?.ownerUid!==window.ParallelCityAuth?.getInfo?.()?.user?.uid)throw Error('owner');const profile={...JSON.parse(record.profileJson||'{}'),...patch};await api.saveResident({groupId:snapshot.activeGroupId,id:c.id,profile});record.profileJson=JSON.stringify(profile)}Object.assign(c,patch);if(!groupId)touchCharacterTimelines([c.id]);if(!snapshot?.activeGroupId&&!await save(true))throw Error('save');d.close();render()}catch{Object.assign(c,prior);status.textContent=text[7];submit.disabled=false}
  };
 };
}
