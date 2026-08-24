import fs from "node:fs";

const read=file=>fs.readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const views=read("views.js");
const app=read("app.js");
const css=read("app.css");
const sceneCss=read("home-scene-layout.css");
const state=read("state.js");
const gradle=read("android/app/build.gradle");

const checks=[
  [views.includes('const fullActivePane=["visual","profile","body","personality","taste","worldTaste"]'),"이미지 첫 장과 개요 이후 다섯 목차가 서로 다른 상태"],
  [views.includes('["visual","이미지"')&&views.indexOf('["visual","이미지"')<views.indexOf('["profile","개요"'),"이미지 책갈피가 개요보다 먼저 배치됨"],
  [views.includes('data-full-pane="${fullActivePane}"')&&views.includes('fullActivePane==="visual"?characterFullOverview(c)'),"전체설정 첫 장이 전용 이미지 페이지를 사용"],
  [views.includes('data-open-character-layout')&&views.includes('data-character-layout-dialog'),"배치 조정 카드와 전체화면 팝업 연결"],
  [app.includes('const pointers=new Map()')&&app.includes('measured.distance/gesture.distance')&&app.includes('measured.angle-gesture.angle'),"한 손 이동·두 손 확대축소·회전 제스처"],
  [app.includes('event.target.closest(\'[data-home-layout-action]\')?"action":"art"'),"행동 아이콘을 직접 끌어 배치"],
  [state.includes('rotation:clamp(layout.rotation,-180,180,0)'),"회전값 저장·복원 정규화"],
  [sceneCss.includes('rotate:var(--character-art-rotation,0deg)!important'),"저장한 회전값이 실제 홈 장면에도 적용"],
  [css.includes('left:-135.2786cqw!important;top:3.8835cqw!important')&&css.includes('width:242.7888cqw!important;height:203.6663cqw!important'),"원본 SVG 책 위치·크기 좌표"],
  [css.includes('background-repeat:repeat-x')&&css.includes('background-size:auto 100%'),"벽지를 찌그러뜨리지 않고 높이에 맞춰 가로 타일링"],
  [css.includes('body.is-building-size-preview .mobile-town-shell')&&css.includes('background:transparent!important'),"건물 크기 조절 중 설정창 투명 실시간 미리보기"],
  [gradle.includes('versionCode 136')&&gradle.includes('versionName "1.0.125"'),"Android 개발 버전 136 / 1.0.125"]
];

let failed=0;
for(const [ok,label] of checks){
  console.log(`${ok?"PASS":"FAIL"} ${label}`);
  if(!ok)failed+=1;
}
if(failed)process.exit(1);
