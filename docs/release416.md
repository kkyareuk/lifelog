# Internal 416 · 1.0.364

Final build for the activities/needs/furniture request. Includes all changes and KO/EN/JA notes in release415.md.

The final coverage test compares the picker against every pre-existing DIRECT_ACTIVITY_GROUPS action as well as every LIFE_TASKS entry. It detected uncategorized social options such as take_pause. These are now reachable through More interactions, and future uncategorized options remain reachable. Chromium and WebKit tests pass for all original actions, all life tasks, actual hug command and three-language layouts.

Android: building signed AAB. Apple: internal-only upload requested. Production and public website unchanged.

Final notes submitted to Play:
```text
<ko-KR>
건물·가구의 다른 행동과 캐릭터 창에서 전체 할 일을 선택할 수 있어요. 거리 두기를 비롯한 기존 교류 항목도 모두 연결했어요. 교류 상대·주제와 생활·취미 선택을 보완했어요. 새 가구 그림·변기, 욕구에 따른 행동과 금지 욕구 100 유지가 적용돼요. 관계 설정을 게임플레이로 옮기고 침대·식탁 배치와 마피아 회의 화면을 다듬었어요.
</ko-KR>
<en-US>
Choose all previous activities from buildings, furniture and character sheets, including taking a pause. Set companions and topics. Added new furniture artwork, toilets, actions for low needs and fully satisfied blocked needs. Relationship rules are in Gameplay settings. Improved bed and dining-seat placement and Mafia meeting controls.
</en-US>
<ja-JP>
建物・家具の「ほかの行動」とキャラクター画面から、距離を置くなど以前の全行動を選べます。相手・話題や生活・趣味の選択を補いました。新しい家具の絵、トイレ、低い欲求に応じた行動と禁止した欲求の100維持を追加。関係設定をゲームプレイへ移し、ベッド・食卓の配置とマフィア会議画面を調整しました。
</ja-JP>
```

Signed AAB SHA256: A0918476091CF9B55007259533E687DE66E1710B3245FDEC1909A5A7EB52BFA7.
Source 2f5822b. Shared backend deployed successfully with 415's runtime; 416 adds client picker coverage only.

Play release 308: 416 (1.0.364) available to internal testers, verified 2026-09-16 14:11 KST. No production promotion. Apple final workflow35058302469 in progress. Previous415 workflow35057778466 succeeded and Apple accepted its internal-only upload; 416 supersedes it.

Apple Actions35058302469 succeeded: signed IPA, validated by Apple, uploadAccepted=true, internalOnly=true, submittedForReview=false. App Store Connect build55b5d079-18cc-4486-a53d-29296aaecc00 shows Ready to Test after the encryption questionnaire was completed for the unchanged OS-provided encryption implementation. No public App Store submission.
Existing internal group '나만 테스트' verified with 1.0.364 (416), including its installed status. New recipients were not added. Android and iOS internal delivery complete.
