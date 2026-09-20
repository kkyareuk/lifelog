# Startup recovery hotfix 460 / 1.0.408

Date: 2026-09-20. Android public baseline: 457 / 1.0.405, source 486d3a2 (runtime 070e791). Play Console confirmed production release 34 live at 00:32 KST, 100% rollout, with maximum registered code 459 before this work. Hotfix branch: codex/startup-recovery460. Development economy features are not included in this public-baseline build.

## Fix and data protection

The snapshot database was preloading all accounts and recovery keys, throwing from top-level module initialization if any referenced snapshot was unavailable. A healthy current save could therefore be blocked by an unused old backup or another account's reference. Missing snapshots now fail only when actually read. The state loader can continue with the healthy primary or a readable backup from the same account. If the primary cannot be read, its original reference is archived before recovery and the newest readable backup is preferred. No new empty village is created over an unreadable save when recovery fails. Database-open waiting is bounded. Error guidance in Korean, English and Japanese advises preserving app data and displays a privacy-safe error category and version.

This reproduces one cause of the reported startup screen. No affected Galaxy S25 FE device, original save or device crash log was available; the cause of every individual report and native process termination is not established. If no readable local backup exists, the app still protects the data instead of claiming it was recovered.

## Supporter review

Live server review found 8 approved public names and 0 pending requests. The weekly review had already approved the latest request, 고스트다이브. Refreshed the bundled public list from the public endpoint, including the requested display styles. Account identifiers, purchase amounts and receipts are not included. No duplicate approval and no user messages were sent.

## Validation

- Before: original public457 reproduces the exact startup failure for missing other-account data, an unused old backup, and a missing primary despite a valid backup.
- After: Chromium and WebKit full-page startup passes those three recovery cases; unrecoverable primary retains the pointer and shows the protected error screen. The original primary reference is retained when recovered.
- Real IndexedDB: migration, reloading, recovery-copy retention, write-failure preservation, quota recovery and account isolation pass on both engines.
- Snapshot codec and async save regression tests pass.
- Final Android web package starts offline, has no missing JS/CSS, and preserves a saved character after reload.
- Signed AAB: 485 web assets match byte-for-byte; jarsigner verifies the signature. SHA256: D70D8C679BC0AFF9FEE90231F237B582330597CD15114B61953BC9856A99C9B4.
- main and dev received only the common fix and supporter/test changes; recovery tests pass separately on each. Public-baseline version bump is isolated on the hotfix branch.
- The older combined qa-snapshot385 mailbox-navigation test times out with the current title-screen UI. Its storage assertions were extracted into the focused qa-snapshot-store460 test and pass. This does not claim the old mailbox test passed.
- iOS common runtime verified with WebKit. Native iOS build/signing not performed; local project checker requires the untracked GoogleService-Info.plist absent from this new worktree.
- Translation inventory: EN 2260/2993 (75.5%), JA 2259/2993 (75.5%). New startup guidance and release notes: KO/EN/JA complete.

## Internal test release notes

<ko-KR>
저장 데이터가 남아 있는데 앱 화면을 열지 못하는 일부 문제를 수정했어요. 정상 백업이 있으면 같은 계정의 데이터를 복구하며, 복구가 어려운 경우에는 데이터를 보호하고 오류 안내를 표시해요. 후원자 명단을 갱신했어요. 공개판 457 기반 긴급 수정 테스트로, 459의 재산·직장 테스트 기능은 포함되지 않아요.
</ko-KR>
<en-US>
Fixed some startup failures when saved data is still present. Available backups from the same account can restore the village; otherwise data is protected and recovery guidance is shown. Updated supporter credits. This hotfix test is based on public build 457 and does not include the experimental economy and Work features from 459.
</en-US>
<ja-JP>
保存データが残っていても起動できない一部の問題を修正しました。同じアカウントの正常なバックアップから復元し、復元が難しい場合はデータを保護して案内を表示します。応援者名簿を更新しました。公開版457を基にした修正テストのため、459の財産・職場テスト機能は含まれません。
</ja-JP>

Delivery: Play internal release 339 / build 460 confirmed 'Available to internal testers' at 2026-09-20 10:05 KST. Production remains 457; no production promotion, closed-test promotion, iOS release or announcements performed. Common source commits: main ad39408/e54a6aa, dev 8a2a377/310b4c1. Android version commit 5ff90a7. Signed artifact: C:/Users/Public/drawer-releases/drawervillage-1.0.408-460-hotfix.aab.
