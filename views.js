import {state,active} from "./state.js?v=20260801d";
import {eventFor,visibleTimeline,charactersAtPlace,homeGroups} from "./simulation.js?v=20260801d";
const esc=(x="")=>String(x).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const JOBS=["무직","학생","회사원","의사","간호사","교사","교수","정치인","기자","요리사","프로그래머","연구원","예술가","해적","군인","환경미화원","여관주인","자영업·직접 입력"];
const TASTES=["아재 입맛","어린이 입맛","맵부심","한식파","면 요리 선호","디저트광","커피 못 마심","신상 맛집파"];
const INTERESTS=["향수","애니메이션","만화","게임","패션","미술","음악","영화","문구","인테리어","역사","기계"];
const HOBBIES=["취미 없음","집에서 뒹굴기","외출 안 함","인터넷 서핑","커뮤니티 눈팅","영상 정주행","낮잠","덕질","독서","카페 탐방","쇼핑","운동","사진","전시 관람","공방 체험","산책","요리","청소"];
const INCOMES=["빠듯함","보통","여유 있음","부유함","대부호"];
const MUSIC=["발라드","인디","재즈","클래식","록","힙합","R&B","K-POP","J-POP","OST","전자음악","트로트"];
const FOODS=["한식","일식","중식","양식","분식","고기","해산물","면 요리","디저트","매운 음식","채식"];
const FOOD_PREFERENCES=[...TASTES,...FOODS];
const DRINKS=["아메리카노","카페라테","바닐라 라테","아인슈페너","밀크티","말차 라테","차","탄산음료","주스","핫초코"];
const SPICE_LEVELS=["안 매움","살짝 매콤","순한맛","보통 라면 맵기","매운맛","아주 매운맛"];
const SWEET_LEVELS=["안 달음","은은한 단맛","적당히 달콤","달콤함","아주 달콤함","극강의 단맛"];
const PLACE_TYPES={
  "카페":["","로스터리 카페","디저트 카페","테마 카페","찻집"],
  "음식점":["","한식당","중식당","일식당","이탈리아 식당","분식집","패스트푸드점","디저트 가게"],
  "병원":["","종합병원","내과","외과","이비인후과","정형외과","피부과","치과","안과","한의원"],
  "공연장":["","콘서트홀","라이브 클럽","뮤지컬 극장","연극 극장","야외 공연장"],
  "옷가게":["","스포츠 브랜드","캐주얼 브랜드","정장 브랜드","빈티지 숍","디자이너 브랜드","신발 가게","액세서리 숍"],
  "사무실":["","일반 회사","IT 회사","연구소","방송국","출판사","디자인 스튜디오"],
  "학교":["","초등학교","중학교","고등학교","대학교","학원"],
  "공원":["","근린공원","수목원","놀이공원","반려동물 공원"],
  "도서관":["","공공도서관","대학도서관","전문도서관"],
  "쇼핑몰":["","백화점","아울렛","복합 쇼핑몰"],
  "숙박":["","호텔","여관","리조트","게스트하우스"],
  "관공서":["","시청","주민센터","경찰서","소방서"],
  "기타":[""]
};
const CATALOG_LABELS={food:"음식",drink:"음료",fashion:"옷·패션",music:"음악",idol:"아이돌·밴드",book:"책·작품",movie:"영화·영상",game:"게임",perfume:"향수",hobby:"취미 물품"};
const CATALOG_CATEGORIES={food:["한식","일식","중식","이탈리아 음식","양식","분식","패스트푸드","디저트","빵","간식"],drink:["커피","차","라테","탄산음료","주스","술","기타 음료"],fashion:["상의","하의","아우터","원피스","신발","가방","액세서리"],music:["노래","앨범","플레이리스트","악기"],idol:["솔로 가수","아이돌","밴드","가상 아티스트"],book:["소설","만화","잡지","에세이","전문서적"],movie:["영화","드라마","애니메이션","영상"],game:["PC 게임","콘솔 게임","모바일 게임","보드게임"],perfume:["향수","디퓨저","캔들","바디 제품"],hobby:["미술 도구","악기","수집품","운동 용품","전자기기","공예 도구","반려동물 용품"]};
const catalogItems=()=>Object.entries(state.catalog||{}).flatMap(([kind,items])=>(items||[]).map(item=>({...item,kind})));
const levelOptions=(labels,value)=>labels.map((label,index)=>`<option value="${index}" ${Number(value)===index?"selected":""}>${label}</option>`).join("");
const placeTypeOptions=place=>Object.keys(PLACE_TYPES).map(type=>`<option ${place.type===type?"selected":""}>${type}</option>`).join("");
const placeSubtypeOptions=place=>(PLACE_TYPES[place.type]||[""]).map(type=>`<option value="${type}" ${place.subtype===type?"selected":""}>${type||"지정 안 함 · 해당 유형 전체 취급"}</option>`).join("");
const roomClasses={living:"living",kitchen:"kitchen",entry:"entry",bath:"bath",bedroom:"bedroom",study:"study"};
const FURNITURE={
  living:["소파","TV","책장","오디오","안마의자","게임기","캣타워"],
  kitchen:["냉장고","조리대","식탁","오븐","커피머신","식기세척기"],
  entry:["신발장","전신거울","우산꽂이","반려동물 산책용품"],
  bath:["샤워부스","욕조","세면대","세탁기","건조기"],
  bedroom:["침대","옷장","화장대","협탁","빔프로젝터"],
  study:["책상","컴퓨터","피아노","기타","그림 도구","재봉틀","운동기구"]
};
let accountText="Google 로그인 안 됨";

function avatar(c,cls=""){
  if(c.icon)return `<img class="sprite ${cls}" src="${c.icon}" alt="">`;
  if(c.photo)return `<img class="avatar ${cls}" src="${c.photo}" alt="">`;
  return `<span class="avatar ${cls}" style="--own:${c.theme.primary}">${esc((c.name||"새").slice(0,1))}</span>`;
}
function header(){
  const tabs=[["observe","관찰"],["home","집"],["character","캐릭터"],["catalog","취향 사전"],["relationship","관계"],["routine","주간 루틴"],["town","마을"],["settings","설정"]];
  return `<header><div class="brand"><span class="logo">▥</span><div><h1>평행도시</h1><small>캐릭터 생활 관찰 게임</small></div></div><nav>${tabs.map(([k,n])=>`<button data-tab="${k}" class="${state.activeTab===k?"on":""}">${n}</button>`).join("")}</nav><span id="save-state">기기에 저장됨</span><div class="quick-sync"><button data-sync-upload>동기화</button><button data-sync-download>불러오기</button></div></header>`;
}
function roster(){
  return `<div class="roster">${state.order.map(id=>{const c=state.characters[id],e=eventFor(c);return `<button class="roster-card ${id===state.activeId?"on":""}" data-roster="${id}" style="--own:${c.theme.primary}">${avatar(c)}<span><b>${esc(c.name)}</b><small>${esc(e.title)}</small></span></button>`}).join("")}</div>`;
}
function placeCard(p){
  return `<button class="place ${p.image?"has-art":""}" style="left:${p.x}%;top:${p.y}%;--place:${p.color};--place-scale:${p.imageScale||1}" data-place="${p.id}">${p.image?`<img class="building-art" src="${esc(p.image)}" alt=""><span class="building-name">${esc(p.name)}</span>`:`<i>${p.emoji}</i><span class="place-label"><b>${esc(p.name)}</b><small>${esc(p.subtype?`${p.type} · ${p.subtype}`:p.type)}</small></span>`}</button>`;
}
function catalogItem(id){return catalogItems().find(item=>item.id===id)}
function logTitle(entry){const item=catalogItem(entry.itemId);return `${item?.image?`<img class="catalog-sticker" src="${esc(item.image)}" alt="">`:""}<b>${esc(entry.title)}</b>`}
function personCard(c){
  const e=eventFor(c);if(e.home)return"";
  const p=state.world.places.find(x=>x.id===e.placeId);if(!p)return"";
  const group=charactersAtPlace(p.id),i=group.findIndex(x=>x.id===c.id);
  const offsets=[[-38,-28],[38,-28],[-38,30],[38,30],[0,-54],[0,56]],off=offsets[i%offsets.length];
  return `<button class="person" data-person="${c.id}" style="left:calc(${p.x}% + ${off[0]/12}%);top:calc(${p.y}% + ${off[1]/6.76}%)">${avatar(c)}<span>${esc(c.name)}</span></button>`;
}
function observe(){
  const c=active(),e=eventFor(c),place=state.world.places.find(p=>p.id===e.placeId),logs=visibleTimeline(c);
  const everyoneSleeping=state.order.length>0&&state.order.every(id=>eventFor(state.characters[id]).title==="자는 중");
  const sleepGate=everyoneSleeping?`<div class="sleep-gate"><div>🌙</div><h2>모든 인물이 자고 있습니다</h2><p>마을은 조용해졌어요. 집 안에서 인물들의 상태를 볼 수 있어요.</p><button class="primary" data-all-sleep-home>집으로 들어가기</button></div>`:"";
  const townSwitcher=state.towns.length>1?`<div class="observe-town-switcher"><b>관찰할 마을</b>${state.towns.map(t=>`<button data-observe-town="${t.id}" class="${t.id===state.activeTownId?"on":""}">🏙️ ${esc(t.name)}</button>`).join("")}</div>`:"";
  return `${roster()}${townSwitcher}${sleepGate}<div class="observe"><section><div class="world-hud"><div><small>현재 시각</small><b>${new Date().toLocaleString("ko-KR",{month:"long",day:"numeric",weekday:"short",hour:"2-digit",minute:"2-digit"})}</b></div><div><small>관찰 중</small><b>${esc(c.name)} · ${esc(e.title)}</b></div></div><div class="viewport"><div class="world"><img src="${state.world.bg}" class="world-bg">${state.world.places.map(placeCard).join("")}${state.order.map(id=>personCard(state.characters[id])).join("")}</div></div></section><aside class="detail-column"><div class="detail panel"><div class="hero">${c.photo?`<img src="${c.photo}" alt="">`:avatar(c)}</div><h2>${esc(c.name)}</h2><p>${esc(c.jobTitle||c.job)}</p><div class="scene"><small>CURRENT SCENE</small><h3>${esc(e.title)}</h3><p>${esc(e.desc)}</p><b>${place?`📍 ${esc(place.name)} · ${esc(state.world.name)}`:"🏠 집 안"}</b>${place?.image?`<img class="place-photo" src="${esc(place.image)}" alt="${esc(place.name)}">`:""}</div></div><section class="panel life-log"><div class="title"><h2>오늘의 생활 로그</h2><small>현재 시각까지 자동 기록</small></div><ol>${logs.map((x,i)=>`<li role="button" tabindex="0" data-log-detail="${i}" class="${x===logs.at(-1)?"now":""}"><time>${esc(x.time)}</time><span>${logTitle(x)}<small>${esc(x.desc)}</small></span></li>`).join("")}</ol></section></aside></div><div id="log-modal" class="log-modal" hidden></div>`;
}
function roomStyle(h,key){
  const image=h.rooms?.[key]?.image;
  return image?`style="background-image:linear-gradient(#ffffff30,#ffffff30),url('${image}')"`:"";
}
function home(){
  const groups=homeGroups(),ids=Object.keys(groups),selected=groups[state.activeHomeId]?state.activeHomeId:(active()?.homeId||ids[0]);
  state.activeHomeId=selected;
  const houseGradient=chars=>{
    const colors=[...new Set(chars.map(c=>c.theme?.primary||"#176b60"))];
    if(colors.length===1){
      const c=chars[0],second=c.theme?.gradient?(c.theme.secondary||colors[0]):colors[0];
      return `linear-gradient(135deg,${colors[0]},${second})`;
    }
    return `linear-gradient(135deg,${colors.join(",")})`;
  };
  return `<div class="title"><h1>우리 집 생활</h1><button data-home-edit>${state.homeEditMode?"편집 완료":"집 편집"}</button></div><div class="home-tabs">${ids.map(id=>{const h=state.homes[id]||{};return `<button data-home-select="${id}" class="${id===selected?"on":""}" style="--home-grad:${houseGradient(groups[id])};${h.image?`--home-photo:url('${esc(h.image)}')`:""}">🏠 ${esc(h.name||groups[id][0].name+"의 집")}</button>`}).join("")}</div><div class="home-grid">${selected?homeCard(selected,groups[selected]):""}</div>`;
}
function homeCard(id,chars){
  const h=state.homes[id]||{id,name:`${chars[0].name}의 집`,rooms:{}};
  const inside=chars.filter(c=>eventFor(c).home);
  const edit=state.homeEditMode;
  const roomHtml=Object.keys(roomClasses).map(key=>{
    const room=h.rooms?.[key]||{},roomPeople=inside.filter(c=>eventFor(c).room===key);
    const furniture=FURNITURE[key]||[];
    return `<div class="room ${roomClasses[key]}" ${roomStyle(h,key)}>
      ${edit?`<input class="room-name" data-room-name="${key}" data-home-id="${id}" value="${esc(room.name||key)}">`:`<b>${esc(room.name||key)}</b>`}
      ${edit?`<div class="room-tools"><button data-room-bg="${id}" data-home-id="${id}" data-room="${key}">사진</button><button data-image-url="room" data-id="${id}" data-room="${key}">링크</button>${room.image?`<button data-clear-room-bg data-home-id="${id}" data-room="${key}">지우기</button>`:""}</div>`:""}
      ${edit?`<div class="furniture">${furniture.map(item=>`<button data-furniture="${item}" data-home-id="${id}" data-room="${key}" class="${(room.furniture||[]).includes(item)?"on":""}">${item}</button>`).join("")}</div>`:""}
      <div class="room-people">${roomPeople.map(c=>{const e=eventFor(c);return `<button class="home-person" data-home-person="${c.id}">${avatar(c)}<span><b>${esc(c.name)}</b><small>${esc(e.title)}</small></span></button>`}).join("")}</div>
    </div>`;
  }).join("");
  const residentEditor=edit?`<section class="resident-editor"><h3>함께 사는 캐릭터</h3><div>${state.order.map(cid=>{const c=state.characters[cid],on=c.homeId===id;return `<button data-home-resident="${cid}" data-home-id="${id}" class="${on?"on":""}">${avatar(c)} ${esc(c.name)}</button>`}).join("")}</div><small>여러 명을 선택할 수 있어요. 취향과 관심사는 합쳐지지 않습니다.</small></section>`:"";
  const status=chars.map(c=>{const e=eventFor(c);return `<button class="home-status" data-home-person="${c.id}" style="--own:${c.theme.primary}">${avatar(c)}<span><b>${esc(c.name)}</b><small>${esc(e.title)}</small><em>${esc(e.desc||"")}</em></span></button>`}).join("");
  return `<article class="home panel" data-home-card="${id}">
    <div class="title"><div>${edit?`<input class="home-name" data-home-name data-home-id="${id}" value="${esc(h.name)}">`:`<h2>🏠 ${esc(h.name)}</h2>`}<small>${chars.map(c=>c.name).join(" · ")} 거주 중</small></div><b>${inside.length}명 귀가</b></div>
    ${edit?`<div class="home-photo-editor"><b>집 선택 버튼 배경 사진</b><span><button data-home-bg="${id}">사진</button><button data-image-url="home" data-id="${id}">링크</button>${h.image?`<button data-clear-home-bg="${id}">지우기</button>`:""}</span></div>`:""}
    ${residentEditor}<div class="clean">청결도 · ${Math.round(h.cleanliness??100)}% <i style="width:${h.cleanliness??100}%"></i></div>
    <div class="rooms">${roomHtml}</div>
    <section class="home-statuses"><h2>집 사람들 상태</h2><div>${status}</div></section>
  </article>`;
}
function chips(title,all,selected,key){return `<section class="chips"><h3>${title}</h3>${all.map(x=>`<button data-chip="${key}" data-value="${x}" class="${selected.includes(x)?"on":""}">${x}</button>`).join("")}</section>`}
function character(){
  const c=active();
  const list=state.order.map((id,index)=>{const x=state.characters[id];return `<div class="char-sort-row"><button class="char-row ${id===c.id?"on":""}" data-edit="${id}" style="--own:${x.theme.primary}">${avatar(x)}<span><b>${esc(x.name)}</b><small>${esc(x.job)}</small></span></button><span class="sort-controls"><button data-sort="${id}" data-direction="-1" ${index===0?"disabled":""} aria-label="위로">▲</button><button data-sort="${id}" data-direction="1" ${index===state.order.length-1?"disabled":""} aria-label="아래로">▼</button></span></div>`}).join("");
  const favorites=Object.entries(CATALOG_LABELS).map(([kind,label])=>`<section class="chips"><h3>${label} 최애</h3>${(state.catalog?.[kind]||[]).map(item=>`<button data-favorite-kind="${kind}" data-favorite-id="${item.id}" class="${(c.favorites?.[kind]||[]).includes(item.id)?"on":""}">${esc(item.name)}</button>`).join("")||"<small>취향 사전에서 먼저 항목을 만들어 주세요.</small>"}</section>`).join("");
  const workplaces=state.world.places.filter(p=>["사무실","회사","학교","병원","공연장","관공서","숙박"].includes(p.type));
  const profile=`<h2>프로필</h2><div class="fields"><label>캐릭터 이름<input data-field="name" value="${esc(c.name)}"></label><label>직업 종류<select data-field="job">${JOBS.map(x=>`<option ${x===c.job?"selected":""}>${x}</option>`).join("")}</select></label><label>표기할 직업명<input data-field="jobTitle" value="${esc(c.jobTitle||"")}" placeholder="비워 두면 직업 종류명으로 표시"></label><label>출근할 건물<select data-field="workplaceId"><option value="">자동 선택 / 없음</option><option value="home" ${c.workplaceId==="home"?"selected":""}>🏠 자택근무</option>${workplaces.map(p=>`<option value="${p.id}" ${c.workplaceId===p.id?"selected":""}>${esc(p.name)}</option>`).join("")}</select></label><label>소득 수준<select data-field="income">${INCOMES.map(x=>`<option ${x===c.income?"selected":""}>${x}</option>`).join("")}</select><label>매운맛 선호 <b data-range-label="spiceTolerance">${SPICE_LEVELS[c.spiceTolerance??2]}</b><input type="range" min="0" max="5" data-field="spiceTolerance" data-levels="spice" value="${c.spiceTolerance??2}"></label><label>단맛 선호 <b data-range-label="sweetPreference">${SWEET_LEVELS[c.sweetPreference??2]}</b><input type="range" min="0" max="5" data-field="sweetPreference" data-levels="sweet" value="${c.sweetPreference??2}"></label><label>프로필 사진<div class="image-actions"><button data-image="photo">사진 선택</button><button data-image-url="photo" data-id="${c.id}">링크 입력</button></div></label><label>지도용 캐릭터 아이콘 (선택)<div class="image-actions"><button data-image="icon">투명 아이콘 선택</button><button data-image-url="icon" data-id="${c.id}">링크 입력</button></div><small>첨부하지 않으면 프로필 사진이 원형 아이콘으로 보여요.</small></label><label>기상 시각<input type="time" data-field="wake" value="${c.wake}"></label><label>취침 시각<input type="time" data-field="sleep" value="${c.sleep}"></label><label>대표 테마색<input type="color" data-color="primary" value="${c.theme.primary}"></label><label>그라데이션 보조색<input type="color" data-color="secondary" value="${c.theme.secondary}"></label></div><label class="check"><input type="checkbox" data-gradient ${c.theme.gradient?"checked":""}> 보조색으로 그라데이션 사용</label>`;
  const worldTaste=`<h2>${esc(c.name)}의 세계관 선호</h2><p>취향 사전에 직접 등록한 음식, 음악, 작품과 물건 중 이 캐릭터가 특히 좋아하는 것을 골라 주세요.</p>${favorites}`;
  const taste=`<h2>${esc(c.name)}의 취향 선택</h2><p>이 선택은 다른 캐릭터와 섞이지 않고 이 캐릭터에게만 저장돼요.</p>${chips("음식",FOOD_PREFERENCES,c.foodPreferences||[],"foodPreferences")}${chips("좋아하는 음료",DRINKS,c.drinks||[],"drinks")}${chips("좋아하는 음악 장르",MUSIC,c.musicGenres||[],"musicGenres")}${chips("관심사",INTERESTS,c.interests||[],"interests")}${chips("취미",HOBBIES,c.hobbies||[],"hobbies")}`;
  return `<div class="editor"><aside class="panel"><div class="title"><h2>캐릭터 목록</h2><button data-new>+ 생성</button></div>${list}</aside><section class="panel form"><div class="character-menu"><button data-character-pane="profile" class="${state.characterPane==="profile"?"on":""}">프로필</button><button data-character-pane="taste" class="${state.characterPane==="taste"?"on":""}">취향 선택</button><button data-character-pane="worldTaste" class="${state.characterPane==="worldTaste"?"on":""}">세계관 선호</button></div>${state.characterPane==="taste"?taste:state.characterPane==="worldTaste"?worldTaste:profile}<button class="primary" data-save>캐릭터 저장</button></section></div>`;
}
function catalog(){
  const sections=Object.entries(CATALOG_LABELS).map(([kind,label])=>`<section class="catalog-kind catalog-section"><div class="title"><h2>${label}</h2><button data-add-catalog="${kind}">+ 추가</button></div><div class="catalog-grid catalog-cards">${(state.catalog?.[kind]||[]).map(item=>{const options=CATALOG_CATEGORIES[kind]||[],custom=item.category&&!options.includes(item.category)?[item.category]:[];return `<article class="catalog-card">${item.image?`<img src="${esc(item.image)}" alt="">`:""}<label>이름<input data-catalog-field="name" data-kind="${kind}" data-item="${item.id}" value="${esc(item.name)}"></label><label>분류<select data-catalog-field="category" data-kind="${kind}" data-item="${item.id}"><option value="">분류 선택</option>${[...custom,...options].map(x=>`<option ${x===item.category?"selected":""}>${esc(x)}</option>`).join("")}</select></label><label>이미지 링크<input data-catalog-field="image" data-kind="${kind}" data-item="${item.id}" value="${esc(item.image||"")}" placeholder="https://..."></label>${kind==="food"?`<label>맵기<select data-catalog-field="spicy" data-kind="${kind}" data-item="${item.id}">${levelOptions(SPICE_LEVELS,item.spicy??0)}</select></label><label>달기<select data-catalog-field="sweet" data-kind="${kind}" data-item="${item.id}">${levelOptions(SWEET_LEVELS,item.sweet??0)}</select></label>`:""}${["music","idol","book","movie","game"].includes(kind)?`<label>아티스트·제작자<input data-catalog-field="creator" data-kind="${kind}" data-item="${item.id}" value="${esc(item.creator||"")}"></label>`:""}<button class="danger" data-delete-catalog="${item.id}" data-kind="${kind}">삭제</button></article>`}).join("")||"<p>아직 등록된 항목이 없어요.</p>"}</div></section>`).join("");
  return `<section class="panel form catalog-shell"><div class="title"><div><h1>세계관 취향 사전</h1><p>음식, 옷, 음악, 작품, 게임, 향수와 취미 물품을 직접 만들면 캐릭터가 취향에 맞춰 고르고 생활 로그에서 구체적으로 사용해요.</p></div><button class="primary" data-catalog-save>취향 사전 저장</button></div>${sections}</section>`;
}
function relationship(){
  const cards=Object.values(state.relationships).map(r=>{const a=state.characters[r.a],b=state.characters[r.b];return a&&b?`<article class="relation" style="--a:${a.theme.primary};--b:${b.theme.primary}"><h2>${esc(a.name)} × ${esc(b.name)}</h2><p>${esc(r.type)} · ${r.cohabit?"함께 거주":"따로 거주"}</p><p>친밀도 ${r.intimacy??75} · 갈등도 ${r.conflict??20}</p><button data-edit-rel="${r.id}">편집</button></article>`:""}).join("");
  return `<section class="panel form"><div class="title"><h1>관계</h1><button data-add-rel>+ 관계 추가</button></div>${cards||'<div class="empty-mini"><b>아직 설정한 관계가 없어요.</b><p>관계를 추가하면 두 사람의 생활과 동거 여부에 반영돼요.</p></div>'}</section>`;
}
function routine(){return `<section class="panel form"><h1>주간 루틴</h1><p>요일별 고정 일정 편집기는 다음 업데이트에서 이어집니다.</p></section>`}
function town(){const items=catalogItems(),audiences=["아재 입맛","어린이 입맛","가족","연인·데이트","학생","고소득","오타쿠"];return `<div class="town-tabs">${state.towns.map(t=>`<button data-town-select="${t.id}" class="${t.id===state.activeTownId?"on":""}">🏙️ ${esc(t.name)}</button>`).join("")}<button data-add-town>+ 마을 추가</button>${state.towns.length>1?`<button class="danger" data-delete-town="${state.activeTownId}">현재 마을 삭제</button>`:""}</div><div class="town-edit"><div class="world"><img src="${state.world.bg}" class="world-bg">${state.world.places.map(placeCard).join("")}</div><aside class="panel form"><div class="title"><h2>마을 편집</h2><button class="primary" data-town-save>마을 저장</button></div><label>마을 이름<input data-world-name value="${esc(state.world.name)}"></label><label>기본 배경<select data-world-bg><option value="world-assets/cozy-town.png" ${state.world.bg.includes("cozy")?"selected":""}>개발자 그림 · 마을</option><option value="world-assets/downtown.png" ${state.world.bg.includes("downtown")?"selected":""}>개발자 그림 · 도시</option></select></label><p>건물은 PC와 모바일 모두 이 화면에서 끌어 옮길 수 있어요.</p><button data-add-place>+ 건물 추가</button><div class="place-editor">${state.world.places.map(p=>`<details><summary><b>${esc(p.emoji)} ${esc(p.name)}</b></summary><div class="place-config"><label>건물 이름<input data-place-field="name" data-place-id="${p.id}" value="${esc(p.name)}"></label><label>건물 유형<select data-place-field="type" data-place-id="${p.id}">${placeTypeOptions(p)}</select></label><label>세부 유형<select data-place-field="subtype" data-place-id="${p.id}">${placeSubtypeOptions(p)}</select></label><label>가격대<select data-place-field="priceRange" data-place-id="${p.id}">${["저렴","보통","고급","명품"].map(x=>`<option ${p.priceRange===x?"selected":""}>${x}</option>`).join("")}</select></label><label>마을 속 건물 크기<input type="range" min=".45" max="1.5" step=".05" data-place-field="imageScale" data-place-id="${p.id}" value="${p.imageScale||1}"></label><label>매운맛 정도<select data-place-field="spicy" data-place-id="${p.id}">${levelOptions(SPICE_LEVELS,p.spicy||0)}</select></label><label>단맛 정도<select data-place-field="sweet" data-place-id="${p.id}">${levelOptions(SWEET_LEVELS,p.sweet||0)}</select></label></div><span><button data-place-image="${p.id}">투명 건물 그림</button><button data-image-url="place" data-id="${p.id}">링크</button>${p.image?`<button data-clear-place-image="${p.id}">지우기</button>`:""}</span><h4>주요 이용층</h4><div class="stock-picker">${audiences.map(x=>`<button data-place-audience="${p.id}" data-value="${x}" class="${(p.audiences||[]).includes(x)?"on":""}">${x}</button>`).join("")}</div><h4>이곳에서 파는 것·이용할 수 있는 것</h4><div class="stock-list stock-picker">${items.map(item=>`<button data-place-stock="${p.id}" data-item-id="${item.id}" class="${(p.stock||[]).includes(item.id)?"on":""}">${CATALOG_LABELS[item.kind]} · ${esc(item.name)}</button>`).join("")}</div></details>`).join("")}</div></aside></div>`}
function settings(){return `<section class="panel form"><h1>설정</h1><section class="sync-panel"><h2>Google 계정</h2><p id="account-status">${esc(accountText)}</p><div class="sync-actions"><button class="primary" data-auth>Google 로그인 / 로그아웃</button></div><small>로그인은 여기에서만 관리해요. 화면 위의 ‘동기화’는 현재 기기 데이터를 계정에 올리고, ‘불러오기’는 계정 데이터를 이 기기로 가져옵니다.</small></section><button data-reset>모든 데이터 초기화</button></section>`}
function view(){
  if(!state.order.length)return `<section class="panel empty"><h1>첫 캐릭터를 만들어 주세요</h1><p>로그인 전에는 예시 캐릭터나 실제 지역이 표시되지 않아요.</p><button class="primary" data-new>+ 캐릭터 만들기</button></section>`;
  return ({observe,home,character,catalog,relationship,routine,town,settings}[state.activeTab]||observe)();
}
export function renderApp(next){
  if((!next.activeId||!next.characters[next.activeId])&&next.order.length)next.activeId=next.order[0];
  document.querySelector("#app").innerHTML=`${header()}<main>${view()}</main>`;
}
export function setAccountLabel(text){accountText=text;const el=document.querySelector("#account-status");if(el)el.textContent=text}
