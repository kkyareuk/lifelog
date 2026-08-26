import fs from "node:fs";

const read=file=>fs.readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const views=read("views.js"),app=read("app.js"),css=read("app.css"),state=read("state.js"),simulation=read("simulation.js");
const checks=[
  [views.includes('class="town-native-header"')&&css.includes('.native-app[data-active-tab="town"] .native-sub-header{display:none!important}')&&css.includes('width:83px!important'),"마을 상단바를 집과 같은 나무 조합형 상단바로 단일화"],
  [css.includes('background-size:4% 4%')&&app.includes('Math.round(Math.max(4,Math.min(96'),"촘촘한 1% 스냅 격자 배치"],
  [css.includes('.mobile-town-shell:is(.editing,.building-editing) :is(.person,.town-traveler,.map-character,.mobile-town-character-card){display:none!important}'),"마을 배치·설정 편집 중 주민 숨김"],
  [views.includes('data-town-placement-command="flip"')&&app.includes('command==="flip"')&&app.includes('mapFlipX:!item.mapFlipX')&&!views.includes('data-town-placement-command="rotate"'),"회전 없이 좌우반전 배치 도구"],
  [state.includes('export function addTownDecoration')&&views.includes('data-add-town-decoration')&&simulation.includes('function townDecorationEvent'),"마을 장식 추가·배치·생활 로그 상호작용"],
  [views.includes('HOME_BUILDING_SUBTYPES')&&views.includes('data-home-field="buildingSubtype"')&&views.includes('data-home-bg="${home.id}"'),"집을 마을 건물로 편집하고 세부유형·집 선택 사진 설정"],
  [views.includes('setMobileTownPlacement')&&app.includes('moveTownDecoration(decorationId,x,y,false)')&&views.includes('townPlacementToolbar()'),"건물·집·장식 공통 배치 도구 연결"],
  [views.includes('data-mobile-town-layout-mode')&&views.includes('data-mobile-town-decoration-mode')&&views.includes('data-mobile-building-edit-mode')&&app.includes('setMobileTownBuildingEditing(true)'),"마을 위치·장식·건물 설정 모드 분리"],
  [app.includes('const previousTownPosition=previousTownScroller?')&&app.includes('scroller.scrollLeft=previousTownPosition.left;scroller.scrollTop=previousTownPosition.top')&&!app.includes('if(state.activeTab==="town")centerMobileTownMap();'),"마을 변경 재렌더 뒤 지도 화면 위치 보존"]
];

let failed=0;
for(const [pass,label] of checks){
  console.log(`${pass?"PASS":"FAIL"} ${label}`);
  if(!pass)failed++;
}
if(failed)process.exit(1);
console.log(`\nPASS ${checks.length} town grid editor checks.`);
