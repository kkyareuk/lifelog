import fs from "node:fs";
import path from "node:path";

const root=path.resolve(import.meta.dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const views=read("views.js");
const app=read("app.js");
const css=read("app.css");

const checks=[
  [views.includes('class="relationship-choice-row"')&&views.includes('class="relationship-hero-pair"')&&views.includes('class="relationship-reality-pill"'),"SVG 시안의 캐릭터 선택·큰 캐릭터·현재 단계 구조"],
  [views.includes('class="relationship-stage-actions"')&&views.includes('data-open-view-dialog')&&views.includes('data-open-official-relations')&&views.includes('data-open-character-groups')&&views.includes('data-open-relationship-map'),"시선·공식 관계·그룹·관계도 네 메뉴를 한 화면에 배치"],
  [views.includes('class="relationship-character-selected"')&&views.includes('data-relationship-roster')&&app.includes('data-relationship-character'),"캐릭터 탭과 같은 선택됨 조합형 버튼과 세로 선택 팝업"],
  [views.includes('data-view-summary-phrase')&&views.includes('--sentence-name:')&&views.includes('<mark style="--sentence-name:')&&css.includes('-webkit-text-stroke:2.7px #000'),"캐릭터 이름은 테마색, 관계 문장은 흰색의 두꺼운 검은 외곽선으로 분리"],
  [views.includes('class="relationship-composite-action"')&&css.includes('pill-left.png')&&css.includes('pill-middle.png')&&css.includes('pill-right.png'),"네 하단 메뉴를 공통 조합형 버튼으로 구성"],
  [views.includes('class="character-view-fields relationship-all-fields"')&&!views.includes('class="settings-advanced-group relationship-advanced-settings"'),"16개 감정 항목을 고급 설정 없이 모두 펼침"],
  [css.includes('url("./assets/home-ui/relationship-mosaic.png")')&&fs.existsSync(path.join(root,"assets/home-ui/relationship-mosaic.png")),"SVG와 같은 원본 베이지 모자이크 관계 배경"],
  [css.includes('height:100dvh!important')&&css.includes('overflow-y:hidden!important')&&css.includes('data-active-tab="relationship"'),"모바일 관계 화면 문서 스크롤 차단"],
  [css.includes('.relationship-all-fields')&&css.includes('grid-template-columns:151px 159px!important')&&css.includes('top:144px'),"시선 설정을 SVG의 두 열 좌표로 한 화면에 배치"],
  [views.includes('data-official-card')&&views.includes('relationship-list-create-card')&&views.includes('data-relation-search')&&app.includes('bindRelationshipListFilter'),"공식 관계 메뉴가 검색·분류 가능한 목록을 먼저 열고 새 관계 추가로 이어짐"],
  [app.includes('RELATION_DEFAULT_STAGE')&&app.includes('친구:"편한 친구"')&&app.includes('연인:"편안한 연인"')&&app.includes('라이벌:"경쟁하며 의식함"'),"관계 유형을 들었을 때 자연스러운 기본 단계"],
  [app.includes('relationship-fullscreen-dialog')&&!app.includes('relation-official-advanced'),"공식 관계 설정을 고급 접힘 없이 전체 화면으로 제공"],
  [css.includes('top:130px')&&css.includes('top:294px')&&css.includes('bottom:36px'),"선택 캐릭터를 뒤로가기와 분리하고 메뉴를 SVG 좌표에 배치"],
  [css.includes('linear-gradient(90deg,var(--relationship-left),var(--relationship-right))')&&css.includes('-webkit-background-clip:text'),"관계 요약 글자에 왼쪽에서 오른쪽 캐릭터 순서의 메인 컬러 그라데이션"],
  [app.includes('class="official-member-section"')&&app.includes('class="official-order-card"')&&app.includes('class="official-past-toggle"')&&app.includes('class="official-name-field"'),"공식 관계 설정을 SVG의 관계 이름·구성원·과거 관계·표시 순서 구조로 제공"],
  [views.includes('data-character-group-list-dialog')&&views.includes('relationship-group-create-card')&&app.includes('data-open-character-groups'),"그룹 메뉴가 그룹 목록을 먼저 열고 새 그룹 추가로 이어짐"],
  [css.includes('.official-relation-fields>[hidden]{display:none!important}')&&app.includes('f.querySelector(".official-fault").hidden=f.temporalStatus.value!=="past"'),"관계가 끝난 이유는 과거 관계에서만 표시"],
  [css.includes('@media(min-width:721px)')&&css.includes('max-width:1180px')&&css.includes('max-width:1100px'),"태블릿·넓은 화면에서 관계 무대와 목록을 화면 폭에 맞게 재배치"],
  [views.includes('relationship-motion-${relationshipMotion}')&&css.includes('@keyframes relationship-close-left')&&css.includes('@keyframes relationship-flash'),"관계 감정에 맞춘 캐릭터와 화면 효과"],
  [views.includes('data-relationship-map-content')&&app.includes('content.dataset.loaded!=="1"')&&app.includes('relationshipMapMarkup(ids)'),"무거운 관계도는 실제로 열 때만 생성"],
  [views.includes('data-relationship-map-scope')&&views.includes('data-relationship-map-character')&&app.includes('kind==="town"')&&app.includes('kind==="group"'),"관계도 표시 캐릭터를 전체·마을·그룹·개별 단위로 선택"],
  [views.includes('legend:["강한 사랑"')&&views.includes('stroke-width="5"')&&!views.includes('class="map-official"')&&!views.includes('class="map-heart'),"관계도는 공식관계·요약 문구 없이 감정별 화살표 색과 범례만 표시"],
  [app.includes('window.Capacitor?.Plugins?.ProfileExport')&&app.includes('document.body.append(link)')&&app.includes('서랍마을-인물관계도-'),"Android 네이티브와 브라우저에서 관계도 PNG 저장 지원"],
  [app.includes('data-new-relation-tag')&&app.includes('data-add-relation-tag')&&!app.includes('const relationTagOptions='),"관계 태그를 정해진 목록이 아니라 사용자 직접 입력으로 생성"],
  [css.includes('relationship-map-node')&&css.includes('overflow:visible')&&css.includes('object-fit:contain!important'),"관계도 캐릭터 아이콘 윗부분이 잘리지 않게 표시"]
];

const failed=checks.filter(([ok])=>!ok);
checks.forEach(([ok,label])=>console.log(`${ok?"PASS":"FAIL"} ${label}`));
if(failed.length){
  console.error(`\n${failed.length} character group layout regression check(s) failed.`);
  process.exit(1);
}
console.log(`\nPASS ${checks.length} character group layout regression checks.`);
