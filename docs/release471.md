# 1.0.419 / Android 471 — internal testing

2026-09-22. Development on dev, internal testing target only. Play Console latest confirmed 470 / 1.0.418.

## Confirmed scope
- Furniture taps must not open room information; show every scheduled participant in a room.
- Visible notification character selection, select all and persistent choices.
- Diagnose missing multiplayer member profile pictures while preserving block/privacy filters.
- Independent town era and country/cultural settings; period-aware generated activities.
- 100 supplied recipes, costs, cooking levels and local 2–7-second step playback with persistent results.
- Accidents, hospitals and bystander reactions explicitly deferred by user.

## Implemented and verified
- Eight supplied MP3s play at appropriate cooking steps, with volume/mute and page-visibility cleanup.
- Wallet/work use character images and stay below the character picker. Public-channel entries open coming-soon without wallet initialization/mutation; internal entries remain functional.
- Step durations: prep/pour/plate 2s; cut/mix 3s; grind/knead 4s; fry/ordinary heat 5s; long simmer/bake/wait 7s. Legacy jobs preserve their original clock.
- Android minimum API raised 23 → 24: Play's enabled automatic protection rejected API23. Android6 is excluded from this update; protection remains enabled.
- 100 recipes/20 per cuisine; timing boundaries/legacy clock; actual shared engine commands, persisted jobs, replay cost protection, once-only completion and personal-world isolation passed.
- Service authorization/concurrent completion/sub-minute clock and era/culture owner/enum validation passed against both development and prepared deployment sources.
- 42 era/culture combinations, electronic filtering and localized replacement checks passed.
- Notification default/individual/all/last selection, transfer aliases and save serialization passed.
- Photo repair tests passed: local upload, empty/HTTPS preservation, own-member-only updates, account and newer-photo races. No live user's data was edited as a test.
- Chromium and WebKit mobile cooking list/detail/start, navigate/reload/progress/finish, once-only billing; public KO/EN/JA and internal wallet/work, picker hit testing and decoded icons passed. Audio lifecycle tested with mocked playback.
- Chromium 360px furniture pointer/keyboard selection, editor clamping/resize and four scheduled residents rendered with a controlled event fixture passed.
- Packaged offline startup and saved-character reload passed with no missing JS/CSS.
- Actual device audio listening and signed iOS/IPA testing were not performed. Public web and Apple remain unsubmitted.

## Translation
Whole-app static catalog EN2257/2985 (75.6%), JA2256/2985 (75.6%).
All 100 recipe names/ingredients and 1,074 steps: EN/JA100%. New era/culture, cooking and placeholder UI includes KO/EN/JA.

## Backend
Selective patch of actual deployed revision00110 preserves deployment-only changes. Only sharedTownApi deployed.
Result: sharedtownapi-00111-qox, updateTime2026-09-22T09:58:39.520387528Z.
Re-downloaded deployed source: all166 files match the prepared deployment byte-for-byte.
Existing-file patch is backend471.patch. New runtime files are cooking, cooking-timing, town-setting, recipes, recipe-localizations and five cuisine copy modules.

## Content scope
User-supplied recipes.js is the baseline. Game prices/levels and 2–7s playback are fictional balancing, not real cooking times.
Medieval reference: https://www.gutenberg.org/ebooks/8102 (The Forme of Cury). Not all20 recipes have received a separate historical source audit.
Era/culture is a game setting, not a guarantee of exhaustive historical simulation for every combination.
Restaurant prices are reference values. Prepared food is stored/displayed; eating and restaurant purchasing are not added here. Accidents/hospital/nearby reactions deferred.
Audio provenance in cooking-audio471.md. Play KO/EN/JA notes in play-notes471.txt.

## Release status
Internal release350 upload/review pending. No production promotion or Apple submission for this version.

Signed AAB: C:/Users/Public/drawer-releases/drawervillage-1.0.419-471-internal.aab
SHA256: 0F31D633C50CD06D43C4BA9461A2C47B7FBE035010A4C1BA635C30F8A0193DC5
Jarsigner verified; all526 prepared web assets match signed bundle bytes.
