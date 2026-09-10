import {state,active,updateCharacter,save} from './state.js?v=20260909dev305';
import {DISCOVERY_FIELDS,DISCOVERY_AXES,discoveryLocked,createDiscoverySession,discoveryAnswer} from './character-discovery-rules.js?v=20260909dev305';
const session=createDiscoverySession();let pending=null,pendingCheck=null,worldKey='';
const t=(ko,en,ja)=>({ko,en,ja}[state.uiLanguage]||ko);
const close=()=>{pending?.close();pending?.remove();pending=null;pendingCheck=null};
const uid=()=>window.ParallelCityAuth?.getInfo?.()?.user?.uid;
export function sharedDiscoveryCharacter(groupId,id){
 const s=window.DrawerVillageGroups?.getSnapshot?.();if(!uid()||s?.activeGroupId!==groupId)return null;
 const r=s.residents?.find(r=>r.id===id);if(!r||r.ownerUid!==uid())return null;
 let profile;try{profile=typeof r.profileJson==='string'?JSON.parse(r.profileJson):r.profileJson||{}}catch{return null;}
 return {...profile,id:r.id,name:r.name,ownerUid:r.ownerUid};
}
export async function applyDiscoveryChoice(c,question,index,context={}){
 const current=context.groupId?sharedDiscoveryCharacter(context.groupId,c.id):state.characters[c.id];
 if(!current||(!context.groupId&&current!==c))throw Error('Character changed');
 const patch=discoveryAnswer(current,question,index);if(!patch)return false;
 if(context.groupId){await window.DrawerVillageGroups.saveResident({groupId:context.groupId,id:c.id,profile:{...current,...patch}});return true;}
 const before={...Object.fromEntries(Object.keys(patch).map(k=>[k,c[k]])),timelineResetAt:c.timelineResetAt};updateCharacter(c.id,patch,false);if(!save(true)){Object.assign(c,before);throw Error('Save failed')}return true;
}
export function showDiscovery(c,scene,question,context={}){
 if(pending)return;const account=uid(),d=document.createElement('dialog');pending=d;d.className='character-discovery-dialog';
 const valid=()=>account===uid()&&(context.groupId?!!sharedDiscoveryCharacter(context.groupId,c.id):state.characters[c.id]===c&&active()?.id===c.id&&!state.sharedContext);
 pendingCheck=valid;
 const heading=document.createElement('h2');heading.textContent=t('이런 일이 생긴다면?','What would they do?','こんなことが起きたら？');
 const art=document.createElement('div');art.className='discovery-animation '+question.animation;const symbol=document.createElement('span');symbol.textContent=question.icon;art.append(symbol);
 if(c.icon||c.photo){const image=document.createElement('img');image.src=c.icon||c.photo;image.alt=c.name;art.append(image)}
 const name=document.createElement('b');name.textContent=c.name;const prompt=document.createElement('h3');prompt.textContent=question.question[state.uiLanguage]||question.question.ko;
 const choices=document.createElement('div');choices.className='discovery-choices';const status=document.createElement('p');status.setAttribute('role','status');
 question.choices.forEach((choice,index)=>{const b=document.createElement('button');b.type='button';b.textContent=choice.text[state.uiLanguage]||choice.text.ko;b.onclick=async()=>{
  if(!valid()){close();return}choices.querySelectorAll('button').forEach(b=>b.disabled=true);status.textContent=t('선택을 저장하고 있어요…','Saving your choice…','選択を保存しています…');
  try{await applyDiscoveryChoice(c,question,index,context);if(pending===d)close();}catch{if(!valid()){close();return}choices.querySelectorAll('button').forEach(b=>b.disabled=false);status.textContent=t('저장하지 못했어요. 다시 선택해 주세요.','Could not save. Please choose again.','保存できませんでした。もう一度選んでください。');}
 };choices.append(b)});
 const hint=document.createElement('small');hint.textContent=t('선택이 쌓이면 이 캐릭터의 모습도 조금씩 달라져요. 잠근 설정은 그대로 유지돼요.','Their choices gradually shape who they are. Locked settings stay unchanged.','選択を重ねると、少しずつその人らしさが育ちます。固定した設定は変わりません。');
 const skip=document.createElement('button');skip.type='button';skip.textContent=t('지금은 넘기기','Skip for now','今は見送る');skip.onclick=close;d.append(heading,art,name,prompt,choices,hint,status,skip);d.onclose=()=>{d.remove();if(pending===d){pending=null;pendingCheck=null}};document.body.append(d);d.showModal();
}
export function considerDiscovery(c,scene,context={}){
 const key=(context.groupId||'personal')+':'+(uid()||'guest');if(key!==worldKey){worldKey=key;session.reset();close();}
 if(pendingCheck&&!pendingCheck())close();
 const info=window.ParallelCityAuth?.getInfo?.();if(!c||document.visibilityState==='hidden'||!['observe','home'].includes(state.activeTab)||info?.startupSyncing||info?.busy||(context.groupId&&!sharedDiscoveryCharacter(context.groupId,c.id))){session.reset();close();return;}
 const question=session.offer(c,scene,{blocked:!!document.querySelector('dialog[open]')});if(question)showDiscovery(c,scene,question,context);
}
export function bindDiscoveryLocks(){
 if(state.characterSettingsView!=='full')return;const c=active();if(!c||state.sharedContext&&c.ownerUid!==uid())return;
 const paint=()=>document.querySelectorAll('[data-discovery-lock]').forEach(b=>{const locked=discoveryLocked(c,b.dataset.discoveryLock);const label=locked?t('잠김','Locked','固定'):t('풀림','Unlocked','解除');
 b.innerHTML=(locked?'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 018 0v3M12 14v3"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6a4 4 0 018 0M12 14v3"/></svg>')+'<span>'+label+'</span>';b.title=locked?t('이 값으로 고정 · 눌러서 해제','Fixed at this value · click to unlock','この値で固定・押すと解除'):t('선택에 따라 변화 · 눌러서 고정','Changes through choices · click to lock','選択で変化・押すと固定');b.setAttribute('aria-label',label+' · '+b.title);b.setAttribute('aria-pressed',String(locked));});
 for(const field of DISCOVERY_FIELDS){const numeric=DISCOVERY_AXES[field].numeric;for(const control of document.querySelectorAll(`[data-field="${field}"]${numeric?`,[data-field="${numeric}"]`:''}`)){
  const parent=control.parentElement;if(parent.querySelector('[data-discovery-lock]'))continue;
  const title=parent.querySelector(':scope>b,:scope>legend');if(!title)continue;title.classList.add('discovery-title');const b=document.createElement('button');b.type='button';b.className='discovery-lock';b.dataset.discoveryLock=field;title.append(b);
  b.onclick=async e=>{e.preventDefault();e.stopPropagation();parent.querySelector('[data-lock-error]')?.remove();const before=c.discovery;c.discovery={...before,locks:{...before?.locks,[field]:!discoveryLocked(c,field)}};b.disabled=true;
   try{if(state.sharedContext){const gid=state.sharedContext.groupId;if(!sharedDiscoveryCharacter(gid,c.id))throw Error();await window.DrawerVillageGroups.saveResident({groupId:gid,id:c.id,profile:{...c}});}else if(!save(true))throw Error();}
   catch{c.discovery=before;let error=parent.querySelector('[data-lock-error]');if(!error){error=document.createElement('small');error.dataset.lockError='';error.setAttribute('role','status');parent.append(error);}error.textContent=t('저장하지 못했어요. 다시 눌러 주세요.','Could not save. Please try again.','保存できませんでした。もう一度お試しください。');}finally{b.disabled=false;paint();}
  };control.addEventListener('change',()=>queueMicrotask(paint));
 }}paint();
}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){session.reset();close()}});window.addEventListener('pagehide',()=>{session.reset();close()});
