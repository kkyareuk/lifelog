# 1.0.418 / Android 470 — room artwork and shared baths

2026-09-22. New features on dev; Google Play internal testing only.

## Changes
- Room settings: photo-use option followed by Hide furniture and an explanation, full-width layout at 360px. Personal and multiplayer editors persist the same room flag.
- Hide only furniture artwork/props/chair frames/bed covers; preserve hit targets, positions, assignments, interactions and residents. Furniture appears in edit mode.
- Existing bathtub supports exactly two current romantic partners/spouses who are both bathing in the same home/room. No new furniture product. Different rooms/tubs, showers, unrelated characters, past relationships and third occupants are excluded.
- Directed activities and scene reservation capacity agree. Joint bath snapshots and each participant's history survive multiplayer reloads. Reading a solo base scene does not erase an observed bath history.
- KO/EN/JA copy for new controls, explanations, bath scenes and release notes.

## Validation
- check-home470: pair matching, two seats, third occupant/ex-partner/shower/different location exclusion, hydration and translations.
- check-bath-server470: real multiplayer commands, snapshots, both histories, third-person rejection, personal-state isolation.
- qa-home470: actual UI 360x800 in Chrome and WebKit, KO/EN/JA, save/reopen, hidden artwork/retained hit targets, edit visibility, actual directed bath scenes.
- Existing table occupancy check-home466 and server coffee crafting check-coffee-server469 passed.
- Packaged app boots offline with no missing JS/CSS and retains saved character on reload.
- Signed AAB: 504 prepared web assets match byte-for-byte; jarsigner reports jar verified (existing self-signed certificate and ZIP-stream warnings).
- Two broad legacy source-string tests still fail on obsolete expectations also absent from pre-change HEAD: check-home-life-simulation expects anchorX+(index?gap:-gap); check-home-surfaces forbids furnitureSprite entirely. No full-suite claim.
- Static translation inventory: EN2260/2988 (75.6%), JA2259/2988 (75.6%). Newly added copy verified in both languages.
- iOS common code covered by WebKit only; no new IPA or Apple submission in this task.

## Artifact
C:/Users/Public/drawer-releases/drawervillage-1.0.418-470-internal.aab
SHA256 1B6F4BA30928EC190539265A657D8D3C8A06F0F3C0AF88665F189CC64ADA848F
Play internal release349: upload in progress at record creation.

## Multiplayer deployment
Baseline sharedTownApi00109-puw source downloaded from the deployed Cloud Function.
Only this task's exact changes were applied to four runtime files and shared-bath.js added; all other deployed services/features preserved. Reproducible delta: backend470.patch.
Merged artifact passed shared bath and existing coffee tests. Deployment result will be recorded separately.

## Google OAuth branding — completed
lifelog-98fff had an empty privacy link. Saved https://drawervillage.com/privacy and https://drawervillage.com/terms; set support email to the existing public app support address. Kept app name Drawer Village and homepage https://drawervillage.com.
Public policy pages and homepage policy links were checked. Google automatic brand verification passed, then branding was published. Console explicitly says branding is verified and displayed to users. OAuth scopes, credentials, audience and IAM were not changed.
https://console.cloud.google.com/auth/branding?project=lifelog-98fff

## AppBrain check
https://www.appbrain.com/app/drawer-village-character-sim/com.drawervillage.app
At lookup: South Korea Simulation Top New Free #2, Games Top New Free #33, Simulation Top Free #44. The Sep20 email #3 is not independently confirmed historical data; likely the same new-free chart at a prior date. Do not describe this as current overall #3 or a verified email sender identity.

## Branch scope
Feature code belongs to dev. Old main still powers a different web deployment and is not wholesale replaced. Release/status documentation is copied to main; project board main is updated separately.
