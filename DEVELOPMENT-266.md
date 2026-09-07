# 개발판 1.0.235 / 266

작업 대상: dev. 운영 main의 1.0.215.10 / 264는 변경하지 않습니다.

## 사용자 변경 안내
- 개발판 265에서 시작 화면에 멈추며 ‘앱 화면을 열지 못했어요’가 표시되는 문제를 수정했습니다. 기존 앱 위에 업데이트하며 데이터 초기화가 필요하지 않습니다.
- 캐릭터 전체 설정 → 신체 → 6페이지 → 병원 방문에 ‘평일 전부’를 추가했습니다.
- 병원 방문 목적을 복수 선택할 수 있습니다. 상담·경과 확인, 입원 치료, 통원 치료, 정신건강 진료를 함께 지정할 수 있으며 이전 목적도 보존합니다.
- 진료 분야 복수 선택과 ‘정신과’를 추가했습니다. 마을 병원 종류에도 정신과가 있습니다.
- 평일 방문 및 지정 치료 일정에 진료 분야·방문 목적을 반영합니다. 병원이 있는 마을에서 이용하며, 치료 형태·시각을 별도로 지정하지 않은 평일 방문은 09:00~10:00입니다. 이미 설정한 낮 병동 등의 치료 시간은 유지합니다.
- 기존 총평 즉시 반영, 침실 주인 연동, 설정 내보내기, 음료 설정/로그, 사전 80개 제한, 멀티 생활·관계 기능을 유지합니다.

## English
- Fixed the development build 265 startup failure. Install the update over the existing app; resetting data is unnecessary.
- Added Every weekday to hospital visits on Character full settings → Body → page 6.
- Hospital visit purposes now allow multiple selections, including follow-up, inpatient treatment, outpatient treatment and mental health care. Existing selections are preserved.
- Added medical department selections and Psychiatry, including the town hospital subtype.
- Care schedules include selected departments and purposes. Weekday visits default to 09:00–10:00 when no specific care mode is configured; explicit care hours are retained.

## 日本語
- 開発版265でアプリ画面を開けない問題を修正しました。既存アプリに上書き更新でき、データ初期化は不要です。
- キャラクターの全体設定 → 身体 → 6ページの通院頻度に「平日すべて」を追加しました。
- 受診目的を複数選択できるようにしました。相談・経過確認、入院治療、通院治療、精神的な健康の診療を同時に設定でき、以前の選択も保持します。
- 診療科の複数選択と「精神科」を追加しました。町の病院の種類にも精神科を追加しています。
- 治療予定に診療科と受診目的を反映します。治療形態を指定していない平日の通院は09:00〜10:00で、既に設定した治療時間は維持します。

## 原因と検証 / 원인과 검증
- 패키지 준비 도구가 `import "./group-push.js"` 형태의 부수 효과 import를 추적하지 않아 시작 모듈이 빠졌습니다. groups.css도 누락되어 추가했습니다. 패키지 생성 및 검사 모두 보완했습니다.
- 기존 265 APK 자산에서 누락으로 인한 실행 실패를 재현했습니다. 최종 266 APK에서 추출한 자산을 외부 네트워크 없이 Chrome에서 실행해 누락 0건, 첫 화면 표시 및 저장 캐릭터 재실행 보존을 확인했습니다.
- Android 서명 APK/AAB 생성, APK v1/v2 서명 및 versionCode 266/versionName 1.0.235 확인. 두 파일의 웹 자산 229개가 준비된 원본과 각각 SHA-256 일치합니다.
- 384px 병원 목적 복수 선택/정신과 저장·재시작, 이전 단일 목적 보존, 월~금 일정/주말 제외 검사 통과.
- 200명 공유 생활 계산, 낮 병동 종료 경계, 함께 식사, 총평 즉시 표시, 침실 양방향 연동, 설정 파일 왕복, 사전 80개 제한, 음료 로그 및 ko/en/ja 멀티 관계 화면 회귀 검사 통과.
- iOS 1.0.235 (13)는 프로젝트 준비 검사만 통과했습니다. Mac 빌드·TestFlight 업로드·실기기 구매 검증은 아직 하지 않았습니다.
- 전체 UI 번역: 영어 2204/2904 (75.9%), 일본어 2203/2904 (75.9%). 신규 병원 용어 번역 포함.
- 실제 Android 휴대폰에서의 이번 APK 실행은 미검증입니다. 기존 미완료 항목(멀티 전체 메뉴 동등성, 공동 인테리어, 실기기 멀티/푸시/발열, iOS 출시·결제)은 DEVELOPMENT-265.md와 작업판에서 계속 추적합니다.
- 공유 생활 서버에 이번 치료 일정 변경도 배포 완료했습니다.
