// Derived from the current scene, never accumulated by rendering or opening tabs.
const goodTown=new Set(['조용하고 평화로움','살기 좋음','주민들이 친절함','외지인을 환영함','자연 경관이 아름다움','의료·복지가 좋음']);
const badTown=new Set(['치안이 불안함','사건 사고가 잦음','환경 오염이 심함','폐쇄적인 곳']);
const text=(language,ko,en,ja)=>language==='en'?en:language==='ja'?ja:ko;
export function moodContext(character,entry,world){
  const home=entry?.home?world.homes?.[entry.visitHomeId||character.homeId]:null;
  const townId=home?.townId||entry?.townId||character.townId;
  const town=world.world?.id===townId?world.world:(world.towns||[]).find(t=>t.id===townId);
  const place=home||(town?.places||[]).find(p=>p.id===entry?.placeId);
  return {town,place};
}
export function characterMood(character,entry,world,language=world.uiLanguage||'ko'){
  const {town,place}=moodContext(character,entry,world),reasons=[];
  const add=(value,ko,en,ja)=>reasons.push({value,text:text(language,ko,en,ja)});
  if(goodTown.has(town?.reputation))add(12,'마을의 좋은 생활 환경','Welcoming village environment','暮らしやすい村の環境');
  if(badTown.has(town?.reputation))add(-16,'마을 환경에 대한 걱정','Concerns about the village','村の環境への不安');
  if(/좋|훌륭|명성|친절|사랑받음|유명한 명소/.test(place?.reputation||''))add(8,'평판이 좋은 장소에서 안심함','Reassured by this place’s reputation','評判のよい場所で安心');
  if(/나쁨|불친절|악명|악평|위험/.test(place?.reputation||''))add(-12,'장소의 평판이 신경 쓰임','Uneasy about this place’s reputation','場所の評判が気になる');
  const values=value=>Array.isArray(value)?value:typeof value==='string'?[value]:[];
  const traits=[...values(character.personality),...values(character.traits),...values(character.interests),...values(character.hobbies)].join(' ');
  const quiet=/조용|평온|차분|아늑|편안/.test(place?.atmosphere||'');
  const busy=/시끌|소란|붐비|북적|활기/.test(place?.atmosphere||'');
  if(quiet)add(8,'조용하고 편안한 공간','A calm, comfortable space','静かで落ち着く空間');
  if(/어둡고 음침/.test(place?.atmosphere||''))add(-6,'어두운 분위기에 긴장함','Tense in a gloomy space','薄暗い雰囲気に緊張');
  if(busy)add(/외향|사교|활발/.test(traits)?8:-6,'활기찬 공간에 대한 반응','Response to a lively space','にぎやかな空間への反応');
  if(/매우 높|혼잡|빽빽/.test(town?.density||'')&&/내향|조용|신중/.test(traits))add(-6,'붐비는 마을에서 느끼는 피로','Tired by the crowded village','混み合う村での疲れ');
  if(entry?.home&&Number(place?.cleanliness)<30)add(-10,'정리가 필요한 집','The house needs tidying','片付けが必要な家');
  if(/자는 중|잠든|휴식|쉬는 중|sleeping|resting|taking a break|眠|休憩|休ん/iu.test(entry?.baseTitle||entry?.title||''))add(6,'휴식하며 회복 중','Recovering through rest','休息で回復中');
  if(/싸우|다투|불편|화가|갈등|fighting|arguing|conflict|喧嘩|口論|言い争/iu.test(entry?.baseTitle||entry?.title||''))add(-18,'현재의 불편한 사건','An uncomfortable current event','今の気まずい出来事');
  const score=Math.max(-100,Math.min(100,reasons.reduce((n,r)=>n+r.value,0)));
  const label=score>=20?text(language,'기분 좋음','Feeling good','ご機嫌'):score<=-15?text(language,'기분 가라앉음','Feeling low','気分が沈む'):text(language,'평온함','Feeling calm','穏やか');
  return {score,label,icon:score>=20?'☀':score<=-15?'☁':'◌',reasons,placeName:place?.name||town?.name||'',tone:score>=20?'good':score<=-15?'low':'calm'};
}
export function environmentConversation(character,entry,world){
  const {town,place}=moodContext(character,entry,world),language=world.uiLanguage||'ko';
  if(place?.atmosphere&&!/지정|설정|정하지/.test(place.atmosphere))return text(language,`잠시 ${place.name}의 ‘${place.atmosphere}’ 분위기를 이야기했어요.`,`They talked about the atmosphere at ${place.name}.`,`${place.name}の雰囲気について話しました。`);
  if(town?.reputation&&!/알려지지|설정|지정/.test(town.reputation))return text(language,`${town.name}이 ‘${town.reputation}’으로 알려진 이야기를 나눴어요.`,`They talked about ${town.name}'s reputation.`,`${town.name}の評判について話しました。`);
  return '';
}
