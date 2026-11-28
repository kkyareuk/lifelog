# Character growth — internal 1.0.482 (534)

Personal-town home: occupation only, a next-task card above the life log, and an overlapping portrait level badge. Existing name-first creation and question-based detail discovery remain available; existing details are preserved, and full settings are not locked.

First successful directed activity and first saved schedule each award 20 XP once per character. Each distinct answered discovery question awards 20 XP, including existing answers. Every 100 XP adds a level. Skipping a guide/question or opening the UI awards nothing. Milestones persist inside the character discovery record through the existing answer journal. Shared towns do not receive personal-world task writes.

Validation: Chrome and WebKit at 412×917, 360×640 and 1280×800, KO/EN/JA, task navigation, milestone deduplication, new-character isolation, desktop surface, portrait overlap and log ordering. New-character lifecycle test passed. Web preparation and Android closure/assets checks passed. Signed release AAB built; seven changed runtime assets match packaged Android assets byte for byte. iOS sync/project checks passed; no Mac signing, device testing or TestFlight upload.

Known baseline: check-character-editor-ui-stability.mjs has the same settings-version source-string failure at untouched ed646d32. No unrelated fix included.

Play Console before upload: production 533 (1.0.481), internal 530 (1.0.478), highest bundle 533, checked 2026-11-28. Internal 534 upload verification pending. Production and game main are unchanged.

New/changed growth UI translations: English 100%, Japanese 100%. Whole-app coverage not remeasured.
