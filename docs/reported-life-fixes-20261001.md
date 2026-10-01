# Player reports: career, return journeys, room scale and iOS inset

- Scope: code changes and verification only, explicitly chosen by the user. No app upload, server deployment, announcements or tester permission changes.
- Base: origin/dev 91738c63; version remains 1.0.459 / 511. No new release is claimed.
- Development branch: codex/reported-life-fixes, integrated into dev. Production main receives this record only under repository deployment rules.

## Changes

- Custom careers use the currently configured rank duties in daily scenes, with bounded duty rotation during work hours. Editing duties invalidates the relevant timeline signature. User-written content remains literal in each language.
- Work schedule settings include building and room selection. Scheduled and manual work share destination resolution; home is handled as a home destination rather than an external building ID. Room access and town travel restrictions are respected. Shared profile saves include both fields and roll back local state on failure.
- Scheduled returns use a fixed route and a one-minute local / two-minute inter-town arrival deadline. Existing saved returning scenes recover within two minutes of their recorded start without erasing history.
- Bedside character minimum size is measured in screen pixels after room scaling. A configured minimum of zero retains natural sizing.
- iOS keeps the safe-area top inset when the banner height becomes zero, including after ad removal.

## Verification

- PASS scripts/check-reported-life.mjs: custom duties, edits, shift boundaries, KO/EN/JA, work destinations, room permissions, town restrictions, old return deadlines and scaled size.
- PASS scripts/qa-reported-life.mjs in Chromium and WebKit: actual app daily logs, manual home work, local and mocked shared profile saves, rollback, translated controls, old-save arrival preserving history, 32px visible bed character after 0.4 room scaling.
- PASS existing check-joblogs499, check-routine284, check-bath510 and check-movement494 checks.
- PASS existing qa-ios-banner507 --webkit with mocked native bridge. This does not execute the Swift plugin.
- PASS web preparation (304 modules), Android and iOS web-asset preparation, module closure (305 modules), git diff --check.
- Existing check-career475 fails its off-shift todayCareerDuty expectation; the same null result was reproduced against unmodified HEAD salary.js. It is a pre-existing test mismatch, not reported as passing.
- Swift source reviewed; no Mac compilation or physical iPhone test performed. Native ad-removal layout remains pending device verification.
- Reported video sampled using local video frames. User accounts and production data were not accessed or modified.

## Translation

- New building/room controls: Korean, English and Japanese complete.
- Overall static coverage: EN 2250/2983 (75.4%); JA 2249/2983 (75.4%).

## Distribution

No APK/AAB/IPA release generated or uploaded. These changes are not yet delivered to existing app users.
