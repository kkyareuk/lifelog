export const TOWN_TYPE_SUBTYPES={
  "생활 중심": ["골목 생활권","자급자족 공동체","가족 중심 생활권","직주근접 생활권","24시간 생활권"],
  "주거 중심": ["전원 주거지","계획 신도시","고급 주택가","서민 주거지","공동체 주거지","기숙사촌"],
  "상업 중심": ["전통시장","중심 상권","도매 상권","쇼핑 특구","야간 상권","업무 지구"],
  "행정 중심": ["도청·시청 소재지","관공서 지구","법원·공공기관 지구","지역 행정 거점","외교·국제 지구"],
  "산업 중심": ["제조업 단지","첨단 산업단지","수공업 마을","에너지 산업지","식품 가공단지","조선·기계 도시"],
  "학원·연구 중심": ["대학 도시","학교 밀집지","연구단지","과학 도시","예술 교육촌","유학·기숙 도시"],
  "의료·복지 중심": ["종합병원 도시","요양·회복 마을","의료 연구단지","복지 공동체","재활 특화지","생명과학 도시"],
  "관광 중심": ["역사 관광지","자연 관광지","테마 관광지","축제 도시","미식 관광지","쇼핑 관광지"],
  "휴양 중심": ["온천 마을","해변 휴양지","산림 휴양지","호수 휴양지","고원 피서지","웰니스 마을"],
  "교통·물류 중심": ["철도 환승도시","버스 교통 거점","항만 물류도시","공항 도시","운하 교통지","도로 분기점"],
  "농업 중심": ["곡창 지대","과수 마을","목축 마을","화훼 단지","스마트 농업지","포도·양조 마을"],
  "어업·항구 중심": ["어촌","무역항","여객항","수산시장 마을","조선항","섬 관문항"],
  "광업·자원 중심": ["광산 마을","채석 도시","유전·가스 도시","산림 자원지","보석 광산촌","염전 마을"],
  "군사·방위 중심": ["성곽 도시","주둔지","국경 마을","해군 항구","공군 기지 도시","피난 거점"],
  "종교·성지 중심": ["순례 도시","사원 마을","수도원촌","다종교 도시","신화·전승 성지","의례 중심지"],
  "문화·예술 중심": ["예술가 마을","공연 도시","문학 도시","공예 마을","영화·방송 도시","박물관 지구"],
  "생태·보전 중심": ["생태 마을","국립공원 관문","습지 보전지","산림 보호지","야생동물 보호지","저탄소 실험도시"],
  "혼합형": ["주거·상업 복합","산업·주거 복합","관광·생활 복합","대학·상업 복합","항구·관광 복합","다핵 도시"]
};

export const TOWN_TYPES=Object.keys(TOWN_TYPE_SUBTYPES);
export const TOWN_REPUTATIONS=[
  "알려지지 않음","조용하고 평화로움","살기 좋음","가족 친화적","교육 환경이 좋음","의료·복지가 좋음","일자리가 많음","창업이 활발함","상권이 유명함","음식으로 유명함","축제로 유명함","관광지로 유명함","예술과 문화로 유명함","역사가 깊음","자연 경관이 아름다움","교통이 편리함","부유한 동네","물가가 비쌈","밤문화가 활발함","주민들이 친절함","외지인을 환영함","폐쇄적인 곳","치안이 불안함","사건 사고가 잦음","환경 오염이 심함","쇠퇴 중인 곳","신비한 소문이 도는 곳"
];
export const TOWN_TERRAINS=["평야","구릉","산지","분지","고원","해안","섬","강가","호숫가","삼각주","숲","습지","사막","설원","화산 지대","협곡","동굴·지하"];
export const TOWN_TRANSPORTS=["도보길","자전거도로","일반 도로","시외버스","철도","지하철","노면전차","여객선","공항","케이블카"];

// Only owner-supplied artwork belongs in the selectable illustration catalog.
export const TOWN_ILLUSTRATIONS=[{id:"owner-forest",name:"숲과 연못 마을",pack:"base",src:"world-assets/owner-forest-town.webp",types:[],terrains:[]}];

const LEGACY_TOWN_TYPES={"생활 중심 마을":"생활 중심","주거 중심 마을":"주거 중심","상업 중심 마을":"상업 중심","관광 마을":"관광 중심","산업 도시":"산업 중심","학원 도시":"학원·연구 중심","휴양 마을":"휴양 중심"};
const LEGACY_TERRAINS={"평야·온대":"평야","해안·해양성":"해안","산지·서늘함":"산지","분지·온난함":"분지","사막·건조":"사막","설원·한랭":"설원","열대·다우":"습지"};

export function normalizeTownProfile(value={}){
  const townType=LEGACY_TOWN_TYPES[value.townType]||value.townType||"생활 중심";
  const safeType=TOWN_TYPES.includes(townType)?townType:"생활 중심";
  const subtypes=TOWN_TYPE_SUBTYPES[safeType];
  const terrain=LEGACY_TERRAINS[value.terrainClimate]||value.terrain||String(value.terrainClimate||"").split("·")[0]||"평야";
  const selected=TOWN_ILLUSTRATIONS.find(item=>item.pack==="base"&&(item.src===value.bg||item.id===value.illustrationId))||TOWN_ILLUSTRATIONS[0];
  const bg=selected?.src||"";
  return {
    townType:safeType,
    townSubtype:subtypes.includes(value.townSubtype)?value.townSubtype:subtypes[0],
    reputation:TOWN_REPUTATIONS.includes(value.reputation)?value.reputation:"알려지지 않음",
    terrain:TOWN_TERRAINS.includes(terrain)?terrain:"평야",
    transportModes:[...new Set((Array.isArray(value.transportModes)?value.transportModes:["일반 도로","시외버스"]).filter(item=>TOWN_TRANSPORTS.includes(item)))],
    travelAllowed:value.travelAllowed!==false,
    bg,
    illustrationId:selected?.id||""
  };
}

export function townIllustrationScore(item,town){
  const profile=normalizeTownProfile(town),sizeMatch=item.urbanization?.includes(town.urbanization||"소도시")?3:0;
  return (item.terrains?.includes(profile.terrain)?5:0)+(item.types?.includes(profile.townType)?4:0)+sizeMatch;
}

export function townIllustrationsFor(town){
  return TOWN_ILLUSTRATIONS.map(item=>({...item,score:townIllustrationScore(item,town)})).sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name,"ko"));
}

export function canTravelBetween(source,target,globalBlocked=false){
  if(!source||!target||source.id===target.id)return true;
  return !globalBlocked&&source.travelAllowed!==false&&target.travelAllowed!==false;
}

export function transportBetween(source,target){
  const first=normalizeTownProfile(source),second=normalizeTownProfile(target);
  const shared=TOWN_TRANSPORTS.filter(mode=>first.transportModes.includes(mode)&&second.transportModes.includes(mode));
  const priority=["공항","철도","여객선","시외버스","일반 도로","지하철","노면전차","케이블카","자전거도로","도보길"];
  return priority.find(mode=>shared.includes(mode))||priority.find(mode=>first.transportModes.includes(mode)||second.transportModes.includes(mode))||"도보길";
}

export function transportSceneCopy(mode,destination,language="ko"){
  const names={
    ko:{"공항":"비행기","철도":"기차","여객선":"여객선","시외버스":"시외버스","일반 도로":"자동차","지하철":"지하철","노면전차":"노면전차","케이블카":"케이블카","자전거도로":"자전거","도보길":"도보"},
    en:{"공항":"plane","철도":"train","여객선":"ferry","시외버스":"intercity bus","일반 도로":"car","지하철":"subway","노면전차":"tram","케이블카":"cable car","자전거도로":"bicycle","도보길":"on foot"},
    ja:{"공항":"飛行機","철도":"列車","여객선":"旅客船","시외버스":"高速バス","일반 도로":"自動車","지하철":"地下鉄","노면전차":"路面電車","케이블카":"ケーブルカー","자전거도로":"自転車","도보길":"徒歩"}
  };
  const vehicle=(names[language]||names.ko)[mode]||mode;
  if(language==="en")return {vehicle,title:`Traveling to ${destination} by ${vehicle}`,desc:`They are following the route between towns and heading to ${destination} by ${vehicle}.`};
  if(language==="ja")return {vehicle,title:`${vehicle}で${destination}へ移動中`,desc:`村を結ぶ経路に沿って、${vehicle}で${destination}へ向かっています。`};
  return {vehicle,title:`${vehicle}(으)로 ${destination} 이동 중`,desc:`마을 사이에 연결된 경로를 따라 ${vehicle}(으)로 ${destination}에 가고 있어요.`};
}
