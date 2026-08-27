import fs from "node:fs";

const read=file=>fs.readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const views=read("views.js"),app=read("app.js"),css=read("app.css"),state=read("state.js"),simulation=read("simulation.js");
const checks=[
  [views.includes('class="town-native-header"')&&views.includes('class="town-native-title" data-open-town-switcher')&&views.includes('class="town-native-status"')&&views.includes('homeUiAsset(character||active(),"town.png")')&&css.includes('.native-app[data-active-tab="town"] .native-sub-header{display:none!important}')&&css.includes('var(--home-ui-pill-middle)'),"마을 상단바의 아이콘·마을명·현재/거주 인원 표시와 마을 이동 연결"],
  [css.includes('background-size:4% 4%')&&app.includes('Math.round(Math.max(4,Math.min(96'),"촘촘한 1% 스냅 격자 배치"],
  [css.includes('.mobile-town-shell:is(.town-editing,.buildings-editing,.decorations-editing) :is(.person,.town-traveler,.map-character'),"마을 정보·건물·장식 편집 중 주민 숨김"],
  [views.includes('data-town-placement-command="flip"')&&app.includes('command==="flip"')&&app.includes('mapFlipX:!item.mapFlipX')&&!views.includes('data-town-placement-command="rotate"'),"회전 없이 좌우반전 배치 도구"],
  [state.includes('export function addTownDecoration')&&views.includes('data-add-town-decoration')&&simulation.includes('function townDecorationEvent'),"마을 장식 추가·배치·생활 로그 상호작용"],
  [views.includes('HOME_BUILDING_SUBTYPES')&&views.includes('data-home-field="buildingSubtype"')&&views.includes('data-home-bg="${home.id}"'),"집을 마을 건물로 편집하고 세부유형·집 선택 사진 설정"],
  [views.includes('setMobileTownPlacement')&&app.includes('moveTownDecoration(decorationId,x,y,false)')&&views.includes('townPlacementToolbar()'),"건물·집·장식 공통 배치 도구 연결"],
  [views.includes('data-mobile-town-layout-mode')&&views.includes('data-mobile-town-decoration-mode')&&views.includes('data-mobile-building-edit-mode')&&views.includes('t("건물 정보","건물 정보")')&&views.includes('t("편집완료","편집완료")')&&app.includes('setMobileTownMode("town")')&&app.includes('currentTownMode()==="decorations"?"":"decorations"')&&app.includes('setMobileTownMode("buildings")'),"마을 정보·건물 정보·통합 편집모드 메뉴"],
  [app.includes('mode==="decorations"?Boolean(el.dataset.place||el.dataset.homeMap||el.dataset.townDecoration)')&&css.includes('.decorations-editing .town-map-scroll :is([data-place],[data-home-map],[data-town-decoration]){pointer-events:auto'),"편집모드에서 건물·집·장식을 함께 이동"],
  [views.includes('townBuildingBrowser(character)')&&views.includes('data-building-browser-card')&&views.includes('data-building-browser-open')&&views.includes('townBuildingDetailScreen')&&app.includes('data-building-browser-back'),"외형 아이콘 기반 건물 목록과 별도 상세 정보 편집 화면"],
  [views.includes('data-decoration-search')&&views.includes('data-decoration-category')&&css.includes('.town-decoration-results{display:flex'),"통합 편집모드의 하단형 장식 검색·카테고리·가로 목록"],
  [views.includes('data-world-urbanization')&&views.includes('data-world-reputation')&&views.includes('data-town-photo')&&views.includes('data-world-description'),"마을 편집을 이름·도시화·사진·평판 정보 편집으로 구성"],
  [css.includes('@media(min-width:721px) and (orientation:landscape)')&&css.includes('html.native-app[data-active-tab="town"] .mobile-town-shell{position:fixed!important')&&css.includes('html.native-app[data-active-tab="home"] .home-native-tablet-info')&&css.includes('width:32%!important'),"태블릿 가로 집·마을을 화면 전체 고정 좌표계로 분리"],
  [app.includes('const previousTownPosition=previousTownScroller?')&&app.includes('scroller.scrollLeft=previousTownPosition.left;scroller.scrollTop=previousTownPosition.top')&&!app.includes('if(state.activeTab==="town")centerMobileTownMap();'),"마을 변경 재렌더 뒤 지도 화면 위치 보존"]
  ,[views.includes('"현재 {current}명 · 거주 {resident}명":"{current} here · {resident} residents"')&&views.includes('"현재 {current}명 · 거주 {resident}명":"現在{current}人・居住{resident}人"'),"상단 인원 및 새 메뉴 영어·일본어 번역"]
];

let failed=0;
for(const [pass,label] of checks){
  console.log(`${pass?"PASS":"FAIL"} ${label}`);
  if(!pass)failed++;
}
if(failed)process.exit(1);
console.log(`\nPASS ${checks.length} town grid editor checks.`);
