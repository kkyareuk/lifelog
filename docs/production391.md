# Production 391 promotion — 2026-09-14

- Baseline: production 387 / 1.0.335. Target: existing internal 391 / 1.0.339; no rebuild or version bump.
- 18:40 KST: Google Play publishing overview shows 검토 중인 변경사항, production 391 (1.0.339), 전체 출시 시작. Quick checks still running; automatically forwarded after successful checks. Not yet verified available to production users.
- Rollout: 100%, all existing target countries. Managed publishing disabled.
- No supported-device losses across all listed form factors. One warning: missing deobfuscation file; build does not enable minification.
- Artifact SHA256: 5673EC3067F6769A97C7D6C439AB6AE71BBDFD12F235D05F00E681B1BE01DBD0.
- Cumulative changes 388–391: production391-announcement.md and production391-release-notes.txt. KO/EN/JA release notes entered; each within 500 characters.
- Previously completed verification: Chromium/WebKit interaction regressions, independent shared-seat status, question save and relationship mail regressions, AAB signature and 370 packaged asset matches.
- Game changes remain on dev while production approval is pending, in accordance with the live-version main policy. Taskboard record goes to main.

## Dialogue audit

Git commit 789c9c7, authored 2026-09-12 02:02:46 +09:00, version 354 / 1.0.321 introduced strong profanity into the rough voice's question/contact strings and aliased the earlier softened style to that voice. Production 387 retains those strings. This establishes code introduction, not the time of first user exposure; affected audience count is unknown.
391 (bde4cdb) softens authored dialogue and cached character letters at display. Previously delivered OS notifications cannot be undone. No user-authored correspondence is rewritten.
