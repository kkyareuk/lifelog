import {state,active} from "./state.js";
import {eventFor,visibleTimeline,charactersAtPlace,homeGroups} from "./simulation.js";
const esc=(x="")=>String(x).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const JOBS=["무직","학생","회사원","의사","간호사","교사","교수","정치인","기자","요리사","프로그래머","연구원","예술가","자영업·직접 입력"];
const TASTES=["아재 입맛","어린이 입맛","맵부심","한식파","면 요리 선호","디저트광","커피 못 마심","신상 맛집파"];
const INTERESTS=["향수","애니메이션","만화","게임","패션","미술","음악","영화","문구","인테리어","역사","기계"];
const HOBBIES=["취미 없음","집에서 뒹굴기","외출 안 함","인터넷 서핑","커뮤니티 눈팅","영상 정주행","낮잠","덕질","독서","카페 탐방","쇼핑","운동","사진","전시 관람","공방 체험","산책","요리","청소"];
const roomClasses={living:"living",kitchen:"kitchen",entry:"entry",bath:"bath",bedroom:"bedroom",study:"study"};
let accountText="Google 로그인";

function avatar(c,cls=""){
  if(c.icon)return `<img class="sprite ${cls}" src="${c.icon}" alt="">`;
  if(c.photo)return `<img class="avatar ${cls}" src="${c.photo}" alt="">`;
  return `<span class="avatar ${cls}" style="--own:${c.theme.primary}">${esc((c.name||"새").slice(0,1))}</span>`;
}
function header(){
  const tabs=[["observe","관찰"],["home","집"],["character","캐릭터"],["relationship","관계"],["routine","주간 루틴"],["town","마을"],["settings","설정"]];
  return `<header><div class="brand"><span class="logo">▥</span><div><h1>평행도시</h1><small>캐릭터 생활 관찰 게임</small></div></div><nav>${tabs.map(([k,n])=>`<button data-tab="${k}" class="${state.activeTab===k?"on":""}">${n}</button>`).join("")}</nav><span id="save-state">기기에 저장됨</span><button class="account" id="account">${esc(accountText)}</button></header>`;
}
function roster(){
  return `<div class="roster">${state.order.map(id=>{const c=state.characters[id],e=eventFor(c);return `<button class="roster-card ${id===state.activeId?"on":""}" data-roster="${id}" style="--own:${c.theme.primary}">${avatar(c)}<span><b>${esc(c.name)}</b><small>${esc(e.title)}</small></span></button>`}).join("")}</div>`;
}
function placeCard(p){
  return `<button class="place ${p.image?"has-photo":""}" style="left:${p.x}%;top:${p.y}%;--place:${p.color};${p.image?`--photo:url('${esc(p.image)}')`:""}" data-place="${p.id}"><i>${p.emoji}</i><b>${esc(p.name)}</b><small>${esc(p.type)}</small></button>`;
}
function personCard(c){
  const e=eventFor(c);if(e.home)return"";
  const p=state.world.places.find(x=>x.id===e.placeId);if(!p)return"";
  const group=charactersAtPlace(p.id),i=group.findIndex(x=>x.id===c.id);
  const offsets=[[-64,-45],[64,-45],[-64,48],[64,48],[0,-92],[0,94]],off=offsets[i%offsets.length];
  return `<button class="person" data-person="${c.id}" style="left:calc(${p.x}% + ${off[0]}px);top:calc(${p.y}% + ${off[1]}px)">${avatar(c)}<span>${esc(c.name)}</span></button>`;
}
function observe(){
  const c=active(),e=eventFor(c),place=state.world.places.find(p=>p.id===e.placeId),logs=visibleTimeline(c);
  return `${roster()}<div class="observe"><section><div class="world-hud"><div><small>현재 시각</small><b>${new Date().toLocaleString("ko-KR",{month:"long",day:"numeric",weekday:"short",hour:"2-digit",minute:"2-digit"})}</b></div><div><small>관찰 중</small><b>${esc(c.name)} · ${esc(e.title)}</b></div></div><div class="viewport"><div class="world"><img src="${state.world.bg}" class="world-bg">${state.world.places.map(placeCard).join("")}${state.order.map(id=>personCard(state.characters[id])).join("")}</div></div></section><aside class="detail-column"><div class="detail panel"><div class="hero">${c.photo?`<img src="${c.photo}" alt="">`:avatar(c)}</div><h2>${esc(c.name)}</h2><p>${esc(c.job)}</p><div class="scene"><small>CURRENT SCENE</small><h3>${esc(e.title)}</h3><p>${esc(e.desc)}</p><b>${place?`📍 ${esc(place.name)} · ${esc(state.world.name)}`:"🏠 집 안"}</b>${place?.image?`<img class="place-photo" src="${esc(place.image)}" alt="${esc(place.name)}">`:""}</div></div><section class="panel life-log"><div class="title"><h2>오늘의 생활 로그</h2><small>현재 시각까지 자동 기록</small></div><ol>${logs.map(x=>`<li class="${x===logs.at(-1)?"now":""}"><time>${esc(x.time)}</time><span><b>${esc(x.title)}</b><small>${esc(x.desc)}</small></span></li>`).join("")}</ol></section></aside></div>`;
}
function roomStyle(h,key){
  const image=h.rooms?.[key]?.image;
  return image?`style="background-image:linear-gradient(#ffffff30,#ffffff30),url('${image}')"`:"";
}
function home(){
  const groups=homeGroups(),ids=Object.keys(groups),selected=groups[state.activeHomeId]?state.activeHomeId:(active()?.homeId||ids[0]);
  state.activeHomeId=selected;
  return `<div class="title"><h1>우리 집 생활</h1></div><div class="home-tabs">${ids.map(id=>`<button data-home-select="${id}" class="${id===selected?"on":""}">🏠 ${esc(state.homes[id]?.name||groups[id][0].name+"의 집")}</button>`).join("")}</div><div class="home-grid">${selected?homeCard(selected,groups[selected]):""}</div>`;
}
function homeCard(id,chars){
  const h=state.homes[id]||{id,name:`${chars[0].name}의 집`,rooms:{}};
  const inside=chars.filter(c=>eventFor(c).home);
  return `<article class="home panel" data-home-card="${id}"><div class="title"><div><h2>🏠 ${esc(h.name)}</h2><small>${chars.map(c=>c.name).join(" · ")} 거주 중</small></div><b>${inside.length}명 귀가</b></div><div class="clean">청결도 · 반짝반짝 깨끗함 <i></i></div><div class="rooms">${Object.keys(roomClasses).map(key=>{const roomPeople=inside.filter(c=>eventFor(c).room===key);return `<div class="room ${roomClasses[key]}" ${roomStyle(h,key)}><b>${esc(h.rooms?.[key]?.name||key)}</b><div class="room-tools"><button data-room-bg="${id}" data-home-id="${id}" data-room="${key}">사진</button><button data-image-url="room" data-id="${id}" data-room="${key}">링크</button>${h.rooms?.[key]?.image?`<button data-clear-room-bg data-home-id="${id}" data-room="${key}">지우기</button>`:""}</div><div class="room-people">${roomPeople.map(c=>{const e=eventFor(c);return `<button class="home-person" data-home-person="${c.id}">${avatar(c)}<span><b>${esc(c.name)}</b><small>${esc(e.title)}</small></span></button>`}).join("")}</div></div>`}).join("")}</div></article>`;
}
function chips(title,all,selected,key){return `<section class="chips"><h3>${title}</h3>${all.map(x=>`<button data-chip="${key}" data-value="${x}" class="${selected.includes(x)?"on":""}">${x}</button>`).join("")}</section>`}
function character(){
  const c=active();
  return `<div class="editor"><aside class="panel"><div class="title"><h2>캐릭터 목록</h2><button data-new>+ 생성</button></div>${state.order.map(id=>{const x=state.characters[id];return `<button class="char-row ${id===c.id?"on":""}" data-edit="${id}" style="--own:${x.theme.primary}">${avatar(x)}<span><b>${esc(x.name)}</b><small>${esc(x.job)}</small></span></button>`}).join("")}</aside><section class="panel form"><h2>프로필</h2><div class="fields"><label>캐릭터 이름<input data-field="name" value="${esc(c.name)}"></label><label>직업<select data-field="job">${JOBS.map(x=>`<option ${x===c.job?"selected":""}>${x}</option>`).join("")}</select></label><label>프로필 사진<div class="image-actions"><button data-image="photo">사진 선택</button><button data-image-url="photo" data-id="${c.id}">링크 입력</button></div></label><label>지도용 캐릭터 아이콘 (선택)<div class="image-actions"><button data-image="icon">투명 아이콘 선택</button><button data-image-url="icon" data-id="${c.id}">링크 입력</button></div><small>첨부하지 않으면 프로필 사진이 원형 아이콘으로 보여요.</small></label><label>기상 시각<input type="time" data-field="wake" value="${c.wake}"></label><label>취침 시각<input type="time" data-field="sleep" value="${c.sleep}"></label><label>대표 테마색<input type="color" data-color="primary" value="${c.theme.primary}"></label><label>그라데이션 보조색<input type="color" data-color="secondary" value="${c.theme.secondary}"></label></div><label class="check"><input type="checkbox" data-gradient ${c.theme.gradient?"checked":""}> 보조색으로 그라데이션 사용</label>${chips("입맛",TASTES,c.tastes||[],"tastes")}${chips("관심사",INTERESTS,c.interests||[],"interests")}${chips("취미",HOBBIES,c.hobbies||[],"hobbies")}<button class="primary" data-save>캐릭터 저장</button></section></div>`;
}
function relationship(){
  const cards=Object.values(state.relationships).map(r=>{const a=state.characters[r.a],b=state.characters[r.b];return a&&b?`<article class="relation" style="--a:${a.theme.primary};--b:${b.theme.primary}"><h2>${esc(a.name)} × ${esc(b.name)}</h2><p>${esc(r.type)} · ${r.cohabit?"함께 거주":"따로 거주"}</p><p>친밀도 ${r.intimacy??75} · 갈등도 ${r.conflict??20}</p><button data-edit-rel="${r.id}">편집</button></article>`:""}).join("");
  return `<section class="panel form"><div class="title"><h1>관계</h1><button data-add-rel>+ 관계 추가</button></div>${cards||'<div class="empty-mini"><b>아직 설정한 관계가 없어요.</b><p>관계를 추가하면 두 사람의 생활과 동거 여부에 반영돼요.</p></div>'}</section>`;
}
function routine(){return `<section class="panel form"><h1>주간 루틴</h1><p>요일별 고정 일정 편집기는 다음 업데이트에서 이어집니다.</p></section>`}
function town(){return `<div class="town-edit"><div class="world"><img src="${state.world.bg}" class="world-bg">${state.world.places.map(placeCard).join("")}</div><aside class="panel form"><h2>마을 편집</h2><label>마을 이름<input data-world-name value="${esc(state.world.name)}"></label><label>기본 배경<select data-world-bg><option value="world-assets/cozy-town.png" ${state.world.bg.includes("cozy")?"selected":""}>개발자 그림 · 마을</option><option value="world-assets/downtown.png" ${state.world.bg.includes("downtown")?"selected":""}>개발자 그림 · 도시</option></select></label><p>건물 위치는 마을 탭에서만 옮길 수 있어요.</p><button data-add-place>+ 건물 추가</button><div class="place-editor">${state.world.places.map(p=>`<div><b>${esc(p.emoji)} ${esc(p.name)}</b><span><button data-place-image="${p.id}">사진</button><button data-image-url="place" data-id="${p.id}">링크</button>${p.image?`<button data-clear-place-image="${p.id}">지우기</button>`:""}</span></div>`).join("")}</div></aside></div>`}
function settings(){return `<section class="panel form"><h1>설정</h1><p>Google 계정으로 로그인하면 캐릭터 설정은 Firestore에, 여러 사진은 Firebase Storage에 나누어 저장됩니다.</p><button data-reset>모든 데이터 초기화</button></section>`}
function view(){
  if(!state.order.length)return `<section class="panel empty"><h1>첫 캐릭터를 만들어 주세요</h1><p>로그인 전에는 예시 캐릭터나 실제 지역이 표시되지 않아요.</p><button class="primary" data-new>+ 캐릭터 만들기</button></section>`;
  return ({observe,home,character,relationship,routine,town,settings}[state.activeTab])();
}
export function renderApp(next){
  if(next.activeId&&!next.characters[next.activeId])next.activeId=next.order[0]||null;
  document.querySelector("#app").innerHTML=`${header()}<main>${view()}</main>`;
}
export function setAccountLabel(text){accountText=text;const el=document.querySelector("#account");if(el)el.textContent=text}
