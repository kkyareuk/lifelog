# Room photo and dictionary feedback — dev follow-up

Android remains 340 (1.0.307); this change has not been deployed or packaged.

- Room editor: separate room-photo removal, floor-art removal, and restore default cream walls/natural floor controls. Only artwork references/settings change; furniture remains.
- Explain room photo use in observation and the difference between floor tiles and full-room art.
- Prefer the explicitly selected floor image over the observation room photo. Hide walls for full-room art only when an image exists.
- Dictionary gift instructions: Mailbox → Write → character recipient → choose dictionary items → save selection → send. Personal and selected shared catalogs are combined. User recipients receive text only.
- Resolve dynamic character-setting summary translation through UI_TEXT before the general dictionary. Correct unset-label fallbacks.
- New copy translated into English and Japanese (100% of this change, not a global translation audit).

## Verification
- `node scripts/qa-room342.mjs`: PASS, actual room-editor removal/reset and English taste-page unset labels; no page errors.
- `npm run build`: PASS.
- `node --check app.js`: PASS.
- `scripts/check-media-home-routine-features.mjs`: 10 failures also reproduced using unchanged HEAD source. This broad legacy check does not pass; no new failures from this patch.
- Mobile screenshot inspected. Real-device image restoration and all legacy translations remain outside this regression check.
