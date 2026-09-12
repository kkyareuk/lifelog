# 1.0.328 (377) — dev

## Cumulative scope
Compared with iOS 1.0.327 (363), includes committed Android development changes through 376 plus 377. Android production baseline verified as 356 (1.0.323). Build 376/377: restores missing affection entry in the contextual menu; sofa/bed companion selection; distinct non-explicit adult contact narratives in KO/EN/JA; declining reactions and positive-only visual effect; hides home status labels during accepted affection. Autonomous affection honors both characters’ disabled activity settings and no longer excludes an initiator by lexical character-ID order.

Fixes old multiplayer schedule edits/cancellations with departed residents without allowing unknown new IDs or bypassing account permissions. Rest prefers sofa; close characters prefer adjacent seats and strangers prefer empty sofas. Rest settles for the second occupant. Restores excessive seat scaling (chair up to60px, sofa64px), sofa art +8.6%, north chair/character/table order. Includes prior async snapshot saves, bounded native backup payloads, iPhone profile/photo placement scroll fixes, shared-home imports into empty homes, furniture cross-room dragging and linked chairs, diagnostic feedback and contextual question feedback.

## Verification so far
Node contact rules/context destinations/three-language perspectives, old schedule mutation/permission/idempotency, sofa capacity/arrival/familiar vs stranger seats, async snapshot failure/revision/quota tests pass. Chrome/WebKit contextual furniture companion flow and primary-tab smoke pass. Chrome navigation and short-height schedule scroll, speech picker, room access, stale click guard, furniture touch/preview/depth/seat/food, positive effect and hidden labels pass. WebKit profile/placement scrolling and anonymous feedback/shared-home copy pass. These are synthetic browser fixtures, not a guarantee every dialog or physical device is error-free. Character-editor static check corrected for existing credits section and passes; actual settings version card visible in WebKit.

Android377 APK/AAB compiled and signature/version verified. Grouped home interactions and separate bed foreground labels also hidden during accepted affection; declined scenes retain neutral labels without romantic effects. Chrome grouped/bed/sofa rendering assertions pass; WebKit furniture companion selection and primary screens pass. iOS local project checks pass. Store upload, simulator build and submission status recorded after completion; this document alone does not claim distribution.

## Store notes (Android production 356 → 377)
<ko-KR>
화면 이동·저장·백업과 계정 확인의 안정성을 개선했습니다.
구매 내역 복원과 슬롯 표시를 다듬었습니다.
프로필·사진 배치·일정 화면의 스크롤을 수정했습니다.
멀티 집 공유 코드 적용과 이전 일정 수정·삭제를 개선했습니다.
가구 드래그, 의자 연결과 착석 위치를 조정하고 소파를 두 사람이 이용할 수 있게 했습니다.
게임 내 문의와 질문 선택지에 구체적인 의견을 보내는 기능을 추가했습니다.
캐릭터 상호작용과 성격별 반응을 다양하게 했습니다.
</ko-KR>
<en-US>
Improved navigation, saving, backups and account checks.
Refined purchase restoration and slot display.
Fixed scrolling in profile, photo placement and schedule screens.
Improved shared-home imports and older multiplayer schedule edits/deletions.
Refined furniture dragging, linked chairs and seating, including two-person sofas.
Added in-game support requests and specific question-answer feedback.
Expanded character interactions and personality-based reactions.
</en-US>
<ja-JP>
画面移動・保存・バックアップとアカウント確認の安定性を改善しました。
購入履歴の復元と枠の表示を調整しました。
プロフィール・写真配置・予定画面のスクロールを修正しました。
共有ハウスの読み込みと以前のマルチ予定の編集・削除を改善しました。
家具の移動、椅子の連結と着席位置を調整し、ソファを二人で使えるようにしました。
ゲーム内のお問い合わせと質問の選択肢への詳しい意見を送る機能を追加しました。
キャラクターの交流と性格に応じた反応を増やしました。
</ja-JP>

New/changed UI and narrative text: English100%, Japanese100% scoped; whole-app translation percentage not measured.

## Store progress
Android production release 20: only bundle377 selected; release name377 (1.0.328), 100% of existing target countries. Submitted via Play Console. Publishing overview shows changes under review with pre-review checks still running. Managed publishing disabled. Not yet publicly available. iOS377 archive/upload and simulator workflow running; do not select376.

iOS App Store upload377 accepted from9074dcd (not internal-only); Apple build ID20002e24-69d0-4af3-8f5c-198b8628ea34 selected for1.0.328. Korean and existing English metadata updated. Existing auto-release-after-approval preserved. Export questionnaire answered none of the listed algorithms after source/native dependency configuration review (system networking/authentication and SHA-256 digest, no custom encryption implementation found); Apple reference: https://developer.apple.com/documentation/security/complying-with-encryption-export-regulations . First377 simulator run timed out in simctl launch without stdout/stderr after180s; fresh-runner rerun pending. No iOS review submission yet.

### Startup validation follow-up
The process-only rerun reported success but produced white screenshots; this was not accepted as UI validation. CI-only native WebView probes and a real DOM readiness gate were added (not included in the uploaded production binary). Run34704089929 confirmed iPhone game DOM (402x820, 6 buttons, appChildren1, bootError null) and the welcome-screen screenshot was visually reviewed. Its iPad launch command timed out before validation, so isolated iPad run34704830246 follows. These simulator infrastructure timeouts do not establish an app crash or a successful iPad launch. Android prechecks finished and the release is in formal review. iOS remains a review draft until the outstanding check is resolved.

Isolated iPad run34704830246 passed: iPad Pro13 M5/iOS26.2, 1032x1344, game DOM rendered1, six buttons, bootError null, live PID. Its welcome-screen screenshot was visually reviewed. Together with the iPhone result this resolves the startup validation gate; it does not measure physical-device startup speed or every screen. Final Apple review-submit button clicked for377 after these checks; outcome recorded below.

### Final submission status — 2026-09-13 01:25 KST
Apple accepted submission08905947-b915-46d1-b781-29e976c2a6bd with exactly iOS1.0.328(377); status **Waiting for Review** verified in App Store Connect. Google Play production377(1.0.328) is **under review**, prechecks complete. Both preserve automatic publication after approval; neither is claimed publicly released. App source remains on dev (runtime9074dcd, CI2191d11); main has not been promoted while store reviews are pending. No in-game announcement or user email sent.
