import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {
  advanceHomeLifeSimulation,furnitureUseProfile,homeActivityDurationMinutes,homeLifeNextDelay,homeLifePresentation,normalizeHomeLifeSimulation
} from "../home-simulation.js";

let checks=0;
const ok=(condition,message)=>{assert.ok(condition,message);checks+=1};
const equal=(actual,expected,message)=>{assert.equal(actual,expected,message);checks+=1};

const home={rooms:{
  living:{name:"거실",furniturePlacements:[{id:"sofa-1",item:"소파",x:26,y:68}]},
  study:{name:"서재",furniturePlacements:[{id:"desk-1",item:"컴퓨터",x:72,y:54}]}
}};
const start=1_800_000_000_000;
const contexts={a:{scene:{minute:600,title:"소파에서 쉬는 중",room:"living"},sceneKey:"a-rest",startedAt:start,endsAt:start+45*60_000},b:{scene:{minute:600,title:"컴퓨터로 파일을 정리하는 중",room:"study"},sceneKey:"b-study",startedAt:start,endsAt:start+60*60_000}};
const first=advanceHomeLifeSimulation(home,["a","b"],contexts,start);
equal(Object.keys(first.simulation.agents).length,2,"두 캐릭터의 생활 상태를 만든다");
equal(new Set(Object.values(first.simulation.agents).map(agent=>agent.furnitureId)).size,2,"두 캐릭터가 서로 다른 가구를 예약한다");
ok(Object.values(first.simulation.agents).every(agent=>agent.phase==="walking"),"첫 행동은 가구로 걸어가는 단계다");
equal(Object.keys(first.simulation.reservations).length,2,"이동을 시작할 때부터 가구를 예약한다");

const walkingEnds=Math.max(...Object.values(first.simulation.agents).map(agent=>agent.arrivesAt));
home.lifeSimulation=first.simulation;
const arrived=advanceHomeLifeSimulation(home,["a","b"],contexts,walkingEnds+1);
ok(Object.values(arrived.simulation.agents).every(agent=>agent.phase==="using"),"도착한 뒤 가구 사용 단계로 전환한다");
ok(Object.values(arrived.simulation.agents).every(agent=>agent.fromRoomKey===agent.roomKey),"도착하면 출발 방을 현재 방으로 확정한다");
ok(Object.values(arrived.simulation.agents).some(agent=>agent.actionKind==="rest"),"소파는 휴식 행동으로 연결된다");
ok(Object.values(arrived.simulation.agents).some(agent=>agent.actionKind==="study"),"컴퓨터는 집중 행동으로 연결된다");

home.rooms.study.furniturePlacements.push({id:"desk-2",item:"컴퓨터",x:36,y:62});
home.lifeSimulation=arrived.simulation;
const crossRoomContexts={...contexts,a:{scene:{minute:650,title:"컴퓨터로 자료를 살펴보는 중",room:"study"},sceneKey:"a-cross-room",startedAt:walkingEnds+1,endsAt:walkingEnds+46*60_000}};
const crossing=advanceHomeLifeSimulation(home,["a","b"],crossRoomContexts,walkingEnds+2);
equal(crossing.simulation.agents.a.fromRoomKey,"living","다른 방으로 걸을 때 출발 방을 보존한다");
equal(crossing.simulation.agents.a.roomKey,"study","방 사이 이동의 도착 방을 별도로 보존한다");
equal(crossing.simulation.agents.a.phase,"walking","방 사이 이동을 순간이동하지 않고 걷기 단계로 유지한다");

const oneSeat={rooms:{living:{name:"거실",furniturePlacements:[{id:"only-sofa",item:"소파",x:50,y:65}]}}};
const sharedContext={a:{scene:{minute:600,title:"소파에서 쉬는 중",room:"living"},sceneKey:"a-seat",endsAt:start+40*60_000},b:{scene:{minute:600,title:"소파에서 쉬는 중",room:"living"},sceneKey:"b-seat",endsAt:start+40*60_000}};
const conflict=advanceHomeLifeSimulation(oneSeat,["a","b"],sharedContext,start);
equal(Object.values(conflict.simulation.agents).filter(agent=>agent.phase==="walking").length,1,"한 자리에는 한 캐릭터만 이동한다");
equal(Object.values(conflict.simulation.agents).filter(agent=>!agent.furnitureId).length,1,"남은 캐릭터는 같은 가구를 중복 점유하지 않는다");
equal(Object.keys(conflict.simulation.reservations).length,1,"예약표에도 한 사용자만 남는다");

const empty=advanceHomeLifeSimulation({rooms:{living:{furniturePlacements:[]}}},["a"],{a:"living"},start);
equal(Object.keys(empty.simulation.agents).length,0,"배치한 가구가 없으면 기존 집 장면을 방해하지 않는다");

const normalized=normalizeHomeLifeSimulation({agents:{a:{phase:"broken",roomKey:"missing",x:999,y:-4}},reservations:{}},["living"]);
equal(normalized.agents.a.phase,"waiting","잘못된 행동 단계는 안전하게 복구한다");
equal(normalized.agents.a.roomKey,"living","삭제된 방 위치는 남아 있는 방으로 복구한다");
ok(normalized.agents.a.x<=95&&normalized.agents.a.y>=14,"복원 좌표를 방 안으로 제한한다");

equal(furnitureUseProfile("샤워부스").kind,"shower","샤워기를 씻기 행동으로 분류한다");
ok(homeActivityDurationMinutes("샤워부스","a")>=10&&homeActivityDurationMinutes("샤워부스","a")<=20,"샤워는 10~20분 범위를 사용한다");
ok(homeActivityDurationMinutes("TV","a")>=30,"TV 시청은 최소 30분을 사용한다");
const english=homeLifePresentation({phase:"using",actionKind:"shower"},{roomName:"Bathroom",furnitureName:"Shower",locale:"en"});
const japanese=homeLifePresentation({phase:"waiting"},{locale:"ja"});
ok(english.title.includes("Shower")&&!english.title.includes("씻"),"영어 행동 문구를 제공한다");
ok(japanese.title.includes("家具"),"일본어 대기 문구를 제공한다");
ok(homeLifeNextDelay(first.simulation,start)>=800,"화면 갱신 간격에 최소 제한을 둔다");

const [stateSource,viewsSource,appSource,cssSource,gradleSource]=await Promise.all([
  readFile(new URL("../state.js",import.meta.url),"utf8"),readFile(new URL("../views.js",import.meta.url),"utf8"),readFile(new URL("../app.js",import.meta.url),"utf8"),readFile(new URL("../app.css",import.meta.url),"utf8"),readFile(new URL("../android/app/build.gradle",import.meta.url),"utf8")
]);
ok(stateSource.includes("h.lifeSimulation=normalizeHomeLifeSimulation"),"동기화·불러오기 때 생활 상태를 정규화한다");
ok(stateSource.includes("advanceHomeLifeSimulation(homeId"),"상태 저장 계층에 생활 진행 함수를 둔다");
ok(viewsSource.includes("homeLifePersonMarkup")&&viewsSource.includes("has-home-life"),"방 안 좌표에 생활 캐릭터를 렌더링한다");
ok(appSource.includes("scheduleHomeLifeRefresh")&&appSource.includes('document.visibilityState==="hidden"'),"화면이 보일 때만 저빈도 갱신을 예약한다");
ok(cssSource.includes("@keyframes home-life-walk")&&cssSource.includes("prefers-reduced-motion"),"걷기와 모션 감소 환경을 모두 지원한다");
ok(gradleSource.includes("versionCode 126")&&gradleSource.includes('versionName "1.0.115"'),"Android 버전을 126으로 올렸다");

console.log(`home life simulation checks passed: ${checks}`);
