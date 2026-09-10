# 314 / 1.0.281 · 광고 ID 미사용

사용자 요청에 따라 Android 빌드에서 AdMob 플러그인을 제외했습니다. capacitor.config.json의 Android includePlugins로 동기화 후에도 유지됩니다. AD_ID와 ACCESS_ADSERVICES_AD_ID는 manifest merger remove 규칙으로 SDK 재추가를 차단하고 Firebase Analytics 광고 ID 수집과 광고 개인화 신호를 껐습니다. 기존 광고 enabled:false 유지. 결제/로그인/푸시 플러그인은 유지됩니다. 광고 기능을 다시 켜려면 별도 구현·검토가 필요합니다.

Play Console → 앱 콘텐츠 → 광고 ID → 아니요로 저장하고314 AAB로 교체해야 합니다. Console 설정 변경/업로드/검토 통과는 이 작업에서 실행하지 않았습니다. 과거 아티팩트는 변경되지 않습니다.

312 생활·교류·성능 변경 유지. Android 빌드와 최종 권한/플러그인 검사를 수행합니다. 웹/iOS 동작 변경 없음, IPA/실기기 검증 없음. dev 작업이며 운영 main 유지. 영어76.0%·일본어76.0%; 신규 UI 문구 없음, 출시노트3언어 제공.

Firebase 공식 설정 근거: https://firebase.google.com/docs/analytics/android/configure-data-collection
