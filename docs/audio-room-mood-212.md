# v1.0.197-dev / code 212

Branch: dev. No app main merge, website deployment, or Play Console upload.

## Changes

- Fixed the incremental OneDrive Android staging path that skipped assets/audio entirely. Walking/running files are now mandatory build assets.
- Movement audio uses at most two distinct character channels, preserves active channels across renders, and stops while muted/hidden. Preview temporarily takes over audio playback.
- Room photos cover the rounded frame. Owners are household-only multi-select, including all household members. A character may own multiple rooms.
- Room access configuration supports everyone, owners only, visitor/delivery/repair/pet/cat groups, specific characters/pets and custom text. This change adds configuration and persistence; it does not add new visitor AI or movement enforcement.
- Added explicit save actions for room, home, building and member editors; retained existing dictionary/car save paths.
- Furniture captions have white text on dark pills. The furniture drawer uses a cream panel, stable height, four whole buttons per horizontal page, search and a default-theme-only setting.
- Fixed neutral 변화가/대화가/영화가 being classified as anger by the former bare 화가 match. Emotional event reasons now name a cause, without quoting the whole activity log. The mood dialog lists factors and scores independently.
- Reworded deterministic everyday mood variation so it no longer invents physical fatigue or slower movement. Planned-schedule changes are explained separately when applicable.

## Verification

- check-footsteps-212, check-room-editor-212, check-mood-details-212 passed.
- check-home-editor-209, check-home-design-210, check-home-polish-211, check-buttons-love-hotfix-201 passed with current version/cache contracts.
- Home-life simulation (70 cases) and navigation (9 cases) passed.
- 384x854 Japanese UI: room owner/access/save/reopen, photo cover, drawer contrast/fixed height/default theme; final four-column drawer and independent mood breakdown inspected.
- npm run app:sync: 31 module closure files and 213 prepared assets.
- Gradle assembleDebug and bundleRelease succeeded. APK reports 1.0.197 / 212; AAB signature verifies. Eleven key files, including both sound files and new modules, match staged www files byte-for-byte in both packages.

## Remaining limits

- Physical Android audio output and long-running heat/frame-rate measurements remain unverified.
- All newly introduced room-permission/theme/mood strings have English and Japanese counterparts (100% within this change). Whole-app/log translation coverage is not measured; older Korean log fragments still appear in Japanese UI.
- Legacy scripts check-emotion-tastes-196 and check-village-189 contain obsolete version guards; check-relationship-emotion-202 and check-statistics-emotion-191 have older source/CSS contracts that fail. They are not counted as passing suites.
- No user artwork, unrelated files, payment keys, production data or public releases changed.
