# 1.0.468 (520) — 사회 체제와 공개 업데이트

2026-10-13. The user explicitly authorized Android production and iOS public submission after integrating the social-system selector. Source based on dev 713d2a57; public baseline verified as Android515 / iOS1.0.463 READY_FOR_SALE. Main remains separate because GitHub Pages is connected.

## Changes
- Move the free solo-town social system selector into the existing town-information grid alongside town size and terrain: 자유 설정 / 왕정·신분제.
- Rename the visual/audio section 배경과 음악; keep paid scenery/music entitlement rules unchanged.
- Preserve saved basic/court values, per-town isolation and multiplayer authority.
- Include cumulative516–519 schedule gatherings, varied logs, notification filtering, multiplayer court settings, solo court roles/title captions and safe save recovery. Release copy: play520-notes.txt and ios520-notes.json.

## Verification
- Actual Chrome and WebKit app: picker within town-information grid, role editor/save/reload, per-town and shared isolation, KO/EN/JA, schedule calendar navigation, no horizontal overflow.
- Court permission/story roundtrip and solo relation/caption checks pass.
- Native platform isolation, real iOS auth preservation and App Store eligible request checks pass.
- EN2250/2983 (75.4%); JA2249/2983 (75.4%). All new labels translated.
- Reporter device recovery is not confirmed. Do not describe reproduced test recovery as recovery of their real save.

## Distribution
Public520 authorized. Android signed build and Apple store-eligible Mac signing/upload in progress; final submission evidence will be appended after verification. Apple review submission is a separate explicit action and is not implied by upload success.

## Android artifact and additional regression check
- Signed AAB: C:/Users/Public/drawer-releases/drawervillage-1.0.468-520.aab
- SHA256: 95bc8db20e617ebf5273789b268b4d947303c15e27e81c6968d893b3f64bc242
- Gradle release build passes, jarsigner verifies signatures; all627 packaged web assets byte-match prepared source.
- WebKit recovery regression passes:90 selected-only notifications, empty selection, closed IndexedDB reconnect, independent same-account backup, corrupt byte preservation, missing record preservation and actual file-picker recovery.
- Android internal release393 is available to internal testers (2026-10-13 15:52 KST); proof play520-internal.jpg.
- Apple public upload Actions38358863012 first attempt stopped before signing/upload due to CocoaPods CDN connection. Retried the same build after confirming upload had not started.

## Android production submission
Play production release46 promotes the verified520 bundle. Existing API23 legacy467 stays included; replaced515 is excluded. Review reports zero lost devices. Rollout100%, all existing target countries; only existing mapping-file advisories.

Publishing overview now lists exactly one520 production change under changes in review, with quick automatic checks running. Managed publishing is disabled, so approved changes publish automatically. This is submission evidence, not confirmation of public availability. Proof: C:/Users/Public/drawer-releases/play520-review.jpg.
