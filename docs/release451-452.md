# Public451 / internal452 — 2026-09-18

- User confirmed the orphan daily letter fix in internal450 and authorized public Android/iOS, with plaza/Mafia disabled publicly and enabled only internally.
- Public451 (1.0.399) source 1284138 adds iOS Apple sign-in and explicit existing-account linking, with Korean/English/Japanese copy. Linking uses the existing Firebase UID; no entitlement transfer or second registration grant.
- Android451 signed AAB: SHA256 9E10DBA190597D359FD85571EC862B85B204B5109932356A494E8081EE53FEF6. All 473 staged assets match. Play upload pending.
- iOS451 App Store eligible workflow 35327953857 started. Upload, Apple-device login/link verification and review submission are not yet confirmed.
- Internal452 (1.0.400) preserves the public candidate fixes but enables plaza/Mafia. Separate explicit TestFlight request; no automatic public submission.

## Town-slot gift must remain account-once

- Existing apology grants and new-account initialization share `apology-town-slot-20260917-v1`. Do not introduce another campaign when announcing the same gift.
- Slot increment and receipt creation are in one Firestore transaction. Retries or overlapping requests return `existing` after the first grant.
- Base free towns remain 2 plus this one grant = 3. Paid packs are retained, not capped at 3. Do not change the base to 3 while retaining the grant.
- Receipt lives under the UID, not a device, sign-in provider, app version or read/unread letter. Apple account linking preserves that UID and receipt.
- Re-ran `check-registration-slots446.cjs`: new total 3, retry/overlap once, paid rights preserved, deleted accounts excluded. Mock transaction regression is not a live concurrency/load test.
- Re-ran `check-apple-login451.mjs`: link preserves UID, does not sign in a replacement account, rejects missing nonce and mid-flight account changes.
- No gift distribution was rerun for this verification.

## Release gates

- Play data-safety updates prepared for advertising data; public privacy document and Apple privacy/review still need completion.
- iOS411 settings-scroll report remains unverified. Do not announce it as fixed.
- Game main is unchanged because it still drives an older independent public web deployment.
