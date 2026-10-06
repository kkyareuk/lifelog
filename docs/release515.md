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

Pending signed builds and store submission verification.
