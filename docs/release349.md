# Release 349 / 1.0.316

Base: delivered release 348 / 1.0.315. New development changes only; main remains live.

- Share one display-scene cache between home simulation preparation and rendering. Build a per-render reverse participant index instead of searching the full roster for each displayed character. Preserve reciprocal participation, place/time checks and cache cleanup.
- Run nonessential post-render tasks in separate tasks after the first animation frame; cancel both frame and timeout when the screen changes. Defer audio synchronization and meeting refresh scheduling until after paint.
- Skip unnecessary zero-position scroll restoration on newly mounted main content, and consolidate duplicate image loading-policy scans.
- Add six dilemmas with 30 fully translated choices: shared credit, labelled cake, excess change, borrowed property, secrets and queues. Include selfishness, deception, opportunism, quiet malice and impulsive aggression alongside honest and boundary-setting responses. Morality and violence are independently scored; unrelated traits remain unchanged.
- Make target-score-only questions eligible and ignore null/unaffected scores when checking unlocked fields. Preserve existing questions, answered/fixed-field rules and 80/20 score blending.

## Verification
- qa-performance349 compared e9391b4 with this change: 80 characters, 384x854, CPU4x, five home renders. Scene calculations 805 -> 405. Final run median synchronous render 254 -> 226ms (individual first render 458 -> 447ms). Earlier repetitions varied. This is not a claim of zero frame stalls or real-phone completion.
- qa-profile349 recorded CPU samples to identify layout/scroll restoration and redundant scene scans.
- qa-memory336 with 80 characters: repeated character/settings transitions and credits round trips kept 402 DOM nodes and 84 event listeners. Heap warm 8.59MB, final 9.10MB; no linear node/listener accumulation in this scenario.
- qa-questions349: KO/EN/JA layouts, five choices, adverse moral score persisted; CPU4x local handler 4.6ms and save completion 36ms. Not multiplayer network latency.
- check-discovery349, check-discovery333: bounds, eligibility, translations, fixed/locked traits, independent aggression and morality.
- qa-interaction345, qa-layout347, qa-mail348: reciprocal character display, distinct interaction logs/animation, house entry, mobile/tablet layout, notice protections and mail deletion preserved.
- check-answer-journal345 and check-performance344: durable replay, manual overwrite precedence, deleted character protection, bounded network parallelism and render coalescing.
- Legacy qa-context339 selector targets the pre345 flat menu and timed out; current-menu coverage uses qa-interaction345 instead.

## Delivery
Android APK/AAB, no Play Console upload. No claim that every source of lag is fixed. Multiplayer saving still waits for authoritative confirmation; no success is shown before a failed write.
