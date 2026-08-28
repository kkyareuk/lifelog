import fs from "node:fs";

const read=file=>fs.readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const views=read("views.js"),app=read("app.js"),css=read("app.css"),townFit=read("town-fit.css"),interfaceCss=read("interface-system.css"),state=read("state.js"),simulation=read("simulation.js");
const checks=[
  [views.includes('class="town-native-header"')&&views.includes('class="town-native-title" data-open-town-switcher')&&views.includes('class="town-native-status"')&&views.includes('homeUiAsset(character||active(),"town.png")')&&css.includes('.native-app[data-active-tab="town"] .native-sub-header{display:none!important}')&&css.includes('var(--home-ui-pill-middle)'),"마을 상단바의 아이콘·마을명·현재/거주 인원 표시와 마을 이동 연결"],
  [css.includes('background-size:4% 4%')&&app.includes('Math.round(Math.max(4,Math.min(96'),"촘촘한 1% 스냅 격자 배치"],
  [css.includes('.mobile-town-shell:is(.town-editing,.buildings-editing,.decorations-editing) :is(.person,.town-traveler,.map-character'),"마을 정보·건물·장식 편집 중 주민 숨김"],
  [views.includes('data-town-placement-command="flip"')&&app.includes('command==="flip"')&&app.includes('mapFlipX:!item.mapFlipX')&&!views.includes('data-town-placement-command="rotate"'),"회전 없이 좌우반전 배치 도구"],
  [state.includes('export function addTownDecoration')&&views.includes('data-add-town-decoration')&&simulation.includes('function townDecorationEvent'),"마을 장식 추가·배치·생활 로그 상호작용"],
  [views.includes('HOME_BUILDING_SUBTYPES')&&views.includes('data-home-field="buildingSubtype"')&&views.includes('data-home-building-shape="${home.id}"')&&views.includes('data-home-interior-image="${home.id}"'),"집을 일반 건물과 같은 정보 화면에서 세부유형·외형·내부 사진 편집"],
  [views.includes('setMobileTownPlacement')&&app.includes('moveTownDecoration(decorationId,x,y,false)')&&views.includes('townPlacementToolbar()'),"건물·집·장식 공통 배치 도구 연결"],
  [views.includes('data-mobile-town-layout-mode')&&views.includes('data-mobile-town-decoration-mode')&&views.includes('data-mobile-building-edit-mode')&&views.includes('t("건물 정보","건물 정보")')&&views.includes('t("편집완료","편집완료")')&&app.includes('setMobileTownMode("town")')&&app.includes('currentTownMode()==="decorations"?"":"decorations"')&&app.includes('setMobileTownMode("buildings")'),"마을 정보·건물 정보·통합 편집모드 메뉴"],
  [app.includes('mode==="decorations"?Boolean(el.dataset.place||el.dataset.homeMap||el.dataset.townDecoration)')&&css.includes('.decorations-editing .town-map-scroll :is([data-place],[data-home-map],[data-town-decoration]){pointer-events:auto'),"편집모드에서 건물·집·장식을 함께 이동"],
  [views.includes('townBuildingBrowser(character)')&&views.includes('data-building-browser-card')&&views.includes('data-building-browser-open')&&views.includes('townBuildingDetailScreen')&&app.includes('data-building-browser-back'),"외형 아이콘 기반 건물 목록과 별도 상세 정보 편집 화면"],
  [views.includes('data-toggle-decoration-catalog')&&views.includes('t("모든 테마 보기","모든 테마 보기")')&&views.includes('data-decoration-category')&&css.includes('.town-decoration-theme-row')&&css.includes('.town-decoration-results{display:flex')&&css.includes('.town-decoration-results button[hidden]{display:none!important}'),"시안형 모든 테마·카테고리·가로 목록과 실제 분류 필터"],
  [views.includes('class="town-information-screen"')&&views.includes('class="town-information-hero"')&&views.includes('data-world-town-type')&&views.includes('data-world-town-subtype')&&views.includes('data-world-density')&&views.includes('data-world-urbanization')&&views.includes('data-world-reputation')&&views.includes('data-world-size')&&views.includes('data-world-terrain')&&views.includes('data-town-illustration-open')&&views.includes('data-world-description'),"마을 정보 전용 화면에서 유형·세부유형·도시화·평판·규모·지형·게임 일러스트 편집"],
  [css.includes('@media(min-width:721px) and (orientation:landscape)')&&css.includes('html.native-app[data-active-tab="town"] .mobile-town-shell{position:fixed!important')&&css.includes('html.native-app[data-active-tab="home"] .home-native-tablet-info')&&css.includes('width:32%!important'),"태블릿 가로 집·마을을 화면 전체 고정 좌표계로 분리"],
  [app.includes('const townMapPositions=new Map()')&&app.includes('townMapPositions.set(previousTownId')&&app.includes('townMapPositions.get(state.activeTownId)')&&app.includes('scroller.scrollLeft=previousTownPosition.left;scroller.scrollTop=previousTownPosition.top')&&!app.includes('if(state.activeTab==="town")centerMobileTownMap();'),"버튼 재렌더와 마을 전환 뒤 지도 화면 위치 보존"],
  [views.includes('data-place-field="reputation"')&&views.includes('data-place-field="atmosphere"')&&views.includes('data-home-field="reputation"')&&views.includes('data-home-field="atmosphere"')&&state.includes('p.reputation=String')&&state.includes('p.atmosphere=String')&&state.includes('h.reputation=String')&&state.includes('h.atmosphere=String'),"건물과 집의 평판·분위기 표시 및 저장"],
  [css.includes('url("./assets/town-ui/building-info-wood.png")')&&css.includes('box-shadow:0 0 0 6px #fff')&&css.includes('paint-order:stroke fill'),"제공 목재 배경과 잘리지 않는 바깥쪽 외곽선"],
  [app.includes('function openTownCharacterSheet')&&app.includes('if(state.activeTab==="town")')&&app.includes('openTownCharacterSheet(el)'),"마을 주민 클릭 시 집과 같은 하단 정보 시트"],
  [css.includes('animation:town-traveler-route 11.8s')&&!css.includes('town-traveler-step .46s steps')&&css.includes('background:#fffdf3ed')&&css.includes('background-color:transparent!important;background-image:none!important'),"부드러운 마을 이동과 투명 아이콘·흰색 검은 글자 상태표"],
  [views.includes('"현재 {current}명 · 거주 {resident}명":"{current} here · {resident} residents"')&&views.includes('"현재 {current}명 · 거주 {resident}명":"現在{current}人・居住{resident}人"')&&views.includes('"건물 평판":"Building reputation"')&&views.includes('"건물 분위기":"建物の雰囲気"'),"상단 인원과 건물·편집 UI 영어·일본어 번역"],
  [app.includes('function openBuildingInteriorImageMenu')&&app.includes('data-building-interior-source="game"')&&app.includes('data-building-interior-source="link"')&&app.includes('data-building-interior-source="device"')&&app.includes('openBuildingInteriorImageMenu("home"'),"일반 건물과 집 내부 사진의 게임 기본 일러스트·링크·기기 업로드 3가지 선택"],
  [views.includes('town-building-filter-scroll')&&views.includes('"관공서","기타"')&&css.includes('grid-template-columns:auto minmax(0,1fr)')&&css.includes('.town-building-filter-scroll{display:flex'),"전체 고정과 모든 건물 유형 가로 스크롤"],
  [views.includes('data-town-placement-command="undo"')&&views.includes('data-town-placement-command="redo"')&&app.includes('const townPlacementHistories=new Map()')&&app.includes('event.ctrlKey||event.metaKey'),"배치 버튼과 Ctrl+Z·Ctrl+Y 실행 취소/다시 실행"],
  [townFit.includes('scroll-behavior:auto!important')&&townFit.includes('var(--town-label-offset,129px)')&&views.includes('--town-label-offset:'),"재렌더 지도 위치를 즉시 복원하고 건물 이름을 외형 바로 아래에 배치"],
  [interfaceCss.includes(':not(.town-traveler)')&&css.includes('.town-traveler-visual>i{')&&css.includes('border:0;border-radius:0;background:transparent'),"이동 인물 카드와 상태 아이콘의 불필요한 배경·테두리 제거"],
  [simulation.includes('routineCanInclude(other,c.id)')&&simulation.includes('committedHasSoloRoutine'),"동행자 없는 고정 일정 인물을 다른 인물의 공동 장면에서 제외"],
  [views.includes('data-open-home-residents="${home.id}"')&&views.includes('data-home-field="exteriorStyle"')&&views.includes('data-home-field="beautyLevel"'),"집 편집의 구성원·외관 스타일·아름다운 정도 통합"],
  [app.includes('openBuildingShapeDialog(button.dataset.homeBuildingShape,"home")')&&app.includes('updateHome(targetId,{iconPreset,exteriorImage:""},true)')&&state.includes('h.iconPreset=String(h.iconPreset||"drawer-home")'),"집 외형 버튼을 파일 업로드가 아닌 건물 외형 도감에 연결"],
  [views.includes('const localIds=state.preventInterTownMovement?[...residentIds]')&&views.includes('(character.residences||[]).map(residence=>residence.homeId)'),"마을 이동 차단 시 현재 인원과 모든 등록 주거지를 기준으로 거주 인원 계산"],
  [css.includes('.town-information-backdrop')&&css.includes('.town-information-hero')&&css.includes('grid-template-columns:minmax(310px,.95fr) minmax(390px,1.05fr)'),"마을 손그림 배경·흰 테두리 지도 카드와 태블릿 폭 기반 정보 배치"],
  [state.includes('...normalizeTownProfile(t)')&&state.includes('density:String(t.density')&&state.includes('size:String(t.size')&&app.includes('[data-world-town-type]')&&app.includes('[data-world-town-subtype]')&&app.includes('[data-world-terrain]')&&app.includes('[data-world-transport]'),"확장된 마을 유형·세부유형·지형·교통 정보를 마을별 상태에 저장"]
];

let failed=0;
for(const [pass,label] of checks){
  console.log(`${pass?"PASS":"FAIL"} ${label}`);
  if(!pass)failed++;
}
if(failed)process.exit(1);
console.log(`\nPASS ${checks.length} town grid editor checks.`);
