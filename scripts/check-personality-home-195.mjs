import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {characterMood} from "../character-mood.js";
import {advanceHomeLifeSimulation} from "../home-simulation.js";

let checks=0;
const ok=(condition,message)=>{assert.ok(condition,message);checks+=1};
const equal=(actual,expected,message)=>{assert.equal(actual,expected,message);checks+=1};

const [views,css,app,state,simulation,gradle]=await Promise.all([
  "../views.js","../character-book.css","../app.js","../state.js","../simulation.js","../android/app/build.gradle"
].map(path=>readFile(new URL(path,import.meta.url),"utf8")));

ok(views.includes('class="personality-emotion-content"'),"9페이지 제목과 입력칸을 하나의 흐름 컨테이너에 둔다");
ok(css.includes(".personality-emotion-content")&&css.includes("grid-template-rows:auto minmax(0,1fr)")&&css.includes(".personality-emotion-grid{position:static!important"),"웹폰트 높이가 달라도 9페이지가 겹치지 않는 흐름형 레이아웃을 쓴다");
const buildingDressSection=views.slice(views.indexOf("function buildingDressCodeControls"),views.indexOf("function buildingLightingControls"));
ok(!buildingDressSection.includes("data-place-dress-uniform")&&!buildingDressSection.includes("유니폼 착용 필수"),"건물 드레스코드에서 유니폼 필수 항목을 제거한다");
ok(!app.includes("data-place-dress-uniform"),"삭제한 건물 유니폼 입력의 이벤트 처리도 남기지 않는다");
ok(state.includes('SIMULATION_FIELDS.add("diligence")'),"근면함을 바꾸면 생활 장면을 다시 계산한다");
for(const field of ["socialStyle","perceptionStyle","decisionStyle","planningStyle","activityTempo","interference","neatness","diligence","conflictStyle","affectionStyle","energyRhythm","humorStyle"]){
  ok(simulation.includes(`c.${field}`)||simulation.includes(`character.${field}`),`8페이지 ${field} 값을 행동·로그 계산에 사용한다`);
}

const baseCharacter={id:"c1",name:"테스터",personalityTypes:[],characterTraits:[],interests:[],hobbies:[],inventory:{fashion:["plain"]},emotionalBaseline:"현실적인 편",moodVolatility:"거의 흔들리지 않음",positiveMoodResponse:"조용히 만족함",stressMoodResponse:"잠시 거리를 둠",moodRecoveryStyle:"혼자 정리하며 회복",socialStyle:"조용히 어울림",energyRhythm:"상황에 따라",neatness:"보통",diligence:"보통"};
const dirtyWorld={uiLanguage:"ko",world:{id:"town",name:"마을",reputation:"지정 안 함"},towns:[],homes:{home:{id:"home",townId:"town",cleanliness:20,beautyLevel:"보통"}},characters:{},relationships:{},catalog:{fashion:[{id:"plain",formality:"캐주얼",colors:["검정"]}]},routines:{},monthlyRoutines:{}};
const homeEntry={date:"2026-09-02",minute:720,home:true,visitHomeId:"home",title:"거실에서 쉬는 중",desc:"잠시 쉬고 있어요.",room:"living"};
const tidyMood=characterMood({...baseCharacter,neatness:"흐트러짐을 못 참음"},homeEntry,dirtyWorld,"ko");
const relaxedMood=characterMood({...baseCharacter,neatness:"어질러도 편함"},homeEntry,dirtyWorld,"ko");
ok(tidyMood.score<relaxedMood.score,"깔끔함 성향에 따라 같은 어수선한 집의 기분 영향이 달라진다");

const place={id:"office",name:"사무실",townId:"town",dressCode:{enabled:true,requiredUniform:true,formality:"캐주얼",colors:["검정"]}};
const dressWorld={...dirtyWorld,world:{...dirtyWorld.world,places:[place]},homes:{}};
const dressMood=characterMood(baseCharacter,{date:"2026-09-02",minute:800,placeId:"office",title:"사무실에서 쉬는 중",desc:"잠시 쉬고 있어요."},dressWorld,"ko");
ok(!dressMood.reasons.some(reason=>reason.text.includes("드레스코드가 어긋")),"예전 건물 데이터의 유니폼 필수 값은 기분 계산에서 무시한다");

const now=1_800_000_000_000;
const home={rooms:{living:{furniturePlacements:[{id:"sofa",item:"소파",x:65,y:60}]}}};
const context={c1:{scene:{minute:600,title:"소파에서 쉬는 중",room:"living"},sceneKey:"rest",startedAt:now-60_000,endsAt:now+600_000,animateMovement:false}};
const hydrated=advanceHomeLifeSimulation(home,["c1"],context,now);
equal(hydrated.simulation.agents.c1.phase,"using","집 첫 진입은 가구 사용 위치에서 바로 복원한다");
equal(hydrated.simulation.agents.c1.x,hydrated.simulation.agents.c1.fromX,"집 첫 진입에 출발점 순간이동을 만들지 않는다");
home.lifeSimulation=hydrated.simulation;
const changed=advanceHomeLifeSimulation(home,["c1"],{c1:{...context.c1,scene:{minute:610,title:"소파를 정리하러 이동 중",room:"living"},sceneKey:"next",animateMovement:true}},now+1_000);
equal(changed.simulation.agents.c1.phase,"walking","화면을 보는 중 실제 행동이 바뀔 때만 걷는다");
ok(app.includes('animateMovement=homeLifeObservationKey===observationKey')&&app.includes("homeLifeObservationKey=\"\""),"집을 새로 연 경우와 계속 보고 있는 경우를 구분한다");
ok(/versionCode\s+(?:195|196)/.test(gradle)&&/versionName\s+"1\.0\.18[23]"/.test(gradle),"Android 버전은 1.0.182 / 195 이상이다");

console.log(`v1.0.182 / 195 personality, dress code and home hydration checks passed: ${checks}`);
