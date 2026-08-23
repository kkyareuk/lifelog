const clamp=(value,min,max,fallback=min)=>{
  const number=Number(value);
  return Number.isFinite(number)?Math.max(min,Math.min(max,number)):fallback;
};
const hash=value=>[...String(value||"")].reduce((result,character)=>(result*31+character.charCodeAt(0))>>>0,2166136261);

const PROFILE_GROUPS=[
  {match:/샤워|욕조/,kind:"shower",duration:24_000},
  {match:/세면대|전신거울|화장대|스킨케어|향수/,kind:"groom",duration:18_000},
  {match:/침대/,kind:"sleep",duration:32_000},
  {match:/소파|의자|안마의자|놀이 매트/,kind:"rest",duration:24_000},
  {match:/TV|홈시어터|프로젝터|빔프로젝터/,kind:"watch",duration:26_000},
  {match:/게임기|보드게임/,kind:"game",duration:25_000},
  {match:/식탁|티 테이블|커피|에스프레소|티 세트|칵테일|와인/,kind:"eat",duration:21_000},
  {match:/냉장고|조리대|오븐|제빵|향신료|요리책/,kind:"cook",duration:27_000},
  {match:/책장|독서|책상|컴퓨터/,kind:"study",duration:28_000},
  {match:/피아노|기타|악기|오디오|턴테이블|레코드/,kind:"music",duration:25_000},
  {match:/그림|재봉|드로잉|촬영|공예|뜨개|프라모델|작업대|천체망원경/,kind:"create",duration:29_000},
  {match:/러닝|운동/,kind:"exercise",duration:23_000},
  {match:/세탁|건조|빨래/,kind:"laundry",duration:26_000},
  {match:/캣타워|반려동물|봉제인형|장난감/,kind:"play",duration:20_000}
];

const ACTION_COPY={
  ko:{
    walking:["{room}의 {item}(으)로 이동 중","{item} 사용 자리로 걸어가고 있어요."],
    waiting:["빈 가구를 찾는 중","다른 사람이 사용 중인 자리는 피하고 다음 행동을 고르고 있어요."],
    rest:["{item}에서 쉬는 중","편한 자세를 잡고 잠깐 쉬고 있어요."],watch:["{item}을 보는 중","자리를 잡고 화면에 집중하고 있어요."],game:["{item}을 즐기는 중","차례와 조작을 확인하며 게임을 즐기고 있어요."],
    shower:["{item}에서 씻는 중","사용 중 표시를 해 두고 천천히 씻고 있어요."],groom:["{item} 앞에서 단장하는 중","거울을 확인하며 차분하게 몸가짐을 정돈하고 있어요."],sleep:["{item}에서 쉬는 중","자리를 정리하고 몸을 편안히 누였어요."],
    eat:["{item}에서 먹고 마시는 중","자리에 앉아 천천히 먹고 마시고 있어요."],cook:["{item}을 사용해 준비하는 중","필요한 재료와 도구를 차례대로 꺼내고 있어요."],study:["{item}에서 집중하는 중","자리를 정리한 뒤 하던 일에 집중하고 있어요."],
    music:["{item}으로 음악을 즐기는 중","소리를 확인하며 자기 속도에 맞춰 음악을 즐기고 있어요."],create:["{item}에서 작업하는 중","도구를 안전하게 놓고 작업에 집중하고 있어요."],exercise:["{item}으로 운동하는 중","무리하지 않는 속도로 몸을 움직이고 있어요."],laundry:["{item}으로 빨래를 정리하는 중","세탁할 것과 마른 것을 나누어 정리하고 있어요."],play:["{item}을 가지고 노는 중","주변을 살피며 잠깐 즐거운 시간을 보내고 있어요."],use:["{item}을 사용하는 중","사용할 자리를 잡고 자기 할 일을 하고 있어요."]
  },
  en:{
    walking:["Walking to {item} in {room}","They are heading to the available spot by {item}."],waiting:["Looking for an open spot","They are avoiding furniture already in use and choosing another activity."],
    rest:["Resting at {item}","They settled into a comfortable position for a short break."],watch:["Watching {item}","They found a spot and are focusing on the screen."],game:["Playing at {item}","They are enjoying the game while keeping track of the controls and turns."],
    shower:["Washing at {item}","They marked the fixture as occupied and are taking their time washing."],groom:["Getting ready at {item}","They are calmly tidying their appearance while checking the mirror."],sleep:["Resting at {item}","They made the spot comfortable and lay down to rest."],
    eat:["Eating and drinking at {item}","They took a seat and are eating and drinking at an easy pace."],cook:["Preparing something at {item}","They are taking out the ingredients and tools they need in order."],study:["Focusing at {item}","They cleared the space and are concentrating on what they were doing."],
    music:["Enjoying music at {item}","They are checking the sound and enjoying the music at their own pace."],create:["Working at {item}","They placed the tools safely and are focusing on the project."],exercise:["Exercising at {item}","They are moving at a pace that does not overdo it."],laundry:["Sorting laundry at {item}","They are separating items to wash from items that are dry."],play:["Playing with {item}","They are enjoying a little playtime while watching their surroundings."],use:["Using {item}","They found an open position and are going about their activity."]
  },
  ja:{
    walking:["{room}の{item}へ移動中","空いている{item}のそばへ歩いています。"],waiting:["空いている家具を探し中","ほかの人が使用中の場所を避け、次の行動を選んでいます。"],
    rest:["{item}で休憩中","楽な姿勢になって少し休んでいます。"],watch:["{item}を見ているところ","場所を決め、画面に集中しています。"],game:["{item}で遊んでいるところ","操作や順番を確認しながらゲームを楽しんでいます。"],
    shower:["{item}で体を洗っているところ","使用中にして、ゆっくり体を洗っています。"],groom:["{item}の前で身支度中","鏡を確認しながら落ち着いて身なりを整えています。"],sleep:["{item}で休んでいるところ","場所を整え、楽な姿勢で横になりました。"],
    eat:["{item}で飲食中","席に座り、ゆっくり食べたり飲んだりしています。"],cook:["{item}で準備中","必要な材料と道具を順番に出しています。"],study:["{item}で集中しているところ","場所を片づけ、作業に集中しています。"],
    music:["{item}で音楽を楽しんでいるところ","音を確かめ、自分のペースで音楽を楽しんでいます。"],create:["{item}で作業中","道具を安全に置き、作業に集中しています。"],exercise:["{item}で運動中","無理のないペースで体を動かしています。"],laundry:["{item}で洗濯物を整理中","洗う物と乾いた物を分けて整理しています。"],play:["{item}で遊んでいるところ","周囲を見ながら少し楽しい時間を過ごしています。"],use:["{item}を使用中","空いている場所を使い、自分の用事を進めています。"]
  }
};

export function furnitureUseProfile(item){
  const name=String(item||"");
  const profile=PROFILE_GROUPS.find(entry=>entry.match.test(name));
  return profile?{kind:profile.kind,duration:profile.duration}:{kind:"use",duration:20_000};
}

export function homeLifePresentation(agent,{roomName="집 안",furnitureName="가구",locale="ko"}={}){
  const language=ACTION_COPY[locale]?locale:"ko",copy=ACTION_COPY[language];
  const key=agent?.phase==="walking"?"walking":agent?.phase==="waiting"?"waiting":agent?.actionKind||"use";
  const pair=copy[key]||copy.use;
  const fill=value=>String(value).replaceAll("{room}",roomName).replaceAll("{item}",furnitureName);
  return {title:fill(pair[0]),desc:fill(pair[1]),actionKind:key};
}

function normalizeAgent(value,characterId,roomKeys){
  const source=value&&typeof value==="object"&&!Array.isArray(value)?value:{};
  const fallbackRoom=roomKeys.includes(source.roomKey)?source.roomKey:roomKeys[0]||"";
  const phase=["waiting","walking","using"].includes(source.phase)?source.phase:"waiting";
  return {
    characterId:String(characterId),phase,roomKey:fallbackRoom,
    x:clamp(source.x,5,95,50),y:clamp(source.y,14,92,72),
    fromX:clamp(source.fromX,5,95,12),fromY:clamp(source.fromY,14,92,78),
    furnitureId:String(source.furnitureId||"").slice(0,120),item:String(source.item||"").slice(0,80),
    actionKind:String(source.actionKind||"use").slice(0,40),
    startedAt:Math.max(0,Number(source.startedAt)||0),endsAt:Math.max(0,Number(source.endsAt)||0),
    sequence:Math.max(0,Math.floor(Number(source.sequence)||0)),blockedCount:Math.max(0,Math.floor(Number(source.blockedCount)||0))
  };
}

export function normalizeHomeLifeSimulation(value,roomKeys=[]){
  const source=value&&typeof value==="object"&&!Array.isArray(value)?value:{};
  const agentsSource=source.agents&&typeof source.agents==="object"&&!Array.isArray(source.agents)?source.agents:{};
  const agents=Object.fromEntries(Object.entries(agentsSource).slice(0,80).map(([id,agent])=>[String(id),normalizeAgent(agent,id,roomKeys)]));
  const reservationsSource=source.reservations&&typeof source.reservations==="object"&&!Array.isArray(source.reservations)?source.reservations:{};
  const reservations=Object.fromEntries(Object.entries(reservationsSource).slice(0,80).map(([id,reservation])=>[String(id),{
    characterId:String(reservation?.characterId||""),until:Math.max(0,Number(reservation?.until)||0)
  }]));
  return {version:1,updatedAt:Math.max(0,Number(source.updatedAt)||0),agents,reservations};
}

function placementList(home){
  return Object.entries(home?.rooms||{}).flatMap(([roomKey,room])=>(Array.isArray(room?.furniturePlacements)?room.furniturePlacements:[]).filter(Boolean).map(placement=>({
    id:String(placement.id||""),roomKey,item:String(placement.item||""),x:clamp(placement.x,6,94,50),y:clamp(placement.y,14,90,65)
  }))).filter(placement=>placement.id&&placement.item);
}

function walkingDuration(agent,target){
  const roomChange=agent.roomKey!==target.roomKey;
  const distance=roomChange?110:Math.hypot(agent.x-target.x,agent.y-target.y);
  return Math.round(clamp(2600+distance*28,2600,6500,4200));
}

export function advanceHomeLifeSimulation(home,characterIds,initialRooms={},now=Date.now()){
  const roomKeys=Object.keys(home?.rooms||{}),current=normalizeHomeLifeSimulation(home?.lifeSimulation,roomKeys);
  const before=JSON.stringify({...current,updatedAt:0}),eligible=[...new Set((characterIds||[]).map(String))].filter(Boolean).slice(0,40);
  const eligibleSet=new Set(eligible),placements=placementList(home),placementById=new Map(placements.map(item=>[item.id,item]));
  if(!placements.length||!eligible.length){
    current.agents={};current.reservations={};current.updatedAt=now;
    return {simulation:current,changed:before!==JSON.stringify({...current,updatedAt:0}),nextAt:now+10_000};
  }
  Object.keys(current.agents).forEach(id=>{if(!eligibleSet.has(id))delete current.agents[id]});
  Object.keys(current.reservations).forEach(id=>delete current.reservations[id]);

  eligible.forEach((characterId,index)=>{
    if(current.agents[characterId])return;
    const roomKey=roomKeys.includes(initialRooms[characterId])?initialRooms[characterId]:roomKeys[index%Math.max(1,roomKeys.length)]||"";
    current.agents[characterId]=normalizeAgent({roomKey,phase:"waiting",x:25+(hash(characterId)%51),y:60+(hash(`${characterId}:y`)%22),endsAt:now},characterId,roomKeys);
  });

  // 먼저 끝난 행동을 정리한 뒤 예약표를 다시 만든다. 앱을 오래 닫아 둔
  // 경우에도 과거 행동을 수백 번 재생하지 않고 현재 시점에서 한 번만 잇는다.
  eligible.forEach(characterId=>{
    const agent=current.agents[characterId];
    if(agent.phase==="walking"&&agent.endsAt<=now){
      const target=placementById.get(agent.furnitureId);
      if(target){
        const profile=furnitureUseProfile(target.item);
        Object.assign(agent,{phase:"using",roomKey:target.roomKey,x:target.x,y:target.y,fromX:target.x,fromY:target.y,item:target.item,actionKind:profile.kind,startedAt:now,endsAt:now+profile.duration+(hash(`${characterId}:${agent.sequence}:duration`)%5000)});
      }else Object.assign(agent,{phase:"waiting",furnitureId:"",item:"",startedAt:now,endsAt:now});
    }else if(agent.phase==="using"&&agent.endsAt<=now){
      Object.assign(agent,{phase:"waiting",furnitureId:"",item:"",startedAt:now,endsAt:now,sequence:agent.sequence+1});
    }
  });

  eligible.forEach(characterId=>{
    const agent=current.agents[characterId];
    if(["walking","using"].includes(agent.phase)&&placementById.has(agent.furnitureId))current.reservations[agent.furnitureId]={characterId,until:agent.endsAt};
  });

  eligible.forEach(characterId=>{
    const agent=current.agents[characterId];
    if(agent.phase!=="waiting"||agent.endsAt>now)return;
    const available=placements.filter(item=>!current.reservations[item.id]);
    if(!available.length){
      agent.blockedCount+=1;agent.startedAt=now;agent.endsAt=now+4500+(hash(`${characterId}:${agent.blockedCount}`)%2500);return;
    }
    const different=available.filter(item=>item.id!==agent.furnitureId),pool=different.length?different:available;
    const target=pool[hash(`${characterId}:${agent.sequence}:${Math.floor(now/60_000)}`)%pool.length],profile=furnitureUseProfile(target.item);
    const duration=walkingDuration(agent,target),sameRoom=agent.roomKey===target.roomKey;
    const fromX=sameRoom?agent.x:(hash(`${characterId}:${target.roomKey}:side`)%2?12:88),fromY=sameRoom?agent.y:82;
    Object.assign(agent,{phase:"walking",roomKey:target.roomKey,fromX,fromY,x:target.x,y:target.y,furnitureId:target.id,item:target.item,actionKind:profile.kind,startedAt:now,endsAt:now+duration,blockedCount:0});
    current.reservations[target.id]={characterId,until:agent.endsAt};
  });

  current.updatedAt=now;
  const nextAt=eligible.map(id=>current.agents[id]?.endsAt||now+10_000).filter(value=>value>now).reduce((soonest,value)=>Math.min(soonest,value),now+10_000);
  return {simulation:current,changed:before!==JSON.stringify({...current,updatedAt:0}),nextAt};
}

export function homeLifeNextDelay(value,now=Date.now()){
  const agents=Object.values(value?.agents||{}),nextAt=agents.map(agent=>Number(agent?.endsAt)||0).filter(time=>time>now).reduce((soonest,time)=>Math.min(soonest,time),now+10_000);
  return clamp(nextAt-now,800,10_000,3000);
}
