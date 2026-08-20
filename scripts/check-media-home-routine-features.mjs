import fs from "node:fs";
import path from "node:path";

const root=path.resolve(import.meta.dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const app=read("app.js"),state=read("state.js"),views=read("views.js"),simulation=read("simulation.js"),media=read("local-media.js"),css=read("app.css");

const checks=[
  [media.includes("return {found:jobs.length,resolved,pending")&&app.includes("refreshLocalMedia")&&app.includes('window.addEventListener("pageshow",restoreForegroundState)'),"앱 복귀 시 기기 사진 복원 재시도"],
  [app.includes("isPendingLocalImage(image.getAttribute")&&css.includes('img[src^="local-media://"]{visibility:hidden}'),"복원 전 내부 사진 참조의 깨진 이미지 차단"],
  [app.includes("Media restore: found")&&app.includes("pending ${lastLocalMediaResult.pending}"),"피드백 진단에 사진 복원 상태 포함"],
  [media.includes("estimatedDataUrlBytes")&&media.includes("cloudCount:cloud.size")&&app.includes("기기 원본 ${usage.count}장")&&app.includes("클라우드 사본 ${cloudCount}장"),"기존 사진과 클라우드 사본을 구분한 저장 공간 집계"],
  [state.includes("floorCount:1,activeFloor:1")&&views.includes('data-home-floor-count')&&views.includes('data-home-floor='),"집 층수 및 층별 방 화면"],
  [state.includes("room.layout={x:")&&app.includes("captureRoomCanvasLayouts")&&app.includes("bindRoomGeometryHandle"),"방 위치·모서리 크기 직접 조절 저장"],
  [views.includes('data-room-resize=')&&css.includes(".room-resize-handle"),"방 크기 조절 손잡이"],
  [state.includes('imageFit:"cover"')&&views.includes('room.imageFit==="contain"?"contain":"cover"')&&css.includes("var(--room-image-fit,cover)"),"방 사진 기본 채우기와 선택적 전체 보기"],
  [state.includes("export function updateRoutineDays")&&app.includes('name="day"')&&app.includes("여러 개 선택 가능")&&app.includes('data-routine-day-preset="weekdays"'),"주간 일정 여러 요일과 평일·주말·매일 빠른 선택"],
  [state.includes("monthlyRoutines:{}")&&app.includes("newMonthlyRoutineDraft")&&views.includes('class="monthly-calendar"')&&views.includes('data-routine-view="monthly"'),"주간·월간 일정 분리와 날짜별 월간 일정"],
  [app.includes('openRoutineDialog("",newRoutineDraft())')&&app.includes('openMonthlyRoutineDialog("",newMonthlyRoutineDraft())'),"일정 추가 취소 시 저장되지 않는 초안 흐름"],
  [media.includes("remoteById")&&media.includes("String(item.id)"),"차량 순서가 달라도 ID로 기기 사진 보존"],
  [views.includes("peopleDirection")&&views.includes("is-horizontal")&&css.includes(".room-people.is-horizontal"),"방 가로세로 비율에 맞춘 인물 배치"],
  [state.includes("anniversaries:[]")&&views.includes("calendar-special birthday")&&views.includes("data-add-anniversary"),"월간 달력 생일·기념일 표시"],
  [views.includes("nativeSceneActionProp")&&views.includes("native-person-action-prop")&&css.includes(".home-person .native-person-action-prop"),"집 화면 생활 행동 소품과 애니메이션"],
  [views.includes('class="home-person-visual"')&&views.includes('--home-float-delay:')&&css.includes("@keyframes home-person-float"),"집 캐릭터 둥둥 애니메이션 전용 시각 레이어"],
  [css.includes(".home-person .native-person-action-prop{position:absolute")&&css.includes("right:-8px;top:-5px")&&views.includes('</span><span class="home-person-status">'),"행동 소품과 이름·상태표 레이어 분리"],
  [app.includes('$$("[data-home-resident]")')&&app.includes('renderPreservingPageScroll(el)')&&app.includes('if(el.tagName==="SELECT")el.onchange=apply;else el.oninput=apply')&&app.includes('const homeContext=')&&app.includes('townPanelPosition=townPanel'),"구성원 변경은 열린 패널·스크롤을 복원하고 주거지 선택은 전체 재렌더하지 않음"],
  [views.includes('value="__none__"')&&state.includes('item.sleepRoomId==="__none__"?"__none__"')&&read("simulation.js").includes('usableSleepRoom'),"출근용 집의 기타·없음 숙박 선택 저장과 생활 장면 안전 처리"],
  [state.includes('previousSchema<22&&room.image?"cover"'),"기존 집 사진의 회색 여백을 한 번 교정"]
  ,[state.includes('visitHomeId:x.homes?.[r.visitHomeId]')&&app.includes('value="home:${esc(home.id)}"')&&app.includes("routineDestinationPatch")&&views.includes("destinationLabel(item)"),"주간·월간 일정에서 캐릭터별 집을 방문 목적지로 저장·표시"]
  ,[simulation.includes("visitHome=state.homes?.[item.visitHomeId]")&&simulation.includes("visitHomeId:visitHome.id")&&simulation.includes("next?.visitHomeId"),"캐릭터 집 방문 일정과 일정 종료 후 귀가 시뮬레이션"]
  ,[simulation.includes("export function forceCharactersHome")&&simulation.includes("function forcedHomeEventFor")&&app.includes('[data-force-home]')&&views.includes('data-force-home="all"'),"선택 캐릭터·전체 즉시 귀환과 다음 일정 자동 재개"]
  ,[state.includes('item.visitHomeId===homeId?{...item,visitHomeId:""}')&&state.includes("forcedHomeReturn={day:String"),"삭제된 집 목적지와 귀환 상태 데이터 정규화"]
];

const failed=checks.filter(([ok])=>!ok);
checks.forEach(([ok,label])=>console.log(`${ok?"PASS":"FAIL"} ${label}`));
if(failed.length)process.exit(1);
console.log(`\nPASS ${checks.length} media, home, and routine feature checks.`);
