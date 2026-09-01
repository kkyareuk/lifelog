const copy=(ko,en,ja)=>({ko,en,ja});

export const ACHIEVEMENTS=[
  {key:"first_character",resource:"achievement_first_character",icon:"🌱",goal:1,kind:"standard",title:copy("첫 서랍을 열다","Open the First Drawer","最初の引き出しを開く"),description:copy("첫 캐릭터를 만들었어요.","Create your first character.","最初のキャラクターを作成する。")},
  {key:"first_building",resource:"achievement_first_building",icon:"🔨",goal:1,kind:"standard",title:copy("마을에 첫 삽","The First Foundation","村の最初の一歩"),description:copy("마을에 건물이나 집을 직접 하나 추가했어요.","Add your first building or home to a town.","村に建物または家を初めて追加する。")},
  {key:"first_relationship",resource:"achievement_first_relationship",icon:"💞",goal:1,kind:"standard",title:copy("이어진 마음","A New Bond","結ばれた心"),description:copy("첫 공식 관계를 만들었어요.","Create your first official relationship.","最初の公式関係を作成する。")},
  {key:"first_dictionary_item",resource:"achievement_first_dictionary_item",icon:"📖",goal:1,kind:"standard",title:copy("사전의 첫 장","The First Entry","辞典の最初の一頁"),description:copy("사전에 첫 항목을 직접 추가했어요.","Add your first custom dictionary entry.","辞典に最初の項目を追加する。")},
  {key:"five_characters",resource:"achievement_five_characters",icon:"🧑‍🤝‍🧑",goal:5,kind:"incremental",title:copy("다섯 개의 이야기","Five Stories","五つの物語"),description:copy("캐릭터를 5명 만들어요.","Create five characters.","キャラクターを5人作成する。")},
  {key:"ten_buildings",resource:"achievement_ten_buildings",icon:"🏘️",goal:10,kind:"incremental",title:copy("제법 북적이는 마을","A Bustling Village","にぎやかな村"),description:copy("현재 마을들에 건물과 집을 합쳐 10개 배치해요.","Have ten buildings and homes across your towns.","すべての村に建物と家を合計10軒配置する。")},
  {key:"profile_complete",resource:"achievement_profile_complete",icon:"✒️",goal:6,kind:"incremental",title:copy("한 사람을 온전히 쓰다","A Character, Fully Written","ひとりを描ききる"),description:copy("한 캐릭터의 모습·기본생활·신체·성격·취향·옷장 설정을 모두 채워요.","Complete appearance, daily life, body, personality, tastes, and wardrobe for one character.","ひとりの外見・基本生活・身体・性格・好み・クローゼットをすべて設定する。")},
  {key:"three_towns",resource:"achievement_three_towns",icon:"🗺️",goal:3,kind:"incremental",title:copy("서랍 너머의 세계","Beyond One Drawer","引き出しの向こうへ"),description:copy("마을을 3개 만들어요.","Create three towns.","村を3つ作成する。")}
];

const present=value=>Array.isArray(value)?value.length>0:value!==null&&value!==undefined&&String(value).trim()!=="";
const notUnset=value=>present(value)&&!/^(설정하지 않음|지정 안 함|없음)$/.test(String(value).trim());
const catalogItems=world=>Object.values(world?.catalog||{}).flatMap(items=>Array.isArray(items)?items:[]);
const allPlaces=world=>{
  const towns=Array.isArray(world?.towns)?world.towns:[];
  const townPlaces=towns.flatMap(town=>Array.isArray(town?.places)?town.places:[]);
  const active=Array.isArray(world?.world?.places)?world.world.places:[];
  const unique=new Map([...townPlaces,...active].filter(Boolean).map(place=>[String(place.id||place.name),place]));
  return [...unique.values()];
};

export function characterSetupSections(character,world={}){
  if(!character)return {visual:false,profile:false,body:false,personality:false,taste:false,closet:false};
  const body=character.bodyProfile||{};
  const ownedFashion=(character.inventory?.fashion||[]).map(id=>(world.catalog?.fashion||[]).find(item=>item.id===id)).filter(Boolean);
  return {
    visual:Boolean(character.icon||character.photo)&&Boolean(character.ldImage),
    profile:!/^새 캐릭터$/.test(String(character.name||""))&&notUnset(character.gender)&&Boolean(character.birthday)&&notUnset(character.educationLevel)&&notUnset(character.lifeAdaptation),
    body:Boolean(body.heightCm&&body.weightKg)&&notUnset(body.bodySize)&&notUnset(body.heightImpression)&&Boolean((body.physicalTraits||[]).length||body.notes),
    personality:Boolean((character.personalityTypes||[]).length)&&Boolean((character.characterTraits||[]).length)&&notUnset(character.emotionalBaseline)&&notUnset(character.angerResponse)&&notUnset(character.flirtResponse),
    taste:Boolean((character.interests||[]).length)&&Boolean((character.hobbies||[]).length)&&Boolean(Object.values(character.favorites||{}).some(ids=>Array.isArray(ids)&&ids.length)),
    closet:Boolean(character.savedOutfits?.length||ownedFashion.length)
  };
}

export function achievementProgress(world={}){
  const characters=Object.values(world.characters||{}).filter(Boolean);
  const places=allPlaces(world);
  const homes=Object.values(world.homes||{}).filter(Boolean);
  const bundledPlaceIds=new Set(["cafe","food","office","clinic","park"]),characterIds=new Set(Object.keys(world.characters||{}));
  const manuallyCreated=[
    ...places.filter(item=>item.userCreated||item.createdAt||!bundledPlaceIds.has(String(item.id||""))),
    ...homes.filter(item=>item.userCreated||item.createdAt||!characterIds.has(String(item.id||"")))
  ];
  const bestProfile=characters.reduce((best,character)=>Math.max(best,Object.values(characterSetupSections(character,world)).filter(Boolean).length),0);
  return {
    first_character:characters.length,
    first_building:manuallyCreated.length,
    first_relationship:Object.keys(world.relationships||{}).length,
    first_dictionary_item:catalogItems(world).filter(item=>item.userCreated!==false).length,
    five_characters:characters.length,
    ten_buildings:places.length+homes.length,
    profile_complete:bestProfile,
    three_towns:(world.towns||[]).length
  };
}

export function evaluateAchievements(world={},now=Date.now()){
  const previous=world.achievements&&typeof world.achievements==="object"?world.achievements:{};
  const unlockedAt={...(previous.unlockedAt||{})},progress=achievementProgress(world);
  ACHIEVEMENTS.forEach(item=>{if(progress[item.key]>=item.goal&&!unlockedAt[item.key])unlockedAt[item.key]=now});
  return {version:1,progress,unlockedAt,lastGooglePlaySync:{...(previous.lastGooglePlaySync||{})}};
}

export function localizedAchievement(item,language="ko"){
  const lang=["ko","en","ja"].includes(language)?language:"ko";
  return {...item,title:item.title[lang],description:item.description[lang]};
}

export function achievementRows(world={},language="ko"){
  const evaluated=evaluateAchievements(world),unlocked=evaluated.unlockedAt;
  return ACHIEVEMENTS.map(item=>{
    const localized=localizedAchievement(item,language),value=Math.min(item.goal,Number(evaluated.progress[item.key])||0);
    return {...localized,value,unlocked:Boolean(unlocked[item.key]),unlockedAt:Number(unlocked[item.key])||0};
  });
}

function nativePlugin(){return window.Capacitor?.Plugins?.PlayGamesAchievements||null}
export async function googlePlayAchievementStatus(){
  const plugin=nativePlugin();
  if(!plugin)return {available:false,configured:false,authenticated:false,reason:"web"};
  try{return await plugin.status()}catch(error){return {available:true,configured:false,authenticated:false,reason:String(error?.message||error)}}
}
export async function signInGooglePlayAchievements(){
  const plugin=nativePlugin();if(!plugin)return {authenticated:false};return plugin.signIn();
}
export async function openGooglePlayAchievements(){
  const plugin=nativePlugin();if(!plugin)throw new Error("Google Play 게임즈는 Android 앱에서 열 수 있어요.");return plugin.show();
}
export async function syncGooglePlayAchievements(world={}){
  const plugin=nativePlugin();if(!plugin)return {synced:false,reason:"web"};
  const status=await googlePlayAchievementStatus();
  if(!status.configured||!status.authenticated)return {synced:false,...status};
  const evaluated=evaluateAchievements(world),calls=[];
  ACHIEVEMENTS.forEach(item=>{
    const value=Math.min(item.goal,Number(evaluated.progress[item.key])||0);
    if(item.kind==="incremental"&&value>0)calls.push(plugin.setSteps({resource:item.resource,steps:value}));
    else if(evaluated.unlockedAt[item.key])calls.push(plugin.unlock({resource:item.resource}));
  });
  await Promise.allSettled(calls);
  return {synced:true,count:calls.length};
}
