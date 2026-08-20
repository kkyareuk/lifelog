import fs from "node:fs";
import path from "node:path";

const root=path.resolve(import.meta.dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const app=read("app.js"),css=read("app.css"),simulationSource=read("simulation.js"),views=read("views.js");

const checks=[
  [css.includes('html.native-app[data-active-tab="catalog"] main{overflow-y:hidden!important}')&&css.includes('html.native-app[data-active-tab="catalog"] .catalog-shell'),"취향사전 단일 스크롤 영역"],
  [app.includes('catalogShell.addEventListener("change"')&&app.includes('catalogShell.addEventListener("click"'),"취향사전 카드 이벤트 위임"],
  [app.includes("function replaceCatalogCard")&&app.includes("catalogCardMarkup(kind,item)"),"전체 화면 대신 도감 카드만 갱신"],
  [app.includes('button.classList.toggle("on",selected)')&&!app.includes('stabilizeInteractiveScroll(document.querySelector(".catalog-shell")'),"향수·옷 다중 선택은 전체 화면을 다시 그리지 않음"],
  [simulationSource.includes("routineEndMinute")&&simulationSource.includes("routineReturned:true"),"일정 종료·귀가 메타데이터"],
  [simulationSource.includes('purpose.kind!=="routine"'),"등록 일정을 밤 8시 일괄 귀가에서 제외"],
  [simulationSource.includes('ENGINE_VERSION="20260820-scene-occupancy2"'),"기존 당일 타임라인 재계산"],
  [simulationSource.includes("Heading home after")&&simulationSource.includes("を終えて帰宅中"),"귀가 장면 영어·일본어 번역"],
  [simulationSource.includes(":interactionPair(group)")&&simulationSource.includes("preferred.first.id!==c.id&&preferred.second.id!==c.id"),"같은 장소의 결정적 2인 짝 선택"],
  [simulationSource.includes("otherEvent.groupInteraction&&!otherInteractionIds.includes(c.id)"),"이미 다른 장면에 참여한 캐릭터 중복 방지"],
  [simulationSource.includes("committedSharedSceneFor")&&simulationSource.includes("reservedScene")&&simulationSource.includes("sameLiveLocation"),"같은 시각 공동 장면의 인물 점유 예약"],
  [views.includes("entry?.groupInteraction&&declaredPartnerIds.length?[]")&&views.includes("inferredPartnerIds"),"명시된 장면에 제3자 아이콘을 덧붙이지 않음"]
];

const failed=checks.filter(([ok])=>!ok);
checks.forEach(([ok,label])=>console.log(`${ok?"PASS":"FAIL"} ${label}`));
if(failed.length)process.exit(1);
console.log(`\nPASS ${checks.length} catalog and routine regression checks.`);
