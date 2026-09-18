# Internal 447 / 1.0.395 — 2026-09-18

Development branch: dev. Public Play baseline remains 437; production446 draft and announcement are still on hold. No public web/main rollout.

Play internal release331: **available to internal testers**, September18 16:46 KST, verified in Console. Source commit cc6db26 pushed to origin/dev. Only warning: missing optional obfuscation mapping; supported devices unchanged.

## Changes
- Multiplayer restoration preserves profile.job instead of replacing it with the display jobTitle stored at the resident root. Save/reconnect round-trip regression covers this. sharedTownApi deployed successfully.
- Multiplayer character order stored per account and group, without modifying the personal village order.
- Whole-room photo replaces wallpaper; homes fit the screen while preserving rooms/furniture from expanded layouts. Representative interior photos use contain.
- UI hiding persists through renders and keeps furniture controls available. Dock size changes are clamped to the viewport. Selection dialogs defer background renders until dismissal.
- Tablet character book menu size, scroll bounds and form layout corrected at the original selectors. Base LD editing preview no longer uses the daily outfit image.
- Added black sclera / Irezumi with English and Japanese translations; conditional relationship fields respect hidden.
- Multi entry placed between Friends and Settings; friend rows use beige/gold styling. Nonowned discovery remains translucent/disabled.
- Ad-free entitlement survives normalization; banner/interstitial requests wait for resolved access. Banners allowed on tabs other than Character, with existing full-screen activity exclusions.
- Source-image hashes and URL aliases deduplicate differently encoded copies in active photo usage. No stored photos deleted.
- Scheduled sleep takes precedence over forced home return and urgent needs. Unseated characters render in front of the backmost furniture.

## Verification
- check-feedback447: job save/reconnect, account/group ordering, image identity/aliases/count stability, lossless room migration, night-only awake schedule.
- Chrome and WebKit qa-feedback447: home fit/photo/hide controls, dropdown refresh boundary, tablet menu, paid account startup without ad flash, tab policy.
- Touch/mouse/keyboard selection regression; shop billing regression; 10 static performance checks. These are not Android-device latency measurements.
- Android release build and jarsigner verify; 468 assets byte-identical to the uploaded bundle.
- iOS project/assets prepared and project check passed. No signed IPA or device validation.
- EN 2260/2992 (75.5%); JA 2259/2992 (75.5%) static UI coverage. New feature-option translations included.

Artifact: C:/Users/Public/drawer-release433/drawer-village-1.0.395-447-internal.aab

SHA256: A4D1BF4083BA01823CAE7507DB3E66746B7466A5AC9CA1E3CA70DF7F7D03DB58

## Still unresolved
- S25FE startup failure and severe physical-device lag have not been reproduced. Do not announce them as fixed.
- The reported 162-photo account was not identified/inspected; repeated-count regression does not establish the exact account-specific cause.
- Real AdMob fill/account approval and physical-device paid restoration require follow-up.
- Secret relationships remain a design proposal pending whether other players, as well as characters, should be excluded. Not included in447.
- Production submission, Data Safety completion and public announcement remain pending.
