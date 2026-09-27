# iOS 1.0.455 (507) — banner viewport hotfix

## Scope
- User reported iOS public469 (1.0.417), iPhone viewport393×798: banner advertising hides bottom controls.
- Apple read-only status confirms1.0.417 READY_FOR_SALE. Released source fe9f21f4; isolated branch codex/ios-banner507. No post469 feature merge in this iOS hotfix.
- Public upload source03b13a1ea285cb9ef0ca974aa21a99787f469524. Android metadata aligned only for existing project preparation checks; no Android469-based binary is to be published. Google Play506 remains separate.

## Root cause and correction
- Android already reserved the native WebView rectangle. iOS had no AdViewport bridge and fell back to translating #app; fixed controls and viewport measurements could extend below the visible screen.
- Add an iOS root container with separate banner/status and WKWebView. Reserve the measured banner height plus top safe area, resizing the WKWebView itself.
- Recalculate on layout/safe-area changes; release all reserved space at height0. Preserve bottom home-indicator safe area, SDK placement, consent and paid ad-removal policy.
- Existing billing/profile plugins remain registered. Native viewport plugin and controller are in their own source file, included in the Xcode build.
- Same fix and regression checks ported to dev; main remains documentation-only because the old web deployment is attached.

## Verification
- Windows iOS asset/project preparation passed.
- Chrome/WebKit at393×798: adaptive banner heights, footer stays inside shortened viewport, character-screen hide/restore, landscape and paid ad-removal restore passed. Real game modules; ad SDK mocked, no live ad requests.
- Actual Swift/native geometry and iPhone simulator verification recorded below when complete. No claim of physical-device testing.
- Existing UI copy unchanged. New release notes KO/EN/JA100%. Public469-derived static coverage EN2262/2993 (75.6%), JA2261/2993 (75.5%).

## Apple release notes
- KO: iPhone에서 광고가 표시될 때 화면 아래쪽 버튼과 내용이 가려지는 문제를 수정했어요. 광고 크기 변경과 화면 회전 후에도 게임 화면을 알맞게 조정하며, 광고가 사라지면 전체 화면으로 돌아와요.
- EN: Fixed an issue where banner ads could push bottom buttons and content off screen on iPhone. The game now adjusts to banner size changes and device rotation, and restores the full view when the banner disappears.
- JA: iPhoneで広告の表示中に画面下部のボタンや内容が隠れる問題を修正しました。広告サイズの変更や画面の回転に合わせて表示領域を調整し、広告が消えると全画面に戻ります。


## Native verification complete
- Mac Actions36307413132 succeeded; audited checkout03b13a1e (workflow commit70070dba).
- iPhone17 Pro / iOS26.2 simulator: live process and rendered game DOM, no boot error.
- Actual WKWebView geometry: root874, safe top62; banner56 → y118/h756, banner90 → y152/h722, hidden → y0/h874. Every web bottom equals874 and the root is separate from the web view.
- WebKit test used the reported393×798 viewport. Physical iPhone/iOS18.7 and live ad network are not claimed as tested.
- Legacy check-layout443 stops at old room width expectation24 versus current12; room-layout.js and that test are byte-identical to the469 release. Focused banner UI/native checks above passed.

## Signed upload accepted
- Actions36307800335 success: App Store eligible archive, codesign, Apple validation and upload accepted for1.0.455(507).
- Checkout source03b13a1e verified by the pinned-source step. The upload report's source3965216d is the workflow commit, not the checkout source.
- Apple build processing was still pending at upload completion; upload acceptance alone is not submission or public availability.

## Production review submitted — 2026-09-27
- Apple processed build507 as VALID:170b6dfd-a50c-4b85-b004-43d918cef2da.
- Existing unsubmitted1.0.444 draft updated to1.0.455 with507 and KO/EN/JA hotfix notes. API preparation36308401098 succeeded.
- Apple required usesNonExemptEncryption for the newly uploaded build. Read the released469 build's existing false declaration and carried it forward; encryption behavior is unchanged in this banner-only hotfix.
- Actions36308630190 succeeded: appStoreVersion169ef378-ddb7-4f4e-b0f4-486ed14f12db reports WAITING_FOR_REVIEW, releaseType AFTER_APPROVAL.
- Review submission is complete. General App Store availability remains pending Apple approval. No further browser login was needed because the existing Apple deployment API connection was used.
- No Google Play release change, pricing/permission changes, new tester invitations, or in-game notice/email was made.
