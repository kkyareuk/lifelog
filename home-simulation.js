const clamp=(value,min,max,fallback=min)=>{
  const number=Number(value);
  return Number.isFinite(number)?Math.max(min,Math.min(max,number)):fallback;
};
const hash=value=>[...String(value||"")].reduce((result,character)=>(result*31+character.charCodeAt(0))>>>0,2166136261);
const HOME_SAFE_BOUNDS={minX:8,maxX:91,minY:23,maxY:84};
function safeHomePoint(x,y){
  let safeX=clamp(x,HOME_SAFE_BOUNDS.minX,HOME_SAFE_BOUNDS.maxX,50),safeY=clamp(y,HOME_SAFE_BOUNDS.minY,HOME_SAFE_BOUNDS.maxY,58);
  // 오른쪽 상단의 집 메뉴 묶음을 가급적 침범하지 않는다.
  if(safeX>77&&safeY<52)safeX=75;
  return {x:safeX,y:safeY};
}

const PROFILE_GROUPS=[
  {match:/샤워/,kind:"shower",minutes:[10,20]},
  {match:/욕조/,kind:"shower",minutes:[25,45]},
  {match:/세면대|전신거울|화장대|스킨케어|향수/,kind:"groom",minutes:[10,25]},
  {match:/옷장|행거|옷걸이|의류 수납/,kind:"dress",minutes:[10,25]},
  {match:/침대/,kind:"sleep",minutes:[60,480]},
  {match:/안마의자/,kind:"rest",minutes:[15,30]},
  {match:/소파|의자|놀이 매트/,kind:"rest",minutes:[20,60]},
  {match:/TV|홈시어터|프로젝터|빔프로젝터/,kind:"watch",minutes:[30,90]},
  {match:/게임기|보드게임/,kind:"game",minutes:[30,120]},
  {match:/식탁|티 테이블|커피|에스프레소|티 세트|칵테일|와인/,kind:"eat",minutes:[20,50]},
  {match:/냉장고|조리대|오븐|제빵|향신료|요리책/,kind:"cook",minutes:[30,90]},
  {match:/책장|독서|책상|컴퓨터/,kind:"study",minutes:[30,120]},
  {match:/피아노|기타|악기|오디오|턴테이블|레코드/,kind:"music",minutes:[30,90]},
  {match:/그림|재봉|드로잉|촬영|공예|뜨개|프라모델|작업대|천체망원경/,kind:"create",minutes:[45,150]},
  {match:/러닝|운동/,kind:"exercise",minutes:[30,90]},
  {match:/세탁|건조|빨래/,kind:"laundry",minutes:[25,70]},
  {match:/캣타워|반려동물|봉제인형|장난감/,kind:"play",minutes:[20,60]}
];

const ACTION_COPY={
  ko:{
    walking:["{room}의 {item}(으)로 이동 중","{item} 사용 자리로 걸어가고 있어요."],
    waiting:["빈 가구를 찾는 중","다른 사람이 사용 중인 자리는 피하고 다음 행동을 고르고 있어요."],
    rest:["{item}에서 쉬는 중","편한 자세를 잡고 잠깐 쉬고 있어요."],watch:["{item}을 보는 중","자리를 잡고 화면에 집중하고 있어요."],game:["{item}을 즐기는 중","차례와 조작을 확인하며 게임을 즐기고 있어요."],
    shower:["{item}에서 씻는 중","사용 중 표시를 해 두고 천천히 씻고 있어요."],groom:["{item} 앞에서 단장하는 중","거울을 확인하며 차분하게 몸가짐을 정돈하고 있어요."],sleep:["{item}에서 쉬는 중","자리를 정리하고 몸을 편안히 누였어요."],
    eat:["{item}에서 먹고 마시는 중","자리에 앉아 천천히 먹고 마시고 있어요."],cook:["{item}을 사용해 준비하는 중","필요한 재료와 도구를 차례대로 꺼내고 있어요."],study:["{item}에서 집중하는 중","자리를 정리한 뒤 하던 일에 집중하고 있어요."],
    music:["{item}으로 음악을 즐기는 중","소리를 확인하며 자기 속도에 맞춰 음악을 즐기고 있어요."],create:["{item}에서 작업하는 중","도구를 안전하게 놓고 작업에 집중하고 있어요."],exercise:["{item}으로 운동하는 중","무리하지 않는 속도로 몸을 움직이고 있어요."],laundry:["{item}으로 빨래를 정리하는 중","세탁할 것과 마른 것을 나누어 정리하고 있어요."],play:["{item}을 가지고 노는 중","주변을 살피며 잠깐 즐거운 시간을 보내고 있어요."],dress:["{item}에서 옷을 고르는 중","옷장에 보관한 옷을 살펴보고 다음에 입을 옷을 고르고 있어요."],use:["{item}을 사용하는 중","사용할 자리를 잡고 자기 할 일을 하고 있어요."]
  },
  en:{
    walking:["Walking to {item} in {room}","They are heading to the available spot by {item}."],waiting:["Looking for an open spot","They are avoiding furniture already in use and choosing another activity."],
    rest:["Resting at {item}","They settled into a comfortable position for a short break."],watch:["Watching {item}","They found a spot and are focusing on the screen."],game:["Playing at {item}","They are enjoying the game while keeping track of the controls and turns."],
    shower:["Washing at {item}","They marked the fixture as occupied and are taking their time washing."],groom:["Getting ready at {item}","They are calmly tidying their appearance while checking the mirror."],sleep:["Resting at {item}","They made the spot comfortable and lay down to rest."],
    eat:["Eating and drinking at {item}","They took a seat and are eating and drinking at an easy pace."],cook:["Preparing something at {item}","They are taking out the ingredients and tools they need in order."],study:["Focusing at {item}","They cleared the space and are concentrating on what they were doing."],
    music:["Enjoying music at {item}","They are checking the sound and enjoying the music at their own pace."],create:["Working at {item}","They placed the tools safely and are focusing on the project."],exercise:["Exercising at {item}","They are moving at a pace that does not overdo it."],laundry:["Sorting laundry at {item}","They are separating items to wash from items that are dry."],play:["Playing with {item}","They are enjoying a little playtime while watching their surroundings."],dress:["Choosing clothes at {item}","They are looking through the clothes stored in the wardrobe and choosing what to wear next."],use:["Using {item}","They found an open position and are going about their activity."]
  },
  ja:{
    walking:["{room}の{item}へ移動中","空いている{item}のそばへ歩いています。"],waiting:["空いている家具を探し中","ほかの人が使用中の場所を避け、次の行動を選んでいます。"],
    rest:["{item}で休憩中","楽な姿勢になって少し休んでいます。"],watch:["{item}を見ているところ","場所を決め、画面に集中しています。"],game:["{item}で遊んでいるところ","操作や順番を確認しながらゲームを楽しんでいます。"],
    shower:["{item}で体を洗っているところ","使用中にして、ゆっくり体を洗っています。"],groom:["{item}の前で身支度中","鏡を確認しながら落ち着いて身なりを整えています。"],sleep:["{item}で休んでいるところ","場所を整え、楽な姿勢で横になりました。"],
    eat:["{item}で飲食中","席に座り、ゆっくり食べたり飲んだりしています。"],cook:["{item}で準備中","必要な材料と道具を順番に出しています。"],study:["{item}で集中しているところ","場所を片づけ、作業に集中しています。"],
    music:["{item}で音楽を楽しんでいるところ","音を確かめ、自分のペースで音楽を楽しんでいます。"],create:["{item}で作業中","道具を安全に置き、作業に集中しています。"],exercise:["{item}で運動中","無理のないペースで体を動かしています。"],laundry:["{item}で洗濯物を整理中","洗う物と乾いた物を分けて整理しています。"],play:["{item}で遊んでいるところ","周囲を見ながら少し楽しい時間を過ごしています。"],dress:["{item}で服を選んでいるところ","クローゼットにしまった服を見て、次に着る服を選んでいます。"],use:["{item}を使用中","空いている場所を使い、自分の用事を進めています。"]
  }
};

export function furnitureUseProfile(item){
  const name=String(item||"");
  const profile=PROFILE_GROUPS.find(entry=>entry.match.test(name));
  const minutes=profile?.minutes||[20,45];
  return {kind:profile?.kind||"use",duration:minutes[0]*60_000,minMinutes:minutes[0],maxMinutes:minutes[1]};
}

export function homeActivityDurationMinutes(item,seed=""){
  const profile=furnitureUseProfile(item),span=Math.max(0,profile.maxMinutes-profile.minMinutes);
  return profile.minMinutes+(span?hash(`${item}:${seed}`)%(span+1):0);
}

const SCENE_FURNITURE=[
  {scene:/옷을 고르|입을 옷|옷차림|의상을 고르|갈아입/,item:/옷장|행거|옷걸이|의류 수납/},
  {scene:/샤워|씻는|씻고/,item:/샤워/},{scene:/목욕|반신욕|욕조/,item:/욕조/},{scene:/TV|텔레비전|방송|영화|영상|드라마|프로그램|화면을 보는/,item:/TV|홈시어터|프로젝터|빔프로젝터/},
  {scene:/안마|마사지/,item:/안마의자/},{scene:/자는 중|잠들|낮잠|침구|이불/,item:/침대/},{scene:/요리|조리|식사 준비|굽는|반죽/,item:/조리대|오븐|냉장고|제빵|향신료|요리책/},
  {scene:/식사|아침을 먹|점심을 먹|저녁을 먹|차를 마|커피|음료|디저트/,item:/식탁|티 테이블|커피|에스프레소|티 세트|칵테일|와인/},
  {scene:/게임/,item:/게임기|보드게임/},{scene:/책|독서|공부|과제|업무|파일|컴퓨터/,item:/책장|독서|책상|컴퓨터/},{scene:/운동|러닝/,item:/러닝|운동/},
  {scene:/세탁|빨래|건조/,item:/세탁|건조|빨래/},{scene:/화장|단장|거울|스킨케어|향수/,item:/세면대|전신거울|화장대|스킨케어|향수/},
  {scene:/음악|연주|노래|레코드/,item:/피아노|기타|악기|오디오|턴테이블|레코드/},{scene:/그림|작업|만드는|공예|뜨개|촬영|재봉/,item:/그림|재봉|드로잉|촬영|공예|뜨개|프라모델|작업대/},
  {scene:/쉬는|휴식|멍하니/,item:/소파|의자|안마의자/}
];
export function furniturePatternForScene(scene){
  const text=`${scene?.title||""} ${scene?.desc||""}`;
  return SCENE_FURNITURE.find(entry=>entry.scene.test(text))?.item||null;
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
    fromRoomKey:roomKeys.includes(source.fromRoomKey)?source.fromRoomKey:fallbackRoom,
    ...safeHomePoint(source.x,source.y),
    fromX:safeHomePoint(source.fromX,source.fromY).x,fromY:safeHomePoint(source.fromX,source.fromY).y,
    furnitureId:String(source.furnitureId||"").slice(0,120),item:String(source.item||"").slice(0,80),
    actionKind:String(source.actionKind||"use").slice(0,40),sceneKey:String(source.sceneKey||"").slice(0,300),
    interactionId:String(source.interactionId||"").slice(0,180),approachingInteraction:Boolean(source.approachingInteraction),
    startedAt:Math.max(0,Number(source.startedAt)||0),endsAt:Math.max(0,Number(source.endsAt)||0),
    arrivesAt:Math.max(0,Number(source.arrivesAt)||0),
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
    id:String(placement.id||""),roomKey,item:String(placement.item||""),x:clamp(placement.x,6,94,50),y:clamp(placement.y,14,90,65),
    assignedCharacterIds:Array.isArray(placement.assignedCharacterIds)?placement.assignedCharacterIds.map(String):[],capacity:String(placement.item||"")==="커플 침대"?2:/TV|홈시어터|프로젝터|빔프로젝터/.test(String(placement.item||""))?4:/침대/.test(String(placement.item||""))?1:1
  }))).filter(placement=>placement.id&&placement.item);
}

function walkingDuration(agent,target){
  const roomChange=agent.roomKey!==target.roomKey;
  const distance=roomChange?110:Math.hypot(agent.x-target.x,agent.y-target.y);
  return Math.round(clamp(2600+distance*28,2600,6500,4200));
}

export function advanceHomeLifeSimulation(home,characterIds,contexts={},now=Date.now()){
  const roomKeys=Object.keys(home?.rooms||{}),current=normalizeHomeLifeSimulation(home?.lifeSimulation,roomKeys);
  const before=JSON.stringify({...current,updatedAt:0}),eligible=[...new Set((characterIds||[]).map(String))].filter(Boolean).slice(0,40);
  const eligibleSet=new Set(eligible),placements=placementList(home),placementById=new Map(placements.map(item=>[item.id,item]));
  if(!placements.length||!eligible.length){
    current.agents={};current.reservations={};current.updatedAt=now;
    return {simulation:current,changed:before!==JSON.stringify({...current,updatedAt:0}),nextAt:now+10_000};
  }
  Object.keys(current.agents).forEach(id=>{if(!eligibleSet.has(id))delete current.agents[id]});
  current.reservations={};
  const occupied=new Map();
  eligible.forEach((characterId,index)=>{
    const context=contexts?.[characterId]&&typeof contexts[characterId]==="object"?contexts[characterId]:{};
    const scene=context.scene||{},roomKey=roomKeys.includes(scene.room)?scene.room:(roomKeys.includes(context.roomKey)?context.roomKey:roomKeys[index%Math.max(1,roomKeys.length)]||"");
    const sceneKey=String(context.sceneKey||`${scene.minute??""}:${scene.title||""}:${roomKey}`),pattern=furniturePatternForScene(scene),sleeping=/자는 중|잠들|낮잠|침구|이불/.test(`${scene.title||""} ${scene.desc||""}`);
    let candidates=placements.filter(item=>item.roomKey===roomKey&&(!pattern||pattern.test(item.item)));
    if(sleeping){
      const assigned=candidates.filter(item=>item.assignedCharacterIds.includes(characterId));
      candidates=assigned.length?assigned:candidates.filter(item=>!item.assignedCharacterIds.length);
    }
    candidates=candidates.filter(item=>(occupied.get(item.id)||0)<item.capacity);
    const rawTarget=candidates.length?candidates[hash(`${characterId}:${sceneKey}`)%candidates.length]:null;
    const target=rawTarget?{...rawTarget,...safeHomePoint(rawTarget.x,rawTarget.y)}:null;
    if(target)occupied.set(target.id,(occupied.get(target.id)||0)+1);
    const old=current.agents[characterId],sameScene=old?.sceneKey===sceneKey&&(!old.furnitureId||placementById.has(old.furnitureId));
    const sceneStartAt=Math.max(0,Number(context.startedAt)||now),sceneEndAt=Math.max(now+60_000,Number(context.endsAt)||now+homeActivityDurationMinutes(target?.item||scene.title,`${characterId}:${sceneKey}`)*60_000);
    if(sameScene){
      old.endsAt=sceneEndAt;
      if(old.phase==="walking"&&old.arrivesAt<=now){old.phase="using";old.startedAt=old.arrivesAt||now;old.fromRoomKey=old.roomKey}
      if(target){if(!context.interactionId){old.x=target.x;old.y=target.y}old.roomKey=target.roomKey;old.item=target.item;old.furnitureId=target.id;old.actionKind=furnitureUseProfile(target.item).kind}
    }else{
      const fallback={roomKey,...safeHomePoint(18+(hash(`${characterId}:${sceneKey}:x`)%65),35+(hash(`${characterId}:${sceneKey}:y`)%48))};
      const destination=target||fallback,currentPoint=currentAgentPoint(old,now),fromRoom=roomKeys.includes(currentPoint.roomKey)?currentPoint.roomKey:roomKey,fromX=old?(Number(currentPoint.x)||12):14+(hash(`${characterId}:spawn-x`)%66),fromY=old?(Number(currentPoint.y)||82):48+(hash(`${characterId}:spawn-y`)%38);
      const movementStartsAt=target?now+180+(hash(`${characterId}:${sceneKey}:movement-start`)%4200):sceneStartAt;
      const arrivesAt=movementStartsAt+walkingDuration({roomKey:fromRoom,x:fromX,y:fromY},destination);
      current.agents[characterId]=normalizeAgent({characterId,phase:target?"walking":"using",roomKey,fromRoomKey:fromRoom,x:destination.x,y:destination.y,fromX,fromY,furnitureId:target?.id||"",item:target?.item||"",actionKind:target?furnitureUseProfile(target.item).kind:"use",sceneKey,startedAt:movementStartsAt,arrivesAt:target?arrivesAt:now,endsAt:sceneEndAt,sequence:(old?.sequence||0)+1},characterId,roomKeys);
    }
    const agent=current.agents[characterId];
    if(!context.interactionId){agent.interactionId="";agent.approachingInteraction=false}
    if(target){
      const reservation=current.reservations[target.id]||{characterId,characterIds:[],until:sceneEndAt};
      reservation.characterIds=[...new Set([...reservation.characterIds,characterId])];reservation.characterId=reservation.characterIds[0];reservation.until=Math.max(reservation.until,sceneEndAt);current.reservations[target.id]=reservation;
    }
  });

  // 공동 장면은 화면에서 좌표만 순간적으로 붙이지 않고, 두 인물이 실제로
  // 서로를 향해 걸어간 뒤 마주 보는 자리에서 멈추도록 목표를 만든다.
  const interactionGroups=new Map();
  eligible.forEach(characterId=>{
    const context=contexts?.[characterId]||{},interactionId=String(context.interactionId||"");if(!interactionId)return;
    const members=interactionGroups.get(interactionId)||[];members.push(characterId);interactionGroups.set(interactionId,members);
  });
  interactionGroups.forEach((members,interactionId)=>{
    if(members.length<2)return;
    const contextRooms=new Set(members.map(id=>contexts?.[id]?.scene?.room||contexts?.[id]?.roomKey||current.agents[id]?.roomKey).filter(Boolean));
    if(contextRooms.size!==1){members.forEach(id=>{const agent=current.agents[id];if(agent?.interactionId===interactionId){agent.interactionId="";agent.approachingInteraction=false}});return}
    const preferred=contexts?.[members[0]]?.partnerIds||[];
    const ordered=[...members].sort((a,b)=>{const ai=preferred.indexOf(a),bi=preferred.indexOf(b);return (ai<0?99:ai)-(bi<0?99:bi)||a.localeCompare(b)}).slice(0,2);
    const agents=ordered.map(id=>current.agents[id]).filter(Boolean);if(agents.length<2)return;
    const roomKey=[...contextRooms][0];
    if(agents.some(agent=>agent.roomKey!==roomKey))return;
    const anchor=safeHomePoint(clamp(agents.reduce((sum,agent)=>sum+Number(agent.x||50),0)/agents.length,22,78,50),clamp(agents.reduce((sum,agent)=>sum+Number(agent.y||58),0)/agents.length,24,82,58)),anchorX=anchor.x,anchorY=anchor.y;
    const text=ordered.map(id=>`${contexts?.[id]?.scene?.title||""} ${contexts?.[id]?.scene?.desc||""}`).join(" "),close=/뽀뽀|입맞춤|키스|포옹|껴안/.test(text),gap=close?9:17;
    ordered.forEach((characterId,index)=>{
      // participantOrder의 첫 인물은 항상 화면 왼쪽, 두 번째 인물은 오른쪽에
      // 둔다. 관계 설정에서 정한 좌우 순서가 집 장면에서도 뒤집히지 않는다.
      const agent=current.agents[characterId],point=currentAgentPoint(agent,now),destination={roomKey,...safeHomePoint(anchorX+(index?gap:-gap),anchorY+(index?2:-2))};
      const alreadyHeading=agent.interactionId===interactionId&&agent.roomKey===roomKey&&Math.hypot(Number(agent.x)-destination.x,Number(agent.y)-destination.y)<1;
      agent.interactionId=interactionId;
      if(alreadyHeading){if(agent.phase==="walking"&&agent.arrivesAt<=now)agent.phase="using";if(agent.phase!=="walking")agent.approachingInteraction=false;return}
      const duration=Math.max(1500,Math.round(walkingDuration(point,destination)*.72)),startsAt=now+120+(hash(`${characterId}:${interactionId}:movement-start`)%1800);
      Object.assign(agent,{phase:"walking",fromRoomKey:point.roomKey||roomKey,roomKey,fromX:point.x,fromY:point.y,x:destination.x,y:destination.y,startedAt:startsAt,arrivesAt:startsAt+duration,endsAt:Math.max(agent.endsAt,startsAt+duration+5_000),interactionId,approachingInteraction:true});
    });
  });

  // 상호작용 중이 아닐 때는 사람끼리 같은 지점을 차지하지 않게 한다.
  // 결정적인 방향으로만 밀어 재렌더할 때 좌우가 뒤집히거나 떨리지 않는다.
  const agents=eligible.map(id=>current.agents[id]).filter(Boolean);
  for(let i=0;i<agents.length;i+=1)for(let j=i+1;j<agents.length;j+=1){
    const a=agents[i],b=agents[j];if(a.roomKey!==b.roomKey)continue;
    const sameInteraction=a.interactionId&&a.interactionId===b.interactionId,minDistance=sameInteraction?10:23,dx=Number(b.x)-Number(a.x),dy=Number(b.y)-Number(a.y),distance=Math.hypot(dx,dy);
    if(distance>=minDistance)continue;
    const direction=hash(`${a.characterId}:${b.characterId}`)%2?1:-1,shift=(minDistance-distance)/2+1;
    Object.assign(a,safeHomePoint(Number(a.x)-direction*shift,a.y));Object.assign(b,safeHomePoint(Number(b.x)+direction*shift,b.y));
    if(Math.abs(dy)<4){Object.assign(a,safeHomePoint(a.x,Number(a.y)-shift*.35));Object.assign(b,safeHomePoint(b.x,Number(b.y)+shift*.35))}
  }

  current.updatedAt=now;
  const nextAt=eligible.flatMap(id=>[current.agents[id]?.phase==="walking"?current.agents[id]?.startedAt:0,current.agents[id]?.phase==="walking"?current.agents[id]?.arrivesAt:0,current.agents[id]?.endsAt]).filter(value=>value>now).reduce((soonest,value)=>Math.min(soonest,value),now+10*60_000);
  return {simulation:current,changed:before!==JSON.stringify({...current,updatedAt:0}),nextAt};
}

export function homeLifeNextDelay(value,now=Date.now()){
  const agents=Object.values(value?.agents||{}),nextAt=agents.flatMap(agent=>[agent?.phase==="walking"?Number(agent?.startedAt)||0:0,agent?.phase==="walking"?Number(agent?.arrivesAt)||0:0,Number(agent?.endsAt)||0]).filter(time=>time>now).reduce((soonest,time)=>Math.min(soonest,time),now+10*60_000);
  return clamp(nextAt-now,800,10*60_000,3000);
}

function currentAgentPoint(agent,now){
  if(!agent)return {x:12,y:82,roomKey:""};
  if(agent.phase!=="walking"||!agent.arrivesAt||now>=agent.arrivesAt)return {x:agent.x,y:agent.y,roomKey:agent.roomKey};
  const duration=Math.max(1,Number(agent.arrivesAt)-Number(agent.startedAt)),progress=clamp((now-Number(agent.startedAt))/duration,0,1,0);
  return {x:Number(agent.fromX)+(Number(agent.x)-Number(agent.fromX))*progress,y:Number(agent.fromY)+(Number(agent.y)-Number(agent.fromY))*progress,roomKey:progress<.5?agent.fromRoomKey:agent.roomKey};
}
