import fs from "node:fs";
import path from "node:path";

const root=path.resolve(import.meta.dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const views=read("views.js");
const app=read("app.js");
const css=read("app.css");

const checks=[
  [views.includes('class="game-observe-hud')&&views.includes('class="game-hud-top"'),"관찰 화면의 단일 게임 HUD 구조"],
  [views.includes('gameHudSideMenu("left")')&&views.includes('gameHudSideMenu("right")'),"좌우 기능 메뉴"],
  [views.includes('class="game-hud-dock"')&&views.includes('data-tab="mailbox"')&&views.includes('data-open-native-log'),"우편함을 포함한 하단 주요 메뉴"],
  [views.includes('./icons/town-map.png')&&fs.existsSync(path.join(root,"icons/town-map.png"))&&fs.existsSync(path.join(root,"icons/town-map-source.png"))&&!fs.existsSync(path.join(root,"icons/town-map.svg")),"원화에서 잘라낸 사용자 마을 지도 PNG"],
  [views.includes('class="game-hud-roster" hidden')&&views.includes('data-toggle-game-hud-roster')&&app.includes("bindNativeObserveCharacterSwipe")&&app.includes("Math.abs(dx)<60"),"닫힌 캐릭터 목록과 앱 좌우 스와이프 전환"],
  [app.includes('[data-open-native-log]')&&app.includes('data-native-log-dialog'),"오늘의 기록 대화상자 연결"],
  [css.includes('.game-observe-hud{')&&css.includes('.game-hud-dock{')&&css.includes('background:transparent!important')&&css.includes('@media(max-width:720px)'),"배경 상자를 제거한 데스크톱·모바일 HUD"],
  [!views.includes("NATIVE_MENU_TABS")&&!views.includes("function nativeGameMenu"),"기존 고정 메뉴 구조 제거"]
];

const failed=checks.filter(([ok])=>!ok);
checks.forEach(([ok,label])=>console.log(`${ok?"PASS":"FAIL"} ${label}`));
if(failed.length){
  console.error(`\n${failed.length} observe HUD regression check(s) failed.`);
  process.exit(1);
}
console.log(`\nPASS ${checks.length} observe HUD regression checks.`);
