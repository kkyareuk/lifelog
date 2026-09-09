# 신고 이메일 알림

상태: 2026-09-09 Firebase 비밀 설정 연결 및 moderationReportEmail 배포 완료. 명시적인 연결 테스트 문서에서 Resend 발송 접수와 emailNotification.status=sent 확인. 받은편지함 도착 여부는 별도 확인 필요.

- 수신자: kkyaareuk@gmail.com (서버 고정, 신고자가 변경할 수 없음).
- 새 moderationReports 문서가 만들어질 때 실행. 정기 목록 조회 없음.
- 신고 번호, 대상 이름, 사유, 추가 설명, Firebase 확인 링크를 보냄. evidence 원본은 첨부하지 않음.
- 신고 상태와 메일 발송 상태를 분리. 발송 실패로 원본 신고가 삭제되지 않음.
- Resend의 24시간 중복 방지 키와 발송 완료 기록 사용. 자동 재시도는 이벤트 생성 후 23시간 이내이며, 이후 emailNotification.status가 needs-attention이면 수동 확인 필요.

## 연결

Resend 발송 계정과 허용된 발신 주소를 준비한다. `MODERATION_EMAIL_CONFIG`라는 Secret Manager 비밀에 apiKey와 from을 담은 JSON을 저장한다. 키는 저장소나 채팅에 넣지 않는다. 초기 테스트 발신 도메인을 쓰는 경우 Resend가 허용하는 본인 수신 주소인지 확인한다.

설정 이후 moderationReportEmail 함수만 배포하고, 테스트용이라고 명시한 신고로 실제 수신을 확인한다. 모의 검사는 별도이며, email-connection-test-20260909 문서는 실제 사용자 신고가 아닌 연결 테스트로 표시했다. 신고 컬렉션을 보이게 하려고 가짜 사용자 신고를 만들지 않는다.

서버 기능이므로 활성화 자체에 Android/iOS 새 빌드는 필요하지 않다.

참고: https://resend.com/docs/api-reference/emails/send-email 및 https://resend.com/docs/dashboard/emails/idempotency-keys
