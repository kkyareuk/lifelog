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

const conversationHome={rooms:{living:{name:"거실",furniturePlacements:[{id:"gym-a",item:"운동 매트",x:24,y:58},{id:"gym-b",item:"러닝머신",x:76,y:58}]}}};
const conversationContexts={
  a:{scene:{minute:700,title:"함께 운동하며 대화하는 중",desc:"운동 사이에 이야기를 주고받고 있어요.",room:"living",groupInteraction:true,interactionId:"talk-1"},sceneKey:"talk-a",interactionId:"talk-1",partnerIds:["a","b"],endsAt:start+50*60_000},
  b:{scene:{minute:700,title:"함께 운동하며 대화하는 중",desc:"운동 사이에 이야기를 주고받고 있어요.",room:"living",groupInteraction:true,interactionId:"talk-1"},sceneKey:"talk-b",interactionId:"talk-1",partnerIds:["a","b"],endsAt:start+50*60_000}
};
const approaching=advanceHomeLifeSimulation(conversationHome,["a","b"],conversationContexts,start);
ok(Object.values(approaching.simulation.agents).every(agent=>agent.phase==="walking"&&agent.interactionId==="talk-1"&&agent.approachingInteraction),"대화 상대에게 실제 보행 단계로 접근한다");
ok(Math.hypot(approaching.simulation.agents.a.x-approaching.simulation.agents.b.x,approaching.simulation.agents.a.y-approaching.simulation.agents.b.y)>=10,"대화 자리도 서로를 가리지 않을 최소 간격을 둔다");
ok(approaching.simulation.agents.a.x<approaching.simulation.agents.b.x,"관계 표시 순서의 첫 인물을 실제 좌측 좌표에 둔다");
ok(approaching.simulation.agents.a.fromX!==approaching.simulation.agents.b.fromX||approaching.simulation.agents.a.fromY!==approaching.simulation.agents.b.fromY,"첫 배치부터 두 인물이 같은 지점에 겹치지 않는다");

const splitRoomHome={rooms:{living:{name:"거실",furniturePlacements:[{id:"sofa-split",item:"소파",x:30,y:60}]},study:{name:"서재",furniturePlacements:[{id:"desk-split",item:"컴퓨터",x:68,y:56}]}}};
const splitRoomContexts={
  a:{scene:{minute:700,title:"각자 할 일을 하는 중",room:"living",groupInteraction:true,interactionId:"wrong-room-talk"},sceneKey:"split-a",interactionId:"wrong-room-talk",partnerIds:["a","b"],endsAt:start+50*60_000},
  b:{scene:{minute:700,title:"각자 할 일을 하는 중",room:"study",groupInteraction:true,interactionId:"wrong-room-talk"},sceneKey:"split-b",interactionId:"wrong-room-talk",partnerIds:["a","b"],endsAt:start+50*60_000}
};
const splitRoom=advanceHomeLifeSimulation(splitRoomHome,["a","b"],splitRoomContexts,start);
ok(Object.values(splitRoom.simulation.agents).every(agent=>!agent.interactionId),"서로 다른 방의 인물은 같은 대화 자리로 합쳐지지 않는다");

conversationHome.lifeSimulation=approaching.simulation;
const changedContexts={...conversationContexts,a:{...conversationContexts.a,sceneKey:"talk-a-next",scene:{...conversationContexts.a.scene,title:"운동을 마치고 대화를 이어가는 중"}}};
const midTime=start+Math.round((approaching.simulation.agents.a.arrivesAt-start)/2),continued=advanceHomeLifeSimulation(conversationHome,["a","b"],changedContexts,midTime);
ok(continued.simulation.agents.a.fromX!==approaching.simulation.agents.a.x,"장면이 바뀌어도 이전 목표로 순간이동하지 않고 이동 도중 위치에서 이어 간다");

const empty=advanceHomeLifeSimulation({rooms:{living:{furniturePlacements:[]}}},["a"],{a:"living"},start);
equal(Object.keys(empty.simulation.agents).length,0,"배치한 가구가 없으면 기존 집 장면을 방해하지 않는다");

const normalized=normalizeHomeLifeSimulation({agents:{a:{phase:"broken",roomKey:"missing",x:999,y:-4}},reservations:{}},["living"]);
equal(normalized.agents.a.phase,"waiting","잘못된 행동 단계는 안전하게 복구한다");
equal(normalized.agents.a.roomKey,"living","삭제된 방 위치는 남아 있는 방으로 복구한다");
ok(normalized.agents.a.x<=95&&normalized.agents.a.y>=14,"복원 좌표를 방 안으로 제한한다");

equal(furnitureUseProfile("샤워부스").kind,"shower","샤워기를 씻기 행동으로 분류한다");
equal(furnitureUseProfile("화장대").kind,"groom","화장대는 옷 고르기가 아니라 단장 행동으로 분류한다");
equal(furnitureUseProfile("옷장").kind,"dress","옷 고르기는 옷장 계열 가구에서만 수행한다");
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
ok(gradleSource.includes("versionCode 147")&&gradleSource.includes('versionName "1.0.136"'),"Android 개발 버전을 147 / 1.0.136으로 올렸다");

const [simulationSource,homeSimulationSource]=await Promise.all([
  readFile(new URL("../simulation.js",import.meta.url),"utf8"),
  readFile(new URL("../home-simulation.js",import.meta.url),"utf8")
]);
ok(homeSimulationSource.includes('/TV|홈시어터|프로젝터|빔프로젝터/.test(String(placement.item||""))?4'),"TV 가구는 함께 시청할 수 있도록 여러 자리를 제공한다");
ok(viewsSource.includes("homeTvInteractionMarkup")&&viewsSource.includes("home-tv-reaction")&&viewsSource.includes("같이 TV 보는 중")&&!viewsSource.match(/home-interaction-watch[\s\S]{0,1600}<em aria-hidden="true">📺<\/em>/),"함께 TV를 볼 때 가구와 중복되지 않는 웃음·분노·울음 반응을 렌더링한다");
ok(viewsSource.includes("townTravelersMarkup")&&viewsSource.includes("movementKind===\"jog\""),"조깅 복귀 캐릭터를 마을 이동자로 렌더링한다");
ok(viewsSource.includes("entry?.home&&!entry.transit")&&viewsSource.includes("!scene?.home&&!placeForEntry(scene)"),"복귀 중인 캐릭터는 현관에 세우지 않고 마을 이동 레이어에 둔다");
ok(viewsSource.includes('is-town-conversation')&&viewsSource.includes('town-conversation-bubbles')&&cssSource.includes('@keyframes town-conversation-left'),"마을에서 마주친 두 인물이 마주 보고 대화하는 몸동작을 표시한다");
ok(viewsSource.includes('bubble-edge-left')&&viewsSource.includes('bubble-edge-right')&&cssSource.includes('.place-people.bubble-edge-left .town-conversation-bubbles')&&cssSource.includes('background:transparent!important;background-image:none!important'),"마을 대화 말풍선의 바깥 흰 판을 제거하고 가장자리 잘림을 방지한다");
ok(homeSimulationSource.includes("currentAgentPoint(old,now)")&&homeSimulationSource.includes("approachingInteraction:true"),"대화 상대에게 이동할 때 현재 보간 위치부터 이어 달려가 순간이동을 막는다");
ok(viewsSource.includes("visibleAgentPoint")&&viewsSource.includes("Math.hypot(point.x-current.x,point.y-current.y)<20"),"반려생물은 걷는 사람의 현재 위치까지 피해서 이동한다");
ok(cssSource.includes('.room-pet.home-pet-roaming{position:absolute')&&cssSource.includes('linear var(--pet-roam-delay')&&cssSource.includes('z-index:3')&&cssSource.includes('.home-life-person{--life-edge:52px')&&cssSource.includes('z-index:4'),"반려생물은 transform 기반의 연속 보행으로 움직이며 사람을 가리지 않는다");
ok(simulationSource.includes("returningHome:true")&&simulationSource.includes('movementKind:"jog"')&&simulationSource.includes("집 쪽으로 천천히 이동"),"아침 조깅 복귀를 실제 이동 상태와 일치시킨다");
ok(cssSource.includes("@keyframes town-traveler-route")&&cssSource.includes("transform:translate3d"),"마을 이동 애니메이션은 저발열 transform 경로를 사용한다");
ok(viewsSource.includes('movementClass=e.transit')&&viewsSource.includes('native-scene-moving-badge')&&cssSource.includes('@keyframes native-scene-jog'),"관찰 화면에서도 조깅 복귀가 이동 배지와 실제 움직임으로 표시된다");
ok(cssSource.includes('background:#5c4234')&&cssSource.includes('border:2px solid #5c4234!important')&&!cssSource.includes('box-shadow:inset 0 0 0 999px #0c142122'),"모든 방과 사이 공간을 갈색으로 잇고 방을 톤다운하던 오버레이를 제거한다");
ok(cssSource.includes('.home-interaction-together .home-interaction-avatar:first-of-type')&&cssSource.includes('.home-interaction-together .home-interaction-visual>em'),"일반적인 함께 보내기 장면에도 두 사람의 몸동작과 반응 애니메이션을 표시한다");
ok(homeSimulationSource.includes('anchorX+(index?gap:-gap)'),"관계 표시 순서의 첫 인물을 왼쪽에 고정한다");
ok(homeSimulationSource.includes('HOME_SAFE_BOUNDS={minX:8,maxX:91,minY:23,maxY:84}')&&homeSimulationSource.includes('function safeHomePoint'),"사람과 반려생물의 이동 목표를 상단 메뉴와 화면 최하단 밖의 안전 영역으로 제한한다");
ok(homeSimulationSource.includes('/옷장|행거|옷걸이|의류 수납/')&&homeSimulationSource.includes('scene:/옷을 고르|입을 옷|옷차림|의상을 고르|갈아입/'),"옷 고르기 장면은 화장대가 아니라 옷장 계열 가구에만 연결한다");
ok(homeSimulationSource.includes('contextRooms.size!==1')&&homeSimulationSource.includes('agents.some(agent=>agent.roomKey!==roomKey)'),"다른 방에 있는 인물은 같은 집 상호작용 그룹으로 합쳐지지 않는다");
ok(simulationSource.includes('function visionSideScore')&&simulationSource.includes('[`${side}Vision`]')&&simulationSource.includes('relationshipAwareness')&&simulationSource.includes('willingness'),"마을·집의 자율 상호작용은 좌우 시야와 신뢰·편안함·관계 친밀도를 함께 계산한다");
ok(simulationSource.includes('const relationshipOrder=sharedParticipantOrder')&&simulationSource.includes('if(!scene)return current'),"관계 좌우 순서를 공동 장면까지 보존하고 상호작용 없는 낯선 사람은 각자 행동을 유지한다");
ok(viewsSource.includes('function homeOrderedCharacters')&&viewsSource.includes('homeOrderedCharacters(partners,partners.map(sceneFor))'),"집의 개별·합성 상호작용 렌더링도 관계 좌우 순서를 사용한다");
ok(cssSource.includes(".home-native-header::before")&&cssSource.includes("right:-2px"),"집 상단바가 화면 오른쪽 끝까지 덮인다");
ok(viewsSource.includes('<nav class="home-native-side"')&&viewsSource.includes('homeNativePill(t("집 정보"')&&!viewsSource.includes('</div><button type="button" class="home-native-info-link"'),"집 정보는 SVG와 같은 우측 조합형 버튼열에 둔다");
ok(cssSource.includes('body #app .home-native-context')&&cssSource.includes('-webkit-text-fill-color:#fff!important')&&cssSource.includes('text-align:right'),"일반 주거·층수 문맥을 흰 글씨로 우측 정렬한다");
ok(cssSource.includes('.home-native-page.home-ui-hidden .home-native-ui-toggle')&&cssSource.includes('background-color:transparent!important')&&cssSource.includes('--home-ui-pill-left'),"UI 표시 버튼은 조합형 에셋을 유지하고 바깥 네모만 제거한다");
ok(simulationSource.includes('손톱줄로 부드럽게 다듬었어요')&&!simulationSource.includes('파일로 부드럽게 갈았어요')&&viewsSource.includes('symbol="💅"'),"손톱 정돈은 파일 오인 없이 전용 이모지로 표시한다");
ok(simulationSource.includes('reservedMasculine')&&simulationSource.includes('냉정하고 논리적'),"과묵하고 마초적인 남성 성격에는 손톱 정돈 장면을 배정하지 않는다");
ok(viewsSource.includes('Watching TV together')&&viewsSource.includes('一緒にテレビを見ているところ'),"함께 TV 보기 문구를 영어와 일본어로 제공한다");
ok(viewsSource.includes('Heading home after a morning jog')&&viewsSource.includes('朝のジョギングを終えて帰宅中'),"새 조깅·손톱 장면을 영어와 일본어로 제공한다");

console.log(`home life simulation checks passed: ${checks}`);
