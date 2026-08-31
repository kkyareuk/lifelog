# Dev 183 · 1.0.170 — 2026-08-31

Development branch: `dev`. Production `main` and Google Play release are unchanged.

## Changes

- Reuse a single compiled entity-name matcher for life-script particles instead of compiling one regex per entity per sentence. Synthetic 12-character / 300-extra-item first calculation: 228.5ms before, 44.7ms after (same machine; not a device-wide frame-rate claim).
- Do not calculate live-scene refresh timers while browsing editors/settings. The catalog initially creates only six-column icon tiles; one item editor is created on demand. Typing commits once on dialog close, including Android's missing-blur case.
- Normalize the initial village once with a stable ID, including after a fresh start/reset. Prevent active-world IDs from overriding selected village IDs. Keep town/building tombstones through manual sync and automatic restore; never merge buildings across different selected villages.
- Village information can browse other villages and delete the current village. Characters and homes move to a remaining village. The last village cannot be deleted. Existing ambiguous duplicates are not automatically destroyed.
- Building detail editors expose deletion for facilities and homes. Home deletion uses the existing explicit warning about rooms, pictures, pets and cars; characters remain.
- Welcome screen uses the supplied forest artwork, fits the viewport, and hides nonessential feature decorations on short screens. No page scrolling at tested phone/tablet sizes.
- Add generic speech styles ‘과묵한 직설체’ and ‘냉정한 격식체’. Their eight notification topics have authored whole-message Korean/English/Japanese voices. No character names or pirate labels appear in the options. Direct questions no longer randomly bypass the selected voice. Existing plain/formal transformations also cover additional sentence endings. Old queued messages refresh after upgrade and character saves.
- Label the house picture ‘집 사진’ / ‘집 사진 등록’, with guidance that a home illustration or family picture is welcome. Facility interior picture labels remain unchanged.
- Fix active schedules incorrectly selecting a later return-home entry carrying the same routine ID.

## Verification

- New management regression: repeated cloud merges do not restore deleted villages/buildings; stable world-only migration; no cross-town building mixture; voice version survives normalization; concurrent deletions do not revive tombstoned IDs; 48 localized topic/style/language combinations.
- Existing suite: 27/30 pass. Pre-existing failures retained: `backup-home-scene` (old storage-product condition), `character-wallet` (old book geometry), `town-grid` (removed illustration-picker expectation). New management test passes separately.
- Browser: six columns at 384px, no initial catalog detail editors, item rename persists after close/reopen, village browsing/deletion, facility detail deletion, welcome 320×640 / 384×854 / 1024×768 in Korean/English/Japanese. Synthetic memory-only fixtures; no player's account data touched.
- Web and Android asset closure/build checks. Physical Android performance and actual OS push delivery have not been measured in this workspace.
- Static UI coverage: English 1862/2553 (72.9%), Japanese 1861/2553 (72.9%). Newly added house/management/style copy localized. This is not whole-script coverage.

## Reproduce

`npm run test:management183`, `node scripts/benchmark-scenes.mjs`, `npm run app:sync`, `npm run build`.
Browser fixtures: `scripts/qa-management-183.html`, `scripts/qa-welcome-182.html` (current runtime imports).
