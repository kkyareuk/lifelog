import {state,save} from "./state.js";
const mins=s=>{const [h,m]=String(s||"0:0").split(":").map(Number);return h*60+(m||0)};
const hash=s=>{let h=0;for(const x of s)h=(h*31+x.charCodeAt())>>>0;return h};
const keyOf=d=>d.toLocaleDateString("sv-SE");
const time=m=>`${String(Math.floor(m/60)%24).padStart(2,"0")}:${String(m%60).padStart(2,"0")}`;
const asleep=(m,s,w)=>s>w?m>=s||m<w:m>=s&&m<w;
const place=(type,fallback)=>state.world.places.find(p=>p.type===type)||state.world.places.find(p=>p.type===fallback)||state.world.places[0];

function homeEntry(m,room,title,desc){return {minutes:m,time:time(m),home:true,room,title,desc}}
function outEntry(m,p,title,desc){return {minutes:m,time:time(m),home:false,placeId:p?.id||null,title,desc}}
function signature(c){
  return JSON.stringify({
    c:{job:c.job,wake:c.wake,sleep:c.sleep,tastes:c.tastes,interests:c.interests,hobbies:c.hobbies,homeId:c.homeId},
    places:state.world.places.map(({id,name,type})=>({id,name,type})),
    routines:state.routines[c.id]||[]
  });
}
function build(c,date){
  const wake=mins(c.wake),sleep=mins(c.sleep),entries=[];
  entries.push(homeEntry(wake,"bedroom","기상","잠에서 깨어 오늘 하루를 시작했어요."));
  entries.push(homeEntry((wake+25)%1440,"bath","씻고 준비하는 중","세면을 마치고 오늘 입을 옷을 골라요."));
  entries.push(homeEntry((wake+55)%1440,"kitchen","아침을 챙기는 중","주방에서 간단한 아침을 준비하고 있어요."));
  const employed=!["무직","학생"].includes(c.job);
  if(employed){
    const work=place(["의사","간호사"].includes(c.job)?"병원":"회사","회사");
    entries.push(outEntry(9*60,work,`${c.job}로 일하는 중`,`${work?.name||"직장"}에서 오늘의 업무를 시작했어요.`));
    const food=place("음식점","카페");
    entries.push(outEntry(12*60+10,food,`${food?.name||"식당"}에서 점심`,`${food?.name||"식당"}에서 점심을 먹고 있어요.`));
    entries.push(outEntry(13*60,work,"직장으로 돌아감","점심을 마치고 업무를 이어 가고 있어요."));
  }else if(c.job==="학생"){
    const school=place("학교","회사");
    entries.push(outEntry(9*60,school,"수업을 듣는 중",`${school?.name||"학교"}에서 오늘 수업을 듣고 있어요.`));
  }
  const seed=hash(c.id+keyOf(date));
  const goOut=!c.hobbies?.includes("외출 안 함")&&(seed%100<(c.hobbies?.includes("집에서 뒹굴기")?35:78));
  if(goOut){
    const preferred=c.hobbies?.includes("카페 탐방")?"카페":c.hobbies?.includes("운동")?"공원":c.hobbies?.includes("쇼핑")?"상점":"공원";
    const p=place(preferred,"카페");
    const at=employed?18*60+30:14*60+(seed%90);
    entries.push(outEntry(at,p,`${p?.name||"마을"} 방문`,`${p?.name||"마을"}에서 ${c.hobbies?.[0]||"자유 시간"}을 보내고 있어요.`));
  }else{
    entries.push(homeEntry(employed?18*60+40:14*60,"study","취미를 즐기는 중",`${c.hobbies?.[0]||"느긋한 휴식"}에 집중하고 있어요.`));
  }
  entries.push(homeEntry(20*60+20,"kitchen","저녁을 준비하는 중","주방에서 저녁 식사와 간식을 챙기고 있어요."));
  entries.push(homeEntry(21*60+20,"living","오늘의 생활을 정리하는 중","거실에서 오늘 있었던 일을 천천히 정리하고 있어요."));
  entries.push(homeEntry(sleep,"bedroom","잠자리에 듦","설정한 취침 시각에 맞춰 잠들었어요."));
  for(const r of state.routines[c.id]||[]){
    if(r.day===date.getDay())entries.push(r.placeId?outEntry(mins(r.start),state.world.places.find(p=>p.id===r.placeId),r.title,`고정 일정 · ${r.start}–${r.end}`):homeEntry(mins(r.start),r.room||"living",r.title,`고정 일정 · ${r.start}–${r.end}`));
  }
  return entries.filter(e=>Number.isFinite(e.minutes)).sort((a,b)=>a.minutes-b.minutes);
}
export function timelineFor(c,date=new Date()){
  const day=keyOf(date),id=`${day}:${c.id}`,sig=signature(c),now=date.getHours()*60+date.getMinutes();
  const old=state.dailyPlans[id],fresh=build(c,date);
  if(!old){
    state.dailyPlans[id]={signature:sig,entries:fresh};save();
    return fresh;
  }
  if(old.signature!==sig){
    const past=old.entries.filter(e=>e.minutes<=now);
    const future=fresh.filter(e=>e.minutes>now);
    state.dailyPlans[id]={signature:sig,entries:[...past,...future].sort((a,b)=>a.minutes-b.minutes)};save();
  }
  return state.dailyPlans[id].entries;
}
export function eventFor(c,date=new Date()){
  const m=date.getHours()*60+date.getMinutes(),wake=mins(c.wake),sleep=mins(c.sleep);
  const entries=timelineFor(c,date),past=entries.filter(e=>e.minutes<=m);
  if(asleep(m,sleep,wake))return {title:"집에서 자는 중",home:true,room:"bedroom",desc:"설정한 취침 시간에 맞춰 잠들어 있어요."};
  return past.at(-1)||{title:"아직 하루를 시작하지 않음",home:true,room:"bedroom",desc:"기상 시각 전이라 조용히 쉬고 있어요."};
}
export function visibleTimeline(c,date=new Date()){
  const m=date.getHours()*60+date.getMinutes();
  return timelineFor(c,date).filter(e=>e.minutes<=m);
}
export function charactersAtPlace(placeId){
  return state.order.map(id=>state.characters[id]).filter(c=>eventFor(c).placeId===placeId);
}
export function homeGroups(){
  const groups={};
  state.order.forEach(id=>{const c=state.characters[id],homeId=c.homeId||c.id;(groups[homeId]??=[]).push(c)});
  return groups;
}
