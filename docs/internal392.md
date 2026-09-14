# 1.0.340 (392) internal test

Development baseline dev bd7ca3f. Internal 391 → 392. No production promotion or announcement delivery requested this turn.

- 18 everyday conversation subjects with localized names/facets. Automatic conversations can choose these alongside configured interests. Both perspectives identify the same subject and partner; manual topic conversations and automatic topic encounters use subject-specific titles. Existing disagreement/quiet responses remain.
- Reserved/cold traits take precedence over cheerful hug templates for both actor and recipient, including romantic variants. Contact rejection remains authoritative.
- Direct relationship profile scenes carry partner IDs through timeline generation. Known historical interruption-confrontation profile logs restore the target only when the exact name uniquely identifies a character. This does not teleport a distant target or invent a meeting location.
- Sharing-code imports await the actual save result; failure removes only the unfinished imported character/home/wardrobe/routines, preserving other edits. Full slots are checked before creation. Only wardrobe items traveling with the profile are retained. Code input normalizes full-width text and dash variants; missing/invalid codes and login errors have KO/EN/JA guidance.

## Verification
qa-interaction392 Chromium/WebKit: 10-character account fixture, successful durable import/reload, full slot rejection without changes, quota-failed import rollback, actual preview/import dialog, code normalization, restrained hugs both roles and rejection, 18 paired topics ×3 languages, interruption target metadata. Chromium final run also verifies historical log repair after reload.
qa-save391 Chromium and qa-interaction391 regressions passed. qa-wardrobe334, check-character-code274, check-character-codes270 passed. The old wardrobe test fixture was corrected for the existing auto-ownership behavior of addCatalogItem, and callers now await imports.
Android release build passed. All 372 packaged web files match prepared assets byte-for-byte; 153 runtime modules present. jarsigner reports jar verified (standard self-signed/timestamp and AAB stream-layout warnings).
AAB SHA256: 54af58fb97d402fc920f220de7a09ccc1b3f08b2b0c1d3eb79a49cc735c9dd68.

## Limits and platforms
The reporter did not have the error text or failing code. We reproduced/fixed the importer defects and tested backend code service logic with mock storage; no claim that the specific production request was reproduced. No real user account data or production API writes used for testing.
Common source affects web/Android/iOS; Android internal deployment only. Web site not published. WebKit checked; native iOS check is blocked by missing local ios/App/App/GoogleService-Info.plist; no signed IPA/TestFlight claim.
KO/EN/JA new copy and release notes complete (100% changed scope; whole-app coverage not remeasured).

## Deployment
2026-09-14 20:32 KST: Play Console confirms 392 (1.0.340), 내부 테스터에게 제공됨, publication 20:31, release289. No supported-device losses; existing missing deobfuscation-file warning only. Implementation 2646b9e pushed to dev.
