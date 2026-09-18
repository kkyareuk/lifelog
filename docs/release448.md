# Internal 448 / 1.0.396 — 2026-09-18

## Changes and verification
- Home elevator selector now changes the viewed floor, not the total number of floors. Chrome/WebKit multiplayer regression verifies no layout save occurs and both floors retain their rooms.
- Furniture rotation uses the same scene-depth module instance as rendering, so worktop attachment placement/depth refreshes. Multiplayer chair touch selects furniture, not room info; attached pot sorts above counter in both browser engines.
- Character letters accept legacy numeric IDs and discard unusable saved question options before opening. General/question/deleted-sender/legacy-schema letters open in touch tests. The user's latest-device failure has NOT been reproduced; do not announce it as fully resolved.
- Walking/running use the supplied shoe recordings. Full recordings loop instead of repeatedly restarting their first fragment; mute and two-actor limit preserved. Shoes no longer require shared-profile parsing for audio.
- Slot grant transaction tests confirm a total of three free towns, five base characters, idempotent compensation and purchased-slot preservation. Read-only entitlement audit: 1,107 user documents; 1,089 have one added town slot, all 17 with more have town-slot purchase records, remaining document has no registered Auth account. No additional compensation grants or reductions performed.
- Android app-ads.txt recheck succeeded in AdMob. Application readiness review still limits delivery; this is not full advertising approval.
- Chrome/WebKit touch tests, previous447 data regression and web/native audio setting isolation pass.
- Android signed release build; all 471 prepared assets byte-identical to bundle, jarsigner verified. iOS project/assets prepared and checked only; no signed IPA or device test.
- EN 2260/2992 (75.5%); JA 2259/2992 (75.5%). No new untranslated interface text.

Artifact: C:/Users/Public/drawer-release433/drawer-village-1.0.396-448-internal.aab

SHA256: 61CAE73A92FF6CF06208FB03F86279F0F6BA5476851ED216F82981D57323F56D

## Release status
Play internal release332 upload in progress. Public449 and cumulative public notice remain pending the reported device/mail issues and release requirements. Public446 draft must not be submitted accidentally. Existing main/web deployment unchanged.
