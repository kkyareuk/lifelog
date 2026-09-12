# iOS363 — Apple reauthentication before release

User confirmed purchase restore works on362, but deletion reauthentication fails with AuthorizationError1000. Release remains held; no review submitted.

Read-only Apple/profile audit34645431386: bundle capability enabled, matching distribution profile includes com.apple.developer.applesignin=[Default], valid through2027-09-04. App project had no entitlements file/CODE_SIGN_ENTITLEMENTS. Added requested Apple sign-in entitlement in Debug/Release; signing now verifies both the profile and final signed app before upload. Error1000 is not unique to this defect, so actual authentication still requires device confirmation.

Multiplayer verifies Firebase tokens and group membership/owner UID separately from Apple's interactive reauthentication. Outage preservation, reconnection, canonical owner and own-house permissions tests pass. Updated obsolete listener-test mock to support Firestore options overload; implementation unchanged. No actual account deleted, no data/permissions altered in multiplayer.

No new player copy; previous scoped EN/JA copy complete. Overall translation not remeasured. Android360 unchanged.

Upload34645610856 accepted build363; final signed app and profile both verified Apple sign-in entitlement. No review submission. New reports remain open: accounts missing reciprocally in multiplayer roster (group codes awaited), Android360 personal-town input freeze after multiplayer. Local browser fixture with three repeated actual multiplayer-switcher -> personal town -> back -> swipe interactions passes after dismissing first-use guide; does not reproduce device/network conditions or establish device fix.

## 2026-09-12 release submission
User confirmed successful account deletion on363 after earlier purchase restoration success and explicitly requested iOS release. User also confirmed mutual test blocking/reporting explains the roster visibility report. Android360 report corrected from persistent freeze to delayed response after multiplayer; unresolved, no full-performance-fix claim.

App Store Connect version1.0.327 build363 submitted successfully: submission81a957b3-e919-4c05-a6b9-fa76b0e05b83, review pending. Release AFTER_APPROVAL, immediate rollout, existing ratings retained. KO/EN whats-new saved, review notes replaced with current restore/deletion/IAP directions. Existing three IAP products approved. Separate one-slot6811144000 remains prepare-for-submission and is NOT part of this submission. Source is726d467, later membership fix6cfd96c excluded. No public release observed yet.

JA translation of release notes (not uploaded: no existing JA App Store localization):
・購入履歴の復元と購入済みキャラクター枠の表示を改善しました。
・アカウント確認と削除時の不具合を修正しました。
・キャラクター設定、部屋の写真管理、予定画面の使いやすさを改善しました。
・画面移動と保存処理の安定性を改善しました。

## 2026-09-12 approval and distribution verified
App Store Connect shows version1.0.327 build363 as 배포 준비됨 on the deliverable page, AFTER_APPROVAL selected. Submission81a957b3-e919-4c05-a6b9-fa76b0e05b83 accepted. No additional manual release action required. Public storefront propagation can take24hours. Later dev changes are not in363.
