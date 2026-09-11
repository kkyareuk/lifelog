# Android 343 / 1.0.310

Branch dev. Previous delivered app 340 / 1.0.307. Includes room342 and applicable web341 shared-source changes. No store submission or announcement send requested.

## Changes and measured checks
- Question feedback uses existing authenticated Firestore feedback creation rules, category discovery-answer-fit. Sends question id, prompt, displayed choices, UI language and build; does not send character profile/images/name. Sunday 09:00 Asia/Seoul review combined with existing supporter automation 9-14.
- New explicit decline in character letters creates no scheduled action and marks answered; mere closing remains unanswered. First-open options stored in local mail envelope and reused on reopen. Missing gift targets no longer disable all reply choices.
- Discovery rail no longer disappears during ordinary account upload. Startup/account transition remains gated.
- Shared profile saves with no data URLs bypass cloud manifest read, photo preparation and merge. Mock of actual function verifies 0 manifest reads and 1 save endpoint call.
- Character sync independent work bounded to 4 concurrent characters; image uploads to 3 with duplicate payload reuse. Root revision remains after all work settles. Simulated 12 x 30ms jobs complete in approximately 0.15s, max 4 concurrent; this is a synthetic check, not an end-user speed claim.
- Group counts/quota do not block roster display. Temporary group-document errors no longer silently remove known groups. Clock-only group updates no longer trigger full rendering.
- Existing membership roles preserved at rejoin; authoritative ownerUid restores owner record without using stale indexes to grant manager roles.

## Validation
- check-join343.cjs PASS: own slot accounting, repeat joins, manager preservation, missing/downgraded owner restoration.
- check-latency343.mjs PASS: bounded concurrency/error propagation and image-unchanged fast save path.
- qa-feedback343.mjs PASS: mobile question icon during busy sync, KO/EN/JA feedback UI/payload, mail close/reopen retains choices, explicit decline does not create an action.
- qa-room342.mjs PASS: photo resets and English unset labels.
- Android release APK/AAB build PASS, APK v1/v2 signature verification PASS, version343/1.0.310. 321 prepared web assets match AAB byte-for-byte.
- No attached Android device; SM-G991N performance and real-account end-to-end feedback submission remain unmeasured. Feedback browser test mocks submitFeedback; existing backend rules used unchanged.
- 239 requests, 7.6MB transferred and Network Finish84s do not prove serial requests or establish memory leakage. Long-lived Firestore requests may affect Finish; device waterfall/long-task trace is still needed for remaining delays.
- iOS common source updated, no signed IPA/TestFlight submission. Website not redeployed this turn. New copy EN100% JA100%; not a whole-project translation completeness claim.

Backend: sharedTownApi deployed successfully to lifelog-98fff (asia-northeast3). No live member roles manually changed.
