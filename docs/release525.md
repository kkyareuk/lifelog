# Public recovery hotfix 1.0.473 (525)

Baseline af0806a1 (public mobile524). Runtime change: invalidate sync revisions recorded by the old recovery logic, forcing a full merge before download skipping or delta upload. Newer local progress and deliberate deletion records are preserved. Verified revision fast path remains available.

Regression reproduces failure against524 and passes after the fix. Account isolation, full-storage recovery, legacy upload merge and cloud merge checks pass. A private server fixture preserves the missing village, residents/homes and simulated newer character/relationship changes. No production user data was modified. Actual device version/state and successful device recovery remain unverified.

No new UI text. KO/en-US/ja release notes complete; existing mobile dictionary EN2250/2983 and JA2249/2983 (75.4% each).

## Deployment evidence

- Runtime commit3cfafa76; public main18ea9281 plus cache ed4f4619. Cloudflare756ebf80 deployed; drawervillage.com auth.js and service-worker cache confirm525.
- Android signed525 bundle verified; all629 prepared assets byte hashes match. SHA25657DAE0A4DB746BA09EF31D27F02FF12CE0DFBB07B32D8A9D4BACB594C87B6D01. Google Play525 production review submitted with100% rollout, existing178 territories and legacy467 retained; zero supported-device loss. Quick checks running at submission; not confirmed publicly available.
- iOS upload Actions39137229989 uses pinned source a8d5ff6c0902fd87b0a3c5b814ff1f77c689c74e. Submission result will be recorded after Apple validation.

- Apple525 signing/upload39137229989 succeeded. Workflow context1953e8c4 checked out and verified pinned source a8d5ff6c. Preparation39137999624 verified VALID build4e5f94cd-628c-4c02-80ff-e2202a9dda1a, replaced only the prior524 review submission, and reused version recordadb48276-e243-4e00-b9be-516bd6ca563b as1.0.473 with AFTER_APPROVAL. Initial preparation39137934376 stopped before mutation because item linkage was not included; corrected request succeeded.

- Submission39138044675 succeeded: iOS1.0.473 build525 WAITING_FOR_REVIEW, AFTER_APPROVAL. Both mobile stores submitted; device recovery remains unverified.
