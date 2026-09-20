import {state} from './state.js?v=20260909dev305';
import {RELATION_METRICS} from './relationship-metrics.js';
const t=(ko,en,ja)=>({ko,en,ja}[state.uiLanguage]||ko);
const text=value=>value?.[state.uiLanguage]||value?.ko||'';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const metricLabel=k=>RELATION_METRICS[k]?.[{ko:0,en:1,ja:2}[state.uiLanguage]||0]||k;
const options=(values,selected)=>Object.entries(values).map(([id,label])=>`<option value="${esc(id)}" ${id===selected?'selected':''}>${esc(text(label))}</option>`).join('');
const people=(values,selected)=>values.map(r=>`<option value="${esc(r.id)}" ${r.id===selected?'selected':''}>${esc(r.name)}</option>`).join('');
function errorText(e){
 const copy={
  'manager-required':['방장이나 관리자만 변경할 수 있어요.','Only the host or an administrator can change this.','ホストか管理者のみ変更できます。'],
  'court-consent-required':['두 캐릭터 모두 궁정 프로필에서 자동 대화를 허용해야 해요.','Both characters must allow automatic dialogue in their court profiles.','両方のキャラクターが宮廷プロフィールで自動会話を許可する必要があります。'],
  'court-stale':['설정이나 대화가 바뀌었어요. 목록으로 돌아가 다시 시작해 주세요.','The settings or dialogue changed. Return to the list and start again.','設定または会話が変わりました。一覧に戻り、やり直してください。'],
  'court-disabled':['궁정 배경이 꺼져 있어요.','The court setting is disabled.','宮廷の背景設定が無効です。'],
  'court-rate-limit':['잠시 뒤 다시 대화해 주세요.','Please wait a moment before starting again.','少し待ってから会話を始めてください。'],
  'court-invalid-target':['같은 마을의 다른 캐릭터를 선택해 주세요.','Choose another character in the same village.','同じ村の別のキャラクターを選んでください。']
 };
 return copy[e?.code||e?.message]?t(...copy[e.code||e.message]):t('불러오거나 저장하지 못했어요. 연결을 확인하고 다시 시도해 주세요.','Could not load or save. Check your connection and try again.','読み込みまたは保存ができませんでした。接続を確認して再試行してください。');
}
function meters(metrics,distance,delta={}){
 return `<div class="court-meters">${Object.entries(metrics).map(([k,v])=>`<label><span>${esc(metricLabel(k))}</span><meter min="0" max="100" value="${Number(v)}" aria-label="${esc(metricLabel(k))}"></meter><b>${v}${delta[k]?` (${delta[k]>0?'+':''}${delta[k]})`:''}</b></label>`).join('')}<label class="court-distance"><span>${t('사회적 거리 · 고정','Social distance · fixed','社会的距離・固定')}</span><meter min="0" max="100" value="${distance}" aria-label="${t('사회적 거리','Social distance','社会的距離')}"></meter><b>${distance}</b></label></div>`;
}
export async function renderCourt(body,{groups,selected='',back,current=()=>true}){
 const available=groups.filter(g=>!g.id.startsWith('local:')),owner=window.ParallelCityAuth?.getInfo?.()?.user?.uid;
 let groupId=available.some(g=>g.id===selected)?selected:available[0]?.id,revision=0,data,actorId='',targetId='';
 const live=()=>body.isConnected&&current()&&window.ParallelCityAuth?.getInfo?.()?.user?.uid===owner;
 const call=(action,input={})=>window.DrawerVillageGroups.court(action,{...input,groupId});
 body.innerHTML=`<section class="court-shell"><div class="court-heading"><button type="button" data-court-back>${t('광장 목록','Plaza list','広場の一覧')}</button><h2>${t('궁정 이야기','Court stories','宮廷の物語')}</h2><p>${t('서로의 성격을 알아가며 우리만의 궁정 이야기를 만들어 보세요.','Discover each other’s personalities and create your court story.','互いの性格を知り、自分たちの宮廷の物語を作りましょう。')}</p></div><label>${t('멀티 그룹','Multiplayer group','マルチグループ')}<select data-court-group>${people(available,groupId)}</select></label><p role="status" data-court-status></p><div data-court-content></div></section>`;
 body.querySelector('[data-court-back]').onclick=()=>{revision++;back()};
 const container=body.querySelector('[data-court-content]'),status=body.querySelector('[data-court-status]');
 const active=()=>live()&&container.isConnected;
 async function run(action,input,done){
  const token=revision;const buttons=[...container.querySelectorAll('button')];buttons.forEach(b=>b.disabled=true);status.textContent=t('처리 중…','Working…','処理中…');
  try{const result=await call(action,input);if(active()&&revision===token){status.textContent='';await done(result)}}catch(e){if(active()&&revision===token)status.textContent=errorText(e)}finally{if(active()&&revision===token)buttons.filter(b=>b.isConnected).forEach(b=>b.disabled=false)}
 }
 async function load(){
  const token=++revision;container.replaceChildren();status.textContent=t('불러오는 중…','Loading…','読み込み中…');
  if(!groupId){status.textContent=t('참여 중인 멀티 그룹이 필요해요. 광장 목록에서 멀티를 만들거나 참여해 주세요.','Join or create a multiplayer group from the plaza list first.','広場の一覧からマルチを作成するか、参加してください。');return}
  try{const result=await call('readCourt');if(!active()||token!==revision)return;data=result;status.textContent='';render()}catch(e){if(active()&&token===revision){status.textContent=errorText(e);container.innerHTML=`<button data-court-retry>${t('다시 시도','Retry','再試行')}</button>`;container.querySelector('button').onclick=load}}
 }
 body.querySelector('[data-court-group]').onchange=e=>{groupId=e.target.value;actorId='';targetId='';load()};
 function render(){
  const mine=data.residents.filter(r=>r.ownerUid===owner),enabled=data.theme==='court';
  if(!mine.some(r=>r.id===actorId))actorId=mine[0]?.id||'';
  const actor=mine.find(r=>r.id===actorId),targets=data.residents.filter(r=>r.id!==actorId&&r.townId===actor?.townId&&r.profile?.enabled);
  if(!targets.some(r=>r.id===targetId))targetId=targets[0]?.id||'';
  const p=actor?.profile||{role:'noble',faction:'neutral',trait:'courtesy',bio:'',enabled:false};
  container.innerHTML=`${data.manager?`<form data-court-theme class="court-card"><label>${t('그룹 배경','Group setting','グループの背景')}<select name="theme"><option value="basic">${t('기본','Basic','基本')}</option><option value="court" ${enabled?'selected':''}>${t('로판 궁정','Fantasy court','ロマンスファンタジー宮廷')}</option></select></label><button>${t('배경 저장','Save setting','背景を保存')}</button></form>`:`<p>${enabled?t('로판 궁정','Fantasy court','ロマンスファンタジー宮廷'):t('기본 배경 · 방장이나 관리자가 궁정을 열 수 있어요.','Basic setting · A host or administrator can enable the court.','基本背景・ホストか管理者が宮廷を有効にできます。')}</p>`}
   <p class="court-note">${t('자동 대화는 캐릭터 설정에 따른 게임 반응입니다. 실제 멤버가 보낸 채팅과는 구분돼요.','Automatic dialogue is a game response based on character settings, separate from player chat.','自動会話はキャラクター設定に基づくゲームの反応です。メンバーのチャットとは別です。')}</p>
   ${mine.length?`<label>${t('내 캐릭터','My character','自分のキャラクター')}<select data-court-actor>${people(mine,actorId)}</select></label><details class="court-card" ${!actor?.profile?'open':''}><summary>${t('내 궁정 프로필','My court profile','自分の宮廷プロフィール')}</summary><form data-court-profile><div class="court-fields">${[['role',t('신분·역할','Role','身分・役割'),data.roles],['faction',t('정치적 입장','Political affiliation','政治的立場'),data.factions],['trait',t('대화 성향','Conversation preference','会話の好み'),data.traits]].map(([key,label,values])=>`<label>${label}<select name="${key}">${options(values,p[key])}</select></label>`).join('')}</div><label>${t('공개 설정 · 소개','Public biography','公開設定・紹介')}<textarea name="bio" maxlength="500" rows="3">${esc(p.bio)}</textarea></label><small>${t('소개 글은 역할극용이며 자동 판정에는 선택한 항목만 사용돼요.','Biography is for roleplay. Only selected options affect automatic responses.','紹介文はロールプレイ用です。自動判定には選択項目のみを使用します。')}</small><label class="court-check"><input type="checkbox" name="enabled" ${p.enabled?'checked':''}>${t('내 캐릭터의 자동 대화와 관계 변화 허용','Allow automatic dialogue and relationship changes','自動会話と関係の変化を許可する')}</label><button>${t('프로필 저장','Save profile','プロフィールを保存')}</button></form></details>`:`<p>${t('먼저 이 멀티에 내 캐릭터를 입주시켜 주세요.','Move one of your characters into this group first.','まず、このマルチに自分のキャラクターを入居させてください。')}</p>`}
   ${enabled&&actor?.profile?.enabled?`<section class="court-card"><h3>${t('왕궁 정원에서 대화하기','Talk in the palace garden','王宮庭園で話す')}</h3>${targets.length?`<label>${t('대화 상대','Conversation partner','話し相手')}<select data-court-target>${people(targets,targetId)}</select></label><div data-court-target-info></div><div class="court-scenes">${data.scenes.map(s=>`<button data-court-scene="${esc(s.id)}"><b>${esc(text(s.title))}</b><small>${s.formal?t('공식 모임 · 격식 있는 대화','Formal gathering','公式の集まり・礼儀ある会話'):t('정원의 일상 대화','Everyday garden conversation','庭園での日常会話')}</small></button>`).join('')}</div>`:`<p>${t('같은 마을에서 자동 대화를 허용한 다른 캐릭터가 아직 없어요.','No other character in this village has enabled automatic dialogue yet.','同じ村に自動会話を許可した別のキャラクターがまだいません。')}</p>`}</section>`:''}
   ${data.manager&&data.residents.length>1?`<details class="court-card"><summary>${t('사회적 거리 설정','Social distance settings','社会的距離の設定')}</summary><p>${t('낮을수록 대외적으로도 친하게 지낼 장벽이 적어요. 공적인 자리의 격식과는 별개이며, 일반 대화로 변하지 않아요. 기본값은 신분 차이와 세력 관계를 반영하며 아래에서 두 사람의 값을 직접 정할 수 있어요.','Lower values mean fewer social barriers to public closeness. This is separate from formal etiquette and does not change through dialogue. Defaults reflect roles and factions; you can set a pair’s value below.','低いほど、公の場でも親しく付き合う障壁が少なくなります。場の礼儀とは別で、会話では変わりません。初期値は身分と派閥を反映し、以下で二人の値を設定できます。')}</p><form data-court-distance><label>${t('첫 번째 캐릭터','First character','一人目')}<select name="actorId">${people(data.residents,actorId)}</select></label><label>${t('두 번째 캐릭터','Second character','二人目')}<select name="targetId">${people(data.residents,targetId||data.residents[1]?.id)}</select></label><label>${t('사회적 거리 (0–100)','Social distance (0–100)','社会的距離 (0–100)')}<input name="distance" type="number" min="0" max="100" step="1" required></label><button>${t('고정값 저장','Save fixed value','固定値を保存')}</button></form></details>`:''}
   <details class="court-card"><summary>${t('내 대화 기록','My dialogue history','自分の会話記録')} (${data.history.length})</summary>${data.history.length?data.history.map(h=>`<article class="court-history"><b>${esc(h.targetName)} · ${esc(text(data.scenes.find(s=>s.id===h.sceneId)?.title))}</b><p>${esc(text(h.response))}</p><small>${esc(new Date(h.at).toLocaleString(state.uiLanguage))}</small></article>`).join(''):`<p>${t('아직 대화 기록이 없어요.','No dialogue yet.','まだ会話記録がありません。')}</p>`}</details>`;
  container.querySelector('[data-court-theme]')?.addEventListener('submit',e=>{e.preventDefault();run('saveCourtTheme',{theme:new FormData(e.target).get('theme')},load)});
  container.querySelector('[data-court-actor]')?.addEventListener('change',e=>{actorId=e.target.value;render()});
  container.querySelector('[data-court-profile]')?.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(e.target);run('saveCourtProfile',{characterId:actorId,revision:p.revision||0,profile:{role:f.get('role'),faction:f.get('faction'),trait:f.get('trait'),bio:f.get('bio'),enabled:f.has('enabled')}},load)});
  const distanceForm=container.querySelector('[data-court-distance]');
  if(distanceForm){const fill=()=>{const f=new FormData(distanceForm),a=f.get('actorId'),b=f.get('targetId');const pair=data.pairs.find(p=>p.members.includes(a)&&p.members.includes(b));distanceForm.elements.distance.value=pair?.distance??'';};distanceForm.onchange=e=>{if(e.target.tagName==='SELECT')fill()};fill();distanceForm.onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);run('saveCourtDistance',{actorId:f.get('actorId'),targetId:f.get('targetId'),distance:Number(f.get('distance'))},load)}}
  function targetInfo(){const r=targets.find(r=>r.id===targetId),slot=container.querySelector('[data-court-target-info]');if(slot&&r)slot.innerHTML=`<p>${esc(text(data.roles[r.profile.role]))} · ${esc(text(data.factions[r.profile.faction]))}</p><p>${esc(r.profile.bio)}</p>`}
  container.querySelector('[data-court-target]')?.addEventListener('change',e=>{targetId=e.target.value;targetInfo()});targetInfo();
  container.querySelectorAll('[data-court-scene]').forEach(b=>b.onclick=()=>run('beginCourtDialogue',{actorId,targetId,sceneId:b.dataset.courtScene},dialogue));
 }
 function dialogue(result){
  const {scene}=result;
  container.innerHTML=`<article class="court-card court-dialogue"><button data-court-return>${t('목록으로','Back to list','一覧へ')}</button><small>${scene.formal?t('공식 모임','Formal gathering','公式の集まり'):t('왕궁 정원','Palace garden','王宮庭園')}</small><h3 tabindex="-1">${esc(text(scene.title))}</h3><p>${esc(text(scene.prompt))}</p><b>${esc(result.targetName)}</b><blockquote>${esc(text(scene.speech))}</blockquote><p class="court-note">${result.socialDistance>=60?t('대외적 친분에 설정상의 장벽이 큰 사이입니다.','Your backgrounds create substantial barriers to public closeness.','公の場での親交には、設定上の大きな障壁があります。'):result.socialDistance<=25?t('대외적으로 친하게 지내는 데 설정상의 장벽이 적은 사이입니다.','Your backgrounds allow public closeness with few social barriers.','公の場でも親しく付き合う設定上の障壁が少ない間柄です。'):t('서로 다른 사회적 입장을 가진 사이입니다.','You occupy different social positions.','異なる社会的立場にある間柄です。')}</p><div class="court-choices">${scene.choices.map(c=>`<button data-court-choice="${esc(c.id)}">${esc(text(c.text))}</button>`).join('')}</div><div data-court-result>${meters(result.metrics,result.socialDistance)}</div></article>`;
  container.querySelector('h3').focus();container.querySelector('[data-court-return]').onclick=load;
  container.querySelectorAll('[data-court-choice]').forEach(b=>b.onclick=()=>run('chooseCourtDialogue',{token:result.token,choiceId:b.dataset.courtChoice},out=>{
   container.querySelector('.court-choices').replaceChildren();const slot=container.querySelector('[data-court-result]');slot.innerHTML=`<p class="court-response" role="status" tabindex="-1">${esc(text(out.response))}</p>${meters(out.metrics,out.socialDistance,out.delta)}${!out.rewarded?`<p>${t('이번 대화에서는 수치가 유지돼요. 관계 고정 설정 또는 같은 두 캐릭터의 1시간 내 반복 대화에는 추가 변화를 적용하지 않아요.','Values stay unchanged for fixed relationships or repeat conversations between this pair within one hour.','関係固定設定、または同じ二人の1時間以内の再会話では数値を変更しません。')}</p>`:''}`;slot.querySelector('.court-response').focus();
  }));
 }
 await load();
}
