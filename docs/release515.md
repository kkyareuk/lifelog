# Release 515 — discovery request race

2026-10-06 · 1.0.463 / Android515 / iOS515. User explicitly authorized both production and iOS review in this turn.

- Latest mail reported a cooldown without a question after tapping self-discovery and immediately switching characters. The request consumed access before checking the now-changed observed character, then returned without a dialog.
- The request now reserves a modal immediately, retains the original character through rendering/switches, checks account and ownership before revealing the question, and prevents Escape from discarding an in-flight request. Network failure displays an actionable close/retry message. Server cooldown and request idempotency remain unchanged.
- Baseline5661fa34 fails the delayed-request character-switch regression (no question). Final Chrome/WebKit pass delayed response, character switch, one consumption, Escape, network failure and retry.
- Guest iOS mail report remains UNRESOLVED: fresh letters, saved letter reopening and everyday/weekend/work/gift questions in KO/EN/JA pass WebKit/Chrome; cannot reproduce reporter-specific failure without their affected envelope or reproduction details. No speculative mail fix or public claim of fixing mail.
- Native platform isolation, iOS preparation and submission script syntax pass. No physical device QA claimed.
- New loading/error copy and release notes KO/EN/JA complete. Static translation EN2250/2983(75.4%), JA2249/2983(75.4%).
- Runtime goes to dev; main receives documentation only due to the existing Pages restriction. Taskboard records release and unresolved mail separately.

## Deployment

- Runtime source commit9ea5856a on dev.
- Android signed release build succeeded; jarsigner verified; all634 bundled web assets byte-match www.
- Artifact: C:/Users/Public/drawer-releases/drawervillage-1.0.463-515.aab.
- SHA25644eafee7a7032b16776c0aead807477beb622161dfda72d874fdd1598e5d1d0c.
- Prior iOS514 confirmed READY_FOR_SALE by Actions37450256214.
- iOS515 Mac archive/sign/upload Actions37450401702 in progress.
- Store publication/submission results to be appended after verification.

## Android verified submission

- Internal release388:515(1.0.463), available to internal testers 2026-10-06 19:35 KST.
- Same verified AAB promoted to production100%, all existing countries. Legacy467 retained for API23; replaced514 excluded. No supported-device loss. Existing mapping-file advisories only.
- Publishing overview confirms changes in review, fast checks running; approval releases automatically. Only the515 production change was submitted. This is not a claim of public availability.
- Proof: C:/Users/Public/drawer-releases/play515-internal.png and play515-review.png.
