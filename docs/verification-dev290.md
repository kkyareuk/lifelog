# 개발판290 검증

- Android versionCode 290 / versionName 1.0.257 (APK manifest 확인).
- assembleRelease / bundleRelease 성공. APK apksigner 및 AAB jarsigner 서명 검증 통과.
- AAB 웹 자산 SHA256 원본 일치 검사 통과. 새 proposal-copy.js 포함.
- 최종 APK에서 추출한 자산으로 외부 연결을 차단한 브라우저 실행, JS/CSS 누락 없음, 캐릭터 저장 후 재실행 복원 통과.
- 제안 문구 KO/EN/JA, 관리자/기존 운영자 입주, 일반 구성원 승인, 다른 멀티 이사 및 기존 서버 권한 회귀 테스트 통과.
- 우편함 브라우저 회귀 검사는 직전 문구 수정 커밋 ac14489에서 통과.
- sharedTownApi 관리자 입주 수정 배포 완료. 이번 빌드는 그 수정의 클라이언트 문구를 포함.
- 실제 Android 기기 설치 및 Play Console 업로드는 미실행. Apple 제출본과 운영 게임 main 변경 없음.
- 전체 정적 번역: 영어2216/2912(76.1%), 일본어2215/2912(76.1%). 이번 문구는 두 언어 모두 제공.
