import fs from "node:fs";

const read=file=>fs.readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const views=read("views.js"),app=read("app.js"),simulation=read("simulation.js"),css=read("app.css"),theme=read("theme.css");
const native=read("android/app/src/main/java/com/drawervillage/app/ProfileExportPlugin.java");
const checks=[
  [views.includes('class="character-wallet-selected"')&&views.includes(':c.photo')&&views.includes('class="avatar profile-photo-fallback"')&&views.includes('character-wallet-default-profile'),"선택 칸은 SD 아이콘, 프로필 사진, 기본 더미 순서로 사용"],
  [css.includes('.character-wallet-selected>span{')&&css.includes('background:transparent!important'),"선택 아이콘 뒤 미색 버튼 상자 제거"],
  [views.includes('class="character-registration-card"')&&css.includes('assets/character-ui/wallet.png'),"SVG 카드지갑 에셋 기반 주민등록증"],
  [views.includes('class="character-registration-photo" data-image="photo"')&&css.includes('"KCCHanbit",sans-serif!important'),"주민등록증 사진 칸 직접 선택과 KCC 안내문"],
  [views.includes('data-character-ui-version="4"')&&theme.includes(':not(.character-wallet-selected)')&&theme.includes(':not(.character-roster-entry)'),"전용 SVG 화면의 테마 덮어쓰기 차단"],
  [css.includes(':not([data-active-tab="character"]) main{')&&css.includes('#app>main{width:100vw!important'),"캐릭터 화면 공통 모바일 여백 차단"],
  [css.includes('-webkit-line-clamp:3!important')&&css.includes('font-size:clamp(11px,3.25vw,14px)'),"접힌 지금 이 순간 설명 3줄과 글자 잘림 보정"],
  [views.includes('data-birthday-part="month"')&&views.includes('data-birthday-part="day"')&&app.includes('patch.birthday='),"생일 월·일 분리 입력과 저장"],
  [native.includes('@CapacitorPlugin(name = "ProfileExport")')&&native.includes('MediaStore.Images')&&app.includes('nativePlugin.savePng'),"Android 프로필 PNG 직접 저장"],
  [native.includes('PdfDocument')&&app.includes('nativePlugin.savePdf'),"Android 프로필 PDF 직접 저장"],
  [simulation.includes('cleanSelfCompanionEntries')&&simulation.includes('selfScene'),"자기 자신과 함께 있다는 로그 제거"],
  [simulation.includes('namedPartnerIsPresent')&&simulation.includes('sameLiveLocation(current,baseEventFor'),"서로 다른 장소의 대화 차단"],
  [simulation.includes('sharedActionText')&&views.includes('entry?.sharedActionText||text'),"공동 장면 소품 기준 공유"],
  [css.includes('background-position:center bottom!important')&&css.includes('background-color:transparent!important'),"홈 상단 목재 에셋 하단 기준 크롭과 투명 여백의 갈색 노출 제거"],
  [views.includes('class="character-roster-add"')&&views.includes('class="character-roster-reorder"')&&views.includes('>＋</button>')&&!views.includes('class="character-pane-add"')&&!css.includes('.character-roster-add{position:absolute!important;left:3.4vw!important;top:18.87dvh!important;width:12.62vw!important;height:5.67dvh!important;min-height:0!important;margin:0!important;padding:0!important;border:0!important;background:transparent url("./assets/character-ui/add.png")'),"추가 버튼을 캐릭터 선택 서랍의 단순 + 표시로 변경"],
  [css.includes('assets/home-ui/pill-left.png')&&css.includes('.character-draft-actions button:nth-child(3)')&&css.includes('color:#FFF5DD!important')&&css.includes('font:400 clamp(11px,3.15vw,14px)/1 "KCCHanbit"'),"선택·내보내기·저장·삭제 버튼을 KCC 손그림 알약 에셋으로 통일"],
  [css.includes('.character-wallet-art{')&&css.includes('z-index:8!important')&&css.includes('.character-registration-card{')&&css.includes('z-index:4!important')&&css.includes('pointer-events:none!important'),"카드지갑을 주민등록증 위에 배치하면서 사진 선택 영역 유지"],
  [css.includes('.character-pane-ribbon:nth-child(1)')&&css.includes('top:57.68dvh!important')&&css.includes('.character-pane-ribbon:nth-child(6)')&&css.includes('top:91.83dvh!important'),"연필 설정 띠를 SVG 좌표와 크기로 복원"],
  [css.includes('font-family:"PuradakGentleGothic"')&&css.includes('.character-registration-field-job{grid-column:1/-1!important')&&css.includes('.character-registration-field-job dd{overflow:visible!important')&&views.includes('{key:"job",label:"직업 종류"')&&!views.includes('["키·몸무게"')&&css.includes('font-weight:300!important')&&css.includes('font-weight:700!important'),"주민등록증 제목·2열 명조 정보와 전체 너비 직업 구조"],
  [css.includes('linear-gradient(180deg,#fff9ebec')&&css.includes('z-index:20!important')&&css.includes('z-index:32!important'),"선택 아이콘 앞·세로로 짙어지는 캐릭터 목록"],
  [css.includes('.character-wallet-selected>b{')&&css.includes('z-index:4!important')&&css.includes('top:12.4dvh!important'),"선택됨 글자판을 아이콘 아래의 앞 레이어로 분리"],
  [css.includes('max-height:23.1dvh!important')&&css.includes('height:39.5dvh!important')&&css.includes('top:27.2dvh!important'),"현재 캐릭터 외 세 명을 한 번에 보이고 추가 인원은 스크롤하는 목록"],
  [css.includes('--character-pill-cap:calc(3.25dvh * .484)')&&css.includes('min-height:29px!important'),"내보내기·저장·삭제 알약 버튼의 세로 크기 확대"],
  [css.includes('.character-roster-reorder{')&&css.includes('top:34.2dvh!important')&&css.includes('text-decoration:none!important'),"위치 바꾸기 밑줄 제거"],
  [css.includes('-webkit-text-stroke:1.25px #000!important')&&css.includes('color:#FFF0F0!important')&&css.includes('color:#F8F0FF!important'),"연필 탭별 밝은 글자와 검은 테두리"],
  [css.includes('overflow-y:auto!important;overscroll-behavior:contain!important')&&css.includes('touch-action:pan-y!important'),"관계 설정 대화상자의 모바일 세로 스크롤"],
  [!views.includes('const drawerLogLabel='),"홈 카드의 서랍 로그 제목 제거"]
];
const failed=checks.filter(([ok])=>!ok);
checks.forEach(([ok,label])=>console.log(`${ok?"✓":"✗"} ${label}`));
if(failed.length)process.exit(1);
