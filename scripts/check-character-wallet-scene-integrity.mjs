import fs from "node:fs";

const read=file=>fs.readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const views=read("views.js"),app=read("app.js"),simulation=read("simulation.js"),css=read("app.css");
const native=read("android/app/src/main/java/com/drawervillage/app/ProfileExportPlugin.java");
const checks=[
  [views.includes('class="character-wallet-selected"')&&views.includes('c.icon?'),"선택됨 위 칸은 SD 아이콘 전용"],
  [views.includes('class="character-registration-card"')&&css.includes('assets/character-ui/wallet.png'),"SVG 카드지갑 에셋 기반 주민등록증"],
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
