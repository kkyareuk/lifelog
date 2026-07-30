(()=>{
"use strict";
const KEY="parallel-city-game-v2", $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const uid=()=>crypto.randomUUID?.()||`${Date.now()}-${Math.random()}`;
const clone=x=>JSON.parse(JSON.stringify(x));
const esc=(x="")=>String(x).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const JOBS=["무직","대학생","회사원","의사","간호사","교사","교수","정치인","기자","요리사","프로그래머","연구원","예술가","자영업·직접 입력"];
const TASTES=["아재 입맛","어린이 입맛","맵부심","한식파","면 요리 선호","디저트광","커피 못 마심","신상 맛집파"];
const INTERESTS=["향수","애니메이션","만화","게임","패션","미술","음악","영화","문구","인테리어","역사","기계"];
const HOBBIES=["취미 없음","집에서 뒹굴기","외출 안 함","인터넷 서핑","커뮤니티 눈팅","영상 정주행","낮잠","덕질","독서","카페 탐방","쇼핑","운동","사진","전시 관람","산책","요리","청소"];
const fresh=()=>({schema:2,activeTab:"character",activeId:null,lastSaved:0,characters:{},order:[],homes:{},relationships:{},world:{name:"평행마을",bg:"world-assets/cozy-town.png",places:[
  {id:"cafe",name:"달무리 카페",type:"카페",emoji:"☕",x:15,y:34,color:"#74c7bd"},
  {id:"food",name:"달무리 식당",type:"음식점",emoji:"🍽️",x:55,y:22,color:"#86ca7b"},
  {id:"office",name:"평행 오피스",type:"회사",emoji:"🏢",x:79,y:37,color:"#8c9df0"},
  {id:"clinic",name:"새봄 의원",type:"병원",emoji:"🩺",x:21,y:68,color:"#6db7e8"},
  {id:"park",name:"별꼬리 공원",type:"공원",emoji:"🌳",x:64,y:76,color:"#66c68a"}
]},routines:{}});
let state=load(),accountStatus="Google 로그인",pendingImage=null,saveTimer;
function load(){try{const x=JSON.parse(localStorage.getItem(KEY));return x?.schema===2?x:fresh()}catch{return fresh()}}
function save(){clearTimeout(saveTimer);saveTimer=setTimeout(()=>{state.lastSaved=Date.now();localStorage.setItem(KEY,JSON.stringify(state));$("#save-state")?.replaceChildren(document.createTextNode("기기에 저장됨"));window.dispatchEvent(new Event("parallel-city-saved"))},120)}
function active(){return state.characters[state.activeId]}
function setTheme(){const c=active(),p=c?.theme?.primary||"#176b60",s=c?.theme?.gradient?c.theme.secondary||p:p;document.documentElement.style.setProperty("--p",p);document.documentElement.style.setProperty("--s",s)}
function avatar(c,cls=""){if(c.icon)return `<img class="sprite ${cls}" src="${c.icon}" alt="">`;if(c.photo)return `<img class="avatar ${cls}" src="${c.photo}" alt="">`;return `<span class="avatar ${cls}">${esc((c.name||"새").slice(0,1))}</span>`}
function createCharacter(){const id=uid();state.characters[id]={id,name:"새 캐릭터",job:"무직",photo:"",icon:"",wake:"07:30",sleep:"00:30",theme:{primary:"#176b60",secondary:"#6fd0ae",gradient:true},tastes:[],interests:[],hobbies:[],homeId:id};state.order.push(id);state.homes[id]={id,name:"새 캐릭터의 집",background:""};state.routines[id]=[];state.activeId=id;state.activeTab="character";save();render()}
function mins(s){const [h,m]=String(s||"0:0").split(":").map(Number);return h*60+(m||0)}
function eventFor(c){
  const d=new Date(),m=d.getHours()*60+d.getMinutes(),wake=mins(c.wake),sleep=mins(c.sleep);
  const routine=(state.routines[c.id]||[]).find(r=>r.day===d.getDay()&&m>=mins(r.start)&&m<mins(r.end));
  if(routine)return {title:routine.title,placeId:routine.placeId,home:!routine.placeId,desc:`고정 일정 · ${routine.start}–${routine.end}`};
  if(m<wake||m>=sleep)return {title:"집에서 자는 중",home:true,desc:"다음 일정 전까지 침실에서 쉬고 있어요."};
  if(m<540)return {title:"집에서 아침을 보내는 중",home:true,desc:"천천히 외출 준비를 하고 있어요."};
  if(m<1080&&c.job!=="무직"&&c.job!=="대학생"){
    const p=state.world.places.find(x=>x.type===(c.job==="의사"||c.job==="간호사"?"병원":"회사"))||state.world.places[2];
    return {title:`${c.job}로 일하는 중`,placeId:p.id,home:false,desc:`${p.name}에서 직업 일정을 보내고 있어요.`};
  }
  if(m>=1320)return {title:"집에서 저녁 시간을 보내는 중",home:true,desc:"귀가해 편안하게 쉬고 있어요."};
  const types=c.hobbies.includes("카페 탐방")?["카페"]:c.hobbies.includes("운동")?["공원"]:["카페","음식점","공원"];
  const choices=state.world.places.filter(p=>types.includes(p.type)),p=choices[(hash(c.id+dateKey())%Math.max(choices.length,1))]||state.world.places[0];
  return {title:`${p.name} 방문`,placeId:p.id,home:false,desc:`${p.name}에서 ${c.hobbies[0]||"느긋한 시간"}을 보내고 있어요.`};
}
function hash(s){let h=0;for(const x of s)h=(h*31+x.charCodeAt())>>>0;return h}
function dateKey(){return new Date().toISOString().slice(0,10)}
function header(){const tabs=[["observe","관찰"],["home","집"],["character","캐릭터"],["relationship","관계"],["routine","주간 루틴"],["town","마을"],["settings","설정"]];return `<header><div class="brand"><span class="logo">▥</span><div><h1>평행도시</h1><small>캐릭터 생활 관찰 게임</small></div></div><nav>${tabs.map(([k,n])=>`<button data-tab="${k}" class="${state.activeTab===k?"on":""}">${n}</button>`).join("")}</nav><span id="save-state">기기에 저장됨</span><button class="account" id="account">${esc(accountStatus)}</button></header>`}
function roster(){return `<div class="roster">${state.order.map(id=>{const c=state.characters[id],e=eventFor(c);return `<button class="roster-card ${id===state.activeId?"on":""}" data-roster="${id}" style="--own:${c.theme.primary}">${avatar(c)}<span><b>${esc(c.name)}</b><small>${esc(e.title)}</small></span></button>`}).join("")}</div>`}
function observe(){
  const c=active(),e=eventFor(c),place=state.world.places.find(p=>p.id===e.placeId);
  return `${roster()}<div class="observe"><section><div class="world-hud"><div><small>현재 시각</small><b>${new Date().toLocaleString("ko-KR",{month:"long",day:"numeric",weekday:"short",hour:"2-digit",minute:"2-digit"})}</b></div><div><small>관찰 중</small><b>${esc(c.name)} · ${esc(e.title)}</b></div></div><div class="viewport"><div class="world"><img src="${state.world.bg}" class="world-bg">${state.world.places.map(placeCard).join("")}${state.order.map(personCard).join("")}</div></div><div class="zoom"><button data-zoom="-">−</button><button data-zoom="0">⌂</button><button data-zoom="+">＋</button></div></section><aside class="detail panel"><div class="hero">${c.photo?`<img src="${c.photo}">`:avatar(c)}</div><h2>${esc(c.name)}</h2><p>${esc(c.job)}</p><div class="scene"><small>CURRENT SCENE</small><h3>${esc(e.title)}</h3><p>${esc(e.desc)}</p><b>${place?`📍 ${esc(place.name)} · ${esc(state.world.name)}`:"🏠 집 안"}</b></div></aside></div>`}
function placeCard(p){return `<button class="place" style="left:${p.x}%;top:${p.y}%;--place:${p.color}" data-place="${p.id}"><i>${p.emoji}</i><b>${esc(p.name)}</b><small>${esc(p.type)}</small></button>`}
function personCard(c){const e=eventFor(c);if(e.home)return"";const p=state.world.places.find(x=>x.id===e.placeId);if(!p)return"";const same=state.order.filter(id=>eventFor(state.characters[id]).placeId===p.id).indexOf(c.id);return `<button class="person" data-person="${c.id}" style="left:calc(${p.x}% + ${same*54}px);top:calc(${p.y}% + ${same%2*58}px)">${avatar(c)}<span>${esc(c.name)}</span></button>`}
function home(){
  const groups={};state.order.forEach(id=>{const c=state.characters[id],h=c.homeId||c.id;(groups[h]??=[]).push(c)});
  return `<div class="title"><h1>우리 집 생활</h1></div><div class="home-grid">${Object.entries(groups).map(([id,cs])=>homeCard(id,cs)).join("")}</div>`}
function homeCard(id,chars){const h=state.homes[id]||(state.homes[id]={id,name:`${chars[0].name}의 집`,background:""}),inside=chars.filter(c=>eventFor(c).home);return `<article class="home panel"><div class="title"><div><h2>🏠 ${esc(h.name)}</h2><small>${chars.map(c=>c.name).join(" · ")} 거주 중</small></div><div><b>${inside.length}명 귀가</b><button data-home-bg="${id}">집 바탕 사진</button></div></div><div class="clean">청결도 · 반짝반짝 깨끗함 <i></i></div><div class="rooms" ${h.background?`style="background-image:linear-gradient(#ffffff35,#ffffff35),url('${h.background}')"`:""}><div class="room living"><b>거실</b></div><div class="room kitchen"><b>주방</b></div><div class="room entry"><b>현관</b></div><div class="room bath"><b>욕실</b></div><div class="room bedroom"><b>침실</b></div><div class="room study"><b>서재·취미방</b></div>${inside.map((c,i)=>`<div class="home-person hp${i%5}">${avatar(c)}<span><b>${esc(c.name)}</b><small>${esc(eventFor(c).desc)}</small></span></div>`).join("")}</div></article>`}
function character(){
  const c=active();return `<div class="editor"><aside class="panel"><div class="title"><h2>캐릭터 목록</h2><button data-new>+ 생성</button></div>${state.order.map(id=>{const x=state.characters[id];return `<button class="char-row ${id===c.id?"on":""}" data-edit="${id}">${avatar(x)}<span><b>${esc(x.name)}</b><small>${esc(x.job)}</small></span></button>`}).join("")}</aside><section class="panel form"><h2>프로필</h2><div class="fields"><label>캐릭터 이름<input data-field="name" value="${esc(c.name)}"></label><label>직업<select data-field="job">${JOBS.map(x=>`<option ${x===c.job?"selected":""}>${x}</option>`).join("")}</select></label><label>프로필 사진<button data-image="photo">사진 선택</button></label><label>지도용 캐릭터 아이콘<button data-image="icon">투명 아이콘 선택</button><small>테두리 없이 사각형 스프라이트로 표시돼요.</small></label><label>기상 시각<input type="time" data-field="wake" value="${c.wake}"></label><label>취침 시각<input type="time" data-field="sleep" value="${c.sleep}"></label><label>대표 테마색<input type="color" data-color="primary" value="${c.theme.primary}"></label><label>그라데이션 보조색<input type="color" data-color="secondary" value="${c.theme.secondary}"></label></div><label class="check"><input type="checkbox" data-gradient ${c.theme.gradient?"checked":""}> 보조색으로 그라데이션 사용</label>${chips("입맛",TASTES,c.tastes,"tastes")}${chips("관심사",INTERESTS,c.interests,"interests")}${chips("취미",HOBBIES,c.hobbies,"hobbies")}<button class="primary" data-save>캐릭터 저장</button></section></div>`}
function chips(title,all,selected,key){return `<section class="chips"><h3>${title}</h3>${all.map(x=>`<button data-chip="${key}" data-value="${x}" class="${selected.includes(x)?"on":""}">${x}</button>`).join("")}</section>`}
function relationship(){return `<section class="panel form"><div class="title"><h1>관계</h1><button data-rel>+ 관계 추가</button></div>${Object.values(state.relationships).map(r=>{const a=state.characters[r.a],b=state.characters[r.b];return a&&b?`<article class="relation" style="--a:${a.theme.primary};--b:${b.theme.primary}"><h2>${esc(a.name)} × ${esc(b.name)}</h2><p>${esc(r.type)} · ${r.cohabit?"함께 거주":"따로 거주"}</p></article>`:""}).join("")}</section>`}
function routine(){return `<section class="panel form"><h1>주간 루틴</h1><p>다음 업데이트에서 시각형 시간표 편집기로 연결됩니다.</p></section>`}
function town(){return `<div class="town-edit"><div class="world"><img src="${state.world.bg}" class="world-bg">${state.world.places.map(placeCard).join("")}</div><aside class="panel form"><h2>마을 편집</h2><label>마을 이름<input data-world-name value="${esc(state.world.name)}"></label><label>기본 배경<select data-world-bg><option value="world-assets/cozy-town.png" ${state.world.bg.includes("cozy")?"selected":""}>개발자 그림 · 마을</option><option value="world-assets/downtown.png" ${state.world.bg.includes("downtown")?"selected":""}>개발자 그림 · 도시</option></select></label><p>건물은 이 탭에서만 끌어 배치할 수 있어요.</p><button data-add-place>+ 건물 추가</button></aside></div>`}
function settings(){return `<section class="panel form"><h1>설정</h1><p>Google 계정에 로그인하면 같은 계정의 기기끼리 자동 동기화됩니다.</p><button onclick="localStorage.removeItem('${KEY}');location.reload()">모든 데이터 초기화</button></section>`}
function view(){if(!state.order.length)return `<section class="panel empty"><h1>첫 캐릭터를 만들어 주세요</h1><p>로그인 전에는 예시 캐릭터나 실제 지역이 표시되지 않아요.</p><button class="primary" data-new>+ 캐릭터 만들기</button></section>`;return ({observe,home,character,relationship,routine,town,settings}[state.activeTab])()}
function render(){if(state.activeId&&!state.characters[state.activeId])state.activeId=state.order[0]||null;setTheme();$("#app").innerHTML=`${header()}<main>${view()}</main>`;bind();setTheme()}
function bind(){
  $$("[data-tab]").forEach(b=>b.onclick=()=>{state.activeTab=b.dataset.tab;save();render()});
  $$("[data-new]").forEach(b=>b.onclick=createCharacter);
  $$("[data-edit]").forEach(b=>b.onclick=()=>{state.activeId=b.dataset.edit;save();render()});
  $$("[data-roster]").forEach(b=>b.onclick=()=>selectObserved(b.dataset.roster));
  $$("[data-person]").forEach(b=>b.onclick=()=>selectObserved(b.dataset.person));
  $$("[data-field]").forEach(i=>i.oninput=()=>{active()[i.dataset.field]=i.value});
  $$("[data-color]").forEach(i=>i.oninput=()=>{active().theme[i.dataset.color]=i.value;setTheme()});
  $("[data-gradient]")?.addEventListener("change",e=>{active().theme.gradient=e.target.checked;setTheme()});
  $$("[data-chip]").forEach(b=>b.onclick=()=>{const c=active(),k=b.dataset.chip,v=b.dataset.value;c[k]=c[k].includes(v)?c[k].filter(x=>x!==v):[...c[k],v];save();render()});
  $("[data-save]")?.addEventListener("click",()=>{save();render()});
  $$("[data-image]").forEach(b=>b.onclick=()=>{pendingImage={type:b.dataset.image,id:active().id};$("#image-picker").click()});
  $$("[data-home-bg]").forEach(b=>b.onclick=()=>{pendingImage={type:"home",id:b.dataset.homeBg};$("#image-picker").click()});
  $("#account")?.addEventListener("click",()=>window.ParallelCityAuth?.toggle());
  $("[data-world-name]")?.addEventListener("input",e=>{state.world.name=e.target.value;save()});
  $("[data-world-bg]")?.addEventListener("change",e=>{state.world.bg=e.target.value;save();render()});
  $("[data-rel]")?.addEventListener("click",addRelation);
  $("[data-add-place]")?.addEventListener("click",addPlace);
  if(state.activeTab==="town")dragPlaces();
  setupViewport();
}
function selectObserved(id){state.activeId=id;const e=eventFor(active());if(e.home){state.activeTab="home";save();render();setTimeout(()=>document.querySelector(".home")?.scrollIntoView({behavior:"smooth"}),0)}else{save();render();setTimeout(focusCharacter,0)}}
function focusCharacter(){const c=active(),e=eventFor(c),p=state.world.places.find(x=>x.id===e.placeId),vp=$(".viewport");if(p&&vp)vp.scrollTo({left:1200*p.x/100-vp.clientWidth/2,top:760*p.y/100-vp.clientHeight/2,behavior:"smooth"})}
function addRelation(){if(state.order.length<2)return alert("캐릭터가 두 명 이상 필요해요.");const a=active(),b=state.characters[state.order.find(x=>x!==a.id)],id=uid();state.relationships[id]={id,a:a.id,b:b.id,type:"친구",cohabit:false};save();render()}
function addPlace(){const name=prompt("건물 이름","새 건물");if(!name)return;state.world.places.push({id:uid(),name,type:prompt("종류","상점")||"상점",emoji:"🏬",x:50,y:50,color:"#8ecbc0"});save();render()}
function dragPlaces(){$$(".town-edit .place").forEach(el=>el.onpointerdown=e=>{el.setPointerCapture(e.pointerId);el.onpointermove=ev=>{const r=el.parentElement.getBoundingClientRect(),p=state.world.places.find(x=>x.id===el.dataset.place);p.x=Math.max(4,Math.min(96,(ev.clientX-r.left)/r.width*100));p.y=Math.max(5,Math.min(95,(ev.clientY-r.top)/r.height*100));el.style.left=p.x+"%";el.style.top=p.y+"%"};el.onpointerup=()=>{el.onpointermove=null;save()}})}
function setupViewport(){
  const vp=$(".viewport"),world=vp?.querySelector(".world");
  if(!vp||!world)return;
  let scale=1,last=0,points=new Map();
  const apply=v=>{scale=Math.max(.65,Math.min(2,v));world.style.zoom=scale};
  $$("[data-zoom]").forEach(b=>b.onclick=()=>{
    apply(b.dataset.zoom==="0" ? 1 : scale+(b.dataset.zoom==="+" ? .15 : -.15));
    if(b.dataset.zoom==="0")vp.scrollTo(0,0);
  });
  vp.onpointerdown=e=>{points.set(e.pointerId,{x:e.clientX,y:e.clientY});vp.setPointerCapture(e.pointerId)};
  vp.onpointermove=e=>{
    const old=points.get(e.pointerId);if(!old)return;
    points.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(points.size===1){vp.scrollLeft-=e.clientX-old.x;vp.scrollTop-=e.clientY-old.y}
    else{const a=[...points.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(last)apply(scale*d/last);last=d}
  };
  vp.onpointerup=vp.onpointercancel=e=>{points.delete(e.pointerId);last=0};
}
$("#image-picker").onchange=e=>{const f=e.target.files[0],task=pendingImage;if(!f||!task)return;resizeImage(f,task.type==="home"?1200:650,task.type==="icon"?"image/png":"image/webp",data=>{if(task.type==="home")state.homes[task.id].background=data;else state.characters[task.id][task.type]=data;save();render()});e.target.value=""};
function resizeImage(file,max,type,done){const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const q=Math.min(1,max/Math.max(im.width,im.height)),cv=document.createElement("canvas");cv.width=Math.round(im.width*q);cv.height=Math.round(im.height*q);const x=cv.getContext("2d");x.drawImage(im,0,0,cv.width,cv.height);done(cv.toDataURL(type,.76))};im.src=r.result};r.readAsDataURL(file)}
window.ParallelCity={getState:()=>clone(state),replaceState:x=>{if(x?.schema!==2)return;state=clone(x);localStorage.setItem(KEY,JSON.stringify(state));render()},setAccountStatus:t=>{accountStatus=t;if($("#account"))$("#account").textContent=t}};
setInterval(()=>{if(["observe","home"].includes(state.activeTab))render()},60000);
render();
})();
