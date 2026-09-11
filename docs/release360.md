# 1.0.326 — Android 359 / iOS 360

- TestFlight에서 서버가 확인한 구매 슬롯을 표시하고, 이미 완료한 테스트 구매도 로그인/구매 복원 시 다시 읽습니다. 정식 구매 권한과 테스트 구매 권한은 서버에서 분리합니다.
- 캐릭터 화면에 사용·남은 슬롯을 상시 표시하고, 새 캐릭터 생성 전 슬롯 확인 팝업을 없앴습니다.
- 태블릿 홈의 일정·관계 메뉴 겹침을 수정했습니다.
- 계정 삭제 대기와 초기 계정 로딩을 분리하고 응답 제한 시간을 적용했습니다. 삭제 완료가 확인되기 전 기기 기록을 지우지 않습니다.

Validation: mock-server Apple verification/idempotency/refund/account separation, verified test 5 + base 5 with used2 => remaining8, KO/EN/JA, deletion cancellation/timeout/unconfirmed response, Chromium tablet layout at 1024×768/1366×1024/768×1024. Android release APK/AAB built. Physical iOS purchase and deletion outcome remain unverified. No review submission or public release.

## Discord용 비공개 테스트 안내 (이전 iOS 359 대비)
서랍마을 1.0.326 업데이트

이번 업데이트에서 변경된 주요 내용을 안내드립니다.

🔧 개선 사항
- 캐릭터 화면에서 사용한 슬롯과 남은 슬롯을 바로 확인할 수 있어요.
- 새 캐릭터를 만들 때 슬롯 확인 팝업을 한 번 더 거치지 않도록 바꿨어요.

🐛 오류 수정
- TestFlight에서 구매한 캐릭터 슬롯이 반영되지 않던 문제를 수정했어요.
- 태블릿 홈화면의 일정과 관계 메뉴가 겹치던 문제를 수정했어요.
- 계정 삭제 도중 응답을 받지 못했을 때 계정 확인 화면에서 계속 기다리던 문제를 수정했어요.
