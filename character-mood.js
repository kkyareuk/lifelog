// Mood is derived from the scene. Opening a screen never accumulates or mutates it.
const goodTown=new Set(['매우 좋은 평판','좋은 평판','조용하고 평화로움','살기 좋음','주민들이 친절함','외지인을 환영함','자연 경관이 아름다움','의료·복지가 좋음']);
const badTown=new Set(['나쁜 평판','매우 나쁜 평판','치안이 불안함','사건 사고가 잦음','환경 오염이 심함','폐쇄적인 곳']);
const text=(language,ko,en,ja)=>language==='en'?en:language==='ja'?ja:ko;
const values=value=>Array.isArray(value)?value:typeof value==='string'?[value]:[];
const hash=value=>[...String(value)].reduce((number,char)=>(number*31+char.charCodeAt(0))>>>0,2166136261);
const hasFinalConsonant=value=>{const code=String(value||'').trim().charCodeAt(String(value||'').trim().length-1)-0xac00;return code>=0&&code<=11171&&code%28!==0};
const particle=(value,withFinal,withoutFinal)=>`${value}${hasFinalConsonant(value)?withFinal:withoutFinal}`;
const traitsOf=character=>[...values(character.personalityTypes),...values(character.characterTraits),...values(character.interests),...values(character.hobbies),character.socialStyle,character.perceptionStyle,character.decisionStyle,character.planningStyle,character.activityTempo,character.interference,character.neatness,character.diligence,character.conflictStyle,character.affectionStyle,character.energyRhythm,character.humorStyle,character.emotionalExpression].filter(Boolean).join(' ');

export function moodContext(character,entry,world){
  const home=entry?.home?world.homes?.[entry.visitHomeId||character.homeId]:null;
  const townId=home?.townId||entry?.townId||character.townId;
  const town=world.world?.id===townId?world.world:(world.towns||[]).find(value=>value.id===townId);
  const place=home||(town?.places||[]).find(value=>value.id===entry?.placeId);
  return {town,place};
}

const preferenceTerms=(character,world,mode="likes")=>{
  const fields=mode==="dislikes"
    ?["dislikedStoryGenres","dislikedFoodPreferences","dislikedDrinks","dislikedMusicGenres","dislikedVideoGenres","dislikedGameGenres","dislikedScentNotes","dislikedAnimals","dislikedElectronics","dislikedWeapons","dislikedBooks"]
    :["interests","hobbies","foodPreferences","drinks","musicGenres","favoriteStoryGenres","favoriteVideoGenres","favoriteGameGenres","favoriteScentNotes","favoriteAnimals","favoriteElectronics","favoriteWeapons","favoriteBooks"];
  const direct=fields.flatMap(field=>values(character[field]));
  const collection=mode==="dislikes"?character.dislikes:character.favorites;
  const catalog=Object.entries(collection||{}).flatMap(([kind,ids])=>values(ids).map(id=>(world.catalog?.[kind]||[]).find(item=>String(item.id)===String(id))?.name));
  return [...new Set([...direct,...catalog].map(value=>String(value||"").trim()).filter(value=>value.length>=2))];
};
const termsInCopy=(terms,copy)=>terms.filter(term=>copy.includes(term)).slice(0,3);

const relationshipFor=(sourceId,targetId,world)=>Object.values(world.relationships||{}).find(value=>{
  const members=[value?.a,value?.b,...values(value?.memberIds),...values(value?.characterIds),...values(value?.members)].filter(Boolean);
  return members.includes(sourceId)&&members.includes(targetId);
});
const relationshipCopy=view=>Object.values(view||{}).filter(value=>typeof value==='string').join(' ');

export function relationshipAppraisal(character,entry,world,language=world.uiLanguage||'ko'){
  const companionIds=[entry?.withId,...values(entry?.withIds),...values(entry?.participantOrder),...values(entry?.coLocatedIds)]
    .filter((id,index,list)=>id&&id!==character.id&&list.indexOf(id)===index);
  const appraisals=companionIds.map(companionId=>{
    const companion=world.characters?.[companionId];
    if(!companion)return null;
    const relationship=relationshipFor(character.id,companionId,world);
    const view=world.characterViews?.[character.id]?.[companionId]||{};
    const copy=relationshipCopy(view),official=`${relationship?.type||''} ${relationship?.stage||''}`,overall=String(view.overall||''),hasDirectedOverall=Boolean(overall&&!/그저 그런|낯선 사람/.test(overall));
    const loveHate=/애증/.test(overall);
    const loving=/연애 감정|깊이 사랑|없어서는 안 될|운명의 상대/.test(overall)||(!hasDirectedOverall&&/연인|부부/.test(official));
    const friendly=loving||loveHate||/인간적인 호감|친구로 좋아|소중하게|존경|동경|안쓰럽게/.test(overall)||(!hasDirectedOverall&&/친구|소꿉친구|부모·자녀|형제·자매/.test(official));
    const hostile=/매우 싫|싫어|미워|증오|혐오|원망|적대|탐탁지|꺼림/.test(`${view.overall||''} ${official}`);
    const guardedOverall=/경계함|불편해함|부담스러워함|경쟁심/.test(overall);
    const annoyed=/가끔 성가|종종 귀찮|많이 귀찮|보기만 해도 피곤|자주 성가/.test(view.annoyance||'');
    const aggressive=/거친 말을 하고 싶은|밀어내고 싶은|해치고 싶은|죽이고 싶을 만큼/.test(view.aggression||'');
    const unaware=/어렴풋|착각|전혀 모름|부정/.test(view.awareness||'');
    const uncomfortable=/숨 막|공간 공유는 불편|매우 불편|긴장하고 대화도 조심/.test(view.comfort||'');
    const distrust=/전혀 믿지|의심함|조심스럽게 지켜봄/.test(view.trust||'');
    const conflict=/가끔 부딪|자주 충돌|격렬하게 충돌|파국적인 충돌/.test(view.conflictIntensity||'');
    const attentive=/종종 신경|자주 살핌|늘 최우선/.test(view.attention||'');
    let score=0;
    if(loving)score+=11; else if(loveHate)score+=7; else if(/소중하게|존경|동경|안쓰럽게/.test(view.overall||''))score+=8; else if(friendly)score+=6; else if(/흥미롭게/.test(overall))score+=2;
    if(/가장 가까운 사람/.test(view.closeness||''))score+=5; else if(/가까운 사이|편한 사이/.test(view.closeness||''))score+=3;
    if(/공간도 대화도 완벽|말없이 함께 있어도 편안|편안하고 농담/.test(view.comfort||''))score+=4;
    if(attentive&&friendly)score+=2;
    if(hostile)score-=16;
    if(loveHate)score-=12;
    if(guardedOverall)score-=5;
    if(uncomfortable)score-=uncomfortable&&/매우 불편|숨 막/.test(view.comfort||'')?10:6;
    if(distrust)score-= /전혀 믿지/.test(view.trust||'')?8:4;
    if(annoyed)score-= /보기만 해도|많이 귀찮|자주 성가/.test(view.annoyance||'')?7:3;
    if(conflict)score-= /파국|격렬/.test(view.conflictIntensity||'')?12:/자주 충돌/.test(view.conflictIntensity||'')?7:3;
    if(aggressive)score-= /해치고|죽이고|밀어내고/.test(view.aggression||'')?9:3;
    const contradictory=friendly&&(hostile||annoyed||aggressive||uncomfortable||distrust);
    let kind='neutral';
    if(loveHate||(friendly&&hostile))kind='love-hate';
    else if(contradictory&&unaware)kind='misread-affection';
    else if(contradictory)kind='conflicted-affection';
    else if(loving)kind='loving';
    else if(friendly)kind='friendly';
    else if(hostile&&/증오|혐오|미워|매우 싫/.test(copy))kind='hatred';
    else if(hostile||guardedOverall||uncomfortable||distrust)kind='guarded';
    const presence=entry?.coLocatedIds?.includes(companionId)&&!entry?.withId;
    const detail=kind==='misread-affection'
      ?text(language,`${companion.name}에게 끌리고 소중히 여기면서도 성가심과 거친 말 충동이 뒤섞였고, 그 마음을 단순한 불편함이라고 잘못 여기고 있음`,`They are drawn to and treasure ${companion.name}, yet annoyance and an urge to speak harshly are mixed in; they mistake this tangle for mere discomfort.`,`${companion.name}に惹かれ大切に思う一方、煩わしさやきつい言葉を言いたい衝動も混ざり、その複雑さを単なる居心地の悪さだと勘違いしている`)
      :kind==='love-hate'
        ?text(language,`${particle(companion.name,'을','를')} 향한 애정과 강한 반감이 동시에 올라와 마음이 팽팽하게 맞섬`,`Affection and strong resentment toward ${companion.name} are pulling in opposite directions.`,`${companion.name}への愛情と強い反感が同時に湧き、気持ちがせめぎ合っている`)
        :kind==='conflicted-affection'
          ?text(language,`${particle(companion.name,'을','를')} 좋아하고 아끼지만 성가심이나 경계도 함께 느껴 마음이 복잡함`,`They care for ${companion.name}, but annoyance or wariness makes the feeling complicated.`,`${companion.name}を好み大切にしているが、煩わしさや警戒もあり気持ちが複雑になっている`)
          :kind==='loving'
            ?text(language,presence?`좋아하는 ${particle(companion.name,'과','와')} 같은 공간에 있는 것만으로 마음이 따뜻해짐`:`${particle(companion.name,'을','를')} 사랑하고 함께 있는 시간이 정서적인 버팀목이 됨`,presence?`Simply sharing the space with ${companion.name}, whom they love, feels warm.`:`Being with ${companion.name}, whom they love, gives emotional support.`,presence?`好きな${companion.name}と同じ空間にいるだけで心が温かくなる`:`愛する${companion.name}と一緒にいる時間が心の支えになる`)
            :kind==='friendly'
              ?text(language,presence?`우호적인 ${particle(companion.name,'과','와')} 같은 공간에 있어 긴장이 조금 풀림`:`${particle(companion.name,'과','와')} 함께라 평소보다 마음이 놓임`,presence?`Sharing the space with friendly ${companion.name} eases some tension.`:`Being with ${companion.name} feels reassuring.`,presence?`好意的な${companion.name}と同じ空間にいて少し緊張がほどける`:`${companion.name}と一緒なので普段より安心する`)
              :kind==='hatred'
                ?text(language,presence?`싫어하는 ${particle(companion.name,'과','와')} 같은 공간에 있어 신경이 곤두섬`:`${particle(companion.name,'을','를')} 향한 강한 반감 때문에 긴장을 늦추지 못함`,presence?`Sharing the space with ${companion.name}, whom they hate, puts them on edge.`:`Strong hostility toward ${companion.name} keeps them tense.`,presence?`嫌っている${companion.name}と同じ空間にいて神経が尖っている`:`${companion.name}への強い反感で緊張を解けない`)
                :kind==='guarded'
                  ?text(language,presence?`${particle(companion.name,'과','와')} 같은 공간에 있는 것만으로 경계심이 올라감`:`${particle(companion.name,'과','와')}의 불편하거나 불신하는 관계 때문에 조심스러움`,presence?`Simply sharing the space with ${companion.name} raises their guard.`:`Discomfort or distrust around ${companion.name} makes them cautious.`,presence?`${companion.name}と同じ空間にいるだけで警戒心が強まる`:`${companion.name}との居心地の悪さや不信感で慎重になっている`)
                  :'';
    return {companion,relationship,view,score,kind,detail,flags:{loving,friendly,hostile,annoyed,aggressive,unaware,uncomfortable,distrust,conflict,contradictory}};
  }).filter(Boolean);
  appraisals.sort((a,b)=>Math.abs(b.score)-Math.abs(a.score));
  return appraisals;
}

export function characterMood(character,entry,world,language=world.uiLanguage||'ko'){
  const {town,place}=moodContext(character,entry,world),reasons=[],supports=[],traits=traitsOf(character),copy=`${entry?.baseTitle||entry?.title||''} ${entry?.desc||''}`,baseline=character.emotionalBaseline||'',volatility=character.moodVolatility||'상황에 따라 달라짐',positiveResponse=character.positiveMoodResponse||'',stressResponse=character.stressMoodResponse||'',recoveryStyle=character.moodRecoveryStyle||'',angerResponse=character.angerResponse||'차분히 이유를 확인함',flirtResponse=character.flirtResponse||'알아도 모른 척함',emotionalSensitivity=character.emotionalSensitivity||'보통',emotionalContagion=character.emotionalContagion||'상황에 따라 물듦',restrained=/과묵|냉정|무뚝뚝|엄격|표정 변화가 거의 없음|감정을 잘 드러내지 않음|절제/.test(traits)||positiveResponse==='조용히 만족함',outgoing=/외향|활발|사교|무리의 중심|가만히 못/.test(traits),optimistic=/낙천|밝은|쾌활/.test(baseline)||/낙천|긍정|밝고|명랑|쾌활/.test(traits),resilient=optimistic||/온화|다정|느긋|침착|강인|무던|인내/.test(traits),sensitive=/예민|걱정|불안|침울|비관|까칠|분노/.test(baseline)||/예민|불안|걱정|신경질|감정 기복|까칠|성급|충동/.test(traits);
  const sourceTitle=String(entry?.baseTitle||entry?.title||'').trim(),sourceDesc=String(entry?.desc||'').trim(),minute=Number(entry?.minute),sourceTime=String(entry?.time||'').trim()||(Number.isFinite(minute)?`${String(Math.floor(minute/60)%24).padStart(2,'0')}:${String(minute%60).padStart(2,'0')}`:'');
  if(/자는 중|잠든|수면 중|sleeping|asleep|眠って|睡眠中/i.test(copy))return {score:0,label:text(language,'수면 중','Sleeping','睡眠中'),icon:'☾',reasons:[],placeName:place?.name||town?.name||'',tone:'sleeping',sourceEntry:sourceTitle?{time:sourceTime,title:sourceTitle,desc:sourceDesc}:null};
  const positiveEvent=/성공|칭찬|선물|맛있|즐거|데이트|웃|success|praise|gift|delicious|enjoy|date|laugh|成功|褒め|贈り物|おいし|楽しい|デート|笑/i;
  // 단순한 신체·공간의 '불편'이나 "불편하지 않도록" 같은 배려 문장은
  // 분노 사건이 아니다. 실제 충돌이나 감정 손상을 드러낸 말만 분노로 본다.
  const angryEvent=/싸우|다투|분노|화가|갈등|짜증|불쾌|모욕|무시당|배신|fight|argu|anger|conflict|upset|irritat|insult|betray|喧嘩|争|怒|衝突|不快|侮辱|裏切/i;
  const sadEvent=/실패|거절|상실|울었|슬프|속상|fail|reject|loss|cry|sad|失敗|拒絶|喪失|泣|悲/i;
  const tiredEvent=/피곤|지쳤|야근|밤샘|졸리|tired|exhaust|overtime|all.nighter|sleepy|疲|夜更|眠い/i;
  const restEvent=/자는 중|잠든|휴식|쉬는 중|sleep|rest|眠って|睡眠|休ん/i;
  const flirtEvent=/유혹|플러팅|호감 신호|눈빛을 보냄|flirt|come.?on|誘惑|好意のサイン/i;
  const add=(value,ko,en,ja)=>reasons.push({value,text:text(language,ko,en,ja)});
  const support=(value,ko,en,ja)=>supports.push({value,text:text(language,ko,en,ja)});
  const sensitivityScale=({"매우 둔감함":.55,"둔감한 편":.75,"보통":1,"예민한 편":1.25,"매우 예민함":1.55}[emotionalSensitivity]||1),eventValue=value=>Math.round(value*sensitivityScale);
  const day=entry?.date||new Date().toISOString().slice(0,10),moment=entry?.interactionId||entry?.minute||entry?.placeId||entry?.room||'scene',rawVariation=(hash(`${character.id}:${day}:${moment}`)%22)-14,volatilityScale=({"거의 흔들리지 않음":.35,"안정적인 편":.65,"상황에 따라 달라짐":1,"변화가 잦은 편":1.2,"변화 폭이 큼":1.45}[volatility]||1),temperVariation=rawVariation<0?(resilient?Math.round(rawVariation*.55):sensitive?Math.round(rawVariation*1.15):rawVariation):rawVariation,variation=Math.round((restrained?temperVariation*.7:temperVariation)*volatilityScale),baselineBias=({"매우 낙천적임":7,"낙천적인 편":5,"대체로 밝은 편":3,"쾌활한 편":4,"열정적인 편":2,"다정한 편":2,"유혹적인 편":1,"호기심 많은 편":1,"차분한 편":1,"현실적인 편":0,"무덤덤한 편":0,"냉소적인 편":-2,"까칠한 편":-2,"예민한 편":-2,"걱정이 많은 편":-3,"불안한 편":-4,"침울한 편":-5,"비관적인 편":-5,"분노를 품은 편":-5}[baseline]||0);
  if(baselineBias)add(baselineBias,baselineBias>0?'평소 정서가 밝은 쪽으로 기울어 있음':'평소 걱정과 부정적인 가능성을 먼저 살피는 편',baselineBias>0?'Their usual outlook leans bright':'They tend to notice worries and negative possibilities first',baselineBias>0?'普段の気持ちは明るい方へ傾きやすい':'普段は心配や悪い可能性を先に考えやすい');
  if(Math.abs(variation)>=4)add(variation,variation>0?'오늘의 생활 리듬이 평소보다 가벼움':'오늘의 생활 리듬이 평소보다 무거움',variation>0?'Today’s rhythm feels lighter than usual':'Today’s rhythm feels heavier than usual',variation>0?'今日は普段より生活のリズムが軽い':'今日は普段より生活のリズムが重い');
  if(goodTown.has(town?.reputation))support(1,'마을의 좋은 생활 환경이 마음을 받쳐 줌','The village environment provides a little reassurance','暮らしやすい村の環境が少し心を支える');
  if(badTown.has(town?.reputation))add(-10,'마을 환경에 대한 걱정','Concerns about the village','村の環境への不安');
  if(/좋|훌륭|친절|사랑받음/.test(place?.reputation||''))support(2,'평판이 좋은 장소라 조금 안심됨','This well-regarded place feels reassuring','評判のよい場所で少し安心する');
  if(/나쁨|불친절|악평|위험/.test(place?.reputation||''))add(-11,'장소의 평판이 신경 쓰임','Uneasy about this place’s reputation','場所の評判が気になる');
  const quiet=/조용|평온|차분|아늑|편안/.test(place?.atmosphere||''),busy=/시끌|소란|붐비|북적|활기/.test(place?.atmosphere||'');
  const activityProfile=`${traits} ${(character.hobbies||[]).join(' ')} ${(character.interests||[]).join(' ')} ${character.energyRhythm||''} ${character.socialStyle||''}`;
  const quietAffinity=/조용|차분|내향|혼자가 편|독서|읽기|글쓰기|연구|공부|집중|식물|원예|명상/.test(activityProfile);
  const focusedInQuiet=/집중|읽|독서|공부|연구|작업|업무|정리|기록|메모|글을 쓰|필기|그림|관찰|생각|휴식|쉬는|차를 마시|커피를 마시|focus|read|study|research|work|writ|organize|rest|集中|読書|勉強|研究|作業|仕事|整理|記録|休憩/i.test(copy);
  const idlingWithoutPurpose=/할 일 없이|무료하게|심심해|멍하니 기다|가만히 기다|시간을 때우|nothing to do|killing time|waiting idly|退屈しながら|何もせず|暇を持て余/i.test(copy);
  const stimulationSeeking=/가만히 못|활동적인 편|무리의 중심|늘 사람을 찾|자극을 찾/.test(activityProfile);
  const quietBored=quiet&&stimulationSeeking&&idlingWithoutPurpose&&!focusedInQuiet&&!quietAffinity;
  if(quiet){
    if(quietBored)add(-6,'할 일 없이 기다리는 동안 필요한 자극이 없어 무료함','Waiting without anything to do feels understimulating','何もすることなく待つ間、刺激が足りず退屈している');
    else if(focusedInQuiet)support(4,'조용한 환경이 지금 하는 일에 집중하는 데 도움 됨','The quiet setting supports their current focus','静かな環境が今の作業への集中を助けている');
    else support(3,'조용한 공간이라 긴장이 조금 풀림','The quiet space eases some tension','静かな空間で少し緊張がほどける');
  }
  if(busy)(outgoing?support(3,'주변 사람들의 활기에서 조금 힘을 얻음','The surrounding bustle gives a little energy','周囲のにぎわいから少し元気をもらう'):add(-8,'소란한 공간에 오래 있어 기가 빨림','The busy space is draining','にぎやかな空間に長くいて疲れる'));
  const home=entry?.home?world.homes?.[entry.visitHomeId||character.homeId]:null;
  if(home){
    const tidy=/정돈을 좋아함|흐트러짐을 못 참음/.test(character.neatness||'');
    if(Number(home.cleanliness)>=75)support(tidy?3:2,'정돈된 집이라 덜 신경 쓰임','A tidy home removes a small source of stress','整った家で気がかりが少し減る');
    if(Number(home.cleanliness)<35)add(tidy?-14:-8,tidy?'정돈을 중시하는 성향이라 집 안의 어수선함이 더 신경 쓰임':'집 안의 어수선함이 신경 쓰임',tidy?'Their need for order makes the untidy home especially distracting':'The untidy home is distracting',tidy?'整頓を重視するため、家の散らかりがいっそう気になる':'家の散らかりが気になる');
    if(/아름다움|매우 아름다움|근사/.test(home.beautyLevel||''))support(1,'마음에 드는 집의 분위기가 작은 위안이 됨','The atmosphere at home offers a little comfort','気に入った家の雰囲気が小さな慰めになる');
  }
  const relationshipAppraisals=relationshipAppraisal(character,entry,world,language),primaryRelationship=relationshipAppraisals[0],companion=primaryRelationship?.companion,directedView=primaryRelationship?.view||{},relationship=primaryRelationship?.relationship,relationText=`${JSON.stringify(relationship||{})} ${JSON.stringify(directedView||{})}`,strongLove=Boolean(primaryRelationship?.flags.loving);
  relationshipAppraisals.slice(0,2).forEach(appraisal=>{
    if(!appraisal.detail)return;
    const amount=Math.max(-22,Math.min(14,appraisal.score));
    if(amount>0)support(Math.min(5,amount),appraisal.detail,appraisal.detail,appraisal.detail);
    else if(amount<0)add(amount,appraisal.detail,appraisal.detail,appraisal.detail);
    else add(0,appraisal.detail,appraisal.detail,appraisal.detail);
  });
  if(companion&&outgoing&&!primaryRelationship?.flags.friendly&&!primaryRelationship?.flags.hostile)support(1,`${particle(companion.name,'과','와')} 함께라 혼자일 때보다 덜 심심함`,`Company makes the moment less dull`,`${companion.name}と一緒なので一人より退屈しない`);
  const workEvent=/출근|업무|근무|회사|직장|회의|보고서|마감|work|office|shift|meeting|deadline/i.test(copy),hardWork=/야근|마감|초과|압박|바쁨|실수|overtime|deadline|pressure|busy|mistake/i.test(copy);
  if(workEvent)add(hardWork?-17:-6,hardWork?'업무량과 압박이 커서 스트레스가 쌓임':'일하는 동안 긴장을 유지해 조금 피로함',hardWork?'Workload and pressure are causing stress':'Staying focused at work is tiring',hardWork?'仕事量と圧力でストレスがたまる':'仕事中の緊張で少し疲れている');
  if(workEvent&&/부지런함|쉴 새 없이 움직임/.test(character.diligence||''))support(2,'맡은 일을 진행하고 있다는 감각이 마음을 받쳐 줌','Making progress on their responsibilities offers reassurance','任されたことを進めている実感が心を支える');
  if(workEvent&&/매우 느긋함|필요할 때만 움직임/.test(character.diligence||''))add(-3,'일의 속도를 계속 유지하는 것이 평소 리듬보다 버거움','Keeping up the work pace feels heavier than their usual rhythm','仕事のペースを保つことが普段のリズムより負担に感じる');
  const activeEvent=/운동|달리|산책|이동|돌아다|여러 일을|exercise|run|walk|moving|運動|走|散歩|移動/i.test(copy);
  if(activeEvent&&/활동적인 편|가만히 못 있음/.test(character.energyRhythm||''))support(2,'몸을 움직이는 일이 생활 에너지와 잘 맞음','Moving around suits their energy rhythm','体を動かすことが生活のエネルギーに合っている');
  if(activeEvent&&/집에서 충전|느긋한 편/.test(character.energyRhythm||'')&&/바쁘|여러 일을|오래|계속/.test(copy))add(-5,'활동이 오래 이어져 혼자 충전할 시간이 부족함','Prolonged activity leaves too little time to recharge','活動が長く続き、一人で充電する時間が足りない');
  const changedPlan=/갑자기|예정.{0,8}(바뀌|변경)|일정.{0,8}(바뀌|변경)|늦었|지연|unexpected|schedule change|delay|急に|予定.{0,8}変更|遅れ/i.test(copy);
  if(changedPlan&&/미리 정리함|계획적/.test(character.planningStyle||''))add(-7,'예정이 바뀌어 다시 순서를 세워야 함','A changed plan means rebuilding the order of the day','予定が変わり、順序を組み直す必要がある');
  if(changedPlan&&/즉흥적|유연한 편/.test(character.planningStyle||''))support(2,'예상 밖의 변화에도 비교적 유연하게 방향을 바꿈','They adapt relatively easily to the unexpected change','予想外の変化にも比較的柔軟に方向を変えられる');
  const routineCode=[...(world.routines?.[character.id]||[]),...(world.monthlyRoutines?.[character.id]||[])].find(value=>String(value.id)===String(entry?.routineId))?.dressCode;
  // Buildings no longer require uniforms. A uniform can still be mandatory for
  // an individual schedule, where that choice is explicit.
  const dressCodes=[place?.dressCode?{...place.dressCode,requiredUniform:false}:null,routineCode].filter(code=>code?.enabled);
  if(dressCodes.length){
    const owned=new Set(character.inventory?.fashion||[]),clothes=(world.catalog?.fashion||[]).filter(item=>owned.has(item.id)),matches=clothes.some(item=>dressCodes.some(code=>(!code.requiredUniform||item.requiredUniform)&&(!code.formality||code.formality==='지정 안 함'||item.formality===code.formality)&&((code.colors||[]).length===0||(item.colors||[]).some(color=>(code.colors||[]).includes(color)))));
    if(matches)support(2,'장소와 일정에 어울리는 옷이라 덜 신경 쓰임','The outfit fits the dress code','服装がドレスコードに合って気が楽になる');
    else add(-8,'입은 옷과 드레스코드가 어긋나 신경 쓰임','The outfit clashes with the dress code','服装とドレスコードが合わず気になる');
  }
  const clockMinute=value=>{const match=String(value||'').match(/^(\d{1,2}):(\d{2})$/);return match?Math.max(0,Math.min(1439,Number(match[1])*60+Number(match[2]))):null},sceneMinute=Number.isFinite(Number(entry?.minute))?Number(entry.minute):null,wakeMinute=clockMinute(character.wake),sleepMinute=clockMinute(character.sleep);
  if(sceneMinute!==null&&wakeMinute!==null){const afterWake=(sceneMinute-wakeMinute+1440)%1440;if(afterWake<75&&/천천히|여러 번|뒹굶|비몽사몽|깨워/.test(character.wakeHabit||''))add(-5,'아직 잠이 덜 깨 몸과 생각이 무거움','Still groggy after waking up','まだ目が覚めきらず体も頭も重い')}
  if(sceneMinute!==null&&sleepMinute!==null){const untilSleep=(sleepMinute-sceneMinute+1440)%1440;if(untilSleep<90&&!restEvent.test(copy))add(-5,'평소 잘 시간이 가까워져 집중력이 떨어짐','Focus is fading near the usual bedtime','いつもの就寝時刻が近づき集中力が落ちている')}
  const likedMatches=termsInCopy(preferenceTerms(character,world,"likes"),copy),dislikedMatches=termsInCopy(preferenceTerms(character,world,"dislikes"),copy);
  if(likedMatches.length)add(eventValue(11),`현재 행동에서 좋아하는 ${likedMatches.join('·')}을(를) 직접 즐겨 기분이 좋아짐`,`Their current action lets them directly enjoy a favorite: ${likedMatches.join(', ')}.`,`今の行動で好きな${likedMatches.join('・')}を実際に楽しみ、気分が上向いた`);
  if(dislikedMatches.length)add(eventValue(-15),`현재 행동에서 싫어하는 ${dislikedMatches.join('·')}을(를) 직접 마주해 불쾌함`,`Their current action directly exposes them to something they dislike: ${dislikedMatches.join(', ')}.`,`今の行動で苦手な${dislikedMatches.join('・')}に直接触れ、不快になった`);
  const contagionScale=({"거의 물들지 않음":0,"가까운 사람에게만 물듦":companion?0.7:0,"상황에 따라 물듦":companion?1:0,"쉽게 물드는 편":companion?1.3:0,"매우 쉽게 물듦":companion?1.65:0}[emotionalContagion]||0);
  if(contagionScale&&positiveEvent.test(copy))add(Math.round(5*contagionScale),'함께 있는 사람의 밝은 감정에 조금 물듦','They picked up some of the other person’s positive emotion','一緒にいる人の明るい感情に少し影響された');
  if(contagionScale&&(angryEvent.test(copy)||sadEvent.test(copy)))add(Math.round(-6*contagionScale),'함께 있는 사람의 거친 감정이나 침울함이 전해짐','The other person’s anger or sadness rubbed off on them','一緒にいる人の怒りや沈んだ気分が伝わった');
  // A comfortable town, home, relationship, and outfit are buffers. They must not
  // stack into automatic happiness: keep only the strongest supports, capped at +5.
  supports.sort((a,b)=>b.value-a.value);let supportTotal=0;
  for(const item of supports){const value=Math.min(item.value,5-supportTotal);if(value>0){reasons.push({...item,value});supportTotal+=value}if(supportTotal>=5)break}
  const eventDetail=[sourceTitle,sourceDesc].filter(Boolean).join(' — ').slice(0,220),eventReason=kind=>({
    positive:[`“${eventDetail}”에서 기쁨을 느낌`,`“${eventDetail}” lifted their mood`,`「${eventDetail}」で気持ちが明るくなった`],
    angry:[`“${eventDetail}” 때문에 화가 남`,`“${eventDetail}” made them angry`,`「${eventDetail}」が原因で腹が立った`],
    sad:[`“${eventDetail}” 때문에 마음이 가라앉음`,`“${eventDetail}” brought their mood down`,`「${eventDetail}」で気持ちが沈んだ`]
  }[kind]);
  const angerNegated=/문제.{0,12}(없|않)|갈등.{0,12}(없|않)|다투지|싸우지|no (problem|conflict)|without (arguing|conflict)|問題.{0,10}(ない|なく)|争わず|喧嘩せず/i.test(copy),hasPositiveEvent=positiveEvent.test(copy),hasAngryEvent=angryEvent.test(copy)&&!angerNegated,hasSadEvent=sadEvent.test(copy),hasTiredEvent=tiredEvent.test(copy);
  const severeRelationshipHarm=/폭력|폭행|협박|배신|외도|바람을 피|이별 통보|이혼 통보|모욕|심한 거짓말|assault|violence|threat|betray|cheat|break.?up|divorce|侮辱|暴力|脅迫|裏切|浮気|別れ|離婚/i.test(copy);
  const conflictNamesCompanion=Boolean(companion?.name&&copy.includes(companion.name));
  const loveBufferedConflict=strongLove&&conflictNamesCompanion&&hasAngryEvent&&!severeRelationshipHarm;
  if(hasPositiveEvent){const reason=eventReason('positive');add(eventValue(22),...reason)}
  if(loveBufferedConflict)add(eventValue(-10),`“${eventDetail}” 때문에 ${companion.name}에게 서운하지만 사랑하는 마음이 사라진 것은 아님`,`“${eventDetail}” hurt, but it did not erase their love for ${companion.name}`,`「${eventDetail}」で${companion.name}に寂しさを感じたが、愛情が消えたわけではない`);
  else if(hasAngryEvent){const reason=eventReason('angry');add(eventValue(-28),...reason)}
  if(hasSadEvent){const reason=eventReason('sad');add(eventValue(-24),...reason)}
  if(hasTiredEvent)add(eventValue(-16),'피로가 쌓임','Fatigue has built up','疲れがたまっている');
  if(flirtEvent.test(copy)){
    if(/당황|거리|경계/.test(flirtResponse))add(eventValue(-8),'호감 신호를 받아 경계하거나 당황함','A flirtatious signal made them wary or flustered','好意のサインを受けて警戒したり戸惑ったりしている');
    else if(/은근히|장난스럽게|직접 호응/.test(flirtResponse))add(eventValue(10),'호감 신호를 자기 방식으로 받아들임','They welcomed the signal in their own way','好意のサインを自分らしく受け止めた');
  }
  if(restEvent.test(copy))add(recoveryStyle==='쉬거나 자면서 회복'?7:3,'쉬면서 조금씩 회복 중','Recovering gradually through rest','休みながら少しずつ回復している');
  const score=Math.max(-100,Math.min(100,reasons.reduce((number,reason)=>number+reason.value,0)));
  const praiseOrSuccess=/성공|칭찬|해냈|완성|success|praise|complete|成功|褒め|完成/i.test(copy),giftOrFavorite=/선물|맛있|좋아하는|favorite|gift|delicious|贈り物|好き|おいし/i.test(copy),playful=/웃|농담|장난|즐거|laugh|joke|playful|笑|冗談|楽しい/i.test(copy),rejection=/거절|무시|외면|reject|ignore|拒絶|無視/i.test(copy),loss=/상실|잃어|떠나|이별|loss|lost|leave|喪失|失く|別れ/i.test(copy),lonely=/외롭|혼자 남|고립|lonely|isolat|寂し|孤立/i.test(copy),embarrassed=/당황|민망|실수|embarrass|awkward|mistake|戸惑|気まず|失敗/i.test(copy),disgusted=dislikedMatches.length&&/냄새|맛|음식|향|혐오|역겨|smell|taste|disgust|臭|味|嫌悪/i.test(copy);
  let label,icon,tone;
  if(hasTiredEvent&&/졸리|잠|sleepy|眠/.test(copy)){label=text(language,'졸림','Sleepy','眠い');icon='☾';tone='tired'}
  else if(hasTiredEvent&&/야근|밤샘|지쳤|exhaust|overtime|all.nighter|夜更|疲れ切/.test(copy)){label=text(language,'지침','Exhausted','疲れ切っている');icon='☾';tone='tired'}
  else if(hasTiredEvent){label=text(language,'피곤함','Tired','疲れている');icon='☾';tone='tired'}
  else if(flirtEvent.test(copy)&&/당황|거리/.test(flirtResponse)){label=text(language,'당황함','Flustered','戸惑っている');icon='◇';tone='tense'}
  else if(flirtEvent.test(copy)&&/경계/.test(flirtResponse)){label=text(language,'경계함','Wary','警戒している');icon='△';tone='tense'}
  else if(flirtEvent.test(copy)&&(/유혹적인/.test(baseline)||/장난스럽게|직접 호응/.test(flirtResponse))){label=text(language,'유혹적임','Flirtatious','誘惑的');icon='✧';tone='flirty'}
  else if(flirtEvent.test(copy)&&/은근히 받아줌/.test(flirtResponse)){label=text(language,'설렘','Fluttery','ときめいている');icon='♥';tone='flirty'}
  else if(disgusted){label=text(language,'혐오감','Disgusted','嫌悪感');icon='×';tone='disgusted'}
  else if(dislikedMatches.length){label=text(language,score<=-20?'불쾌함':'짜증남',score<=-20?'Upset':'Irritated',score<=-20?'不快':'いら立っている');icon='!';tone='irritated'}
  else if(loveBufferedConflict){label=text(language,'서운함','Hurt, but still loving','寂しいが愛情は変わらない');icon='♥';tone='sad'}
  else if(hasAngryEvent&&(/분노를 품은/.test(baseline)||score<=-45)&&/쉽게 욱함|거의 참지 않음|목소리가 커짐|즉시 잘못을 따짐/.test(`${character.impulseControl||''} ${angerResponse}`)){label=text(language,'격분함','Furious','激怒している');icon='⚡';tone='furious'}
  else if(hasAngryEvent&&(/목소리가 커짐|즉시 잘못을 따짐|해결책을 분명히 요구함/.test(angerResponse)||stressResponse==='화부터 남'||/분노를 품은/.test(baseline))){label=text(language,'화남','Angry','怒っている');icon='⚡';tone='angry'}
  else if(hasAngryEvent&&(stressResponse==='말수가 줄어듦'||stressResponse==='아무렇지 않은 척함')){label=text(language,'서운함','Hurt','傷ついている');icon='◒';tone='sad'}
  else if(hasAngryEvent&&/까칠|냉소/.test(baseline)){label=text(language,'까칠함','Prickly','とげとげしい');icon='◇';tone='irritated'}
  else if(hasAngryEvent){label=text(language,stressResponse==='걱정이 많아짐'?'불안함':'긴장함',stressResponse==='걱정이 많아짐'?'Anxious':'Tense',stressResponse==='걱정이 많아짐'?'不安':'緊張している');icon='☁';tone='tense'}
  else if(hasSadEvent&&loss){label=text(language,'상실감','Grief','喪失感');icon='☂';tone='sad'}
  else if(hasSadEvent&&lonely){label=text(language,'외로움','Lonely','寂しい');icon='☂';tone='sad'}
  else if(hasSadEvent&&rejection){label=text(language,'상처받음','Hurt','傷ついている');icon='◒';tone='sad'}
  else if(hasSadEvent&&embarrassed){label=text(language,'실망함','Disappointed','がっかりしている');icon='◒';tone='sad'}
  else if(hasSadEvent&&/침울/.test(baseline)){label=text(language,'침울함','Gloomy','沈鬱');icon='☂';tone='sad'}
  else if(hasSadEvent){label=text(language,'슬픔','Sad','悲しい');icon='☂';tone='sad'}
  else if(!hasPositiveEvent&&primaryRelationship?.kind==='love-hate'){label=text(language,'애증','Love and hate intertwined','愛憎');icon='↕';tone='conflicted'}
  else if(!hasPositiveEvent&&primaryRelationship?.kind==='misread-affection'){label=text(language,'복잡한 끌림','Conflicted attraction','複雑な惹かれ方');icon='↕';tone='conflicted'}
  else if(!hasPositiveEvent&&primaryRelationship?.kind==='conflicted-affection'){label=text(language,'복잡한 애정','Conflicted affection','複雑な愛情');icon='↕';tone='conflicted'}
  else if(!hasPositiveEvent&&primaryRelationship?.kind==='loving'){label=text(language,'애틋함','Tender affection','愛おしさ');icon='♥';tone='good'}
  else if(!hasPositiveEvent&&primaryRelationship?.kind==='friendly'){label=text(language,'편안함','At ease','安心');icon='◇';tone='good'}
  else if(!hasPositiveEvent&&primaryRelationship?.kind==='hatred'){label=text(language,'강한 반감','Strong resentment','強い反感');icon='×';tone='hostile'}
  else if(!hasPositiveEvent&&primaryRelationship?.kind==='guarded'){label=text(language,'경계함','Wary','警戒している');icon='△';tone='tense'}
  else if(score>=45&&positiveResponse==='기쁨이 크게 드러남'){label=text(language,'황홀함','Elated','有頂天');icon='✦';tone='excited'}
  else if(score>=30&&praiseOrSuccess){label=text(language,'뿌듯함','Proud','誇らしい');icon='◆';tone='good'}
  else if(score>=26&&giftOrFavorite){label=text(language,'기쁨','Joyful','うれしい');icon='☀';tone='good'}
  else if(score>=24&&playful){label=text(language,/쾌활/.test(baseline)?'신남':'즐거움',/쾌활/.test(baseline)?'Energized':'Cheerful',/쾌활/.test(baseline)?'はしゃいでいる':'楽しい');icon='✦';tone='excited'}
  else if(score>=24&&!restrained&&positiveResponse==='기쁨이 크게 드러남'){label=text(language,'들뜸','Excited','浮き立っている');icon='✦';tone='excited'}
  else if(score>=18&&/열정적인/.test(baseline)){label=text(language,'의욕적임','Motivated','意欲的');icon='↑';tone='good'}
  else if(score>=18&&/다정한/.test(baseline)&&companion){label=text(language,'다정함','Affectionate','優しい気持ち');icon='♥';tone='good'}
  else if(score>=18&&!restrained){label=text(language,'기분 좋음','Feeling good','ご機嫌');icon='☀';tone='good'}
  else if(score>=12&&restrained){label=text(language,'만족함','Satisfied','満足');icon='◆';tone='good'}
  else if(score>=11){label=text(language,'안도함','Relieved','ほっとしている');icon='◇';tone='good'}
  else if(score<=-30&&/침울|비관/.test(baseline)){label=text(language,'침울함','Gloomy','沈鬱');icon='☂';tone='sad'}
  else if(score<=-24){label=text(language,'슬픔','Sad','悲しい');icon='☂';tone='sad'}
  else if(score<=-8){
    if(/분노를 품은/.test(baseline)){label=text(language,'분노를 삭이는 중','Simmering','怒りをこらえている');icon='⚡';tone='angry'}
    else if(/까칠/.test(baseline)){label=text(language,'까칠함','Prickly','とげとげしい');icon='◇';tone='irritated'}
    else if(/냉소/.test(baseline)){label=text(language,'냉소적임','Cynical','皮肉っぽい');icon='—';tone='irritated'}
    else if(stressResponse==='말수가 줄어듦'||stressResponse==='아무렇지 않은 척함'){label=text(language,'가라앉음','Subdued','沈んでいる');icon='◒';tone='calm'}
    else if(stressResponse==='걱정이 많아짐'||/걱정/.test(baseline)){label=text(language,'걱정스러움','Worried','心配している');icon='☁';tone='tense'}
    else if(/불안|예민/.test(baseline)){label=text(language,'불안함','Anxious','不安');icon='☁';tone='tense'}
    else {label=text(language,'긴장함','Tense','緊張している');icon='☁';tone='tense'}
  }
  else if(quietBored){label=text(language,'무료함','Understimulated','手持ち無沙汰');icon='…';tone='bored'}
  // 낙천성은 같은 사건을 덜 오래 끌게 하는 완충 성향이지, 음수인 최종
  // 점수를 양수 감정으로 뒤집는 표지가 아니다. 표시 점수와 감정 이름은
  // 반드시 같은 최종 score 구간에서 결정한다.
  else if(/호기심 많은/.test(baseline)&&/새|처음|발견|궁금|new|first|discover|新し|初めて|発見/.test(copy)){label=text(language,'호기심','Curious','好奇心');icon='?';tone='curious'}
  else if(/유혹적인/.test(baseline)&&companion){label=text(language,'여유로움','Poised','余裕がある');icon='✧';tone='flirty'}
  else if(/분노를 품은/.test(baseline)){label=text(language,'날이 서 있음','On edge','気が立っている');icon='!';tone='irritated'}
  else if(/까칠/.test(baseline)){label=text(language,'까칠함','Prickly','とげとげしい');icon='◇';tone='irritated'}
  else if(/냉소/.test(baseline)){label=text(language,'냉소적임','Cynical','皮肉っぽい');icon='—';tone='irritated'}
  else if(/침울/.test(baseline)){label=text(language,'침울함','Gloomy','沈鬱');icon='☂';tone='sad'}
  else if(/불안/.test(baseline)){label=text(language,'경계함','Wary','警戒している');icon='△';tone='tense'}
  else if(/쾌활/.test(baseline)&&score>=0){label=text(language,'명랑함','Cheerful','朗らか');icon='☀';tone='good'}
  else if(/열정/.test(baseline)&&score>=0){label=text(language,'의욕적임','Motivated','意欲的');icon='↑';tone='good'}
  else if(/다정/.test(baseline)&&companion){label=text(language,'다정함','Affectionate','優しい気持ち');icon='♥';tone='good'}
  else if(optimistic&&score>=0){label=text(language,'기분 좋음','Feeling good','ご機嫌');icon='☀';tone='good'}
  else if(baseline==='차분한 편'){label=text(language,'차분함','Composed','落ち着いている');icon='◇';tone='calm'}
  else if(baseline==='무덤덤한 편'){label=text(language,'무덤덤함','Unruffled','淡々としている');icon='—';tone='calm'}
  else if((hash(`${character.id}:${day}:neutral`)%2)===0){label=text(language,'차분함','Composed','落ち着いている');icon='◇';tone='calm'}
  else {label=text(language,'평온함','Feeling calm','穏やか');icon='◌';tone='calm'}
  return {score,label,icon,reasons,placeName:place?.name||town?.name||'',tone,sourceEntry:sourceTitle?{time:sourceTime,title:sourceTitle,desc:sourceDesc}:null};
}

export function environmentConversation(character,entry,world){
  const {town,place}=moodContext(character,entry,world),language=world.uiLanguage||'ko',traits=traitsOf(character),outgoing=/외향|활발|사교|무리의 중심|가만히 못/.test(traits),nature=/자연|식물|산책|조용|내향|혼자가 편/.test(traits),copy=`${entry?.title||''} ${entry?.desc||''}`,focused=/집중|읽|독서|공부|연구|작업|업무|정리|기록|메모|글을 쓰|필기|그림|관찰|생각|휴식|쉬는|focus|read|study|research|work|writ|organize|rest|集中|読書|勉強|研究|作業|仕事|整理|記録|休憩/i.test(copy),idle=/할 일 없이|무료하게|심심해|멍하니 기다|가만히 기다|시간을 때우|nothing to do|waiting idly|何もせず|暇を持て余/i.test(copy),stimulationSeeking=/가만히 못|활동적인 편|무리의 중심|늘 사람을 찾|자극을 찾/.test(`${traits} ${character.energyRhythm||''} ${character.socialStyle||''}`);
  if(place?.atmosphere&&!/지정|설정|정하지/.test(place.atmosphere)){
    if(/조용|차분|아늑/.test(place.atmosphere)){
      const bored=stimulationSeeking&&idle&&!focused&&!nature;
      return text(language,bored?`${place.name}에서 할 일 없이 기다리니 자극이 부족해 무료하다고 말했어요.`:focused?`${place.name}이 조용해서 지금 하던 일에 집중하기 좋다고 말했어요.`:`${place.name}의 낮은 소리 덕분에 생각을 정리하기 좋다고 말했어요.`,bored?`They said waiting at ${place.name} with nothing to do left them understimulated.`:focused?`They said the quiet at ${place.name} helped them focus on what they were doing.`:`They said the low noise at ${place.name} made it easier to collect their thoughts.`,bored?`${place.name}で何もせず待っていると刺激が足りず手持ち無沙汰だと話しました。`:focused?`${place.name}は静かで、今していることに集中しやすいと話しました。`:`${place.name}は音が静かで考えを整理しやすいと話しました。`);
    }
    if(/활기|북적|시끌/.test(place.atmosphere))return text(language,outgoing?`${place.name}의 북적이는 소리를 들으니 덩달아 신이 난다고 말했어요.`:`${place.name}은 오래 머물면 기가 빨릴 것 같다고 말했어요.`,outgoing?`They said the bustle at ${place.name} lifted their energy.`:`They said staying at busy ${place.name} for long would be draining.`,outgoing?`${place.name}のにぎわいで自分まで楽しくなると話しました。`:`${place.name}に長くいると疲れそうだと話しました。`);
  }
  const reputation=town?.reputation||'';
  if(/좋은 평판|살기 좋|평화/.test(reputation))return text(language,nature?`${town.name}에서는 서두르지 않고 걷는 시간이 좋다고 말했어요.`:outgoing?`${town.name}은 편안하지만 밤에는 조금 더 활기가 있었으면 좋겠다고 말했어요.`:`${town.name}의 고즈넉한 분위기가 오래 지내기 좋다고 말했어요.`,`They described what living in ${town.name} feels like to them.`,`${town.name}で暮らす雰囲気について具体的に話しました。`);
  if(/나쁜 평판|위험|사건/.test(reputation))return text(language,`${town.name}에서 늦게 다닐 때 피해야 할 길과 귀가 시간을 구체적으로 확인했어요.`,`They compared routes and times to avoid when returning late in ${town.name}.`,`${town.name}で遅く帰る時に避ける道と時間を具体的に確認しました。`);
  return '';
}
