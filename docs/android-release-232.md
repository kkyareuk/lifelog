# Android dev 1.0.214 (versionCode 232)

## Purpose

Carry the production Google sign-in hotfix into the development branch without disturbing the features already under development.

## User-visible changes

- Android opens the Activity-result Google account chooser directly instead of the Credential Manager path that can remain unresponsive on some Android 17 devices.
- The login button immediately shows that the account chooser is opening.
- Repeated taps are ignored while sign-in is in progress, and cancellation is reported clearly.
- Existing first-login guest handoff remains intact so a character created before login is adopted and uploaded to the signed-in account.
- The new login feedback is available in Korean, English, and Japanese.

## Build

- Application ID: `com.drawervillage.app`
- Version name: `1.0.214`
- Version code: `232`
- Debug APK: `drawer-village-v1.0.214-code232-dev-debug.apk`
- Release AAB: `drawer-village-v1.0.214-code232-dev-release.aab`
- Debug APK SHA-256: `37F49013A1D39B4F545B75170837FCA5C4E26625D328A65A551AAC9335246985`
- Release AAB SHA-256: `B475828133B1E0F3FE0122A86E336BBD7FA2ABBC39ED19280AAAFCF07863FDAF`

## Verification

- `npm run test:dev232`
- `npm run test:account-isolation`
- `npm run test:cloud-merge`
- `npm run test:shop-billing`
- `npm run app:sync`
- `gradlew clean assembleDebug bundleRelease` — 490 tasks, successful
- APK manifest: version `1.0.214` / code `232`, target SDK 36
- Packaged `auth.js`: legacy selector enabled, Credential Manager disabled
- Packaged plugin registry: Firebase Authentication present

