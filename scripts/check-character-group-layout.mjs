import fs from "node:fs";
import path from "node:path";

const root=path.resolve(import.meta.dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const views=read("views.js");
const css=read("app.css");
const relationshipMainRules=(css.match(/html\.native-app\[data-active-tab="relationship"\] main\{/g)||[]).length;

const checks=[
  [views.includes('class="character-group-avatars"')&&views.includes('class="character-group-copy"')&&views.includes('class="character-group-actions"'),"그룹 아이콘·이름·동작 영역을 독립 구조로 렌더링"],
  [css.includes('grid-template-areas:"avatars copy" "actions actions"'),"좁은 화면에서는 편집·삭제를 별도 행으로 배치"],
  [css.includes('.character-group-copy b{font-size:18px')&&css.includes('word-break:keep-all'),"그룹 이름이 한 글자 폭으로 찌그러지지 않음"],
  [css.includes('.character-group-manager>.title>button{align-self:end;width:88px;min-height:56px'),"그룹 만들기 버튼이 설명 영역을 과도하게 침범하지 않음"],
  [css.includes('.relationship-page{\n    display:grid!important')&&css.includes('height:max-content!important;\n    min-height:0!important'),"그룹 목록 아래 관계 화면이 내용 높이만 사용"],
  [css.includes('.relationship-pair-magnet{display:grid!important;grid-template-columns:minmax(0,1fr)!important')&&css.includes('height:max-content!important'),"현재 단일 열 관계 편집 구조와 CSS가 일치"],
  [relationshipMainRules===1&&!css.includes('관계 화면도 바깥 문서는 움직이지 않고 두 룰렛만 내부에서 돈다.'),"모바일 관계 화면 높이·overflow 규칙이 한 곳에만 존재"],
  [css.includes('scroll-padding-bottom:max(96px,env(safe-area-inset-bottom))')&&css.includes('touch-action:pan-y'),"관계 설정 버튼까지 main 세로 스크롤 허용"],
  [css.includes('dialog.character-view-dialog form{')&&css.includes('overflow-y:auto!important')&&css.includes('max-height:calc(100dvh - 12px)!important'),"관계 설정 팝업도 독립적으로 끝까지 스크롤"]
];

const failed=checks.filter(([ok])=>!ok);
checks.forEach(([ok,label])=>console.log(`${ok?"PASS":"FAIL"} ${label}`));
if(failed.length){
  console.error(`\n${failed.length} character group layout regression check(s) failed.`);
  process.exit(1);
}
console.log(`\nPASS ${checks.length} character group layout regression checks.`);
