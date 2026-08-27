import fs from "node:fs";

const read=file=>fs.readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const views=read("views.js");
const app=read("app.js");
const css=read("app.css");
const bookCss=read("character-book.css");
const interfaceCss=read("interface-system.css");
const sceneCss=read("home-scene-layout.css");
const state=read("state.js");
const gradle=read("android/app/build.gradle");
const audio=read("audio.js");
const simulation=read("simulation.js");
const homeSimulation=read("home-simulation.js");

const checks=[
  [views.includes('const fullActivePane=["visual","profile","body","wardrobe","personality","taste","worldTaste"]'),"이미지 첫 장과 개요·신체·옷장·성격·취향·소지품이 서로 다른 상태"],
  [views.includes('const fullPaneMeta=[["visual","사진·색상·배치"],["profile","개요"')&&views.includes('class="character-book-v9-menu"')&&!bookCss.includes('.character-book-v8-tabs'),"기존 색색 책갈피를 제거하고 상단 조합형 메뉴로 교체"],
  [views.includes('data-full-pane="${fullActivePane}"')&&views.includes('fullActivePane==="visual"?characterFullOverview(c)'),"전체설정 첫 장이 전용 이미지 페이지를 사용"],
  [views.includes('data-open-character-layout')&&views.includes('data-character-layout-dialog'),"배치 조정 카드와 전체화면 팝업 연결"],
  [app.includes('const pointers=new Map()')&&app.includes('measured.distance/gesture.distance')&&app.includes('measured.angle-gesture.angle'),"한 손 이동·두 손 확대축소·회전 제스처"],
  [app.includes('event.target.closest(\'[data-home-layout-action]\')?"action":"art"'),"행동 아이콘을 직접 끌어 배치"],
  [state.includes('rotation:clamp(layout.rotation,-180,180,0)'),"회전값 저장·복원 정규화"],
  [sceneCss.includes('rotate:var(--character-art-rotation,0deg)!important'),"저장한 회전값이 실제 홈 장면에도 적용"],
  [bookCss.includes('.character-book-v8-stage')&&bookCss.includes('.character-book-v8-wood')&&!bookCss.includes('.character-book-v8-paper'),"SVG의 목재와 책을 한 장의 고정 412×917 무대 레이어로 사용"],
  [views.includes('data-character-full-ui-version="9"')&&views.includes('class="character-book-v8-stage"')&&views.includes('class="character-book-v8-wood"')&&views.includes('character-book-stage-v14.png')&&!views.includes('class="character-book-v8-paper"')&&!views.includes('class="mobile-character-full-settings'),"잘리지 않은 v14 단일 책 무대 이미지와 좌표계"],
  [views.includes('class="character-full-image-slot icon ${c.icon?"has-image":"is-empty"}" data-image="icon">${currentIcon}</button>')&&views.includes('character-full-empty-slot')&&!views.includes('character-full-current-icon'),"아이콘이 별도 위치가 아닌 아이콘 슬롯 안에 배치되고 빈 슬롯은 추가 안내를 표시"],
  [bookCss.includes('.character-full-image-slot.ld{')&&bookCss.includes('.character-full-image-slot.icon{')&&bookCss.includes('background:transparent!important;box-shadow:none!important'),"LD와 아이콘 뒤 회색 판 제거"],
  [views.includes('class="character-profile-overview-page"')&&views.includes('data-character-overview-pane="basic"')&&views.includes('data-character-overview-pane="life"')&&state.includes('characterOverviewPane:"basic"'),"개요 기본·생활 두 장을 독립된 책 페이지로 구성"],
  [!views.includes('character-overview-section-tabs')&&views.includes('class="character-overview-page-controls"')&&!views.includes('character-book-v8-shape-bookmark')&&!bookCss.includes('.character-book-v8-shape-bookmark'),"하단 모양 책갈피를 제거하고 페이지 화살표만 유지"],
  [views.includes('class="character-book-cover-controls"')&&views.includes('data-character-pane="profile"')&&bookCss.includes('.character-book-cover-controls'),"전체설정 표지의 개요 이동 화살표"],
  [views.includes('class="character-book-v8-save character-book-v9-composite"')&&bookCss.includes('.character-book-v9-composite')&&bookCss.includes('font:400 3.25cqw/1 "KCCHanbit"'),"상단 메뉴와 저장을 캡·가운데·캡 조합형 KCC 버튼으로 고정"],
  [views.includes('class="character-book-v9-fill"')&&bookCss.includes('.character-book-v9-fill'),"조합형 버튼 가운데 조각을 캡 안쪽에 고정해 돌출·틈 제거"],
  [views.includes('data-open-body-choice="${esc(path)}"')&&views.includes('appearance.eyeFeatures')&&views.includes('appearance.hairStyles')&&views.includes('appearance.hairAccessories')&&views.includes('appearance.bodyHairLocations'),"눈 특징·헤어스타일·머리 장식·체모 위치가 각각 독립 다중 선택창을 엶"],
  [views.includes('class="character-body-guide"')&&views.includes('data-body-choice-panel="${esc(path)}"')&&bookCss.includes('.character-body-choice-dialog'),"신체 SVG 가이드와 다중 선택 팝업 레이어"],
  [state.includes('hairAccessories:[]')&&state.includes('hairAccessories:Array.isArray(appearanceSource.hairAccessories)')&&state.includes('bodyHairAmount:"설정하지 않음"')&&state.includes('bodyHairLocations:[]')&&state.includes('bodyHairLocations:Array.isArray(appearanceSource.bodyHairLocations)'),"머리 장식과 체모 위치 복수 선택 및 체모 정도 저장·복원"],
  [interfaceCss.includes(':not(.character-book-v8 *)')&&!css.includes('.mobile-character-full-settings .character-overview-page-controls')&&css.includes('Character full settings is owned exclusively by character-book.css'),"전역 테마와 구형 모바일 개요 규칙이 새 SVG 책의 색상·화살표 위치를 덮지 않음"],
  [views.includes('overview-wake-habit')&&views.includes('overview-sleep-habit')&&views.includes('data-profile-tags="eatingHabits"')&&views.includes('overview-walking-style'),"개요 생활 페이지의 기상·취침·식사·걸음걸이 항목 연결"],
  [views.includes('overviewSelect("lifeAdaptation"')&&views.includes('overviewSelect("educationLevel"')&&app.includes('const EATING_HABIT_OPTIONS='),"성격형 습관 대신 생활 환경 적응도·교육 수준 드롭다운과 식습관 상세 후보"],
  [views.includes('overview-job-title')&&views.includes('overview-family-home')&&views.includes('overview-license')&&views.includes('overview-alcohol'),"개요 기본 페이지의 전체 항목을 실제 캐릭터 데이터 입력에 연결"],
  [bookCss.includes('.character-profile-overview-page,.character-overview-basic')&&bookCss.includes('transform:none!important')&&bookCss.includes('background:#dad1bd!important'),"개요 2·3쪽의 기울기를 0으로 맞추고 값 종이 색상 유지"],
  [css.includes('background-repeat:repeat-x')&&css.includes('background-size:auto 100%'),"벽지를 찌그러뜨리지 않고 높이에 맞춰 가로 타일링"],
  [css.includes('body.is-building-size-preview .mobile-town-shell')&&css.includes('background:transparent!important'),"건물 크기 조절 중 설정창 투명 실시간 미리보기"],
  [views.includes('data-settings-pane="sound"')&&views.includes('data-sound-muted')&&views.includes('data-sound-volume')&&views.includes('data-sound-preview'),"설정의 효과음 음소거·볼륨·미리듣기"],
  [audio.includes('assets/audio/shoe-walking.m4a')&&audio.includes('assets/audio/shoe-running.m4a')&&audio.includes('home-life-walking')&&audio.includes('town-traveler.is-jogging'),"걷기·달리기 구두 발걸음을 실제 이동 상태에만 연결"],
  [bookCss.includes('.body-hair-curl{')&&bookCss.includes('.body-hair-condition{')&&views.includes('const HAIR_CURL_PATTERNS=')&&views.includes('const HAIR_CONDITIONS='),"곱슬기와 머릿결을 독립된 의미·행으로 분리"],
  [views.includes('data-eye-color-preview="left"')&&views.includes('data-eye-color-preview="right"')&&views.includes('appearancePreviewColor(bodyAppearance.leftEyeColor')&&views.includes('appearancePreviewColor(bodyAppearance.rightEyeColor'),"좌우 눈 색상 설정이 각각 미리보기 색에 연결됨"],
  [views.includes('const hairCurlPreviewPath=value=>')&&views.includes('data-hair-curl-preview=')&&views.includes('data-hair-shape-preview')&&app.includes('hairCurlPreviewPath(el.value)'),"곱슬기 설정별 머리 선 형태 미리보기"],
  [bookCss.includes('.body-hair-amount{')&&bookCss.includes('.body-hair-locations{')&&bookCss.includes('height:7.4cqw!important'),"신체 5쪽에 체모 정도·체모 위치와 두꺼운 복수 선택 필드"],
  [fs.existsSync(new URL('../assets/character-ui/character-book-stage-v11.png',import.meta.url))&&bookCss.includes('object-fit:fill!important')&&bookCss.includes('.character-full-image-slot.profile{')&&bookCss.includes('rotate(-9.84995deg)'),"신체 6쪽 SVG의 책 전체 종횡비·양쪽 가장자리를 보존하고 사진별 원본 각도를 유지"],
  [state.includes('normalizedHairOrigin==="자연 모발"')&&app.includes('appearance.hairColorOrigin==="자연 모발"')&&app.includes('appearance.naturalHairColor=appearance.hairColor'),"자연 모발 설정에서 현재·본래 머리색 자동 동기화"],
  [views.includes('overview-life-adaptation')&&views.includes('overview-education')&&state.includes('c.lifeAdaptation=')&&state.includes('c.educationLevel=')&&simulation.includes('educationLevel:c.educationLevel'),"생활 환경 적응도와 교육 수준을 저장하고 로그 갱신 서명에 반영"],
  [simulation.includes('function eatingHabitEvent(')&&!simulation.includes('(c.eatingHabits||[]).forEach')&&simulation.includes('const breakfastHabit=eatingHabitEvent')&&simulation.includes('const dinnerHabit=eatingHabitEvent'),"식습관 로그를 일반 성격 로그에서 분리해 식사 시간에만 생성"],
  [homeSimulation.includes(':movement-start')&&homeSimulation.includes('movementStartsAt')&&audio.includes('const channels=new Map()')&&audio.includes('initial?140+(hash(actor.id)%780)')&&audio.includes('element.dataset.homePerson'),"캐릭터별 독립 이동 시작 시각과 시간차 발소리 채널"],
  [views.includes('character-body-figure-page')&&views.includes('character-body-appearance-page')&&views.includes('character-body-accessibility-page')&&views.includes('data-character-body-pane="accessibility"')&&state.includes('characterBodyPane:"figure"'),"신체 4·5·6쪽을 독립 페이지로 구성"],
  [views.includes('data-open-body-choice="${esc(path)}"')&&views.includes('appearanceSummaries')&&views.includes('overallImpressions')&&views.includes('총평')&&views.includes('분위기'),"첫인상 총평과 세부 분위기를 서로 다른 다중 선택 데이터로 분리"],
  [views.includes('body-wheelchair')&&views.includes('body-hearing')&&views.includes('body-prosthetic-arm')&&views.includes('body-prosthetic-leg')&&views.includes('body-health-conditions')&&views.includes('body-vision-supports')&&views.includes('<b>6</b>'),"신체 6쪽의 이동 보조·감각 접근·건강 관리 설정을 연결"],
  [views.includes('const SKIN_TONE_DEPTHS=[0,3,5,7,10,13,17,21,23,25,28,31,35,40,45,50,55,60]')&&views.includes('"그레이톤"')&&views.includes('"쿨블루톤"')&&views.includes('"웜그린톤"')&&views.includes('data-skin-tone-choice=')&&views.includes('skinToneColor(selectedSkinTone)'),"기본·판타지 언더톤과 18단계 명도 피부 팔레트"],
  [views.includes('const SCAR_LOCATION_OPTIONS=')&&views.includes('const SCAR_TYPE_OPTIONS=')&&views.includes('data-body-mark-field="attitude"')&&views.includes('data-body-array-action="add"')&&bookCss.includes('.character-body-mark-dialog'),"흉터·문신의 이름·위치·유형·인식을 각각 편집하는 복수 드롭다운 UI"],
  [app.includes('button.dataset.bodyArrayAction==="add"')&&app.includes('values.length>=8')&&app.includes('data-body-mark-field')&&state.includes('normalizeBodyMarks(source.scars,"scar")'),"흉터·문신을 구조화 데이터로 최대 8개까지 추가·삭제하고 구형 저장본도 복원"],
  [views.includes('overview-life-adaptation')&&views.includes('overview-education')&&views.includes('overview-openness')&&app.includes('bindCharacterBookSwipe()'),"환경 적응도·교육 수준·자율 이끌림·가로 스와이프 이동"],
  [app.includes('openIndex=values.length-1')&&app.includes('if(openIndex>=0)requestAnimationFrame')&&app.includes('dialog.showModal()'),"흉터·문신 추가 직후 새 항목의 상세 설정창을 자동으로 엶"],
  [views.includes('const WARDROBE_TAG_GROUPS=')&&views.includes('"가격대"')&&views.includes('"분위기"')&&views.includes('"형태·소재"')&&views.includes('class="character-book-form-page wardrobe-book-page"'),"옷장 7쪽과 가격·색·분위기·형태 소재별 의상 태그"],
  [views.includes('book-form-field book-form-continuation')&&views.includes('<span class="sr-only">${t(label,label)}</span>')&&views.includes('bookListContinuation("화장 스타일"')&&views.includes('bookListContinuation("시술 부위"')&&views.includes('bookListContinuation("의상 태그"')&&views.includes('bookFieldContinuation("미용실에서 하는 일"')&&bookCss.includes('.book-form-stack.book-form-combined{gap:.25cqw!important}'),"옷장 보조 제목을 시각적으로 제거하고 앞 항목과 한 묶음으로 배치"],
  [views.includes('const MAKEUP_STYLES=')&&views.includes('드랙 메이크업')&&views.includes('인외 메이크업'),"확장된 화장 스타일 선택지"],
  [views.includes('data-character-body-pane="accessibility"')&&app.includes('state.characterPane="body";')&&app.includes('includes(el.dataset.characterBodyPane)?el.dataset.characterBodyPane:"figure"'),"옷장 7쪽 이전 버튼이 신체 6쪽으로 복귀"],
  [state.includes('medications:[]')&&state.includes('normalizeMedications')&&views.includes('data-body-medication-action="add"')&&views.includes('data-body-medication-field="purpose"'),"복용약 추가·제거와 목적·주기 상세 설정"],
  [app.includes('function chooseCharacterImageSource(')&&app.includes('data-image-source="device"')&&app.includes('data-image-source="link"'),"사진 슬롯마다 기기 업로드·링크 추가 방식 선택"],
  [views.includes('서사·인지 특성 선택사항')&&views.includes('실제 장면에 반영할 표현')&&bookCss.includes('.personality-detail-actions'),"성격 9쪽의 서사·인지와 장면 표현 큰 선택 버튼"],
  [gradle.includes('versionCode 173')&&gradle.includes('versionName "1.0.160"'),"Android 개발 버전 173 / 1.0.160"]
];

let failed=0;
for(const [ok,label] of checks){
  console.log(`${ok?"PASS":"FAIL"} ${label}`);
  if(!ok)failed+=1;
}
if(failed)process.exit(1);
