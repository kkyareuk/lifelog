# Internal 450 / 1.0.398 — 2026-09-18

The user's new clue identifies the synthetic daily-question row, not a contact envelope. A question with a missing/empty characterId was still listed as “도착한 편지”; senderImage fell back to the signed-in user's profile. The same-day schedule returned the invalid question and openDailyCharacterQuestion silently returned without a character.

- Regenerate an orphan unmaterialized daily question using an existing character. Do not list invalid temporary questions in either mailbox view. Existing immutable contact envelopes remain readable, including deleted senders.
- Opening a listed daily question no longer calls the scheduler and replaces it at midnight.
- Regression first failed before the fix (no letter dialog). Chrome and WebKit now pass orphan regeneration, valid opening, midnight preservation, ordinary/contact/question/deleted-sender/legacy letters, multiplayer floor/chair/surface checks.
- Android release signed; 471 staged web assets match byte-for-byte. SHA256 FBB78EFD0F8EFA064AD16551106A63D1282124AA4ED471BDA5AC7A29FD1F110E.
- No new UI strings. EN2260/2992 75.5%, JA2259/2992 75.5%.
- iOS ticket73098ee2 on public411: reporter did not identify which character settings screen. Investigation pending, NOT fixed or device-verified by this change.
- Play internal release333 is available to internal testers, verified September18 17:54 KST. Source56a67af pushed to dev. Public release and notice not sent. Game main unchanged to avoid its older web deployment. 449 was previously reserved for public; this further internal build uses450 and a future public candidate must have a newer version code.

- iOS450 project/assets prepared and checked only; no signed IPA/TestFlight release. Android staging restored afterwards.
