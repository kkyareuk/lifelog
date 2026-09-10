import {state,active,updateCharacter,save} from './state.js?v=20260909dev305';
import {DISCOVERY_FIELDS,DISCOVERY_AXES,discoveryLocked,createDiscoverySession,discoveryAnswer} from './character-discovery-rules.js?v=20260909dev305';
const session=createDiscoverySession();let pending=null,pendingCheck=null;
const t=(ko,en,ja)=>({ko,en,ja}[state.uiLanguage]||ko);
const close=()=>{pending?.close();pending?.remove();pending=null;pendingCheck=null};
export function showDiscovery(c,scene,question){
 if(pending)return;const account=window.ParallelCityAuth?.getInfo?.()?.user?.uid,character=c,lang=state.uiLanguage||'ko';
 const d=document.createElement('dialog');pending=d;d.className='character-discovery-dialog';const header=document.createElement('header'),title=document.createElement('h2');title.textContent=t('조금 더 알아가는 순간','A moment to learn more','少しずつ知っていく瞬間');header.append(title);
 const art=document.createElement('div');art.className='discovery-animation '+question.animation;const symbol=document.createElement('span');symbol.textContent=question.icon;art.append(symbol);const image=c.icon||c.photo;if(image){const img=document.createElement('img');img.src=image;img.alt=c.name;art.append(img)}
 const name=document.createElement('b');name.textContent=c.name;const context=document.createElement('p');context.className='discovery-context';context.textContent=scene.title;const prompt=document.createElement('h3');prompt.textContent=question.question[lang]||question.question.ko;const choices=document.createElement('div');choices.className='discovery-choices';const status=document.createElement('p');status.setAttribute('role','status');
 const valid=()=>state.characters[c.id]===character&&account===window.ParallelCityAuth?.getInfo?.()?.user?.uid&&!state.sharedContext&&!discoveryLocked(c,question.field);
 pendingCheck=valid;
 question.choices.forEach((choice,index)=>{const b=document.createElement('button');b.type='button';b.textContent=choice.text[lang]||choice.text.ko;b.onclick=()=>{if(!valid()){close();return;}const patch=discoveryAnswer(c,question,index);if(!patch){close();return;}const old={...Object.fromEntries(Object.keys(patch).map(key=>[key,c[key]])),timelineResetAt:c.timelineResetAt};updateCharacter(c.id,patch,false);if(!save(true)){Object.assign(c,old);status.textContent=t('저장하지 못했어요. 다시 선택해 주세요.','Could not save. Please choose again.','保存できませんでした。もう一度選んでください。');return;}close();};choices.append(b)});
 const hint=document.createElement('small');hint.textContent=t('답할 때마다 성향이 조금씩 달라져 다음 로그에 반영돼요. 넘기면 바뀌지 않아요. 전체설정에서 직접 바꾸거나 고정할 수 있어요.','Each answer gradually shifts traits used in future logs. Skipping changes nothing. Edit or lock traits in full settings.','答えるたびに傾向が少しずつ変わり、以後のログに反映されます。見送ると変わりません。全設定で変更・固定できます。');const skip=document.createElement('button');skip.type='button';skip.textContent=t('지금은 넘기기','Skip for now','今は見送る');skip.onclick=close;d.append(header,art,name,context,prompt,choices,hint,status,skip);d.onclose=()=>{d.remove();if(pending===d)pending=null;pendingCheck=null};document.body.append(d);d.showModal();
}
export function considerDiscovery(c,scene){
 if(pendingCheck&&!pendingCheck())close();
 const info=window.ParallelCityAuth?.getInfo?.();if(!c||state.sharedContext||window.DrawerVillageGroups?.getSnapshot?.()?.activeGroupId||document.visibilityState==='hidden'||!['observe','home'].includes(state.activeTab)||info?.startupSyncing||info?.busy){session.reset();close();return;}
 const question=session.offer(c,scene,{blocked:!!document.querySelector('dialog[open]')});if(!question)return;
 const old=c.discovery;c.discovery={...old,lastPromptAt:Date.now()};if(!save(true)){c.discovery=old;return;}showDiscovery(c,scene,question);
}
export function bindDiscoveryLocks(){
 if(state.characterSettingsView!=='full'||state.sharedContext)return;const c=active();if(!c)return;
 const aliases=Object.fromEntries(Object.entries(DISCOVERY_AXES).filter(([,a])=>a.numeric).map(([f,a])=>[a.numeric,f]));
 const paintAll=()=>document.querySelectorAll('[data-discovery-lock]').forEach(b=>{
  const fields=b.dataset.discoveryLock.split(','),locked=fields.every(f=>discoveryLocked(c,f));
  const label=locked?t('설정 고정됨 · 눌러서 해제','Settings locked · click to unlock','設定は固定中・押すと解除'):t('플레이로 변화 중 · 눌러서 고정','Shaped by play · click to lock','プレイで変化中・押すと固定');
  b.innerHTML=locked?'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 018 0v3M12 14v3"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 018 0M12 14v3"/></svg>';b.title=label;b.setAttribute('aria-label',label);b.setAttribute('aria-pressed',String(locked));
 });
 const add=(parent,fields)=>{if(!fields.length||parent.querySelector(':scope > [data-discovery-lock]'))return;
  const b=document.createElement('button');b.type='button';b.dataset.discoveryLock=[...new Set(fields)].join(',');b.className='discovery-lock';
  b.onclick=e=>{e.preventDefault();e.stopPropagation();const before=c.discovery,locked=fields.every(f=>discoveryLocked(c,f));c.discovery={...before,locks:{...before?.locks,...Object.fromEntries(fields.map(f=>[f,!locked]))}};if(!save(true)){c.discovery=before;return;}if(pendingCheck&&!pendingCheck())close();paintAll();};parent.append(b);
 };
 for(const field of DISCOVERY_FIELDS){const numeric=DISCOVERY_AXES[field].numeric;for(const control of document.querySelectorAll(`[data-field="${field}"]${numeric?`,[data-field="${numeric}"]`:''}`)){
  add(control.parentElement,[field]);control.addEventListener('change',()=>queueMicrotask(paintAll));
 }}
 for(const fold of document.querySelectorAll('.character-field-fold')){const fields=[...fold.querySelectorAll('[data-field]')].map(e=>aliases[e.dataset.field]||e.dataset.field).filter(f=>DISCOVERY_FIELDS.includes(f));add(fold.querySelector('summary'),fields);}
 for(const slot of document.querySelectorAll('[data-discovery-global-lock]'))add(slot,DISCOVERY_FIELDS);
 paintAll();
}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){session.reset();close()}});window.addEventListener('pagehide',()=>{session.reset();close()});
