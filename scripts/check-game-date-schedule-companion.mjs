import fs from "node:fs";
import path from "node:path";

const root=path.resolve(import.meta.dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const app=read("app.js"),state=read("state.js"),simulation=read("simulation.js"),views=read("views.js"),css=read("app.css"),gradle=read("android/app/build.gradle");

const checks=[
  [views.includes('class="game-hud-date"')&&views.includes('toLocaleDateString(uiLocale(),{month:"long",day:"numeric",weekday:"short"})'),"모바일 관찰 화면의 게임 날짜"],
  [css.includes(".game-hud-date")&&css.includes("top:3.487dvh")&&css.includes("font-size:10px!important")&&css.includes("top:5.45dvh")&&css.includes("-webkit-text-stroke:.85px #000!important"),"게임 날짜를 검은 외곽선의 작은 흰색 글자로 시간 위에 우측 정렬"],
  [simulation.includes("const activeScheduledRoutine=")&&simulation.includes("if(activeRoutineEntry)return withResidenceLocation"),"등록 일정의 시작·종료 구간 우선 적용"],
  [simulation.includes("activeRoutine&&!routineCompanionIds.length")&&simulation.includes("다른 캐릭터의 대화나 공동 행동"),"동행자 없는 일정의 임의 대화 차단"],
  [simulation.includes("withIds:companionIds")&&simulation.includes("routineEndMinute:endMinute"),"일정 동행자와 종료 시각 보존"],
  [simulation.includes("rawEnd===start?start+30")&&simulation.includes("?Number(current.routineStartMinute)") ,"시작·종료가 같은 일정을 24시간으로 늘리지 않고 원래 로그 시각 보존"],
  [app.includes('name="stayTogether"')&&app.includes("stayTogether:f.stayTogether.checked"),"관계의 함께 다니기 설정 저장"],
  [state.includes("relation.stayTogether=Boolean(relation.stayTogether)"),"기존 관계 데이터의 함께 다니기 안전 변환"],
  [simulation.includes("function companionAlignedBaseEvent")&&simulation.includes("!activeScheduledRoutine(other,date)"),"별도 일정이 없는 관계만 동행"],
  [views.includes('"함께 다니기":"Stay together"')&&views.includes('"함께 다니기":"一緒に行動する"'),"함께 다니기 영어·일본어 번역"],
  [gradle.includes("versionCode 146")&&gradle.includes('versionName "1.0.135"'),"캐릭터 허브 격리 개발 빌드 버전"]
];

const failed=checks.filter(([ok])=>!ok);
checks.forEach(([ok,label])=>console.log(`${ok?"PASS":"FAIL"} ${label}`));
if(failed.length)process.exit(1);

const storage=new Map();
globalThis.localStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)};
globalThis.window={DRAWER_VILLAGE_NATIVE:false,addEventListener:()=>{},dispatchEvent:()=>{}};
globalThis.document={addEventListener:()=>{},querySelector:()=>null,activeElement:null,visibilityState:"visible"};
const {state:runtimeState}=await import("../state.js?v=20260825characterbookfidelity");
const {eventFor}=await import(`../simulation.js?date-schedule-companion=${Date.now()}`);
const character=(id,name,homeId)=>({id,name,createdAt:1,ageGroup:"성인",gender:"설정하지 않음",speechStyle:"자동 · 성격에 맞춤",townId:"",homeId,residences:[{homeId,isPrimary:true,stayPattern:"상시 거주"}],wake:"07:00",sleep:"23:00",job:"무직",jobTitle:"",personalityTypes:[],characterTraits:[],traitExpressions:[],hobbies:[],interests:[],inventory:{},foodTypes:[],foodPreferences:[],musicGenres:[],appearanceTags:[],attractionTraits:[],bodyProfile:{},theme:{primary:"#176b60"}});
runtimeState.characters={a:character("a","가람","ha"),b:character("b","나래","hb")};
runtimeState.order=["a","b"];
runtimeState.homes={ha:{id:"ha",townId:"",rooms:{living:{name:"거실",type:"living"}}},hb:{id:"hb",townId:"",rooms:{living:{name:"거실",type:"living"}}}};
runtimeState.relationships={pair:{id:"pair",a:"a",b:"b",type:"연인",temporalStatus:"current",stayTogether:true}};
runtimeState.routines={a:[{id:"planned",day:6,start:"10:00",end:"12:00",type:"개인 일정",title:"도서관 자료 정리",placeId:"cafe",withIds:[],notes:"등록한 일정 확인"}],b:[]};
runtimeState.monthlyRoutines={a:[],b:[]};
runtimeState.dailyPlans={};
const duringSchedule=new Date(2026,7,22,10,30,0,0);
const scheduledEvent=eventFor(runtimeState.characters.a,duringSchedule);
if(scheduledEvent.routineId!=="planned"||scheduledEvent.title!=="도서관 자료 정리"||scheduledEvent.withId||scheduledEvent.forcedCompanionId){
  console.error("FAIL 등록 일정이 임의 동행이나 대화로 바뀌었습니다",scheduledEvent);
  process.exit(1);
}
console.log("PASS 실행 중인 등록 일정은 동행자 없는 원래 제목과 행동을 유지합니다");
runtimeState.characters.c=character("c","다온","hc");
runtimeState.order.push("c");
runtimeState.homes.hc={id:"hc",townId:"",rooms:{living:{name:"거실",type:"living"}}};
runtimeState.routines.c=[{id:"same-time",day:6,start:"14:15",end:"14:15",type:"개인 일정",title:"새벽이 집 데려다주기",withIds:[]}];
runtimeState.monthlyRoutines.c=[];
const afterSameTimeSchedule=eventFor(runtimeState.characters.c,new Date(2026,7,22,17,34,0,0));
if(afterSameTimeSchedule.routineId==="same-time"){
  console.error("FAIL 시작·종료가 같은 일정이 17:34까지 계속 활성화됐습니다",afterSameTimeSchedule);
  process.exit(1);
}
console.log("PASS 14:15 단일 일정은 17:34에 다시 활성화되지 않습니다");
console.log(`\nPASS ${checks.length+2} game date, schedule, and companion checks.`);
