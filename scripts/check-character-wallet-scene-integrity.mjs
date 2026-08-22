import fs from "node:fs";

const read=file=>fs.readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const views=read("views.js"),app=read("app.js"),simulation=read("simulation.js"),css=read("app.css"),theme=read("theme.css");
const native=read("android/app/src/main/java/com/drawervillage/app/ProfileExportPlugin.java");
const checks=[
  [views.includes('class="character-wallet-selected"')&&views.includes(':c.photo')&&views.includes('class="avatar profile-photo-fallback"')&&views.includes('character-wallet-default-profile'),"선택 칸은 SD 아이콘, 프로필 사진, 기본 더미 순서로 사용"],
  [css.includes('.character-wallet-selected>span{')&&css.includes('background:transparent!important'),"선택 이미지 뒤 회색 상자 제거"],
  [views.includes('class="character-registration-card"')&&css.includes('assets/character-ui/wallet.png'),"SVG 카드지갑 에셋 기반 주민등록증"],
  [views.includes('class="character-registration-photo" data-image="photo"')&&css.includes('"KCCHanbit",sans-serif!important'),"주민등록증 사진 칸 직접 선택과 KCC 안내문"],
  [views.includes('data-character-ui-version="3"')&&theme.includes('not([data-character-ui-version="3"])'),"전용 SVG 화면의 테마 덮어쓰기 차단"],
  [css.includes(':not([data-active-tab="character"]) main{')&&css.includes('#app>main{width:100vw!important'),"캐릭터 화면 공통 모바일 여백 차단"],
  [css.includes('-webkit-line-clamp:3!important')&&css.includes('font-size:clamp(11px,3.25vw,14px)'),"접힌 지금 이 순간 설명 3줄과 글자 잘림 보정"],
  [views.includes('data-birthday-part="month"')&&views.includes('data-birthday-part="day"')&&app.includes('patch.birthday='),"생일 월·일 분리 입력과 저장"],
  [native.includes('@CapacitorPlugin(name = "ProfileExport")')&&native.includes('MediaStore.Images')&&app.includes('nativePlugin.savePng'),"Android 프로필 PNG 직접 저장"],
  [native.includes('PdfDocument')&&app.includes('nativePlugin.savePdf'),"Android 프로필 PDF 직접 저장"],
  [simulation.includes('cleanSelfCompanionEntries')&&simulation.includes('selfScene'),"자기 자신과 함께 있다는 로그 제거"],
  [simulation.includes('namedPartnerIsPresent')&&simulation.includes('sameLiveLocation(current,baseEventFor'),"서로 다른 장소의 대화 차단"],
  [simulation.includes('sharedActionText')&&views.includes('entry?.sharedActionText||text'),"공동 장면 소품 기준 공유"],
  [css.includes('background-position:center bottom!important'),"홈 상단 목재 에셋 하단 기준 크롭"],
  [!views.includes('const drawerLogLabel='),"홈 카드의 서랍 로그 제목 제거"]
];
const failed=checks.filter(([ok])=>!ok);
checks.forEach(([ok,label])=>console.log(`${ok?"✓":"✗"} ${label}`));
if(failed.length)process.exit(1);
