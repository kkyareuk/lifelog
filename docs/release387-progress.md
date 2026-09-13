# 387 release preparation — 2026-09-14

Status: in progress, not built or submitted. Public Android baseline verified in Play Console: 381 (1.0.332). Internal: 386 (1.0.334). User authorized production and Apple review, then cancelled both five-slot bundles.

## Changes validated so far
- Late local photo restoration no longer overwrites a newly edited field.
- File and URL image selections retain their original world; asynchronous completion is rejected after a world/account replacement.
- Five-slot character/town packs hidden from the shop and rejected by the shared client sale filter, including cached web carts. Receipt identities and previously granted slots remain unchanged.
- Multiplayer profile/join dialogs use the existing localized error mapping instead of replacing all failures with a connectivity message.
- Price notice updated in Korean, English and Japanese.

## Checks
- check-photo-restore387: restore/edit race, untouched restore, world switch before/during photo write, same-world edit, hidden bundles.
- check-slot-sale-schedule: single slots active, five-slot packs blocked across date boundary.
- qa-snapshot385: Chrome and WebKit real mailbox choice, quota migration, reload, recovery-copy retention, failed-write preservation, account isolation.
- check-account-isolation: passed (intentional timeout failure cases logged).
- JS syntax: app.js and group-member-profile.js passed.

## Still required
- The build252 LD replacement report is NOT confirmed reproduced or recovered. Need affected saved state/original image to determine why that particular base LD changed; never infer identity or overwrite an existing photo automatically.
- Multiplayer377 join failure exact server reason remains unconfirmed. Active server includes joinGroup; generic dialog was hiding errors. Validate deployed rules/profile update and join slot checks.
- Verify actual lock toggle under quota, physical device if available.
- Finish storefront retirement (Google/Apple/web), preserving receipt grants.
- Build387, Android production rollout, updated Apple build/review; cumulative public notes since381. No completed deployment claim yet.

Translation: changed user-facing notices and existing mapped errors have KO/EN/JA coverage; full-app coverage not measured.
