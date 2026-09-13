# 1.0.330 (379) — internal testing / TestFlight

Source: dev c910b6a, including a8049e2 and e96e45b since Android internal378. Production377 and closed-test215 are not changed. No App Store review submission authorized for this release.

September13 public supporter endpoint returned three approved public entries. Bundled fallback updated; no pending names approved. Credits use cream text and a black outline. Life-log participants wrap horizontally, with fixed ordering/header/footer and a scrollable list. Tutorial copy shortened in Korean, English and Japanese. The Settings help guide is implemented; complete automatic first-launch onboarding is not claimed.

Validation: Chrome and WebKit402×820, 30 log entries with three companions, horizontal positions, scroll range, visible close button, supporter computed colors/stroke; save/feedback/tour regression suite; supporter social checks; iOS request checks. Android release APK/AAB built successfully and APK signature/version verified as1.0.330/379. No physical iPhone verification.

Deployment: Android internal release281 verified available to internal testers September13 20:07 KST. iOS internal-only TestFlight workflow34753311646 succeeded. Apple upload/build9d49d86e-9cd9-49a9-8edf-cc4c00ac10e7 processed successfully. After reviewing the encryption implementation, the missing encryption questionnaire was completed with none of the listed implemented algorithms. UI verified Ready to Test and existing internal group 나만 테스트 (one tester) assigned. Test instructions saved. No beta external review or App Store submission.

Limitations: legacy shared schedule recovery still requires the separate backend deployment. Shared automatic mail/notifications remain pending. New slot SKU/pricing code is included but store prices/products and production backend have not been changed; do not announce the new prices as available.

## Discord copy — cumulative since Android internal378

서랍마을 1.0.330 (379) 내부 테스트 업데이트

이번 업데이트에서 변경된 주요 내용을 안내드립니다.

✨ 새로운 기능
- 생활 로그를 최신순·오래된순으로 바꿔 볼 수 있습니다.
- 도움말에 주요 조작을 따라 해 보는 안내를 추가했습니다.
- 소파에서 낮잠, 독서, 영상 감상, 음악 감상을 선택할 수 있습니다.
- 라이벌 관계의 배경 선택지를 추가했습니다.

🔧 개선 사항
- 캐릭터를 누르면 현재 행동을 먼저 확인하고 할 일 메뉴를 열 수 있습니다.
- 소파와 의자에서의 착석 위치·크기를 조정했습니다.
- 음료를 준비하는 행동과 마시는 행동의 장소·연출을 구분했습니다.
- 저장 처리를 개선하고, 저장 실패 시 안내를 더 정확하게 구분했습니다.

🎨 UI/UX
- 응원자 명단을 갱신하고 이름을 미색·검은 테두리로 표시했습니다.
- 생활 로그의 여러 인물을 가로로 배치하고 긴 목록의 스크롤을 개선했습니다.
- 설정 첫 화면에서 익명 문의를 찾을 수 있도록 정리했습니다.
- 따라하기 안내의 문구를 간결하게 다듬었습니다.
- 화면 아래쪽 가구를 편집할 때 도구가 위쪽에 표시됩니다.

🐛 오류 수정
- 직접 시킨 가구 행동에서 착석 표시가 제대로 적용되지 않는 문제를 수정했습니다.
- 반려동물의 이동이 화면 갱신 때 같은 위치로 돌아가던 문제를 수정했습니다.
- 저장 요청이 겹칠 때 최신 변경 내용의 저장 완료를 기다리도록 수정했습니다.

이번 버전은 내부 테스트용입니다. 멀티의 이전 일정 복구와 자동 우편·알림 지원은 별도 작업 중입니다.
