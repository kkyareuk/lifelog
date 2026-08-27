import fs from "node:fs";
import path from "node:path";

const root=path.resolve(import.meta.dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const views=read("views.js");
const app=read("app.js");
const css=read("app.css");

const checks=[
  [views.includes('class="relationship-choice-row"')&&views.includes('class="relationship-hero-pair"')&&views.includes('class="relationship-reality-pill"'),"SVG 시안의 캐릭터 선택·큰 캐릭터·현재 단계 구조"],
  [views.includes('class="relationship-stage-actions"')&&views.includes('data-open-view-dialog')&&views.includes('data-add-rel')&&views.includes('data-add-character-group')&&views.includes('data-open-relationship-map'),"시선·공식 관계·그룹·관계도 네 메뉴를 한 화면에 배치"],
  [views.includes('class="relationship-character-selected"')&&views.includes('data-relationship-roster')&&app.includes('data-relationship-character'),"캐릭터 탭과 같은 선택됨 조합형 버튼과 세로 선택 팝업"],
  [views.includes('data-view-summary-phrase')&&views.includes('--sentence-name:')&&css.includes('-webkit-text-stroke:2px #1b1310'),"캐릭터 이름은 테마색, 관계 문장은 흰색 검은 외곽선으로 분리"],
  [views.includes('class="relationship-composite-action"')&&css.includes('pill-left.png')&&css.includes('pill-middle.png')&&css.includes('pill-right.png'),"네 하단 메뉴를 공통 조합형 버튼으로 구성"],
  [views.includes('class="character-view-fields relationship-all-fields"')&&!views.includes('class="settings-advanced-group relationship-advanced-settings"'),"16개 감정 항목을 고급 설정 없이 모두 펼침"],
  [css.includes('--relationship-paper:#dacbab')&&css.includes('background-position:0 0,0 66px,66px -66px,-66px 0!important')&&css.includes('background-size:132px 132px!important'),"대비가 보이는 베이지 체크무늬 관계 배경"],
  [css.includes('height:100dvh!important')&&css.includes('overflow-y:hidden!important')&&css.includes('data-active-tab="relationship"'),"모바일 관계 화면 문서 스크롤 차단"],
  [css.includes('.relationship-all-fields')&&css.includes('grid-template-columns:repeat(2,minmax(0,1fr))!important'),"관계 감정 편집을 두 열 한 화면으로 배치"],
  [views.includes('data-official-card')&&views.includes('data-official-page-label')&&app.includes('data-official-page')&&app.includes('data-open-official-list-from-editor'),"공식 관계 설정에서 목록을 열고 한 장씩 넘기는 페이지 구조"],
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
