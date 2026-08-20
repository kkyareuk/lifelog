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
const fontJs=read("font-preferences.js");
const stateJs=read("state.js");
const homeSceneCss=read("home-scene-layout.css");

const checks=[
  [views.includes('class="game-observe-hud')&&views.includes('class="game-hud-top"')&&views.includes('data-native-hud-version="3"'),"관찰 화면의 단일 게임 HUD v3 구조"],
  [views.includes('gameHudSideMenu("left")')&&views.includes('gameHudSideMenu("right")'),"좌우 기능 메뉴"],
  [views.includes('class="game-hud-dock"')&&views.includes('./icons/mailbox.png')&&views.includes('data-tab="mailbox"')&&views.includes('data-open-native-log')&&fs.existsSync(path.join(root,"icons/mailbox.png")),"사용자 우편함 원화가 포함된 하단 주요 메뉴"],
  [views.includes('./icons/town-map.png')&&fs.existsSync(path.join(root,"icons/town-map.png"))&&!fs.existsSync(path.join(root,"icons/town-map.svg")),"사용자 마을 지도 원화 PNG"],
  [["hud-profile-frame.png","hud-character-card.png","hud-catalog-book.png"].every(file=>fs.existsSync(path.join(root,"icons",file)))&&views.includes('./icons/hud-profile-frame.png')&&views.includes('./icons/hud-character-card.png')&&views.includes('./icons/hud-catalog-book.png'),"프로필 테두리·민증·취향사전 사용자 원화 연결"],
  [views.includes('class="game-hud-roster-drawer"')&&views.includes('data-open-game-hud-roster')&&views.includes('profileAvatar(c,"game-hud-current-profile")')&&app.includes("bindNativeObserveCharacterSwipe")&&app.includes('addEventListener("touchstart"')&&app.includes("window.innerWidth*.13"),"프로필 사진 버튼·상단 캐릭터 서랍·앱 터치 스와이프 전환"],
  [views.includes('data-game-hud-moment')&&views.includes('class="game-hud-moment-title" data-toggle-game-hud-moment')&&views.includes('class="game-hud-moment-toggle" data-toggle-game-hud-moment')&&views.includes('class="game-hud-moment-body" data-toggle-game-hud-moment')&&views.includes('data-expand-label')&&app.includes("card.classList.toggle('expanded')")&&app.includes("card.querySelectorAll('[data-toggle-game-hud-moment]')")&&app.includes('event.key!=="Enter"'),"지금 이 순간 글자·버튼·내용 카드 전체의 펼치기·접기 동작"],
  [app.includes('[data-open-native-log]')&&app.includes('data-native-log-dialog'),"오늘의 기록 대화상자 연결"],
  [css.includes('html.native-platform[data-active-tab="observe"] .game-observe-hud[data-native-hud-version="3"]')&&css.includes('object-fit:contain!important')&&css.includes('background:transparent!important')&&css.includes('top:13.85dvh!important')&&css.includes('top:10.58dvh!important')&&css.includes('bottom:17.47dvh!important')&&css.includes('width:85.19vw!important')&&css.includes('font-family:var(--ui-font)!important')&&views.includes('class="game-hud-location"'),"412×917 SVG의 좌우 비대칭 여백·카드 좌표·선택 글꼴·건물 외관을 반영한 앱 HUD"],
  [fontCss.includes('html[data-ui-font="griun"]')&&fontCss.includes('GriunSimsimche-Regular.ttf')&&fontJs.includes('"griun"')&&stateJs.includes('"corncorn","griun"')&&views.includes('["griun","그리운 심심체 · 손글씨"]'),"제공 글꼴을 강제하지 않고 선택 가능한 글꼴로 등록"],
  [css.includes('-webkit-text-stroke:1.5px #000!important')&&css.includes('background-color:transparent!important')&&css.includes('-webkit-text-fill-color:#fff!important')&&css.includes('font-size:clamp(17px,4.8vw,22px)!important')&&css.includes('border:1.5px solid #000!important;border-radius:30px!important')&&interfaceCss.includes(':not(.game-hud-moment-title)')&&css.includes('-webkit-line-clamp:4!important')&&css.includes('height:auto!important;max-height:34dvh!important')&&css.includes('top:1.45dvh!important'),"현재 순간 무배경·흰 글자·1.5px 검은 외곽선·확대 글자와 내용 카드 검은 테두리"],
  [css.includes('top:5.23dvh!important')&&css.includes('.game-hud-profile-copy small::before')&&css.includes('display:none!important;content:none!important')&&css.includes('max-width:46vw!important')&&css.includes('border-radius:999px!important;background:#473a28ed!important')&&views.includes('<small><em>${esc(c.jobTitle'),"프로필에서 분리되고 화면 밖으로 나가지 않는 독립 직업 캡슐"],
  [views.includes('ja:{character:"人物",catalog:"好み",relationship:"関係",routine:"予定"')&&views.includes('ja:{character:"人物",catalog:"好み",relationship:"関係",routine:"予定",statistics:"統計",settings:"設定",mailbox:"郵便"')&&views.includes('ko:{character:"캐릭터",catalog:"취향 사전",relationship:"관계",routine:"일정"'),"한국어 일정 명칭과 일본어 모바일 메뉴 단축 표기"],
  [css.includes('html.native-platform #app>header{display:none!important}')&&!css.includes('html.mobile-site #app>header{display:none!important}'),"앱에서만 웹 상단 바 숨김"],
  [app.includes('const nativePlatform=Boolean(window.DRAWER_VILLAGE_NATIVE')&&app.includes('classList.toggle("native-app",nativePlatform)')&&!index.includes('matchMedia("(max-width:720px)")'),"화면 너비가 아닌 네이티브 브리지로 앱·PC 레이아웃 분리"],
  [app.includes('function armObserveProfileInputShield')&&app.includes('function blockObserveProfileInputAfterNavigation')&&app.includes('[data-open-game-hud-roster]')&&app.includes('stopImmediatePropagation')&&app.includes('capture:true'),"뒤로가기 입력이 프로필 선택 버튼으로 관통하지 않음"],
  [views.includes('<header><div class="brand"')&&views.includes('<nav>')&&views.includes('class="town-tabs"')&&views.includes('data-town-select'),"PC 상단 탐색과 마을 선택 구조 유지"],
  [views.includes('const nativeHome=Boolean(document.documentElement')&&views.includes('if(!nativeHome)')&&views.includes('class="standard-observe-view"')&&views.includes('class="desktop-observe-scene native-app"')&&views.includes('class="desktop-observe-lower"'),"PC 관찰 화면을 Android HUD와 분리해 기존 장면·마을·기록 구조 유지"],
  [!views.includes("NATIVE_MENU_TABS")&&!views.includes("function nativeGameMenu"),"기존 고정 메뉴 구조 제거"],
  [homeSceneCss.includes('.game-hud-stage .native-character-stage.visual-mode-ld.has-two-scene-actors .native-scene-lineup-person.is-selected')&&homeSceneCss.includes('left:27vw!important')&&homeSceneCss.includes('height:112dvh!important')&&homeSceneCss.includes('.native-scene-lineup-person:not(.is-selected)')&&homeSceneCss.includes('left:70vw!important')&&homeSceneCss.includes('z-index:1!important'),"LD 선택 인물 앞왼쪽·동행 인물 뒤오른쪽 배치와 HUD 아래 레이어 유지"]
];

const failed=checks.filter(([ok])=>!ok);
checks.forEach(([ok,label])=>console.log(`${ok?"PASS":"FAIL"} ${label}`));
if(failed.length){
  console.error(`\n${failed.length} observe HUD regression check(s) failed.`);
  process.exit(1);
}
console.log(`\nPASS ${checks.length} observe HUD regression checks.`);
