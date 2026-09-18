# Public451 / internal452 — 2026-09-18

- User confirmed the orphan daily letter fix in internal450 and authorized public Android/iOS, with plaza/Mafia disabled publicly and enabled only internally.
- Public451 (1.0.399) source 1284138 adds iOS Apple sign-in and explicit existing-account linking, with Korean/English/Japanese copy. Linking uses the existing Firebase UID; no entitlement transfer or second registration grant.
- Android451 signed AAB: SHA256 9E10DBA190597D359FD85571EC862B85B204B5109932356A494E8081EE53FEF6. All 473 staged assets match. Play production release32 uploaded; 451, ads declaration and data-safety changes submitted. Publishing overview says under review with automated checks pending; not yet publicly available. Old446 is not the submitted candidate.
- iOS451 App Store eligible workflow 35327953857 succeeded. Apple accepted upload; signing report confirms Apple sign-in entitlement in app and profile. Device login/link verification, Apple processing and review submission remain outstanding. App Store Connect browser needs administrator login (requested).
- Internal452 (1.0.400) preserves the public candidate fixes but enables plaza/Mafia. Separate explicit TestFlight request; no automatic public submission.
- Android452 signed AAB SHA256 4C959312665BB5A267B828189A691A3E994ABDBFCE0E95B8DB0AE0C5248FD673; 473 assets match. Play internal release334 available September18 18:19 KST. iOS452 workflow35328681301 ongoing at time of entry.
- EN2260/2993 (75.5%), JA2259/2993 (75.5%). Apple sign-in additions have Korean, English and Japanese copy.

## Town-slot gift must remain account-once

- Existing apology grants and new-account initialization share `apology-town-slot-20260917-v1`. Do not introduce another campaign when announcing the same gift.
- Slot increment and receipt creation are in one Firestore transaction. Retries or overlapping requests return `existing` after the first grant.
- Base free towns remain 2 plus this one grant = 3. Paid packs are retained, not capped at 3. Do not change the base to 3 while retaining the grant.
- Receipt lives under the UID, not a device, sign-in provider, app version or read/unread letter. Apple account linking preserves that UID and receipt.
- Re-ran `check-registration-slots446.cjs`: new total 3, retry/overlap once, paid rights preserved, deleted accounts excluded. Mock transaction regression is not a live concurrency/load test.
- Re-ran `check-apple-login451.mjs`: link preserves UID, does not sign in a replacement account, rejects missing nonce and mid-flight account changes.
- No gift distribution was rerun for this verification.

## Release gates

- Play data-safety and ads declarations submitted with451. Public privacy HTML alone updated on main c8f4ecc; Pages workflow35328867573 succeeded; live URL shows September18 date and Google/Apple sign-in. Apple privacy/review still need completion.
- iOS411 settings-scroll report remains unverified. Do not announce it as fixed.
- Main received only the privacy HTML change; game runtime stays on dev because main still drives an older independent public web deployment.
