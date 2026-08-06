import {state,active,characterViewFor} from "./state.js?v=20260807a";
import {eventFor as simulateEventFor,visibleTimeline as simulateVisibleTimeline,charactersAtPlace,homeGroups} from "./simulation.js?v=20260807a";
// Cache-busted state module is imported above; this comment intentionally keeps the view bundle versioned.
const esc=(x="")=>String(x).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const hasBatchim=value=>{
  const code=[...String(value||"").trim()].at(-1)?.charCodeAt(0);
  return Number.isFinite(code)&&code>=0xac00&&code<=0xd7a3&&(code-0xac00)%28!==0;
};
const withParticle=(value,batchim,noBatchim)=>`${value||""}${hasBatchim(value)?batchim:noBatchim}`;
const subjectText=value=>withParticle(value,"이","가");
const objectText=value=>withParticle(value,"을","를");
const togetherText=value=>withParticle(value,"과","와");
const regexEscape=value=>String(value||"").replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
const displayEntityNames=()=>[
  ...Object.values(state.characters||{}).map(item=>item?.name),
  ...Object.values(state.homes||{}).flatMap(home=>[home?.name,...Object.values(home?.rooms||{}).map(room=>room?.name),...(home?.pets||[]).map(pet=>pet?.name)]),
  ...(state.towns||[]).flatMap(town=>[town?.name,...(town?.places||[]).map(place=>place?.name)]),
  ...Object.values(state.catalog||{}).flatMap(items=>(items||[]).map(item=>item?.name))
].filter(Boolean).map(String).sort((a,b)=>b.length-a.length);
function resolveDisplayParticles(text){
  let result=String(text||"")
    .replace(/([가-힣A-Za-z0-9_]+)은\(는\)/g,(_,word)=>withParticle(word,"은","는"))
    .replace(/([가-힣A-Za-z0-9_]+)이\(가\)/g,(_,word)=>subjectText(word))
    .replace(/([가-힣A-Za-z0-9_]+)을\(를\)/g,(_,word)=>objectText(word))
    .replace(/([가-힣A-Za-z0-9_]+)과\(와\)/g,(_,word)=>togetherText(word));
  displayEntityNames().forEach(name=>{
    const pattern=new RegExp(`${regexEscape(name)}(은|는|이|가|을|를|과|와)(?=[\\s,.!?·'\"’”)]|$)`,"g");
    result=result.replace(pattern,(_,particle)=>{
      if(["은","는"].includes(particle))return withParticle(name,"은","는");
      if(["이","가"].includes(particle))return subjectText(name);
      if(["을","를"].includes(particle))return objectText(name);
      return togetherText(name);
    });
  });
  return result;
}
function normalizeDisplayedParticles(root){
  if(!root||typeof document.createTreeWalker!=="function")return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(node=>{const next=resolveDisplayParticles(node.nodeValue);if(next!==node.nodeValue)node.nodeValue=next});
}
const sceneFailureIds=new Set();
const fallbackEvent=c=>{
  const roomKeys=Object.keys(state.homes?.[c?.homeId]?.rooms||{});
  return {minute:new Date().getHours()*60+new Date().getMinutes(),title:"생활 장면을 다시 계산하는 중",desc:"저장된 설정은 그대로 두고 현재 장면만 안전하게 다시 계산하고 있어요.",home:true,room:c?.sleepRoomId||roomKeys[0]||"",townId:c?.townId||state.activeTownId,mood:"대기"};
};
const eventFor=(c,date=new Date())=>{
  try{return simulateEventFor(c,date)||fallbackEvent(c)}
  catch(error){
    if(!sceneFailureIds.has(c?.id)){sceneFailureIds.add(c?.id);console.error(`캐릭터 장면 계산 실패 · ${c?.id||"unknown"}`,error)}
    return fallbackEvent(c);
  }
};
const visibleTimeline=(c,date=new Date())=>{
  try{const entries=simulateVisibleTimeline(c,date);return Array.isArray(entries)?entries:[]}
  catch(error){
    if(!sceneFailureIds.has(c?.id)){sceneFailureIds.add(c?.id);console.error(`캐릭터 생활 로그 계산 실패 · ${c?.id||"unknown"}`,error)}
    return[];
  }
};
const JOBS=["무직","학생","회사원","CEO","의사","간호사","교사","교수","정치인","기자","요리사","프로그래머","연구원","예술가","해적","군인","범죄자","환경미화원","여관주인","자영업·직접 입력"];
const TASTES=["아재 입맛","어린이 입맛","한식파","면 요리 선호","디저트광","커피 못 마심","신상 맛집파"];
const INTERESTS=["향수","애니메이션","만화","게임","패션","미술","음악","영화","드라마","예능","문구","인테리어","역사","기계","자동차","오토바이","철도","항공","천문학","우주","과학","의학","심리학","철학","정치","경제","법률","언어","외국어","여행","지도","지리","건축","사진","영상 편집","글쓰기","소설","시","요리","베이킹","커피","차","와인","반려동물","식물","원예","자연","환경","캠핑","등산","러닝","헬스","요가","축구","야구","농구","e스포츠","보드게임","퍼즐","마술","공예","뜨개질","재봉","목공","도예","수집","빈티지","전자기기","프로그래밍","로봇","인공지능","오컬트","신화","종교","범죄 사건","추리","밀리터리","무기"];
const HOBBIES=["취미 없음","집에서 뒹굴기","외출 안 함","인터넷 서핑","커뮤니티 눈팅","영상 정주행","낮잠","덕질","독서","웹소설 읽기","만화 보기","글쓰기","일기 쓰기","필사","외국어 공부","카페 탐방","맛집 탐방","쇼핑","빈티지 숍 구경","패션 코디","향수 시향","요리","베이킹","커피 내리기","차 우리기","칵테일 만들기","청소","정리 정돈","인테리어 꾸미기","식물 돌보기","원예","반려동물과 놀기","산책","러닝","등산","캠핑","자전거","수영","헬스","요가","필라테스","축구","야구","농구","사진 촬영","영상 촬영","영상 편집","그림 그리기","디지털 드로잉","전시 관람","공연 관람","영화 감상","음악 감상","악기 연주","노래 부르기","춤추기","공방 체험","도예","뜨개질","재봉","자수","목공","가죽 공예","프라모델 조립","피규어 수집","우표 수집","레코드 수집","보드게임","퍼즐","방탈출","게임","e스포츠 시청","코딩","전자기기 만지기","자동차 관리","드라이브","천체 관측","여행 계획","지도 보기","역사 탐방","봉사활동"];
const INCOMES=["절약 우선","가성비 중시","필요한 만큼 소비","취향에는 아끼지 않음","품질 우선","가격을 거의 신경 쓰지 않음"];
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
const townAssignment=c=>`<section class="setting-card character-town"><h2>기본 생활 마을</h2><select data-field="townId">${state.towns.map(t=>`<option value="${t.id}" ${t.id===c.townId?"selected":""}>${esc(t.name)}</option>`).join("")}</select><small>집마다 다른 마을을 지정했다면 실제로 머무는 집의 마을이 우선합니다.</small></section>`;
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
const CATALOG_CATEGORIES={food:["한식","일식","중식","이탈리아 음식","양식","분식","패스트푸드","디저트","빵","간식"],drink:["커피","차","라테","탄산음료","주스","술","기타 음료"],fashion:["상의","하의","아우터","원피스","신발","가방","액세서리"],music:["노래","앨범","플레이리스트","악기"],idol:["솔로 가수","아이돌","밴드","가상 아티스트"],book:["소설","만화","잡지","에세이","전문서적"],movie:["영화","드라마","애니메이션","예능","유튜브·웹영상"],game:["PC 게임","콘솔 게임","모바일 게임","보드게임"],perfume:["향수","디퓨저","캔들","바디 제품"],hobby:["미술 도구","수집품","운동 용품","공예 도구","반려동물 용품"],electronics:["휴대기기","컴퓨터","게임기","음향기기","카메라","생활가전"],weapon:["총기","검·도검","활·석궁","둔기","창·장병기","방어구","판타지 무기"]};
const BLADE_SUBTYPES=["단검","나이프","쇼트소드","아밍소드","롱소드","바스타드소드","대검","클레이모어","레이피어","에페","세이버","커틀러스","샴시르","시미터","카타나","타치","와키자시","노다치","쌍검","검지팡이","의장검"];
const WEAPON_SUBTYPES={총기:["권총","리볼버","기관단총","돌격소총","소총","저격소총","산탄총","기관총"],"검·도검":BLADE_SUBTYPES,도검:BLADE_SUBTYPES,검:BLADE_SUBTYPES,"활·석궁":["단궁","장궁","복합궁","컴파운드 보우","석궁"],둔기:["곤봉","메이스","철퇴","전투망치"],"창·장병기":["창","장창","할버드","언월도","삼지창"],방어구:["방패","경갑","중갑","투구"],"판타지 무기":["마법봉","지팡이","마도서","마검","에너지 무기"]};
const DETAIL_OPTIONS={food:["국물","면","밥","구이","튀김","샐러드","케이크","쿠키"],drink:["따뜻하게","차갑게","무카페인","카페인","무알코올","알코올"],fashion:["캐주얼","정장","스포츠","빈티지","스트리트","럭셔리"],music:["보컬곡","연주곡","라이브","기타","피아노","바이올린","드럼","베이스","관악기"],idol:["보컬","댄스","밴드","버추얼","솔로","그룹"],book:["로맨스","판타지","추리","공포","SF","역사","교양"],game:["MOBA","MMORPG","액션 RPG","턴제 RPG","FPS","TPS","배틀로얄","RTS","전략","시뮬레이션","샌드박스","서바이벌","어드벤처","퍼즐","리듬","격투","레이싱","스포츠","공포","소셜·파티"],hobby:["입문용","전문가용","휴대용","수집용","실내용","야외용"],electronics:["스마트폰","태블릿","노트북","데스크톱","콘솔","헤드폰","스피커","카메라","스마트워치"],weapon:[]};
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
  living:["소파","TV","책장","오디오","안마의자","게임기","캣타워","턴테이블","보드게임장","홈시어터","프로젝터","악기 진열장","수집품 진열장","독서 의자","반려동물 장난감","러닝머신"],
  kitchen:["냉장고","조리대","식탁","오븐","커피머신","식기세척기","에스프레소 머신","티 세트","제빵 도구","칵테일 바","와인 냉장고","향신료 선반","요리책 선반"],
  entry:["신발장","전신거울","우산꽂이","반려동물 산책용품","자전거 보관대","운동 장비 선반","캠핑 장비"],
  bath:["샤워부스","욕조","세면대","세탁기","건조기","입욕제 선반","향수 선반","스킨케어 선반"],
  bedroom:["침대","옷장","화장대","협탁","빔프로젝터","독서등","향수 진열대","레코드 플레이어","작은 게임기","봉제인형","수집품 진열장"],
  study:["책상","컴퓨터","피아노","기타","그림 도구","재봉틀","운동기구","디지털 드로잉 장비","촬영 장비","보드게임 선반","공예 도구","뜨개 도구","프라모델 작업대","천체망원경","악기"],
  dining:["식탁","의자","찬장","티 테이블","와인장"],
  nursery:["아기 침대","수납장","놀이 매트","책장","기저귀 교환대"],
  guest:["침대","협탁","옷걸이","작은 책상","전신거울"],
  hobby:["작업대","수납장","그림 도구","재봉틀","악기","운동기구","디지털 드로잉 장비","촬영 장비","보드게임 선반","공예 도구","뜨개 도구","프라모델 작업대","천체망원경"],
  balcony:["화분","야외 의자","작은 테이블","빨래 건조대","원예 도구","캠핑 의자","천체망원경"],
  storage:["수납장","선반","보관 상자","옷걸이","캠핑 장비","운동 장비","수집품 상자"],
  other:["수납장","의자","작은 테이블","책장","오디오"]
};
const ROOM_TYPES={living:"거실",kitchen:"주방",entry:"현관",bath:"욕실",bedroom:"침실",study:"서재·취미방",dining:"다이닝룸",nursery:"아이방",guest:"손님방",hobby:"취미방",balcony:"베란다",storage:"창고",other:"기타 방"};
const roomTypeOptions=room=>Object.entries(ROOM_TYPES).map(([value,label])=>`<option value="${value}" ${(room.type||"other")===value?"selected":""}>${label}</option>`).join("");
let accountText="Google 로그인 안 됨";
let accountEntitlements={backgroundPacks:[],iconPacks:[],dlcPacks:[],purchases:[],characterSlotPacks:0,townSlotPacks:0,storage50:false};
const previewConfig=()=>window.PARALLEL_CITY_CONFIG?.beta||{};
const previewMode=()=>Boolean(previewConfig().enabled);
const characterLimit=()=>7+(Math.max(0,Number(accountEntitlements.characterSlotPacks)||0)*5);
const townLimit=()=>2+Math.max(0,Number(accountEntitlements.townSlotPacks)||0);
const hasBackground=id=>(accountEntitlements.backgroundPacks||[]).includes(id);
const hasDlc=id=>(accountEntitlements.dlcPacks||[]).includes(id);
const backgroundOptions=()=>[
  ["world-assets/cozy-town.png","마을",true],
  ["world-assets/downtown.png","도시",true],
  ["world-assets/department-store-premium.png","백화점 아트리움 · 구매 배경",hasBackground("department-store")]
].map(([value,label,owned])=>`<option value="${value}" ${state.world.bg===value?"selected":""} ${owned?"":"disabled"}>${owned?label:`🔒 ${label}`}</option>`).join("");
const BUILDING_ICONS=[["cafe","카페"],["restaurant","식당"],["office","사무실"],["hospital","병원"],["park","공원"],["school","학교"],["clothing","옷가게"],["theater","공연장"],["hotel","호텔"],["department","백화점"],["library","도서관"],["shop","상점"]];
const buildingIconOptions=p=>BUILDING_ICONS.map(([id,label])=>`<option value="${id}" ${p.iconPreset===id?"selected":""}>${label}</option>`).join("");
const visibleTownId=c=>eventFor(c)?.townId||c.townId;

function avatar(c,cls=""){
  if(c.icon)return `<img class="sprite ${cls}" src="${c.icon}" alt="">`;
  if(c.photo)return `<img class="avatar ${cls}" src="${c.photo}" alt="">`;
  return `<span class="avatar ${cls}" style="--own:${c.theme.primary}">${esc((c.name||"새").slice(0,1))}</span>`;
}
function header(){
  const tabs=[["observe","관찰"],["home","집"],["character","캐릭터"],["catalog","취향 사전"],["relationship","관계"],["routine","주간 루틴"],["town","마을"],["shop","상점"],["settings","설정"]];
  return `<header><div class="brand"><span class="logo"><img src="./icons/drawer-village-logo.png" alt="서랍마을"></span><div><h1>서랍마을</h1><small>서랍 속 캐릭터 생활 관찰 게임</small></div>${previewMode()?`<span class="preview-badge">${esc(previewConfig().label||"사전 체험")}</span>`:""}</div><nav>${tabs.map(([k,n])=>`<button data-tab="${k}" class="${state.activeTab===k?"on":""}">${n}</button>`).join("")}</nav><span id="save-state">기기에 저장됨</span></header>`;
}
function rosterSummary(entry){
  const title=String(entry?.title||"생활 중").split(" · ")[0].trim();
  return title.length>24?`${title.slice(0,23)}…`:title;
}
function roster(){
  return `<div class="roster">${state.order.map(id=>{const c=state.characters[id],e=eventFor(c),away=visibleTownId(c)!==state.activeTownId,summary=rosterSummary(e);return `<button class="roster-card ${id===state.activeId?"on":""} ${away?"away":""}" data-roster="${id}" title="${esc(c.name)} · ${esc(e.title)}" style="--own:${c.theme.primary}">${avatar(c)}<span class="roster-info"><b>${esc(c.name)}</b><small>${esc(summary)}</small></span></button>`}).join("")}</div>`;
}
function placeCard(p){
  const mode=state.buildingLabelMode||"full";
  const labelX=Math.max(8,Math.min(92,p.x)),labelY=Math.max(13,Math.min(92,p.y));
  const label=mode==="none"?"":`<span class="map-place-label" style="left:${labelX}%;top:${labelY}%"><b>${esc(p.name)}</b>${mode==="full"?`<small>${esc(p.subtype?`${p.type} · ${p.subtype}`:p.type)}</small>`:""}</span>`;
  const presetSources={"type-generic":"world-assets/building-types/generic.png","type-cafe":"world-assets/building-types/cafe.png","type-restaurant":"world-assets/building-types/restaurant.png","type-hospital":"world-assets/building-types/hospital.png","type-office":"world-assets/building-types/office.png","type-shop":"world-assets/building-types/shop.png","type-school":"world-assets/building-types/school.png","type-lodging":"world-assets/building-types/lodging.png","type-library":"world-assets/building-types/library.png","type-theater":"world-assets/building-types/theater.png","type-park":"world-assets/building-types/park.png","type-home":"world-assets/building-types/home.png","drawer-building":"world-assets/drawer-building.png","drawer-home":"world-assets/drawer-home.png","medieval-castle":"world-assets/medieval-castle.svg","medieval-tavern":"world-assets/medieval-tavern.svg","medieval-market":"world-assets/medieval-market.svg"};
  const preset=presetSources[p.iconPreset]||presetSources["drawer-building"];
  return `<button class="place has-art" style="left:${p.x}%;top:${p.y}%;--place:${p.color};--place-scale:${p.imageScale||1}" data-place="${p.id}"><img class="building-preset-image" src="${preset}" alt=""></button>${label}`;
}
function catalogItem(id){return catalogItems().find(item=>item.id===id)}
function townForEntry(entry){return state.towns.find(t=>t.id===entry.townId)||state.towns.find(t=>t.places?.some(p=>p.id===entry.placeId))||state.world}
function placeForEntry(entry){return townForEntry(entry)?.places?.find(p=>p.id===entry.placeId)}
function sceneImage(c,entry){
  if(entry.home)return state.homes[entry.visitHomeId||c.homeId]?.rooms?.[entry.room]?.image||"";
  const place=placeForEntry(entry);
  return catalogItem(entry.itemId)?.image||place?.interiorImage||place?.image||"";
}
function importantEntry(entry){return /출근|수업|직장|데이트|병원|다툼|기상|공무|훈련/.test(entry.title)}
const loggableEntry=entry=>entry?.title!=="자는 중"&&!/에서 자는 중$/.test(entry?.title||"");
function dailyLogItems(entries,c){
  const seen=new Set();
  const canonicalDateGroup=x=>{
    if(!x?.dateGroup)return "";
    const partnerId=x.withId&&x.withId!==c.id?x.withId:"";
    return partnerId?`date-${[c.id,partnerId].sort().join("-")}`:String(x.dateGroup).replace(/-(home:)?[^-:]+(?::[^-]+)*$/,"");
  };
  return entries.map(x=>{
    if(x.dateGroup){
      const groupKey=canonicalDateGroup(x);
      if(seen.has(groupKey))return"";seen.add(groupKey);
      const steps=entries.filter(step=>canonicalDateGroup(step)===groupKey).sort((a,b)=>a.minute-b.minute);
      const partner=state.characters[x.withId],title=partner?`${togetherText(partner.name)} 데이트`:`데이트 일정`;
      return `<li class="date-schedule" style="--log-theme:${esc(c.theme?.primary||"#176b60")}"><div class="date-schedule-title"><b>${esc(title)}</b><small>${esc(steps[0].time)}–${esc(steps.at(-1).time)}</small></div><ol>${steps.map(step=>`<li><time>${esc(step.time)}</time><span><b>${esc(step.title.replace(/^데이트 · /,""))}</b><small>${esc(step.desc)}</small></span></li>`).join("")}</ol></li>`;
    }
    return `<li class="${importantEntry(x)?"important":""} ${x===entries.at(-1)?"now":""}" style="--log-theme:${esc(c.theme?.primary||"#176b60")}"><time>${esc(x.time)}</time><span><b>${esc(x.title)}</b><small>${esc(x.desc)}</small></span></li>`;
  }).join("");
}
function dailyLog(c){
  const logs=visibleTimeline(c),current=eventFor(c);
  const cleanLogs=logs.filter(loggableEntry),entries=loggableEntry(current)&&!cleanLogs.some(x=>x.title===current.title&&x.minute===current.minute)?[...cleanLogs,current]:cleanLogs;
  return `<section class="panel life-log shared-life-log"><div class="title"><h2>오늘의 생활 로그</h2><small>${esc(c.name)} · 관찰과 집에서 같은 기록을 보여줘요</small></div><ol>${dailyLogItems(entries,c)}</ol></section>`;
}
function homeDailyLog(chars,h){
  const now=new Date(),nowMinute=now.getHours()*60+now.getMinutes(),time=minute=>`${String(Math.floor(minute/60)).padStart(2,"0")}:${String(minute%60).padStart(2,"0")}`;
  const entries=chars.flatMap(c=>{
    const visible=visibleTimeline(c).filter(loggableEntry),current=eventFor(c),sequence=loggableEntry(current)&&!visible.some(x=>x.title===current.title&&x.minute===current.minute)?[...visible,current]:visible;
    const own=[];
    sequence.forEach((x,index)=>{
      const previous=sequence[index-1];
      const atThisHome=x.home&&(x.visitHomeId||c.homeId)===h.id;
      const previousAtThisHome=previous?.home&&(previous.visitHomeId||c.homeId)===h.id;
      if(atThisHome)own.push({...x,character:c});
      const returningHome=x.returningHome||(x.transit&&x.townId===c.townId&&/돌아가|돌아오/.test(x.title||""));
      if(!x.home&&previousAtThisHome&&!returningHome)own.push({minute:Math.max(previous.minute+1,x.minute-8),time:time(Math.max(previous.minute+1,x.minute-8)),title:"외출",desc:`${x.title} 일정을 위해 집을 나섰어요. 문을 잠그고 필요한 소지품을 확인했어요.`,room:"entry",character:c,important:true});
      if(atThisHome&&previous&&!previous.home)own.push({minute:Math.max(previous.minute+1,x.minute-5),time:time(Math.max(previous.minute+1,x.minute-5)),title:"귀가",desc:"바깥 일정을 마치고 돌아와 신발과 겉옷을 정리하며 집 안으로 들어왔어요.",room:"entry",character:c,important:true});
    });
    return own;
  });
  const daySeed=Number(`${now.getFullYear()}${now.getMonth()+1}${now.getDate()}`),residents=chars.length?chars:[state.characters[state.activeId]].filter(Boolean),pets=h.pets||[];
  const characterAtHomeAt=(character,minute)=>{
    const latest=visibleTimeline(character).filter(item=>item.minute<=minute).at(-1);
    return Boolean(latest?.home&&(latest.visitHomeId||character.homeId)===h.id);
  };
  const cleaningMinute=20*60+5,cleaningCandidates=residents.filter(character=>characterAtHomeAt(character,cleaningMinute));
  const houseEvents=[
    {minute:9*60+12,title:"우편물이 도착함",desc:"현관 우편함에 오늘 도착한 우편물이 들어왔어요. 집에 먼저 들어오는 사람이 확인할 수 있게 기다리고 있어요.",room:"entry",houseIcon:"✉️"},
    {minute:14*60+26,title:"택배가 도착함",desc:"현관 앞에 택배 상자가 놓였어요. 배송 알림도 함께 도착했어요.",room:"entry",houseIcon:"📦"}
  ];
  if(cleaningCandidates.length)houseEvents.push({minute:cleaningMinute,title:"집 안을 청소하는 중",desc:"집에 머무는 동안 눈에 띄는 먼지와 흩어진 물건을 정리하고 자주 쓰는 공간을 가볍게 닦고 있어요.",room:"living",character:cleaningCandidates[daySeed%cleaningCandidates.length]});
  if(pets.length){
    const pet=pets[daySeed%pets.length],petMinute=11*60+38+(daySeed%4)*17;
    houseEvents.push({minute:petMinute,title:`${pet.name}의 작은 사고`,desc:`${pet.name}이 놀다가 쿠션과 장난감을 바닥에 흩어 놓고 아무 일도 없었다는 듯 주변을 살피고 있어요.`,room:pet.room||"living",pet});
  }
  entries.push(...houseEvents.filter(x=>x.minute<=nowMinute).map(x=>({...x,time:time(x.minute)})));
  entries.sort((a,b)=>a.minute-b.minute);
  // 공동 장면은 상대의 타임라인에도 동시에 기록됩니다. 렌더링할 때 같은
  // 인물·시각·제목·본문을 한 번만 남겨 관찰 탭을 다시 눌러도 불어나지 않게 합니다.
  const deduped=[],seenEntries=new Set();
  entries.forEach(item=>{
    const key=[item.character?.id||item.pet?.id||"house",item.minute,item.title,item.desc].join("|");
    if(seenEntries.has(key))return;
    seenEntries.add(key);
    deduped.push(item);
  });
  entries.splice(0,entries.length,...deduped);
  const face=x=>x.character?avatar(x.character,"log-face"):x.pet?(x.pet.icon||x.pet.photo?`<img class="avatar log-face" src="${esc(x.pet.icon||x.pet.photo)}" alt="">`:`<span class="avatar log-face">🐾</span>`):`<span class="avatar log-face house-event-icon">${x.houseIcon||"🏠"}</span>`;
  const owner=x=>x.character?`${x.character.name} · `:x.pet?`${x.pet.name} · `:"";
  return `<section class="panel life-log home-family-log"><div class="title"><h2>집 생활 로그</h2><small>구성원의 외출·귀가와 함께 사는 존재·청소·배송 등 집 전체의 기록</small></div><ol>${entries.map(x=>`<li class="${importantEntry(x)||x.important?"important":""}" style="--log-theme:${esc(x.character?.theme?.primary||"#176b60")}"><time>${esc(x.time)}</time><span class="log-person">${face(x)}<span><b>${esc(owner(x))}${esc(x.title)}</b><small>${esc(h.rooms?.[x.room]?.name||"집 안")} · ${esc(x.desc)}</small></span></span></li>`).join("")||"<li>아직 집 기록이 없어요.</li>"}</ol></section>`;
}
function peopleAtPlaceCard(p){
  const group=charactersAtPlace(p.id,state.activeTownId);if(!group.length)return"";
  const visible=group.slice(0,5),hiddenCount=Math.max(0,group.length-visible.length);
  const names=group.map(c=>c.name).join(", ");
  const x=Math.max(9,Math.min(91,p.x)),y=Math.max(15,Math.min(88,p.y+9));
  return `<div class="person place-people ${state.mapCharacterLabelMode==="name"?"show-name":"icon-only"}" title="${esc(names)}" style="left:${x}%;top:${y}%;--people-count:${visible.length}"><span class="place-people-faces">${visible.map(c=>`<button type="button" class="place-person-face" data-person="${c.id}" title="${esc(c.name)}">${avatar(c)}</button>`).join("")}${hiddenCount?`<b class="place-person-more" aria-label="그 외 ${hiddenCount}명">+${hiddenCount}</b>`:""}</span>${state.mapCharacterLabelMode==="name"?`<span class="place-people-names">${esc(names)}</span>`:""}</div>`;
}
function observe(){
  const localIds=state.order.filter(id=>visibleTownId(state.characters[id])===state.activeTownId);
  const localId=localIds.includes(state.activeId)?state.activeId:localIds[0];
  const townSwitcher=state.towns.length>1?`<div class="observe-town-switcher"><b>관찰할 마을</b>${state.towns.map(t=>`<button data-observe-town="${t.id}" class="${t.id===state.activeTownId?"on":""}">🏙️ ${esc(t.name)}</button>`).join("")}</div>`:"";
  if(!localId)return `${roster()}${townSwitcher}<div class="observe"><section><div class="viewport"><div class="world"><img src="${state.world.bg}" class="world-bg">${state.world.places.map(placeCard).join("")}</div></div></section><aside class="panel empty"><h2>이 마을에 사는 캐릭터가 없어요</h2><p>캐릭터 프로필에서 생활하는 마을을 지정할 수 있어요.</p></aside></div>`;
  const c=state.characters[localId],e=eventFor(c),place=placeForEntry(e);
  const everyoneSleeping=state.order.length>0&&state.order.every(id=>eventFor(state.characters[id]).title==="자는 중");
  const sleepGate=everyoneSleeping?`<div class="sleep-gate"><span>🌙</span><div><h2>모든 인물이 자고 있습니다</h2><p>마을은 조용해졌어요. 집에서 인물들의 수면 상태를 볼 수 있어요.</p></div><button class="primary" data-all-sleep-home>집 보기</button></div>`:"";
  const currentImage=sceneImage(c,e);
  const location=e.home?`🏠 ${esc(state.homes[e.visitHomeId||c.homeId]?.name||"집")} · ${esc(state.homes[e.visitHomeId||c.homeId]?.rooms?.[e.room]?.name||"집 안")}`:e.transit?"🚌 이동 중":place?`📍 ${esc(place.name)} · ${esc(townForEntry(e).name)}`:"📍 외출 중";
  return `${roster()}${townSwitcher}<div class="observe"><section><div class="world-hud"><div><small>현재 시각</small><b>${new Date().toLocaleString("ko-KR",{month:"long",day:"numeric",weekday:"short",hour:"2-digit",minute:"2-digit"})}</b></div><div><small>관찰 중</small><b>${esc(c.name)} · ${esc(e.title)}</b></div></div><div class="viewport">${sleepGate}<div class="world"><img src="${state.world.bg}" class="world-bg">${state.world.places.map(placeCard).join("")}${state.world.places.map(peopleAtPlaceCard).join("")}</div></div></section><aside class="detail-column"><div class="detail panel"><div class="hero">${c.photo?`<img src="${c.photo}" alt="">`:avatar(c)}</div><h2>${esc(c.name)}</h2><p>${esc(c.jobTitle||c.job)}</p><div class="scene"><small>CURRENT SCENE</small><h3>${esc(e.title)}</h3><p>${esc(e.desc)}</p><b>${location}</b>${currentImage?`<img class="place-photo" src="${esc(currentImage)}" alt="">`:""}</div></div>${dailyLog(c)}</aside></div>`;
}
function roomStyle(h,key){
  const image=h.rooms?.[key]?.image;
  return image?`style="background-image:linear-gradient(#ffffff30,#ffffff30),url('${image}')"`:"";
}
function home(){
  const groups=homeGroups(),ids=Object.keys(state.homes||{}),selected=state.homes[state.activeHomeId]?state.activeHomeId:(state.homes[active()?.homeId]?active().homeId:ids[0]);
  state.activeHomeId=selected;
  const houseGradient=chars=>{
    if(!chars?.length)return "linear-gradient(135deg,#6e7889,#aab2bf)";
    const colors=[...new Set(chars.map(c=>c.theme?.primary||"#176b60"))];
    if(colors.length===1){
      const c=chars[0],second=c.theme?.gradient?(c.theme.secondary||colors[0]):colors[0];
      return `linear-gradient(135deg,${colors[0]},${second})`;
    }
    return `linear-gradient(135deg,${colors.join(",")})`;
  };
  return `<section class="home-page"><div class="title"><div><h1>집과 생활 거점</h1><p>캐릭터 없이 집만 만들거나, 한 캐릭터에게 주거지·본가·별채·주말집을 여러 곳 연결할 수 있어요.</p></div><div class="home-top-actions"><button data-add-home>+ 집만 생성</button>${selected?`<button data-home-edit>${state.homeEditMode?"편집 완료":"집 편집"}</button>`:""}</div></div>${ids.length?`<div class="home-tabs">${ids.map(id=>{const h=state.homes[id]||{},members=groups[id]||[];return `<button data-home-select="${id}" class="${id===selected?"on":""}" style="--home-grad:${houseGradient(members)};${h.image?`--home-photo:url('${esc(h.image)}')`:""}">🏠 ${esc(h.name||"이름 없는 집")}<small>${esc(h.kind||"일반 주거")} · ${members.length?`${members.length}명 연결`:"빈집"}</small></button>`}).join("")}</div>`:"<section class='panel empty-mini'><b>아직 만든 집이 없어요.</b><p>‘집만 생성’을 눌러 캐릭터와 별개로 집부터 만들 수 있어요.</p></section>"}<div class="home-grid">${selected?homeCard(selected,groups[selected]||[]):""}</div></section>`;
}
function homeCard(id,chars){
  const h=state.homes[id]||{id,name:"이름 없는 집",rooms:{}};
  const currentScenes=new Map(state.order.map(characterId=>state.characters[characterId]).filter(Boolean).map(c=>[c.id,eventFor(c)]));
  const sceneFor=c=>currentScenes.get(c.id);
  const inside=state.order.map(characterId=>state.characters[characterId]).filter(c=>c&&sceneFor(c)?.home&&(sceneFor(c).visitHomeId||c.homeId)===id);
  const edit=state.homeEditMode;
  const roomKeys=Object.keys(h.rooms||{});
  const pets=h.pets||[];
  const petEmoji={강아지:"🐶",고양이:"🐱",새:"🐦",거북이:"🐢",호랑이:"🐯",인공지능:"🤖",식물:"🪴",드래곤:"🐉",기타:"✨"};
  const petSpeciesName=pet=>pet.species==="기타"?(pet.customSpecies?.trim()||"이름 없는 생명체"):pet.species;
  const petScene=pet=>{
    const now=new Date(),hour=now.getHours(),slot=Math.floor((hour*60+now.getMinutes())/90);
    const activeHours={강아지:hour>=6&&hour<22,고양이:hour>=18||hour<8,새:hour>=6&&hour<18,거북이:hour>=8&&hour<18,호랑이:hour>=17||hour<9,인공지능:true,식물:true,드래곤:hour>=5&&hour<23,기타:hour>=8&&hour<20};
    if(!activeHours[pet.species]){
      const sleepRoomKey=h.rooms?.[pet.room]?pet.room:(h.rooms?.bedroom?"bedroom":roomKeys[0]);
      const sleepRoom=h.rooms?.[sleepRoomKey]?.name||"집 안";
      const sleepText={
        강아지:"익숙한 담요 위에 몸을 둥글게 말고 가끔 귀를 움직이며 잠들어 있어요.",
        고양이:"따뜻하고 높은 자리에 앞발을 접어 넣은 채 느긋하게 잠들어 있어요.",
        새:"한쪽 다리를 깃털 속에 넣고 횃대에 앉아 조용히 쉬고 있어요.",
        거북이:"은신처 안에 몸을 넣고 움직임을 줄인 채 오래 쉬고 있어요.",
        호랑이:"넓은 자리에 옆으로 몸을 누이고 꼬리 끝만 가끔 움직이며 쉬고 있어요.",
        인공지능:"충전 위치에 연결되어 저전력 대기 모드로 전환됐어요.",
        식물:"잎과 줄기를 고요히 늘어뜨린 채 밤의 휴식 시간을 보내고 있어요.",
        드래곤:"날개를 몸 가까이 접고 꼬리로 몸을 감싼 채 깊이 잠들어 있어요.",
        기타:"자기에게 가장 편안한 자리를 골라 조용히 쉬고 있어요."
      };
      return {roomKey:sleepRoomKey,title:`${sleepRoom}에서 자는 중`,desc:sleepText[pet.species]||sleepText.기타};
    }
    const walkers=inside.filter(c=>sceneFor(c)?.home&&!sceneFor(c)?.transit);
    const walkSeed=[...(pet.id+now.toDateString())].reduce((sum,ch)=>sum+ch.charCodeAt(0),0);
    const walkStart=450+(walkSeed%3)*300,currentMinute=hour*60+now.getMinutes();
    if(pet.needsWalk&&walkers.length&&currentMinute>=walkStart&&currentMinute<walkStart+45){
      const count=Math.min(walkers.length,1+(walkSeed%3));
      const names=walkers.slice(0,count).map(c=>c.name).join(" · ");
      if(pet.rideable&&["드래곤","호랑이"].includes(pet.species)){
        const movement=pet.species==="드래곤"?"등에 올라 마을 위를 천천히 날며":"등에 올라 안전한 산책길을 천천히 달리며";
        return {roomKey:null,outside:true,title:`${names}와 외출 중`,desc:`${names}가 ${pet.name}의 ${movement} 바람을 쐬고 있어요.`};
      }
      return {roomKey:null,outside:true,title:`${names}와 산책 중`,desc:`${names}가 ${pet.name}의 걸음에 맞춰 집 근처 산책길을 함께 걷고 있어요.`};
    }
    const preferred={
      강아지:["living","entry","study","bedroom"],고양이:["living","study","bedroom","kitchen"],
      새:["living","study","bedroom"],거북이:["living","study","bedroom"],
      호랑이:["living","study","entry"],인공지능:roomKeys,식물:["living","study","kitchen"],드래곤:["living","study","bedroom","entry"],기타:roomKeys
    };
    const candidates=(preferred[pet.species]||roomKeys).filter(key=>h.rooms?.[key]);
    const seed=[...(pet.id+now.toDateString())].reduce((sum,ch)=>sum+ch.charCodeAt(0),0);
    const roomKey=candidates.length?candidates[(seed+slot)%candidates.length]:(pet.room||roomKeys[0]);
    const room=h.rooms?.[roomKey]?.name||"집 안";
    const sameRoom=inside.filter(c=>{const scene=sceneFor(c);return scene?.room===roomKey&&scene.title!=="자는 중"});
    const resident=sameRoom.length?sameRoom[(seed+slot)%sameRoom.length]:null;
    const solo={
      강아지:["공을 앞발로 굴렸다가 입에 물고 방 안을 신나게 오가고 있어요.","노즈워크 장난감 사이에 숨은 간식 냄새를 따라 코를 바쁘게 움직이고 있어요.","현관 쪽에서 들리는 소리에 귀를 세웠다가 안전한지 확인하고 돌아왔어요.","푹신한 방석을 앞발로 몇 번 고른 뒤 가장 편한 자세로 엎드렸어요.","창밖을 구경하다 지나가는 움직임을 발견하고 꼬리를 흔들고 있어요.","아끼는 장난감을 자기 자리로 하나씩 옮겨 모으고 있어요.","물을 마신 뒤 입가의 물방울을 털고 바닥 냄새를 다시 확인하고 있어요.","갑자기 신이 나 짧게 방을 한 바퀴 달린 뒤 숨을 고르고 있어요."],
      고양이:["캣타워 꼭대기에 올라 아래를 내려다보며 꼬리 끝을 천천히 흔들고 있어요.","햇빛이 드는 바닥에 길게 누워 배를 데우며 느긋하게 쉬고 있어요.","작은 소리가 난 가구 밑을 들여다보고 앞발을 조심스럽게 넣어 보고 있어요.","장난감을 낮게 노려보다 갑자기 달려들어 앞발로 붙잡았어요.","창가에 앉아 바깥의 새와 움직이는 그림자를 한참 관찰하고 있어요.","종이 상자 안에 몸을 구겨 넣고 자기 몸에 딱 맞는지 확인하고 있어요.","털을 꼼꼼하게 핥아 정리하다가 아무렇지 않게 다른 자리로 옮겼어요.","방 안을 빠르게 뛰어다니다 높은 곳에 올라 태연한 얼굴로 앉아 있어요."],
      새:["횃대 사이를 가볍게 옮겨 다니며 익숙한 소리를 흉내 내고 있어요.","거울에 비친 모습을 살피며 고개를 좌우로 갸웃거리고 있어요.","부리로 장난감의 매듭을 하나씩 풀어 보며 집중하고 있어요.","깃털을 부풀렸다가 부리로 가지런히 다듬고 있어요.","창밖에서 들리는 새소리에 짧게 대답하듯 지저귀고 있어요.","먹이통에서 좋아하는 알갱이만 골라 천천히 먹고 있어요.","물그릇에서 가볍게 목욕한 뒤 날개를 퍼덕여 물기를 털고 있어요.","방 안의 소리가 달라질 때마다 고개를 돌려 어디서 나는지 찾고 있어요."],
      거북이:["따뜻한 조명이 비치는 자리까지 천천히 걸어가 몸을 데우고 있어요.","은신처 밖으로 고개를 내밀고 한동안 주변이 안전한지 확인하고 있어요.","낮은 장애물 주변을 빙 돌아 새로운 길을 천천히 탐색하고 있어요.","먹이 냄새를 따라 목을 길게 내밀고 접시 쪽으로 움직이고 있어요.","평평한 돌 위에 올라 앞다리를 뻗은 채 편안하게 쉬고 있어요.","물가와 마른 자리를 천천히 오가며 마음에 드는 위치를 고르고 있어요.","낯선 물건 앞에 멈춰 오래 바라보다 아주 조심스럽게 다가가고 있어요.","한참 움직인 뒤 익숙한 구석으로 돌아가 가만히 몸을 낮추고 있어요."],
      호랑이:["튼튼한 장난감을 앞발로 눌러 방향을 바꾸며 힘을 조절해 놀고 있어요.","넓은 공간의 가장자리를 천천히 돌며 냄새와 소리를 확인하고 있어요.","높은 자리에 올라 주변을 내려다보며 귀를 움직이고 있어요.","길게 기지개를 켠 뒤 발톱을 세우지 않고 장난감을 툭 건드렸어요.","낯선 냄새가 나는 곳에 코를 가까이 대고 한동안 흔적을 살피고 있어요.","몸을 낮춘 채 장난감을 노리다가 짧고 빠르게 앞으로 뛰어들었어요.","시원한 바닥에 몸을 길게 뻗고 꼬리로 바닥을 천천히 두드리고 있어요.","물을 마신 뒤 수염에 묻은 물방울을 털며 주위를 둘러보고 있어요."],
      인공지능:["방 안의 온도와 습도를 측정하고 쾌적한 범위인지 확인하고 있어요.","바닥의 작은 장애물을 감지해 부딪히지 않도록 경로를 다시 계산했어요.","충전량과 오늘의 작동 기록을 확인하며 다음 점검 시간을 정리하고 있어요.","켜진 채 남아 있는 기기가 없는지 방 안을 천천히 순찰하고 있어요.","택배와 우편 알림을 확인해 거주자가 보기 쉬운 순서로 정리하고 있어요.","반려동물이 위험한 물건에 가까이 가지 않는지 센서로 살피고 있어요.","조명 밝기를 현재 시각에 맞게 조절하고 사용 기록을 저장하고 있어요.","새로운 생활 패턴을 발견하고 다음 지원에 활용하려고 학습하고 있어요."],
      식물:["햇빛이 닿는 방향으로 새잎을 천천히 기울이고 있어요.","흙에 남은 수분을 머금고 잎 끝에 작은 물방울을 맺고 있어요.","창가에서 바람을 맞으며 잎을 작게 흔들고 있어요.","새로 난 잎이 펼쳐지며 조금씩 햇빛을 받아들이고 있어요.","마른 잎 하나를 떨어뜨리고 남은 잎에 힘을 모으고 있어요.","화분 가장자리로 뿌리를 뻗으며 조용히 자라고 있어요."],
      드래곤:["작은 날개를 퍼덕여 방 안의 따뜻한 공기를 휘젓고 있어요.","반짝이는 물건을 앞발로 끌어 자기 보금자리로 옮기고 있어요.","콧김과 함께 작은 불꽃을 뿜었다가 스스로 냄새를 확인하고 있어요.","꼬리 끝으로 장난감을 툭툭 건드리며 반응을 살피고 있어요.","높은 가구 위에 올라 자기 영역을 내려다보고 있어요.","따뜻한 쿠션을 둥지처럼 모아 가운데에 몸을 말고 있어요."],
      기타:["좋아하는 물건 가까이에서 자기 방식대로 시간을 보내고 있어요.","익숙한 자리를 천천히 둘러보며 달라진 것이 없는지 확인하고 있어요.","편안한 장소를 찾아 쉬면서 주변의 움직임을 살피고 있어요.","먹이와 물이 있는 곳을 확인한 뒤 자기 자리로 돌아가고 있어요."]
    };
    const together={
      강아지:[`${subjectText(resident?.name)} 던진 장난감을 쫓아가 다시 발앞에 내려놓고 기대하는 눈으로 바라보고 있어요.`,`${resident?.name}의 뒤를 졸졸 따라다니다가 멈출 때마다 옆에 나란히 앉고 있어요.`,`${subjectText(resident?.name)} 바닥에 숨긴 간식을 냄새로 찾아내며 함께 노즈워크를 하고 있어요.`,`${resident?.name}의 무릎에 턱을 얹고 손길을 기다리며 꼬리를 천천히 흔들고 있어요.`],
      고양이:[`${subjectText(resident?.name)} 흔드는 장난감의 끝을 낮게 노리다가 정확한 순간에 앞발로 낚아채고 있어요.`,`${subjectText(resident?.name)} 앉은 자리 가까이에 몸을 둥글게 말고 같은 공간에 조용히 머물고 있어요.`,`${subjectText(resident?.name)} 정리하려는 상자에 먼저 들어가 자리를 차지하고 나오지 않고 있어요.`,`${resident?.name}의 손 냄새를 확인한 뒤 머리를 가볍게 비비고 자기 자리로 돌아갔어요.`],
      새:[`${resident?.name}의 말소리를 짧게 따라 하며 대답하듯 재잘거리고 있어요.`,`${subjectText(resident?.name)} 건네는 작은 간식을 부리로 조심스럽게 받아 먹고 있어요.`,`${resident?.name}의 어깨 가까운 횃대에서 머리카락 움직임을 신기하게 바라보고 있어요.`,`${subjectText(resident?.name)} 장난감 위치를 바꾸자 고개를 갸웃거리며 바로 확인하러 갔어요.`],
      거북이:[`${subjectText(resident?.name)} 놓아 준 먹이 쪽으로 목을 길게 내밀고 천천히 다가가고 있어요.`,`${subjectText(resident?.name)} 지켜보는 앞에서 익숙한 길을 따라 느긋하게 방 안을 탐색하고 있어요.`,`${subjectText(resident?.name)} 조명을 조절해 주자 따뜻해진 자리에 올라 편안하게 몸을 펴고 있어요.`,`${resident?.name}의 손이 가까워지자 잠깐 멈췄다가 안전하다고 느끼고 다시 움직였어요.`],
      호랑이:[`${togetherText(resident?.name)} 충분한 거리를 둔 채 튼튼한 장난감의 움직임을 따라 시선을 옮기고 있어요.`,`${subjectText(resident?.name)} 준비한 넓은 놀이 공간을 천천히 돌며 냄새를 확인하고 있어요.`,`${resident?.name}의 익숙한 목소리를 듣고 귀를 돌린 뒤 편안한 자세를 유지하고 있어요.`,`${subjectText(resident?.name)} 안전하게 놓아 준 장난감을 앞발로 눌러 보며 반응을 살피고 있어요.`],
      인공지능:[`${resident?.name}의 오늘 일정과 날씨를 확인해 필요한 준비물을 짧게 알려 주고 있어요.`,`${subjectText(resident?.name)} 찾는 물건의 마지막 확인 위치를 기록에서 찾아 안내하고 있어요.`,`${resident?.name}의 방해가 되지 않도록 조명을 낮추고 알림을 조용한 방식으로 전환했어요.`,`${resident?.name}에게 필요한 것이 없는지 확인한 뒤 가까운 곳에서 대기하고 있어요.`],
      식물:[`${subjectText(resident?.name)} 화분을 돌려 주자 잎이 햇빛을 고르게 받는 방향으로 놓였어요.`,`${subjectText(resident?.name)} 흙의 상태를 살피는 동안 잎 끝의 작은 물방울이 빛나고 있어요.`,`${subjectText(resident?.name)} 마른 잎을 떼어 주자 새순이 더 잘 보이게 됐어요.`],
      드래곤:[`${resident?.name}의 뒤를 따라다니며 발끝 가까이 꼬리를 살랑거리고 있어요.`,`${subjectText(resident?.name)} 건넨 간식을 앞발로 붙잡고 작은 불씨로 살짝 데워 먹고 있어요.`,`${resident?.name}의 무릎 가까이에 몸을 말고 목을 울리며 편안해하고 있어요.`],
      기타:[`${resident?.name} 가까이에서 익숙한 방식으로 시간을 보내고 있어요.`,`${resident?.name}의 움직임을 살피며 편안한 거리를 유지하고 있어요.`,`${resident?.name}가 이름을 부르자 하던 일을 멈추고 잠시 반응을 보여 줬어요.`]
    };
    let choices=resident?(together[pet.species]||together.기타):(solo[pet.species]||solo.기타);
    if(pet.species==="기타"){
      const temperamentScripts={
        "사고뭉치":["가벼운 물건을 엉뚱한 자리로 옮겨 놓고 모르는 척 주변을 살피고 있어요.","방금 정리한 물건 사이를 헤집어 작은 소동을 만들고 있어요."],
        "진중함":["한 자리에 머물며 주변에서 일어나는 일을 차분히 관찰하고 있어요.","낯선 소리가 사라질 때까지 움직이지 않고 조용히 상황을 살피고 있어요."],
        "활발함":["익숙한 지점 사이를 바쁘게 오가며 남은 에너지를 풀고 있어요.","방 안을 크게 한 바퀴 돈 뒤 다시 출발할 곳을 찾고 있어요."],
        "호기심 많음":["처음 보는 물건 가까이에서 안전한 거리를 두고 오래 살펴보고 있어요.","새로 달라진 냄새와 소리의 근원을 차례로 확인하고 있어요."],
        "겁이 많음":["익숙한 자리에서 낯선 움직임이 지나가기를 기다리고 있어요.","믿는 사람 가까이에 머물며 조심스럽게 주변을 살피고 있어요."],
        "사람을 잘 따름":[`${resident?.name||"가족"} 가까이로 다가가 곁에 머물며 관심을 기다리고 있어요.`,`${resident?.name||"가족"}가 움직일 때마다 너무 멀어지지 않게 뒤를 따라가고 있어요.`],
        "독립적":["가족과 같은 공간에 있으면서도 자기만의 일에 집중하고 있어요.","방해받지 않는 자리를 골라 혼자만의 시간을 보내고 있어요."]
      };
      const bodyScripts={
        "털":"몸의 털을 차분히 정돈한 뒤 다시 편한 자세를 잡았어요.",
        "비늘":"따뜻한 자리에 머물자 비늘 표면에 빛이 은은하게 비치고 있어요.",
        "깃털":"흐트러진 깃털을 차례로 정돈하며 편안한 자세를 잡고 있어요.",
        "날개":"주변에 부딪힐 것이 없는지 확인한 뒤 날개를 가볍게 펼쳤다가 접었어요.",
        "지느러미":"자기에게 맞게 마련된 공간을 천천히 오가며 지느러미를 움직이고 있어요.",
        "뿔":"뿔이 가구에 닿지 않도록 고개를 조심스럽게 돌리며 이동하고 있어요.",
        "꼬리":"기분에 따라 꼬리를 천천히 움직이며 주변을 살피고 있어요.",
        "발광":"주변 밝기에 반응하듯 몸의 빛이 서서히 밝아졌다가 잦아들고 있어요.",
        "독성":"가족들이 표시해 둔 안전 구역 안에서 조심스럽게 움직이고 있어요."
      };
      const sizeScripts={
        소형:"작은 공간도 능숙하게 지나며 마음에 드는 자리를 찾고 있어요.",
        중형:"방 안을 여유 있게 오가며 익숙한 동선을 확인하고 있어요.",
        대형:"넓게 비워 둔 동선을 따라 천천히 움직이며 자리를 잡고 있어요."
      };
      choices=[...choices,...(pet.temperaments||[]).flatMap(x=>temperamentScripts[x]||[]),...(pet.bodyTraits||[]).map(x=>bodyScripts[x]).filter(Boolean),...(sizeScripts[pet.size]?[sizeScripts[pet.size]]:[])];
    }
    const desc=choices[(seed+slot)%choices.length];
    const titleMap={강아지:"활기차게 노는 중",고양이:"자기 방식대로 노는 중",새:"횃대에서 활동하는 중",거북이:"천천히 탐색하는 중",호랑이:"영역을 살피는 중",인공지능:"집 안을 지원하는 중",식물:"조용히 자라는 중",드래곤:"둥지를 오가며 노는 중",기타:"시간을 보내는 중"};
    return {roomKey,title:`${room}에서 ${titleMap[pet.species]||titleMap.기타}`,desc};
  };
  const petScenes=Object.fromEntries(pets.map(p=>[p.id,petScene(p)]));
  const roomHtml=roomKeys.map(key=>{
    const room=h.rooms?.[key]||{},roomPeople=inside.filter(c=>sceneFor(c)?.room===key);
    const roomPets=pets.filter(p=>petScenes[p.id]?.roomKey===key);
    const shownPeople=roomPeople,shownPets=roomPets;
    const furniture=FURNITURE[room.type||key]||FURNITURE.other;
    return `<div class="room ${roomClasses[key]||"custom-room"} room-edit-target" ${roomStyle(h,key)} data-open-room-editor="${key}" data-home-id="${id}" tabindex="0" role="button" aria-label="${esc(room.name||key)} 편집">
      <b>${esc(room.name||key)}</b>
      ${!room.image?`<button type="button" class="room-empty-image" data-open-room-editor="${key}" data-home-id="${id}"><span>＋</span>사진 추가하기</button>`:""}
      <button type="button" class="room-edit-hint" data-open-room-editor="${key}" data-home-id="${id}">방 편집하기</button>
      <div class="room-people">${shownPeople.map(c=>{const e=sceneFor(c);return `<button class="home-person" data-home-person="${c.id}">${avatar(c)}<span><b>${esc(c.name)}</b><small>${esc(e?.title||"집에서 시간을 보내는 중")}</small></span></button>`}).join("")}</div>
      <div class="room-pets">${shownPets.map(p=>`<button class="room-pet" title="${esc(petScenes[p.id].desc)}">${p.icon?`<img class="room-pet-icon" src="${esc(p.icon)}" alt="">`:p.photo?`<img class="room-pet-photo" src="${esc(p.photo)}" alt="">`:`<span class="room-pet-emoji">${petEmoji[p.species]||"🐾"}</span>`}<span class="room-pet-status"><b>${esc(p.name)}</b><small>${esc(petScenes[p.id].title.replace(`${h.rooms?.[key]?.name||"집 안"}에서 `,""))}</small></span></button>`).join("")}</div>
    </div>`;
  }).join("");
  const dayLabels=["일","월","화","수","목","금","토"];
  const residentEditor=edit?`<section class="resident-editor"><div class="title"><div><h3>이 집을 사용하는 캐릭터</h3><small>연결을 해제해도 캐릭터나 집은 삭제되지 않습니다. 별채·본가도 주거지와 동시에 둘 수 있어요.</small></div></div><div>${state.order.map(cid=>{
    const c=state.characters[cid],residence=(c.residences||[]).find(item=>item.homeId===id),on=Boolean(residence);
    return `<article class="resident-setting ${on?"on":""}"><button data-home-resident="${cid}" data-home-id="${id}" class="${on?"on":""}">${avatar(c)}<span><b>${esc(c.name)}</b><small>${on?"이 집 연결됨":"연결하지 않음"}</small></span></button>${on?`<div class="residence-fields"><label>이 캐릭터에게 어떤 집인가요?<select data-residence-field="role" data-character-id="${cid}" data-home-id="${id}">${["주거지","본가","별채","주말집","업무용 숙소","연인의 집","친척집","기타"].map(value=>`<option ${value===residence.role?"selected":""}>${value}</option>`).join("")}</select></label><label>머무는 때<select data-residence-field="stayPattern" data-character-id="${cid}" data-home-id="${id}">${["상시 거주","평일 중심","주말 중심","요일 지정","명절·기념일","필요할 때 방문"].map(value=>`<option ${value===residence.stayPattern?"selected":""}>${value}</option>`).join("")}</select></label><label>자는 방<select data-residence-field="sleepRoomId" data-character-id="${cid}" data-home-id="${id}">${roomKeys.map(key=>`<option value="${key}" ${key===residence.sleepRoomId?"selected":""}>${esc(h.rooms[key]?.name||key)}</option>`).join("")}</select></label><label>방문 목적·설명<input data-residence-field="notes" data-character-id="${cid}" data-home-id="${id}" maxlength="200" value="${esc(residence.notes||"")}" placeholder="예: 명절에 가족과 머무는 본가"></label><label>명절·기념일 날짜<input data-residence-field="visitDates" data-character-id="${cid}" data-home-id="${id}" inputmode="numeric" value="${esc(String(residence.visitDates||"").replace(/(\d{2})-(\d{2})/g,"$1$2"))}" placeholder="예: 0101, 0815"></label><fieldset><legend>방문 요일</legend><div class="residence-days">${dayLabels.map((label,day)=>`<button type="button" data-residence-day="${day}" data-character-id="${cid}" data-home-id="${id}" class="${(residence.visitDays||[]).includes(day)?"on":""}">${label}</button>`).join("")}</div></fieldset><button type="button" data-residence-primary="${cid}" data-home-id="${id}" class="${residence.isPrimary?"on":""}">${residence.isPrimary?"✓ 기준 주거지":"기준 주거지로 지정"}</button></div>`:""}</article>`;
  }).join("")}</div><small>‘명절·기념일’은 위 날짜가 맞는 날, ‘요일 지정’은 고른 요일에 이 집의 장면을 사용해요. ‘필요할 때 방문’은 임의 이동을 만들지 않습니다.</small></section>`:"";
  const sleepEditor=edit?`<section class="sleep-room-editor"><div class="title"><h3>방 구성</h3><button data-add-room>+ 방 추가</button></div><small>자는 방은 위의 캐릭터별 집 연결 설정에서 각각 정해요.</small></section>`:"";
  const status=chars.map(c=>{const e=eventFor(c);return `<button class="home-status" data-home-person="${c.id}" style="--own:${c.theme.primary}">${avatar(c)}<span><b>${esc(c.name)}</b><small>${esc(e.title)}</small><em>${esc(e.desc||"")}</em></span></button>`}).join("");
  const petKinds=["강아지","고양이","새","거북이","호랑이","식물","드래곤","인공지능","기타"];
  const petCards=pets.map(p=>`<article class="pet-card">
    <div class="pet-avatar">${p.icon||p.photo?`<img src="${esc(p.icon||p.photo)}" alt="">`:`<span>${petEmoji[p.species]||"🐾"}</span>`}</div>
    <div class="pet-info"><b>${esc(p.name)}</b><small>${esc(petSpeciesName(p))}${p.breed?` · ${esc(p.breed)}`:""}</small><strong>${esc(petScenes[p.id].title)}</strong><p>${esc(petScenes[p.id].desc)}</p></div>
    ${edit?`<div class="pet-edit"><label>이름<input data-pet-field="name" data-home-id="${id}" data-pet-id="${p.id}" value="${esc(p.name)}"></label><label>종류<select data-pet-field="species" data-home-id="${id}" data-pet-id="${p.id}">${petKinds.map(x=>`<option ${x===p.species?"selected":""}>${x}</option>`).join("")}</select></label>${p.species==="기타"?`<label>종류 이름<input data-pet-field="customSpecies" data-home-id="${id}" data-pet-id="${p.id}" value="${esc(p.customSpecies||"")}" placeholder="예: 전기쥐, 슬라임, 작은 괴수"></label><label>크기<select data-pet-field="size" data-home-id="${id}" data-pet-id="${p.id}">${["소형","중형","대형"].map(x=>`<option ${x===(p.size||"중형")?"selected":""}>${x}</option>`).join("")}</select></label><fieldset><legend>성향 · 여러 개 선택</legend><div class="chips">${["온순함","활발함","사고뭉치","진중함","호기심 많음","겁이 많음","사람을 잘 따름","독립적"].map(x=>`<button type="button" data-pet-trait-field="temperaments" data-home-id="${id}" data-pet-id="${p.id}" data-value="${x}" class="${(p.temperaments||[]).includes(x)?"on":""}">${x}</button>`).join("")}</div></fieldset><fieldset><legend>확실히 알고 있는 신체 특징만 선택</legend><div class="chips">${["털","비늘","깃털","날개","지느러미","뿔","꼬리","발광","독성"].map(x=>`<button type="button" data-pet-trait-field="bodyTraits" data-home-id="${id}" data-pet-id="${p.id}" data-value="${x}" class="${(p.bodyTraits||[]).includes(x)?"on":""}">${x}</button>`).join("")}</div><small>선택하지 않은 생김새나 능력은 행동에서 지어내지 않아요.</small></fieldset>`:""}<label>품종<input data-pet-field="breed" data-home-id="${id}" data-pet-id="${p.id}" value="${esc(p.breed)}" placeholder="유저가 직접 입력"></label><label>주로 있는 방<select data-pet-field="room" data-home-id="${id}" data-pet-id="${p.id}">${roomKeys.map(key=>`<option value="${key}" ${key===(p.room||"living")?"selected":""}>${esc(h.rooms[key]?.name||key)}</option>`).join("")}</select></label><label>성별<select data-pet-field="sex" data-home-id="${id}" data-pet-id="${p.id}">${["모름","수컷","암컷"].map(x=>`<option ${x===p.sex?"selected":""}>${x}</option>`).join("")}</select></label><label class="check"><input type="checkbox" data-pet-field="neutered" data-home-id="${id}" data-pet-id="${p.id}" ${p.neutered?"checked":""}> 중성화 완료</label><label class="check"><input type="checkbox" data-pet-field="needsWalk" data-home-id="${id}" data-pet-id="${p.id}" ${p.needsWalk?"checked":""}> 함께 산책이 필요함</label><label class="check"><input type="checkbox" data-pet-field="rideable" data-home-id="${id}" data-pet-id="${p.id}" ${p.rideable?"checked":""}> 등에 타고 이동할 수 있음</label><div class="pet-actions"><button data-pet-image="photo" data-home-id="${id}" data-pet-id="${p.id}">원형 사진</button><button data-image-url="petPhoto" data-id="${id}" data-room="${p.id}">사진 링크</button><button data-pet-image="icon" data-home-id="${id}" data-pet-id="${p.id}">투명 아이콘</button><button data-image-url="petIcon" data-id="${id}" data-room="${p.id}">아이콘 링크</button><button class="danger" data-delete-pet="${p.id}" data-home-id="${id}">삭제</button></div></div>`:""}
  </article>`).join("");
  const cars=(h.cars||[]).map(car=>`<article class="car-card">${car.image?`<img class="car-photo" src="${esc(car.image)}" alt="">`:`<span class="car-icon">🚙</span>`}<div><b>${esc(car.name)}</b><small>${esc(car.type)}${car.color?` · ${esc(car.color)}`:""} · ${car.seats||5}인승</small></div>${edit?`<div class="car-edit"><label>차량 이름<input data-car-field="name" data-home-id="${id}" data-car-id="${car.id}" value="${esc(car.name)}"></label><label>종류<select data-car-field="type" data-home-id="${id}" data-car-id="${car.id}">${["경차","승용차","SUV","승합차","스포츠카","전기차","오토바이","기타"].map(type=>`<option ${type===car.type?"selected":""}>${type}</option>`).join("")}</select></label><label>색상<input data-car-field="color" data-home-id="${id}" data-car-id="${car.id}" value="${esc(car.color||"")}"></label><label>좌석 수<input type="number" min="1" max="12" data-car-field="seats" data-home-id="${id}" data-car-id="${car.id}" value="${car.seats||5}"></label><div class="image-actions"><button data-car-image="${car.id}" data-home-id="${id}">차 사진 선택</button><button data-image-url="car" data-id="${id}" data-room="${car.id}">사진 링크</button></div><button class="danger" data-delete-car="${car.id}" data-home-id="${id}">삭제</button></div>`:""}</article>`).join("");
  const residentScenes=chars.map(c=>{
    const e=eventFor(c),place=placeForEntry(e),image=sceneImage(c,e),sceneHome=state.homes[e.visitHomeId||c.homeId];
    const location=e.home?`🏠 ${sceneHome?.name||"집"} · ${sceneHome?.rooms?.[e.room]?.name||"집 안"}`:e.transit?"🚌 이동 중":place?`📍 ${place.name} · ${townForEntry(e).name}`:"📍 외출 중";
    return `<article class="resident-scene-card" style="--resident-theme:${esc(c.theme?.primary||"#176b60")}">
      <div class="resident-profile">${c.photo?`<img src="${esc(c.photo)}" alt="">`:avatar(c)}<span><h3>${esc(c.name)}</h3><small>${esc(c.jobTitle||c.job)}</small></span></div>
      <div class="resident-current"><small>CURRENT SCENE</small><h3>${esc(e.title)}</h3><p>${esc(e.desc)}</p><b>${location}</b>${image?`<img src="${esc(image)}" alt="">`:""}</div>
    </article>`;
  }).join("");
  return `<article class="home panel" data-home-card="${id}">
    <div class="title"><div>${edit?`<input class="home-name" data-home-name data-home-id="${id}" value="${esc(h.name)}">`:`<h2>🏠 ${esc(h.name)}</h2>`}<small>${chars.length?`${chars.map(c=>c.name).join(" · ")} 연결됨`:"아직 연결된 캐릭터가 없는 집"}</small></div><b>${inside.length}명 머무는 중</b></div>
    ${edit?`<section class="home-identity-editor"><label>집의 종류<select data-home-field="kind" data-home-id="${id}">${["일반 주거","본가","별채","주말집","업무용 숙소","공동 주거","기타"].map(value=>`<option ${value===(h.kind||"일반 주거")?"selected":""}>${value}</option>`).join("")}</select></label><label>집이 있는 마을<select data-home-field="townId" data-home-id="${id}"><option value="">마을 지정 안 함</option>${state.towns.map(town=>`<option value="${town.id}" ${town.id===h.townId?"selected":""}>${esc(town.name)}</option>`).join("")}</select></label><label>집 설명<input data-home-field="notes" data-home-id="${id}" maxlength="300" value="${esc(h.notes||"")}" placeholder="예: 주말에 쉬러 가는 바닷가 별채"></label><button type="button" class="danger" data-delete-home="${id}">이 집 삭제</button></section>`:""}
    ${edit?`<div class="home-photo-editor"><b>집 선택 버튼 배경 사진</b><span><button data-home-bg="${id}">사진</button><button data-image-url="home" data-id="${id}">링크</button>${h.image?`<button data-clear-home-bg="${id}">지우기</button>`:""}</span></div>`:""}
    ${residentEditor}${sleepEditor}<div class="clean">청결도 · ${Math.round(h.cleanliness??100)}% <i style="width:${h.cleanliness??100}%"></i></div>
    <div class="rooms ${roomKeys.length>6?"has-extra":""}">${roomHtml}</div>
    <section class="pets"><div class="title"><h2>함께 사는 존재</h2>${edit?`<button data-add-pet>+ 함께 사는 존재 추가</button>`:""}</div><div class="pet-grid">${petCards||"<p>아직 함께 사는 존재가 없어요.</p>"}</div></section>
    <section class="cars"><div class="title"><h2>자동차</h2>${edit?`<button data-add-car>+ 자동차 추가</button>`:""}</div><div class="car-grid">${cars||"<p>등록된 자동차가 없어요.</p>"}</div><small>운전면허가 있는 구성원만 운전하며, 음주한 날에는 자동차를 이용하지 않아요.</small></section>
    <section class="resident-scenes"><div class="title"><h2>동거인 현재 장면</h2></div><div>${residentScenes}</div></section>
    ${homeDailyLog(chars,h)}
    <section class="home-statuses"><h2>집 사람들 상태</h2><div>${status}</div></section>
  </article>`;
}
function chips(title,all,selected,key){return `<section class="chips"><h3>${title}</h3>${all.map(x=>`<button data-chip="${key}" data-value="${x}" class="${selected.includes(x)?"on":""}">${x}</button>`).join("")}</section>`}
function personalityChoice(c,title,field,options,help=""){
  const defaults={socialStyle:"조용히 어울림",perceptionStyle:"균형형",decisionStyle:"균형형",planningStyle:"상황에 따라",neatness:"보통",interference:"적당히 관여",conflictStyle:"대화로 해결",affectionStyle:"행동으로 표현",energyRhythm:"상황에 따라"};
  const current=c[field]||defaults[field];
  return `<section class="chips personality-choice"><h3>${title}</h3>${help?`<small>${help}</small>`:""}<div>${options.map(value=>`<button data-personality-field="${field}" data-value="${value}" class="${current===value?"on":""}">${value}</button>`).join("")}</div></section>`;
}
const PERSONALITY_TYPES=["철두철미함","차분하고 신중함","냉정하고 논리적","다정하고 세심함","수줍고 내향적","활발하고 사교적","즉흥적이고 자유로움","호기심 많고 창의적","완고하고 통제적","무심하고 독립적","감정적이고 충동적","장난기 많음"];
function personalityTypeChoice(c){
  const selected=new Set(c.personalityTypes||[]);
  return `<section class="chips personality-choice personality-type-choice"><h3>이 캐릭터의 전체적인 유형 · 최대 4개</h3><small>여기서 고른 유형이 혼자 하는 행동과 말투의 기본이 되고, 관계 설정은 그다음에 상대별 차이를 더해요.</small><div>${PERSONALITY_TYPES.map(value=>`<button type="button" data-personality-type="${value}" class="${selected.has(value)?"on":""}">${value}</button>`).join("")}</div></section>`;
}
const CHARACTER_TRAITS=["ADHD 설정","자폐 스펙트럼 설정","복수 자아·다중 정체성 설정","해리 경험","불안 관련 특성","강박 관련 특성","감각 처리 특성","틱·투렛 관련 특성","사이코패스 성향 설정 · 비임상","간헐적 폭발 장애 설정","기타 직접 설정"];
const TRAIT_EXPRESSIONS=["주의가 쉽게 전환됨","관심 대상에 과집중함","생각이 떠오르면 바로 시작함","감각 자극에 민감함","익숙한 순서가 바뀌면 힘듦","사회적 신호를 해석하는 데 시간이 필요함","기억이 비는 때가 있음","자아마다 말투·선호가 다름","타인의 감정을 직관보다 관찰과 추론으로 파악함","죄책감이나 공감이 낮게 표현됨","감정이 급격히 치솟는 때가 있음","격해지면 먼저 거리를 두고 진정함"];
function characterTraitChoice(c){
  const traits=new Set(c.characterTraits||[]),expressions=new Set(c.traitExpressions||[]);
  return `<section class="character-trait-settings">
    <div class="character-trait-heading"><h2>서사·인지 특성 · 선택 사항</h2><p>진단명이나 설정 라벨만으로 행동을 추측하지 않아요. 먼저 설정을 표시하고, 실제 생활 장면에 나타낼 방식은 아래에서 따로 골라 주세요.</p></div>
    <section class="chips personality-choice"><h3>설정 라벨 · 최대 8개</h3><div>${CHARACTER_TRAITS.map(value=>`<button type="button" data-character-trait="${value}" class="${traits.has(value)?"on":""}">${value}</button>`).join("")}</div></section>
    <section class="chips personality-choice"><h3>실제 장면에 반영할 표현 · 최대 8개</h3><div>${TRAIT_EXPRESSIONS.map(value=>`<button type="button" data-trait-expression="${value}" class="${expressions.has(value)?"on":""}">${value}</button>`).join("")}</div><small>예: ADHD 설정을 골라도 ‘주의가 쉽게 전환됨’을 별도로 고르지 않으면 모든 행동을 산만하게 만들지 않습니다.</small></section>
    <label class="trait-note-field">직접 설정한 표현 메모<textarea data-trait-notes maxlength="1200" rows="5" placeholder="한 줄에 한 문장씩 적어 주세요. 예: 대화가 격해지면 창가로 물러나 호흡을 고른다.">${esc(c.traitNotes||"")}</textarea></label>
    <label class="check trait-note-switch"><input type="checkbox" data-trait-notes-in-scripts ${c.traitNotesInScripts?"checked":""}> 이 메모의 문장을 생활 로그에 직접 반영</label>
    <small>이 스위치를 켜면 메모가 장면 문구에 그대로 나올 수 있어요. 라벨만 고른 상태에서는 행동을 자동 추측하지 않습니다. 사이코패스 성향이나 간헐적 폭발 장애 설정도 폭력·범죄·가해 행동과 자동 연결하지 않으며, 실제 공격 행동은 별도의 관계 안전 설정이 허용한 범위를 넘지 않습니다.</small>
  </section>`;
}
const HEALTH_CONDITIONS=["당뇨병","고혈압","고지혈증","심혈관 질환","천식","관절 질환","만성 통증","신장 질환","기타 건강 상태"];
const BODY_SIZES=["설정하지 않음","매우 마른 체형","마른 체형","슬림한 체형","보통 체형","통통한 체형","비만 체형","근육질 체형","탄탄한 체형","골격이 큰 체형","골격이 작은 체형"];
const PHYSICAL_TRAITS=["키가 매우 큼","키가 큼","키가 작음","키가 매우 작음","팔다리가 긴 편","어깨가 넓음","어깨가 좁음","손이 큼","손이 작음","근육이 발달함","유연한 편","흉터가 있음","문신이 있음","주근깨가 있음","점이 있음","보조개가 있음","피어싱을 함","피부가 밝은 편","중간 피부톤","피부가 어두운 편","구릿빛 피부","창백한 편"];
const HAIR_COLORS=["설정하지 않음","검은색","짙은 갈색","갈색","밝은 갈색","금발","백발·은발","회색","청회색","빨간색","주황색","분홍색","보라색","파란색","청록색","초록색","여러 색","기타"];
const HAIR_ORIGINS=["설정하지 않음","자연모","전체 염색","부분 염색","탈색 후 염색","가발·헤어피스"];
const HAIR_LENGTHS=["설정하지 않음","삭발·매우 짧음","귀 위 길이","숏컷","단발","어깨 길이","가슴 길이","허리 길이","허리보다 김"];
const HAIR_TEXTURES=["설정하지 않음","직모","약한 반곱슬","강한 반곱슬","곱슬","강한 곱슬"];
const HAIR_STYLES=["자연스럽게 풀어 둠","앞머리 있음","앞머리 없음","올백","보브컷","레이어드컷","울프컷","투블럭","언더컷","포니테일","양갈래","반묶음","땋은 머리","로우번","하이번","드레드록","히메컷","웨이브 스타일","고데기 스타일링"];
const EYE_COLORS=["설정하지 않음","검은색","짙은 갈색","갈색","연갈색","호박색","금색","초록색","청록색","파란색","청회색","회색","보라색","분홍색","빨간색","백색","여러 색","기타"];
const MAKEUP_LEVELS=["하지 않음","스킨케어만","선크림·기초만","가벼운 메이크업","포인트 메이크업","풀 메이크업"];
const MAKEUP_STYLES=["내추럴","글로우","매트","음영","아이 메이크업 중심","립 중심","화려한 색조","무대·촬영용","고딕","복고풍"];
const SALON_FREQUENCIES=["자동 · 설정에 맞춤","거의 가지 않음","3~4개월에 한 번","1~2개월에 한 번","한 달에 한 번","2주에 한 번","주 1회 이상"];
const SURGERY_AREAS=["눈","코","입술","윤곽·턱","피부·흉터","가슴","체형 교정","성별확정 의료 과정","기타"];
const ACCESSIBILITY_PREFERENCES=["도움 전에 먼저 물어보기","보조기기 함부로 만지지 않기","접근 가능한 동선 먼저 확인","쉬는 시간을 충분히 두기","조용한 자리 선호","문자·시각 정보 함께 제공","말로 주변 정보 설명","직접 선택하고 결정할 시간 주기"];
function profileSelect(label,path,options,current){
  return `<label>${label}<select data-body-field="${path}">${options.map(value=>`<option value="${esc(value)}" ${value===current?"selected":""}>${esc(value)}</option>`).join("")}</select></label>`;
}
function profileMultiChoice(title,key,options,selected){
  const values=new Set(selected||[]);
  const all=[...options,...[...values].filter(value=>!options.includes(value))];
  return `<fieldset><legend>${title}</legend><div class="chips">${all.map(value=>`<button type="button" data-body-list="${key}" data-value="${esc(value)}" class="${values.has(value)?"on":""}">${esc(value)}</button>`).join("")}</div></fieldset>`;
}
function profileAttractionSettings(c){
  const attractionTraits=Array.isArray(c.attractionTraits)?c.attractionTraits:[];
  return `<section class="setting-card profile-attraction-settings">
    <h2>끌림과 외모 인식</h2>
    <p>이 캐릭터가 상대의 외모를 얼마나 보는지와, 어떤 외형·성격·말투·삶의 태도에 끌리는지를 정해요. 이 설정만으로 관계나 호감은 자동 생성되지 않습니다.</p>
    <div class="health-field-grid">
      <label>상대의 외모를 보는 정도<select data-field="appearanceInterest">${["거의 보지 않음","조금 봄","보통","꽤 중요하게 봄","외모에 크게 끌림"].map(value=>`<option ${value===(c.appearanceInterest||"보통")?"selected":""}>${value}</option>`).join("")}</select></label>
    </div>
    <div class="profile-tag-actions">
      <button type="button" data-profile-tags="attractionTraits">이 캐릭터가 끌리는 특성 정하기</button>
      <small data-profile-tags-summary="attractionTraits">${attractionTraits.length?esc(attractionTraits.join(" · ")):"정하지 않음"}</small>
    </div>
    <small>상대별 시선과 관계 단계가 먼저이며, 끌리는 특성은 그 관계 안에서 시선이 머무는 이유와 표현 후보에만 반영됩니다.</small>
  </section>`;
}
function physicalAppearanceSettings(c){
  const appearanceTags=Array.isArray(c.appearanceTags)?c.appearanceTags:[];
  const p=c.bodyProfile||{},a=p.appearance||{};
  return `<section class="setting-card physical-appearance-settings">
    <h2>신체와 외형</h2>
    <p>직접 고른 항목만 묘사에 사용합니다. 머리·눈·화장 설정은 아침 준비, 미용실, 가까운 관계의 시선 같은 생활 장면에 드물게 반영돼요.</p>
    <div class="health-field-grid">
      <label>외모가 눈에 띄는 정도<select data-field="appearanceLevel">${["매우 추함","못생김","눈에 띄지 않음","수수함","보통","매력적임","매우 아름답거나 잘생김","시선을 사로잡음"].map(value=>`<option ${value===(c.appearanceLevel||"보통")?"selected":""}>${value}</option>`).join("")}</select></label>
      ${profileSelect("체형","bodySize",BODY_SIZES,p.bodySize||"설정하지 않음")}
      ${profileSelect("현재 머리색","appearance.hairColor",HAIR_COLORS,a.hairColor||"설정하지 않음")}
      ${profileSelect("머리색 설정","appearance.hairColorOrigin",HAIR_ORIGINS,a.hairColorOrigin||"설정하지 않음")}
      ${profileSelect("본래 머리색 · 염색모일 때","appearance.naturalHairColor",HAIR_COLORS,a.naturalHairColor||"설정하지 않음")}
      ${profileSelect("머리 기장","appearance.hairLength",HAIR_LENGTHS,a.hairLength||"설정하지 않음")}
      ${profileSelect("머리 결","appearance.hairTexture",HAIR_TEXTURES,a.hairTexture||"설정하지 않음")}
      ${profileSelect("왼쪽 눈 색","appearance.leftEyeColor",EYE_COLORS,a.leftEyeColor||"설정하지 않음")}
      ${profileSelect("오른쪽 눈 색","appearance.rightEyeColor",EYE_COLORS,a.rightEyeColor||"설정하지 않음")}
      ${profileSelect("화장 정도","appearance.makeupLevel",MAKEUP_LEVELS,a.makeupLevel||"하지 않음")}
      ${profileSelect("미용실 방문 빈도","appearance.salonFrequency",SALON_FREQUENCIES,a.salonFrequency||"자동 · 설정에 맞춤")}
      ${profileSelect("성형·외형 의료 시술 여부","appearance.cosmeticSurgery",["설정하지 않음","하지 않음","과거에 받음","정기적으로 관리 중","받을 계획이 있음"],a.cosmeticSurgery||"설정하지 않음")}
    </div>
    ${profileMultiChoice("머리 스타일 · 여러 개 선택 가능","appearance.hairStyles",HAIR_STYLES,a.hairStyles)}
    ${profileMultiChoice("화장 스타일 · 화장할 때 반영","appearance.makeupStyles",MAKEUP_STYLES,a.makeupStyles)}
    ${profileMultiChoice("신체 특성 · 직접 고른 항목만 반영","physicalTraits",PHYSICAL_TRAITS,p.physicalTraits)}
    ${profileMultiChoice("성형·외형 의료 시술 부위 · 원할 때만","appearance.cosmeticSurgeryAreas",SURGERY_AREAS,a.cosmeticSurgeryAreas)}
    <div class="profile-tag-actions">
      <button type="button" data-profile-tags="appearanceTags">그 외 외모 태그 정하기</button>
      <small data-profile-tags-summary="appearanceTags">${appearanceTags.length?esc(appearanceTags.join(" · ")):"정하지 않음"}</small>
    </div>
    <div class="representation-warning compact"><b>표현 원칙</b><p>체형, 피부, 성형 여부를 우열이나 웃음거리로 만들지 않습니다. 성형 부위는 설정표 보관용이며 상대가 함부로 알아채거나 품평하는 장면을 만들지 않아요. 머리 놀림 같은 갈등 장면도 실제 상대별 성가심·갈등·공격 표현 범위가 함께 설정된 경우에만 후보가 됩니다.</p></div>
  </section>`;
}
function healthAccessibilitySettings(c){
  const p=c.bodyProfile||{},wheelchair=p.wheelchair||{},arm=p.prostheticArm||{},leg=p.prostheticLeg||{},hearing=p.hearing||{},vision=p.vision||{};
  const sideOptions=["사용하지 않음","왼쪽","오른쪽","양쪽"];
  const sensorySides=["설정하지 않음","왼쪽","오른쪽","양쪽"];
  return `<section class="setting-card health-accessibility-settings">
    <h2>건강·장애·접근성 설정 · 선택 사항</h2>
    <div class="representation-warning"><b>표현 안전 안내</b><p>이 항목은 진단이나 의학 조언이 아닙니다. 장애·질환·체형을 무능, 비극, 웃음거리, 영감의 소재, 폭력성과 연결하지 않아요. 생활 장면에는 당사자가 직접 고른 보조기기·접근성·건강 관리 방식만 가끔 반영하며, 도움은 먼저 묻고 동의받는 방식으로 표현합니다. 사람마다 선호하는 말과 경험이 다르므로 원하지 않는 항목은 고르지 않아도 됩니다.</p></div>
    <div class="health-field-grid">
      ${profileSelect("휠체어", "wheelchair.type",["사용하지 않음","수동 휠체어","전동 휠체어","스포츠용 휠체어","기타 휠체어"],wheelchair.type||"사용하지 않음")}
      ${profileSelect("휠체어 이용 방식", "wheelchair.pattern",["","항상 이용","장거리·외출 시 이용","피로하거나 통증이 있을 때 이용","활동에 따라 바꾸어 이용"],wheelchair.pattern||"")}
      ${profileSelect("의수 사용 부위", "prostheticArm.side",sideOptions,arm.side||"사용하지 않음")}
      ${profileSelect("의수 종류", "prostheticArm.type",["","미관용 의수","장식·미관용 손형 의수","수동 손형 의수","수동 갈고리형 의수","작업용 의수","작업용 갈고리·집게형 의수","바디파워 의수","바디파워 손형 의수","바디파워 갈고리형 의수","근전동 의수","근전동 손형 의수","다관절 전자의수","스포츠·활동용 의수","특정 작업용 교체 도구","기타 의수"],arm.type||"")}
      ${profileSelect("의족 사용 부위", "prostheticLeg.side",sideOptions,leg.side||"사용하지 않음")}
      ${profileSelect("의족 종류", "prostheticLeg.type",["","일상 보행용 의족","고활동형 의족","스포츠용 의족","방수용 의족","미관용 의족","기타 의족"],leg.type||"")}
      ${profileSelect("청각장애·난청 부위", "hearing.side",sensorySides,hearing.side||"설정하지 않음")}
      ${profileSelect("청각 특성", "hearing.level",["","난청","농·청각장애","상황에 따라 들리는 정도가 다름","기타"],hearing.level||"")}
      ${profileSelect("시각장애·저시력 부위", "vision.side",sensorySides,vision.side||"설정하지 않음")}
      ${profileSelect("시각 특성", "vision.level",["","저시력","맹·시각장애","시야 범위가 제한됨","빛에 민감함","기타"],vision.level||"")}
    </div>
    ${profileMultiChoice("만성질환·건강 관리", "healthConditions",HEALTH_CONDITIONS,p.healthConditions)}
    ${profileMultiChoice("청각 접근 방식", "hearing.supports",["보청기","인공와우","수어","문자 대화","입모양이 보이는 대화","자막","조용한 환경"],hearing.supports)}
    ${profileMultiChoice("시각 접근 방식", "vision.supports",["흰지팡이","안내견","화면 읽기","확대·고대비","음성 안내","촉각 표식","동행 안내"],vision.supports)}
    ${profileMultiChoice("상호작용에서 지킬 방식", "accessibilityPreferences",ACCESSIBILITY_PREFERENCES,p.accessibilityPreferences)}
    <div class="health-field-grid">
      <label>기타 건강 상태<input data-body-field="healthOther" maxlength="200" value="${esc(p.healthOther||"")}" placeholder="원할 때만 직접 입력"></label>
      <label>의수 종류 직접 입력<input data-body-field="prostheticArm.custom" maxlength="120" value="${esc(arm.custom||"")}" placeholder="기타 의수를 골랐을 때"></label>
      <label>의족 종류 직접 입력<input data-body-field="prostheticLeg.custom" maxlength="120" value="${esc(leg.custom||"")}" placeholder="기타 의족을 골랐을 때"></label>
    </div>
    <label>접근성 참고 메모 · 설정표용<textarea data-body-field="notes" maxlength="600" rows="4" placeholder="예: 안내견에게는 일하는 중 말을 걸지 않기, 도움 전에 반드시 먼저 묻기">${esc(p.notes||"")}</textarea></label>
    <small>건강 상태를 고르더라도 매 장면마다 언급하지 않습니다. 치료법·복용량·식단을 자동 처방하지 않고, 평범한 생활과 선택한 접근성 방식 안에서만 드물게 나타납니다. 이 참고 메모는 민감한 내용이 그대로 노출되지 않도록 생활 로그에는 자동 삽입하지 않고 설정표에만 보관합니다.</small>
  </section>`;
}
function character(){
  const c=active();
  const list=state.order.map((id,index)=>{const x=state.characters[id];return `<div class="char-sort-row"><button class="char-row ${id===c.id?"on":""}" data-edit="${id}" style="--own:${x.theme.primary}">${avatar(x)}<span><b>${esc(x.name)}</b><small>${esc(x.job)}</small></span></button><span class="sort-controls"><button data-sort="${id}" data-direction="-1" ${index===0?"disabled":""} aria-label="위로">▲</button><button data-sort="${id}" data-direction="1" ${index===state.order.length-1?"disabled":""} aria-label="아래로">▼</button></span></div>`}).join("");
  const favorites=Object.entries(CATALOG_LABELS).map(([kind,label])=>`<section class="chips"><h3>${label} 최애</h3>${(state.catalog?.[kind]||[]).map(item=>`<button data-favorite-kind="${kind}" data-favorite-id="${item.id}" class="${(c.favorites?.[kind]||[]).includes(item.id)?"on":""}">${esc(item.name)}</button>`).join("")||"<small>취향 사전에서 먼저 항목을 만들어 주세요.</small>"}</section>`).join("");
  const inventory=Object.entries(CATALOG_LABELS).map(([kind,label])=>`<section class="chips owned-items"><h3>소지한 ${label}</h3>${(state.catalog?.[kind]||[]).map(item=>`<button data-owned-kind="${kind}" data-owned-id="${item.id}" class="${(c.inventory?.[kind]||[]).includes(item.id)?"on":""}">${esc(item.name)}</button>`).join("")||"<small>취향 사전에서 먼저 항목을 만들어 주세요.</small>"}</section>`).join("");
  const workplaces=state.towns.flatMap(town=>(town.id===state.activeTownId?state.world.places:town.places).map(place=>({...place,townName:town.name})));
  const ageGroups=["영아","유아","어린이","청소년","청년","성인","중년","장년","노년","나이 불명"];
  const profile=`<h2>프로필</h2><div class="fields"><label>캐릭터 이름<input data-field="name" value="${esc(c.name)}"></label><label>나이대<select data-field="ageGroup">${ageGroups.map(x=>`<option ${x===(c.ageGroup||"성인")?"selected":""}>${x}</option>`).join("")}</select></label><label>직업 종류<select data-field="job">${JOBS.map(x=>`<option ${x===c.job?"selected":""}>${x}</option>`).join("")}</select></label><label>표기할 직업명<input data-field="jobTitle" value="${esc(c.jobTitle||"")}" placeholder="비워 두면 직업 종류명으로 표시"></label><label>출근할 건물<select data-field="workplaceId"><option value="">자동 선택 / 없음</option><option value="home" ${c.workplaceId==="home"?"selected":""}>🏠 자택근무</option>${workplaces.map(p=>`<option value="${p.id}" ${c.workplaceId===p.id?"selected":""}>${esc(p.townName)} · ${esc(p.name)}</option>`).join("")}</select></label><label>소비 유형<select data-field="income">${INCOMES.map(x=>`<option ${x===c.income?"selected":""}>${x}</option>`).join("")}</select></label><label>매운맛 선호 <b data-range-label="spiceTolerance">${SPICE_LEVELS[c.spiceTolerance??2]}</b><input type="range" min="0" max="5" data-field="spiceTolerance" data-levels="spice" value="${c.spiceTolerance??2}"></label><label>단맛 선호 <b data-range-label="sweetPreference">${SWEET_LEVELS[c.sweetPreference??2]}</b><input type="range" min="0" max="5" data-field="sweetPreference" data-levels="sweet" value="${c.sweetPreference??2}"></label><label>외향·내향 정도 <b data-range-label="socialEnergy">${PERSONALITY_LEVELS.socialEnergy[c.socialEnergy??3]}</b><input type="range" min="0" max="6" data-field="socialEnergy" data-levels="socialEnergy" value="${c.socialEnergy??3}"></label><label>감각·직관 정도 <b data-range-label="sensingIntuition">${PERSONALITY_LEVELS.sensingIntuition[c.sensingIntuition??3]}</b><input type="range" min="0" max="6" data-field="sensingIntuition" data-levels="sensingIntuition" value="${c.sensingIntuition??3}"></label><label>사고·감정 정도 <b data-range-label="thinkingFeeling">${PERSONALITY_LEVELS.thinkingFeeling[c.thinkingFeeling??3]}</b><input type="range" min="0" max="6" data-field="thinkingFeeling" data-levels="thinkingFeeling" value="${c.thinkingFeeling??3}"></label><label>인식·판단 정도 <b data-range-label="perceivingJudging">${PERSONALITY_LEVELS.perceivingJudging[c.perceivingJudging??3]}</b><input type="range" min="0" max="6" data-field="perceivingJudging" data-levels="perceivingJudging" value="${c.perceivingJudging??3}"></label><label>프로필 사진<div class="image-actions"><button data-image="photo">사진 선택</button><button data-image-url="photo" data-id="${c.id}">링크 입력</button></div></label><label>지도용 캐릭터 아이콘 (선택)<div class="image-actions"><button data-image="icon">투명 아이콘 선택</button><button data-image-url="icon" data-id="${c.id}">링크 입력</button></div><small>첨부하지 않으면 프로필 사진이 원형 아이콘으로 보여요.</small></label><label>기상 시각<input type="time" data-field="wake" value="${c.wake}"></label><label>취침 시각<input type="time" data-field="sleep" value="${c.sleep}"></label><label>대표 테마색<input type="color" data-color="primary" value="${c.theme.primary}"></label><label>그라데이션 보조색<input type="color" data-color="secondary" value="${c.theme.secondary}"></label></div><label class="check"><input type="checkbox" data-gradient ${c.theme.gradient?"checked":""}> 보조색으로 그라데이션 사용</label>`;
  const interactionTargets=state.order.filter(id=>id!==c.id).map(id=>`<option value="${id}">${esc(state.characters[id].name)}</option>`).join("");
  const interactionItems=Object.entries(state.catalog||{}).flatMap(([kind,items])=>(items||[]).map(item=>`<option value="${kind}:${item.id}">${esc(item.name)}</option>`)).join("");
  const worldTaste=`<h2>${esc(c.name)}의 세계관 선호와 소지품</h2><p>특히 좋아하는 항목과 실제로 가지고 다니거나 보관하는 물건을 각각 골라 주세요.</p>${favorites}<hr><h2>소지품</h2>${inventory}<hr><section class="setting-card"><h2>🎁 구체적인 물건 구매·선물하기</h2><p>실제 물건 이름을 고르면 받는 캐릭터의 소지품에 정확히 추가되고, 두 캐릭터의 같은 시각 로그에 누가 누구에게 무엇을 건넸는지 표시돼요.</p><div class="fields"><label>함께할 캐릭터<select data-character-interaction-target>${interactionTargets||'<option value="">다른 캐릭터가 필요해요</option>'}</select></label><label>구매하거나 선물할 물건<select data-character-interaction-item>${interactionItems||'<option value="">취향 사전에 물건을 먼저 추가해 주세요</option>'}</select></label></div><div class="image-actions"><button data-character-interaction="buy">내 소지품으로 구매</button><button data-character-interaction="gift">선택한 물건 선물하기</button><button data-character-interaction="exercise">같이 운동하기</button><button data-character-interaction="outing">같이 나들이하기</button></div></section>`;
  const videoFormats=["영화","드라마","애니메이션","다큐멘터리","연애 예능","여행 예능","음악 예능","관찰 예능","게임 예능","토크쇼","서바이벌","코미디 예능","브이로그","게임 방송","먹방","리뷰","교육","숏폼","웹예능","웹드라마"],gameGenres=DETAIL_OPTIONS.game;
  const storyGenres=["로맨스","코미디","액션","판타지","SF","스릴러","공포","미스터리","범죄","드라마","시대극","일상","청춘","가족","모험"];
  const taste=`<h2>${esc(c.name)}의 취향 선택</h2><p>‘좋아하는 장르’는 책·영화·드라마·애니메이션 등 이야기 콘텐츠 전체에 공통으로 반영돼요.</p>${chips("관심사",INTERESTS,c.interests||[],"interests")}${chips("취미",HOBBIES,c.hobbies||[],"hobbies")}${chips("음식",FOOD_PREFERENCES,c.foodPreferences||[],"foodPreferences")}${chips("좋아하는 음료",DRINKS,c.drinks||[],"drinks")}${chips("좋아하는 장르 · 이야기 전체",storyGenres,c.favoriteStoryGenres||[],"favoriteStoryGenres")}${chips("좋아하는 음악 장르",MUSIC,c.musicGenres||[],"musicGenres")}${chips("좋아하는 패션 스타일",DETAIL_OPTIONS.fashion,c.favoriteFashionStyles||[],"favoriteFashionStyles")}${chips("좋아하는 영상 종류",videoFormats,c.favoriteVideoGenres||[],"favoriteVideoGenres")}${chips("좋아하는 게임 장르",gameGenres,c.favoriteGameGenres||[],"favoriteGameGenres")}${chips("좋아하는 향 계열",PERFUME_NOTES,c.favoriteScentNotes||[],"favoriteScentNotes")}`;
  const personality=`<h2>${esc(c.name)}의 성격</h2><p>전체 유형을 먼저 고르고, 아래에서 세부 성향과 서사·인지 특성을 조절해 주세요.</p>${personalityTypeChoice(c)}${personalityChoice(c,"사람과 어울리는 방식","socialStyle",["혼자가 편함","낯을 가림","조용히 어울림","먼저 다가감","무리의 중심"])}${personalityChoice(c,"정보를 받아들이는 방식","perceptionStyle",["현실과 경험 중시","구체적인 편","균형형","가능성 중시","직관과 상상 중시"])}${personalityChoice(c,"판단하는 방식","decisionStyle",["논리 우선","이성적인 편","균형형","마음을 살핌","공감 우선"])}${personalityChoice(c,"일정을 다루는 방식","planningStyle",["무계획","즉흥적","유연한 편","상황에 따라","미리 정리함","계획적","강박적으로 계획함"])}${personalityChoice(c,"행동을 전환하는 방식","activityTempo",["한 가지씩 차분히","잠깐 쉬고 다음 일","상황에 따라","생각나면 바로 움직임","부산스럽게 여러 일을 오감","허둥대며 주의가 자주 옮겨감"],"활동적인 정도와 별개예요. 뒤쪽일수록 하던 중 다른 일이 눈에 들어오는 행동이 늘어요.")}${personalityChoice(c,"깔끔한 정도","neatness",["어질러도 편함","조금 느슨함","보통","정돈을 좋아함","흐트러짐을 못 참음","결벽에 가까움"])}${personalityChoice(c,"옷을 입는 감각","fashionSense",["패션에 전혀 관심 없음","조합을 자주 틀림","무난하게 입음","센스 있게 입음","스타일링에 능숙함"],"자동 코디의 색 조합·상황 적합성·액세서리 사용에 반영돼요.")}${personalityChoice(c,"남에게 관여하는 정도","interference",["방관자","요청할 때만 도움","적당히 관여","챙기고 확인함","강하게 간섭함","컨트롤프릭"],"방관자는 웬만한 일에 끼어들지 않고, 컨트롤프릭은 상대의 일정과 행동까지 통제하려 해 갈등 가능성이 커져요.")}${personalityChoice(c,"갈등 대응","conflictStyle",["피하는 편","시간을 두고 말함","대화로 해결","바로 따짐","끝까지 결론을 냄"])}${personalityChoice(c,"애정 표현","affectionStyle",["표현이 서툼","조용히 곁에 있음","말로 표현","행동으로 표현","적극적으로 챙김"])}${personalityChoice(c,"생활 에너지","energyRhythm",["집에서 충전","느긋한 편","상황에 따라","활동적인 편","가만히 못 있음"])}`;
  const profileWithLicense=`<section class="profile-license">${townAssignment(c)}${profile}<label class="check"><input type="checkbox" data-character-check="${c.id}" data-field="driverLicense" ${c.driverLicense?"checked":""}> 운전면허 있음</label>${profileAttractionSettings(c)}</section>`;
  const bodyPane=`<section class="character-traits-pane body-pane"><div class="traits-pane-heading"><h2>${esc(c.name)}의 신체</h2><p>체형, 머리, 눈, 화장 같은 외형과 건강·접근성을 나누어 정해요. 고르지 않은 특성은 장면에서 지어내지 않습니다.</p></div>${physicalAppearanceSettings(c)}${healthAccessibilitySettings(c)}</section>`;
  const personalityExtras=`<section class="personality-extra">${personalityChoice(c,"유머·장난 성향","humorStyle",["장난을 거의 하지 않음","건조한 농담만 함","가끔 장난을 즐김","장난을 즐김","유머로 분위기를 이끎"],"웃음·농담·장난 장면의 빈도와 표현을 정해요.")}${personalityChoice(c,"감정 표현의 크기","emotionalExpression",["표정 변화가 거의 없음","감정을 잘 드러내지 않음","상황에 따라 표현함","표현이 풍부함","감정이 바로 드러남"],"같은 감정이라도 표정과 몸짓으로 얼마나 드러나는지 정해요.")}${personalityChoice(c,"충동을 참는 정도","impulseControl",["매우 잘 참음","대체로 참음","가끔 욱하지만 멈춤","쉽게 욱함","거의 참지 않음"],"공격 충동이 있어도 이 성향과 실제 행동 단계가 허용해야 행동으로 나와요.")}</section>`;
  const pane=state.characterPane==="body"?bodyPane:state.characterPane==="personality"?`${personality}${personalityExtras}${characterTraitChoice(c)}`:state.characterPane==="taste"?taste:state.characterPane==="worldTaste"?worldTaste:profileWithLicense;
  const limit=characterLimit();
  const slotLabel=state.order.length>limit?`${state.order.length}명 저장됨 · 한도 ${limit}명`:`+ 생성 · ${state.order.length}/${limit}`;
  return `<div class="editor"><aside class="panel"><div class="title"><h2>캐릭터 목록</h2><button data-new ${state.order.length>=limit?"disabled":""}>${slotLabel}</button></div>${list}</aside><section class="panel form"><div class="character-menu"><button data-character-pane="profile" class="${state.characterPane==="profile"?"on":""}">프로필</button><button data-character-pane="body" class="${state.characterPane==="body"?"on":""}">신체</button><button data-character-pane="personality" class="${state.characterPane==="personality"?"on":""}">성격</button><button data-character-pane="taste" class="${state.characterPane==="taste"?"on":""}">취향 선택</button><button data-character-pane="worldTaste" class="${state.characterPane==="worldTaste"?"on":""}">세계관 선호</button></div>${pane}<button type="button" class="profile-export-open" data-export-profile>프로필 내보내기 · PNG / PDF</button><div class="form-actions"><button class="primary" data-save>캐릭터 저장</button><button class="danger" data-delete-character="${c.id}">캐릭터 삭제</button></div></section></div>`;
}
function wardrobe(){
  const c=active(),owned=new Set(c.inventory?.fashion||[]);
  const items=(state.catalog?.fashion||[]).filter(item=>owned.has(item.id));
  const itemCard=item=>`<article class="closet-item-card" data-edit-clothing="${item.id}">${item.image?`<img src="${esc(item.image)}" alt="">`:`<span>👕</span>`}<div><b>${esc(item.name)}</b><small>${esc([item.category,item.ordinary,...(item.occasionTags||[]),...(item.colors||[])].filter(Boolean).join(" · "))}</small></div><button data-edit-clothing="${item.id}">편집</button></article>`;
  const outfitCard=outfit=>`<article class="saved-outfit-card"><div class="outfit-collage ${esc(outfit.layout||"cluster-1")}">${outfit.itemIds.map(id=>items.find(item=>item.id===id)).filter(Boolean).map(item=>item.image?`<img src="${esc(item.image)}" alt="">`:`<span>👕</span>`).join("")}</div><div><b>${esc(outfit.name)}</b><small>${esc((outfit.tags||[]).join(" · ")||"일상 코디")}</small></div><button data-edit-outfit="${outfit.id}">코디 편집</button></article>`;
  return `<section class="wardrobe-shell"><div class="wardrobe-character-strip panel">${state.order.map(id=>`<button data-wardrobe-character="${id}" class="${id===c.id?"on":""}">${avatar(state.characters[id])}<b>${esc(state.characters[id].name)}</b></button>`).join("")}</div><section class="panel closet-main"><div class="title"><div><h1>${esc(c.name)}의 옷장</h1><p>옷을 등록하고, 자주 입는 조합을 코디로 저장해요.</p></div><div><button data-new-clothing>+ 옷 등록</button><button class="primary" data-new-outfit>+ 코디 만들기</button></div></div><h2>보유한 옷</h2><div class="closet-items">${items.map(itemCard).join("")||"<div class='empty-mini'><b>아직 등록한 옷이 없어요.</b><p>옷은 이제 취향 사전이 아니라 이 옷장에서 직접 만들어요.</p></div>"}</div><div class="title outfit-section-title"><div><h2>저장한 코디</h2><p>레이아웃은 보기 방식이고, 실제 자동 코디는 상황·색·격식·패션 감각을 따져요.</p></div></div><div class="saved-outfits">${(c.savedOutfits||[]).map(outfitCard).join("")||"<div class='empty-mini'><b>저장한 코디가 없어요.</b><p>자주 입히고 싶은 옷 조합을 만들어 주세요.</p></div>"}</div></section></section>`;
}
function catalog(){
  const sections=Object.entries(CATALOG_LABELS).map(([kind,label])=>{
    const cards=(state.catalog?.[kind]||[]).map(item=>{
      const categories=kind==="movie"?Object.keys(VIDEO_GENRES):(CATALOG_CATEGORIES[kind]||[]);
      const custom=item.category&&!categories.includes(item.category)?[item.category]:[];
      const subgenres=kind==="movie"?(VIDEO_GENRES[item.category]||[]):kind==="perfume"?PERFUME_NOTES:kind==="weapon"?(WEAPON_SUBTYPES[item.category]||[]):(DETAIL_OPTIONS[kind]||[]);
      const detailEditor=kind==="perfume"?`<div class="chips"><b>향 계열 키워드 · 여러 개 선택 가능</b>${PERFUME_NOTES.map(x=>`<button data-catalog-keyword="${item.id}" data-kind="${kind}" data-value="${x}" class="${(item.keywords||[]).includes(x)?"on":""}">${x}</button>`).join("")}</div>`:`<label>세부 항목<select data-catalog-field="subtype" data-kind="${kind}" data-item="${item.id}"><option value="">세부 항목 선택</option>${subgenres.map(x=>`<option ${x===item.subtype?"selected":""}>${esc(x)}</option>`).join("")}</select></label>`;
      return `<details class="catalog-dex-card"><summary>${item.image?`<img class="catalog-app-icon" src="${esc(item.image)}" alt="">`:`<span class="catalog-app-icon">${CATALOG_ICONS[kind]||"📦"}</span>`}<b>${esc(item.name)}</b><small>${esc(item.category||label)}${item.subtype?` · ${esc(item.subtype)}`:""}</small></summary><div class="catalog-detail"><label>이름<input data-catalog-field="name" data-kind="${kind}" data-item="${item.id}" value="${esc(item.name)}"></label><label>분류<select data-catalog-field="category" data-kind="${kind}" data-item="${item.id}"><option value="">분류 선택</option>${[...custom,...categories].map(x=>`<option ${x===item.category?"selected":""}>${esc(x)}</option>`).join("")}</select></label>${detailEditor}<label>이미지 링크<input data-catalog-field="image" data-kind="${kind}" data-item="${item.id}" value="${esc(item.image||"")}" placeholder="https://..."></label>${kind==="food"?`<label>맵기<select data-catalog-field="spicy" data-kind="${kind}" data-item="${item.id}">${levelOptions(SPICE_LEVELS,item.spicy??0)}</select></label><label>달기<select data-catalog-field="sweet" data-kind="${kind}" data-item="${item.id}">${levelOptions(SWEET_LEVELS,item.sweet??0)}</select></label>`:""}${["music","idol","book","movie","game"].includes(kind)?`<label>아티스트·제작자<input data-catalog-field="creator" data-kind="${kind}" data-item="${item.id}" value="${esc(item.creator||"")}"></label>`:""}<button class="danger" data-delete-catalog="${item.id}" data-kind="${kind}">항목 삭제</button></div></details>`;
    }).join("")||"<p>아직 등록된 항목이 없어요.</p>";
    return `<section class="catalog-kind catalog-section"><div class="title"><h2>${label}</h2><button data-add-catalog="${kind}">+ 추가</button></div><div class="catalog-dex-grid">${cards}</div></section>`;
  }).join("");
  return `<section class="panel form catalog-shell"><div class="title"><div><h1>세계관 취향 도감</h1><p>아이콘을 누르면 세부 정보와 편집 항목이 열려요.</p></div><button class="primary" data-catalog-save>도감 저장</button></div>${sections}</section>`;
}
const relationActivities=()=> "";
const CHARACTER_VIEW_OPTIONS={
  overall:["정하지 않음","낯선 사람으로 여김","매우 싫어함","미워함","경계함","불편해함","부담스러워함","경쟁심을 느낌","애증을 느낌","그저 그런 사람","흥미롭게 여김","인간적인 호감이 있음","친구로 좋아함","존경함","동경함","안쓰럽게 여김","소중하게 여김","연애 감정이 싹틈","연애 감정으로 좋아함","깊이 사랑함","없어서는 안 될 사람"],
  awareness:["정하지 않음","자기 감정을 분명히 자각함","감정을 어렴풋이 느낌","감정을 우정으로 착각함","감정을 경쟁심으로 착각함","감정을 불편함으로 착각함","자기 감정을 전혀 모름","느끼는 감정을 부정함"],
  mutualAwareness:["정하지 않음","상대의 마음을 전혀 모름","상대의 마음을 어렴풋이 눈치챔","상대가 느끼는 감정을 알고 있음","서로의 마음을 확인함","상대의 마음을 오해하고 있음"],
  trust:["정하지 않음","전혀 믿지 않음","의심함","조심스럽게 지켜봄","보통","어느 정도 믿음","깊이 신뢰함","전적으로 의지함"],
  closeness:["정하지 않음","남보다도 멂","낯선 사이","거리감 있음","보통","편한 사이","가까운 사이","가장 가까운 사람"],
  comfort:["정하지 않음","함께 있으면 매우 불편하고 대화도 전혀 통하지 않음","같은 공간에서는 숨 막히지만 농담과 장난은 잘 통함","공간 공유는 불편하지만 대화는 편안함","긴장하고 대화도 조심스러움","어색하지만 필요한 대화는 무난함","함께 있는 건 편하지만 대화 호흡은 평범함","편안하고 농담과 장난이 잘 통함","말없이 함께 있어도 편안함","공간도 대화도 완벽하게 편안함"],
  annoyance:["정하지 않음","전혀 귀찮거나 성가시지 않음","전혀 귀찮거나 성가시지 않지만 성가시다고 말함","가끔 성가심","종종 귀찮음","많이 귀찮고 성가심","보기만 해도 피곤함"],
  attention:["정하지 않음","관심 없음","필요할 때만 봄","종종 신경 씀","자주 살핌","늘 최우선으로 챙김"],
  jealousy:["정하지 않음","질투하지 않음","가끔 신경 쓰임","은근히 질투함","질투가 심함","독점하고 싶어 함"],
  conflictIntensity:["정하지 않음","갈등이 거의 없음","가끔 부딪힘","자주 충돌함","격렬하게 충돌함","파국적인 충돌을 반복함"],
  expectation:["정하지 않음","언제든 끝날 수 있다고 생각함","곧 헤어질 거라고 예상함","당분간 이어질 거라 생각함","오래 함께할 거라 기대함","평생 이어질 관계라고 믿음"],
  touchIntensity:["정하지 않음","신체 접촉 없음","인사·부축 같은 의례적 접촉만","손잡기·팔짱까지","포옹·기대기까지","가벼운 입맞춤까지","깊은 입맞춤까지","성인 간 친밀한 접촉까지"],
  aggression:["정하지 않음","공격 충동 없음","거친 말을 하고 싶은 충동","몸으로 밀어내고 싶은 충동","해치고 싶은 충동","죽이고 싶을 만큼 격한 충동"],
  aggressionAction:["정하지 않음","행동으로 옮기지 않음","대부분 참지만 가끔 거친 말이 나옴","거친 말로만 표출함","물건이나 벽에 화풀이할 수 있음","상대를 때릴 수 있음","실제로 때릴 수 있음","심한 폭력을 행사할 수 있음"]
};
const characterViewOptions=key=>{
  if(key==="importance")return["선택하지 않음",...state.order.map((_,index)=>`${index+1}순위${index===0?" · 가장 중요한 사람":""}`)];
  return (CHARACTER_VIEW_OPTIONS[key]||[]).map(value=>value==="정하지 않음"?"선택하지 않음":value);
};
const characterViewEditor=()=>{
  const first=state.order.includes(state.characterViewSource)?state.characterViewSource:state.order[0];
  const field=(sourceId,targetId,key,label,help)=>{
    const explicit=state.characterViews?.[sourceId]?.[targetId]||{};
    const current=explicit[key]==="정하지 않음"?"선택하지 않음":(explicit[key]||"선택하지 않음");
    const options=characterViewOptions(key),legacy=current!=="선택하지 않음"&&!options.includes(current)?[current]:[];
    return `<label class="${key==="aggressionAction"?"view-aggression-action":""}"><span><b>${label}</b><small>${help}</small></span><select data-character-view data-source="${sourceId}" data-target="${targetId}" data-view-field="${key}">${[...legacy,...options].map(value=>`<option ${value===current?"selected":""}>${value}</option>`).join("")}</select>${key==="aggressionAction"?`<small class="field-warning">‘상대를 때릴 수 있음’ 이상을 고르면 설정한 충동·갈등·성격에 따라 낮은 수위의 폭행 장면이 나올 수 있어요. 충동만 있고 실행하지 않는 캐릭터는 반드시 ‘행동으로 옮기지 않음’을 골라 주세요.</small>`:""}</label>`;
  };
  const panels=state.order.map(sourceId=>{
    const source=state.characters[sourceId],targets=state.order.filter(id=>id!==sourceId);
    return `<div class="character-view-panel character-view-dex" data-view-panel="${sourceId}" ${sourceId===first?"":"hidden"}>${targets.map(targetId=>{const target=state.characters[targetId],overall=characterViewFor(sourceId,targetId).overall,official=Object.values(state.relationships||{}).filter(relation=>(relation.a===sourceId&&relation.b===targetId)||(relation.a===targetId&&relation.b===sourceId)),officialText=[...new Set(official.map(relation=>relation.legalStatus==="관계를 따로 명명하지 않음"?`유사 ${relation.type}`:relation.type))].join(" · ");const fields=`${field(sourceId,targetId,"overall","전체적인 감정","공식 관계와 별개인 이 캐릭터만의 속마음")}${field(sourceId,targetId,"importance","중요도","이 캐릭터의 삶에서 상대가 몇 번째로 중요한 사람인지 정해요.")}${field(sourceId,targetId,"awareness","감정 자각","자기 마음을 우정·경쟁심·불편함으로 잘못 해석할 수도 있어요.")}${field(sourceId,targetId,"mutualAwareness","상대의 마음을 아는 정도","상대의 감정이 호감인지 반감인지 단정하지 않고, 얼마나 파악하고 있는지만 정해요.")}${field(sourceId,targetId,"trust","신뢰","좋아하더라도 믿지 않을 수 있어요")}${field(sourceId,targetId,"closeness","정서적 친밀감","상대를 자기 삶의 얼마나 안쪽 사람으로 느끼는지예요. 실제 교제 여부나 연락 빈도와는 별개예요.")}${field(sourceId,targetId,"comfort","함께 있을 때의 편안함과 대화 호흡","공간을 함께 쓸 때의 편안함과 둘 사이의 말·농담 호흡을 하나의 조합으로 정해요.")}${field(sourceId,targetId,"annoyance","성가심","좋아하고 사랑하면서도 많이 귀찮아할 수 있어요.")}${field(sourceId,targetId,"attention","챙기고 신경 쓰는 정도","상태와 일정을 얼마나 살필지")}${field(sourceId,targetId,"jealousy","질투·독점욕","사랑과 별개예요. 깊이 사랑해도 자유롭게 두거나, 친구에게 강한 독점욕을 느낄 수 있어요.")}${field(sourceId,targetId,"conflictIntensity","갈등 강도","사랑이나 가족애와 별개로 실제로 얼마나 자주, 격렬하게 충돌하는지")}${field(sourceId,targetId,"expectation","관계에 대한 기대","지금 사랑하더라도 곧 끝날 관계라고 예상할 수 있어요.")}${field(sourceId,targetId,"touchIntensity","허용하고 표현하는 스킨십 범위","이 캐릭터가 이 상대에게 편안하게 허용하거나 먼저 표현할 수 있는 최대 범위예요. 두 캐릭터의 범위가 다르면 더 낮은 쪽까지 장면에 반영돼요.")}${field(sourceId,targetId,"aggression","공격·위해 충동","머릿속에 어떤 충동이 드는지를 정합니다. 이것만으로 실제 공격하지 않아요.")}${field(sourceId,targetId,"aggressionAction","충동을 실제로 표현하는 단계","충동이 들었을 때 실제 행동을 어디까지 할 수 있는지 정합니다. 충동 단계보다 센 행동은 절대 나오지 않아요.")}`;const targetPrimary=target.theme?.primary||"#176b60";return `<article class="character-view-card character-view-token" style="--target-theme:${esc(targetPrimary)}"><button type="button" class="character-view-open" data-open-view-dialog="${sourceId}:${targetId}" aria-label="${esc(target.name)}의 시선 설정 열기" title="${esc(target.name)} · ${esc(overall)}${officialText?` · ${esc(officialText)}`:""}">${avatar(target)}<span class="character-view-token-summary" data-view-summary="${sourceId}:${targetId}">${esc(overall)}</span></button><dialog class="character-view-dialog" data-view-dialog="${sourceId}:${targetId}"><form method="dialog"><div class="title character-view-dialog-title"><div class="character-view-dialog-direction">${avatar(source)}<i>→</i>${avatar(target)}<span><h2>${esc(source.name)} → ${esc(target.name)}</h2><small>${esc(source.name)}이(가) ${esc(target.name)}에게 느끼는 감정과 행동 기준</small></span></div><button value="close" aria-label="닫기">×</button></div><div class="character-view-dialog-context"><b>${officialText?`공식 관계 · ${esc(officialText)}`:"공식 관계 없음 · 이방인"}</b><span>${esc(overall)}</span></div><div class="character-view-fields">${fields}</div><div class="crop-actions"><button class="primary" value="close">편집 완료</button></div></form></dialog></article>`}).join("")}</div>`;
  }).join("");
  const sourceTabs=state.order.map(id=>{const character=state.characters[id],primary=character.theme?.primary||"#176b60",secondary=character.theme?.gradient?(character.theme?.secondary||primary):primary;return `<button type="button" data-view-source="${id}" class="${id===first?"on":""}" style="--view-primary:${esc(primary)};--view-secondary:${esc(secondary)}" aria-label="${esc(character.name)}의 시선 보기" title="${esc(character.name)}">${avatar(character)}</button>`}).join("");
  return `<section class="character-view-editor"><div class="title"><div><h2>관계와 캐릭터별 시선</h2><p><b>위에서 바라보는 캐릭터</b>를 고른 뒤, 아래에서 상대 아이콘을 누르세요. 공식 관계와 별개인 감정·자각·신뢰·경계는 방향마다 따로 저장돼요.</p></div><button data-add-rel>+ 공식 관계 설정</button></div><div class="character-view-source-tabs" aria-label="바라보는 캐릭터 선택">${sourceTabs}</div>${panels}</section>`;
};
const relationPairKey=(a,b)=>[a,b].sort().join("~");
function siblingWord(relation){
  const ids=relation.groupMembers?.length?relation.groupMembers:[relation.a,relation.b];
  const genders=[...new Set(ids.map(id=>state.characters[id]?.gender).filter(Boolean))];
  const base=genders.length===1&&genders[0]==="남성"?"형제":genders.length===1&&genders[0]==="여성"?"자매":genders.every(value=>["남성","여성"].includes(value))?"남매":"형제·자매";
  const pairs=ids.flatMap((a,index)=>ids.slice(index+1).map(b=>relation.siblingKinshipByPair?.[relationPairKey(a,b)]||"full"));
  return pairs.length&&pairs.every(value=>value==="nonblood")?`의${base}`:base;
}
function currentOfficialLabel(relation){
  const base=relation.type==="형제·자매"?siblingWord(relation):relation.type;
  if(relation.temporalStatus==="past"){
    const past={연인:"헤어진 연인",부부:"이혼한 부부",친구:"절연한 친구","소꿉친구":"멀어진 소꿉친구","학창 시절 친구들":"멀어진 학창 시절 친구","직장 동료":"전 직장 동료",동거인:"옛 동거인","부모·자녀":"절연한 부모·자녀","형제·자매":`절연한 ${base}`,라이벌:"과거의 라이벌",혐관:"과거의 악연"};
    return past[relation.type]||`과거의 ${base}`;
  }
  return relation.legalStatus==="관계를 따로 명명하지 않음"?`유사 ${base}`:base;
}
function relationshipReality(a,b,official=[]){
  const av=characterViewFor(a,b),bv=characterViewFor(b,a);
  const love=value=>/연애 감정|깊이 사랑|없어서는|사랑함/.test(value?.overall||"");
  const hate=value=>/싫|혐오|증오|원수/.test(value?.overall||"");
  const distant=value=>/낯선|거리|가깝지|가장 바깥/.test(value?.closeness||"")||/매우 불편|숨막|대화도.*통하지/.test(value?.comfort||"");
  const close=value=>/가장 가까운|가까운 사이|친한 사이/.test(value?.closeness||"");
  const distrust=value=>/믿지|의심|경계/.test(value?.trust||"");
  const confirmed=value=>/서로의 마음을 확인/.test(value?.mutualAwareness||"");
  const conflict=value=>/자주 충돌|격렬|파국/.test(value?.conflictIntensity||"");
  const guarded=value=>distrust(value)||distant(value)||hate(value)||/경계|탐탁지|꺼림/.test(`${value?.overall||""} ${value?.comfort||""} ${value?.annoyance||""}`);
  const past=official.some(relation=>relation.temporalStatus==="past");
  const sibling=official.some(relation=>relation.type==="형제·자매");
  if(sibling&&(distant(av)||distant(bv)||hate(av)||hate(bv)))return past?"절연한 형제 사이":"가족이지만 사실상 절연";
  if(love(av)&&love(bv)&&confirmed(av)&&confirmed(bv))return distant(av)||distant(bv)?"서로 사랑하지만 가까워지기 어려운 사이":"서로 마음을 확인한 사이";
  if(love(av)&&love(bv)){
    const denied=value=>/인정하지|오해하고|눈치챔|전혀 모름/.test(value?.mutualAwareness||"")||/부정|잘못 해석/.test(value?.awareness||"");
    if(denied(av)&&denied(bv))return"쌍방 연심이지만 인정하지 않음";
    if(hate(av)&&hate(bv))return"서로 반감을 품고도 끌리는 사이";
    return distrust(av)||distrust(bv)?"쌍방 연심과 불신이 함께 있는 사이":"쌍방 짝사랑";
  }
  if(love(av)!==love(bv))return"한쪽만 품고 있는 연심";
  if(hate(av)&&hate(bv))return conflict(av)||conflict(bv)?"서로 강하게 맞서는 사이":"서로 반감을 품은 사이";
  if(guarded(av)&&guarded(bv))return conflict(av)||conflict(bv)?"서로 경계하며 충돌하는 사이":"서로 믿지 않고 거리를 두는 사이";
  if(distrust(av)&&distrust(bv))return"서로 믿지 못하는 사이";
  if(guarded(av)!==guarded(bv))return"한쪽은 가까워지고 한쪽은 경계하는 사이";
  if(close(av)&&close(bv))return"서로 의지하는 사이";
  if(distant(av)&&distant(bv))return past?"이름만 남은 관계":"서로 거리를 두는 사이";
  if(close(av)!==close(bv))return"한쪽만 관계를 붙잡는 중";
  if(official.some(relation=>["연인","부부"].includes(relation.type)))return"서로 연애감정을 나누는 사이";
  if(official.some(relation=>["친구","소꿉친구","학창 시절 친구들","친구 모임"].includes(relation.type)))return"편안한 친구 사이";
  if(official.some(relation=>relation.type==="동거인"))return"생활을 함께 나누는 사이";
  return official.length?"관계에 맞춰 지내는 사이":"서로를 알아가는 중";
}
function relationshipMap(relations){
  const characters=state.order.map(id=>state.characters[id]).filter(Boolean);
  if(characters.length<2)return"";
  const positions=new Map(characters.map((character,index)=>{
    const angle=(Math.PI*2*index/characters.length)-Math.PI/2;
    return [character.id,{x:500+400*Math.cos(angle),y:500+400*Math.sin(angle)}];
  }));
  const emotionColor=value=>{
    const text=String(value||"");
    if(/사랑|좋아|소중|애틋|연애 감정|연심|끌림|싹틈/.test(text))return"#d85078";
    if(/싫|혐오|원수|증오/.test(text))return"#a83f3f";
    if(/경계|의심|불편|귀찮/.test(text))return"#c27a2c";
    if(/두려|무서|겁/.test(text))return"#7b5bb5";
    if(/신뢰|편안|친근|가까/.test(text))return"#438b72";
    if(/존경|동경/.test(text))return"#4f77b8";
    return"#7d756d";
  };
  const edges=[];
  for(let i=0;i<characters.length;i++)for(let j=i+1;j<characters.length;j++){
    const a=characters[i].id,b=characters[j].id;
    const official=relations.filter(relation=>(relation.a===a&&relation.b===b)||(relation.a===b&&relation.b===a));
    const hasExplicit=Object.keys(state.characterViews?.[a]?.[b]||{}).length>0||Object.keys(state.characterViews?.[b]?.[a]||{}).length>0;
    if(official.length||hasExplicit)edges.push({a,b,official});
  }
  if(!edges.length)return"";
  const viewLabel=(source,target)=>characterViewFor(source,target).overall;
  const occupiedLabels=[];
  const placeLabel=(x,y,nx,ny)=>{
    let point={x,y};
    for(let attempt=0;attempt<8;attempt++){
      const hitsLabel=occupiedLabels.some(other=>Math.abs(other.x-point.x)<105&&Math.abs(other.y-point.y)<30);
      const hitsNode=[...positions.values()].some(node=>Math.hypot(node.x-point.x,node.y-point.y)<82);
      if(!hitsLabel&&!hitsNode)break;
      const direction=attempt%2===0?1:-1,distance=(Math.floor(attempt/2)+1)*34;
      point={x:Math.max(70,Math.min(930,x+nx*distance*direction)),y:Math.max(70,Math.min(930,y+ny*distance*direction))};
    }
    occupiedLabels.push(point);
    return point;
  };
  const lines=edges.map((edge,index)=>{
    const a=positions.get(edge.a),b=positions.get(edge.b);
    const forwardLabel=viewLabel(edge.a,edge.b),backwardLabel=viewLabel(edge.b,edge.a);
    const forwardColor=emotionColor(forwardLabel),backwardColor=emotionColor(backwardLabel);
    const dx=b.x-a.x,dy=b.y-a.y,length=Math.max(1,Math.hypot(dx,dy)),unitX=dx/length,unitY=dy/length,normalX=-unitY,normalY=unitX,nodeRadius=64,lane=12;
    const startA={x:a.x+unitX*nodeRadius+normalX*lane,y:a.y+unitY*nodeRadius+normalY*lane},endB={x:b.x-unitX*nodeRadius+normalX*lane,y:b.y-unitY*nodeRadius+normalY*lane};
    const startB={x:b.x-unitX*nodeRadius-normalX*lane,y:b.y-unitY*nodeRadius-normalY*lane},endA={x:a.x+unitX*nodeRadius-normalX*lane,y:a.y+unitY*nodeRadius-normalY*lane};
    const arrowLength=11,arrowHalfWidth=5;
    const forwardBase={x:endB.x-unitX*arrowLength,y:endB.y-unitY*arrowLength},backwardBase={x:endA.x+unitX*arrowLength,y:endA.y+unitY*arrowLength};
    const midX=(a.x+b.x)/2,midY=(a.y+b.y)/2,forward=`M ${startA.x} ${startA.y} Q ${midX+normalX*lane} ${midY+normalY*lane} ${forwardBase.x} ${forwardBase.y}`,backward=`M ${startB.x} ${startB.y} Q ${midX-normalX*lane} ${midY-normalY*lane} ${backwardBase.x} ${backwardBase.y}`;
    const forwardArrow=`${endB.x},${endB.y} ${forwardBase.x+normalX*arrowHalfWidth},${forwardBase.y+normalY*arrowHalfWidth} ${forwardBase.x-normalX*arrowHalfWidth},${forwardBase.y-normalY*arrowHalfWidth}`;
    const backwardArrow=`${endA.x},${endA.y} ${backwardBase.x+normalX*arrowHalfWidth},${backwardBase.y+normalY*arrowHalfWidth} ${backwardBase.x-normalX*arrowHalfWidth},${backwardBase.y-normalY*arrowHalfWidth}`;
    const relationText=edge.official.length?[...new Set(edge.official.map(currentOfficialLabel))].join(" · "):"이방인";
    const stageText=relationshipReality(edge.a,edge.b,edge.official);
    const officialPoint=placeLabel(midX,midY,normalX,normalY);
    const boxWidth=Math.min(220,Math.max(100,(Math.max(relationText.length,stageText.length)*13)+24));
    const officialMarkup=`<g class="map-official"><rect x="${officialPoint.x-boxWidth/2}" y="${officialPoint.y-24}" width="${boxWidth}" height="48" rx="12"/><text class="map-relation" x="${officialPoint.x}" y="${officialPoint.y-5}" text-anchor="middle">${esc(relationText||"이방인")}</text><text class="map-stage" x="${officialPoint.x}" y="${officialPoint.y+14}" text-anchor="middle">${esc(stageText)}</text></g>`;
    return `<g class="relationship-edge"><path d="${forward}" fill="none" stroke="${forwardColor}" stroke-width="3.5" stroke-linecap="round"/><polygon points="${forwardArrow}" fill="${forwardColor}"/><path d="${backward}" fill="none" stroke="${backwardColor}" stroke-width="3.5" stroke-linecap="round"/><polygon points="${backwardArrow}" fill="${backwardColor}"/>${officialMarkup}</g>`;
  }).join("");
  const nodes=characters.map(character=>{const pos=positions.get(character.id);return `<foreignObject x="${pos.x-55}" y="${pos.y-55}" width="110" height="110"><div xmlns="http://www.w3.org/1999/xhtml" class="relationship-map-node">${avatar(character)}<b>${esc(character.name)}</b></div></foreignObject>`}).join("");
  return `<section class="relationship-map"><div class="title"><div><h2>인물 관계도</h2><small>화살표 색은 각 캐릭터가 상대를 보는 감정 방향을 나타내고, 글자는 공식 관계와 계산된 관계 상태만 표시해요.</small></div></div><div class="relationship-map-canvas"><svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet">${lines}${nodes}</svg></div></section>`;
}
function relationship(){
  const all=Object.values(state.relationships),shownGroups=new Set();
  const displayType=currentOfficialLabel;
  const cards=all.map(r=>{
    if(r.groupId){
      if(shownGroups.has(r.groupId))return"";shownGroups.add(r.groupId);
      const group=all.filter(x=>x.groupId===r.groupId),members=[...new Set(group.flatMap(x=>[x.a,x.b]))].map(id=>state.characters[id]).filter(Boolean);
      const direction=r.type==="짝사랑"?`${[...new Set(group.map(x=>state.characters[x.admirerId||x.a]?.name).filter(Boolean))].map(esc).join(" · ")} → ${[...new Set(group.map(x=>state.characters[x.targetId||x.b]?.name).filter(Boolean))].map(esc).join(" · ")}`:r.type==="부모·자녀"?`${[...new Set(group.map(x=>`${state.characters[x.parentId||x.a]?.name||"부모"}(${x.parentRole||"부모"})`))].map(esc).join(" · ")} → ${[...new Set(group.map(x=>state.characters[x.childId||x.b]?.name).filter(Boolean))].map(esc).join(" · ")}`:members.map(member=>esc(member.name)).join(" · ");
      return `<article class="relation group-relation"><div class="relation-avatars">${members.map(member=>avatar(member)).join("")}</div><h2>${direction}</h2><p>${esc(displayType(r))} · ${members.length}명이 함께 맺은 관계</p><p class="relation-stage">${r.temporalStatus==="past"?"과거 관계 · ":""}${esc(r.stage||"편안한 사이")}</p>${r.temporalStatus==="past"&&r.faultReason&&r.faultReason!=="정하지 않음"?`<p class="relation-fault">관계가 끝난 이유 · ${esc(r.faultReason)}</p>`:""}${relationActivities(r)}<div class="relation-actions"><button data-edit-rel="${r.id}">구성원·관계 편집</button><button class="danger" data-delete-group="${r.groupId}">그룹 관계 삭제</button></div></article>`;
    }
    const orderedIds=!r.directional&&Array.isArray(r.displayOrder)&&r.displayOrder.length===2?r.displayOrder:[r.a,r.b];
    const a=state.characters[orderedIds[0]],b=state.characters[orderedIds[1]];
    const heading=r.type==="부모·자녀"?`${esc(state.characters[r.parentId||r.a]?.name||a?.name||"부모")}(${esc(r.parentRole||"부모")}) → ${esc(state.characters[r.childId||r.b]?.name||b?.name||"자녀")}`:`${esc(a?.name||"")} ${r.type==="짝사랑"?"→":"×"} ${esc(b?.name||"")}`;
    return a&&b?`<article class="relation"><div class="relation-avatars">${avatar(a)}${avatar(b)}</div><h2>${heading}</h2><p>${esc(displayType(r))} · ${r.cohabit?"함께 거주":"따로 거주"}</p><p class="relation-stage">${r.temporalStatus==="past"?"과거 관계 · ":""}${esc(r.stage||"편안한 사이")}</p><p class="relation-reality">관계 실체 · ${esc(relationshipReality(r.a,r.b,[r]))}</p>${r.temporalStatus==="past"&&r.faultReason&&r.faultReason!=="정하지 않음"?`<p class="relation-fault">관계가 끝난 이유 · ${esc(r.faultReason)}</p>`:""}${relationActivities(r)}<div class="relation-actions"><button data-edit-rel="${r.id}">편집</button><button class="danger" data-delete-rel="${r.id}">삭제</button></div></article>`:"";
  }).join("");
  return `<section class="panel form"><div class="title"><h1>관계</h1></div><p>공식 관계와 각 캐릭터의 서로 다른 속마음을 한 화면에서 설정해요. 설정한 시선은 생활 장면의 말투, 접근 방식, 접촉과 갈등에 반영돼요.</p>${characterViewEditor()}${relationshipMap(all)}<h2 class="official-relation-heading">공식 관계 목록</h2><div class="relationship-card-grid">${cards||'<div class="empty-mini"><b>아직 설정한 공식 관계가 없어요.</b><p>공식 관계가 없는 캐릭터끼리는 서로 낯선 사람으로 행동해요.</p></div>'}</div></section>`;
}
function routine(){
  const c=active(),days=["일","월","화","수","목","금","토"],items=(state.routines[c.id]||[]).slice().sort((a,b)=>a.day-b.day||a.start.localeCompare(b.start));
  const places=state.towns.flatMap(t=>(t.id===state.activeTownId?state.world.places:t.places).map(p=>({...p,townName:t.name})));
  const toolbar=`<div class="routine-toolbar">${state.order.map(id=>`<button data-routine-character="${id}" class="${id===c.id?"on":""}">${avatar(state.characters[id])}${esc(state.characters[id].name)}</button>`).join("")}</div>`;
  const table=`<div class="weekly-scroll"><div class="weekly-table">${days.map((day,index)=>`<section class="routine-day"><h3>${day}요일</h3>${items.filter(item=>item.day===index).map(item=>`<article class="routine-block"><b>${esc(item.start)}–${esc(item.end)}</b><strong>${esc(item.title)}</strong><small>${esc(item.type)}${item.placeId?` · ${esc(places.find(p=>p.id===item.placeId)?.name||"장소")}`:""}${item.withIds?.length?` · ${item.withIds.map(id=>esc(state.characters[id]?.name||"")).filter(Boolean).join(", ")}와 함께`:""}</small><div class="routine-actions"><button data-edit-routine="${item.id}">편집</button><button class="danger" data-delete-routine="${item.id}">삭제</button></div></article>`).join("")||"<small>일정 없음</small>"}</section>`).join("")}</div></div>`;
  return `<section class="panel form routine-shell"><div class="title"><div><h1>주간 루틴</h1><p>회사 일정, 수업, 데이트, 약속과 개인 일정을 시간표로 지정할 수 있어요.</p></div><button class="primary" data-add-routine>+ 일정 추가</button></div>${toolbar}${table}</section>`;
}
function town(){const items=catalogItems(),audiences=["아재 입맛","어린이 입맛","가족","연인·데이트","학생","고소득","오타쿠"];return `<div class="town-tabs">${state.towns.map(t=>`<button data-town-select="${t.id}" class="${t.id===state.activeTownId?"on":""}">🏙️ ${esc(t.name)}</button>`).join("")}<button data-add-town>+ 마을 추가</button>${state.towns.length>1?`<button class="danger" data-delete-town="${state.activeTownId}">현재 마을 삭제</button>`:""}</div><div class="town-edit"><div class="world"><img src="${state.world.bg}" class="world-bg">${state.world.places.map(placeCard).join("")}</div><aside class="panel form"><div class="title"><h2>마을 편집</h2><button class="primary" data-town-save>마을 저장</button></div><section class="inline-guide"><b>마을을 만드는 순서</b><ol><li>마을 이름과 배경을 고르세요.</li><li>건물을 추가하고 유형을 고르세요.</li><li>‘건물 모양 선택’에서 추천 그림을 적용하세요.</li><li>지도 위 건물을 직접 끌어 위치를 정하세요.</li></ol></section><label>마을 이름<input data-world-name value="${esc(state.world.name)}"></label><label>마을 시대<select data-world-era><option value="modern" ${state.world.era!=="medieval"?"selected":""}>현대</option><option value="medieval" ${state.world.era==="medieval"?"selected":""}>중세</option></select><small>중세를 고르면 현대적인 표현만 시대에 맞게 바뀌고, 요리·청소·산책 같은 행동은 그대로 이어져요.</small></label><label>기본 배경<select data-world-bg><option value="world-assets/cozy-town.png" ${state.world.bg.includes("cozy")?"selected":""}>마을</option><option value="world-assets/downtown.png" ${state.world.bg.includes("downtown")?"selected":""}>도시</option><option value=world-assets/department-store-premium.png>구매 배경 · 백화점 아트리움</option></select></label><p>건물은 PC와 모바일 모두 이 화면에서 끌어 옮길 수 있어요.</p><button data-add-place>+ 건물 추가</button><div class="place-editor">${state.world.places.map(p=>`<details><summary><b>${esc(p.emoji)} ${esc(p.name)}</b></summary><div class="place-edit-heading"><span><b>${esc(p.name)} 편집</b><small>유형을 먼저 고르면 어울리는 건물 모양을 추천해요.</small></span><button class="danger" data-delete-place="${p.id}">이 건물 삭제</button></div><div class="place-config"><label>건물 이름<input data-place-field="name" data-place-id="${p.id}" value="${esc(p.name)}"></label><label>건물 유형<select data-place-field="type" data-place-id="${p.id}">${placeTypeOptions(p)}</select></label><label>세부 유형<select data-place-field="subtype" data-place-id="${p.id}">${placeSubtypeOptions(p)}</select></label><label>가격대<select data-place-field="priceRange" data-place-id="${p.id}">${["저렴","보통","고급","명품"].map(x=>`<option ${p.priceRange===x?"selected":""}>${x}</option>`).join("")}</select></label><label>마을 속 건물 크기<input type="range" min=".45" max="1.5" step=".05" data-place-field="imageScale" data-place-id="${p.id}" value="${p.imageScale||1}"></label><label>매운맛 정도<select data-place-field="spicy" data-place-id="${p.id}">${levelOptions(SPICE_LEVELS,p.spicy||0)}</select></label><label>단맛 정도<select data-place-field="sweet" data-place-id="${p.id}">${levelOptions(SWEET_LEVELS,p.sweet||0)}</select></label></div><div class="place-photo-tools"><b>지도에 표시할 건물 모양</b><span><button data-building-shape-open="${p.id}">건물 모양 선택</button></span><b>생활 로그·현재 장면용 내부 사진</b><span><button data-place-interior-image="${p.id}">내부 사진 업로드</button><button data-image-url="placeInterior" data-id="${p.id}">링크</button>${p.interiorImage?`<button data-clear-place-interior-image="${p.id}">지우기</button>`:""}</span></div><h4>주요 이용층</h4><div class="stock-picker">${audiences.map(x=>`<button data-place-audience="${p.id}" data-value="${x}" class="${(p.audiences||[]).includes(x)?"on":""}">${x}</button>`).join("")}</div><h4>이곳에서 파는 것·이용할 수 있는 것</h4><div class="stock-list stock-picker">${items.map(item=>`<button data-place-stock="${p.id}" data-item-id="${item.id}" class="${(p.stock||[]).includes(item.id)?"on":""}">${CATALOG_LABELS[item.kind]} · ${esc(item.name)}</button>`).join("")}</div></details>`).join("")}</div></aside></div>`}
function dlc(){return `<article class="dlc-product"><div class="dlc-product-art">🏰</div><div><small>시대 스크립트 팩</small><h2>중세의 하루</h2><p>촛불을 켜고 장부를 쓰고, 시장과 여관을 오가는 하루를 담았어요.</p><div class="dlc-buy-row"><b>1,850원</b><a class="primary dlc-buy" href="./payment.html?product=medieval">토스로 구매하기</a></div></div></article>`;}
function fontSettings(){
  const options=[["system","기기 기본 글꼴 · 가장 익숙하고 선명함"],["noto","Noto Sans KR · 단정한 고딕"],["kopub","KoPub 돋움 · 출판물처럼 또렷함"],["cafe24slim","Cafe24 PRO SLIM · 날렵한 고딕"],["changwonround","창원단감둥근체 · 부드럽고 편안함"],["konkon","온글잎 콘콘체 · 동글동글한 손글씨"],["gowun","고운돋움 · 부드러운 고딕"],["myeongjo","나눔명조 · 책처럼 차분함"],["dohyeon","배민 도현체 · 기존 디자인"]];
  return `<section class="setting-card font-setting-card"><h2>화면 글꼴</h2><p>본문, 버튼과 생활 로그에 적용됩니다. 읽기 편한 글꼴을 골라 보세요.</p><label>사용할 글꼴<select data-setting="uiFont">${options.map(([value,label])=>`<option value="${value}" ${state.uiFont===value?"selected":""}>${label}</option>`).join("")}</select></label><div class="font-preview"><b>서랍마을의 오늘</b><span>캐릭터들이 각자의 하루를 보내고 있어요. 긴 생활 로그도 편안하게 읽어 보세요.</span></div></section>`;
}
function settings(){return `<section class="panel form"><h1>설정</h1>${fontSettings()}<section class="setting-card"><h2>마을 지도 표시</h2><label>건물 표기 방식<select data-setting="buildingLabelMode"><option value="full" ${state.buildingLabelMode==="full"?"selected":""}>이름과 건물 유형 표시</option><option value="name" ${state.buildingLabelMode==="name"?"selected":""}>이름만 표시</option><option value="none" ${state.buildingLabelMode==="none"?"selected":""}>아무 글자도 표시하지 않기</option></select></label><label>지도 위 캐릭터 표기<select data-setting="mapCharacterLabelMode"><option value="none" ${state.mapCharacterLabelMode==="none"?"selected":""}>캐릭터 아이콘만 표시</option><option value="name" ${state.mapCharacterLabelMode==="name"?"selected":""}>아이콘 아래 이름 표시</option></select></label><small>같은 건물에 있는 캐릭터는 지도에서 한 묶음으로 표시됩니다.</small></section><section class="sync-panel"><h2>Google 계정과 데이터</h2><p id="account-status">${esc(accountText)}</p><div class="sync-actions"><button class="primary" data-auth>Google 로그인 / 로그아웃</button><button data-sync-upload>동기화</button><button data-sync-download>불러오기</button></div><small>동기화와 불러오기는 필요할 때만 설정에서 사용해요.</small></section><section class="setting-card"><h2>브라우저 백업 파일</h2><p>Firebase가 막혀도 현재 데이터와 사진을 파일 하나로 보관할 수 있어요.</p><div class="sync-actions"><button data-export-file>백업 파일 내보내기</button><button data-import-file>백업 파일 불러오기</button></div></section><section class="setting-card feedback-card"><h2>개발자에게 피드백 보내기</h2><p>사이트 안에서 작성해 보내면 개발자 이메일로 전달돼요.</p><form data-feedback-form><fieldset><legend>어떤 내용인가요?</legend><div class="feedback-category-grid">${["기능 제안","오류 신고","좋았던 점","생활 장면 제안","기타"].map((value,index)=>`<label><input type="radio" name="category" value="${value}" ${index===0?"checked":""}><span>${value}</span></label>`).join("")}</div></fieldset><label>내용<textarea name="message" maxlength="3000" rows="7" required placeholder="어떤 화면에서 무엇이 좋았거나 불편했는지 적어 주세요."></textarea></label><button class="primary" type="submit">피드백 보내기</button><small class="feedback-status" aria-live="polite"></small></form></section><section class="setting-card"><h2>페이지 안내</h2><p>각 페이지를 처음 열었을 때 나오는 안내를 다시 볼 수 있어요.</p><button data-guide-reset>모든 페이지 안내 다시 보기</button></section><button data-reset>모든 데이터 초기화</button></section>`}
function view(){
  if(!state.order.length)return `<section class="panel empty"><h1>첫 캐릭터를 만들어 주세요</h1><p>로그인 전에는 예시 캐릭터나 실제 지역이 표시되지 않아요.</p><button class="primary" data-new>+ 캐릭터 만들기</button></section>`;
  return ({observe,home,character,catalog,relationship,routine,town,shop,settings}[state.activeTab]||observe)();
}
export function renderApp(next){
  if((!next.activeId||!next.characters[next.activeId])&&next.order.length)next.activeId=next.order[0];
  let content;
  try{content=view()}
  catch(error){
    console.error(`화면 일부 렌더링 실패 · ${state.activeTab}`,error);
    content=`<section class="panel empty view-error"><h1>이 화면의 일부 데이터를 읽지 못했어요</h1><p>저장 데이터는 지우거나 바꾸지 않았습니다. 다른 화면은 계속 사용할 수 있어요.</p><div class="sync-actions"><button class="primary" data-tab="observe">관찰 화면으로 이동</button><button data-tab="settings">설정 열기</button></div></section>`;
  }
  const appRoot=document.querySelector("#app");
  appRoot.innerHTML=`${header()}<main>${content}</main>`;
  normalizeDisplayedParticles(appRoot);
  const backgroundSelect=document.querySelector("[data-world-bg]");
  if(backgroundSelect){
    [...backgroundSelect.options].forEach(option=>{
      if(option.value.includes("cozy-town"))option.textContent="마을";
      else if(option.value.includes("downtown"))option.textContent="도시";
      else if(option.value.includes("department-store"))option.textContent="백화점 아트리움";
    });
  }
}
export function setAccountLabel(text){accountText=text;const el=document.querySelector("#account-status");if(el)el.textContent=text}
export function setAccountEntitlements(value){accountEntitlements={backgroundPacks:Array.isArray(value?.backgroundPacks)?value.backgroundPacks:[],iconPacks:Array.isArray(value?.iconPacks)?value.iconPacks:[],dlcPacks:Array.isArray(value?.dlcPacks)?value.dlcPacks:[],purchases:Array.isArray(value?.purchases)?value.purchases:[],characterSlotPacks:Math.max(0,Number(value?.characterSlotPacks)||0),townSlotPacks:Math.max(0,Number(value?.townSlotPacks)||0),storage50:Boolean(value?.storage50),teaSupportMonth:String(value?.teaSupportMonth||"")}}

const CART_KEY="drawer-village-cart";
const SHOP_PRODUCTS={
  character_slots_5:{label:"캐릭터 슬롯",title:"캐릭터 5명 추가",description:"구매할 때마다 캐릭터 슬롯 5개가 계정에 영구 추가됩니다.",price:1200},
  town_slot_1:{label:"마을 슬롯",title:"마을 1개 추가",description:"구매할 때마다 새로운 마을 슬롯 1개가 계정에 영구 추가됩니다.",price:1900},
  green_tea:{label:"개발 응원",title:"개발자에게 녹차 사주기 🍵",description:"원하는 만큼 장바구니에 담아 개발자를 응원할 수 있어요. 녹차 한 잔마다 1,500원이에요.",price:1500},
  storage_pack:{label:"사진 저장 공간",title:"(책정 중)MB 추가",description:"구매할 때마다 사진 저장 공간이 추가되는 상품이에요. 추가 용량과 가격을 확정한 뒤 판매를 시작합니다.",price:null,disabled:true}
};
const readCart=()=>{try{const value=JSON.parse(localStorage.getItem(CART_KEY)||"{}");return value&&typeof value==="object"?value:{}}catch{return {}}};
function shop(){
  const cart=readCart();
  const product=(id,item,ownedCount=0)=>`<article class="premium-product one-time-product" data-product-id="${id}"><div class="premium-product-heading"><span>${id==="green_tea"?"응원":"평생 소장"}</span><div><small>${item.label}</small><h2>${item.title}</h2></div><b>${item.price==null?"책정 중":`${item.price.toLocaleString("ko-KR")}원`}</b></div><p>${item.description}</p>${ownedCount?`<div class="premium-current"><b>${ownedCount}회 구매 · 현재 적용 중</b><small>구매 수량만큼 계정에 계속 더해집니다.</small></div>`:""}${previewMode()?`<button class="premium-buy" disabled>사전 체험 중 구매 불가</button>`:item.disabled?`<button class="premium-buy" disabled>용량·가격 확정 후 구매 가능</button>`:`<button class="primary premium-buy" data-cart-add="${id}">장바구니에 담기</button>`}</article>`;
  const lines=Object.entries(cart).filter(([id,qty])=>SHOP_PRODUCTS[id]&&!SHOP_PRODUCTS[id].disabled&&Number(qty)>0);
  const total=lines.reduce((sum,[id,qty])=>sum+SHOP_PRODUCTS[id].price*Number(qty),0);
  const cartHtml=lines.length?lines.map(([id,qty])=>{const item=SHOP_PRODUCTS[id],totalTitle=id==="character_slots_5"?`캐릭터 ${qty*5}명 추가`:id==="town_slot_1"?`마을 ${qty}개 추가`:id==="green_tea"?`녹차 ${qty}잔 사주기`:item.title;return `<article class="cart-line"><div><b>${totalTitle}</b><small>${item.title} · ${item.price.toLocaleString("ko-KR")}원 × ${qty}</small></div><div class="cart-quantity"><button data-cart-minus="${id}" aria-label="${item.title} 수량 줄이기">−</button><b>${qty}</b><button data-cart-plus="${id}" aria-label="${item.title} 수량 늘리기">+</button></div><b>${(item.price*qty).toLocaleString("ko-KR")}원</b><button class="cart-remove" data-cart-remove="${id}">빼기</button></article>`}).join(""):`<p class="cart-empty">아직 장바구니가 비어 있어요.</p>`;
  const count=lines.reduce((sum,[,qty])=>sum+Number(qty),0);
  return `<section class="panel form dlc-store shop-store"><div class="title"><div><h1>상점</h1><p>원하는 상품과 수량을 장바구니에 담아 한 번에 결제할 수 있어요. 모든 상품은 구독이 아닌 일회성 구매예요.</p></div></div>${previewMode()?`<section class="preview-notice"><b>${esc(previewConfig().label||"사전 체험")} 기간이에요</b><p>${esc(previewConfig().message||"현재 기능을 점검하고 있어 실제 결제는 진행되지 않아요.")}</p></section>`:""}<div class="shop-product-grid">${product("character_slots_5",SHOP_PRODUCTS.character_slots_5,Number(accountEntitlements.characterSlotPacks)||0)}${product("town_slot_1",SHOP_PRODUCTS.town_slot_1,Number(accountEntitlements.townSlotPacks)||0)}${product("green_tea",SHOP_PRODUCTS.green_tea,0)}${product("storage_pack",SHOP_PRODUCTS.storage_pack,0)}</div><section class="shop-cart"><div class="title"><div><h2>장바구니</h2><p>${previewMode()?"사전 체험이 끝난 뒤 이용할 수 있어요.":"같은 상품도 여러 개 담을 수 있어요."}</p></div><b>${count}개</b></div><div class="cart-lines">${cartHtml}</div><div class="cart-total"><span>총 결제금액</span><b>${total.toLocaleString("ko-KR")}원</b></div>${previewMode()?`<span class="premium-buy disabled" aria-disabled="true">사전 체험 중에는 결제하지 않아요</span>`:`<a class="primary premium-buy ${lines.length?"":"disabled"}" ${lines.length?'href="./payment.html?cart=1" aria-disabled="false"':'aria-disabled="true"'}>장바구니 결제하기</a>`}</section><section class="shop-coming"><h2>테마 DLC</h2><p>전용 건물·배경·생활 스크립트를 갖춘 콘텐츠를 준비하고 있어요.</p></section><div class="dlc-hidden" hidden>${dlc()}</div></section>`;
}
