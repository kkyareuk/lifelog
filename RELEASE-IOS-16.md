# iOS 1.0.215 (16) — submitted to App Review

Submitted on 2026-09-08 at 22:21 KST. Apple reports WAITING_FOR_REVIEW, not approval or release.

- Submission: b325a13b-4082-47ee-9149-977b67760a1c.
- App version 1.0.215, build 16 (1d2ba853-4817-4777-8335-86aff1ca120e), plus all three consumable purchases in the same submission.
- Automatic release after approval. Free download, available in Korea, Japan and the United States.
- Game source remains operational Android hotfix 274. Dev multiplayer changes are excluded. Android version codes were not changed.
- Apple login, in-app account deletion, renewed signing profile, native iOS startup and guest entitlement fixes are included.
- Signed build/upload: https://github.com/kkyareuk/lifelog/actions/runs/34228395643
- Native iPhone/iPad launch and captures: https://github.com/kkyareuk/lifelog/actions/runs/34228395568
- Existing iPhone product images preserved; native 13-inch iPad home capture added. All three IAP review screenshots completed processing.
- KO/EN/JA product metadata, privacy disclosures, review contact/instructions, encryption response and user-confirmed content rights completed.
- Public privacy page deployed on Cloudflare (cca5d59d), preserving web hotfix 264 with policy-only commit 6d20a22. The equivalent policy is already on main at 6593281. Public HTTP 200 and Apple sign-in/deletion disclosures verified.
- Backend b2a9662 corrects Sandbox TEST notification routing before production app-ID checks. Verified Apple TEST delivery SUCCESS and HTTP 200 received:true after deployment; malformed/forged notification tests and refund replay tests pass.

## Verification and limits

Production source hashes, Apple auth nonce/wrong-account guards, guest/account isolation, purchase routing and refund idempotency tests pass. Native simulator home and actual StoreKit product prices were visually inspected. This does not verify a charged production purchase or real-device Apple login/account deletion. Production test-notification API still returned HTTP 401 before review; Sandbox notification delivery succeeds. Approval timing and successful real-device purchase remain unverified.

UI translation coverage: English 2131/2820 (75.6%), Japanese 2130/2820 (75.5%). Product metadata: all three products in Korean, English and Japanese.

The CI request intentionally retains submitForReview:false; submission was performed explicitly in App Store Connect. The earlier build-15 candidate report is historical.
