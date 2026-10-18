# Public recovery hotfix 1.0.473 (525)

Baseline af0806a1 (public mobile524). Runtime change: invalidate sync revisions recorded by the old recovery logic, forcing a full merge before download skipping or delta upload. Newer local progress and deliberate deletion records are preserved. Verified revision fast path remains available.

Regression reproduces failure against524 and passes after the fix. Account isolation, full-storage recovery, legacy upload merge and cloud merge checks pass. A private server fixture preserves the missing village, residents/homes and simulated newer character/relationship changes. No production user data was modified. Actual device version/state and successful device recovery remain unverified.

No new UI text. KO/en-US/ja release notes complete; existing mobile dictionary EN2250/2983 and JA2249/2983 (75.4% each).
