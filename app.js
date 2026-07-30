const STORAGE='parallelCityCleanV1';
const TABS=[['observe','관찰'],['home','집'],['characters','캐릭터'],['relations','관계'],['routines','주간 루틴'],['village','마을'],['settings','설정']];
const JOBS=['직장·학교 없음','회사원','출판 편집자','교사','대학생','의료인','연구원','요리사','미용사','예술가','자영업·직접 입력'];
const TASTES=['아재 입맛','어린이 입맛','맵부심','한식파','면 요리 선호','디저트광','커피 못 마심','건강식 선호'];
const INTERESTS=['향수','애니메이션','만화','게임','패션','미술','음악','영화','문구','인테리어','역사','기계'];
const HOBBIES=['취미 없음','집에서 뒹굴기','외출 안 함','인터넷 서핑','커뮤니티 눈팅','영상 정주행','낮잠','덕질','독서','카페 탐방','쇼핑','운동','사진','전시 관람','공방 체험','산책','요리','청소','악기','식물 키우기'];
const uid=()=>crypto.randomUUID?.()||`${Date.now()}-${Math.random()}`;
const clone=v=>JSON.parse(JSON.stringify(v));
const defaults=()=>({
  version:1,activeId:null,activeTownId:'town-cozy',theme:'light',updatedAt:Date.now(),characters:[],relations:[],
  towns:[
    {id:'town-cozy',name:'평행마을',background:'./world-assets/cozy-town.png',roads:[[18,28],[34,44],[51,50],[68,38],[83,55],[62,77],[39,72],[18,28]],buildings:[
      {id:'b-cafe',name:'달무리 카페',type:'카페',x:22,y:34,color:'#e7b995',icon:'☕'},
      {id:'b-food',name:'골목 식당',type:'음식점',x:44,y:62,color:'#95d18a',icon:'🍜'},
      {id:'b-hospital',name:'새봄 의원',type:'병원',x:67,y:35,color:'#83cad0',icon:'🏥'},
      {id:'b-shop',name:'종이달 상점',type:'상점',x:78,y:64,color:'#c0a8df',icon:'🛍️'},
      {id:'b-office',name:'마리나 오피스',type:'회사',x:49,y:28,color:'#91a8e8',icon:'🏢'}]},
    {id:'town-city',name:'번화가',background:'./world-assets/downtown-town.png',roads:[[12,20],[31,31],[49,26],[69,39],[86,29],[76,64],[53,73],[29,64],[12,20]],buildings:[
      {id:'c-mall',name:'평행 백화점',type:'쇼핑몰',x:26,y:33,color:'#e7b36f',icon:'🏬'},
      {id:'c-cinema',name:'유성 영화관',type:'영화관',x:49,y:29,color:'#9b8bd8',icon:'🎬'},
      {id:'c-office',name:'센트럴 오피스',type:'회사',x:72,y:39,color:'#8fa9dc',icon:'🏢'},
      {id:'c-restaurant',name:'야경 다이닝',type:'음식점',x:68,y:68,color:'#ef9b8d',icon:'🍽️'},
      {id:'c-park',name:'하늘 공원',type:'공원',x:34,y:68,color:'#87cc9b',icon:'🌳'}]}
  ],homes:[]
});
let state=load(),activeTab='observe',draft=null,cloudUser=null,cloudDb=null,saveTimer=0;

function load(){
  try{
    const clean=JSON.parse(localStorage.getItem(STORAGE)||'null');
    if(clean)return normalize(clean);
  }catch{}
  return defaults();
}
function migrateCharacter(c){
  return {id:c.id||uid(),name:c.name||'새 캐릭터',job:c.job||'직장·학교 없음',mood:c.mood||'평온함',photo:c.photo||c.image||'',icon:c.icon||c.iconImage||'',color:c.color||c.primaryColor||'#4f8c7b',wake:c.wake||c.wakeTime||'07:30',bed:c.bed||c.bedTime||'23:30',workId:c.workId||'',townId:c.townId||'town-cozy',tastes:[...(c.tastes||[])],interests:[...(c.interests||[])],hobbies:[...(c.hobbies||[])],homeId:c.homeId||''};
}
function normalize(s){
  s={...defaults(),...s};
  s.characters=(s.characters||[]).map(migrateCharacter);
  s.activeId=s.characters.some(c=>c.id===s.activeId)?s.activeId:(s.characters[0]?.id||null);
  s.towns=(s.towns?.length?s.towns:defaults().towns).map(t=>({...t,roads:(t.roads||[]).map(p=>[+p[0],+p[1]]),buildings:(t.buildings||[]).map(b=>({...b}))}));
  return s;
}
function save(message='저장했어요'){
  state.updatedAt=Date.now();localStorage.setItem(STORAGE,JSON.stringify(state));renderHeader();toast(message);
  clearTimeout(saveTimer);saveTimer=setTimeout(pushCloud,900);
}
const active=()=>state.characters.find(c=>c.id===state.activeId)||null;
const currentTown=()=>state.towns.find(t=>t.id===state.activeTownId)||state.towns[0];
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function avatar(c,cls='avatar'){const src=c?.icon||c?.photo;return src?`<img class="${cls}" src="${src}" alt="">`:`<span class="${cls} fallback">${esc((c?.name||'새')[0])}</span>`}
function toast(s){const el=$('#toast');el.textContent=s;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),1600)}
const $=(q,r=document)=>r.querySelector(q), $$=(q,r=document)=>[...r.querySelectorAll(q)];
function init(){
  $('#tabs').innerHTML=TABS.map(([id,label])=>`<button data-tab="${id}">${label}</button>`).join('');
  $$('[data-tab]').forEach(b=>b.onclick=()=>showTab(b.dataset.tab));
  populateStatic();bind();renderAll();initFirebase();setInterval(()=>{renderClock();if(activeTab==='observe'){renderObserve()}},60000);
}
function showTab(id){
  activeTab=id;$$('.view').forEach(v=>v.classList.add('hidden'));$(`#view-${id}`).classList.remove('hidden');
  $$('#tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===id));
  if(id==='characters')renderCharacterEditor();if(id==='observe')renderObserve();if(id==='home')renderHomes();if(id==='village')renderVillage();
}
function populateStatic(){
  $('#charJob').innerHTML=JOBS.map(x=>`<option>${x}</option>`).join('');
  const chips=(id,arr)=>$(id).innerHTML=arr.map(v=>`<button type="button" class="chip" data-value="${v}">${v}</button>`).join('');
  chips('#tasteChips',TASTES);chips('#interestChips',INTERESTS);chips('#hobbyChips',HOBBIES);
}
function bind(){
  $('#quickChar').onchange=e=>{selectCharacter(e.target.value,false);renderObserve()};
  $('#observeTown').onchange=e=>{state.activeTownId=e.target.value;save('마을을 바꿨어요');renderObserve()};
  $('#newCharacter').onclick=()=>{const c=migrateCharacter({id:uid(),name:'새 캐릭터',color:'#4f8c7b'});state.characters.push(c);state.activeId=c.id;draft=clone(c);save();renderCharacterEditor()};
  $('#characterForm').onsubmit=e=>{e.preventDefault();commitCharacter()};
  $('#deleteCharacter').onclick=deleteCharacter;
  $('#charJob').onchange=()=>$('#customJobWrap').classList.toggle('hidden',$('#charJob').value!=='자영업·직접 입력');
  $$('.chip').forEach(b=>b.onclick=()=>b.classList.toggle('on'));
  $('#themeMode').onchange=e=>{state.theme=e.target.value;save();applyTheme()};
  $('#exportData').onclick=exportData;$('#importData').onchange=importData;
  $('#newTown').onclick=newTown;$('#editTown').onchange=renderVillage;$('#saveTown').onclick=saveTown;$('#addBuilding').onclick=addBuilding;
  $('#loginBtn').onclick=()=>location.href='./login.html';
}
function renderAll(){applyTheme();renderHeader();showTab(activeTab);renderRelations();renderRoutines()}
function applyTheme(){document.documentElement.classList.toggle('dark',state.theme==='dark');const c=active();document.documentElement.style.setProperty('--accent',c?.color||'#4f8c7b')}
function renderHeader(){
  $('#quickChar').innerHTML=state.characters.length?state.characters.map(c=>`<option value="${c.id}" ${c.id===state.activeId?'selected':''}>${esc(c.name)}</option>`).join(''):'<option>캐릭터 없음</option>';
  $('#themeMode').value=state.theme;applyTheme();
}
function selectCharacter(id,focusLocation){
  if(!state.characters.some(c=>c.id===id))return;
  state.activeId=id;draft=clone(active());localStorage.setItem(STORAGE,JSON.stringify(state));renderHeader();
  if(focusLocation){const ev=getCurrentEvent(active());if(ev.townId)state.activeTownId=ev.townId;showTab(ev.kind==='home'?'home':'observe')}
  else if(activeTab==='characters')renderCharacterEditor();
}
function renderCharacterEditor(){
  const list=$('#characterList');
  list.innerHTML=state.characters.length?state.characters.map(c=>`<button class="character-row ${c.id===state.activeId?'active':''}" data-id="${c.id}" style="--character:${c.color}">${avatar(c)}<span><b>${esc(c.name)}</b><small>${esc(c.job)}</small></span></button>`).join(''):'<p class="muted">아직 캐릭터가 없어요.</p>';
  $$('.character-row',list).forEach(b=>b.onclick=()=>selectCharacter(b.dataset.id,false));
  const c=active();$('#characterForm').classList.toggle('hidden',!c);if(!c)return;draft=clone(c);
  $('#charName').value=c.name;const known=JOBS.includes(c.job)?c.job:'자영업·직접 입력';$('#charJob').value=known;$('#charCustomJob').value=known==='자영업·직접 입력'?c.job:'';$('#customJobWrap').classList.toggle('hidden',known!=='자영업·직접 입력');
  $('#charMood').value=c.mood;$('#charColor').value=c.color;$('#charWake').value=c.wake;$('#charBed').value=c.bed;
  fillWorkOptions(c.workId);
  setChipState('#tasteChips',c.tastes);setChipState('#interestChips',c.interests);setChipState('#hobbyChips',c.hobbies);
}
function setChipState(id,arr){$$('.chip',$(id)).forEach(b=>b.classList.toggle('on',(arr||[]).includes(b.dataset.value)))}
function selectedChips(id){return $$('.chip.on',$(id)).map(b=>b.dataset.value)}
function fillWorkOptions(value){
  const opts=state.towns.flatMap(t=>t.buildings.filter(b=>['회사','학교','병원','상점','카페','음식점'].includes(b.type)).map(b=>({id:b.id,label:`${b.name} · ${t.name}`})));
  $('#charWork').innerHTML='<option value="">없음</option>'+opts.map(o=>`<option value="${o.id}">${esc(o.label)}</option>`).join('');$('#charWork').value=value||'';
}
async function fileData(input){const f=input.files?.[0];if(!f)return'';if(f.size>3_500_000){toast('사진은 3.5MB 이하로 골라 주세요');return''}return await new Promise((ok,no)=>{const r=new FileReader;r.onload=()=>ok(r.result);r.onerror=no;r.readAsDataURL(f)})}
async function commitCharacter(){
  const c=active();if(!c)return;const oldId=c.id;
  const photo=await fileData($('#charPhoto')),icon=await fileData($('#charIcon'));
  Object.assign(c,{name:$('#charName').value.trim()||'새 캐릭터',job:$('#charJob').value==='자영업·직접 입력'?($('#charCustomJob').value.trim()||'자영업'):$('#charJob').value,mood:$('#charMood').value,color:$('#charColor').value,wake:$('#charWake').value||'07:30',bed:$('#charBed').value||'23:30',workId:$('#charWork').value,tastes:[...selectedChips('#tasteChips')],interests:[...selectedChips('#interestChips')],hobbies:[...selectedChips('#hobbyChips')]});
  if(photo)c.photo=photo;if(icon)c.icon=icon;c.id=oldId;save('캐릭터를 저장했어요');renderAll();showTab('characters');
}
function deleteCharacter(){const c=active();if(!c||!confirm(`${c.name}을(를) 삭제할까요?`))return;state.characters=state.characters.filter(x=>x.id!==c.id);state.activeId=state.characters[0]?.id||null;save();renderCharacterEditor()}
function timeNum(s){const[a,b]=String(s||'00:00').split(':').map(Number);return a*60+b}
function getCurrentEvent(c,now=new Date()){
  const minute=now.getHours()*60+now.getMinutes(),wake=timeNum(c.wake),bed=timeNum(c.bed);
  if(minute<wake||minute>=bed)return{kind:'home',title:'집에서 자는 중',detail:'다음 일정 전까지 푹 쉬고 있어요.',time:c.bed};
  const work=findBuilding(c.workId);
  if(work&&minute>=540&&minute<720)return{kind:'place',title:`${work.b.name}에서 일하는 중`,detail:'맡은 일을 차근차근 처리하고 있어요.',townId:work.t.id,buildingId:work.b.id,time:'09:00'};
  if(work&&minute>=720&&minute<780){const meal=nearestByType(work.t,'음식점',work.b)||work.b;return{kind:'place',title:`${meal.name}에서 점심`,detail:'근무지 가까운 곳에서 식사하고 있어요.',townId:work.t.id,buildingId:meal.id,time:'12:00'}}
  if(work&&minute>=780&&minute<1080)return{kind:'place',title:`${work.b.name}에서 일하는 중`,detail:'오후 업무를 마무리하고 있어요.',townId:work.t.id,buildingId:work.b.id,time:'13:00'};
  if(minute>=1080&&minute<1260){const t=work?.t||state.towns[0],b=pickLeisure(c,t);if(b)return{kind:'place',title:`${b.name} 방문`,detail:`${c.hobbies[0]||c.interests[0]||'가벼운 외출'}을 즐기는 중이에요.`,townId:t.id,buildingId:b.id,time:'18:00'}}
  return{kind:'home',title:'집에서 생활 중',detail:homeAction(c),time:'21:00'};
}
function findBuilding(id){for(const t of state.towns){const b=t.buildings.find(x=>x.id===id);if(b)return{t,b}}return null}
function nearestByType(t,type,from){return t.buildings.filter(b=>b.type===type).sort((a,b)=>dist(a,from)-dist(b,from))[0]}
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function pickLeisure(c,t){const wanted=c.interests.includes('미술')?'미술관':c.hobbies.includes('카페 탐방')?'카페':c.hobbies.includes('쇼핑')?'쇼핑몰':c.hobbies.includes('산책')?'공원':'';return t.buildings.find(b=>b.type===wanted)||t.buildings.find(b=>!['회사','병원'].includes(b.type))}
function homeAction(c){if(c.hobbies.includes('청소'))return'집 안을 정리하고 청소하는 중';if(c.hobbies.includes('요리'))return'주방에서 새로운 요리를 만드는 중';if(c.hobbies.includes('독서'))return'소파에 앉아 책을 읽는 중';return'편한 옷으로 갈아입고 쉬는 중'}
function eventsUntilNow(c){const now=new Date(),cur=getCurrentEvent(c,now),events=[{time:c.wake,title:'기상',detail:'집에서 하루를 시작했어요.'}];if(timeNum(c.wake)<=now.getHours()*60+now.getMinutes()&&cur.title!=='기상')events.push(cur);return events}
function renderObserve(){
  renderClock();const c=active();$('#observerCharacters').innerHTML=state.characters.map(ch=>{const ev=getCurrentEvent(ch);return`<button class="observer-char ${ch.id===state.activeId?'active':''}" data-id="${ch.id}" style="--character:${ch.color}">${avatar(ch)}<span><b>${esc(ch.name)}</b><small>${esc(ev.title)}</small></span></button>`}).join('');
  $$('.observer-char').forEach(b=>b.onclick=()=>selectCharacter(b.dataset.id,true));
  $('#observeTown').innerHTML=state.towns.map(t=>`<option value="${t.id}" ${t.id===state.activeTownId?'selected':''}>${esc(t.name)}</option>`).join('');
  renderTownCanvas();renderProfile(c);renderLifeLog(c);$('#watchingText').textContent=c?`${c.name} · ${getCurrentEvent(c).title}`:'캐릭터를 만들어 주세요';
}
function renderClock(){const d=new Date();if($('#clock'))$('#clock').textContent=d.toLocaleString('ko-KR',{month:'long',day:'numeric',weekday:'short',hour:'2-digit',minute:'2-digit'})}
function renderTownCanvas(){
  const t=currentTown(),canvas=$('#townCanvas');canvas.style.backgroundImage=`url("${t.background}")`;
  canvas.innerHTML=t.buildings.map(b=>`<div class="building" style="left:${b.x}%;top:${b.y}%;--building:${b.color}"><span>${b.icon}</span>${esc(b.name)}<small>${esc(b.type)}</small></div>`).join('');
  const groups={};state.characters.forEach(c=>{const ev=getCurrentEvent(c);if(ev.kind==='place'&&ev.townId===t.id)(groups[ev.buildingId]??=[]).push(c)});
  Object.entries(groups).forEach(([bid,chars])=>{const b=t.buildings.find(x=>x.id===bid);chars.forEach((c,i)=>canvas.insertAdjacentHTML('beforeend',`<button class="world-marker ${i?'offset-'+Math.min(i,2):''}" data-id="${c.id}" style="left:${b.x}%;top:${b.y}%;--character:${c.color}">${avatar(c)}<label>${esc(c.name)}</label></button>`))});
  $$('.world-marker',canvas).forEach(m=>m.onclick=()=>selectCharacter(m.dataset.id,true));
}
function renderProfile(c){
  if(!c){$('#profileCard').innerHTML='<p>캐릭터를 먼저 만들어 주세요.</p>';return}
  const ev=getCurrentEvent(c),hero=c.photo?`style="background-image:url('${c.photo}')"`:'';
  $('#profileCard').innerHTML=`<div class="hero" ${hero}>${c.photo?'':`<span class="fallback">${esc(c.name)}</span>`}</div><h2>${esc(c.name)}</h2><p class="muted">${esc(c.job)} · ${esc(c.mood)}</p><div class="scene"><small>CURRENT SCENE</small><h3>${esc(ev.title)}</h3><p>${esc(ev.detail)}</p></div>`;
}
function renderLifeLog(c){$('#lifeLog').innerHTML=`<h2>오늘의 생활 로그</h2>${c?eventsUntilNow(c).map(e=>`<div class="log-item"><time>${e.time}</time><div><b>${esc(e.title)}</b><small>${esc(e.detail)}</small></div></div>`).join(''):'<p>기록이 없어요.</p>'}`}
function renderHomes(){
  const atHome=state.characters.filter(c=>getCurrentEvent(c).kind==='home');
  $('#homes').innerHTML=`<article class="panel house-card"><h2>🏠 평행 하우스 <small>${atHome.length}명 귀가</small></h2><div class="rooms"><div class="room living"><b>거실</b>${atHome.map(homePerson).join('')}</div><div class="room"><b>주방</b></div><div class="room"><b>욕실</b></div><div class="room"><b>침실</b></div></div></article>`;
}
function homePerson(c){return`<div class="home-person" style="--character:${c.color}">${avatar(c)}<span><b>${esc(c.name)}</b><small>${esc(getCurrentEvent(c).detail)}</small></span></div>`}
function renderRelations(){$('#relations').innerHTML=state.characters.map(c=>`<div class="setting-row"><b>${esc(c.name)}</b><span class="muted">개별 설정 유지</span></div>`).join('')}
function renderRoutines(){$('#routines').innerHTML=state.characters.map(c=>`<div class="setting-row"><b>${esc(c.name)}</b><span>${c.wake} 기상 · ${c.bed} 취침</span></div>`).join('')}
function renderVillage(){
  $('#editTown').innerHTML=state.towns.map(t=>`<option value="${t.id}">${esc(t.name)}</option>`).join('');$('#editTown').value=$('#editTown').value&&state.towns.some(t=>t.id===$('#editTown').value)?$('#editTown').value:state.activeTownId;
  const t=state.towns.find(x=>x.id===$('#editTown').value)||state.towns[0];$('#townName').value=t.name;renderTownEditor(t);renderBuildingEditor(t);
}
function renderTownEditor(t){
  const el=$('#townEditor');el.style.backgroundImage=`url("${t.background}")`;
  const lines=t.roads.slice(1).map((p,i)=>`<line x1="${t.roads[i][0]}%" y1="${t.roads[i][1]}%" x2="${p[0]}%" y2="${p[1]}%"/>`).join('');
  el.innerHTML=`<svg class="road-svg">${lines}</svg>`+t.roads.map((p,i)=>`<button class="road-node" data-i="${i}" style="left:${p[0]}%;top:${p[1]}%" title="도로 점"></button>`).join('')+t.buildings.map(b=>`<div class="building" data-id="${b.id}" style="left:${b.x}%;top:${b.y}%;--building:${b.color}"><span>${b.icon}</span>${esc(b.name)}<small>${esc(b.type)}</small></div>`).join('');
  $$('.road-node',el).forEach(n=>dragElement(n,(x,y)=>{t.roads[+n.dataset.i]=[x,y];renderTownEditor(t)}));
  $$('.building',el).forEach(b=>dragElement(b,(x,y)=>{const item=t.buildings.find(v=>v.id===b.dataset.id),near=[...t.roads].sort((a,z)=>Math.hypot(a[0]-x,a[1]-y)-Math.hypot(z[0]-x,z[1]-y))[0];if(near&&Math.hypot(near[0]-x,near[1]-y)<8){x=near[0];y=near[1]}item.x=x;item.y=y;renderTownEditor(t)}));
  el.ondblclick=e=>{const r=el.getBoundingClientRect();t.roads.push([((e.clientX-r.left)/r.width)*100,((e.clientY-r.top)/r.height)*100]);renderTownEditor(t)};
}
function dragElement(el,done){el.onpointerdown=e=>{e.preventDefault();el.setPointerCapture(e.pointerId);el.onpointerup=up=>{const r=el.parentElement.getBoundingClientRect();done(Math.max(2,Math.min(98,(up.clientX-r.left)/r.width*100)),Math.max(2,Math.min(98,(up.clientY-r.top)/r.height*100)));el.onpointerup=null}}}
function renderBuildingEditor(t){$('#buildingEditor').innerHTML=t.buildings.map(b=>`<div class="setting-row"><span>${b.icon} ${esc(b.name)}</span><button class="danger" data-delete="${b.id}">삭제</button></div>`).join('');$$('[data-delete]').forEach(b=>b.onclick=()=>{t.buildings=t.buildings.filter(x=>x.id!==b.dataset.delete);renderVillage()})}
async function saveTown(){const t=state.towns.find(x=>x.id===$('#editTown').value);t.name=$('#townName').value.trim()||'이름 없는 마을';const bg=await fileData($('#townBackground'));if(bg)t.background=bg;state.activeTownId=t.id;save('마을을 저장했어요');renderVillage()}
function addBuilding(){const t=state.towns.find(x=>x.id===$('#editTown').value),name=prompt('건물 이름을 입력해 주세요','새 건물');if(!name)return;t.buildings.push({id:uid(),name,type:'상점',x:50,y:50,color:'#91a8e8',icon:'🏢'});renderVillage()}
function newTown(){const t={id:uid(),name:'새 번화가',background:'./world-assets/downtown-town.png',roads:[[15,25],[35,42],[55,35],[78,55],[55,75],[28,68]],buildings:[]};state.towns.push(t);state.activeTownId=t.id;save();renderVillage()}
function exportData(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));a.download='parallel-city-backup.json';a.click()}
async function importData(e){try{state=normalize(JSON.parse(await e.target.files[0].text()));save('백업을 불러왔어요');renderAll()}catch{toast('백업 파일을 읽지 못했어요')}}

async function initFirebase(){
  const cfg=window.PARALLEL_CITY_CONFIG?.firebase;if(!cfg?.apiKey)return;
  try{
    const [{initializeApp},{getAuth,onAuthStateChanged,setPersistence,browserLocalPersistence},{getFirestore,doc,getDoc,setDoc,serverTimestamp}]=await Promise.all([
      import('https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js')
    ]);
    const app=initializeApp(cfg);const auth=getAuth(app);cloudDb=getFirestore(app);await setPersistence(auth,browserLocalPersistence);
    onAuthStateChanged(auth,async user=>{cloudUser=user;$('#loginBtn').textContent=user?`${user.displayName||'Google'} 로그아웃`:'Google 로그인';if(!user)return;
      $('#syncStatus').textContent='동기화 중';const snap=await getDoc(doc(cloudDb,'users',user.uid));const remote=snap.exists()?JSON.parse(snap.data().payload||'null'):null;
      const remoteTime=Number(remote?.updatedAt||remote?.cloudUpdatedAt||0);
      if(remote&&((!state.characters.length&&remote.characters?.length)||remoteTime>Number(state.updatedAt))){state=normalize(remote);state.updatedAt=remoteTime||Date.now();localStorage.setItem(STORAGE,JSON.stringify(state));renderAll();toast('Google 저장 데이터를 불러왔어요')}else await pushCloud();
      $('#syncStatus').textContent='동기화됨';
    });
    $('#loginBtn').onclick=async()=>{if(cloudUser){const {signOut}=await import('https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js');await signOut(auth)}else location.href='./login.html'};
    window.__cloud={doc,setDoc,serverTimestamp};
  }catch(e){console.warn(e);$('#syncStatus').textContent='기기 저장'}
}
async function pushCloud(){if(!cloudUser||!cloudDb||!window.__cloud)return;try{const{doc,setDoc,serverTimestamp}=window.__cloud;$('#syncStatus').textContent='동기화 중';await setDoc(doc(cloudDb,'users',cloudUser.uid),{payload:JSON.stringify(state),clientUpdatedAt:state.updatedAt,updatedAt:serverTimestamp()},{merge:true});$('#syncStatus').textContent='동기화됨'}catch{$('#syncStatus').textContent='기기 저장'}}
init();
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
