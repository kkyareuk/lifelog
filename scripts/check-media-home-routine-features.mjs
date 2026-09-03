import fs from "node:fs";
import path from "node:path";

const root=path.resolve(import.meta.dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const app=read("app.js"),state=read("state.js"),views=read("views.js"),simulation=read("simulation.js"),media=read("local-media.js"),css=read("app.css");
const {normalizeRoomLayout}=await import("../room-layout.js");
const {furnitureCapacity,furnitureFootprint,furnitureGridForRoom,newFurniturePlacement,newFurnitureProp,normalizeFurniturePlacement,normalizeFurniturePlacements,snapFurniturePosition,supportsFurnitureProps}=await import("../furniture-layout.js");
const smallRoom={x:83.3333333333,y:87.5,w:16.6666666667,h:12.5};
const normalizedOnce=normalizeRoomLayout(smallRoom),normalizedRepeated=normalizeRoomLayout(normalizedOnce);
const restartLayouts=Array.from({length:20}).reduce(layout=>normalizeRoomLayout(layout),smallRoom);

const checks=[
  [media.includes("return {found,resolved,pending")&&media.includes("let found=0")&&app.includes("refreshLocalMedia")&&app.includes('window.addEventListener("pageshow",restoreForegroundState)'),"앱 복귀 시 실제 기기 사진 참조만 복원·재렌더"],
  [app.includes("isPendingLocalImage(image.getAttribute")&&css.includes('img[src^="local-media://"]{visibility:hidden}'),"복원 전 내부 사진 참조의 깨진 이미지 차단"],
  [app.includes("Media restore: found")&&app.includes("pending ${lastLocalMediaResult.pending}"),"피드백 진단에 사진 복원 상태 포함"],
  [media.includes("estimatedDataUrlBytes")&&media.includes("cloudCount:cloud.size")&&app.includes("기기 원본 ${usage.count}장")&&app.includes("클라우드 사본 ${cloudCount}장"),"기존 사진과 클라우드 사본을 구분한 저장 공간 집계"],
  [state.includes("floorCount:1,activeFloor:1")&&views.includes('data-home-floor-count')&&views.includes('data-home-floor='),"집 층수 및 층별 방 화면"],
  [state.includes("normalizeRoomLayout(room.layout)")&&app.includes("captureRoomCanvasLayouts")&&app.includes("bindRoomGeometryHandle"),"방 위치·모서리 크기 직접 조절 저장"],
  [state.includes("export function addFurniturePlacement")&&state.includes("export function updateFurniturePlacement")&&state.includes("export function deleteFurniturePlacement")&&app.includes("bindFurniturePlacementEditors")&&views.includes('data-furniture-placement=')&&css.includes(".furniture-edit-toolbar"),"방 안 가구 추가·이동·크기·회전·앞뒤·삭제 편집"],
  [normalizeFurniturePlacements([newFurniturePlacement("chair-1","의자",0),newFurniturePlacement("chair-1","의자",1)]).length===1&&normalizeFurniturePlacement({id:"edge",item:"침대",x:999,y:-20,scale:9,rotation:390,layer:99}).x===99.5,"가구 좌표·크기·회전·중복 ID 정규화"],
  [JSON.stringify(furnitureGridForRoom({width:200,height:160},{width:600,height:640}))===JSON.stringify({columns:4,rows:4})&&snapFurniturePosition(88,12,{columns:4,rows:4}).x===87.5,"기존 12×16 집 격자를 방 크기에 맞춘 가구 스냅"],
  [supportsFurnitureProps("향수 선반")&&!supportsFurnitureProps("침대")&&normalizeFurniturePlacement({id:"shelf",item:"선반",x:50,y:50,props:[newFurnitureProp("p1","화분",0)]}).props[0].item==="화분"&&state.includes("export function addFurnitureProp")&&app.includes("openFurniturePropsDialog"),"선반·책상류 위 최대 4개 소품 배치와 저장"],
  [furnitureCapacity("침대")===1&&furnitureCapacity("커플 침대")===2&&normalizeFurniturePlacement({id:"couple",item:"커플 침대",assignedCharacterIds:["a","b","c"]}).assignedCharacterIds.length===2&&state.includes("export function assignFurnitureBed"),"일반 침대 1명·커플 침대 2명 지정과 중복 제한"],
  [JSON.stringify(furnitureFootprint("커플 침대"))===JSON.stringify({columns:2,rows:2})&&newFurniturePlacement("couple","커플 침대",0).x===25&&views.includes('data-furniture-columns="${footprint.columns}"')&&css.includes('var(--furniture-grid-width,1)'),"커플 침대를 기존 배치까지 2×2 격자 크기로 표시"],
  [app.includes("openFurniturePlacementDialog")&&views.includes('data-open-furniture-layout=')&&!app.includes('class="room-editor-furniture-wrap"'),"방 설정과 분리된 독립 가구 배치 UI"],
  [views.includes("const scene=event;")&&app.includes("const sceneKey=")&&app.includes("timeline(character,now)"),"집·관찰·생활 로그가 동일한 장면 타임라인을 사용"],
  [views.includes('<span class="home-person-status"><b>${esc(character.name)}</b><small>${esc(activity)}</small>')&&app.includes("home-occupant-recent"),"집 캐릭터 카드에 이름·현재 행동을 표시하고 클릭 시 상태·최근 로그 시트 제공"],
  [views.includes("room-furniture-props")&&views.includes("--furniture-grid-cols")&&css.includes(".home.is-editing .room-furniture-layer::before"),"편집 중 방 칸 그리드와 가구에 붙는 소품 표시"],
  [JSON.stringify(normalizedOnce)===JSON.stringify(normalizedRepeated)&&JSON.stringify(normalizedOnce)===JSON.stringify(restartLayouts)&&normalizedOnce.h===12.5&&app.includes('room.style.getPropertyValue("--mobile-room-h")')&&!app.includes("rect.height/box.height*100"),"앱을 반복 재시작해도 테두리 픽셀과 무관하게 방 크기 보존"],
  [views.includes('data-room-resize=')&&css.includes(".room-resize-handle"),"방 크기 조절 손잡이"],
  [state.includes('floorMaterial:"cream"')&&state.includes('wallMaterial:"same"')&&state.includes('mode==="customTile"?"customTile":"custom"')&&views.includes('fullRoomIllustration=floorMaterial==="custom"')&&views.includes('room-custom-tile')&&views.includes('room-custom-floor')&&css.includes('.room.room-custom-floor .room-wall-shell::before{display:none!important')&&app.includes('pickImage(mode==="customTile"?"roomFloor":"roomScene"')&&app.includes('if(type==="roomScene")return prepareLargeArt(file)'),"반복 바닥 타일과 자르지 않는 방 전체 그림을 분리하고 전체 그림에서만 벽면을 숨김"],
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
  ,[state.includes('visitHomeId:x.homes?.[r.visitHomeId]')&&app.includes('value="home:${htmlEsc(home.id)}"')&&app.includes("routineDestinationPatch")&&views.includes("destinationLabel(item)"),"주간·월간 일정에서 캐릭터별 집을 방문 목적지로 저장·표시"]
  ,[simulation.includes("scheduledHome=state.homes?.[item.visitHomeId]")&&simulation.includes("visitHomeId:visitHome.id")&&simulation.includes("next?.visitHomeId"),"캐릭터 집 방문 일정과 일정 종료 후 귀가 시뮬레이션"]
  ,[simulation.includes("export function forceCharactersHome")&&simulation.includes("function forcedHomeEventFor")&&app.includes('[data-force-home]')&&views.includes('data-force-home="all"'),"선택 캐릭터·전체 즉시 귀환과 다음 일정 자동 재개"]
  ,[state.includes('item.visitHomeId===homeId?{...item,visitHomeId:""}')&&state.includes("forcedHomeReturn={day:String"),"삭제된 집 목적지와 귀환 상태 데이터 정규화"]
  ,[views.includes('data-home-native-hud')&&views.includes('data-home-switcher-toggle')&&views.includes('data-home-ui-toggle')&&views.includes('data-open-home-feature="house-info"'),"첨부 시안 기반 집 HUD와 집 이동·정보·UI 숨김 조작부"]
  ,[css.includes('top:78px;bottom:0')&&css.includes('--home-ui-pill-left')&&css.includes('--home-ui-pill-middle')&&css.includes('--home-ui-pill-right'),"수정 SVG의 78px 상단바 아래 집 장면 고정과 3조각 버튼 조합"]
  ,[app.includes('[data-home-switcher-toggle]')&&app.includes('[data-home-ui-toggle]')&&app.includes('toggleHomeUi')&&app.includes('lastTapAt<330'),"집 선택 팝업과 버튼·화면 두 번 탭 UI 숨김·복원"]
  ,[views.includes('"집 이동":"Switch home"')&&views.includes('"집 이동":"家を移動"')&&views.includes('"반려생물":"Pets"')&&views.includes('"반려생물":"ペット"'),"새 집 HUD 영어·일본어 번역"]
  ,[views.includes('class="home-native-house-icon"')&&views.includes('class="home-native-house-name"')&&views.includes('${esc(h.name||t("이름 없는 집"'),"상단에 캐릭터가 아닌 집 아이콘과 집 이름 표시"]
  ,[views.includes('class="home-native-meta"')&&views.includes('class="home-native-context"')&&css.includes('background:none!important')&&css.includes('-webkit-text-stroke:.85px #17110d'),"집 제목을 수정 SVG 위치의 배경 없는 흰 글자·검은 외곽선으로 표시"]
  ,[views.includes("homeLifeInteractionMarkup")&&views.includes('class="home-interaction-avatar')&&views.includes('data-character-id="${esc(character.id)}"')&&css.includes("@keyframes home-interaction-kiss-left"),"상호작용 중에도 두 구성원을 각각 눌러 개인 로그를 열 수 있음"]
  ,[css.includes("home-edit-toolbar:not(.home-native-edit-tools)")&&css.includes("grid-template-columns:repeat(4,82px)"),"집 편집 세부 도구를 기본 우측 메뉴와 분리"]
  ,[views.includes("coupleBedSlots")&&views.includes("bedSlot===0?-22")&&views.includes("bedSlot===0?-10")&&css.includes(".home-life-person.is-couple-bed-user"),"커플 침대의 두 사용자를 서로 다른 2×2 칸에 배치"]
  ,[views.includes('"뽀뽀하는 중":"Kissing"')&&views.includes('"뽀뽀하는 중":"キスしているところ"'),"구성원 상호작용 카드 영어·일본어 번역"]
  ,[views.includes('class="home-native-house-name" data-home-switcher-toggle')&&views.includes("homeExteriorSource(h)")&&!views.includes('home-native-switcher-button'),"집 이름 자체로 집 이동 메뉴를 열고 집 외형 아이콘 표시"]
  ,[views.includes('class="home-native-context"')&&views.includes('class="home-native-elevator"')&&views.includes('floorCount>1?')&&app.includes('[data-home-floor-step]'),"한 층 집은 층수를 제목 문맥에만 표시하고 다층 집에만 엘리베이터 제공"]
  ,[css.includes('.home-native-page.home-ui-hidden :is(.home-native-switcher,.home-native-side,.home-native-elevator,.home-native-edit-tools)')&&!css.includes('.home-native-page.home-ui-hidden :is(.home-native-header'),"UI 숨김 후에도 상단바 유지"]
  ,[css.includes('.home-native-side{position:absolute;z-index:8;right:8px;top:85px')&&css.includes('.home-native-side .home-native-pill{--home-pill-height:32px')&&css.includes('.home-native-ui-toggle{--home-pill-height:32px;left:7px'),"수정 SVG 기준 우측 메뉴와 UI 숨김 버튼 크기·위치"]
  ,[css.includes('html:not(.native-app) .room-heading.room-title-dark')&&css.includes('.room-heading .room-edit-hint{color:#fff!important;-webkit-text-fill-color:#fff!important'),"집 방 이름과 층·격자 편집 문구를 흰색으로 고정"]
  ,[views.includes('--life-dx:${fromX-x}cqw')&&views.includes('class="home-life-roaming-layer"')&&views.includes('agent.fromRoomKey')&&css.includes('@keyframes home-life-walk{from{transform:translate')&&!css.includes('@keyframes home-life-walk{from{left:'),"캐릭터가 방 경계 위에서 잘리지 않고 transform으로 방 사이를 걸음"]
  ,[views.includes('class="room-pet home-pet-roaming')&&views.includes('motion.sleeping?"is-sleeping"')&&css.includes('linear var(--pet-roam-delay')&&css.includes('.home-pet-roaming.is-sleeping{animation:none!important'),"반려생물의 자연스러운 저발열 transform 이동과 수면 중 완전 정지"]
  ,[views.includes('home-person-chat-bubble')&&css.includes('@keyframes home-talk-bubble')&&views.includes('conversation-slot-${Number(options.slot)||1}'),"각자 활동 중 대화 말풍선과 안정된 좌우 배치"]
  ,[app.includes('data-home-room-hold')&&app.includes('setTimeout(()=>')&&app.includes('openRoomEditor(homeId,roomKey)')&&app.includes('},560)'),"방을 길게 눌러 바로 방 편집 열기"]
  ,[css.includes('@keyframes home-activity-watch')&&css.includes('@keyframes home-activity-cook')&&css.includes('@keyframes home-activity-rhythm'),"행동 종류별 생활 애니메이션 다양화"]
  ,[css.includes('background:#fffdf9c9!important')&&css.includes('max-height:min(210px,30dvh)')&&css.includes('.home-occupant-popover h2{font-size:14px!important'),"캐릭터 정보창을 작고 반투명한 하단 시트로 조정"]
  ,[views.includes('floorUp:"Go up one floor"')&&views.includes('floorUp:"一つ上の階へ"')&&views.includes('floorLabel:n=>`F${n}`')&&views.includes('floorLabel:n=>`${n}階`'),"층 이동 영어·일본어 번역"]
  ,[css.includes('.room{isolation:auto}.room:hover,.room:focus-within{z-index:auto}')&&views.includes('room-has-occupants'),"방 클릭·포커스가 방 전체를 인물 위로 올리지 않음"]
  ,[views.includes('walkStyleClassFor')&&views.includes('walk-style-striding')&&css.includes('@keyframes home-life-careful-step')&&css.includes('@keyframes home-life-light-step'),"걸음걸이 설정을 집·관찰 이동 속도와 보폭 애니메이션에 반영"]
  ,[simulation.includes("MULTILINGUAL_HOME_ACTIVITY_POOL")&&simulation.includes("localizedHomeActivities")&&simulation.includes("recentDayKeys")&&simulation.includes("slice(-3)"),"세 언어 집 활동을 보강하고 최근 3일 같은 행동 반복을 억제"]
  ,[views.includes('data-home-building-shape="${home.id}"')&&views.includes('townBuildingBrowser(character)')&&views.includes('data-building-browser-open')&&views.includes('townBuildingDetailScreen'),"마을 건물 정보 목록에서 집·일반 건물 상세 편집 진입 제공"]
  ,[app.includes("function bindTownBuildingHold()")&&app.includes("편집 모드는 상단의 명시적인 버튼으로만 연다")&&views.includes('data-mobile-building-edit-mode')&&views.includes('data-mobile-town-decoration-mode'),"우발적인 길게 누르기 대신 상단 건물 정보·편집모드로만 진입"]
  ,[views.includes('"집 외형 바꾸기":"Change home exterior"')&&views.includes('"집 외형 바꾸기":"家の外観を変更"')&&views.includes('"이 건물 편집하기":"Edit this building"')&&views.includes('"이 건물 편집하기":"この建物を編集"'),"마을 건물 편집 기능 영어·일본어 번역"]
];

const failed=checks.filter(([ok])=>!ok);
checks.forEach(([ok,label])=>console.log(`${ok?"PASS":"FAIL"} ${label}`));
if(failed.length)process.exit(1);
console.log(`\nPASS ${checks.length} media, home, and routine feature checks.`);
