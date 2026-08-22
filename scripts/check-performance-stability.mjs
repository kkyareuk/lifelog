import fs from "node:fs";
import path from "node:path";

const root=path.resolve(import.meta.dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const app=read("app.js"),state=read("state.js"),simulation=read("simulation.js"),views=read("views.js");
const media=read("local-media.js"),css=read("app.css"),homeCss=read("home-scene-layout.css");
const prepare=read("scripts/prepare-app.mjs"),gradle=read("android/app/build.gradle");

const checks=[
  [media.includes("export function stringifyLocalMediaState")&&state.includes("stringifyLocalMediaState(state)"),"저장 상태를 복제하지 않는 단일 순회 직렬화"],
  [state.includes("now-lastRecoveryBackupAt<60_000")&&state.includes("lastRecoveryBackupSerialized"),"중복 복구 백업 쓰기 제한"],
  [simulation.includes("const signatureCache=new Map()")&&simulation.includes("cached?.revision===revision"),"시뮬레이션 서명 재사용"],
  [simulation.includes("old.cleanupVersion!==ENGINE_VERSION")&&simulation.includes("cleanupVersion:ENGINE_VERSION"),"생활 로그 정리는 엔진 버전마다 한 번만 실행"],
  [simulation.includes("const applyEntries=nextEntries=>")&&simulation.includes("if(changed){day.entries=nextEntries;save(false,false)}"),"동일 공동 장면의 중복 저장 차단"],
  [views.includes("const cacheSetBounded=")&&!views.includes("renderEventCache.clear()")&&!views.includes("renderTimelineCache.clear()"),"분 단위 장면 캐시를 화면 재렌더 사이에 유지"],
  [app.includes("now-lastLocalMediaHydrationAt<30_000")&&app.includes('document.visibilityState==="hidden"'),"중복 사진 복원과 백그라운드 장면 타이머 중단"],
  [css.includes("content-visibility:auto")&&css.includes("will-change:auto!important")&&homeCss.includes("html.native-platform .native-character-stage.visual-mode-ld>.scene-ld-art"),"Android 비가시 영역 지연 렌더와 연속 합성 애니메이션 제거"],
  [prepare.includes('"world-assets/cozy-town.png"')&&prepare.includes('"world-assets/downtown.png"')&&prepare.includes('"assets/character-ui/paper.png"')&&prepare.includes("excludedAndroidAssets.has(relativePath)"),"미사용 고해상도 배경·종이 원본을 Android 패키지에서 제외"],
  [gradle.includes("versionCode 101")&&gradle.includes('versionName "1.0.93"'),"Play Console용 101 / 1.0.93 버전"]
];

checks.forEach(([ok,label])=>console.log(`${ok?"PASS":"FAIL"} ${label}`));
if(checks.some(([ok])=>!ok))process.exit(1);
console.log(`\nPASS ${checks.length} performance and heat stability checks.`);
