# Settings scroll hotfix — iOS 1.0.471 (523)

Base: public522 source 5d1eaf20 plus release evidence 5e71b79d. Apple522 READY_FOR_SALE confirmed by Actions38843514573. No unreleased development is included.

Fix a settings scroll region being replaced during touch/momentum; defer background renders until scrolling is quiet. Use one bounded settings scroller. Remove setting-card content-visibility placeholders that collapse the scroll range during restoration (notifications restored to zero before the card was laid out). Preserve native panning over selects and distinguish drags from taps.

Validation: Chromium trusted touch input across nine settings panes, three sizes (402x749, 874x402, 820x1180), KO/EN/JA. WebKit source and prepared iOS assets pass the same layout/end-access/scroll-preservation matrix with programmatic scrolling. Restoring the old card optimization reproduces the notification-pane reset in the regression test. Character full-settings selection/persistence and scene pinch regressions pass Chromium/WebKit. Native module closure, platform isolation, real-auth isolation, selection continuity and App Store request checks pass. Physical iPhone verification remains unavailable.

No new UI strings. Release notes KO/en-US/ja complete. Overall translation EN2250/2983 and JA2249/2983 (75.4% each).

Android candidate code523/version1.0.471 is prepared to satisfy shared version checks; Play upload awaits confirmation of the highest registered versionCode. Initial iOS CI38845972250 stopped before signing/upload because the shared versionName check caught Android522/1.0.470. Corrected both targets without bypassing validation. iOS523 upload/submission pending. Main web backport is separate because its source differs from the mobile public baseline.

## Android build and web backport
User confirmed the latest Play versionCode is522. Android candidate523 is now confirmed as the next code. Gradle bundleRelease succeeded; jarsigner verified. All629 packaged assets match source byte-for-byte. Artifact: drawer-village-1.0.471-523.aab; SHA2565684d08ea99277a235957612ed2263edbce5b1b6d4243034eaffab27241f110f. Store upload pending.

Main backport acefeebe contains only the applicable scroll fixes and web cache update. Its eight settings panes passed Chromium touch and WebKit programmatic checks across all three languages/sizes. Mobile character full-settings additional trusted-touch/WebKit scroll tests pass. iOS corrected upload run38846246566 is building source fb39edeb.

## iOS upload and review preparation
CI38846246566 succeeded: signed App Store eligible1.0.471(523), internalOnly=false, uploadAccepted=true, source fb39edeb6d4d47c0a99166a8b02c3885e7e79352. Apple Sign In entitlements match. Preparation38847025616 attached VALID build58d2f244-2584-45ea-bf77-7e95f3db58db to version108344f5-aaac-448b-97a2-077103c0196c, applied KO/en-US/ja notes, AFTER_APPROVAL. Submission38847147493 is pending verification.

Web main8af3d90a is committed and Pages built, but the separate public domain still serves its previous app shell for the new module URL. Public website update is not confirmed; no Cloudflare deployment was performed.

## iOS submitted
Submission38847147493 succeeded. Apple returned WAITING_FOR_REVIEW for1.0.471(523), valid build58d2f244-2584-45ea-bf77-7e95f3db58db and AFTER_APPROVAL. Submitted, not yet approved/live. Android signed artifact is ready; Play UI upload remains pending.

## Android production submission — 2026-10-16
Uploaded verified drawer-village-1.0.471-523.aab through the connected in-app Play Console browser. Play recognized523/1.0.471, API24+, target36. Retained legacy467/API23; replaced522. Preview confirmed zero supported-device loss across all form factors. Only existing optional mapping-file warnings for467/523; no blocking errors. KO/en-US/ja notes applied. Rollout100%, all existing target countries (178); managed publishing disabled.

Saved the production release and confirmed Send changes for review. Publishing overview shows523 under changes in review, full rollout. Google automatic quick checks are still running and will forward the submission when successful. Submitted, not yet verified approved/live. Screenshot C:/Users/Public/drawer-releases/play523-review.jpg. No unrelated changes were in the submission.
