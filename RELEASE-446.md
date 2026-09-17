# Public446 / 1.0.394

User authorized production release if the current AdMob verification can be resolved without another binary update, plus an in-game announcement. Official AdMob docs confirm verification uses store/developer website and app-ads.txt, followed by app readiness. Existing actual ad IDs/SDK remain unchanged; approval can restore delivery without a binary update. No promise that time alone fixes verification.

Current Play production baseline observed437 (1.0.385); last published notice notice-639d1546-4310-489f-9a84-e0173aab1643 is1.0.385. Cumulative notice covers439–445 user-facing changes, excluding Mafia and test-only reward bypass. Explicitly announces account-wide10min instead of prior per-character cooldown.

446 packages445 code with DRAWER_RELEASE_CHANNEL=public: plaza disabled, real ads enabled/testingfalse. No new runtime behavior. Source remains dev; main web is not overwritten. iOS version preparation only, no iOS release requested or performed.

Validation: Android release build, jarsigner verified,467 web assets byte-identical. public446/plazafalse/actual ads verified. Previous445 Chrome/WebKit input, nested bed, shop, ads/premium viewport tests pass. iOS project check passes, no signedIPA. Live real-ad fill and real purchase not tested. EN/JA new runtime copy complete; prior static total75.5% each.

Artifact: C:/Users/Public/drawer-release433/drawer-village-1.0.394-446-public.aab
SHA256:7B8E11753674DC15C49C8C02B5A04FD101101EBA46909335B58D978471D1F0C5
Notes: release446-notes.txt
Announcement: announcement446.json

AdMob external blocker: account verification in progress and Android app verification fails despite expected text at public HTTPS developer endpoint. Recheck requested in previous turn, still failed. Approval not guaranteed by production submission.
Sources: https://support.google.com/admob/answer/14538460?hl=en and https://support.google.com/admob/answer/9363762?hl=en
