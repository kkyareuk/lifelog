# 1.0.480 (532) — missing character image slot hotfix

Based on released public531 commit 133e7a786b1553c4497a41d7331eeacdf49be26b. Only the scene-image compatibility fix and release metadata are included; unpublished dev features are excluded.

Existing multiplayer character profiles can lack emotion-image keys. Rendering after a mood change dereferenced an absent slot, throwing from sceneImageFor and replacing home, observation and town views with the view-error screen. Optional slot lookup now falls back to the registered default character picture without modifying saves.

Validation: regression checks cover absent/null/partial slots, both image fields, multiple activities, and input preservation. Existing contact checks pass. A private read-only snapshot reproduced the error in all three views before the fix; Chrome and WebKit replay passed after it. This is browser replay, not an Android/iPhone physical-device test. No production saves were changed.

Runtime fix: 89e9ad21; dev equivalent: c21747f3. Legacy main already uses a safe optional slot lookup, so it needs no new feature code. Release/submission status will be recorded separately after upload.

No new runtime text. KO/EN/JA release notes complete; overall application translation coverage not measured.
## Submission progress — 2026-11-22

- Android signed AAB SHA256: CEFC53ED86F24F57E1E400D1F1FC41E0329D3D3399A04E9EE0115F587058CF50. All 636 prepared Android assets match the bundle byte-for-byte.
- Play accepted 532 / 1.0.480. Production review requested with 100% rollout after approval; fast prechecks still running. Existing API23 fallback467 retained, supported-device count unchanged. Not yet live.
- iOS upload44943707676: archive/signing/Apple validation succeeded; Apple accepted upload. Subsequent status fetch failed, so no duplicate upload. Follow-up prepare44944351267 queries processing and attaches the validated build.
- iOS follow-up44944351267 and44944648771 stopped at the valid-build guard after bounded waits. Read-only status44944664193 returned PREPARE_FOR_SUBMISSION, versionId ae2bc419-dd00-4d47-ad04-7467ec8c7684, build=null. Review NOT submitted; await Apple's build availability and resume prepare/submit, do not reupload532. Apple delivery email confirms successful delivery with a future SDK warning only.

## iOS review submitted — 2026-11-22

Apple processing completed. Prepare44945253424 attached VALID build532 (8443434d-12dd-4206-9d2d-57b9c86dcc58). Submit44945497459 succeeded: 1.0.480 WAITING_FOR_REVIEW, AFTER_APPROVAL. This is review submission, not availability to users. No duplicate upload or application source change.
