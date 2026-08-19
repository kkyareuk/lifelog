import fs from "node:fs";
import path from "node:path";

const root=path.resolve(import.meta.dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const app=read("app.js");
const views=read("views.js");
const state=read("state.js");
const notifications=read("character-notifications.js");
const gradle=read("android/app/build.gradle");

const checks=[
  [state.includes("schema:21")&&state.includes("characterNotificationSettings:defaultCharacterNotificationSettings()"),"알림 설정 스키마와 기본값"],
  [state.includes('frequency:"daily"')&&state.includes('voiceMode:"mixed"'),"빈도와 반복 완화 기본값"],
  [state.includes("characterIds:Array.isArray(notificationSource.characterIds)"),"삭제된 캐릭터를 제거하는 설정 마이그레이션"],
  [views.includes("data-character-notification-character")&&views.includes("data-character-notification-setting=\"frequency\"")&&views.includes("data-character-notification-setting=\"voiceMode\""),"캐릭터·빈도·말투 선택 UI"],
  [views.includes("data-character-notification-kind")&&views.includes("data-character-notification-test"),"주제 선택과 시험 알림 UI"],
  [app.includes("confirmCharacterNotificationConsent")&&app.indexOf("confirmCharacterNotificationConsent")<app.indexOf("requestCharacterNotificationPermission()"),"앱 설명 후 Android 권한 요청"],
  [app.includes("recentSignatures")&&app.includes("characters.length>1")&&app.includes('voiceMode||"mixed"'),"최근 문구·연속 캐릭터·말투 반복 방지"],
  [app.includes("dayOffset<15")&&app.includes("replaceCharacterNotifications(items)"),"2주 단위 기기 예약 갱신"],
  [notifications.includes('CHANNEL_ID="character-contact-v2"')&&notifications.includes("checkPermissions()")&&notifications.includes("requestPermissions()"),"Android 알림 채널과 런타임 권한"],
  [notifications.includes("localNotificationActionPerformed")&&app.includes("drawer-village-character-notification-open"),"알림 터치 후 캐릭터 화면 연결"],
  [gradle.includes("versionCode 55")&&gradle.includes('versionName "1.0.53"'),"내부 테스트 빌드 번호"],
  [views.includes("Character contact notifications")&&views.includes("キャラクターからの連絡通知"),"영어·일본어 설정 번역"],
  [app.includes("A life update")&&app.includes("暮らしの便り"),"영어·일본어 알림 본문 번역"]
];

const failed=checks.filter(([ok])=>!ok);
checks.forEach(([ok,label])=>console.log(`${ok?"PASS":"FAIL"} ${label}`));
if(failed.length){
  console.error(`\n${failed.length} notification regression check(s) failed.`);
  process.exit(1);
}
console.log(`\nPASS ${checks.length} character notification regression checks.`);
