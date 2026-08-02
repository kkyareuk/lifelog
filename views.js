import {state,active} from "./state.js?v=20260802t";
import {eventFor,visibleTimeline,charactersAtPlace,homeGroups} from "./simulation.js?v=20260802t";
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
const PERSONALITY_LEVELS={
  socialEnergy:["사람이 버거움","혼자가 편함","수줍음","상황에 따라 다름","먼저 어울림","인싸","무리의 중심"],
  sensingIntuition:["눈앞의 현실 중시","매우 현실적","구체적인 편","균형형","가능성을 봄","직관적","상상의 세계"],
  thinkingFeeling:["논리 최우선","이성적","차분한 판단","균형형","마음을 살핌","공감형","감정에 깊이 공명"],
  perceivingJudging:["완전 즉흥적","흐름에 맡김","유연한 편","균형형","미리 정리함","계획적","철저한 계획형"]
};
const personalityRange=(c,field,title,left,right)=>`<label class="personality-range"><span class="personality-title">${title}<b data-range-label="${field}">${PERSONALITY_LEVELS[field][c[field]??3]}</b></span><span class="range-poles"><small>${left}</small><small>${right}</small></span><input type="range" min="0" max="6" data-field="${field}" data-levels="${field}" value="${c[field]??3}"></label>`;
const townAssignment=c=>`<section class="setting-card character-town"><h2>생활하는 마을</h2><select data-field="townId">${state.towns.map(t=>`<option value="${t.id}" ${t.id===c.townId?"selected":""}>${esc(t.name)}</option>`).join("")}</select><small>이 캐릭터의 외출·직장·생활 로그는 선택한 마을 안에서만 만들어져요.</small></section>`;
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
const CATALOG_LABELS={food:"음식",drink:"음료",fashion:"옷·패션",music:"음악",idol:"아이돌·밴드",book:"책·작품",movie:"영화·영상",game:"게임",perfume:"향수",hobby:"취미 물품",electronics:"전자기기",weapon:"무기"};
const CATALOG_CATEGORIES={food:["한식","일식","중식","이탈리아 음식","양식","분식","패스트푸드","디저트","빵","간식"],drink:["커피","차","라테","탄산음료","주스","술","기타 음료"],fashion:["상의","하의","아우터","원피스","신발","가방","액세서리"],music:["노래","앨범","플레이리스트","악기"],idol:["솔로 가수","아이돌","밴드","가상 아티스트"],book:["소설","만화","잡지","에세이","전문서적"],movie:["영화","드라마","애니메이션","예능","유튜브·웹영상"],game:["PC 게임","콘솔 게임","모바일 게임","보드게임"],perfume:["향수","디퓨저","캔들","바디 제품"],hobby:["미술 도구","수집품","운동 용품","공예 도구","반려동물 용품"],electronics:["휴대기기","컴퓨터","게임기","음향기기","카메라","생활가전"],weapon:["도검","총기","활","둔기","창","방어구","판타지 무기"]};
const DETAIL_OPTIONS={food:["국물","면","밥","구이","튀김","샐러드","케이크","쿠키"],drink:["따뜻하게","차갑게","무카페인","카페인","무알코올","알코올"],fashion:["캐주얼","정장","스포츠","빈티지","스트리트","럭셔리"],music:["보컬곡","연주곡","라이브","기타","피아노","바이올린","드럼","베이스","관악기"],idol:["보컬","댄스","밴드","버추얼","솔로","그룹"],book:["로맨스","판타지","추리","공포","SF","역사","교양"],game:["RPG","액션","어드벤처","시뮬레이션","퍼즐","리듬","전략","공포"],hobby:["입문용","전문가용","휴대용","수집용","실내용","야외용"],electronics:["스마트폰","태블릿","노트북","데스크톱","콘솔","헤드폰","스피커","카메라","스마트워치"],weapon:["한손용","양손용","원거리","근거리","훈련용","의장용","마법·특수"]};
const PERFUME_NOTES=["우디","플로럴","시트러스","머스크","앰버","아쿠아","그린","파우더리","프루티","스파이시","구르망","레더"];
const VIDEO_GENRES={
  "영화":["로맨스","코미디","액션","스릴러","공포","판타지","SF","다큐멘터리"],
  "드라마":["로맨스","가족","법정","의학","범죄","사극","판타지","청춘"],
  "애니메이션":["일상","판타지","액션","로맨스","스포츠","SF","아동"],
  "예능":["연애 예능","여행 예능","음악 예능","관찰 예능","게임 예능","토크쇼","서바이벌","코미디"],
  "유튜브·웹영상":["브이로그","게임 방송","먹방","리뷰","교육","숏폼","웹예능","웹드라마"]
};
const catalogItems=()=>Object.entries(state.catalog||{}).flatMap(([kind,items])=>(items||[]).map(item=>({...item,kind})));
const levelOptions=(labels,value)=>labels.map((label,index)=>`<option value="${index}" ${Number(value)===index?"selected":""}>${label}</option>`).join("");
const placeTypeOptions=place=>Object.keys(PLACE_TYPES).map(type=>`<option ${place.type===type?"selected":""}>${type}</option>`).join("");
const placeSubtypeOptions=place=>(PLACE_TYPES[place.type]||[""]).map(type=>`<option value="${type}" ${place.subtype===type?"selected":""}>${type||"지정 안 함 · 해당 유형 전체 취급"}</option>`).join("");
const CATALOG_ICONS={food:"🍽️",drink:"🥤",fashion:"👗",music:"🎵",idol:"🎤",book:"📚",movie:"🎬",game:"🎮",perfume:"🧴",hobby:"🎨",electronics:"💻",weapon:"⚔️"};
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
let accountEntitlements={removeAds:false,backgroundPacks:[],iconPacks:[]};
const hasBackground=id=>(accountEntitlements.backgroundPacks||[]).includes(id);
const backgroundOptions=()=>[
  ["world-assets/cozy-town.png","개발자 그림 · 마을",true],
  ["world-assets/downtown.png","개발자 그림 · 도시",true],
  ["world-assets/department-store-premium.png","백화점 아트리움 · 구매 배경",hasBackground("department-store")]
].map(([value,label,owned])=>`<option value="${value}" ${state.world.bg===value?"selected":""} ${owned?"":"disabled"}>${owned?label:`🔒 ${label}`}</option>`).join("");
const adSlot=()=>accountEntitlements.removeAds?"":`<aside class="ad-slot" data-ad-slot>${window.PARALLEL_CITY_ADS?.client?"광고 불러오는 중":"광고 영역 · 광고 제거 구매 시 숨겨집니다"}</aside>`;

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
  return `<div class="roster">${state.order.filter(id=>state.characters[id]?.townId===state.activeTownId).map(id=>{const c=state.characters[id],e=eventFor(c);return `<button class="roster-card ${id===state.activeId?"on":""}" data-roster="${id}" style="--own:${c.theme.primary}">${avatar(c)}<span><b>${esc(c.name)}</b><small>${esc(e.title)}</small></span></button>`}).join("")}</div>`;
}
function placeCard(p){
  const mode=state.buildingLabelMode||"full";
  const label=mode==="none"?"":p.image?`<span class="building-name">${esc(p.name)}</span>`:`<span class="place-label"><b>${esc(p.name)}</b>${mode==="full"?`<small>${esc(p.subtype?`${p.type} · ${p.subtype}`:p.type)}</small>`:""}</span>`;
  return `<button class="place ${p.image?"has-art":""}" style="left:${p.x}%;top:${p.y}%;--place:${p.color};--place-scale:${p.imageScale||1}" data-place="${p.id}">${p.image?`<img class="building-art" src="${esc(p.image)}" alt="${esc(p.name)}">`:`<i>${p.emoji}</i>`}${label}</button>`;
}
function catalogItem(id){return catalogItems().find(item=>item.id===id)}
function townForEntry(entry){return state.towns.find(t=>t.id===entry.townId)||state.towns.find(t=>t.places?.some(p=>p.id===entry.placeId))||state.world}
function placeForEntry(entry){return townForEntry(entry)?.places?.find(p=>p.id===entry.placeId)}
function sceneImage(c,entry){
  if(entry.home)return state.homes[c.homeId]?.rooms?.[entry.room]?.image||"";
  const place=placeForEntry(entry);
  return place?.interiorImage||catalogItem(entry.itemId)?.image||place?.image||"";
}
function importantEntry(entry){return /출근|수업|직장|데이트|병원|다툼|자는 중|기상|공무|훈련/.test(entry.title)}
function dailyLog(c){
  const logs=visibleTimeline(c),current=eventFor(c);
  const entries=!logs.some(x=>x.title===current.title&&x.minute===current.minute)?[...logs,current]:logs;
  return `<section class="panel life-log shared-life-log"><div class="title"><h2>오늘의 생활 로그</h2><small>${esc(c.name)} · 관찰과 집에서 같은 기록을 보여줘요</small></div><ol>${entries.map(x=>`<li class="${importantEntry(x)?"important":""} ${x===entries.at(-1)?"now":""}" style="--log-theme:${esc(c.theme?.primary||"#176b60")}"><time>${esc(x.time)}</time><span><b>${esc(x.title)}</b><small>${esc(x.desc)}</small></span></li>`).join("")}</ol></section>`;
}
function homeDailyLog(chars,h){
  const entries=chars.flatMap(c=>{
    const visible=visibleTimeline(c).filter(x=>x.home),current=eventFor(c);
    const own=current.home&&!visible.some(x=>x.title===current.title&&x.room===current.room)?[...visible,current]:visible;
    return own.map(x=>({...x,character:c}));
  }).sort((a,b)=>a.minute-b.minute).slice(-24);
  return `<section class="panel life-log home-family-log"><div class="title"><h2>집 생활 로그</h2><small>구성원 모두의 집 안 생활</small></div><ol>${entries.map(x=>`<li class="${importantEntry(x)?"important":""}" style="--log-theme:${esc(x.character.theme?.primary||"#176b60")}"><time>${esc(x.time)}</time><span class="log-person">${avatar(x.character,"log-face")}<span><b>${esc(x.character.name)} · ${esc(x.title)}</b><small>${esc(h.rooms?.[x.room]?.name||"집 안")} · ${esc(x.desc)}</small></span></span></li>`).join("")||"<li>아직 집 안 기록이 없어요.</li>"}</ol></section>`;
}
function personCard(c){
  const e=eventFor(c);if(e.home||e.transit||(e.townId&&e.townId!==state.activeTownId))return"";
  const p=state.world.places.find(x=>x.id===e.placeId);if(!p)return"";
  const group=charactersAtPlace(p.id,state.activeTownId),i=group.findIndex(x=>x.id===c.id);
  const offsets=[[-38,-28],[38,-28],[-38,30],[38,30],[0,-54],[0,56]],off=offsets[i%offsets.length];
  return `<button class="person" data-person="${c.id}" style="left:calc(${p.x}% + ${off[0]/12}%);top:calc(${p.y}% + ${off[1]/6.76}%)">${avatar(c)}<span>${esc(c.name)}</span></button>`;
}
function observe(){
  const localIds=state.order.filter(id=>state.characters[id]?.townId===state.activeTownId);
  const localId=localIds.includes(state.activeId)?state.activeId:localIds[0];
  const townSwitcher=state.towns.length>1?`<div class="observe-town-switcher"><b>관찰할 마을</b>${state.towns.map(t=>`<button data-observe-town="${t.id}" class="${t.id===state.activeTownId?"on":""}">🏙️ ${esc(t.name)}</button>`).join("")}</div>`:"";
  if(!localId)return `${roster()}${townSwitcher}<div class="observe"><section><div class="viewport"><div class="world"><img src="${state.world.bg}" class="world-bg">${state.world.places.map(placeCard).join("")}</div></div></section><aside class="panel empty"><h2>이 마을에 사는 캐릭터가 없어요</h2><p>캐릭터 프로필에서 생활하는 마을을 지정할 수 있어요.</p></aside></div>`;
  const c=state.characters[localId],e=eventFor(c),place=placeForEntry(e);
  const everyoneSleeping=state.order.length>0&&state.order.every(id=>eventFor(state.characters[id]).title==="자는 중");
  const sleepGate=everyoneSleeping?`<div class="sleep-gate"><div>🌙</div><h2>모든 인물이 자고 있습니다</h2><p>마을은 조용해졌어요. 집 안에서 인물들의 상태를 볼 수 있어요.</p><button class="primary" data-all-sleep-home>집으로 들어가기</button></div>`:"";
  const currentImage=sceneImage(c,e);
  const location=e.home?`🏠 ${esc(state.homes[c.homeId]?.rooms?.[e.room]?.name||"집 안")}`:e.transit?"🚌 이동 중":place?`📍 ${esc(place.name)} · ${esc(townForEntry(e).name)}`:"📍 외출 중";
  return `${roster()}${townSwitcher}${sleepGate}<div class="observe"><section><div class="world-hud"><div><small>현재 시각</small><b>${new Date().toLocaleString("ko-KR",{month:"long",day:"numeric",weekday:"short",hour:"2-digit",minute:"2-digit"})}</b></div><div><small>관찰 중</small><b>${esc(c.name)} · ${esc(e.title)}</b></div></div><div class="viewport"><div class="world"><img src="${state.world.bg}" class="world-bg">${state.world.places.map(placeCard).join("")}${state.order.map(id=>personCard(state.characters[id])).join("")}</div></div></section><aside class="detail-column"><div class="detail panel"><div class="hero">${c.photo?`<img src="${c.photo}" alt="">`:avatar(c)}</div><h2>${esc(c.name)}</h2><p>${esc(c.jobTitle||c.job)}</p><div class="scene"><small>CURRENT SCENE</small><h3>${esc(e.title)}</h3><p>${esc(e.desc)}</p><b>${location}</b>${currentImage?`<img class="place-photo" src="${esc(currentImage)}" alt="">`:""}</div></div>${dailyLog(c)}</aside></div>`;
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
  const roomKeys=Object.keys(h.rooms||{});
  const pets=h.pets||[];
  const petEmoji={강아지:"🐶",고양이:"🐱",새:"🐦",거북이:"🐢",호랑이:"🐯",인공지능:"🤖",기타:"🐾"};
  const petScene=pet=>{
    const now=new Date(),hour=now.getHours(),slot=Math.floor((hour*60+now.getMinutes())/90);
    const activeHours={강아지:hour>=6&&hour<22,고양이:hour>=18||hour<8,새:hour>=6&&hour<18,거북이:hour>=8&&hour<18,호랑이:hour>=17||hour<9,인공지능:true,기타:hour>=8&&hour<20};
    if(!activeHours[pet.species]){
      const sleepRoomKey=h.rooms?.[pet.room]?pet.room:(h.rooms?.bedroom?"bedroom":roomKeys[0]);
      const sleepRoom=h.rooms?.[sleepRoomKey]?.name||"집 안";
      return {roomKey:sleepRoomKey,title:`${sleepRoom}에서 자는 중`,desc:"자기 자리에 몸을 웅크리고 편안하게 잠들어 있어요."};
    }
    const preferred={
      강아지:["living","entry","study","bedroom"],고양이:["living","study","bedroom","kitchen"],
      새:["living","study","bedroom"],거북이:["living","study","bedroom"],
      호랑이:["living","study","entry"],인공지능:roomKeys,기타:roomKeys
    };
    const candidates=(preferred[pet.species]||roomKeys).filter(key=>h.rooms?.[key]);
    const seed=[...(pet.id+now.toDateString())].reduce((sum,ch)=>sum+ch.charCodeAt(0),0);
    const roomKey=candidates.length?candidates[(seed+slot)%candidates.length]:(pet.room||roomKeys[0]);
    const room=h.rooms?.[roomKey]?.name||"집 안";
    const sameRoom=inside.filter(c=>eventFor(c).room===roomKey);
    const resident=sameRoom.length?sameRoom[(seed+slot)%sameRoom.length]:null;
    const solo={
      강아지:"장난감을 물고 방 안을 오가며 신나게 놀고 있어요.",
      고양이:"캣타워를 오르내리고 바닥의 장난감을 쫓아다니고 있어요.",
      새:"횃대와 장난감 사이를 오가며 가볍게 지저귀고 있어요.",
      거북이:"따뜻한 자리를 찾아 천천히 주변을 탐색하고 있어요.",
      호랑이:"넓은 자리를 천천히 돌며 튼튼한 장난감과 씨름하고 있어요.",
      인공지능:"방 안의 온도와 상태를 확인하며 조용히 순찰하고 있어요.",
      기타:"좋아하는 장난감을 가지고 자기 방식대로 놀고 있어요."
    };
    const together={
      강아지:`${resident?.name}가 던져 주는 장난감을 쫓아가 다시 물어오고 있어요.`,
      고양이:`${resident?.name}가 흔들어 주는 장난감을 쫓으며 캣타워 주변에서 놀고 있어요.`,
      새:`${resident?.name}의 곁에서 장난감을 건드리며 재잘거리고 있어요.`,
      거북이:`${resident?.name}가 지켜보는 옆에서 천천히 방 안을 탐색하고 있어요.`,
      호랑이:`${resident?.name}와 안전거리를 두고 커다란 장난감으로 놀고 있어요.`,
      인공지능:`${resident?.name}에게 필요한 것이 없는지 확인하며 곁을 지키고 있어요.`,
      기타:`${resident?.name}와 같은 방에서 장난감을 가지고 놀고 있어요.`
    };
    return {roomKey,title:`${room}에서 노는 중`,desc:resident?together[pet.species]||together.기타:solo[pet.species]||solo.기타};
  };
  const petScenes=Object.fromEntries(pets.map(p=>[p.id,petScene(p)]));
  const roomHtml=roomKeys.map(key=>{
    const room=h.rooms?.[key]||{},roomPeople=inside.filter(c=>eventFor(c).room===key);
    const roomPets=pets.filter(p=>petScenes[p.id]?.roomKey===key);
    const furniture=FURNITURE[key]||[];
    return `<div class="room ${roomClasses[key]||"custom-room"}" ${roomStyle(h,key)}>
      ${edit?`<input class="room-name" data-room-name="${key}" data-home-id="${id}" value="${esc(room.name||key)}">`:`<b>${esc(room.name||key)}</b>`}
      ${edit?`<div class="room-tools"><button data-room-bg="${id}" data-home-id="${id}" data-room="${key}">사진</button><button data-image-url="room" data-id="${id}" data-room="${key}">링크</button>${room.image?`<button data-clear-room-bg data-home-id="${id}" data-room="${key}">지우기</button>`:""}</div>`:""}
      ${edit?`<div class="furniture">${furniture.map(item=>`<button data-furniture="${item}" data-home-id="${id}" data-room="${key}" class="${(room.furniture||[]).includes(item)?"on":""}">${item}</button>`).join("")}</div>`:""}
      <div class="room-people">${roomPeople.map(c=>{const e=eventFor(c);return `<button class="home-person" data-home-person="${c.id}">${avatar(c)}<span><b>${esc(c.name)}</b><small>${esc(e.title)}</small></span></button>`}).join("")}${roomPets.map((p,index)=>`<button class="home-person pet-person pos-${(roomPeople.length+index)%3}" title="${esc(petScenes[p.id].desc)}">${p.icon?`<img class="sprite" src="${esc(p.icon)}" alt="">`:p.photo?`<img class="avatar" src="${esc(p.photo)}" alt="">`:`<span class="avatar pet-emoji">${petEmoji[p.species]||"🐾"}</span>`}<span><b>${esc(p.name)}</b><small>${esc(petScenes[p.id].title)}</small></span></button>`).join("")}</div>
    </div>`;
  }).join("");
  const residentEditor=edit?`<section class="resident-editor"><h3>함께 사는 캐릭터</h3><div>${state.order.map(cid=>{const c=state.characters[cid],on=c.homeId===id;return `<button data-home-resident="${cid}" data-home-id="${id}" class="${on?"on":""}">${avatar(c)} ${esc(c.name)}</button>`}).join("")}</div><small>여러 명을 선택할 수 있어요. 취향과 관심사는 합쳐지지 않습니다.</small></section>`:"";
  const sleepEditor=edit?`<section class="sleep-room-editor"><div class="title"><h3>자는 방 배정</h3><button data-add-room>+ 방 추가</button></div>${chars.map(c=>`<label>${esc(c.name)}<select data-sleep-room="${c.id}">${roomKeys.map(key=>`<option value="${key}" ${(c.sleepRoomId||"bedroom")===key?"selected":""}>${esc(h.rooms[key]?.name||key)}</option>`).join("")}</select></label>`).join("")}</section>`:"";
  const status=chars.map(c=>{const e=eventFor(c);return `<button class="home-status" data-home-person="${c.id}" style="--own:${c.theme.primary}">${avatar(c)}<span><b>${esc(c.name)}</b><small>${esc(e.title)}</small><em>${esc(e.desc||"")}</em></span></button>`}).join("");
  const petKinds=["강아지","고양이","새","거북이","호랑이","인공지능","기타"];
  const petCards=pets.map(p=>`<article class="pet-card">
    <div class="pet-avatar">${p.icon||p.photo?`<img src="${esc(p.icon||p.photo)}" alt="">`:`<span>${petEmoji[p.species]||"🐾"}</span>`}</div>
    <div class="pet-info"><b>${esc(p.name)}</b><small>${esc(p.species)}${p.breed?` · ${esc(p.breed)}`:""}</small><strong>${esc(petScenes[p.id].title)}</strong><p>${esc(petScenes[p.id].desc)}</p></div>
    ${edit?`<div class="pet-edit"><label>이름<input data-pet-field="name" data-home-id="${id}" data-pet-id="${p.id}" value="${esc(p.name)}"></label><label>종류<select data-pet-field="species" data-home-id="${id}" data-pet-id="${p.id}">${petKinds.map(x=>`<option ${x===p.species?"selected":""}>${x}</option>`).join("")}</select></label><label>품종<input data-pet-field="breed" data-home-id="${id}" data-pet-id="${p.id}" value="${esc(p.breed)}" placeholder="유저가 직접 입력"></label><label>주로 있는 방<select data-pet-field="room" data-home-id="${id}" data-pet-id="${p.id}">${roomKeys.map(key=>`<option value="${key}" ${key===(p.room||"living")?"selected":""}>${esc(h.rooms[key]?.name||key)}</option>`).join("")}</select></label><label>성별<select data-pet-field="sex" data-home-id="${id}" data-pet-id="${p.id}">${["모름","수컷","암컷"].map(x=>`<option ${x===p.sex?"selected":""}>${x}</option>`).join("")}</select></label><label class="check"><input type="checkbox" data-pet-field="neutered" data-home-id="${id}" data-pet-id="${p.id}" ${p.neutered?"checked":""}> 중성화 완료</label><div class="pet-actions"><button data-pet-image="photo" data-home-id="${id}" data-pet-id="${p.id}">원형 사진</button><button data-image-url="petPhoto" data-id="${id}" data-room="${p.id}">사진 링크</button><button data-pet-image="icon" data-home-id="${id}" data-pet-id="${p.id}">투명 아이콘</button><button data-image-url="petIcon" data-id="${id}" data-room="${p.id}">아이콘 링크</button><button class="danger" data-delete-pet="${p.id}" data-home-id="${id}">삭제</button></div></div>`:""}
  </article>`).join("");
  const residentScenes=chars.map(c=>{
    const e=eventFor(c),place=placeForEntry(e),image=sceneImage(c,e);
    const location=e.home?`🏠 ${h.rooms?.[e.room]?.name||"집 안"}`:e.transit?"🚌 이동 중":place?`📍 ${place.name} · ${townForEntry(e).name}`:"📍 외출 중";
    return `<article class="resident-scene-card" style="--resident-theme:${esc(c.theme?.primary||"#176b60")}">
      <div class="resident-profile">${c.photo?`<img src="${esc(c.photo)}" alt="">`:avatar(c)}<span><h3>${esc(c.name)}</h3><small>${esc(c.jobTitle||c.job)}</small></span></div>
      <div class="resident-current"><small>CURRENT SCENE</small><h3>${esc(e.title)}</h3><p>${esc(e.desc)}</p><b>${location}</b>${image?`<img src="${esc(image)}" alt="">`:""}</div>
    </article>`;
  }).join("");
  return `<article class="home panel" data-home-card="${id}">
    <div class="title"><div>${edit?`<input class="home-name" data-home-name data-home-id="${id}" value="${esc(h.name)}">`:`<h2>🏠 ${esc(h.name)}</h2>`}<small>${chars.map(c=>c.name).join(" · ")} 거주 중</small></div><b>${inside.length}명 귀가</b></div>
    ${edit?`<div class="home-photo-editor"><b>집 선택 버튼 배경 사진</b><span><button data-home-bg="${id}">사진</button><button data-image-url="home" data-id="${id}">링크</button>${h.image?`<button data-clear-home-bg="${id}">지우기</button>`:""}</span></div>`:""}
    ${residentEditor}${sleepEditor}<div class="clean">청결도 · ${Math.round(h.cleanliness??100)}% <i style="width:${h.cleanliness??100}%"></i></div>
    <div class="rooms ${roomKeys.length>6?"has-extra":""}">${roomHtml}</div>
    <section class="pets"><div class="title"><h2>반려동물</h2>${edit?`<button data-add-pet>+ 반려동물 추가</button>`:""}</div><div class="pet-grid">${petCards||"<p>아직 함께 사는 반려동물이 없어요.</p>"}</div></section>
    <section class="resident-scenes"><div class="title"><h2>동거인 현재 장면</h2><small>같은 화면에서 나란히 확인해요</small></div><div>${residentScenes}</div></section>
    ${homeDailyLog(chars,h)}
    <section class="home-statuses"><h2>집 사람들 상태</h2><div>${status}</div></section>
  </article>`;
}
function chips(title,all,selected,key){return `<section class="chips"><h3>${title}</h3>${all.map(x=>`<button data-chip="${key}" data-value="${x}" class="${selected.includes(x)?"on":""}">${x}</button>`).join("")}</section>`}
function character(){
  const c=active();
  const list=state.order.map((id,index)=>{const x=state.characters[id];return `<div class="char-sort-row"><button class="char-row ${id===c.id?"on":""}" data-edit="${id}" style="--own:${x.theme.primary}">${avatar(x)}<span><b>${esc(x.name)}</b><small>${esc(x.job)}</small></span></button><span class="sort-controls"><button data-sort="${id}" data-direction="-1" ${index===0?"disabled":""} aria-label="위로">▲</button><button data-sort="${id}" data-direction="1" ${index===state.order.length-1?"disabled":""} aria-label="아래로">▼</button></span></div>`}).join("");
  const favorites=Object.entries(CATALOG_LABELS).map(([kind,label])=>`<section class="chips"><h3>${label} 최애</h3>${(state.catalog?.[kind]||[]).map(item=>`<button data-favorite-kind="${kind}" data-favorite-id="${item.id}" class="${(c.favorites?.[kind]||[]).includes(item.id)?"on":""}">${esc(item.name)}</button>`).join("")||"<small>취향 사전에서 먼저 항목을 만들어 주세요.</small>"}</section>`).join("");
  const inventory=Object.entries(CATALOG_LABELS).map(([kind,label])=>`<section class="chips owned-items"><h3>소지한 ${label}</h3>${(state.catalog?.[kind]||[]).map(item=>`<button data-owned-kind="${kind}" data-owned-id="${item.id}" class="${(c.inventory?.[kind]||[]).includes(item.id)?"on":""}">${esc(item.name)}</button>`).join("")||"<small>취향 사전에서 먼저 항목을 만들어 주세요.</small>"}</section>`).join("");
  const workplaces=state.towns.flatMap(town=>(town.id===state.activeTownId?state.world.places:town.places).map(place=>({...place,townName:town.name})));
  const profile=`<h2>프로필</h2><div class="fields"><label>캐릭터 이름<input data-field="name" value="${esc(c.name)}"></label><label>직업 종류<select data-field="job">${JOBS.map(x=>`<option ${x===c.job?"selected":""}>${x}</option>`).join("")}</select></label><label>표기할 직업명<input data-field="jobTitle" value="${esc(c.jobTitle||"")}" placeholder="비워 두면 직업 종류명으로 표시"></label><label>출근할 건물<select data-field="workplaceId"><option value="">자동 선택 / 없음</option><option value="home" ${c.workplaceId==="home"?"selected":""}>🏠 자택근무</option>${workplaces.map(p=>`<option value="${p.id}" ${c.workplaceId===p.id?"selected":""}>${esc(p.townName)} · ${esc(p.name)}</option>`).join("")}</select></label><label>소득 수준<select data-field="income">${INCOMES.map(x=>`<option ${x===c.income?"selected":""}>${x}</option>`).join("")}</select></label><label>매운맛 선호 <b data-range-label="spiceTolerance">${SPICE_LEVELS[c.spiceTolerance??2]}</b><input type="range" min="0" max="5" data-field="spiceTolerance" data-levels="spice" value="${c.spiceTolerance??2}"></label><label>단맛 선호 <b data-range-label="sweetPreference">${SWEET_LEVELS[c.sweetPreference??2]}</b><input type="range" min="0" max="5" data-field="sweetPreference" data-levels="sweet" value="${c.sweetPreference??2}"></label><label>외향·내향 정도 <b data-range-label="socialEnergy">${PERSONALITY_LEVELS.socialEnergy[c.socialEnergy??3]}</b><input type="range" min="0" max="6" data-field="socialEnergy" data-levels="socialEnergy" value="${c.socialEnergy??3}"></label><label>감각·직관 정도 <b data-range-label="sensingIntuition">${PERSONALITY_LEVELS.sensingIntuition[c.sensingIntuition??3]}</b><input type="range" min="0" max="6" data-field="sensingIntuition" data-levels="sensingIntuition" value="${c.sensingIntuition??3}"></label><label>사고·감정 정도 <b data-range-label="thinkingFeeling">${PERSONALITY_LEVELS.thinkingFeeling[c.thinkingFeeling??3]}</b><input type="range" min="0" max="6" data-field="thinkingFeeling" data-levels="thinkingFeeling" value="${c.thinkingFeeling??3}"></label><label>인식·판단 정도 <b data-range-label="perceivingJudging">${PERSONALITY_LEVELS.perceivingJudging[c.perceivingJudging??3]}</b><input type="range" min="0" max="6" data-field="perceivingJudging" data-levels="perceivingJudging" value="${c.perceivingJudging??3}"></label><label>프로필 사진<div class="image-actions"><button data-image="photo">사진 선택</button><button data-image-url="photo" data-id="${c.id}">링크 입력</button></div></label><label>지도용 캐릭터 아이콘 (선택)<div class="image-actions"><button data-image="icon">투명 아이콘 선택</button><button data-image-url="icon" data-id="${c.id}">링크 입력</button></div><small>첨부하지 않으면 프로필 사진이 원형 아이콘으로 보여요.</small></label><label>기상 시각<input type="time" data-field="wake" value="${c.wake}"></label><label>취침 시각<input type="time" data-field="sleep" value="${c.sleep}"></label><label>대표 테마색<input type="color" data-color="primary" value="${c.theme.primary}"></label><label>그라데이션 보조색<input type="color" data-color="secondary" value="${c.theme.secondary}"></label></div><label class="check"><input type="checkbox" data-gradient ${c.theme.gradient?"checked":""}> 보조색으로 그라데이션 사용</label>`;
  const worldTaste=`<h2>${esc(c.name)}의 세계관 선호와 소지품</h2><p>특히 좋아하는 항목과 실제로 가지고 다니거나 보관하는 물건을 각각 골라 주세요.</p>${favorites}<hr><h2>소지품</h2>${inventory}`;
  const taste=`<h2>${esc(c.name)}의 취향 선택</h2><p>이 선택은 다른 캐릭터와 섞이지 않고 이 캐릭터에게만 저장돼요.</p>${chips("음식",FOOD_PREFERENCES,c.foodPreferences||[],"foodPreferences")}${chips("좋아하는 음료",DRINKS,c.drinks||[],"drinks")}${chips("좋아하는 음악 장르",MUSIC,c.musicGenres||[],"musicGenres")}${chips("관심사",INTERESTS,c.interests||[],"interests")}${chips("취미",HOBBIES,c.hobbies||[],"hobbies")}`;
  return `<div class="editor"><aside class="panel"><div class="title"><h2>캐릭터 목록</h2><button data-new>+ 생성</button></div>${list}</aside><section class="panel form"><div class="character-menu"><button data-character-pane="profile" class="${state.characterPane==="profile"?"on":""}">프로필</button><button data-character-pane="taste" class="${state.characterPane==="taste"?"on":""}">취향 선택</button><button data-character-pane="worldTaste" class="${state.characterPane==="worldTaste"?"on":""}">세계관 선호</button></div>${state.characterPane==="taste"?taste:state.characterPane==="worldTaste"?worldTaste:townAssignment(c)+profile}<div class="form-actions"><button class="primary" data-save>캐릭터 저장</button><button class="danger" data-delete-character="${c.id}">캐릭터 삭제</button></div></section></div>`;
}
function catalog(){
  const sections=Object.entries(CATALOG_LABELS).map(([kind,label])=>{
    const cards=(state.catalog?.[kind]||[]).map(item=>{
      const categories=kind==="movie"?Object.keys(VIDEO_GENRES):(CATALOG_CATEGORIES[kind]||[]);
      const custom=item.category&&!categories.includes(item.category)?[item.category]:[];
      const subgenres=kind==="movie"?(VIDEO_GENRES[item.category]||[]):kind==="perfume"?PERFUME_NOTES:(DETAIL_OPTIONS[kind]||[]);
      const detailEditor=kind==="perfume"?`<div class="chips"><b>향 계열 키워드 · 여러 개 선택 가능</b>${PERFUME_NOTES.map(x=>`<button data-catalog-keyword="${item.id}" data-kind="${kind}" data-value="${x}" class="${(item.keywords||[]).includes(x)?"on":""}">${x}</button>`).join("")}</div>`:`<label>세부 항목<select data-catalog-field="subtype" data-kind="${kind}" data-item="${item.id}"><option value="">세부 항목 선택</option>${subgenres.map(x=>`<option ${x===item.subtype?"selected":""}>${esc(x)}</option>`).join("")}</select></label>`;
      return `<details class="catalog-dex-card"><summary>${item.image?`<img class="catalog-app-icon" src="${esc(item.image)}" alt="">`:`<span class="catalog-app-icon">${CATALOG_ICONS[kind]||"📦"}</span>`}<b>${esc(item.name)}</b><small>${esc(item.category||label)}${item.subtype?` · ${esc(item.subtype)}`:""}</small></summary><div class="catalog-detail"><label>이름<input data-catalog-field="name" data-kind="${kind}" data-item="${item.id}" value="${esc(item.name)}"></label><label>분류<select data-catalog-field="category" data-kind="${kind}" data-item="${item.id}"><option value="">분류 선택</option>${[...custom,...categories].map(x=>`<option ${x===item.category?"selected":""}>${esc(x)}</option>`).join("")}</select></label>${detailEditor}<label>이미지 링크<input data-catalog-field="image" data-kind="${kind}" data-item="${item.id}" value="${esc(item.image||"")}" placeholder="https://..."></label>${kind==="food"?`<label>맵기<select data-catalog-field="spicy" data-kind="${kind}" data-item="${item.id}">${levelOptions(SPICE_LEVELS,item.spicy??0)}</select></label><label>달기<select data-catalog-field="sweet" data-kind="${kind}" data-item="${item.id}">${levelOptions(SWEET_LEVELS,item.sweet??0)}</select></label>`:""}${["music","idol","book","movie","game"].includes(kind)?`<label>아티스트·제작자<input data-catalog-field="creator" data-kind="${kind}" data-item="${item.id}" value="${esc(item.creator||"")}"></label>`:""}<button class="danger" data-delete-catalog="${item.id}" data-kind="${kind}">항목 삭제</button></div></details>`;
    }).join("")||"<p>아직 등록된 항목이 없어요.</p>";
    return `<section class="catalog-kind catalog-section"><div class="title"><h2>${label}</h2><button data-add-catalog="${kind}">+ 추가</button></div><div class="catalog-dex-grid">${cards}</div></section>`;
  }).join("");
  return `<section class="panel form catalog-shell"><div class="title"><div><h1>세계관 취향 도감</h1><p>아이콘을 누르면 세부 정보와 편집 항목이 열려요.</p></div><button class="primary" data-catalog-save>도감 저장</button></div>${sections}</section>`;
}
function relationship(){
  const cards=Object.values(state.relationships).map(r=>{const a=state.characters[r.a],b=state.characters[r.b];return a&&b?`<article class="relation" style="--a:${a.theme.primary};--b:${b.theme.primary}"><h2>${esc(a.name)} × ${esc(b.name)}</h2><p>${esc(r.type)} · ${r.cohabit?"함께 거주":"따로 거주"}</p><p>친밀도 ${r.intimacy??75} · 갈등도 ${r.conflict??20}</p><button data-edit-rel="${r.id}">편집</button><button class="danger" data-delete-rel="${r.id}">삭제</button></article>`:""}).join("");
  return `<section class="panel form"><div class="title"><h1>관계</h1><button data-add-rel>+ 관계 추가</button></div>${cards||'<div class="empty-mini"><b>아직 설정한 관계가 없어요.</b><p>관계를 추가하면 두 사람의 생활과 동거 여부에 반영돼요.</p></div>'}</section>`;
}
function routine(){return `<section class="panel form"><h1>주간 루틴</h1><p>요일별 고정 일정 편집기는 다음 업데이트에서 이어집니다.</p></section>`}
function town(){const items=catalogItems(),audiences=["아재 입맛","어린이 입맛","가족","연인·데이트","학생","고소득","오타쿠"];return `<div class="town-tabs">${state.towns.map(t=>`<button data-town-select="${t.id}" class="${t.id===state.activeTownId?"on":""}">🏙️ ${esc(t.name)}</button>`).join("")}<button data-add-town>+ 마을 추가</button>${state.towns.length>1?`<button class="danger" data-delete-town="${state.activeTownId}">현재 마을 삭제</button>`:""}</div><div class="town-edit"><div class="world"><img src="${state.world.bg}" class="world-bg">${state.world.places.map(placeCard).join("")}</div><aside class="panel form"><div class="title"><h2>마을 편집</h2><button class="primary" data-town-save>마을 저장</button></div><label>마을 이름<input data-world-name value="${esc(state.world.name)}"></label><label>기본 배경<select data-world-bg><option value="world-assets/cozy-town.png" ${state.world.bg.includes("cozy")?"selected":""}>개발자 그림 · 마을</option><option value="world-assets/downtown.png" ${state.world.bg.includes("downtown")?"selected":""}>개발자 그림 · 도시</option><option value=world-assets/department-store-premium.png>구매 배경 · 백화점 아트리움</option></select></label><p>건물은 PC와 모바일 모두 이 화면에서 끌어 옮길 수 있어요.</p><button data-add-place>+ 건물 추가</button><div class="place-editor">${state.world.places.map(p=>`<details><summary><b>${esc(p.emoji)} ${esc(p.name)}</b></summary><div class="place-config"><label>건물 이름<input data-place-field="name" data-place-id="${p.id}" value="${esc(p.name)}"></label><label>건물 유형<select data-place-field="type" data-place-id="${p.id}">${placeTypeOptions(p)}</select></label><label>세부 유형<select data-place-field="subtype" data-place-id="${p.id}">${placeSubtypeOptions(p)}</select></label><label>가격대<select data-place-field="priceRange" data-place-id="${p.id}">${["저렴","보통","고급","명품"].map(x=>`<option ${p.priceRange===x?"selected":""}>${x}</option>`).join("")}</select></label><label>마을 속 건물 크기<input type="range" min=".45" max="1.5" step=".05" data-place-field="imageScale" data-place-id="${p.id}" value="${p.imageScale||1}"></label><label>매운맛 정도<select data-place-field="spicy" data-place-id="${p.id}">${levelOptions(SPICE_LEVELS,p.spicy||0)}</select></label><label>단맛 정도<select data-place-field="sweet" data-place-id="${p.id}">${levelOptions(SWEET_LEVELS,p.sweet||0)}</select></label></div><div class="place-photo-tools"><b>마을 지도용 건물 그림</b><span><button data-place-image="${p.id}">투명 그림 업로드</button><button data-image-url="place" data-id="${p.id}">링크</button>${p.image?`<button data-clear-place-image="${p.id}">지우기</button>`:""}</span><b>생활 로그·현재 장면용 내부 사진</b><span><button data-place-interior-image="${p.id}">내부 사진 업로드</button><button data-image-url="placeInterior" data-id="${p.id}">링크</button>${p.interiorImage?`<button data-clear-place-interior-image="${p.id}">지우기</button>`:""}</span></div><button class="danger" data-delete-place="${p.id}">건물 삭제</button><h4>주요 이용층</h4><div class="stock-picker">${audiences.map(x=>`<button data-place-audience="${p.id}" data-value="${x}" class="${(p.audiences||[]).includes(x)?"on":""}">${x}</button>`).join("")}</div><h4>이곳에서 파는 것·이용할 수 있는 것</h4><div class="stock-list stock-picker">${items.map(item=>`<button data-place-stock="${p.id}" data-item-id="${item.id}" class="${(p.stock||[]).includes(item.id)?"on":""}">${CATALOG_LABELS[item.kind]} · ${esc(item.name)}</button>`).join("")}</div></details>`).join("")}</div></aside></div>`}
function settings(){return `<section class="panel form"><h1>설정</h1><section class="setting-card"><h2>마을 지도 건물 글자</h2><label>건물 표기 방식<select data-setting="buildingLabelMode"><option value="full" ${state.buildingLabelMode==="full"?"selected":""}>이름과 건물 유형 표시</option><option value="name" ${state.buildingLabelMode==="name"?"selected":""}>이름만 표시</option><option value="none" ${state.buildingLabelMode==="none"?"selected":""}>아무 글자도 표시하지 않기</option></select></label><small>‘아무 글자도 표시하지 않기’를 선택하면 업로드한 지도용 건물 그림만 보이게 할 수 있어요.</small></section><section class="sync-panel"><h2>Google 계정</h2><p id="account-status">${esc(accountText)}</p><div class="sync-actions"><button class="primary" data-auth>Google 로그인 / 로그아웃</button></div><small>로그인은 여기에서만 관리해요. 화면 위의 ‘동기화’는 현재 기기 데이터를 계정에 올리고, ‘불러오기’는 계정 데이터를 이 기기로 가져옵니다.</small></section><button data-reset>모든 데이터 초기화</button></section>`}
function view(){
  if(!state.order.length)return `<section class="panel empty"><h1>첫 캐릭터를 만들어 주세요</h1><p>로그인 전에는 예시 캐릭터나 실제 지역이 표시되지 않아요.</p><button class="primary" data-new>+ 캐릭터 만들기</button></section>`;
  return ({observe,home,character,catalog,relationship,routine,town,settings}[state.activeTab]||observe)();
}
export function renderApp(next){
  if((!next.activeId||!next.characters[next.activeId])&&next.order.length)next.activeId=next.order[0];
  document.querySelector("#app").innerHTML=`${header()}${adSlot()}<main>${view()}</main>`;
}
export function setAccountLabel(text){accountText=text;const el=document.querySelector("#account-status");if(el)el.textContent=text}
export function setAccountEntitlements(value){accountEntitlements={removeAds:value?.removeAds===true,backgroundPacks:Array.isArray(value?.backgroundPacks)?value.backgroundPacks:[],iconPacks:Array.isArray(value?.iconPacks)?value.iconPacks:[]}}
