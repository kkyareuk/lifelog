// Mood is derived from the scene. Opening a screen never accumulates or mutates it.
const goodTown=new Set(['매우 좋은 평판','좋은 평판','조용하고 평화로움','살기 좋음','주민들이 친절함','외지인을 환영함','자연 경관이 아름다움','의료·복지가 좋음']);
const badTown=new Set(['나쁜 평판','매우 나쁜 평판','치안이 불안함','사건 사고가 잦음','환경 오염이 심함','폐쇄적인 곳']);
const text=(language,ko,en,ja)=>language==='en'?en:language==='ja'?ja:ko;
const values=value=>Array.isArray(value)?value:typeof value==='string'?[value]:[];
const hash=value=>[...String(value)].reduce((number,char)=>(number*31+char.charCodeAt(0))>>>0,2166136261);
const traitsOf=character=>[...values(character.personalityTypes),...values(character.characterTraits),...values(character.interests),...values(character.hobbies),character.socialStyle,character.energyRhythm,character.emotionalExpression].filter(Boolean).join(' ');

export function moodContext(character,entry,world){
  const home=entry?.home?world.homes?.[entry.visitHomeId||character.homeId]:null;
  const townId=home?.townId||entry?.townId||character.townId;
  const town=world.world?.id===townId?world.world:(world.towns||[]).find(value=>value.id===townId);
  const place=home||(town?.places||[]).find(value=>value.id===entry?.placeId);
  return {town,place};
}

export function characterMood(character,entry,world,language=world.uiLanguage||'ko'){
  const {town,place}=moodContext(character,entry,world),reasons=[],traits=traitsOf(character),copy=`${entry?.baseTitle||entry?.title||''} ${entry?.desc||''}`,restrained=/과묵|냉정|무뚝뚝|엄격|표정 변화가 거의 없음|감정을 잘 드러내지 않음|절제/.test(traits),outgoing=/외향|활발|사교|무리의 중심|가만히 못/.test(traits);
  const positiveEvent=/성공|칭찬|선물|맛있|즐거|데이트|웃|success|praise|gift|delicious|enjoy|date|laugh|成功|褒め|贈り物|おいし|楽しい|デート|笑/i;
  const angryEvent=/싸우|다투|불편|분노|화가|갈등|짜증|fight|argu|anger|conflict|upset|irritat|喧嘩|争|怒|衝突|不快/i;
  const sadEvent=/실패|거절|상실|울었|슬프|속상|fail|reject|loss|cry|sad|失敗|拒絶|喪失|泣|悲/i;
  const tiredEvent=/피곤|지쳤|야근|밤샘|졸리|tired|exhaust|overtime|all.nighter|sleepy|疲|夜更|眠い/i;
  const restEvent=/자는 중|잠든|휴식|쉬는 중|sleep|rest|眠って|睡眠|休ん/i;
  const add=(value,ko,en,ja)=>reasons.push({value,text:text(language,ko,en,ja)});
  const day=entry?.date||new Date().toISOString().slice(0,10),moment=entry?.interactionId||entry?.minute||entry?.placeId||entry?.room||'scene',rawVariation=(hash(`${character.id}:${day}:${moment}`)%25)-12,variation=restrained?Math.round(rawVariation*.35):rawVariation;
  if(Math.abs(variation)>=4)add(variation,variation>0?'오늘의 생활 리듬이 평소보다 가벼움':'오늘의 생활 리듬이 평소보다 무거움',variation>0?'Today’s rhythm feels lighter than usual':'Today’s rhythm feels heavier than usual',variation>0?'今日は普段より生活のリズムが軽い':'今日は普段より生活のリズムが重い');
  if(goodTown.has(town?.reputation))add(8,'마을의 좋은 생활 환경','Welcoming village environment','暮らしやすい村の環境');
  if(badTown.has(town?.reputation))add(-10,'마을 환경에 대한 걱정','Concerns about the village','村の環境への不安');
  if(/좋|훌륭|친절|사랑받음/.test(place?.reputation||''))add(7,'평판이 좋은 장소에서 안심함','Reassured by this place’s reputation','評判のよい場所で安心');
  if(/나쁨|불친절|악평|위험/.test(place?.reputation||''))add(-11,'장소의 평판이 신경 쓰임','Uneasy about this place’s reputation','場所の評判が気になる');
  const quiet=/조용|평온|차분|아늑|편안/.test(place?.atmosphere||''),busy=/시끌|소란|붐비|북적|활기/.test(place?.atmosphere||'');
  if(quiet)add(outgoing?-7:8,outgoing?'너무 잔잔한 공간이 오래 이어져 지루함':'조용한 공간이라 긴장이 풀림','Reaction to a very quiet space','静かな空間への反応');
  if(busy)add(outgoing?9:-8,outgoing?'주변 사람들의 활기에서 힘을 얻음':'소란한 공간에 오래 있어 기가 빨림','Response to a lively space','にぎやかな空間への反応');
  const home=entry?.home?world.homes?.[entry.visitHomeId||character.homeId]:null;
  if(home){
    if(Number(home.cleanliness)>=75)add(5,'정돈된 집에서 편안함','Comforted by a tidy home','整った家で落ち着く');
    if(Number(home.cleanliness)<35)add(-10,'집 안의 어수선함이 신경 쓰임','The untidy home is distracting','家の散らかりが気になる');
    if(/아름다움|매우 아름다움|근사/.test(home.beautyLevel||''))add(5,'마음에 드는 집의 분위기','Enjoying the atmosphere at home','気に入った家の雰囲気');
  }
  const companionIds=[entry?.withId,...values(entry?.withIds),...values(entry?.participantOrder)].filter(id=>id&&id!==character.id),companionId=companionIds[0],companion=world.characters?.[companionId];
  if(companion){
    const relationship=Object.values(world.relationships||{}).find(value=>values(value?.memberIds||value?.characterIds||value?.members).includes(character.id)&&values(value?.memberIds||value?.characterIds||value?.members).includes(companionId)),relationText=JSON.stringify(relationship||{});
    if(/연인|사랑|친구|가족|배우자|신뢰|친밀/.test(relationText))add(10,`${companion.name}와 편안하게 시간을 보내는 중`,`Comfortable spending time with ${companion.name}`,`${companion.name}と穏やかに過ごしている`);
    else if(/적대|불신|갈등|싫어|경계/.test(relationText))add(-12,`${companion.name}와의 관계 때문에 긴장함`,`Tense because of the relationship with ${companion.name}`,`${companion.name}との関係で緊張している`);
    else add(outgoing?4:1,`${companion.name}와 함께하는 행동의 영향`,`Affected by spending time with ${companion.name}`,`${companion.name}と一緒にいる影響`);
  }
  const workEvent=/출근|업무|근무|회사|직장|회의|보고서|마감|work|office|shift|meeting|deadline/i.test(copy),hardWork=/야근|마감|초과|압박|바쁨|실수|overtime|deadline|pressure|busy|mistake/i.test(copy);
  if(workEvent)add(hardWork?-17:-6,hardWork?'업무량과 압박이 커서 스트레스가 쌓임':'일하는 동안 긴장을 유지해 조금 피로함',hardWork?'Workload and pressure are causing stress':'Staying focused at work is tiring',hardWork?'仕事量と圧力でストレスがたまる':'仕事中の緊張で少し疲れている');
  const dressCodes=[place?.dressCode,[...(world.routines?.[character.id]||[]),...(world.monthlyRoutines?.[character.id]||[])].find(value=>String(value.id)===String(entry?.routineId))?.dressCode].filter(code=>code?.enabled);
  if(dressCodes.length){
    const owned=new Set(character.inventory?.fashion||[]),clothes=(world.catalog?.fashion||[]).filter(item=>owned.has(item.id)),matches=clothes.some(item=>dressCodes.some(code=>(!code.requiredUniform||item.requiredUniform)&&(!code.formality||code.formality==='지정 안 함'||item.formality===code.formality)&&((code.colors||[]).length===0||(item.colors||[]).some(color=>(code.colors||[]).includes(color)))));
    add(matches?4:-8,matches?'장소와 일정에 어울리는 옷을 입어 안정감이 듦':'입은 옷과 드레스코드가 어긋나 신경 쓰임',matches?'The outfit fits the dress code':'The outfit clashes with the dress code',matches?'服装がドレスコードに合って安心':'服装とドレスコードが合わず気になる');
  }
  if(positiveEvent.test(copy))add(18,'기쁜 사건이 있었음','Something uplifting happened','うれしい出来事があった');
  if(angryEvent.test(copy))add(-25,'불편하거나 화나는 사건','An upsetting event','不快な出来事');
  if(sadEvent.test(copy))add(-22,'마음이 가라앉는 사건','A saddening event','悲しい出来事');
  if(tiredEvent.test(copy))add(-15,'피로가 쌓임','Fatigue has built up','疲れがたまっている');
  if(restEvent.test(copy))add(6,'휴식하며 회복 중','Recovering through rest','休息で回復中');
  const score=Math.max(-100,Math.min(100,reasons.reduce((number,reason)=>number+reason.value,0)));
  let label,icon,tone;
  if(tiredEvent.test(copy)){label=text(language,'피곤함','Tired','疲れている');icon='☾';tone='tired'}
  else if(angryEvent.test(copy)){label=text(language,'화남','Angry','怒っている');icon='⚡';tone='angry'}
  else if(score>=28&&!restrained){label=text(language,'들뜸','Excited','浮き立っている');icon='✦';tone='excited'}
  else if(score>=22&&restrained){label=text(language,'만족함','Satisfied','満足');icon='◆';tone='good'}
  else if(score>=7){label=text(language,'기분 좋음','Feeling good','ご機嫌');icon='☀';tone='good'}
  else if(score<=-22){label=text(language,'슬픔','Sad','悲しい');icon='☂';tone='sad'}
  else if(score<=-6){label=text(language,'긴장함','Tense','緊張している');icon='☁';tone='tense'}
  else if(quiet&&outgoing){label=text(language,'지루함','Bored','退屈');icon='…';tone='bored'}
  else if((hash(`${character.id}:${day}:neutral`)%3)===0){label=text(language,'차분함','Composed','落ち着いている');icon='◇';tone='calm'}
  else if((hash(`${character.id}:${day}:neutral`)%3)===1){label=text(language,'무덤덤함','Unruffled','淡々としている');icon='—';tone='calm'}
  else {label=text(language,'평온함','Feeling calm','穏やか');icon='◌';tone='calm'}
  return {score,label,icon,reasons,placeName:place?.name||town?.name||'',tone};
}

export function environmentConversation(character,entry,world){
  const {town,place}=moodContext(character,entry,world),language=world.uiLanguage||'ko',traits=traitsOf(character),outgoing=/외향|활발|사교|무리의 중심|가만히 못/.test(traits),nature=/자연|식물|산책|조용|내향|혼자가 편/.test(traits);
  if(place?.atmosphere&&!/지정|설정|정하지/.test(place.atmosphere)){
    if(/조용|차분|아늑/.test(place.atmosphere))return text(language,nature?`${place.name}의 소리가 낮아 생각을 정리하기 좋다고 말했어요.`:`${place.name}은 너무 조용해서 시간이 느리게 가는 것 같다고 말했어요.`,nature?`They said the quiet at ${place.name} made it easy to collect their thoughts.`:`They said ${place.name} felt so quiet that time seemed to slow down.`,nature?`${place.name}は静かで考えを整理しやすいと話しました。`:`${place.name}は静かすぎて時間がゆっくり進むようだと話しました。`);
    if(/활기|북적|시끌/.test(place.atmosphere))return text(language,outgoing?`${place.name}의 북적이는 소리를 들으니 덩달아 신이 난다고 말했어요.`:`${place.name}은 오래 머물면 기가 빨릴 것 같다고 말했어요.`,outgoing?`They said the bustle at ${place.name} lifted their energy.`:`They said staying at busy ${place.name} for long would be draining.`,outgoing?`${place.name}のにぎわいで自分まで楽しくなると話しました。`:`${place.name}に長くいると疲れそうだと話しました。`);
  }
  const reputation=town?.reputation||'';
  if(/좋은 평판|살기 좋|평화/.test(reputation))return text(language,nature?`${town.name}에서는 서두르지 않고 걷는 시간이 좋다고 말했어요.`:outgoing?`${town.name}은 편안하지만 밤에는 조금 더 활기가 있었으면 좋겠다고 말했어요.`:`${town.name}의 고즈넉한 분위기가 오래 지내기 좋다고 말했어요.`,`They described what living in ${town.name} feels like to them.`,`${town.name}で暮らす雰囲気について具体的に話しました。`);
  if(/나쁜 평판|위험|사건/.test(reputation))return text(language,`${town.name}에서 늦게 다닐 때 피해야 할 길과 귀가 시간을 구체적으로 확인했어요.`,`They compared routes and times to avoid when returning late in ${town.name}.`,`${town.name}で遅く帰る時に避ける道と時間を具体的に確認しました。`);
  return '';
}
