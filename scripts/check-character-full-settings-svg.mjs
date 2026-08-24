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
  [views.includes('data-character-full-ui-version="4"')&&css.includes('background-image:url("./assets/character-ui/character-wood-background.png")!important')&&css.includes('.mobile-character-full-settings.is-open::before')&&css.includes('background-image:url("./assets/character-ui/book.png")!important')&&css.includes('.character-full-book{\n    display:none!important'),"Android에서 전체설정 책과 목재를 DOM 이미지 실패와 무관한 CSS 표면 레이어로 유지"],
  [views.includes('class="character-full-image-slot icon" data-image="icon">${currentIcon}</button>')&&!views.includes('character-full-current-icon'),"아이콘이 별도 위치가 아닌 아이콘 슬롯 안에 배치됨"],
  [css.includes('.character-full-image-slot.ld{background:transparent!important;box-shadow:none!important}')&&css.includes('.character-full-image-slot.icon{background:transparent!important;box-shadow:none!important}'),"LD와 아이콘 뒤 회색 판 제거"],
  [views.includes('class="character-profile-overview-page"')&&views.includes('data-character-overview-pane="${key}"')&&state.includes('characterOverviewPane:"basic"'),"개요를 기본·생활·이끌림의 독립된 책 페이지로 구성"],
  [css.includes('left:36.408cqw!important;top:22.816cqw!important')&&css.includes('left:57.815cqw!important;top:23.301cqw!important')&&css.includes('left:77.913cqw!important;top:25.971cqw!important'),"개요 안쪽 세 책갈피의 SVG 좌표와 회전값"],
  [views.includes('class="character-overview-tab-icon"')&&css.includes('top:10.922cqw!important')&&css.includes('width:10.194cqw!important'),"개요 책갈피 통계 아이콘의 SVG 위치와 크기"],
  [views.includes('overview-job-title')&&views.includes('overview-family-home')&&views.includes('overview-license')&&views.includes('overview-alcohol'),"개요 기본 페이지의 전체 항목을 실제 캐릭터 데이터 입력에 연결"],
  [css.includes('transform:rotate(4.09141deg)!important')&&css.includes('background-color:#d9d1be!important'),"개요 기본 내용의 SVG 회전과 값 종이 색상"],
  [css.includes('background-repeat:repeat-x')&&css.includes('background-size:auto 100%'),"벽지를 찌그러뜨리지 않고 높이에 맞춰 가로 타일링"],
  [css.includes('body.is-building-size-preview .mobile-town-shell')&&css.includes('background:transparent!important'),"건물 크기 조절 중 설정창 투명 실시간 미리보기"],
  [gradle.includes('versionCode 139')&&gradle.includes('versionName "1.0.128"'),"Android 개발 버전 139 / 1.0.128"]
];

let failed=0;
for(const [ok,label] of checks){
  console.log(`${ok?"PASS":"FAIL"} ${label}`);
  if(!ok)failed+=1;
}
if(failed)process.exit(1);
