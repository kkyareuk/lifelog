# Public 1.0.476 (528): court conversations and private reflections

Authorized request: add rank interactions and release to Google Play production and iOS. Source is isolated from public mobile525 a8d5ff6c; only the character-life527 feature and court528 interactions were selected. Unrelated desktop development is excluded. Personal-world scope; no production account data edits or announcements.

New court conversations: eight contexts (formal courtesy, equal standing, familiar warmth, candid speech, political differences, sovereign audience, everyday circumstances, reassurance),16 paired variants/32 viewpoints in Korean, English and Japanese. Both participants must be in an actual mutual conversation at the same location in the same court town with configured ranks. Closeness, status awareness and allegiance influence the result. Both logs share one event ID; repeated render/relaunch does not duplicate it. Six-hour pair cooldown and at most24 remembered encounters per resident. Manual orders, schedules, secrets, dates, sleep, travel and multiplayer are excluded. No automatic romance or affinity writes.

Includes100 trilingual character-life527 logs, secret reflection controls (off/2h/8h/day), town court selector and shortcut. Reflection history is separate from simulated activities and survives future-plan regeneration.

Validation: all81 ordered rank combinations,8 category selections,32 translated viewpoints, two-sided idempotence/reload/cooldown, location/partner/privacy exclusions; existing100-log, secret503/505 checks; mobile/desktop KO/EN/JA browser QA and WebKit packaged UI. Native module closure/assets, Android signed bundle and iOS project checks are separately recorded below. New copy EN/JA100%.

Deployment status: Android review submitted (automatic quick checks running); iOS WAITING_FOR_REVIEW. Review submission is not actual store availability.

## Verified build and Android submission (2026-10-24)
- Exact runtime source: e5c946704e86c8152fe194b4f2fe15da27aa5ab5, isolated public branch codex/public-court528. Feature and integration test are also on dev (f50f82ad,82ad9d30).
- Android 1.0.476 /528: signed AAB built successfully; jarsigner verified; all633 packaged web assets match prepared source byte for byte.
- AAB SHA256:8990C6DE6BF55F5F58E15D64BCA1B65804C3E856E4E20D50C87144B07420AA79.
- Production release51 submitted for full rollout to the existing178 countries. Legacy467 retained;525 replaced; zero supported-device loss. Only missing-obfuscation-map advisories.
- Publishing overview shows528 under changes in review; automatic quick checks still running. Managed publishing disabled: automatic availability after approval. Submission is not proof of availability.
- Evidence: C:/Users/Public/drawer-releases/public528-review.png.
- Packaged actual simulation QA passes: each conversation participant receives one reflection with the same event ID; repeated reads do not duplicate it.
- iOS project/preflight checks passed. Mac upload run40055698723 uses the exact pinned runtime source; final upload/review status follows.
- New English/Japanese copy100%. Existing dictionary coverage: EN2250/2983,JA2249/2983 (75.4% each).



## iOS submission confirmed
- Mac upload40055698723 succeeded: Apple accepted1.0.476(528), App Store eligible. Checkout and pinned-source assertion both confirm e5c946704e86c8152fe194b4f2fe15da27aa5ab5. The upload report source field uses GITHUB_SHA (workflow commit e3f00196), not the checked-out runtime; checkout verification is the source evidence.
- Preparation40056433256 confirmed build528 VALID and attached it to1.0.476; three locale release notes updated.
- Submission40056544592 succeeded. Apple state WAITING_FOR_REVIEW; releaseType AFTER_APPROVAL. Version ID6e9ede88-4444-4a50-8d4a-e5d65c92a5c5; build IDdbf50603-df2a-4125-9bd0-677624bc0f74.
- Neither platform is confirmed available to users yet. No duplicate upload or unrelated draft submission performed.
