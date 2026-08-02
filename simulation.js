import {state,save} from "./state.js?v=20260802s";

const mins=t=>{const [h,m]=String(t||"00:00").split(":").map(Number);return h*60+m};
const clock=n=>`${String(Math.floor(n/60)%24).padStart(2,"0")}:${String(n%60).padStart(2,"0")}`;
const hash=s=>[...String(s)].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,2166136261);
const dayKey=(d=new Date())=>`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
const nowMin=(d=new Date())=>d.getHours()*60+d.getMinutes();
const jitter=(c,kind,d=new Date())=>(hash(`${c.id}:${dayKey(d)}:${kind}`)%21)-10;
const wakeAt=(c,d)=>Math.max(0,mins(c.wake)+jitter(c,"wake",d));
const sleepAt=(c,d)=>Math.max(0,mins(c.sleep)+jitter(c,"sleep",d));
const sleepingNow=(c,d)=>{
  const n=nowMin(d), wake=wakeAt(c,d), sleep=sleepAt(c,d);
  return sleep<=wake ? n>=sleep&&n<wake : n>=sleep||n<wake;
};
const placeBy=(test)=>state.world.places.find(test);
const placeFor=(types,seed)=>{const list=state.world.places.filter(p=>types.includes(p.type));return list.length?list[hash(seed)%list.length]:state.world.places[hash(seed)%Math.max(1,state.world.places.length)]};
const itemById=id=>Object.values(state.catalog||{}).flat().find(x=>x.id===id);
const relationList=()=>Object.values(state.relationships||{});
const related=c=>relationList().filter(r=>r.a===c.id||r.b===c.id).map(r=>({r,other:state.characters[r.a===c.id?r.b:r.a]})).filter(x=>x.other);
const relationPriority={부부:9,연인:8,짝사랑:6,절친:5,가족:4,친구:3,라이벌:2,혐관:1};
const preferredRelation=c=>related(c).sort((a,b)=>(relationPriority[b.r.type]||0)-(relationPriority[a.r.type]||0)||(b.r.intimacy||0)-(a.r.intimacy||0))[0];

function personalityFlavor(c,desc,seed=""){
  const variants=[];
  if((c.socialEnergy??3)<=1)variants.push("사람이 드문 조용한 자리를 골라 자기 속도대로 움직이고 있어요.");
  if((c.socialEnergy??3)>=5)variants.push("마주친 사람에게 먼저 반갑게 인사를 건네며 분위기를 자연스럽게 이끌고 있어요.");
  if((c.sensingIntuition??3)<=1)variants.push("눈앞에 보이는 것부터 하나씩 확인하며 실수 없이 마무리하고 있어요.");
  if((c.sensingIntuition??3)>=5)variants.push("중간에 떠오른 새로운 생각을 잊지 않으려고 짧게 메모해 두었어요.");
  if((c.thinkingFeeling??3)<=1)variants.push("가장 효율적인 순서를 머릿속으로 계산해 불필요한 동작을 줄이고 있어요.");
  if((c.thinkingFeeling??3)>=5)variants.push("지금 느끼는 감정을 무시하지 않고 스스로 편안한 속도를 찾고 있어요.");
  if((c.perceivingJudging??3)<=1)variants.push("정해 둔 순서 없이 지금 마음이 가는 것부터 가볍게 시작했어요.");
  if((c.perceivingJudging??3)>=5)variants.push("미리 생각해 둔 순서를 따라 하나씩 확인하며 진행하고 있어요.");
  return variants.length?`${desc} ${variants[hash(`${c.id}:${seed}`)%variants.length]}`:desc;
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

function entry(time,title,desc,extra={}){return {time:clock(time),minute:time,title,desc,...extra}}
function homeEntry(c,time,title="거실에서 쉬는 중",desc="거실 소파에 앉아 조용히 쉬고 있어요.",room="living"){return entry(time,title,desc,{home:true,room})}
const away=(extra={})=>({townId:state.activeTownId,...extra});

function morningScripts(c,date){
  const likes=[...(c.hobbies||[]),...(c.interests||[])],seed=`${c.id}:${dayKey(date)}:morning`;
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
  if(!choices.length)choices.push(
    ["집 근처를 산책하고 돌아오는 중","조용한 아침 공기를 쐬며 한 바퀴 걷고 현관에서 신발을 정리하고 있어요.","entry"],
    ["거실에서 오늘 일정을 살펴보는 중","소파에 앉아 해야 할 일의 순서를 머릿속으로 정리하고 있어요.","living"],
    ["서재에서 개인 시간을 보내는 중","책상 앞에 앉아 관심 있던 글과 자료를 천천히 살펴보고 있어요.","study"]
  );
  const firstIndex=hash(seed)%choices.length;
  const secondIndex=choices.length>1?(firstIndex+1+(hash(seed+":next")%(choices.length-1)))%choices.length:firstIndex;
  return [choices[firstIndex],choices[secondIndex]].map((script,index)=>[script[0],personalityFlavor(c,script[1],`morning:${index}`),script[2]]);
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
  return homeEntry(c,time,script[0],personalityFlavor(c,script[1],`shared:${kind}:${role}`),script[2]);
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
  return homeEntry(c,time,script[0],personalityFlavor(c,script[1],`roommate:${role}`),script[2]);
}

function workEvent(c,time,date){
  if(!c.workplaceId||c.job==="무직")return null;
  if(c.workplaceId==="home")return homeEntry(c,time,"자택근무 중",`${c.jobTitle||c.job} 업무를 집에서 처리하고 있어요.`);
  const p=state.world.places.find(x=>x.id===c.workplaceId)||placeFor(["사무실","회사","학교"],`${c.id}:work`);
  const scripts={
    "해적":["항해 준비 중","선원들과 항로와 보급품을 점검하고 있어요."],
    "군인":["훈련 중","부대 일정에 맞춰 훈련과 장비 점검을 하고 있어요."],
    "환경미화원":["거리 정돈 중","담당 구역을 돌며 깨끗하게 정리하고 있어요."],
    "여관주인":["손님맞이 중","객실을 확인하고 새 손님을 맞이하고 있어요."],
    "정치인":["공무 일정 중","회의 자료를 검토하고 공식 일정을 소화하고 있어요."],
    "학생":["수업 중","오늘 시간표에 맞춰 수업을 듣고 있어요."]
  };
  const text=scripts[c.job]||["직장에서 일하는 중",`${c.jobTitle||c.job}의 평범한 업무를 처리하고 있어요.`];
  return entry(time,text[0],text[1],away({placeId:p?.id,mood:"집중",stress:Math.min(100,25+(hash(`${c.id}:${dayKey(date)}:work`)%35))}));
}

function socialEvent(c,time,date){
  const pick=preferredRelation(c);
  const pair=pick?[c.id,pick.other.id].sort().join(":"):c.id;
  const p=placeFor(["카페","음식점","공원","영화관"],`${pair}:${dayKey(date)}:social-place`);
  if(!p)return null;
  const food=catalogChoice(c,p,"food",`${c.id}:${dayKey(date)}:food`);
  if(pick){
    const romantic=["연인","부부","짝사랑"].includes(pick.r.type);
    const action=food?`${pick.other.name}와 함께 ${food.name} 먹는 중`:`${pick.other.name}와 ${romantic?"데이트":"나들이"} 중`;
    const detail=romantic?`${pick.other.name}와 나란히 걸으며 서로의 하루를 묻고, ${p.name}에서 둘만의 시간을 보내고 있어요.`:`${pick.other.name}와 이야기를 주고받으며 ${p.name}을 함께 둘러보고 있어요.`;
    return entry(time,action,detail,away({placeId:p.id,itemId:food?.id,withId:pick.other.id,mood:"즐거움",stress:10}));
  }
  return entry(time,`${p.name} 방문`,food?`오늘은 ${food.name}을 골라 천천히 즐기고 있어요.`:"가벼운 외출을 즐기고 있어요.",away({placeId:p.id,itemId:food?.id,mood:"평온"}));
}

function relationshipHomeEntry(c,pick,time,date){
  const {r,other}=pick,pair=[c.id,other.id].sort(),role=pair.indexOf(c.id);
  const conflict=+(r.conflict||0),intimacy=+(r.intimacy||0);
  let scripts;
  if(conflict>=65)scripts=[
    [`${other.name}와 말다툼하는 중`,"쌓아 둔 서운함을 꺼내다 목소리가 높아졌지만 피하지 않고 자기 마음을 끝까지 설명하고 있어요.","living"],
    [`${other.name}와 말다툼하는 중`,"바로 반박했다가 잠시 숨을 고르고, 무엇이 속상했는지 상대에게 차근차근 되묻고 있어요.","living"]
  ];
  else if(conflict>=35)scripts=[
    [`${other.name}에게 잔소리하는 중`,"미뤄 둔 일을 가리키며 걱정돼서 하는 말이라고 덧붙이고, 결국 옆에 앉아 함께 정리해 주고 있어요.","living"],
    [`${other.name}의 잔소리를 듣는 중`,"처음에는 못 들은 척하다가 상대가 챙겨 둔 것을 보고 작게 알겠다고 답하며 몸을 일으켰어요.","living"]
  ];
  else if(intimacy>=80)scripts=[
    [`${other.name}를 격려하는 중`,"지친 기색을 알아보고 따뜻한 음료를 건넨 뒤 오늘 잘해 낸 일을 하나씩 짚어 주며 다독이고 있어요.","kitchen"],
    [`${other.name}에게 위로받는 중`,"말없이 곁을 내어 준 상대에게 오늘 힘들었던 일을 털어놓고, 건네받은 잔을 두 손으로 감싸고 있어요.","kitchen"]
  ];
  else return sharedHomeEntry(c,other,time,date);
  const script=scripts[role];
  return homeEntry(c,time,script[0],personalityFlavor(c,script[1],`relation:${r.id}:${role}`),script[2]);
}

function build(c,date=new Date()){
  const wake=wakeAt(c,date), sleep=sleepAt(c,date);
  const sleepMinute=sleep<=wake?sleep+1440:sleep;
  const list=[entry(wake,"기상","집에서 하루를 시작했어요.",{home:true,room:c.sleepRoomId||"bedroom",mood:"평온",stress:5})];
  list.push(homeEntry(c,wake+20,"욕실에서 씻는 중","세면대 앞에서 세수하고 이를 닦으며 잠을 깨고 있어요.","bath"));
  list.push(homeEntry(c,wake+45,"주방에서 아침 준비 중","냉장고를 열어 먹을 것을 고르고 식탁에 아침을 차리고 있어요.","kitchen"));
  const work=workEvent(c,Math.max(wake+90,540),date);
  const morning=morningScripts(c,date),commuteMinute=work&&c.workplaceId!=="home"?work.minute-35:Infinity;
  [wake+90,wake+240].forEach((minute,index)=>{
    if(minute<720&&minute<commuteMinute-10){
      const script=morning[index];
      list.push(homeEntry(c,minute,script[0],script[1],script[2]));
    }
  });
  if(work){
    if(c.workplaceId!=="home"){
      const driving=(hash(`${c.id}:${dayKey(date)}:commute`)%2)===0;
      list.push(entry(work.minute-35,driving?"출근길에 운전 중":"대중교통으로 출근 중",driving?"차를 운전해 직장으로 이동하고 있어요.":"정류장에서 버스나 지하철을 타고 직장으로 이동하고 있어요.",away({transit:true,mood:"이동"})));
    }
    list.push(work);
  }
  const lunchPlace=placeFor(["음식점","카페"],`${c.id}:${dayKey(date)}:lunch`);
  if(lunchPlace){
    const food=catalogChoice(c,lunchPlace,"food",`${c.id}:${dayKey(date)}:lunch-food`);
    list.push(entry(750,`${lunchPlace.name}에서 점심`,food?`${food.name}을 골라 식사하고 있어요.`:"점심을 먹으며 잠깐 쉬고 있어요.",away({placeId:lunchPlace.id,itemId:food?.id,mood:"보통"})));
  }
  const social=socialEvent(c,1120,date); if(social)list.push(social);
  let stress=Math.max(...list.map(x=>x.stress||0));
  const housemate=state.order.map(id=>state.characters[id]).find(other=>other&&other.id!==c.id&&other.homeId===c.homeId);
  const homeRelation=related(c).filter(x=>x.other.homeId===c.homeId).sort((a,b)=>(relationPriority[b.r.type]||0)-(relationPriority[a.r.type]||0))[0];
  const otherSleep=housemate?(()=>{const value=sleepAt(housemate,date);return value<=wakeAt(housemate,date)?value+1440:value})():Infinity;
  const eveningMinute=Math.max(1020,Math.min(1260,sleepMinute-45,otherSleep-45));
  if(homeRelation){
    list.push(relationshipHomeEntry(c,homeRelation,eveningMinute,date));
  }else if(housemate){
    list.push(roommateHomeEntry(c,housemate,eveningMinute,date));
  }else{
    const homeScripts=[
      ["거실 소파에서 영상 보는 중","TV 앞 소파에 기대어 좋아하는 영상을 이어 보고 있어요.","living"],
      ["서재에서 취미를 즐기는 중","책상 위에 좋아하는 물건을 펼쳐 놓고 취미에 집중하고 있어요.","study"],
      ["주방에서 간식 만드는 중","주방 조리대에서 간단한 간식과 마실 것을 준비하고 있어요.","kitchen"],
      ["침실에서 음악 듣는 중","침대에 기대어 이어폰으로 좋아하는 음악을 듣고 있어요.","bedroom"]
    ];
    const script=homeScripts[hash(`${c.id}:${dayKey(date)}:home-evening`)%homeScripts.length];
    list.push(homeEntry(c,eveningMinute,script[0],personalityFlavor(c,script[1],"evening"),script[2]));
  }
  list.push(entry(sleepMinute,"자는 중",`설정한 취침 시각에서 ${Math.abs(jitter(c,"sleep",date))}분 정도 차이로 잠들었어요.`,{home:true,room:c.sleepRoomId||"bedroom",mood:"수면",stress:0}));
  return list.sort((a,b)=>a.minute-b.minute);
}

function signature(c){return JSON.stringify({townId:state.activeTownId,homeId:c.homeId,wake:c.wake,sleep:c.sleep,job:c.job,jobTitle:c.jobTitle,workplaceId:c.workplaceId,hobbies:c.hobbies,interests:c.interests,inventory:c.inventory,foodPreferences:c.foodPreferences,drinkTypes:c.drinkTypes,musicGenres:c.musicGenres,spiceTolerance:c.spiceTolerance,sweetPreference:c.sweetPreference,socialEnergy:c.socialEnergy,sensingIntuition:c.sensingIntuition,thinkingFeeling:c.thinkingFeeling,perceivingJudging:c.perceivingJudging,housemates:state.order.map(id=>state.characters[id]).filter(x=>x?.homeId===c.homeId).map(x=>[x.id,x.wake,x.sleep]),rels:relationList().filter(r=>r.a===c.id||r.b===c.id),places:state.world.places.map(p=>[p.id,p.type,p.stock,p.priceRange,p.spicy,p.sweet])})}

export function timeline(c,date=new Date()){
  const key=dayKey(date), sig=signature(c);
  c.days??={};
  const old=c.days[key];
  if(!old||old.signature!==sig){
    c.days[key]={signature:sig,entries:build(c,date)};
    save();
  }
  return c.days[key].entries;
}
export function visibleTimeline(c,date=new Date()){return timeline(c,date).filter(x=>x.minute<=nowMin(date))}
function liveGapEvent(c,last,n,date){
  const minute=n-(n%15);
  if(last?.placeId){
    const place=state.world.places.find(p=>p.id===last.placeId);
    const continuations={
      카페:["카페에서 여유를 보내는 중","자리와 음료를 정리하며 다음에 할 일을 천천히 생각하고 있어요."],
      음식점:["식사를 마무리하는 중","남은 음식을 천천히 먹고 식탁을 정돈하며 잠시 쉬고 있어요."],
      사무실:["업무를 이어가는 중","처리한 내용을 확인하고 다음 업무에 필요한 자료를 차분히 정리하고 있어요."],
      학교:["수업과 과제를 이어가는 중","배운 내용을 노트에 정리하고 다음 일정에 필요한 준비물을 확인하고 있어요."],
      공원:["공원에서 걷는 중","사람이 덜 붐비는 길을 따라 천천히 걸으며 주변 풍경을 살펴보고 있어요."]
    };
    const text=continuations[place?.type]||[`${place?.name||"외출 장소"}에서 시간을 보내는 중`,"지금 하고 있는 일을 마무리하며 다음 일정을 준비하고 있어요."];
    return entry(minute,text[0],personalityFlavor(c,text[1],"live-away"),{townId:last.townId||state.activeTownId,placeId:last.placeId,mood:last.mood||"보통"});
  }
  const scripts=[
    ["거실에서 잠깐 쉬는 중","마실 것을 곁에 두고 소파에 앉아 다음 일정 전까지 숨을 돌리고 있어요.","living"],
    ["서재에서 개인적인 일을 하는 중","책상에 앉아 관심 있는 자료를 살펴보거나 미뤄 둔 작은 일을 처리하고 있어요.","study"],
    ["주방에서 간단한 간식을 챙기는 중","배가 고프지 않을 정도로 간단한 먹을 것과 마실 것을 준비하고 있어요.","kitchen"],
    ["집 안을 정돈하는 중","눈에 띄는 물건 몇 개를 제자리로 옮기고 주변을 가볍게 정리하고 있어요.","living"]
  ];
  const script=scripts[hash(`${c.id}:${dayKey(date)}:${Math.floor(n/90)}:live`)%scripts.length];
  return homeEntry(c,minute,script[0],personalityFlavor(c,script[1],"live-home"),script[2]);
}
export function eventFor(c,date=new Date()){
  const n=nowMin(date);
  if(sleepingNow(c,date))return entry(n,"자는 중","설정한 수면 시간에 맞춰 집에서 자고 있어요.",{home:true,room:c.sleepRoomId||"bedroom",mood:"수면",stress:0});
  const list=timeline(c,date), past=list.filter(x=>x.minute<=n);
  const last=past.at(-1);
  if(last&&n-last.minute>75)return liveGapEvent(c,last,n,date);
  return last||entry(n,"집에서 아침 준비 중","오늘 일정을 시작할 준비를 하고 있어요.",{home:true,room:"bath",mood:"평온",stress:5});
}
export function charactersAtPlace(id){return state.order.map(x=>state.characters[x]).filter(c=>eventFor(c).placeId===id)}
export function homeGroups(){const out={};state.order.forEach(id=>{const c=state.characters[id];if(c)(out[c.homeId||id]??=[]).push(c)});return out}
