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
  living:{name:"거실",type:"living",image:"",furniture:["소파","TV","책장"]},
  kitchen:{name:"주방",type:"kitchen",image:"",furniture:["냉장고","조리대","식탁"]},
  entry:{name:"현관",type:"entry",image:"",furniture:["신발장","전신거울"]},
  bath:{name:"욕실",type:"bath",image:"",furniture:["샤워부스","세면대"]},
  bedroom:{name:"침실",type:"bedroom",image:"",furniture:["침대","옷장"]},
  study:{name:"서재·취미방",type:"study",image:"",furniture:["책상","컴퓨터"]}
});
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
const fresh=()=>({schema:8,activeTab:"character",characterPane:"profile",activeId:null,activeHomeId:null,activeTownId:null,homeEditMode:false,buildingLabelMode:"full",lastSaved:0,characters:{},order:[],homes:{},relationships:{},characterViews:{},routines:{},dailyPlans:{},catalog:defaultCatalog(),towns:[],world:{name:"서랍마을",bg:"world-assets/cozy-town.png",places:[
  {id:"cafe",name:"달무리 카페",type:"카페",emoji:"☕",image:"",imageScale:1,stock:["drink-ein","drink-matcha","food-tiramisu"],priceRange:"보통",servicePrice:"보통",audiences:[],spicy:0,sweet:3,x:15,y:34,color:"#74c7bd"},
  {id:"food",name:"달무리 식당",type:"음식점",emoji:"🍽️",image:"",imageScale:1,stock:["food-omurice","food-malatang"],priceRange:"보통",servicePrice:"보통",audiences:["아재 입맛","어린이 입맛"],spicy:2,sweet:2,x:55,y:22,color:"#86ca7b"},
  {id:"office",name:"서랍 오피스",type:"사무실",subtype:"일반 회사",emoji:"🏢",image:"",imageScale:1,stock:[],priceRange:"보통",servicePrice:"보통",audiences:[],spicy:0,sweet:0,x:79,y:37,color:"#8c9df0"},
  {id:"clinic",name:"새봄 의원",type:"병원",emoji:"🩺",image:"",imageScale:1,stock:[],priceRange:"보통",servicePrice:"보통",audiences:[],spicy:0,sweet:0,x:21,y:68,color:"#6db7e8"},
  {id:"park",name:"별꼬리 공원",type:"공원",emoji:"🌳",image:"",imageScale:1,stock:[],priceRange:"무료",servicePrice:"무료",audiences:[],spicy:0,sweet:0,x:64,y:76,color:"#66c68a"}
]}});

function migrate(x){
  if(!x)return normalizeHomes(fresh());
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
  if(x.activeTab==="wardrobe")x.activeTab="catalog";
  x.schema=8;
  x.buildingLabelMode=["full","name","none"].includes(x.buildingLabelMode)?x.buildingLabelMode:"full";
  x.mapCharacterLabelMode=["name","none"].includes(x.mapCharacterLabelMode)?x.mapCharacterLabelMode:"none";
  x.mapLabelMode=["full","name","none"].includes(x.mapLabelMode)?x.mapLabelMode:"full";
  x.observeHomeId=x.homes?.[x.observeHomeId]?x.observeHomeId:null;
  x.characterPane=["profile","personality","taste","worldTaste"].includes(x.characterPane)?x.characterPane:"profile";
  if(Array.isArray(x.characters)){
    const list=x.characters.filter(Boolean);
    x.characters=Object.fromEntries(list.map(c=>[c.id||uid(),c]));
    x.order=list.map(c=>c.id).filter(Boolean);
  }
  x.characters=x.characters&&typeof x.characters==="object"?x.characters:{};
  const characterIds=Object.keys(x.characters);
  x.order=Array.isArray(x.order)?x.order.filter((id,index,list)=>x.characters[id]&&list.indexOf(id)===index):[];
  characterIds.forEach(id=>{if(!x.order.includes(id))x.order.push(id)});
  x.activeId=x.characters[x.activeId]?x.activeId:(x.order[0]||null);
  if(Array.isArray(x.homes))x.homes=Object.fromEntries(x.homes.filter(Boolean).map(h=>[h.id||uid(),h]));
  x.homes=x.homes&&typeof x.homes==="object"?x.homes:{};
  x.routines=x.routines&&typeof x.routines==="object"?x.routines:{};
  x.dailyPlans=x.dailyPlans&&typeof x.dailyPlans==="object"?x.dailyPlans:{};
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
  });
  const relationList=Array.isArray(x.relationships)?x.relationships:Object.values(x.relationships||{});
  x.relationships={};
  const relationIdsByKey=new Map();
  relationList.filter(Boolean).forEach(relation=>{
    const id=relation.id||uid();
    const typeMap={"폴리 관계":"연인","절친":"친구","대학 동기":"젊은 날의 친구들"};
    relation.type=typeMap[relation.type]||relation.type||"친구";
    relation.interactions=Array.isArray(relation.interactions)?relation.interactions:[];
    relation.interactionsAll=Boolean(relation.interactionsAll);
    relation.touchIntensity=relation.touchIntensity||(["연인","부부"].includes(relation.type)?"자연스럽게 표현함":"가끔 가벼운 접촉");
    relation.stage=relation.stage||({
      연인:"편안한 연인",부부:"생활 동반자",친구:"편한 친구",혐관:"신경전 중",짝사랑:"멀리서 바라봄"
    }[relation.type]||"편안함");
    if(x.characters[relation.a]&&x.characters[relation.b]&&relation.a!==relation.b){
      const directional=relation.type==="짝사랑"||relation.type==="부모·자녀"||relation.type==="보호·피보호"||relation.directional;
      const pair=directional?`${relation.a}>${relation.b}`:[relation.a,relation.b].sort().join("~");
      const key=`${relation.type}|${pair}|${relation.parentRole||relation.protectionRole||""}`;
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
  x.world=x.world&&typeof x.world==="object"?x.world:defaultWorld;
  x.world.name=x.world.name||defaultWorld.name;
  x.world.bg=x.world.bg||defaultWorld.bg;
  x.world.places=Array.isArray(x.world.places)?x.world.places:clone(defaultWorld.places);
  x.towns=Array.isArray(x.towns)&&x.towns.length?x.towns:[{id:uid(),...clone(x.world)}];
  x.towns=x.towns.map(t=>({id:t.id||uid(),name:t.name||"이름 없는 마을",bg:t.bg||defaultWorld.bg,era:t.era==="medieval"?"medieval":"modern",places:Array.isArray(t.places)?t.places:[]}));
  x.towns.forEach(t=>t.places.forEach(p=>{p.iconPreset=p.iconPreset||({
    "카페":"cafe","음식점":"restaurant","식당":"restaurant","사무실":"office","병원":"hospital",
    "공원":"park","학교":"school","옷가게":"clothing","공연장":"theater","숙박":"hotel",
    "백화점":"department","도서관":"library"
  }[p.type]||"shop")}));
  x.activeTownId=x.towns.some(t=>t.id===x.activeTownId)?x.activeTownId:x.towns[0].id;
  x.world=clone(x.towns.find(t=>t.id===x.activeTownId));
  const defaultsCatalog=defaultCatalog();
  x.catalog=x.catalog||defaultsCatalog;
  Object.keys(defaultsCatalog).forEach(kind=>{
    x.catalog[kind]=Array.isArray(x.catalog[kind])?x.catalog[kind].map(item=>({...item,kind:item.kind||kind})):defaultsCatalog[kind];
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
    h.cars=Array.isArray(h.cars)?h.cars.map(car=>({
      id:car.id||uid(),name:car.name||"우리 집 자동차",type:car.type||"승용차",
      color:car.color||"",seats:Number.isFinite(+car.seats)?Math.max(1,Math.min(12,+car.seats)):5,
      image:car.image||""
    })):[];
    h.pets=Array.isArray(h.pets)?h.pets.map(p=>({
      id:p.id||uid(),name:p.name||"새 식구",species:p.species||"기타",
      breed:p.breed||"",sex:p.sex||"모름",neutered:Boolean(p.neutered),
      photo:p.photo||"",icon:p.icon||"",room:p.room||"living",
      customSpecies:p.customSpecies||"",size:["소형","중형","대형"].includes(p.size)?p.size:"중형",
      temperaments:Array.isArray(p.temperaments)?p.temperaments:[],
      bodyTraits:Array.isArray(p.bodyTraits)?p.bodyTraits:[],
      needsWalk:p.needsWalk===undefined?["강아지","호랑이","드래곤"].includes(p.species):Boolean(p.needsWalk),
      rideable:p.rideable===undefined?["호랑이","드래곤"].includes(p.species):Boolean(p.rideable)
    })):[];
    h.rooms=h.rooms||{};
    h.deletedRoomKeys=Array.isArray(h.deletedRoomKeys)?[...new Set(h.deletedRoomKeys.map(String))]:[];
    Object.entries(defaults).forEach(([key,value])=>{
      if(h.deletedRoomKeys.includes(key))return;
      h.rooms[key]={...value,...(h.rooms[key]||{})};
      h.rooms[key].type=h.rooms[key].type||key;
      h.rooms[key].furniture=Array.isArray(h.rooms[key].furniture)?[...h.rooms[key].furniture]:[...value.furniture];
    });
    Object.entries(h.rooms).forEach(([key,room])=>room.type=room.type||(["living","kitchen","entry","bath","bedroom","study"].includes(key)?key:"other"));
    h.cleanliness=Number.isFinite(h.cleanliness)?h.cleanliness:100;
  });
  Object.values(x.characters||{}).forEach(c=>{
    c.townId=x.towns.some(t=>t.id===c.townId)?c.townId:x.towns[0].id;
    x.routines[c.id]=Array.isArray(x.routines[c.id])?x.routines[c.id].map(r=>({
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
    c.neatness=c.neatness||"보통";
    c.interference=c.interference==="철저히 선을 지킴"?"요청할 때만 도움":c.interference||"적당히 관여";
    c.conflictStyle=c.conflictStyle||"대화로 해결";
    c.affectionStyle=c.affectionStyle||"행동으로 표현";
    c.energyRhythm=c.energyRhythm||"상황에 따라";
    c.activityTempo=c.activityTempo||"상황에 따라";
    c.fashionSense=c.fashionSense||"보통";
    c.savedOutfits=Array.isArray(c.savedOutfits)?c.savedOutfits.map(outfit=>({
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
    c.jobTitle=typeof c.jobTitle==="string"?c.jobTitle:"";
    c.workplaceId=c.workplaceId||"";
    c.spiceTolerance=Number.isFinite(+c.spiceTolerance)?Math.max(0,Math.min(5,+c.spiceTolerance)):2;
    c.sweetPreference=Number.isFinite(+c.sweetPreference)?Math.max(0,Math.min(5,+c.sweetPreference)):2;
    c.socialEnergy=Number.isFinite(+c.socialEnergy)?Math.max(0,Math.min(6,+c.socialEnergy)):3;
    c.sensingIntuition=Number.isFinite(+c.sensingIntuition)?Math.max(0,Math.min(6,+c.sensingIntuition)):3;
    c.thinkingFeeling=Number.isFinite(+c.thinkingFeeling)?Math.max(0,Math.min(6,+c.thinkingFeeling)):3;
    c.perceivingJudging=Number.isFinite(+c.perceivingJudging)?Math.max(0,Math.min(6,+c.perceivingJudging)):3;
    c.theme={primary:"#176b60",secondary:"#6fd0ae",gradient:true,...(c.theme||{})};
    c.gender=["남성","여성","그외"].includes(c.gender)?c.gender:"그외";
    c.attractedGenders=Array.isArray(c.attractedGenders)?[...new Set(c.attractedGenders)]:[];
    c.touchReaction=c.touchReaction||"상황에 따라 자연스럽게 받아들임";
    c.appearanceLevel=c.appearanceLevel||"보통";
    c.appearanceInterest=c.appearanceInterest||"보통";
    c.appearanceTags=Array.isArray(c.appearanceTags)?[...new Set(c.appearanceTags)]:[];
    c.attractionTraits=Array.isArray(c.attractionTraits)?[...new Set(c.attractionTraits)]:[];
    c.relationshipOpenness=["연인이 있으면 다른 사람에게 끌리지 않음","아주 드물게 호감을 느낌","관계와 별개로 호감을 느낄 수 있음","새로운 사람에게 쉽게 끌림"].includes(c.relationshipOpenness)?c.relationshipOpenness:"연인이 있으면 다른 사람에게 끌리지 않음";
    c.homeId=c.homeId||c.id;
    if(!x.homes[c.homeId])x.homes[c.homeId]={id:c.homeId,name:`${c.name||"캐릭터"}의 집`,image:"",rooms:rooms(),pets:[],cleanliness:100};
    const homeRooms=x.homes[c.homeId].rooms||rooms();
    c.sleepRoomId=homeRooms[c.sleepRoomId]?c.sleepRoomId:(homeRooms.bedroom?"bedroom":Object.keys(homeRooms)[0]);
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
export function save(immediate=false){
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
    window.dispatchEvent(new Event("parallel-city-saved"));
  };
  immediate?run():timer=setTimeout(run,140);
}
export function createCharacter(limit=5){
  if(state.order.length>=Math.max(1,Number(limit)||5))return null;
  const id=uid();
  state.characters[id]={id,name:"새 캐릭터",createdAt:Date.now(),ageGroup:"성인",gender:"그외",attractedGenders:[],touchReaction:"상황에 따라 자연스럽게 받아들임",appearanceLevel:"보통",appearanceInterest:"보통",appearanceTags:[],attractionTraits:[],job:"무직",jobTitle:"",workplaceId:"",photo:"",icon:"",wake:"07:30",wakeHabit:"알람을 듣고 천천히 일어남",sleep:"00:30",sleepHabit:"이불을 단정히 덮고 잠",income:"필요한 만큼 소비",spiceTolerance:2,sweetPreference:2,socialEnergy:3,sensingIntuition:3,thinkingFeeling:3,perceivingJudging:3,fashionSense:"보통",savedOutfits:[],theme:{primary:"#176b60",secondary:"#6fd0ae",gradient:true},tastes:[],interests:[],hobbies:[],musicGenres:[],foodTypes:[],foodPreferences:[],drinks:[],favorites:{},inventory:{},homeId:id};
  state.order.push(id);
  state.characters[id].townId=state.activeTownId;
  state.homes[id]={id,name:"새 캐릭터의 집",image:"",rooms:rooms(),pets:[],cleanliness:100};
  state.routines[id]=[];
  state.activeId=id;state.activeTab="character";save(true);return id;
}
export function setActive(id){if(state.characters[id]){state.activeId=id;save()}}
export function setCharacterPane(value){state.characterPane=["profile","personality","taste","worldTaste"].includes(value)?value:"profile";save()}
export function moveCharacter(id,direction){
  const from=state.order.indexOf(id),to=from+direction;
  if(from<0||to<0||to>=state.order.length)return;
  [state.order[from],state.order[to]]=[state.order[to],state.order[from]];
  save(true);
}
export function deleteCharacter(id){
  if(!state.characters[id])return;
  const homeId=state.characters[id].homeId;
  delete state.characters[id];
  state.order=state.order.filter(characterId=>characterId!==id);
  Object.keys(state.relationships).forEach(relationId=>{
    const relation=state.relationships[relationId];
    if(relation.a===id||relation.b===id)delete state.relationships[relationId];
  });
  delete state.routines[id];
  if(homeId&&!state.order.some(characterId=>state.characters[characterId]?.homeId===homeId))delete state.homes[homeId];
  state.activeId=state.order[0]||null;
  save(true);
}
export function updateCharacter(id,patch,persist=true){
  const c=state.characters[id];if(!c)return;
  Object.assign(c,patch);
  if(patch.townId){
    state.order.forEach(otherId=>{const other=state.characters[otherId];if(other&&other.id!==id&&other.homeId===c.homeId)other.townId=patch.townId});
  }
  if(persist)save();
}
export function addRoutine(characterId){
  if(!state.characters[characterId])return;
  state.routines[characterId]=Array.isArray(state.routines[characterId])?state.routines[characterId]:[];
  const routine={id:uid(),day:1,start:"09:00",end:"10:00",type:"개인 일정",title:"새 일정",placeId:"",withIds:[],notes:""};
  state.routines[characterId].push(routine);save(true);return routine.id;
}
export function updateRoutine(characterId,routineId,patch){
  const routine=state.routines[characterId]?.find(item=>item.id===routineId);if(!routine)return;
  Object.assign(routine,patch);save(true);
}
export function deleteRoutine(characterId,routineId){
  state.routines[characterId]=(state.routines[characterId]||[]).filter(item=>item.id!==routineId);save(true);
}
export function toggleChip(id,key,value){
  const c=state.characters[id];
  const own=Array.isArray(c[key])?[...c[key]]:[];
  c[key]=own.includes(value)?own.filter(x=>x!==value):[...own,value];
  save(true);
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
export function addRoom(homeId){
  const h=state.homes[homeId];if(!h)return;
  h.rooms=h.rooms||rooms();
  const key=`room-${uid()}`;
  h.rooms[key]={name:"새 방",type:"other",image:"",furniture:[...ROOM_FURNITURE.other]};
  save(true);
  return key;
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
  chosen.forEach(id=>state.characters[id].homeId=homeId);
  state.order.forEach(id=>{
    const c=state.characters[id];
    if(c.homeId===homeId&&!chosen.has(id)){
      c.homeId=c.id;
      if(!state.homes[c.id])state.homes[c.id]={id:c.id,name:`${c.name}의 집`,image:"",rooms:rooms(),pets:[],cleanliness:100};
    }
  });
  state.activeHomeId=homeId;save(true);
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
export function toggleFavorite(characterId,kind,itemId){
  const c=state.characters[characterId];if(!c)return;
  c.favorites=c.favorites||{};const list=Array.isArray(c.favorites[kind])?[...c.favorites[kind]]:[];
  c.favorites[kind]=list.includes(itemId)?list.filter(x=>x!==itemId):[...list,itemId];save(true);
}
export function togglePlaceStock(placeId,itemId){
  const p=state.world.places.find(x=>x.id===placeId);if(!p)return;
  const list=Array.isArray(p.stock)?[...p.stock]:[];
  p.stock=list.includes(itemId)?list.filter(x=>x!==itemId):[...list,itemId];save(true);
}
export function setActiveHome(id){if(state.homes[id]){state.activeHomeId=id;save()}}
export function characterViewFor(sourceId,targetId){
  const explicit=state.characterViews?.[sourceId]?.[targetId]||{};
  const relation=Object.values(state.relationships||{}).find(item=>
    (item.a===sourceId&&item.b===targetId)||(item.a===targetId&&item.b===sourceId)
  );
  let defaults={overall:"낯선 사람으로 여김",awareness:"자기 감정을 분명히 자각함",trust:"조심스럽게 지켜봄",closeness:"낯선 사이",comfort:"조심스러움",annoyance:"전혀 귀찮지 않음",attention:"관심 없음",jealousy:"질투하지 않음"};
  if(relation){
    if(["연인","부부"].includes(relation.type))defaults={...defaults,overall:"좋아함",trust:"어느 정도 믿음",closeness:"가까운 사이",comfort:"편안함",attention:"종종 신경 씀"};
    else if(["혐관","원수"].includes(relation.type)||/원수|이별 통보|이혼 서류/.test(relation.stage||""))defaults={...defaults,overall:"매우 싫어함",trust:"전혀 믿지 않음",closeness:"거리감 있음",comfort:"매우 불편함",annoyance:"보기만 해도 피곤함"};
    else if(["친구","가족","유사가족","부모·자녀","보호·피보호"].includes(relation.type))defaults={...defaults,overall:"소중하게 여김",trust:"어느 정도 믿음",closeness:"가까운 사이",comfort:"편안함",attention:"종종 신경 씀"};
    else defaults={...defaults,overall:"그저 그런 사람",trust:"보통",closeness:"보통",comfort:"보통",attention:"필요할 때만 봄"};
  }
  return {...defaults,...explicit};
}
export function addRelationship(data){const id=uid();state.relationships[id]={id,...data};applyCohabit(state.relationships[id]);save(true)}
export function updateRelationship(id,data){
  const relation=state.relationships[id];if(!relation)return;
  const wasCohabiting=Boolean(relation.cohabit);
  Object.assign(relation,data);
  if(relation.cohabit)applyCohabit(relation);
  else if(wasCohabiting){
    const b=state.characters[relation.b];
    const linked=Object.values(state.relationships).some(other=>
      other.id!==relation.id&&other.cohabit&&(other.a===relation.b||other.b===relation.b)
    );
    if(b&&!linked){
      b.homeId=b.id;
      if(!state.homes[b.id])state.homes[b.id]={id:b.id,name:`${b.name}의 집`,image:"",rooms:rooms(),cleanliness:100};
    }
  }
  save(true);
}
export function toggleOwned(characterId,kind,itemId){
  const c=state.characters[characterId];if(!c)return;
  c.inventory=c.inventory||{};const list=Array.isArray(c.inventory[kind])?[...c.inventory[kind]]:[];
  c.inventory[kind]=list.includes(itemId)?list.filter(x=>x!==itemId):[...list,itemId];save(true);
}
export function deleteRelationship(id){
  if(!state.relationships[id])return;
  delete state.relationships[id];
  save(true);
}
function applyCohabit(r){
  if(!r.cohabit)return;
  const a=state.characters[r.a],b=state.characters[r.b];if(!a||!b)return;
  const target=a.homeId||a.id,old=b.homeId||b.id;
  b.homeId=target;
  b.townId=a.townId;
  if(!state.homes[target])state.homes[target]={id:target,name:`${a.name}의 집`,image:"",rooms:rooms(),cleanliness:100};
  if(old!==target&&!state.order.some(id=>state.characters[id]?.homeId===old))delete state.homes[old];
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
export function switchTown(id){
  syncTown();const town=state.towns.find(t=>t.id===id);if(!town)return;
  state.activeTownId=id;state.world=clone(town);
  const localCharacter=state.order.find(cid=>state.characters[cid]?.townId===id);
  if(localCharacter)state.activeId=localCharacter;
  save(true);
}
export function deleteTown(id){
  if(state.towns.length<=1)return;
  state.towns=state.towns.filter(t=>t.id!==id);
  Object.values(state.characters).forEach(c=>{if(c.townId===id)c.townId=state.towns[0].id});
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
