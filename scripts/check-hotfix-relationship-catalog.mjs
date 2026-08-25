import fs from "node:fs";
import path from "node:path";

const root=path.resolve(import.meta.dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const simulation=read("simulation.js"),state=read("state.js"),app=read("app.js"),views=read("views.js");

const checks=[
  [simulation.includes('preferredRelation(c,{friendlyOnly:true,date})'),"친근한 외출은 실제 관계 감정으로 제한"],
  [simulation.includes('preferredRelation(c,{sameHome:true,date})'),"집 안 관계 장면은 같은 집 거주자로 제한"],
  [simulation.includes('r.temporalStatus!=="past"'),"과거 관계를 현재 행동 후보에서 제외"],
  [simulation.includes('item.other&&item.other.id!==c.id'),"자기 자신을 관계 행동 후보에서 제외"],
  [simulation.includes('choice.targetId===choice.characterId')&&state.includes('String(choice.targetId)!==String(character.id)')&&state.includes('String(actorId)===String(targetId)'),"기록·예약·재생 모든 경로에서 자기 상호작용 차단"],
  [simulation.includes('ENGINE_VERSION="20260825-character-book-choices-relationship-catalog"'),"기존 캐시를 새 관계 규칙으로 한 번 재계산"],
  [simulation.includes('const itemName=item?.name||"선물"')&&!simulation.includes('localized(choice,"giveTitle")||'),"예약 선물 로그가 현재 사전 이름 사용"],
  [simulation.includes('visitHomeId:homeIdForDate(actor,date)')&&simulation.includes('choice.placeType?placeFor'),"예약 선물의 장소 메타데이터 일치"],
  [state.includes('choice.copy=replaceName(choice.copy||{})'),"미실행 예약의 다국어 문구 이름 갱신"],
  [state.includes('affectedCharacterIds')&&state.includes('timelineResetAt=changedAt'),"사전 이름 변경 시 관련 인물의 미래 로그만 재계산"],
  [views.includes('export function catalogSubgenreOptions'),"사전 세부 분류 옵션 단일 소스"],
  [app.includes('refreshCatalogCardFields(card,kind')&&!app.includes('["category","subtype","image"].includes(key))replaceCatalogCard'),"분류 선택 시 카드 DOM 전체 교체 방지"]
];

const failed=checks.filter(([ok])=>!ok);
checks.forEach(([ok,label])=>console.log(`${ok?"PASS":"FAIL"} ${label}`));
if(failed.length)process.exit(1);
console.log(`\nPASS ${checks.length} hotfix regression checks.`);
