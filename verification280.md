# Development 280 verification

- Android: versionCode 280, versionName 1.0.247; cache tag 20260908dev280.
- Work branch: codex/features261, delivered to origin/dev. Production origin/main remains 274.
- `check280.cjs`: atomic town-edit validation, final-operation failure rollback, revision conflicts, one group-document write for a combined building/decor edit; aggregate 80-item dictionary; authorized role/subgroup mail; independent character creation with image preservation; full capacity, retry, removal and concurrent last-slot protection; town slot checks.
- `check280.mjs`: 30 scale changes coalesced into one request; no request before commit; offline failure retains draft; account isolation; aggregate local dictionary limit; zero free character slots denied.
- Existing `check-shared-town-service.cjs`, `check-client-cost271.mjs`, `check-account-mailbox279.cjs`, `check279.mjs`: passed. Full dictionary fixture is cleared before independent gift tests; the total capacity rule is tested separately.
- `qa-shared-town.mjs`: passed with no browser errors. Tests now expect local town drafts and independent character creation. Covers named-group/role/subgroup mail, explicit page count and non-wrapping navigation, personal-state isolation, mood dialog, save-on-finish, home grid/room edits, schedule/gift/notification flows and phone/tablet layouts.
- `npm run app:sync`, `assembleRelease bundleRelease`: passed. APK/AAB each contain 241 runtime/assets matching www byte-for-byte.
- APK apksigner verification: v1/v2 passed. AAB jarsigner verification passed. aapt reports 280 / 1.0.247.
- `qa-packaged-boot.mjs`: packaged offline boot, no missing JS/CSS, save and saved-character reload passed.
- Firebase sharedTownApi deployment succeeded. New edit/recipient/character/slot endpoints are deployed; no additional realtime listeners were added.
- Translation coverage snapshot: EN 2197/2885 (76.2%), JA 2196/2885 (76.1%). Newly added UI includes Korean/English/Japanese; this static percentage does not include every dynamic message.

## Boundaries

- Town edits are drafts until Finish editing (or the explicit editor save action). A combined request may still write the group document and each changed home document; one request does not promise one billed write in every case. The draft is held in the current app session, not a promise of recovery after force-closing the app.
- Existing shared residents are preserved. New independent multiplayer characters consume slots; legacy copies are not retroactively charged a second character slot. Town counts include owned group towns and additional towns charged to their creator.
- Mail directory data is loaded on demand and cached briefly; actual recipients and authorization are resolved again on the server when sending.
- No Google Play upload, iOS submission, actual two-device purchase/slot test, physical-device heat/audio test or measured billing reduction was performed. The reported 45 KRW charge was not inspected.
- Package hashes and sizes are provided in the adjacent package-verification.json.
