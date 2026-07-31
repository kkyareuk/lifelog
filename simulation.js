import {state,save} from "./state.js?v=20260731d";
const mins=s=>{const [h,m]=String(s||"0:0").split(":").map(Number);return h*60+(m||0)};
const hash=s=>{let h=0;for(const x of s)h=(h*31+x.charCodeAt())>>>0;return h};
const keyOf=d=>d.toLocaleDateString("sv-SE");
const time=m=>`${String(Math.floor(m/60)%24).padStart(2,"0")}:${String(m%60).padStart(2,"0")}`;
const asleep=(m,s,w)=>s>w?m>=s||m<w:m>=s&&m<w;
const place=(type,fallback)=>state.world.places.find(p=>p.type===type)||state.world.places.find(p=>p.type===fallback)||state.world.places[0];
const pick=(items,seed,fallback)=>items?.length?items[seed%items.length]:fallback;
const dishes={"한식":["김치찌개","비빔밥","불고기 정식"],"면 요리":["우동","탄탄멘","냉모밀"],"양식":["파스타","리조또","라자냐"],"중식":["딤섬","마파두부","볶음밥"],"일식":["초밥","돈카츠","오므라이스"],"디저트":["프렌치토스트","케이크","파르페"]};
const defaultDrinks=["아인슈페너","카페라테","레몬 에이드","밀크티","핸드드립 커피"];
const catalogItem=id=>Object.values(state.catalog||{}).flat().find(x=>x.id===id);
function stocked(p,kind){const chosen=(p?.stock||[]).map(catalogItem).filter(x=>x?.kind===kind);return chosen.length?chosen:(state.catalog?.[kind]||[])}
function chooseCatalog(c,p,kind,seed){
  const favorite=new Set(c.favorites?.[kind]||[]);
  return [...stocked(p,kind)].sort((a,b)=>{
    const score=x=>(favorite.has(x.id)?100:0)+(c.foodTypes?.includes(x.category)?25:0)+(c.musicGenres?.includes(x.category)?25:0)+(c.tastes?.includes("맵부심")?(x.spicy||0)*4:0)+(c.tastes?.includes("디저트광")?(x.sweet||0)*4:0)+(hash(`${c.id}:${x.id}:${seed}`)%11);
    return score(b)-score(a);
  })[0]||null;
}
function relationshipEvent(c,date){
  const priority={"부부":5,"연인":4,"짝사랑":3,"썸":2,"친구":1};
  const options=Object.values(state.relationships||{})
    .filter(r=>(r.a===c.id||r.b===c.id)&&priority[r.type]&&state.characters[r.a===c.id?r.b:r.a])
    .sort((a,b)=>(priority[b.type]-priority[a.type])||a.id.localeCompare(b.id));
  const r=options[0]; if(!r)return null;
  const other=state.characters[r.a===c.id?r.b:r.a],pair=[c.id,other.id].sort().join(":");
  const seed=hash(`${pair}:${keyOf(date)}:date`);
  const chance=r.type==="부부"||r.type==="연인"?68:r.type==="짝사랑"?28:18;
  if(seed%100>=chance)return null;
  const cafe=seed%3===0,p=place(cafe?"카페":"음식점",cafe?"음식점":"카페");
  const at=19*60+seed%35;
  if(cafe){
    const drink=chooseCatalog(c,p,"drink",seed)?.name||pick(c.drinks,seed,defaultDrinks[seed%defaultDrinks.length]);
    return outEntry(at,p,`${other.name}와 ${drink}을 마시는 중`,`${r.type==="짝사랑"?"조금 설레는 마음으로":"함께 시간을 보내며"} ${p?.name||"카페"}에서 ${drink}을 마시고 있어요.`);
  }
  const foodType=pick(c.foodTypes,seed,"한식"),dish=chooseCatalog(c,p,"food",seed)?.name||pick(dishes[foodType],seed,"저녁 메뉴");
  return outEntry(at,p,`${other.name}와 함께 ${dish}을 먹는 중`,`${p?.name||"식당"}에서 ${other.name}와 데이트하며 ${dish}을 먹고 있어요.`);
}
function cafeEntry(c,m,p,seed){
  const favorites=c.drinks?.length?c.drinks:defaultDrinks,triesNew=seed%5===0;
  const drink=chooseCatalog(c,p,"drink",seed)?.name||(triesNew?pick(defaultDrinks.filter(x=>!favorites.includes(x)),seed,"아인슈페너"):pick(favorites,seed,"아인슈페너"));
  return outEntry(m,p,`${drink}을 마시는 중`,triesNew?`오늘따라 도전하고 싶어서 ${drink}을 마셔 보았어요.`:`평소 좋아하는 ${drink}을 천천히 마시고 있어요.`);
}

function homeEntry(m,room,title,desc){return {minutes:m,time:time(m),home:true,room,title,desc}}
function outEntry(m,p,title,desc){return {minutes:m,time:time(m),home:false,placeId:p?.id||null,title,desc}}
const interactions={
  "소파":["소파에서 느긋하게 쉬는 중","소파에 기대 잠깐 숨을 돌리고 있어요."],"TV":["TV를 보는 중","좋아하는 프로그램을 골라 보고 있어요."],
  "책장":["책을 읽는 중","책장에서 책을 골라 읽고 있어요."],"오디오":["음악을 감상하는 중","오디오로 좋아하는 곡을 듣고 있어요."],
  "게임기":["게임을 하는 중","게임기를 켜고 한 판 즐기고 있어요."],"안마의자":["안마의자에서 피로를 푸는 중","안마의자에 앉아 뭉친 몸을 풀고 있어요."],
  "냉장고":["냉장고를 살펴보는 중","먹을 것을 고르며 냉장고 안을 살펴보고 있어요."],"조리대":["요리하는 중","조리대에서 먹을 것을 준비하고 있어요."],
  "오븐":["오븐 요리를 굽는 중","오븐 안을 확인하며 완성되기를 기다려요."],"커피머신":["커피를 내리는 중","커피머신으로 취향에 맞는 커피를 내리고 있어요."],
  "식탁":["식탁에서 식사하는 중","식탁에 앉아 천천히 식사하고 있어요."],"신발장":["외출 준비를 하는 중","신발장에서 오늘 신을 신발을 고르고 있어요."],
  "전신거울":["전신거울을 확인하는 중","옷매무새를 마지막으로 살펴보고 있어요."],"샤워부스":["샤워하는 중","샤워를 하며 기분을 산뜻하게 바꾸고 있어요."],
  "욕조":["욕조에서 쉬는 중","따뜻한 물에 몸을 담그고 쉬고 있어요."],"세면대":["세면대에서 씻는 중","세수를 하고 간단히 단장하고 있어요."],
  "세탁기":["빨래하는 중","세탁기를 돌리고 끝나기를 기다리고 있어요."],"침대":["침대에서 쉬는 중","침대에 누워 조용히 쉬고 있어요."],
  "화장대":["화장대에서 단장하는 중","화장대 앞에서 차분히 준비하고 있어요."],"옷장":["옷장을 정리하는 중","옷장에서 입을 옷을 고르거나 정리하고 있어요."],
  "책상":["책상에서 집중하는 중","책상에 앉아 할 일을 차분히 처리하고 있어요."],"컴퓨터":["컴퓨터를 사용하는 중","컴퓨터로 관심 있는 것을 찾아보고 있어요."],
  "피아노":["피아노를 연주하는 중","기분에 맞는 곡을 골라 피아노를 연주하고 있어요."],"기타":["기타를 연주하는 중","익숙한 곡을 기타로 천천히 연주하고 있어요."],
  "이젤":["그림을 그리는 중","이젤 앞에 앉아 그림에 집중하고 있어요."],"재봉틀":["재봉틀을 사용하는 중","천과 실을 골라 작은 작업을 하고 있어요."],
  "운동기구":["집에서 운동하는 중","운동기구로 가볍게 몸을 움직이고 있어요."],"향수장":["향수를 정리하는 중","향을 확인하며 향수장을 정리하고 있어요."],
  "피규어장":["피규어를 정리하는 중","소장품의 자리를 조금씩 다듬고 있어요."]
};
function furnitureEntry(c,m,room,fallbackTitle,fallbackDesc){
  const items=state.homes[c.homeId||c.id]?.rooms?.[room]?.furniture||[];
  const item=items[hash(`${c.id}:${m}:${room}`)%Math.max(1,items.length)],copy=interactions[item];
  return homeEntry(m,room,copy?.[0]||fallbackTitle,copy?.[1]||fallbackDesc);
}
function signature(c){
  return JSON.stringify({
    c:{job:c.job,wake:c.wake,sleep:c.sleep,tastes:c.tastes,interests:c.interests,hobbies:c.hobbies,homeId:c.homeId,income:c.income,musicGenres:c.musicGenres,foodTypes:c.foodTypes,drinks:c.drinks,favorites:c.favorites},
    catalog:state.catalog,
    places:state.world.places.map(({id,name,type,stock})=>({id,name,type,stock})),
    relationships:Object.values(state.relationships||{}).filter(r=>r.a===c.id||r.b===c.id),
    routines:state.routines[c.id]||[],
    homeRooms:state.homes[c.homeId||c.id]?.rooms||{}
  });
}
function build(c,date){
  const wake=mins(c.wake),sleep=mins(c.sleep),entries=[],seed=hash(c.id+keyOf(date));
  entries.push(homeEntry(wake,"bedroom","기상","잠에서 깨어 오늘 하루를 시작했어요."));
  entries.push(homeEntry((wake+25)%1440,"bath","씻고 준비하는 중","세면을 마치고 오늘 입을 옷을 골라요."));
  entries.push(homeEntry((wake+55)%1440,"kitchen","아침을 챙기는 중","주방에서 간단한 아침을 준비하고 있어요."));
  const employed=!["무직","학생"].includes(c.job);
  if(employed){
    const work=place(["의사","간호사"].includes(c.job)?"병원":"회사","회사");
    entries.push(outEntry(9*60,work,`${c.job}로 일하는 중`,`${work?.name||"직장"}에서 오늘의 업무를 시작했어요.`));
    const food=place("음식점","카페");
    const meal=chooseCatalog(c,food,"food",seed+12)?.name||pick(dishes[pick(c.foodTypes,seed,"한식")],seed,"점심 메뉴");
    entries.push(outEntry(12*60+10,food,`${food?.name||"식당"}에서 ${meal}을 먹는 중`,`${food?.name||"식당"}에서 취향에 맞는 ${meal}을 골라 점심을 먹고 있어요.`));
    entries.push(outEntry(13*60,work,"직장으로 돌아감","점심을 마치고 업무를 이어 가고 있어요."));
  }else if(c.job==="학생"){
    const school=place("학교","회사");
    entries.push(outEntry(9*60,school,"수업을 듣는 중",`${school?.name||"학교"}에서 오늘 수업을 듣고 있어요.`));
  }
  const dateEvent=relationshipEvent(c,date);
  const goOut=!c.hobbies?.includes("외출 안 함")&&(seed%100<(c.hobbies?.includes("집에서 뒹굴기")?35:78));
  if(dateEvent){
    entries.push(dateEvent);
  }else if(goOut){
    const preferred=c.hobbies?.includes("카페 탐방")?"카페":c.hobbies?.includes("운동")?"공원":c.hobbies?.includes("쇼핑")?"상점":"공원";
    const p=place(preferred,"카페");
    const at=employed?18*60+30:14*60+(seed%90);
    if(preferred==="카페")entries.push(cafeEntry(c,at,p,seed));
    else{
      const kind=c.hobbies?.includes("쇼핑")?"fashion"
        :c.interests?.includes("음악")?"music"
        :c.interests?.includes("애니메이션")?"idol"
        :c.hobbies?.includes("독서")?"book"
        :c.interests?.includes("영화")?"movie"
        :c.interests?.includes("게임")?"game"
        :c.interests?.includes("향수")?"perfume"
        :c.hobbies?.some(x=>["덕질","공방 체험"].includes(x))?"hobby":null;
      const item=kind?chooseCatalog(c,p,kind,seed):null,verbs={fashion:"입어 보는 중",music:"듣는 중",idol:"새 무대를 보는 중",book:"읽는 중",movie:"감상하는 중",game:"플레이하는 중",perfume:"시향하는 중",hobby:"살펴보는 중"};
      entries.push(item?outEntry(at,p,`${item.name}을 ${verbs[kind]}`,`${p?.name||"상점"}에서 취향에 맞는 ${item.name}을 골랐어요.`):outEntry(at,p,`${p?.name||"마을"} 방문`,`${p?.name||"마을"}에서 ${c.hobbies?.[0]||"자유 시간"}을 보내고 있어요.`));
    }
  }else{
    entries.push(furnitureEntry(c,employed?18*60+40:14*60,"study","취미를 즐기는 중",`${c.hobbies?.[0]||"느긋한 휴식"}에 집중하고 있어요.`));
  }
  if(!dateEvent)entries.push(furnitureEntry(c,20*60+20,"kitchen","저녁을 준비하는 중","주방에서 저녁 식사와 간식을 챙기고 있어요."));
  entries.push(furnitureEntry(c,21*60+20,"living","오늘의 생활을 정리하는 중","거실에서 오늘 있었던 일을 천천히 정리하고 있어요."));
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
