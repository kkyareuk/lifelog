# 329 / 1.0.296 verification

- New questions: interests, hobbies, skills, liked/disliked drinks; each appends to the existing list. Opposite drink preference is removed unless locked. 44 contexts total.
- All choices have 26 trait target entries; null leaves a trait unchanged. Numeric targets approach at 20% per answer; categorical targets retain weighted affinity. Existing choices preserved, three explicit violent choices added; mere complaining has lower aggression targets.
- Old characters default to unlocked where no explicit lock exists. Explicit locks remain respected. Unavailable opposite-locked append choices are excluded.
- Seven autonomous activity categories; manual commands, routines and essential sleep excluded. Partner restrictions checked before committing generated group scenes.
- Right rail question icon between calendar/statistics; countdown retained, no plus, opacity while waiting. Locks under Official Relationships.
- Emotion page has bounded scrolling and nonshrinking sections to prevent touch/cognitive overlap.

## Validation
- check-discovery329.mjs PASS: legacy eligibility, explicit locks, 26 targets per choice, KO/EN/JA choices, calibration, preference merging, skills, autonomous/manual/sleep/partner policy.
- qa-discovery329.mjs PASS: KO/EN/JA at 384x832 and 1180x832. Actual buttons, legacy question opening, cooldown, activity save, relationship locks, touch/cognitive bounding rectangles and no page errors.
- test:log-continuity PASS.
- test:home-life FAIL at old CSS string assertion expecting --life-edge:52px. HEAD 9098424 also does not contain it; current existing rule uses min(82px,50%). This is not a fully passing suite.
- app:prepare, native module closure (106), build PASS.
- Gradle assembleRelease/bundleRelease PASS. APK signature verified, AAB jar verified, aapt 329 / 1.0.296. All 311 prepared web assets match both archives byte-for-byte.
- New UI/question text KO/EN/JA supplied. Static overall measurement EN 2247/2958 (76.0%), JA 2246/2958 (75.9%).
- Not verified on physical Android devices or live two-account multiplayer. No production, Play, web, backend or mail deployment.
- APK/AAB delivered directly in the workspace 앱 전달 folder.
