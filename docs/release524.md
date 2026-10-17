# Public hotfix 1.0.472 (524)

Operating mobile baseline: fb39edeb (523). Play production 523 at 100% and maximum registered bundle 523 verified 2026-10-17. Apple 1.0.471 (523) READY_FOR_SALE verified by Actions39030650306. Web main is a separate baseline.

- Move the ad privacy button into the settings scroller instead of the main grid, preventing the button from displacing settings content.
- When automatic restore finds different live village IDs, merge device/cloud data even when the local timestamp is newer and character IDs match. Preserve newer local characters and intentional village deletion records.
- A read-only report investigation confirmed additional villages remain in cloud storage. No production account data was edited; exact affected-device restoration is not verified remotely.
- Regression fixtures reproduce both defects against 523. Account restore/isolated-account/merge checks pass. Browser tests exercise ad-enabled settings across nine panes, three locales and three viewport sizes, including no-fill.
- Added release notes KO/en-US/ja complete. No new UI strings. Dictionary coverage EN2250/2983 and JA2249/2983 (75.4% each).
- Platform build/upload/submission evidence will be appended after verification. No unrelated development features included.
