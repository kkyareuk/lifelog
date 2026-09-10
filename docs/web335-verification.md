# Web 335 · 2026-09-11

Android baseline remains 334 (1.0.301); this is a website revision, not a new Android versionCode or an iOS submission.

Desktop: wood sidebar, cream workspace, account status/profile entry, persistent multiplayer navigation; current scene, journal and village shortcuts. Desktop question/intervention/command controls use existing character handlers. Empty accounts can open multiplayer and shop. Fixed settings navigation intent when opening account from another tab.

Mobile retains Android game HUD. Web shop reuses shopkeeper art/layout, with account-scoped web cart instead of native billing; existing live public client configuration preserved. No backend or secret change.

Verification: qa-web335 (Chrome: desktop KO/EN/JA, account/settings, multiplayer navigation, mobile HUD, web cart and no native billing buttons), navigation boundary 9 checks, production web module closure106. No real card charge or live two-account multiplayer test. New interface/notice copy KO/EN/JA complete; overall existing translation coverage not remeasured.

Cumulative 314→334 notice: scripts/send-update334-mail.cjs, docs/update-mail334.json. Dispatch update-314-334-20260911-v1:576 accounts (KO569/EN3/JA4), push0, Firestore and mailbox readback verified. Public notes exclude unreleased DLC and superseded intermediate designs.
