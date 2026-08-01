import {state,save} from "./state.js?v=20260801j";

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
  const rels=related(c).filter(x=>["부부","연인","짝사랑","친구"].includes(x.r.type));
  const pick=rels[hash(`${c.id}:${dayKey(date)}:social`)%Math.max(1,rels.length)];
  const p=placeFor(["카페","음식점","공원","영화관"],`${c.id}:${dayKey(date)}:social-place`);
  if(!p)return null;
  const food=catalogChoice(c,p,"food",`${c.id}:${dayKey(date)}:food`);
  if(pick){
    const action=food?`${pick.other.name}와 함께 ${food.name} 먹는 중`:`${pick.other.name}와 데이트 중`;
    return entry(time,action,`${pick.r.type}인 ${pick.other.name}와 ${p.name}에서 시간을 보내고 있어요.`,away({placeId:p.id,itemId:food?.id,withId:pick.other.id,mood:"즐거움",stress:Math.max(0,10)}));
  }
  return entry(time,`${p.name} 방문`,food?`오늘은 ${food.name}을 골라 천천히 즐기고 있어요.`:"가벼운 외출을 즐기고 있어요.",away({placeId:p.id,itemId:food?.id,mood:"평온"}));
}

function build(c,date=new Date()){
  const wake=wakeAt(c,date), sleep=sleepAt(c,date);
  const sleepMinute=sleep<=wake?sleep+1440:sleep;
  const list=[entry(wake,"기상","집에서 하루를 시작했어요.",{home:true,room:c.sleepRoomId||"bedroom",mood:"평온",stress:5})];
  list.push(homeEntry(c,wake+20,"욕실에서 씻는 중","세면대 앞에서 세수하고 이를 닦으며 잠을 깨고 있어요.","bath"));
  list.push(homeEntry(c,wake+45,"주방에서 아침 준비 중","냉장고를 열어 먹을 것을 고르고 식탁에 아침을 차리고 있어요.","kitchen"));
  const work=workEvent(c,Math.max(wake+90,540),date);
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
  if(stress>=45&&related(c).length){
    const other=related(c)[0].other;
    list.push(homeEntry(c,1260,`${other.name}와 말다툼하는 중`,"쌓인 피로와 스트레스 때문에 사소한 말이 다툼으로 번졌어요. 관계 유형 자체는 바뀌지 않아요."));
  }else{
    const homeScripts=[
      ["거실 소파에서 영상 보는 중","TV 앞 소파에 기대어 좋아하는 영상을 이어 보고 있어요.","living"],
      ["서재에서 취미를 즐기는 중","책상 위에 좋아하는 물건을 펼쳐 놓고 취미에 집중하고 있어요.","study"],
      ["주방에서 간식 만드는 중","주방 조리대에서 간단한 간식과 마실 것을 준비하고 있어요.","kitchen"],
      ["침실에서 음악 듣는 중","침대에 기대어 이어폰으로 좋아하는 음악을 듣고 있어요.","bedroom"]
    ];
    const script=homeScripts[hash(`${c.id}:${dayKey(date)}:home-evening`)%homeScripts.length];
    list.push(homeEntry(c,1260,script[0],script[1],script[2]));
  }
  list.push(entry(sleepMinute,"자는 중",`설정한 취침 시각에서 ${Math.abs(jitter(c,"sleep",date))}분 정도 차이로 잠들었어요.`,{home:true,room:c.sleepRoomId||"bedroom",mood:"수면",stress:0}));
  return list.sort((a,b)=>a.minute-b.minute);
}

function signature(c){return JSON.stringify({townId:state.activeTownId,wake:c.wake,sleep:c.sleep,job:c.job,jobTitle:c.jobTitle,workplaceId:c.workplaceId,hobbies:c.hobbies,interests:c.interests,inventory:c.inventory,foodPreferences:c.foodPreferences,drinkTypes:c.drinkTypes,musicGenres:c.musicGenres,spiceTolerance:c.spiceTolerance,sweetPreference:c.sweetPreference,rels:relationList().filter(r=>r.a===c.id||r.b===c.id),places:state.world.places.map(p=>[p.id,p.type,p.stock,p.priceRange,p.spicy,p.sweet])})}

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
export function eventFor(c,date=new Date()){
  const n=nowMin(date);
  if(sleepingNow(c,date))return entry(n,"자는 중","설정한 수면 시간에 맞춰 집에서 자고 있어요.",{home:true,room:c.sleepRoomId||"bedroom",mood:"수면",stress:0});
  const list=timeline(c,date), past=list.filter(x=>x.minute<=n);
  return past.at(-1)||entry(n,"집에서 아침 준비 중","오늘 일정을 시작할 준비를 하고 있어요.",{home:true,room:"bath",mood:"평온",stress:5});
}
export function charactersAtPlace(id){return state.order.map(x=>state.characters[x]).filter(c=>eventFor(c).placeId===id)}
export function homeGroups(){const out={};state.order.forEach(id=>{const c=state.characters[id];if(c)(out[c.homeId||id]??=[]).push(c)});return out}
