(() => {
  "use strict";
  const KEY="parallel-city-clean-v1";
  const $=s=>document.querySelector(s);
  const clone=o=>JSON.parse(JSON.stringify(o));
  const id=()=>crypto.randomUUID?.()||Date.now()+"-"+Math.random();
  const TODAY=()=>new Date().toISOString().slice(0,10);
  const TASTES=["아재 입맛","어린이 입맛","맵부심","한식파","면 요리 선호","디저트광","커피 못 마심","신상 맛집파"];
  const INTERESTS=["향수","애니메이션","만화","게임","패션","미술","음악","영화","문구","인테리어","역사","기계"];
  const HOBBIES=["취미 없음","집에서 뒹굴기","외출 안 함","인터넷 서핑","커뮤니티 눈팅","영상 정주행","낮잠","덕질","독서","카페 탐방","쇼핑","운동","사진","전시 관람","공방 체험","산책","요리","청소","악기","보드게임","코딩","여행 계획","반려동물 돌보기"];
  const defaultState=()=>({schema:1,activeTab:"observe",activeId:null,characters:{},order:[],relationships:{},worlds:{w1:{id:"w1",name:"평행마을",district:"중심 구역",area:"중심 거리",bg:"world-assets/cozy-town.png",places:[
    {id:"p1",name:"달무리 카페",type:"카페",emoji:"☕",x:13,y:30,color:"#76c7bd"},
    {id:"p2",name:"달무리 식당",type:"음식점",emoji:"🍽️",x:55,y:19,color:"#85c779"},
    {id:"p3",name:"평행 오피스",type:"회사",emoji:"🏢",x:72,y:34,color:"#8b9cf0"},
    {id:"p4",name:"새봄 의원",type:"병원",emoji:"🩺",x:20,y:60,color:"#6fb8eb"},
    {id:"p5",name:"별꼬리 공원",type:"공원",emoji:"🌳",x:62,y:73,color:"#68c889"}]}},worldOrder:["w1"],homes:{},routines:{},settings:{dark:false,pace:30},lastSaved:null});
  let state=load(), pendingFile=null;
  function load(){try{const x=JSON.parse(localStorage.getItem(KEY));return x?.schema===1?x:defaultState()}catch{return defaultState()}}
  let saveTimer; function save(){clearTimeout(saveTimer);saveTimer=setTimeout(()=>{state.lastSaved=Date.now();localStorage.setItem(KEY,JSON.stringify(state));renderSave()},180)}
  function renderSave(){const el=$("#save-state");if(el)el.textContent="● 기기에 저장됨"}
  function active(){return state.characters[state.activeId]||null}
  function theme(){const c=active();document.documentElement.style.setProperty("--p",c?.theme?.primary||"#176b60");document.documentElement.style.setProperty("--s",c?.theme?.gradient&&c?.theme?.secondary?c.theme.secondary:c?.theme?.primary||"#6fd0ae")}
  function esc(x=""){return String(x).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
  function initials(n="새"){return esc(n.trim().slice(0,1)||"새")}
  function avatar(c,cls=""){return c?.icon||c?.photo?`<img class="avatar ${cls}" src="${c.icon||c.photo}" alt="">`:`<span class="avatar ${cls}">${initials(c?.name)}</span>`}
  function toast(t){document.body.insertAdjacentHTML("beforeend",`<div class="toast">${esc(t)}</div>`);setTimeout(()=>document.querySelector(".toast")?.remove(),1800)}
  function newCharacter(){const cid=id(), c={id:cid,name:"새 캐릭터",job:"무직",customJob:"",mood:"평온함",photo:"",icon:"",theme:{primary:"#176b60",secondary:"#6fd0ae",gradient:true},tastes:[],interests:[],hobbies:[],wake:"07:30",sleep:"00:30",outing:3,homeId:"",workPlaceId:"",pet:{type:"없음",name:"",breed:"",color:"",photo:""},special:[]};state.characters[cid]=c;state.order.push(cid);state.routines[cid]=[];state.activeId=cid;state.activeTab="character";save();render()}
  function deleteCharacter(cid){if(!confirm("이 캐릭터를 삭제할까요?"))return;delete state.characters[cid];delete state.routines[cid];state.order=state.order.filter(x=>x!==cid);state.activeId=state.order[0]||null;save();render()}
  function characterEvent(c,now=new Date()){
    const mins=now.getHours()*60+now.getMinutes(), wake=hm(c.wake||"07:30"), sleep=hm(c.sleep||"00:30");
    const routine=(state.routines[c.id]||[]).filter(r=>r.day===now.getDay()).sort((a,b)=>hm(a.start)-hm(b.start)).find(r=>mins>=hm(r.start)&&mins<hm(r.end));
    if(routine)return {title:routine.activity,placeId:routine.placeId||null,home:false,time:routine.start,desc:`고정 루틴 · ${routine.start}–${routine.end}`};
    if(mins<wake||(sleep>wake?mins>=sleep:false))return {title:"집에서 자는 중",home:true,time:c.sleep,desc:"다음 일정 전까지 푹 쉬고 있어요."};
    const slots=[{at:wake,title:"기상",home:true},{at:720,title:"점심",type:"음식점"},{at:1080,title:"가벼운 외출",type:pickType(c)},{at:sleep-50,title:"귀가 후 휴식",home:true}];
    let s=slots[0];for(const x of slots)if(mins>=x.at)s=x;
    if(s.home)return {title:s.title,home:true,time:toHM(s.at),desc:homeAction(c,s.title)};
    const p=places().find(x=>x.type===s.type)||places()[hash(c.id+TODAY()+s.at)%Math.max(1,places().length)];
    return {title:p?`${p.name} 방문`:"동네 산책",placeId:p?.id,home:false,time:toHM(s.at),desc:p?`${p.name}에서 ${activityFor(p,c)}.`:"동네를 천천히 둘러보는 중이에요."};
  }
  function hm(s){const [h,m]=String(s).split(":").map(Number);return h*60+(m||0)}
  function toHM(m){m=(m+1440)%1440;return `${String(Math.floor(m/60)).padStart(2,"0")}:${String(m%60).padStart(2,"0")}`}
  function hash(s){let h=0;for(const x of s)h=(h*31+x.charCodeAt())>>>0;return h}
  function pickType(c){if(c.interests.includes("향수"))return "공방";if(c.hobbies.includes("카페 탐방"))return "카페";if(c.hobbies.includes("운동"))return "운동 시설";return ["카페","공원","서점","쇼핑몰"][hash(c.id+TODAY())%4]}
  function activityFor(p,c){if(p.type==="음식점")return "좋아하는 메뉴를 골라 식사하는 중";if(p.type==="카페")return "음료를 마시며 시간을 보내는 중";if(p.type==="회사")return "맡은 일을 처리하는 중";if(p.type==="병원")return "진료를 기다리는 중";return `${c.hobbies[0]||"가벼운 외출"}을 즐기는 중`}
  function homeAction(c,title){if(title.includes("자"))return "침실에서 이불을 덮고 자는 중";const a=c.hobbies.includes("청소")?"거실을 정리하고 바닥을 닦는 중":c.hobbies.includes("요리")?"주방에서 간단한 요리를 만드는 중":"소파에서 편하게 쉬는 중";return a}
  function places(){return Object.values(state.worlds)[0]?.places||[]}
  function currentPlace(c){const e=characterEvent(c);return e.home?null:places().find(p=>p.id===e.placeId)}
  function render(){
    theme();const tabs=[["observe","관찰"],["home","집"],["character","캐릭터"],["relationship","관계"],["routine","주간 루틴"],["town","마을"],["settings","설정"]];
    $("#app").innerHTML=`<div class="shell"><header class="top"><div class="brand"><div class="logo">🏙</div><div><h1>평행도시</h1><small>캐릭터 생활 관찰 게임</small></div></div><nav>${tabs.map(([k,n])=>`<button class="nav ${state.activeTab===k?"active":""}" data-tab="${k}">${n}</button>`).join("")}</nav><div class="save-state" id="save-state">● 기기에 저장됨</div></header><main class="main">${view()}</main></div>`;bind();theme()
  }
  function view(){if(!state.order.length&&state.activeTab!=="settings")return `<div class="panel empty"><h2>아직 캐릭터가 없어요</h2><p>첫 캐릭터를 만들면 평행도시의 시간이 흐르기 시작해요.</p><button class="btn primary" data-new>+ 캐릭터 만들기</button></div>`;return ({observe,home,character,relationship,routine,town,settings}[state.activeTab]||observe)()}
  function roster(){return `<div class="roster">${state.order.map(cid=>{const c=state.characters[cid],e=characterEvent(c);return `<button class="char-chip ${cid===state.activeId?"active":""}" data-select="${cid}" style="--own:${c.theme.primary}">${avatar(c)}<span><b>${esc(c.name)}</b><br><small class="sub">${esc(e.title)}</small></span></button>`}).join("")}</div>`}
  function observe(){const c=active(),e=characterEvent(c),p=currentPlace(c),w=Object.values(state.worlds)[0];return `${roster()}<div class="observe-grid"><section class="world panel"><img class="world-bg" src="${w.bg}" alt=""><div class="world-tools"><div class="glass"><small>현재 시각</small><br><b>${new Date().toLocaleString("ko-KR",{hour:"2-digit",minute:"2-digit",month:"long",day:"numeric",weekday:"short"})}</b></div><div class="glass"><small>관찰 중</small><br><b>${esc(c.name)} · ${esc(e.title)}</b></div></div><div class="places">${w.places.map(placeHTML).join("")}</div><div class="people">${state.order.map(cid=>personHTML(state.characters[cid])).join("")}</div></section><aside><div class="detail panel"><div class="hero">${c.photo?`<img src="${c.photo}" alt="">`:`<span class="fallback">${initials(c.name)}</span>`}</div><span class="mood">${esc(c.mood)}</span><h2>${esc(c.name)}</h2><div class="sub">${esc(c.job)}</div><div class="scene"><small>CURRENT SCENE</small><h3>${esc(e.title)}</h3><p class="sub">${esc(e.desc)}</p>${p?`<b>📍 ${esc(p.name)} · ${esc(w.name)}</b>`:"<b>🏠 집 안</b>"}</div></div><div class="log panel">${logHTML(c)}</div></aside></div>`}
  function placeHTML(p){return `<div class="place" style="left:${p.x}%;top:${p.y}%;--place:${p.color}" data-place="${p.id}"><div class="emoji">${p.emoji}</div><b>${esc(p.name)}</b><div>${esc(p.type)}</div></div>`}
  function personHTML(c){const e=characterEvent(c);if(e.home)return"";const p=places().find(x=>x.id===e.placeId);if(!p)return"";return `<div class="person" style="left:${p.x}%;top:${p.y}%;--own:${c.theme.primary}" data-focus="${c.id}">${avatar(c)}<span><b>${esc(c.name)}</b><br><small>${esc(e.title)}</small></span></div>`}
  function logHTML(c){const now=new Date(),e=characterEvent(c);return `<h2>오늘의 생활 로그</h2><div class="log-item"><span>${c.wake}</span><div><b>기상</b><br><small>집에서 하루를 시작함</small></div></div><div class="log-item"><span>${e.time}</span><div><b>${esc(e.title)}</b><br><small>${esc(e.desc)}</small></div></div>`}
  function home(){const groups=[];state.order.forEach(cid=>{const c=state.characters[cid],hid=c.homeId||c.id;let g=groups.find(x=>x.id===hid);if(!g){g={id:hid,owner:c,chars:[]};groups.push(g)}g.chars.push(c)});return `<div class="side-title"><h1>우리 집 생활</h1></div><div class="home-grid">${groups.map(g=>homeCard(g)).join("")}</div>`}
  function homeCard(g){const atHome=g.chars.filter(c=>characterEvent(c).home);return `<section class="home panel"><h2>🏠 ${esc(g.owner.name)}의 집 <span style="float:right">${atHome.length}명 귀가</span></h2><div class="sub">${g.chars.map(c=>c.name).join(" · ")} 거주 중</div><p>청결도 · 반짝반짝 깨끗함</p><div class="clean"><i style="width:86%"></i></div><div class="rooms"><div class="room"><b class="room-name">거실</b>${atHome.filter((_,i)=>i%3===0).map(occ).join("")}</div><div class="room"><b class="room-name">주방</b>${atHome.filter((_,i)=>i%3===1).map(occ).join("")}</div><div class="room"><b class="room-name">침실</b>${atHome.filter((_,i)=>i%3===2).map(occ).join("")}</div><div class="room"><b class="room-name">욕실</b></div></div></section>`}
  function occ(c){return `<div class="occupant">${avatar(c)}<span><b>${esc(c.name)}</b><br><small>${esc(characterEvent(c).desc)}</small></span></div>`}
  function character(){const c=active();return `<div class="two"><aside class="side panel"><div class="side-title"><h2>캐릭터 목록</h2><button class="btn primary" data-new>+ 생성</button></div>${state.order.map(cid=>{const x=state.characters[cid];return `<button class="list-card ${cid===c.id?"active":""}" data-edit="${cid}">${avatar(x)}<span><b>${esc(x.name)}</b><br><small>${esc(x.job)}</small></span></button>`}).join("")}</aside><section class="form panel"><h2>프로필</h2><div class="fields"><div class="field"><label>캐릭터 이름</label><input data-c="name" value="${esc(c.name)}"></div><div class="field"><label>직업</label><input data-c="job" value="${esc(c.job)}"></div><div class="field"><label>프로필 사진</label><button class="btn" data-photo="photo">사진 선택</button></div><div class="field"><label>지도용 캐릭터 아이콘 (선택)</label><button class="btn" data-photo="icon">아이콘 선택</button></div><div class="field"><label>기상 시각</label><input type="time" data-c="wake" value="${c.wake}"></div><div class="field"><label>취침 시각</label><input type="time" data-c="sleep" value="${c.sleep}"></div><div class="field"><label>대표 테마색</label><input type="color" data-theme="primary" value="${c.theme.primary}"></div><div class="field"><label>그라데이션 보조색</label><input type="color" data-theme="secondary" value="${c.theme.secondary}"></div><div class="wide"><label><input type="checkbox" data-theme-check ${c.theme.gradient?"checked":""}> 보조색으로 그라데이션 사용</label></div></div>${chips("입맛",TASTES,c.tastes,"tastes")}${chips("관심사",INTERESTS,c.interests,"interests")}${chips("취미",HOBBIES,c.hobbies,"hobbies")}<div class="actions"><button class="btn primary" data-save-char>캐릭터 저장</button><button class="btn danger" data-delete-char="${c.id}">삭제</button></div></section></div>`}
  function chips(title,all,on,key){return `<div class="section"><h3>${title}</h3><div class="chips">${all.map(x=>`<button class="chip ${on.includes(x)?"on":""}" data-chip="${key}" data-value="${esc(x)}">${esc(x)}</button>`).join("")}</div></div>`}
  function relationship(){const rs=Object.values(state.relationships);return `<div class="side-title"><h1>관계</h1><button class="btn primary" data-add-rel>+ 관계 추가</button></div><div class="relationship-grid">${rs.length?rs.map(r=>{const a=state.characters[r.a],b=state.characters[r.b];if(!a||!b)return"";return `<section class="relation panel" style="--a:${a.theme.primary};--b:${b.theme.primary}"><h2>${esc(a.name)} × ${esc(b.name)}</h2><p>${esc(r.type)} · ${r.cohabit?"함께 거주":"따로 거주"}</p><p>친밀도 ${r.like} · 갈등도 ${r.conflict}</p><button class="btn" data-edit-rel="${r.id}">편집</button> <button class="btn danger" data-del-rel="${r.id}">삭제</button></section>`}).join(""):`<div class="panel empty">관계를 추가하면 함께 외출하거나 같은 집에서 생활해요.</div>`}</div>`}
  function routine(){const c=active(),days=["일","월","화","수","목","금","토"];return `${roster()}<div class="panel form"><div class="side-title"><h2>${esc(c.name)}의 주간 시간표</h2><button class="btn primary" data-add-routine>+ 일정 추가</button></div><div class="routine-scroll"><div class="week">${days.map((d,i)=>`<div class="day"><b>${d}요일</b>${(state.routines[c.id]||[]).filter(r=>r.day===i).map(r=>`<div class="event">${r.start}–${r.end}<br><b>${esc(r.activity)}</b><button class="btn" style="padding:3px 7px" data-del-routine="${r.id}">×</button></div>`).join("")}</div>`).join("")}</div></div></div>`}
  function town(){const w=Object.values(state.worlds)[0];return `<div class="town-edit"><section class="edit-canvas panel"><img class="world-bg" src="${w.bg}" alt=""><div class="places">${w.places.map(placeHTML).join("")}</div></section><aside class="form panel"><h2>마을 편집</h2><div class="field"><label>마을 이름</label><input data-world="name" value="${esc(w.name)}"></div><div class="field"><label>배경 그림</label><select data-world="bg"><option value="world-assets/cozy-town.png" ${w.bg.includes("cozy")?"selected":""}>포근한 마을</option><option value="world-assets/downtown.png" ${w.bg.includes("downtown")?"selected":""}>번화가</option></select></div><p class="sub">건물을 끌어 원하는 위치에 놓을 수 있어요.</p><button class="btn primary" data-add-place>+ 건물 추가</button><div>${w.places.map(p=>`<div class="list-card"><span>${p.emoji}</span><span><b>${esc(p.name)}</b><br><small>${esc(p.type)}</small></span><button class="btn danger" data-del-place="${p.id}">삭제</button></div>`).join("")}</div></aside></div>`}
  function settings(){return `<section class="settings panel"><h1>설정과 백업</h1><p>Google 로그인이나 외부 지도 없이 이 기기에 자동 저장됩니다. 다른 기기로 옮길 때는 백업 파일을 사용해 주세요.</p><div class="actions"><button class="btn primary" data-export>데이터 내보내기</button><button class="btn" data-import>데이터 불러오기</button><button class="btn danger" data-reset>모든 데이터 초기화</button></div><div class="section"><h2>이 버전의 원칙</h2><ul><li>캐릭터별 취향·관심사·색상은 서로 완전히 분리</li><li>관찰·집·로그는 동일한 현재 일정만 표시</li><li>캐릭터 자동 전환 없음</li><li>Google Maps·Places·Firebase 호출 없음</li></ul></div></section>`}
  function bind(){
    document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>{state.activeTab=b.dataset.tab;save();render()});
    document.querySelectorAll("[data-new]").forEach(b=>b.onclick=newCharacter);
    document.querySelectorAll("[data-select]").forEach(b=>b.onclick=()=>{state.activeId=b.dataset.select;save();render()});
    document.querySelectorAll("[data-focus]").forEach(b=>b.onclick=()=>{state.activeId=b.dataset.focus;save();render()});
    document.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>{state.activeId=b.dataset.edit;save();render()});
    document.querySelectorAll("[data-c]").forEach(i=>i.oninput=()=>{active()[i.dataset.c]=i.value});
    document.querySelectorAll("[data-theme]").forEach(i=>i.oninput=()=>{active().theme[i.dataset.theme]=i.value;theme()});
    document.querySelector("[data-theme-check]")?.addEventListener("change",e=>{active().theme.gradient=e.target.checked;theme()});
    document.querySelectorAll("[data-chip]").forEach(b=>b.onclick=()=>{const c=active(),k=b.dataset.chip,v=b.dataset.value;c[k]=c[k].includes(v)?c[k].filter(x=>x!==v):[...c[k],v];save();render()});
    document.querySelector("[data-save-char]")?.addEventListener("click",()=>{save();render();toast("캐릭터가 바로 저장됐어요")});
    document.querySelector("[data-delete-char]")?.addEventListener("click",e=>deleteCharacter(e.currentTarget.dataset.deleteChar));
    document.querySelectorAll("[data-photo]").forEach(b=>b.onclick=()=>{pendingFile=b.dataset.photo;$("#file-picker").click()});
    $("#file-picker").onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{active()[pendingFile]=r.result;save();render();toast("사진을 저장했어요")};r.readAsDataURL(f);e.target.value=""};
    document.querySelector("[data-add-rel]")?.addEventListener("click",addRelation);
    document.querySelectorAll("[data-del-rel]").forEach(b=>b.onclick=()=>{delete state.relationships[b.dataset.delRel];save();render()});
    document.querySelectorAll("[data-edit-rel]").forEach(b=>b.onclick=()=>editRelation(b.dataset.editRel));
    document.querySelector("[data-add-routine]")?.addEventListener("click",addRoutine);
    document.querySelectorAll("[data-del-routine]").forEach(b=>b.onclick=()=>{const c=active();state.routines[c.id]=state.routines[c.id].filter(r=>r.id!==b.dataset.delRoutine);save();render()});
    document.querySelector("[data-add-place]")?.addEventListener("click",addPlace);
    document.querySelectorAll("[data-del-place]").forEach(b=>b.onclick=()=>{const w=Object.values(state.worlds)[0];w.places=w.places.filter(p=>p.id!==b.dataset.delPlace);save();render()});
    document.querySelectorAll("[data-world]").forEach(i=>i.onchange=()=>{Object.values(state.worlds)[0][i.dataset.world]=i.value;save();render()});
    dragPlaces();
    document.querySelector("[data-export]")?.addEventListener("click",exportData);
    document.querySelector("[data-import]")?.addEventListener("click",()=>$("#import-picker").click());
    $("#import-picker").onchange=importData;
    document.querySelector("[data-reset]")?.addEventListener("click",()=>{if(confirm("모든 데이터를 지울까요?")){state=defaultState();localStorage.removeItem(KEY);render()}});
  }
  function addRelation(){if(state.order.length<2)return toast("캐릭터가 두 명 이상 필요해요");const a=prompt("첫 번째 캐릭터 이름"),b=prompt("두 번째 캐릭터 이름"),ca=state.order.map(x=>state.characters[x]).find(x=>x.name===a),cb=state.order.map(x=>state.characters[x]).find(x=>x.name===b);if(!ca||!cb||ca===cb)return toast("이름을 정확히 입력해 주세요");const rid=id();state.relationships[rid]={id:rid,a:ca.id,b:cb.id,type:prompt("관계 유형 (연인, 부부, 친구, 짝사랑 등)","친구")||"친구",cohabit:confirm("함께 거주하나요?"),like:75,conflict:20};if(state.relationships[rid].cohabit)cb.homeId=ca.homeId||ca.id;save();render()}
  function editRelation(rid){const r=state.relationships[rid];r.type=prompt("관계 유형",r.type)||r.type;r.like=Number(prompt("친밀도",r.like))||r.like;r.conflict=Number(prompt("갈등도",r.conflict))||r.conflict;save();render()}
  function addRoutine(){const c=active(),day=Number(prompt("요일 숫자 (일=0, 월=1 ... 토=6)","1")),start=prompt("시작 시각","09:00"),end=prompt("종료 시각","18:00"),activity=prompt("무엇을 하나요?","직장에서 일하는 중");if(day<0||day>6||!start||!end||!activity)return;const overlap=(state.routines[c.id]||[]).some(r=>r.day===day&&hm(start)<hm(r.end)&&hm(end)>hm(r.start));if(overlap)return toast("이미 겹치는 일정이 있어요");state.routines[c.id].push({id:id(),day,start,end,activity,placeId:null});save();render()}
  function addPlace(){const w=Object.values(state.worlds)[0],name=prompt("건물 이름","새 건물");if(!name)return;const type=prompt("종류","카페")||"기타";w.places.push({id:id(),name,type,emoji:"🏬",x:50,y:50,color:"#8ecbc0"});save();render()}
  function dragPlaces(){if(state.activeTab!=="town")return;document.querySelectorAll(".edit-canvas .place").forEach(el=>{el.onpointerdown=e=>{el.setPointerCapture(e.pointerId);el.onpointermove=ev=>{const r=el.parentElement.parentElement.getBoundingClientRect(),p=Object.values(state.worlds)[0].places.find(x=>x.id===el.dataset.place);p.x=Math.max(5,Math.min(95,(ev.clientX-r.left)/r.width*100));p.y=Math.max(7,Math.min(93,(ev.clientY-r.top)/r.height*100));el.style.left=p.x+"%";el.style.top=p.y+"%"};el.onpointerup=()=>{el.onpointermove=null;save()}}})}
  function exportData(){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:"application/json"}));a.download=`평행도시-백업-${TODAY()}.json`;a.click();URL.revokeObjectURL(a.href)}
  function importData(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);if(x.schema!==1)throw 0;state=x;localStorage.setItem(KEY,JSON.stringify(state));render();toast("백업을 불러왔어요")}catch{toast("이 백업 파일은 읽을 수 없어요")}};r.readAsText(f)}
  window.addEventListener("storage",e=>{if(e.key===KEY&&e.newValue){state=JSON.parse(e.newValue);render()}});
  setInterval(()=>{if(state.activeTab==="observe"||state.activeTab==="home")render()},60000);
  render();
})();
