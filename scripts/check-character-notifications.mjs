import fs from "node:fs";
import path from "node:path";

const root=path.resolve(import.meta.dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const app=read("app.js");
const views=read("views.js");
const state=read("state.js");
const notifications=read("character-notifications.js");
const speech=read("speech-styles.js");
const nativeApp=read("native-app.js");
const css=read("app.css");
const gradle=read("android/app/build.gradle");
const activity=read("android/app/src/main/java/com/drawervillage/app/MainActivity.java");

const checks=[
  [state.includes("schema:25")&&state.includes("characterNotificationSettings:defaultCharacterNotificationSettings()"),"알림 설정 스키마와 기본값"],
  [state.includes('frequencyMode:"perDay"')&&state.includes("timesPerDay:1")&&state.includes("intervalHours:4")&&state.includes('voiceMode:"mixed"')&&state.includes("scheduleEnds:false")&&state.includes("updateNotices:true"),"횟수·간격·일정 종료·업데이트 소식 기본값"],
  [["questions","checkins","worries","comfort","lifeLogs"].every(kind=>state.includes(`"${kind}"`)),"질문·안부·고민·휴식·생활로그 알림 종류"],
  [state.includes("characterIds:Array.isArray(notificationSource.characterIds)"),"삭제된 캐릭터를 제거하는 설정 마이그레이션"],
  [views.includes("data-character-notification-character")&&views.includes("data-character-notification-setting=\"frequencyMode\"")&&views.includes("data-character-notification-setting=\"timesPerDay\"")&&views.includes("data-character-notification-setting=\"intervalHours\"")&&views.includes("data-character-notification-setting=\"voiceMode\""),"캐릭터·횟수·간격·말투 선택 UI"],
  [app.includes("buildSpecialDateNotification")&&app.includes('specialKind:"birthday"')&&app.includes('specialKind:"anniversary"'),"생일·기념일 특별 알림"],
  [views.includes("data-character-notification-kind")&&views.includes("data-character-notification-test"),"주제 선택과 시험 알림 UI"],
  [views.includes('data-settings-pane="notifications"')&&views.includes('gameplay:`${homeCharacterDisplay}${map}${movement}`')&&views.includes('notifications:"알림"')&&views.includes('notifications,')&&views.includes('settingsPane=["home","gameplay","notifications"'),"게임플레이와 분리된 알림 설정 메뉴"],
  [views.includes('function mailbox()')&&views.includes('data-open-daily-question')&&!views.includes('data-open-character-contact'),"캐릭터 화면에서 분리된 우편함"],
  [views.includes("data-character-update-notices")&&app.includes("scheduleCurrentBuildUpdateNotice"),"캐릭터 이미지로 새 버전 소식 예약"],
  [views.includes("data-character-schedule-end-notices")&&app.includes('mode:"scheduleEnd"')&&app.includes("settings.scheduleEnds"),"등록 일정 종료 시각 알림"],
  [views.includes("data-open-daily-question")&&!app.includes("setTimeout(maybeShowDailyCharacterQuestion")&&app.includes('navigateToTab("mailbox")'),"질문을 팝업 대신 우편함에서 열기"],
  [views.includes("❓ 질문과 실제 선택")&&views.includes("🤔 캐릭터의 고민")&&views.includes("📖 구체적인 생활로그"),"구체적인 알림 종류 안내"],
  [app.includes("confirmCharacterNotificationConsent")&&app.indexOf("confirmCharacterNotificationConsent")<app.indexOf("requestCharacterNotificationPermission()"),"앱 설명 후 Android 권한 요청"],
  [app.includes("recentSignatures")&&app.includes("daySerial+slot")&&app.includes('voiceMode||"mixed"'),"최근 문구·날짜별 캐릭터 순환·말투 반복 방지"],
  [app.includes("buildLifeLogNotification")&&app.includes("characterContactSpeech(character,neutral"),"생활로그와 말투 적용 연락 분리"],
  [app.includes("dayOffset<15")&&app.includes("replaceCharacterNotifications(items)"),"2주 단위 기기 예약 갱신"],
  [notifications.includes('CHANNEL_ID="character-contact-v2"')&&notifications.includes("checkPermissions()")&&notifications.includes("requestPermissions()"),"Android 알림 채널과 런타임 권한"],
  [notifications.includes("localNotificationActionPerformed")&&app.includes("drawer-village-character-notification-open"),"알림 터치 후 캐릭터 화면 연결"],
  [notifications.includes("characterNotificationLargeIcon")&&notifications.includes("largeIcon:item.largeIcon||undefined")&&app.includes("item.largeIcon=await icons.get(source)"),"캐릭터 큰 알림 아이콘"],
  [speech.includes("export function characterContactSpeech")&&speech.includes('language==="ja"'),"말투별 영어·일본어 연락 문장"],
  [nativeApp.includes("normalizeNativeViewport")&&nativeApp.includes('appStateChange')&&views.includes('aria-pressed="${selected}"')&&css.includes('.notification-kind-grid button{')&&!views.includes('type="checkbox" data-character-notification-kind'),"권한 복귀 레이아웃과 연락 종류 버튼 포커스 안정화"],
  [activity.includes("WindowInsetsCompat.Type.statusBars()")&&activity.includes("BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE"),"상단 상태바 숨김과 스와이프 임시 표시"],
  [gradle.includes("versionCode 88")&&gradle.includes('versionName "1.0.85"'),"내부 테스트 빌드 번호"],
  [views.includes("Character contact notifications")&&views.includes("キャラクターからの連絡通知"),"영어·일본어 설정 번역"],
  [app.includes("How was your day?")&&app.includes("今日はどうでしたか？"),"영어·일본어 알림 본문 번역"]
];

const failed=checks.filter(([ok])=>!ok);
checks.forEach(([ok,label])=>console.log(`${ok?"PASS":"FAIL"} ${label}`));
if(failed.length){
  console.error(`\n${failed.length} notification regression check(s) failed.`);
  process.exit(1);
}
console.log(`\nPASS ${checks.length} character notification regression checks.`);
