import {state,save,characterViewFor,explicitCharacterViewFor} from "./state.js?v=20260807s";

const mins=t=>{const [h,m]=String(t||"00:00").split(":").map(Number);return h*60+m};
const clock=n=>`${String(Math.floor(n/60)%24).padStart(2,"0")}:${String(n%60).padStart(2,"0")}`;
const hash=s=>[...String(s)].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,2166136261);
const hasBatchim=value=>{
  const chars=[...String(value||"").trim()];
  const code=chars.at(-1)?.charCodeAt(0);
  return Number.isFinite(code)&&code>=0xac00&&code<=0xd7a3?(code-0xac00)%28!==0:false;
};
const withParticle=(value,batchim,noBatchim)=>`${value}${hasBatchim(value)?batchim:noBatchim}`;
const subject=value=>withParticle(value,"이","가");
const togetherWith=value=>withParticle(value,"과","와");
const object=value=>withParticle(value,"을","를");
const topic=value=>withParticle(value,"은","는");
const resolveParticles=text=>String(text||"")
  .replace(/([가-힣A-Za-z0-9_]+)은\(는\)/g,(_,word)=>topic(word))
  .replace(/([가-힣A-Za-z0-9_]+)이\(가\)/g,(_,word)=>subject(word))
  .replace(/([가-힣A-Za-z0-9_]+)을\(를\)/g,(_,word)=>object(word))
  .replace(/([가-힣A-Za-z0-9_]+)과\(와\)/g,(_,word)=>togetherWith(word));
const regexEscape=value=>String(value||"").replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
const entityNames=()=>[
  ...Object.values(state.characters||{}).map(item=>item?.name),
  ...Object.values(state.homes||{}).flatMap(home=>[home?.name,...Object.values(home?.rooms||{}).map(room=>room?.name),...(home?.pets||[]).map(pet=>pet?.name)]),
  ...(state.towns||[]).flatMap(town=>[town?.name,...(town?.places||[]).map(place=>place?.name)]),
  ...Object.values(state.catalog||{}).flatMap(items=>(items||[]).map(item=>item?.name))
].filter(Boolean).map(String).sort((a,b)=>b.length-a.length);
const resolveEntityParticles=text=>{
  let result=resolveParticles(text);
  entityNames().forEach(name=>{
    const pattern=new RegExp(`${regexEscape(name)}(은|는|이|가|을|를|과|와)(?=[\\s,.!?·'\"’”)]|$)`,"g");
    result=result.replace(pattern,(_,particle)=>{
      if(["은","는"].includes(particle))return topic(name);
      if(["이","가"].includes(particle))return subject(name);
      if(["을","를"].includes(particle))return object(name);
      return togetherWith(name);
    });
  });
  return result;
};
const dayKey=(d=new Date())=>`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
const nowMin=(d=new Date())=>d.getHours()*60+d.getMinutes();
const jitter=(c,kind,d=new Date())=>(hash(`${c.id}:${dayKey(d)}:${kind}`)%21)-10;
const wakeAt=(c,d)=>Math.max(0,mins(c.wake)+jitter(c,"wake",d));
const sleepAt=(c,d)=>Math.max(0,mins(c.sleep)+jitter(c,"sleep",d));
const sleepingNow=(c,d)=>{
  const n=nowMin(d), wake=wakeAt(c,d), sleep=sleepAt(c,d);
  return sleep<=wake ? n>=sleep&&n<wake : n>=sleep||n<wake;
};
const sleepScene=(c,d=new Date())=>{
  const habit=c.sleepHabit||"이불을 단정히 덮고 잠";
  const scenes={
    "이불을 단정히 덮고 잠":["이불 끝을 가지런히 맞춘 채 편안하게 숨을 고르며 깊이 잠들어 있어요.","베개와 이불을 흐트러뜨리지 않은 채 고요하게 자고 있어요."],
    "이불을 걷어차며 잠":["자다가 더웠는지 이불을 발끝으로 밀어내고 깊이 잠들어 있어요.","이불이 침대 한쪽으로 밀려난 것도 모른 채 편안하게 자고 있어요."],
    "옆으로 웅크려 잠":["몸을 옆으로 작게 웅크리고 이불 속에서 따뜻하게 잠들어 있어요."],
    "팔다리를 뻗고 잠":["침대를 넓게 차지하고 팔다리를 쭉 뻗은 채 느긋하게 자고 있어요."],
    "베개를 끌어안고 잠":["베개를 품에 꼭 끌어안고 얼굴을 살짝 묻은 채 잠들어 있어요."],
    "잠꼬대를 자주 함":["알아듣기 어려운 말을 작게 중얼거리다가 다시 조용히 잠들었어요.","꿈속 누군가에게 대답하듯 짧게 잠꼬대를 하고 있어요."],
    "뒤척임이 많음":["몇 번이나 자세를 바꾸며 뒤척이다가 다시 잠에 빠져들고 있어요."],
    "아주 얌전히 잠":["처음 누운 모습 그대로 거의 움직이지 않고 아주 얌전히 자고 있어요."],
    "새벽에 자주 깸":["잠깐 눈을 떴다가 시간을 확인하지 않고 다시 이불 속으로 파고들었어요."],
    "코를 골며 깊이 잠":["규칙적인 숨소리와 옅은 코골이 소리를 내며 깊이 잠들어 있어요."]
  };
  const options=scenes[habit]||scenes["이불을 단정히 덮고 잠"];
  return options[hash(`${c.id}:${dayKey(d)}:${Math.floor(nowMin(d)/60)}:sleep`)%options.length];
};
const wakeScene=(c,d=new Date())=>{
  const habit=c.wakeHabit||"알람을 듣고 천천히 일어남";
  const scenes={
    "알람을 듣고 천천히 일어남":"알람을 끄고 잠깐 눈을 감았다가 이불을 걷어 내며 천천히 몸을 일으켰어요.",
    "알람이 울리기 전에 눈을 뜸":"알람이 울리기 전에 먼저 눈을 떠 조용한 방 안을 살피고 침대에서 일어났어요.",
    "알람을 여러 번 미룸":"알람을 몇 번이나 미룬 뒤에야 시간을 확인하고 서둘러 이불 밖으로 나왔어요.",
    "눈을 뜨자마자 바로 일어남":"눈을 뜨자마자 망설이지 않고 침대에서 일어나 오늘 할 일을 떠올렸어요.",
    "이불 속에서 한참 뒹굶":"눈은 떴지만 이불 속에서 한참 자세를 바꾸다가 아쉬운 표정으로 몸을 일으켰어요.",
    "일어나자마자 창문을 엶":"일어나자마자 창문을 열어 바깥 공기를 들이고 날씨부터 확인했어요.",
    "일어나자마자 물을 마심":"침대에서 일어난 뒤 미리 둔 물을 천천히 마시며 잠을 깨고 있어요.",
    "침대에서 오늘 일정을 확인함":"이불을 정리하기 전에 오늘의 일정과 약속부터 차분히 확인했어요.",
    "비몽사몽한 채 방을 돌아다님":"아직 잠이 덜 깬 얼굴로 방 안을 서성이다 필요한 물건을 하나씩 챙겼어요.",
    "누가 깨워 줘야 일어남":"혼자서는 쉽게 눈을 뜨지 못하다가 동거인의 인기척과 부름에 겨우 몸을 일으켰어요."
  };
  return scenes[habit]||scenes["알람을 듣고 천천히 일어남"];
};
const residenceForDate=(c,date=new Date())=>{
  const residences=(Array.isArray(c?.residences)?c.residences:[]).filter(item=>item&&state.homes?.[item.homeId]);
  const primary=residences.find(item=>item.isPrimary)||residences.find(item=>item.homeId===c?.homeId)||residences[0]||null;
  const day=date.getDay(),dateKey=`${String(date.getMonth()+1).padStart(2,"0")}${String(date.getDate()).padStart(2,"0")}`;
  const scheduled=residences.filter(item=>{
    if(item===primary)return false;
    const exact=String(item.visitDates||"").split(/[\s,]+/).map(value=>value.replace(/\D/g,"")).includes(dateKey);
    const chosenDay=(item.visitDays||[]).map(Number).includes(day);
    if(exact)return true;
    if(item.stayPattern==="요일 지정")return chosenDay;
    if(item.stayPattern==="주말 중심")return day===0||day===6;
    if(item.stayPattern==="평일 중심")return day>=1&&day<=5;
    return false;
  });
  if(!scheduled.length)return primary;
  return scheduled[hash(`${c.id}:${dayKey(date)}:scheduled-home`)%scheduled.length];
};
const homeIdForDate=(c,date=new Date())=>residenceForDate(c,date)?.homeId||c?.homeId||"";
const townFor=(c,date=new Date())=>{
  const home=state.homes?.[homeIdForDate(c,date)];
  return state.towns.find(t=>t.id===(home?.townId||c.townId))||state.towns.find(t=>t.id===c.townId)||state.towns[0]||state.world;
};
const workplaceTown=c=>state.towns.find(t=>t.places?.some(p=>p.id===c.workplaceId));
const scheduledTown=(c,date=new Date())=>{
  const routine=(state.routines?.[c.id]||[]).find(item=>Number(item.day)===date.getDay()&&item.placeId);
  return routine?state.towns.find(t=>t.places?.some(p=>p.id===routine.placeId)):null;
};
const travelPurpose=(c,date=new Date())=>{
  const birthdayKey=`${String(date.getMonth()+1).padStart(2,"0")}${String(date.getDate()).padStart(2,"0")}`;
  const birthdayHost=state.order.map(id=>state.characters[id]).find(character=>character?.birthday===birthdayKey);
  if(birthdayHost)return {town:townFor(birthdayHost,date),label:`${birthdayHost.name}의 생일파티`,kind:"birthday"};
  const workTown=workplaceTown(c);
  if(workTown&&c.job!=="무직")return {town:workTown,label:"출근 일정",kind:"work"};
  const routine=(state.routines?.[c.id]||[]).find(item=>Number(item.day)===date.getDay()&&item.placeId);
  const town=scheduledTown(c,date);
  if(town)return {town,label:routine?.title||routine?.type||"등록한 일정",kind:"routine"};
  return {town:townFor(c,date),label:"",kind:"home"};
};
const activityTown=(c,date=new Date())=>{
  return travelPurpose(c,date).town;
};
const placeFor=(types,seed,c,date=new Date())=>{const places=activityTown(c,date)?.places||[],list=places.filter(p=>types.includes(p.type));return list.length?list[hash(seed)%list.length]:places[hash(seed)%Math.max(1,places.length)]};
const configuredAppearanceValue=value=>value&&!["설정하지 않음","하지 않음"].includes(value)?String(value):"";
const hairColorText=value=>({
  "검은색":"검은","짙은 갈색":"짙은 갈색","갈색":"갈색","밝은 갈색":"밝은 갈색","금발":"금빛","백발·은발":"백색·은색","회색":"회색","청회색":"청회색","빨간색":"붉은","주황색":"주황색","분홍색":"분홍색","보라색":"보라색","파란색":"파란색","청록색":"청록색","초록색":"초록색","여러 색":"여러 색"
}[value]||configuredAppearanceValue(value));
const eyeColorText=value=>({
  "검은색":"검은","짙은 갈색":"짙은 갈색","갈색":"갈색","연갈색":"연갈색","호박색":"호박색","금색":"금색","초록색":"초록색","청록색":"청록색","파란색":"파란색","청회색":"청회색","회색":"회색","보라색":"보라색","분홍색":"분홍색","빨간색":"붉은","백색":"백색","여러 색":"여러 색"
}[value]||configuredAppearanceValue(value));
const appearanceProfile=c=>c?.bodyProfile?.appearance||{};
const hairLookPhrase=c=>{
  const a=appearanceProfile(c),color=hairColorText(a.hairColor),texture=configuredAppearanceValue(a.hairTexture);
  const textureText={"약한 반곱슬":"반곱슬","강한 반곱슬":"짙은 반곱슬","곱슬":"곱슬","강한 곱슬":"강한 곱슬","직모":"곧은"}[texture]||"";
  return [color,textureText].filter(Boolean).join(" ")+(color||textureText?"머리":"");
};
const eyeLookPhrase=c=>{
  const a=appearanceProfile(c),left=eyeColorText(a.leftEyeColor),right=eyeColorText(a.rightEyeColor);
  if(left&&right&&left!==right)return `왼쪽은 ${left}, 오른쪽은 ${right}인 눈`;
  const color=left||right;
  return color?`${color} 눈`:"";
};
const appearanceTraitTags=c=>{
  const a=appearanceProfile(c),tags=[],hairColor=hairColorText(a.hairColor),eyeColor=eyeColorText(a.leftEyeColor===a.rightEyeColor?a.leftEyeColor:"");
  const hairTags={"검은":"검은 머리","갈색":"갈색 머리","짙은 갈색":"갈색 머리","밝은 갈색":"갈색 머리","금빛":"금발","백색·은색":"백발·은발","붉은":"빨간 머리","분홍색":"분홍 머리","보라색":"보라 머리","파란색":"파란 머리","청록색":"청록 머리","초록색":"초록 머리"};
  const eyeTags={"검은":"검은 눈","갈색":"갈색 눈","짙은 갈색":"갈색 눈","연갈색":"갈색 눈","호박색":"호박색 눈","금색":"금색 눈","초록색":"초록색 눈","파란색":"파란색 눈","청회색":"청회색 눈","회색":"회색 눈","보라색":"보라색 눈"};
  if(hairTags[hairColor])tags.push(hairTags[hairColor]);
  if(eyeTags[eyeColor])tags.push(eyeTags[eyeColor]);
  if(a.leftEyeColor&&a.rightEyeColor&&a.leftEyeColor!==a.rightEyeColor)tags.push("오드아이");
  if(/곱슬/.test(a.hairTexture||""))tags.push("곱슬머리");
  if(/웨이브/.test((a.hairStyles||[]).join(" ")))tags.push("웨이브머리");
  if(["가슴 길이","허리 길이","허리보다 김"].includes(a.hairLength))tags.push("장발");
  if(a.hairLength==="단발")tags.push("단발");
  if(["삭발·매우 짧음","귀 위 길이","숏컷"].includes(a.hairLength))tags.push("숏컷");
  (a.hairStyles||[]).forEach(style=>tags.push(style,style.replace(" 스타일링","머리").replace("번 헤어","올림머리")));
  return [...new Set(tags.filter(Boolean))];
};
const itemById=id=>Object.values(state.catalog||{}).flat().find(x=>x.id===id);
const relationList=()=>Object.values(state.relationships||{});
const relationPriority={"부모·자녀":10,"형제·자매":9,부부:9,연인:8,소꿉친구:6,친구:5,"학창 시절 친구들":5,"친구 모임":4,산악회:4,동거인:4,"동아리 동료":3,"직장 동료":3,라이벌:2,혐관:1,기타:1};
const related=c=>{
  const grouped=new Map();
  relationList().filter(r=>r.a===c.id||r.b===c.id).forEach(relation=>{
    const otherId=relation.a===c.id?relation.b:relation.a;
    if(!grouped.has(otherId))grouped.set(otherId,[]);
    grouped.get(otherId).push(relation);
  });
  return [...grouped.entries()].map(([otherId,relations])=>{
    const primary=relations.slice().sort((a,b)=>(relationPriority[b.type]||0)-(relationPriority[a.type]||0))[0];
    return {other:state.characters[otherId],relations,r:{...primary,types:[...new Set(relations.map(relation=>relation.type))],intimacy:Math.max(...relations.map(relation=>Number(relation.intimacy)||0)),conflict:Math.max(...relations.map(relation=>Number(relation.conflict)||0))}};
  }).filter(item=>item.other);
};
const preferredRelation=c=>related(c).sort((a,b)=>(relationPriority[b.r.type]||0)-(relationPriority[a.r.type]||0)||(b.r.intimacy||0)-(a.r.intimacy||0))[0];

function selectedBodyVariants(c,socialScene,seed="",date=new Date()){
  // 신체·접근성 설정은 존중해야 하지만 캐릭터의 모든 장면을 그 특성으로
  // 설명하지 않는다. 이동 문구 자체의 안전성은 adaptAccessibilityWording에서
  // 항상 지키고, 구체적인 보조기기 언급은 드문 생활 장면에서만 고른다.
  if(hash(`${c.id}:${dayKey(date)}:${seed}:body-mention`)%24!==0)return[];
  const p=c.bodyProfile||{},variants=[];
  const sideText=value=>value==="양쪽"?"양쪽":value==="왼쪽"?"왼쪽":value==="오른쪽"?"오른쪽":"";
  const wheelchair=p.wheelchair||{},arm=p.prostheticArm||{},leg=p.prostheticLeg||{},hearing=p.hearing||{},vision=p.vision||{};
  if(wheelchair.type&&wheelchair.type!=="사용하지 않음"){
    variants.push(
      "휠체어로 편안하게 지나갈 수 있는 동선과 필요한 회전 공간을 먼저 확인한 뒤 자기 속도로 움직였어요.",
      wheelchair.type==="전동 휠체어"?"전동 휠체어의 배터리 상태와 조작부를 확인하고 오늘 일정에 맞게 준비했어요.":"바퀴와 브레이크 상태를 가볍게 확인하고 익숙한 자세로 일상을 이어 갔어요."
    );
    if(socialScene)variants.push("함께 있는 사람은 휠체어나 손잡이에 먼저 손대지 않고 도움이 필요한지 물은 뒤 대답을 기다렸어요.","일행은 계단 없는 동선과 들어가기 편한 자리를 함께 확인하되 최종 선택은 당사자에게 맡겼어요.");
  }
  if(arm.side&&arm.side!=="사용하지 않음"){
    const armType=arm.custom||arm.type||"의수",label=`${sideText(arm.side)} ${armType}`.trim();
    variants.push(`${label}의 착용감과 연결 부위를 확인하고 지금 할 일에 편한 방식으로 조절했어요.`,`${label}에 맞는 익숙한 손동작으로 필요한 물건을 안정적으로 다뤘어요.`);
    if(/갈고리|집게/.test(armType))variants.push("오늘 다룰 물건에 맞춰 갈고리·집게형 단말의 벌어짐과 장력을 확인하고 익숙한 각도로 잡았어요.","옷이나 물건이 걸리지 않도록 단말의 위치를 조절한 뒤 필요한 힘만 사용해 안정적으로 작업했어요.");
    if(/바디파워/.test(armType))variants.push("하네스와 케이블의 장력이 몸에 맞는지 확인하고 어깨 움직임으로 여닫는 범위를 천천히 점검했어요.","반복 동작에서 연결 부위가 불편하지 않도록 케이블 길이와 자세를 자기 몸에 맞게 조절했어요.");
    if(/근전동|전자/.test(armType))variants.push("배터리와 전극 접촉 상태를 확인하고 오늘 자주 쓸 쥐기 모드를 차례로 시험했어요.","힘을 과하게 주지 않아도 원하는 동작이 나오는지 센서 반응을 확인한 뒤 일상 동작을 이어 갔어요.");
    if(/스포츠|활동|특정 작업|교체 도구/.test(armType))variants.push("오늘 할 활동에 맞는 교체 부품을 고르고 연결부가 단단히 고정됐는지 직접 확인했어요.","일상용 부품과 작업용 부품 가운데 지금 필요한 것을 선택해 안전하게 교체하고 동작 범위를 점검했어요.");
    if(/손형|미관/.test(armType))variants.push("손형 의수의 손가락과 표면 상태를 살피고 옷소매와 닿는 부분이 불편하지 않게 정돈했어요.","오늘 필요한 동작과 차림에 맞춰 손형 의수의 위치와 착용감을 자기 기준으로 조절했어요.");
    if(socialScene)variants.push("상대는 의수에 허락 없이 손대거나 대신 해내려 하지 않고 필요한 방식이 있는지 먼저 물었어요.");
  }
  if(leg.side&&leg.side!=="사용하지 않음"){
    const label=`${sideText(leg.side)} ${leg.custom||leg.type||"의족"}`.trim();
    variants.push(`${label}의 소켓과 착용 상태를 살피고 몸에 무리가 없는 속도로 움직였어요.`,`${label}으로 익숙한 균형을 잡아 자기가 고른 동선을 자연스럽게 이동했어요.`);
    if(socialScene)variants.push("함께 걷는 사람은 속도를 임의로 정하지 않고 어느 길이 편한지 물어 나란히 맞췄어요.");
  }
  if(hearing.side&&hearing.side!=="설정하지 않음"){
    const supports=Array.isArray(hearing.supports)?hearing.supports:[];
    if(supports.includes("자막"))variants.push("소리를 놓쳐도 내용을 따라갈 수 있도록 자막을 켜고 편안하게 장면을 즐겼어요.");
    if(supports.includes("보청기")||supports.includes("인공와우"))variants.push(`${supports.includes("보청기")?"보청기":"인공와우"}의 상태를 확인하고 주변 소리가 과하지 않은 자리를 골랐어요.`);
    if(supports.includes("수어"))variants.push("말뿐 아니라 익숙한 수어로 뜻과 감정을 자연스럽게 주고받았어요.");
    if(supports.includes("문자 대화"))variants.push("중요한 내용은 문자로 함께 확인해 빠뜨리는 부분 없이 대화를 이어 갔어요.");
    if(socialScene)variants.push("상대는 얼굴과 입모양이 잘 보이는 위치에서 평소 속도로 말하고, 알아들었는지 재촉하지 않았어요.","말이 겹치지 않게 한 사람씩 이야기하고 필요한 내용은 문자나 화면으로 함께 보여 줬어요.");
  }
  if(vision.side&&vision.side!=="설정하지 않음"){
    const supports=Array.isArray(vision.supports)?vision.supports:[];
    if(supports.includes("화면 읽기"))variants.push("화면 읽기 기능으로 필요한 정보를 빠르게 확인하고 익숙한 순서대로 조작했어요.");
    if(supports.includes("확대·고대비"))variants.push("글자 크기와 대비를 자기 눈에 편하게 맞춘 뒤 내용을 차분히 살폈어요.");
    if(supports.includes("흰지팡이"))variants.push("흰지팡이로 앞의 지형과 경계를 확인하며 익숙한 속도로 이동했어요.");
    if(supports.includes("안내견"))variants.push("안내견과 호흡을 맞춰 필요한 곳으로 이동하고, 쉴 때에는 방해받지 않는 자리를 마련했어요.");
    if(socialScene)variants.push("상대는 갑자기 팔을 잡지 않고 안내가 필요한지 먼저 물은 뒤 원하는 방식대로 길과 주변 정보를 설명했어요.","함께 있는 사람은 물건을 임의로 옮기지 않고 달라진 위치가 있으면 구체적으로 알려 줬어요.");
  }
  const conditions=Array.isArray(p.healthConditions)?p.healthConditions:[];
  if(conditions.includes("당뇨병"))variants.push("오늘 일정에 필요한 측정 도구와 비상용 간식을 챙겼는지 확인하고 자기 관리 계획에 맞춰 움직였어요.","식사와 휴식 시각을 스스로 정한 관리 계획에 맞게 확인하되 하던 일의 즐거움도 놓치지 않았어요.");
  if(conditions.some(value=>["천식","심혈관 질환","관절 질환","만성 통증","신장 질환"].includes(value)))variants.push("몸의 신호를 무시하지 않고 필요한 때 잠깐 쉬면서 자기에게 맞는 속도로 일상을 이어 갔어요.","무리해서 증명하려 하지 않고 오늘 컨디션에 맞게 순서와 강도를 스스로 조절했어요.");
  if(p.bodySize==="비만 체형")variants.push("자기 몸이 편안한 의자와 움직이기 좋은 공간을 자연스럽게 골라 하던 일에 집중했어요.");
  const physicalTraits=Array.isArray(p.physicalTraits)?p.physicalTraits:[];
  if(physicalTraits.includes("키가 큼"))variants.push("높은 곳의 물건도 자기에게 익숙한 동작으로 꺼내고 부딪힐 수 있는 낮은 구조물을 자연스럽게 살폈어요.");
  if(physicalTraits.includes("키가 작음"))variants.push("손이 닿기 편한 위치와 안전한 발판을 골라 필요한 물건을 자기 방식으로 꺼냈어요.");
  const preferences=Array.isArray(p.accessibilityPreferences)?p.accessibilityPreferences:[];
  if(socialScene&&preferences.includes("도움 전에 먼저 물어보기"))variants.push("상대는 필요를 짐작해 대신 처리하지 않고 도움이 필요한지 먼저 물은 뒤 선택을 존중했어요.");
  if(socialScene&&preferences.includes("보조기기 함부로 만지지 않기"))variants.push("일행은 보조기기를 몸의 일부이자 개인 물건으로 존중해 허락 없이 만지거나 옮기지 않았어요.");
  if(preferences.includes("쉬는 시간을 충분히 두기"))variants.push("정한 중간 휴식 시간을 지켜 몸을 가다듬은 뒤 다음 순서를 이어 갔어요.");
  return variants;
}
function directTraitLines(c){
  if(!c.traitNotesInScripts)return[];
  return String(c.traitNotes||"").split(/\r?\n+/).map(value=>value.trim()).filter(Boolean).slice(0,12).map(value=>{
    const clean=value.replace(/\$\{(?:name|actor|character|c\.name)\}/g,c.name||"캐릭터").replace(/\$\{(?:other|target)(?:\.name)?\}/g,"상대").replace(/\$\{[^}]+\}/g,"").replace(/[<>]/g,"").slice(0,140).trim();
    return /[.!?。요다음]$/.test(clean)?clean:`${clean}.`;
  }).filter(Boolean);
}
function respectfulAccessibilityFor(target,seed="",date=new Date()){
  const p=target?.bodyProfile||{},variants=[],wheelchair=p.wheelchair||{},arm=p.prostheticArm||{},leg=p.prostheticLeg||{},hearing=p.hearing||{},vision=p.vision||{};
  if(wheelchair.type&&wheelchair.type!=="사용하지 않음")variants.push(
    " 이동을 도울 필요가 있는지 먼저 물었고, 휠체어나 손잡이에는 허락 없이 손대지 않았어요.",
    " 계단 없는 동선과 출입구를 함께 확인한 뒤 어느 길과 자리를 쓸지는 상대가 직접 고르게 했어요.",
    " 서로의 눈높이가 편안하도록 자리를 맞췄지만 휠체어 이용을 대화의 특별한 소재로 만들지는 않았어요."
  );
  if(arm.side&&arm.side!=="사용하지 않음")variants.push(
    " 의수나 몸에 허락 없이 손대지 않고, 필요한 도구와 방식이 있는지 먼저 물었어요.",
    " 상대가 익숙한 방식으로 해낼 시간을 충분히 두고 먼저 대신 처리하려 들지 않았어요."
  );
  if(leg.side&&leg.side!=="사용하지 않음")variants.push(
    " 걷는 속도와 쉬는 시점을 임의로 정하지 않고 상대가 편한 동선을 물어 나란히 맞췄어요.",
    " 의족을 빤히 보거나 이유를 캐묻지 않고 지금 함께하는 일과 상대의 선택에 집중했어요."
  );
  if(hearing.side&&hearing.side!=="설정하지 않음"){
    const supports=Array.isArray(hearing.supports)?hearing.supports:[];
    variants.push(" 얼굴과 입모양이 잘 보이도록 자리를 잡고 말을 과장하거나 재촉하지 않은 채 대화를 이어 갔어요.");
    if(supports.includes("문자 대화")||supports.includes("문자·시각 정보 함께 제공"))variants.push(" 중요한 내용은 문자로도 함께 보여 주고 상대가 확인할 시간을 기다렸어요.");
    if(supports.includes("수어"))variants.push(" 상대가 고른 수어와 말의 방식을 존중하며 자연스럽게 대화를 이어 갔어요.");
  }
  if(vision.side&&vision.side!=="설정하지 않음"){
    variants.push(
      " 갑자기 팔을 잡아끌지 않고 안내가 필요한지 먼저 물은 뒤 원하는 방식대로 주변과 방향을 구체적으로 설명했어요.",
      " 물건의 위치를 임의로 바꾸지 않고 달라진 것이 있으면 방향과 거리를 구체적으로 알려 줬어요."
    );
    if((vision.supports||[]).includes("안내견"))variants.push(" 일하는 안내견에게 말을 걸거나 만지지 않고 상대와 직접 대화했어요.");
  }
  const preferences=Array.isArray(p.accessibilityPreferences)?p.accessibilityPreferences:[];
  if(preferences.includes("직접 선택하고 결정할 시간 주기"))variants.push(" 빨리 결정하라고 재촉하지 않고 상대가 정보를 확인하고 직접 선택할 시간을 충분히 기다렸어요.");
  if(preferences.includes("조용한 자리 선호"))variants.push(" 소리가 덜 겹치는 자리를 함께 찾고 대화를 이어 가기 편한 환경인지 확인했어요.");
  if(preferences.includes("말로 주변 정보 설명"))variants.push(" 눈앞에서 달라진 위치와 주변 상황을 짧고 구체적인 말로 함께 알려 줬어요.");
  if((p.healthConditions||[]).length)variants.push(" 몸 상태를 멋대로 판단하거나 치료법을 권하지 않고, 지금 필요한 속도와 휴식이 있는지만 물었어요.");
  if(!variants.length||hash(`${target?.id||""}:${dayKey(date)}:${seed}:accessibility-frequency`)%16!==0)return"";
  return variants[hash(`${target?.id||""}:${seed}:accessibility`)%variants.length];
}
function personalityFlavor(c,desc,seed="",date=new Date()){
  const variants=[];
  const priorityVariants=[];
  const socialScene=/함께|상대|사람|대화|인사|말을|질문|동거인|친구|연인|부부|에게/.test(desc);
  const reasoningScene=/자료|기록|분석|조사|검토|확인|비교|판단|선택|계획|일정|문제|조건|규칙|단서|근거|목록|수치/.test(desc);
  const types=Array.isArray(c.personalityTypes)?c.personalityTypes:[];
  const soloScene=!socialScene;
  types.forEach(type=>{
    const bank={
      "철두철미함":reasoningScene?["정한 순서와 기준을 하나씩 대조해 빠뜨린 부분 없이 마무리했어요.","사용한 물건의 위치와 상태를 확인한 뒤 정확히 제자리에 돌려놓았어요.","시작 전에 필요한 조건을 점검하고 끝낸 뒤 결과까지 다시 확인했어요.","예외가 생길 경우까지 미리 따져 두고 가장 안정적인 순서로 처리했어요.","결과가 기준에 맞는지 항목마다 짚어 본 뒤에야 손을 뗐어요."]:["손댄 곳의 순서가 흐트러지지 않게 한 가지씩 정확히 마무리했어요.","필요한 도구를 먼저 갖춘 뒤 중간에 다른 일로 새지 않고 끝까지 이어 갔어요.","정돈된 상태를 유지하며 시작과 마무리의 경계를 분명하게 지켰어요.","한 번 끝낸 부분도 흐트러진 곳이 없는지 눈으로 다시 훑었어요.","쓰임이 끝난 물건은 망설임 없이 원래 자리에 정리했어요."],
      "차분하고 신중함":["서두르지 않고 지금 할 일의 흐름을 살핀 뒤 자기 속도로 이어 갔어요.","작은 변화도 한 번 더 살피고 확신이 든 뒤 다음 행동으로 넘어갔어요.","급하게 결론 내리지 않고 충분히 보고 들은 뒤 움직였어요.","주변이 분주해도 호흡을 고르고 자기 페이스를 잃지 않았어요.","실수하기 쉬운 지점에서는 잠깐 멈춰 상태를 차근차근 살폈어요.","충분히 익숙해질 때까지 속도를 올리지 않고 안정적으로 이어 갔어요."],
      "냉정하고 논리적":reasoningScene?["필요한 정보와 불필요한 부분을 나누어 가장 효율적인 순서로 처리했어요.","감상보다 확인 가능한 사실을 우선해 판단하고 바로 실행했어요.","조건을 항목별로 나눈 뒤 모순되는 부분부터 정리했어요.","원인과 결과를 분리해 보고 가능성이 낮은 선택지는 일찍 제외했어요.","확인할 수 없는 추측은 보류하고 지금 가진 근거만으로 결론을 좁혔어요."]:["기분에 휩쓸리지 않고 지금 필요한 행동만 간결하게 골랐어요.","목적에 직접 도움이 되는 방법을 골라 군더더기 없이 움직였어요.","익숙함보다는 효율을 기준으로 가장 짧은 동선을 택했어요.","해야 할 일과 나중으로 미룰 일을 분명히 나누어 처리했어요.","감정적인 망설임 대신 결과가 분명한 선택을 먼저 실행했어요."],
      "다정하고 세심함":socialScene?["상대의 표정과 속도를 살피며 부담되지 않는 방식으로 맞춰 주었어요.","자기 방식보다 상대가 편안한지를 먼저 확인하며 행동했어요.","작은 반응도 놓치지 않고 필요해 보이는 부분만 조용히 챙겼어요.","상대가 말하지 않은 불편함까지 눈치채고 자연스럽게 선택지를 바꾸었어요.","도움을 과하게 드러내지 않고 상대가 스스로 해낸 것처럼 자리를 내주었어요."]:["자기 몸과 주변 상태를 세심하게 살피며 무리하지 않는 방식으로 이어 갔어요.","사소한 변화도 지나치지 않고 정성스럽게 손을 보았어요.","나중에 사용할 사람까지 생각해 보기 편한 상태로 남겨 두었어요.","작은 손상이 더 커지지 않도록 조심스러운 손길로 다루었어요.","서두르기보다 오래 편안하게 쓸 수 있는 쪽을 골랐어요."],
      "수줍고 내향적":socialScene?["먼저 길게 말하지는 않았지만 필요한 대답은 피하지 않고 조용히 전했어요.","사람들의 시선을 끌지 않는 자리에서 짧고 솔직하게 반응했어요.","말을 꺼내기 전 몇 번 고르다가 가장 안전한 표현으로 뜻을 전했어요.","큰 반응 대신 작게 고개를 끄덕이며 상대의 이야기를 오래 들었어요.","분위기에 익숙해질 때까지 가장자리에서 조용히 상황을 살폈어요."]:["방해받지 않는 자리를 골라 혼자 깊이 집중했어요.","혼자만의 속도로 조용히 몰입하며 바깥의 소음을 잊었어요.","눈에 띄지 않는 편안한 자리에서 자기 관심사에 오래 머물렀어요.","사람이 드나들지 않는 곳에서 생각을 차분히 가라앉혔어요.","말없이 이어지는 혼자만의 시간이 오히려 편안하게 느껴졌어요."],
      "활발하고 사교적":socialScene?["먼저 말을 꺼내고 상대도 자연스럽게 끼어들 수 있게 분위기를 열었어요.","반응이 느린 사람까지 살피며 대화의 흐름을 활기차게 이끌었어요.","자기가 느낀 재미를 바로 나누며 주변의 반응을 끌어냈어요.","어색해진 순간에는 새로운 화제를 꺼내 분위기를 빠르게 되살렸어요.","상대의 좋은 반응을 발견하자 그 부분을 중심으로 대화를 넓혔어요."]:["가만히 머무르기보다 직접 움직이며 빠르게 즐길 지점을 찾아냈어요.","기운이 남아 한 번 시작한 활동을 활발하게 이어 갔어요.","새로운 단계가 보일 때마다 망설임 없이 몸부터 움직였어요.","혼자 하는 중에도 리듬을 타듯 템포를 높여 지루할 틈을 만들지 않았어요.","작은 성과에도 힘을 얻어 다음 동작을 씩씩하게 이어 갔어요."],
      "즉흥적이고 자유로움":["처음 정한 순서에 얽매이지 않고 그 순간 가장 끌리는 방식으로 즐겼어요.","계획에 없던 변화도 망설이지 않고 자기 방식으로 받아들였어요.","완벽한 준비보다 지금 생긴 흥미를 따라 바로 시작했어요.","중간에 더 재미있는 방향을 발견하자 부담 없이 흐름을 바꾸었어요.","정답을 정해 두지 않고 손이 가는 선택을 이어 붙여 결과를 만들었어요.","끝을 미리 정하지 않은 채 순간의 감각에 맞춰 속도를 조절했어요."],
      "호기심 많고 창의적":["익숙한 방식에서 조금 벗어나 새로운 조합과 가능성을 직접 시험했어요.","당연하게 보이던 부분을 다르게 바꾸어 자기만의 방법을 찾아봤어요.","작은 차이에서 새로운 아이디어를 떠올리고 바로 적용해 보았어요.","왜 이런 결과가 나오는지 궁금해 조건을 하나씩 바꾸어 보았어요.","평범한 재료의 예상 밖 쓰임을 찾아 색다른 결과로 연결했어요.","완성보다 탐색 자체를 즐기며 여러 가능성을 가볍게 시험했어요."],
      "완고하고 통제적":socialScene?["자기가 옳다고 여긴 순서를 쉽게 양보하지 않고 상대에게도 분명히 요구했어요.","상대가 다른 방식을 고르자 이유를 따져 묻고 자기 기준을 고수했어요.","결정권을 넘기지 않은 채 세부 순서까지 직접 정하려 했어요.","예상과 다른 반응이 돌아오자 타협보다 자기 주장을 다시 강조했어요.","흐름이 자기 계획에서 벗어나지 않도록 상대의 행동까지 살폈어요."]:["한번 정한 방식에서 벗어나지 않고 끝까지 자기 기준대로 진행했어요.","예상과 다른 결과가 나오자 처음 세운 기준에 맞을 때까지 다시 손보았어요.","작은 변수도 그대로 두지 않고 통제 가능한 상태로 되돌렸어요.","자기가 세운 규칙을 예외 없이 적용하며 흐름을 붙들었어요.","완성된 뒤에도 자기 기준에 어긋난 곳을 찾아 다시 바로잡았어요."],
      "무심하고 독립적":socialScene?["필요한 말만 주고받고 상대의 선택에는 더 깊이 관여하지 않았어요.","상대가 곁에 있어도 각자의 몫은 각자 해결하는 편을 택했어요.","도움을 주고받기보다 서로 방해하지 않는 거리를 편하게 여겼어요.","상대의 반응을 재촉하지 않고 자기 할 일로 시선을 돌렸어요.","분위기를 맞추기 위한 말은 생략하고 필요한 내용만 정확히 전했어요."]:["남의 평가를 의식하지 않고 자기에게 편한 방식으로 시간을 보냈어요.","도움이나 반응을 기다리지 않고 혼자 필요한 일을 끝냈어요.","누가 알아주지 않아도 개의치 않고 자기 기준대로 마무리했어요.","외부의 소음과 유행에는 관심을 두지 않고 하던 일에 머물렀어요.","혼자 해결할 수 있는 일에 굳이 다른 사람을 끌어들이지 않았어요."],
      "감정적이고 충동적":["마음이 움직이자 오래 재지 않고 바로 행동으로 옮겼어요.","순간 올라온 감정이 표정과 동작에 곧바로 드러났어요.","흥미가 생긴 순간 속도를 늦추지 않고 깊이 빠져들었어요.","기대했던 것과 달라지자 실망이 숨겨지지 않고 손끝에 묻어났어요.","마음에 든 지점을 발견하자 다른 순서를 건너뛰고 거기에 먼저 몰두했어요.","감정이 가라앉기 전에 떠오른 선택을 곧바로 시험해 보았어요."],
      "장난기 많음":socialScene?["진지한 흐름을 해치지 않는 선에서 짧은 장난으로 반응을 끌어냈어요.","상대가 받아들일 수 있는 농담을 골라 분위기를 가볍게 바꾸었어요.","상대의 말끝을 재치 있게 받아치며 둘만 알아들을 웃음을 만들었어요.","평범한 대답 대신 뜻밖의 표현을 골라 상대의 표정을 살폈어요.","분위기가 굳어지기 전에 작은 장난을 던져 긴장을 풀었어요."]:["혼자서도 사소한 규칙을 만들어 놀이처럼 즐겼어요.","평범한 과정에 작은 장난을 섞어 자기 방식으로 재미를 만들었어요.","반복되는 순서에 엉뚱한 목표를 하나 끼워 넣어 스스로 즐겼어요.","별것 아닌 결과에도 재미있는 이름을 붙이며 혼자 흡족해했어요.","정해진 방법을 살짝 비틀어 예상하지 못한 재미를 찾아냈어요."]
    }[type]||[];
    priorityVariants.push(...bank);
  });
  types.forEach(type=>{
    const extraBank={
      "철두철미함":["끝낸 항목을 머릿속으로 다시 짚어 빠뜨린 단계가 없는지 확인했어요.","도구마다 사용할 순서와 놓을 자리를 정해 동선이 겹치지 않게 했어요.","예상보다 시간이 남아도 확인 절차를 생략하지 않고 같은 기준을 지켰어요.","작은 오차를 발견하자 임시로 덮지 않고 원인을 찾은 뒤 처음 기준에 맞게 바로잡았어요."],
      "차분하고 신중함":["대답이나 행동을 재촉받아도 필요한 만큼 생각한 뒤 자기 결정을 내렸어요.","익숙하지 않은 부분에서는 먼저 안전한 범위를 확인하고 조금씩 시도했어요.","결과가 바로 나오지 않아도 조급해하지 않고 변화가 생기는 과정을 지켜봤어요.","주변의 빠른 분위기에 휩쓸리지 않고 차례가 올 때까지 조용히 기다렸어요."],
      "냉정하고 논리적":["서로 다른 설명에서 공통으로 확인되는 사실만 추려 판단의 기준으로 삼았어요.","비용과 시간, 예상 결과를 나란히 놓고 가장 손실이 적은 방법을 골랐어요.","감정적인 표현에 반응하기 전에 지금 해결해야 할 문제를 한 문장으로 다시 정리했어요.","한 번 세운 가설도 새 정보와 맞지 않으면 미련 없이 버리고 판단을 수정했어요."],
      "다정하고 세심함":["상대가 거절하기 어렵지 않도록 도움과 혼자 할 선택을 함께 제시했어요.","누군가 놓고 간 작은 물건을 발견하고 찾기 쉬운 자리에 조용히 챙겨 두었어요.","말보다 표정이 먼저 굳은 것을 알아차리고 질문의 속도와 목소리를 낮췄어요.","자기가 애쓴 티를 내기보다 상대가 편해진 것을 확인하고 자연스럽게 물러났어요."],
      "수줍고 내향적":["하고 싶은 말은 미리 짧게 정리해 두었다가 둘만 남은 순간 조심스럽게 꺼냈어요.","여럿의 대화에서는 오래 듣다가 꼭 필요한 한마디만 분명하게 보탰어요.","낯선 반응이 돌아오자 성급히 덧붙이지 않고 상대의 뜻을 다시 살폈어요.","혼자 정리할 시간이 생기자 그제야 방금 느낀 감정과 생각을 차분히 돌아봤어요."],
      "활발하고 사교적":["처음 만난 사람끼리도 말을 섞을 수 있도록 공통으로 아는 화제를 빠르게 찾아냈어요.","자기 이야기만 이어 가지 않고 조용한 사람에게도 자연스럽게 질문을 건넸어요.","기운이 처진 분위기를 알아차리고 몸을 움직일 수 있는 가벼운 제안을 꺼냈어요.","여럿의 반응이 엇갈리자 한쪽을 몰아붙이지 않고 다음 화제로 흐름을 매끄럽게 넘겼어요."],
      "즉흥적이고 자유로움":["예정에 없던 빈 시간이 생기자 바로 주변에서 재미있어 보이는 일을 골랐어요.","준비가 완벽하지 않아도 지금 할 수 있는 만큼부터 시작해 흐름을 만들었어요.","계획과 다른 길이 더 마음에 들자 이유를 길게 붙이지 않고 방향을 바꿨어요.","결과를 통제하려 하기보다 우연히 생긴 모양과 변화를 그대로 살려 이어 갔어요."],
      "호기심 많고 창의적":["익숙한 답을 그대로 쓰기보다 왜 그런 방식이 굳어졌는지부터 궁금해했어요.","서로 상관없어 보이는 두 아이디어를 연결해 새로운 사용법을 떠올렸어요.","실패한 결과에서도 달라진 조건을 찾아 다음 시도에 쓸 단서로 남겼어요.","완성된 물건을 보고도 다른 재료와 크기로 바꾸면 어떻게 될지 상상했어요."],
      "완고하고 통제적":["자기 기준이 흔들릴 조짐이 보이자 선택지를 줄이고 결정권을 다시 쥐려 했어요.","상대가 충분히 설명해도 기존 방식이 더 안전하다며 쉽게 뜻을 바꾸지 않았어요.","예외를 한 번 허용하면 질서가 무너진다고 생각해 같은 규칙을 끝까지 요구했어요.","예정 밖의 변화가 생기자 다른 사람보다 먼저 세부 순서를 다시 정해 알려 주었어요."],
      "무심하고 독립적":["필요한 도움은 직접 요청하되 위로나 관심까지 기대하지 않고 자기 몫을 이어 갔어요.","누군가의 시선이 머물러도 행동을 설명하거나 변명하지 않고 하던 일에 집중했어요.","각자 선택한 결과는 각자가 감당하는 편이 공평하다고 생각해 대신 결정하지 않았어요.","연락이나 반응이 늦어도 의미를 과하게 붙이지 않고 자기 일정부터 마쳤어요."],
      "감정적이고 충동적":["기대가 커진 만큼 작은 변화에도 표정이 빠르게 밝아지거나 굳었어요.","마음에 걸리는 말을 듣자 생각을 정리하기 전에 먼저 반응이 튀어나왔어요.","흥분이 가라앉은 뒤에는 방금 선택이 지금의 진심과 같은지 다시 돌아봤어요.","강하게 끌리는 쪽으로 움직이다가도 불편함이 커지면 곧바로 거리를 바꿨어요."],
      "장난기 많음":["상대가 진지하게 받아들이는 기색을 보이자 장난을 멈추고 뜻을 분명히 설명했어요.","익숙한 물건과 상황에 우스운 별명을 붙여 혼자만의 놀이 규칙을 만들었어요.","뻔한 질문에도 곧장 답하지 않고 엉뚱하지만 알아들을 만한 표현으로 받아쳤어요.","상대가 먼저 장난을 돌려주자 한 단계 더 재치 있게 이어 가되 불편한 선은 넘지 않았어요."]
    }[type]||[];
    priorityVariants.push(...extraBank);
  });
  const age=c.ageGroup||"성인";
  if(age==="영아")variants.push("아직 말 대신 울음과 표정, 손짓으로 필요한 것을 알리고 있어요.","익숙한 목소리가 들리면 눈을 크게 뜨고 팔다리를 작게 움직여 반응하고 있어요.","금세 피곤해져 하던 행동을 멈추고 편안한 품과 자리를 찾고 있어요.");
  if(age==="유아")variants.push("궁금한 것을 발견할 때마다 짧은 질문을 이어 가며 직접 만져 보려고 해요.","혼자 해 보겠다고 고집하다 어려운 부분에서 익숙한 어른을 찾고 있어요.","금방 다른 것에 관심이 옮겨 가 작은 발로 집 안을 바쁘게 오가고 있어요.");
  if(age==="어린이")variants.push("자기만의 규칙과 이야기를 붙여 평범한 일도 놀이처럼 만들고 있어요.","잘 해낸 부분을 누군가 알아봐 주길 바라며 결과를 들고 주변을 살피고 있어요.","어른이 정한 방법보다 자기가 떠올린 재미있는 방식을 먼저 시험하고 있어요.");
  if(age==="청소년")variants.push("혼자 결정하고 싶은 마음과 누군가 알아주길 바라는 마음 사이에서 말을 고르고 있어요.","취향이 분명해 마음에 들지 않는 방식에는 짧고 솔직한 반응을 보이고 있어요.","또래와 나눈 이야기와 자기만의 관심사를 중요하게 여기며 시간을 쓰고 있어요.");
  if(age==="청년")variants.push("앞으로의 생활과 지금 하고 싶은 일 사이에서 현실적인 선택을 고민하고 있어요.","새로운 경험을 가볍게 시도하면서도 자기 취향에 맞는지 빠르게 판단하고 있어요.");
  if(age==="중년")variants.push("쌓인 경험으로 필요한 순서를 빠르게 짚으면서도 체력을 아껴 움직이고 있어요.","자기 일뿐 아니라 주변 사람이 놓친 부분까지 자연스럽게 함께 살피고 있어요.");
  if(age==="장년")variants.push("익숙한 방식의 안정감을 지키면서 필요한 변화만 신중하게 받아들이고 있어요.","서두르기보다 몸의 상태와 하루의 균형을 살피며 자기 속도로 움직이고 있어요.");
  if(age==="노년")variants.push("오랜 습관이 밴 손길로 익숙한 일을 천천히 정확하게 이어 가고 있어요.","중간중간 몸을 쉬게 하면서도 잊지 않은 경험을 살려 필요한 일을 마무리하고 있어요.","사소한 물건과 장면에서 오래전 기억을 떠올리며 잠시 미소 짓고 있어요.");
  if(c.neatness==="흐트러짐을 못 참음")variants.push("눈에 걸리는 물건을 그냥 지나치지 못하고 반듯하게 다시 놓았어요.");
  if(c.neatness==="결벽에 가까움")variants.push("손이 닿은 자리와 물건의 상태를 다시 확인하고 작은 얼룩도 남지 않도록 닦아 냈어요.","정리한 곳을 한 번 더 돌아보며 먼지와 오염이 남지 않았는지 꼼꼼히 검사했어요.");
  if(c.neatness==="어질러도 편함")variants.push("손이 닿기 편한 곳에 물건을 둔 채 자기 방식대로 편하게 움직이고 있어요.");
  if(c.interference==="강하게 간섭함")variants.push("함께 있는 사람이 제대로 하고 있는지 확인하고 자기 생각을 분명하게 말했어요.");
  if(c.interference==="컨트롤프릭")variants.push("상대의 순서와 시간까지 자기 계획에 맞추려 들며 빠진 부분을 하나하나 지적했어요.","일을 맡겨 두고도 마음이 놓이지 않아 진행 방식과 결과를 계속 확인하고 있어요.");
  if(c.interference==="방관자")variants.push("주변에서 무슨 일이 벌어지는지 알면서도 직접 부탁받기 전에는 끼어들지 않았어요.","상대가 스스로 해결할 일이라 여기고 별다른 참견 없이 자기 하던 일을 이어갔어요.");
  if(c.energyRhythm==="가만히 못 있음")variants.push("한 가지를 끝내자마자 다음에 할 일을 찾아 바로 몸을 움직였어요.");
  if(c.activityTempo==="생각나면 바로 움직임")variants.push("해야 할 일이 떠오르자 머뭇거리지 않고 곧바로 손을 뻗었어요.");
  if(c.activityTempo==="부산스럽게 여러 일을 오감")variants.push("하던 일을 붙잡고 있으면서도 눈에 들어온 다른 일까지 손대느라 집 안을 몇 번이나 오가고 있어요.");
  if(c.activityTempo==="허둥대며 주의가 자주 옮겨감")variants.push("무언가를 가지러 움직였다가 옆에 놓인 다른 것이 눈에 들어와 그것부터 만지고, 다시 원래 할 일을 떠올렸어요.");
  if(c.activityTempo==="한 가지씩 차분히")variants.push("지금 하던 일을 끝까지 마무리한 뒤 다음 일로 넘어가고 있어요.");
  if(c.energyRhythm==="집에서 충전")variants.push("사람이 적은 편안한 자리를 골라 조용히 기운을 되찾고 있어요.");
  if(c.socialStyle==="무리의 중심")variants.push("자연스럽게 먼저 말을 꺼내 주변의 흐름을 이끌고 있어요.");
  if(c.socialStyle==="혼자가 편함")variants.push("혼자 집중할 수 있는 자리를 골라 방해받지 않는 시간을 보내고 있어요.");
  if(c.planningStyle==="계획적")variants.push("미리 정해 둔 순서와 시간을 확인하며 차근차근 진행하고 있어요.");
  if(c.planningStyle==="즉흥적")variants.push("그 순간 가장 마음이 가는 일을 골라 가볍게 시작했어요.");
  if(c.planningStyle==="강박적으로 계획함")variants.push("예정 시각과 실제 진행 시간을 몇 번이나 비교하고 어긋난 부분을 즉시 다시 배치했어요.","예상 밖의 변수가 생기자 계획표를 처음부터 검토해 빈틈이 없도록 순서를 다시 짰어요.","끝낸 항목에 표시한 뒤 다음 단계의 시작 시각까지 확인해야 비로소 움직였어요.");
  if(c.planningStyle==="무계획")variants.push("앞일을 미리 정하지 않고 지금 눈앞에서 가장 손쉬운 것부터 건드리고 있어요.","무엇을 할지 정하지 않은 채 돌아다니다가 흥미가 생긴 일에 자연스럽게 빠져들었어요.","정해 둔 종료 시각 없이 기분과 상황이 바뀌는 대로 다음 행동을 골랐어요.");
  if(c.decisionStyle==="공감 우선")variants.push("장면의 감정선과 마음에 걸리는 부분을 지나치지 않고 세심하게 살펴보고 있어요.");
  if(c.decisionStyle==="논리 우선")variants.push("가장 합리적인 방법이 무엇인지 따져 보고 군더더기 없이 움직였어요.");
  if((c.socialEnergy??3)<=1)variants.push("사람이 드문 조용한 자리를 골라 자기 속도대로 움직이고 있어요.");
  if((c.socialEnergy??3)>=5)variants.push("마주친 사람에게 먼저 반갑게 인사를 건네며 분위기를 자연스럽게 이끌고 있어요.");
  if(socialScene&&c.socialStyle==="혼자가 편함")variants.push("필요한 말은 짧게 나누고 서로의 시간을 방해하지 않는 거리를 지켰어요.","함께 있는 동안에도 각자의 일에 집중할 수 있는 조용한 분위기를 편안해했어요.");
  if(socialScene&&c.socialStyle==="낯을 가림")variants.push("먼저 말을 꺼내지는 못하고 상대가 건넨 질문에 조금씩 긴 대답을 보탰어요.","익숙하지 않은 사람 앞에서는 표정을 살피며 안전한 이야기부터 조심스럽게 골랐어요.");
  if(socialScene&&(c.socialStyle==="먼저 다가감"||c.socialStyle==="무리의 중심"))variants.push("어색한 침묵이 생기기 전에 먼저 화제를 꺼내 모두가 끼어들 자리를 만들었어요.","사람마다 반응을 살피며 대화가 한쪽으로 치우치지 않게 자연스럽게 연결했어요.");
  if((c.sensingIntuition??3)<=1)variants.push("눈앞에 보이는 것부터 하나씩 확인하며 실수 없이 마무리하고 있어요.");
  if(c.perceptionStyle==="현실과 경험 중시"||c.perceptionStyle==="구체적인 편")variants.push("전에 직접 해 봤을 때 잘됐던 방법을 떠올려 같은 순서로 손을 움직였어요.","막연한 추측보다 지금 확인할 수 있는 상태와 수치를 먼저 살폈어요.");
  if(c.perceptionStyle==="가능성 중시"||c.perceptionStyle==="직관과 상상 중시")variants.push("하던 일에서 예상하지 못한 연결을 떠올리고 다른 방식도 시험해 보고 싶어졌어요.","눈앞의 결과보다 앞으로 어떻게 달라질 수 있을지 상상하며 선택지를 넓혔어요.");
  if((c.thinkingFeeling??3)<=1)variants.push("가장 효율적인 순서를 머릿속으로 계산해 불필요한 동작을 줄이고 있어요.");
  if((c.thinkingFeeling??3)>=5)variants.push("지금 느끼는 감정을 무시하지 않고 스스로 편안한 속도를 찾고 있어요.");
  if(reasoningScene&&(c.decisionStyle==="논리 우선"||c.decisionStyle==="이성적인 편"))variants.push("출처의 권위보다 실제 내용과 확인 가능한 근거가 서로 맞는지 대조했어요.","해결에 필요한 조건을 항목별로 나누고 빠진 전제가 없는지 확인했어요.");
  if(socialScene&&(c.decisionStyle==="마음을 살핌"||c.decisionStyle==="공감 우선"))variants.push("정답을 서둘러 말하기보다 상대가 왜 그렇게 느꼈는지 먼저 물었어요.","결과가 조금 비효율적이어도 누구도 소외되지 않는 쪽으로 말을 골랐어요.");
  if((c.perceivingJudging??3)<=1)variants.push("정해 둔 순서 없이 지금 마음이 가는 것부터 가볍게 시작했어요.");
  if((c.perceivingJudging??3)>=5)variants.push("미리 생각해 둔 순서를 따라 하나씩 확인하며 진행하고 있어요.");
  if(c.planningStyle==="유연한 편"||c.planningStyle==="상황에 따라")variants.push("큰 순서만 정해 두고 세부 방법은 그때그때 상황에 맞춰 바꿨어요.","계획을 고집하지 않으면서도 꼭 끝내야 할 핵심은 놓치지 않았어요.");
  const traitExpressions=Array.isArray(c.traitExpressions)?c.traitExpressions:[];
  if(traitExpressions.includes("주의가 쉽게 전환됨"))variants.push("하던 일과 새로 눈에 들어온 것 사이에서 주의가 옮겨 갔지만, 원래 하던 일을 다시 확인했어요.");
  if(traitExpressions.includes("관심 대상에 과집중함"))variants.push("관심이 붙은 부분에 깊이 몰입해 주변 시간이 흐르는 것도 잠시 잊었어요.");
  if(traitExpressions.includes("생각이 떠오르면 바로 시작함"))variants.push("떠오른 생각을 놓치기 전에 작은 단계부터 곧바로 시작했어요.");
  if(traitExpressions.includes("감각 자극에 민감함"))variants.push("빛과 소리, 촉감이 지나치지 않은 자리를 골라 자기에게 편안한 환경을 만들었어요.");
  if(traitExpressions.includes("익숙한 순서가 바뀌면 힘듦"))variants.push("예상과 달라진 순서를 바로 밀어붙이지 않고 익숙해질 시간을 먼저 가졌어요.");
  if(traitExpressions.includes("사회적 신호를 해석하는 데 시간이 필요함"))variants.push("상대의 뜻을 단정하지 않고 말의 의미를 한 번 더 확인한 뒤 반응했어요.");
  if(traitExpressions.includes("기억이 비는 때가 있음"))variants.push("기억이 이어지지 않는 부분은 짐작으로 채우지 않고 주변 기록과 현재 상황부터 확인했어요.");
  if(traitExpressions.includes("자아마다 말투·선호가 다름"))variants.push("지금 앞에 나선 자아의 말투와 선호에 맞춰 평소와는 조금 다른 방식으로 행동했어요.");
  if(traitExpressions.includes("타인의 감정을 직관보다 관찰과 추론으로 파악함"))variants.push("상대의 감정을 저절로 안다고 여기지 않고 표정과 말, 앞뒤 상황을 관찰해 뜻을 추론했어요.");
  if(traitExpressions.includes("죄책감이나 공감이 낮게 표현됨"))variants.push("기대되는 감정 반응을 억지로 흉내 내기보다 상황의 규칙과 상대가 분명히 말한 요구를 기준으로 행동했어요.");
  if(traitExpressions.includes("감정이 급격히 치솟는 때가 있음"))variants.push("감정이 빠르게 치솟는 것을 알아차리자 행동으로 옮기기 전에 호흡과 거리를 먼저 확보했어요.");
  if(traitExpressions.includes("격해지면 먼저 거리를 두고 진정함"))variants.push("말이 거칠어지기 전에 잠시 자리를 벗어나 진정한 뒤 다시 이야기할 시점을 정했어요.");
  variants.push(...selectedBodyVariants(c,socialScene,seed,date));
  priorityVariants.push(...directTraitLines(c));
  const sentences=String(desc||"").match(/[^.!?。]+[.!?。]?/g)||[String(desc||"")];
  const base=sentences.slice(0,types.length?1:2).join(" ").trim();
  // 전체 유형을 기본 성향으로 더 강하게 반영하되, 아래에서 고른 사회성·판단·
  // 계획·행동 전환 방식과 명시적인 특성 표현도 후보에서 제외하지 않습니다.
  const pool=priorityVariants.length?[...priorityVariants,...priorityVariants,...variants]:variants;
  if(!pool.length)return base;
  const flavor=pool[hash(`${c.id}:${seed}:${desc}:flavor`)%pool.length];
  const combined=types.length?`${base} ${flavor}`:hash(`${c.id}:${seed}:${desc}:plain`)%3===0?base:`${base} ${flavor}`;
  return combined.length>170?`${combined.slice(0,167).replace(/\s+\S*$/,"")}…`:combined;
}

function openlyPlayful(c){
  if(["장난을 거의 하지 않음","건조한 농담만 함"].includes(c.humorStyle))return false;
  if(["표정 변화가 거의 없음","감정을 잘 드러내지 않음"].includes(c.emotionalExpression)&&!["유머로 분위기를 이끎","장난을 즐김"].includes(c.humorStyle))return false;
  return /가끔 장난|장난을 즐김|유머로 분위기를 이끎/.test(c.humorStyle||"");
}
function safePlayfulPair(first,second,relation=null){
  const firstView=characterViewFor(first.id,second.id)||{},secondView=characterViewFor(second.id,first.id)||{};
  const viewText=[firstView.overall,firstView.closeness,firstView.comfort,firstView.annoyance,firstView.conflictIntensity,secondView.overall,secondView.closeness,secondView.comfort,secondView.annoyance,secondView.conflictIntensity].filter(Boolean).join(" ");
  const hostile=/싫|미워|혐오|경계|불편|부담|보기만 해도 피곤|남보다도 멂|낯선|숨 막힘|전혀 통하지|긴장/.test(viewText);
  const closeByView=[firstView.closeness,secondView.closeness].every(value=>/가장 가까운|아주 가까움|가까운 사이|친한 사이|가족처럼 가까움|마음의 중심/.test(value||""));
  const closeByRelation=Boolean(relation&&relation.temporalStatus!=="past"&&["친구","소꿉친구","형제·자매","연인","부부"].includes(relation.type));
  const rapport=[firstView.comfort,secondView.comfort].every(value=>/농담과 장난|대화는 편안함|공간도 대화도 완벽|아주 편안|가장 편안/.test(value||""));
  return !hostile&&(closeByView||closeByRelation)&&rapport&&(openlyPlayful(first)||openlyPlayful(second));
}
function characterVoice(c,text){
  let value=String(text||"");
  if(openlyPlayful(c))return value;
  value=value
    .replace(/먼저 웃음을 터뜨리며/g,"표정만 조금 누그러뜨리며")
    .replace(/짧게 웃으며/g,"짧게 고개를 기울이며")
    .replace(/작게 웃었어요/g,"잠시 시선을 머물렀어요")
    .replace(/따라 웃다가/g,"반응을 보이다가")
    .replace(/한참 웃은 뒤/g,"한동안 이야기를 나눈 뒤")
    .replace(/둘 다 웃음을 터뜨리고/g,"둘 다 더는 반박하지 못하고")
    .replace(/웃음을 참는 표정을 보며/g,"미묘하게 달라진 표정을 보며")
    .replace(/웃음이 끊이지 않았지만/g,"대화가 끊이지 않았지만")
    .replace(/웃고 떠들었어요/g,"말을 주고받았어요")
    .replace(/웃고 있어요/g,"조용히 반응하고 있어요")
    .replace(/웃었어요/g,"짧게 반응했어요")
    .replace(/웃어 보였어요/g,"시선으로 답했어요")
    .replace(/웃어 보이자/g,"반응을 보이자")
    .replace(/웃는 모습을/g,"편하게 대화하는 모습을")
    .replace(/웃자/g,"반응하자");
  return value;
}

const AGGRESSION_URGE_LEVEL={
  "공격 충동 없음":0,
  "거친 말을 하고 싶은 충동":1,
  "몸으로 밀어내고 싶은 충동":3,
  "해치고 싶은 충동":4,
  "죽이고 싶을 만큼 격한 충동":5
};
const AGGRESSION_ACTION_LEVEL={
  "행동으로 옮기지 않음":0,
  "대부분 참지만 가끔 거친 말이 나옴":1,
  "거친 말로만 표출함":1,
  "물건이나 벽에 화풀이할 수 있음":2,
  "상대를 밀칠 수 있음":3,
  "상대를 때릴 수 있음":3,
  "실제로 때릴 수 있음":4,
  "심한 폭력을 행사할 수 있음":5
};
const CONFLICT_LEVEL={
  "갈등이 거의 없음":0,
  "가끔 부딪힘":1,
  "자주 충돌함":2,
  "격렬하게 충돌함":3,
  "파국적인 충돌을 반복함":4
};
function aggressionExpressionLevel(character,view={}){
  const urge=AGGRESSION_URGE_LEVEL[view.aggression]??0;
  const action=AGGRESSION_ACTION_LEVEL[view.aggressionAction]??0;
  let level=Math.min(urge,action);
  const conflict=CONFLICT_LEVEL[view.conflictIntensity]??0;
  if(conflict<2)level=Math.min(level,1);
  if(conflict<3)level=Math.min(level,3);
  if(character.impulseControl==="매우 잘 참음")level=0;
  else if(["대체로 참음","가끔 욱하지만 멈춤"].includes(character.impulseControl))level=Math.min(level,1);
  if(["피하는 편","시간을 두고 말함","대화로 해결"].includes(character.conflictStyle))level=Math.min(level,1);
  return level;
}
function hasVerbalConflict(view={}){
  return (CONFLICT_LEVEL[view.conflictIntensity]??0)>=1||
    (AGGRESSION_URGE_LEVEL[view.aggression]??0)>=1;
}

function catalogChoice(c,place,kind,seed){
  const stock=(place?.stock||[]).map(itemById).filter(Boolean);
  const pool=(stock.length?stock:(state.catalog?.[kind]||[])).filter(Boolean);
  if(!pool.length)return null;
  return [...pool].sort((a,b)=>score(b)-score(a))[hash(seed)%Math.min(3,pool.length)];
  function score(x){
    let s=hash(`${seed}:${x.id}`)%12;
    if((c.favorites?.[kind]||[]).includes(x.id))s+=25;
    if(kind==="foods"){
      if((c.foodPreferences||c.foodTypes||[]).includes(x.category))s+=15;
      s-=Math.max(0,(x.spicy||0)-(c.spiceTolerance??2))*9;
      s-=Math.abs((x.sweet||0)-(c.sweetPreference??2))*2;
    }
    return s;
  }
}

function compactLogDescription(value,maxLength=168){
  const clean=String(value||"").replace(/\s+/g," ").trim();
  if(!clean)return"";
  const sentences=clean.match(/[^.!?。]+[.!?。]?/g)||[clean];
  let result=sentences.slice(0,2).join(" ").trim();
  if(result.length<=maxLength)return result;
  const shortened=result.slice(0,maxLength-1).replace(/\s+\S*$/,"").trim();
  return `${shortened||result.slice(0,maxLength-1).trim()}…`;
}
function entry(time,title,desc,extra={}){return {time:clock(time),minute:time,title:resolveEntityParticles(title),desc:resolveEntityParticles(compactLogDescription(desc)),...extra}}
function adaptAccessibilityWording(c,item){
  if(!item)return item;
  let title=String(item.title||""),desc=String(item.desc||"");
  const p=c.bodyProfile||{},wheelchair=p.wheelchair||{},vision=p.vision||{},hearing=p.hearing||{};
  if(wheelchair.type&&wheelchair.type!=="사용하지 않음"){
    const replaceMovement=value=>value
      .replace(/아침 조깅/g,"아침 바깥 운동")
      .replace(/가볍게 달린 뒤/g,"자기 속도로 이동한 뒤")
      .replace(/한 바퀴 걷고/g,"한 바퀴 이동하고")
      .replace(/산책로를 걸으며/g,"산책로를 이동하며")
      .replace(/길을 걷다가/g,"길을 이동하다가")
      .replace(/걸어서 이동/g,"자기 방식으로 이동");
    title=replaceMovement(title);desc=replaceMovement(desc);
  }
  if(vision.side==="양쪽"&&vision.level==="맹·시각장애"){
    title=title.replace(/창밖을 구경하는 중/g,"창밖의 소리와 공기를 느끼는 중").replace(/풍경을 바라보는 중/g,"주변의 소리와 공기를 느끼는 중");
    desc=desc
      .replace(/창가에 기대어 오가는 사람과 달라진 날씨를 한동안 느긋하게 바라보고 있어요\./g,"창가에서 바깥의 소리와 공기, 달라진 날씨를 한동안 느긋하게 느끼고 있어요.")
      .replace(/눈에 띄는 물건/g,"손에 닿거나 위치가 달라진 물건")
      .replace(/글과 자료를 천천히 살펴보고/g,"글과 자료를 화면 읽기나 익숙한 방식으로 확인하고");
  }
  if(hearing.side==="양쪽"&&hearing.level==="농·청각장애"){
    title=title.replace(/음악 듣는 중/g,"음악을 즐기는 중");
    desc=desc
      .replace(/이어폰으로 좋아하는 음악을 듣고/g,"자기에게 편한 방식으로 좋아하는 음악을 즐기고")
      .replace(/알람을 듣고/g,"빛이나 진동 알람을 확인하고");
  }
  return {...item,title,desc};
}
function homeEntry(c,time,title="거실에서 쉬는 중",desc="거실 소파에 앉아 조용히 쉬고 있어요.",room="living",extra={}){
  const resolvedRoom=room==="bedroom"?(c.sleepRoomId||"bedroom"):room;
  return adaptAccessibilityWording(c,entry(time,title,desc,{home:true,room:resolvedRoom,...extra}));
}
function mobilityAidMorningEntry(c,time,date=new Date()){
  const body=c.bodyProfile||{},wheelchair=body.wheelchair||{},arm=body.prostheticArm||{},leg=body.prostheticLeg||{};
  const usesWheelchair=wheelchair.type&&wheelchair.type!=="사용하지 않음";
  const usesArm=arm.side&&arm.side!=="사용하지 않음";
  const usesLeg=leg.side&&leg.side!=="사용하지 않음";
  if(!usesWheelchair&&!usesArm&&!usesLeg)return null;
  const labels=[],details=[];
  if(usesWheelchair){
    labels.push(wheelchair.type);
    details.push(wheelchair.type==="전동 휠체어"
      ?"배터리 잔량과 조작부, 타이어와 브레이크 상태를 확인하고 오늘 이동에 편한 설정으로 맞췄어요."
      :"타이어 공기압과 브레이크, 쿠션과 발판 위치를 확인하고 몸에 편안한 상태로 맞췄어요.");
  }
  if(usesArm){
    const label=`${arm.side==="양쪽"?"양쪽":arm.side} ${arm.custom||arm.type||"의수"}`.trim();
    labels.push(label);
    details.push(`${label}의 소켓과 연결부, 피부에 닿는 부분을 살피고 오늘 할 일에 맞는 동작을 확인했어요.`);
  }
  if(usesLeg){
    const label=`${leg.side==="양쪽"?"양쪽":leg.side} ${leg.custom||leg.type||"의족"}`.trim();
    labels.push(label);
    details.push(`${label}의 소켓과 정렬, 착용감을 살피고 오늘 몸 상태에 맞게 조절했어요.`);
  }
  const title=labels.length===1?`${object(labels[0])} 아침에 점검하는 중`:"아침 보조기기 상태를 점검하는 중";
  const description=details.length<=2?details.join(" "):`${details[0]} ${details.slice(1).join(" ")}`;
  return homeEntry(c,time,title,description,"bedroom",{careRoutine:"mobility-aid",careDevices:labels});
}
function withResidenceLocation(c,item,date=new Date()){
  if(!item?.home)return item;
  const homeId=item.visitHomeId||homeIdForDate(c,date),home=state.homes?.[homeId];
  if(!home)return {...item,visitHomeId:""};
  const residence=(c.residences||[]).find(value=>value.homeId===homeId);
  const rooms=home.rooms||{};
  let room=item.room;
  const requestsSleepingRoom=room==="bedroom"||room===c.sleepRoomId||/침실|잠드는|잠에서|잠자리에/.test(`${item.title||""} ${item.desc||""}`);
  if(requestsSleepingRoom)room=residence?.sleepRoomId||c.sleepRoomId||"bedroom";
  if(!rooms[room]){
    room=Object.keys(rooms).find(key=>rooms[key]?.type===item.room)
      ||(item.room==="bedroom"&&residence?.sleepRoomId)
      ||Object.keys(rooms)[0]
      ||"";
  }
  const resolved={...item,visitHomeId:homeId,room};
  const interior=rooms[room]?.interiorStyle||"설정하지 않음",beauty=home.beautyLevel||"평범함";
  if(interior!=="설정하지 않음"&&hash(`${c.id}:${homeId}:${room}:${item.minute}:interior-mood`)%5===0){
    const crowded=interior==="맥시멀"&&["흐트러짐을 못 참음","결벽에 가까움"].includes(c.neatness);
    const sparse=interior==="미니멀"&&["표현이 풍부함","감정이 바로 드러남"].includes(c.emotionalExpression);
    const positive=["보기 좋음","아름다움","눈에 띄게 아름다움"].includes(beauty)&&!crowded&&!sparse;
    const extra=crowded
      ?` 물건이 풍성한 ${interior} 인테리어가 오늘은 조금 답답하게 느껴져 시야에 걸리는 것부터 정리했어요.`
      :sparse
        ?` 단정한 ${interior} 공간이 오늘은 조금 비어 보인다고 느껴 좋아하는 물건 하나를 눈에 띄는 곳에 두었어요.`
        :positive
          ?` ${interior} 분위기로 꾸민 아름다운 공간이 눈에 들어오자 기분이 조금 가벼워졌어요.`
          :` ${interior} 인테리어의 익숙한 분위기를 느끼며 자기 자리를 편안하게 정돈했어요.`;
    resolved.desc=compactLogDescription(`${resolved.desc} ${extra}`);
    resolved.mood=crowded||sparse?"공간이 조금 불편함":positive?"공간이 마음에 듦":resolved.mood;
  }
  return resolved;
}
const away=(c,extra={},date=new Date())=>({townId:activityTown(c,date)?.id||c.townId||state.towns[0]?.id,...extra});

const HAIR_STYLE_ROUTINES={
  "자연스럽게 풀어 둠":["빗으로 엉킨 부분만 천천히 풀고 머리가 자연스럽게 떨어지는 방향을 살렸어요.","정수리와 옆머리의 눌린 부분만 손으로 가볍게 정리하고 그대로 풀어 두었어요.","끝부분의 건조한 곳에 손질제를 조금 바른 뒤 과하게 모양내지 않고 결을 정돈했어요."],
  "앞머리 있음":["앞머리의 갈라진 부분을 물로 가볍게 적시고 눈을 가리지 않는 길이로 가지런히 말렸어요.","앞머리가 한쪽으로 쏠리지 않도록 뿌리 방향을 바꾸어 말린 뒤 손끝으로 모양을 잡았어요.","이마에 닿는 앞머리의 유분을 정리하고 평소 가르마와 길이에 맞게 빗었어요."],
  "앞머리 없음":["이마가 드러나는 가르마를 다시 잡고 잔머리가 흩어지지 않게 가볍게 눌러 정돈했어요.","앞쪽 머리를 옆으로 넘겨 얼굴선을 따라 자연스럽게 이어지도록 말렸어요.","가르마가 무너지지 않도록 뿌리 쪽 볼륨만 살리고 앞머리를 깔끔하게 넘겼어요."],
  "올백":["앞머리부터 뒤로 빗어 넘기고 옆머리가 들뜨지 않도록 소량의 제품으로 고정했어요.","머리선을 따라 잔머리를 정리한 뒤 정면과 옆모습에서 올백의 흐름이 고른지 확인했어요.","뿌리부터 뒤쪽으로 결을 맞춰 빗고 움직여도 쉽게 흐트러지지 않을 정도로만 고정했어요."],
  "보브컷":["턱선을 따라 떨어지는 길이를 둥근 브러시로 정리하고 양쪽 끝이 비슷하게 말렸는지 살폈어요.","보브컷의 무게감이 한쪽으로 쏠리지 않게 가르마를 맞추고 끝부분을 안쪽으로 정돈했어요.","목덜미 쪽 눌린 부분을 털어 말린 뒤 또렷한 커트선이 살아나도록 빗었어요."],
  "레이어드컷":["층마다 다른 길이가 겹쳐 보이지 않도록 아래에서 위로 나누어 말리고 끝의 방향을 다듬었어요.","레이어드컷의 가벼운 층이 자연스럽게 움직이도록 손가락으로 결을 나누어 정돈했어요.","얼굴 주변의 짧은 층과 긴 머리가 부드럽게 이어지도록 브러시 각도를 바꾸어 손질했어요."],
  "울프컷":["정수리의 짧은 층은 가볍게 살리고 목덜미의 긴 부분은 결을 따라 정리해 울프컷의 대비를 살렸어요.","층이 많은 부분을 손으로 털어 말린 뒤 끝이 한 덩어리로 뭉치지 않게 나누었어요.","앞쪽의 거친 질감과 뒤쪽 길이가 자연스럽게 이어지도록 소량의 왁스로 끝을 잡았어요."],
  "투블럭":["짧게 정리된 옆머리가 뜨지 않게 눌러 말리고 윗머리는 원하는 방향으로 가르마를 잡았어요.","투블럭 경계가 지저분해 보이지 않도록 옆선과 뒷선을 살핀 뒤 윗머리의 볼륨을 정돈했어요.","윗머리를 손가락으로 나누어 말리고 짧은 옆머리와 자연스럽게 연결되도록 모양을 잡았어요."],
  "언더컷":["짧게 민 부분의 선을 확인하고 긴 윗머리를 어느 쪽으로 넘길지 정해 언더컷의 대비를 살렸어요.","언더컷이 드러나는 쪽의 잔머리를 정리하고 반대쪽 긴 머리는 흐름대로 단정히 빗었어요.","목덜미와 옆선이 깔끔한지 거울로 확인한 뒤 윗머리를 가볍게 고정했어요."],
  "포니테일":["머리를 한데 모아 당기는 힘이 지나치지 않게 높이를 정하고 잔머리를 부드럽게 정리했어요.","고무줄이 느슨하지 않은지 확인한 뒤 묶인 머리가 한쪽으로 치우치지 않게 다시 나누었어요.","목덜미의 잔머리는 불편하지 않을 만큼만 정리하고 포니테일 끝의 엉킨 결을 빗었어요."],
  "양갈래":["양쪽 머리의 양과 높이가 비슷하도록 가르마를 나누고 각각 편안한 세기로 묶었어요.","양갈래가 움직일 때 한쪽만 풀리지 않도록 고무줄을 확인하고 끝부분을 가볍게 빗었어요.","정수리 가르마가 비뚤어지지 않았는지 살핀 뒤 양쪽 묶음의 위치를 조금씩 맞췄어요."],
  "반묶음":["윗부분 머리만 부드럽게 모아 반묶음으로 고정하고 아래쪽 머리는 자연스럽게 풀어 두었어요.","귀 위의 머리를 양쪽에서 같은 양만큼 잡아 뒤로 묶고 얼굴 주변 잔머리를 정리했어요.","반묶음이 너무 당기지 않는지 확인한 뒤 풀어 둔 머리의 결을 손가락으로 가볍게 나누었어요."],
  "땋은 머리":["세 갈래의 굵기가 비슷하도록 나눈 뒤 당기는 힘을 일정하게 유지하며 차례로 땋았어요.","땋은 부분이 중간에서 느슨해지지 않도록 끝까지 손의 간격을 맞추고 매듭을 고정했어요.","완성한 땋은 머리의 양옆을 조금씩 풀어 원하는 굵기와 자연스러운 모양을 만들었어요."],
  "로우번":["목덜미 가까이 머리를 낮게 모아 돌려 감고 오래 있어도 당기지 않도록 핀의 위치를 조절했어요.","낮게 묶은 머리를 단정한 로우번으로 말아 넣고 옆선의 잔머리만 부드럽게 정리했어요.","가르마를 정돈한 뒤 목 뒤의 로우번이 한쪽으로 기울지 않았는지 손거울로 확인했어요."],
  "하이번":["정수리 가까이 머리를 높게 모아 균형을 잡고 움직여도 풀리지 않게 핀을 나누어 꽂았어요.","높게 묶은 머리를 둥글게 말아 하이번을 만들고 목덜미 잔머리를 가볍게 정리했어요.","하이번의 중심이 치우치지 않았는지 앞뒤 거울로 확인하고 당기는 곳의 핀을 다시 조절했어요."],
  "번 헤어":["오늘 움직임에 맞춰 머리를 낮거나 높게 모은 뒤 당기지 않도록 핀의 위치를 조절했어요.","머리를 둥글게 말아 고정하고 잔머리가 불편하게 닿는 부분만 정리했어요.","묶은 머리가 한쪽으로 기울지 않았는지 거울로 확인하고 느슨한 곳을 다시 고정했어요."],
  "드레드록":["각 록의 뿌리와 두피 상태를 살피고 서로 엉켜 붙은 부분을 조심스럽게 나누었어요.","드레드록에 남은 수분이 없도록 충분히 말린 뒤 필요한 부분만 가볍게 정리했어요.","눌린 록을 손으로 풀어 원하는 방향으로 배치하고 두피가 당기지 않는지 확인했어요."],
  "히메컷":["얼굴 옆의 짧고 곧은 단과 뒤의 긴 머리를 따로 빗어 히메컷의 선을 또렷하게 살렸어요.","양옆의 짧은 머리가 같은 높이로 떨어지는지 확인하고 긴 뒷머리는 차분히 정돈했어요.","얼굴선을 감싸는 옆머리 끝을 곧게 다듬어 커트의 층이 흐려지지 않게 했어요."],
  "웨이브 스타일":["웨이브가 뭉개진 부분을 손가락으로 나누고 컬의 방향을 따라 가볍게 쥐어 모양을 되살렸어요.","머리가 완전히 마르기 전 웨이브 결을 아래에서 받쳐 말려 부스스함을 줄였어요.","컬마다 탄력이 다르지 않도록 손질제를 고르게 바르고 굵은 웨이브의 흐름을 정돈했어요."],
  "고데기 스타일링":["열 보호제를 먼저 바르고 머리를 작은 구역으로 나누어 필요한 부분에만 고데기를 사용했어요.","같은 곳에 열을 오래 대지 않도록 속도를 맞추며 앞쪽부터 뒤쪽까지 차례로 모양을 잡았어요.","고데기로 만든 결이 충분히 식은 뒤 손가락으로 풀어 과하게 굳어 보이지 않게 정리했어요."],
  "시스루 앞머리":["이마가 은은하게 비치는 앞머리의 양을 나누고 가벼운 결이 뭉치지 않게 정리했어요.","가느다란 앞머리 사이의 간격을 손끝으로 맞추고 뿌리 볼륨만 살짝 살렸어요."],
  "일자 앞머리":["눈썹선을 따라 떨어지는 앞머리가 한쪽으로 기울지 않게 곧게 빗었어요.","일자 앞머리의 끝선이 흐트러진 곳만 가볍게 적셔 반듯하게 말렸어요."],
  "처피뱅":["짧은 앞머리의 끝이 서로 뭉치지 않도록 손끝으로 가볍게 나누었어요.","처피뱅의 짧은 선을 살리면서 들뜬 부분만 눌러 정돈했어요."],
  "커튼뱅":["가운데에서 갈라지는 앞머리를 양쪽 얼굴선으로 자연스럽게 이어 말렸어요.","커튼뱅이 한쪽만 무겁지 않도록 가르마와 볼륨을 맞추었어요."],
  "옆으로 넘긴 앞머리":["앞머리를 평소 방향으로 넘기고 관자놀이 쪽 잔머리와 자연스럽게 이어 주었어요.","옆으로 흐르는 앞머리가 다시 내려오지 않도록 뿌리 방향부터 천천히 말렸어요."],
  "앞머리가 한쪽 눈을 가림":["한쪽 눈을 덮는 앞머리의 방향은 유지하되 시야가 필요한 순간에는 넘길 수 있게 결을 정리했어요.","눈가를 스치는 머리끝이 불편하지 않은지 확인하고 한쪽으로 흐르는 선을 다듬었어요."],
  "앞머리가 양쪽 눈을 가림":["양쪽 눈 앞에 내려온 앞머리가 서로 엉키지 않도록 가닥을 나누어 정리했어요.","시야를 확보해야 할 때 쉽게 걷어 낼 수 있도록 눈앞의 머리결을 가볍게 빗었어요."],
  "슬릭백":["머리 전체를 뒤로 매끈하게 넘기고 표면의 잔머리를 소량의 제품으로 눌렀어요.","윤기가 한곳에만 몰리지 않게 제품을 얇게 펴 바르며 슬릭백의 선을 정돈했어요."],
  "픽시컷":["짧은 층을 손가락으로 나누어 픽시컷의 가벼운 방향을 살렸어요.","귀 주변과 목덜미의 짧은 머리가 들뜨지 않도록 결을 따라 말렸어요."],
  "댄디컷":["앞머리와 옆머리가 단정하게 이어지도록 가르마와 볼륨을 차분히 맞췄어요.","댄디컷의 둥근 실루엣이 무너지지 않게 눌린 부분만 살려 냈어요."],
  "리프컷":["얼굴선을 감싸며 갈라지는 머리끝을 잎처럼 자연스럽게 바깥으로 정리했어요.","리프컷의 앞뒤 층이 끊겨 보이지 않도록 귀 주변의 흐름을 맞추었어요."],
  "허쉬컷":["가벼운 층이 얼굴 주변에서 자연스럽게 흩어지도록 아래에서 받쳐 말렸어요.","허쉬컷의 얇은 끝선이 한 덩어리로 붙지 않게 손가락으로 결을 나누었어요."],
  "샤기컷":["거칠게 층진 끝부분을 소량의 왁스로 나누어 샤기컷의 질감을 살렸어요.","정수리의 짧은 층과 긴 끝이 자연스럽게 이어지도록 털어 말렸어요."],
  "모히칸":["가운데 긴 부분의 방향을 세우고 양옆의 짧은 선이 깔끔한지 확인했어요.","모히칸의 높이가 한쪽으로 기울지 않도록 앞과 뒤의 고정력을 나누어 조절했어요."],
  "리젠트":["앞머리를 위로 올려 뒤로 흐르게 만들고 옆머리는 단정히 눌렀어요.","리젠트의 앞쪽 볼륨과 뒤로 넘어가는 곡선이 매끄럽게 이어지는지 살폈어요."],
  "사이드 포니테일":["머리를 한쪽으로 모아 묶고 목과 어깨에 닿는 위치가 불편하지 않게 조절했어요.","사이드 포니테일이 앞으로 쏠리지 않도록 매듭과 잔머리를 다시 정리했어요."],
  "트윈테일":["양쪽 묶음의 높이와 머리 양을 맞추고 당기는 곳이 없는지 확인했어요.","트윈테일의 끝을 각각 빗어 움직일 때 결이 자연스럽게 흩어지도록 했어요."],
  "하프업 번":["윗머리만 모아 작은 번으로 고정하고 아래에 풀린 머리는 결대로 정리했어요.","하프업 번이 너무 무겁지 않도록 묶는 양과 핀의 위치를 조절했어요."],
  "프렌치 브레이드":["정수리부터 머리를 조금씩 더하며 단단하고 고른 프렌치 브레이드를 만들었어요.","머리선을 따라 이어지는 땋은 결의 간격이 일정한지 손끝으로 확인했어요."],
  "피시테일 브레이드":["가느다란 머리 가닥을 번갈아 넘기며 촘촘한 피시테일 모양을 만들었어요.","땋은 끝을 조금씩 풀어 물고기 꼬리처럼 이어지는 결을 자연스럽게 정돈했어요."],
  "콘로우":["두피를 따라 이어지는 가르마와 땋은 줄의 간격을 차분히 확인했어요.","콘로우의 뿌리가 지나치게 당기지 않는지 살피고 느슨한 끝만 다시 고정했어요."],
  "박스 브레이드":["나뉜 구역마다 브레이드의 굵기와 길이가 고른지 차례로 확인했어요.","박스 브레이드가 서로 엉키지 않게 나누고 두피가 당기는 부분을 조절했어요."],
  "스페이스 번":["양쪽 머리를 높게 말아 올려 두 번의 크기와 위치를 맞추었어요.","스페이스 번의 중심이 기울지 않게 핀을 나누어 꽂고 잔머리를 정리했어요."],
  "브레이드 업두":["땋은 머리를 뒤쪽으로 감아 올리고 보이지 않는 곳에 핀을 나누어 고정했어요.","브레이드 업두의 무게가 한쪽에 몰리지 않도록 매듭과 핀 위치를 다시 살폈어요."],
  "롱 스트레이트":["긴 머리를 구역별로 나누어 빗고 끝까지 곧게 이어지는 결을 정돈했어요.","등 뒤로 흐르는 긴 직모가 엉키지 않도록 아래쪽부터 천천히 풀어 주었어요."],
  "단발 웨이브":["단발 끝의 웨이브가 얼굴 양쪽에서 비슷하게 흐르도록 컬을 나누었어요.","턱선 부근의 웨이브가 뭉치지 않게 손끝으로 가볍게 풀어 주었어요."],
  "베이비펌":["짧고 잔잔한 컬을 손으로 눌러 뭉치지 않게 하나씩 되살렸어요.","베이비펌의 작은 컬이 부스스해지지 않도록 수분과 손질제를 가볍게 더했어요."],
  "히피펌":["굵기와 방향이 다른 컬을 자연스럽게 나누어 히피펌의 풍성함을 살렸어요.","컬을 아래에서 받쳐 말리며 전체 볼륨이 한쪽으로 치우치지 않게 했어요."],
  "가르마펌":["가르마 양쪽의 컬이 얼굴선을 따라 흐르도록 뿌리부터 방향을 잡았어요.","앞머리의 곡선과 옆머리의 볼륨이 자연스럽게 이어지도록 손질했어요."]
};
function hairStyleRoutine(c,style,hair,date){
  const bank=HAIR_STYLE_ROUTINES[style]||HAIR_STYLE_ROUTINES["자연스럽게 풀어 둠"];
  const line=bank[hash(`${c.id}:${dayKey(date)}:${style}:hair-routine`)%bank.length];
  return hair?`${object(hair)} 살피고 ${line}`:line;
}
function hairStyleSocialDetail(c,seed=""){
  const styles=appearanceProfile(c).hairStyles||[];
  if(!styles.length)return"";
  const style=styles[hash(`${c.id}:${seed}:social-hair-style`)%styles.length];
  const details={
    "자연스럽게 풀어 둠":"풀어 둔 머리가 움직일 때마다 자연스럽게 달라지는 결",
    "앞머리 있음":"표정에 따라 조금씩 움직이는 앞머리",
    "앞머리 없음":"이마와 얼굴선이 또렷하게 드러나는 가르마",
    "올백":"단정하게 뒤로 넘긴 올백의 선",
    "보브컷":"턱선을 따라 또렷하게 떨어지는 보브컷",
    "레이어드컷":"움직일 때 층마다 가볍게 흩어지는 레이어드컷",
    "울프컷":"짧은 층과 긴 뒷머리가 대비되는 울프컷",
    "투블럭":"짧은 옆선과 정돈된 윗머리가 이어지는 투블럭",
    "언더컷":"긴 머리 아래로 드러나는 언더컷의 짧은 선",
    "포니테일":"고개를 돌릴 때 가볍게 흔들리는 포니테일",
    "양갈래":"양쪽에서 리듬 있게 움직이는 양갈래",
    "반묶음":"묶은 윗머리와 풀어 둔 아래 머리가 겹치는 반묶음",
    "땋은 머리":"일정한 결로 이어진 땋은 머리",
    "로우번":"목덜미 가까이 단정하게 자리 잡은 로우번",
    "하이번":"정수리 가까이 높게 묶어 올린 하이번",
    "번 헤어":"둥글게 말아 올린 번 헤어",
    "드레드록":"한 가닥씩 고유한 결을 가진 드레드록",
    "히메컷":"얼굴 옆의 짧은 단과 긴 머리가 또렷한 히메컷",
    "웨이브 스타일":"빛과 움직임에 따라 결이 달라지는 웨이브",
    "고데기 스타일링":"의도한 방향으로 정교하게 잡힌 스타일링",
    "시스루 앞머리":"이마가 은은하게 비치는 가벼운 시스루 앞머리",
    "일자 앞머리":"반듯한 선으로 떨어지는 일자 앞머리",
    "처피뱅":"이마 위로 짧고 선명하게 잘린 처피뱅",
    "커튼뱅":"얼굴 양옆으로 부드럽게 갈라지는 커튼뱅",
    "옆으로 넘긴 앞머리":"한쪽 얼굴선으로 자연스럽게 흐르는 앞머리",
    "앞머리가 한쪽 눈을 가림":"한쪽 눈 위로 비스듬히 내려온 앞머리",
    "앞머리가 양쪽 눈을 가림":"두 눈 앞에 길게 드리운 앞머리",
    "슬릭백":"윤기 있게 뒤로 정돈한 슬릭백",
    "픽시컷":"짧은 층이 가볍게 살아 있는 픽시컷",
    "댄디컷":"단정한 둥근 선이 이어지는 댄디컷",
    "리프컷":"얼굴선을 따라 잎처럼 갈라지는 리프컷",
    "허쉬컷":"얇은 층이 가볍게 흩어지는 허쉬컷",
    "샤기컷":"거칠고 가벼운 끝선이 살아 있는 샤기컷",
    "모히칸":"가운데로 힘 있게 이어지는 모히칸",
    "리젠트":"앞에서 뒤로 높게 넘어가는 리젠트",
    "사이드 포니테일":"한쪽 어깨로 흐르는 사이드 포니테일",
    "트윈테일":"양쪽에서 높이 맞춰 흔들리는 트윈테일",
    "하프업 번":"작게 말아 올린 윗머리와 풀린 머리가 겹치는 하프업 번",
    "프렌치 브레이드":"정수리부터 촘촘하게 이어지는 프렌치 브레이드",
    "피시테일 브레이드":"가느다란 결이 교차하는 피시테일 브레이드",
    "콘로우":"두피선을 따라 정교하게 이어지는 콘로우",
    "박스 브레이드":"일정한 구역과 굵기로 나뉜 박스 브레이드",
    "스페이스 번":"머리 양쪽에 둥글게 올라간 스페이스 번",
    "브레이드 업두":"땋은 결을 감아 올려 완성한 업두",
    "롱 스트레이트":"등 뒤로 곧게 흐르는 긴 직모",
    "단발 웨이브":"턱선 주변에서 부드럽게 움직이는 단발 웨이브",
    "베이비펌":"작고 잔잔한 컬이 촘촘한 베이비펌",
    "히피펌":"풍성하고 자유로운 컬이 이어지는 히피펌",
    "가르마펌":"가르마 양쪽으로 자연스럽게 흐르는 컬"
  };
  return details[style]||style;
}

function appearanceMorningEntry(c,time,date){
  const a=appearanceProfile(c),makeup=configuredAppearanceValue(a.makeupLevel),hair=hairLookPhrase(c),styles=a.makeupStyles||[],hairStyles=a.hairStyles||[];
  const parts=[];
  let title="";
  if(makeup&&makeup!=="스킨케어만"){
    title=makeup==="선크림·기초만"?"기초 화장을 준비하는 중":makeup==="풀 메이크업"?"풀 메이크업으로 외출을 준비하는 중":"화장하며 외출을 준비하는 중";
    if(makeup==="선크림·기초만")parts.push("스킨케어를 마친 뒤 선크림과 필요한 기초 제품을 얇게 바르며 피부 표현을 정돈했어요.");
    else if(makeup==="가벼운 메이크업")parts.push("기초를 가볍게 정리하고 필요한 부분만 자연스럽게 다듬었어요.");
    else if(makeup==="포인트 메이크업")parts.push(`${styles.length?`${styles[0]} 스타일에 맞춰 `:""}눈이나 입술 가운데 오늘 강조할 한 곳을 골라 색과 선을 조절했어요.`);
    else parts.push(`${styles.length?`${styles.join("·")} 느낌을 살리되 `:""}기초부터 색조까지 순서대로 완성하고 조명에 따라 색이 달라 보이지 않는지 확인했어요.`);
  }else if(makeup==="스킨케어만"){
    title="아침 스킨케어를 하는 중";
    parts.push("세안 뒤 자기 피부에 맞는 제품을 순서대로 바르고 흡수될 시간을 두었어요.");
  }
  if(hair){
    if(!title)title="머리를 정돈하며 외출을 준비하는 중";
    const style=hairStyles.length?hairStyles[hash(`${c.id}:${dayKey(date)}:hair-style`)%hairStyles.length]:"평소 방식";
    parts.push(style==="평소 방식"?`${hair}의 결을 살피며 평소 손질 순서대로 흐트러진 부분을 정돈했어요.`:hairStyleRoutine(c,style,hair,date));
  }
  if(!title)return null;
  return homeEntry(c,time,title,personalityFlavor(c,parts.join(" "),`appearance-morning:${makeup||"hair"}`,date),"bath");
}

function appearanceCareEvent(c,time,date){
  const a=appearanceProfile(c),origin=configuredAppearanceValue(a.hairColorOrigin),frequency=a.salonFrequency||"자동 · 설정에 맞춤";
  const dyed=/염색/.test(origin),hasHairSetting=!!hairLookPhrase(c);
  if(!hasHairSetting&&frequency==="자동 · 설정에 맞춤")return null;
  const interval={
    "거의 가지 않음":120,
    "3~4개월에 한 번":90,
    "1~2개월에 한 번":45,
    "한 달에 한 번":30,
    "2주에 한 번":14,
    "주 1회 이상":7
  }[frequency]||(dyed?21:75);
  if(hash(`${c.id}:${dayKey(date)}:salon-visit`)%interval!==0)return null;
  const salons=(activityTown(c,date)?.places||[]).filter(place=>/미용실|헤어|뷰티|이발/.test(`${place.type||""} ${place.name||""}`));
  const salon=salons.length?salons[hash(`${c.id}:${dayKey(date)}:salon-place`)%salons.length]:null;
  if(salon){
    const color=hairColorText(a.hairColor);
    const desc=dyed
      ?`${color?`${color} 머리의 `:""}색이 빠진 정도와 자란 뿌리를 확인한 뒤 원하는 색과 손상 관리 범위를 미용사와 구체적으로 상의했어요.`
      :"평소 기장과 손질 습관을 설명하고 오늘 다듬을 길이와 스타일을 직접 골랐어요.";
    return entry(time,`${salon.name}에서 머리를 관리하는 중`,desc,{townId:activityTown(c,date)?.id,placeId:salon.id,mood:"관리"});
  }
  const desc=dyed
    ?"거울로 염색한 머리의 색 빠짐과 자란 뿌리를 확인하고, 원하는 색을 유지할 수 있는 날짜로 미용실 예약을 잡았어요."
    :"머리 길이와 손질하기 불편한 부분을 확인하고 다음에 다듬을 때 설명할 내용을 메모했어요.";
  return homeEntry(c,time,"머리 상태를 확인하고 미용실 일정을 잡는 중",desc,"bath");
}

function morningScripts(c,date){
  const likes=[...(c.hobbies||[]),...(c.interests||[])],seed=`${c.id}:${dayKey(date)}:morning`;
  const storyGenres=c.favoriteStoryGenres||[];
  const videoTypes=c.favoriteVideoGenres||[];
  const choices=[];
  if(likes.some(x=>/운동|산책|사진/.test(x)))choices.push(
    ["아침 조깅을 마치고 돌아오는 중","동네를 가볍게 달린 뒤 숨을 고르며 집으로 돌아와 물을 마시고 있어요.","entry"],
    ["거실에서 스트레칭 중","창문을 조금 열어 둔 채 굳은 어깨와 다리를 천천히 풀고 있어요.","living"]
  );
  if(likes.some(x=>/독서|역사|만화|문구/.test(x)))choices.push(
    ["서재에서 아침 독서 중","따뜻한 음료를 곁에 두고 표시해 둔 페이지부터 조용히 읽고 있어요.","study"],
    ["책상에서 오늘 할 일을 정리하는 중","수첩에 오늘의 일정과 잊지 말아야 할 일을 차분히 적고 있어요.","study"]
  );
  if(likes.some(x=>/게임|인터넷|커뮤니티|영상|덕질/.test(x)))choices.push(
    ["거실에서 새 소식을 확인하는 중","소파에 앉아 밤사이 올라온 소식과 좋아하는 콘텐츠를 훑어보고 있어요.","living"],
    ["서재에서 짧게 게임하는 중",(c.perceivingJudging??3)>=5?"아침 일정이 시작되기 전까지만 하려고 타이머를 맞춰 두고 게임을 켰어요.":"눈에 들어온 게임을 켜고 한 판만 하려다 잠시 집중하고 있어요.","study"]
  );
  if(likes.some(x=>/요리|카페|음식/.test(x)))choices.push(
    ["주방에서 도시락을 준비하는 중","먹기 좋은 크기로 재료를 손질하고 작은 용기에 반찬을 차곡차곡 담고 있어요.","kitchen"],
    ["주방에서 차를 우리는 중","물 온도를 맞춘 뒤 찻잎이 천천히 우러나는 동안 식탁을 정돈하고 있어요.","kitchen"]
  );
  if(likes.some(x=>/청소|인테리어/.test(x)))choices.push(
    ["거실을 정돈하는 중","소파 쿠션을 바로 놓고 눈에 띄는 먼지와 어질러진 물건을 정리하고 있어요.","living"],
    ["세탁물을 정리하는 중","마른 옷을 종류별로 접어 각자의 자리에 가져다 놓고 있어요.","bath"]
  );
  if(likes.some(x=>/천문|우주|과학/.test(x)))choices.push(
    ["창가에서 하늘을 관찰하는 중","구름 사이의 달과 별 위치를 확인하고 관찰한 내용을 짧게 기록하고 있어요.","study"],
    ["과학 소식을 읽는 중","새로 발표된 연구와 우주 탐사 소식을 찾아 핵심 내용을 메모하고 있어요.","study"]
  );
  if(likes.some(x=>/프로그래밍|전자기기|로봇|인공지능|기계/.test(x)))choices.push(
    ["서재에서 작은 프로젝트를 만드는 중","떠오른 기능을 직접 구현해 보고 오류가 난 부분을 하나씩 확인하고 있어요.","study"],
    ["전자기기를 정비하는 중","케이블과 부품을 정리하고 기기의 설정과 작동 상태를 점검하고 있어요.","study"]
  );
  if(likes.some(x=>/글쓰기|소설|시|언어|외국어/.test(x)))choices.push(
    ["책상에서 글을 쓰는 중","떠오른 문장을 놓치지 않으려고 초안을 적고 어색한 표현을 천천히 다듬고 있어요.","study"],
    ["외국어 표현을 익히는 중","관심 있는 영상의 문장을 따라 읽고 새로 알게 된 표현을 정리하고 있어요.","study"]
  );
  if(likes.some(x=>/요리|베이킹|커피|차|와인/.test(x)))choices.push(
    ["주방에서 새로운 레시피를 시험하는 중","재료의 양과 향을 비교하며 다음에는 어떻게 바꿀지 기록하고 있어요.","kitchen"],
    ["좋아하는 음료를 준비하는 중","온도와 시간을 세심하게 맞춰 향을 확인한 뒤 천천히 한 잔을 완성하고 있어요.","kitchen"]
  );
  if(likes.some(x=>/반려동물|식물|원예|자연|환경/.test(x)))choices.push(
    ["집 안의 생물을 돌보는 중","물과 먹이를 확인하고 상태가 달라진 곳은 없는지 자세히 살펴보고 있어요.","living"],
    ["식물 잎을 정리하는 중","마른 잎을 떼어 내고 화분의 흙과 햇빛이 충분한지 확인하고 있어요.","living"]
  );
  if(likes.some(x=>/사진|영상 편집|미술|공예|뜨개|재봉|목공|도예/.test(x)))choices.push(
    ["창작 작업을 이어가는 중","도구와 재료를 펼쳐 놓고 색과 형태를 비교하며 세부 표현을 다듬고 있어요.","study"],
    ["촬영한 자료를 정리하는 중","마음에 드는 장면을 골라 밝기와 구도를 조정하고 파일을 분류하고 있어요.","study"]
  );
  if(likes.some(x=>/역사|신화|철학|정치|경제|법률|심리|의학|범죄|추리/.test(x)))choices.push(
    ["관심 분야의 자료를 조사하는 중","서로 다른 자료의 설명을 비교하고 흥미로운 부분에 표시를 남기고 있어요.","study"],
    ["기록과 사건을 정리하는 중","인물과 사건의 관계를 시간 순서대로 적으며 자기 나름의 해석을 덧붙이고 있어요.","study"]
  );
  if(likes.some(x=>/자동차|오토바이|철도|항공|밀리터리|무기/.test(x)))choices.push(
    ["장비와 이동수단 자료를 보는 중","모델별 구조와 성능 차이를 비교하며 마음에 드는 부분을 자세히 살펴보고 있어요.","study"],
    ["수집한 제원표를 정리하는 중","복잡한 사양을 용도별로 나누고 흥미로운 기종에 표시를 남기고 있어요.","study"]
  );
  if(likes.some(x=>/축구|야구|농구|e스포츠|보드게임|퍼즐|마술/.test(x)))choices.push(
    ["경기와 플레이를 분석하는 중","인상적인 장면을 다시 보며 전략과 선택의 이유를 혼자 정리하고 있어요.","living"],
    ["퍼즐과 전략을 연구하는 중","여러 가능성을 시험하고 더 나은 해결 순서를 찾는 데 집중하고 있어요.","study"]
  );
  if(storyGenres.length){
    const genre=storyGenres[hash(seed+":genre")%storyGenres.length];
    choices.push(
      [`${genre} 작품을 골라 보는 중`,`좋아하는 ${genre} 장르의 책과 영상 후보를 비교하며 오늘 이어 볼 작품을 고르고 있어요.`,"study"],
      [`${genre} 이야기를 감상하는 중`,`취향에 맞는 ${genre} 작품을 펼쳐 인상적인 장면과 대사를 천천히 따라가고 있어요.`,"living"]
    );
  }
  if(videoTypes.length){
    const type=videoTypes[hash(seed+":video-type")%videoTypes.length];
    choices.push(
      [`${type} 새 영상을 찾아보는 중`,`구독 목록과 추천 목록에서 좋아하는 ${type} 영상을 골라 재생 목록에 담고 있어요.`,"living"],
      [`${type} 영상을 이어 보는 중`,`관심 있던 ${type} 영상의 다음 편을 켜고 인상적인 부분을 놓치지 않으려고 집중하고 있어요.`,"living"]
    );
  }
  if(likes.some(x=>/뜨개|재봉|자수|가죽|프라모델|피규어|우표|레코드/.test(x)))choices.push(
    ["수집품과 재료를 정리하는 중","작은 부품과 재료를 종류별로 나누고 다음 작업에 쓸 것을 손이 닿기 좋은 곳에 놓고 있어요.","study"],
    ["손으로 만드는 작업에 집중하는 중","도안과 완성된 부분을 번갈아 확인하며 한 땀씩 세부를 다듬고 있어요.","study"]
  );
  if(likes.some(x=>/악기|노래|춤|음악 감상/.test(x)))choices.push(
    ["좋아하는 곡을 연습하는 중","박자와 어려운 구간을 반복해 들으며 자기 속도에 맞춰 차근차근 연습하고 있어요.","study"],
    ["재생 목록을 정리하는 중","지금 기분과 잘 맞는 곡을 골라 순서를 바꾸고 새로 발견한 곡을 추가하고 있어요.","living"]
  );
  if(likes.some(x=>/여행 계획|지도 보기|역사 탐방|천체 관측/.test(x)))choices.push(
    ["다음 외출 경로를 짜는 중","지도에 가 보고 싶은 장소를 표시하고 이동 시간과 쉬어 갈 곳을 함께 확인하고 있어요.","study"],
    ["관찰 기록을 정리하는 중","직접 본 풍경과 사물의 특징을 사진과 메모로 남기며 다음에 확인할 것을 적고 있어요.","study"]
  );
  if(likes.some(x=>/자동차 관리|드라이브|자전거/.test(x)))choices.push(
    ["이동 장비를 점검하는 중","타이어와 필요한 장비 상태를 확인하고 다음 외출 전에 손볼 부분을 메모하고 있어요.","entry"],
    ["드라이브 경로를 살펴보는 중","교통이 덜 복잡하고 풍경이 좋은 길을 찾아 중간에 들를 장소를 고르고 있어요.","study"]
  );
  if(!choices.length)choices.push(
    ["집 근처를 산책하고 돌아오는 중","조용한 아침 공기를 쐬며 한 바퀴 걷고 현관에서 신발을 정리하고 있어요.","entry"],
    ["거실에서 오늘 일정을 살펴보는 중","소파에 앉아 해야 할 일의 순서를 머릿속으로 정리하고 있어요.","living"],
    ["서재에서 개인 시간을 보내는 중","책상 앞에 앉아 관심 있던 글과 자료를 천천히 살펴보고 있어요.","study"]
  );
  const count=Math.min(4,choices.length),picked=[],used=new Set();
  for(let index=0;index<count;index++){
    let choiceIndex=hash(`${seed}:step:${index}`)%choices.length;
    while(used.has(choiceIndex))choiceIndex=(choiceIndex+1)%choices.length;
    used.add(choiceIndex);picked.push(choices[choiceIndex]);
  }
  return picked.map((script,index)=>[script[0],personalityFlavor(c,script[1],`morning:${index}`,date),script[2]]);
}

function sharedHomeEntry(c,other,time,date){
  const pair=[c.id,other.id].sort(),role=pair.indexOf(c.id),kind=hash(`${pair.join(":")}:${dayKey(date)}:shared`)%4;
  const scripts=[
    [
      [`${other.name}와 저녁을 만드는 중`,"도마 위에 당근과 양파를 가지런히 놓고 먹기 좋은 크기로 천천히 썰고 있어요.","kitchen"],
      [`${other.name}와 저녁을 만드는 중`,"옆에서 손질해 주는 재료를 받아 팬의 불을 조절하고 소스 간을 보고 있어요.","kitchen"]
    ],
    [
      [`${other.name}와 영화를 보는 중`,"소파 한쪽에 담요를 펴고 상대가 편히 기대도록 쿠션을 건네준 뒤 재생 버튼을 눌렀어요.","living"],
      [`${other.name}와 영화를 보는 중`,"건네받은 쿠션을 끌어안고 마음에 든 장면이 나올 때마다 작은 목소리로 감상을 나누고 있어요.","living"]
    ],
    [
      [`${other.name}와 차를 마시는 중`,"상대가 좋아하는 잔을 골라 따뜻하게 데우고 향이 잘 우러나도록 차를 천천히 따르고 있어요.","kitchen"],
      [`${other.name}와 차를 마시는 중`,"맞은편 자리에 앉아 건네받은 찻잔을 두 손으로 감싸고 오늘 있었던 일을 들려주고 있어요.","kitchen"]
    ],
    [
      [`${other.name}와 방을 정리하는 중`,"바닥과 책상 위의 물건을 종류별로 모아 상대가 정리하기 쉽게 옆에 놓아주고 있어요.","study"],
      [`${other.name}와 방을 정리하는 중`,"상대가 모아 준 물건을 하나씩 제자리에 넣고 오래된 메모를 발견해 함께 들여다보고 있어요.","study"]
    ],
    [
      [`${other.name}와 음악을 고르는 중`,"서로 아는 곡을 번갈아 재생하며 다음에 들을 노래를 상대에게 골라 보라고 건네고 있어요.","living"],
      [`${other.name}와 음악을 듣는 중`,"상대가 고른 곡의 리듬을 따라 손끝을 움직이다가 자기 재생 목록에서도 한 곡을 찾아 들려주고 있어요.","living"]
    ],
    [
      [`${other.name}와 장을 본 물건을 정리하는 중`,"식탁 위 봉투에서 냉장 식품을 먼저 꺼내 종류별로 나누고 있어요.","kitchen"],
      [`${other.name}와 장을 본 물건을 정리하는 중`,"건네받은 식재료의 포장을 닦아 냉장고와 찬장에 차례로 넣고 있어요.","kitchen"]
    ],
    [
      [`${other.name}와 보드게임을 하는 중`,"규칙표를 다시 확인한 뒤 다음 수를 고민하며 상대의 표정을 슬쩍 살피고 있어요.","living"],
      [`${other.name}와 보드게임을 하는 중`,"상대가 오래 고민하자 재촉하지 않고 자기 패를 정리하며 차례를 기다리고 있어요.","living"]
    ],
    [
      [`${other.name}와 늦은 간식을 먹는 중`,"냉장고에 남은 재료로 간단한 간식을 만들어 접시 두 개에 나눠 담고 있어요.","kitchen"],
      [`${other.name}와 늦은 간식을 먹는 중`,"식탁 맞은편에 앉아 한입 먹어 본 뒤 다음에는 무엇을 더 넣을지 의견을 말하고 있어요.","kitchen"]
    ]
  ];
  const script=scripts[kind][role];
  return homeEntry(c,time,script[0],personalityFlavor(c,script[1]+respectfulAccessibilityFor(other,`shared:${kind}:${role}`,date),`shared:${kind}:${role}`,date),script[2]);
}

function roommateHomeEntry(c,other,time,date){
  const pair=[c.id,other.id].sort(),role=pair.indexOf(c.id);
  const scripts=[
    [[`주방에서 저녁을 준비하는 중`,"냉장고에서 필요한 재료를 꺼내 자기 몫의 저녁을 만들고 있어요.","kitchen"],["거실에서 휴대폰을 보는 중","소파 끝에 앉아 이어폰을 낀 채 새로 온 메시지를 확인하고 있어요.","living"]],
    [["욕실 앞에서 세탁물을 정리하는 중","마른 세탁물 가운데 자기 옷을 골라 바구니에 차곡차곡 담고 있어요.","bath"],["서재에서 개인 작업을 하는 중","책상 앞에 앉아 미뤄 둔 개인 작업을 조용히 이어가고 있어요.","study"]],
    [["거실에서 영상을 보는 중","소파에 기대어 이어폰으로 관심 있던 영상을 이어 보고 있어요.","living"],["주방에서 간식을 챙기는 중","찬장을 열어 간단한 간식과 마실 것을 골라 자기 방으로 가져갈 준비를 하고 있어요.","kitchen"]],
    [["현관에서 외출 준비 중","필요한 물건을 가방에 넣고 신발끈을 다시 묶으며 잠깐 나갈 채비를 하고 있어요.","entry"],["침실에서 옷을 정리하는 중","옷장 앞에서 내일 입을 옷을 골라 의자 위에 가지런히 놓고 있어요.","bedroom"]],
    [["서재에서 책을 읽는 중","책상 조명을 켜고 표시해 둔 페이지부터 자기 속도로 읽고 있어요.","study"],["거실에서 스트레칭하는 중","사람이 다니는 길을 피해 매트를 펴고 굳은 어깨와 허리를 풀고 있어요.","living"]],
    [["주방에서 설거지하는 중","자기가 사용한 그릇을 헹군 뒤 물기를 털어 건조대에 올리고 있어요.","kitchen"],["욕실에서 씻을 준비 중","갈아입을 옷과 수건을 챙겨 욕실 앞에서 차례를 기다리고 있어요.","bath"]]
  ];
  const script=scripts[hash(`${pair.join(":")}:${dayKey(date)}:roommate`)%scripts.length][role];
  return homeEntry(c,time,script[0],personalityFlavor(c,script[1],`roommate:${role}`,date),script[2]);
}

function workEvent(c,time,date){
  if(c.job==="무직")return null;
  const weekday=date.getDay()>=1&&date.getDay()<=5;
  const weekendJobs=["해적","군인","범죄자","환경미화원","여관주인","의사","간호사","요리사","자영업"];
  if(!weekday&&!weekendJobs.some(job=>String(c.job).includes(job)))return null;
  const variants={
    "회사원":[["업무 우선순위를 정리하는 중","메일과 요청 사항을 확인하고 오늘 처리할 일을 중요도와 마감 순서로 나누고 있어요."],["회의 자료를 다듬는 중","공유할 수치와 진행 상황을 다시 확인해 핵심만 알아보기 쉽게 정리하고 있어요."]],
    "CEO":[["경영 회의를 진행하는 중","부서별 실적과 현안을 보고받고 지금 결정해야 할 투자와 인력 문제의 우선순위를 정하고 있어요."],["사업 계약을 검토하는 중","계약 조건과 위험 요소를 확인하고 담당자에게 수정할 항목과 협상 기준을 전달하고 있어요."],["임원 보고를 받는 중","핵심 수치와 현장 문제를 차례로 듣고 책임자와 마감 시점을 분명하게 정하고 있어요."]],
    "의사":[["진료 기록을 확인하는 중","환자의 증상과 검사 결과, 복용 중인 약을 대조한 뒤 다음 진료 순서를 준비하고 있어요."],["회진 중","병실을 돌며 상태 변화를 확인하고 필요한 처치와 관찰 사항을 의료진에게 전달하고 있어요."]],
    "간호사":[["환자 상태를 확인하는 중","체온과 활력 징후를 살피고 투약 시간과 남은 처치를 차례로 확인하고 있어요."],["인수인계를 정리하는 중","근무 중 달라진 상태와 주의할 점을 빠짐없이 기록해 다음 담당자에게 전하고 있어요."]],
    "교사":[["수업을 진행하는 중","학생들의 반응을 살피며 준비한 내용을 설명하고 이해가 어려운 부분을 다른 예시로 풀어 주고 있어요."],["수업 자료를 준비하는 중","다음 시간에 쓸 자료와 과제를 확인하고 학생별로 필요한 안내를 정리하고 있어요."]],
    "교수":[["강의와 연구를 병행하는 중","강의 자료를 검토한 뒤 연구 기록과 참고 문헌의 빠진 부분을 보완하고 있어요."],["연구 지도를 하는 중","학생이 가져온 결과를 함께 살피며 논리가 끊기는 지점과 다음 실험 방향을 짚어 주고 있어요."]],
    "연구원":[["연구 데이터를 분석하는 중","수집한 결과를 기준별로 나누고 예상과 다른 값이 나온 원인을 다시 검토하고 있어요."],["실험 과정을 점검하는 중","장비 상태와 절차를 확인하고 재현할 수 있도록 조건과 결과를 꼼꼼히 기록하고 있어요."]],
    "프로그래머":[["기능을 구현하는 중","요구 사항을 작은 단위로 나누어 코드를 작성하고 예상한 대로 작동하는지 하나씩 시험하고 있어요."],["오류를 추적하는 중","문제가 생긴 조건을 다시 만들고 기록을 따라가며 원인이 시작된 부분을 찾고 있어요."]],
    "기자":[["취재 내용을 정리하는 중","서로 다른 증언과 자료를 대조하고 확인되지 않은 표현을 기사에서 걷어 내고 있어요."],["기사 초안을 쓰는 중","독자가 흐름을 놓치지 않도록 사실의 순서를 정리하고 제목과 첫 문장을 다듬고 있어요."]],
    "요리사":[["주문 음식을 준비하는 중","들어온 주문 순서를 확인하고 재료의 익는 시간을 맞춰 여러 조리를 동시에 진행하고 있어요."],["주방 재료를 점검하는 중","남은 식재료의 상태와 수량을 살피고 영업에 필요한 손질과 준비를 이어가고 있어요."]],
    "예술가":[["작품 작업을 이어가는 중","전체 균형을 살피며 마음에 걸리는 부분을 여러 방식으로 고쳐 보고 있어요."],["작업 자료를 정리하는 중","떠오른 이미지를 놓치지 않도록 스케치와 참고 자료를 펼쳐 다음 표현을 구상하고 있어요."]],
    "환경미화원":[["담당 구역을 정돈하는 중","거리의 쓰레기를 종류별로 수거하고 사람들이 지나는 길을 안전하게 정리하고 있어요."],["청소 장비를 점검하는 중","도구와 수거함 상태를 확인하고 다음 구역으로 이동할 준비를 하고 있어요."]],
    "학생":[["수업을 듣는 중","오늘 시간표에 맞춰 설명을 듣고 중요한 내용을 자기 말로 다시 적어 보고 있어요."],["과제를 하는 중","제출 조건을 확인하고 참고 자료를 살펴보며 해야 할 부분을 차례로 해결하고 있어요."]],
    "해적":[["항해 준비 중","선원들과 항로와 날씨, 보급품을 점검하고 출항에 필요한 역할을 나누고 있어요."]],
    "군인":[["전술 훈련 중","정해진 목표 지점까지 이동하며 대형과 신호를 맞추고 장비 상태를 반복해서 확인하고 있어요."],["경계 근무 중","담당 구역의 출입과 주변 변화를 살피고 교대할 인원에게 특이 사항을 빠짐없이 전달하고 있어요."],["장비를 정비하는 중","훈련에 사용한 장비를 분해해 이상 여부를 확인하고 다음 일정에 맞춰 다시 정돈하고 있어요."],["상황 보고를 하는 중","현장에서 확인한 내용을 시간 순서대로 정리해 지휘 계통에 간결하게 보고하고 있어요."]],
    "범죄자":[["은밀한 거래를 준비하는 중","약속 장소와 시간을 다시 확인하고 눈에 띄는 흔적을 남기지 않도록 필요한 물건만 챙기고 있어요."],["주변의 감시를 확인하는 중","같은 길을 반복하지 않고 이동하며 뒤따르는 사람이 없는지 유리창과 골목을 통해 살피고 있어요."],["도주 경로를 점검하는 중","막힐 가능성이 있는 길과 대체 이동 수단을 확인하고 연락할 사람과 신호를 다시 맞추고 있어요."],["장부를 숨겨 정리하는 중","거래 내역을 알아보기 어려운 표시로 옮겨 적고 원본은 쉽게 찾을 수 없는 곳에 감추고 있어요."]],
    "여관주인":[["손님맞이 중","객실 상태와 예약을 확인하고 새 손님이 불편하지 않도록 필요한 물품을 챙기고 있어요."]],
    "정치인":[["공무 일정을 소화하는 중","회의 자료와 민원 내용을 검토하고 오늘 결정해야 할 사안을 정리하고 있어요."]]
  };
  const matches=Object.entries(variants).find(([key])=>c.job===key||String(c.jobTitle||"").includes(key));
  const pool=matches?.[1]||[["직업 업무를 처리하는 중",`${c.jobTitle||c.job}에게 필요한 실무를 일정과 우선순위에 맞춰 진행하고 있어요.`]];
  const text=pool[hash(`${c.id}:${dayKey(date)}:job-scene`)%pool.length];
  if(!c.workplaceId||c.workplaceId==="home")return homeEntry(c,time,c.workplaceId==="home"?"자택에서 "+text[0]:text[0],text[1],"study");
  const p=(townFor(c,date)?.places||[]).find(x=>x.id===c.workplaceId)||placeFor(["사무실","회사","학교"],`${c.id}:work`,c);
  return entry(time,text[0],text[1],away(c,{placeId:p?.id,mood:"집중",stress:Math.min(100,25+(hash(`${c.id}:${dayKey(date)}:work`)%35))}));
}

function socialEvent(c,time,date){
  let pick=preferredRelation(c);
  if(pick&&activityTown(pick.other,date)?.id!==activityTown(c,date)?.id)pick=null;
  const pair=pick?[c.id,pick.other.id].sort().join(":"):c.id;
  const socialTypes=/산책|운동|등산|자전거/.test((c.hobbies||[]).join(" "))||hash(`${pair}:${dayKey(date)}:park-interest`)%4===0
    ?["카페","음식점","공원","영화관","도서관","쇼핑몰","공연장"]
    :["카페","음식점","영화관","도서관","쇼핑몰","공연장"];
  const p=placeFor(socialTypes,`${pair}:${dayKey(date)}:${Math.floor(time/180)}:social-place`,c);
  if(!p)return null;
  const servesMeals=p.type==="음식점",servesDrinks=p.type==="카페";
  const food=servesMeals?catalogChoice(c,p,"food",`${c.id}:${dayKey(date)}:food`):null;
  const drink=servesDrinks?catalogChoice(c,p,"drink",`${c.id}:${dayKey(date)}:drink`):null;
  if(pick){
    const romantic=["연인","부부"].includes(pick.r.type),crush=pick.r.type==="짝사랑";
    const action=food?`${pick.other.name}와 함께 ${food.name} 먹는 중`:drink?`${pick.other.name}와 ${drink.name} 마시는 중`:`${pick.other.name}와 ${romantic?"데이트":"나들이"} 중`;
    const relationDetails={
      짝사랑:`${pick.other.name}의 반응을 의식하면서도 평범한 외출인 척 자연스럽게 대화를 이어가고 있어요.`,
      친구:`${pick.other.name}와 둘만 아는 농담을 주고받고 거리낌 없이 서로의 근황을 묻고 있어요.`,
      소꿉친구:`${pick.other.name}와 오래전부터 알고 지낸 사람만 알아들을 추억을 꺼내며 편하게 이야기를 이어가고 있어요.`,
      "학창 시절 친구들":`${pick.other.name}와 학창 시절의 기억과 요즘 달라진 생활을 비교하며 이야기를 이어가고 있어요.`,
      산악회:`${pick.other.name}와 다음에 걸을 길과 준비물을 이야기하며 서로의 체력을 살피고 있어요.`,
      "직장 동료":`${pick.other.name}와 업무 밖의 이야기를 나누다가도 자연스럽게 오늘 있었던 일을 함께 정리하고 있어요.`,
      라이벌:`${pick.other.name}와 최근 결과를 은근히 비교하면서도 상대가 잘한 부분은 놓치지 않고 살피고 있어요.`,
      혐관:`${pick.other.name}와 사소한 선택에서도 신경전을 벌이지만 먼저 자리를 뜨지는 않고 있어요.`
    };
    const unawareCrush=crush&&/무자각|자기 감정을 모르는|호감이라고만|자꾸 신경/.test(pick.r.stage||"");
    if(unawareCrush&&pick.r.admirerId===c.id){
      const shy=/수줍|내향|혼자|아싸|사람이 싫/.test(c.socialStyle||"");
      relationDetails.짝사랑=shy
        ?`${pick.other.name}와 우연히 같은 곳을 골랐다고 생각하면서도 자꾸 상대의 반응부터 확인해요. 말을 걸고 싶지만 이유를 찾지 못해 가까운 자리에서 혼자 시간을 보내고 있어요.`
        :`${pick.other.name}에게 유독 자주 말을 걸고 필요한 것을 먼저 챙겨 주면서도, 그저 잘 맞는 사람이라 신경 쓰이는 것뿐이라고 생각하고 있어요.`;
    }else if(unawareCrush&&pick.r.targetId===c.id){
      relationDetails.짝사랑=`${pick.other.name}가 자기 취향과 작은 변화를 유난히 잘 기억하는 것을 이상하게 여기고 있어요. 당사자는 별 뜻 없다는 얼굴이라 아직 그 행동의 이유를 알지 못해요.`;
    }else if(crush&&pick.r.targetId===c.id)relationDetails.짝사랑=`${pick.other.name}의 시선이 평소보다 오래 머무는 것을 어렴풋이 느끼면서도 아직 그 마음을 확신하지 못하고 있어요.`;
    const romanticDetails={
      카페:[
        `${pick.other.name}가 좋아하는 메뉴를 기억해 주문을 먼저 확인하고, 디저트 접시를 둘 사이로 당겨 함께 나눠 먹고 있어요.`,
        `${pick.other.name}의 잔이 비기 전에 물을 챙겨 주고 가까운 자리에 앉아 오늘 있었던 일을 천천히 듣고 있어요.`,
        `${pick.other.name}의 소매에 묻은 작은 부스러기를 조용히 털어 준 뒤 서로 고른 음료를 한 모금씩 바꾸어 맛보고 있어요.`
      ],
      음식점:[
        `${pick.other.name}가 꺼리는 재료를 먼저 골라 내 주고 좋아하는 반찬은 가까운 쪽으로 밀어 두며 식사를 함께하고 있어요.`,
        `${pick.other.name}의 식사 속도에 맞춰 천천히 먹으면서 맛있었던 메뉴를 기억해 다음에 다시 오자고 이야기하고 있어요.`,
        `${pick.other.name}와 서로 다른 메뉴를 골라 한입씩 나누고, 상대의 접시가 비면 자연스럽게 다음 음식을 챙겨 주고 있어요.`
      ],
      공원:[
        `${pick.other.name}와 보폭을 맞춰 걷다가 경치가 좋은 곳에서 나란히 멈춰 서서 손에 든 음료를 건네고 있어요.`,
        `${pick.other.name}가 관심을 보인 풍경을 함께 바라보며 가까운 길로 천천히 돌아가자고 제안하고 있어요.`,
        `${pick.other.name}의 옷깃을 가볍게 정리해 주고 사람이 적은 산책로를 골라 어깨를 나란히 한 채 걷고 있어요.`
      ],
      영화관:[
        `${pick.other.name}가 보기 편한 자리를 먼저 찾아 주고 음료와 간식을 가운데 두어 함께 집어 먹고 있어요.`,
        `${pick.other.name}와 인상 깊었던 장면을 작은 목소리로 확인하고 영화가 끝난 뒤 더 이야기할 곳을 고르고 있어요.`
      ]
    };
    const romanticPool=romanticDetails[p.type]||[`${pick.other.name}와 나란히 시간을 보내며 서로의 하루를 묻고 있어요.`];
    const romanticDetail=romanticPool[hash(`${pair}:${dayKey(date)}:${p.id}:romantic-detail`)%romanticPool.length];
    const detail=p.type==="공연장"?`${pick.other.name}와 공연을 관람하며 인상적인 장면에 대한 감상을 나누고 있어요.`:romantic?romanticDetail:relationDetails[pick.r.type]||`${pick.other.name}와 이야기를 주고받으며 ${p.name}을 함께 둘러보고 있어요.`;
    return entry(time,action,detail,away(c,{placeId:p.id,itemId:food?.id||drink?.id,withId:pick.other.id,mood:"즐거움",stress:10}));
  }
  return entry(time,`${p.name} 방문`,food?`오늘은 ${food.name}을 골라 식사하고 있어요.`:drink?`${drink.name}을 마시며 잠깐 쉬고 있어요.`:p.type==="공연장"?"공연을 관람하며 무대에 집중하고 있어요.":"가벼운 외출을 즐기고 있어요.",away(c,{placeId:p.id,itemId:food?.id||drink?.id,mood:"평온"}));
}

const RELATION_SCENE_PROFILES={
  친구:{bond:"부담 없이 편을 들어 주는 우정",approach:"격식 없이 먼저 말을 걸고",boundary:"사생활을 캐묻지 않는 선",conflict:"서운한 점은 농담 뒤에 숨기지 않고",memory:"함께 웃었던 사소한 기억"},
  연인:{bond:"서로 선택한 연인의 애정",approach:"상대의 기분과 취향을 먼저 살피고",boundary:"애정과 소유를 구분하는 선",conflict:"사랑한다는 이유로 문제를 덮지 않고",memory:"둘만 알고 있는 데이트의 기억"},
  부부:{bond:"생활과 책임을 함께 꾸리는 부부의 유대",approach:"공동 생활의 다음 일을 자연스럽게 나누고",boundary:"각자의 시간과 재산도 존중하는 선",conflict:"쌓아 두기 전에 생활의 문제를 의논하고",memory:"함께 버텨 온 집과 계절의 기억"},
  "부모·자녀":{bond:"돌봄과 성장으로 이어진 부모자녀의 유대",approach:"대신 결정하기 전에 스스로 말할 기회를 주고",boundary:"나이와 역할이 달라도 인격을 존중하는 선",conflict:"보호와 통제를 혼동하지 않도록 이유를 설명하고",memory:"서로의 성장 과정을 지켜본 기억"},
  "형제·자매":{bond:"투닥거림 아래 남아 있는 형제자매의 유대",approach:"익숙한 말투로 먼저 건드리면서도",boundary:"물건과 비밀은 허락 없이 넘지 않는 선",conflict:"다른 사람 앞에서는 편을 들고 둘만 남아 잘못을 짚으며",memory:"같은 집에서도 서로 다르게 기억하는 어린 시절"},
  동거인:{bond:"한집의 질서를 함께 만드는 동거인의 신뢰",approach:"공용 공간에 필요한 일을 먼저 알리고",boundary:"방·물건·손님에 관한 생활 경계",conflict:"사람을 비난하지 않고 바꾸고 싶은 행동을 말하며",memory:"함께 지켜 온 사소한 생활 규칙"},
  소꿉친구:{bond:"오래된 습관과 현재의 선택이 겹친 우정",approach:"어린 시절부터 알던 버릇을 눈치채고",boundary:"오래 알았다는 이유로 현재의 마음을 단정하지 않는 선",conflict:"옛날 일을 무기처럼 꺼내지 않고",memory:"동네와 학교를 함께 지나온 오래된 기억"},
  "학창 시절 친구들":{bond:"같은 교실을 지나온 동창의 유대",approach:"그 시절 별명보다 지금의 모습을 먼저 보고",boundary:"과거의 서열과 소문을 되살리지 않는 선",conflict:"기억이 다를 때 한쪽의 경험을 지우지 않고",memory:"수업·시험·축제에 얽힌 학창 시절의 기억"},
  "친구 모임":{bond:"여러 친구가 함께 만든 모임의 소속감",approach:"대화에서 빠진 사람이 없는지 살피고",boundary:"모임 밖의 사생활을 평가하지 않는 선",conflict:"편을 갈라 몰아붙이지 않고 당사자의 말을 들으며",memory:"모두 함께 웃었던 모임의 기억"},
  산악회:{bond:"서로의 안전을 맡기는 산행 동료의 신뢰",approach:"날씨와 체력을 먼저 확인하고",boundary:"실력 차이를 자존심 문제로 만들지 않는 선",conflict:"무리한 속도보다 안전한 판단을 우선하며",memory:"같은 길과 정상에서 나눈 기억"},
  "동아리 동료":{bond:"같은 관심사를 함께 키우는 동아리의 유대",approach:"각자의 아이디어와 역할을 먼저 확인하고",boundary:"취미와 성과를 독점하지 않는 선",conflict:"결과보다 과정의 합의를 다시 맞추며",memory:"함께 준비한 활동과 발표의 기억"},
  "직장 동료":{bond:"업무를 믿고 이어 맡기는 동료의 신뢰",approach:"진행 상황과 필요한 정보를 정확히 공유하고",boundary:"퇴근 뒤의 사생활과 업무 책임을 구분하는 선",conflict:"사람이 아니라 일정·근거·역할을 기준으로 조정하며",memory:"어려운 업무를 함께 마무리한 기억"},
  라이벌:{bond:"서로의 성장을 자극하는 경쟁 관계",approach:"상대의 실력을 인정한 뒤 정면으로 도전하고",boundary:"승부 밖의 약점은 이용하지 않는 선",conflict:"결과에 핑계를 대기보다 다음 조건을 분명히 정하며",memory:"간발의 차이로 승패가 갈렸던 기억"},
  혐관:{bond:"쉽게 가까워질 수 없는 날 선 관계",approach:"필요한 말만 정확히 골라 건네고",boundary:"싫어해도 모욕과 위해는 정당화하지 않는 선",conflict:"감정과 사실을 분리해 반박하며",memory:"서로의 경계를 분명히 알게 된 충돌의 기억"},
  기타:{bond:"이름 하나로 설명하기 어려운 두 사람만의 연결",approach:"정해진 역할을 강요하지 않고 반응을 살피며",boundary:"둘이 합의한 방식과 금지선을 존중하는 태도",conflict:"관계의 이름보다 실제로 불편했던 행동을 말하며",memory:"두 사람만 의미를 아는 기억"}
};
const RELATION_SCENE_SEEDS=[
  ["아침 안부를 확인하는 중","밤사이 달라진 일과 오늘의 컨디션을 묻고 대답의 속도에 맞춰 이야기를 이어 가고 있어요.","living"],
  ["함께 먹을 것을 고르는 중","서로 못 먹는 것과 지금 당기는 맛을 확인한 뒤 한 사람의 취향만 따르지 않는 선택을 찾고 있어요.","kitchen"],
  ["외출 시간을 맞추는 중","목적지와 돌아올 시간을 공유하고 각자 준비할 몫을 나눠 불필요하게 기다리지 않게 하고 있어요.","entry"],
  ["잊은 물건을 챙겨 주는 중","상대가 두고 간 물건을 발견해 함부로 열어 보지 않고 찾기 쉬운 곳에 보관했다는 연락을 남겼어요.","entry"],
  ["서로의 하루를 듣는 중","해결책을 서둘러 내놓지 않고 가장 마음에 남은 일이 무엇인지 물으며 끝까지 듣고 있어요.","living"],
  ["조용히 각자의 일을 하는 중","같은 공간에 있어도 대화를 강요하지 않고 필요할 때만 짧게 말을 건네며 집중을 지켜 주고 있어요.","study"],
  ["작은 부탁을 조율하는 중","부탁의 이유와 필요한 시간을 설명하고 지금 어렵다면 거절해도 된다는 여지를 분명히 두었어요.","living"],
  ["예정이 바뀐 일을 알리는 중","갑자기 달라진 계획을 숨기지 않고 먼저 알린 뒤 상대에게 생길 불편을 줄일 방법을 함께 찾고 있어요.","study"],
  ["좋았던 일을 가장 먼저 전하는 중","자랑처럼 들리지 않게 망설이다가도 함께 기뻐해 줄 얼굴이 떠올라 소식을 꺼내고 있어요.","living"],
  ["실수한 부분을 인정하는 중","변명으로 책임을 밀어내지 않고 자기가 놓친 부분과 지금 바로 고칠 수 있는 일을 구체적으로 말했어요.","living"],
  ["서운했던 점을 설명하는 중","상대의 성격을 단정하지 않고 어떤 행동에서 왜 마음이 상했는지를 사건 순서대로 이야기하고 있어요.","living"],
  ["어색한 침묵을 함께 견디는 중","당장 결론을 재촉하지 않고 각자 감정을 정리할 시간이 필요하다는 것을 받아들이고 곁을 지키고 있어요.","living"],
  ["필요한 거리를 묻는 중","가까이 있고 싶은 마음보다 상대가 지금 혼자 쉬고 싶은지를 먼저 확인하고 대답을 존중했어요.","bedroom"],
  ["공동의 문제를 정리하는 중","누가 더 옳은지 겨루기보다 지금 해결해야 할 일과 나중에 이야기할 감정을 따로 나누고 있어요.","study"],
  ["서로 다른 기억을 맞춰 보는 중","자기 기억만 사실이라고 밀어붙이지 않고 같은 사건을 각자 어떻게 겪었는지 차례로 말하고 있어요.","living"],
  ["다른 사람 앞에서 선을 지키는 중","둘 사이의 사적인 이야기와 약속을 허락 없이 공개하지 않고 필요한 설명만 짧게 전했어요.","living"],
  ["위험한 선택을 말리는 중","겁을 주거나 명령하기보다 예상되는 위험과 가능한 대안을 설명하고 최종 선택을 함께 확인하고 있어요.","entry"],
  ["작은 성취를 알아봐 주는 중","결과만 칭찬하지 않고 상대가 오래 애쓴 과정과 전보다 달라진 부분을 정확히 짚어 주었어요.","study"],
  ["다음 약속을 정하는 중","막연히 나중에 보자고 넘기지 않고 둘 다 지킬 수 있는 시간과 변경할 때의 연락 방법을 정했어요.","living"],
  ["하루를 마무리하며 상태를 살피는 중","오늘 못다 한 말을 억지로 끌어내지 않고 쉬기 전에 필요한 것이 있는지만 확인하고 인사를 건넸어요.","bedroom"]
];
function expandedRelationScripts(type,n){
  const profile=RELATION_SCENE_PROFILES[type]||RELATION_SCENE_PROFILES.기타;
  return RELATION_SCENE_SEEDS.map(([title,detail,room],index)=>{
    const shared=`${profile.approach} ${profile.boundary}을 지키고 있어요. ${index%4===0?profile.bond:index%4===1?profile.conflict:index%4===2?profile.memory:"지금 상대가 보이는 반응"}을 가볍게 넘기지 않았어요.`;
    const reciprocal=index%3===0?`상대가 보여 준 ${profile.bond}을 당연하게 여기지 않고 자기 방식으로 응답했어요.`:index%3===1?`${profile.conflict} 둘이 받아들일 수 있는 다음 행동을 정했어요.`:`${profile.memory}을 떠올리면서도 지금 달라진 모습과 선택을 존중했어요.`;
    return [[`${n}와 ${title}`,`${detail} ${shared}`,room],[`${n}와 ${title.replace("확인하는","나누는").replace("고르는","맞추는")}`,`${detail} ${reciprocal}`,room]];
  });
}

function relationSpecificEntry(c,other,r,time,date,role){
  if(r.type==="짝사랑"&&r.directional)role=c.id===r.admirerId?0:1;
  if(r.type==="부모·자녀"&&r.directional)role=c.id===r.parentId?0:1;
  const n=other.name,pools={
    부부:[
      [[`${n}와 집안일을 나누는 중`,"먼저 끝낸 일을 확인하고 상대 몫으로 남겨 둔 것을 말없이 정돈해 주고 있어요.","living"],[`${n}와 집안일을 나누는 중`,"상대가 정리한 곳을 보고 고맙다고 말한 뒤 남은 설거지와 빨래를 맡아 마무리하고 있어요.","kitchen"]],
      [[`${n}와 생활비를 정리하는 중`,"이번 달 지출 내역을 펼쳐 놓고 꼭 필요한 비용과 다음 달에 미룰 것을 차분히 의논하고 있어요.","study"],[`${n}와 생활비를 정리하는 중`,"상대가 읽어 주는 내역을 들으며 빠진 항목을 확인하고 다음 달 예산을 메모하고 있어요.","study"]],
      [[`${n}와 늦은 간식을 나누는 중`,"상대가 좋아하는 간식을 조금 더 챙겨 식탁에 놓고 오늘 있었던 사소한 일을 이야기하고 있어요.","kitchen"],[`${n}와 늦은 간식을 나누는 중`,"건네받은 접시를 가운데 놓고 상대의 하루를 들으며 한입씩 천천히 나눠 먹고 있어요.","kitchen"]]
    ],
    연인:[
      [[`${n}와 다음 데이트를 고르는 중`,"저장해 둔 장소들을 보여 주며 상대가 더 좋아할 만한 곳을 먼저 물어보고 있어요.","living"],[`${n}와 다음 데이트를 고르는 중`,"상대가 보여 주는 후보를 하나씩 살펴보고 같이 하고 싶은 일을 솔직하게 덧붙이고 있어요.","living"]],
      [[`${n}의 사진을 골라 주는 중`,"함께 찍은 사진을 넘겨 보며 상대가 가장 자연스럽게 웃은 장면에 표시하고 있어요.","living"],[`${n}와 함께 찍은 사진을 보는 중`,"상대가 고른 사진을 확대해 보고 그때 나눴던 이야기를 떠올리며 웃고 있어요.","living"]],
      [[`${n}에게 애정을 표현하는 중`,"말로 길게 설명하는 대신 상대가 좋아하는 것을 곁에 조용히 놓아 두고 반응을 살피고 있어요.","living"],[`${n}의 애정 표현을 알아차린 중`,"자기 취향을 기억해 준 것을 알아보고 가까이 앉아 작게 고맙다고 말하고 있어요.","living"]]
    ],
    짝사랑:[
      [[`${n}를 은근히 챙기는 중`,"티가 너무 나지 않게 필요한 물건을 가까이에 놓아 주고 아무렇지 않은 척 다른 곳을 보고 있어요.","living"],[`${n}의 호의를 눈치채는 중`,"우연이라고 하기엔 세심한 배려를 발견하고 잠시 상대의 표정을 살피고 있어요.","living"]],
      [[`${n}에게 보낼 말을 고민하는 중`,"메시지를 썼다가 너무 다정해 보일까 지우고 자연스러운 문장으로 다시 고치고 있어요.","study"],[`${n}의 메시지를 확인하는 중`,"평범한 내용인데도 몇 번 다시 읽은 뒤 너무 늦지 않게 답장을 보내고 있어요.","living"]],
      [[`${n}의 취향을 기억해 둔 중`,"스쳐 지나가듯 들었던 취향을 정확히 기억해 필요한 물건 옆에 놓아 주고, 왜 기억했는지는 스스로도 설명하지 못하고 있어요.","living"],[`${n}의 뜻밖의 배려를 발견한 중`,"한 번 말했을 뿐인 취향까지 기억한 것을 보고 고맙다고 하면서도 왜 이렇게 세심한지 궁금해하고 있어요.","living"]],
      [[`${n}의 곁을 자꾸 지나치는 중`,"딱히 볼일은 없는데도 상대가 있는 방을 몇 번 오가다가, 필요한 게 있었던 것처럼 주변 물건을 하나 집어 들었어요.","living"],[`${n}가 자꾸 근처를 지나는 걸 보는 중`,"같은 사람이 몇 번이나 주변을 맴도는 것을 알아차렸지만 무슨 말을 꺼내려는지 기다리며 모른 척하고 있어요.","living"]],
      [[`${n}의 표정을 먼저 살피는 중`,"좋은 소식을 들었는데 자기 기분보다 상대가 어떻게 받아들였는지부터 확인했어요. 왜 그 반응이 중요한지는 아직 생각해 보지 않았어요.","living"],[`${n}의 시선을 마주친 중`,"자기 반응을 기다리던 시선과 마주치자 상대가 황급히 다른 곳을 보는 모습을 조용히 기억해 두었어요.","living"]],
      [[`${n}를 편들고도 이유를 모르는 중`,"평소라면 넘어갔을 말에 유독 빠르게 반박하고 상대 편을 들었어요. 공정하지 못한 상황이 싫었을 뿐이라고 스스로 납득하고 있어요.","living"],[`${n}가 자기 편을 드는 걸 지켜본 중`,"부탁하지 않았는데도 먼저 나서 준 것이 의외라서 고마움과 당황스러움을 함께 느끼고 있어요.","living"]],
      [[`${n}의 빈자리를 의식하는 중`,"하던 일에 집중하려는데 평소 있던 자리가 비어 있는 것이 자꾸 눈에 들어와요. 단지 집이 조용해서 그렇다고 생각하고 있어요.","study"],[`${n}가 평소보다 조용한 걸 살피는 중`,"자기가 돌아온 뒤에야 상대가 다시 하던 일에 집중하는 모습을 보고 조금 이상하다고 생각하고 있어요.","living"]]
    ],
    친구:[
      [[`${n}와 장난을 주고받는 중`,"상대만 알아들을 오래된 농담을 꺼내고 웃음을 참는 표정을 보며 한마디를 더 얹고 있어요.","living"],[`${n}의 장난에 받아치는 중`,"질 수 없다는 듯 예전 실수를 꺼내 맞받아치고 결국 둘 다 웃음을 터뜨리고 있어요.","living"]],
      [[`${n}에게 속마음을 털어놓는 중`,"다른 사람에게는 말하지 못한 걱정을 꺼내며 해결책보다 자기 편이 되어 달라고 말하고 있어요.","living"],[`${n}의 속마음을 듣는 중`,"중간에 판단하지 않고 끝까지 들은 뒤 상대가 잘못한 게 아니라며 단단하게 편들어 주고 있어요.","living"]]
    ],
    "직장 동료":[
      [[`${n}와 업무를 인계하는 중`,"진행 상황과 주의할 부분을 짧고 정확하게 정리해 상대가 바로 이어서 할 수 있게 설명하고 있어요.","study"],[`${n}에게 업무를 인계받는 중`,"중요한 부분을 메모하고 애매한 조건을 다시 물어 실수가 없도록 확인하고 있어요.","study"]],
      [[`${n}와 퇴근 후 하소연하는 중`,"오늘 있었던 답답한 일을 조심스럽게 꺼내며 상대가 공감하는 대목에서 목소리를 낮추고 있어요.","kitchen"],[`${n}의 직장 이야기를 듣는 중`,"고개를 끄덕이며 상황을 정리해 주고 내일 덜 힘들 방법을 현실적으로 제안하고 있어요.","kitchen"]]
    ],
    "부모·자녀":[
      [[`${n}의 아침 상태를 살피는 중`,"잘 잤는지 묻고 얼굴빛과 체온을 살핀 뒤 오늘 필요한 준비물을 함께 확인하고 있어요.","bedroom"],[`${n}에게 아침 인사를 하는 중`,"잠이 덜 깬 목소리로 밤새 있었던 일을 이야기하고 오늘 무엇을 할지 묻고 있어요.","bedroom"]],
      [[`${n}의 식사를 챙기는 중`,"나이와 입맛에 맞는 양을 덜어 주고 천천히 먹도록 물과 수저를 가까이에 놓고 있어요.","kitchen"],[`${n}와 함께 식사하는 중`,"챙겨 준 음식을 먹으며 오늘 있었던 일과 궁금한 것을 하나씩 이야기하고 있어요.","kitchen"]],
      [[`${n}의 준비물을 확인하는 중`,"빠뜨린 것이 없는지 목록을 읽어 주고 혼자 챙길 수 있는 것은 기다려 주며 지켜보고 있어요.","entry"],[`${n} 앞에서 가방을 챙기는 중`,"혼자 할 수 있다고 말하며 물건을 넣다가 헷갈리는 부분만 조심스럽게 물어보고 있어요.","entry"]],
      [[`${n}에게 생활 습관을 가르치는 중`,"무조건 대신 해 주지 않고 왜 필요한 일인지 설명한 뒤 옆에서 한 단계씩 함께 해 보고 있어요.","living"],[`${n}에게 혼자 해낸 것을 보여 주는 중`,"서툴지만 끝까지 해낸 결과를 들고 와 잘했는지 기대하는 표정으로 바라보고 있어요.","living"]],
      [[`${n}와 숙제와 공부를 하는 중`,"정답을 바로 알려 주지 않고 막힌 부분을 질문으로 나누어 스스로 답을 찾도록 돕고 있어요.","study"],[`${n}에게 모르는 것을 물어보는 중`,"어디서부터 헷갈렸는지 설명하고 힌트를 들은 뒤 자기 방식으로 다시 풀어 보고 있어요.","study"]],
      [[`${n}를 달래는 중`,"속상한 이유를 재촉하지 않고 곁에 앉아 진정할 때까지 등을 천천히 쓸어 주고 있어요.","living"],[`${n}에게 속상한 마음을 털어놓는 중`,"처음에는 괜찮다고 했다가 안전하다고 느끼자 참았던 말을 조금씩 꺼내고 있어요.","living"]],
      [[`${n}와 외출 준비를 하는 중`,"날씨에 맞는 옷을 골라 주고 길에서 지켜야 할 약속을 다시 확인한 뒤 손을 내밀고 있어요.","entry"],[`${n}와 나갈 준비를 하는 중`,"자기가 고른 옷과 가져갈 물건을 보여 주고 빠뜨린 것이 없는지 마지막으로 확인받고 있어요.","entry"]],
      [[`${n}의 늦은 귀가를 기다린 중`,"연락이 늦어 걱정했던 마음을 감추지 못하면서도 먼저 무사히 돌아온 것을 확인하고 있어요.","entry"],[`${n}에게 늦은 이유를 설명하는 중`,"걱정하게 만든 것을 알아 먼저 미안하다고 말하고 어디에서 무엇을 했는지 차근차근 이야기하고 있어요.","entry"]]
    ],
    "형제·자매":[
      [[`${n}와 어릴 적 기억을 맞춰 보는 중`,"같은 일을 서로 다르게 기억해 누가 맞는지 실랑이하다가, 결국 둘 다 놓친 부분이 있었다는 걸 알아내고 웃고 있어요.","living"],[`${n}와 옛날 사진을 보는 중`,"사진 속 표정과 옷을 하나씩 지적하며 그날 있었던 일을 자기 시점에서 다시 들려주고 있어요.","living"]],
      [[`${n}의 물건을 허락받고 빌리는 중`,"예전처럼 마음대로 가져가지 않고 먼저 필요한 시간을 말한 뒤 돌려놓을 자리를 확인했어요.","bedroom"],[`${n}에게 물건을 빌려주는 중`,"언제까지 쓸 건지 물으면서도 망가뜨리지 말라는 익숙한 잔소리와 함께 건네고 있어요.","bedroom"]],
      [[`${n}와 집안일 순서를 두고 협상 중`,"먼저 태어난 순서가 특권은 아니라며 오늘 할 일을 공평하게 다시 나누고 있어요.","kitchen"],[`${n}와 집안일을 나누는 중`,"지난번 분담까지 기억해 이번에는 자기가 덜 했던 일을 맡겠다고 말하고 있어요.","kitchen"]],
      [[`${n}의 편을 들면서도 잘못은 짚는 중`,"다른 사람 앞에서는 먼저 편을 들었지만 둘만 남자 잘못한 부분은 분명히 이야기했어요.","living"],[`${n}의 솔직한 지적을 듣는 중`,"기분은 조금 상했지만 무조건 감싸기보다 사실대로 말해 주는 관계라는 걸 알아 끝까지 듣고 있어요.","living"]],
      [[`${n}와 부모 이야기를 조심스럽게 나누는 중`,"서로 혈연과 성장 배경이 완전히 같지 않을 수 있다는 점을 존중하며 자기가 기억하는 가족 이야기를 강요하지 않았어요.","living"],[`${n}의 가족 기억을 듣는 중`,"자기 경험과 다른 부분을 바로 반박하지 않고, 같은 집안에서도 서로 다르게 자랐다는 것을 받아들이며 듣고 있어요.","living"]],
      [[`${n}에게 먼저 연락할 구실을 찾는 중`,"별일은 아니지만 한동안 말이 없었던 것이 신경 쓰여 필요한 물건을 핑계로 짧은 메시지를 보냈어요.","study"],[`${n}의 어색한 연락을 확인한 중`,"용건만 적힌 메시지에서 안부를 묻고 싶은 마음을 알아차리고 먼저 요즘 어떻게 지내는지 답했어요.","study"]]
    ],
    동거인:[
      [[`${n}와 공용 공간 규칙을 정하는 중`,"냉장고 칸과 욕실 사용 시간, 손님을 부를 때 알리는 방법을 하나씩 합의하고 있어요.","living"],[`${n}와 생활 규칙을 맞추는 중`,"불편했던 점을 사람에 대한 비난이 아니라 바꾸고 싶은 행동으로 설명하고 있어요.","living"]],
      [[`${n}와 공과금을 정산하는 중`,"사용한 금액을 함께 확인하고 애매한 항목은 반으로 나눌지 사용량대로 낼지 차분히 정하고 있어요.","study"],[`${n}에게 정산 내역을 보내는 중`,"빠진 비용이 없는지 다시 확인한 뒤 부담되지 않도록 납부 날짜도 함께 알려 주고 있어요.","study"]],
      [[`${n}와 냉장고 음식을 구분하는 중`,"함께 먹어도 되는 것과 개인 몫을 표시하고, 실수로 먹었을 때 어떻게 채워 둘지도 정했어요.","kitchen"],[`${n}와 장보기 목록을 합치는 중`,"각자 살 물건과 공용으로 살 물건을 나눠 적으며 중복 구매를 피하고 있어요.","kitchen"]],
      [[`${n}가 늦게 들어올 때 조명을 남겨 둔 중`,"아직 아주 친하지는 않지만 어두운 현관이 불편하지 않도록 작은 조명만 켜 두었어요.","entry"],[`${n}가 남겨 둔 불빛을 발견한 중`,"부담스럽게 기다린 것은 아니라는 걸 알면서도 조용한 배려를 기억해 두고 있어요.","entry"]],
      [[`${n}와 각자 시간을 존중하며 쉬는 중`,"같은 거실에 있으면서도 대화를 강요하지 않고 각자 하던 일에 집중하고 있어요.","living"],[`${n}와 편안한 침묵을 나누는 중`,"필요할 때만 짧게 말을 건네며 함께 살아도 혼자 쉴 수 있는 거리를 지키고 있어요.","living"]],
      [[`${n}와 야식을 나누는 중`,"처음에는 자기 몫만 준비했다가 자연스럽게 한 사람분을 더 꺼내 취향을 물었어요.","kitchen"],[`${n}가 건넨 야식을 받는 중`,"고맙다고 답하며 다음에는 자기가 준비하겠다고 말하고 식탁 맞은편에 앉았어요.","kitchen"]],
      [[`${n}를 가족처럼 챙기면서도 선을 묻는 중`,"오래 함께 살며 정이 깊어졌지만 당연히 개입하지 않고 도움이 필요한지 먼저 물었어요.","living"],[`${n}의 오래된 배려를 받아들이는 중`,"생활 습관을 먼저 알아차리는 모습에 가족 같은 익숙함을 느끼면서도 고마움을 말로 전했어요.","living"]]
    ],
    라이벌:[
      [[`${n}와 결과를 비교하는 중`,"상대가 잘한 부분은 인정하면서도 다음에는 자기가 앞설 거라며 세부 기록을 다시 확인하고 있어요.","study"],[`${n}의 도전을 받아치는 중`,"여유로운 척 웃으며 자기 방식의 장점을 설명하고 다음 승부 조건을 먼저 제안하고 있어요.","study"]]
    ],
    혐관:[
      [[`${n}와 날 선 대화를 나누는 중`,"상대의 말에서 모순을 짚어 내며 물러서지 않지만 넘지 말아야 할 선은 간신히 지키고 있어요.","living"],[`${n}의 지적에 반박하는 중`,"바로 표정을 굳히고 근거부터 다시 대라며 차갑게 맞받아치고 있어요.","living"]]
    ]
  };
  for(const type of Object.keys(RELATION_SCENE_PROFILES))pools[type]=[...(pools[type]||[]),...expandedRelationScripts(type,n)];
  const unaware=r.type==="짝사랑"&&/무자각|자기 감정을 모르는|호감이라고만|자꾸 신경/.test(r.stage||"");
  if(unaware){
    const introverted=/수줍|내향|혼자|아싸|사람이 싫/.test(c.socialStyle||"");
    pools.짝사랑.push(introverted
      ?[[`${n}에게 말을 걸 이유를 찾는 중`,"꼭 확인할 필요가 없는 것을 몇 번이나 문장으로 만들었다가 삼켰어요. 가까이 있고 싶다는 생각은 아직 떠올리지 못한 채 조용히 같은 방에 머물고 있어요.","living"],[`${n}가 말을 망설이는 걸 기다리는 중`,"무언가 말하려다 멈추는 모습을 알아차리고 먼저 재촉하지 않은 채 상대가 편해질 때까지 기다리고 있어요.","living"]]
      :[[`${n}를 자연스럽게 자기 일에 끌어들이는 중`,"혼자 해도 될 일인데 가장 먼저 상대를 불러 같이 하자고 했어요. 다른 사람보다 이 사람과 있으면 즐거운 이유는 깊이 생각하지 않고 있어요.","living"],[`${n}의 잦은 제안을 받아들이는 중`,"사소한 일마다 자기를 먼저 찾는 것이 조금 의아하지만 즐거워 보여서 이번에도 함께하기로 했어요.","living"]]);
  }
  const behaviorPools={
    "병원 같이 가기":[[`${n}와 병원에 갈 준비 중`,"예약 시간과 필요한 서류를 확인하고 상대가 불안하지 않도록 옆에서 천천히 준비를 돕고 있어요.","entry"],[`${n}와 병원에 갈 준비 중`,"함께 가 주겠다는 말에 안심하면서 증상과 물어볼 내용을 휴대전화에 적고 있어요.","entry"]],
    "간섭하기":[[`${n}의 일에 참견하는 중`,"상대가 그냥 넘기려는 부분을 짚어 내고 지금 바로 고쳐야 한다며 끈질기게 이야기하고 있어요.","living"],[`${n}의 간섭에 맞서는 중`,"도움과 통제는 다르다고 선을 그으면서도 상대가 걱정하는 이유는 끝까지 듣고 있어요.","living"]],
    "스킨십하기":[[`${n}와 다정히 붙어 있는 중`,"지나가며 자연스럽게 어깨를 감싸고 상대의 체온을 느끼며 잠시 그대로 머물러 있어요.","living"],[`${n}의 곁에 기대는 중`,"익숙하게 가까이 다가가 팔이 닿는 거리에 기대어 편안히 숨을 고르고 있어요.","living"]],
    "아플 때 돌보기":[[`${n}를 돌보는 중`,"체온과 약 먹을 시간을 확인하고 부담 없이 먹을 음식과 물을 가까이에 두고 있어요.","bedroom"],[`${n}의 돌봄을 받는 중`,"괜찮다고 말하면서도 정성껏 챙겨 둔 물과 약을 받아 들고 얌전히 쉬고 있어요.","bedroom"]],
    "말다툼하기":[[`${n}와 의견이 부딪힌 중`,"감정이 앞서려는 순간 말을 멈추고 무엇이 서운했는지 구체적으로 다시 설명하고 있어요.","living"],[`${n}에게 반박하는 중`,"일방적으로 넘기지 않으려고 자기 입장을 분명히 말하고 상대의 답을 기다리고 있어요.","living"]],
    "화해하기":[[`${n}에게 먼저 화해를 건네는 중`,"어색한 침묵을 끝내려고 잘못한 부분을 먼저 인정하고 다시 이야기하자고 손을 내밀고 있어요.","living"],[`${n}의 사과를 받아들이는 중`,"아직 남은 서운함을 솔직히 말하면서도 관계를 풀고 싶은 마음으로 곁에 앉고 있어요.","living"]],
    "데려다주기":[[`${n}를 데려다줄 준비 중`,"목적지와 돌아올 시간을 확인한 뒤 안전하게 함께 움직이려고 차 키와 겉옷을 챙기고 있어요.","entry"],[`${n}와 함께 나갈 준비 중`,"혼자 가도 된다고 했다가 상대의 단호한 표정을 보고 필요한 물건을 챙겨 현관으로 나오고 있어요.","entry"]],
    "결투하기":[[`${n}에게 결투를 신청하는 중`,"서로 납득할 규칙과 승부 조건을 먼저 정한 뒤 정면으로 실력을 겨뤄 보자고 도전하고 있어요.","living"],[`${n}의 결투를 받아들이는 중`,"무모하게 달려들지 않고 상대의 자세와 장비를 살핀 뒤 공정한 승부라면 피하지 않겠다고 답하고 있어요.","living"]],
    "훈련하기":[[`${n}와 합동 훈련 중`,"상대의 움직임을 지켜보다 빈틈을 짚어 주고 같은 동작을 속도를 바꿔 반복하고 있어요.","living"],[`${n}와 합동 훈련 중`,"조언받은 자세를 바로 고쳐 보고 이번에는 상대의 약점을 발견해 되돌려 주고 있어요.","living"]],
    "게임 대결하기":[[`${n}와 게임으로 승부하는 중`,"익숙한 전략을 숨긴 채 결정적인 순간을 기다리며 상대의 선택을 유심히 보고 있어요.","study"],[`${n}의 전략에 맞서는 중`,"상대가 노리는 수를 눈치채고 예상 밖의 선택으로 흐름을 뒤집으려 하고 있어요.","study"]],
    "내기하기":[[`${n}와 작은 내기를 하는 중`,"진 사람이 할 일을 정하고 서로 조건을 바꾸지 않기로 확인한 뒤 승부를 시작하고 있어요.","living"],[`${n}의 내기를 받아들이는 중`,"자신 있다는 표정으로 조건을 한 번 더 확인하고 먼저 시작하라고 손짓하고 있어요.","living"]],
    "함께 사건 조사하기":[[`${n}와 단서를 맞춰 보는 중`,"각자 발견한 사실을 시간 순서로 늘어놓고 서로 모순되는 지점을 표시하고 있어요.","study"],[`${n}와 사건을 조사하는 중`,"상대가 놓친 작은 흔적을 찾아 보여 주고 다음에 확인할 장소를 함께 정하고 있어요.","study"]],
    "작전 짜기":[[`${n}와 작전을 세우는 중`,"가능한 변수와 실패했을 때의 퇴로까지 짚어 보며 역할을 구체적으로 나누고 있어요.","study"],[`${n}의 작전을 검토하는 중`,"위험한 부분을 바로 지적하고 자기 장점을 살릴 수 있는 대안을 덧붙이고 있어요.","study"]],
    "함께 사는 존재 돌보기":[[`${n}와 집의 작은 식구를 돌보는 중`,"먹이와 물, 햇빛과 주변 환경을 확인하며 서로 할 일을 자연스럽게 나누고 있어요.","living"],[`${n}와 집의 작은 식구를 돌보는 중`,"상대가 상태를 살피는 동안 필요한 물건을 정리하고 편안한 자리를 마련하고 있어요.","living"]],
    "기념일 챙기기":[[`${n}와 기념일을 준비하는 중`,"상대가 부담스러워하지 않으면서도 기억에 남을 작은 선물과 시간을 고르고 있어요.","study"],[`${n}가 준비한 기념일을 알아차린 중`,"아무렇지 않은 척하던 상대의 준비를 눈치채고 기쁜 표정을 숨기지 못하고 있어요.","living"]],
    "비밀 공유하기":[[`${n}에게 비밀을 털어놓는 중`,"다른 사람에게는 말하지 말아 달라고 당부한 뒤 오래 마음에 담아 둔 이야기를 조심스럽게 꺼내고 있어요.","living"],[`${n}의 비밀을 듣는 중`,"놀란 기색을 누르고 끝까지 들은 뒤 허락 없이 누구에게도 말하지 않겠다고 약속하고 있어요.","living"]],
    "마중 나가기":[[`${n}를 마중 나갈 준비 중`,"도착 시간을 다시 확인하고 너무 늦지 않게 만나기 위해 겉옷을 챙겨 현관으로 향하고 있어요.","entry"],[`${n}의 마중 연락을 확인한 중`,"혼자 돌아오지 않아도 된다는 말에 안심하고 정확한 도착 장소를 답장하고 있어요.","entry"]],
    "위험에서 보호하기":[[`${n}를 보호하는 중`,"위험한 쪽을 먼저 확인하고 상대를 자기 뒤로 물린 뒤 안전한 이동 경로를 찾고 있어요.","entry"],[`${n}의 보호를 받는 중`,"무리하지 말라고 말하면서도 지시에 맞춰 몸을 낮추고 주변의 다른 위험을 살피고 있어요.","entry"]]
  };
  const enabled=[];
  if(enabled.length){
    const behavior=enabled[hash(`${r.id}:${dayKey(date)}:behavior`)%enabled.length],script=behaviorPools[behavior][role];
    return homeEntry(c,time,script[0],personalityFlavor(c,script[1],`behavior:${behavior}:${role}`,date),script[2]);
  }
  const fullPool=pools[r.type]||[[[`${n}와 근황을 나누는 중`,"최근 관심 있는 일과 달라진 생활을 이야기하며 상대의 반응을 살피고 있어요.","living"],[`${n}의 근황을 듣는 중`,"궁금한 부분을 자연스럽게 되묻고 자기 이야기도 하나씩 꺼내고 있어요.","living"]]];
  const filteredPool=safePlayfulPair(c,other,r)?fullPool:fullPool.filter(scenario=>!scenario.some(scene=>/장난|놀리|농담|예전 실수/.test(`${scene[0]} ${scene[1]}`)));
  const pool=filteredPool.length?filteredPool:fullPool;
  const scenario=pool[hash(`${[c.id,other.id].sort().join(":")}:${r.type}:${dayKey(date)}:relation-scene`)%pool.length],script=scenario[role];
  const tone=c.socialStyle==="낯을 가림"?" 말은 짧지만 자리를 피하지 않고 곁에 머물러 있어요.":c.decisionStyle==="공감 우선"?" 상대의 표정과 말투가 달라질 때마다 속도를 맞추고 있어요.":c.interference==="강하게 간섭함"||c.interference==="통제광"?" 자기 방식이 더 낫다고 확신해 상대의 선택에도 적극적으로 관여하고 있어요.":"";
  const ages=["영아","유아","어린이","청소년","청년","성인","중년","장년","노년"],ageGap=ages.indexOf(c.ageGroup)-ages.indexOf(other.ageGroup);
  const ageTone=ageGap>=2?" 나이가 더 많은 쪽답게 단정 짓기보다 상대가 스스로 말할 때까지 기다리려 하고 있어요.":ageGap<=-2?" 나이 차이를 의식하면서도 일방적으로 기대기보다 자기 생각을 분명히 전하려 하고 있어요.":c.ageGroup===other.ageGroup?" 비슷한 세대라 통하는 표현과 경험을 자연스럽게 꺼내고 있어요.":"";
  const kinshipTone=r.type==="부모·자녀"&&r.kinship==="nonblood"?" 혈연으로 이어지지는 않았지만 함께 쌓은 시간과 선택한 가족 역할을 가볍게 여기지 않아요.":r.type==="부모·자녀"?" 서로 닮은 점을 당연한 기준으로 삼지 않고 각자의 성격을 따로 존중하고 있어요.":"";
  const siblingOrderTone=r.type==="형제·자매"?(()=>{const mine=Number(r.siblingOrder?.[c.id])||0,theirs=Number(r.siblingOrder?.[other.id])||0,kinship=r.siblingKinshipByPair?.[[c.id,other.id].sort().join("~")]||"full";return `${mine&&theirs?(mine<theirs?" 먼저 태어났다는 이유로 명령하지 않고 필요한 경험만 나누려 해요.":" 나중에 태어났어도 자기 몫과 의견을 분명하게 말하고 있어요."):""} ${kinship==="nonblood"?"혈연은 아니지만 서로를 형제로 선택해 살아온 시간을 중요하게 여겨요.":kinship==="half"?"한쪽 부모만 같아 서로 다른 성장 경험도 가족사의 일부로 존중하고 있어요.":""}`})():"";
  return homeEntry(c,time,script[0],personalityFlavor(c,script[1]+tone+ageTone+kinshipTone+siblingOrderTone+respectfulAccessibilityFor(other,`specific:${r.type}:${role}`,date),`specific:${r.type}:${role}`,date),script[2]);
}

function relationshipHomeEntry(c,pick,time,date){
  const {r,other}=pick,pair=[c.id,other.id].sort(),role=r.type==="짝사랑"&&r.directional?(c.id===r.admirerId?0:1):pair.indexOf(c.id);
  const directedView=characterViewFor(c.id,other.id);
  const {overall="",awareness="",mutualAwareness="",trust="",closeness="",comfort="",annoyance="",attention="",jealousy="",conflictIntensity="",expectation="",aggression=""}=directedView;
  const otherView=characterViewFor(other.id,c.id);
  const combinedTypes=r.types||[r.type];
  const combinedTone=combinedTypes.length>1?combinedTypes.includes("연인")&&combinedTypes.includes("직장 동료")?" 직장에서는 동료의 선을 지키고, 사적인 자리에서만 연인의 말투로 돌아오고 있어요.":combinedTypes.includes("연인")&&combinedTypes.includes("소꿉친구")?" 오래 알고 지낸 습관과 연인으로서의 애정이 자연스럽게 함께 묻어나요.":` 두 사람 사이의 ${combinedTypes.join("·")} 관계가 한 장면 안에서 함께 드러나고 있어요.`:"";
  const thought=[overall,mutualAwareness,trust,comfort,annoyance,attention,conflictIntensity,expectation,aggression].filter(Boolean).join(" ");
  const loving=/좋아|사랑|소중|없어서는/.test(overall);
  const hating=/싫어|경계|불편/.test(overall);
  const unaware=/어렴풋|착각|전혀 모름|부정/.test(awareness);
  const touchAverse=/극도로 꺼림|닿는 것을 싫어/.test(c.touchReaction||"");
  const likesTouch=/접촉을 좋아|먼저 다가가는/.test(c.touchReaction||"");
  const otherTouchAverse=/극도로 꺼림|닿는 것을 싫어/.test(other.touchReaction||"");
  const touchLevels=["신체 접촉 없음","인사·부축 같은 의례적 접촉만","손잡기·팔짱까지","포옹·기대기까지","가벼운 입맞춤까지","깊은 입맞춤까지","성인 간 친밀한 접촉까지"];
  const ownTouch=directedView.touchIntensity||"신체 접촉 없음",otherTouch=otherView.touchIntensity||"신체 접촉 없음";
  const ownTouchIndex=Math.max(0,touchLevels.indexOf(ownTouch)),otherTouchIndex=Math.max(0,touchLevels.indexOf(otherTouch));
  const touchIntensity=touchLevels[Math.min(ownTouchIndex,otherTouchIndex)];
  const avoidsTouch=ownTouchIndex===0||otherTouchIndex===0;
  const welcomesTouch=!avoidsTouch&&Math.min(ownTouchIndex,otherTouchIndex)>=2;
  const distrust=/전혀 믿지|의심|조심스럽게 지켜봄/.test(trust);
  const distant=/남보다도 멂|낯선|거리감/.test(closeness);
  const uncomfortable=/매우 불편|긴장|조심스러움|숨 막힘|공간 공유는 불편/.test(comfort);
  const attentive=/자주 살핌|늘 최우선/.test(attention);
  const jealous=/은근히 질투|질투가 심함|독점/.test(jealousy);
  const nonPossessive=/질투하지 않음/.test(jealousy);
  const suffocating=/숨 막힘|공간 공유는 불편/.test(comfort);
  const goodRapport=/농담과 장난은 잘 통함|대화는 편안함|농담과 장난이 잘 통함|공간도 대화도 완벽/.test(comfort);
  const endingSoon=/언제든 끝날 수 있다고 생각함|곧 헤어질 거라고 예상함/.test(expectation);
  const aggressive=!/없음|전혀 느끼지|행동하지 않|스스로 멈춤/.test(aggression)&&/몸으로 밀어내고 싶은 충동|해치고 싶은 충동|죽이고 싶을 만큼 격한 충동/.test(aggression);
  const highConflict=/자주 충돌함|격렬하게 충돌함|파국적인 충돌을 반복함/.test(conflictIntensity);
  const siblingRelation=combinedTypes.includes("형제·자매")||r.type==="형제·자매";
  const romanticFeeling=/연애 감정|깊이 사랑|없어서는/.test(overall);
  const otherLoving=/연애 감정|깊이 사랑|없어서는/.test(otherView.overall||"");
  const officialRomance=combinedTypes.some(type=>["연인","부부"].includes(type));
  const familyRelation=combinedTypes.some(type=>["부모·자녀","형제·자매"].includes(type));
  const confirmedFeelings=/서로의 마음을 확인함/.test(mutualAwareness)&&/서로의 마음을 확인함/.test(otherView.mutualAwareness||"");
  const mutualLonging=!officialRomance&&!familyRelation&&romanticFeeling&&otherLoving&&!confirmedFeelings;
  const nearlyDating=!officialRomance&&!familyRelation&&romanticFeeling&&otherLoving&&confirmedFeelings;
  const nominalDating=officialRomance&&(!romanticFeeling||!otherLoving||avoidsTouch||distant);
  const bothAdults=![c,other].some(character=>["영아","유아","어린이","청소년"].includes(character.ageGroup));
  const unlabeledIntimacy=!officialRomance&&!familyRelation&&bothAdults&&confirmedFeelings&&welcomesTouch&&!endingSoon&&(/가까운 사이|가장 가까운/.test(closeness)||/가까운 사이|가장 가까운/.test(otherView.closeness||""));
  const hasPartner=relationList().some(relation=>relation.temporalStatus!=="past"&&["연인","부부"].includes(relation.type)&&(relation.a===c.id||relation.b===c.id));
  const openness=c.relationshipOpenness||"설정하지 않음 · 절대 끌리지 않음";
  const opennessAllows=openness==="연인이 있어도 취향이면 끌릴 수 있음"||(!hasPartner&&openness==="연인이 없을 때만 취향이면 끌림");
  const attractionAllowed=opennessAllows&&!(c.attractedGenders||[]).includes("없음")&&(c.attractedGenders||[]).includes(other.gender);
  const otherTraits=[...(other.appearanceTags||[]),...(other.bodyProfile?.physicalTraits||[]),...appearanceTraitTags(other),other.bodyProfile?.bodySize,other.job,other.jobTitle,other.wealth,/의사|변호사|교수|연구|회계사|건축|약사|간호사|전문/.test(`${other.job||""} ${other.jobTitle||""}`)?"전문직":"",/예술|화가|작가|음악|배우|디자이너/.test(`${other.job||""} ${other.jobTitle||""}`)?"예술가 기질":"",/교사|군인|경찰|소방|승무원/.test(`${other.job||""} ${other.jobTitle||""}`)?"제복이 어울림":""].filter(Boolean);
  const matchedLooks=(c.attractionTraits||[]).filter(tag=>otherTraits.includes(tag));
  const noticesLooks=/꽤 중요하게 봄|외모에 크게 끌림/.test(c.appearanceInterest||"");
  const visuallyDrawn=attractionAllowed&&noticesLooks&&(matchedLooks.length||/매력적임|매우 아름답거나 잘생김|시선을 사로잡음/.test(other.appearanceLevel||""));
  const otherEyes=eyeLookPhrase(other),otherHair=hairLookPhrase(other),selfHair=hairLookPhrase(c);
  const otherAnnoyed=/종종 귀찮|많이 귀찮|보기만 해도 피곤|자주 성가|부담/.test(otherView.annoyance||"");
  const reactsAngrily=/바로 따짐|끝까지 결론/.test(c.conflictStyle||"")&&/쉽게 욱함|거의 참지 않음/.test(c.impulseControl||"");
  const playfulSafe=safePlayfulPair(c,other,r);
  const personalityText=[...(c.personalityTypes||[]),c.socialStyle,c.decisionStyle,c.emotionalExpression].filter(Boolean).join(" ");
  const kindAndExtroverted=/다정|친절|배려|세심|온화|공감/.test(personalityText)&&/외향|사교|활발|먼저 다가|무리의 중심/.test(personalityText);
  const appearanceApproachSafe=!hating&&!uncomfortable&&!distrust&&!distant&&!highConflict;
  const hairTeasingConflict=!!selfHair&&highConflict&&otherAnnoyed&&reactsAngrily&&playfulSafe;
  const interferenceBoost={방관자:-22,"요청할 때만 도움":-5,"적당히 관여":0,"챙기고 확인함":8,"강하게 간섭함":20,통제광:34}[c.interference]||0;
  const conflict=Math.max(0,+(r.conflict||0)+interferenceBoost),intimacy=+(r.intimacy||0);
  let scripts;
  if(r.temporalStatus==="past"){
    const faultName=r.faultParty==="both"?"두 사람 모두":r.faultParty==="none"?"누구도":state.characters[r.faultParty]?.name||"누구인지 정하지 않은 쪽";
    const reason=r.faultReason&&r.faultReason!=="정하지 않음"?`${r.faultReason} 때문에`:"여러 사정으로";
    const presentFeeling=/사랑|좋아/.test(overall)?"마음이 남아 있어도":/싫|혐오|증오/.test(overall)?"반감이 아직 남아 있어도":"지금은 감정이 크지 않아도";
    const faultBeat=/금전|빚|과소비|재산|수입/.test(r.faultReason||"")
      ?`${presentFeeling} 돈을 빌리거나 대신 결제하는 일은 하지 않았고, 공동 비용과 남은 물건만 기록을 확인하며 정리했어요.`
      :/거짓말|은폐|신뢰/.test(r.faultReason||"")
        ?`${presentFeeling} 설명을 곧바로 믿지 않고 확인 가능한 사실과 약속만 기준으로 대화를 이어 갔어요.`
        :/연락 단절/.test(r.faultReason||"")
          ?`${presentFeeling} 답을 재촉하지 않았고, 꼭 전달해야 할 내용만 한 번 남긴 뒤 더 연락하지 않았어요.`
          :`${presentFeeling} 끝난 이유를 되풀이해 다투지 않고 현재 필요한 경계만 분명히 지켰어요.`;
    scripts=[
      [`${other.name}와 끝난 관계의 경계를 지키는 중`,`${reason} 관계가 끝났다는 사실을 알고 있어요. ${faultName}에게 책임이 있다고 정리한 기억과 지금의 속마음을 구분하며, 예전처럼 친근하게 굴지 않고 필요한 말만 나누고 있어요.`,"living"],
      [`${other.name}와 남은 문제를 정리하는 중`,faultBeat,"study"],
      [`${other.name}와 과거의 일을 조심스럽게 정리하는 중`,`${r.stage||"끝난 관계"}라는 현재 상태에 맞춰 연락과 만남의 거리를 지켰어요. 미련이나 반감이 남아 있더라도 이미 끝난 관계의 권리를 요구하지 않았어요.`,"study"],
      [`${other.name}을 마주치고도 옛 습관을 멈추는 중`,`예전 같으면 자연스럽게 챙겼을 일을 하려다 손을 거두었어요. 지금 두 사람의 시선과 경계가 허용하는 만큼만 반응하고 각자의 자리로 돌아갔어요.`,"living"]
    ];
  }
  else if(siblingRelation&&(distant||hating||uncomfortable))scripts=[
    [`${other.name}와 가족이라는 이름만 남긴 채 거리를 두는 중`,`같은 형제자매 관계에 묶여 있어도 지금은 친근하게 굴 수 있는 사이가 아니에요. 필요한 말만 짧게 나누고 서로의 생활과 경계를 침범하지 않았어요.`,"living"],
    [`${other.name}을 가족 행사에서 마주치고도 따로 머무는 중`,`다른 구성원 때문에 같은 자리에 있었지만 예전처럼 말을 붙이거나 챙기지 않았어요. 공식 관계보다 현재 두 사람의 거리와 감정을 우선했어요.`,"living"],
    [`${other.name}와 절연에 가까운 침묵을 지키는 중`,`혈연이나 선택한 형제 관계가 남아 있어도 가까운 사이라는 뜻은 아니에요. 상대가 먼저 말을 걸지 않는 한 자신의 자리에서 하던 일을 이어 갔어요.`,"study"]
  ];
  else if(nearlyDating)scripts=[
    [`${other.name}와 고백 직전의 말을 삼키는 중`,`서로의 마음을 이미 확인했지만 아직 공식 관계에는 이름을 붙이지 않았어요. 평소보다 가까운 거리에서 다음 말을 고르며 관계를 한 걸음 옮길 순간을 기다리고 있어요.`,"living"],
    [`${other.name}와 사귀기 직전의 설렘을 나누는 중`,`서로 좋아한다는 사실은 알지만 연인이라고 정한 적은 없어요. 손이 스칠 듯 가까워질 때마다 웃으며 다른 이야기를 꺼내고, 다음 만남을 자연스럽게 약속했어요.`,"living"],
    [`${other.name}와 확인한 마음을 천천히 다루는 중`,`쌍방의 마음을 안다고 해서 관계를 자동으로 연애라고 부르지는 않았어요. 둘이 원하는 관계와 속도를 조심스럽게 이야기하고 있어요.`,"living"]
  ];
  else if(mutualLonging)scripts=[
    [`${other.name}와 서로 좋아하면서도 고백하지 않는 중`,`둘 다 상대를 향한 마음이 깊지만 아직 사귀는 사이는 아니에요. 평범한 대화인 척 말을 고르면서도 시선이 마주칠 때마다 조금씩 표정이 풀리고 있어요.`,"living"],
    [`${other.name}의 마음을 눈치채고도 지금의 거리를 지키는 중`,`${other.name}도 자신을 좋아한다는 기색을 느끼지만 관계를 서둘러 이름 붙이지 않았어요. 작은 호의 하나에도 의미를 찾으면서 다음 말을 오래 고르고 있어요.`,"living"],
    [`${other.name}와 연인처럼 굴고도 친구라고 부르는 중`,`서로의 몫을 먼저 챙기고 자연스럽게 하루를 함께했지만 밖에서는 여전히 친구라고 말했어요. 사귀지 않는다는 사실과 쌍방의 연심이 동시에 선명해지고 있어요.`,"living"]
  ];
  else if(nominalDating)scripts=[
    [`${other.name}와 공개적으로 연인이지만 각자의 시간을 보내는 중`,`밖에서는 분명 연인으로 알려져 있지만 둘 사이에서는 연인다운 행동을 일부러 만들지 않았어요. 호칭보다 각자 편한 거리와 생활 방식을 우선하고 있어요.`,"living"],
    [`${other.name}와 사귀는 사이를 연기하지 않는 중`,`관계의 이름은 연인이지만 다정한 접촉이나 데이트를 의무처럼 여기지 않았어요. 필요한 말만 나누고 각자의 자리에서 편안한 방식으로 관계를 유지하고 있어요.`,"living"],
    [`${other.name}와 명목상의 연인 관계를 확인하는 중`,`남들이 기대하는 연인다운 모습과 실제 둘의 모습이 다르다는 것을 알고 있어요. 억지로 맞추기보다 지금 이 관계에서 서로 원하는 것과 원하지 않는 것을 다시 확인했어요.`,"living"]
  ];
  else if(unlabeledIntimacy)scripts=[
    [`${other.name}와 관계를 연애라고 부르지 않은 채 가까이 있는 중`,`둘 사이의 친밀함을 연인이나 미래의 약속으로 규정하지 않았어요. 서로 합의한 거리와 경계를 확인하고, 원하지 않는 행동은 언제든 멈출 수 있다는 신뢰를 지켰어요.`,"living"],
    [`${other.name}와 기대와 경계를 다시 맞추는 중`,`가까운 사이여도 소유권이나 연애 감정을 당연하게 요구하지 않았어요. 둘 다 원하는 친밀함의 범위와 연락 방식, 달라진 마음을 솔직하게 확인했어요.`,"living"],
    [`${other.name}와 이름 붙이지 않은 친밀함을 나누는 중`,`연애라는 이름보다 현재의 합의와 안전을 중요하게 여겼어요. 상대의 반응을 살피며 편안한 거리 안에서 시간을 함께 보내고 있어요.`,"living"]
  ];
  else if(loving&&suffocating&&goodRapport&&distrust&&nonPossessive&&endingSoon&&aggressive)scripts=[
    [`${other.name}와 웃고 떠들면서도 같은 공간은 견디기 어려운 중`,`${other.name}와 농담을 주고받는 박자는 놀랄 만큼 잘 맞았지만, 빠져나가기 어려운 집이나 차에 단둘이 있다는 사실에는 숨이 막혔어요. 사랑하는 마음과 편안함은 같은 것이 아니라는 걸 알기에 웃음을 멈추지 않은 채 출구와 거리를 확보했어요.`,"living"],
    [`${other.name}을 믿지 않으면서도 붙잡지 않는 중`,`${other.name}의 말을 그대로 믿지는 않았지만 누구를 만나든 캐묻거나 소유하려 들지 않았어요. 지금의 사랑은 진심이어도 언젠가 끝날 수 있다고 생각해서, 상대가 원하는 대로 살 자유까지 빼앗고 싶지는 않았어요.`,"living"],
    [`${other.name}에게 격한 충동이 드는 와중에도 사랑을 구분하는 중`,`화가 치밀자 ${other.name}을 해치고 싶은 충동이 스쳤지만 그것을 애정의 증거나 명령으로 여기지 않았어요. 행동으로 옮기기 전에 거리를 벌리고, 진심으로 귀여워하고 사랑하는 마음과 위험한 충동을 따로 다루고 있어요.`,"living"],
    [`${other.name}와 끝을 예상하면서 오늘의 농담을 이어 가는 중`,`내년에도 함께일 거라고 장담하지 않으면서도 지금 ${other.name}을 향한 마음까지 거짓이라고 생각하지 않았어요. 연락을 씹은 일을 추궁하지 않고 서로만 알아듣는 장난을 이어 가며, 미래의 약속 대신 오늘의 선택을 존중했어요.`,"living"]
  ];
  else if(siblingRelation&&loving&&(highConflict||aggressive))scripts=[
    [`${other.name}와 죽일 듯 싸우다 먼저 붙잡는 중`,`서로 가장 아픈 말을 골라 던지고 금방이라도 등을 돌릴 듯 부딪혔지만, ${other.name}이 위험해지는 순간에는 생각할 틈도 없이 먼저 붙잡았어요. 가족애를 다정하게 표현하지 못해도 버릴 생각은 없어요.`,"living"],
    [`${other.name}을 한심하게 보면서도 위험은 막는 중`,`${other.name}이 또 무모한 판단을 하자 미련하다고 몰아붙였지만, 실제로 다칠 상황이 되자 가장 먼저 앞을 막아섰어요. 존경이나 애증이라기보다 서로를 지독하게 잘 아는 형제자매의 책임에 가까웠어요.`,"living"],
    [`${other.name}의 반응을 실험 결과처럼 분석하다 욕먹는 중`,`${other.name}의 반응을 흥미로운 관찰 대상으로 보듯 건드렸다가 사람을 실험체 취급하지 말라는 말을 들었어요. 대수롭지 않게 넘기려다가도 상대가 정말 상처받았는지는 끝내 다시 확인했어요.`,"study"],
    [`${other.name}와 싸운 뒤 아무 일 없던 듯 챙기는 중`,`조금 전까지 서로를 못 견디겠다는 듯 싸웠지만, ${other.name}이 필요한 물건을 놓고 간 것을 보자 말없이 챙겨 두었어요. 사과는 하지 않아도 상대를 살피는 행동까지 멈추지는 않았어요.`,"living"]
  ];
  else if(loving&&aggressive)scripts=[
    [`${other.name}을 사랑하면서도 격한 충동을 누르는 중`,`${other.name}이 소중하다는 마음과 화가 나 해치고 싶은 충동이 동시에 올라왔어요. 어느 쪽도 없던 일로 만들지 않되, 충동을 행동으로 옮기기 전에 자리를 벗어나 안전한 거리를 만들었어요.`,"living"],
    [`${other.name}와 거칠게 부딪힌 뒤 상태를 확인하는 중`,`감정이 격해져 말과 몸짓이 거칠어졌지만 ${other.name}이 다치지는 않았는지 먼저 확인했어요. 사랑한다는 이유로 위험한 행동을 정당화하지 않고, 진정된 뒤 무엇이 선을 넘었는지 분명히 짚으려 했어요.`,"living"]
  ];
  else if(suffocating&&goodRapport)scripts=[
    [`${other.name}와 농담하면서도 출구 가까이에 머무는 중`,`대화의 주파수는 잘 맞아 웃음이 끊이지 않았지만 ${other.name}의 개인 공간에 오래 머무는 일은 숨 막혔어요. 어색해서가 아니라 공간을 공유하는 방식이 힘든 것이라 설명하고 출구 가까운 자리를 골랐어요.`,"living"],
    [`${other.name}와 즐겁게 떠들다 먼저 바깥으로 나가는 중`,`서로만 알아듣는 장난을 이어 가다가도 단둘이 갇힌 듯한 느낌이 강해지자 먼저 바깥 공기를 쐬자고 했어요. 대화가 잘 통하는 것과 공간이 편한 것은 별개였어요.`,"entry"]
  ];
  else if(loving&&endingSoon)scripts=[
    [`${other.name}을 사랑하면서도 끝을 예정해 둔 중`,`지금의 마음은 진심이지만 이 관계가 오래갈 거라고 기대하지는 않았어요. 미래를 약속하라고 붙잡기보다 ${other.name}이 원하는 선택을 하게 두고 오늘 함께할 일을 골랐어요.`,"living"],
    [`${other.name}와 헤어질 가능성을 담담히 생각하는 중`,`언젠가 성격이나 여건 때문에 헤어질 수 있다고 생각하면서도 그 예상으로 현재의 애정을 깎아내리지는 않았어요. 끝을 막연히 두려워하기보다 지금 지킬 수 있는 약속만 분명히 했어요.`,"living"]
  ];
  else if(highConflict&&goodRapport)scripts=[
    [`${other.name}와 싸우다 같은 농담에 웃어버린 중`,`날 선 말이 오가다가도 서로만 알아듣는 농담 한마디에 동시에 웃었어요. 갈등이 사라진 것은 아니지만 대화의 주파수는 이상할 만큼 잘 맞았어요.`,"living"],
    [`${other.name}와 격하게 부딪히면서도 말은 잘 통하는 중`,`주장하는 방향은 정반대였지만 무슨 뜻으로 말하는지는 누구보다 빨리 알아들었어요. 이해와 동의가 다르다는 것을 인정한 채 언성을 낮추고 논점을 다시 나눴어요.`,"study"]
  ];
  else if(unaware&&loving)scripts=[
    [`${other.name}에게 자꾸 시선이 가는 이유를 모르는 중`,`${other.name}의 작은 표정 변화까지 먼저 알아차리고도 특별한 감정 때문이라고는 생각하지 못했어요. ${c.socialStyle==="낯을 가림"?"말을 걸 타이밍을 놓친 채 필요한 물건만 조용히 가까이에 두었어요.":"별일 아니라는 듯 자연스럽게 다가가 방금 본 것을 먼저 알려 주었어요."}`,"living"],
    [`${other.name}을 유난히 챙기고도 대수롭지 않게 넘기는 중`,`${other.name}에게 필요한 것을 남들보다 먼저 찾아 건넸지만 왜 이렇게 신경 쓰이는지는 깊이 생각하지 않았어요. ${c.decisionStyle==="공감 우선"?"상대가 편해진 표정을 보고 나서야 마음을 놓았어요.":"해야 할 일을 처리했을 뿐이라고 스스로 결론 내렸어요."}`,"living"],
    [`${other.name} 곁에 머무는 일을 습관처럼 여기는 중`,`다른 자리가 비어 있는데도 자연스럽게 ${other.name} 가까이에 자리를 잡았어요. 편안해지는 이유를 우정이나 익숙함이라고만 생각하고 있어요.`,"living"]
  ];
  else if(unaware&&hating)scripts=[
    [`${other.name}에게 유난히 날이 서는 이유를 모르는 중`,`${other.name}의 평범한 행동에도 신경이 곤두섰지만 그 감정이 분노나 미움이라고는 인정하지 않았어요. ${/우정/.test(awareness)?"가까운 사이라 유난히 예민해지는 것뿐이라고 우정으로 잘못 해석했어요.":"피곤해서 그렇다고 넘기며 대답을 짧게 잘랐어요."}`,"living"],
      [`${other.name}을 무심코 피하면서도 이유를 부정하는 중`,`같은 공간에 들어온 ${other.name}을 보자 자연스럽게 거리를 벌렸어요. ${/우정/.test(awareness)?"서로 편한 사이여서 굳이 말을 섞지 않는 것이라고 생각했지만 실제로는 불쾌함을 피하고 있었어요.":"불편함의 정체를 들여다보는 대신 혼자 있고 싶을 뿐이라고 생각했어요."}`,"study"]
  ];
  else if(hairTeasingConflict)scripts=[
    [`${other.name}의 머리 놀림에 화가 난 중`,`${subject(other.name)} ${object(selfHair)} 두고 같은 말을 거듭 놀리자 얼굴이 굳었어요. 웃어넘기지 않고 싫다고 분명히 말한 뒤, 더 이어지면 자리를 뜨겠다고 선을 그었어요.`,"living"],
    [`${other.name}에게 머리 이야기를 그만하라고 따지는 중`,`${subject(other.name)} ${object(selfHair)} 웃음거리로 삼자 곧바로 말을 끊었어요. 외형을 평가할 권리는 없다고 분명히 짚고 사과할 때까지 거리를 두었어요.`,"living"]
  ];
  else if((officialRomance||loving)&&noticesLooks&&!hating&&!uncomfortable&&!distrust&&(otherEyes||otherHair))scripts=[
    ...(otherEyes?[
      [`${other.name}의 눈을 가만히 들여다보는 중`,`${other.name}과 가까이 마주 앉아 ${object(otherEyes)} 잠시 들여다보았어요. 눈빛이 달라지는 순간을 알아차리고도 품평하듯 말하지 않고 다정하게 시선을 맞췄어요.`,"living"],
      [`${other.name}의 눈빛에 시선이 머무는 중`,`${other.name}의 ${otherEyes}에 비친 표정이 문득 선명하게 보여 말끝을 늦췄어요. 가까운 사이에서만 허용된 거리와 상대의 반응을 살피며 시선을 맞췄어요.`,"living"]
    ]:[]),
    ...(otherHair?[
      [`${other.name}의 머리를 바라보다 미소 짓는 중`,`${other.name}의 ${object(hairStyleSocialDetail(other,`${c.id}:romance-look`)||otherHair)} 눈으로 따라갔어요. 손을 대기 전에는 먼저 괜찮은지 묻고, 허락받은 범위 안에서만 가까이 다가갔어요.`,"living"],
      [`${other.name}의 머리가 흐트러진 것을 알려 주는 중`,`${other.name}에게 손을 대기 전에 머리가 조금 흐트러졌다고 먼저 알려 주었어요. 직접 정리할지 도움을 받을지 선택하게 기다린 뒤 상대가 고른 방식에 따랐어요.`,"living"],
      ...(kindAndExtroverted?[
        [`${other.name}의 달라진 머리를 알아보는 중`,`${other.name}의 ${subject(hairStyleSocialDetail(other,`${c.id}:romance-change`)||otherHair)} 평소와 다르게 정돈된 것을 알아차렸어요. 잘 어울린다는 말을 구체적으로 건네되 바뀐 이유를 캐묻지는 않았어요.`,"living"],
        [`${other.name}의 머리 손질을 구체적으로 알아보는 중`,`${other.name}의 ${object(hairStyleSocialDetail(other,`${c.id}:romance-detail`)||otherHair)} 알아차리고 오늘 특히 마음에 드는 부분을 말해 주었어요. 외형을 평가하기보다 상대가 직접 고른 스타일과 손질을 존중해 표현했어요.`,"living"]
      ]:[])
    ]:[])
  ];
  else if(kindAndExtroverted&&appearanceApproachSafe&&(otherEyes||otherHair))scripts=[
    ...(otherHair?[
      [`${other.name}의 달라진 머리를 칭찬하는 중`,`${other.name}의 ${object(hairStyleSocialDetail(other,`${c.id}:friendly-hair`)||otherHair)} 알아차리고, 직접 고른 스타일이 잘 어울린다고 먼저 말했어요. 만져 보거나 바꿀 것을 권하지 않고 상대가 기쁘게 받아들이는지만 살폈어요.`,"living"],
      [`${other.name}의 머리 손질을 알아봐 주는 중`,`${other.name}이 신경 써서 정돈한 ${object(otherHair)} 지나치지 않고 구체적으로 칭찬했어요. 외모 전체를 평가하지 않고 오늘 달라진 선택만 다정하게 짚어 주었어요.`,"living"]
    ]:[]),
    ...(otherEyes?[
      [`${other.name}의 눈 색이 인상적이라고 말하는 중`,`${other.name}의 ${otherEyes}이 오늘 빛에서 또렷해 보인다고 자연스럽게 말했어요. 오래 응시하거나 대답을 요구하지 않고 곧바로 편안한 대화를 이어 갔어요.`,"living"]
    ]:[])
  ];
  else if(visuallyDrawn)scripts=[
    [`${other.name}의 인상에 잠깐 시선이 머무는 중`,`${matchedLooks.length?`${other.name}의 ${matchedLooks[0]} 모습이 평소 좋아하던 인상과 닮아 눈길이 갔어요.`:`${other.name}의 눈에 띄는 인상이 문득 신경 쓰였어요.`} 곧바로 시선을 거두고 하던 이야기를 이어 갔어요.`,"living"],
    [`${other.name}의 외모에서 좋아하는 특징을 발견한 중`,`${matchedLooks.length?`${matchedLooks.join(", ")} 같은 특징을 알아차렸어요.`:"평소보다 또렷하게 보이는 표정과 분위기를 알아차렸어요."} 공식 관계와 신뢰는 그대로지만 잠시 호감이 생길 만한 인상이라고 느꼈어요.`,"living"]
  ];
  else if(loving&&avoidsTouch)scripts=[
    [`${other.name}와 말로 애정을 나누는 중`,`${other.name}과 몸을 맞대는 대신 마주 앉아 오늘 있었던 일을 천천히 들었어요. 둘에게 편안한 방식으로 애정을 표현하고 있어요.`,"living"],
    [`${other.name}와 각자의 자리를 지키며 함께 있는 중`,`서로에게 닿지 않아도 같은 공간에 있는 일이 편안했어요. 각자 하던 일을 이어 가다가 눈이 마주치면 짧게 웃어 보였어요.`,"living"],
    [`${other.name}에게 다정한 말을 건네는 중`,`접촉 대신 구체적인 말로 고마움과 애정을 전했어요. ${other.name}의 대답을 재촉하지 않고 가까운 자리에서 기다리고 있어요.`,"living"]
  ];
  else if(touchAverse)scripts=[
    [`${other.name}과 편안한 거리를 지키는 중`,`몸이 닿지 않을 만큼 자리를 띄운 뒤 눈인사와 짧은 말로 마음을 전했어요. 가까이 붙지 않아도 함께 있다는 느낌은 충분히 나누고 있어요.`,"living"],
    [`${other.name}에게 접촉 대신 말로 마음을 전하는 중`,`자기에게 편안한 거리를 유지하며 필요한 이야기를 천천히 건넸어요. 접촉 없이도 ${other.name}과 같은 시간을 보내고 있어요.`,"living"]
  ];
  else if(welcomesTouch&&likesTouch&&loving&&otherTouchAverse)scripts=[
    [`${other.name}에게 닿는 대신 곁을 지키는 중`,`가까이 가고 싶은 마음은 컸지만 ${other.name}이 접촉을 불편해한다는 것을 알아차렸어요. 손을 뻗는 대신 마주 보이는 자리에 앉아 말을 건넸어요.`,"living"],
    [`${other.name}의 반응에 맞춰 거리를 조절하는 중`,`다정하게 다가가려다 ${other.name}의 몸이 굳는 것을 보고 바로 멈췄어요. 접촉 대신 필요한 것을 가까이에 놓아 주었어요.`,"living"]
  ];
  else if(welcomesTouch&&loving&&!otherTouchAverse)scripts=[
    [`${other.name}와 자연스럽게 가까이 있는 중`,`익숙하게 곁에 앉아 어깨를 가볍게 맞대고 편안한 온기를 나누고 있어요. 둘 사이에 자연스러운 거리라 긴장하지 않고 이야기를 이어 갔어요.`,"living"],
    [`${other.name}에게 다정하게 기대는 중`,`지나가며 팔을 가볍게 감싸고 잠시 곁에 기대었어요. ${other.name}도 편안하게 받아들여 가까운 거리에서 함께 쉬고 있어요.`,"living"]
  ];
  else if(loving&&distrust)scripts=[
    [`${other.name}의 말을 다시 확인하는 중`,`마음은 자꾸 ${other.name}에게 향하지만 그 말을 곧이곧대로 믿지는 못해요. 좋아하는 마음과 의심 사이에서 표정을 살피고, 방금 들은 이야기를 조심스럽게 다시 물었어요.`,"living"],
    [`${other.name}을 챙기면서도 경계를 늦추지 않는 중`,`${other.name}에게 필요한 것을 먼저 건네면서도 마음 한편의 의심은 접지 못했어요. 다정하게 곁을 지키되 판단은 서두르지 않고 있어요.`,"living"],
    [`${other.name}의 대답에서 빠진 말을 찾는 중`,`좋아하는 사람이라 더 믿고 싶었지만 애매하게 넘어간 부분이 마음에 남았어요. 몰아붙이지 않고 질문을 바꾸어 가며 사실을 확인하고 있어요.`,"living"],
    [`${other.name}에게 마음과 판단을 따로 두는 중`,`다정한 말에는 마음이 흔들렸지만 중요한 결정까지 맡기지는 않았어요. 애정은 숨기지 않되 확인되지 않은 약속에는 거리를 두었어요.`,"living"]
  ];
  else if(loving&&uncomfortable)scripts=[
    [`${other.name} 가까이에서 괜히 긴장하는 중`,`좋아해서 곁에 있고 싶으면서도 시선이 마주칠 때마다 몸이 굳었어요. 자연스러운 척 다른 일을 꺼내 들고도 자꾸 ${other.name}의 반응을 살피고 있어요.`,"living"],
    [`${other.name}에게 다가갔다가 한 걸음 물러서는 중`,`말을 걸려고 가까이 갔지만 막상 무슨 말을 해야 할지 떠오르지 않았어요. 필요한 물건만 건넨 뒤 너무 멀지도 가깝지도 않은 자리에 머물렀어요.`,"living"],
    [`${other.name} 앞에서 평소답지 않게 말을 고르는 중`,`다른 사람에게라면 바로 했을 말을 몇 번이나 삼켰어요. 마음을 들킬까 걱정하면서도 차갑게 보이고 싶지는 않아 조심스럽게 안부를 물었어요.`,"living"]
  ];
  else if(/전혀 귀찮거나 성가시지 않지만 성가시다고 말함/.test(annoyance)&&playfulSafe)scripts=[
    [`${other.name}에게 귀찮다고 말하면서도 바로 반응하는 중`,`말로는 또 성가시게 한다고 투덜거렸지만 실제로는 귀찮거나 불쾌하지 않았어요. 익숙한 말버릇처럼 불평한 뒤 ${other.name}의 이야기를 끝까지 듣고 있어요.`,"living"],
    [`${other.name}을 성가시다고 놀리는 중`,`귀찮다는 말을 장난처럼 건넸지만 몸을 피하거나 대화를 끊지는 않았어요. 말과 실제 감정이 다르다는 것을 드러내듯 자연스럽게 곁에 남았어요.`,"living"]
  ];
  else if(loving&&/종종 귀찮|많이 귀찮|보기만 해도 피곤/.test(annoyance))scripts=[
    [`${other.name}에게 투덜거리면서도 도와주는 중`,`또 자기 몫이 늘었다며 작게 불평했지만 ${other.name}이 곤란해하는 모습을 외면하지 못했어요. 잔소리를 섞어 결국 끝까지 손을 보탰어요.`,"living"],
    [`${other.name}을 귀찮아하면서 곁에 남은 중`,`잠깐 혼자 있고 싶다고 말하면서도 정말 자리를 뜨지는 않았어요. 대답은 짧아졌지만 ${other.name}이 부르면 들을 수 있는 거리를 지키고 있어요.`,"living"],
    [`${other.name}의 부탁에 한숨부터 쉬는 중`,`몇 번째 부탁인지 세어 보듯 바라봤지만 거절하지는 않았어요. 이번이 마지막이라고 강조하며 필요한 일을 대신 처리해 주었어요.`,"living"]
  ];
  else if(distrust&&attentive)scripts=[
    [`${other.name}을 챙기며 행동도 확인하는 중`,`필요한 것은 빠짐없이 챙겨 주면서도 약속한 일을 실제로 했는지 조용히 확인했어요. 걱정과 의심을 구분하지 못한 채 평소보다 세심하게 살피고 있어요.`,"living"],
    [`${other.name}의 상태와 말을 함께 살피는 중`,`아픈 곳은 없는지 먼저 물었지만 대답만 듣고 안심하지는 않았어요. 표정과 행동이 말과 맞는지 지켜본 뒤 필요한 것을 건넸어요.`,"living"],
    [`${other.name}을 믿지 못해 더 신경 쓰는 중`,`무관심해서가 아니라 사고가 날까 걱정되어 자꾸 확인했어요. ${other.name}이 부담스러워하지 않도록 질문 사이의 간격을 두고 있어요.`,"living"]
  ];
  else if(loving&&distant)scripts=[
    [`${other.name}을 멀찍이서 챙기는 중`,`가까이 다가서지는 못한 채 ${other.name}이 불편해 보이지 않는지만 살폈어요. 좋아하는 마음을 들키지 않도록 필요한 물건을 손 닿기 좋은 곳에 조용히 두었어요.`,"living"],
    [`${other.name}에게 건넬 말을 고르는 중`,`정서적으로는 아직 멀게 느껴지지만 모른 척 지나치고 싶지는 않았어요. 부담스럽지 않을 짧은 안부를 오래 고른 뒤 조심스럽게 건넸어요.`,"living"]
  ];
  else if(jealous)scripts=[
    [`${other.name}의 관심이 어디로 향하는지 신경 쓰는 중`,`${other.name}이 다른 사람에게 오래 시선을 두자 괜히 손에 쥔 것을 만지작거렸어요. 직접 따져 묻기보다는 평소보다 가까운 자리에 머물며 반응을 살피고 있어요.`,"living"],
    [`${other.name} 곁의 자리를 은근히 지키는 중`,`다른 사람이 ${other.name}과 가까워지는 모습이 마음에 걸렸어요. 티를 크게 내지는 않지만 자연스러운 척 옆자리를 차지하고 대화의 흐름을 놓치지 않았어요.`,"living"],
    [`${other.name}에게 평소보다 사소한 질문을 하는 중`,`누구와 무엇을 했는지 직접 캐묻지는 않았지만 대화 사이에 질문을 하나씩 끼워 넣었어요. 아무렇지 않은 척하면서 대답은 빠짐없이 기억하고 있어요.`,"living"],
    [`${other.name}의 반응을 떠보는 중`,`다른 사람 이야기를 가볍게 꺼내고 ${other.name}의 표정이 달라지는지 살폈어요. 원하는 대답을 강요하지 않으려 곧 화제를 바꾸었지만 마음은 쉽게 가라앉지 않았어요.`,"living"]
  ];
  else if(attentive)scripts=[
    [`${other.name}의 상태를 먼저 확인하는 중`,`자기 일을 시작하기 전에 ${other.name}의 표정과 목소리부터 살폈어요. 평소와 다른 점을 알아채고 필요한 것이 없는지 구체적으로 물었어요.`,"living"],
    [`${other.name}의 몫까지 챙겨 두는 중`,`${other.name}이 나중에 찾을 만한 물건과 일정을 미리 확인했어요. 부탁받지 않았지만 불편하지 않을 만큼만 손을 보태고 있어요.`,"living"]
  ];
  else if(distrust)scripts=[
    [`${other.name}의 말을 곧이곧대로 믿지 않는 중`,`대답을 들은 뒤에도 말투와 앞뒤 상황을 한 번 더 맞춰 보았어요. 바로 반박하지는 않았지만 확신이 들 때까지 중요한 판단을 미루고 있어요.`,"living"],
    [`${other.name}을 조심스럽게 지켜보는 중`,`겉으로는 평소처럼 대했지만 약속과 실제 행동이 맞는지 차분히 살폈어요. 믿음을 주기 전까지 자기 속내는 필요한 만큼만 보여 주고 있어요.`,"living"]
  ];
  else if(uncomfortable)scripts=[
    [`${other.name} 앞에서 긴장을 풀지 못하는 중`,`같은 공간에 있어도 어깨에 힘이 들어가고 말수가 줄었어요. 필요한 말은 분명하게 하되 사적인 이야기는 꺼내지 않고 거리를 지키고 있어요.`,"living"],
    [`${other.name}과 어색한 침묵을 나누는 중`,`무슨 말을 해야 할지 몇 번이나 생각했지만 쉽게 입이 떨어지지 않았어요. 괜히 물건을 정리하며 둘 사이의 어색한 공기를 견디고 있어요.`,"living"]
  ];
  else if(/아주 편안|가장 편안|긴장을 전혀 하지 않음/.test(comfort))scripts=[
    [`${other.name}과 말없이 같은 시간을 보내는 중`,`굳이 대화를 이어 가지 않아도 불편하지 않았어요. 각자 하던 일을 하면서도 필요한 순간에는 자연스럽게 손을 뻗어 도왔어요.`,"living"],
    [`${other.name} 앞에서 완전히 긴장을 푼 중`,`꾸미지 않은 표정과 말투로 사소한 이야기를 꺼냈어요. 잠깐의 침묵도 편안해서 서둘러 채우려 하지 않았어요.`,"living"]
  ];
  else if(/아주 가까움|가족처럼 가까움|마음의 중심/.test(closeness))scripts=[
    [`${other.name}에게 사소한 일을 먼저 이야기하는 중`,`별것 아닌 생각이 떠오르자 자연스럽게 ${other.name}부터 찾았어요. 오늘 있었던 작은 일까지 나누며 반응을 기다리고 있어요.`,"living"],
    [`${other.name}과 익숙한 방식으로 시간을 보내는 중`,`긴 설명 없이도 서로의 습관을 알아차렸어요. ${other.name}이 다음에 무엇을 할지 짐작하고 자리를 조금 비켜 주었어요.`,"living"]
  ];
  else if(/가끔 성가|종종 귀찮|많이 귀찮|보기만 해도 피곤|부담/.test(thought))scripts=[
    [`${other.name}의 장난을 흘려듣는 중`,"몇 번째 부름에는 대답 대신 짧게 한숨을 쉬었지만, 정말 필요한 말인지 확인하려고 하던 손을 잠시 멈췄어요.","living"],
    [`${other.name}에게 잠깐 혼자 있고 싶다고 말하는 중`,"싫어서 피하는 것은 아니라고 선을 그은 뒤, 지금 하던 일을 마칠 때까지만 조용히 두어 달라고 부탁했어요.","study"]
  ];
  else if(/어느 정도 믿음|깊이 신뢰|전적으로 의지|든든/.test(thought))scripts=[
    [`${other.name}에게 먼저 의견을 묻는 중`,"혼자 정해도 될 일이지만 이 사람의 판단이라면 믿을 만하다고 생각해 선택지를 하나씩 보여 주고 있어요.","living"],
    [`${other.name}의 곁에서 마음을 놓는 중`,"길게 설명하지 않아도 상황을 알아줄 거라는 믿음에 오늘 있었던 일을 천천히 꺼내고 있어요.","living"]
  ];
  else if(/좋아|사랑|소중|애틋/.test(thought))scripts=[
    [`${other.name}가 편히 쉬도록 자리를 정리하는 중`,"상대가 눈치채기 전에 주변의 어수선한 물건을 치우고 손이 닿기 좋은 곳에 필요한 것을 놓아 두고 있어요.","living"],
    [`${other.name}의 사소한 이야기를 오래 듣는 중`,"결론을 재촉하지 않고 표정이 밝아지는 대목을 기억해 두며 자연스럽게 다음 이야기를 물었어요.","living"]
  ];
  else if(/싫|경계|불편|의심/.test(thought))scripts=[
    [`${other.name}와 필요한 말만 나누는 중`,"같은 공간에 있지만 사적인 이야기는 꺼내지 않은 채 지금 함께 처리해야 할 일만 짧고 분명하게 확인했어요.","living"],
    [`${other.name}와 거리를 두고 지켜보는 중`,"상대가 무엇을 하는지 한 번 확인한 뒤 굳이 가까이 가지 않고 자기 자리를 지키고 있어요.","study"]
  ];
  else if(conflict>=65)scripts=[
    [`${other.name}와 말다툼하는 중`,"쌓아 둔 서운함을 꺼내다 목소리가 높아졌지만 피하지 않고 자기 마음을 끝까지 설명하고 있어요.","living"],
    [`${other.name}와 말다툼하는 중`,"바로 반박했다가 잠시 숨을 고르고, 무엇이 속상했는지 상대에게 차근차근 되묻고 있어요.","living"]
  ];
  else if(conflict>=35)scripts=[
    [`${other.name}에게 잔소리하는 중`,"미뤄 둔 일을 가리키며 걱정돼서 하는 말이라고 덧붙이고, 결국 옆에 앉아 함께 정리해 주고 있어요.","living"],
    [`${other.name}의 잔소리를 듣는 중`,"처음에는 못 들은 척하다가 상대가 챙겨 둔 것을 보고 작게 알겠다고 답하며 몸을 일으켰어요.","living"]
  ];
  else if(intimacy>=40)return relationSpecificEntry(c,other,r,time,date,role);
  else if(c.interference==="강하게 간섭함"||c.interference==="통제광")scripts=[
    [`${other.name}의 귀가 시간을 따지는 중`,"늦어진 이유를 분명히 말해 달라고 요구하고 다음부터는 미리 연락하라며 단호하게 이야기하고 있어요.","living"],
    [`${other.name}에게 행동을 바로잡으라고 말하는 중`,"미뤄 둔 일을 직접 가리키며 지금 끝내야 한다고 강하게 재촉하고 있어요.","living"]
  ];
  else if(c.interference==="챙기고 확인함")scripts=[
    [`${other.name}를 데려다줄 준비 중`,"늦은 시간 혼자 움직이지 않도록 목적지와 돌아올 시간을 확인하고 외투와 차 키를 챙기고 있어요.","entry"],
    [`${other.name}의 준비물을 확인하는 중`,"빠뜨린 것이 없는지 옆에서 하나씩 확인하고 필요한 물건을 가방에 넣어 주고 있어요.","entry"]
  ];
  else if(intimacy<40&&["먼저 다가감","활발하게 어울림","무리의 중심"].includes(c.socialStyle))scripts=[
    [`${other.name}를 자꾸 귀찮게 하는 중`,"혼자 조용히 있으려는 상대의 곁을 맴돌며 사소한 질문을 연달아 던지고, 대답이 짧아도 새 이야기를 꺼내고 있어요.","living"],
    [`${other.name}의 집중을 흐트러뜨리는 중`,"옆을 지나갈 때마다 방금 떠오른 이야기를 하나씩 보태며 상대가 결국 고개를 들 때까지 말을 걸고 있어요.","study"]
  ];
  else if(intimacy<40&&["강박적","철저히 계획함","강박적으로 계획함"].includes(c.planningStyle))scripts=[
    [`${other.name}가 어질러 둔 순서를 바로잡는 중`,"상대가 다시 쓸 물건이라는 말을 듣고도 제자리에 있어야 찾기 쉽다며 하나씩 정리하고 있어요.","living"],
    [`${other.name}에게 다음 일정을 재확인하는 중`,"이미 들은 약속도 시간이 바뀌지 않았는지 다시 묻고 현관 가까이에 필요한 물건을 모아 두고 있어요.","entry"]
  ];
  else return sharedHomeEntry(c,other,time,date);
  const roleScripts=scripts.filter((_,index)=>index%2===role%2);
  const script=roleScripts[hash(`${c.id}:${other.id}:${dayKey(date)}:${time}:${overall}:${mutualAwareness}:${trust}:${closeness}:${comfort}:${annoyance}:${attention}:${jealousy}:${conflictIntensity}:${expectation}:${aggression}`)%roleScripts.length];
  return homeEntry(c,time,script[0],personalityFlavor(c,script[1]+combinedTone+respectfulAccessibilityFor(other,`relation:${r.id}:${role}`,date),`relation:${r.id}:${role}`,date),script[2]);
}

function relationshipMorningEntry(c,pick,time,date){
  const {r,other}=pick;
  if(other.homeId!==c.homeId||sleepingNow(other,new Date(date.getFullYear(),date.getMonth(),date.getDate(),Math.floor(time/60),time%60)))return null;
  const n=other.name,stage=r.stage||"",seed=`${r.id}:${dayKey(date)}:morning-relation`;
  const pools={
    부부:[
      [`${n}와 아침 안부를 묻는 중`,"먼저 잠은 잘 잤는지 묻고 오늘 몸 상태와 서로의 일정을 짧게 확인하고 있어요.","kitchen"],
      [`${n}의 옷매무새를 봐주는 중`,"현관으로 나가기 전 구겨진 옷깃을 펴 주고 빠뜨린 물건이 없는지 자연스럽게 살펴보고 있어요.","entry"],
      [`${n}와 아침 식탁에 앉은 중`,"바쁜 시간에도 몇 분은 마주 앉아 식사하며 오늘 늦어질 일이 있는지 서로 알려 주고 있어요.","kitchen"],
      [`${n}에게 먼저 다녀오라고 인사하는 중`,"상대가 서두르지 않도록 가방과 겉옷을 건네고 오늘도 무사히 다녀오라고 익숙하게 배웅하고 있어요.","entry"],
      [`${n}와 밤사이 있었던 일을 나누는 중`,"이상한 꿈과 새벽에 들린 소리 같은 사소한 이야기부터 꺼내며 함께 하루를 열고 있어요.","bedroom"]
    ],
    연인:[
      [`${n}에게 아침 인사를 건네는 중`,"잠이 덜 깬 목소리를 듣고 웃으며 오늘 언제 다시 만날지 자연스럽게 묻고 있어요.","living"],
      [`${n}와 아침 음료를 나누는 중`,"상대가 좋아하는 방식으로 음료를 준비해 건네고 가까이 서서 첫 모금을 기다리고 있어요.","kitchen"],
      [`${n}의 하루를 응원하는 중`,"오늘 중요한 일이 있다는 것을 기억하고 부담스럽지 않게 잘할 수 있다고 다정히 말해 주고 있어요.","entry"]
    ],
    "형제·자매":[
      [`${n}와 세면 순서를 두고 실랑이하는 중`,"먼저 일어났다는 주장과 어제 양보했다는 주장이 오가다가 오늘 순서를 빠르게 정하고 있어요.","bath"],
      [`${n}의 아침 준비를 재촉하는 중`,"늦는 건 자기 책임이라고 말하면서도 현관에 놓인 준비물을 한 번 더 확인해 주고 있어요.","entry"]
    ],
    동거인:[
      [`${n}와 조용히 아침 동선을 나누는 중`,"서로 바쁜 시간을 방해하지 않도록 욕실과 부엌을 쓰는 순서를 자연스럽게 비켜 주고 있어요.","kitchen"],
      [`${n}에게 공용 물건이 떨어졌다고 알리는 중`,"누가 살지 따지기보다 장보기 목록에 적고 이번에는 자기가 다녀오겠다고 말했어요.","entry"]
    ],
    친구:[
      [`${n}와 느지막한 아침 이야기를 하는 중`,"먼저 깬 사람이 보낸 우스운 사진을 함께 보며 잠이 깨기도 전에 웃고 있어요.","living"],
      [`${n}와 오늘 할 일을 의논하는 중`,"각자 일정이 비는 시간을 확인하고 저녁에 같이 할 일을 가볍게 정하고 있어요.","kitchen"]
    ]
  };
  const pool=pools[r.type];
  if(!pool)return null;
  const script=pool[hash(seed)%pool.length];
  const stageTone=/이별|이혼|냉랭|서먹/.test(stage)?" 아직 풀리지 않은 감정 때문에 말끝은 조심스럽고 짧아요.":/운명의|없어서는|깊이|최고/.test(stage)?" 오래 설명하지 않아도 서로 필요한 것을 자연스럽게 알아차리고 있어요.":"";
  return homeEntry(c,time,script[0],personalityFlavor(c,script[1]+stageTone,`morning-relation:${r.type}`,date),script[2]);
}

const HOME_ACTIVITY_POOL=[
  ["거실에서 쿠션과 담요를 정리하는 중","소파 틈에 들어간 물건을 꺼내고 쿠션 모양을 잡은 뒤 담요를 반듯하게 접고 있어요.","living"],
  ["거실 바닥을 가볍게 청소하는 중","눈에 띄는 먼지와 머리카락을 모아 치우고 자주 걷는 자리를 중심으로 닦고 있어요.","living"],
  ["거실에서 창밖을 구경하는 중","창가에 기대어 오가는 사람과 달라진 날씨를 한동안 느긋하게 바라보고 있어요.","living"],
  ["거실에서 앨범을 넘겨보는 중","오래된 사진을 날짜별로 넘겨 보며 기억나는 장면에서 손을 멈추고 있어요.","living"],
  ["거실에서 보드게임을 정리하는 중","흩어진 말과 카드를 종류별로 세고 다음에 바로 꺼낼 수 있게 상자에 담고 있어요.","living"],
  ["거실에서 라디오를 듣는 중","익숙한 목소리와 음악을 배경처럼 틀어 두고 편안하게 시간을 보내고 있어요.","living"],
  ["주방에서 냉장고를 정리하는 중","유통기한과 남은 양을 확인해 먼저 먹을 재료를 앞쪽으로 옮기고 있어요.","kitchen"],
  ["주방에서 반찬을 소분하는 중","한 번에 먹기 좋은 양으로 나눠 작은 용기에 담고 이름과 날짜를 표시하고 있어요.","kitchen"],
  ["주방에서 빵을 굽는 중","반죽의 상태와 오븐 안의 색을 번갈아 확인하며 고소한 냄새가 퍼지기를 기다리고 있어요.","kitchen"],
  ["주방에서 새로운 음료를 만드는 중","얼음과 재료의 비율을 조금씩 바꾸어 맛을 보고 마음에 드는 조합을 기록하고 있어요.","kitchen"],
  ["주방에서 설거지를 마무리하는 중","그릇의 물기를 털어 제자리에 놓고 싱크대 주변까지 깨끗하게 닦고 있어요.","kitchen"],
  ["주방에서 향신료를 정리하는 중","향과 쓰임이 비슷한 것끼리 모으고 비어 가는 병은 장보기 목록에 적고 있어요.","kitchen"],
  ["서재에서 책장을 정리하는 중","읽은 책과 아직 읽지 않은 책을 나누고 자주 찾는 자료를 손에 닿는 칸으로 옮기고 있어요.","study"],
  ["서재에서 오래된 메모를 분류하는 중","쓸모가 남은 기록과 버려도 될 종이를 나누고 필요한 내용은 새 노트에 옮기고 있어요.","study"],
  ["서재에서 온라인 강의를 듣는 중","중요한 부분에서 영상을 잠시 멈추고 자기 말로 내용을 다시 적어 보고 있어요.","study"],
  ["서재에서 퍼즐을 맞추는 중","비슷한 색과 모양을 먼저 나눈 뒤 맞을 것 같은 조각을 하나씩 대 보고 있어요.","study"],
  ["서재에서 수집품을 손질하는 중","표면의 먼지를 조심스럽게 닦고 순서가 흐트러지지 않게 다시 진열하고 있어요.","study"],
  ["서재에서 편지를 쓰는 중","전하고 싶은 말을 몇 번 고쳐 적고 봉투와 보낼 주소를 확인하고 있어요.","study"],
  ["서재에서 파일을 백업하는 중","사진과 문서를 폴더별로 나누고 중복된 파일을 확인한 뒤 안전한 곳에 복사하고 있어요.","study"],
  ["서재에서 작은 것을 수리하는 중","느슨해진 나사와 연결 부위를 살펴보고 도구를 바꿔 가며 조심스럽게 고치고 있어요.","study"],
  ["침실에서 침구를 바꾸는 중","사용한 이불과 베개 커버를 벗기고 깨끗한 침구의 모서리를 맞춰 씌우고 있어요.","bedroom"],
  ["침실에서 옷장을 정리하는 중","계절에 맞지 않는 옷을 안쪽으로 옮기고 자주 입는 옷을 종류별로 다시 걸고 있어요.","bedroom"],
  ["침실에서 액세서리를 고르는 중","옷차림과 어울리는 색과 크기를 비교하며 과하지 않은 조합을 찾고 있어요.","bedroom"],
  ["침실에서 낮잠 준비를 하는 중","커튼을 조금 닫고 알람을 맞춘 뒤 짧게 눈을 붙일 수 있도록 자리를 정돈하고 있어요.","bedroom"],
  ["침실에서 향을 고르는 중","오늘 기분에 맞는 향을 몇 가지 맡아 보고 가장 편안한 것을 손목에 가볍게 뿌리고 있어요.","bedroom"],
  ["욕실에서 수건을 정리하는 중","마른 수건을 크기별로 접어 쌓고 젖은 수건은 세탁 바구니에 따로 모으고 있어요.","bath"],
  ["욕실에서 세면대를 닦는 중","거울에 튄 물자국과 세면대 가장자리를 닦고 사용한 물건을 원래 자리에 놓고 있어요.","bath"],
  ["욕실에서 반신욕을 하는 중","따뜻한 물에 몸을 담그고 조명을 낮춘 채 천천히 긴장을 풀고 있어요.","bath"],
  ["욕실에서 화장품을 정리하는 중","자주 쓰는 제품과 오래된 제품을 나누고 사용 순서대로 보기 좋게 세워 두고 있어요.","bath"],
  ["현관에서 신발을 손질하는 중","바닥의 먼지를 털고 얼룩 난 부분을 닦은 뒤 짝을 맞춰 가지런히 놓고 있어요.","entry"],
  ["현관에서 택배를 정리하는 중","상자를 열어 물건 상태를 확인하고 포장재를 종류별로 나눠 버릴 준비를 하고 있어요.","entry"],
  ["현관에서 우편물을 확인하는 중","광고지와 중요한 문서를 나누고 답이 필요한 우편은 눈에 잘 띄는 곳에 두고 있어요.","entry"],
  ["베란다에서 식물을 돌보는 중","흙의 마른 정도와 새잎 상태를 살피고 필요한 화분에만 천천히 물을 주고 있어요.","living"],
  ["집 안의 조명을 점검하는 중","깜빡이는 전구와 너무 밝은 곳을 확인하고 방마다 편안한 밝기로 조절하고 있어요.","living"],
  ["집 안에서 잃어버린 물건을 찾는 중","마지막으로 사용한 장소부터 되짚어 보며 서랍과 가방 안을 차례대로 확인하고 있어요.","living"],
  ["집 안의 비상용품을 확인하는 중","약과 건전지의 사용기한을 살피고 부족한 물품을 목록에 추가하고 있어요.","entry"],
  ["집에서 음악에 맞춰 춤추는 중","좋아하는 곡의 볼륨을 조금 높이고 아무도 신경 쓰지 않은 채 박자에 맞춰 몸을 움직이고 있어요.","living"],
  ["집에서 홈트레이닝 중","매트 위에서 자세가 흐트러지지 않게 거울을 보며 정해 둔 동작을 반복하고 있어요.","living"],
  ["집에서 악기를 연습하는 중","어려운 구간을 느린 속도로 나누어 반복하고 소리가 안정되면 조금씩 속도를 올리고 있어요.","study"],
  ["집에서 손뜨개를 하는 중","실의 장력을 맞추고 도안을 확인하며 같은 무늬를 한 코씩 이어 가고 있어요.","living"],
  ["집에서 그림을 그리는 중","빛과 색을 비교하며 큰 형태부터 잡고 마음에 걸리는 세부를 여러 번 고쳐 그리고 있어요.","study"]
];
const homeActivityPoolFor=(c,date=new Date())=>{
  const hobbies=[...(c.hobbies||[]),...(c.interests||[])].map(String);
  const likes=pattern=>hobbies.some(value=>pattern.test(value));
  const pool=HOME_ACTIVITY_POOL.filter(([title])=>{
    if(title.includes("잃어버린 물건")&&((c.personalityTypes||[]).includes("철두철미함")||["계획적","강박적으로 계획함"].includes(c.planningStyle)||["흐트러짐을 못 참음","결벽에 가까움"].includes(c.neatness)))return false;
    if(title.includes("춤추는"))return hobbies.some(value=>/춤|댄스/.test(value));
    if(title.includes("악기를"))return hobbies.some(value=>/악기|기타|피아노|드럼|바이올린|연주/.test(value));
    if(title.includes("그림을 그리는"))return hobbies.some(value=>/그림|드로잉|스케치|회화|미술|일러스트/.test(value));
    if(title.includes("향을 고르는"))return likes(/향수|향수 시향|조향|향기/);
    if(title.includes("퍼즐을 맞추는"))return likes(/퍼즐|보드게임|방탈출/);
    if(title.includes("수집품을 손질하는"))return likes(/수집|피규어|우표|레코드|프라모델/);
    if(title.includes("빵을 굽는"))return likes(/베이킹|요리|빵/);
    if(title.includes("새로운 음료를 만드는"))return likes(/커피|차 |차 우리기|칵테일|음료/);
    if(title.includes("식물을 돌보는"))return likes(/식물|원예|자연/);
    return true;
  });
  const housemates=state.order.map(id=>state.characters[id]).filter(other=>other&&other.id!==c.id&&other.homeId===c.homeId);
  const ownerFor=pattern=>housemates.find(other=>[...(other.hobbies||[]),...(other.interests||[])].some(value=>pattern.test(String(value))));
  const scentOwner=!likes(/향수|향수 시향|조향|향기/)&&ownerFor(/향수|향수 시향|조향|향기/);
  if(scentOwner)pool.push([
    `${scentOwner.name}의 향수들을 낯설게 살펴보는 중`,
    `방 한쪽에 놓인 향수병을 조심스럽게 들여다보다 왜 이렇게 비슷해 보이는 향을 여러 개 두는지 이해하지 못한 채 다시 제자리에 놓았어요.`,
    scentOwner.sleepRoomId||"bedroom"
  ]);
  const gameOwner=!likes(/게임|e스포츠|보드게임/)&&ownerFor(/게임|e스포츠|보드게임/);
  const home=state.homes[c.homeId],hasGameMachine=Object.values(home?.rooms||{}).some(room=>(room.furniture||[]).includes("게임기"));
  if(gameOwner&&hasGameMachine)pool.push([
    "거실 게임기를 잠깐 만져 보는 중",
    `${gameOwner.name}가 자주 쓰는 게임기의 메뉴를 몇 번 넘겨 봤지만 무엇이 재미있는지 잘 모르겠다는 표정으로 조작기를 내려놓았어요.`,
    "living"
  ]);
  const artOwner=!likes(/그림|드로잉|미술|공예|도예|재봉|뜨개|목공/)&&ownerFor(/그림|드로잉|미술|공예|도예|재봉|뜨개|목공/);
  if(artOwner)pool.push([
    `${artOwner.name}의 작업 도구를 구경하는 중`,
    `용도가 다른 도구가 너무 많아 어느 것을 어디에 쓰는지 가늠하지 못하고, 흐트러뜨리지 않도록 손대지 않은 채 모양만 살펴봤어요.`,
    "study"
  ]);
  const instrumentOwner=!likes(/음악|악기|연주|기타|피아노|드럼|바이올린/)&&ownerFor(/악기|연주|기타|피아노|드럼|바이올린/);
  if(instrumentOwner)pool.push([
    `${instrumentOwner.name}의 악기를 바라보는 중`,
    `손가락을 어디에 놓아야 소리가 나는지도 몰라 괜히 건드렸다 망가뜨릴까 봐 가까이에서 생김새만 살펴보고 있어요.`,
    "study"
  ]);
  (home?.pets||[]).forEach(pet=>{
    const roomKey=home.rooms?.[pet.room]?pet.room:(home.rooms?.living?"living":Object.keys(home.rooms||{})[0]||"living");
    const species=pet.species==="기타"?(pet.customSpecies?.trim()||"함께 사는 존재"):pet.species;
    const playText={
      강아지:`${pet.name}이 좋아하는 장난감을 굴려 주고, 흥분이 너무 높아지지 않게 잠깐씩 쉬어 가며 함께 놀고 있어요.`,
      고양이:`${pet.name}이 먼저 관심을 보이는 거리에서 장난감을 천천히 움직이고, 숨거나 쉬고 싶을 때는 방해하지 않았어요.`,
      새:`${pet.name}이 안전하게 움직일 수 있는 범위를 확인한 뒤 좋아하는 놀이와 간식을 번갈아 건네고 있어요.`,
      거북이:`${pet.name}의 속도를 재촉하지 않고 탐색하는 방향을 지켜보며 안전한 공간을 천천히 정돈해 주고 있어요.`,
      호랑이:`${pet.name}과 충분한 거리를 유지한 채 튼튼한 장난감을 움직여 주고, 반응을 살피며 안전하게 놀고 있어요.`,
      인공지능:`${pet.name}과 짧은 게임을 실행하고 서로의 반응 속도와 선택을 비교하며 함께 시간을 보내고 있어요.`,
      식물:`${pet.name}의 흙과 잎 상태를 살피고 화분을 돌려 빛을 고르게 받도록 조용히 돌보고 있어요.`,
      드래곤:`${pet.name}이 쫓기 좋아하는 장난감을 움직여 주자 꼬리와 날개를 들썩이며 주위를 신나게 돌고 있어요.`,
      기타:`${pet.name}이 좋아하는 방식과 싫어하는 자극을 살피며 무리하지 않는 범위에서 함께 놀고 있어요.`
    };
    pool.push([`${pet.name}와 놀아 주는 중`,playText[pet.species]||`${pet.name}의 반응을 살피며 ${species}에게 익숙한 방식으로 함께 시간을 보내고 있어요.`,roomKey,`pet:${pet.id}`,{petId:pet.id}]);
  });
  const body=c.bodyProfile||{},wheelchair=body.wheelchair||{},arm=body.prostheticArm||{},leg=body.prostheticLeg||{},hearing=body.hearing||{},vision=body.vision||{};
  Object.entries(state.homes[c.homeId]?.rooms||{}).forEach(([roomKey,room])=>{
    (room.furniture||[]).forEach(rawName=>{
      const normalizedName=normalizedFurnitureName(rawName);
      if(normalizedName==="러닝머신"&&wheelchair.type&&wheelchair.type!=="사용하지 않음")return;
      const spec=FURNITURE_BEHAVIOR[normalizedName];
      if(!spec)return;
      const familiar=spec.interest.test(characterInterests(c));
      const variants=familiar?spec.skilled:spec.novice;
      variants.forEach((text,index)=>pool.push([
        familiar?spec.title:`${rawName}을 서툴게 만져 보는 중`,
        text,
        roomKey,
        `furniture:${rawName}:${familiar?"familiar":"novice"}:${index}`
      ]));
    });
  });
  if(wheelchair.type&&wheelchair.type!=="사용하지 않음"&&hash(`${c.id}:${dayKey(date)}:wheelchair-home-focus`)%6===0){
    pool.push(
      ["현관에서 이동 준비를 점검하는 중",wheelchair.type==="전동 휠체어"?"배터리 잔량과 조작부, 타이어 상태를 확인하고 오늘 이동할 동선을 살펴봤어요.":"타이어와 브레이크, 쿠션 위치를 확인하고 자기 몸에 편안한 상태로 맞췄어요.","entry"]
    );
  }
  if(arm.side&&arm.side!=="사용하지 않음"){
    const armLabel=`${arm.side==="양쪽"?"양쪽":arm.side} ${arm.custom||arm.type||"의수"}`;
    pool.push(
      [`${armLabel}의 상태를 살피는 중`,`소켓과 연결 부위를 확인하고 피부에 불편한 곳이 없는지 살핀 뒤 오늘 할 일에 맞게 조절했어요.`,"bedroom"],
      [`${armLabel}에 맞는 도구를 준비하는 중`,"자기가 익숙하게 쓰는 도구의 위치와 잡는 방식을 맞춰 놓고 필요한 일을 자연스럽게 시작했어요.","study"]
    );
  }
  if(leg.side&&leg.side!=="사용하지 않음"){
    const legLabel=`${leg.side==="양쪽"?"양쪽":leg.side} ${leg.custom||leg.type||"의족"}`;
    pool.push(
      [`${legLabel}의 착용 상태를 확인하는 중`,"소켓과 정렬 상태를 살피고 오늘 몸 상태에 편안한지 확인한 뒤 자기 속도로 움직이기 시작했어요.","bedroom"],
      ["오늘 활동에 맞는 이동 준비를 하는 중",`${legLabel}과 신발, 필요한 관리 용품을 오늘 일정에 맞춰 차분히 챙겼어요.`,"entry"]
    );
  }
  const hearingSupports=Array.isArray(hearing.supports)?hearing.supports:[];
  if(hearing.side&&hearing.side!=="설정하지 않음"){
    if(hearingSupports.includes("보청기")||hearingSupports.includes("인공와우"))pool.push(["청각 보조기기 상태를 확인하는 중",`${hearingSupports.includes("보청기")?"보청기":"인공와우"}의 배터리와 연결 상태를 확인하고 주변 소리가 편안한 설정으로 맞췄어요.`,"bedroom"]);
    if(hearingSupports.includes("자막"))pool.push(["보고 싶은 영상의 자막을 맞추는 중","자막 크기와 배경 대비를 읽기 편하게 바꾸고 내용에 집중할 준비를 했어요.","living"]);
  }
  const visionSupports=Array.isArray(vision.supports)?vision.supports:[];
  if(vision.side&&vision.side!=="설정하지 않음"){
    if(visionSupports.includes("화면 읽기"))pool.push(["화면 읽기로 오늘 정보를 확인하는 중","화면 읽기 기능으로 알림과 일정을 차례로 듣고 필요한 항목을 직접 골랐어요.","study"]);
    if(visionSupports.includes("흰지팡이"))pool.push(["현관의 이동 동선을 확인하는 중","흰지팡이와 외출 물품을 손이 닿는 자리에 챙기고 달라진 장애물이 없는지 확인했어요.","entry"]);
    if(visionSupports.includes("안내견"))pool.push(["안내견과 외출 준비를 하는 중","안내견의 하네스와 필요한 물품을 챙기고 오늘 갈 곳과 쉴 시간을 차분히 준비했어요.","entry"]);
  }
  const conditions=Array.isArray(body.healthConditions)?body.healthConditions:[];
  if(conditions.includes("당뇨병"))pool.push(
    ["외출용 건강 관리 물품을 챙기는 중","스스로 정한 관리 계획에 따라 측정 도구와 필요한 물품, 비상용 간식을 빠짐없이 챙겼어요.","entry"],
    ["오늘의 식사와 휴식 시간을 확인하는 중","치료를 임의로 바꾸지 않고 평소 관리 계획 안에서 일정과 식사 시간을 함께 살폈어요.","study"]
  );
  if(conditions.some(value=>["천식","심혈관 질환","관절 질환","만성 통증","신장 질환"].includes(value)))pool.push(
    ["오늘 몸 상태에 맞게 일정을 조절하는 중","몸의 신호를 살핀 뒤 무리하지 않도록 활동과 휴식 순서를 자기 기준에 맞게 바꿨어요.","study"],
    ["잠깐 쉬며 컨디션을 살피는 중","해야 할 일을 포기한 것이 아니라 오래 이어 가기 위해 필요한 만큼 쉬고 다시 시작할 시점을 정했어요.","living"]
  );
  return pool;
};

const MEDIEVAL_HOME_SCRIPTS=[
  ["벽난로의 불씨를 돌보는 중","재를 조심스럽게 걷어 내고 장작을 보태 방 안의 온기가 오래가도록 불을 살피고 있어요.","living"],
  ["창가에서 바느질하는 중","해가 잘 드는 창가에 앉아 해진 옷의 솔기를 꿰매고 느슨해진 단추를 단단히 달고 있어요.","living"],
  ["식료품 저장 상태를 살피는 중","말린 곡식과 소금에 절인 식재료를 하나씩 확인하고 먼저 먹어야 할 것부터 앞쪽에 놓고 있어요.","kitchen"],
  ["밀랍초를 손질하는 중","심지를 알맞게 다듬고 녹은 밀랍을 모아 밤에 쓸 초를 새로 빚고 있어요.","living"],
  ["손편지를 쓰는 중","깃펜 끝을 가다듬고 멀리 있는 사람에게 전할 소식을 종이 위에 천천히 적고 있어요.","study"],
  ["시장에 가져갈 바구니를 챙기는 중","동전 주머니와 장바구니를 확인하고 오늘 구해야 할 물건을 짧은 목록으로 적고 있어요.","entry"],
  ["가죽 장화를 손질하는 중","마른 흙을 털어 내고 가죽에 기름을 얇게 발라 다음 외출에 신을 장화를 돌보고 있어요.","entry"],
  ["허브를 말리는 중","깨끗이 다듬은 약초와 향초를 작은 다발로 묶어 바람이 잘 통하는 그늘에 걸고 있어요.","kitchen"],
  ["집안의 물을 채우는 중","빈 물항아리를 살피고 하루 동안 쓸 물을 길어 와 주방과 씻는 곳에 나누어 두고 있어요.","kitchen"],
  ["빵 반죽을 치대는 중","밀가루와 물, 발효종을 섞은 반죽을 힘 있게 치대고 천을 덮어 부풀기를 기다리고 있어요.","kitchen"],
  ["장부를 정리하는 중","양피지에 적어 둔 지출과 물품 수량을 다시 세어 보고 빠진 기록을 채우고 있어요.","study"],
  ["뜰에서 작은 손질을 하는 중","마른 잎을 걷고 흙을 고른 뒤 자라는 채소와 약초에 필요한 만큼 물을 주고 있어요.","living"]
];
function medievalize(c,item,date){
  const town=state.towns.find(t=>t.id===(item.townId||c.townId))||townFor(c);
  if(town?.era!=="medieval")return item;
  const swaps=[
    [/스마트폰|휴대폰|핸드폰/g,"손편지"],[/태블릿|컴퓨터|노트북/g,"장부와 필기도구"],
    [/TV|텔레비전|영상/g,"이야기책"],[/타이머|알람/g,"모래시계"],[/소셜 미디어|SNS/g,"소식"],
    [/자동차|차량|차로/g,"마차"],[/버스|지하철|대중교통/g,"역마차"],[/운전하는/g,"마차를 모는"],[/운전해/g,"마차를 몰아"],[/운전할/g,"마차를 몰 수"],[/운전/g,"마차 몰기"],
    [/카페/g,"여관"],[/커피|라테|라떼/g,"따뜻한 허브차"],[/회사|오피스/g,"길드 회관"],
    [/냉장고/g,"식료품 저장고"],[/택배/g,"짐마차"],[/우편물/g,"전령이 전한 서신"],
    [/충전기|충전/g,"등잔 기름"],[/전등|조명/g,"촛불"],[/엘리베이터/g,"계단"]
  ];
  const convert=text=>swaps.reduce((value,[pattern,replacement])=>value.replace(pattern,replacement),String(text||""));
  return {...item,title:convert(item.title),desc:convert(item.desc)};
}
function contextualDailyEvent(c,time,date){
  const age=String(c.ageGroup||"성인"),pool=[];
  if(["영아","유아","어린이"].includes(age))pool.push(
    ["거실 바닥에서 놀이를 펼치는 중","손에 잡히는 장난감과 그림책을 늘어놓고 마음에 드는 것을 번갈아 살펴보고 있어요.","living"],
    ["오늘 있었던 일을 재잘거리는 중","기억나는 장면을 순서와 상관없이 신나게 꺼내며 곁의 어른에게 반응을 기다리고 있어요.","living"]);
  if(["청소년","청년"].includes(age))pool.push(
    ["앞으로 하고 싶은 일을 찾아보는 중","관심 분야의 영상과 글을 비교하며 지금 좋아하는 일이 오래 이어질지 생각하고 있어요.","study"],
    ["친구들의 소식을 확인하는 중","또래가 올린 소식에 반응하면서도 자기 이야기를 어디까지 꺼낼지 잠시 고민하고 있어요.","living"]);
  if(["중년","장년","노년"].includes(age))pool.push(
    ["몸 상태를 천천히 점검하는 중","평소와 다른 피로가 없는지 살피고 무리하지 않도록 남은 일의 순서를 조정하고 있어요.","living"],
    ["오래된 물건을 꺼내 보는 중","손때가 묻은 물건을 닦으며 그 시절 함께했던 사람과 장소를 잠시 떠올리고 있어요.","study"]);
  if(/혼자가 편함|낯을 가림/.test(c.socialStyle||""))pool.push(
    ["조용한 자리를 골라 혼자 쉬는 중","사람이 적고 방해받지 않는 곳에서 생각을 정리하며 천천히 기운을 되찾고 있어요.","living"],
    ["답장을 쓰다 잠시 멈춘 중","상대가 오해하지 않을 표현을 고르느라 짧은 문장을 여러 번 고쳐 쓰고 있어요.","study"]);
  if(/먼저 다가감|무리의 중심/.test(c.socialStyle||""))pool.push(
    ["사람들을 모아 이야기를 꺼내는 중","어색하게 흩어진 분위기를 알아차리고 모두가 끼어들 수 있는 화제를 먼저 던졌어요.","living"],
    ["다음 모임을 정리하는 중","각자의 가능한 시간을 묻고 의견이 갈리는 부분을 자연스럽게 중간에서 맞추고 있어요.","study"]);
  if(/논리 우선|이성적인 편/.test(c.decisionStyle||""))pool.push(
    ["선택지를 표로 비교하는 중","비용과 시간, 예상 결과를 항목별로 적어 감정에 휩쓸리지 않게 결론을 좁히고 있어요.","study"]);
  if(/마음을 살핌|공감 우선/.test(c.decisionStyle||""))pool.push(
    ["아까 들은 말을 다시 생각하는 중","상대가 말끝을 흐린 이유를 떠올리며 다음에는 부담스럽지 않게 안부를 물을 방법을 고민하고 있어요.","living"]);
  if(/무계획|즉흥적/.test(c.planningStyle||""))pool.push(
    ["갑자기 생각난 일을 시작한 중","원래 하려던 일을 잠시 미뤄 두고 지금 가장 마음이 가는 일에 손을 뻗었어요.","living"]);
  if(/계획적|강박적으로 계획함/.test(c.planningStyle||""))pool.push(
    ["남은 시간을 다시 배분하는 중","예상보다 늦어진 일을 확인하고 쉬는 시간까지 포함해 오늘 계획을 촘촘하게 다시 맞추고 있어요.","study"]);
  if((c.hobbies||[]).length)pool.push(
    [`${c.hobbies[hash(`${c.id}:${dayKey(date)}:context-hobby`)%c.hobbies.length]}에 몰두하는 중`,"좋아하는 활동에 필요한 도구를 차분히 꺼내고 자기 방식대로 집중할 환경을 만들었어요.","study"]);
  if(!pool.length)pool.push(["잠깐 숨을 고르는 중","하던 일을 멈추고 물을 한 모금 마시며 다음에 무엇을 할지 천천히 생각하고 있어요.","living"]);
  const script=pool[hash(`${c.id}:${dayKey(date)}:contextual-daily`)%pool.length];
  return homeEntry(c,time,script[0],personalityFlavor(c,script[1],"contextual-daily",date),script[2]);
}
function financialStressEvent(c,time,date){
  const lowWealth=["생계가 빠듯함","여유가 적음"].includes(c.wealth);
  const lavish=["취향에는 아끼지 않음","품질 우선","가격을 거의 신경 쓰지 않음"].includes(c.income);
  if(!lowWealth||!lavish||hash(`${c.id}:${dayKey(date)}:financial-stress`)%3!==0)return null;
  const scripts=[
    ["카드 한도를 확인하고 굳어진 중","결제 알림을 보고 남은 한도와 이번 달 청구 예정액을 다시 계산하고 있어요. 사고 싶던 물건은 장바구니에 남겨 두었어요."],
    ["이번 달 카드값을 나눠 계산하는 중","취향에 쓴 금액이 예상보다 커져 고정비와 결제일을 적어 보고 당분간 줄일 지출을 고르고 있어요."],
    ["결제가 거절되어 당황한 중","평소처럼 결제하려다 한도 알림을 확인하고 다른 결제 수단과 남은 생활비를 급히 살피고 있어요."],
    ["사고 싶은 것과 생활비 사이에서 고민하는 중","마음에 든 물건을 내려놓지 못한 채 가격표와 통장 잔액을 번갈아 확인하고 있어요."]
  ],script=scripts[hash(`${c.id}:${dayKey(date)}:financial-script`)%scripts.length];
  return homeEntry(c,time,script[0],script[1],"study");
}
function recordedInteractionEntries(c,date){
  const start=new Date(date.getFullYear(),date.getMonth(),date.getDate()).getTime();
  return (state.interactions||[]).filter(action=>action&&(action.actorId===c.id||action.targetId===c.id)&&action.createdAt>=start&&action.createdAt<start+86400000).map(action=>{
    const actor=state.characters[action.actorId],target=state.characters[action.targetId],other=c.id===action.actorId?target:actor,item=itemById(action.itemId);
    const stamp=new Date(action.createdAt),minute=stamp.getHours()*60+stamp.getMinutes();
    if(action.type==="buy"){
      const liked=(c.favorites?.[action.itemKind]||[]).includes(action.itemId);
      return homeEntry(c,minute,`${item?.name||"새 물건"}을 구매해 살펴보는 중`,liked?"마음에 두고 있던 물건을 손에 넣어 바로 즐겨 보고 있어요.":"새로 산 물건이 자기 취향에 맞는지 직접 사용하며 천천히 판단하고 있어요.","living",{itemId:action.itemId,itemKind:action.itemKind,interactionId:action.id});
    }
    if(action.type==="gift"){
      const liked=(target?.favorites?.[action.itemKind]||[]).includes(action.itemId);
      const title=c.id===action.actorId?`${other?.name}에게 ${item?.name||"선물"}을 건네는 중`:`${other?.name}에게 ${item?.name||"선물"}을 받는 중`;
      const itemName=item?.name||"선물";
      const desc=c.id===action.actorId?`${other?.name}의 반응을 살피며 직접 고른 ${itemName}을(를) 건넸어요.`:liked?`평소 좋아하던 ${itemName}이라 표정이 밝아지고 바로 가까이 두었어요.`:`예상하지 못한 ${itemName}을(를) 받아 고맙다고 말하고 자기 취향에 어떻게 맞을지 살펴보고 있어요.`;
      return entry(minute,title,desc,{home:true,room:"living",withId:other?.id,itemId:action.itemId,itemKind:action.itemKind,interactionId:action.id});
    }
    if(action.type==="exercise")return entry(minute,`${other?.name}와 함께 운동하는 중`,(c.hobbies||[]).includes("운동")?"익숙한 동작과 호흡을 맞추며 서로의 속도에 맞춰 즐겁게 몸을 움직이고 있어요.":"익숙하지 않은 동작은 조심스럽게 따라 하며 왜 이걸 즐기는지 조금씩 알아가고 있어요.",{townId:townFor(c,date).id,placeId:placeFor(["공원"],`${action.id}:exercise`,c,date)?.id,withId:other?.id,interactionId:action.id});
    return entry(minute,`${other?.name}와 함께 나들이하는 중`,"둘이 가고 싶던 장소를 골라 주변을 천천히 둘러보고 눈에 띄는 풍경 앞에서 이야기를 나누고 있어요.",{townId:townFor(c,date).id,placeId:placeFor(["공원","카페"],`${action.id}:outing`,c,date)?.id,withId:other?.id,interactionId:action.id});
  });
}
function build(c,date=new Date()){
  const currentHomeId=homeIdForDate(c,date);
  const wake=wakeAt(c,date), sleep=sleepAt(c,date);
  const sleepMinute=sleep<=wake?sleep+1440:sleep;
  const list=[entry(wake,"기상",wakeScene(c,date),{home:true,room:c.sleepRoomId||"bedroom",mood:"평온",stress:5})];
  list.push(...recordedInteractionEntries(c,date));
  const mobilityMorning=mobilityAidMorningEntry(c,wake+30,date);
  const morningAppearance=appearanceMorningEntry(c,wake+30,date);
  const morningCare=[mobilityMorning,morningAppearance].filter(Boolean);
  const morningCareTitle=mobilityMorning?.title||morningAppearance?.title||"욕실에서 씻는 중";
  const morningCareDescription=["세면대 앞에서 세수하고 이를 닦으며 잠을 깨고 있어요.",...morningCare.map(item=>item.desc)].join(" ");
  list.push(homeEntry(c,wake+30,morningCareTitle,morningCareDescription,mobilityMorning?"bedroom":"bath",morningCare.length?{careRoutine:"morning-care"}:{}));
  const makeupLevel=appearanceProfile(c).makeupLevel||"하지 않음";
  const breakfastMinute=wake+65+({스킨케어만:4,"선크림·기초만":7,"가벼운 메이크업":10,"포인트 메이크업":14,"풀 메이크업":18}[makeupLevel]||0);
  list.push(homeEntry(c,breakfastMinute,"주방에서 아침 준비 중","냉장고를 열어 먹을 것을 고르고 식탁에 아침을 차리고 있어요.","kitchen"));
  const morningRelation=related(c).filter(x=>homeIdForDate(x.other,date)===currentHomeId).sort((a,b)=>(relationPriority[b.r.type]||0)-(relationPriority[a.r.type]||0))[0];
  const morningTogether=morningRelation&&relationshipMorningEntry(c,morningRelation,breakfastMinute+30,date);
  if(morningTogether)list.push(morningTogether);
  const purpose=travelPurpose(c,date),destination=purpose.town,homeTown=townFor(c,date);
  const destinationPurpose=purpose.label;
  const work=purpose.kind==="birthday"&&workplaceTown(c)?.id!==destination.id?null:workEvent(c,Math.max(wake+90,540),date);
  const homeCars=state.homes[currentHomeId]?.cars||[];
  const rideablePet=(state.homes[currentHomeId]?.pets||[]).find(p=>p.rideable&&["드래곤","호랑이"].includes(p.species));
  const useMount=rideablePet&&(hash(`${c.id}:${dayKey(date)}:mount`)%2===0);
  const relation=preferredRelation(c),romantic=relation&&["부부","연인"].includes(relation.r.type)?relation.other:null;
  const partnerCars=romantic?state.homes[homeIdForDate(romantic,date)]?.cars||[]:[];
  const partnerCanDrive=romantic?.driverLicense&&partnerCars.length&&activityTown(romantic,date)?.id===destination.id;
  const selfCanDrive=c.driverLicense&&homeCars.length;
  if(destinationPurpose&&destination.id!==homeTown.id){
    const travelMinute=Math.max(wake+75,(work?.minute||720)-45);
    const mode=useMount?"mount":partnerCanDrive?"partner":selfCanDrive?"car":"transit";
    const title=mode==="mount"?`${rideablePet.name}을 타고 ${destination.name}으로 이동 중`:mode==="partner"?`${romantic.name}의 차를 타고 ${destination.name}으로 이동 중`:mode==="car"?`차를 운전해 ${destination.name}으로 이동 중`:`대중교통으로 ${destination.name} 이동 중`;
    const reason=destinationPurpose?`${destinationPurpose} 때문에 `:"";
    const desc=mode==="mount"?(rideablePet.species==="드래곤"?`${reason}${rideablePet.name}의 등에 올라 안전한 비행 경로를 따라 ${destination.name}으로 향하고 있어요.`:`${reason}${rideablePet.name}의 등에 올라 사람이 적고 안전한 길을 따라 ${destination.name}으로 향하고 있어요.`):mode==="partner"?`${reason}${romantic.name}가 운전하는 차에 함께 타고 ${destination.name}의 목적지로 향하고 있어요.`:mode==="car"?`${reason}집의 자동차를 직접 운전해 ${destination.name}으로 이동하고 있어요. 음주한 날에는 운전하지 않아요.`:`${reason}버스나 지하철 노선을 확인하고 ${destination.name}으로 이동하고 있어요.`;
    list.push(entry(travelMinute,title,desc,{townId:destination.id,transit:true,withId:mode==="partner"?romantic.id:undefined,mood:"이동"}));
  }
  const morning=morningScripts(c,date),commuteMinute=work&&!work.home?work.minute-35:Infinity;
  [wake+150,wake+200,wake+250,wake+300].forEach((minute,index)=>{
    if(minute<720&&minute<commuteMinute-10){
      const script=morning[index%morning.length];
      list.push(homeEntry(c,minute,script[0],script[1],script[2]));
    }
  });
  if(work){
    if(!work.home){
      const riding=rideablePet&&(hash(`${c.id}:${dayKey(date)}:ride-commute`)%3)===0,driving=!riding&&selfCanDrive&&(hash(`${c.id}:${dayKey(date)}:commute`)%2)===0;
      list.push(entry(work.minute-35,riding?`${rideablePet.name}을 타고 출근하는 중`:driving?"차로 출근하는 중":"대중교통으로 출근하는 중",riding?(rideablePet.species==="드래곤"?`${rideablePet.name}의 등에 올라 정해 둔 비행 경로로 직장을 향하고 있어요.`:`${rideablePet.name}의 등에 올라 안전한 길을 따라 직장을 향하고 있어요.`):driving?"차를 운전해 직장에 도착할 준비를 하고 있어요.":"버스나 지하철을 이용해 직장에 도착할 준비를 하고 있어요.",away(c,{placeId:work.placeId,mood:"출근"})));
    }
    list.push(work);
  }
  const lunchPlace=placeFor(["음식점"],`${c.id}:${dayKey(date)}:lunch`,c);
  const eatsOutForLunch=hash(`${c.id}:${dayKey(date)}:eats-out`)%4===0;
  if(eatsOutForLunch&&lunchPlace?.type==="음식점"){
    const food=catalogChoice(c,lunchPlace,"food",`${c.id}:${dayKey(date)}:lunch-food`);
    const lunchMinute=720+(hash(`${c.id}:${dayKey(date)}:lunch-minute`)%91);
    list.push(entry(lunchMinute,`${lunchPlace.name}에서 점심`,food?`${food.name}을 골라 식사하고 있어요.`:"점심을 먹으며 잠깐 쉬고 있어요.",away(c,{placeId:lunchPlace.id,itemId:food?.id,mood:"보통"})));
  }
  list.push(contextualDailyEvent(c,930,date));
  const hairCare=(!work||work.home)?appearanceCareEvent(c,990,date):null;if(hairCare)list.push(hairCare);
  const financialStress=financialStressEvent(c,1005,date);if(financialStress)list.push(financialStress);
  const birthdayKey=`${String(date.getMonth()+1).padStart(2,"0")}${String(date.getDate()).padStart(2,"0")}`;
  const birthdayCharacters=state.order.map(id=>state.characters[id]).filter(character=>character?.birthday===birthdayKey);
  if(birthdayCharacters.length){
    const host=birthdayCharacters[0],hostTown=townFor(host,date),restaurants=(hostTown?.places||[]).filter(place=>place.type==="음식점");
    const restaurant=restaurants.length&&hash(`${birthdayKey}:${date.getFullYear()}:birthday-place`)%2===0?restaurants[hash(`${birthdayKey}:restaurant`)%restaurants.length]:null;
    const names=birthdayCharacters.map(character=>character.name).join(", "),isBirthday=birthdayCharacters.some(character=>character.id===c.id);
    const title=isBirthday?`${names}의 생일파티에서 축하받는 중`:`${names}의 생일파티에서 함께 축하하는 중`;
    const desc=restaurant
      ?`${state.order.map(id=>state.characters[id]?.name).filter(Boolean).join(", ")}이 한자리에 모여 식사와 케이크를 나누고 생일을 축하하고 있어요.`
      :`${host.name}의 집에 모두 모여 음식을 차리고 케이크와 선물을 나누며 생일을 축하하고 있어요.`;
    const shared={mood:"축하",groupInteraction:true,withIds:state.order.filter(id=>id!==c.id),birthdayIds:birthdayCharacters.map(character=>character.id)};
    list.push(restaurant
      ?entry(1140,title,desc,{...shared,townId:hostTown.id,placeId:restaurant.id})
      :entry(1140,title,desc,{...shared,home:true,visitHomeId:host.homeId,room:"living"}));
  }
  const romanticConnection=related(c).some(({other,r})=>{
    if(!other)return false;
    const view=characterViewFor(c.id,other.id);
    return r?.temporalStatus!=="past"&&(
      /연인|부부/.test(String(r?.type||""))
      || /연애 감정|사랑/.test(String(view.overall||""))
    );
  });
  const socialChance=romanticConnection?2:4;
  const socialDay=hash(`${c.id}:${dayKey(date)}:social-day`)%socialChance===0;
  const socialMinute=1080+(hash(`${c.id}:${dayKey(date)}:social-minute`)%181);
  const social=socialDay?socialEvent(c,socialMinute,date):null; if(social)list.push(social);
  if(social?.withId){
    const romanticRelation=relationList().find(r=>((r.a===c.id&&r.b===social.withId)||(r.b===c.id&&r.a===social.withId))&&["연인","부부"].includes(r.type));
    if(romanticRelation){
      const partner=state.characters[social.withId],dateStart=social.minute-25;
      const datePlace=interactionPlace(social.placeId,social.townId||c.townId);
      const purpose=datePurpose(datePlace||{type:"집",id:`home:${currentHomeId}`},c,partner,date);
      const dateGroup=`date-${[c.id,social.withId].sort().join("-")}-${dayKey(date)}-${dateStart}-${hash(purpose).toString(36)}`;
      const dateMeta={townId:social.townId,placeId:social.placeId,withId:social.withId,mood:"데이트",dateGroup,datePurpose:purpose,dateStartMinute:dateStart,dateEndMinute:social.minute+65};
      const purposeScene=datePurposeScene(purpose,datePlace||{type:"집",id:`home:${currentHomeId}`},c,partner,date);
      social.title=resolveEntityParticles(`${togetherWith(partner?.name||"상대")} 데이트 · ${purpose}`);
      social.desc=resolveEntityParticles(purposeScene?.first||`${togetherWith(partner?.name||"상대")} 오늘 하기로 정한 ${object(purpose)} 순서대로 이어 가고 있어요.`);
      Object.assign(social,dateMeta);
      list.push(entry(dateStart,`${partner?.name}와 데이트 · ${purpose} 시작`,`${partner?.name}와 만나 ${purpose}에 필요한 자리와 순서를 함께 확인했어요.`,dateMeta));
      list.push(entry(social.minute+65,`${partner?.name}와 데이트 · ${purpose} 마무리`,`${partner?.name}와 ${object(purpose)} 마친 뒤 가장 마음에 들었던 순간을 하나씩 이야기하고 다음 약속을 정했어요.`,dateMeta));
    }
  }
  if(destinationPurpose&&destination.id!==homeTown.id){
    const returnMinute=Math.min(sleepMinute-75,1200);
    const returnMode=useMount?"mount":partnerCanDrive?"partner":selfCanDrive?"car":"transit";
    const returnTitle=returnMode==="mount"?`${rideablePet.name}을 타고 ${homeTown.name}으로 돌아가는 중`:returnMode==="partner"?`${romantic.name}의 차를 타고 ${homeTown.name}으로 돌아가는 중`:returnMode==="car"?`차를 운전해 ${homeTown.name}으로 돌아가는 중`:`대중교통으로 ${homeTown.name}으로 돌아가는 중`;
    const returnDesc=returnMode==="mount"?(rideablePet.species==="드래곤"?`${rideablePet.name}의 등에 올라 정해 둔 비행 경로를 따라 집이 있는 마을로 돌아가고 있어요.`:`${rideablePet.name}의 등에 올라 사람이 적고 안전한 길을 따라 집이 있는 마을로 돌아가고 있어요.`):returnMode==="partner"?`${romantic.name}가 운전하는 차에 함께 타고 집이 있는 마을로 돌아가고 있어요.`:returnMode==="car"?"바깥 일정을 마치고 직접 차를 운전해 집이 있는 마을로 돌아가고 있어요.":"버스나 지하철 노선을 확인하고 집이 있는 마을로 돌아가고 있어요.";
    list.push(entry(returnMinute,returnTitle,returnDesc,{townId:homeTown.id,transit:true,returningHome:true,transportMode:returnMode,withId:returnMode==="partner"?romantic.id:undefined,mood:"이동"}));
  }
  let stress=Math.max(...list.map(x=>x.stress||0));
  const currentResidence=residenceForDate(c,date),currentSleepRoom=currentResidence?.sleepRoomId||c.sleepRoomId||"bedroom";
  const housemate=state.order.map(id=>state.characters[id]).find(other=>other&&other.id!==c.id&&homeIdForDate(other,date)===currentHomeId);
  const sameBedroomRelation=related(c).filter(x=>homeIdForDate(x.other,date)===currentHomeId&&(residenceForDate(x.other,date)?.sleepRoomId||x.other.sleepRoomId||"bedroom")===currentSleepRoom).sort((a,b)=>(relationPriority[b.r.type]||0)-(relationPriority[a.r.type]||0))[0];
  const homeRelation=related(c).filter(x=>homeIdForDate(x.other,date)===currentHomeId).sort((a,b)=>(relationPriority[b.r.type]||0)-(relationPriority[a.r.type]||0))[0];
  const otherSleep=housemate?(()=>{const value=sleepAt(housemate,date);return value<=wakeAt(housemate,date)?value+1440:value})():Infinity;
  const eveningMinute=Math.max(1020,Math.min(1260,sleepMinute-45,otherSleep-45));
  if(sameBedroomRelation){
    const otherBedtime=(()=>{const value=sleepAt(sameBedroomRelation.other,date);return value<=wakeAt(sameBedroomRelation.other,date)?value+1440:value})();
    const beforeSleep=Math.max(0,Math.min(sleepMinute,otherBedtime)-25);
    const scene=relationshipHomeEntry(c,sameBedroomRelation,beforeSleep,date);
    scene.title=`잠들기 전 · ${scene.title}`;
    scene.room=currentSleepRoom;
    scene.withId=sameBedroomRelation.other.id;
    scene.bedtimeInteraction=true;
    list.push(scene);
  }else if(homeRelation){
    list.push(relationshipHomeEntry(c,homeRelation,eveningMinute,date));
  }else if(housemate){
    list.push(roommateHomeEntry(c,housemate,eveningMinute,date));
  }else{
    const homeScripts=[...homeActivityPoolFor(c,date),
      ["거실 소파에서 영상 보는 중","TV 앞 소파에 기대어 좋아하는 영상을 이어 보고 있어요.","living"],
      ["서재에서 취미를 즐기는 중","책상 위에 좋아하는 물건을 펼쳐 놓고 취미에 집중하고 있어요.","study"],
      ["주방에서 간식 만드는 중","주방 조리대에서 간단한 간식과 마실 것을 준비하고 있어요.","kitchen"],
      ["침실에서 음악 듣는 중","침대에 기대어 이어폰으로 좋아하는 음악을 듣고 있어요.","bedroom"],
      ["현관에서 내일 가방을 챙기는 중","필요한 물건을 하나씩 꺼내 확인하고 빠뜨리지 않도록 가방 안쪽부터 정리하고 있어요.","entry"],
      ["욕실에서 천천히 씻는 중","따뜻한 물로 하루의 피로를 씻어 내고 향이 편안한 제품으로 느긋하게 마무리하고 있어요.","bath"],
      ["주방에서 따뜻한 음료를 준비하는 중","잠들기 전 속을 편안하게 해 줄 음료를 천천히 우리며 조용한 시간을 보내고 있어요.","kitchen"],
      ["거실 조명을 낮추는 중","밝은 조명을 끄고 작은 등만 남겨 집 안을 차분한 저녁 분위기로 바꾸고 있어요.","living"],
      ["서재에서 오늘을 기록하는 중","오늘 마음에 남은 일과 내일 잊지 말아야 할 것을 짧게 적고 책상을 정리하고 있어요.","study"],
      ["침실에서 내일 옷을 고르는 중","날씨와 일정을 확인한 뒤 어울릴 옷을 꺼내 한곳에 가지런히 놓고 있어요.","bedroom"],
      ["거실에서 가벼운 스트레칭 중","하루 종일 굳은 어깨와 허리를 천천히 풀며 호흡을 고르고 있어요.","living"],
      ["주방을 마감하는 중","남은 음식을 보관하고 조리대의 물기를 닦아 아침에 바로 쓸 수 있게 정리하고 있어요.","kitchen"]
    ];
    if(c.planningStyle==="즉흥적")homeScripts.push(["거실에서 갑자기 취미를 시작한 중","쉬려다가 눈에 들어온 재료를 꺼내 예상보다 오래 손을 움직이고 있어요.","living"]);
    if(c.planningStyle==="강박적으로 계획함")homeScripts.push(["서재에서 내일 계획을 다시 짜는 중","분 단위 일정과 이동 시간을 다시 계산하고 예상 밖의 상황에 쓸 대체 계획까지 따로 적고 있어요.","study"],["침실에서 준비물을 재확인하는 중","이미 챙긴 물건을 목록과 다시 대조하고 놓친 것이 없다는 확신이 들 때까지 순서를 반복하고 있어요.","bedroom"]);
    if(c.planningStyle==="무계획")homeScripts.push(["거실에서 마음 가는 대로 시간을 보내는 중","무엇을 할지 정하지 않은 채 이것저것 건드리다가 가장 재미있는 일에 그대로 머물고 있어요.","living"],["주방에서 즉흥적으로 야식을 만드는 중","정해 둔 메뉴 없이 냉장고에서 눈에 띄는 재료를 꺼내 그 자리에서 조합하고 있어요.","kitchen"]);
    if(c.activityTempo==="부산스럽게 여러 일을 오감"||c.activityTempo==="허둥대며 주의가 자주 옮겨감")homeScripts.push(["집 안을 오가며 자잘한 일을 하는 중","컵을 치우러 갔다가 빨래가 눈에 들어오고, 다시 충전기를 찾느라 여러 방을 바쁘게 오가고 있어요.","living"]);
    if(c.neatness==="흐트러짐을 못 참음")homeScripts.push(["집 안을 마지막으로 점검하는 중","삐뚤어진 물건과 남은 먼지를 찾아 제자리에 놓아야 마음이 놓이는 듯 꼼꼼히 살피고 있어요.","living"]);
    if(c.neatness==="결벽에 가까움")homeScripts.push(["욕실과 손잡이를 소독하는 중","자주 손이 닿는 곳을 순서대로 닦고 마른 자국이 남지 않았는지 빛에 비춰 다시 확인하고 있어요.","bath"]);
    if(c.fashionSense==="옷을 매우 잘 입음"||c.fashionSense==="감각적으로 잘 입음")homeScripts.push(["침실에서 내일 코디를 맞추는 중","옷의 색과 소재를 번갈아 대 보며 신발과 소품까지 자연스럽게 이어지는 조합을 만들고 있어요.","bedroom"]);
    const script=homeScripts[hash(`${c.id}:${dayKey(date)}:home-evening`)%homeScripts.length];
    list.push(homeEntry(c,eveningMinute,script[0],personalityFlavor(c,script[1],"evening",date),script[2],script[4]||{}));
  }
  const scheduled=(state.routines?.[c.id]||[]).filter(item=>Number(item.day)===date.getDay());
  scheduled.forEach(item=>{
    const minute=mins(item.start),place=state.towns.flatMap(t=>(t.places||[]).map(p=>({...p,townId:t.id}))).find(p=>p.id===item.placeId);
    if(place&&place.townId!==destination.id&&place.townId!==homeTown.id)return;
    const companions=(item.withIds||[]).map(id=>state.characters[id]).filter(Boolean);
    const companionText=companions.length?`${companions.map(x=>x.name).join(", ")}와 함께 `:"";
    const isDate=item.type==="데이트"&&Boolean(companions[0]);
    const purpose=isDate?String(item.title||item.notes||"함께 정한 약속").replace(/^데이트\s*[·:-]?\s*/,"").trim():"";
    const endMinute=mins(item.end);
    const dateGroup=isDate?`date-${[c.id,companions[0].id].sort().join("-")}-${dayKey(date)}-${minute}-${hash(purpose).toString(36)}`:"";
    const dateMeta=isDate?{withId:companions[0].id,mood:"데이트",dateGroup,datePurpose:purpose,dateStartMinute:minute,dateEndMinute:endMinute}:{withId:companions[0]?.id,mood:"일정"};
    const desc=item.notes||(isDate?`${purpose} 약속에서 정한 일을 ${companions[0].name}와 순서대로 진행하고 있어요.`:`${companionText}${item.type} 일정을 진행하고 있어요. 종료 예정 시각은 ${item.end}예요.`);
    const title=isDate?`${companions[0].name}와 데이트 · ${purpose}`:item.title;
    if(place)list.push(entry(minute,title,desc,{townId:place.townId,placeId:place.id,...dateMeta}));
    else list.push(homeEntry(c,minute,title,desc,item.type==="휴식"?"living":"study",dateMeta));
  });
  if(homeTown?.era==="medieval"){
    const minute=Math.min(sleepMinute-120,Math.max(wake+210,600));
    if(minute>(wake+80)&&minute<(sleepMinute-45)){
      const script=MEDIEVAL_HOME_SCRIPTS[hash(`${c.id}:${dayKey(date)}:medieval-home`)%MEDIEVAL_HOME_SCRIPTS.length];
      list.push(homeEntry(c,minute,script[0],script[1],script[2]));
    }
  }
  return list.map(item=>withResidenceLocation(c,adaptAccessibilityWording(c,medievalize(c,item,date)),date)).sort((a,b)=>a.minute-b.minute);
}

const ENGINE_VERSION="20260807s";
// 코드 업데이트는 이미 저장된 생활을 바꾸지 않습니다.
// 캐릭터·관계·일정처럼 사용자가 직접 바꾼 설정만 새 장면 계산에 반영합니다.
function signature(c){return JSON.stringify({createdAt:c.createdAt,birthday:c.birthday,birthdays:state.order.map(id=>[id,state.characters[id]?.birthday]),townId:c.townId,homeId:c.homeId,residences:c.residences,homes:(c.residences||[]).map(item=>{const home=state.homes[item.homeId];return[home?.id,home?.kind,home?.townId,home?.exteriorStyle,home?.beautyLevel,home?.ownershipType,home?.ownerKind,home?.ownerCharacterId,home?.ownerName,Object.entries(home?.rooms||{}).map(([key,room])=>[key,room?.interiorStyle]),home?.cars?.length,home?.pets?.length]}),ageGroup:c.ageGroup,gender:c.gender,attractedGenders:c.attractedGenders,touchReaction:c.touchReaction,appearanceLevel:c.appearanceLevel,appearanceInterest:c.appearanceInterest,appearanceTags:c.appearanceTags,attractionTraits:c.attractionTraits,personalityTypes:c.personalityTypes,characterTraits:c.characterTraits,traitExpressions:c.traitExpressions,traitNotesInScripts:c.traitNotesInScripts,traitNotes:c.traitNotesInScripts?c.traitNotes:"",bodyProfile:c.bodyProfile,timelineResetAt:c.timelineResetAt,wake:c.wake,wakeHabit:c.wakeHabit,sleep:c.sleep,sleepHabit:c.sleepHabit,job:c.job,jobTitle:c.jobTitle,workplaceId:c.workplaceId,routines:state.routines?.[c.id],hobbies:c.hobbies,interests:c.interests,inventory:c.inventory,foodPreferences:c.foodPreferences,favoriteScentNotes:c.favoriteScentNotes,favoriteStoryGenres:c.favoriteStoryGenres,favoriteVideoGenres:c.favoriteVideoGenres,favoriteGameGenres:c.favoriteGameGenres,favoriteFashionStyles:c.favoriteFashionStyles,drinkTypes:c.drinkTypes,musicGenres:c.musicGenres,socialStyle:c.socialStyle,perceptionStyle:c.perceptionStyle,decisionStyle:c.decisionStyle,planningStyle:c.planningStyle,activityTempo:c.activityTempo,neatness:c.neatness,interference:c.interference,conflictStyle:c.conflictStyle,affectionStyle:c.affectionStyle,energyRhythm:c.energyRhythm,rels:relationList().filter(r=>r.a===c.id||r.b===c.id),views:state.characterViews?.[c.id],townEras:state.towns.map(t=>[t.id,t.era]),places:state.towns.flatMap(t=>(t.places||[]).map(p=>[p.id,p.type,p.stock,p.priceRange,p.spicy,p.sweet]))})}

function mergeImmutableEntries(kept,generated){
  const merged=[...kept],seen=new Set(kept.map(item=>`${item.minute}|${item.title}|${item.placeId||""}|${item.room||""}`));
  generated.forEach(item=>{
    const id=`${item.minute}|${item.title}|${item.placeId||""}|${item.room||""}`;
    if(!seen.has(id)){seen.add(id);merged.push(item)}
  });
  return merged.sort((a,b)=>a.minute-b.minute);
}
function cleanExactRepeatedEntries(entries){
  const kept=[];
  [...entries].sort((a,b)=>a.minute-b.minute).forEach(item=>{
    const repeated=kept.some(previous=>
      previous.title===item.title&&
      previous.desc===item.desc&&
      previous.room===item.room&&
      Math.abs(Number(previous.minute)-Number(item.minute))<240
    );
    if(!repeated)kept.push(item);
  });
  return kept;
}
function cleanSameMinuteEntries(entries){
  const byMinute=new Map();
  [...entries].sort((a,b)=>a.minute-b.minute).forEach(item=>{
    const minute=Number(item.minute);
    if(!Number.isFinite(minute))return;
    const previous=byMinute.get(minute);
    if(!previous||item.groupInteraction||!previous.groupInteraction)byMinute.set(minute,item);
  });
  return [...byMinute.values()].sort((a,b)=>a.minute-b.minute);
}
function cleanInvalidRoomAndHobbyEntries(c,entries){
  const interests=[...(c.hobbies||[]),...(c.interests||[])].map(String);
  const likesScent=interests.some(value=>/향수|향수 시향|조향|향기/.test(value));
  return entries.filter(item=>!(item.title?.includes("침실에서 향을 고르는")&&!likesScent)).map(item=>{
    const residence=(c.residences||[]).find(value=>value.homeId===(item.visitHomeId||c.homeId));
    const sleepRoom=residence?.sleepRoomId||c.sleepRoomId||"bedroom";
    if(item.home&&item.title?.startsWith("침실에서")&&item.room!==sleepRoom){
      return {...item,room:sleepRoom};
    }
    return item;
  });
}
function cleanAccumulatedGroupEntries(entries){
  return entries.map(item=>{
    if(!item?.groupInteraction)return item;
    const title=[...new Set(String(item.title||"").split(" · ").map(part=>part.trim()).filter(Boolean))].join(" · ");
    return {...item,title,desc:cleanRepeatedSceneText(item.desc)};
  });
}
function cleanLegacyDateEntries(entries){
  const chores=/실험 과정|장비|이동 장비|점검|세탁|침구|이불|청소|정리|집안일|가사|음료를 만드는|차를 우리는|빨래|설거지|재활용|화장품/;
  return entries.map(item=>{
    if(!item?.dateGroup||item.datePurpose)return item;
    const text=`${item.title||""} ${item.desc||""}`;
    if(chores.test(text)){
      const title=String(item.title||"").replace(/^.+?와 데이트\s*·\s*/,"").replace(/^데이트\s*·\s*/,"");
      const {dateGroup,datePurpose,dateStartMinute,dateEndMinute,...ordinary}=item;
      return {...ordinary,title,mood:item.mood==="데이트"?"일상":item.mood};
    }
    const raw=String(item.title||"").replace(/^.+?와 데이트\s*·\s*/,"").replace(/^데이트\s*·\s*/,"");
    const purpose=raw.replace(/\s+(시작|마무리|약속에서 만남)$/,"").trim();
    return purpose?{...item,datePurpose:purpose,dateGroup:`${item.dateGroup}-${hash(purpose).toString(36)}`} :item;
  });
}
function cleanSelfCompanionEntries(c,entries){
  return entries.filter(item=>item?.withId!==c.id);
}
function companionWasActuallyThere(c,item,date){
  if(!item?.withId)return true;
  const other=state.characters[item.withId],otherDay=other?.days?.[dayKey(date)];
  if(!other||!Array.isArray(otherDay?.entries))return false;
  return otherDay.entries.some(otherEntry=>
    otherEntry.withId===c.id&&
    otherEntry.townId===item.townId&&
    otherEntry.placeId===item.placeId&&
    Math.abs(otherEntry.minute-item.minute)<=90
  );
}

export function timeline(c,date=new Date()){
  if(!c||typeof c!=="object")return[];
  const key=dayKey(date), sig=signature(c);
  if(!c.days||typeof c.days!=="object"||Array.isArray(c.days))c.days={};
  if(c.days[key]&&(!c.days[key]||typeof c.days[key]!=="object"||Array.isArray(c.days[key])))delete c.days[key];
  const old=c.days[key];
  if(old&&Array.isArray(old.entries)){
    old.entries=old.entries.filter(item=>item&&typeof item==="object"&&!Array.isArray(item));
    const cleaned=cleanAccumulatedGroupEntries(cleanSelfCompanionEntries(c,cleanInvalidRoomAndHobbyEntries(c,cleanSameMinuteEntries(cleanExactRepeatedEntries(cleanLegacyDateEntries(old.entries))))));
    if(JSON.stringify(cleaned)!==JSON.stringify(old.entries)){old.entries=cleaned;save(false,false)}
  }
  const today=key===dayKey(new Date());
  // 한 번 만든 하루의 기록은 앱 업데이트나 스크립트 팩 변경으로 다시 쓰지 않는다.
  // 현재 시각 이후에 생기는 실시간 기록은 commitLiveEntry가 기존 배열 뒤에만 추가한다.
  if(old&&today&&Array.isArray(old.entries)&&old.signature===sig)return old.entries;
  if(old&&!today)return Array.isArray(old.entries)?old.entries:[];
   if(!old||old.signature!==sig){
     let entries=build(c,date);
    if(c.createdAt){
      const created=new Date(c.createdAt),target=new Date(date.getFullYear(),date.getMonth(),date.getDate());
      const createdDay=new Date(created.getFullYear(),created.getMonth(),created.getDate());
      if(target<createdDay)entries=[];
      else if(target.getTime()===createdDay.getTime())entries=entries.filter(item=>item.minute>=created.getHours()*60+created.getMinutes());
    }
    const settingsChanged=old&&today&&Number(c.timelineResetAt||0)>Number(old.settingsAppliedAt||0);
    if(old&&today&&!settingsChanged){
      const cutoff=nowMin(date),kept=cleanExactRepeatedEntries((Array.isArray(old.entries)?old.entries:[]).filter(item=>item.minute<=cutoff));
      entries=mergeImmutableEntries(kept,entries.filter(item=>item.minute>cutoff));
    }
    c.days[key]={signature:sig,engineVersion:ENGINE_VERSION,settingsAppliedAt:Number(c.timelineResetAt||0),entries};
    save(false,false);
  }
  return Array.isArray(c.days[key]?.entries)?c.days[key].entries:[];
}
export function visibleTimeline(c,date=new Date()){return timeline(c,date).filter(x=>x&&Number(x.minute)<=nowMin(date))}

function commitLiveEntry(c,date,item){
  const key=dayKey(date),day=c.days?.[key];
  if(!day||!item)return item;
  const entries=Array.isArray(day.entries)?day.entries:[];
  const interactionIndex=item.interactionId?entries.findIndex(entry=>entry.interactionId===item.interactionId&&Number(entry.minute)===Number(item.minute)):-1;
  if(interactionIndex>=0){
    day.entries=entries.map((entry,index)=>index===interactionIndex?{...entry,...item}:entry);
    save(false,false);
    return item;
  }
  const sceneKey=value=>String(value||"").split(" · ")[0].replace(/\s+/g," ").trim();
  const sameDateEntries=item.dateGroup?entries.filter(entry=>entry.dateGroup===item.dateGroup):[];
  const lastDateEntry=sameDateEntries.slice().sort((a,b)=>Number(a.minute)-Number(b.minute)).at(-1);
  const dateGap=lastDateEntry?30+(hash(`${item.dateGroup}:${lastDateEntry.minute}:date-gap`)%31):0;
  const duplicate=entries.some(entry=>
    (entry.minute===item.minute&&entry.title===item.title&&entry.placeId===item.placeId&&entry.room===item.room)||
    (!item.dateGroup&&sceneKey(entry.title)===sceneKey(item.title)&&entry.placeId===item.placeId&&entry.room===item.room&&Math.abs(Number(entry.minute)-Number(item.minute))<240)
  )||Boolean(lastDateEntry&&Number(item.minute)-Number(lastDateEntry.minute)<dateGap);
  if(!duplicate){day.entries=mergeImmutableEntries(entries,[item]);save(false,false)}
  return item;
}
function liveGapEvent(c,last,n,date){
  const gap=30+(hash(`${c.id}:${dayKey(date)}:${last?.minute??n}:reaction-gap`)%31);
  const minute=Math.min(n,(Number(last?.minute)||n)+gap);
  if(last?.placeId){
    const currentTown=state.towns.find(t=>t.id===(last.townId||c.townId))||townFor(c);
    const place=(currentTown?.places||[]).find(p=>p.id===last.placeId);
    const shortStay=["카페","음식점","옷가게","쇼핑몰"].includes(place?.type);
    if(shortStay){
      const recentAtPlace=(c.days?.[dayKey(date)]?.entries||[]).filter(item=>item.placeId===place.id&&Number(item.minute)<=Number(last.minute)&&Number(last.minute)-Number(item.minute)<=180);
      if(recentAtPlace.length<2){
        const stayScenes={
          카페:["주문한 음료를 천천히 마시는 중","방금 준비한 음료의 온도와 향을 느끼며 자리에 머물러 천천히 마시고 있어요."],
          음식점:["식사를 천천히 마무리하는 중","고른 음식을 서두르지 않고 먹은 뒤 식탁을 정돈하며 잠시 쉬고 있어요."],
          옷가게:["고른 옷을 다시 비교하는 중","방금 살펴본 옷의 소재와 쓰임을 비교하고 실제로 자주 입을지를 차분히 생각하고 있어요."],
          쇼핑몰:["필요한 물건을 한 번 더 확인하는 중","목록과 장바구니를 맞춰 보고 충동적으로 더 사지 않도록 필요한 것만 남기고 있어요."]
        };
        const stay=stayScenes[place.type];
        return entry(minute,stay[0],personalityFlavor(c,stay[1],"short-stay-continuation",date),{townId:currentTown.id,placeId:place.id,mood:last.mood||"보통"});
      }
      return entry(minute,"집에 돌아온 참",`${place.name}에서의 일정을 마치고 집으로 돌아와 신발과 겉옷을 정리하고 있어요.`,{townId:c.townId,home:true,room:"entry",mood:"귀가"});
    }
    const parkScenes=[
      ["공원 벤치에서 잠시 쉬는 중","걷던 길 옆 벤치에 앉아 물을 마시며 나무와 지나가는 사람들을 느긋하게 바라보고 있어요."],
      ["공원 안내판을 살펴보는 중","산책로와 주변 시설이 표시된 안내판 앞에서 다음에 둘러볼 곳을 천천히 고르고 있어요."],
      ["공원의 조용한 자리를 찾는 중","사람이 몰린 길을 벗어나 햇빛과 바람이 편안한 자리를 골라 잠시 머물고 있어요."],
      ["공원 풍경을 기록하는 중","눈에 들어온 나무와 하늘의 색을 사진으로 남기며 천천히 둘러보고 있어요."]
    ];
    const parkScene=parkScenes[hash(`${c.id}:${dayKey(date)}:${Math.floor(n/45)}:park-continuation`)%parkScenes.length];
    const continuations={
      카페:["카페에서 여유를 보내는 중","자리와 음료를 정리하며 다음에 할 일을 천천히 생각하고 있어요."],
      음식점:["식사를 마무리하는 중","남은 음식을 천천히 먹고 식탁을 정돈하며 잠시 쉬고 있어요."],
      사무실:["업무를 이어가는 중","처리한 내용을 확인하고 다음 업무에 필요한 자료를 차분히 정리하고 있어요."],
      학교:["수업과 과제를 이어가는 중","배운 내용을 노트에 정리하고 다음 일정에 필요한 준비물을 확인하고 있어요."],
      공원:parkScene
    };
    const text=continuations[place?.type]||[`${place?.name||"외출 장소"}에서 시간을 보내는 중`,"지금 하고 있는 일을 마무리하며 다음 일정을 준비하고 있어요."];
    return entry(minute,text[0],personalityFlavor(c,text[1],"live-away",date),{townId:last.townId||c.townId,placeId:last.placeId,mood:last.mood||"보통"});
  }
  const previousTitle=String(last?.title||"");
  const followups=[
    [/차를 우|차를 준비|차를 내리|음료를 준비/,["준비한 차를 천천히 마시는 중","조금 전 우린 차를 자리로 가져와 온도와 향을 느끼며 천천히 마시고 있어요.",last?.room||"kitchen"]],
    [/청소하는|청소 중|정돈하는|정리하는 중/,["정리를 마치고 잠깐 쉬는 중","정리한 자리를 한 번 둘러본 뒤 물을 마시고 몸의 긴장을 풀며 잠깐 쉬고 있어요.",last?.room||"living"]],
    [/요리하는|아침 준비|빵을 굽|식사를 준비|간식을 챙기/,["만든 것을 천천히 먹는 중","조금 전 준비한 것을 식탁에 놓고 서두르지 않게 먹으며 사용한 도구도 함께 정리하고 있어요.","kitchen"]],
    [/운동하는|운동 중|스트레칭|러닝머신/,["호흡을 고르며 운동을 마무리하는 중","운동 강도를 천천히 낮추고 물을 마시며 호흡과 몸 상태를 확인하고 있어요.",last?.room||"living"]],
    [/빨래|세탁/,["마른 빨래를 접어 정리하는 중","세탁을 마친 옷을 종류별로 접어 각자의 자리에 차분히 넣고 있어요.",last?.room||"bedroom"]],
    [/씻는 중|샤워/,["물기를 닦고 다음 준비를 하는 중","씻은 뒤 물기를 닦고 욕실을 간단히 정돈한 다음 오늘 필요한 옷과 물건을 챙기고 있어요.","bath"]]
  ];
  const followup=followups.find(([pattern])=>pattern.test(previousTitle))?.[1];
  if(followup)return homeEntry(c,minute,followup[0],personalityFlavor(c,followup[1],"home-followup",date),followup[2]);
  const scripts=[...homeActivityPoolFor(c,date),
    ["거실에서 잠깐 쉬는 중","마실 것을 곁에 두고 소파에 앉아 다음 일정 전까지 숨을 돌리고 있어요.","living"],
    ["서재에서 개인적인 일을 하는 중","책상에 앉아 관심 있는 자료를 살펴보거나 미뤄 둔 작은 일을 처리하고 있어요.","study"],
    ["주방에서 간단한 간식을 챙기는 중","배가 고프지 않을 정도로 간단한 먹을 것과 마실 것을 준비하고 있어요.","kitchen"],
    ["집 안을 정돈하는 중","눈에 띄는 물건 몇 개를 제자리로 옮기고 주변을 가볍게 정리하고 있어요.","living"]
  ];
  const recentTitles=new Set((c.days?.[dayKey(date)]?.entries||[]).filter(item=>minute-Number(item.minute)<=360).map(item=>item.title));
  const freshScripts=scripts.filter(script=>!recentTitles.has(script[0]));
  const pool=freshScripts.length?freshScripts:scripts;
  const script=pool[hash(`${c.id}:${dayKey(date)}:${Math.floor(n/90)}:live`)%pool.length];
  return homeEntry(c,minute,script[0],personalityFlavor(c,script[1],"live-home",date),script[2],script[4]||{});
}
function baseEventFor(c,date=new Date()){
  const n=nowMin(date);
  if(sleepingNow(c,date))return withResidenceLocation(c,entry(n,"자는 중",sleepScene(c,date),{home:true,room:"bedroom",mood:"수면",stress:0}),date);
  const list=timeline(c,date), past=list.filter(x=>x.minute<=n);
  const last=past.at(-1);
  const nextGap=last?30+(hash(`${c.id}:${dayKey(date)}:${last.minute}:reaction-gap`)%31):30;
  if(last&&n-last.minute>=nextGap)return commitLiveEntry(c,date,withResidenceLocation(c,liveGapEvent(c,last,n,date),date));
  if(last)return withResidenceLocation(c,last,date);
  if(c.createdAt&&Date.now()-Number(c.createdAt)<24*60*60*1000)return withResidenceLocation(c,entry(n,"아직 생활을 시작하지 않음","프로필과 집, 일정을 설정하면 지금부터 생활이 시작돼요.",{home:true,room:"bedroom",mood:"대기",stress:0}),date);
  if(n<Math.min(wakeAt(c,date),240))return withResidenceLocation(c,entry(n,"잠들기 전 시간을 보내는 중","자정이 지난 늦은 밤, 오늘 일정을 시작하는 대신 조용히 하루를 마무리하고 있어요.",{home:true,room:"bedroom",mood:"차분",stress:2}),date);
  return withResidenceLocation(c,entry(n,"집에서 아침 준비 중","기상 시각이 지나 오늘 일정을 시작할 준비를 하고 있어요.",{home:true,room:"bath",mood:"평온",stress:5}),date);
}
const RELATION_CLOSENESS={부부:100,연인:95,"부모·자녀":92,"형제·자매":90,소꿉친구:84,친구:78,동거인:68,직장동료:54,라이벌:42,혐관:35};
const VIEW_IMPORTANCE=[
  ["importance",/^1순위/,55],
  ["importance",/^2순위/,40],
  ["importance",/^3순위/,28],
  ["importance",/^\d+순위/,12],
  ["overall",/운명의 상대|사랑|없어서는/,42],
  ["overall",/좋아|호감|소중/,27],
  ["overall",/매우 싫|증오|혐오/,24],
  ["overall",/싫어|불편/,13],
  ["closeness",/가장 가까운|가까운 사이/,20],
  ["closeness",/친한 사이/,13],
  ["attention",/최우선|자주 살핌/,16],
  ["attention",/종종 신경/,8],
  ["jealousy",/독점|질투가 심|질투함/,10],
  ["conflictIntensity",/자주 충돌함|격렬하게 충돌함|파국적인 충돌/,20],
  ["aggression",/몸으로 밀어내고 싶은 충동|해치고 싶은|죽이고 싶을 만큼/,22],
  ["comfort",/숨 막힘|공간 공유는 불편/,12],
  ["comfort",/농담과 장난은 잘 통함|대화는 편안함|농담과 장난이 잘 통함|공간도 대화도 완벽/,14],
  ["expectation",/언제든 끝날 수|곧 헤어질/,8]
];
function directedImportance(sourceId,targetId){
  const view=characterViewFor(sourceId,targetId)||{};
  return VIEW_IMPORTANCE.reduce((score,[key,pattern,weight])=>score+(pattern.test(String(view[key]||""))?weight:0),0);
}
function relationImportance(first,second,relation){
  return (RELATION_CLOSENESS[relation?.type]||0)*.35
    +directedImportance(first.id,second.id)*2.5
    +directedImportance(second.id,first.id)*.8;
}
function dateLikePair(first,second,relation,current={}){
  if(relation?.temporalStatus==="past"||["부모·자녀","형제·자매"].includes(relation?.type))return false;
  return Boolean(current.dateGroup&&current.datePurpose&&current.mood==="데이트"&&[first.id,second.id].includes(current.withId));
}
function viewDrivenInteraction(place,first,second,date){
  const firstView=explicitCharacterViewFor(first.id,second.id);
  const secondView=explicitCharacterViewFor(second.id,first.id);
  if(!Object.keys(firstView).length&&!Object.keys(secondView).length)return null;
  const combined=[...Object.values(firstView),...Object.values(secondView)].join(" ");
  const firstCombined=Object.values(firstView).join(" ");
  const secondCombined=Object.values(secondView).join(" ");
  const romantic=/연애 감정|사랑|연심|좋아함/.test(combined);
  const uncomfortable=/불편|긴장|조심|숨막|거리|어색/.test(combined);
  const distrust=/믿지 않|못 믿|불신|의심/.test(combined);
  const annoyed=/귀찮|성가|짜증/.test(combined);
  const attentive=/1순위|2순위|최우선|중요|자주 챙|늘 챙|많이 신경/.test(combined);
  const seed=hash(`${first.id}:${second.id}:${dayKey(date)}:${place.id}:view`);
  const pick=(items,offset=0)=>items[(seed+offset)%items.length];
  if(romantic&&uncomfortable){
    const firstTitle=`${togetherWith(second.name)} 가까이 있지만 조심스럽게 시간을 보내는 중`;
    const secondTitle=`${togetherWith(first.name)} 가까이 있지만 조심스럽게 시간을 보내는 중`;
    return {
    title:firstTitle,firstTitle,secondTitle,
    first:pick([
      `${second.name} 곁에 머물렀지만 거리를 갑자기 좁히지는 않았어요. 좋아하는 마음과 별개로 긴장되는 기색을 숨기며 짧은 질문부터 건넸어요.`,
      `${second.name}에게 하고 싶은 말을 몇 번 삼킨 뒤 부담스럽지 않은 이야기부터 꺼냈어요. 불편함이 남아 있어도 자리를 피하지는 않았어요.`,
      `${second.name}의 반응을 살피며 한 자리 정도의 간격을 남겨 두었어요. 가까워지고 싶지만 서두르지 않기로 했어요.`
    ]),
    second:pick([
      `${first.name}의 조심스러운 태도를 알아채고 대답할 시간을 충분히 두었어요. 어색한 침묵이 와도 억지로 접촉하지 않았어요.`,
      `${first.name}이 긴장하는 것을 보고 목소리를 낮췄어요. 둘은 부담이 덜한 주제로 천천히 대화를 이어 갔어요.`,
      `${first.name}과 눈이 마주치자 잠깐 시선을 피했지만 자리를 뜨지는 않았어요. 불편함 속에서도 함께 있고 싶은 마음이 남아 있었어요.`
    ],1)
  };}
  if(romantic&&distrust){
    const firstTitle=`${second.name}에게 마음은 있지만 쉽게 믿지 못한 채 이야기하는 중`;
    const secondTitle=`${first.name}에게 마음은 있지만 쉽게 믿지 못한 채 이야기하는 중`;
    return {
    title:firstTitle,firstTitle,secondTitle,
    first:pick([
      `${second.name}의 말을 곧이곧대로 믿지는 않았지만 대화를 끊지도 않았어요. 애매한 부분을 하나씩 되물으며 진심을 확인했어요.`,
      `${second.name}에게 마음이 가면서도 약속은 쉽게 받아들이지 않았어요. 대신 오늘 있었던 일을 구체적으로 물었어요.`,
      `${second.name}의 표정과 말이 맞는지 잠시 살폈어요. 의심은 남았지만 관심까지 거두지는 않았어요.`
    ]),
    second:pick([
      `${first.name}이 경계하는 것을 알아차리고 큰 약속 대신 지금 할 수 있는 일을 먼저 보여 줬어요.`,
      `${first.name}의 확인 질문에 얼버무리지 않고 짧고 분명하게 답했어요.`,
      `${first.name}이 쉽게 믿지 않는다는 것을 알고 말보다 행동으로 답하려 했어요.`
    ],1)
  };}
  if(romantic&&attentive){
    const firstTitle=`${second.name}의 취향을 챙기며 함께 시간을 보내는 중`;
    const secondTitle=`${first.name}의 취향을 챙기며 함께 시간을 보내는 중`;
    return {
    title:firstTitle,firstTitle,secondTitle,
    first:pick([
      `${second.name}이 전에 말했던 취향을 기억해 두었다가 지금 하기 좋은 일을 먼저 제안했어요.`,
      `${second.name}의 일정과 기분을 살핀 뒤 무리하지 않아도 되는 계획을 골랐어요.`,
      `${second.name}이 편하게 머물 자리를 먼저 확인하고 필요한 것을 묻기 전에 챙겨 두었어요.`,
      `${second.name}에게 어울릴 것 같은 음악과 볼거리를 골라 보여 주며 반응을 기다렸어요.`
    ]),
    second:pick([
      `${first.name}의 세심한 준비를 알아채고 다음에 함께하고 싶은 일을 하나 보탰어요.`,
      `${first.name}이 고른 계획을 따라가다가 자기 취향도 솔직하게 말했어요.`,
      `${first.name}이 기억해 준 것을 눈치채고 짧게 고마움을 전했어요.`,
      `${first.name}의 제안을 하나씩 살펴보며 가장 마음에 드는 것을 골랐어요.`
    ],1)
  };}
  if(annoyed){
    const firstTitle=`${togetherWith(second.name)} 티격태격하면서도 함께 있는 중`;
    const secondTitle=`${togetherWith(first.name)} 티격태격하면서도 함께 있는 중`;
    return {
    title:firstTitle,firstTitle,secondTitle,
    first:pick([
      `${second.name}의 말에 짧게 받아치고 한숨을 쉬었어요.${/연애 감정|사랑|좋아함/.test(firstCombined)?" 그래도 필요한 것은 슬쩍 챙겨 두었어요.":""}`,
      `${second.name}이 성가시다는 표정을 숨기지 않았지만 대화가 끝날 때까지 자리를 지켰어요.`,
      `${second.name}에게 툴툴거리면서도 해야 할 일은 정확히 알려 줬어요.`
    ]),
    second:pick([
      `${first.name}의 퉁명스러운 반응에 농담으로 맞받아쳤어요.${/연애 감정|사랑|좋아함/.test(secondCombined)?" 싫어서가 아니라는 것을 알아 자리를 피하지 않았어요.":""}`,
      `${first.name}이 귀찮아하는 기색을 보고 한발 물러났지만 필요한 말은 끝까지 전했어요.`,
      `${first.name}의 짧은 대답에 눈을 굴린 뒤 다른 방식으로 말을 걸었어요.`
    ],1)
  };}
  return null;
}
function datePurpose(place,first,second,date){
  const type=place?.type||"";
  const choices={
    공원:["낙엽길을 천천히 걸으며 사진 고르기","벤치에서 간식 나눠 먹기","사람 적은 산책로 끝까지 걷기","서로 찍어 준 사진 중 가장 마음에 드는 것 고르기","연못 주변을 돌며 다음에 갈 곳 정하기","잔디밭에 앉아 음악 한 곡씩 추천하기"],
    음식점:["예약한 메뉴를 함께 맛보기","서로 먹어 보고 싶던 메뉴 하나씩 고르기","천천히 저녁을 먹으며 이번 주 이야기 나누기","디저트까지 나눠 먹고 주변을 더 둘러보기"],
    카페:["새로 나온 음료를 하나씩 골라 맛보기","창가에 앉아 서로의 사진 정리하기","디저트를 나눠 먹으며 다음 약속 정하기","각자 고른 음료를 바꿔 한 모금씩 맛보기"],
    공연장:["함께 고른 공연 관람하기","공연이 끝난 뒤 인상 깊었던 장면 이야기하기","좋아하는 곡이 나오는 무대를 함께 기다리기"],
    쇼핑몰:["서로에게 어울릴 물건 골라 보기","필요한 물건을 함께 찾고 간식 먹기","한 층씩 둘러보며 취향 맞히기"],
    도서관:["서로에게 읽힐 책 한 권씩 고르기","조용히 나란히 읽다가 마음에 든 구절 보여 주기"],
    집:["거실에서 함께 고른 영화 보기","간단한 야식을 만들고 영화 이어 보기","게임 한 판을 같이 끝내기","서로 추천한 음악을 들으며 소파에서 쉬기"]
  };
  const pool=choices[type]||choices[place?.id?.startsWith("home:")?"집":"공원"];
  return pool[hash(`${[first.id,second.id].sort().join(":")}:${dayKey(date)}:${place?.id}:date-purpose`)%pool.length];
}
const FURNITURE_BEHAVIOR={
  "게임기":{interest:/게임|e스포츠/,title:"게임기를 즐기는 중",skilled:["익숙하게 설정을 맞추고 어려운 구간을 가볍게 넘겼어요.","손에 익은 조작으로 기록을 갱신하고 다음 판을 바로 준비했어요.","좋아하는 장르를 골라 집중한 채 한 판을 끝냈어요."],novice:["버튼 설명을 몇 번이나 다시 읽고 엉뚱한 메뉴를 열었어요.","조작기를 거꾸로 들었다가 화면이 움직이지 않자 머쓱하게 바로잡았어요.","튜토리얼부터 막혀 잠시 끙끙대다가 그래도 한 번 더 시도했어요."]},
  "보드게임장":{interest:/보드게임|퍼즐|방탈출/,title:"보드게임을 펼쳐 보는 중",skilled:["규칙을 빠르게 훑고 다음 수를 몇 단계 앞까지 계산했어요.","구성물을 종류별로 정리한 뒤 익숙하게 판을 준비했어요.","상대의 선택을 읽으며 마지막까지 팽팽한 판을 만들었어요."],novice:["설명서를 읽고도 차례를 헷갈려 말 하나를 엉뚱한 칸에 놓았어요.","구성물이 너무 많아 무엇부터 꺼내야 할지 몰라 한참 상자만 들여다봤어요.","규칙을 절반쯤 이해한 채 시작했다가 매 차례 도움을 청했어요."]},
  "턴테이블":{interest:/음악|레코드|LP/,title:"턴테이블로 음악을 듣는 중",skilled:["바늘을 조심스럽게 내려 좋아하는 곡의 첫 소리를 기다렸어요.","음반의 상태를 확인하고 오늘 분위기에 맞는 면을 골라 재생했어요.","재생이 끝나자 음반을 닦아 속지에 반듯하게 넣었어요."],novice:["바늘을 어디에 놓아야 할지 몰라 한참 손을 허공에 멈췄어요.","음반을 뒤집는 타이밍을 놓치고 조용해진 방에서 기계를 바라봤어요.","버튼이 거의 없어 더 어렵다며 설명을 다시 찾아봤어요."]},
  "그림 도구":{interest:/그림|드로잉|미술|일러스트/,title:"그림 도구를 꺼내는 중",skilled:["재료에 맞는 종이와 도구를 골라 망설임 없이 첫 선을 그었어요.","큰 형태부터 잡은 뒤 색을 겹쳐 원하는 분위기를 만들었어요.","쓰던 도구를 닦아 색과 크기별로 다시 정리했어요."],novice:["붓에 물을 너무 많이 묻혀 색이 번지자 당황해 휴지부터 찾았어요.","어떤 연필을 써야 할지 몰라 가장 손에 잡히는 것으로 어설프게 선을 그었어요.","생각한 모양과 전혀 다르게 나오자 고개를 갸웃하면서도 조금 더 시도했어요."]},
  "디지털 드로잉 장비":{interest:/디지털 드로잉|그림|일러스트/,title:"디지털 그림을 그리는 중",skilled:["단축키와 레이어를 빠르게 오가며 선을 정리했어요.","브러시를 조절해 원하는 질감을 만들고 색을 차분히 쌓았어요.","수정 전 파일을 따로 저장한 뒤 과감하게 구도를 바꿨어요."],novice:["펜을 움직였는데 엉뚱한 레이어에 선이 생겨 급히 되돌리기를 눌렀어요.","화면은 켰지만 브러시 크기부터 찾지 못해 메뉴를 오래 헤맸어요.","손으로 종이에 그릴 때와 다른 감각에 적응하지 못하고 선을 여러 번 지웠어요."]},
  "악기":{interest:/음악|악기|연주|피아노|기타/,title:"악기를 연주하는 중",skilled:["손을 가볍게 풀고 익숙한 곡의 어려운 부분부터 천천히 맞췄어요.","음이 흔들리는 구간을 골라 속도를 낮추고 반복했어요.","좋아하는 곡을 끝까지 연주한 뒤 마지막 울림을 잠시 들었어요."],novice:["소리를 내는 자세부터 몰라 조심스럽게 손을 얹었다가 금세 뗐어요.","한 음을 내는 데 성공하고도 다음 손가락 위치를 몰라 그대로 멈췄어요.","생각보다 큰 소리가 나자 놀라 주변을 살핀 뒤 더 작게 다시 시도했어요."]},
  "제빵 도구":{interest:/베이킹|요리|빵/,title:"제빵 도구를 쓰는 중",skilled:["재료를 정확히 계량하고 반죽 상태에 맞춰 힘과 속도를 조절했어요.","오븐 온도와 시간을 맞춘 뒤 남은 도구를 바로 씻어 정리했어요.","구워지는 향을 확인하고 가장 알맞은 순간에 오븐을 열었어요."],novice:["계량 단위를 잘못 보고 밀가루를 너무 많이 부어 급히 덜어냈어요.","반죽이 손에 잔뜩 붙자 왜 이걸 즐기는지 모르겠다며 주걱을 찾았어요.","오븐 예열을 잊어 완성 시간이 한참 미뤄졌어요."]},
  "커피머신":{interest:/커피|카페/,title:"커피를 내리는 중",skilled:["원두 굵기와 물의 양을 맞춰 익숙하게 한 잔을 완성했어요.","향을 먼저 확인하고 오늘 마실 방식에 맞춰 설정을 바꿨어요.","추출이 끝난 뒤 기계를 닦고 남은 원두를 밀봉했어요."],novice:["버튼이 너무 많아 가장 큰 버튼부터 눌렀다가 물만 받아냈어요.","필터를 빼는 법을 몰라 한참 씨름한 뒤 설명서를 펼쳤어요.","쓴맛에 놀라 우유와 시럽을 차례로 더하며 자기 입맛을 찾았어요."]},
  "향수 진열대":{interest:/향수|향기|조향|시향/,title:"향을 고르는 중",skilled:["첫 향과 잔향을 구분해 맡고 오늘 옷차림에 어울리는 것을 골랐어요.","시향지를 나란히 놓고 비슷한 향조의 미세한 차이를 비교했어요.","공기 중에 한 번만 뿌려 퍼지는 향을 확인한 뒤 조심스럽게 병을 닫았어요."],novice:["비슷해 보이는 병이 왜 이렇게 많은지 이해하지 못하고 라벨만 읽었어요.","여러 향을 연달아 맡았다가 구분이 안 되어 창문을 열고 코를 쉬게 했어요.","분사 방향을 잘못 잡아 자기 쪽으로 향이 퍼지자 한동안 재채기를 참았어요."]},
  "천체망원경":{interest:/천문|우주|별|천체/,title:"천체망원경을 들여다보는 중",skilled:["별자리 위치를 확인하고 망원경을 정확한 방향으로 천천히 돌렸어요.","초점을 미세하게 조절해 흐릿하던 빛을 또렷한 점으로 맞췄어요.","관측한 시간과 위치를 짧게 기록한 뒤 다음 대상을 찾았어요."],novice:["렌즈를 들여다봐도 캄캄하기만 해 덮개부터 다시 확인했어요.","별 하나를 찾으려다 망원경이 자꾸 다른 방향으로 움직여 애를 먹었어요.","맨눈으로 보는 것과 무엇이 다른지 몰라 초점 손잡이를 계속 돌렸어요."]},
  "캣타워":{interest:/고양이|반려동물|동물/,title:"캣타워 곁에서 놀아 주는 중",skilled:["고양이가 좋아하는 높이와 거리를 알고 장난감을 천천히 움직였어요.","숨을 곳을 방해하지 않은 채 먼저 다가올 때까지 기다렸어요.","발톱 상태와 흔들리는 부분까지 살펴 안전하게 고쳐 놓았어요."],novice:["고양이가 반응하지 않자 장난감을 너무 빠르게 흔들다가 오히려 피하게 했어요.","어디를 만져야 좋아하는지 몰라 손을 내밀었다가 조용히 거두었어요.","갑자기 높은 곳에서 내려오는 모습에 놀라 자기가 먼저 한 걸음 물러났어요."]},
  "러닝머신":{interest:/러닝|운동|헬스/,title:"러닝머신을 쓰는 중",skilled:["몸을 충분히 푼 뒤 속도를 조금씩 올려 안정된 호흡을 찾았어요.","자세가 흐트러지지 않게 속도와 경사를 세밀하게 조절했어요.","운동을 마치고 천천히 걸으며 심박을 낮췄어요."],novice:["속도를 너무 높게 눌러 손잡이를 붙잡고 급히 정지 버튼을 찾았어요.","몇 분 지나지 않아 숨이 차 속도를 크게 낮추고 화면만 노려봤어요.","발을 어디에 두어야 할지 어색해 짧게 걷고 먼저 스트레칭부터 배웠어요."]}
};
function normalizedFurnitureName(name){
  if(/게임기/.test(name))return "게임기";
  if(/보드게임/.test(name))return "보드게임장";
  if(/레코드|턴테이블/.test(name))return "턴테이블";
  if(/그림/.test(name))return "그림 도구";
  if(/디지털 드로잉/.test(name))return "디지털 드로잉 장비";
  if(/피아노|기타|악기/.test(name))return "악기";
  if(/제빵/.test(name))return "제빵 도구";
  if(/커피|에스프레소/.test(name))return "커피머신";
  if(/향수/.test(name))return "향수 진열대";
  if(/천체망원경/.test(name))return "천체망원경";
  if(/캣타워/.test(name))return "캣타워";
  if(/러닝머신|운동기구/.test(name))return "러닝머신";
  return name;
}
function characterInterests(character){return [...(character.hobbies||[]),...(character.interests||[])].map(String).join(" ")}
function datePurposeScene(purpose,place,first,second,date){
  const name=second.name,seed=`${first.id}:${second.id}:${dayKey(date)}:${purpose}`;
  if(/게임/.test(purpose)){
    const firstLikes=/게임|e스포츠|보드게임/.test(characterInterests(first)),secondLikes=/게임|e스포츠|보드게임/.test(characterInterests(second));
    const beats=[
      {first:`${firstLikes?"익숙한 조작으로 초반을 이끌다가":`조작법을 몇 번이나 물어보면서도`} ${name}에게 중요한 선택은 직접 해 보라고 조작기를 건넸어요.`,second:`${secondLikes?"금세 규칙을 파악해":`버튼을 자꾸 헷갈리면서도`} ${first.name}과 마지막 구간까지 함께 넘기고 엔딩 화면을 나란히 봤어요.`},
      {first:`실수할 때마다 ${name}의 반응을 살피며 가볍게 놀렸지만, 어려운 구간에서는 자기 차례를 양보해 함께 판을 이어 갔어요.`,second:`${first.name}의 농담에 바로 받아치고 점수 차이를 끝까지 따라붙어 마지막 결과가 뜰 때까지 자리를 뜨지 않았어요.`},
      {first:`둘이 맡을 역할을 나눈 뒤 ${name}의 움직임에 맞춰 타이밍을 조절했어요. 한 번 실패하자 같은 구간부터 다시 시작했어요.`,second:`${first.name}이 놓친 단서를 찾아 알려 주고, 마지막 목표를 함께 달성하자 짧게 손을 마주쳤어요.`}
    ];
    return {title:"데이트 · 게임 한 판을 같이 끝내기",...beats[hash(seed)%beats.length]};
  }
  if(/영화/.test(purpose)){
    const beats=[
      {first:`${name}이 고른 영화의 재생 목록을 확인하고 조명을 낮춘 뒤 간식을 손이 닿는 곳에 놓았어요.`,second:`중간에 마음에 든 장면이 나오자 ${first.name}을 한 번 바라봤지만 말을 아끼고 영화가 끝난 뒤 감상을 꺼냈어요.`},
      {first:`서로 후보를 하나씩 고른 뒤 짧게 예고편을 보고 오늘 볼 영화를 정했어요.`,second:`${first.name}이 놓친 장면을 조용히 짚어 주고 엔딩 크레딧이 끝날 때까지 소파에 함께 남았어요.`}
    ];return {title:`데이트 · ${purpose}`,...beats[hash(seed)%beats.length]};
  }
  if(/음악/.test(purpose)){
    return {title:`데이트 · ${purpose}`,first:`${name}에게 꼭 들려주고 싶었던 곡을 골라 재생하고 좋아하는 부분이 나올 때까지 반응을 기다렸어요.`,second:`${first.name}이 고른 곡을 끝까지 들은 뒤 자기 취향의 곡도 하나 이어 재생하며 서로 다른 이유를 이야기했어요.`};
  }
  if(/사진/.test(purpose))return {title:`데이트 · ${purpose}`,first:`${name}와 오늘 찍은 사진을 한 장씩 넘겨 보며 각자 가장 마음에 든 장면을 골랐어요.`,second:`${first.name}이 고른 사진과 자기가 고른 사진을 비교하고, 서로 다르게 본 순간을 이야기했어요.`};
  if(/메뉴|식사|저녁|디저트|간식|음료|맛보기|먹기/.test(purpose))return {title:`데이트 · ${purpose}`,first:`${name}와 먹어 보고 싶은 것을 하나씩 고른 뒤 서로의 선택을 조금씩 나누어 맛봤어요.`,second:`${first.name}이 고른 것의 맛을 먼저 묻고 자기 몫도 건네며 천천히 식사를 이어 갔어요.`};
  if(/산책|걷기|둘러보기|연못/.test(purpose))return {title:`데이트 · ${purpose}`,first:`${name}에게 어느 길이 좋은지 먼저 묻고 둘이 정한 목적지까지 보폭을 맞춰 이동했어요.`,second:`${first.name}과 같은 풍경을 보면서도 자기 눈에 들어온 것을 하나씩 가리켜 보여 줬어요.`};
  if(/책|읽기|구절/.test(purpose))return {title:`데이트 · ${purpose}`,first:`${name}에게 읽히고 싶은 책을 한 권 골라 이유를 설명하고 마음에 든 구절을 표시했어요.`,second:`${first.name}이 고른 책을 펼쳐 본 뒤 자기도 한 권을 골라 서로 바꾸어 읽었어요.`};
  if(/공연|무대|곡/.test(purpose))return {title:`데이트 · ${purpose}`,first:`${name}과 좌석과 시작 시각을 확인한 뒤 보고 싶었던 순서를 함께 기다렸어요.`,second:`${first.name}이 집중한 장면을 눈여겨봤다가 공연이 끝난 뒤 서로 다른 감상을 나눴어요.`};
  if(/물건|취향/.test(purpose))return {title:`데이트 · ${purpose}`,first:`${name}에게 어울릴 만한 후보를 몇 개 골라 실제로 자주 쓸지를 물었어요.`,second:`${first.name}의 선택을 바로 받아들이지 않고 자기 취향을 설명한 뒤 함께 하나를 추렸어요.`};
  return {title:`데이트 · ${purpose}`,first:`${name}와 ${object(purpose)} 위해 먼저 할 일과 마지막에 확인할 일을 정하고 하나씩 끝냈어요.`,second:`${first.name}과 같은 약속을 각자 다른 방식으로 챙기며 정한 목적을 끝까지 함께 마쳤어요.`};
}
function placeObjectScene(place,first,second,relation,date){
  const type=place?.type||"";
  const objects={
    공원:["안내판","벤치","분수","산책로"],
    카페:["메뉴판","커피머신","디저트 진열장","창가 테이블"],
    음식점:["메뉴판","테이블","공용 반찬","디저트 카트"],
    도서관:["검색대","책장","열람대","반납함"],
    공연장:["공연 안내서","좌석표","무대","기념품 진열대"],
    쇼핑몰:["쇼윈도","전신거울","상품 진열대","안내 키오스크"]
  };
  let pool=objects[type]||[];
  if(place?.id?.startsWith("home:")){
    const [,homeId,roomKey]=place.id.split(":");
    pool=state.homes[homeId]?.rooms?.[roomKey]?.furniture||[];
  }
  if(!pool.length)return null;
  const object=pool[hash(`${first.id}:${second.id}:${place.id}:${dayKey(date)}:object`)%pool.length];
  const viewA=characterViewFor(first.id,second.id)||{},viewB=characterViewFor(second.id,first.id)||{};
  const tense=["혐관","적","라이벌"].includes(relation?.type)||/자주 충돌|격렬|파국/.test(`${viewA.conflictIntensity} ${viewB.conflictIntensity}`);
  const playful=safePlayfulPair(first,second,relation);
  if(tense){
    const scenes=[
      {title:`${object} 앞에서 말다툼하는 중`,first:`${first.name}은(는) ${object}을(를) 쓰는 순서를 두고 ${second.name}의 말을 끊으며 자기 방식이 맞다고 날카롭게 받아쳤어요.`,second:`${second.name}은(는) 물러서지 않고 잘못 건드린 부분을 하나씩 짚었고, 둘의 목소리는 잠시 높아졌어요.`},
      {title:`${object}을 두고 신경전을 벌이는 중`,first:`${first.name}은(는) ${second.name}이(가) 고른 방식이 마음에 들지 않아 비꼬듯 한마디를 던졌어요.`,second:`${second.name}은(는) 곧바로 같은 어조로 되받아치고 ${object}을(를) 자기 쪽으로 돌려놓았어요.`},
      {title:`${object} 앞에서 의견이 부딪힌 중`,first:`${first.name}은(는) 설명을 끝까지 듣지 않고 ${second.name}의 선택이 비효율적이라고 잘라 말했어요.`,second:`${second.name}은(는) 그 말투부터 문제라며 정면으로 맞받았지만, 서로 손을 쓰지는 않고 말로 끝냈어요.`}
    ];return scenes[hash(`${first.id}:${second.id}:${object}:fight`)%scenes.length];
  }
  if(playful){
    const scenes=[
      {title:`${object}으로 서로를 놀리는 중`,first:`${first.name}은(는) ${second.name}이(가) ${object}을(를) 다루는 모습을 과장되게 흉내 내며 웃음을 참았어요.`,second:`${second.name}은(는) 곧바로 ${first.name}의 실수를 하나 들춰내 더 큰 농담으로 되갚았어요.`},
      {title:`${object} 앞에서 장난을 주고받는 중`,first:`${first.name}은(는) ${object}을(를) 먼저 차지하고 쓰고 싶으면 부탁해 보라며 장난스럽게 버텼어요.`,second:`${second.name}은(는) 부탁하는 대신 허점을 노려 슬쩍 가져가고 태연한 얼굴을 했어요.`},
      {title:`${object}을 같이 시험해 보는 중`,first:`${first.name}은(는) ${second.name}에게 먼저 해 보라고 권한 뒤 서툰 부분을 가볍게 놀렸어요.`,second:`${second.name}은(는) 웃으며 받아치고 이번에는 ${first.name}에게 더 어려운 방법을 시켜 봤어요.`}
    ];return scenes[hash(`${first.id}:${second.id}:${object}:play`)%scenes.length];
  }
  return null;
}
function interactionPair(group){
  const candidates=[];
  for(let i=0;i<group.length;i++){
    for(let j=i+1;j<group.length;j++){
      const first=group[i],second=group[j];
      const relation=relationList().find(r=>(r.a===first.id&&r.b===second.id)||(r.a===second.id&&r.b===first.id))||null;
      candidates.push({first,second,relation,score:relationImportance(first,second,relation)});
    }
  }
  candidates.sort((a,b)=>b.score-a.score||String(a.first.id).localeCompare(String(b.first.id)));
  return candidates[0];
}
function interactionPairFor(character,others){
  const candidates=others.map(other=>{
    const relation=relationList().filter(r=>r.temporalStatus!=="past").find(r=>(r.a===character.id&&r.b===other.id)||(r.a===other.id&&r.b===character.id))||null;
    return {first:character,second:other,relation,score:relationImportance(character,other,relation)};
  });
  candidates.sort((a,b)=>b.score-a.score||String(a.second.id).localeCompare(String(b.second.id)));
  return candidates[0]||null;
}
function significantEncounter(pair,group,date){
  if(!["부부","연인"].includes(pair.relation?.type))return "";
  const others=group.filter(person=>person.id!==pair.first.id&&person.id!==pair.second.id);
  const encounters=others.map(person=>{
    const relation=relationList().find(r=>
      [pair.first.id,pair.second.id].some(id=>(r.a===id&&r.b===person.id)||(r.b===id&&r.a===person.id))
    );
    return {person,relation};
  }).filter(item=>item.relation);
  if(!encounters.length||hash(`${pair.first.id}:${pair.second.id}:${dayKey(date)}:${Math.floor(nowMin(date)/15)}:encounter`)%3)return "";
  encounters.sort((a,b)=>(RELATION_CLOSENESS[b.relation.type]||0)-(RELATION_CLOSENESS[a.relation.type]||0));
  const encounter=encounters[0];
  if(["혐관","라이벌"].includes(encounter.relation.type)){
    return ` 그러다 ${encounter.person.name}와 마주쳐 잠깐 날 선 시선을 보냈지만, 곧 다시 곁의 사람에게 주의를 돌렸어요.`;
  }
  if(["친구","소꿉친구","부모·자녀","형제·자매","동거인"].includes(encounter.relation.type)){
    return ` 지나가던 ${encounter.person.name}에게 짧게 인사를 건넨 뒤, 함께하던 시간을 방해하지 않도록 다시 곁의 사람에게 집중했어요.`;
  }
  return "";
}
const RELATION_COMBINATION_BONDS=[
  {key:"devoted",label:"서로를 가장 깊이 사랑함",test:(a,b,r)=>/깊이 사랑|없어서는 안 될/.test(`${a.overall} ${b.overall}`)||(["연인","부부"].includes(r?.type)&&/깊은|없어서는|평생|헌신/.test(r?.stage||"")),actions:[
    (a,b)=>`${a.name}은(는) 사소한 변화부터 알아보고 ${b.name}이(가) 말하기 전에 필요한 것을 건넸어요.`,
    (a,b)=>`${a.name}은(는) ${b.name}과(와) 눈이 마주치자 굳이 설명하지 않아도 알겠다는 듯 자리를 가까이했어요.`,
    (a,b)=>`${a.name}은(는) 다른 사람과 이야기하면서도 ${b.name}의 표정과 움직임을 놓치지 않았어요.`,
    (a,b)=>`${a.name}은(는) 먼저 떠나려다가 ${b.name}의 속도에 맞춰 함께 움직이기로 했어요.`]},
  {key:"romantic",label:"분명한 연심을 품음",test:(a,b,r)=>/연애 감정/.test(`${a.overall} ${b.overall}`)||["연인","부부"].includes(r?.type),actions:[
    (a,b)=>`${a.name}은(는) ${b.name}과(와) 나란히 할 수 있는 일을 골라 자연스럽게 둘만의 시간을 만들었어요.`,
    (a,b)=>`${a.name}은(는) 가까워진 거리를 의식하면서도 물러나지 않고 ${b.name}의 이야기를 들었어요.`,
    (a,b)=>`${a.name}은(는) ${b.name}에게만 알아들을 수 있는 짧은 농담을 건네며 웃었어요.`,
    (a,b)=>`${a.name}은(는) 헤어질 시간이 되었는데도 대화를 하나 더 꺼내 조금 더 머물렀어요.`]},
  {key:"unspoken",label:"말하지 못한 마음이 있음",test:(a,b)=>/싹틈|부정함|전혀 모름|우정으로 착각/.test(`${a.overall} ${a.awareness} ${b.overall} ${b.awareness}`),actions:[
    (a,b)=>`${a.name}은(는) ${b.name}을(를) 먼저 도와 놓고도 특별한 뜻은 없었다는 듯 시선을 돌렸어요.`,
    (a,b)=>`${a.name}은(는) 둘만 남자 갑자기 말수가 줄었지만 자리를 피하지는 않았어요.`,
    (a,b)=>`${a.name}은(는) ${b.name}이(가) 다른 사람과 웃는 모습을 오래 보다가 뒤늦게 하던 일로 돌아갔어요.`,
    (a,b)=>`${a.name}은(는) 먼저 연락할 이유를 찾지 못해 망설이다가 사소한 핑계를 하나 만들었어요.`]},
  {key:"precious",label:"소중한 사람으로 여김",test:(a,b)=>/소중|안쓰럽|존경|동경/.test(`${a.overall} ${b.overall}`),actions:[
    (a,b)=>`${a.name}은(는) ${b.name}이(가) 곤란해지기 전에 조용히 옆에서 일을 나눠 맡았어요.`,
    (a,b)=>`${a.name}은(는) ${b.name}의 말을 끊지 않고 끝까지 들은 뒤 현실적인 도움을 하나 제안했어요.`,
    (a,b)=>`${a.name}은(는) 사람들 사이에서도 ${b.name}이(가) 불편하지 않은지 먼저 살폈어요.`,
    (a,b)=>`${a.name}은(는) ${b.name}이(가) 무사히 돌아가는 것을 확인하고서야 자기 일로 돌아갔어요.`]},
  {key:"friends",label:"편하고 가까운 우정",test:(a,b,r)=>/친구로 좋아|인간적인 호감/.test(`${a.overall} ${b.overall}`)||["친구","소꿉친구","학창 시절 친구들","친구 모임"].includes(r?.type),actions:[
    (a,b)=>`${a.name}은(는) ${b.name}에게 방금 본 것을 과장해 이야기하며 자연스럽게 웃음을 끌어냈어요.`,
    (a,b)=>`${a.name}은(는) 말이 잠시 끊겨도 어색해하지 않고 ${b.name}과(와) 각자 할 일을 이어 갔어요.`,
    (a,b)=>`${a.name}은(는) ${b.name}의 실수를 가볍게 놀린 뒤 아무렇지 않게 수습을 도왔어요.`,
    (a,b)=>`${a.name}은(는) 다음에 같이 할 일을 즉석에서 정하고 짧게 손을 흔들었어요.`]},
  {key:"family",label:"생활에 밴 가족애",test:(a,b,r)=>["부모·자녀","형제·자매"].includes(r?.type)||r?.type==="동거인"&&/유사가족/.test(r?.stage||""),actions:[
    (a,b)=>`${a.name}은(는) 묻지도 않고 ${b.name}의 몫까지 챙겼고, ${b.name}도 익숙하다는 듯 받아들였어요.`,
    (a,b)=>`${a.name}은(는) ${b.name}의 생활 습관을 잔소리하면서도 필요한 것은 이미 준비해 두었어요.`,
    (a,b)=>`${a.name}은(는) 남들 앞에서는 퉁명스럽게 굴었지만 ${b.name}이(가) 곤란해지자 바로 편을 들었어요.`,
    (a,b)=>`${a.name}은(는) 돌아갈 시간을 재촉하면서도 결국 ${b.name}과(와) 같은 방향으로 움직였어요.`]},
  {key:"rivals",label:"서로를 의식하는 경쟁 관계",test:(a,b)=>/경쟁심/.test(`${a.overall} ${b.overall}`),actions:[
    (a,b)=>`${a.name}은(는) ${b.name}의 방식을 유심히 본 뒤 조금 더 나은 결과를 내려고 속도를 올렸어요.`,
    (a,b)=>`${a.name}은(는) 칭찬 대신 허점을 하나 짚었지만, 실력만큼은 인정하는 기색을 숨기지 못했어요.`,
    (a,b)=>`${a.name}은(는) 다른 사람이 ${b.name}을(를) 낮게 평가하자 자신이 이길 상대를 함부로 보지 말라고 잘라 말했어요.`,
    (a,b)=>`${a.name}은(는) 다음에는 확실히 승부를 내자고 말하며 먼저 돌아섰어요.`]},
  {key:"love_hate",label:"애정과 반감이 동시에 있음",test:(a,b)=>/애증/.test(`${a.overall} ${b.overall}`)||(/사랑/.test(a.overall||"")&&/싫어|미워|애증/.test(b.overall||""))||(/사랑/.test(b.overall||"")&&/싫어|미워|애증/.test(a.overall||"")),actions:[
    (a,b)=>`${a.name}은(는) ${b.name}을(를) 도와주면서도 왜 자신이 이러고 있는지 화가 난다는 듯 말을 거칠게 했어요.`,
    (a,b)=>`${a.name}은(는) 가까이 있고 싶어 하면서도 먼저 다정하게 굴지는 못해 사소한 시비를 걸었어요.`,
    (a,b)=>`${a.name}은(는) ${b.name}을(를) 험하게 말하다가 다른 사람이 같은 말을 하자 표정이 단단히 굳었어요.`,
    (a,b)=>`${a.name}은(는) 다시는 보지 말자고 말했지만 ${b.name}이(가) 무사히 떠나는 모습까지 지켜봤어요.`]},
  {key:"hostile",label:"서로를 경계하거나 미워함",test:(a,b,r)=>["혐관","적","라이벌"].includes(r?.type)||/매우 싫어|미워|경계/.test(`${a.overall} ${b.overall}`),actions:[
    (a,b)=>`${a.name}은(는) ${b.name}의 동선을 살피며 등을 보이지 않고 필요한 말만 짧게 주고받았어요.`,
    (a,b)=>`${a.name}은(는) 둘만 남자 침묵을 깨지 않은 채 서로의 다음 행동을 경계했어요.`,
    (a,b)=>`${a.name}은(는) 다른 사람 앞에서 감정을 드러내지 않았지만 ${b.name}의 말에는 즉시 반박했어요.`,
    (a,b)=>`${a.name}은(는) 더 충돌하기 전에 먼저 자리를 벗어나며 다음에는 물러서지 않겠다고 생각했어요.`]},
  {key:"distant",label:"아직 거리가 있는 사이",test:()=>true,actions:[
    (a,b)=>`${a.name}은(는) ${b.name}과(와) 필요한 역할을 나누되 서로의 영역을 침범하지 않았어요.`,
    (a,b)=>`${a.name}은(는) 어색한 침묵이 길어지기 전에 무난한 화제를 하나 꺼냈어요.`,
    (a,b)=>`${a.name}은(는) 다른 사람들과 함께 있을 때만 ${b.name}에게 자연스럽게 말을 건넸어요.`,
    (a,b)=>`${a.name}은(는) 짧게 인사하고 각자 가야 할 방향으로 돌아섰어요.`]}
];
const RELATION_COMBINATION_TENSIONS=[
  {key:"violent",label:"사랑과 실제 위해 행동이 충돌함",test:(a,b,relation,first,second)=>
    aggressionExpressionLevel(first,a)>=3||aggressionExpressionLevel(second,b)>=3,lines:[
    (a,b)=>`그러나 ${a.name}은(는) 애정과 별개로 ${b.name}을(를) 해치고 싶은 충동이 치밀자 손에 힘을 주었다가 스스로 거리를 벌렸어요.`,
    (a,b)=>`${a.name}은(는) ${b.name}과(와) 가까이 붙어 있다가 말 한마디에 표정이 굳었고, 곧 서로를 밀어내며 날 선 말로 맞섰어요.`,
    (a,b)=>`${a.name}은(는) ${b.name}에게 화가 났지만 충동대로 행동하지 않기 위해 물건을 내려놓고 대화를 중단했어요.`,
    (a,b)=>`서로를 원하는 마음과 안전하게 함께할 수 있는지는 다른 문제라, 둘은 감정이 가라앉을 때까지 각자 떨어져 있기로 했어요.`]},
  {key:"explosive",label:"애정과 격렬한 갈등이 공존함",test:(a,b)=>/격렬하게|파국적인/.test(`${a.conflictIntensity} ${b.conflictIntensity}`),lines:[
    ()=>`사소한 방식 차이가 곧바로 언쟁으로 번졌지만 두 사람 모두 관계 자체를 포기한 듯 자리를 뜨지는 않았어요.`,
    ()=>`가까운 거리와 편한 접촉은 허용하면서도 의견이 맞부딪치자 말투가 빠르게 거칠어졌어요.`,
    ()=>`주변 사람이 눈치를 볼 만큼 날카롭게 다퉜지만, 정작 다른 사람이 끼어드는 것은 둘 다 원하지 않았어요.`,
    ()=>`오늘의 싸움을 오늘 끝내지는 못했지만 최소한 다음 대화를 위한 시간과 장소는 정해 두었어요.`]},
  {key:"verbal",label:"감정은 거칠지만 행동은 억제함",test:(a,b)=>hasVerbalConflict(a)||hasVerbalConflict(b),lines:[
    (a,b)=>`${a.name}은(는) 순간 거친 말이 떠올랐지만 그대로 내뱉지 않고 짧게 숨을 고른 뒤 불만만 분명히 말했어요.`,
    (a,b)=>`${a.name}은(는) ${b.name}의 말에 표정이 굳었지만 손을 쓰지 않았고, 대화를 잠시 멈추자고 선을 그었어요.`,
    (a,b)=>`${a.name}은(는) 말끝이 날카로워진 것을 알아차리고 한 걸음 물러나 필요한 말만 남겼어요.`,
    (a,b)=>`${a.name}은(는) 욱한 기색을 감추지 못했지만 자리를 박차고 나가는 대신 목소리를 낮춰 다시 말했어요.`]},
  {key:"distrust",label:"끌리지만 믿지 못함",test:(a,b)=>/전혀 믿지 않|의심함/.test(`${a.trust} ${b.trust}`),lines:[
    (a,b)=>`${a.name}은(는) 다정한 행동을 받아들이면서도 그 의도를 확인하려는 질문을 멈추지 않았어요.`,
    ()=>`둘 사이의 거리와 접촉은 가까웠지만, 중요한 정보만큼은 서로에게 전부 내보이지 않았어요.`,
    (a,b)=>`${a.name}은(는) ${b.name}이(가) 다른 사람과 나눈 말을 기억해 두고 앞뒤가 맞는지 조용히 따져 봤어요.`,
    ()=>`함께 돌아가자는 제안에는 응했지만 완전히 등을 맡기지는 않은 채 나란히 걸었어요.`]},
  {key:"strained",label:"좋아하지만 함께 있으면 불편함",test:(a,b)=>/숨 막히|매우 불편|공간 공유는 불편|긴장하고/.test(`${a.comfort} ${b.comfort}`)||/많이 귀찮|보기만 해도 피곤/.test(`${a.annoyance} ${b.annoyance}`),lines:[
    (a,b)=>`${a.name}은(는) ${b.name}을(를) 싫어하지 않지만 같은 공간에 오래 있자 숨이 막혀 창가 쪽으로 자리를 옮겼어요.`,
    ()=>`둘만 있으면 불편해하면서도 농담의 호흡은 잘 맞아, 거리를 둔 채 한참 웃고 떠들었어요.`,
    (a,b)=>`${a.name}은(는) ${b.name}을(를) 많이 성가셔하면서도 다른 사람이 데려가려 하자 조금 더 있으라고 붙잡았어요.`,
    ()=>`연락을 귀찮아해 답을 미뤘지만, 헤어지기 전에는 다음에 볼 수 있는 날을 대충이라도 확인했어요.`]},
  {key:"steady",label:"갈등을 안전하게 조율함",test:()=>true,lines:[
    ()=>`의견이 조금 달랐지만 각자 원하는 것을 한 번씩 말한 뒤 무리 없는 쪽으로 조정했어요.`,
    ()=>`가까이 머무는 동안 서로가 허용한 거리와 접촉 범위를 자연스럽게 지켰어요.`,
    ()=>`다른 사람이 끼어들어도 둘 사이의 대화가 끊기지 않도록 하던 이야기를 차분히 마무리했어요.`,
    ()=>`헤어지기 전에 오늘 불편했던 점이 없는지 짧게 확인하고 다음 일정을 정했어요.`]}
];
const EXTRA_BOND_ACTIONS=[
  (a,b)=>`${topic(a.name)} ${b.name}의 말투가 평소와 다른 것을 알아차리고, 이유를 캐묻기보다 필요한 순간까지 곁에 머물렀어요.`,
  (a,b)=>`${topic(a.name)} ${b.name}이 먼저 고른 방식에 맞추되 자기 의사는 짧고 분명하게 덧붙였어요.`,
  (a,b)=>`${topic(a.name)} 다른 사람에게는 넘겼을 사소한 변화를 ${b.name}에게서는 놓치지 않고 기억해 두었어요.`,
  (a,b)=>`${topic(a.name)} ${b.name}과 대화가 끊긴 뒤에도 자리를 서둘러 떠나지 않고 각자 하던 일을 이어 갔어요.`,
  (a,b)=>`${topic(a.name)} ${b.name}에게 필요한 것을 직접 묻지 않고도 선택할 수 있도록 두 가지를 나란히 내밀었어요.`,
  (a,b)=>`${topic(a.name)} 헤어지기 전에 ${b.name}의 다음 일정만 확인하고, 부담스럽지 않게 먼저 한 걸음 물러났어요.`
];
const EXTRA_TENSION_LINES=[
  (a,b)=>`${topic(a.name)} ${b.name}이 가까워질 때마다 손에 쥔 물건을 다시 고쳐 잡으며 긴장을 감추려 했어요.`,
  (a,b)=>`${topic(a.name)} ${b.name}을 신경 쓰면서도 곧바로 다가가지 못하고, 한 사람 정도 들어갈 거리를 계속 남겨 두었어요.`,
  (a,b)=>`${topic(a.name)} 대답하기 전에 ${b.name}의 표정을 오래 살폈고, 평소보다 짧은 문장만 골라 말했어요.`,
  (a,b)=>`${topic(a.name)} 함께 있고 싶은 마음과 편히 숨 쉴 공간이 모두 필요해, 옆자리 대신 비스듬히 마주 보는 자리를 골랐어요.`,
  (a,b)=>`${topic(a.name)} ${b.name}의 행동을 믿어도 되는지 판단하지 못해 먼저 등을 보이지 않고 나란히 움직였어요.`,
  (a,b)=>`${topic(a.name)} 감정이 드러날까 하던 말을 한 번 삼켰지만, ${b.name}이 떠날 때까지 시선은 거두지 않았어요.`
];
const BOND_CATHARSIS_ACTIONS={
  devoted:[
    (a,b)=>`${topic(a.name)} 모두가 ${b.name}을 오해해도 자신만큼은 설명을 요구하지 않고 곁에 서겠다고 조용히 못 박았어요.`,
    (a,b)=>`${topic(a.name)} 가장 먼저 포기해야 할 것을 계산하다가 ${b.name}만은 그 목록에 넣지 않았어요.`,
    (a,b)=>`${topic(a.name)} 돌아오겠다는 ${b.name}의 말을 의심하지 않았고, 가장 늦은 시간까지 불을 켜 둔 채 기다렸어요.`,
    (a,b)=>`${topic(a.name)} ${b.name}이 무너지는 순간만큼은 대신 단단해지기로 하고 아무 말 없이 손을 내밀었어요.`
  ],
  romantic:[
    (a,b)=>`${topic(a.name)} 수많은 사람 사이에서 한 번도 헤매지 않고 ${b.name}을 먼저 찾아냈어요.`,
    (a,b)=>`${topic(a.name)} ${b.name}이 무심코 남긴 한마디를 오래 기억했다가 꼭 맞는 순간에 대답처럼 돌려주었어요.`,
    (a,b)=>`${topic(a.name)} 더 가까이 가고 싶은 마음을 숨기지 않되, ${b.name}이 고를 수 있도록 마지막 한 걸음은 남겨 두었어요.`,
    (a,b)=>`${topic(a.name)} 오늘이 끝나면 후회할 것 같아 돌아서던 ${b.name}을 불러 세우고 솔직한 진심 하나를 건넸어요.`
  ],
  unspoken:[
    (a,b)=>`${topic(a.name)} ${b.name}의 이름을 부르는 것만으로 마음이 들킬까 봐 평소보다 무심한 호칭을 골랐어요.`,
    (a,b)=>`${topic(a.name)} 떠나는 ${b.name}을 붙잡지 못한 대신, 다음에 다시 만날 이유를 누구보다 꼼꼼히 만들어 두었어요.`,
    (a,b)=>`${topic(a.name)} ${b.name}의 손이 스칠 뻔하자 물러났지만, 조금 뒤에는 아까와 같은 거리를 스스로 다시 좁혔어요.`,
    (a,b)=>`${topic(a.name)} 우정이라고 몇 번이나 마음속으로 정정했지만 ${b.name}이 웃는 순간만큼은 시선을 피하지 못했어요.`
  ],
  precious:[
    (a,b)=>`${topic(a.name)} ${b.name}이 스스로 일어날 사람이라는 것을 알기에 대신 싸우지 않고 돌아올 자리를 지켜 주었어요.`,
    (a,b)=>`${topic(a.name)} 아무도 기억하지 못한 ${b.name}의 오래된 소망을 기억해 두었다가 현실적인 첫걸음을 준비했어요.`,
    (a,b)=>`${topic(a.name)} ${b.name}의 약한 순간을 보았지만 그것을 약점처럼 다루지 않고 평소와 같은 목소리로 이름을 불렀어요.`,
    (a,b)=>`${topic(a.name)} 선택을 존중하면서도 혼자 감당하게 두지는 않겠다고 ${b.name}의 바로 옆자리를 골랐어요.`
  ],
  friends:[
    (a,b)=>`${topic(a.name)} 세상이 전부 등을 돌린다는 과장된 푸념에 ${b.name}만큼은 남아 있겠다고 장난처럼 대답했어요.`,
    (a,b)=>`${topic(a.name)} ${b.name}의 흑역사를 누구보다 많이 알면서도 결정적인 순간에는 단 한 번도 꺼내지 않았어요.`,
    (a,b)=>`${topic(a.name)} 말로는 귀찮다고 투덜거리면서 이미 ${b.name}의 몫까지 챙겨 들고 먼저 출발했어요.`,
    (a,b)=>`${topic(a.name)} 오래 비운 시간까지 단숨에 메우려 하지 않고, 어제도 만난 사람처럼 ${b.name}의 옆에 앉았어요.`
  ],
  family:[
    (a,b)=>`${topic(a.name)} 서로 가장 아픈 말을 알고 있었지만 이번만큼은 ${b.name}을 이기기 위해 그 말을 쓰지 않았어요.`,
    (a,b)=>`${topic(a.name)} 집에서는 늘 다투던 ${b.name}을 바깥사람이 함부로 대하자 망설임 없이 같은 편에 섰어요.`,
    (a,b)=>`${topic(a.name)} ${b.name}이 돌아올 시간을 묻지 않으면서도 현관 불과 먹을 것은 평소처럼 남겨 두었어요.`,
    (a,b)=>`${topic(a.name)} 미안하다는 말 대신 망가진 것을 고치고 빈자리를 채우며 ${b.name}에게 다시 말을 걸 준비를 했어요.`
  ],
  rivals:[
    (a,b)=>`${topic(a.name)} 자신이 넘어야 할 사람은 ${b.name}뿐이라며 다른 누구도 함부로 깎아내리지 못하게 했어요.`,
    (a,b)=>`${topic(a.name)} 완벽한 승리보다 전력을 다한 ${b.name}을 원했고, 숨겨 둔 비책을 마침내 꺼냈어요.`,
    (a,b)=>`${topic(a.name)} 패배를 인정하면서도 고개를 숙이지 않고 다음에는 반드시 이기겠다고 ${b.name}의 눈을 똑바로 봤어요.`,
    (a,b)=>`${topic(a.name)} ${b.name}이 없는 정상은 의미가 없다며 포기하려는 등을 가장 날카로운 말로 다시 세웠어요.`
  ],
  love_hate:[
    (a,b)=>`${topic(a.name)} ${b.name}을 용서하지 못하면서도 다른 사람의 손에 무너지는 것만은 두고 보지 않았어요.`,
    (a,b)=>`${topic(a.name)} 떠나라고 말한 입으로 위험을 경고했고, ${b.name}이 무사한 것을 확인한 뒤에야 등을 돌렸어요.`,
    (a,b)=>`${topic(a.name)} 상처 준 말을 정확히 기억하면서도 ${b.name}의 상처까지 외면할 수 없는 자신에게 더 화가 났어요.`,
    (a,b)=>`${topic(a.name)} 다시는 믿지 않겠다고 선을 그었지만, 마지막 선택만큼은 ${b.name}이 직접 하도록 길을 열어 주었어요.`
  ],
  hostile:[
    (a,b)=>`${topic(a.name)} ${b.name}의 선의를 믿지 않았기에 빚지지 않을 만큼만 도움을 받고 반드시 값을 치르겠다고 했어요.`,
    (a,b)=>`${topic(a.name)} 공동의 위험 앞에서도 등을 맡기지는 않았지만, 적어도 지금 공격할 사람은 서로가 아니라는 데 합의했어요.`,
    (a,b)=>`${topic(a.name)} ${b.name}의 약점을 손에 넣고도 아무 데서나 쓰지 않고 가장 필요한 순간을 위해 감춰 두었어요.`,
    (a,b)=>`${topic(a.name)} 물러난 것이 진 것이 아니라 더 큰 싸움을 고른 것이라며 ${b.name}에게서 시선을 거두지 않았어요.`
  ],
  distant:[
    (a,b)=>`${topic(a.name)} 아직 ${b.name}을 믿지는 않았지만 먼저 내민 약속 하나만큼은 끝까지 지켰어요.`,
    (a,b)=>`${topic(a.name)} 서로 모르는 것이 많다는 사실을 인정하고 ${b.name}에게 함부로 아는 척하지 않았어요.`,
    (a,b)=>`${topic(a.name)} 불편한 침묵을 억지 친밀감으로 덮지 않고 ${b.name}이 먼저 말할 때까지 같은 자리를 지켰어요.`,
    (a,b)=>`${topic(a.name)} 헤어지기 전 다음에 불러도 되는 이름과 지켜야 할 선을 ${b.name}과 분명히 확인했어요.`
  ]
};
RELATION_COMBINATION_BONDS.forEach(bond=>bond.actions=[...bond.actions,...EXTRA_BOND_ACTIONS,...(BOND_CATHARSIS_ACTIONS[bond.key]||[])]);
RELATION_COMBINATION_TENSIONS.forEach(tension=>tension.lines=[...tension.lines,...EXTRA_TENSION_LINES]);
const RELATION_COMBINATION_PROFILES=RELATION_COMBINATION_BONDS.flatMap((bond,bondIndex)=>
  RELATION_COMBINATION_TENSIONS.map((tension,tensionIndex)=>({key:`${bond.key}_${tension.key}`,label:`${bond.label} · ${tension.label}`,bondIndex,tensionIndex}))
);
const TOUCH_INTIMACY_LEVELS=["신체 접촉 없음","인사·부축 같은 의례적 접촉만","손잡기·팔짱까지","포옹·기대기까지","가벼운 입맞춤까지","깊은 입맞춤까지","성인 간 친밀한 접촉까지"];
function sharedIntimacyLevel(first,second){
  const firstTouch=characterViewFor(first.id,second.id).touchIntensity||"신체 접촉 없음";
  const secondTouch=characterViewFor(second.id,first.id).touchIntensity||"신체 접촉 없음";
  const firstLevel=Math.max(0,TOUCH_INTIMACY_LEVELS.indexOf(firstTouch));
  const secondLevel=Math.max(0,TOUCH_INTIMACY_LEVELS.indexOf(secondTouch));
  return Math.min(firstLevel,secondLevel);
}
function intimacyBeat(first,second,variant,bondKey){
  if(!["devoted","romantic","love_hate"].includes(bondKey))return "";
  const officialRomance=relationList().some(relation=>relation.temporalStatus!=="past"&&["연인","부부"].includes(relation.type)&&((relation.a===first.id&&relation.b===second.id)||(relation.a===second.id&&relation.b===first.id)));
  if(!officialRomance)return "";
  const level=sharedIntimacyLevel(first,second);
  if(level<2)return "";
  const beats={
    2:[
      `${first.name}은(는) 말끝을 흐리며 ${second.name}의 손을 먼저 잡았고, 손가락을 느슨하게 얽은 채 놓지 않았어요.`,
      `${first.name}은(는) 나란히 걷던 ${second.name}의 손바닥을 조심스럽게 잡아 자기 쪽으로 가까이 불렀어요.`,
      `${first.name}은(는) 다른 사람이 보지 않는 틈에 ${second.name}의 팔짱을 끼고 태연한 얼굴을 했어요.`,
      `헤어지기 직전 ${first.name}은(는) ${second.name}의 손을 한 번 더 당겨 짧게 붙잡아 두었어요.`
    ],
    3:[
      `${first.name}은(는) ${second.name}의 허리를 끌어안아 한동안 품 안에 두었고, 떨어진 뒤에도 어깨에 손을 남겨 두었어요.`,
      `대화가 잠시 끊기자 둘은 말 대신 가까이 기대어 같은 음악을 조용히 들었어요.`,
      `${first.name}은(는) ${second.name}을(를) 뒤에서 가볍게 끌어안고 턱을 어깨 가까이에 기댔어요.`,
      `돌아서려던 ${second.name}을(를) 다시 품에 당겨 짧고 단단하게 안은 뒤에야 보내 주었어요.`
    ],
    4:[
      `${first.name}은(는) ${second.name}의 표정을 살핀 뒤 가까이 다가가 입술에 짧게 입을 맞추고, 바로 떨어지지 않은 채 이마를 맞댔어요.`,
      `${first.name}은(는) ${second.name}이(가) 가까이 머무는 것을 확인한 뒤 고개를 기울여 짧은 입맞춤을 건넸어요.`,
      `${first.name}은(는) 사람들의 시선이 끊긴 곳에서 ${second.name}의 뺨을 감싸고 가볍게 입을 맞췄어요.`,
      `작별 인사가 끝났는데도 둘은 다시 가까워져 한 번 더 짧게 입을 맞춘 뒤 천천히 떨어졌어요.`
    ],
    5:[
      `${first.name}은(는) ${second.name}의 허리를 감싸 가까이 당겼고, 그대로 한동안 길게 입을 맞췄어요.`,
      `둘은 숨이 닿을 만큼 가까이 마주 섰고, 서로의 눈을 오래 바라보다 한동안 깊게 입을 맞췄어요.`,
      `${first.name}은(는) ${second.name}의 목덜미에 손을 얹어 조심스럽게 끌어당기고, 주변을 잊은 듯 긴 입맞춤을 나눴어요.`,
      `문 앞에서 몇 번이나 헤어지지 못하던 둘은 다시 서로를 끌어안고 길게 입을 맞춘 뒤에야 손을 놓았어요.`
    ],
    6:[
      `둘은 한동안 문이 닫힌 조용한 공간에서 둘만의 시간을 보냈어요. 장면이 끝난 뒤 ${first.name}은(는) 흐트러진 옷매무새를 정리하며 ${second.name}의 표정을 살폈어요.`,
      `둘은 예정했던 일을 잠시 미루고 서로에게만 집중했어요. 다시 일상으로 돌아갈 때까지 한동안 서로에게서 떨어지지 않았어요.`,
      `${first.name}은(는) ${second.name}과(와) 입을 맞추며 문이 닫힌 안쪽으로 자리를 옮겼어요. 이후의 시간은 둘만의 것으로 남겨 두었고, 다시 나왔을 때는 서로의 상태부터 확인했어요.`,
      `떠날 시간이 한참 지났지만 둘은 더 오래 함께 머물렀어요. 가까운 시간이 지난 뒤에도 ${first.name}은(는) ${second.name}의 곁을 바로 떠나지 않았어요.`
    ]
  };
  return beats[level]?.[variant]||"";
}
function unconfirmedMutualRomanceBeat(first,second,variant){
  const beats=[
    `${topic(first.name)} 걷다가 ${second.name}의 손등에 손가락이 스치자 놀라 먼저 손을 거뒀어요. 아무렇지 않은 척 다른 이야기를 꺼냈지만 걸음은 조금 느려졌어요.`,
    `${topic(first.name)} ${second.name}에게 보여 주려던 사진을 핑계로 어깨를 가까이했다가, 너무 가까워진 것을 깨닫고 화면만 오래 들여다봤어요.`,
    `${subject(second.name)} 웃자 ${topic(first.name)} 따라 웃다가 눈이 마주친 순간 먼저 시선을 피했어요. 둘 다 이유 없이 같은 말을 한 번씩 더 반복했어요.`,
    `${topic(first.name)} 헤어질 시간이 됐는데도 사소한 질문을 하나 더 꺼냈어요. ${topic(second.name)} 이미 아는 답인데도 천천히 대답하며 자리를 뜨지 않았어요.`,
    `${topic(first.name)} 바람에 흐트러진 ${second.name}의 옷깃을 정리해 주려 손을 들었다가 닿기 직전에 멈추고 말로만 알려 줬어요.`,
    `${topic(second.name)} 다른 사람에게 먼저 웃어 보이자 ${topic(first.name)} 괜히 대화에 끼어들었다가 스스로도 이유를 설명하지 못했어요.`,
    `둘은 같은 것을 동시에 집으려다 손이 겹쳤어요. 누가 먼저랄 것도 없이 손을 뺐지만, 잠시 뒤 둘 다 똑같은 물건을 다시 골랐어요.`,
    `${topic(first.name)} ${second.name}의 몫을 자연스럽게 먼저 챙겨 놓고도 특별히 신경 쓴 건 아니라며 변명부터 했어요.`,
    `${topic(second.name)} 춥지 않냐고 묻자 ${topic(first.name)} 괜찮다고 답하면서도 나란히 설 수 있는 바람 적은 자리로 옮겼어요.`,
    `${topic(first.name)} 둘만 알아들을 옛날 이야기를 꺼냈어요. 한참 웃은 뒤 침묵이 찾아왔지만 누구도 먼저 멀어지지 않았어요.`,
    `${topic(first.name)} 연락할 이유를 만들려고 방금 본 사소한 것을 사진으로 보냈어요. ${topic(second.name)} 곧바로 답장을 쓰고도 너무 빨라 보일까 잠시 기다렸다 보냈어요.`,
    `돌아가는 길이 갈라지는 곳에서 둘은 같은 말을 몇 번이나 바꿔 가며 작별했어요. 헤어진 뒤에는 거의 동시에 뒤를 돌아봤어요.`
  ];
  return beats[variant%beats.length];
}
function detachedIntimacyBeat(first,second,variant,bondKey){
  if(["devoted","romantic","love_hate"].includes(bondKey))return "";
  const level=sharedIntimacyLevel(first,second);
  if(level<4)return "";
  const restrained=[
    `${first.name}은(는) 다정한 말 대신 ${second.name}의 턱을 가볍게 들어 짧게 입을 맞췄어요. 둘은 그 행동에 특별한 이름을 붙이지 않고 곧바로 하던 이야기로 돌아갔어요.`,
    `감정적인 대화는 피하던 둘이었지만 가까운 접촉만큼은 익숙했어요. ${first.name}은(는) ${second.name}의 허리를 당겨 입을 맞춘 뒤 서로의 사생활을 묻지 않았어요.`,
    `${first.name}과(와) ${second.name}은(는) 문이 닫힌 안쪽에서 한동안 가까운 시간을 보냈어요. 다시 나왔을 때도 애정이나 미래에 관한 말은 꺼내지 않았어요.`,
    `둘은 다음 약속이나 관계의 의미를 정하지 않은 채 서로에게 익숙하게 기대었어요. 헤어질 때도 짧은 입맞춤 외에는 별다른 인사를 남기지 않았어요.`
  ];
  return level>=6?restrained[variant]:restrained[variant].replace(/문이 닫힌 안쪽에서 한동안 가까운 시간을 보냈어요\./,"사람들의 시선이 닿지 않는 곳에서 길게 입을 맞췄어요.");
}
function heightenedConflictBeat(first,second,tensionKey,variant){
  const level=aggressionExpressionLevel(first,characterViewFor(first.id,second.id));
  if(level<3)return "";
  if(level===3)return [
    `${first.name}은(는) 욱한 순간 ${second.name}의 팔을 한 차례 쳤어요. ${second.name}은(는) 맞서 때리지 않고 팔을 막으며 곧바로 거리를 벌렸어요.`,
    `${first.name}은(는) 말다툼 끝에 ${second.name}의 어깨를 한 번 가격했어요. ${second.name}은(는) 반격하지 않고 손을 막아 세운 뒤 자리를 피했어요.`,
    `${first.name}은(는) 순간적으로 ${second.name}을 한 차례 때렸지만 계속 쫓아가지는 않았어요. ${second.name}은(는) 몸을 지키며 사람 있는 쪽으로 물러났어요.`,
    `${first.name}은(는) 화를 참지 못하고 ${second.name}의 팔을 세게 쳤어요. ${second.name}은(는) 맞서 싸우지 않고 더 다가오지 말라고 경고했어요.`
  ][variant];
  return [
    `${first.name}은(는) 쌓인 말이 터지자 ${second.name}과(와) 거칠게 치고받았어요. 한차례 몸싸움 뒤 둘은 숨을 고르며 더 이어 가지 않았어요.`,
    `${first.name}은(는) ${second.name}의 폭언을 듣고 참지 못해 주먹을 휘둘렀고, 반격이 돌아오며 둘은 한동안 거칠게 싸웠어요.`,
    `${first.name}은(는) 말다툼 끝에 ${second.name}과(와) 몸싸움을 벌였어요. 넘어진 가구를 사이에 두고서야 둘은 서로에게서 떨어졌어요.`,
    `${first.name}은(는) 끝내 분을 참지 못하고 ${second.name}과(와) 치고받았어요. 둘 다 지쳐 물러난 뒤에야 싸움이 멎었어요.`
  ][variant];
}
function pairedConflictScene(first,second,tensionKey,variant,firstView,secondView){
  if(!["violent","explosive"].includes(tensionKey))return null;
  const firstLevel=aggressionExpressionLevel(first,firstView);
  const secondLevel=aggressionExpressionLevel(second,secondView);
  if(Math.max(firstLevel,secondLevel)<3)return null;
  if(Math.min(firstLevel,secondLevel)<4)return{
    first:heightenedConflictBeat(first,second,tensionKey,variant),
    second:secondLevel>=3
      ?heightenedConflictBeat(second,first,tensionKey,(variant+1)%4)
      :`${second.name}은(는) 갑작스러운 행동을 막아 내고 곧바로 거리를 벌렸어요.`
  };
  const mutualHate=/매우 싫어|미워|경계|애증/.test(firstView.overall||"")&&/매우 싫어|미워|경계|애증/.test(secondView.overall||"");
  const triggers=[
    mutualHate
      ?`${second.name}의 잘난 얼굴과 비웃는 표정을 보고 있자니 참아 두었던 분노가 치밀었어요.`
      :`${second.name}이(가) 약점을 들먹이며 비웃자 ${first.name}의 표정이 단숨에 굳었어요.`,
    `${second.name}의 폭언이 선을 넘자 ${first.name}은(는) 더는 참지 않고 자리에서 일어났어요.`,
    `${second.name}이(가) 일부러 어깨를 치고도 사과하지 않자 ${first.name}이(가) 멱살을 잡았어요.`,
    `${second.name}이(가) 중요한 말을 끝까지 무시하고 돌아서자 ${first.name}이(가) 팔을 잡아 세웠어요.`
  ];
  const actions=[
    {
      first:`${triggers[0]} ${first.name}이(가) 먼저 주먹을 날렸고, 곧바로 반격을 맞으며 둘은 가구가 밀려날 만큼 치고받았어요.`,
      second:`${first.name}의 주먹을 맞은 ${second.name}은(는) 비틀거리면서도 곧장 얼굴을 되받아쳤어요. 둘은 서로의 옷깃을 놓지 않은 채 방 안을 엉망으로 만들었어요.`
    },
    {
      first:`${triggers[1]} ${first.name}은(는) ${second.name}의 멱살을 잡아 벽으로 밀어붙였고, 주먹과 발길질이 오가며 팔과 어깨에 멍이 번졌어요.`,
      second:`벽에 부딪힌 ${second.name}은(는) ${first.name}의 손목을 꺾어 떼어 낸 뒤 턱을 올려쳤어요. 밀려난 둘은 다시 달려들어 바닥을 구르며 싸웠어요.`
    },
    {
      first:`${triggers[2]} ${first.name}은(는) ${second.name}을(를) 바닥에 메쳐 팔을 눌렀지만, 곧 몸이 뒤집히며 옆으로 내동댕이쳐졌어요.`,
      second:`멱살을 잡힌 ${second.name}은(는) 그대로 물러나지 않고 ${first.name}의 허리를 붙잡아 함께 바닥으로 넘어뜨렸어요. 둘은 위아래를 뒤집어 가며 서로를 제압하려 했어요.`
    },
    {
      first:`${triggers[3]} ${first.name}은(는) 돌아선 ${second.name}을(를) 거칠게 끌어당겼고, 뺨을 맞자 주먹으로 되받아쳤어요. 결국 둘 다 묵사발이 된 몰골로 숨을 몰아쉬었어요.`,
      second:`팔을 붙잡힌 ${second.name}은(는) ${first.name}의 뺨을 후려쳤어요. 돌아온 주먹을 막지 못했지만 곧 몸통을 걷어차며 끝까지 맞섰어요.`
    }
  ];
  return actions[variant];
}
function relationCombinationScene(place,first,second,relation,date){
  const firstExplicit=explicitCharacterViewFor(first.id,second.id);
  const secondExplicit=explicitCharacterViewFor(second.id,first.id);
  const firstView=characterViewFor(first.id,second.id);
  const secondView=characterViewFor(second.id,first.id);
  if(!relation&&Object.keys(firstExplicit).length+Object.keys(secondExplicit).length<2)return null;
  const romanticView=view=>/연애 감정|깊이 사랑|없어서는 안 될/.test(view.overall||"");
  const firstRomantic=romanticView(firstView),secondRomantic=romanticView(secondView);
  const officialRomance=relation?.temporalStatus!=="past"&&["연인","부부"].includes(relation?.type);
  const feelingsConfirmed=/서로의 마음을 확인/.test(`${firstView.mutualAwareness} ${secondView.mutualAwareness}`);
  const unconfirmedMutualRomance=firstRomantic&&secondRomantic&&!officialRomance&&!feelingsConfirmed;
  const activeRomanticPartners=person=>relationList()
    .filter(item=>item.temporalStatus!=="past"&&["연인","부부"].includes(item.type)&&[item.a,item.b].includes(person.id))
    .map(item=>item.a===person.id?item.b:item.a);
  const affairActors=[first,second].filter(person=>activeRomanticPartners(person).some(partnerId=>partnerId!==first.id&&partnerId!==second.id));
  const affairAllowed=affairActors.length>0&&affairActors.every(person=>/연인이 있어도 취향이면 끌릴 수 있음/.test(person.relationshipOpenness||""));
  if(firstRomantic!==secondRomantic){
    const admirer=firstRomantic?first:second;
    const other=firstRomantic?second:first;
    const admirerView=firstRomantic?firstView:secondView;
    const aware=/알고 있음|확인함/.test(admirerView.mutualAwareness||"");
    const variants=[
      {admirer:`${admirer.name}은(는) ${other.name}의 몫을 먼저 챙긴 뒤 별 뜻 없다는 얼굴로 시선을 돌렸어요.`,other:`${other.name}은(는) 건네받은 것을 가볍게 흔들어 보이며 고맙다고만 했어요.`},
      {admirer:`${admirer.name}은(는) 대화를 하나 더 꺼내며 둘만 남은 시간을 붙잡았어요.`,other:`${other.name}은(는) 마지막 말에 짧게 답한 뒤 먼저 자기 자리로 돌아갔어요.`},
      {admirer:`${admirer.name}은(는) ${other.name}이(가) 다른 사람과 웃는 모습을 말없이 오래 바라봤어요.`,other:`${other.name}은(는) 그 시선을 ${aware?"알면서도 모르는 척했어요.":"눈치채지 못한 채 대화를 이어 갔어요."}`},
      {admirer:`${admirer.name}은(는) 헤어진 뒤 사소한 핑계를 만들어 먼저 메시지를 보냈어요.`,other:`${other.name}은(는) 한참 뒤 필요한 말에만 짧게 답했어요.`}
    ];
    const variant=hash(`${first.id}:${second.id}:${dayKey(date)}:${Math.floor(nowMin(date)/45)}:one-sided`)%4;
    const lines=variants[variant];
    return {title:`${object(other.name)} 향한 일방적인 연심`,first:first.id===admirer.id?lines.admirer:lines.other,second:second.id===admirer.id?lines.admirer:lines.other,relationProfile:"one_sided_romance"};
  }
  const foundBond=RELATION_COMBINATION_BONDS.findIndex(item=>item.test(firstView,secondView,relation));
  const foundTension=RELATION_COMBINATION_TENSIONS.findIndex(item=>item.test(firstView,secondView,relation,first,second));
  const bondIndex=Math.max(0,foundBond),tensionIndex=Math.max(0,foundTension);
  const profile=RELATION_COMBINATION_PROFILES.find(item=>item.bondIndex===bondIndex&&item.tensionIndex===tensionIndex);
  const bond=RELATION_COMBINATION_BONDS[bondIndex],tension=RELATION_COMBINATION_TENSIONS[tensionIndex];
  const sceneSeed=hash(`${first.id}:${second.id}:${dayKey(date)}:${Math.floor(nowMin(date)/15)}:${profile.key}`);
  const variant=sceneSeed%bond.actions.length;
  const reverseVariant=(variant+Math.ceil(bond.actions.length/2))%bond.actions.length;
  const tensionVariant=sceneSeed%tension.lines.length;
  const reverseTensionVariant=(tensionVariant+Math.ceil(tension.lines.length/2))%tension.lines.length;
  const placeName=place?.name||place?.type||"같은 장소";
  const beatVariant=variant%4,reverseBeatVariant=reverseVariant%4;
  const firstIntimacy=unconfirmedMutualRomance?unconfirmedMutualRomanceBeat(first,second,variant):intimacyBeat(first,second,beatVariant,bond.key);
  const secondIntimacy=unconfirmedMutualRomance?unconfirmedMutualRomanceBeat(second,first,reverseVariant):intimacyBeat(second,first,reverseBeatVariant,bond.key);
  const firstDetachedIntimacy=detachedIntimacyBeat(first,second,beatVariant,bond.key);
  const secondDetachedIntimacy=detachedIntimacyBeat(second,first,reverseBeatVariant,bond.key);
  const firstConflict=heightenedConflictBeat(first,second,tension.key,beatVariant);
  const secondConflict=heightenedConflictBeat(second,first,tension.key,reverseBeatVariant);
  const pairedConflict=pairedConflictScene(first,second,tension.key,variant%4,firstView,secondView);
  const familyRomance=["부모·자녀","형제·자매"].includes(relation?.type)&&["devoted","romantic","love_hate"].includes(bond.key);
  const hiddenMutualRomance=!relation&&firstRomantic&&secondRomantic&&!/확인함/.test(`${firstView.mutualAwareness} ${secondView.mutualAwareness}`);
  const profileLabel=familyRomance
    ?`가족 관계와 연심이 충돌함 · ${RELATION_COMBINATION_TENSIONS[tensionIndex].label}`
    :hiddenMutualRomance
      ?`서로 마음을 숨기는 쌍방 연심 · ${RELATION_COMBINATION_TENSIONS[tensionIndex].label}`
      :profile.label;
  const directTitle=pairedConflict
    ?`${second.name}와 거칠게 충돌하는 중`
    :affairAllowed&&firstRomantic&&secondRomantic
      ?`${second.name}와 숨겨 둔 만남을 이어 가는 중`
      :tension.key==="distrust"
        ?`${object(second.name)} 믿지 못한 채 함께 있는 중`
        :tension.key==="strained"
          ?`${second.name} 옆에서 자꾸 앉을 자리를 바꾸는 중`
          :unconfirmedMutualRomance
            ?`${second.name}과 친구인 척 조금 더 머무는 중`
          :["devoted","romantic"].includes(bond.key)
            ?`${second.name}와 둘만의 시간을 보내는 중`
            :`${second.name}와 함께 시간을 보내는 중`;
  const reverseTitle=pairedConflict
    ?`${first.name}와 거칠게 충돌하는 중`
    :affairAllowed&&firstRomantic&&secondRomantic
      ?`${first.name}와 숨겨 둔 만남을 이어 가는 중`
      :tension.key==="distrust"
        ?`${object(first.name)} 믿지 못한 채 함께 있는 중`
        :tension.key==="strained"
          ?`${first.name} 옆에서 자꾸 앉을 자리를 바꾸는 중`
          :unconfirmedMutualRomance
            ?`${first.name}과 친구인 척 조금 더 머무는 중`
            :["devoted","romantic"].includes(bond.key)
              ?`${first.name}와 둘만의 시간을 보내는 중`
              :`${first.name}와 함께 시간을 보내는 중`;
  if(pairedConflict){
    return {
      title:directTitle,
      firstTitle:directTitle,
      secondTitle:reverseTitle,
      first:pairedConflict.first,
      second:pairedConflict.second,
      relationProfile:profile.key
    };
  }
  const firstExtra=[firstIntimacy||firstDetachedIntimacy||firstConflict,tension.key==="strained"?tension.lines[tensionVariant](first,second):""].filter(Boolean).join(" ")||tension.lines[tensionVariant](first,second);
  const secondExtra=[secondIntimacy||secondDetachedIntimacy||secondConflict,tension.key==="strained"?tension.lines[reverseTensionVariant](second,first):""].filter(Boolean).join(" ")||tension.lines[reverseTensionVariant](second,first);
  const affairFirst=affairAllowed?`${topic(first.name)} 이미 이어지고 있는 관계가 있다는 사실을 의식하면서도 ${togetherWith(second.name)}의 만남을 끊지 않았고, 아는 사람과 마주치지 않을 자리를 골랐어요. `:"";
  const affairSecond=affairAllowed?`${topic(second.name)} 이 만남이 다른 관계와 충돌할 수 있다는 것을 알면서도 ${togetherWith(first.name)} 정한 시간까지 자리를 지켰어요. `:"";
  return {
    title:directTitle,
    firstTitle:directTitle,
    secondTitle:reverseTitle,
    first:characterVoice(first,`${affairFirst}${bond.actions[variant](first,second)} ${firstExtra}`.trim()),
    second:characterVoice(second,`${affairSecond}${bond.actions[reverseVariant](second,first)} ${secondExtra}`.trim()),
    relationProfile:profile.key
  };
}
function concreteInteraction(place,first,second,relation,date=new Date()){
  const name=second.name,type=place?.type||"";
  const viewScene=viewDrivenInteraction(place,first,second,date);
  if(viewScene)return viewScene;
  const combinationScene=relationCombinationScene(place,first,second,relation,date);
  if(combinationScene)return combinationScene;
  if(!relation){
    const firstExplicit=explicitCharacterViewFor(first.id,second.id);
    const secondExplicit=explicitCharacterViewFor(second.id,first.id);
    const likes=value=>/연애 감정|깊이 사랑|없어서는/.test(value?.overall||"");
    const firstLikes=likes(firstExplicit),secondLikes=likes(secondExplicit);
    const admirer=firstLikes&&!secondLikes?first:secondLikes&&!firstLikes?second:null;
    if(admirer){
      const stranger=admirer.id===first.id?second:first;
      const introverted=Number(admirer.socialEnergy??3)<=2||/혼자|낯|수줍|조용/.test(String(admirer.socialStyle||""));
      const admirerText=introverted
        ?`${stranger.name}에게 호감이 있지만 선뜻 말을 걸지 못했어요. 가까운 곳을 몇 번 맴돌다가 시선이 마주치면 금세 다른 곳을 보는 척하고 있어요.`
        :`${stranger.name}에게 호감이 있어 자연스럽게 인사를 건네고 눈에 띈 것을 함께 보자고 제안했어요. 아직 친한 사이는 아니라 반응을 재촉하지 않고 한 걸음 물러서 기다리고 있어요.`;
      const strangerText=`${subject(admirer.name)} 자신을 유난히 의식하는 듯해 조금 당황했어요. 아직 잘 모르는 사람이라 바로 친근하게 맞추기보다는 조심스럽게 인사하고, 왜 다가왔는지 반응을 살피고 있어요.`;
      return {
        first:first.id===admirer.id?admirerText:strangerText,
        second:second.id===admirer.id?admirerText:strangerText,
        firstTitle:first.id===admirer.id?(introverted?"좋아하지만 말을 걸지 못하는 중":"호감 있는 사람에게 조심스럽게 다가가는 중"):"낯선 사람의 호감에 당황하는 중",
        secondTitle:second.id===admirer.id?(introverted?"좋아하지만 말을 걸지 못하는 중":"호감 있는 사람에게 조심스럽게 다가가는 중"):"낯선 사람의 호감에 당황하는 중",
        title:"엇갈린 호감을 느끼는 중"
      };
    }
    return {
      first:`${name}와 같은 공간에 있지만 아직 서로를 잘 알지 못해요. 시선이 마주쳤을 때 가볍게 목례한 뒤 각자 보던 것과 하던 일로 돌아갔어요.`,
      second:`${subject(first.name)} 가까이에 있다는 것은 알아챘지만 아는 사이가 아니라 굳이 말을 붙이지 않았어요. 서로의 동선을 방해하지 않을 만큼 거리를 두고 있어요.`,
      title:"낯선 사람과 각자 시간을 보내는 중"
    };
  }
  if(["혐관","라이벌"].includes(relation?.type))return {
    first:`${name}와 눈이 마주치자 먼저 시선을 거두고, 일부러 조금 떨어진 자리를 골라 하던 일에 집중하고 있어요.`,
    second:`${subject(first.name)} 거리를 두는 것을 알아챘지만 따라가 말을 붙이지 않고, 자신의 자리에서 하던 일을 이어가고 있어요.`,
    title:"서로 거리를 두는 중"
  };
  if(type==="공원"){
    const romantic=["연인","부부"].includes(relation?.type);
    const careful=/낯을 가림|혼자가 편함/.test(first.socialStyle||"")||/조심|신중/.test(`${first.decisionStyle||""} ${first.activityTempo||""}`);
    const energetic=/먼저 다가감|무리의 중심|가만히 못/.test(`${first.socialStyle||""} ${first.energyRhythm||""}`);
    const observant=/논리|현실|경험/.test(`${first.decisionStyle||""} ${first.informationStyle||""}`);
    const scenes=[
      {
        title:`${name}의 머리 위로 떨어지는 나뭇잎을 피하게 하는 중`,
        first:`바람에 날린 커다란 나뭇잎이 ${name}의 머리 위로 떨어지자 ${careful?"말없이 손을 뻗어 조심스럽게 걷어 냈어요.":"짧게 웃으며 옆으로 피하라고 알려 주고 손으로 받아 냈어요."} ${romantic?"다시 둘만의 보폭을 맞추며 가까운 길로 접어들었어요.":"나뭇잎 모양을 함께 살펴본 뒤 걷던 길을 이어 갔어요."}`,
        second:`${subject(first.name)} 나뭇잎을 막아 준 것을 알아차리고 ${romantic?"고맙다는 말 대신 자연스럽게 더 가까이 붙어 걸었어요.":"고맙다고 말한 뒤 떨어진 나뭇잎을 한 번 뒤집어 보고 길가에 내려놓았어요."}`
      },
      {
        title:`${name}와 갈림길에서 산책로를 고르는 중`,
        first:`갈림길 앞에서 ${observant?"안내판의 거리와 경사를 먼저 비교한 뒤":"햇빛과 사람 수를 둘러본 뒤"} ${name}에게 어느 쪽이 편한지 물었어요. ${romantic?"서두르지 않고 둘만 오래 걸을 수 있는 조용한 길을 골랐어요.":"상대의 선택에 맞춰 방향을 바꾸었어요."}`,
        second:`${subject(first.name)} 먼저 의견을 묻자 원하는 길을 가리키고, 그 길에서 눈에 띄는 풍경을 하나씩 이야기하며 함께 걸었어요.`
      },
      {
        title:`${name}와 갑자기 불어온 바람을 피하는 중`,
        first:`갑자기 강한 바람이 불어 흙먼지와 잔가지가 날리자 ${energetic?`${name}의 팔을 가볍게 이끌어 큰 나무 뒤로 뛰어갔어요.`:`${name}에게 고개를 숙이라고 알리고 바람이 잦아들 때까지 나무 옆에 함께 섰어요.`} ${romantic?"짧게 눈을 마주치고 웃은 뒤 방해받지 않는 길로 방향을 틀었어요.":""}`,
        second:`바람이 잦아들자 옷과 머리에 붙은 작은 잎을 털고 ${subject(first.name)} 상태도 살펴본 뒤 다시 길을 나섰어요.`
      },
      {
        title:`${name}와 벤치에 앉아 지나가는 개를 보는 중`,
        first:`산책하던 개가 신이 나 낙엽 더미로 뛰어드는 모습을 보고 ${energetic?`먼저 웃음을 터뜨리며 ${name}에게 저쪽을 보라고 손짓했어요.`:`조용히 시선을 보내다가 ${name}도 보고 있다는 걸 확인하고 작게 웃었어요.`} ${romantic?"둘만 알아들을 농담을 건네며 어깨가 닿을 만큼 가까운 벤치에 머물렀어요.":""}`,
        second:`${subject(first.name)} 반응을 보고 같은 장면을 바라보다가 개가 사라진 뒤에도 바로 일어나지 않고 잠시 이야기를 이어 갔어요.`
      }
    ];
    const scene=scenes[hash(`${first.id}:${second.id}:${dayKey(date)}:${Math.floor(nowMin(date)/45)}:park-detail`)%scenes.length];
    return scene;
  }
  if(type==="카페")return {
    first:`${subject(name)} 편히 앉을 수 있도록 테이블 위 물건을 한쪽으로 옮기고, 메뉴에서 눈에 띈 음료를 손가락으로 짚어 보여주고 있어요.`,
    second:`${subject(first.name)} 보여준 메뉴를 들여다본 뒤 고개를 끄덕이고, 주문한 음료를 서로 비교해 보고 있어요.`,
    title:"한 테이블에서 시간을 보내는 중"
  };
  if(type==="음식점")return {
    first:`${name} 쪽으로 반찬 접시를 밀어 주고, 방금 먹어 본 음식 중 괜찮았던 것을 골라 권하고 있어요.`,
    second:`${subject(first.name)} 건넨 접시에서 한입 덜어 맛본 뒤, 자기 앞의 음식도 조금 나누어 주고 있어요.`,
    title:"음식을 나누어 먹는 중"
  };
  return {
    first:`${subject(name)} 불편하지 않도록 옆자리를 조금 비켜 주고, 지금 보고 있던 것을 손짓으로 가리켜 함께 확인하고 있어요.`,
    second:`${subject(first.name)} 보여준 것을 잠시 함께 살펴본 뒤, 짧게 반응하고 자기 눈에 들어온 것도 하나 골라 보여주고 있어요.`,
    title:"같은 자리에 머무는 중"
  };
}
function interactionPlace(placeId,townId){
  const town=state.towns.find(item=>item.id===townId)||state.towns.find(item=>item.places?.some(place=>place.id===placeId))||state.world;
  return town?.places?.find(place=>place.id===placeId);
}
function cleanRepeatedSceneText(value){
  const parts=String(value||"").split(/(?<=[.!?])\s+/).map(part=>part.trim()).filter(Boolean);
  return [...new Set(parts)].join(" ");
}
function baseSceneFrom(value){
  if(!value?.groupInteraction)return value;
  return {
    ...value,
    title:value.baseTitle||String(value.title||"").split(" · ")[0],
    desc:value.baseDesc||cleanRepeatedSceneText(value.desc),
    groupInteraction:false,
    withIds:[]
  };
}
function sharedParticipantOrder(characters,relation){
  const available=new Set(characters.map(character=>character.id));
  const configured=Array.isArray(relation?.displayOrder)?relation.displayOrder:Array.isArray(relation?.groupMembers)?relation.groupMembers:[];
  return [...new Set([...configured.filter(id=>available.has(id)),...characters.map(character=>character.id)])];
}
function sharedPlaceScene(c,current,date,sharedContext=null){
  const dateGroupParticipantIds=event=>event?.dateGroup
    ?state.order.filter(id=>String(event.dateGroup).includes(id))
    :[];
  current=baseSceneFrom(current);
  if(sharedContext?.dateGroup)current={...current,dateGroup:sharedContext.dateGroup,datePurpose:sharedContext.datePurpose||current.datePurpose,withId:sharedContext.forcedPartnerId||current.withId};
  if(!current?.dateGroup){
    const incomingDate=state.order.map(id=>{
      const owner=state.characters[id];
      if(!owner||owner.id===c.id)return null;
      const ownerEvent=baseEventFor(owner,date);
      const groupIds=dateGroupParticipantIds(ownerEvent);
      const includesTarget=groupIds.includes(c.id);
      const targetsCharacter=groupIds.length>=2?includesTarget:ownerEvent?.withId===c.id;
      return ownerEvent?.dateGroup&&ownerEvent?.datePurpose&&targetsCharacter?{owner,event:ownerEvent}:null;
    }).find(Boolean);
    if(incomingDate){
      const source=incomingDate.event;
      current={
        ...current,
        home:Boolean(source.home),
        room:source.room,
        visitHomeId:source.visitHomeId,
        placeId:source.placeId,
        townId:source.townId,
        transit:false,
        dateGroup:source.dateGroup,
        datePurpose:source.datePurpose,
        withId:incomingDate.owner.id,
        mood:"데이트"
      };
    }
  }
  if(!current||current.transit||/자는 중/.test(current.title||""))return current;
  const currentHomeId=current.visitHomeId||c.homeId;
  const isHomeScene=Boolean(current.home);
  if(!isHomeScene&&!current.placeId)return current;
  const forcedPartner=sharedContext?.forcedPartnerId?state.characters[sharedContext.forcedPartnerId]:null;
  const groupedDatePartner=current.dateGroup&&current.datePurpose
    ?state.order.map(id=>state.characters[id]).find(other=>other&&other.id!==c.id&&String(current.dateGroup).includes(other.id))
    :null;
  const explicitDatePartner=forcedPartner||groupedDatePartner||(current.dateGroup&&current.datePurpose&&current.withId?state.characters[current.withId]:null);
  if(explicitDatePartner&&current.dateGroup&&current.withId!==explicitDatePartner.id)current={...current,withId:explicitDatePartner.id,withIds:[explicitDatePartner.id]};
  // 날짜와 상대가 정해진 데이트에는 같은 장소에 우연히 있던 제3자를 끼우지 않는다.
  // 일반 장면에서만 현재 방/장소가 같은 인물을 공동 장면 후보로 삼는다.
  const together=explicitDatePartner
    ?[explicitDatePartner]
    :state.order.map(id=>state.characters[id]).filter(other=>{
      if(!other||other.id===c.id)return false;
      const otherEvent=baseEventFor(other,date);
      if(otherEvent.transit||/자는 중/.test(otherEvent.title||""))return false;
      const otherDatePartner=otherEvent.dateGroup&&otherEvent.datePurpose
        ?state.order.find(id=>id!==other.id&&String(otherEvent.dateGroup).includes(id))
        :otherEvent.withId;
      if(otherEvent.dateGroup&&otherEvent.datePurpose&&otherDatePartner&&otherDatePartner!==c.id)return false;
      const reservedByAnotherDate=state.order.some(ownerId=>{
        const owner=state.characters[ownerId];
        if(!owner||owner.id===other.id||owner.id===c.id)return false;
        const ownerEvent=baseEventFor(owner,date);
        const groupIds=dateGroupParticipantIds(ownerEvent);
        const reservesCharacter=groupIds.length>=2?groupIds.includes(other.id):ownerEvent?.withId===other.id;
        return Boolean(ownerEvent?.dateGroup&&ownerEvent?.datePurpose&&reservesCharacter);
      });
      if(reservedByAnotherDate)return false;
      if(isHomeScene){
        const otherHomeId=otherEvent.visitHomeId||other.homeId;
        return otherEvent.home&&otherHomeId===currentHomeId&&otherEvent.room===current.room;
      }
      return !otherEvent.home&&otherEvent.placeId===current.placeId&&(otherEvent.townId||other.townId)===(current.townId||c.townId);
    });
  if(!together.length)return current;
  const homeRoom=state.homes[currentHomeId]?.rooms?.[current.room];
  const place=isHomeScene
    ?{id:`home:${currentHomeId}:${current.room}`,type:homeRoom?.type||current.room||"집",name:homeRoom?.name||"집 안"}
    :interactionPlace(current.placeId,current.townId||c.townId);
  const group=[c,...together],preferred=explicitDatePartner
    ?{first:c,second:explicitDatePartner,relation:relationList().find(r=>(r.a===c.id&&r.b===explicitDatePartner.id)||(r.b===c.id&&r.a===explicitDatePartner.id))}
    :interactionPairFor(c,together);
  if(!preferred)return current;
  const ordered=[preferred.first,preferred.second].sort((a,b)=>String(a.id).localeCompare(String(b.id)));
  const pair={...preferred,first:ordered[0],second:ordered[1]};
  const isFirst=c.id===pair.first.id;
  const dating=dateLikePair(pair.first,pair.second,pair.relation,current);
  const purpose=dating?current.datePurpose:"";
  let scene=dating
    ?datePurposeScene(purpose,place,pair.first,pair.second,date)
    :concreteInteraction(place,pair.first,pair.second,pair.relation,date);
  if(!dating){
    const objectScene=placeObjectScene(place,pair.first,pair.second,pair.relation,date);
    if(objectScene&&!/때리|싸우|충돌|밀어|몸싸움/.test(`${scene.title} ${scene.first} ${scene.second}`))scene={...scene,...objectScene};
    const encounter=significantEncounter(pair,group,date);
    if(encounter){
      scene.first+=encounter;
      scene.second+=encounter;
    }
  }
  let title=dating?scene.title:(isFirst?scene.firstTitle:scene.secondTitle)||scene.title;
  const detail=isFirst?scene.first:scene.second;
  const dateGroup=dating?current.dateGroup:"";
  const actualPartnerId=c.id===pair.first.id?pair.second.id:pair.first.id;
  const actualPartner=state.characters[actualPartnerId];
  if(dating)title=`${togetherWith(actualPartner?.name||"상대")} 데이트 · ${String(title||purpose).replace(/^데이트\s*·\s*/,"")}`;
  const baseTitle=current.baseTitle||current.title,baseDesc=current.baseDesc||current.desc;
  const bothWalking=/공원.*걷|걷.*공원/.test(`${baseTitle} ${title}`);
  const combinedTitle=dating||bothWalking||title.includes("데이트")?title:[...new Set([baseTitle,title].filter(Boolean))].join(" · ");
  const combinedDesc=dating||place?.type==="공원"?detail:cleanRepeatedSceneText(`${baseDesc} ${detail}`);
  const participantCharacters=dating?[c,actualPartner].filter(Boolean):[c,...together];
  const groupRelation=pair.relation?.groupId
    ?relationList().find(relation=>relation.groupId===pair.relation.groupId&&Array.isArray(relation.displayOrder)&&relation.displayOrder.length>2)||pair.relation
    :pair.relation;
  const participantOrder=sharedContext?.participantOrder?.filter(id=>participantCharacters.some(character=>character.id===id))
    ||sharedParticipantOrder(participantCharacters,groupRelation);
  const interactionId=sharedContext?.interactionId||[
    "shared",
    dayKey(date),
    dateGroup||Math.floor(nowMin(date)/30),
    [...participantOrder].sort().join("~"),
    (isHomeScene?currentHomeId:current.placeId)||"scene",
    current.room||""
  ].join(":");
  return {...current,baseTitle,baseDesc,title:resolveEntityParticles(combinedTitle),desc:resolveEntityParticles(compactLogDescription(characterVoice(c,combinedDesc))),withId:actualPartnerId,withIds:participantOrder.filter(id=>id!==c.id),participantOrder,interactionId,groupInteraction:true,dateGroup:dateGroup||current.dateGroup,mood:dating?"데이트":current.mood,datePurpose:dating?purpose:current.datePurpose};
}
export function eventFor(c,date=new Date()){
  const current=adaptAccessibilityWording(c,sharedPlaceScene(c,baseEventFor(c,date),date));
  if(current?.groupInteraction){
    const sharedMinute=nowMin(date);
    current.minute=sharedMinute;
    commitLiveEntry(c,date,current);
    (current.withIds||[]).forEach(otherId=>{
      const other=state.characters[otherId];
      if(!other)return;
      // 상대의 날짜 저장소를 먼저 만든 다음 같은 사건 ID와 참여 순서로
      // 상대 관점의 문장만 다시 만든다. 화면을 여는 순서에 따라 만남이 갈라지지 않는다.
      timeline(other,date);
      const counterpart=adaptAccessibilityWording(other,sharedPlaceScene(other,baseEventFor(other,date),date,{
        interactionId:current.interactionId,
        participantOrder:current.participantOrder,
        forcedPartnerId:c.id,
        dateGroup:current.dateGroup,
        datePurpose:current.datePurpose
      }));
      if(!counterpart?.groupInteraction)return;
      counterpart.minute=sharedMinute;
      commitLiveEntry(other,date,counterpart);
    });
  }
  return current;
}
export function charactersAtPlace(id,townId=state.activeTownId){return state.order.map(x=>state.characters[x]).filter(c=>{const e=baseEventFor(c);return e.placeId===id&&e.townId===townId})}
export function homeGroups(){const out={};state.order.forEach(id=>{const c=state.characters[id];if(!c)return;(c.residences||[]).forEach(item=>{if(state.homes[item.homeId])(out[item.homeId]??=[]).push(c)})});return out}
