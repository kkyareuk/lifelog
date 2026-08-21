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
  [views.includes('class="game-hud-dock"')&&views.includes('./assets/home-ui/mailbox.png')&&views.includes('./assets/home-ui/ink.png')&&views.includes('data-tab="mailbox"')&&views.includes('data-open-native-log')&&fs.existsSync(path.join(root,"assets/home-ui/mailbox.png")),"제공 스프라이트의 우편함·기록물 원화가 포함된 하단 주요 메뉴"],
  [views.includes('./assets/home-ui/town.png')&&views.includes('./assets/home-ui/shop.png')&&views.includes('./assets/home-ui/home.png')&&["town.png","shop.png","home.png"].every(file=>fs.existsSync(path.join(root,"assets/home-ui",file))),"제공 스프라이트의 집·상점·마을 원화 연결"],
  [["profile-ring.png","profile-placeholder.png","catalog.png","relationship.png","routine.png","statistics.png","settings.png"].every(file=>fs.existsSync(path.join(root,"assets/home-ui",file)))&&views.includes('./assets/home-ui/profile-ring.png')&&views.includes('./assets/home-ui/profile-placeholder.png')&&views.includes('./assets/home-ui/catalog.png'),"프로필 테두리와 좌우 메뉴에 제공 스프라이트 원화 연결"],
  [views.includes('class="game-hud-roster-drawer"')&&views.includes('data-open-game-hud-roster')&&views.includes('profileAvatar(c,"game-hud-current-profile")')&&app.includes("bindNativeObserveCharacterSwipe")&&app.includes('addEventListener("touchstart"')&&app.includes("window.innerWidth*.13"),"프로필 사진 버튼·상단 캐릭터 서랍·앱 터치 스와이프 전환"],
  [views.includes('data-game-hud-moment')&&views.includes('class="game-hud-moment-title" data-toggle-game-hud-moment')&&views.includes('class="game-hud-moment-toggle" data-toggle-game-hud-moment')&&views.includes('class="game-hud-moment-body" data-toggle-game-hud-moment')&&views.includes('data-expand-label')&&app.includes("card.classList.toggle('expanded')")&&app.includes("card.querySelectorAll('[data-toggle-game-hud-moment]')")&&app.includes('event.key!=="Enter"'),"지금 이 순간 글자·버튼·내용 카드 전체의 펼치기·접기 동작"],
  [app.includes('[data-open-native-log]')&&app.includes('data-native-log-dialog'),"오늘의 기록 대화상자 연결"],
  [css.includes('html.native-platform[data-active-tab="observe"] .game-observe-hud[data-native-hud-version="3"]')&&css.includes('background:#5c4234 url("./assets/home-ui/wood-top.png")')&&css.includes('left:2.91vw!important;top:12.87dvh!important')&&css.includes('right:2.18vw!important;top:9.38dvh!important')&&css.includes('bottom:15.38dvh!important;width:85.19vw!important;height:21.26dvh!important')&&css.includes('font-family:var(--home-ui-font)!important')&&views.includes('class="game-hud-location"'),"412×917 SVG의 나무 상단·비대칭 메뉴·현재 순간 카드 좌표를 반영한 앱 HUD"],
  [fontCss.includes('@font-face{font-family:"KCCHanbit"')&&fontCss.includes('KCC-Hanbit.ttf')&&fontCss.includes('html[data-ui-font="hanbit"]')&&views.includes('["hanbit","KCC 한빛체 · 손으로 그린 UI"]')&&fs.existsSync(path.join(root,"fonts/KCC-Hanbit.ttf")),"제공 KCC 한빛체를 UI 글꼴과 선택 가능한 글꼴로 등록"],
  [css.includes('-webkit-text-stroke:1.5px #000!important')&&css.includes('background-color:transparent!important')&&css.includes('-webkit-text-fill-color:#fff!important')&&css.includes('font-size:clamp(18px,5.2vw,24px)!important')&&css.includes('border:1.5px solid #000!important;border-radius:30px!important')&&interfaceCss.includes(':not(.game-hud-moment-title)')&&css.includes('-webkit-line-clamp:4!important')&&css.includes('height:auto!important;max-height:34dvh!important')&&css.includes('top:1.45dvh!important'),"현재 순간 무배경·흰 글자·1.5px 검은 외곽선·확대 글자와 내용 카드 검은 테두리"],
  [css.includes('.game-hud-profile-copy small::before')&&css.includes('display:none!important;content:none!important')&&css.includes('max-width:46vw!important')&&css.includes('border-radius:999px!important;background:#624737!important')&&views.includes('<small><em>${esc(c.jobTitle'),"프로필에서 분리되고 화면 밖으로 나가지 않는 독립 직업 캡슐"],
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
  ,[app.includes('data-routine-save')&&app.includes('data-routine-cancel')&&app.includes('dialog.innerHTML=`<form><h2>주간 일정 편집')&&app.includes('if(!days.length){showToast')&&app.includes('dialog.onclose=()=>{dialog.remove();if(saved)render()}'),"일정 선택 중 팝업·스크롤 유지와 명시적 저장·취소"]
];

const failed=checks.filter(([ok])=>!ok);
checks.forEach(([ok,label])=>console.log(`${ok?"PASS":"FAIL"} ${label}`));
if(failed.length){
  console.error(`\n${failed.length} observe HUD regression check(s) failed.`);
  process.exit(1);
}
console.log(`\nPASS ${checks.length} observe HUD regression checks.`);
