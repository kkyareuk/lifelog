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
