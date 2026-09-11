# iOS363 — Apple reauthentication before release

User confirmed purchase restore works on362, but deletion reauthentication fails with AuthorizationError1000. Release remains held; no review submitted.

Read-only Apple/profile audit34645431386: bundle capability enabled, matching distribution profile includes com.apple.developer.applesignin=[Default], valid through2027-09-04. App project had no entitlements file/CODE_SIGN_ENTITLEMENTS. Added requested Apple sign-in entitlement in Debug/Release; signing now verifies both the profile and final signed app before upload. Error1000 is not unique to this defect, so actual authentication still requires device confirmation.

Multiplayer verifies Firebase tokens and group membership/owner UID separately from Apple's interactive reauthentication. Outage preservation, reconnection, canonical owner and own-house permissions tests pass. Updated obsolete listener-test mock to support Firestore options overload; implementation unchanged. No actual account deleted, no data/permissions altered in multiplayer.

No new player copy; previous scoped EN/JA copy complete. Overall translation not remeasured. Android360 unchanged.

Upload34645610856 accepted build363; final signed app and profile both verified Apple sign-in entitlement. No review submission. New reports remain open: accounts missing reciprocally in multiplayer roster (group codes awaited), Android360 personal-town input freeze after multiplayer. Local browser fixture with three repeated actual multiplayer-switcher -> personal town -> back -> swipe interactions passes after dismissing first-use guide; does not reproduce device/network conditions or establish device fix.
