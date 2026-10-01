# Production 512 — timetable readability and life fixes

Date: 2026-10-01. Version 1.0.460 / code 512. User explicitly requested app production deployment. Application source: dev 5a14e505, including previous unpublished c7a9a4e3 and 124e3c98. Main receives release documentation only because its Pages deployment and old application baseline remain protected by repository instructions.

## Included changes

- Mobile timetable uses readable day widths and horizontal scrolling. Titles wrap; short blocks can scroll, and the day agenda preserves complete text and every event. At most two overlapping blocks are shown side by side; excess entries remain in the agenda.
- Manually entered schedules take priority over generated sleep/lunch/work. Automatic blocks are trimmed around manual plans. Runtime selection follows the same priority. A manual plan added after a day was generated now produces the active scene without overwriting the old day history.
- Earlier unpublished fixes included: weekly sleep/lunch/work/shared plans, custom job duties and work building/room selection, map-distance/gait travel seconds, regular small-room character minimum, iOS full-bleed background with safe HUD, and account-scoped purchase-access retry/restart recovery.
- KO/EN/JA notes in play512-notes.txt and ios512-notes.json. New interface/release copy translated. Existing static coverage EN2250/2983 (75.4%), JA2249/2983 (75.4%).

## Verification

- PASS Chromium and WebKit actual app QA: shared plans, lunch setting/runtime, manual plan starting before lunch still wins, long titles wrap, three overlaps yield only two 50% columns, third entry remains in agenda, scaled actor minimum, EN/JA controls.
- PASS check-timetable-access, check-reported-life, check-routine284, check-meeting-journey272, check-native-platforms, check-ios-appstore, check-billing511 and check-apple-access.
- Android app:sync and Gradle bundleRelease succeeded using JDK21. jarsigner verified; expected self-signed Android signing certificate warning. All 633 packaged web assets byte-match prepared source.
- AAB SHA256: 3fbdff84b3a8f1913c03d9fcf1474705fa89b05f5f55541de7e6017f5268b04e.
- Actual iPhone ad-removal/safe-area behavior and real store payments were not exercised. Purchase tests use mocks; no claim that all purchase failures are eliminated. Unchanged server Apple billing integration test remains unavailable locally without its Apple server-library dependency.

## Android release

- Prior public and internal version511 confirmed in Play Console.
- Internal release385 / 512 available to testers, 2026-10-01 14:12 KST.
- Same signed AAB promoted to production; 100% rollout and existing countries retained. Legacy467 retained for API23, replaced511 excluded. No supported device loss.
- Submitted one production change. Play publishing overview shows review pending with automatic quick checks, managed publishing disabled. Approval is required before public availability.
- Evidence: C:/Users/Public/drawer-releases/play512-review.jpg.

## iOS release

- Prior public1.0.459(511) READY_FOR_SALE confirmed in Actions36817737237.
- App Store eligible signed upload Actions36818263187 requested from source5a14e505. Final submission status will be recorded below.

## Requested medieval access

- User could not identify the account and authorized finding it using the US/monastery description.
- Country/timezone is not stored by the examined account code. Searched relevant character-name fields, compressed character records, shared residents and legacy account character data for the supplied screenshot names.
- No matching monastery character set found; similarly named characters did not match. No account entitlement changed. Exact UID or login email is needed to grant the intended account. No personal account details are committed here.

## Final iOS submission

- Mac signing, Apple validation and App Store eligible upload succeeded in Actions36818263187; upload source5a14e505b24782eeddeafff60af0fd766a287ef3.
- Actions36819124371 prepared version1.0.460 and attached processed VALID build512 with KO/EN/JA release notes.
- Actions36819168992 submitted successfully. Final state WAITING_FOR_REVIEW, releaseType AFTER_APPROVAL. Not yet publicly available.
- Evidence: ios512-submission.json. No pricing, new agreements, tester permissions or announcements changed.
- Follow-up QA only adds assertions/screenshots; runtime bytes are unchanged from the signed512 source.
