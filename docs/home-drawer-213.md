# v1.0.198 / Android 213 — 집 메뉴와 가구 편집창

개발 브랜치: dev. 운영 main, 웹 서비스, Google Play, App Store에 배포하지 않았다.
iOS는 같은 소스를 반영한 1.0.198 / build 2 준비판이며 제출 가능한 IPA가 아니다.

## 변경

- 모바일 집 메뉴의 71px 고정 너비 충돌을 제거하고 88px 영역에 맞춤.
- 원본 버튼 양끝 이미지(60×124)의 비율대로 캡 너비를 계산하여 테두리 잘림 방지.
- 전체 테마 설정을 마크업·이벤트·스타일에서 제거.
- 첨부 집-편집모드.svg의 두 분류 줄을 기준으로 방 종류와 가구 종류를 분리.
- 기존 검색과 배치 대상 방 선택, 가구창 접기/펼치기는 유지.
- 검색칸의 전역 최소 높이 48px가 36px 줄 밖으로 나오던 충돌을 제거.
- 검색/방 종류/가구 종류/목록을 각각 36/34/34/94px로 분리. 빈 검색 결과와 분류 변경에도 높이 유지.
- 선택 가구 편집 도구를 두 줄로 배치하고 하단창 높이와 연동. 숨김 버튼과 자식 글자색도 명시.
- 새 분류·접근성·도구 문구 ko/en/ja 대응. 이번 변경 문구 EN/JA 각각 100%; 전체 게임/로그 번역률은 미측정.
- APP-IOS.md에 사용자 화면 기준 신규 앱 입력값과 App ID 등록 순서를 기록.

## 검증

- 브라우저 native-preview: 일본어 384×854, 영어 320×740, 한국어 412×917.
- 버튼 캡/텍스트, 검색, 두 분류, 필터 변경 시 높이, 빈 결과, 가구 추가, 선택 도구, 접기/펼치기, 집 정보/저장 버튼 확인.
- 신규 drawer-213와 home-editor-209, home-design-210, home-polish-211, room-editor-212, mood-details-212, native-platforms, ios-project, native-module-closure, android-build-assets 검사 통과.
- Android assembleDebug / bundleRelease 성공. APK 메타데이터 v1.0.198/code213 확인.
- APK/AAB의 app.css, home-editor-ui.css/js, views.js, index.html이 최종 www와 동일함을 확인.
- AAB jarsigner 검증 성공. 자체 서명 인증서/타임스탬프 및 ZIP 스트림 manifest 순서 경고는 출력됨. Play 업로드 검증은 미실행.
- iOS sync/버전/게임 자산 검사 통과. Windows이므로 CocoaPods/Xcode 컴파일·서명·실기기 검사는 수행하지 못함.
- 실제 Android 기기 설치·터치·발열/음원 검증과 iOS 실행은 별도 필요. 사이트 공개 배포는 하지 않음.

## 산출물

- drawer-village-v1.0.198-code213-dev-debug.apk — SHA256 13662c74a0ea5c6eb5330bc9cdf33ad54823b2d2d0ca871f83024b2df324ebb1
- drawer-village-v1.0.198-code213-dev-release.aab — SHA256 3e884d5d7d8fdad5f8df58dbf8ebc7ee38cec067a2b33f0a8fc321a3628ff36c

이 APK는 debug 서명이다. Play 설치본과 서명이 다르면 덮어 설치가 안 되므로 데이터 백업 없이 기존 앱을 삭제하도록 안내하지 않는다.
