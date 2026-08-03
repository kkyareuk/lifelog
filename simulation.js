import {state,save} from "./state.js?v=20260803aw";

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
const townFor=c=>state.towns.find(t=>t.id===c.townId)||state.towns[0]||state.world;
const workplaceTown=c=>state.towns.find(t=>t.places?.some(p=>p.id===c.workplaceId));
const activityTown=(c,date=new Date())=>{
  const workTown=workplaceTown(c);
  if(workTown&&c.job!=="무직")return workTown;
  const home=townFor(c),others=state.towns.filter(t=>t.id!==home.id);
  if(!others.length)return home;
  const weekend=[0,6].includes(date.getDay()),restDay=weekend&&hash(`${c.id}:${dayKey(date)}:rest`)%4!==0;
  if(restDay||hash(`${c.id}:${dayKey(date)}:town-trip`)%3!==0)return home;
  const romantic=preferredRelation(c),pair=romantic&&["부부","연인"].includes(romantic.r.type)?[c.id,romantic.other.id].sort().join(":"):c.id;
  return others[hash(`${pair}:${dayKey(date)}:destination`)%others.length];
};
const placeFor=(types,seed,c,date=new Date())=>{const places=activityTown(c,date)?.places||[],list=places.filter(p=>types.includes(p.type));return list.length?list[hash(seed)%list.length]:places[hash(seed)%Math.max(1,places.length)]};
const itemById=id=>Object.values(state.catalog||{}).flat().find(x=>x.id===id);
const relationList=()=>Object.values(state.relationships||{});
const related=c=>relationList().filter(r=>r.a===c.id||r.b===c.id).map(r=>({r,other:state.characters[r.a===c.id?r.b:r.a]})).filter(x=>x.other);
const relationPriority={"부모·자녀":10,부부:9,연인:8,짝사랑:6,소꿉친구:6,친구:5,"학창 시절 친구들":5,"젊은 날의 친구들":5,"친구 모임":4,산악회:4,가족:4,"동아리 동료":3,"직장 동료":3,라이벌:2,혐관:1,기타:1};
const preferredRelation=c=>related(c).sort((a,b)=>(relationPriority[b.r.type]||0)-(relationPriority[a.r.type]||0)||(b.r.intimacy||0)-(a.r.intimacy||0))[0];

function personalityFlavor(c,desc,seed=""){
  const variants=[];
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
  if(c.decisionStyle==="공감 우선")variants.push("상대가 어떻게 느낄지 먼저 살핀 뒤 부드럽게 말을 골랐어요.");
  if(c.decisionStyle==="논리 우선")variants.push("가장 합리적인 방법이 무엇인지 따져 보고 군더더기 없이 움직였어요.");
  if((c.socialEnergy??3)<=1)variants.push("사람이 드문 조용한 자리를 골라 자기 속도대로 움직이고 있어요.");
  if((c.socialEnergy??3)>=5)variants.push("마주친 사람에게 먼저 반갑게 인사를 건네며 분위기를 자연스럽게 이끌고 있어요.");
  if(c.socialStyle==="혼자가 편함")variants.push("필요한 말만 짧게 나눈 뒤 다시 혼자 집중할 수 있는 자리로 돌아갔어요.","누군가 곁에 있어도 각자 할 일을 하는 조용한 방식을 더 편안해했어요.");
  if(c.socialStyle==="낯을 가림")variants.push("먼저 말을 꺼내지는 못하고 상대가 건넨 질문에 조금씩 긴 대답을 보탰어요.","익숙하지 않은 사람 앞에서는 표정을 살피며 안전한 이야기부터 조심스럽게 골랐어요.");
  if(c.socialStyle==="먼저 다가감"||c.socialStyle==="무리의 중심")variants.push("어색한 침묵이 생기기 전에 먼저 화제를 꺼내 모두가 끼어들 자리를 만들었어요.","사람마다 반응을 살피며 대화가 한쪽으로 치우치지 않게 자연스럽게 연결했어요.");
  if((c.sensingIntuition??3)<=1)variants.push("눈앞에 보이는 것부터 하나씩 확인하며 실수 없이 마무리하고 있어요.");
  if((c.sensingIntuition??3)>=5)variants.push("중간에 떠오른 새로운 생각을 잊지 않으려고 짧게 메모해 두었어요.");
  if(c.perceptionStyle==="현실과 경험 중시"||c.perceptionStyle==="구체적인 편")variants.push("전에 직접 해 봤을 때 잘됐던 방법을 떠올려 같은 순서로 손을 움직였어요.","막연한 추측보다 지금 확인할 수 있는 상태와 수치를 먼저 살폈어요.");
  if(c.perceptionStyle==="가능성 중시"||c.perceptionStyle==="직관과 상상 중시")variants.push("하던 일에서 예상하지 못한 연결을 떠올리고 다른 방식도 시험해 보고 싶어졌어요.","눈앞의 결과보다 앞으로 어떻게 달라질 수 있을지 상상하며 선택지를 넓혔어요.");
  if((c.thinkingFeeling??3)<=1)variants.push("가장 효율적인 순서를 머릿속으로 계산해 불필요한 동작을 줄이고 있어요.");
  if((c.thinkingFeeling??3)>=5)variants.push("지금 느끼는 감정을 무시하지 않고 스스로 편안한 속도를 찾고 있어요.");
  if(c.decisionStyle==="논리 우선"||c.decisionStyle==="이성적인 편")variants.push("누가 말했는지보다 근거가 맞는지부터 따져 가장 모순이 적은 쪽을 골랐어요.","감정적인 반응은 잠시 미뤄 두고 해결에 필요한 조건을 항목별로 나눴어요.");
  if(c.decisionStyle==="마음을 살핌"||c.decisionStyle==="공감 우선")variants.push("정답을 서둘러 말하기보다 상대가 왜 그렇게 느꼈는지 먼저 물었어요.","결과가 조금 비효율적이어도 누구도 소외되지 않는 쪽으로 말을 골랐어요.");
  if((c.perceivingJudging??3)<=1)variants.push("정해 둔 순서 없이 지금 마음이 가는 것부터 가볍게 시작했어요.");
  if((c.perceivingJudging??3)>=5)variants.push("미리 생각해 둔 순서를 따라 하나씩 확인하며 진행하고 있어요.");
  if(c.planningStyle==="유연한 편"||c.planningStyle==="상황에 따라")variants.push("큰 순서만 정해 두고 세부 방법은 그때그때 상황에 맞춰 바꿨어요.","계획을 고집하지 않으면서도 꼭 끝내야 할 핵심은 놓치지 않았어요.");
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
const away=(c,extra={},date=new Date())=>({townId:activityTown(c,date)?.id||c.townId||state.towns[0]?.id,...extra});

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
  const p=(townFor(c)?.places||[]).find(x=>x.id===c.workplaceId)||placeFor(["사무실","회사","학교"],`${c.id}:work`,c);
  const scripts={
    "해적":["항해 준비 중","선원들과 항로와 보급품을 점검하고 있어요."],
    "군인":["훈련 중","부대 일정에 맞춰 훈련과 장비 점검을 하고 있어요."],
    "환경미화원":["거리 정돈 중","담당 구역을 돌며 깨끗하게 정리하고 있어요."],
    "여관주인":["손님맞이 중","객실을 확인하고 새 손님을 맞이하고 있어요."],
    "정치인":["공무 일정 중","회의 자료를 검토하고 공식 일정을 소화하고 있어요."],
    "학생":["수업 중","오늘 시간표에 맞춰 수업을 듣고 있어요."]
  };
  const text=scripts[c.job]||["직장에서 일하는 중",`${c.jobTitle||c.job}의 평범한 업무를 처리하고 있어요.`];
  return entry(time,text[0],text[1],away(c,{placeId:p?.id,mood:"집중",stress:Math.min(100,25+(hash(`${c.id}:${dayKey(date)}:work`)%35))}));
}

function socialEvent(c,time,date){
  const pick=preferredRelation(c);
  const pair=pick?[c.id,pick.other.id].sort().join(":"):c.id;
  const p=placeFor(["카페","음식점","공원","영화관"],`${pair}:${dayKey(date)}:social-place`,c);
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
      "젊은 날의 친구들":`${pick.other.name}와 젊은 날 함께 보낸 시간을 떠올리며 지금의 생활을 나란히 이야기하고 있어요.`,
      산악회:`${pick.other.name}와 다음에 걸을 길과 준비물을 이야기하며 서로의 체력을 살피고 있어요.`,
      "직장 동료":`${pick.other.name}와 업무 밖의 이야기를 나누다가도 자연스럽게 오늘 있었던 일을 함께 정리하고 있어요.`,
      라이벌:`${pick.other.name}와 최근 결과를 은근히 비교하면서도 상대가 잘한 부분은 놓치지 않고 살피고 있어요.`,
      혐관:`${pick.other.name}와 사소한 선택에서도 신경전을 벌이지만 먼저 자리를 뜨지는 않고 있어요.`
    };
    if(crush&&pick.r.targetId===c.id)relationDetails.짝사랑=`${pick.other.name}의 시선이 평소보다 오래 머무는 것을 어렴풋이 느끼면서도 아직 그 마음을 확신하지 못하고 있어요.`;
    const detail=p.type==="공연장"?`${pick.other.name}와 공연을 관람하며 인상적인 장면에 대한 감상을 나누고 있어요.`:romantic?`${pick.other.name}와 나란히 시간을 보내며 서로의 하루를 묻고 있어요.`:relationDetails[pick.r.type]||`${pick.other.name}와 이야기를 주고받으며 ${p.name}을 함께 둘러보고 있어요.`;
    return entry(time,action,detail,away(c,{placeId:p.id,itemId:food?.id||drink?.id,withId:pick.other.id,mood:"즐거움",stress:10}));
  }
  return entry(time,`${p.name} 방문`,food?`오늘은 ${food.name}을 골라 식사하고 있어요.`:drink?`${drink.name}을 마시며 잠깐 쉬고 있어요.`:p.type==="공연장"?"공연을 관람하며 무대에 집중하고 있어요.":"가벼운 외출을 즐기고 있어요.",away(c,{placeId:p.id,itemId:food?.id||drink?.id,mood:"평온"}));
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
      [[`${n}에게 보낼 말을 고민하는 중`,"메시지를 썼다가 너무 다정해 보일까 지우고 자연스러운 문장으로 다시 고치고 있어요.","study"],[`${n}의 메시지를 확인하는 중`,"평범한 내용인데도 몇 번 다시 읽은 뒤 너무 늦지 않게 답장을 보내고 있어요.","living"]]
    ],
    친구:[
      [[`${n}와 장난을 주고받는 중`,"상대만 알아들을 오래된 농담을 꺼내고 웃음을 참는 표정을 보며 한마디를 더 얹고 있어요.","living"],[`${n}의 장난에 받아치는 중`,"질 수 없다는 듯 예전 실수를 꺼내 맞받아치고 결국 둘 다 웃음을 터뜨리고 있어요.","living"]],
      [[`${n}에게 속마음을 털어놓는 중`,"다른 사람에게는 말하지 못한 걱정을 꺼내며 해결책보다 자기 편이 되어 달라고 말하고 있어요.","living"],[`${n}의 속마음을 듣는 중`,"중간에 판단하지 않고 끝까지 들은 뒤 상대가 잘못한 게 아니라며 단단하게 편들어 주고 있어요.","living"]]
    ],
    "직장 동료":[
      [[`${n}와 업무를 인계하는 중`,"진행 상황과 주의할 부분을 짧고 정확하게 정리해 상대가 바로 이어서 할 수 있게 설명하고 있어요.","study"],[`${n}에게 업무를 인계받는 중`,"중요한 부분을 메모하고 애매한 조건을 다시 물어 실수가 없도록 확인하고 있어요.","study"]],
      [[`${n}와 퇴근 후 하소연하는 중`,"오늘 있었던 답답한 일을 조심스럽게 꺼내며 상대가 공감하는 대목에서 목소리를 낮추고 있어요.","kitchen"],[`${n}의 직장 이야기를 듣는 중`,"고개를 끄덕이며 상황을 정리해 주고 내일 덜 힘들 방법을 현실적으로 제안하고 있어요.","kitchen"]]
    ],
    "젊은 날의 친구들":[
      [[`${n}와 옛날 이야기를 하는 중`,"같이 들었던 수업과 황당했던 과제를 떠올리며 당시에는 말하지 못한 뒷이야기를 꺼내고 있어요.","living"],[`${n}와 옛날 이야기를 하는 중`,"잊고 있던 장면을 상대의 말로 떠올리고 기억이 다른 부분을 웃으며 바로잡고 있어요.","living"]],
      [[`${n}와 자료를 나누는 중`,"상대가 찾던 자료를 폴더별로 정리해 보내고 도움이 될 만한 메모를 덧붙이고 있어요.","study"],[`${n}가 보낸 자료를 확인하는 중`,"필요한 부분에 표시를 남기고 자기 자료도 정리해 답례로 보내고 있어요.","study"]]
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
    가족:[
      [[`${n}의 식사를 챙기는 중`,"끼니를 거르지 않았는지 확인하고 부담 없이 먹을 수 있는 양을 따로 덜어 두고 있어요.","kitchen"],[`${n}가 챙긴 식사를 받는 중`,"잔소리처럼 들리면서도 걱정인 걸 알아 작게 대답하고 자리에 앉아 한입 먹고 있어요.","kitchen"]],
      [[`${n}와 생활 습관을 두고 실랑이 중`,"또 미뤄 둔 일을 가리키며 이번에는 꼭 끝내라고 말하지만 손은 이미 정리를 돕고 있어요.","living"],[`${n}의 잔소리에 대답하는 중`,"알겠다고 몇 번 답하다가 결국 함께 빨리 끝내는 편이 낫겠다며 몸을 일으키고 있어요.","living"]]
    ],
    라이벌:[
      [[`${n}와 결과를 비교하는 중`,"상대가 잘한 부분은 인정하면서도 다음에는 자기가 앞설 거라며 세부 기록을 다시 확인하고 있어요.","study"],[`${n}의 도전을 받아치는 중`,"여유로운 척 웃으며 자기 방식의 장점을 설명하고 다음 승부 조건을 먼저 제안하고 있어요.","study"]]
    ],
    혐관:[
      [[`${n}와 날 선 대화를 나누는 중`,"상대의 말에서 모순을 짚어 내며 물러서지 않지만 넘지 말아야 할 선은 간신히 지키고 있어요.","living"],[`${n}의 지적에 반박하는 중`,"바로 표정을 굳히고 근거부터 다시 대라며 차갑게 맞받아치고 있어요.","living"]]
    ]
  };
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
  const enabled=(r.interactions||[]).filter(x=>behaviorPools[x]);
  if(enabled.length){
    const behavior=enabled[hash(`${r.id}:${dayKey(date)}:behavior`)%enabled.length],script=behaviorPools[behavior][role];
    return homeEntry(c,time,script[0],personalityFlavor(c,script[1],`behavior:${behavior}:${role}`),script[2]);
  }
  const pool=pools[r.type]||[[[`${n}와 근황을 나누는 중`,"최근 관심 있는 일과 달라진 생활을 이야기하며 상대의 반응을 살피고 있어요.","living"],[`${n}의 근황을 듣는 중`,"궁금한 부분을 자연스럽게 되묻고 자기 이야기도 하나씩 꺼내고 있어요.","living"]]];
  const scenario=pool[hash(`${[c.id,other.id].sort().join(":")}:${r.type}:${dayKey(date)}:relation-scene`)%pool.length],script=scenario[role];
  const tone=c.socialStyle==="낯을 가림"?" 말은 짧지만 자리를 피하지 않고 곁에 머물러 있어요.":c.decisionStyle==="공감 우선"?" 상대의 표정과 말투가 달라질 때마다 속도를 맞추고 있어요.":c.interference==="강하게 간섭함"?" 자기 방식이 더 낫다고 확신해 상대의 선택에도 적극적으로 관여하고 있어요.":"";
  return homeEntry(c,time,script[0],personalityFlavor(c,script[1]+tone,`specific:${r.type}:${role}`),script[2]);
}

function relationshipHomeEntry(c,pick,time,date){
  const {r,other}=pick,pair=[c.id,other.id].sort(),role=r.type==="짝사랑"&&r.directional?(c.id===r.admirerId?0:1):pair.indexOf(c.id);
  const interferenceBoost={방관자:-22,"요청할 때만 도움":-5,"적당히 관여":0,"챙기고 확인함":8,"강하게 간섭함":20,컨트롤프릭:34}[c.interference]||0;
  const conflict=Math.max(0,+(r.conflict||0)+interferenceBoost),intimacy=+(r.intimacy||0);
  let scripts;
  if(conflict>=65)scripts=[
    [`${other.name}와 말다툼하는 중`,"쌓아 둔 서운함을 꺼내다 목소리가 높아졌지만 피하지 않고 자기 마음을 끝까지 설명하고 있어요.","living"],
    [`${other.name}와 말다툼하는 중`,"바로 반박했다가 잠시 숨을 고르고, 무엇이 속상했는지 상대에게 차근차근 되묻고 있어요.","living"]
  ];
  else if(conflict>=35)scripts=[
    [`${other.name}에게 잔소리하는 중`,"미뤄 둔 일을 가리키며 걱정돼서 하는 말이라고 덧붙이고, 결국 옆에 앉아 함께 정리해 주고 있어요.","living"],
    [`${other.name}의 잔소리를 듣는 중`,"처음에는 못 들은 척하다가 상대가 챙겨 둔 것을 보고 작게 알겠다고 답하며 몸을 일으켰어요.","living"]
  ];
  else if(intimacy>=40)return relationSpecificEntry(c,other,r,time,date,role);
  else if(c.interference==="강하게 간섭함"||c.interference==="컨트롤프릭")scripts=[
    [`${other.name}의 귀가 시간을 따지는 중`,"늦어진 이유를 분명히 말해 달라고 요구하고 다음부터는 미리 연락하라며 단호하게 이야기하고 있어요.","living"],
    [`${other.name}에게 행동을 바로잡으라고 말하는 중`,"미뤄 둔 일을 직접 가리키며 지금 끝내야 한다고 강하게 재촉하고 있어요.","living"]
  ];
  else if(c.interference==="챙기고 확인함")scripts=[
    [`${other.name}를 데려다줄 준비 중`,"늦은 시간 혼자 움직이지 않도록 목적지와 돌아올 시간을 확인하고 외투와 차 키를 챙기고 있어요.","entry"],
    [`${other.name}의 준비물을 확인하는 중`,"빠뜨린 것이 없는지 옆에서 하나씩 확인하고 필요한 물건을 가방에 넣어 주고 있어요.","entry"]
  ];
  else return sharedHomeEntry(c,other,time,date);
  const script=scripts[role];
  return homeEntry(c,time,script[0],personalityFlavor(c,script[1],`relation:${r.id}:${role}`),script[2]);
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
    가족:[
      [`${n}의 아침을 챙기는 중`,"끼니를 거르지 말라고 말하면서 들고 나갈 수 있는 간단한 먹을 것을 손에 쥐여 주고 있어요.","kitchen"],
      [`${n}와 아침부터 실랑이하는 중`,"늦지 않게 준비하라고 재촉하면서도 필요한 물건은 이미 찾아 현관에 놓아 두었어요.","entry"]
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
  return homeEntry(c,time,script[0],personalityFlavor(c,script[1]+stageTone,`morning-relation:${r.type}`),script[2]);
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
function build(c,date=new Date()){
  const wake=wakeAt(c,date), sleep=sleepAt(c,date);
  const sleepMinute=sleep<=wake?sleep+1440:sleep;
  const list=[entry(wake,"기상","집에서 하루를 시작했어요.",{home:true,room:c.sleepRoomId||"bedroom",mood:"평온",stress:5})];
  list.push(homeEntry(c,wake+20,"욕실에서 씻는 중","세면대 앞에서 세수하고 이를 닦으며 잠을 깨고 있어요.","bath"));
  list.push(homeEntry(c,wake+45,"주방에서 아침 준비 중","냉장고를 열어 먹을 것을 고르고 식탁에 아침을 차리고 있어요.","kitchen"));
  const morningRelation=related(c).filter(x=>x.other.homeId===c.homeId).sort((a,b)=>(relationPriority[b.r.type]||0)-(relationPriority[a.r.type]||0))[0];
  const morningTogether=morningRelation&&relationshipMorningEntry(c,morningRelation,wake+58,date);
  if(morningTogether)list.push(morningTogether);
  const work=workEvent(c,Math.max(wake+90,540),date);
  const destination=activityTown(c,date),homeTown=townFor(c);
  const homeCars=state.homes[c.homeId]?.cars||[];
  const relation=preferredRelation(c),romantic=relation&&["부부","연인"].includes(relation.r.type)?relation.other:null;
  const partnerCars=romantic?state.homes[romantic.homeId]?.cars||[]:[];
  const partnerCanDrive=romantic?.driverLicense&&partnerCars.length&&activityTown(romantic,date)?.id===destination.id;
  const selfCanDrive=c.driverLicense&&homeCars.length;
  if(destination.id!==homeTown.id){
    const travelMinute=Math.max(wake+75,(work?.minute||720)-45);
    const mode=partnerCanDrive?"partner":selfCanDrive?"car":"transit";
    const title=mode==="partner"?`${romantic.name}의 차를 타고 ${destination.name}으로 이동 중`:mode==="car"?`차를 운전해 ${destination.name}으로 이동 중`:`대중교통으로 ${destination.name} 이동 중`;
    const desc=mode==="partner"?`${romantic.name}가 운전하는 차에 함께 타고 목적지로 향하고 있어요.`:mode==="car"?"집의 자동차를 직접 운전해 다른 마을로 이동하고 있어요. 음주한 날에는 운전하지 않아요.":"버스나 지하철 노선을 확인하고 다른 마을로 이동하고 있어요.";
    list.push(entry(travelMinute,title,desc,{townId:destination.id,transit:true,withId:mode==="partner"?romantic.id:undefined,mood:"이동"}));
  }
  const morning=morningScripts(c,date),commuteMinute=work&&c.workplaceId!=="home"?work.minute-35:Infinity;
  [wake+90,wake+240].forEach((minute,index)=>{
    if(minute<720&&minute<commuteMinute-10){
      const script=morning[index];
      list.push(homeEntry(c,minute,script[0],script[1],script[2]));
    }
  });
  if(work){
    if(c.workplaceId!=="home"){
      const driving=selfCanDrive&&(hash(`${c.id}:${dayKey(date)}:commute`)%2)===0;
      list.push(entry(work.minute-35,driving?"차로 출근하는 중":"대중교통으로 출근하는 중",driving?"차를 운전해 직장에 도착할 준비를 하고 있어요.":"버스나 지하철을 이용해 직장에 도착할 준비를 하고 있어요.",away(c,{placeId:work.placeId,mood:"출근"})));
    }
    list.push(work);
  }
  const lunchPlace=placeFor(["음식점"],`${c.id}:${dayKey(date)}:lunch`,c);
  if(lunchPlace?.type==="음식점"){
    const food=catalogChoice(c,lunchPlace,"food",`${c.id}:${dayKey(date)}:lunch-food`);
    list.push(entry(750,`${lunchPlace.name}에서 점심`,food?`${food.name}을 골라 식사하고 있어요.`:"점심을 먹으며 잠깐 쉬고 있어요.",away(c,{placeId:lunchPlace.id,itemId:food?.id,mood:"보통"})));
  }
  const social=socialEvent(c,1120,date); if(social)list.push(social);
  if(social?.withId){
    const romanticRelation=relationList().find(r=>((r.a===c.id&&r.b===social.withId)||(r.b===c.id&&r.a===social.withId))&&["연인","부부"].includes(r.type));
    if(romanticRelation){
      const partner=state.characters[social.withId],dateGroup=`date-${[c.id,social.withId].sort().join("-")}-${dayKey(date)}`;
      social.title=`데이트 · ${social.title.replace(`${partner?.name}와 `,"")}`;
      social.dateGroup=dateGroup;social.mood="데이트";
      list.push(entry(social.minute-25,"데이트 · 만나서 일정 시작",`${partner?.name}와 약속 장소에서 만나 오늘 함께할 일을 이야기하고 있어요.`,{townId:social.townId,placeId:social.placeId,withId:social.withId,mood:"데이트",dateGroup}));
      list.push(entry(social.minute+65,"데이트 · 함께 둘러보는 중",`${partner?.name}와 나란히 주변을 걷고 마음에 드는 곳에 잠시 멈춰 이야기를 나누고 있어요.`,{townId:social.townId,placeId:social.placeId,withId:social.withId,mood:"데이트",dateGroup}));
    }
  }
  if(destination.id!==homeTown.id){
    const returnMinute=Math.min(sleepMinute-75,1200);
    list.push(entry(returnMinute,`${homeTown.name}으로 돌아가는 중`,"오늘의 바깥 일정을 마치고 대중교통이나 안전하게 운전할 수 있는 동행의 차로 집이 있는 마을로 돌아가고 있어요.",{townId:homeTown.id,transit:true,mood:"이동"}));
  }
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
    const homeScripts=[...HOME_ACTIVITY_POOL,
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
    list.push(homeEntry(c,eveningMinute,script[0],personalityFlavor(c,script[1],"evening"),script[2]));
  }
  const scheduled=(state.routines?.[c.id]||[]).filter(item=>Number(item.day)===date.getDay());
  scheduled.forEach(item=>{
    const minute=mins(item.start),place=state.towns.flatMap(t=>(t.places||[]).map(p=>({...p,townId:t.id}))).find(p=>p.id===item.placeId);
    const companions=(item.withIds||[]).map(id=>state.characters[id]).filter(Boolean);
    const companionText=companions.length?`${companions.map(x=>x.name).join(", ")}와 함께 `:"";
    const desc=item.notes||`${companionText}${item.type} 일정을 진행하고 있어요. 종료 예정 시각은 ${item.end}예요.`;
    if(place)list.push(entry(minute,item.title,desc,{townId:place.townId,placeId:place.id,withId:companions[0]?.id,mood:item.type==="데이트"?"즐거움":"일정"}));
    else list.push(homeEntry(c,minute,item.title,desc,item.type==="휴식"?"living":"study"));
  });
  if(homeTown?.era==="medieval"){
    const minute=Math.min(sleepMinute-120,Math.max(wake+210,600));
    if(minute>(wake+80)&&minute<(sleepMinute-45)){
      const script=MEDIEVAL_HOME_SCRIPTS[hash(`${c.id}:${dayKey(date)}:medieval-home`)%MEDIEVAL_HOME_SCRIPTS.length];
      list.push(homeEntry(c,minute,script[0],script[1],script[2]));
    }
  }
  return list.map(item=>medievalize(c,item,date)).sort((a,b)=>a.minute-b.minute);
}

function signature(c){return JSON.stringify({engine:"20260803av",townId:c.townId,homeId:c.homeId,ageGroup:c.ageGroup,wake:c.wake,sleep:c.sleep,job:c.job,jobTitle:c.jobTitle,workplaceId:c.workplaceId,routines:state.routines?.[c.id],hobbies:c.hobbies,interests:c.interests,inventory:c.inventory,foodPreferences:c.foodPreferences,favoriteScentNotes:c.favoriteScentNotes,favoriteStoryGenres:c.favoriteStoryGenres,favoriteVideoGenres:c.favoriteVideoGenres,favoriteGameGenres:c.favoriteGameGenres,favoriteFashionStyles:c.favoriteFashionStyles,drinkTypes:c.drinkTypes,musicGenres:c.musicGenres,socialStyle:c.socialStyle,perceptionStyle:c.perceptionStyle,decisionStyle:c.decisionStyle,planningStyle:c.planningStyle,activityTempo:c.activityTempo,neatness:c.neatness,interference:c.interference,conflictStyle:c.conflictStyle,affectionStyle:c.affectionStyle,energyRhythm:c.energyRhythm,housemates:state.order.map(id=>state.characters[id]).filter(x=>x?.homeId===c.homeId).map(x=>[x.id,x.wake,x.sleep]),rels:relationList().filter(r=>r.a===c.id||r.b===c.id),townEras:state.towns.map(t=>[t.id,t.era]),places:state.towns.flatMap(t=>(t.places||[]).map(p=>[p.id,p.type,p.stock,p.priceRange,p.spicy,p.sweet]))})}

export function timeline(c,date=new Date()){
  const key=dayKey(date), sig=signature(c);
  c.days??={};
  const old=c.days[key];
  if(!old||old.signature!==sig||old.engineVersion!=="20260803av"){
    c.days[key]={signature:sig,engineVersion:"20260803av",entries:build(c,date)};
    save();
  }
  return c.days[key].entries;
}
export function visibleTimeline(c,date=new Date()){return timeline(c,date).filter(x=>x.minute<=nowMin(date))}
function liveGapEvent(c,last,n,date){
  const minute=n-(n%15);
  if(last?.placeId){
    const currentTown=state.towns.find(t=>t.id===(last.townId||c.townId))||townFor(c);
    const place=(currentTown?.places||[]).find(p=>p.id===last.placeId);
    const shortStay=["카페","음식점","옷가게","쇼핑몰"].includes(place?.type);
    if(shortStay){
      const nextPlaces=(currentTown?.places||[]).filter(p=>p.id!==place.id&&["공원","도서관","공연장","쇼핑몰"].includes(p.type));
      const next=nextPlaces[hash(`${c.id}:${dayKey(date)}:${Math.floor(n/90)}:move-on`)%Math.max(1,nextPlaces.length)];
      if(next)return entry(minute,`${next.name}에 막 도착한 참`,`한곳에 오래 머물지 않고 하던 일을 마친 뒤 ${next.name}에 도착해 주변을 둘러보고 있어요.`,{townId:currentTown.id,placeId:next.id,mood:"외출"});
      return entry(minute,"집에 돌아온 참",`${place.name}에서의 일정을 마치고 집으로 돌아와 신발과 겉옷을 정리하고 있어요.`,{townId:c.townId,home:true,room:"entry",mood:"귀가"});
    }
    const continuations={
      카페:["카페에서 여유를 보내는 중","자리와 음료를 정리하며 다음에 할 일을 천천히 생각하고 있어요."],
      음식점:["식사를 마무리하는 중","남은 음식을 천천히 먹고 식탁을 정돈하며 잠시 쉬고 있어요."],
      사무실:["업무를 이어가는 중","처리한 내용을 확인하고 다음 업무에 필요한 자료를 차분히 정리하고 있어요."],
      학교:["수업과 과제를 이어가는 중","배운 내용을 노트에 정리하고 다음 일정에 필요한 준비물을 확인하고 있어요."],
      공원:["공원에서 걷는 중","사람이 덜 붐비는 길을 따라 천천히 걸으며 주변 풍경을 살펴보고 있어요."]
    };
    const text=continuations[place?.type]||[`${place?.name||"외출 장소"}에서 시간을 보내는 중`,"지금 하고 있는 일을 마무리하며 다음 일정을 준비하고 있어요."];
    return entry(minute,text[0],personalityFlavor(c,text[1],"live-away"),{townId:last.townId||c.townId,placeId:last.placeId,mood:last.mood||"보통"});
  }
  const scripts=[...HOME_ACTIVITY_POOL,
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
  if(sleepingNow(c,date))return entry(n,"자는 중",sleepScene(c,date),{home:true,room:c.sleepRoomId||"bedroom",mood:"수면",stress:0});
  const list=timeline(c,date), past=list.filter(x=>x.minute<=n);
  const last=past.at(-1);
  if(last&&n-last.minute>75)return liveGapEvent(c,last,n,date);
  if(last)return last;
  if(n<Math.min(wakeAt(c,date),240))return entry(n,"잠들기 전 시간을 보내는 중","자정이 지난 늦은 밤, 오늘 일정을 시작하는 대신 조용히 하루를 마무리하고 있어요.",{home:true,room:"bedroom",mood:"차분",stress:2});
  return entry(n,"집에서 아침 준비 중","기상 시각이 지나 오늘 일정을 시작할 준비를 하고 있어요.",{home:true,room:"bath",mood:"평온",stress:5});
}
export function charactersAtPlace(id,townId=state.activeTownId){return state.order.map(x=>state.characters[x]).filter(c=>{const e=eventFor(c);return e.placeId===id&&e.townId===townId})}
export function homeGroups(){const out={};state.order.forEach(id=>{const c=state.characters[id];if(c)(out[c.homeId||id]??=[]).push(c)});return out}
