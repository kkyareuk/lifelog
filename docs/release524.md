# Public hotfix 1.0.472 (524)

Operating mobile baseline: fb39edeb (523). Play production 523 at 100% and maximum registered bundle 523 verified 2026-10-17. Apple 1.0.471 (523) READY_FOR_SALE verified by Actions39030650306. Web main is a separate baseline.

- Move the ad privacy button into the settings scroller instead of the main grid, preventing the button from displacing settings content.
- When automatic restore finds different live village IDs, merge device/cloud data even when the local timestamp is newer and character IDs match. Preserve newer local characters and intentional village deletion records.
- A read-only report investigation confirmed additional villages remain in cloud storage. No production account data was edited; exact affected-device restoration is not verified remotely.
- Regression fixtures reproduce both defects against 523. Account restore/isolated-account/merge checks pass. Browser tests exercise ad-enabled settings across nine panes, three locales and three viewport sizes, including no-fill.
- Added release notes KO/en-US/ja complete. No new UI strings. Dictionary coverage EN2250/2983 and JA2249/2983 (75.4% each).
- Platform build/upload/submission evidence will be appended after verification. No unrelated development features included.

## Verified build and submission

- Chromium trusted touch, WebKit source and copied iOS app assets: nine panes × KO/EN/JA × 402x749, 874x402, 820x1180 passed with ads enabled/no-fill. Physical phone testing unavailable.
- Android bundleRelease succeeded; jarsigner verified. All 629 prepared asset bytes are present in the signed archive (non-ASCII ZIP names compared by hash). AAB SHA256 053794d6343134b7fc3a87399501c0dc180d7831328c6ab32da489fd9cadc637.
- Google Play production release49, code524 / 1.0.472 submitted 2026-10-17. 100% rollout across existing178 territories, legacy467 retained, zero device-support loss. Only pre-existing optional mapping-file warnings. Publishing overview: changes in review, automatic quick checks running; not yet confirmed live.
- Public web main7799f1d1, Cloudflare96a8dc5e, live cache and recovery code verified. Desktop redesign retained.
- iOS upload Actions39031075796 succeeded: signed App Store eligible1.0.472(524), internalOnly=false, uploadAccepted=true. Workflow execution context bb37ff96 checked out and validated pinned source af0806a1. Apple processing and preparation39031707480 pending.

- Read-only cloud evidence contains a 2026-10-05 snapshot with additional villages; later device progress and actual user-device recovery remain unverified. No account save mutation or email reply was performed.

## iOS submission confirmed

Preparation39031707480 attached VALID build35c627f7-e2bf-4887-8a12-f5d7c29f522c to versionadb48276-e243-4e00-b9be-516bd6ca563b and applied KO/en-US/ja notes. Submission39031776861 succeeded: WAITING_FOR_REVIEW, AFTER_APPROVAL. Submitted, not yet approved/live.
