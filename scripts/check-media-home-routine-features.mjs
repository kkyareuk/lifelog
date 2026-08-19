import fs from "node:fs";
import path from "node:path";

const root=path.resolve(import.meta.dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const app=read("app.js"),state=read("state.js"),views=read("views.js"),media=read("local-media.js"),css=read("app.css");

const checks=[
  [media.includes("return {found:jobs.length,resolved,pending")&&app.includes("refreshLocalMedia")&&app.includes('window.addEventListener("pageshow",restoreForegroundState)'),"앱 복귀 시 기기 사진 복원 재시도"],
  [app.includes("isPendingLocalImage(image.getAttribute")&&css.includes('img[src^="local-media://"]{visibility:hidden}'),"복원 전 내부 사진 참조의 깨진 이미지 차단"],
  [app.includes("Media restore: found")&&app.includes("pending ${lastLocalMediaResult.pending}"),"피드백 진단에 사진 복원 상태 포함"],
  [media.includes("estimatedDataUrlBytes")&&media.includes("cloudCount:cloud.size")&&app.includes("기기 원본 ${usage.count}장")&&app.includes("클라우드 사본 ${cloudCount}장"),"기존 사진과 클라우드 사본을 구분한 저장 공간 집계"],
  [state.includes("floorCount:1,activeFloor:1")&&views.includes('data-home-floor-count')&&views.includes('data-home-floor='),"집 층수 및 층별 방 화면"],
  [state.includes("room.layout={x:")&&app.includes("captureRoomCanvasLayouts")&&app.includes("bindRoomGeometryHandle"),"방 위치·모서리 크기 직접 조절 저장"],
  [views.includes('data-room-resize=')&&css.includes(".room-resize-handle"),"방 크기 조절 손잡이"],
  [state.includes("export function updateRoutineDays")&&app.includes('name="day"')&&app.includes("여러 개 선택 가능"),"주간 일정 여러 요일 동시 적용"]
];

const failed=checks.filter(([ok])=>!ok);
checks.forEach(([ok,label])=>console.log(`${ok?"PASS":"FAIL"} ${label}`));
if(failed.length)process.exit(1);
console.log(`\nPASS ${checks.length} media, home, and routine feature checks.`);
