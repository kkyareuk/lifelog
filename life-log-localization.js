const hangul=/[가-힣]/;
const japanese=/[\u3040-\u30ff\u31f0-\u31ff]/;
const latinWord=/[A-Za-z]{3,}/;
const values=value=>Array.isArray(value)?value:[];

function entityNames(world){
  return [...Object.values(world.characters||{}),...Object.values(world.homes||{}),...(world.towns||[]),...(world.towns||[]).flatMap(town=>town.places||[]),...Object.values(world.catalog||{}).flatMap(values)]
    .map(value=>String(value?.name||"").trim()).filter(Boolean).sort((a,b)=>b.length-a.length);
}
function withoutEntityNames(value,names){
  let copy=String(value||"");
  names.forEach(name=>copy=copy.split(name).join(""));
  return copy;
}
function detectedLanguage(value,names){
  const copy=withoutEntityNames(value,names);
  if(japanese.test(copy))return "ja";
  if(hangul.test(copy))return "ko";
  if(latinWord.test(copy))return "en";
  return "";
}
function placeFor(entry,world){
  const towns=world.towns||[],town=towns.find(value=>value.id===entry.townId)||world.world;
  return (town?.places||[]).find(value=>value.id===entry.placeId)||towns.flatMap(value=>value.places||[]).find(value=>value.id===entry.placeId);
}
function companionFor(entry,world,characterId){
  const id=[entry.withId,...values(entry.withIds),...values(entry.participantOrder)].find(value=>value&&value!==characterId);
  return world.characters?.[id];
}
const roomCopy={
  en:{living:"living room",kitchen:"kitchen",study:"study",bedroom:"bedroom",bath:"bathroom",entry:"entryway",storage:"storage room"},
  ja:{living:"リビング",kitchen:"キッチン",study:"書斎",bedroom:"寝室",bath:"浴室",entry:"玄関",storage:"収納部屋"}
};
function actionKind(copy){
  const rules=[
    [/자는 중|잠든|수면|낮잠|sleep|asleep|nap|睡眠|眠って|昼寝/i,"sleep"],[/먹|식사|점심|저녁|아침|요리|간식|차를|커피|meal|lunch|dinner|breakfast|cook|snack|coffee|食事|昼食|夕食|朝食|料理|おやつ|コーヒー/i,"meal"],[/청소|닦|정리|치우|쓸어|빨래|설거지|tidy|clean|laundry|dishes|片付|掃除|洗濯|皿洗/i,"tidy"],
    [/씻|세면|목욕|샤워|머리.*말리|양치|wash|shower|bath|groom|身支度|洗面|入浴|シャワー|歯磨/i,"wash"],[/책|독서|읽|자료|공부|필기|연구|read|book|study|research|読書|本を|勉強|研究/i,"read"],[/음악|노래|연주|피아노|재생 목록|music|song|play(?:ing)? music|piano|音楽|歌|演奏|ピアノ/i,"music"],
    [/운동|조깅|산책|스트레칭|달리|걷|exercise|jog|walk|stretch|運動|ジョギング|散歩|ストレッチ|走/i,"exercise"],[/업무|근무|출근|회의|보고서|마감|일하는|work|office|meeting|report|deadline|仕事|勤務|出勤|会議|報告書|締切/i,"work"],[/대화|이야기|말을|약속|시간을 보내|talk|chat|conversation|together|会話|話して|一緒に過ご/i,"talk"],
    [/쇼핑|구매|고르|장보|선물|shop|buy|choos|gift|買い物|購入|選ん|贈り物/i,"shop"],[/귀가|돌아오|이동|가는 중|향하는|travel|moving|on the way|returning|移動|帰宅|向かって/i,"travel"],[/쉬|휴식|멍하니|창밖|rest|break|relax|休憩|休ん|ぼんやり/i,"rest"]
  ];
  return rules.find(([pattern])=>pattern.test(copy))?.[1]||"everyday";
}

const actionCopy={
  ko:{
    sleep:["수면 중","평소 수면 리듬에 맞춰 쉬고 있어요."],meal:["식사하는 중","지금 상황에 맞는 음식을 준비하거나 천천히 맛보고 있어요."],tidy:["주변을 정리하는 중","자기 속도에 맞춰 주변 물건을 제자리에 정리하고 있어요."],wash:["몸단장하는 중","평소대로 씻고 몸가짐을 정돈하고 있어요."],read:["읽고 집중하는 중","조용히 책이나 자료를 읽고 공부하거나 정보를 정리하고 있어요."],music:["음악과 시간을 보내는 중","지금 기분에 맞는 음악을 듣거나 연주하고 있어요."],exercise:["몸을 움직이는 중","현재 몸 상태에 맞는 속도로 운동하거나 걷고 있어요."],work:["일하는 중","눈앞의 일을 진행하며 남은 작업도 차분히 확인하고 있어요."],talk:["함께 시간을 보내는 중","상대의 속도와 반응을 살피며 이야기를 나누고 있어요."],shop:["물건을 고르는 중","여러 선택지를 살펴보고 가장 잘 맞는 것을 고르고 있어요."],travel:["이동하는 중","다음 장소로 향하며 길과 필요한 것을 확인하고 있어요."],rest:["잠깐 쉬는 중","다음 행동을 앞두고 속도를 늦추며 쉬고 있어요."],everyday:["하루를 이어 가는 중","현재 장소와 상황에 맞는 일상 행동을 이어 가고 있어요."]
  },
  en:{
    sleep:["Sleeping","They are resting according to their usual sleep rhythm."],meal:["Having a meal","They are taking time to prepare or enjoy food that fits the moment."],tidy:["Tidying up","They are putting nearby things in order at their own pace."],wash:["Getting ready","They are taking care of their usual washing and grooming routine."],read:["Reading and focusing","They are spending a quiet moment reading, studying, or organizing information."],music:["Spending time with music","They are listening, practicing, or choosing music that suits the moment."],exercise:["Moving their body","They are exercising or walking at a pace that fits their condition."],work:["Working","They are handling the task in front of them while keeping track of what still needs attention."],talk:["Spending time together","They are talking while taking the other person's pace and reaction into account."],shop:["Choosing something","They are checking the available choices before deciding what fits best."],travel:["On the move","They are making their way to the next place and checking the route as they go."],rest:["Taking a break","They are slowing down and recovering before the next activity."],everyday:["Continuing the day","They are carrying on with an everyday activity that fits the current place and situation."]
  },
  ja:{
    sleep:["睡眠中","普段の睡眠リズムに合わせて休んでいます。"],meal:["食事中","今の状況に合う食事を用意したり、ゆっくり味わったりしています。"],tidy:["片付け中","身の回りの物を自分のペースで整えています。"],wash:["身支度中","普段どおりに洗面や身だしなみを整えています。"],read:["読書・作業に集中しているところ","静かに本を読んだり、勉強したり、情報を整理したりしています。"],music:["音楽と過ごしているところ","今の気分に合う音楽を聴いたり、演奏したり、選んだりしています。"],exercise:["体を動かしているところ","体調に合う速さで運動したり歩いたりしています。"],work:["仕事中","目の前の仕事を進めながら、残っている作業も確認しています。"],talk:["一緒に過ごしているところ","相手のペースや反応を見ながら話しています。"],shop:["品物を選んでいるところ","選択肢を確かめ、いちばん合うものを考えています。"],travel:["移動中","次の場所へ向かいながら道順を確認しています。"],rest:["休憩中","次の行動に備えて少し速度を落とし、休んでいます。"],everyday:["一日を過ごしているところ","今いる場所と状況に合う日常の行動を続けています。"]
  }
};

// Some of the simulation pool predates multilingual scene objects. Keep its
// detailed Korean copy intact in Korean, and provide a localized semantic
// fallback for every remaining generated entry in English and Japanese.
export function localizeLifeLog(entry,language,world,characterId=""){
  const target=["ko","en","ja"].includes(language)?language:"ko",names=entityNames(world),title=String(entry.title||""),desc=String(entry.desc||"");
  const canonicalTitle=String(entry.canonicalTitleKo||""),canonicalDesc=String(entry.canonicalDescKo||""),sourceCopy=`${canonicalTitle||title} ${canonicalDesc||desc}`;
  const sourceLanguage=entry.sourceLanguage||detectedLanguage(sourceCopy,names);
  if(target===sourceLanguage&&!canonicalTitle&&!canonicalDesc)return entry;
  if(target==="ko"&&(canonicalTitle||canonicalDesc))return {...entry,title:canonicalTitle||title,desc:canonicalDesc||desc,displayLanguage:"ko"};
  if(!sourceLanguage||target===sourceLanguage)return entry;
  const copy=sourceCopy,kind=actionKind(copy),base=actionCopy[target][kind],place=placeFor(entry,world),home=entry.home?world.homes?.[entry.visitHomeId||world.characters?.[characterId]?.homeId]:null,companion=companionFor(entry,world,characterId),room=target==="ko"?({living:"거실",kitchen:"주방",study:"서재",bedroom:"침실",bath:"욕실",entry:"현관",storage:"창고"}[entry.room]||""):roomCopy[target][entry.room]||"";
  let localizedTitle=base[0],localizedDesc=base[1];
  if(entry.giftExchange&&companion){
    localizedTitle=target==="en"?`Exchanging a gift with ${companion.name}`:target==="ja"?`${companion.name}と贈り物をやり取りしているところ`:`${companion.name}와 선물을 주고받는 중`;
    localizedDesc=target==="en"?"They are giving or receiving the chosen gift and watching the other person's response.":target==="ja"?"選んだ贈り物を渡したり受け取ったりしながら、相手の反応を見ています。":"고른 선물을 건네거나 받으며 상대의 반응을 살피고 있어요.";
  }
  else if(companion&&kind==="talk")localizedTitle=target==="en"?`Spending time with ${companion.name}`:target==="ja"?`${companion.name}と過ごしているところ`:`${companion.name}와 시간을 보내는 중`;
  else if(place)localizedTitle=target==="en"?`${base[0]} at ${place.name}`:target==="ja"?`${place.name}で${base[0]}`:`${place.name}에서 ${base[0]}`;
  else if(home&&room)localizedTitle=target==="en"?`${base[0]} in the ${room}`:target==="ja"?`${room}で${base[0]}`:`${room}에서 ${base[0]}`;
  return {...entry,title:localizedTitle,desc:localizedDesc,sourceLanguage:sourceLanguage||entry.sourceLanguage,canonicalTitleKo:canonicalTitle||(sourceLanguage==="ko"?title:undefined),canonicalDescKo:canonicalDesc||(sourceLanguage==="ko"?desc:undefined),displayLanguage:target,localizedFallback:true};
}
