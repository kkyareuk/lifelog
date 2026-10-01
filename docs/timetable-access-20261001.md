# Weekly timetable and follow-up player fixes — 2026-10-01

Version stays 1.0.459 / 511. Development changes only, based on dev c7a9a4e3. No store upload, server deployment, tester access change or announcement.

## Player-visible changes

- Weekly time grid shows saved sleep/wake times, work schedules and lunch. Long events span their duration; overlapping appointments use separate lanes. Lunch splits the displayed work block. Overnight events continue on the next day, including Saturday to Sunday.
- Sleep, lunch, work/class, shared and personal events use distinct colors and text labels. A daily-times dialog updates wake, sleep and lunch start/end; lunch is connected to an actual eating scene at the selected time. Work location is used for lunch only when working that day/time.
- Weekly and dated schedules are projected to all listed participants, with deletions respected and no duplicated persistent copies. Other characters' schedules show details; owned schedules remain editable. Shared-world daily-time changes require the current character's ownership and unchanged group context.
- Scheduled returns no longer wait a fixed one or two minutes. Duration is map distance / 30 units per second, multiplied by the existing gait factor. A natural 60-unit route takes two seconds. Map portions of commanded journeys use the same speed calculation. Scene refresh and arrival use sub-minute precision. Interior journey segments retain their existing separate behavior.
- General standing/walking/seated/bathing character faces receive the configured screen-pixel minimum, including scaled rooms. Bed occupants retain their art-aware sizing. A zero minimum remains an opt-out.
- With no iOS banner, the WebView fills the screen. The observe background extends behind the status bar while the HUD uses the safe top inset; no blank body strip is reserved there.
- Successful purchases wait for the entitlement refresh. Failed access reads persist an account-scoped retry marker and retry with backoff, on connectivity/focus/cloud-load and across restart. Account changes cannot apply the old result to another user. The UI distinguishes confirmed payment with pending application from applied purchase; verification and server grants remain authoritative.

## Verification

- PASS check-timetable-access: participant/deleted/dated schedules, overnight splitting, collision lanes, distance/gait timing, entitlement refresh offline retry, restart and account isolation.
- PASS qa-timetable in Chromium and WebKit: actual app grid, seven days fit mobile width, lunch time save and runtime eating scene, participant view, scaled regular actor minimum, EN/JA controls. Screenshots captured from the running app.
- PASS WebKit with mocked 47px safe top: HUD top 47px, background top 0px, body padding 0px. This is web layout verification, not native-device verification.
- PASS check-reported-life, check-routine284, check-movement494, check-meeting-journey272.
- PASS Android check-billing511 and check-billing511-ui; Apple check-apple-access confirms awaited refresh and pending-application result. All use mocked billing, no actual charges.
- PASS existing qa-ios-banner507 --webkit with mocked SDK.
- Existing combined Apple server/client check-apple-billing could not start because the local @apple/app-store-server-library dependency is absent. Backend verification code was not changed. A separate Apple client regression test covers this turn's changes.
- Web, Android and iOS asset preparation and native module closure verified. weekly-timetable.css is explicitly packaged. No signed store binary produced.
- New interface copy is supplied in KO/EN/JA. Existing static translation metric: EN2250/2983 (75.4%), JA2249/2983 (75.4%). The metric does not enumerate every new module string.

## Remaining verification

Actual iPhone safe-area/ad-removal checks and actual store sandbox purchases were not performed. No claim is made that every possible purchase failure is eliminated. These changes have not been delivered to app users.

Game code goes to dev; main receives documentation only under the repository's deployment restriction. The taskboard main records this as development verification, not a release.
