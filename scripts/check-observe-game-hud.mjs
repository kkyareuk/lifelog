import fs from "node:fs";
import path from "node:path";

const root=path.resolve(import.meta.dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const views=read("views.js");
const app=read("app.js");
const css=read("app.css");
const interfaceCss=read("interface-system.css");
const themeCss=read("theme.css");

const checks=[
  [views.includes('class="game-observe-hud')&&views.includes('class="game-hud-top"'),"관찰 화면의 단일 게임 HUD 구조"],
  [views.includes('gameHudSideMenu("left")')&&views.includes('gameHudSideMenu("right")'),"좌우 기능 메뉴"],
  [views.includes('class="game-hud-dock"')&&views.includes('./icons/mailbox.png')&&views.includes('data-tab="mailbox"')&&views.includes('data-open-native-log')&&fs.existsSync(path.join(root,"icons/mailbox.png")),"사용자 우편함 원화가 포함된 하단 주요 메뉴"],
  [views.includes('./icons/town-map.png')&&fs.existsSync(path.join(root,"icons/town-map.png"))&&fs.existsSync(path.join(root,"icons/town-map-source.png"))&&!fs.existsSync(path.join(root,"icons/town-map.svg")),"원화에서 잘라낸 사용자 마을 지도 PNG"],
  [views.includes('class="game-hud-roster-dialog"')&&views.includes('data-open-game-hud-roster')&&views.includes('profileAvatar(c,"game-hud-current-profile")')&&app.includes("rosterDialog.showModal()")&&app.includes("bindNativeObserveCharacterSwipe")&&app.includes('addEventListener("touchstart"')&&app.includes("window.innerWidth*.13"),"프로필 사진 버튼·독립 캐릭터 팝업·앱 터치 스와이프 전환"],
  [views.includes('const statusCard=`<article class="game-hud-moment"')&&!views.includes('data-toggle-native-moment-card')&&!app.includes("toggleNativeMoment"),"항상 펼쳐진 지금 이 순간 카드"],
  [app.includes('[data-open-native-log]')&&app.includes('data-native-log-dialog'),"오늘의 기록 대화상자 연결"],
  [css.includes('.game-observe-hud{')&&css.includes('.game-hud-dock{')&&css.includes('.game-hud-roster-dialog{')&&css.includes('background:none!important')&&css.includes('.game-hud-town-button img{width:72px')&&css.includes('clip-path:polygon')&&css.includes('touch-action:pan-y')&&css.includes('@media(max-width:380px),(max-height:720px)'),"배경 상자를 제거하고 안전 여백·짧은 화면까지 대응한 반응형 HUD"],
  [css.includes('.native-app body>header{display:none!important}')&&!css.includes('.native-app header{display:none!important}')&&interfaceCss.includes('dialog:not(.game-hud-roster-dialog)')&&themeCss.includes('dialog:not(.game-hud-roster-dialog)'),"앱 상단 바 숨김과 테마 대화상자 스타일이 인물 선택 팝업 내부까지 침범하지 않음"],
  [!views.includes("NATIVE_MENU_TABS")&&!views.includes("function nativeGameMenu"),"기존 고정 메뉴 구조 제거"]
];

const failed=checks.filter(([ok])=>!ok);
checks.forEach(([ok,label])=>console.log(`${ok?"PASS":"FAIL"} ${label}`));
if(failed.length){
  console.error(`\n${failed.length} observe HUD regression check(s) failed.`);
  process.exit(1);
}
console.log(`\nPASS ${checks.length} observe HUD regression checks.`);
