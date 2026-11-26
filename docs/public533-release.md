# Public 533 — account startup wait

Source baseline: public532 8ea1786ab029a2ced6645bbd1262cb0910c829c6. Fix: 19b876f4. Version 1.0.481 (533); Play maximum532 confirmed by owner on 2026-11-26.

Reproduced with initial Firebase auth observer response withheld: module import completes, auth remains unsettled, old code exposes no timeout or retry. Added initial-response deadline and observer error handler; late callback still follows existing account restore. No save migration, deletion, forced sign-out or guest fallback. This bounds a verified hang path; the original reporter device/network cause is not proven.

Account isolation and cloud recovery tests pass, including late response, retained records, stale account requests, full storage and cloud-only towns. UI/build/store checks recorded separately. No release claimed until upload/submission/public status verified. Existing Korean/English/Japanese retry copy reused; release notes in all three languages.
