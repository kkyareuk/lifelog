# iOS 1.0.459 (511) — production request

- 2026-09-29 user explicitly requested the same update for iPhone after Android511 production submission.
- Existing Apple public1.0.455(507) confirmed READY_FOR_SALE via Actions36451721958.
- Shared application source from dev d0dfc8fa, same511 features as Android. No Google Play APIs are invoked on iOS (check-native-platforms passed). Android-only billing preparation fixes are not advertised as StoreKit fixes.
- App Store eligible upload requested via Actions36451751043. Mac signing and Apple upload succeeded. Local preparation is not an IPA or physical-device test.
- KO/EN/JA notes: docs/ios511-notes.json. Covers presets, meal sound, letters, furniture, surfaces and home scene improvements.
- Submission automation is scoped to app6808600866, version1.0.459, build511, approval-triggered release. Does not change pricing, agreements, permissions or tester access.
- Translation EN2250/2983 (75.4%), JA2249/2983 (75.4%); new release notes100%.

## Verified completion — 2026-09-29 01:46 KST
- Mac Actions36451751043 succeeded: archive, codesign verification, App Store eligible export, Apple validation and upload accepted. Source d0dfc8fa5abfd3675fa4c390b43ddf2d52fd3993.
- Apple processing initially pending; first preparation stopped before build attachment. Bounded wait then succeeded in Actions36453163730.
- Build511 VALID, id1cf962af-2e25-440b-9bdc-c1574619107d. Version1.0.459 id8f3e86c7-6168-4fda-9fdb-205d496e1bdf created independently of released507.
- KO/EN/JA release notes saved. Existing released507 encryption declaration carried forward; native dependencies, Podfile and Info.plist unchanged.
- Actions36453308413 succeeded: WAITING_FOR_REVIEW, releaseType AFTER_APPROVAL. Submitted for production review, not yet publicly available.
- No physical iPhone testing claimed. No email, in-game announcement, pricing change or Android re-release.
- Evidence: docs/ios511-submission.json. Upload: https://github.com/kkyareuk/lifelog/actions/runs/36451751043 ; submission: https://github.com/kkyareuk/lifelog/actions/runs/36453308413