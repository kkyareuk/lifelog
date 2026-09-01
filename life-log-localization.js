const hangul=/[가-힣]/;
const values=value=>Array.isArray(value)?value:[];

function entityNames(world){
  return [...Object.values(world.characters||{}),...Object.values(world.homes||{}),...(world.towns||[]),...(world.towns||[]).flatMap(town=>town.places||[]),...Object.values(world.catalog||{}).flatMap(values)]
    .map(value=>String(value?.name||"").trim()).filter(Boolean).sort((a,b)=>b.length-a.length);
}
function remainingKorean(value,names){
  let copy=String(value||"");
  names.forEach(name=>copy=copy.split(name).join(""));
  return hangul.test(copy);
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
    [/자는 중|잠든|수면|낮잠/,"sleep"],[/먹|식사|점심|저녁|아침|요리|간식|차를|커피/,"meal"],[/청소|닦|정리|치우|쓸어|빨래|설거지/,"tidy"],
    [/씻|세면|목욕|샤워|머리.*말리|양치/,"wash"],[/책|독서|읽|자료|공부|필기|연구/,"read"],[/음악|노래|연주|피아노|재생 목록/,"music"],
    [/운동|조깅|산책|스트레칭|달리|걷/,"exercise"],[/업무|근무|출근|회의|보고서|마감|일하는/,"work"],[/대화|이야기|말을|약속|시간을 보내/,"talk"],
    [/쇼핑|구매|고르|장보|선물/,"shop"],[/귀가|돌아오|이동|가는 중|향하는/,"travel"],[/쉬|휴식|멍하니|창밖/,"rest"]
  ];
  return rules.find(([pattern])=>pattern.test(copy))?.[1]||"everyday";
}

const actionCopy={
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
  if(!["en","ja"].includes(language))return entry;
  const names=entityNames(world),title=String(entry.title||""),desc=String(entry.desc||"");
  if(!remainingKorean(title,names)&&!remainingKorean(desc,names))return entry;
  const copy=`${title} ${desc}`,kind=actionKind(copy),base=actionCopy[language][kind],place=placeFor(entry,world),home=entry.home?world.homes?.[entry.visitHomeId||world.characters?.[characterId]?.homeId]:null,companion=companionFor(entry,world,characterId),room=roomCopy[language][entry.room]||"";
  let localizedTitle=base[0],localizedDesc=base[1];
  if(entry.giftExchange&&companion){localizedTitle=language==="en"?`Exchanging a gift with ${companion.name}`:`${companion.name}と贈り物をやり取りしているところ`;localizedDesc=language==="en"?"They are giving or receiving the chosen gift and watching the other person's response.":"選んだ贈り物を渡したり受け取ったりしながら、相手の反応を見ています。"}
  else if(companion&&kind==="talk"){localizedTitle=language==="en"?`Spending time with ${companion.name}`:`${companion.name}と過ごしているところ`}
  else if(place){localizedTitle=language==="en"?`${base[0]} at ${place.name}`:`${place.name}で${base[0]}`}
  else if(home&&room){localizedTitle=language==="en"?`${base[0]} in the ${room}`:`${room}で${base[0]}`}
  return {...entry,title:localizedTitle,desc:localizedDesc,localizedFallback:true};
}
