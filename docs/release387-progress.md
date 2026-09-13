# 387 release preparation — 2026-09-14

Status: Android production387 submitted (Google pre-review checks running); iOS387 signed/upload accepted, Apple login required before review submission. Public Android baseline verified in Play Console: 381 (1.0.332). Internal: 386 (1.0.334). User authorized production and Apple review, then cancelled both five-slot bundles.

## Changes validated so far
- Late local photo restoration no longer overwrites a newly edited field.
- File and URL image selections retain their original world; asynchronous completion is rejected after a world/account replacement.
- Five-slot character/town packs hidden from the shop and rejected by the shared client sale filter, including cached web carts. Receipt identities and previously granted slots remain unchanged.
- Multiplayer profile/join dialogs use the existing localized error mapping instead of replacing all failures with a connectivity message.
- Shop price-change banner removed. Price change appears first in the public announcement and KO/EN/JA release notes.

## Checks
- check-photo-restore387: restore/edit race, untouched restore, world switch before/during photo write, same-world edit, hidden bundles.
- check-slot-sale-schedule: single slots active, five-slot packs blocked across date boundary.
- qa-snapshot385: Chrome and WebKit real mailbox choice, quota migration, reload, recovery-copy retention, failed-write preservation, account isolation.
- check-account-isolation: passed (intentional timeout failure cases logged).
- JS syntax: app.js and group-member-profile.js passed.

## Still required
- The build252 LD replacement report is NOT confirmed reproduced or recovered. Need affected saved state/original image to determine why that particular base LD changed; never infer identity or overwrite an existing photo automatically.
- Multiplayer377 join failure exact server reason remains unconfirmed. Active server includes joinGroup; generic dialog was hiding errors. Validate deployed rules/profile update and join slot checks.
- Actual lock toggle under forced quota passed in Chrome/WebKit, including reload persistence. Reporter physical device not verified.
- Google5-pack inactive; web cards removed and active api new-order rejection deployed, preserving old grants. Apple5-pack removal remains pending login.
- Android AAB387 SHA256 977AC3C0D7DEEEE0BDCB950B4F36C1366C9D4BBCAF962F397F2A688001D13C31; Google release22 full rollout submitted, not yet live. iOS GitHub run34787923433 uploadAccepted true/internalOnly false/submittedForReview false. Public announcement release-387 created/read-verified, cumulative since last announcement351. Apple review pending login.

Translation: changed user-facing notices and existing mapped errors have KO/EN/JA coverage; full-app coverage not measured.

## Apple submission completed
- 2026-09-14: iOS1.0.335 build387 (f950f9ed-cebd-42c1-b6c2-eefc364070fa) submitted successfully; submission385f23b0-eb50-4554-8884-35752d34a4e9. Replaced withdrawn382. Automatic release after approval retained.
- KO/EN storefront release notes updated; JA release-note translation prepared in update-announcement387.md, Japanese storefront localization does not currently exist.
- Apple character_slots_5 product6808704292 saved as developer removed from sale; existing grants preserved.

## Worldwide availability — 2026-09-14
- User authorized app downloads and character_slot_1 worldwide. App selection expanded from3 to all175 territories and future territories enabled. Verified summary:3 available,171 processing,1 unavailable (Afghanistan; Apple content-rating restriction). UI says changes take up to24hours.
- Character single-slot IAP6811144000 already selected all175 territories and future territories; verified without changing price. Product remains waiting for review.
- No binary/code or translation changes; no rating answers changed to bypass regional restriction.
