# Android 1.0.328 (367) — 백업 내보내기 종료 수정

실기기 SM-S918N, 2026-09-12 19:20:52: TransactionTooLargeException, parcel 28,312,468 bytes. capacitorLastPluginCallOptions 14,153,428 bytes와 capacitorLastPluginCallBundle 14,153,464 bytes 확인. 파일 선택기를 열면서 Capacitor가 백업 본문을 두 번 Activity 상태에 담는 경로.

saveJson은 앱 전용 캐시 파일에 본문을 먼저 저장하고 call options에서 data를 제거한 뒤 작은 backupToken만 보존한다. 저장 대상에는 8KB 버퍼로 복사하며 성공/취소/실패 후 캐시 파일 정리. 빈 본문은 파일 선택기 전 거절. 캐시가 사라지면 기존 번역된 실패 안내로 처리.

Android APK/AAB 빌드. 실제 사용자 앱 업데이트 후 저장 완료·재가져오기 검증은 대기. 기존 설치본과 로컬 서명이 달라 adb 덮어쓰기 불가. 원본 앱 삭제나 데이터 초기화 없음. 전체 버튼 렉 해결로 주장하지 않음. iOS 변경/심사 제출 없음. 새 UI 문구 없음: 기존 KO/EN/JA 안내 사용.

사용자 안내 초안: 백업 파일을 내보낼 때 앱이 종료되거나 빈 파일이 남을 수 있는 문제를 수정했어요.
