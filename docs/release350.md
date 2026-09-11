# Release 350 / 1.0.317 — dev

Comparison for public notes: 42bba85 (Android340, 1.0.307) through this release. Inspected git history and web341/room342/release343–349 records. Public notes exclude explicit intimate-contact names, admin tooling, deferred DLC and implementation details. No announcement sent.

- Mail selection is opt-in, with cancel/page select/confirmed deletion. Folder/account changes reset mode; notices remain protected.
- Statistics map only exact mean50 to the balanced label; either side is directional, including slight deviations.
- Speech chooser retains native data-field persistence, shows scrollable examples, canonicalizes two redundant legacy choices on display without deleting saved data. 30 choices; KO/EN/JA examples.
- Record navigation history before replacing screen DOM, skip zero window-scroll restoration, defer town centering. Split future-scene deadline scanning into approximately6ms chunks; avoid redundant full-roster refresh before render.

## Validation and limits
- 80-character synthetic Chrome,384x854,CPU4x,349 baseline vs350: observation543→397ms, character296→155ms, town285→371ms, home312→309ms, warm observation115→74ms. Timings are synchronous navigation, not end-to-end paint. An earlier run improved more; town regression/variation and cold hundreds-of-ms stalls remain. This does not establish real-device lag resolution.
- CPU sampling identified history/layout work, not a proven84-second sequential-network diagnosis.
- Mail opt-in/cancel/delete and notice protection; speech alias/examples/save/close in KO/EN/JA; mean49.9/50/50.1; question save/replay and moral target bounds tested.
- Question test CPU4x: handler7.8ms, local persistence42ms. This is not multiplayer network timing.
- Build APK/AAB; verify signature,350 manifest and bundled source. Play upload and game website deployment are not performed.
- New user copy English100%, Japanese100%; whole-app legacy translation coverage not quantified.

- Personal touch swipe,9 characters,CPU4x:36/16/11/12/14ms, all five changed the selected character. Legacy qa-mail-swipe294 failed before its swipe section because its mail fixture no longer appears in the current default notices folder; current mail and swipe scenarios are separately verified.
- First bundle signing attempt failed with generic FinalizeBundle error; retry succeeded.326 packaged assets matched byte-for-byte and APK signature/350 manifest verified.
