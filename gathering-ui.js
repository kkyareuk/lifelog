import {state,active} from './state.js?v=20260909dev305';
import {eventFor,visibleTimeline} from './simulation.js?v=20260909dev305';
import {gatheringText,socialScheduleRows,isSocialRoutine} from './gathering.js';
const text=(...v)=>gatheringText(v,state.uiLanguage);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shared=()=>!!state.sharedContext||!!window.DrawerVillageGroups?.getSnapshot?.()?.activeGroupId;
const portrait=c=>c.icon||c.photo?'<img src="'+esc(c.icon||c.photo)+'" alt="">':'<span class="gathering-avatar" aria-hidden="true">☺</span>';
let dialog=null;
export function openGathering(){
 if(dialog?.open||shared())return;const owner=state,d=document.createElement('dialog');dialog=d;d.className='gathering-dialog';
 let timer=0;const current=()=>d.open&&state===owner&&!shared();
 const plan=detail=>{if(!current())return;d.close();window.dispatchEvent(new CustomEvent('drawer-plan-gathering',{detail}))};
 function draw(){
  if(!current()){d.close();return}const scroll=d.scrollTop,c=active(),rows=socialScheduleRows(state,c?.id),now=new Date(),scene=c&&eventFor(c,now);
  const dateKey=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-'),minute=now.getHours()*60+now.getMinutes(),toMinute=v=>Number(v.split(':')[0])*60+Number(v.split(':')[1]);
  const live=scene&&isSocialRoutine(scene.routineType)&&!scene.transit&&!scene.routineReturned&&rows.some(r=>r.id===scene.routineId&&(r.monthly?r.date===dateKey:Number(r.day)===now.getDay())&&minute>=toMinute(r.start)&&minute<toMinute(r.end));
  const people=live?(scene.participantOrder||[c.id]).map(id=>state.characters[id]).filter(Boolean):[];
  const history=live?visibleTimeline(c,now).filter(e=>e.routineId===scene.routineId&&!e.transit).slice(-12):[];
  d.innerHTML='<header><div><small>'+esc(text('일정','Schedule','予定'))+'</small><h2>'+esc(text('모임과 약속','Gatherings and plans','集まりと約束'))+'</h2></div><button type="button" data-gathering-close aria-label="'+esc(text('닫기','Close','閉じる'))+'">×</button></header><div data-gathering-body><p class="gathering-intro">'+esc(text('시간·장소·함께할 사람만 정해 주세요. 이야기는 캐릭터들이 이어가요.','Set the time, place and company. The characters take it from there.','時間・場所・一緒に過ごす相手を決めましょう。その先はキャラクターにおまかせ。'))+'</p><button type="button" class="gathering-primary" data-gathering-plan>'+esc(text('모임 일정 잡기','Plan a gathering','集まりの予定を立てる'))+'</button>'+(live?'<div class="gathering-meta"><span>'+esc(scene.routineTitle||'')+'</span><span>'+esc(text('지금 함께하는 중','Together now','今、一緒に過ごしています'))+'</span></div><section class="gathering-stage"><div class="gathering-window" aria-hidden="true">☀</div><div class="gathering-table" aria-hidden="true">🫖</div><div class="gathering-cast">'+people.map(p=>'<div class="gathering-person">'+portrait(p)+'<b>'+esc(p.name)+'</b></div>').join('')+'</div></section><section class="gathering-caption"><h3>'+esc(scene.title)+'</h3><p>'+esc(scene.desc)+'</p></section><details class="gathering-history"><summary>'+esc(text('함께한 일','Time spent together','一緒に過ごしたこと'))+'</summary>'+history.map(e=>'<p><b>'+esc(e.title)+'</b><br>'+esc(e.desc)+'</p>').join('')+'</details>':'<p>'+esc(text('일정 시간이 되면 주민들의 모습과 이야기가 여기에 보여요.','When a plan begins, see the residents and their stories here.','予定の時間になると、住民の様子や出来事がここに表示されます。'))+'</p>')+'<section class="gathering-plans"><h3>'+esc(text('등록한 모임과 약속','Scheduled gatherings and plans','登録した集まりと約束'))+'</h3>'+rows.map((r,i)=>'<button type="button" data-gathering-edit="'+i+'"><b>'+esc(r.title||r.type)+'</b><small>'+esc((r.monthly?r.date:({ko:['일','월','화','수','목','금','토'],en:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],ja:['日','月','火','水','木','金','土']}[state.uiLanguage]||[])[r.day])+' · '+r.start+'–'+r.end)+'</small><span>'+esc([r.ownerId,...r.withIds||[]].map(id=>state.characters[id]?.name).filter(Boolean).join(' · '))+'</span></button>').join('')+(!rows.length?'<p>'+esc(text('아직 등록한 모임이 없어요.','No gatherings planned yet.','まだ集まりの予定はありません。'))+'</p>':'')+'</section></div>';
  d.querySelector('[data-gathering-close]').onclick=()=>d.close();d.querySelector('[data-gathering-plan]').onclick=()=>plan({ownerId:c?.id});
  d.querySelectorAll('[data-gathering-edit]').forEach(b=>b.onclick=()=>{const r=rows[+b.dataset.gatheringEdit];plan({id:r.id,ownerId:r.ownerId,monthly:r.monthly})});d.scrollTop=scroll;
 }
 const update=()=>{if(!current()){d.close();return}if(!document.hidden)draw();timer=setTimeout(update,10000)};
 d.onclose=()=>{clearTimeout(timer);d.remove();dialog=null;window.dispatchEvent(new Event('drawer-gathering-changed'))};document.body.append(d);d.showModal();draw();timer=setTimeout(update,10000);
}
document.addEventListener('click',e=>{if(e.target.closest('[data-open-gathering]'))openGathering()});

