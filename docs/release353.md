# 353 / 1.0.320 — dev

- Keep context menu open on viewport resize; resume normal house clock on cancel instead of immediately rebuilding the screen. Successful actions still request a render.
- Defer particle correction until after a paint opportunity; process text in 4 ms slices, cancel stale traversals. Reuse compiled matcher when save timestamp changes but entity names do not.
- Restore historical scholar / haoche option with preserved legacy value and localized examples.
- Announcement reader respects senderDisplayName and displays all players / group members as appropriate. No resend.
- Bounded local timing diagnostics (24 slow samples, no content) included in feedback: input wait, handler, paint, render, save, signature, build.

## Evidence and limitations
274 ad741e1 simulation diff only changes module version URLs, not signature/build. Current prepareActiveHomeLife already executes in withSimulationBatch. Do not claim 274 caused the current stalls.
QA Chrome 384x854 CPU4x synthetic 9 characters with 236KB photos: before work home sync163/145ms, character398/146ms; after slices home130/95ms, character334/94ms. Single runs with timing variance, NOT Android verification. Full 2–6 second user freeze remains unconfirmed/unresolved. Authentication stub and synthetic data cannot represent real account snapshots.
Regression: real book chooser31, haoche preserved, public/private room access, context resize/actor selection/dismissal pass.
