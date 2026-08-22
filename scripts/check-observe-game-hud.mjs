import fs from "node:fs";
import path from "node:path";

const root=path.resolve(import.meta.dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const views=read("views.js");
const app=read("app.js");
const css=read("app.css");
const interfaceCss=read("interface-system.css");
const themeCss=read("theme.css");
const index=read("index.html");
const fontCss=read("font-preferences.css");
const stateJs=read("state.js");
const homeSceneCss=read("home-scene-layout.css");

const checks=[
  [views.includes('class="game-observe-hud')&&views.includes('class="game-hud-top"')&&views.includes('data-native-hud-version="4"'),"관찰 화면의 단일 게임 HUD v4 구조"],
  [views.includes('gameHudSideMenu("left",c)')&&views.includes('gameHudSideMenu("right",c)'),"좌우 기능 메뉴"],
  [views.includes('class="game-hud-dock"')&&views.includes('"mailbox.png"')&&views.includes('"ink.png"')&&views.includes('data-tab="mailbox"')&&views.includes('data-open-native-log')&&fs.existsSync(path.join(root,"assets/home-ui/mailbox.png")),"제공 스프라이트의 우편함·기록물 원화가 포함된 하단 주요 메뉴"],
  [views.includes('"town.png"')&&views.includes('"shop.png"')&&views.includes('"home.png"')&&["town.png","shop.png","home.png"].every(file=>fs.existsSync(path.join(root,"assets/home-ui",file))),"제공 스프라이트의 집·상점·마을 원화 연결"],
  [["profile-ring.png","profile-placeholder.png","catalog.png","relationship.png","routine.png","statistics.png","settings.png"].every(file=>fs.existsSync(path.join(root,"assets/home-ui",file)))&&views.includes('homeUiAsset(c,"profile-ring.png")')&&views.includes('asset:"profile-placeholder.png"')&&views.includes('asset:"catalog.png"'),"프로필 테두리와 좌우 메뉴에 제공 스프라이트 원화 연결"],
  [views.includes('class="game-hud-roster-drawer"')&&views.includes('data-open-game-hud-roster')&&views.includes('profileAvatar(c,"game-hud-current-profile")')&&app.includes("bindNativeObserveCharacterSwipe")&&app.includes('addEventListener("touchstart"')&&app.includes("window.innerWidth*.13"),"프로필 사진 버튼·상단 캐릭터 서랍·앱 터치 스와이프 전환"],
  [views.includes('data-game-hud-moment')&&views.includes('game-hud-button game-hud-moment-toggle')&&views.includes('class="game-hud-moment-body" data-toggle-game-hud-moment')&&views.includes('data-expand-label')&&app.includes("card.classList.toggle('expanded')")&&app.includes("card.querySelectorAll('[data-toggle-game-hud-moment]')")&&app.includes('event.key!=="Enter"'),"빨간 테이프와 내용 카드 전체의 펼치기·접기 동작"],
  [app.includes('[data-open-native-log]')&&app.includes('data-native-log-dialog'),"오늘의 기록 대화상자 연결"],
  [css.includes('html.native-platform[data-active-tab="observe"] .game-observe-hud[data-native-hud-version="4"]')&&css.includes('--home-ui-wood-strip')&&css.includes('--home-ui-wood-top')&&css.includes('background-size:cover!important')&&css.includes('left:2.91vw!important;top:12.87dvh!important')&&css.includes('right:2.18vw!important;top:9.38dvh!important')&&css.includes('bottom:15.38dvh!important;width:85.19vw!important')&&css.includes('font-family:var(--home-ui-font)!important')&&views.includes('class="game-hud-location"'),"모든 화면비에서 자르되 찌그러뜨리지 않는 이중 나무 상단과 앱 HUD 좌표"],
  [css.includes('top:1.45dvh!important;width:100%!important;height:7.17dvh!important')&&css.includes('top:0!important;width:100%!important;height:2.95dvh!important'),"상단 장식과 상단 바가 틈 없이 겹치는 비율 유지 배치"],
  [css.includes('@media(min-width:721px)')&&css.includes('.game-hud-side{width:76px!important}')&&css.includes('width:70px!important;height:70px!important')&&css.includes('width:62px!important;height:62px!important')&&css.includes('width:88px!important;height:88px!important'),"태블릿 가로 화면에서도 홈 메뉴 원화가 화면 비율을 따라 거대해지지 않는 크기 상한"],
  [fontCss.includes('@font-face{font-family:"KCCHanbit"')&&fontCss.includes('KCC-Hanbit.ttf')&&fontCss.includes(':root{--ui-font:"KCCHanbit"')&&!index.includes('font-preferences.js')&&!fs.existsSync(path.join(root,"font-preferences.js"))&&!stateJs.includes('uiFont:"')&&fs.existsSync(path.join(root,"fonts/KCC-Hanbit.ttf")),"제공 KCC 한빛체를 고정 UI 글꼴로 사용하고 기기 글꼴 설정 제거"],
  [css.includes('-webkit-text-stroke:1.5px #000!important')&&css.includes('background-color:transparent!important')&&css.includes('-webkit-text-fill-color:#fff!important')&&css.includes('font-size:clamp(18px,5.2vw,24px)!important')&&css.includes('border:1.5px solid #000!important;border-radius:30px!important')&&interfaceCss.includes(':not(.game-hud-moment-title)')&&css.includes('-webkit-line-clamp:3!important')&&views.includes('game-hud-button game-hud-moment-toggle')&&css.includes('--home-ui-red-tape')&&fs.existsSync(path.join(root,"assets/home-ui/red-tape.png")),"현재 순간 무배경 흰 외곽선 글자·3줄 설명·검은 카드 테두리와 빨간 테이프"],
  [css.includes('.game-hud-profile-copy b{')&&css.includes('color:#fff!important;-webkit-text-fill-color:#fff!important;-webkit-text-stroke:1.2px #000!important')&&css.includes('.game-hud-top>time{')&&css.includes('top:5.52dvh!important')&&css.includes('-webkit-text-stroke:1.1px #000!important'),"이름·시간 흰 글자와 검은 외곽선 및 하단선 정렬"],
  [css.includes('font-size:clamp(16px,4.55vw,21px)!important')&&css.includes('line-height:1.6!important'),"지금 이 순간 제목 1px 축소와 본문 행간 확대"],
  [css.includes('.game-hud-profile-copy small::before')&&css.includes('--home-ui-pill-left')&&css.includes('--home-ui-pill-middle')&&css.includes('--home-ui-pill-right')&&css.includes('color:#FFF5DD!important')&&views.includes('<small><em>${esc(c.jobTitle')&&["pill-left.png","pill-middle.png","pill-right.png"].every(file=>fs.existsSync(path.join(root,"assets/home-ui",file))),"곡선 캡은 보존하고 가운데만 늘어나는 독립 직업·메뉴 캡슐과 #FFF5DD 메뉴 글자"],
  [views.includes('const HOME_UI_THEMES=Object.freeze')&&views.includes('data-home-ui-theme=')&&stateJs.includes('homeUiTheme:"drawer-classic"')&&stateJs.includes('c.homeUiTheme='),"전역 기본값과 캐릭터별 홈 UI 팩 선택을 위한 테마 매니페스트"],
  [views.includes('class="game-observe-hud game-observe-empty" data-native-hud-version="4"')&&views.includes('class="game-hud-top game-hud-empty-top"')&&stateJs.includes('state.activeId=localCharacter||null')&&stateJs.includes('state.activeTab=activeTab'),"캐릭터가 없는 마을도 현재 탭을 유지하는 완전한 빈 마을 HUD"],
  [views.includes('class="mailbox-gift" data-mailbox-gift')&&!views.slice(views.indexOf('const worldTaste='),views.indexOf('const videoFormats=')).includes('data-character-interaction="gift"')&&app.includes('toggleFavorite(active().id,kind,itemId,true)'),"선호 선택은 즉시 저장하고 실제 선물은 우편함으로 분리"],
  [views.includes('ja:{character:"人物",catalog:"好み",relationship:"関係",routine:"予定"')&&views.includes('ja:{character:"人物",catalog:"好み",relationship:"関係",routine:"予定",statistics:"統計",settings:"設定",mailbox:"郵便"')&&views.includes('ko:{character:"캐릭터",catalog:"취향 사전",relationship:"관계",routine:"일정"'),"한국어 일정 명칭과 일본어 모바일 메뉴 단축 표기"],
  [css.includes('html.native-platform #app>header{display:none!important}')&&app.includes('classList.toggle("native-platform",appLayout)'),"앱과 모바일 사이트에서 동일한 상단 바 없는 앱 화면"],
  [app.includes('const mobileSite=window.matchMedia?.("(max-width:720px)")')&&app.includes('const appLayout=nativePlatform||mobileSite')&&app.includes('classList.toggle("native-app",appLayout)')&&app.includes('classList.toggle("mobile-site",!nativePlatform&&mobileSite)'),"720px 이하 사이트와 Android 앱이 같은 모바일 UI 사용"],
  [app.includes('function armObserveProfileInputShield')&&app.includes('function blockObserveProfileInputAfterNavigation')&&app.includes('[data-open-game-hud-roster]')&&app.includes('stopImmediatePropagation')&&app.includes('capture:true'),"뒤로가기 입력이 프로필 선택 버튼으로 관통하지 않음"],
  [views.includes('<header><div class="brand"')&&views.includes('<nav>')&&views.includes('class="town-tabs"')&&views.includes('data-town-select'),"PC 상단 탐색과 마을 선택 구조 유지"],
  [views.includes('const nativeHome=Boolean(document.documentElement')&&views.includes('if(!nativeHome)')&&views.includes('class="standard-observe-view"')&&views.includes('class="desktop-observe-scene native-app"')&&views.includes('class="desktop-observe-lower"'),"PC 관찰 화면을 Android HUD와 분리해 기존 장면·마을·기록 구조 유지"],
  [!views.includes("NATIVE_MENU_TABS")&&!views.includes("function nativeGameMenu"),"기존 고정 메뉴 구조 제거"],
  [homeSceneCss.includes('.game-hud-stage .native-character-stage.visual-mode-ld.has-two-scene-actors .native-scene-lineup-person.is-selected')&&homeSceneCss.includes('left:27vw!important')&&homeSceneCss.includes('height:112dvh!important')&&homeSceneCss.includes('.native-scene-lineup-person:not(.is-selected)')&&homeSceneCss.includes('left:70vw!important')&&homeSceneCss.includes('z-index:1!important'),"LD 선택 인물 앞왼쪽·동행 인물 뒤오른쪽 배치와 HUD 아래 레이어 유지"]
  ,[views.includes('class="mailbox-home-call"')&&views.includes('data-force-home="current"')&&views.includes('data-force-home="all"')&&!views.slice(views.indexOf('function routine(){'),views.indexOf('function town(){')).includes('routine-return-panel'),"집으로 부르기는 일정에서 제거하고 우편함에 배치"]
  ,[views.includes('class="routine-screen-head"')&&views.includes('class="routine-back-button"')&&views.includes('class="weekly-table"')&&views.includes('data-add-routine-day=')&&css.includes('--routine-paper:#efe3d4')&&css.includes('font-family:"KCCHanbit",var(--ui-font)!important'),"일정 첫 화면을 제공 시안의 손그림 주간·월간 달력 구조로 교체"]
  ,[views.includes('class="mobile-character-profile-draft"')&&views.includes('class="character-wallet-selected"')&&views.includes('class="character-registration-card"')&&views.includes('class="character-draft-actions"')&&css.includes('assets/character-ui/wallet.png')&&css.includes('.mobile-character-pane-grid .character-pane-ribbon:nth-child(6)'),"캐릭터 화면을 SVG 카드지갑과 색상별 설정 띠 구조로 재배치"]
  ,[app.includes('data-routine-save')&&app.includes('data-routine-cancel')&&app.includes('openRoutineSheet("weekly-routine-sheet"')&&app.includes('if(!days.length){showToast')&&app.includes('closeRoutineSheet(dialog,"save",()=>render())')&&css.includes('.routine-sheet-backdrop.is-open .routine-bottom-sheet'),"일정 선택 중 화면·스크롤을 유지하는 바텀시트와 명시적 저장·취소"]
  ,[views.includes('data-add-character-group')&&app.includes('openCharacterGroupDialog')&&views.includes('data-prevent-intertown-movement')&&app.includes('state.preventInterTownMovement=event.currentTarget.checked'),"관계의 캐릭터 그룹과 마을 이동 차단 설정"]
];

const failed=checks.filter(([ok])=>!ok);
checks.forEach(([ok,label])=>console.log(`${ok?"PASS":"FAIL"} ${label}`));
if(failed.length){
  console.error(`\n${failed.length} observe HUD regression check(s) failed.`);
  process.exit(1);
}
console.log(`\nPASS ${checks.length} observe HUD regression checks.`);
