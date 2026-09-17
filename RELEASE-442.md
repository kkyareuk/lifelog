# Internal 442 / 1.0.390

## Changes
- Android native banner and WebView now occupy separate rectangles. Remove the transformed-app positioning on this native path; game viewport units and fixed bottom/editor controls use the remaining screen height. Align the AdMob top banner to immersive screen top. Native loading/error text retains retry.
- Single and shared houses use a fixed 64px cell canvas, with width/height settings (12–64 columns, 16–64 rows), scrolling and per-home/floor scroll restoration. Rebase saved room percentages on resize to retain physical room/furniture geometry; prevent shrinking past occupied bounds. Shared layout saves include canvas dimensions.
- Only completed taps cycle through overlapping furniture. Dragging begins on the top object rather than cycling to the supporting counter/nightstand. Moving a support still carries attached objects. Cancelled pointer gestures no longer commit a move.
- Demo ads do not deliver SSV. Added one-use QA discovery redemption for verified operator or server-allowlisted test accounts. Normal accounts still require signed Google SSV; client-supplied QA flags cannot authorize credits. No currency or premium entitlement granted.

## Verification
- Chrome and WebKit home canvas/scroll tests; fixed geometry across expansion/shrink; shared save payload preserves furniture; repeated tap then drag selects top vase independently.
- Chrome and WebKit mocked native viewport/SDK tests: adaptive banner, retry, modal hide/restore, premium removal, fullscreen advertisement gating, portrait/landscape render. These emulate native viewport resizing; they do not replace real Android ad/device testing.
- Server QA reward authorization, rejection of client flags/unverified identity, one-use ticket/credit, account-wide cooldown regression and signed SSV service regression passed.
- Android bundleRelease and jarsigner passed. AAB prepared source bytes verified; internal442 marker verified. iOS preparation check passed, not signed IPA or real iOS native banner verification.
- diamondWalletApi and sharedTownApi deployed successfully to existing Firebase project.
- New user copy has KO/EN/JA. Static overall coverage: EN2258/2990 (75.5%), JA2257/2990 (75.5%).

## Artifact
C:/Users/Public/drawer-release433/drawer-village-1.0.390-442-internal.aab
SHA256: 2cd19bbdce74eba72ad8280fcd3b5d9942e2c1059df2010e8befb426741d61e5

## Play notes
<ko-KR>
광고 때문에 상단과 하단 버튼·집 편집 도구가 가려지는 문제를 수정했어요. 집 설정에서 가로·세로 크기를 정하고 넓은 집을 스크롤해서 볼 수 있어요. 싱글·멀티 모두 기존 가구 배치를 유지해요. 카운터·협탁 위 물건을 드래그할 때 받침 가구까지 선택되던 문제를 수정했어요. 승인된 테스트 계정에서 자아만들기 테스트 광고 보상을 확인할 수 있어요.
</ko-KR>
<en-US>
Fixed banners obscuring top/bottom controls and house editing tools. Set house width and height and scroll around a larger house, in single and multiplayer, while retaining furniture layouts. Dragging items on counters or nightstands no longer selects the support beneath them. Authorized test accounts can redeem Self-discovery test-ad rewards.
</en-US>
<ja-JP>
広告で上下のボタンや家の編集ツールが隠れる問題を修正しました。家の横幅・縦幅を設定し、広い家をスクロールできます。シングル・マルチとも家具の配置を維持します。カウンターやサイドテーブル上の物をドラッグすると台まで選ばれる問題を修正しました。承認済みテストアカウントで自分づくりのテスト広告報酬を確認できます。
</ja-JP>

## Distribution
Google Play internal release327: 442 (1.0.390), available to internal testers September17 19:25 KST. Source82a5b33 on dev. No supported devices removed; one nonblocking deobfuscation warning (minification disabled). Production unchanged.
Test link: https://play.google.com/apps/internaltest/4701300702493397907
QA allowlist is read from server-protected entitlements.adTestAccess, not client-editable user profile fields.
