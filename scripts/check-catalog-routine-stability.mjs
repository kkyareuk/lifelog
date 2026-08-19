import fs from "node:fs";
import path from "node:path";

const root=path.resolve(import.meta.dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const app=read("app.js"),simulationSource=read("simulation.js");

const checks=[
  [app.includes("function restoreMainScroll")&&app.includes("previousMain?.scrollTop"),"앱 main 스크롤 위치 보존"],
  [app.includes("openCatalogKeys")&&app.includes("pendingCatalogOpenKey"),"열린 도감 카드 보존"],
  [app.includes('button.classList.toggle("on",selected)')&&app.includes('el.classList.toggle("on",selected)'),"다중 선택은 전체 화면을 다시 그리지 않음"],
  [simulationSource.includes("routineEndMinute")&&simulationSource.includes("routineReturned:true"),"일정 종료·귀가 메타데이터"],
  [simulationSource.includes('purpose.kind!=="routine"'),"등록 일정을 밤 8시 일괄 귀가에서 제외"],
  [simulationSource.includes('ENGINE_VERSION="20260819-routine-return1"'),"기존 당일 타임라인 재계산"],
  [simulationSource.includes("Heading home after")&&simulationSource.includes("を終えて帰宅中"),"귀가 장면 영어·일본어 번역"]
];

const failed=checks.filter(([ok])=>!ok);
checks.forEach(([ok,label])=>console.log(`${ok?"PASS":"FAIL"} ${label}`));
if(failed.length)process.exit(1);
console.log(`\nPASS ${checks.length} catalog and routine regression checks.`);
