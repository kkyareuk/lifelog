# 내부464 / 1.0.412 — 왕정 그룹 배경과 궁정 프로필

- dev feature correction. Default story Drawer Village; host/managers select Monarchy under multiplayer Story management. Incorrect plaza court-game entry removed.
- Dedicated 23 job options (including unassigned/other) in quick/full character editor. Separate court job title retains original modern job/title across story switches.
- Court page after basic profile: shared status name/rank, allegiance, public background, attention to status, conversation preference. Character save writes profile and court metadata atomically with owner/enum/rank validation.
- Shared statuses: nine defaults, manager add/update with optimistic revision. One pending request per member, manager approval/rejection, replay protection, 80-rank cap. Read-only member subscriptions; writes only authenticated API.
- Fixed social distance uses shared rank levels and allegiance; low social distance permits public closeness. Status awareness is separate and influences the existing court response resolver.
- Existing dialogue engine retained. Automatic replacement of every ambient log/script, event costumes and seasonal scenarios are outside this settings correction.

## Validation

- check-court464: permissions, requests, duplicate/stale submissions, validation, original job retention, distance and awareness, multilingual catalogue parity.
- check-court463: ownership/consent/blocking/stale sessions/cooldown/idempotency and directional relationships.
- qa-court464 Chromium + WebKit: real backend with fake Firestore, host/member workflows, real native quick/full editor, court page, tablet spread, KO/EN/JA widths. No real two-account device play test.
- Existing character editor and shared431 regression checks pass.
- EN/JA new UI and catalogue 100%; legacy static UI scan EN2260/2988(75.6%), JA2259/2988(75.6%). Scan does not measure every dynamic log.
- iOS464 metadata/preparation and project checks only; no signed IPA or TestFlight upload.

## Delivery

Android signed AAB built and verified: 497 prepared web assets match byte-for-byte. SHA256 2AB4F91990D97E4C4F9F50C97A942EF5955785381F88D27EA245FA09F517142B. File C:/Users/Public/drawer-releases/drawervillage-1.0.412-464-internal.aab. sharedTownApi and Firestore rules deployed successfully. Play release343: internal testers available, verified 2026-09-20 16:30 KST. KO/EN/JA notes attached. Only the existing non-obfuscated-build mapping-file warning; no errors. Unauthenticated requestCourtRank returns HTTP401. Implementation c4b8bb99 pushed to origin/dev. Game main and production unchanged.
