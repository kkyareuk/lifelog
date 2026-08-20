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

const checks=[
  [views.includes('class="game-observe-hud')&&views.includes('class="game-hud-top"')&&views.includes('data-native-hud-version="3"'),"관찰 화면의 단일 게임 HUD v3 구조"],
  [views.includes('gameHudSideMenu("left")')&&views.includes('gameHudSideMenu("right")'),"좌우 기능 메뉴"],
  [views.includes('class="game-hud-dock"')&&views.includes('./icons/mailbox.png')&&views.includes('data-tab="mailbox"')&&views.includes('data-open-native-log')&&fs.existsSync(path.join(root,"icons/mailbox.png")),"사용자 우편함 원화가 포함된 하단 주요 메뉴"],
  [views.includes('./icons/town-map.png')&&fs.existsSync(path.join(root,"icons/town-map.png"))&&!fs.existsSync(path.join(root,"icons/town-map.svg")),"사용자 마을 지도 원화 PNG"],
  [["hud-profile-frame.png","hud-character-card.png","hud-catalog-book.png"].every(file=>fs.existsSync(path.join(root,"icons",file)))&&views.includes('./icons/hud-profile-frame.png')&&views.includes('./icons/hud-character-card.png')&&views.includes('./icons/hud-catalog-book.png'),"프로필 테두리·민증·취향사전 사용자 원화 연결"],
  [views.includes('class="game-hud-roster-drawer"')&&views.includes('data-open-game-hud-roster')&&views.includes('profileAvatar(c,"game-hud-current-profile")')&&app.includes("bindNativeObserveCharacterSwipe")&&app.includes('addEventListener("touchstart"')&&app.includes("window.innerWidth*.13"),"프로필 사진 버튼·상단 캐릭터 서랍·앱 터치 스와이프 전환"],
  [views.includes('data-game-hud-moment')&&views.includes('data-toggle-game-hud-moment')&&views.includes('data-expand-label')&&app.includes("card.classList.toggle('expanded')")&&app.includes("aria-expanded"),"지금 이 순간 카드의 SVG 제목 탭과 펼치기·접기 동작"],
  [app.includes('[data-open-native-log]')&&app.includes('data-native-log-dialog'),"오늘의 기록 대화상자 연결"],
  [css.includes('html.native-platform[data-active-tab="observe"] .game-observe-hud[data-native-hud-version="3"]')&&css.includes('object-fit:contain!important')&&css.includes('background:transparent!important')&&css.includes('top:13.85dvh!important')&&css.includes('top:10.58dvh!important')&&css.includes('top:66.06dvh!important')&&css.includes('width:85.19vw!important')&&css.includes('font-family:var(--ui-font)!important')&&views.includes('class="game-hud-location"'),"412×917 SVG의 좌우 비대칭 여백·카드 좌표·선택 글꼴·건물 외관을 반영한 앱 HUD"],
  [fontCss.includes('html[data-ui-font="griun"]')&&fontCss.includes('GriunSimsimche-Regular.ttf')&&fontJs.includes('"griun"')&&stateJs.includes('"corncorn","griun"')&&views.includes('["griun","그리운 심심체 · 손글씨"]'),"제공 글꼴을 강제하지 않고 선택 가능한 글꼴로 등록"],
  [css.includes('-webkit-text-stroke:1.35px #17110d!important')&&css.includes('background:transparent!important;color:#fff!important')&&css.includes('.game-hud-moment:not(.expanded)')&&css.includes('text-overflow:ellipsis!important')&&css.includes('height:min(38dvh,350px)!important'),"현재 순간 무배경 외곽선 글자·접힌 말줄임·펼침 카드"],
  [css.includes('top:5.23dvh!important')&&css.includes('.game-hud-profile-copy small::before')&&views.includes('<small><em>${esc(c.jobTitle'),"시간 기준선과 직업 길이에 맞춰 늘어나는 SVG 상단 갈색 영역"],
  [views.includes('ja:{character:"人物",catalog:"好み",relationship:"関係",routine:"予定"')&&views.includes('ja:{character:"人物",catalog:"好み",relationship:"関係",routine:"予定",statistics:"統計",settings:"設定",mailbox:"郵便"')&&views.includes('ko:{character:"캐릭터",catalog:"취향 사전",relationship:"관계",routine:"일정"'),"한국어 일정 명칭과 일본어 모바일 메뉴 단축 표기"],
  [css.includes('html.native-platform #app>header{display:none!important}')&&!css.includes('html.mobile-site #app>header{display:none!important}'),"앱에서만 웹 상단 바 숨김"],
  [app.includes('const nativePlatform=Boolean(window.DRAWER_VILLAGE_NATIVE')&&app.includes('classList.toggle("native-app",nativePlatform)')&&!index.includes('matchMedia("(max-width:720px)")'),"화면 너비가 아닌 네이티브 브리지로 앱·PC 레이아웃 분리"],
  [app.includes('function armObserveProfileInputShield')&&app.includes('function blockObserveProfileInputAfterNavigation')&&app.includes('[data-open-game-hud-roster]')&&app.includes('stopImmediatePropagation')&&app.includes('capture:true'),"뒤로가기 입력이 프로필 선택 버튼으로 관통하지 않음"],
  [views.includes('<header><div class="brand"')&&views.includes('<nav>')&&views.includes('class="town-tabs"')&&views.includes('data-town-select'),"PC 상단 탐색과 마을 선택 구조 유지"],
  [views.includes('const nativeHome=Boolean(document.documentElement')&&views.includes('if(!nativeHome)')&&views.includes('class="standard-observe-view"')&&views.includes('class="desktop-observe-scene native-app"')&&views.includes('class="desktop-observe-lower"'),"PC 관찰 화면을 Android HUD와 분리해 기존 장면·마을·기록 구조 유지"],
  [!views.includes("NATIVE_MENU_TABS")&&!views.includes("function nativeGameMenu"),"기존 고정 메뉴 구조 제거"]
];

const failed=checks.filter(([ok])=>!ok);
checks.forEach(([ok,label])=>console.log(`${ok?"PASS":"FAIL"} ${label}`));
if(failed.length){
  console.error(`\n${failed.length} observe HUD regression check(s) failed.`);
  process.exit(1);
}
console.log(`\nPASS ${checks.length} observe HUD regression checks.`);
