# Development 281 verification

- Android: versionCode 281, versionName 1.0.248, runtime tag 20260908dev281.
- `check280.cjs`, `check280.mjs`: atomic town edit, no write before completion, 30 layout changes coalesced, rollback/conflicts and slot capacity passed.
- `check-shared-town-service.cjs`: membership/ownership, command throttling, concurrent-viewer deduplication, proposals, schedules, gifts, catalog and shared layouts passed.
- `check-client-cost271.mjs`: 9 listeners reused through 10 view/refresh transitions, unchanged heartbeat avoids API call, next-scene boundary guard passed.
- `check-shared-life.mjs`: authoritative engine, counterpart identity, shared meals and personal-state isolation passed. 200-resident fixture completed under one second locally; this is not a production concurrency benchmark.
- `check281-delete.cjs`: owner-only deletion, confirmation required, interrupted cleanup retry, idempotency, membership/invite removal and unrelated group preservation passed. Unfinished cleanup is resumed by the existing daily maintenance job.
- `qa281-sync.mjs`: two isolated browser contexts with different simulated users receive the same authoritative engine result through a test transport. Both render the same departure route, target waiting and arrived conversation. One command request; no further requests for animation, arrival or map selection. Configured right-side character and separated pair layout verified.
- `qa281-tablet.mjs`: character picker aligned with right-side anchor; action button proportions at 1024×600, 1280×800 and 1480×920; house chooser below header; effects preference applied. Character/house screenshots inspected.
- `qa-shared-town.mjs`: full pre-existing browser regression passed after the shared command changes, with no browser errors.
- `npm run app:sync`, Gradle `assembleRelease bundleRelease`: passed, including release lint.
- Signed AAB contains all 246 prepared assets byte-for-byte. AAB SHA-256: `0419888152873F7D028DAA50546F04E7497BD61663691B71BA84F3FA99D35505`.
- APK aapt: com.drawervillage.app, 281 / 1.0.248. APK signature v1/v2 verified; AAB jarsigner verified.
- `qa-packaged-boot.mjs qa-output-281/apk-public`: actual APK assets start offline, no missing files, saved character survives reload.
- Firebase CLI confirmed successful updates for sharedTownApi and expireVillageMail and release of Firestore rules.
- UI string inventory: English 2198/2890 (76.1%), Japanese 2197/2890 (76.0%). New controls include Korean/English/Japanese copy. This inventory is not a percentage of generated life-log translation completeness.
- Limitations: actual Google Play upload is done by the user. Physical two-device multiplayer, heat/battery measurements and new-version live purchases were not performed. Test transport is not a Firebase end-to-end two-account test. Apple build 16 and the public website were not rebuilt or redeployed with these client changes.
