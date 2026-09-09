# 신고 확인과 처리

신고는 Firebase Console → Firestore Database → moderationReports 컬렉션에서 확인합니다. 일반 이용자에게는 읽기·쓰기 권한이 없으며, 로그인된 서버 API만 접수합니다. 신규 신고의 status는 pending입니다.

- reporterUid: 신고자, targetUid: 신고 대상 계정, groupId/kind/targetId: 원본 위치
- reason/details: 사유와 설명, evidence: 접수 시 서버에서 확보한 대상 자료, createdAt: 접수 시간
- 신고자를 다른 이용자나 신고 대상자에게 공개하지 않습니다.

운영자는 pending 신고를 정기적으로 확인하고 신속히 조치해야 합니다. 문제가 있는 원본은 groupId의 members/residents/mail/proposals 등 kind에 해당하는 위치에서 확인하고 부적절한 사진이나 글을 제거합니다. 신고 기록에는 status를 resolved 또는 dismissed로 변경하고 검토 결과와 처리 시각을 남깁니다. 신고만으로 상대 계정 전체를 자동 삭제하지 않습니다.

사용자의 개인 차단과 운영자의 콘텐츠 조치는 별개입니다. 차단은 users/{uid}/safety/settings에 서버가 저장하며, 계정 소유자만 API를 통해 조회·변경합니다. 차단 후에도 공동 마을의 소유권이나 다른 이용자의 데이터는 삭제하지 않습니다.

실제 개인정보가 없는 별도의 테스트 계정 두 개로 구성원 신고, 받은 우편 신고, 계정 차단, 양방향 연락 거절, 다른 그룹의 같은 계정 차단, 설정의 차단 해제를 촬영합니다. 현재 자동화 검증은 실기기 촬영을 대체하지 않습니다.
