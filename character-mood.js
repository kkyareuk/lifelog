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
  const {town,place}=moodContext(character,entry,world),reasons=[],supports=[],traits=traitsOf(character),copy=`${entry?.baseTitle||entry?.title||''} ${entry?.desc||''}`,baseline=character.emotionalBaseline||'',volatility=character.moodVolatility||'상황에 따라 달라짐',positiveResponse=character.positiveMoodResponse||'',stressResponse=character.stressMoodResponse||'',recoveryStyle=character.moodRecoveryStyle||'',angerResponse=character.angerResponse||'차분히 이유를 확인함',flirtResponse=character.flirtResponse||'알아도 모른 척함',restrained=/과묵|냉정|무뚝뚝|엄격|표정 변화가 거의 없음|감정을 잘 드러내지 않음|절제/.test(traits)||positiveResponse==='조용히 만족함',outgoing=/외향|활발|사교|무리의 중심|가만히 못/.test(traits),optimistic=/낙천|대체로 밝/.test(baseline)||/낙천|긍정|밝고|명랑|쾌활/.test(traits),resilient=optimistic||/온화|다정|느긋|침착|강인|무던|인내/.test(traits),sensitive=/걱정|비관/.test(baseline)||/예민|불안|걱정|신경질|감정 기복|까칠|성급|충동/.test(traits);
  const positiveEvent=/성공|칭찬|선물|맛있|즐거|데이트|웃|success|praise|gift|delicious|enjoy|date|laugh|成功|褒め|贈り物|おいし|楽しい|デート|笑/i;
  const angryEvent=/싸우|다투|불편|분노|화가|갈등|짜증|fight|argu|anger|conflict|upset|irritat|喧嘩|争|怒|衝突|不快/i;
  const sadEvent=/실패|거절|상실|울었|슬프|속상|fail|reject|loss|cry|sad|失敗|拒絶|喪失|泣|悲/i;
  const tiredEvent=/피곤|지쳤|야근|밤샘|졸리|tired|exhaust|overtime|all.nighter|sleepy|疲|夜更|眠い/i;
  const restEvent=/자는 중|잠든|휴식|쉬는 중|sleep|rest|眠って|睡眠|休ん/i;
  const flirtEvent=/유혹|플러팅|호감 신호|눈빛을 보냄|flirt|come.?on|誘惑|好意のサイン/i;
  const add=(value,ko,en,ja)=>reasons.push({value,text:text(language,ko,en,ja)});
  const support=(value,ko,en,ja)=>supports.push({value,text:text(language,ko,en,ja)});
  const day=entry?.date||new Date().toISOString().slice(0,10),moment=entry?.interactionId||entry?.minute||entry?.placeId||entry?.room||'scene',rawVariation=(hash(`${character.id}:${day}:${moment}`)%22)-14,volatilityScale=({"거의 흔들리지 않음":.35,"안정적인 편":.65,"상황에 따라 달라짐":1,"변화가 잦은 편":1.2,"변화 폭이 큼":1.45}[volatility]||1),temperVariation=rawVariation<0?(resilient?Math.round(rawVariation*.55):sensitive?Math.round(rawVariation*1.15):rawVariation):rawVariation,variation=Math.round((restrained?temperVariation*.7:temperVariation)*volatilityScale),baselineBias=({"낙천적인 편":5,"대체로 밝은 편":3,"현실적인 편":0,"무덤덤한 편":0,"걱정이 많은 편":-2,"비관적인 편":-4}[baseline]||0);
  if(baselineBias)add(baselineBias,baselineBias>0?'평소 정서가 밝은 쪽으로 기울어 있음':'평소 걱정과 부정적인 가능성을 먼저 살피는 편',baselineBias>0?'Their usual outlook leans bright':'They tend to notice worries and negative possibilities first',baselineBias>0?'普段の気持ちは明るい方へ傾きやすい':'普段は心配や悪い可能性を先に考えやすい');
  if(Math.abs(variation)>=4)add(variation,variation>0?'오늘의 생활 리듬이 평소보다 가벼움':'오늘의 생활 리듬이 평소보다 무거움',variation>0?'Today’s rhythm feels lighter than usual':'Today’s rhythm feels heavier than usual',variation>0?'今日は普段より生活のリズムが軽い':'今日は普段より生活のリズムが重い');
  if(goodTown.has(town?.reputation))support(1,'마을의 좋은 생활 환경이 마음을 받쳐 줌','The village environment provides a little reassurance','暮らしやすい村の環境が少し心を支える');
  if(badTown.has(town?.reputation))add(-10,'마을 환경에 대한 걱정','Concerns about the village','村の環境への不安');
  if(/좋|훌륭|친절|사랑받음/.test(place?.reputation||''))support(2,'평판이 좋은 장소라 조금 안심됨','This well-regarded place feels reassuring','評判のよい場所で少し安心する');
  if(/나쁨|불친절|악평|위험/.test(place?.reputation||''))add(-11,'장소의 평판이 신경 쓰임','Uneasy about this place’s reputation','場所の評判が気になる');
  const quiet=/조용|평온|차분|아늑|편안/.test(place?.atmosphere||''),busy=/시끌|소란|붐비|북적|활기/.test(place?.atmosphere||'');
  if(quiet)(outgoing?add(-7,'너무 잔잔한 공간이 오래 이어져 지루함','The prolonged quiet feels boring','静かすぎる時間が続いて退屈している'):support(3,'조용한 공간이라 긴장이 조금 풀림','The quiet space eases some tension','静かな空間で少し緊張がほどける'));
  if(busy)(outgoing?support(3,'주변 사람들의 활기에서 조금 힘을 얻음','The surrounding bustle gives a little energy','周囲のにぎわいから少し元気をもらう'):add(-8,'소란한 공간에 오래 있어 기가 빨림','The busy space is draining','にぎやかな空間に長くいて疲れる'));
  const home=entry?.home?world.homes?.[entry.visitHomeId||character.homeId]:null;
  if(home){
    if(Number(home.cleanliness)>=75)support(2,'정돈된 집이라 덜 신경 쓰임','A tidy home removes a small source of stress','整った家で気がかりが少し減る');
    if(Number(home.cleanliness)<35)add(-10,'집 안의 어수선함이 신경 쓰임','The untidy home is distracting','家の散らかりが気になる');
    if(/아름다움|매우 아름다움|근사/.test(home.beautyLevel||''))support(1,'마음에 드는 집의 분위기가 작은 위안이 됨','The atmosphere at home offers a little comfort','気に入った家の雰囲気が小さな慰めになる');
  }
  const companionIds=[entry?.withId,...values(entry?.withIds),...values(entry?.participantOrder)].filter(id=>id&&id!==character.id),companionId=companionIds[0],companion=world.characters?.[companionId];
  if(companion){
    const relationship=Object.values(world.relationships||{}).find(value=>values(value?.memberIds||value?.characterIds||value?.members).includes(character.id)&&values(value?.memberIds||value?.characterIds||value?.members).includes(companionId)),relationText=JSON.stringify(relationship||{});
    if(/연인|사랑|친구|가족|배우자|신뢰|친밀/.test(relationText))support(3,`${companion.name}와 함께라 평소보다 마음이 놓임`,`Being with ${companion.name} feels reassuring`,`${companion.name}と一緒なので普段より安心する`);
    else if(/적대|불신|갈등|싫어|경계/.test(relationText))add(-12,`${companion.name}와의 관계 때문에 긴장함`,`Tense because of the relationship with ${companion.name}`,`${companion.name}との関係で緊張している`);
    else if(outgoing)support(1,`${companion.name}와 함께라 혼자일 때보다 덜 심심함`,`Company makes the moment less dull`,`${companion.name}と一緒なので一人より退屈しない`);
  }
  const workEvent=/출근|업무|근무|회사|직장|회의|보고서|마감|work|office|shift|meeting|deadline/i.test(copy),hardWork=/야근|마감|초과|압박|바쁨|실수|overtime|deadline|pressure|busy|mistake/i.test(copy);
  if(workEvent)add(hardWork?-17:-6,hardWork?'업무량과 압박이 커서 스트레스가 쌓임':'일하는 동안 긴장을 유지해 조금 피로함',hardWork?'Workload and pressure are causing stress':'Staying focused at work is tiring',hardWork?'仕事量と圧力でストレスがたまる':'仕事中の緊張で少し疲れている');
  const dressCodes=[place?.dressCode,[...(world.routines?.[character.id]||[]),...(world.monthlyRoutines?.[character.id]||[])].find(value=>String(value.id)===String(entry?.routineId))?.dressCode].filter(code=>code?.enabled);
  if(dressCodes.length){
    const owned=new Set(character.inventory?.fashion||[]),clothes=(world.catalog?.fashion||[]).filter(item=>owned.has(item.id)),matches=clothes.some(item=>dressCodes.some(code=>(!code.requiredUniform||item.requiredUniform)&&(!code.formality||code.formality==='지정 안 함'||item.formality===code.formality)&&((code.colors||[]).length===0||(item.colors||[]).some(color=>(code.colors||[]).includes(color)))));
    if(matches)support(2,'장소와 일정에 어울리는 옷이라 덜 신경 쓰임','The outfit fits the dress code','服装がドレスコードに合って気が楽になる');
    else add(-8,'입은 옷과 드레스코드가 어긋나 신경 쓰임','The outfit clashes with the dress code','服装とドレスコードが合わず気になる');
  }
  const clockMinute=value=>{const match=String(value||'').match(/^(\d{1,2}):(\d{2})$/);return match?Math.max(0,Math.min(1439,Number(match[1])*60+Number(match[2]))):null},sceneMinute=Number.isFinite(Number(entry?.minute))?Number(entry.minute):null,wakeMinute=clockMinute(character.wake),sleepMinute=clockMinute(character.sleep);
  if(sceneMinute!==null&&wakeMinute!==null){const afterWake=(sceneMinute-wakeMinute+1440)%1440;if(afterWake<75&&/천천히|여러 번|뒹굶|비몽사몽|깨워/.test(character.wakeHabit||''))add(-5,'아직 잠이 덜 깨 몸과 생각이 무거움','Still groggy after waking up','まだ目が覚めきらず体も頭も重い')}
  if(sceneMinute!==null&&sleepMinute!==null){const untilSleep=(sleepMinute-sceneMinute+1440)%1440;if(untilSleep<90&&!restEvent.test(copy))add(-5,'평소 잘 시간이 가까워져 집중력이 떨어짐','Focus is fading near the usual bedtime','いつもの就寝時刻が近づき集中力が落ちている')}
  // A comfortable town, home, relationship, and outfit are buffers. They must not
  // stack into automatic happiness: keep only the strongest supports, capped at +5.
  supports.sort((a,b)=>b.value-a.value);let supportTotal=0;
  for(const item of supports){const value=Math.min(item.value,5-supportTotal);if(value>0){reasons.push({...item,value});supportTotal+=value}if(supportTotal>=5)break}
  const angerNegated=/불편.{0,12}(없|않)|문제.{0,12}(없|않)|갈등.{0,12}(없|않)|다투지|싸우지|no (discomfort|problem|conflict)|without (arguing|conflict)|問題.{0,10}(ない|なく)|不快.{0,10}(ない|なく)|争わず|喧嘩せず/i.test(copy),hasPositiveEvent=positiveEvent.test(copy),hasAngryEvent=angryEvent.test(copy)&&!angerNegated,hasSadEvent=sadEvent.test(copy),hasTiredEvent=tiredEvent.test(copy);
  if(hasPositiveEvent)add(22,'기쁜 사건이 있었음','Something uplifting happened','うれしい出来事があった');
  if(hasAngryEvent)add(-28,'불편하거나 화나는 사건','An upsetting event','不快な出来事');
  if(hasSadEvent)add(-24,'마음이 가라앉는 사건','A saddening event','悲しい出来事');
  if(hasTiredEvent)add(-16,'피로가 쌓임','Fatigue has built up','疲れがたまっている');
  if(flirtEvent.test(copy)){
    if(/당황|거리|경계/.test(flirtResponse))add(-8,'호감 신호를 받아 경계하거나 당황함','A flirtatious signal made them wary or flustered','好意のサインを受けて警戒したり戸惑ったりしている');
    else if(/은근히|장난스럽게|직접 호응/.test(flirtResponse))add(10,'호감 신호를 자기 방식으로 받아들임','They welcomed the signal in their own way','好意のサインを自分らしく受け止めた');
  }
  if(restEvent.test(copy))add(recoveryStyle==='쉬거나 자면서 회복'?7:3,'쉬면서 조금씩 회복 중','Recovering gradually through rest','休みながら少しずつ回復している');
  const score=Math.max(-100,Math.min(100,reasons.reduce((number,reason)=>number+reason.value,0)));
  let label,icon,tone;
  if(hasTiredEvent){label=text(language,'피곤함','Tired','疲れている');icon='☾';tone='tired'}
  else if(hasAngryEvent&&(/목소리가 커짐|즉시 잘못을 따짐|해결책을 분명히 요구함/.test(angerResponse)||stressResponse==='화부터 남')){label=text(language,'화남','Angry','怒っている');icon='⚡';tone='angry'}
  else if(hasAngryEvent&&(stressResponse==='말수가 줄어듦'||stressResponse==='아무렇지 않은 척함')){label=text(language,'가라앉음','Subdued','沈んでいる');icon='◒';tone='calm'}
  else if(hasAngryEvent){label=text(language,stressResponse==='걱정이 많아짐'?'걱정스러움':'긴장함',stressResponse==='걱정이 많아짐'?'Worried':'Tense',stressResponse==='걱정이 많아짐'?'心配している':'緊張している');icon='☁';tone='tense'}
  else if(score>=30&&!restrained&&positiveResponse==='기쁨이 크게 드러남'){label=text(language,'들뜸','Excited','浮き立っている');icon='✦';tone='excited'}
  else if(score>=30&&!restrained){label=text(language,'기분 좋음','Feeling good','ご機嫌');icon='☀';tone='good'}
  else if(score>=24&&restrained){label=text(language,'만족함','Satisfied','満足');icon='◆';tone='good'}
  else if(score>=11){label=text(language,'기분 좋음','Feeling good','ご機嫌');icon='☀';tone='good'}
  else if(score<=-24){label=text(language,'슬픔','Sad','悲しい');icon='☂';tone='sad'}
  else if(score<=-8){
    if((stressResponse==='화부터 남'||/목소리가 커짐|즉시 잘못을 따짐|해결책을 분명히 요구함/.test(angerResponse))&&hasAngryEvent){label=text(language,'화남','Angry','怒っている');icon='⚡';tone='angry'}
    else if(stressResponse==='말수가 줄어듦'||stressResponse==='아무렇지 않은 척함'){label=text(language,'가라앉음','Subdued','沈んでいる');icon='◒';tone='calm'}
    else if(stressResponse==='걱정이 많아짐'){label=text(language,'걱정스러움','Worried','心配している');icon='☁';tone='tense'}
    else {label=text(language,'긴장함','Tense','緊張している');icon='☁';tone='tense'}
  }
  else if(quiet&&outgoing){label=text(language,'지루함','Bored','退屈');icon='…';tone='bored'}
  else if(optimistic){label=text(language,'기분 좋음','Feeling good','ご機嫌');icon='☀';tone='good'}
  else if(baseline==='무덤덤한 편'){label=text(language,'무덤덤함','Unruffled','淡々としている');icon='—';tone='calm'}
  else if((hash(`${character.id}:${day}:neutral`)%2)===0){label=text(language,'차분함','Composed','落ち着いている');icon='◇';tone='calm'}
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
