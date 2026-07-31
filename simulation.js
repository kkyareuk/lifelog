import {state} from "./state.js";
const mins=s=>{const [h,m]=String(s||"0:0").split(":").map(Number);return h*60+(m||0)};
const hash=s=>{let h=0;for(const x of s)h=(h*31+x.charCodeAt())>>>0;return h};
const dateKey=()=>new Date().toLocaleDateString("sv-SE");

function asleepNow(now,sleep,wake){
  if(sleep===wake)return false;
  return sleep>wake ? now>=sleep||now<wake : now>=sleep&&now<wake;
}
function homeActivity(c,m){
  const seed=hash(c.id+dateKey()+Math.floor(m/90));
  const activities=[
    ["거실에서 음악을 고르는 중","좋아하는 곡을 틀어 두고 천천히 시간을 보내고 있어요."],
    ["주방에서 간식을 만드는 중","냉장고를 살펴보고 간단한 간식을 만들고 있어요."],
    ["서재에서 취미를 즐기는 중",`${c.hobbies?.[0]||"느긋한 취미"}에 집중하고 있어요.`],
    ["거실에서 영상을 보는 중","소파에 기대 오늘 보고 싶었던 영상을 보고 있어요."],
    ["집안일을 하는 중","눈에 띄는 곳을 가볍게 정리하고 있어요."],
    ["방에서 옷을 정리하는 중","내일 입을 옷과 소지품을 미리 챙기고 있어요."]
  ];
  return activities[seed%activities.length];
}
function placeFor(c,m){
  const hobbyTypes=c.hobbies?.includes("카페 탐방")?["카페"]:
    c.hobbies?.includes("운동")?["공원"]:
    c.interests?.includes("향수")?["상점","카페"]:
    ["카페","음식점","공원"];
  const candidates=state.world.places.filter(p=>hobbyTypes.includes(p.type));
  return candidates[hash(c.id+dateKey()+Math.floor(m/180))%Math.max(candidates.length,1)]||state.world.places[0];
}

export function eventFor(c,date=new Date()){
  const m=date.getHours()*60+date.getMinutes(),wake=mins(c.wake),sleep=mins(c.sleep);
  const routine=(state.routines[c.id]||[]).find(r=>r.day===date.getDay()&&m>=mins(r.start)&&m<mins(r.end));
  if(routine)return {title:routine.title,placeId:routine.placeId||null,home:!routine.placeId,room:routine.room||"living",desc:`고정 일정 · ${routine.start}–${routine.end}`};
  if(asleepNow(m,sleep,wake))return {title:"집에서 자는 중",home:true,room:"bedroom",desc:"설정한 취침 시간에 맞춰 잠들어 있어요."};
  if(m<wake+90){const [title,desc]=homeActivity(c,m);return {title,home:true,room:m<wake+40?"bath":"kitchen",desc}};
  const workStart=9*60,workEnd=18*60;
  if(m>=workStart&&m<workEnd&& !["무직","학생"].includes(c.job)){
    const type=["의사","간호사"].includes(c.job)?"병원":"회사";
    const place=state.world.places.find(p=>p.type===type)||state.world.places.find(p=>p.type==="회사");
    return {title:`${c.job}로 일하는 중`,placeId:place?.id,home:false,desc:`${place?.name||"직장"}에서 오늘의 업무를 하고 있어요.`};
  }
  if(m>=22*60){const [title,desc]=homeActivity(c,m);return {title,home:true,room:"living",desc}};
  const slot=Math.floor((m-10*60)/120);
  const stayHome=c.hobbies?.includes("외출 안 함")||c.hobbies?.includes("집에서 뒹굴기");
  const chance=stayHome?22:58;
  const outingSlots=[0,1,2,3,4,5].filter(i=>hash(`${c.id}:${dateKey()}:${i}`)%100<chance);
  if(!stayHome&&!outingSlots.length)outingSlots.push(hash(c.id+dateKey())%5);
  if(slot>=0&&outingSlots.includes(slot)){
    const p=placeFor(c,m);
    return {title:`${p.name} 방문`,placeId:p.id,home:false,desc:`${p.name}에서 ${c.hobbies?.[0]||"자유 시간"}을 보내고 있어요.`};
  }
  const [title,desc]=homeActivity(c,m);
  const rooms=["living","kitchen","study","living"];
  return {title,home:true,room:rooms[hash(c.id+Math.floor(m/120))%rooms.length],desc};
}

export function charactersAtPlace(placeId){
  return state.order.map(id=>state.characters[id]).filter(c=>eventFor(c).placeId===placeId);
}
export function homeGroups(){
  const groups={};
  state.order.forEach(id=>{const c=state.characters[id],homeId=c.homeId||c.id;(groups[homeId]??=[]).push(c)});
  return groups;
}
