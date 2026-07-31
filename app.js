const $ = (s, p = document) => p.querySelector(s);
const uid = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
const clone = (v) => JSON.parse(JSON.stringify(v));
const KEY = "parallel-city-clean-v1";

const starter = {
  tab: "observe",
  selected: "",
  characters: [],
  relations: [],
  towns: [{
    id: uid(), name: "평행마을", color: "#287d6c",
    buildings: [
      { id: uid(), name: "달무리 카페", type: "카페", x: 18, y: 34, image: "" },
      { id: uid(), name: "달무리 식당", type: "음식점", x: 52, y: 22, image: "" },
      { id: uid(), name: "평행 오피스", type: "회사", x: 82, y: 37, image: "" },
      { id: uid(), name: "새봄 의원", type: "병원", x: 25, y: 72, image: "" },
      { id: uid(), name: "별꼬리 공원", type: "공원", x: 67, y: 75, image: "" }
    ]
  }],
  selectedTown: "",
  homes: [],
  catalog: [
    { id: uid(), name: "아인슈페너", category: "음료", kind: "커피", sweet: "달콤함", spicy: "안 매움", image: "" },
    { id: uid(), name: "게살버거", category: "음식", kind: "양식", sweet: "보통", spicy: "순한맛", image: "" }
  ]
};

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && Array.isArray(saved.characters)) return normalize(saved);
  } catch {}
  return normalize(clone(starter));
}
function normalize(s) {
  s.tab ||= "observe";
  s.characters ||= [];
  s.relations ||= [];
  s.towns ||= clone(starter.towns);
  s.homes ||= [];
  s.catalog ||= clone(starter.catalog);
  s.selectedTown ||= s.towns[0]?.id || "";
  s.selected ||= s.characters[0]?.id || "";
  for (const c of s.characters) {
    c.preferences ||= { tastes: [], foods: [], drinks: [], music: [], hobbies: [] };
    for (const k of Object.keys(c.preferences)) c.preferences[k] = [...(c.preferences[k] || [])];
  }
  return s;
}
let state = load();
let draft = null;
let saveTimer;
const navItems = [
  ["observe", "관찰"], ["homes", "집"], ["characters", "캐릭터"],
  ["relations", "관계"], ["routine", "주간 루틴"], ["catalog", "취향 사전"],
  ["towns", "마을"], ["settings", "설정"]
];

function save() {
  clearTimeout(saveTimer);
  $("#saveState").textContent = "저장 중";
  saveTimer = setTimeout(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
    $("#saveState").textContent = "기기에 저장됨";
  }, 80);
}
function esc(v = "") {
  return String(v).replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
}
function selected() { return state.characters.find(c => c.id === state.selected) || state.characters[0]; }
function town() { return state.towns.find(t => t.id === state.selectedTown) || state.towns[0]; }
function initials(name = "새") { return name.trim().slice(0, 1) || "새"; }
function avatar(c, cls = "") {
  const src = c?.icon || c?.photo;
  return src ? `<img class="avatar ${c.icon ? "icon" : ""} ${cls}" src="${esc(src)}">`
    : `<span class="avatar ${cls}" style="background:${c?.color || "#287d6c"}">${esc(initials(c?.name))}</span>`;
}
function applyTheme() {
  const c = selected();
  document.documentElement.style.setProperty("--main", c?.color || "#287d6c");
  document.documentElement.style.setProperty("--sub", c?.subColor || c?.color || "#68d2b4");
}
function go(tab) { state.tab = tab; save(); render(); }

function render() {
  applyTheme();
  $("#nav").innerHTML = navItems.map(([id, label]) =>
    `<button data-tab="${id}" class="${state.tab === id ? "active" : ""}">${label}</button>`).join("");
  const views = {
    observe: renderObserve, homes: renderHomes, characters: renderCharacters,
    relations: renderRelations, routine: renderRoutine, catalog: renderCatalog,
    towns: renderTowns, settings: renderSettings
  };
  $("#app").innerHTML = (views[state.tab] || renderObserve)();
  bindView();
}

function activity(c, date = new Date()) {
  const mins = date.getHours() * 60 + date.getMinutes();
  const [wh, wm] = (c.wake || "07:30").split(":").map(Number);
  const [sh, sm] = (c.sleep || "00:30").split(":").map(Number);
  const wake = wh * 60 + wm, sleep = sh * 60 + sm;
  if (mins < wake || (sleep < 360 && mins >= sleep)) return { title: "자는 중", place: "home", detail: "설정한 수면 시간에 맞춰 푹 자고 있어요." };
  if (c.job && c.job !== "무직" && mins >= 540 && mins < 1200) {
    if (mins >= 720 && mins < 800) return visit(c, "음식점", "점심");
    return { title: `${c.job} 업무 중`, place: c.workplace || "work", detail: `${c.displayJob || c.job}의 평일 일과를 보내고 있어요.` };
  }
  if (mins >= 1800 / 2 && mins < 1320) return visit(c, c.hobbies?.includes("카페 탐방") ? "카페" : "공원", "외출");
  return { title: "집에서 생활 중", place: "home", detail: homeDetail(c) };
}
function visit(c, type, verb) {
  const buildings = state.towns.flatMap(t => t.buildings.map(b => ({ ...b, townId: t.id })));
  const b = buildings.find(x => x.type === type) || buildings[0];
  if (!b) return { title: "동네 산책 중", place: "outside", detail: "가볍게 바람을 쐬고 있어요." };
  const companion = companionFor(c);
  const item = state.catalog.find(x => type === "카페" ? x.category === "음료" : x.category === "음식");
  const withText = companion ? `${companion.name}와 함께 ` : "";
  const itemText = item ? ` ${item.name}${item.category === "음료" ? "를 마시는 중" : "을 먹는 중"}` : ` ${verb} 중`;
  return { title: `${withText}${b.name}에서${itemText}`, place: b.id, townId: b.townId, building: b, detail: `${withText}${b.name}에서 시간을 보내고 있어요.`, item };
}
function companionFor(c) {
  const rel = state.relations.find(r => (r.a === c.id || r.b === c.id) && ["연인", "부부", "짝사랑"].includes(r.type));
  if (!rel) return null;
  return state.characters.find(x => x.id === (rel.a === c.id ? rel.b : rel.a));
}
function homeDetail(c) {
  const h = state.homes.find(x => x.residents.includes(c.id));
  const room = h?.rooms.find(r => r.assigned?.includes(c.id)) || h?.rooms.find(r => r.type === "침실") || h?.rooms[0];
  const furniture = room?.furniture?.[0];
  return furniture ? `${room.name}에서 ${furniture}를 사용하며 쉬고 있어요.` : "집에서 편안하게 쉬고 있어요.";
}

function renderObserve() {
  if (!state.characters.length) return `<section class="panel empty"><h1>아직 캐릭터가 없어요</h1><p>캐릭터를 만든 뒤 평행도시의 하루를 관찰해 보세요.</p><button class="btn primary" data-tab="characters">캐릭터 만들기</button></section>`;
  const c = selected(), a = activity(c), t = state.towns.find(x => x.id === a.townId) || town();
  const logs = dailyLogs(c).filter(x => x.minute <= new Date().getHours() * 60 + new Date().getMinutes());
  return `
    <div class="observe-strip">${state.characters.map(x => {
      const ac = activity(x); return `<button class="character-pill ${x.id === c.id ? "active" : ""}" data-focus="${x.id}" style="--char:${x.color}">${avatar(x)}<span><b>${esc(x.name)}</b><small>${esc(ac.title)}</small></span></button>`;
    }).join("")}</div>
    <section class="map-shell">
      <div>
        <div class="map-top panel"><b>현재 시각 · ${new Date().toLocaleString("ko-KR", { hour: "2-digit", minute: "2-digit" })}</b><select id="observeTown">${state.towns.map(x => `<option value="${x.id}" ${x.id === t?.id ? "selected" : ""}>${esc(x.name)}</option>`).join("")}</select><b>관찰 중 · ${esc(c.name)}</b></div>
        ${renderMap(t, c)}
      </div>
      <aside class="panel">
        ${c.photo ? `<img class="hero" src="${esc(c.photo)}">` : `<div class="hero" style="display:grid;place-items:center;color:white;font-size:72px">${esc(initials(c.name))}</div>`}
        <h1>${esc(c.name)}</h1><p class="muted">${esc(c.displayJob || c.job || "무직")} · 기분 ${esc(c.mood || "평온함")}</p>
        <div class="scene"><small>CURRENT SCENE</small><h2>${esc(a.title)}</h2><p>${esc(a.detail)}</p>${a.item?.image ? `<img src="${esc(a.item.image)}" style="width:64px;height:64px;object-fit:contain">` : ""}</div>
        <h2>오늘의 생활 로그</h2><div class="timeline">${logs.map(l => `<button class="log" data-log="${esc(l.title)}|${esc(l.detail)}|${esc(l.image || "")}"><time>${l.time}</time><b>${esc(l.title)}</b></button>`).join("")}</div>
      </aside>
    </section>`;
}
function renderMap(t, selectedChar) {
  if (!t) return `<div class="map empty">마을을 먼저 만들어 주세요.</div>`;
  const people = state.characters.map(c => ({ c, a: activity(c) })).filter(x => x.a.place !== "home" && x.a.townId === t.id);
  return `<div class="map" style="${t.background ? `background-image:url('${esc(t.background)}');background-size:contain;background-repeat:no-repeat;background-position:center;background-color:#d9ead3` : ""}">
    <div class="road"></div><div class="road v"></div>
    ${t.buildings.map(b => {
      const here = people.filter(x => x.a.place === b.id);
      return `<div class="lot" style="left:${b.x}%;top:${b.y}%"><div class="building">${b.image ? `<img src="${esc(b.image)}">` : `<div style="font-size:38px">${buildingIcon(b.type)}</div>`}<b>${esc(b.name)}</b><small>${esc(b.type)}</small></div><div class="people">${here.map(x => `<button data-focus="${x.c.id}" title="${esc(x.c.name)}">${avatar(x.c)}</button>`).join("")}</div></div>`;
    }).join("")}
  </div>`;
}
function dailyLogs(c) {
  const now = new Date(), wake = c.wake || "07:30";
  const [h, m] = wake.split(":").map(Number);
  const noon = visit(c, "음식점", "점심"), evening = visit(c, "카페", "외출");
  return [
    { minute: h * 60 + m, time: wake, title: "기상", detail: "집에서 하루를 시작했어요." },
    { minute: 720, time: "12:00", title: noon.title, detail: noon.detail, image: noon.item?.image || noon.building?.image },
    { minute: 1110, time: "18:30", title: evening.title, detail: evening.detail, image: evening.item?.image || evening.building?.image },
    { minute: 1320, time: "22:00", title: "귀가", detail: "집으로 돌아와 하루를 정리해요." }
  ];
}

function renderCharacters() {
  const c = selected();
  return `<section class="grid two">
    <aside class="panel"><div class="toolbar"><h1>캐릭터 목록</h1><button class="btn primary" id="newCharacter">+ 생성</button></div>
      <div class="list">${state.characters.map((x, i) => `<div class="list-card ${x.id === c?.id ? "active" : ""}" data-edit-character="${x.id}">${avatar(x)}<div class="grow"><b>${esc(x.name)}</b><small>${esc(x.displayJob || x.job || "무직")}</small></div><button data-move-char="${x.id}:up">▲</button><button data-move-char="${x.id}:down">▼</button></div>`).join("")}</div>
    </aside>
    <div class="panel">${c ? characterForm(c) : `<div class="empty">새 캐릭터를 만들어 주세요.</div>`}</div>
  </section>`;
}
function characterForm(c) {
  const p = c.preferences || {};
  return `<div class="toolbar"><h1>프로필</h1><button class="btn danger" data-delete-character="${c.id}">삭제</button></div>
  <form id="characterForm" class="form">
    ${field("캐릭터 이름", "name", c.name)}${selectField("직업", "job", c.job, ["무직","회사원","교수","대학생","정치인","군인","환경미화원","여관주인","해적","자영업","자택근무"])}
    ${field("표기할 직업명", "displayJob", c.displayJob || "")}${field("출근할 건물", "workplace", c.workplace || "", "text")}
    ${field("프로필 사진 링크", "photo", c.photo || "")}${field("지도용 투명 아이콘 링크", "icon", c.icon || "")}
    ${field("기상 시각", "wake", c.wake || "07:30", "time")}${field("취침 시각", "sleep", c.sleep || "00:30", "time")}
    ${field("대표 테마색", "color", c.color || "#287d6c", "color")}${field("그라데이션 보조색", "subColor", c.subColor || c.color || "#68d2b4", "color")}
    ${selectField("소득 수준", "income", c.income || "보통", ["낮음","보통","높음","매우 높음"])}${selectField("기본 기분", "mood", c.mood || "평온함", ["행복함","평온함","피곤함","우울함","화남","스트레스"])}
    ${prefField("입맛 성향", "tastes", p.tastes, ["아재 입맛","어린이 입맛","맵부심","한식파","디저트광","신상 맛집파"])}
    ${prefField("좋아하는 음식", "foods", p.foods, ["한식","일식","중식","양식","분식","고기","해산물","면 요리","디저트"])}
    ${prefField("좋아하는 음료", "drinks", p.drinks, ["아메리카노","카페라테","아인슈페너","밀크티","말차 라테","차","탄산음료","주스"])}
    ${prefField("음악 장르", "music", p.music, ["발라드","인디","재즈","클래식","록","힙합","R&B","K-POP","J-POP","OST"])}
    ${prefField("취미", "hobbies", p.hobbies, ["취미 없음","집에서 뒹굴기","카페 탐방","독서","게임","요리","청소","산책","운동","덕질","악기","그림"])}
    <div class="field full"><button class="btn primary" type="submit">캐릭터 저장</button></div>
  </form>`;
}
function field(label, name, value, type = "text") { return `<div class="field"><label>${label}</label><input name="${name}" type="${type}" value="${esc(value)}"></div>`; }
function selectField(label, name, value, opts) { return `<div class="field"><label>${label}</label><select name="${name}">${opts.map(x => `<option ${x === value ? "selected" : ""}>${x}</option>`).join("")}</select></div>`; }
function prefField(label, key, values = [], opts) { return `<div class="field full pref" data-pref="${key}"><label>${label}</label><div class="chips">${opts.map(x => `<button type="button" class="chip ${values.includes(x) ? "on" : ""}" data-chip="${esc(x)}">${x}</button>`).join("")}</div></div>`; }

function renderHomes() {
  if (!state.homes.length) return `<section class="panel empty"><h1>아직 집이 없어요</h1><button class="btn primary" id="newHome">집 만들기</button></section>`;
  const home = state.homes.find(h => h.id === state.selectedHome) || state.homes[0];
  return `<section><div class="toolbar"><h1>우리 집 생활</h1><button class="btn primary" id="newHome">+ 집 추가</button></div>
    <div class="home-tabs">${state.homes.map(h => `<button class="btn ${h.id === home.id ? "primary" : ""}" data-home="${h.id}" style="${homeGradient(h)}">🏠 ${esc(h.name)}</button>`).join("")}</div>
    <div class="panel"><div class="toolbar"><div><h1>🏠 ${esc(home.name)}</h1><p>${home.residents.map(id => state.characters.find(c => c.id === id)?.name).filter(Boolean).join(" · ")} 거주 중</p></div><button class="btn" data-edit-home="${home.id}">집 편집</button></div>
    <div class="home-wrap"><div class="home">${home.rooms.map((r, i) => `<div class="room ${i === 0 ? "big" : ""}" style="${r.image ? `background-image:url('${esc(r.image)}')` : ""}"><b>${esc(r.name)}</b><div class="people">${home.residents.filter(id => roomFor(home, id)?.id === r.id).map(id => { const c = state.characters.find(x => x.id === id); return c ? `<button data-focus="${id}">${avatar(c)}<span class="room-badge">${esc(homeDetail(c))}</span></button>` : ""; }).join("")}</div></div>`).join("")}</div></div>
    </div></section>`;
}
function roomFor(h, charId) { return h.rooms.find(r => r.assigned?.includes(charId)) || h.rooms.find(r => r.type === "침실") || h.rooms[0]; }
function homeGradient(h) {
  const colors = h.residents.map(id => state.characters.find(c => c.id === id)?.color).filter(Boolean);
  return colors.length ? `background:linear-gradient(135deg,${colors.join(",")});color:white` : "";
}

function renderRelations() {
  return `<section class="panel"><div class="toolbar"><h1>관계</h1><button class="btn primary" id="newRelation">+ 관계 추가</button></div>
  <div class="grid three">${state.relations.map(r => { const a = state.characters.find(c => c.id === r.a), b = state.characters.find(c => c.id === r.b); return `<article class="panel" style="background:linear-gradient(135deg,${a?.color || "#eee"}22,${b?.color || "#eee"}55)"><h2>${esc(a?.name)} × ${esc(b?.name)}</h2><p>${esc(r.type)} · ${r.cohabit ? "함께 거주" : "따로 거주"}</p><button class="btn" data-edit-relation="${r.id}">편집</button><button class="btn danger" data-delete-relation="${r.id}">삭제</button></article>`; }).join("") || `<div class="empty">관계를 추가해 주세요.</div>`}</div></section>`;
}
function renderRoutine() {
  return `<section class="panel"><div class="toolbar"><h1>주간 루틴</h1></div><p>캐릭터의 필수 일정은 직업과 수면 시간에 맞춰 자동 생성됩니다.</p>${state.characters.map(c => `<article class="scene"><h2>${esc(c.name)}</h2><p>${esc(c.wake || "07:30")} 기상 · ${c.job === "무직" ? "자유 일정" : `${esc(c.job)} 일정`} · ${esc(c.sleep || "00:30")} 취침</p></article>`).join("")}</section>`;
}
function renderCatalog() {
  return `<section class="panel"><div class="toolbar"><div><h1>세계관 취향 사전</h1><p>음식, 옷, 음악, 작품과 취미 물품을 등록하면 생활 로그에 사용돼요.</p></div><button class="btn primary" id="newCatalog">+ 추가</button></div>
    <div class="grid encyclopedia">${state.catalog.map(x => `<button class="dex" data-edit-catalog="${x.id}">${x.image ? `<img src="${esc(x.image)}">` : `<div style="font-size:54px">${catalogIcon(x.category)}</div>`}<b>${esc(x.name)}</b><small>${esc(x.category)} · ${esc(x.kind || "")}</small></button>`).join("")}</div></section>`;
}
function renderTowns() {
  const t = town();
  return `<section class="grid two"><aside class="panel"><div class="toolbar"><h1>마을</h1><button class="btn primary" id="newTown">+ 추가</button></div><div class="list">${state.towns.map(x => `<button class="list-card ${x.id === t?.id ? "active" : ""}" data-town="${x.id}"><b>${esc(x.name)}</b></button>`).join("")}</div></aside>
  <div class="panel">${t ? `<div class="toolbar"><h1>${esc(t.name)}</h1><div><button class="btn" data-edit-town="${t.id}">마을 편집</button><button class="btn danger" data-delete-town="${t.id}">삭제</button></div></div>${renderMap(t, selected())}<hr><div class="toolbar"><h2>건물</h2><button class="btn primary" id="newBuilding">+ 건물 추가</button></div><div class="list">${t.buildings.map(b => `<div class="list-card"><div class="grow"><b>${esc(b.name)}</b><small>${esc(b.type)}</small></div><button class="btn" data-edit-building="${b.id}">편집</button><button class="btn danger" data-delete-building="${b.id}">삭제</button></div>`).join("")}</div>` : "마을을 추가해 주세요."}</div></section>`;
}
function renderSettings() {
  return `<section class="panel"><h1>설정 · 백업</h1><p>현재 버전은 기기에 즉시 저장됩니다. 다른 기기로 옮길 때는 파일 내보내기와 불러오기를 사용하세요.</p><div class="chips"><button class="btn primary" id="exportData">설정 내보내기</button><label class="btn">설정 불러오기<input id="importData" type="file" accept=".json" hidden></label><button class="btn danger" id="resetData">전체 초기화</button></div></section>`;
}

function bindView() {
  $("#characterForm")?.addEventListener("submit", saveCharacter);
  $(".pref")?.closest("form")?.querySelectorAll("[data-chip]").forEach(b => b.onclick = () => b.classList.toggle("on"));
}
function saveCharacter(e) {
  e.preventDefault();
  const c = selected(), fd = new FormData(e.currentTarget);
  for (const k of ["name","job","displayJob","workplace","photo","icon","wake","sleep","color","subColor","income","mood"]) c[k] = fd.get(k) || "";
  c.preferences = {};
  e.currentTarget.querySelectorAll("[data-pref]").forEach(group => c.preferences[group.dataset.pref] = [...group.querySelectorAll(".chip.on")].map(x => x.dataset.chip));
  save(); render();
}
function newCharacter() {
  const c = { id: uid(), name: "새 캐릭터", job: "무직", displayJob: "", wake: "07:30", sleep: "00:30", color: "#287d6c", subColor: "#68d2b4", mood: "평온함", income: "보통", photo: "", icon: "", hobbies: [], preferences: { tastes: [], foods: [], drinks: [], music: [], hobbies: [] } };
  state.characters.push(c); state.selected = c.id;
  const h = { id: uid(), name: `${c.name}의 집`, residents: [c.id], rooms: defaultRooms() };
  state.homes.push(h); state.selectedHome = h.id; save(); render();
}
function defaultRooms() {
  return [
    { id: uid(), name: "거실", type: "거실", image: "", furniture: ["소파","TV"], assigned: [] },
    { id: uid(), name: "주방", type: "주방", image: "", furniture: ["냉장고","식탁"], assigned: [] },
    { id: uid(), name: "침실", type: "침실", image: "", furniture: ["침대"], assigned: [] },
    { id: uid(), name: "욕실", type: "욕실", image: "", furniture: ["욕조"], assigned: [] },
    { id: uid(), name: "현관", type: "현관", image: "", furniture: ["신발장"], assigned: [] }
  ];
}

function openDialog(html) { $("#modal").className = "open"; $("#modal").innerHTML = `<div class="dialog">${html}<button class="btn" id="closeModal">닫기</button></div>`; $("#closeModal").onclick = closeDialog; }
function closeDialog() { $("#modal").className = ""; $("#modal").innerHTML = ""; }
function relationDialog(r = {}) {
  openDialog(`<h2>관계 편집</h2><form id="relationForm" class="form">${selectField("첫 번째 캐릭터","a",r.a,state.characters.map(c=>c.name))}${selectField("두 번째 캐릭터","b",r.b,state.characters.map(c=>c.name))}${selectField("관계","type",r.type||"친구",["친구","절친","연인","부부","가족","동료","라이벌","혐관","짝사랑"])}<label><input name="cohabit" type="checkbox" ${r.cohabit?"checked":""}> 함께 거주</label><button class="btn primary">저장</button></form>`);
  $("#relationForm").onsubmit = e => { e.preventDefault(); const f = new FormData(e.currentTarget), byName = n => state.characters.find(c => c.name === n)?.id; const item = r.id ? state.relations.find(x => x.id === r.id) : { id: uid() }; Object.assign(item,{a:byName(f.get("a")),b:byName(f.get("b")),type:f.get("type"),cohabit:!!f.get("cohabit")}); if(!r.id) state.relations.push(item); if(item.cohabit) cohabit(item.a,item.b); save(); closeDialog(); render(); };
}
function cohabit(a,b){ let h=state.homes.find(x=>x.residents.includes(a))||state.homes.find(x=>x.residents.includes(b)); if(!h){h={id:uid(),name:"우리 집",residents:[],rooms:defaultRooms()};state.homes.push(h)}; h.residents=[...new Set([...h.residents,a,b])]; }
function catalogDialog(x={}) {
  openDialog(`<h2>취향 사전 항목</h2><form id="catalogForm" class="form">${field("이름","name",x.name||"")}${selectField("분류","category",x.category||"음식",["음식","음료","옷","음악","아이돌·밴드","작품","게임","향수","취미 물품"])}${field("세부 분류","kind",x.kind||"")}${field("이미지 링크","image",x.image||"")}${selectField("맵기","spicy",x.spicy||"안 매움",["안 매움","순한맛","신라면 맵기","매운맛","아주 매운맛"])}${selectField("달기","sweet",x.sweet||"보통",["안 달음","은은함","보통","달콤함","아주 달콤함"])}<button class="btn primary">저장</button></form>`);
  $("#catalogForm").onsubmit=e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.currentTarget));const item=x.id?state.catalog.find(i=>i.id===x.id):{id:uid()};Object.assign(item,f);if(!x.id)state.catalog.push(item);save();closeDialog();render()};
}
function townDialog(t={}) {
  openDialog(`<h2>마을 편집</h2><form id="townForm" class="form">${field("마을 이름","name",t.name||"새 마을")}${field("배경 이미지 링크","background",t.background||"")}${field("테마색","color",t.color||"#287d6c","color")}<button class="btn primary">저장</button></form>`);
  $("#townForm").onsubmit=e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.currentTarget));const item=t.id?state.towns.find(i=>i.id===t.id):{id:uid(),buildings:[]};Object.assign(item,f);if(!t.id){state.towns.push(item);state.selectedTown=item.id}save();closeDialog();render()};
}
function buildingDialog(b={}) {
  openDialog(`<h2>건물 편집</h2><form id="buildingForm" class="form">${field("건물 이름","name",b.name||"새 건물")}${selectField("건물 유형","type",b.type||"카페",["카페","음식점","회사","학교","병원","공연장","옷가게","쇼핑몰","공원","도서관","숙박","관공서","기타"])}${field("세부 유형","subtype",b.subtype||"")}${selectField("가격대","price",b.price||"보통",["무료","저렴함","보통","비쌈","고급"])}${field("배경 투명 건물 이미지 링크","image",b.image||"")}${field("가로 위치(%)","x",b.x??50,"number")}${field("세로 위치(%)","y",b.y??50,"number")}<button class="btn primary">저장</button></form>`);
  $("#buildingForm").onsubmit=e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.currentTarget));f.x=+f.x;f.y=+f.y;const item=b.id?town().buildings.find(i=>i.id===b.id):{id:uid()};Object.assign(item,f);if(!b.id)town().buildings.push(item);save();closeDialog();render()};
}
function homeDialog(h) {
  openDialog(`<h2>집 편집</h2><form id="homeForm">${field("집 이름","name",h.name)}<h3>동거인</h3><div class="chips">${state.characters.map(c=>`<label class="chip"><input type="checkbox" name="resident" value="${c.id}" ${h.residents.includes(c.id)?"checked":""}> ${esc(c.name)}</label>`).join("")}</div><h3>방</h3><div id="roomForms">${h.rooms.map(r=>`<div class="scene" data-room="${r.id}">${field("방 이름","roomName",r.name)}${selectField("방 종류","roomType",r.type,["거실","주방","침실","욕실","현관","서재","취미방","드레스룸","기타"])}${field("배경 이미지 링크","roomImage",r.image||"")}${field("가구(쉼표로 구분)","furniture",(r.furniture||[]).join(","))}<div class="chips">${state.characters.map(c=>`<label><input type="checkbox" name="assigned-${r.id}" value="${c.id}" ${r.assigned?.includes(c.id)?"checked":""}>${esc(c.name)} 배정</label>`).join("")}</div></div>`).join("")}</div><button type="button" class="btn" id="addRoom">+ 방 추가</button><button class="btn primary">집 편집 완료</button></form>`);
  $("#addRoom").onclick=()=>{h.rooms.push({id:uid(),name:"새 방",type:"기타",image:"",furniture:[],assigned:[]});closeDialog();homeDialog(h)};
  $("#homeForm").onsubmit=e=>{e.preventDefault();const form=e.currentTarget;h.name=form.querySelector('[name=name]').value;h.residents=[...form.querySelectorAll('[name=resident]:checked')].map(x=>x.value);form.querySelectorAll("[data-room]").forEach((el,i)=>{const r=h.rooms[i];r.name=el.querySelector('[name=roomName]').value;r.type=el.querySelector('[name=roomType]').value;r.image=el.querySelector('[name=roomImage]').value;r.furniture=el.querySelector('[name=furniture]').value.split(",").map(x=>x.trim()).filter(Boolean);r.assigned=[...el.querySelectorAll(`[name="assigned-${r.id}"]:checked`)].map(x=>x.value)});save();closeDialog();render()};
}

document.addEventListener("click", e => {
  const b = e.target.closest("button,[data-edit-character]");
  if (!b) return;
  if (b.dataset.tab) return go(b.dataset.tab);
  if (b.id === "newCharacter") return newCharacter();
  if (b.dataset.editCharacter) { state.selected = b.dataset.editCharacter; save(); return render(); }
  if (b.dataset.focus) { state.selected = b.dataset.focus; const a=activity(selected()); state.tab=a.place==="home"?"homes":"observe"; if(a.townId)state.selectedTown=a.townId; save(); return render(); }
  if (b.dataset.moveChar) { const [id,dir]=b.dataset.moveChar.split(":");const i=state.characters.findIndex(x=>x.id===id),j=dir==="up"?i-1:i+1;if(j>=0&&j<state.characters.length)[state.characters[i],state.characters[j]]=[state.characters[j],state.characters[i]];save();return render(); }
  if (b.dataset.deleteCharacter) { if(confirm("이 캐릭터를 삭제할까요?")){state.characters=state.characters.filter(x=>x.id!==b.dataset.deleteCharacter);state.selected=state.characters[0]?.id||"";save();render()} return; }
  if (b.id === "newRelation") return relationDialog();
  if (b.dataset.editRelation) return relationDialog(state.relations.find(x=>x.id===b.dataset.editRelation));
  if (b.dataset.deleteRelation) {state.relations=state.relations.filter(x=>x.id!==b.dataset.deleteRelation);save();return render()}
  if (b.id === "newCatalog") return catalogDialog();
  if (b.dataset.editCatalog) return catalogDialog(state.catalog.find(x=>x.id===b.dataset.editCatalog));
  if (b.id === "newTown") return townDialog();
  if (b.dataset.town) {state.selectedTown=b.dataset.town;save();return render()}
  if (b.dataset.editTown) return townDialog(town());
  if (b.dataset.deleteTown) {if(confirm("마을을 삭제할까요?")){state.towns=state.towns.filter(x=>x.id!==b.dataset.deleteTown);state.selectedTown=state.towns[0]?.id||"";save();render()}return}
  if (b.id === "newBuilding") return buildingDialog();
  if (b.dataset.editBuilding) return buildingDialog(town().buildings.find(x=>x.id===b.dataset.editBuilding));
  if (b.dataset.deleteBuilding) {town().buildings=town().buildings.filter(x=>x.id!==b.dataset.deleteBuilding);save();return render()}
  if (b.id === "newHome") {const h={id:uid(),name:"새 집",residents:[],rooms:defaultRooms()};state.homes.push(h);state.selectedHome=h.id;save();return render()}
  if (b.dataset.home) {state.selectedHome=b.dataset.home;save();return render()}
  if (b.dataset.editHome) return homeDialog(state.homes.find(x=>x.id===b.dataset.editHome));
  if (b.dataset.log) {const [title,detail,image]=b.dataset.log.split("|");return openDialog(`<h2>${title}</h2>${image?`<img class="hero" src="${image}">`:""}<p>${detail}</p>`)}
  if (b.id === "exportData") {const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:"application/json"}));a.download="평행도시-백업.json";a.click()}
  if (b.id === "resetData" && confirm("모든 데이터를 초기화할까요?")) {localStorage.removeItem(KEY);state=normalize(clone(starter));render()}
});
document.addEventListener("change", e => {
  if (e.target.id === "observeTown") {state.selectedTown=e.target.value;save();render()}
  if (e.target.id === "importData") {const r=new FileReader();r.onload=()=>{try{state=normalize(JSON.parse(r.result));save();render()}catch{alert("올바른 백업 파일이 아니에요.")}};r.readAsText(e.target.files[0])}
});
function buildingIcon(t){return ({카페:"☕",음식점:"🍽️",회사:"🏢",학교:"🏫",병원:"🏥",공원:"🌳",공연장:"🎭",옷가게:"👗",쇼핑몰:"🛍️",도서관:"📚",숙박:"🏨"})[t]||"🏠"}
function catalogIcon(t){return ({음식:"🍽️",음료:"🥤",옷:"👗",음악:"🎵","아이돌·밴드":"🎤",작품:"🎬",게임:"🎮",향수:"🧴","취미 물품":"🎨"})[t]||"✨"}
render();
