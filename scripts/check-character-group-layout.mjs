import fs from "node:fs";
import path from "node:path";

const root=path.resolve(import.meta.dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const views=read("views.js");
const app=read("app.js");
const css=read("app.css");

const checks=[
  [views.includes('class="relationship-choice-row"')&&views.includes('class="relationship-hero-pair"')&&views.includes('class="relationship-reality-pill"'),"SVG 시안의 캐릭터 선택·큰 캐릭터·현재 단계 구조"],
  [views.includes('class="relationship-stage-actions"')&&views.includes('data-open-view-dialog')&&views.includes('data-open-official-relations')&&views.includes('data-add-character-group'),"관계 설정·공식 관계·목록·그룹 동작을 한 화면에 배치"],
  [views.includes('class="character-view-fields relationship-all-fields"')&&!views.includes('class="settings-advanced-group relationship-advanced-settings"'),"16개 감정 항목을 고급 설정 없이 모두 펼침"],
  [css.includes('--relationship-paper:#eee6d3')&&css.includes('background-size:72px 72px!important'),"베이지 체크무늬 관계 배경"],
  [css.includes('height:100dvh!important')&&css.includes('overflow-y:hidden!important')&&css.includes('data-active-tab="relationship"'),"모바일 관계 화면 문서 스크롤 차단"],
  [css.includes('.relationship-all-fields')&&css.includes('grid-template-columns:repeat(2,minmax(0,1fr))!important'),"관계 감정 편집을 두 열 한 화면으로 배치"],
  [views.includes('data-official-card')&&views.includes('data-official-page-label')&&app.includes('data-official-page'),"공식 관계 목록을 한 장씩 넘기는 페이지 구조"],
  [app.includes('RELATION_DEFAULT_STAGE')&&app.includes('친구:"편한 친구"')&&app.includes('연인:"편안한 연인"')&&app.includes('라이벌:"경쟁하며 의식함"'),"관계 유형을 들었을 때 자연스러운 기본 단계"],
  [app.includes('relationship-fullscreen-dialog')&&!app.includes('relation-official-advanced'),"공식 관계 설정을 고급 접힘 없이 전체 화면으로 제공"]
];

const failed=checks.filter(([ok])=>!ok);
checks.forEach(([ok,label])=>console.log(`${ok?"PASS":"FAIL"} ${label}`));
if(failed.length){
  console.error(`\n${failed.length} character group layout regression check(s) failed.`);
  process.exit(1);
}
console.log(`\nPASS ${checks.length} character group layout regression checks.`);
