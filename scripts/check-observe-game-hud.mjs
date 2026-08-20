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

const checks=[
  [views.includes('class="game-observe-hud')&&views.includes('class="game-hud-top"')&&views.includes('data-native-hud-version="3"'),"관찰 화면의 단일 게임 HUD v3 구조"],
  [views.includes('gameHudSideMenu("left")')&&views.includes('gameHudSideMenu("right")'),"좌우 기능 메뉴"],
  [views.includes('class="game-hud-dock"')&&views.includes('./icons/mailbox.png')&&views.includes('data-tab="mailbox"')&&views.includes('data-open-native-log')&&fs.existsSync(path.join(root,"icons/mailbox.png")),"사용자 우편함 원화가 포함된 하단 주요 메뉴"],
  [views.includes('./icons/town-map.png')&&fs.existsSync(path.join(root,"icons/town-map.png"))&&!fs.existsSync(path.join(root,"icons/town-map.svg")),"사용자 마을 지도 원화 PNG"],
  [["hud-profile-frame.png","hud-character-card.png","hud-catalog-book.png"].every(file=>fs.existsSync(path.join(root,"icons",file)))&&views.includes('./icons/hud-profile-frame.png')&&views.includes('./icons/hud-character-card.png')&&views.includes('./icons/hud-catalog-book.png'),"프로필 테두리·민증·취향사전 사용자 원화 연결"],
  [views.includes('class="game-hud-roster-drawer"')&&views.includes('data-open-game-hud-roster')&&views.includes('profileAvatar(c,"game-hud-current-profile")')&&app.includes("bindNativeObserveCharacterSwipe")&&app.includes('addEventListener("touchstart"')&&app.includes("window.innerWidth*.13"),"프로필 사진 버튼·상단 캐릭터 서랍·앱 터치 스와이프 전환"],
  [views.includes('const statusCard=`<article class="game-hud-moment"')&&!views.includes('data-toggle-native-moment-card')&&!app.includes("toggleNativeMoment"),"항상 펼쳐진 지금 이 순간 카드"],
  [app.includes('[data-open-native-log]')&&app.includes('data-native-log-dialog'),"오늘의 기록 대화상자 연결"],
  [css.includes('html.native-platform[data-active-tab="observe"] .game-observe-hud[data-native-hud-version="3"]')&&css.includes('object-fit:contain!important')&&css.includes('background:transparent!important')&&css.includes('--hud-side-top:13.85dvh')&&css.includes('font-family:"Griun Simsimche"')&&views.includes('class="game-hud-location"'),"SVG 좌표·제공 글꼴·건물 외관을 반영하고 자리표시 상자를 렌더링하지 않는 앱 반응형 HUD"],
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
