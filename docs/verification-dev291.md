# 개발판291 검증

- Android versionCode291 / versionName1.0.258. APK manifest 확인.
- assembleRelease/bundleRelease 성공. APK apksigner 및 AAB jarsigner 서명 검증 통과.
- AAB 내 준비 웹 자산260개 SHA256 원본 일치.
- 최종 APK 자산으로 외부 연결 차단 실행, JS/CSS 누락 없음, 캐릭터 저장 후 재실행 복원 통과.
- 마지막 개인 캐릭터 이사 재현: 수정 전 observe/routine/catalog/character/town 모두 welcome 레이아웃 오판. 수정 후 실제 탭과 일치, view-error 없음. 실제 빈 첫 실행 welcome은 유지.
- 360x840 휴대폰 및 1280x800 태블릿 가로 브라우저 검사. 공유 팝업 휴대폰/태블릿 크기와 캐릭터 공유 네 메뉴 검증.
- 집 코드 발급/조회/폐기, 소유자 권한, 빈 목적지 조건, 실패시 원자성, 슬롯, 재시도 중복 방지, 집/방/가구/좌표/관계/일정 ID 연결 테스트 통과.
- 관계 명시적 연결, 이름 유지, 기존 관계 충돌 차단, 마을 복제 새ID 연결, 이사 완료 정리 1회 및 귀환 집 보존 테스트 통과.
- 계정 우편/프로필/응답 방향/계정 격리 및 기존 멀티 서비스 회귀 테스트 통과.
- sharedTownApi 배포 완료.
- 실제 Android 폴더블 설치, 실제 두 계정 네트워크 전체 이사, Play Console 업로드는 미실행. 운영 게임main과 Apple 제출본 변경 없음.
- 전체 정적 번역 검사 영어2216/2913(76.1%), 일본어2215/2913(76.0%). 새 기능과 빈 목록 안내는 KO/EN/JA 제공.
