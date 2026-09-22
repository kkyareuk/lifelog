# Drawer Village internal 1.0.421 (473)

## Player changes
- Character Career: select career/rank, department/branch, specialty, optional display title and daily/weekly/monthly pay. Department and rank appear in the character heading when no display title is set.
- Drawer Careers/Currency: world-specific catalog and currency. Create careers, add/remove ranks and duties, configure monthly payday. Group rules control member creation; creators/managers edit or archive custom careers.
- 23 built-in careers with95 ranks, including religious workers and expanded military ranks. Fixed fictional salary amounts use the ordinary restaurant meal baseline.
- Equal monthly equivalent across payout frequencies, clean default1000-won increments and final-period settlement. Short months, partial employment and rank/frequency changes preserve accrued amounts; cursor prevents duplicate payments.
- New employment begins upon first paperwork submission, preserving existing balance. Registered employment replaces the previous per-observed-shift wage. Older profile editors retain display titles but direct registered career changes to the Career menu.
- Registered duties feed work scenes. Municipal-paperwork loading feedback in Korean, English and Japanese.

## Verification
- Unit: 28/29/30/31-day equal totals, integer1000-won default payouts, duplicate settlement, mid-period rank/frequency change, custom ownership/archive and invalid frequency.
- Backend fixture: membership, host creation rule, creator-only edits, revision conflict, character ownership, canonical salary lookup ignoring client amount, frequency/department/title persistence.
- Chromium and WebKit360px: create career/rank/duty/department, weekly assignment, save/reload persistence and EN/JA dialog fit. Screenshots visually inspected.
- Existing180-recipe cooking regression passes. Packaged offline boot and saved-character reload pass. Signed AAB536 web assets byte-identical to prepared files.
- iOS source is shared; WebKit passed. Native iOS project check could not finish because this checkout lacks ignored GoogleService-Info.plist. No signed IPA, Apple upload or physical-device validation for473.

## Delivery
- AAB: C:/Users/Public/drawer-releases/drawervillage-1.0.421-473-internal.aab
- SHA256: DADB518C1890DB43D06E2047E368352550CC8F341B044C77F7ACD63CDF7FC5DF
- Play internal release352: provided to internal testers, confirmed2026-09-22 21:42 KST. Feature source d3d59ef7 pushed to dev.
- Backend selective patch from deployed sharedtownapi-00112-jef, preserving deployed-only source and all unrelated functions. New revision sharedtownapi-00113-xug, updated2026-09-22T12:40:33.368725668Z; all165 re-downloaded deployed files match the prepared package.
- Feature code to dev; only release documentation goes to main due to its older automatic web deployment. No production/Apple promotion.

## Translation
New career UI and built-in career/rank names include English and Japanese. User-entered names and descriptions remain verbatim; default department suggestion data is Korean. Whole-app static catalog: EN2257/2985 (75.6%), JA2256/2985 (75.6%).
