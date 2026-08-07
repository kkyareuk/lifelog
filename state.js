const KEY="drawer-village-game-v1";
const oldKey="parallel-city-game-v2";
const renameBrand=value=>{
  const walk=node=>{
    if(!node||typeof node!=="object")return;
    Object.keys(node).forEach(key=>{
      if(typeof node[key]==="string"&&!/^(data:|https?:)/.test(node[key]))node[key]=node[key].replaceAll("평행도시","서랍마을").replaceAll("평행마을","서랍마을").replaceAll("평행","서랍");
      else walk(node[key]);
    });
  };
  walk(value);return value;
};
const uid=()=>crypto.randomUUID?.()||`${Date.now()}-${Math.random()}`;
const clone=x=>JSON.parse(JSON.stringify(x));
const rooms=()=>({
  living:{name:"거실",type:"living",size:"큰 방",order:0,image:"",interiorStyle:"설정하지 않음",furniture:["소파","TV","책장"]},
  kitchen:{name:"주방",type:"kitchen",size:"보통 방",order:1,image:"",interiorStyle:"설정하지 않음",furniture:["냉장고","조리대","식탁"]},
  entry:{name:"현관",type:"entry",size:"작은 방",order:2,image:"",interiorStyle:"설정하지 않음",furniture:["신발장","전신거울"]},
  bath:{name:"욕실",type:"bath",size:"작은 방",order:3,image:"",interiorStyle:"설정하지 않음",furniture:["샤워부스","세면대"]},
  bedroom:{name:"침실",type:"bedroom",size:"보통 방",order:4,image:"",interiorStyle:"설정하지 않음",furniture:["침대","옷장"]},
  study:{name:"서재·취미방",type:"study",size:"보통 방",order:5,image:"",interiorStyle:"설정하지 않음",furniture:["책상","컴퓨터"]}
});
const ROOM_SIZES=["작은 방","보통 방","큰 방","넓고 긴 방"];
const defaultBodyProfile=()=>({
  bodySize:"설정하지 않음",
  physicalTraits:[],
  appearance:{
    hairColor:"설정하지 않음",
    hairColorOrigin:"설정하지 않음",
    naturalHairColor:"설정하지 않음",
    hairLength:"설정하지 않음",
    hairTexture:"설정하지 않음",
    hairStyles:[],
    leftEyeColor:"설정하지 않음",
    rightEyeColor:"설정하지 않음",
    makeupLevel:"하지 않음",
    makeupStyles:[],
    salonFrequency:"자동 · 설정에 맞춤",
    cosmeticSurgery:"설정하지 않음",
    cosmeticSurgeryAreas:[]
  },
  healthConditions:[],
  healthOther:"",
  wheelchair:{type:"사용하지 않음",pattern:""},
  prostheticArm:{side:"사용하지 않음",type:"",custom:""},
  prostheticLeg:{side:"사용하지 않음",type:"",custom:""},
  hearing:{side:"설정하지 않음",level:"",supports:[]},
  vision:{side:"설정하지 않음",level:"",supports:[]},
  accessibilityPreferences:[],
  notes:""
});
const normalizedBodyProfile=value=>{
  const source=value&&typeof value==="object"&&!Array.isArray(value)?value:{};
  const defaults=defaultBodyProfile();
  const normalizeDevice=(key,sideDefault)=>({
    ...defaults[key],
    ...(source[key]&&typeof source[key]==="object"&&!Array.isArray(source[key])?source[key]:{}),
    side:String(source[key]?.side||sideDefault),
    type:String(source[key]?.type||defaults[key].type||""),
    custom:String(source[key]?.custom||"").slice(0,120)
  });
  const appearanceSource=source.appearance&&typeof source.appearance==="object"&&!Array.isArray(source.appearance)?source.appearance:{};
  const appearanceDefaults=defaults.appearance;
  return{
    ...defaults,
    ...source,
    bodySize:String(source.bodySize||defaults.bodySize),
    physicalTraits:Array.isArray(source.physicalTraits)?[...new Set(source.physicalTraits.map(String))].slice(0,40):[],
    appearance:{
      ...appearanceDefaults,
      ...appearanceSource,
      hairColor:String(appearanceSource.hairColor||appearanceDefaults.hairColor),
      hairColorOrigin:String(appearanceSource.hairColorOrigin||appearanceDefaults.hairColorOrigin),
      naturalHairColor:String(appearanceSource.naturalHairColor||appearanceDefaults.naturalHairColor),
      hairLength:String(appearanceSource.hairLength||appearanceDefaults.hairLength),
      hairTexture:String(appearanceSource.hairTexture||appearanceDefaults.hairTexture),
      hairStyles:Array.isArray(appearanceSource.hairStyles)?[...new Set(appearanceSource.hairStyles.map(String))].slice(0,12):[],
      leftEyeColor:String(appearanceSource.leftEyeColor||appearanceDefaults.leftEyeColor),
      rightEyeColor:String(appearanceSource.rightEyeColor||appearanceDefaults.rightEyeColor),
      makeupLevel:String(appearanceSource.makeupLevel||appearanceDefaults.makeupLevel),
      makeupStyles:Array.isArray(appearanceSource.makeupStyles)?[...new Set(appearanceSource.makeupStyles.map(String))].slice(0,6):[],
      salonFrequency:String(appearanceSource.salonFrequency||appearanceDefaults.salonFrequency),
      cosmeticSurgery:String(appearanceSource.cosmeticSurgery||appearanceDefaults.cosmeticSurgery),
      cosmeticSurgeryAreas:Array.isArray(appearanceSource.cosmeticSurgeryAreas)?[...new Set(appearanceSource.cosmeticSurgeryAreas.map(String))].slice(0,8):[]
    },
    healthConditions:Array.isArray(source.healthConditions)?[...new Set(source.healthConditions.map(String))].slice(0,12):[],
    healthOther:String(source.healthOther||"").slice(0,200),
    wheelchair:normalizeDevice("wheelchair","사용하지 않음"),
    prostheticArm:normalizeDevice("prostheticArm","사용하지 않음"),
    prostheticLeg:normalizeDevice("prostheticLeg","사용하지 않음"),
    hearing:{...normalizeDevice("hearing","설정하지 않음"),supports:Array.isArray(source.hearing?.supports)?[...new Set(source.hearing.supports.map(String))].slice(0,8):[]},
    vision:{...normalizeDevice("vision","설정하지 않음"),supports:Array.isArray(source.vision?.supports)?[...new Set(source.vision.supports.map(String))].slice(0,8):[]},
    accessibilityPreferences:Array.isArray(source.accessibilityPreferences)?[...new Set(source.accessibilityPreferences.map(String))].slice(0,10):[],
    notes:String(source.notes||"").slice(0,600)
  };
};
const ROOM_FURNITURE={
  living:["소파","TV","책장","오디오","안마의자","게임기","캣타워"],
  kitchen:["냉장고","조리대","식탁","오븐","커피머신","식기세척기"],
  entry:["신발장","전신거울","우산꽂이","함께 사는 존재 산책용품"],
  bath:["샤워부스","욕조","세면대","세탁기","건조기"],
  bedroom:["침대","옷장","화장대","협탁","빔프로젝터"],
  study:["책상","컴퓨터","피아노","기타","그림 도구","재봉틀","운동기구"],
  dining:["식탁","의자","찬장","티 테이블","와인장"],
  nursery:["아기 침대","수납장","놀이 매트","책장","기저귀 교환대"],
  guest:["침대","협탁","옷걸이","작은 책상","전신거울"],
  hobby:["작업대","수납장","그림 도구","재봉틀","악기","운동기구"],
  balcony:["화분","야외 의자","작은 테이블","빨래 건조대"],
  storage:["수납장","선반","보관 상자","옷걸이"],
  other:["수납장","의자","작은 테이블"]
};
const defaultCatalog=()=>({
  food:[
    {id:"food-omurice",kind:"food",name:"오므라이스",category:"일본 음식",image:"",spicy:0,sweet:2},
    {id:"food-malatang",kind:"food",name:"마라탕",category:"중국 음식",image:"",spicy:5,sweet:0},
    {id:"food-tiramisu",kind:"food",name:"티라미수",category:"디저트",image:"",spicy:0,sweet:5}
  ],
  drink:[
    {id:"drink-ein",kind:"drink",name:"아인슈페너",category:"커피",image:"",sweet:3},
    {id:"drink-matcha",kind:"drink",name:"말차 라테",category:"라테",image:"",sweet:4}
  ],
  fashion:[
    {id:"fashion-cardigan",kind:"fashion",name:"빈티지 가디건",category:"상의",image:"",style:"빈티지"},
    {id:"fashion-coat",kind:"fashion",name:"롱 코트",category:"아우터",image:"",style:"클래식"}
  ],
  music:[
    {id:"music-night",kind:"music",name:"한밤의 산책",category:"재즈",image:"",creator:"달빛 트리오"},
    {id:"music-blue",kind:"music",name:"Blue Window",category:"인디",image:"",creator:"유리새"}
  ],
  idol:[
    {id:"idol-lumen",kind:"idol",name:"LUMEN",category:"아이돌",image:"",creator:"보이그룹"},
    {id:"idol-meteor",kind:"idol",name:"METEOR CLUB",category:"밴드",image:"",creator:"록 밴드"}
  ],
  book:[
    {id:"book-midnight",kind:"book",name:"새벽의 도서관",category:"추리 소설",image:"",creator:"한여름"}
  ],
  movie:[
    {id:"movie-starlight",kind:"movie",name:"별빛 극장",category:"판타지 영화",image:"",creator:"서랍 스튜디오"}
  ],
  game:[
    {id:"game-pocket",kind:"game",name:"포켓 아케이드",category:"RPG",image:"",creator:"민트 게임즈"}
  ],
  perfume:[
    {id:"perfume-garden",kind:"perfume",name:"비 온 뒤 정원",category:"우디 플로럴",image:""}
  ],
  hobby:[
    {id:"hobby-perfume",kind:"hobby",name:"달빛 향수 키트",category:"조향",image:""},
    {id:"hobby-figure",kind:"hobby",name:"한정판 피규어",category:"수집",image:""}
  ],
  electronics:[],
  weapon:[]
});
const fresh=()=>({schema:11,activeTab:"character",characterPane:"profile",activeId:null,activeHomeId:null,activeTownId:null,homeEditMode:false,buildingLabelMode:"full",uiFont:"system",lastSaved:0,characters:{},order:[],homes:{},relationships:{},deletedCharacterIds:[],deletedRelationshipIds:[],deletedHomeIds:[],characterViews:{},routines:{},dailyPlans:{},interactions:[],catalog:defaultCatalog(),towns:[],world:{name:"서랍마을",bg:"world-assets/cozy-town.png",places:[
  {id:"cafe",name:"달무리 카페",type:"카페",emoji:"☕",image:"",imageScale:1,stock:["drink-ein","drink-matcha","food-tiramisu"],priceRange:"보통",servicePrice:"보통",audiences:[],spicy:0,sweet:3,x:15,y:34,color:"#74c7bd"},
  {id:"food",name:"달무리 식당",type:"음식점",emoji:"🍽️",image:"",imageScale:1,stock:["food-omurice","food-malatang"],priceRange:"보통",servicePrice:"보통",audiences:["아재 입맛","어린이 입맛"],spicy:2,sweet:2,x:55,y:22,color:"#86ca7b"},
  {id:"office",name:"서랍 오피스",type:"사무실",subtype:"일반 회사",emoji:"🏢",image:"",imageScale:1,stock:[],priceRange:"보통",servicePrice:"보통",audiences:[],spicy:0,sweet:0,x:79,y:37,color:"#8c9df0"},
  {id:"clinic",name:"새봄 의원",type:"병원",emoji:"🩺",image:"",imageScale:1,stock:[],priceRange:"보통",servicePrice:"보통",audiences:[],spicy:0,sweet:0,x:21,y:68,color:"#6db7e8"},
  {id:"park",name:"별꼬리 공원",type:"공원",emoji:"🌳",image:"",imageScale:1,stock:[],priceRange:"무료",servicePrice:"무료",audiences:[],spicy:0,sweet:0,x:64,y:76,color:"#66c68a"}
]}});

function migrate(x){
  if(!x)return normalizeHomes(fresh());
  if(x.schema===11)return normalizeHomes(x);
  if(x.schema===10)return normalizeHomes(x);
  if(x.schema===9)return normalizeHomes(x);
  if(x.schema===8)return normalizeHomes(x);
  if(x.schema===7)return normalizeHomes(x);
  if(x.schema===6)return normalizeHomes(x);
  if(x.schema===5)return normalizeHomes(x);
  if(x.schema===4){
    x.schema=5;x.homeEditMode=false;
    return normalizeHomes(x);
  }
  if(x.schema===3){
    x.schema=4;x.dailyPlans=x.dailyPlans||{};x.activeHomeId=x.activeHomeId||null;
    (x.world?.places||[]).forEach(p=>p.image=p.image||"");
    x.schema=5;x.homeEditMode=false;return normalizeHomes(x);
  }
  if(x.schema===2){
    x.schema=3;
    Object.values(x.homes||{}).forEach(h=>{h.rooms=h.rooms||rooms()});
    x.schema=4;x.dailyPlans={};x.activeHomeId=null;
    (x.world?.places||[]).forEach(p=>p.image=p.image||"");
    x.schema=5;x.homeEditMode=false;return normalizeHomes(x);
  }
  return normalizeHomes(fresh());
}
function normalizeHomes(x){
  if(!x||typeof x!=="object"||Array.isArray(x))x={};
  const previousSchema=Number(x?.schema)||0;
  if(x.activeTab==="wardrobe")x.activeTab="catalog";
  x.schema=11;
  x.activeTab=["observe","home","character","catalog","relationship","routine","town","shop","settings"].includes(x.activeTab)?x.activeTab:"character";
  x.buildingLabelMode=["full","name","none"].includes(x.buildingLabelMode)?x.buildingLabelMode:"full";
  x.mapCharacterLabelMode=["name","none"].includes(x.mapCharacterLabelMode)?x.mapCharacterLabelMode:"none";
  x.uiFont=["system","noto","kopub","cafe24slim","changwonround","konkon","gowun","myeongjo","dohyeon"].includes(x.uiFont)?x.uiFont:"system";
  x.mapLabelMode=["full","name","none"].includes(x.mapLabelMode)?x.mapLabelMode:"full";
  x.observeHomeId=x.homes?.[x.observeHomeId]?x.observeHomeId:null;
  if(x.characterPane==="traits")x.characterPane="personality";
  x.characterPane=["profile","body","personality","taste","worldTaste","manage"].includes(x.characterPane)?x.characterPane:"profile";
  if(Array.isArray(x.characters)){
    const list=x.characters.filter(c=>c&&typeof c==="object"&&!Array.isArray(c));
    x.characters=Object.fromEntries(list.map(c=>{const id=String(c.id||uid());c.id=id;return[id,c]}));
    x.order=list.map(c=>c.id);
  }
  x.characters=x.characters&&typeof x.characters==="object"?x.characters:{};
  x.characters=Object.fromEntries(Object.entries(x.characters).filter(([,c])=>c&&typeof c==="object"&&!Array.isArray(c)).map(([key,c])=>{
    const id=String(c.id||key||uid());c.id=id;return[id,c];
  }));
  x.deletedCharacterIds=Array.isArray(x.deletedCharacterIds)?[...new Set(x.deletedCharacterIds.map(String))]:[];
  x.deletedRelationshipIds=Array.isArray(x.deletedRelationshipIds)?[...new Set(x.deletedRelationshipIds.map(String))]:[];
  x.deletedHomeIds=Array.isArray(x.deletedHomeIds)?[...new Set(x.deletedHomeIds.map(String))]:[];
  x.deletedCharacterIds.forEach(id=>delete x.characters[id]);
  const characterIds=Object.keys(x.characters);
  x.order=Array.isArray(x.order)?x.order.map(String).filter((id,index,list)=>x.characters[id]&&list.indexOf(id)===index):[];
  characterIds.forEach(id=>{if(!x.order.includes(id))x.order.push(id)});
  x.activeId=x.characters[x.activeId]?x.activeId:(x.order[0]||null);
  if(Array.isArray(x.homes))x.homes=Object.fromEntries(x.homes.filter(h=>h&&typeof h==="object"&&!Array.isArray(h)).map(h=>{const id=String(h.id||uid());h.id=id;return[id,h]}));
  x.homes=x.homes&&typeof x.homes==="object"?x.homes:{};
  x.homes=Object.fromEntries(Object.entries(x.homes).filter(([,h])=>h&&typeof h==="object"&&!Array.isArray(h)).map(([key,h])=>{const id=String(h.id||key||uid());h.id=id;return[id,h]}));
  x.deletedHomeIds.forEach(id=>delete x.homes[id]);
  x.activeHomeId=x.homes[x.activeHomeId]?x.activeHomeId:(Object.keys(x.homes)[0]||null);
  x.routines=x.routines&&typeof x.routines==="object"?x.routines:{};
  x.dailyPlans=x.dailyPlans&&typeof x.dailyPlans==="object"?x.dailyPlans:{};
  x.interactions=Array.isArray(x.interactions)?x.interactions.filter(item=>item&&typeof item==="object"&&!Array.isArray(item)).slice(-120):[];
  x.characterViews=x.characterViews&&typeof x.characterViews==="object"?x.characterViews:{};
  x.buildingShapes=Array.isArray(x.buildingShapes)?x.buildingShapes.filter(shape=>shape&&shape.id&&shape.src).map(shape=>({
    id:String(shape.id),
    name:String(shape.name||"사용자 건물 모양"),
    src:String(shape.src||""),
    types:Array.isArray(shape.types)?shape.types.map(String):[],
    features:Array.isArray(shape.features)?shape.features.map(String):[],
    custom:true
  })):[];
  Object.keys(x.characterViews).forEach(sourceId=>{
    if(!x.characters[sourceId]){delete x.characterViews[sourceId];return}
    const targets=x.characterViews[sourceId]&&typeof x.characterViews[sourceId]==="object"?x.characterViews[sourceId]:{};
    x.characterViews[sourceId]=Object.fromEntries(Object.entries(targets).filter(([targetId])=>targetId!==sourceId&&x.characters[targetId]).map(([targetId,value])=>[targetId,value&&typeof value==="object"?value:{}]));
    Object.values(x.characterViews[sourceId]).forEach(view=>{
      const overallMigration={"호감이 있음":"인간적인 호감이 있음","좋아함":"연애 감정으로 좋아함","사랑함":"깊이 사랑함"};
      if(view?.overall) view.overall=overallMigration[view.overall]||view.overall;
      if(view?.touchIntensity==="성인 간 합의된 친밀한 접촉까지")view.touchIntensity="성인 간 친밀한 접촉까지";
      // 예전 데이터의 ‘충동’은 실행 의사를 뜻하지 않았습니다. 별도 실행값이
      // 없는 기존 캐릭터가 업데이트 뒤 갑자기 폭력을 쓰지 않도록 안전하게 이관합니다.
      if(view?.aggression&&!view.aggressionAction)view.aggressionAction="행동으로 옮기지 않음";
    });
  });
  const relationList=(Array.isArray(x.relationships)?x.relationships:Object.values(x.relationships||{})).filter(relation=>relation&&typeof relation==="object"&&!Array.isArray(relation));
  x.relationships={};
  const relationIdsByKey=new Map();
  relationList.filter(Boolean).forEach(relation=>{
    const id=relation.id||uid();
    if(x.deletedRelationshipIds.includes(String(id)))return;
    if(x.deletedCharacterIds.includes(String(relation.a))||x.deletedCharacterIds.includes(String(relation.b)))return;
    if(relation.type==="짝사랑"){
      const source=relation.admirerId||relation.a,target=relation.targetId||relation.b;
      if(x.characters[source]&&x.characters[target]){
        x.characterViews[source]=x.characterViews[source]||{};
        x.characterViews[source][target]={overall:"좋아함",awareness:"자기 감정을 분명히 자각함",...(x.characterViews[source][target]||{})};
      }
      return;
    }
    const originalType=relation.type,typeMap={"폴리 관계":"연인","절친":"친구","대학 동기":"친구","젊은 날의 친구들":"친구","유사가족":"동거인","가족":"동거인","보호·피보호":"동거인"};
    relation.type=typeMap[originalType]||originalType||"친구";
    if(relation.type==="동거인"){
      relation.cohabit=true;
      if(["유사가족","가족","보호·피보호"].includes(originalType))relation.stage="유사가족 같은 동거인";
    }
    relation.interactions=Array.isArray(relation.interactions)?relation.interactions:[];
    relation.interactionsAll=Boolean(relation.interactionsAll);
    relation.temporalStatus=relation.temporalStatus==="past"?"past":"current";
    relation.faultParty=relation.temporalStatus==="past"?String(relation.faultParty||""):"";
    relation.faultReason=relation.temporalStatus==="past"?String(relation.faultReason||"정하지 않음"):"";
    if(relation.type==="형제·자매"){
      const members=relation.groupMembers?.length?relation.groupMembers:[relation.a,relation.b].filter(Boolean);
      relation.siblingKinshipByPair=relation.siblingKinshipByPair&&typeof relation.siblingKinshipByPair==="object"?relation.siblingKinshipByPair:{};
      for(let i=0;i<members.length;i++)for(let j=i+1;j<members.length;j++){
        const a=members[i],b=members[j],key=[a,b].sort().join("~");
        if(!relation.siblingKinshipByPair[key]){
          const blood=relation.siblingBlood?.[a]!==false&&relation.siblingBlood?.[b]!==false;
          relation.siblingKinshipByPair[key]=blood?(relation.siblingBloodType?.[a]==="half"||relation.siblingBloodType?.[b]==="half"?"half":"full"):"nonblood";
        }
      }
      delete relation.siblingBlood;delete relation.siblingBloodType;
    }
    const legacyTouchMap={"거의 하지 않음":"인사·부축 같은 의례적 접촉만","가끔 가벼운 접촉":"손잡기·팔짱까지","자연스럽게 표현함":"포옹·기대기까지","애정 표현이 많은 편":"가벼운 입맞춤까지"};
    const legacyTouch=legacyTouchMap[relation.touchIntensity]||relation.touchIntensity||"";
    if(legacyTouch&&x.characters[relation.a]&&x.characters[relation.b]){
      x.characterViews[relation.a]=x.characterViews[relation.a]||{};
      x.characterViews[relation.b]=x.characterViews[relation.b]||{};
      x.characterViews[relation.a][relation.b]=x.characterViews[relation.a][relation.b]||{};
      x.characterViews[relation.b][relation.a]=x.characterViews[relation.b][relation.a]||{};
      [x.characterViews[relation.a][relation.b],x.characterViews[relation.b][relation.a]].forEach(view=>{
        if(!view.touchIntensity)view.touchIntensity=legacyTouch;
        const edited=new Set(Array.isArray(view._editedFields)?view._editedFields:[]);
        edited.add("touchIntensity");
        view._editedFields=[...edited];
      });
    }
    delete relation.touchIntensity;
    delete relation.romanceStatus;
    const officialityMigration={"법적으로 명시되지 않음":"관계를 따로 명명하지 않음","외부에는 숨김":"당사자끼리만 관계를 인정함","당사자 사이에서만 인정함":"당사자끼리만 관계를 인정함","남들 앞에서도 공개함":"누구에게나 공개함","법적으로 가족임":"법적으로 관계가 등록됨","법적으로 보호 관계임":"법적으로 관계가 등록됨"};
    relation.legalStatus=officialityMigration[relation.legalStatus]||relation.legalStatus||"관계를 따로 명명하지 않음";
    delete relation.protectionRole;delete relation.caregiverIds;delete relation.careReceiverIds;
    relation.stage=relation.stage||({
      연인:"편안한 연인",부부:"생활 동반자",친구:"편한 친구",혐관:"신경전 중"
    }[relation.type]||"편안함");
    if(x.characters[relation.a]&&x.characters[relation.b]&&relation.a!==relation.b){
      const directional=relation.type==="부모·자녀"||relation.directional;
      const pair=directional?`${relation.a}>${relation.b}`:[relation.a,relation.b].sort().join("~");
      const key=`${relation.type}|${pair}|${relation.parentRole||""}`;
      const displayOrder=Array.isArray(relation.displayOrder)&&relation.displayOrder.length===2&&relation.displayOrder.every(characterId=>characterId===relation.a||characterId===relation.b)
        ?relation.displayOrder:[relation.a,relation.b];
      const candidate={...relation,id,displayOrder};
      const previousId=relationIdsByKey.get(key);
      if(!previousId){
        relationIdsByKey.set(key,id);x.relationships[id]=candidate;
      }else{
        const previous=x.relationships[previousId];
        const candidateScore=(Number(candidate.updatedAt)||0)*1000+candidate.interactions.length+(candidate.interactionsAll?100:0);
        const previousScore=(Number(previous.updatedAt)||0)*1000+(previous.interactions?.length||0)+(previous.interactionsAll?100:0);
        if(candidateScore>previousScore){
          delete x.relationships[previousId];relationIdsByKey.set(key,id);x.relationships[id]=candidate;
        }
      }
    }
  });
  const defaultWorld=fresh().world;
  x.world=x.world&&typeof x.world==="object"&&!Array.isArray(x.world)?x.world:clone(defaultWorld);
  x.world.name=x.world.name||defaultWorld.name;
  x.world.bg=x.world.bg||defaultWorld.bg;
  x.world.places=Array.isArray(x.world.places)?x.world.places.filter(p=>p&&typeof p==="object"&&!Array.isArray(p)):clone(defaultWorld.places);
  x.towns=Array.isArray(x.towns)?x.towns.filter(t=>t&&typeof t==="object"&&!Array.isArray(t)):[];
  if(!x.towns.length)x.towns=[{id:uid(),...clone(x.world)}];
  x.towns=x.towns.map(t=>({id:String(t.id||uid()),name:String(t.name||"이름 없는 마을"),bg:String(t.bg||defaultWorld.bg),era:t.era==="medieval"?"medieval":"modern",places:Array.isArray(t.places)?t.places.filter(p=>p&&typeof p==="object"&&!Array.isArray(p)):[]}));
  x.towns.forEach(t=>t.places.forEach(p=>{
    p.id=String(p.id||uid());p.name=String(p.name||"이름 없는 건물");p.type=String(p.type||"기타");
    p.iconPreset=p.iconPreset||({
    "카페":"cafe","음식점":"restaurant","식당":"restaurant","사무실":"office","병원":"hospital",
    "공원":"park","학교":"school","옷가게":"clothing","공연장":"theater","숙박":"hotel",
    "백화점":"department","도서관":"library"
    }[p.type]||"shop");
    p.subtype=String(p.subtype||"");p.interiorImage=String(p.interiorImage||"");p.stock=Array.isArray(p.stock)?p.stock.map(String):[];
    p.audiences=Array.isArray(p.audiences)?p.audiences.map(String):[];p.priceRange=String(p.priceRange||"보통");p.servicePrice=String(p.servicePrice||p.priceRange);
    p.imageScale=Number.isFinite(+p.imageScale)?Math.max(.45,Math.min(2,+p.imageScale)):1;
    p.spicy=Number.isFinite(+p.spicy)?Math.max(0,Math.min(5,+p.spicy)):0;p.sweet=Number.isFinite(+p.sweet)?Math.max(0,Math.min(5,+p.sweet)):0;
    p.x=Number.isFinite(+p.x)?Math.max(0,Math.min(100,+p.x)):50;p.y=Number.isFinite(+p.y)?Math.max(0,Math.min(100,+p.y)):50;
  }));
  x.activeTownId=x.towns.some(t=>t.id===x.activeTownId)?x.activeTownId:x.towns[0].id;
  x.world=clone(x.towns.find(t=>t.id===x.activeTownId));
  const defaultsCatalog=defaultCatalog();
  x.catalog=x.catalog&&typeof x.catalog==="object"&&!Array.isArray(x.catalog)?x.catalog:{};
  Object.keys(defaultsCatalog).forEach(kind=>{
    x.catalog[kind]=Array.isArray(x.catalog[kind])?x.catalog[kind].filter(item=>item&&typeof item==="object"&&!Array.isArray(item)).map(item=>({...item,id:String(item.id||uid()),kind:item.kind||kind})):[];
  });
  x.catalog.fashion.forEach(item=>{
    item.materials=Array.isArray(item.materials)?item.materials:(item.material?[item.material]:[]);
    item.colors=Array.isArray(item.colors)?item.colors:(item.color?[item.color]:[]);
    item.flairs=Array.isArray(item.flairs)?item.flairs:(item.flair?[item.flair]:[]);
  });
  (x.world?.places||[]).forEach(p=>{
    if(p.type==="회사")p.type="사무실";
    p.subtype=p.subtype||"";
    p.interiorImage=p.interiorImage||"";
    p.stock=Array.isArray(p.stock)?[...p.stock]:[];
    p.audiences=Array.isArray(p.audiences)?[...p.audiences]:[];
    p.priceRange=p.priceRange||"보통";
    p.servicePrice=p.servicePrice||p.priceRange;
    p.imageScale=Number.isFinite(+p.imageScale)?Math.max(.45,Math.min(2,+p.imageScale)):1;
    p.spicy=Number.isFinite(+p.spicy)?Math.max(0,Math.min(5,+p.spicy)):0;
    p.sweet=Number.isFinite(+p.sweet)?Math.max(0,Math.min(5,+p.sweet)):0;
  });
  const defaults=rooms();
  Object.values(x.homes||{}).forEach(h=>{
    h.image=h.image||"";
    h.name=String(h.name||"이름 없는 집");
    h.kind=["일반 주거","본가","별채","주말집","업무용 숙소","공동 주거","기숙사","사택","기타"].includes(h.kind)?h.kind:"일반 주거";
    h.exteriorStyle=String(h.exteriorStyle||"설정하지 않음");
    h.beautyLevel=String(h.beautyLevel||"평범함");
    h.ownershipType=String(h.ownershipType||"설정하지 않음");
    h.ownerKind=String(h.ownerKind||"설정하지 않음");
    h.ownerCharacterId=x.characters[h.ownerCharacterId]?String(h.ownerCharacterId):"";
    h.ownerName=String(h.ownerName||"").slice(0,120);
    h.townId=x.towns.some(t=>t.id===h.townId)?h.townId:"";
    h.notes=String(h.notes||"").slice(0,300);
    h.cars=Array.isArray(h.cars)?h.cars.filter(car=>car&&typeof car==="object"&&!Array.isArray(car)).map(car=>({
      id:car.id||uid(),name:car.name||"우리 집 자동차",type:car.type||"승용차",
      color:car.color||"",seats:Number.isFinite(+car.seats)?Math.max(1,Math.min(12,+car.seats)):5,
      image:car.image||""
    })):[];
    h.pets=Array.isArray(h.pets)?h.pets.filter(p=>p&&typeof p==="object"&&!Array.isArray(p)).map(p=>({
      id:p.id||uid(),name:p.name||"새 식구",species:p.species||"기타",
      breed:p.breed||"",sex:p.sex||"모름",neutered:Boolean(p.neutered),
      photo:p.photo||"",icon:p.icon||"",room:p.room||"living",
      customSpecies:p.customSpecies||"",size:["소형","중형","대형"].includes(p.size)?p.size:"중형",
      temperaments:Array.isArray(p.temperaments)?p.temperaments:[],
      bodyTraits:Array.isArray(p.bodyTraits)?p.bodyTraits:[],
      needsWalk:p.needsWalk===undefined?["강아지","호랑이","드래곤"].includes(p.species):Boolean(p.needsWalk),
      rideable:p.rideable===undefined?["호랑이","드래곤"].includes(p.species):Boolean(p.rideable)
    })):[];
    h.rooms=h.rooms&&typeof h.rooms==="object"&&!Array.isArray(h.rooms)?h.rooms:{};
    h.deletedRoomKeys=Array.isArray(h.deletedRoomKeys)?[...new Set(h.deletedRoomKeys.map(String))]:[];
    h.deletedRoomKeys.forEach(key=>delete h.rooms[key]);
    h.rooms=Object.fromEntries(Object.entries(h.rooms).filter(([,room])=>room&&typeof room==="object"&&!Array.isArray(room)).map(([key,room],index)=>{
      room.name=String(room.name||"이름 없는 방");room.type=String(room.type||(["living","kitchen","entry","bath","bedroom","study"].includes(key)?key:"other"));
      room.image=String(room.image||"");room.interiorStyle=String(room.interiorStyle||"설정하지 않음");room.furniture=Array.isArray(room.furniture)?room.furniture.map(String):[];
      const defaultSize=room.type==="living"?"큰 방":["entry","bath","storage"].includes(room.type)?"작은 방":"보통 방";
      room.size=ROOM_SIZES.includes(room.size)?room.size:defaultSize;
      room.order=Number.isFinite(Number(room.order))?Number(room.order):index;
      return[String(key),room];
    }));
    h.cleanliness=Number.isFinite(h.cleanliness)?h.cleanliness:100;
  });
  Object.values(x.characters||{}).forEach(c=>{
    c.townId=x.towns.some(t=>t.id===c.townId)?c.townId:x.towns[0].id;
    c.days=c.days&&typeof c.days==="object"&&!Array.isArray(c.days)?c.days:{};
    c.days=Object.fromEntries(Object.entries(c.days).filter(([,day])=>day&&typeof day==="object"&&!Array.isArray(day)).map(([key,day])=>{
       day.signature=typeof day.signature==="string"?day.signature:"";
       day.engineVersion=String(day.engineVersion||"");
       day.settingsAppliedAt=Number.isFinite(Number(day.settingsAppliedAt))?Number(day.settingsAppliedAt):0;
      day.entries=Array.isArray(day.entries)?day.entries.filter(item=>item&&typeof item==="object"&&!Array.isArray(item)).map(item=>({
        ...item,
        minute:Number.isFinite(Number(item.minute))?Number(item.minute):0,
        title:String(item.title||"생활 중"),
        desc:String(item.desc||"")
      })):[];
      return[String(key),day];
    }));
    x.routines[c.id]=Array.isArray(x.routines[c.id])?x.routines[c.id].filter(r=>r&&typeof r==="object"&&!Array.isArray(r)).map(r=>({
      id:r.id||uid(),day:Number.isFinite(+r.day)?Math.max(0,Math.min(6,+r.day)):1,
      start:r.start||"09:00",end:r.end||"10:00",type:r.type||"개인 일정",
      title:r.title||"새 일정",placeId:r.placeId||"",withIds:Array.isArray(r.withIds)?r.withIds:[],
      notes:r.notes||""
    })):[];
    c.driverLicense=Boolean(c.driverLicense);
    c.wakeHabit=c.wakeHabit||"알람을 듣고 천천히 일어남";
    c.sleepHabit=c.sleepHabit||"이불을 단정히 덮고 잠";
    c.ageGroup=c.ageGroup||"성인";
    c.personalityChoices=c.personalityChoices&&typeof c.personalityChoices==="object"?c.personalityChoices:{};
    c.personalityTypes=Array.isArray(c.personalityTypes)?[...new Set(c.personalityTypes.map(String))].slice(0,4):[];
     c.characterTraits=Array.isArray(c.characterTraits)?[...new Set(c.characterTraits.map(String))].slice(0,8):[];
     c.traitExpressions=Array.isArray(c.traitExpressions)?[...new Set(c.traitExpressions.map(String))].slice(0,8):[];
     c.traitNotes=String(c.traitNotes||"").slice(0,1200);
     c.traitNotesInScripts=Boolean(c.traitNotesInScripts);
     c.bodyProfile=normalizedBodyProfile(c.bodyProfile);
     c.timelineResetAt=Number.isFinite(Number(c.timelineResetAt))?Number(c.timelineResetAt):0;
    c.neatness=c.neatness||"보통";
    c.interference=c.interference==="철저히 선을 지킴"?"요청할 때만 도움":c.interference==="컨트롤프릭"?"통제광":c.interference||"적당히 관여";
    c.conflictStyle=c.conflictStyle||"대화로 해결";
    c.affectionStyle=c.affectionStyle||"행동으로 표현";
    c.energyRhythm=c.energyRhythm||"상황에 따라";
    c.activityTempo=c.activityTempo||"상황에 따라";
    c.fashionSense=c.fashionSense||"보통";
    c.savedOutfits=Array.isArray(c.savedOutfits)?c.savedOutfits.filter(outfit=>outfit&&typeof outfit==="object"&&!Array.isArray(outfit)).map(outfit=>({
      id:outfit.id||uid(),name:outfit.name||"저장 코디",layout:outfit.layout||"cluster-1",
      itemIds:Array.isArray(outfit.itemIds)?outfit.itemIds:[],
      tags:Array.isArray(outfit.tags)?outfit.tags:[]
    })):[];
    c.catalogPreferences=Array.isArray(c.catalogPreferences)?[...c.catalogPreferences]:[];
    c.favoriteScentNotes=Array.isArray(c.favoriteScentNotes)?[...c.favoriteScentNotes]:[];
    c.favoriteVideoGenres=Array.isArray(c.favoriteVideoGenres)?[...c.favoriteVideoGenres]:[];
    c.favoriteStoryGenres=Array.isArray(c.favoriteStoryGenres)?[...c.favoriteStoryGenres]:[];
    c.favoriteGameGenres=Array.isArray(c.favoriteGameGenres)?[...c.favoriteGameGenres]:[];
    c.favoriteBookGenres=Array.isArray(c.favoriteBookGenres)?[...c.favoriteBookGenres]:[];
    c.favoriteFashionStyles=Array.isArray(c.favoriteFashionStyles)?[...c.favoriteFashionStyles]:[];
    c.tastes=Array.isArray(c.tastes)?[...c.tastes]:[];
    if(c.tastes.includes("맵부심")){c.spiceTolerance=Math.max(4,Number(c.spiceTolerance)||0);c.tastes=c.tastes.filter(value=>value!=="맵부심")}
    c.interests=Array.isArray(c.interests)?[...c.interests]:[];
    c.hobbies=Array.isArray(c.hobbies)?[...c.hobbies]:[];
    c.musicGenres=Array.isArray(c.musicGenres)?[...c.musicGenres]:[];
    c.foodTypes=Array.isArray(c.foodTypes)?[...c.foodTypes]:[];
    c.foodPreferences=Array.isArray(c.foodPreferences)
      ? [...c.foodPreferences]
      : [...new Set([...c.tastes,...c.foodTypes])];
    c.drinks=Array.isArray(c.drinks)?[...c.drinks]:[];
    c.favorites=c.favorites&&typeof c.favorites==="object"?c.favorites:{};
    Object.keys(defaultsCatalog).forEach(kind=>c.favorites[kind]=Array.isArray(c.favorites[kind])?[...c.favorites[kind]]:[]);
    c.inventory=c.inventory&&typeof c.inventory==="object"?c.inventory:{};
    Object.keys(defaultsCatalog).forEach(kind=>c.inventory[kind]=Array.isArray(c.inventory[kind])?[...c.inventory[kind]]:[]);
    const consumptionMap={"빠듯함":"절약 우선","보통":"필요한 만큼 소비","여유 있음":"취향에는 아끼지 않음","부유함":"품질 우선","대부호":"가격을 거의 신경 쓰지 않음"};
    c.income=consumptionMap[c.income]||c.income||"필요한 만큼 소비";
    c.wealth=c.wealth||"평범한 형편";
    c.jobTitle=typeof c.jobTitle==="string"?c.jobTitle:"";
    c.workplaceId=c.workplaceId||"";
    const compactBirthday=String(c.birthday||"").replace(/\D/g,"");
    c.birthday=/^(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$/.test(compactBirthday)?compactBirthday:"";
    c.spiceTolerance=Number.isFinite(+c.spiceTolerance)?Math.max(0,Math.min(5,+c.spiceTolerance)):2;
    c.sweetPreference=Number.isFinite(+c.sweetPreference)?Math.max(0,Math.min(5,+c.sweetPreference)):2;
    c.socialEnergy=Number.isFinite(+c.socialEnergy)?Math.max(0,Math.min(6,+c.socialEnergy)):3;
    c.sensingIntuition=Number.isFinite(+c.sensingIntuition)?Math.max(0,Math.min(6,+c.sensingIntuition)):3;
    c.thinkingFeeling=Number.isFinite(+c.thinkingFeeling)?Math.max(0,Math.min(6,+c.thinkingFeeling)):3;
    c.perceivingJudging=Number.isFinite(+c.perceivingJudging)?Math.max(0,Math.min(6,+c.perceivingJudging)):3;
    c.theme={primary:"#176b60",secondary:"#6fd0ae",gradient:true,...(c.theme||{})};
    c.gender=["설정하지 않음","남성","여성","그외"].includes(c.gender)?c.gender:"설정하지 않음";
    if(c.wealth==="대단히 부유함")c.wealth="대부호";
    c.attractedGenders=Array.isArray(c.attractedGenders)?[...new Set(c.attractedGenders)]:[];
    c.attractionTarget=c.attractionTarget||(
      c.attractedGenders.includes("없음")||!c.attractedGenders.length?"설정하지 않음 · 누구에게도 끌리지 않음":
      c.attractedGenders.includes("남성")&&c.attractedGenders.includes("여성")&&c.attractedGenders.includes("그외")?"성별과 무관하게 끌림":
      c.attractedGenders.includes("남성")&&c.attractedGenders.includes("여성")?"여성과 남성에게 끌림":
      c.attractedGenders.includes("여성")?"여성에게 끌림":c.attractedGenders.includes("남성")?"남성에게 끌림":"그외 성별에게 끌림"
    );
    c.touchReaction=c.touchReaction||"상황에 따라 자연스럽게 받아들임";
    c.appearanceLevel=c.appearanceLevel||"보통";
    c.appearanceInterest=c.appearanceInterest||"보통";
    c.appearanceTags=Array.isArray(c.appearanceTags)?[...new Set(c.appearanceTags)]:[];
    c.attractionTraits=Array.isArray(c.attractionTraits)?[...new Set(c.attractionTraits)]:[];
    const opennessMigration={"연인이 있으면 다른 사람에게 끌리지 않음":"설정하지 않음 · 절대 끌리지 않음","아주 드물게 호감을 느낌":"연인이 있어도 취향이면 끌릴 수 있음","관계와 별개로 호감을 느낄 수 있음":"연인이 있어도 취향이면 끌릴 수 있음","새로운 사람에게 쉽게 끌림":"연인이 있어도 취향이면 끌릴 수 있음","관계와 무관하게 쉽게 끌림":"연인이 있어도 취향이면 끌릴 수 있음"};
    c.relationshipOpenness=opennessMigration[c.relationshipOpenness]||(["설정하지 않음 · 절대 끌리지 않음","연인이 없을 때만 취향이면 끌림","연인이 있어도 취향이면 끌릴 수 있음"].includes(c.relationshipOpenness)?c.relationshipOpenness:"설정하지 않음 · 절대 끌리지 않음");
    const legacyHomeId=x.homes[c.homeId]?String(c.homeId):"";
    const rawResidences=Array.isArray(c.residences)?c.residences:[];
    const residenceMap=new Map();
    rawResidences.forEach(item=>{
      if(!item||typeof item!=="object"||!x.homes[item.homeId])return;
      const homeId=String(item.homeId);
      const homeRooms=x.homes[homeId]?.rooms||{};
      const visitDates=String(item.visitDates||"").split(/[\s,]+/).map(value=>value.trim()).filter(value=>/^(0[1-9]|1[0-2])-?(0[1-9]|[12]\d|3[01])$/.test(value));
      residenceMap.set(homeId,{
        homeId,
        role:["주거지","본가","별채","주말집","업무용 숙소","연인의 집","친척집","기타"].includes(item.role)?item.role:"주거지",
        stayPattern:["상시 거주","평일 중심","주말 중심","요일 지정","명절·기념일","필요할 때 방문"].includes(item.stayPattern)?item.stayPattern:"상시 거주",
        visitDays:Array.isArray(item.visitDays)?[...new Set(item.visitDays.map(Number).filter(day=>day>=0&&day<=6))]:[],
        visitDates:[...new Set(visitDates)].join(", "),
        notes:String(item.notes||"").slice(0,200),
        isPrimary:Boolean(item.isPrimary),
        sleepRoomId:homeRooms[item.sleepRoomId]?String(item.sleepRoomId):(homeRooms.bedroom?"bedroom":Object.keys(homeRooms)[0]||""),
        sourceRelationshipId:String(item.sourceRelationshipId||"")
      });
    });
    if(legacyHomeId&&!residenceMap.has(legacyHomeId)){
      const homeRooms=x.homes[legacyHomeId]?.rooms||{};
      residenceMap.set(legacyHomeId,{homeId:legacyHomeId,role:"주거지",stayPattern:"상시 거주",visitDays:[],visitDates:"",notes:"",isPrimary:true,sleepRoomId:homeRooms[c.sleepRoomId]?c.sleepRoomId:(homeRooms.bedroom?"bedroom":Object.keys(homeRooms)[0]||"")});
    }
    c.residences=[...residenceMap.values()];
    let primary=c.residences.find(item=>item.homeId===legacyHomeId)||c.residences.find(item=>item.isPrimary)||c.residences[0];
    c.residences.forEach(item=>item.isPrimary=item===primary);
    c.homeId=primary?.homeId||"";
    c.sleepRoomId=primary?.sleepRoomId||"";
  });
  Object.values(x.homes).forEach(home=>{
    if(home.townId)return;
    const resident=Object.values(x.characters).find(c=>(c.residences||[]).some(item=>item.homeId===home.id));
    home.townId=resident?.townId||x.activeTownId||"";
  });
  return renameBrand(x);
}
function load(){
  try{return migrate(JSON.parse(localStorage.getItem(KEY)||localStorage.getItem("parallel-city-game-v4")||localStorage.getItem("parallel-city-game-v3")||localStorage.getItem(oldKey)||"null"))}
  catch{return fresh()}
}

export let state=load();
let timer;
export const active=()=>state.characters[state.activeId];
export function save(immediate=false,notify=true){
  clearTimeout(timer);
  const run=()=>{
    syncTown();
    state.lastSaved=Date.now();
    try{
      localStorage.setItem(KEY,JSON.stringify(state));
    }catch(error){
      console.warn("기기 저장 공간이 부족해 사진은 계정 저장을 우선합니다.",error);
    }
    document.querySelector("#save-state")?.replaceChildren(document.createTextNode("기기에 저장됨"));
    if(notify)window.dispatchEvent(new Event("parallel-city-saved"));
  };
  immediate?run():timer=setTimeout(run,140);
}
export function createCharacter(limit=5){
  if(state.order.length>=Math.max(1,Number(limit)||5))return null;
  const id=uid();
  state.deletedCharacterIds=(state.deletedCharacterIds||[]).filter(value=>value!==id);
  state.characters[id]={id,name:"새 캐릭터",createdAt:Date.now(),ageGroup:"성인",gender:"설정하지 않음",attractedGenders:[],touchReaction:"상황에 따라 자연스럽게 받아들임",appearanceLevel:"보통",appearanceInterest:"보통",appearanceTags:[],attractionTraits:[],personalityTypes:[],characterTraits:[],traitExpressions:[],traitNotes:"",traitNotesInScripts:false,bodyProfile:defaultBodyProfile(),timelineResetAt:0,job:"무직",jobTitle:"",workplaceId:"",birthday:"",photo:"",icon:"",wake:"07:30",wakeHabit:"알람을 듣고 천천히 일어남",sleep:"00:30",sleepHabit:"이불을 단정히 덮고 잠",income:"필요한 만큼 소비",wealth:"평범한 형편",spiceTolerance:2,sweetPreference:2,socialEnergy:3,sensingIntuition:3,thinkingFeeling:3,perceivingJudging:3,fashionSense:"보통",humorStyle:"건조한 농담만 함",emotionalExpression:"상황에 따라 표현함",impulseControl:"가끔 욱하지만 멈춤",savedOutfits:[],theme:{primary:"#176b60",secondary:"#6fd0ae",gradient:true},tastes:[],interests:[],hobbies:[],musicGenres:[],foodTypes:[],foodPreferences:[],drinks:[],favorites:{},inventory:{},homeId:id,sleepRoomId:"bedroom",residences:[{homeId:id,role:"주거지",stayPattern:"상시 거주",visitDays:[],visitDates:"",notes:"",isPrimary:true,sleepRoomId:"bedroom"}]};
  state.order.push(id);
  state.characters[id].townId=state.activeTownId;
  state.deletedHomeIds=(state.deletedHomeIds||[]).filter(value=>value!==id);
  state.homes[id]={id,name:"새 캐릭터의 집",kind:"일반 주거",townId:state.activeTownId||"",notes:"",image:"",rooms:rooms(),pets:[],cleanliness:100};
  state.activeHomeId=id;
  state.routines[id]=[];
  state.activeId=id;state.activeTab="character";save(true);return id;
}
export function setActive(id){if(state.characters[id]){state.activeId=id;save()}}
export function setCharacterPane(value){state.characterPane=value==="traits"?"personality":(["profile","body","personality","taste","worldTaste","manage"].includes(value)?value:"profile");save()}
export function moveCharacter(id,direction){
  const from=state.order.indexOf(id),to=from+direction;
  if(from<0||to<0||to>=state.order.length)return;
  [state.order[from],state.order[to]]=[state.order[to],state.order[from]];
  save(true);
}
export function deleteCharacter(id){
  if(!state.characters[id])return;
  state.deletedCharacterIds=Array.isArray(state.deletedCharacterIds)?state.deletedCharacterIds:[];
  if(!state.deletedCharacterIds.includes(id))state.deletedCharacterIds.push(id);
  delete state.characters[id];
  state.order=state.order.filter(characterId=>characterId!==id);
  Object.keys(state.relationships).forEach(relationId=>{
    const relation=state.relationships[relationId];
    if(relation.a===id||relation.b===id){
      state.deletedRelationshipIds=Array.isArray(state.deletedRelationshipIds)?state.deletedRelationshipIds:[];
      if(!state.deletedRelationshipIds.includes(relationId))state.deletedRelationshipIds.push(relationId);
      delete state.relationships[relationId];
    }
  });
  delete state.routines[id];
  state.activeId=state.order[0]||null;
  save(true);
}
export function updateCharacter(id,patch,persist=true){
  const c=state.characters[id];if(!c)return;
  Object.assign(c,patch);
  if(patch.homeId&&state.homes[patch.homeId]){
    c.residences=Array.isArray(c.residences)?c.residences:[];
    if(!c.residences.some(item=>item.homeId===patch.homeId))c.residences.push({homeId:patch.homeId,role:"주거지",stayPattern:"상시 거주",visitDays:[],visitDates:"",notes:"",isPrimary:true,sleepRoomId:state.homes[patch.homeId].rooms?.bedroom?"bedroom":Object.keys(state.homes[patch.homeId].rooms||{})[0]||""});
    c.residences.forEach(item=>item.isPrimary=item.homeId===patch.homeId);
  }
  if(patch.sleepRoomId&&c.homeId){
    const residence=(c.residences||[]).find(item=>item.homeId===c.homeId);
    if(residence)residence.sleepRoomId=patch.sleepRoomId;
  }
  const simulationFields=new Set(["ageGroup","wake","wakeHabit","sleep","sleepHabit","job","jobTitle","workplaceId","townId","homeId","residences","sleepRoomId","personalityTypes","characterTraits","traitExpressions","traitNotes","traitNotesInScripts","bodyProfile","appearanceLevel","appearanceInterest","appearanceTags","attractionTraits","hobbies","interests","inventory","foodPreferences","favoriteScentNotes","favoriteStoryGenres","favoriteVideoGenres","favoriteGameGenres","favoriteFashionStyles","musicGenres","socialStyle","perceptionStyle","decisionStyle","planningStyle","activityTempo","neatness","interference","conflictStyle","affectionStyle","energyRhythm","humorStyle","emotionalExpression","impulseControl"]);
  if(Object.keys(patch).some(key=>simulationFields.has(key)))c.timelineResetAt=Date.now();
  if(persist)save();
}
export function addRoutine(characterId){
  if(!state.characters[characterId])return;
  state.routines[characterId]=Array.isArray(state.routines[characterId])?state.routines[characterId]:[];
  const routine={id:uid(),day:1,start:"09:00",end:"10:00",type:"개인 일정",title:"새 일정",placeId:"",withIds:[],notes:""};
  state.routines[characterId].push(routine);state.characters[characterId].timelineResetAt=Date.now();save(true);return routine.id;
}
export function updateRoutine(characterId,routineId,patch){
  const routine=state.routines[characterId]?.find(item=>item.id===routineId);if(!routine)return;
  Object.assign(routine,patch);if(state.characters[characterId])state.characters[characterId].timelineResetAt=Date.now();save(true);
}
export function deleteRoutine(characterId,routineId){
  state.routines[characterId]=(state.routines[characterId]||[]).filter(item=>item.id!==routineId);if(state.characters[characterId])state.characters[characterId].timelineResetAt=Date.now();save(true);
}
export function toggleChip(id,key,value,persist=true){
  const c=state.characters[id];
  const own=Array.isArray(c[key])?[...c[key]]:[];
  c[key]=own.includes(value)?own.filter(x=>x!==value):[...own,value];
  c.timelineResetAt=Date.now();
  if(persist)save(true);
}
export function setCharacterImage(id,type,data){state.characters[id][type]=data;save(true)}
export function setHomeImage(homeId,room,data){
  const h=state.homes[homeId];if(!h)return;
  h.rooms=h.rooms||rooms();h.rooms[room].image=data;save(true);
}
export function setHomeBackground(homeId,data){
  const h=state.homes[homeId];if(!h)return;
  h.image=data;save(true);
}
export function setHomeEditMode(value){state.homeEditMode=Boolean(value);save()}
export function updateHome(homeId,patch){
  const h=state.homes[homeId];if(!h)return;
  Object.assign(h,patch);save(true);
}
export function updateRoom(homeId,roomKey,patch){
  const h=state.homes[homeId];if(!h)return;
  h.rooms=h.rooms||rooms();
  h.rooms[roomKey]={...h.rooms[roomKey],...patch};save(true);
}
export function createHome(){
  const id=`home-${uid()}`;
  state.deletedHomeIds=(state.deletedHomeIds||[]).filter(value=>value!==id);
  state.homes[id]={id,name:"새 집",kind:"일반 주거",townId:state.activeTownId||"",notes:"",image:"",exteriorStyle:"설정하지 않음",beautyLevel:"평범함",ownershipType:"설정하지 않음",ownerKind:"설정하지 않음",ownerCharacterId:"",ownerName:"",rooms:rooms(),pets:[],cars:[],cleanliness:100,deletedRoomKeys:[]};
  state.activeHomeId=id;
  state.activeTab="home";
  state.homeEditMode=true;
  save(true);
  return id;
}
export function deleteHome(homeId){
  if(!state.homes[homeId])return false;
  state.deletedHomeIds=Array.isArray(state.deletedHomeIds)?state.deletedHomeIds:[];
  if(!state.deletedHomeIds.includes(homeId))state.deletedHomeIds.push(homeId);
  delete state.homes[homeId];
  Object.values(state.characters).forEach(c=>{
    c.residences=(c.residences||[]).filter(item=>item.homeId!==homeId);
    let primary=c.residences.find(item=>item.isPrimary)||c.residences[0];
    c.residences.forEach(item=>item.isPrimary=item===primary);
    c.homeId=primary?.homeId||"";
    c.sleepRoomId=primary?.sleepRoomId||"";
    c.timelineResetAt=Date.now();
  });
  state.activeHomeId=Object.keys(state.homes)[0]||null;
  save(true);
  return true;
}
export function recordCharacterInteraction({type,actorId,targetId="",itemKind="",itemId=""}){
  const actor=state.characters[actorId],target=state.characters[targetId];
  if(!actor||(["gift","exercise","outing"].includes(type)&&!target))return false;
  if(["buy","gift"].includes(type)&&(!state.catalog?.[itemKind]?.some(item=>item.id===itemId)))return false;
  const receiver=type==="gift"?target:actor;
  if(["buy","gift"].includes(type)){
    receiver.inventory=receiver.inventory&&typeof receiver.inventory==="object"?receiver.inventory:{};
    receiver.inventory[itemKind]=Array.isArray(receiver.inventory[itemKind])?receiver.inventory[itemKind]:[];
    if(!receiver.inventory[itemKind].includes(itemId))receiver.inventory[itemKind].push(itemId);
  }
  state.interactions=Array.isArray(state.interactions)?state.interactions:[];
  state.interactions.push({id:uid(),type,actorId,targetId,itemKind,itemId,createdAt:Date.now()});
  state.interactions=state.interactions.slice(-120);
  delete state.dailyPlans?.[actorId];
  if(targetId)delete state.dailyPlans?.[targetId];
  save(true);return true;
}
export function addRoom(homeId){
  const h=state.homes[homeId];if(!h)return;
  h.rooms=h.rooms||rooms();
  const key=`room-${uid()}`;
  h.deletedRoomKeys=(h.deletedRoomKeys||[]).filter(value=>value!==key);
  const nextOrder=Math.max(-1,...Object.values(h.rooms).map(room=>Number(room.order)||0))+1;
  h.rooms[key]={name:"새 방",type:"other",size:"보통 방",order:nextOrder,image:"",interiorStyle:"설정하지 않음",furniture:[...ROOM_FURNITURE.other]};
  save(true);
  return key;
}
export function reorderRoom(homeId,sourceKey,targetKey){
  const roomsForHome=state.homes[homeId]?.rooms;
  if(!roomsForHome?.[sourceKey]||!roomsForHome?.[targetKey]||sourceKey===targetKey)return false;
  const ordered=Object.entries(roomsForHome).sort((a,b)=>(Number(a[1].order)||0)-(Number(b[1].order)||0));
  const sourceIndex=ordered.findIndex(([key])=>key===sourceKey),targetIndex=ordered.findIndex(([key])=>key===targetKey);
  if(sourceIndex<0||targetIndex<0)return false;
  const [moved]=ordered.splice(sourceIndex,1);
  ordered.splice(targetIndex,0,moved);
  ordered.forEach(([key],index)=>{roomsForHome[key].order=index});
  save(true);
  return true;
}
export function setRoomType(homeId,roomKey,type){
  const room=state.homes[homeId]?.rooms?.[roomKey];if(!room||!ROOM_FURNITURE[type])return;
  const oldType=room.type||"other";
  const defaultNames={living:"거실",kitchen:"주방",entry:"현관",bath:"욕실",bedroom:"침실",study:"서재·취미방",dining:"다이닝룸",nursery:"아이방",guest:"손님방",hobby:"취미방",balcony:"베란다",storage:"창고",other:"기타 방"};
  room.type=type;
  room.furniture=[...ROOM_FURNITURE[type]];
  if(!room.name||room.name==="새 방"||room.name===defaultNames[oldType])room.name=defaultNames[type];
  save(true);
}
export function deleteRoom(homeId,roomKey){
  const h=state.homes[homeId];if(!h?.rooms?.[roomKey])return false;
  const remaining=Object.keys(h.rooms).filter(key=>key!==roomKey);
  if(!remaining.length)return false;
  const fallback=remaining.includes("living")?"living":remaining[0];
  delete h.rooms[roomKey];
  h.deletedRoomKeys=Array.isArray(h.deletedRoomKeys)?h.deletedRoomKeys:[];
  if(!h.deletedRoomKeys.includes(roomKey))h.deletedRoomKeys.push(roomKey);
  Object.values(state.characters).forEach(c=>{
    if(c.homeId===homeId&&c.sleepRoomId===roomKey)c.sleepRoomId=fallback;
    const residence=(c.residences||[]).find(item=>item.homeId===homeId);
    if(residence?.sleepRoomId===roomKey)residence.sleepRoomId=fallback;
  });
  (h.pets||[]).forEach(p=>{if(p.room===roomKey)p.room=fallback});
  save(true);return true;
}
export function addPet(homeId){
  const h=state.homes[homeId];if(!h)return;
  h.pets=Array.isArray(h.pets)?h.pets:[];
  const pet={id:uid(),name:"새 식구",species:"강아지",customSpecies:"",size:"중형",temperaments:[],bodyTraits:[],breed:"",sex:"모름",neutered:false,photo:"",icon:"",room:"living",needsWalk:true,rideable:false};
  h.pets.push(pet);save(true);return pet.id;
}
export function updatePet(homeId,petId,patch){
  const pet=state.homes[homeId]?.pets?.find(p=>p.id===petId);if(!pet)return;
  Object.assign(pet,patch);save(true);
}
export function deletePet(homeId,petId){
  const h=state.homes[homeId];if(!h)return;
  h.pets=(h.pets||[]).filter(p=>p.id!==petId);save(true);
}
export function setPetImage(homeId,petId,type,data){
  const pet=state.homes[homeId]?.pets?.find(p=>p.id===petId);if(!pet)return;
  pet[type]=data;save(true);
}
export function addCar(homeId){
  const h=state.homes[homeId];if(!h)return;
  h.cars=Array.isArray(h.cars)?h.cars:[];
  const car={id:uid(),name:"우리 집 자동차",type:"승용차",color:"",seats:5,image:""};
  h.cars.push(car);save(true);return car.id;
}
export function updateCar(homeId,carId,patch){
  const car=state.homes[homeId]?.cars?.find(item=>item.id===carId);if(!car)return;
  Object.assign(car,patch);save(true);
}
export function deleteCar(homeId,carId){
  const h=state.homes[homeId];if(!h)return;
  h.cars=(h.cars||[]).filter(car=>car.id!==carId);save(true);
}
export function toggleFurniture(homeId,roomKey,item){
  const h=state.homes[homeId];if(!h)return;
  h.rooms=h.rooms||rooms();
  const room=h.rooms[roomKey],current=Array.isArray(room.furniture)?[...room.furniture]:[];
  room.furniture=current.includes(item)?current.filter(x=>x!==item):[...current,item];
  save(true);
}
export function setHomeResidents(homeId,ids){
  const chosen=new Set(ids.filter(id=>state.characters[id]));
  if(!state.homes[homeId])return;
  state.order.forEach(id=>{
    const c=state.characters[id];
    c.residences=Array.isArray(c.residences)?c.residences:[];
    const has=c.residences.some(item=>item.homeId===homeId);
    if(chosen.has(id)&&!has)c.residences.push({homeId,role:"주거지",stayPattern:"상시 거주",visitDays:[],visitDates:"",notes:"",isPrimary:!c.homeId,sleepRoomId:state.homes[homeId].rooms?.bedroom?"bedroom":Object.keys(state.homes[homeId].rooms||{})[0]||""});
    if(!chosen.has(id)&&has)c.residences=c.residences.filter(item=>item.homeId!==homeId);
    let primary=c.residences.find(item=>item.isPrimary)||c.residences[0];
    c.residences.forEach(item=>item.isPrimary=item===primary);
    c.homeId=primary?.homeId||"";
    c.sleepRoomId=primary?.sleepRoomId||"";
  });
  state.activeHomeId=homeId;save(true);
}
export function addCharacterResidence(characterId,homeId){
  const c=state.characters[characterId],home=state.homes[homeId];if(!c||!home)return false;
  c.residences=Array.isArray(c.residences)?c.residences:[];
  if(c.residences.some(item=>item.homeId===homeId))return true;
  const room=home.rooms?.bedroom?"bedroom":Object.keys(home.rooms||{})[0]||"";
  c.residences.push({homeId,role:c.residences.length?"별채":"주거지",stayPattern:c.residences.length?"필요할 때 방문":"상시 거주",visitDays:[],visitDates:"",notes:"",isPrimary:!c.residences.length,sleepRoomId:room});
  if(!c.homeId){c.homeId=homeId;c.sleepRoomId=room}
  c.timelineResetAt=Date.now();save(true);return true;
}
export function removeCharacterResidence(characterId,homeId){
  const c=state.characters[characterId];if(!c)return false;
  c.residences=(c.residences||[]).filter(item=>item.homeId!==homeId);
  let primary=c.residences.find(item=>item.isPrimary)||c.residences[0];
  c.residences.forEach(item=>item.isPrimary=item===primary);
  c.homeId=primary?.homeId||"";
  c.sleepRoomId=primary?.sleepRoomId||"";
  c.timelineResetAt=Date.now();save(true);return true;
}
export function updateCharacterResidence(characterId,homeId,patch){
  const c=state.characters[characterId],residence=c?.residences?.find(item=>item.homeId===homeId);if(!c||!residence)return false;
  Object.assign(residence,patch||{});
  if(patch?.isPrimary){
    c.residences.forEach(item=>item.isPrimary=item===residence);
    c.homeId=homeId;c.sleepRoomId=residence.sleepRoomId||"";
  }else if(residence.isPrimary&&patch?.sleepRoomId)c.sleepRoomId=patch.sleepRoomId;
  c.timelineResetAt=Date.now();save(true);return true;
}
export function setPlaceInteriorImage(placeId,data){const p=state.world.places.find(x=>x.id===placeId);if(p){p.interiorImage=data;save(true)}}
export function updatePlace(placeId,patch,persist=true){
  const p=state.world.places.find(x=>x.id===placeId);if(!p)return;
  Object.assign(p,patch||{});
  p.imageScale=Math.max(.45,Math.min(2,Number(p.imageScale)||1));
  p.spicy=Math.max(0,Math.min(5,Number(p.spicy)||0));
  p.sweet=Math.max(0,Math.min(5,Number(p.sweet)||0));
  p.stock=Array.isArray(p.stock)?[...p.stock]:[];
  p.audiences=Array.isArray(p.audiences)?[...p.audiences]:[];
  if(persist)save(true);
}
export function deletePlace(placeId){
  state.world.places=state.world.places.filter(place=>place.id!==placeId);
  Object.values(state.characters).forEach(character=>{
    if(character.workplaceId===placeId)character.workplaceId="";
  });
  save(true);
}
export function addCatalogItem(kind,data){
  if(!state.catalog[kind])state.catalog[kind]=[];
  const item={id:uid(),kind,name:"새 항목",category:"기타",subtype:"",keywords:[],image:"",spicy:0,sweet:0,creator:"",style:"",...data};
  state.catalog[kind].push(item);save(true);return item.id;
}
export function updateCatalogItem(kind,id,patch){
  const item=state.catalog[kind]?.find(x=>x.id===id);if(!item)return;
  Object.assign(item,patch);save(true);
}
export function deleteCatalogItem(kind,id){
  state.catalog[kind]=(state.catalog[kind]||[]).filter(x=>x.id!==id);
  Object.values(state.characters).forEach(c=>{if(c.favorites?.[kind])c.favorites[kind]=c.favorites[kind].filter(x=>x!==id)});
  Object.values(state.characters).forEach(c=>{if(c.inventory?.[kind])c.inventory[kind]=c.inventory[kind].filter(x=>x!==id)});
  state.world.places.forEach(p=>p.stock=(p.stock||[]).filter(x=>x!==id));
  save(true);
}
export function toggleFavorite(characterId,kind,itemId,persist=true){
  const c=state.characters[characterId];if(!c)return;
  c.favorites=c.favorites||{};const list=Array.isArray(c.favorites[kind])?[...c.favorites[kind]]:[];
  c.favorites[kind]=list.includes(itemId)?list.filter(x=>x!==itemId):[...list,itemId];if(persist)save(true);
}
export function togglePlaceStock(placeId,itemId){
  const p=state.world.places.find(x=>x.id===placeId);if(!p)return;
  const list=Array.isArray(p.stock)?[...p.stock]:[];
  p.stock=list.includes(itemId)?list.filter(x=>x!==itemId):[...list,itemId];save(true);
}
export function setActiveHome(id){if(state.homes[id]){state.activeHomeId=id;save()}}
export function relationshipViewDefaults(type,temporalStatus="current",orderLength=state.order.length){
  const rank=value=>{
    const wanted=Number(String(value||"").match(/^\d+/)?.[0])||1;
    const resolved=Math.min(Math.max(1,Math.max(1,Number(orderLength)||1)-1),wanted);
    return `${resolved}순위${resolved===1?" · 가장 중요한 사람":""}`;
  };
  if(temporalStatus==="past")return {overall:"그저 그런 사람",importance:"선택하지 않음",awareness:"자기 감정을 분명히 자각함",mutualAwareness:"상대의 마음을 전혀 모름",trust:"조심스럽게 지켜봄",closeness:"거리감 있음",comfort:"어색하지만 필요한 대화는 무난함",annoyance:"가끔 성가심",attention:"관심 없음",jealousy:"질투하지 않음",conflictIntensity:"가끔 부딪힘",expectation:"언제든 끝날 수 있다고 생각함",touchIntensity:"신체 접촉 없음",aggression:"공격 충동 없음",aggressionAction:"행동으로 옮기지 않음"};
  if(["연인","부부"].includes(type))return {overall:"연애 감정으로 좋아함",importance:rank("1순위"),awareness:"자기 감정을 분명히 자각함",mutualAwareness:"서로의 마음을 확인함",trust:"어느 정도 믿음",closeness:"가까운 사이",comfort:"편안하고 농담과 장난이 잘 통함",annoyance:"전혀 귀찮거나 성가시지 않음",attention:"자주 살핌",jealousy:"가끔 신경 쓰임",conflictIntensity:"갈등이 거의 없음",expectation:"오래 함께할 거라 기대함",touchIntensity:"포옹·기대기까지",aggression:"공격 충동 없음",aggressionAction:"행동으로 옮기지 않음"};
  if(["부모·자녀","형제·자매"].includes(type))return {overall:"소중하게 여김",importance:rank(type==="부모·자녀"?"1순위":"2순위"),awareness:"자기 감정을 분명히 자각함",mutualAwareness:"상대가 느끼는 감정을 알고 있음",trust:"어느 정도 믿음",closeness:"가까운 사이",comfort:"편안하고 농담과 장난이 잘 통함",annoyance:"가끔 성가심",attention:"종종 신경 씀",jealousy:"질투하지 않음",conflictIntensity:"가끔 부딪힘",expectation:"평생 이어질 관계라고 믿음",touchIntensity:"포옹·기대기까지",aggression:"공격 충동 없음",aggressionAction:"행동으로 옮기지 않음"};
  if(["친구","소꿉친구","학창 시절 친구들","친구 모임"].includes(type))return {overall:"친구로 좋아함",importance:rank("3순위"),awareness:"자기 감정을 분명히 자각함",mutualAwareness:"상대가 느끼는 감정을 알고 있음",trust:"어느 정도 믿음",closeness:"편한 사이",comfort:"편안하고 농담과 장난이 잘 통함",annoyance:"전혀 귀찮거나 성가시지 않음",attention:"종종 신경 씀",jealousy:"질투하지 않음",conflictIntensity:"갈등이 거의 없음",expectation:"오래 함께할 거라 기대함",touchIntensity:"인사·부축 같은 의례적 접촉만",aggression:"공격 충동 없음",aggressionAction:"행동으로 옮기지 않음"};
  if(type==="혐관")return {overall:"매우 싫어함",importance:"선택하지 않음",awareness:"자기 감정을 분명히 자각함",mutualAwareness:"상대가 느끼는 감정을 알고 있음",trust:"전혀 믿지 않음",closeness:"거리감 있음",comfort:"함께 있으면 매우 불편하고 대화도 전혀 통하지 않음",annoyance:"보기만 해도 피곤함",attention:"종종 신경 씀",jealousy:"질투하지 않음",conflictIntensity:"자주 충돌함",expectation:"언제든 끝날 수 있다고 생각함",touchIntensity:"신체 접촉 없음",aggression:"거친 말을 하고 싶은 충동",aggressionAction:"대부분 참지만 가끔 거친 말이 나옴"};
  return {overall:"그저 그런 사람",importance:"선택하지 않음",awareness:"자기 감정을 분명히 자각함",mutualAwareness:"상대의 마음을 전혀 모름",trust:"보통",closeness:"보통",comfort:"어색하지만 필요한 대화는 무난함",annoyance:"전혀 귀찮거나 성가시지 않음",attention:"필요할 때만 봄",jealousy:"질투하지 않음",conflictIntensity:"갈등이 거의 없음",expectation:"정하지 않음",touchIntensity:"신체 접촉 없음",aggression:"공격 충동 없음",aggressionAction:"행동으로 옮기지 않음"};
}
function withoutOrphanedGeneratedView(explicit,relations){
  if(!explicit||typeof explicit!=="object")return explicit||{};
  const edited=new Set(Array.isArray(explicit._editedFields)?explicit._editedFields:[]);
  const keys=Object.keys(explicit).filter(key=>!key.startsWith("_")&&!edited.has(key));
  if(keys.length<8)return explicit;
  const types=["연인","부부","친구","소꿉친구","학창 시절 친구들","친구 모임","부모·자녀","형제·자매","혐관","동거인","기타"];
  const candidates=types.flatMap(type=>["current","past"].map(status=>relationshipViewDefaults(type,status)));
  let best=null;
  candidates.forEach(preset=>{
    const matching=keys.filter(key=>preset[key]!==undefined&&preset[key]===explicit[key]);
    const signature=["overall","trust","closeness","comfort"].filter(key=>matching.includes(key)).length;
    if(signature>=3&&matching.length>(best?.matching.length||0))best={preset,matching};
  });
  if(!best||best.matching.length<8)return explicit;
  const cleaned={...explicit};
  best.matching.forEach(key=>delete cleaned[key]);
  return cleaned;
}
export function explicitCharacterViewFor(sourceId,targetId){
  const relations=Object.values(state.relationships||{}).filter(item=>
    (item.a===sourceId&&item.b===targetId)||(item.a===targetId&&item.b===sourceId)
  );
  const explicit={...withoutOrphanedGeneratedView(state.characterViews?.[sourceId]?.[targetId]||{},relations)};
  delete explicit._editedFields;
  return explicit;
}
export function characterViewFor(sourceId,targetId){
  const relations=Object.values(state.relationships||{}).filter(item=>
    (item.a===sourceId&&item.b===targetId)||(item.a===targetId&&item.b===sourceId)
  );
  const explicit=explicitCharacterViewFor(sourceId,targetId);
  if(explicit.touchIntensity==="성인 간 합의된 친밀한 접촉까지")explicit.touchIntensity="성인 간 친밀한 접촉까지";
  const currentRelations=relations.filter(item=>item.temporalStatus!=="past");
  let defaults={overall:"낯선 사람으로 여김",importance:"선택하지 않음",awareness:"자기 감정을 분명히 자각함",mutualAwareness:"상대의 마음을 전혀 모름",trust:"조심스럽게 지켜봄",closeness:"낯선 사이",comfort:"긴장하고 대화도 조심스러움",annoyance:"전혀 귀찮거나 성가시지 않음",attention:"관심 없음",jealousy:"질투하지 않음",conflictIntensity:"갈등이 거의 없음",expectation:"정하지 않음",touchIntensity:"신체 접촉 없음",aggression:"공격 충동 없음",aggressionAction:"행동으로 옮기지 않음"};
  if(currentRelations.length){
    if(currentRelations.some(relation=>["연인","부부"].includes(relation.type)))defaults={...defaults,overall:"연애 감정으로 좋아함",mutualAwareness:"서로의 마음을 확인함",trust:"어느 정도 믿음",closeness:"가까운 사이",comfort:"편안하고 농담과 장난이 잘 통함",attention:"종종 신경 씀",touchIntensity:"포옹·기대기까지"};
    else if(currentRelations.some(relation=>["혐관","원수"].includes(relation.type)||/원수|이별 통보|이혼 서류/.test(relation.stage||"")))defaults={...defaults,overall:"매우 싫어함",trust:"전혀 믿지 않음",closeness:"거리감 있음",comfort:"함께 있으면 매우 불편하고 대화도 전혀 통하지 않음",annoyance:"보기만 해도 피곤함"};
    else if(currentRelations.some(relation=>["친구","부모·자녀","형제·자매"].includes(relation.type)))defaults={...defaults,overall:"소중하게 여김",trust:"어느 정도 믿음",closeness:"가까운 사이",comfort:"편안하고 농담과 장난이 잘 통함",attention:"종종 신경 씀"};
    else if(currentRelations.some(relation=>relation.type==="동거인"))defaults={...defaults,overall:"그저 그런 사람",trust:"보통",closeness:"보통",comfort:"함께 있는 건 편하지만 대화 호흡은 평범함",attention:"필요할 때만 봄"};
    else defaults={...defaults,overall:"그저 그런 사람",trust:"보통",closeness:"보통",comfort:"어색하지만 필요한 대화는 무난함",attention:"필요할 때만 봄"};
  }else if(relations.length){
    defaults={...defaults,overall:"그저 그런 사람",trust:"조심스럽게 지켜봄",closeness:"거리감 있음",comfort:"어색하지만 필요한 대화는 무난함",attention:"관심 없음"};
  }
  const oldComfort=explicit.spaceComfort&&explicit.spaceComfort!=="정하지 않음"&&explicit.spaceComfort!=="상대 공간에서는 조금 어색함"?explicit.spaceComfort:explicit.comfort;
  const oldRapport=explicit.rapport||"";
  const oldUncomfortable=/매우 불편|긴장|조심|어색|개인 공간|숨 막힘/.test(oldComfort||"");
  const oldSuffocating=/개인 공간|숨 막힘/.test(oldComfort||"");
  const oldGoodRapport=/농담과 장난|주파수가 완벽/.test(oldRapport);
  const oldBadRapport=/전혀 통하지|말할수록 부딪/.test(oldRapport);
  let migratedComfort=oldComfort;
  if(oldSuffocating&&oldGoodRapport)migratedComfort="같은 공간에서는 숨 막히지만 농담과 장난은 잘 통함";
  else if(oldUncomfortable&&oldGoodRapport)migratedComfort="공간 공유는 불편하지만 대화는 편안함";
  else if(oldUncomfortable&&oldBadRapport)migratedComfort="함께 있으면 매우 불편하고 대화도 전혀 통하지 않음";
  else if(/편안|공유|무방비/.test(oldComfort||"")&&oldGoodRapport)migratedComfort="편안하고 농담과 장난이 잘 통함";
  else if(oldGoodRapport)migratedComfort="편안하고 농담과 장난이 잘 통함";
  else if(/편안|공유|무방비/.test(oldComfort||""))migratedComfort="함께 있는 건 편하지만 대화 호흡은 평범함";
  else if(oldUncomfortable)migratedComfort="긴장하고 대화도 조심스러움";
  const {rapport:_oldRapport,spaceComfort:_oldSpaceComfort,_editedFields:_editedFields,...cleanExplicit}=explicit;
  return {...defaults,...cleanExplicit,comfort:migratedComfort||defaults.comfort};
}
function relationshipIdentity(data){
  if(!data?.a||!data?.b||data.a===data.b)return"";
  const directional=data.type==="부모·자녀"||Boolean(data.directional);
  const pair=directional?`${data.a}>${data.b}`:[data.a,data.b].sort().join("~");
  return`${String(data.type||"친구")}|${pair}|${String(data.parentRole||"")}`;
}
function matchingRelationship(data,excludeId=""){
  const identity=relationshipIdentity(data);
  return identity?Object.values(state.relationships||{}).find(relation=>relation.id!==excludeId&&relationshipIdentity(relation)===identity):null;
}
export function addRelationship(data){
  const existing=matchingRelationship(data);
  if(existing){
    updateRelationship(existing.id,data);
    return existing.id;
  }
  const id=uid();
  state.deletedRelationshipIds=(state.deletedRelationshipIds||[]).filter(value=>value!==id);
  state.relationships[id]={id,...data};applyCohabit(state.relationships[id]);save(true);
  return id;
}
export function updateRelationship(id,data){
  const relation=state.relationships[id];if(!relation)return;
  const wasCohabiting=Boolean(relation.cohabit);
  Object.assign(relation,data);
  const duplicate=matchingRelationship(relation,id);
  if(duplicate){
    Object.assign(duplicate,relation,{id:duplicate.id});
    state.deletedRelationshipIds=Array.isArray(state.deletedRelationshipIds)?state.deletedRelationshipIds:[];
    if(!state.deletedRelationshipIds.includes(id))state.deletedRelationshipIds.push(id);
    delete state.relationships[id];
    applyCohabit(duplicate);
    save(true);
    return duplicate.id;
  }
  if(relation.cohabit)applyCohabit(relation);
  else if(wasCohabiting){
    const b=state.characters[relation.b];
    const linked=Object.values(state.relationships).some(other=>
      other.id!==relation.id&&other.cohabit&&(other.a===relation.b||other.b===relation.b)
    );
    if(b&&!linked){
      b.residences=(b.residences||[]).filter(item=>item.sourceRelationshipId!==relation.id);
      const primary=b.residences.find(item=>item.isPrimary)||b.residences[0];
      b.residences.forEach(item=>item.isPrimary=item===primary);
      b.homeId=primary?.homeId||"";
      b.sleepRoomId=primary?.sleepRoomId||"";
    }
  }
  save(true);
  return id;
}
export function toggleOwned(characterId,kind,itemId,persist=true){
  const c=state.characters[characterId];if(!c)return;
  c.inventory=c.inventory||{};const list=Array.isArray(c.inventory[kind])?[...c.inventory[kind]]:[];
  c.inventory[kind]=list.includes(itemId)?list.filter(x=>x!==itemId):[...list,itemId];if(persist)save(true);
}
export function deleteRelationship(id){
  if(!state.relationships[id])return;
  state.deletedRelationshipIds=Array.isArray(state.deletedRelationshipIds)?state.deletedRelationshipIds:[];
  if(!state.deletedRelationshipIds.includes(id))state.deletedRelationshipIds.push(id);
  delete state.relationships[id];
  save(true);
}
function applyCohabit(r){
  if(!r.cohabit)return;
  const a=state.characters[r.a],b=state.characters[r.b];if(!a||!b)return;
  const target=a.homeId;
  if(!target||!state.homes[target])return;
  b.residences=Array.isArray(b.residences)?b.residences:[];
  let residence=b.residences.find(item=>item.homeId===target);
  if(!residence){
    const home=state.homes[target],sleepRoomId=home.rooms?.bedroom?"bedroom":Object.keys(home.rooms||{})[0]||"";
    residence={homeId:target,role:"주거지",stayPattern:"상시 거주",visitDays:[],visitDates:"",notes:"",isPrimary:true,sleepRoomId,sourceRelationshipId:r.id};
    b.residences.push(residence);
  }
  b.residences.forEach(item=>item.isPrimary=item===residence);
  b.homeId=target;
  b.sleepRoomId=residence.sleepRoomId||"";
  b.townId=state.homes[target].townId||a.townId;
}
export function setWorldBackground(bg){state.world.bg=bg;save(true)}
function syncTown(){
  if(!state.activeTownId)return;
  const index=state.towns.findIndex(t=>t.id===state.activeTownId);
  if(index>=0)state.towns[index]={id:state.activeTownId,...clone(state.world)};
}
export function addTown(limit=2){
  if(state.towns.length>=limit)return null;
  syncTown();
  const id=uid(),base=fresh().world;
  const town={id,name:`새 마을 ${state.towns.length+1}`,bg:base.bg,era:"modern",places:[]};
  state.towns.push(town);state.activeTownId=id;state.world=clone(town);save(true);return id;
}
export function switchTown(id,{activeId}={}){
  syncTown();const town=state.towns.find(t=>t.id===id);if(!town)return;
  state.activeTownId=id;state.world=clone(town);
  const requestedCharacter=state.characters[activeId]?.townId===id?activeId:null;
  const localCharacter=requestedCharacter||state.order.find(cid=>state.characters[cid]?.townId===id);
  if(localCharacter)state.activeId=localCharacter;
  save(true);
}
export function deleteTown(id){
  if(state.towns.length<=1)return;
  state.towns=state.towns.filter(t=>t.id!==id);
  Object.values(state.characters).forEach(c=>{if(c.townId===id)c.townId=state.towns[0].id});
  Object.values(state.homes).forEach(home=>{if(home.townId===id)home.townId=state.towns[0].id});
  if(state.activeTownId===id){state.activeTownId=state.towns[0].id;state.world=clone(state.towns[0])}
  save(true);
}
export function addPlace(){
  const name=prompt("건물 이름","새 건물");if(!name)return;
  state.world.places.push({id:uid(),name,type:"기타",subtype:"",emoji:"🏬",image:"",interiorImage:"",imageScale:1,stock:[],priceRange:"보통",audiences:[],spicy:0,sweet:0,x:50,y:50,color:"#8ecbc0"});save(true);
}
export function movePlace(id,x,y,persist=true){const p=state.world.places.find(p=>p.id===id);if(p){p.x=x;p.y=y;if(persist)save()}}
export function replaceState(next){state=migrate(clone(next));localStorage.setItem(KEY,JSON.stringify(state))}
export function resetAll(){
  state=fresh();
  localStorage.removeItem(KEY);
  localStorage.removeItem("parallel-city-game-v4");
  localStorage.removeItem("parallel-city-game-v3");
  localStorage.removeItem(oldKey);
}
export const cloneState=()=>clone(state);
