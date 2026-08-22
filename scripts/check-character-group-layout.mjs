import fs from "node:fs";
import path from "node:path";

const root=path.resolve(import.meta.dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const views=read("views.js");
const css=read("app.css");

const checks=[
  [views.includes('class="character-group-avatars"')&&views.includes('class="character-group-copy"')&&views.includes('class="character-group-actions"'),"그룹 아이콘·이름·동작 영역을 독립 구조로 렌더링"],
  [css.includes('grid-template-areas:"avatars copy" "actions actions"'),"좁은 화면에서는 편집·삭제를 별도 행으로 배치"],
  [css.includes('.character-group-copy b{font-size:18px')&&css.includes('word-break:keep-all'),"그룹 이름이 한 글자 폭으로 찌그러지지 않음"],
  [css.includes('.character-group-manager>.title>button{align-self:end;width:88px;min-height:56px'),"그룹 만들기 버튼이 설명 영역을 과도하게 침범하지 않음"],
  [css.includes('.relationship-page{display:grid!important;align-content:start!important')&&css.includes('height:auto!important;min-height:100%!important'),"그룹 목록 아래 관계 화면이 강제 높이로 빈 공간을 만들지 않음"],
  [css.includes('.relationship-pair-magnet{display:flex!important;align-items:flex-start!important')&&css.includes('height:auto!important'),"관계 편집 내용을 위에서부터 자연스럽게 배치"],
  [!css.includes(':is(.relationship-page,.character-view-editor){width:100%!important;max-width:100vw!important;height:100%!important'),"그룹 목록과 관계 편집기에 동일한 100% 높이를 중복 적용하지 않음"]
];

const failed=checks.filter(([ok])=>!ok);
checks.forEach(([ok,label])=>console.log(`${ok?"PASS":"FAIL"} ${label}`));
if(failed.length){
  console.error(`\n${failed.length} character group layout regression check(s) failed.`);
  process.exit(1);
}
console.log(`\nPASS ${checks.length} character group layout regression checks.`);
