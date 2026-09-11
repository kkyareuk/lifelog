# Android 344 / 1.0.311 performance pass

Baseline: dev 7e4bb55; previous delivered private Android build 343.

- v2 cloud account restoration: 4 bounded independent character-day queries, stable output order, error abort; decoding yields after an 8ms slice. This path is also used during account-save merging.
- Profile updates to membership documents: 4 bounded independent operations with account-session checks retained.
- Group snapshot UI updates: coalesce notifications into one animation frame; cancel scheduled work on pagehide.
- Shared home layout saves: keep in-flight revision ordering and only the latest pending full snapshot. Key includes account, group and home. Failure remains rejected; no false save success.

## Verification

- 80 characters / simulated 12ms history request: serial 1220ms, bounded 302ms; max concurrent 4, same data/order, offline failure propagated. This is a synthetic request-latency test, not a measurement of the reported 84 seconds.
- Actual Chrome app page, viewport 384x854, CPU throttle 4x, 80 characters, 12 group events: baseline 12 renders/622ms until settled; changed 1 render/104ms (onboarding dismissed). Event dispatch block 543ms to 1ms. No page errors.
- 21 rapid full-layout saves while first pending: 2 writes, final value retained; retry after failure passes.
- 80-character screen navigation after warm-up, three blocks of ten cycles plus ten credits cycles: listeners 84 and DOM nodes 400 throughout. Heap after GC 8.59MB warm, 8.91MB after navigation, 9.07MB after credits. One email click opens once. This does not prove every screen leak-free.
- Existing question icon/KO-EN-JA feedback/mail reopen/decline browser regression passed.

## Remaining limits

No attached Android device; no original HAR. Not a claim that all stutter or the 84-second report is resolved. Multiplayer creation still waits for account synchronization to preserve slot accounting. Shared question answers still await server confirmation. Complete multiplayer/personal feature parity, damaged-role recovery, house-code overwrite and uncommitted interaction work remain outside this release.

All newly added text: EN and JA complete. No website deployment or store submission by this performance pass. Android artifacts are separately validated after building.

WebP conversion remains available with DRAWER_WEBP=1 but is deferred by default for this release; converted duplicates are excluded from native packaging. Original image paths retained to keep this performance comparison isolated.

Final Android build: APK versionCode344/versionName1.0.311 and signature verified; AAB packaged files compared to www. APK 71,314,783 bytes. APK/AAB delivered as individual files. Store submission and website deployment not performed.
