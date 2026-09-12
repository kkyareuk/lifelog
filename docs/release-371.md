# Android 1.0.328 (371) — 2026-09-12

Dev build, not a Play/App Store release.

- Keep chair size; reduce sofa 2.1→1.6 and dining table 2.1→1.5 sprite multiplier. Desk art unchanged.
- Include pets in room depth ordering; remove their parent stacking boundary. Order by visible art, excluding character status text. Use seat art geometry for chair/sofa anchors.
- Disable browser pan only on edit furniture. Preserve last valid cross-room drop. Personal and shared touch drag verified via Chromium CDP touch input.
- Dining table offers eating instead of resting.
- Visible return-to-personal-village controls on group and town screens.
- Import shared home room/furniture layout into existing target with revision guard and shared resident mapping; preserve room images and entry settings. Does not transfer account ownership or overwrite top-level building metadata.
- In-game anonymous contact form: category, text and diagnostic metadata. No email client required. No photo/save attachment. UID notice shown. API and fixed-recipient email trigger deployed. No real test email sent.
- Question fit feedback: multiple reason buttons, closest answers, optional note; saves exact question/answer snapshot, selected option, language/build. Feedback does not answer the question. Prevent oversized structured JSON from being silently truncated.
- Sunday 09:00 Asia/Seoul weekly question email deployed. 50 reports per message, paged reads, provider deduplication and bounded retries. Previous schema still readable.
- Includes build 370 snapshot-worker persistence changes.

Validation: Chrome/WebKit anonymous form failure/retry (KO/EN/JA) and shared home import; question feedback KO/EN/JA; shared/personal CDP touch drag; synthetic art depth; snapshot concurrency/quota/failure tests; feedback rate-limit/deduplication and digest formatting; Android APK/AAB build and APK signature/module verification.

Pending: real-device repeated interaction and seating visual review; iPhone physical-device scroll verification; real mail delivery and first weekly scheduler execution. iOS build/submission and store rollout not performed. New text KO/EN/JA complete; global translation percentage not measured.
