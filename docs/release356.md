# 356 / 1.0.323

- Navigation selection now writes a small account-scoped record instead of scheduling the full world snapshot. Character editor draft save is deferred.
- Room photo help and removal live in the image chooser. Photo mode no longer replaces the configured floor material. Removed reset/default-floor buttons.
- Native routine shell allows vertical scrolling.
- Shop displays the September 14, 2026 KRW 1,000 single-slot notice with explicit readable text/background colors.
- iOS StoreKit allow-list includes character_slot_1; Android/iOS sources share 1.0.323. TestFlight internal-only build 356 requested, no App Store submission/public release.

Validation: qa-navigation356 browser tests (selection writes, real speech menu, stale input, room permissions, photo removal), home-surface checks, mocked Apple single-slot validation, Android signed APK/AAB build and asset verifier. Actual device multi-second stalls and live Apple purchase remain unverified. No notification sent. New notice/photo help translated EN/JA; overall app translation coverage not measured.

Mac runner 34631910977: signed archive and IPA validation/upload succeeded. Apple accepted version 1.0.323 (356), internalOnly=true, submittedForReview=false, source7de6f8d. Bounded processing lookup returned build:null, so tester availability and live purchases remain unverified.
