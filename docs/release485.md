# 내부 1.0.433 (485)

- 홈 로그 위 실제 레시피 재료 아이콘으로 썰기·섞기·팬/냄비 조리·튀기기·휘핑·장식 애니메이션. AI 이미지 없음. 단계 전환에만 DOM 변경, 화면 숨김/동작 줄이기 지원.
- 사용자 제공 floraphonic-knife-cut-veggies-foley-4-211705.mp3의 여섯 타격 구간(.10–.30,1.16–1.36,2.09–2.29,3.07–3.36,4.56–4.82,5.68–5.92초)을 연결. 구간 간40ms·접합 fade3/8ms·-18LUFS/-2dB 목표·44.1kHz mono128k. assets/audio/cooking/knife-cut.mp3 교체.
- iOS AdMob 플러그인이 모든 배너 오류를0으로 보내던 문제 수정. 실제 NSError code/domain 전달, safe-area 너비·화면 준비 검증, delegate 설정 후 요청. iOS no-fill1/Android3 구분. 제보 스크린샷0만으로 원인 확정 불가.

## 검증 및 적용
- check-cooking485, Chrome/WebKit qa-cooking485, check-ads441 통과.
- 서명 AAB 568웹 자산 일치, jarsigner 통과, 오프라인 부팅/저장 캐릭터 재실행 통과.
- iOS 첫 CI는 이전464버전 메타데이터로 실패.485로 맞춘 Actions35853012289는 Xcode 빌드 및 iPhone/iPad 시뮬레이터 실행 성공. 실기기 광고 수신·발열은 검증하지 않음. App Store/TestFlight 제출 없음.
- Play 내부 release363: 2026-09-23 20:13 KST 내부 테스터에게 제공됨. 프로덕션 변경 없음.
- AAB C:/Users/Public/drawer-releases/drawervillage-1.0.433-485-internal.aab
- SHA256 2556DC25A0271460EC96CE92B41EE671001BD45E345CCBBC6E46AB7D2BD29662
- dev f5887101 / d61a9882. main은 공개 웹 보호를 위해 문서만 반영.
- 새 문구3언어. 전체 정적 번역 EN2255/2990(75.4%), JA2254/2990(75.4%).
