# Public 533 — account startup wait

Source baseline: public532 8ea1786ab029a2ced6645bbd1262cb0910c829c6. Fix: 19b876f4. Version 1.0.481 (533); Play maximum532 confirmed by owner on 2026-11-26.

Reproduced with initial Firebase auth observer response withheld: module import completes, auth remains unsettled, old code exposes no timeout or retry. Added initial-response deadline and observer error handler; late callback still follows existing account restore. No save migration, deletion, forced sign-out or guest fallback. This bounds a verified hang path; the original reporter device/network cause is not proven.

Account isolation and cloud recovery tests pass, including late response, retained records, stale account requests, full storage and cloud-only towns. UI/build/store checks recorded separately. No release claimed until upload/submission/public status verified. Existing Korean/English/Japanese retry copy reused; release notes in all three languages.

Android: release54 review requested, quick checks running; no supported-device losses. iOS upload45784713200 pending. main/dev contain only fix/test changes, no unreleased feature merge.

Final submission evidence (2026-11-26): Apple upload45784713200 accepted delivery (post-upload status fetch failed; no reupload). Prepare45786150169 VALID; submit45786510340 WAITING_FOR_REVIEW, version b141fd27-0e96-40ab-bab6-b738310c2729, build 083b83b4-aaf3-404f-a914-f3d2299df788, AFTER_APPROVAL. Android release54 review requested, prechecks running, retained467 preserves Android23 support. Neither new mobile release is claimed publicly available. Web auth.js timeout fix verified. ITMS-90725 email is advance SDK notice: current iOS26.2, iOS27 required April2027 per mail. Record migration follow-up; existing533 submission accepted.

Public availability verified 2026-11-28: Android owner Play Console production active, latest release533 (1.0.481),178 territories; publication notification dated November26. Apple status run46145079928 reports1.0.481 READY_FOR_SALE, build533 VALID. No reupload or resubmission. Gmail overlap scan12 messages, zero new bug reports and no reporter recovery confirmation. Latest published in-game notice remains528; cumulative KO/EN/JA draft public533-notice-draft.json prepared, but notice-admin shows logged-out Google login and disabled editing. Authentication requires owner interaction; no notice posted, no dispatch ID. Draft translations EN/JA100%; overall app translation coverage not remeasured.
