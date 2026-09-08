# iOS 1.0.215 (15) candidate

Operational Android hotfix 274 is the game source. Multiplayer development changes are not included.

- Adds native Sign in with Apple with nonce validation and Firebase account isolation.
- Adds in-app account deletion after provider reauthentication; owned groups and shared codes are included in the confirmation. Purchase ledgers retain the existing privacy-policy retention treatment.
- Apple signed transaction routing supports App Review Sandbox without crediting production entitlements. Sandbox slots are previewed in the iOS session only.
- Raises minimum iOS to 15, matching the StoreKit bridge requirement, and includes the Apple login entitlement in the renewed signing profile.
- Includes hotfix 273/274: scene recovery/navigation, drink settings, long profile choices, body-contact response and character sharing codes with photos.

Validation: production source hashes, native module closure, iOS preparation and hotfix274 browser QA passed. Native Apple login/revocation and on-device purchase still require device verification. App Store screenshots and review metadata must be completed before submission. This candidate is not marked ready for review automatically.
