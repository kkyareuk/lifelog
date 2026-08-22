import fs from "node:fs";

const read=file=>fs.readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const views=read("views.js"),app=read("app.js"),simulation=read("simulation.js"),css=read("app.css"),state=read("state.js");
const native=read("android/app/src/main/java/com/drawervillage/app/ProfileExportPlugin.java");
const checks=[
  [views.includes('data-character-ui-version="5"')&&views.includes('data-open-quick-character-settings')&&views.includes('data-open-full-character-settings'),"캐릭터 허브는 빠른 설정과 전체 설정 두 진입점만 제공"],
  [views.includes('assets/character-ui/notebook.png')&&views.includes('assets/character-ui/book.png')&&views.includes('assets/character-ui/post-it.png')&&views.includes('assets/character-ui/clip.png'),"문구 에셋을 독립 투명 이미지로 사용"],
  [!views.includes('const paneButtons=')&&!views.includes('ribbon-profile.png')&&!views.includes('character-pane-ribbon'),"색연필 설정 띠 완전 제거"],
  [views.includes('data-mobile-character-editor-dialog="quick"')&&views.includes('data-field="speechStyle"')&&views.includes('data-field="attractionTarget"'),"빠른 설정 수첩에 핵심 생활 항목 구성"],
  [views.includes('class="mobile-character-full-settings')&&state.includes('characterSettingsView:"hub"')&&app.includes('data-open-full-character-settings'),"전체 설정을 팝업이 아닌 독립 화면 상태로 전환"],
  [views.includes('settings-complete-group personality-complete-settings')&&views.includes('settings-complete-group body-complete-settings')&&!views.includes('personality-advanced-settings')&&!views.includes('body-advanced-settings')&&!views.includes('profile-advanced-settings'),"기존 캐릭터 고급 설정을 접지 않은 전체 항목으로 통합"],
  [css.includes('background:rgba(255,255,255,.9)!important')&&css.includes('-webkit-text-stroke:1px #3a261c!important')&&css.includes('calc(187px + (var(--roster-visible,0) * 81px))')&&css.includes('.character-wallet-roster.is-open'),"캐릭터 선택 팝업은 흰색 90% 배경·외곽선 이름·인원별 높이·전환 애니메이션 사용"],
  [css.includes('button.character-wallet-selected{')&&css.includes('button.character-roster-entry{')&&css.includes('background-color:transparent!important;background-image:none!important'),"선택 캐릭터와 팝업 아이콘 뒤의 개별 버튼 배경 제거"],
  [views.includes('class="character-favorite-object')&&views.includes('favoriteItems=Object.entries(c.favorites'),"전체 설정 책 위에 세계관 선호 물품 미리보기"],
  [views.includes('class="character-roster-add"')&&views.includes('data-open-character-reorder aria-label=')&&views.includes('class="character-roster-close"'),"추가·정렬·닫기를 아이콘 행동으로 압축"],
  [css.includes('font-size:12px!important')&&css.includes('top:4.035dvh!important')&&css.includes('top:5.998dvh!important')&&css.includes('left:22.57vw!important;top:1.745dvh!important')&&css.includes('color:#fff!important;-webkit-text-fill-color:#fff!important'),"홈 날짜 12px·흰색·시간 위 배치 및 이름/시간 하단 정렬"],
  [css.includes('pill-left.png')&&css.includes('pill-right.png')&&css.includes('pill-middle.png')&&css.includes('height:22px!important'),"프로필 내보내기·저장·삭제 버튼에 원본 버튼 에셋 적용"],
  [css.includes('rotate(-25.6648deg)')&&css.includes('rotate(12.7923deg)')&&css.includes('width:26.14%!important;height:19.57%!important'),"전체 설정 책의 선호 물품 스티커 크기와 각도 고증"],
  [views.includes('catalog:"Dictionary"')&&views.includes('catalog:"辞典"')&&views.includes('catalog:"사전"'),"사전 명칭 한국어·영어·일본어 적용"],
  [simulation.includes('repairSelfNamedPartnerText')&&!simulation.includes('const swap=value=>String(value||"").split(viewer.name)'),"상대 관점 변환의 자기 자신 동행 문장 방지"],
  [simulation.includes('participantIds.every')&&simulation.includes('sameLiveLocation(item,participantCurrent)'),"저장된 공동 장면을 참가자 현재 위치와 재검증"],
  [views.includes('const effectCount=tone==="sleep"?0:tone==="sad"?6:4')&&css.includes('.native-app .native-scene-effects i')&&css.includes('animation:native-sleep-head 4.6s ease-in-out infinite'),"모바일 장면 파티클 수는 경량화하고 캐릭터 애니메이션은 유지"],
  [native.includes('@CapacitorPlugin(name = "ProfileExport")')&&native.includes('MediaStore.Images')&&native.includes('PdfDocument'),"Android 프로필 PNG·PDF 내보내기 유지"],
  [views.includes('data-birthday-part="month"')&&views.includes('data-birthday-part="day"')&&app.includes('patch.birthday='),"기존 생일 월·일 저장 유지"]
];
const failed=checks.filter(([ok])=>!ok);
checks.forEach(([ok,label])=>console.log(`${ok?"✓":"✗"} ${label}`));
if(failed.length)process.exit(1);
