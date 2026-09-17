# Click performance and restaurant follow-up — pending final audio

Work remains on dev. Planned public 437 /1.0.385 (plaza off), internal438 /1.0.386 (plaza on). Earlier436 delivered; public435 held before final submission. Preliminary437 AAB built before the restaurant follow-up is not the final deliverable and has not been uploaded.

## Root cause and fix
Every generic click called getState (JSON stringify/parse of the entire world) twice for sound routing and volume. A tiny getInteractionSettings projection now reads only activeTab, uiLanguage, soundMuted and soundEffectsVolume. The selection popup uses this projection for language too. Backup getState semantics remain intact.

CPU4x Chromium, 3,448,216-character synthetic state fixture (UTF-8 size 6,906,202 bytes), 8 clicks: before16 clones/998.6ms cumulative cloning, median124.2ms; after0 clones, median2.1ms. Measures common click dispatch, not total app rendering or physical phone performance. qa-click-performance437 also checks localized selection popups with zero world clones.

## Additional user-approved changes
Home character selection and horizontal swiping use book-page sound. qa-feedback433 Chromium/WebKit validates actual swipe selection and sound, existing routes/mute, home tools and conversation alignment. The test mutes background music to distinguish it from effects.
Restaurant favorite/spicy/taste-matched orders use meal tasks and localized records. Companion choice now reads 함께 갈 사람 고르기 / Choose who to go with / 一緒に行く相手を選ぶ. check-restaurant437 checks shared destination, meal directive, localized records, companion travel and wrong-location rejection without altering personal state.

User chose to supply a different character/action selection sound. Await that file; do not modify the current sound based on an assumed preference. Final437/438 builds, Play delivery, public submission and announcement remain pending. New/changed EN/JA strings100%, overall unmeasured.

sharedTownApi successfully deployed on September17 after the restaurant tests. No other functions changed.
Web186 modules and iOS438 assets/config prepared; iOS project checks pass. Final audio and store submission still pending.
