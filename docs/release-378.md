# 1.0.329 (378) — internal testing only

Google Play production release/promotion/review submission is prohibited unless the user explicitly requests that exact version. No App Store submission requested for378. dev source; main remains untouched.

Fixes: building occupancy badge CSS depth priority, shared life-log future filtering, group/town dropdown markup and pill caps, body choice dialog inherited pointer-events, gift selection preserving player sender, old schedule personal-ID normalization with ambiguous/new-ID guards and manager controls. iOS profile PNG/PDF exports use a native bounded-chunk share sheet, not a browser popup. Actual iOS file-save validation remains pending until Mac compilation and device checks.

Limited settings: sleep-elsewhere50/70/85/95%, education skill, political/status/succession competition as an existing rivalry background, distant clan members as an existing clan background. Speech mixing and new emotional axes deferred. Linked Google Doc could not be retrieved; no claims based on its contents.

Server changes tested locally; production backend deployment is not implied by internal app distribution. Shared settings require the corresponding backend revision. Keep this limitation visible to internal testers.

Validation: Chrome and WebKit body-dialog overflow/pointer reception, shared timeline cutoff at03:45 and occupancy badges above30 buildings passed. Native export chunk ordering, exact reconstruction and failure cleanup passed. Legacy schedule editing/cancellation and source-ID migration, manager and invalid new-resident guards passed. Android APK/AAB compiled and APK signature verification succeeded. Version manifest1.0.329/code378. Final narrow-screen town-pill flex layout included in artifacts. iOS native CI34728066838 still running; no physical iPhone validation claimed.

Internal-testing baseline verified in Play Console:375(1.0.328), September12 23:43. Cumulative notes cover376–378. Production377 remains unchanged.

Final status: Google Play internal track4701300702493397907 release280 shows378(1.0.329) **Available to internal testers**, September13 09:39 KST. Production not changed. Backend deployment remains pending the user's answer; no server writes made.

Mac CI34728066838 native compilation passed. Overall workflow failed at simctl launch timeout, but collected iPhone-startup.json confirms game DOM ready/1app child/6buttons/no bootError and screenshot shows the welcome UI. This is startup evidence, not a fully passing workflow or physical export test. No TestFlight or App Store378 upload/submission. WebKit mail gift-change regression preserves the player sender; ambiguous legacy resident-ID guard passes.

## Discord copy — cumulative from internal375 through378
서랍마을 1.0.329 (378) 내부 테스트 업데이트

이번 업데이트에서 변경된 주요 내용을 안내드립니다.

🔧 개선 사항
• 소파의 두 자리 이용과 친밀도에 따른 자리 선택을 다듬었습니다.
• 캐릭터 상호작용 메뉴와 반응, 화면효과를 개선했습니다.
• 다른 곳에서 자는 빈도에 50%·70%·85%·95% 단계를 추가했습니다.
• 교육 기술, 라이벌의 정치·지위·승계 경쟁 배경, 먼 가문원 배경을 추가했습니다.

🎨 UI/UX
• 의자·소파 착석 크기와 식탁 뒤쪽 자리의 표시 순서를 조정했습니다.
• 그룹·마을 전환 화살표의 위치와 마을 버튼 모양을 정리했습니다.

🐛 오류 수정
• 건물 위 주민 표시가 다른 건물에 가려지던 문제를 수정했습니다.
• 멀티 생활 로그에 아직 지나지 않은 시간의 기록이 보이던 문제를 수정했습니다.
• 신체의 분위기·눈 특징 선택창이 스크롤되지 않던 문제를 수정했습니다.
• 편지에 선물을 고르면 발신자가 ‘나’에서 캐릭터로 바뀌던 문제를 수정했습니다.
• 두 번째 캐릭터가 소파에서 쉬기를 시작하지 못하던 문제를 개선했습니다.

이 버전은 내부 테스트 전용입니다. 이전 멀티 일정의 추가 복구와 새 공유 설정은 서버 반영 대기 중이므로 아직 해결 완료로 안내하지 않습니다. iOS 파일 내보내기 수정은 별도 검증 중이며 이 Android 업데이트로 iPhone 앱이 변경되지는 않습니다.
