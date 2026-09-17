# Internal 440 / 1.0.388

Requested: activate the KRW 9,900 one-time ad-free product, verify billing, and distribute an internal test build. Public release is not submitted by this work.

## Product and advertising
- Play `ad_free` / `permanent` activated; South Korea KRW 9,900 confirmed in Console. KO/EN/JA product descriptions saved.
- Permanent banner/interstitial removal and account-wide 60-second discovery cooldown. Default remains 600 seconds. Optional rewarded ads remain available.
- Account entitlements immediately update advertising visibility; server transactions enforce cooldown and reward credit consumption. Play refund reconciliation revokes the benefit.
- Native Android/iOS AdMob unit configuration, consent gate, top banner reserved area and modal hide/restore. Mafia interstitial is attempted at most once per game on death/end and never blocks progress if unavailable.
- Internal build enables plaza and Google sample ads. Sample rewarded ads intentionally do not grant production credit. Real credit requires a signed callback for a server-issued ticket.
- Reward choice is a dialog opened through the countdown button, avoiding another permanent HUD button.
- Google SSV test initially failed for a Korean reward name. Verification now percent-decodes the signed query once (Google URI.getQuery semantics); tamper and Unicode checks pass. Android Console callback verification succeeded after deploying the fix.

## Validation
- Android release bundle build and jarsigner pass. Final ad, discovery, shop modules match bundled source bytes. Internal440/plaza flags verified.
- Chromium and WebKit: real observe/town/home navigation, reserved banner region, modal hide/restore, repeated bindings without duplicate banner loads, max one interstitial/game, entitlement removes banner. SDK mocked, not a device ad delivery test.
- Discovery KO/EN/JA: open/skip and cooldown shared across characters. Server tests: concurrent requests, retry idempotence, account isolation, 60/600-second boundaries, signed reward duplicates, credit consumption, refund revocation. Existing Apple/shop/wallet regression suites pass.
- No Android device connected. Actual Play purchase/restore/receipt verification remains pending a tester purchase; do not call simulated tests real payment verification. Apple product activation and Mac/device signing are not completed.
- New product and advertising UI copy: English/Japanese complete. Whole-app translation coverage not remeasured.

AAB: C:/Users/Public/drawer-release433/drawer-village-1.0.388-440-internal.aab
SHA256: ae36dc0f0bf14e62f975af078f7d4d5aa90a2a6a19995a6e60dce12aea83a650

AdMob account remains under verification, and app review is pending. Production ad fill is not verified. SDK/data safety/privacy disclosures must be reviewed before public ad rollout.

## Distribution result
Google Play internal release 325: 440 (1.0.388), "available to internal testers", September 17, 18:14 KST. No device support was lost. One non-blocking missing deobfuscation-file warning; release has minifyEnabled=false. Public release unchanged.
Internal opt-in: https://play.google.com/apps/internaltest/4701300702493397907
Play product active, KRW9,900. Actual device purchase verification remains pending.
Android reward SSV URL verified by AdMob and saved; reopening the section showed the persisted URL. Account verification remains pending at Google.
