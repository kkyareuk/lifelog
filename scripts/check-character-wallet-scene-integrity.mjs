import fs from "node:fs";

const read=file=>fs.readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const views=read("views.js"),app=read("app.js"),simulation=read("simulation.js"),css=read("app.css"),state=read("state.js"),interfaceCss=read("interface-system.css"),themeCss=read("theme.css");
const native=read("android/app/src/main/java/com/drawervillage/app/ProfileExportPlugin.java");
const checks=[
  [views.includes('data-character-ui-version="8"')&&views.includes('data-open-quick-character-settings')&&views.includes('data-open-full-character-settings'),"캐릭터 허브는 빠른 설정과 전체 설정 두 진입점만 제공"],
  [views.includes('assets/character-ui/character-cloth.png')&&views.includes('assets/character-ui/book.png')&&views.includes('assets/character-ui/tape.png')&&views.includes('assets/character-ui/key.png')&&views.includes('assets/character-ui/clip.png'),"새 SVG 문구 에셋을 독립 투명 이미지로 사용"],
  [!views.includes('const paneButtons=')&&!views.includes('ribbon-profile.png')&&!views.includes('character-pane-ribbon'),"색연필 설정 띠 완전 제거"],
  [views.includes('data-mobile-character-editor-dialog="quick"')&&views.includes('notebook-white.svg')&&views.includes('data-field="speechStyle"')&&views.includes('data-field="attractionTarget"'),"빠른 설정을 흰색 SVG 수첩과 핵심 생활 항목으로 구성"],
  [views.includes('class="mobile-character-full-settings')&&state.includes('characterSettingsView:"hub"')&&app.includes('data-open-full-character-settings'),"전체 설정을 팝업이 아닌 독립 화면 상태로 전환"],
  [views.includes('settings-complete-group personality-complete-settings')&&views.includes('settings-complete-group body-complete-settings')&&!views.includes('personality-advanced-settings')&&!views.includes('body-advanced-settings')&&!views.includes('profile-advanced-settings'),"기존 캐릭터 고급 설정을 접지 않은 전체 항목으로 통합"],
  [css.includes('background:rgba(255,255,255,.9)!important')&&css.includes('-webkit-text-stroke:1px #111!important')&&css.includes('calc(184px + (var(--roster-visible,0) * 84px))')&&css.includes('.character-wallet-roster.is-open'),"캐릭터 선택 팝업은 흰색 90% 배경·외곽선 이름·인원별 높이·전환 애니메이션 사용"],
  [css.includes('button.character-wallet-selected{')&&css.includes('button.character-roster-entry{')&&css.includes('background-color:transparent!important;background-image:none!important'),"선택 캐릭터와 팝업 아이콘 뒤의 개별 버튼 배경 제거"],
  [css.includes('width:5em!important;max-width:5em!important')&&css.includes('word-break:break-all!important')&&css.includes('max-height:none!important'),"팝업 이름은 한 줄 5글자 폭으로 표시하고 말줄임 없이 다음 줄로 줄바꿈"],
  [views.includes('class="character-favorite-object')&&views.includes('favoriteItems=Object.entries(c.favorites'),"전체 설정 책 위에 세계관 선호 물품 미리보기"],
  [views.includes('class="character-roster-entry character-roster-new"')&&views.includes('data-open-character-reorder aria-label=')&&views.includes('class="character-roster-close"'),"목록 마지막 + 캐릭터 칸과 정렬·닫기 아이콘 제공"],
  [css.includes('font-size:12px!important')&&css.includes('top:3.487dvh!important')&&css.includes('top:5.45dvh!important')&&css.includes('left:22.57vw!important;top:1.197dvh!important')&&css.includes('-webkit-text-stroke:.85px #000!important'),"홈 이름·날짜·시간을 함께 올리고 날짜를 12px 흰색 외곽선·시간 우측 정렬로 배치"],
  [views.includes('class="character-draft-action" data-export-profile><span>')&&css.includes('grid-template-columns:var(--draft-button-cap) minmax(0,1fr) var(--draft-button-cap)!important')&&css.includes('button::before')&&css.includes('button::after')&&css.includes('button>span'),"내보내기·저장·삭제 버튼을 홈 캡·가운데·캡 3조각 구조로 연결"],
  [views.includes('class="character-checker-background"')&&css.includes('.character-checker-background{position:absolute!important;z-index:0!important')&&css.includes('width:100vw!important;height:100dvh!important'),"체크 종이를 전역 배경 규칙에 덮이지 않는 독립 전체 화면 레이어로 적용"],
  [css.includes('radial-gradient(ellipse 50% 50% at 50% 50%')&&css.includes('mix-blend-mode:multiply!important')&&css.includes('z-index:30!important'),"SVG의 가장자리 필터를 비버튼 화면에 적용하고 조작 버튼은 위 레이어로 분리"],
  [css.includes('left:-8.9806vw!important;top:58.6082dvh!important;width:102.4272vw!important;height:38.6041dvh!important')&&css.includes('rotate(-10.5736deg)')&&css.includes('left:66.2621vw!important;top:49.9455dvh!important')&&css.includes('rotate(-4.10812deg)')&&css.includes('left:32.0388vw!important;top:-6.9793dvh!important'),"SVG 기준 펼친 책·테이프·클립의 위치·크기·각도 적용"],
  [css.includes('left:14.6623vw!important;top:51.7350dvh!important')&&css.includes('width:83.0621vw!important;height:36.3091dvh!important')&&css.includes('rotate(13.6207deg)')&&css.includes('left:55.2500vw!important;top:90.8397dvh!important')&&css.includes('rotate(5.26953deg)'),"SVG 기준 붉은 천과 열쇠의 위치·크기·각도 적용"],
  [css.includes('rotate(-25.6648deg)')&&css.includes('rotate(12.7923deg)')&&css.includes('rotate(-22.8827deg)')&&css.includes('width:16.9903vw!important;height:7.6336dvh!important'),"펼친 책 위 선호 물품 3자리의 SVG 화면 좌표 보존"],
  [views.includes('"빠른 설정 바로가기":"Quick settings shortcut"')&&views.includes('"전체 설정 바로가기":"Full settings shortcut"')&&views.includes('"빠른 설정 바로가기":"クイック設定へ"')&&views.includes('"전체 설정 바로가기":"全体設定へ"'),"빠른·전체 설정 바로가기 영어·일본어 번역"],
  [css.includes('left:-5.02447vw!important;top:17.64329dvh!important')&&css.includes('left:4.13813vw!important;top:20.74242dvh!important')&&css.includes('left:46.99029vw!important;top:25.55943dvh!important')&&css.includes('left:69.51456vw!important;top:23.82443dvh!important'),"주민등록증 종이·사진·이름·나이 좌표를 412×917 SVG 수치로 분리 적용"],
  [views.includes('aria-pressed="${(c.personalityTypes||[]).includes(value)}"')&&app.includes('button.setAttribute("aria-pressed",String(selected))')&&views.includes('--character-accent:${esc(c.theme?.primary')&&css.includes('background:var(--character-accent)!important'),"빠른 설정 성격 키워드는 전체 설정 데이터와 연동되고 공통 팔레트에 치환되지 않는 캐릭터 테마색으로 선택 상태를 표시"],
  [views.includes('class="character-setting-cloth" aria-hidden="true"')&&css.includes('-webkit-mask:url("./assets/character-ui/character-cloth.png")')&&css.includes('background:var(--character-accent)!important'),"책 뒤 천을 공통 팔레트에 치환되지 않는 캐릭터 테마색으로 표시"],
  [interfaceCss.includes(':not(.mobile-character-dashboard[data-character-ui-version="8"] *)')&&interfaceCss.includes(':not(.character-quick-settings-dialog *)')&&themeCss.includes(':not(.mobile-character-dashboard[data-character-ui-version="8"] *)'),"공통 테마 글자색이 캐릭터 허브·빠른 설정의 전용 흰색과 캐릭터색을 덮어쓰지 않음"],
  [css.includes('.character-registration-fields dt{max-width:none!important;overflow:visible!important;text-overflow:clip!important}')&&!css.includes('character-registration-field-name dt{left:46.29854vw!important;top:23.95856dvh!important;max-width'),"주민등록증 이름·나이 등 항목명을 한 글자 말줄임 없이 표시"],
  [css.includes('color:#FFF!important;-webkit-text-fill-color:#FFF!important;-webkit-text-stroke:1px #111!important')&&css.includes('text-shadow:-1px -1px 0 #111,1px -1px 0 #111'),"캐릭터 선택 팝업 이름을 WebView에서도 흰색 검은 외곽선으로 표시"],
  [simulation.includes('function interactionInitiativeScore')&&simulation.includes('const initiator=interactionInitiator')&&simulation.includes('firstAction=firstLeads?chosen.first:chosen.second'),"공동 장면의 선행 발화 역할을 캐릭터 성향에 맞춰 배정"],
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
