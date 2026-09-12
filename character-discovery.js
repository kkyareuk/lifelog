import {fitFeedbackPanel} from './discovery-feedback.js';
import {timeOperation} from './performance-diagnostics.js?v=20260909dev305';
import {repeatDiscoveryCandidates} from './character-discovery-rules.js?v=20260909dev305';
import {rememberScene,storyQuestions} from './story-events.js?v=20260909dev305';
import {FORM_FIELDS} from './discovery-records.js?v=20260909dev305';
import {recordEditor} from './discovery-records-ui.js?v=20260909dev305';
import {state,active,updateCharacter,save,saveDiscoveryPatch} from './state.js?v=20260909dev305';
import {fixedDiscoveryKnown,DISCOVERY_FIELDS,DISCOVERY_AXES,discoveryChoices,discoveryLocked,createDiscoverySession,discoveryAnswer,discoveryCandidates,discoveryWait,discoveryMetric} from './character-discovery-rules.js?v=20260909dev305';
const session=createDiscoverySession();let pending=null,pendingCheck=null,worldKey='';
const t=(ko,en,ja)=>({ko,en,ja}[state.uiLanguage]||ko);
const close=()=>{pending?.close();pending?.remove();pending=null;pendingCheck=null};
export const observedCharacterId=()=>document.querySelector('[data-observed-character]')?.dataset.observedCharacter||active()?.id;
const uid=()=>window.ParallelCityAuth?.getInfo?.()?.user?.uid;
export function sharedDiscoveryCharacter(groupId,id){
 const s=window.DrawerVillageGroups?.getSnapshot?.();if(!uid()||s?.activeGroupId!==groupId)return null;
 const r=s.residents?.find(r=>r.id===id);if(!r||r.ownerUid!==uid())return null;
 let profile;try{profile=typeof r.profileJson==='string'?JSON.parse(r.profileJson):r.profileJson||{}}catch{return null;}
 let life;try{life=JSON.parse(r.lifeJson||'{}')}catch{life={}}return {...profile,storyMemory:life.storyMemory||profile.storyMemory,storyDays:life.storyDays||profile.storyDays,id:r.id,name:r.name,ownerUid:r.ownerUid};
}
export async function applyDiscoveryChoice(c,question,index,context={}){
 const current=context.groupId?sharedDiscoveryCharacter(context.groupId,c.id):state.characters[c.id];
 if(!current||(!context.groupId&&current!==c))throw Error('Character changed');
 if(question.story&&!storyQuestions(current,context.groupId?Object.fromEntries((window.DrawerVillageGroups.getSnapshot().residents||[]).map(r=>[r.id,r])):state.characters).some(q=>q.id===question.id))return false;
 const patch=discoveryAnswer(current,question,index,Date.now(),context.selectedValue);if(!patch)return false;
 if(context.groupId){await window.DrawerVillageGroups.saveResident({groupId:context.groupId,id:c.id,profile:{...current,...patch}});return true;}
 return saveDiscoveryPatch(c.id,patch);
}
export function showDiscovery(c,scene,question,context={}){
 if(pending)return;const account=uid(),d=document.createElement('dialog');pending=d;d.className='character-discovery-dialog';
 const valid=()=>account===uid()&&(context.groupId?!!sharedDiscoveryCharacter(context.groupId,c.id)&&observedCharacterId()===c.id:state.characters[c.id]===c&&observedCharacterId()===c.id&&!state.sharedContext);
 pendingCheck=valid;
 const heading=document.createElement('h2');heading.textContent=question.story?t('그날 이후의 이야기','After that day','あの日からの物語'):t('이런 일이 생긴다면?','What would they do?','こんなことが起きたら？');
 const art=document.createElement('div');art.className='discovery-animation reaction-'+question.animation;const symbol=document.createElement('span');symbol.textContent=question.icon;art.append(symbol);if(question.id==='spill'){art.classList.add('discovery-spill');symbol.className='discovery-spill-cup';const splash=document.createElement('i');splash.textContent='💧';splash.className='discovery-spill-drop';const reaction=document.createElement('b');reaction.textContent='!';reaction.className='discovery-spill-startle';art.append(splash,reaction);}
 if(c.icon||c.photo){const image=document.createElement('img');image.src=c.icon||c.photo;image.alt=c.name;art.append(image)}
 const name=document.createElement('b');name.textContent=c.name;const prompt=document.createElement('h3');prompt.textContent=question.question[state.uiLanguage]||question.question.ko;
 const editor=question.form?recordEditor(c,question.form,state.uiLanguage,discoveryLocked):null;
 let select=null;if(question.options){
 select=document.createElement('select');select.setAttribute('aria-label',prompt.textContent);const blank=document.createElement('option');blank.value='';blank.textContent=t('선택해 주세요','Choose an option','選んでください');select.append(blank);
 for(const option of question.options){const o=document.createElement('option');o.value=option.value;o.textContent=option.text[state.uiLanguage]||option.text.ko;select.append(o);}
 const parts=prompt.textContent.split(/\[(?:선택|select|選択)\]/);prompt.replaceChildren(document.createTextNode(parts[0]),select,document.createTextNode(parts[1]||''));}
 const choices=document.createElement('div');choices.className='discovery-choices';const status=document.createElement('p');status.setAttribute('role','status');
 discoveryChoices(c,question).forEach(({choice,index})=>{const b=document.createElement('button');b.type='button';b.textContent=choice.text[state.uiLanguage]||choice.text.ko;b.onclick=async()=>{
  let selectedValue;try{selectedValue=editor?editor.read():select?.value;}catch{status.textContent=t('입력한 내용을 확인해 주세요.','Please check the entered information.','入力内容を確認してください。');return;}if(select&&!select.value){select.focus();return;}if(!valid()){close();return}choices.querySelectorAll('button').forEach(b=>b.disabled=true);status.textContent=t('선택을 저장하고 있어요…','Saving your choice…','選択を保存しています…');
  try{await new Promise(resolve=>requestAnimationFrame(()=>setTimeout(resolve,0)));if(!await applyDiscoveryChoice(c,question,index,{...context,selectedValue}))throw Error('Settings changed');if(pending===d)close();}catch{if(select&&!select.value){select.focus();return;}if(!valid()){close();return}choices.querySelectorAll('button').forEach(b=>b.disabled=false);status.textContent=t('저장하지 못했어요. 다시 선택해 주세요.','Could not save. Please choose again.','保存できませんでした。もう一度選んでください。');}
 };choices.append(b)});
 const hint=document.createElement('small');hint.textContent=(question.options||question.form)?t('고른 정보가 캐릭터 설정에 저장돼요. 답한 질문은 다시 나오지 않아요.','Your chosen information is saved to the character. Answered questions do not return.','選んだ情報をキャラクター設定に保存します。回答済みの質問は再び出ません。'):t('선택이 쌓이면 이 캐릭터의 모습도 조금씩 달라져요. 잠근 설정은 그대로 유지돼요.','Their choices gradually shape who they are. Locked settings stay unchanged.','選択を重ねると、少しずつその人らしさが育ちます。固定した設定は変わりません。');
 const feedback=document.createElement('button');feedback.type='button';feedback.dataset.discoveryFeedback='';feedback.textContent=t('캐릭터스러운 답이 없어요!','None of these answers fit my character!','このキャラらしい答えがありません！');
 fitFeedbackPanel({button:feedback,question,answers:[...choices.querySelectorAll('button')].map(b=>b.textContent),language:state.uiLanguage,valid,status,selectedOption:()=>select?{value:select.value,text:select.selectedOptions[0]?.textContent||''}:null,submit:data=>window.ParallelCityAuth.submitFeedback({category:'discovery-answer-fit',message:JSON.stringify({...data,build:'377',group:!!context.groupId}),allowReply:false})});
 const skip=document.createElement('button');skip.type='button';skip.textContent=t('지금은 넘기기','Skip for now','今は見送る');skip.onclick=close;d.append(heading,art,name,prompt);if(editor)d.append(editor.root);d.append(choices,hint,feedback,status,skip);d.onclose=()=>{d.remove();if(pending===d){pending=null;pendingCheck=null}};document.body.append(d);timeOperation('question-modal',()=>d.showModal());
}
let requestTimer=null;
export function considerDiscovery(c,scene,context={}){
 if(!context.groupId&&c&&state.characters[c.id]===c&&rememberScene(c,scene))save(false,false);

 if(pendingCheck&&!pendingCheck())close();
 document.querySelector('[data-discovery-tools]')?.remove();clearTimeout(requestTimer);
 document.querySelectorAll('[data-discovery-locks-menu]').forEach(b=>b.onclick=()=>showDiscoveryGroups(c,context));
 const info=window.ParallelCityAuth?.getInfo?.();
 if(!c||document.visibilityState==='hidden'||!['observe','home'].includes(state.activeTab)||info?.startupSyncing||(context.groupId&&!sharedDiscoveryCharacter(context.groupId,c.id)))return;
 const rail=document.querySelector('.game-hud-side-right,[data-web-discovery-rail]'),stats=rail?.querySelector('[data-tab=statistics]');if(!rail||!stats)return;
 const bar=document.createElement('div');bar.dataset.discoveryTools='';bar.className='discovery-rail-item';
 const button=document.createElement('button');button.type='button';button.className='game-hud-button discovery-rail-button';const icon=document.createElement('i');icon.className='discovery-question-icon';icon.setAttribute('aria-hidden','true');const label=document.createElement('em');button.append(icon,label);if(rail.matches('[data-web-discovery-rail]')){const caption=document.createElement('span');caption.textContent=t('질문받기','Get a question','質問を受ける');button.append(caption);}
 const storageKey='drawer-discovery-request:'+String(uid()||'guest');
 const last=()=>{try{return Number(localStorage.getItem(storageKey)||0)}catch{return 0}};
 const paint=()=>{if(!bar.isConnected)return;const wait=discoveryWait(last());button.disabled=wait>0;label.textContent=`${Math.floor(Math.ceil(wait/1000)/60)}:${String(Math.ceil(wait/1000)%60).padStart(2,'0')}`;label.className='discovery-countdown';button.setAttribute('aria-label',t('질문받기','Get a question','質問を受ける')+(wait>0?` (${Math.ceil(wait/60000)} min)`:''));button.title=c.name+' · '+t('10분마다 질문 하나','One question every 10 minutes','10分ごとに質問を1つ');requestTimer=setTimeout(paint,1000);};
 button.onclick=()=>timeOperation('question-open',()=>{if(pending||document.querySelector('dialog[open]')||discoveryWait(last()))return;const id=observedCharacterId();const current=context.groupId?sharedDiscoveryCharacter(context.groupId,id):state.characters[id];if(!current)return;
 const people=context.groupId?Object.fromEntries((window.DrawerVillageGroups.getSnapshot().residents||[]).map(r=>[r.id,r])):state.characters;const events=storyQuestions(current,people).filter(q=>discoveryChoices(current,q).some(({choice})=>Object.keys(choice.targets).some(f=>!discoveryLocked(current,f))));let candidates=events.length?events:discoveryCandidates(current,{title:'질문받기'});if(!candidates.length){const again=repeatDiscoveryCandidates(current);candidates=again.filter(q=>!current.discovery?.recent?.includes(q.id));if(!candidates.length)candidates=again;}if(!candidates.length){if(DISCOVERY_FIELDS.every(f=>discoveryLocked(current,f)))showDiscoveryGroups(current,context);else{const message=document.createElement('dialog');message.className='character-discovery-dialog';const text=document.createElement('p');text.textContent=t('지금 바꿀 수 있는 설정이 잠겨 있어요. 전체설정에서 바꾸고 싶은 항목의 잠금을 풀면 질문을 받을 수 있어요.','The available settings are locked. Unlock a setting in full settings to receive questions.','変更できる設定がロックされています。詳細設定で変更したい項目のロックを外すと質問を受けられます。');const done=document.createElement('button');done.textContent=t('닫기','Close','閉じる');done.onclick=()=>message.close();message.append(text,done);message.onclose=()=>message.remove();document.body.append(message);message.showModal();}return;}
 try{localStorage.setItem(storageKey,String(Date.now()));}catch{label.textContent=t('저장 공간을 확인해 주세요','Please check storage','保存領域を確認してください');return;}
 showDiscovery(current,scene||{},candidates[Math.floor(Math.random()*candidates.length)],context);clearTimeout(requestTimer);paint();});
 bar.append(button);rail.insertBefore(bar,stats);paint();
}
function showDiscoveryGroups(c,context){
 if(!c)return;
 const groups=[
  [t('성격·감정·행동','Personality, emotions & behavior','性格・感情・行動'),DISCOVERY_FIELDS.filter(f=>DISCOVERY_AXES[f])],
  [t('기본 정보·취향','Identity & preferences','基本情報・好み'),DISCOVERY_FIELDS.filter(f=>!DISCOVERY_AXES[f]&&!f.startsWith('bodyProfile.'))],
  [t('외형·신체','Appearance & body','外見・身体'),DISCOVERY_FIELDS.filter(f=>f.startsWith('bodyProfile.')&&!/health|hospital|medication/.test(f))],
  [t('건강·병원·복용약','Health, visits & medication','健康・通院・服薬'),DISCOVERY_FIELDS.filter(f=>/health|hospital|medication/.test(f))]
 ];
 const d=document.createElement('dialog');d.className='character-discovery-dialog';const title=document.createElement('h2');title.textContent=t('분류별 설정 잠금','Lock settings by category','分類ごとの設定固定');d.append(title);
 const help=document.createElement('p');help.textContent=t('성향은 잠금을 선택할 수 있어요. 이미 정한 기본 정보와 신체·외형은 전체설정에서만 바꿀 수 있어요.','You can lock personality traits. Once set, identity and physical details can only be changed in full settings.','性格の傾向は固定を選べます。設定済みの基本情報や身体・外見は詳細設定でのみ変更できます。');d.append(help);const changes=new Map();
 for(const [name,fields] of groups){if(!fields.length)continue;const row=document.createElement('label');row.className='discovery-group-lock';const input=document.createElement('input');input.type='checkbox';const n=fields.filter(f=>discoveryLocked(c,f)).length;input.checked=n===fields.length;input.indeterminate=n>0&&n<fields.length;const copy=document.createTextNode(name+` (${n}/${fields.length})`);row.append(input,copy);input.onchange=()=>{fields.forEach(f=>changes.set(f,input.checked));copy.textContent=name+` (${input.checked?fields.length:0}/${fields.length})`;};d.append(row);}
 const status=document.createElement('p'),saveButton=document.createElement('button');saveButton.textContent=t('저장','Save','保存');saveButton.onclick=async()=>{saveButton.disabled=true;const current=context.groupId?sharedDiscoveryCharacter(context.groupId,c.id):state.characters[c.id];if(!current){d.close();return;}const before=current.discovery,next={...before,locks:{...before?.locks,...Object.fromEntries(changes)}};try{if(context.groupId)await window.DrawerVillageGroups.saveResident({groupId:context.groupId,id:c.id,profile:{...current,discovery:next}});else{current.discovery=next;if(!save(true)){current.discovery=before;throw Error();}}d.close();bindDiscoveryLocks();}catch{status.textContent=t('저장하지 못했어요. 다시 시도해 주세요.','Could not save. Please try again.','保存できませんでした。再度お試しください。');saveButton.disabled=false;}};
 const cancel=document.createElement('button');cancel.textContent=t('닫기','Close','閉じる');cancel.onclick=()=>d.close();d.append(status,saveButton,cancel);d.onclose=()=>d.remove();document.body.append(d);d.showModal();
}
export function bindDiscoveryLocks(){
 if(state.characterSettingsView!=='full')return;const c=active();if(!c||state.sharedContext&&c.ownerUid!==uid())return;
 const groupFields=field=>field==='bodyProfile.hospitalVisits'?FORM_FIELDS.hospital:[field];
 const groupLocked=field=>groupFields(field).some(f=>discoveryLocked(c,f));
 const paint=()=>document.querySelectorAll('[data-discovery-lock]').forEach(b=>{const locked=groupLocked(b.dataset.discoveryLock);const label=locked?t('잠김','Locked','固定'):t('풀림','Unlocked','解除');
 b.innerHTML=(locked?'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 018 0v3M12 14v3"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6a4 4 0 018 0M12 14v3"/></svg>')+'<span>'+label+'</span>';b.title=locked?t('이 값으로 고정 · 눌러서 해제','Fixed at this value · click to unlock','この値で固定・押すと解除'):t('선택에 따라 변화 · 눌러서 고정','Changes through choices · click to lock','選択で変化・押すと固定');b.setAttribute('aria-label',label+' · '+b.title);b.setAttribute('aria-pressed',String(locked));});
 for(const field of DISCOVERY_FIELDS){const numeric=DISCOVERY_AXES[field]?.numeric;for(const control of document.querySelectorAll(`[data-discovery-container="${field}"],[data-field="${field}"]${field.startsWith('bodyProfile.')?`,[data-body-field="${field.slice(12)}"],[data-body-measurement="${field.slice(12)}"]`:''}${numeric?`,[data-field="${numeric}"]`:''}${field==='touchReaction'?', [data-touch-reactions]':''}`)){
  const parent=control.matches('[data-discovery-container]')?control:control.parentElement;if(parent.querySelector('[data-discovery-lock]'))continue;
  const title=parent.querySelector(':scope>b,:scope>legend');if(!title)continue;title.classList.add('discovery-title');if(DISCOVERY_AXES[field]){const metric=discoveryMetric(c,field),badge=document.createElement('small');badge.className='discovery-score';badge.textContent=metric.value===null?t('직접 설정','Manual','直接設定'):Math.round(metric.value)+(metric.categorical?'%':'/100');badge.title=metric.categorical?t('선택한 반응 유형의 비중','Share of the selected response type','選択された反応の割合'):t('현재 성향 점수','Current trait score','現在の傾向スコア');parent.append(badge);}const b=document.createElement('button');b.type='button';b.className='discovery-lock';b.dataset.discoveryLock=field;title.append(b);
  b.onclick=async e=>{if(fixedDiscoveryKnown(c,field))return;e.preventDefault();e.stopPropagation();parent.querySelector('[data-lock-error]')?.remove();const before=c.discovery;c.discovery={...before,locks:{...before?.locks,...Object.fromEntries(groupFields(field).map(f=>[f,!groupLocked(field)]))}};b.disabled=true;
   try{if(state.sharedContext){const gid=state.sharedContext.groupId;if(!sharedDiscoveryCharacter(gid,c.id))throw Error();await window.DrawerVillageGroups.saveResident({groupId:gid,id:c.id,profile:{...c}});}else if(!save(true))throw Error();}
   catch{c.discovery=before;let error=parent.querySelector('[data-lock-error]');if(!error){error=document.createElement('small');error.dataset.lockError='';error.setAttribute('role','status');parent.append(error);}error.textContent=t('저장하지 못했어요. 다시 눌러 주세요.','Could not save. Please try again.','保存できませんでした。もう一度お試しください。');}finally{b.disabled=false;paint();}
  };control.addEventListener('change',()=>queueMicrotask(paint));
 }}paint();
}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){session.reset();close()}});window.addEventListener('pagehide',()=>{session.reset();close()});
