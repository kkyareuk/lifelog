# Public hotfix 411 / 1.0.359

Base: public405 (7e85e81), confirmed in Play Console on 2026-09-16. Apple405 is waiting for review, not a completed public release.

Scope: home activity entry, bounded resident popovers, shared restriction draft synchronization, owned shared notification roster, authorized orphan group deletion, vacant-bed fallback with explicit-room priority, shared label overlay and duplicate actors, unsafe chair placement.

Validation: Chromium and WebKit popup tests in KO/EN/JA, including 360x648, 384x832 and shortened viewports; shared restriction save/reopen; roster ownership; empty-bed and explicit-room priority; 70 home-life checks; seating375 and seats391 integration tests.

Legacy check-character-notifications has four pre-existing assumptions/failures (schema31, speech transformations, status bar and old build number); this is not a clean pass. Shared characters receive authored check-in messages, not fabricated personal-world life logs. Only loaded multiplayer residents can be added from the current roster.

Deployment results are recorded below. Public plaza remains disabled. The same fixes were applied to dev without replacing ongoing feature work. New/changed copy supplied in KO/EN/JA; full-project translation coverage has not been measured.

## Deployment record — 2026-09-16 08:23 KST

- Google Play public: 411 / 1.0.359, production release26 submitted for review, 100% rollout after approval. Review in progress; not yet confirmed publicly available.
- Apple public: 411 / 1.0.359, upload35033904868 succeeded. Replaced pending405 and submitted d56ab31b-441c-490b-abea-82ca486a951c. Automatic release to all users after approval. Submission success confirmed; not yet publicly available.
- Android internal: 412 / 1.0.360, release304, provided to internal testers at08:16 KST.
- Apple internal: 412 / 1.0.360, upload35033880969 succeeded; export info completed, Ready to Test, existing internal group attached (1 tester). KO/EN/JA test notes saved.
- Web: Cloudflare deployment7bef4496 initially supplied web412; after main source alignment, live drawervillage.com was rechecked and serves app.js?v=20260916web411. Public plaza remains disabled.
- sharedTownApi deployed with the authorized orphan-group deletion endpoint, preserving current dev server features. Unauthenticated request rejected401.
- Feature source c6a4124, public/main history alignment c841a6c, dev5f923d4. Only the audited public405 hotfix tree is on main; ongoing development remains on dev.
- Added endpoint regression test: remaining owner allowed, strangers denied, host can clean empty orphan, idempotency, resident records preserved.
- Android signatures and packaged versions verified. No physical device or real-user account mutation tests performed.
- Changed UI/release copy: English100%, Japanese100%. Full-project translation coverage not measured.

AAB SHA256:
- public411: D69D2EA36B94C2BAEBBCD60DF7E7CCA7D7E75933F5965856813107CC81304B55
- internal412: C9D7A33C740EBE7FBA045FF4724EC4FDB2E53610A0DFF033D8726568B5F8A490
