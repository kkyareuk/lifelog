# Android 1.0.215.9 / code 259

Production hotfix branch: main. Source baseline: ebf42dc (code 255); reporter installed code 252. No Play Console upload was performed. New feature work remains separate.

## Changes and evidence
- Port the already tested population batching/cache and deferred interaction-save fix from dev 257 to production. No new multiplayer backend in this build.
- Recompress snapshots at a higher lossless level only after a quota error, including previously compressed backups. Do not remove any account or recovery data.
- Dictionary save retries after local media persistence, retains its draft after failure, and provides a usable back-navigation path. Does not claim all unknown device-storage failures are solved.
- Exclude expired routine events from current-scene selection; homebound/returned scenes no longer remain a shared scheduled interaction. Existing historical logs are preserved.

## Validation
- Browser QA: saved dictionary edits survive reload; forced QuotaExceededError leaves editor usable; back-to-list, reopen draft, retry after restoring storage and reload all pass.
- 01:00–03:00 fixture: schedule active at 02:00, inactive at 03:00, 05:00, 12:00, 19:00.
- Existing room-owner/upstairs-bedroom, furniture persistence, mailbox and shared schedule regression checks pass.
- 200-character browser: initial home render 653 ms, repeated 104/108 ms. Save/reload and navigation pass. Node 200-character simulation 782/217/215 ms. Desktop synthetic measurements only, not device thermal validation.
- Lossless storage/account isolation and population reference behavior/cache invalidation checks pass.
- Web build and Android module closure pass. Android debug APK, signed release APK and signed AAB built. APK package/version and signature verified; all 215 prepared web assets match AAB byte for byte.
- AAB SHA-256 A5C80A5A987F724D956F8C5C4610E1D0266B29029A500C79C9120F3345E2EC69.
- English static UI coverage 2104/2791 (75.4%); Japanese 2103/2791 (75.3%). All five new storage/navigation labels translated.
- Common code affects web/iOS. No site deployment, IPA, TestFlight or hardware test. Existing iOS project check fails at Android/iOS release-version alignment; the separate iOS release was not advanced for this Android hotfix.

Release notes: release-notes-259.txt. Play-installed apps may require a Play-delivered update due to signing-key differences; do not uninstall or clear saved data to force APK installation.
