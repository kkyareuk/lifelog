# Internal 504 — 1.0.452

Final build for the character-secret feature described in [release503.md](release503.md). Build 503 was uploaded to the artifact library but never provided to testers; its release draft was replaced with 504.

## Final change

In addition to the six secret types, 32 trauma experiences, 36 triggers, searchable catalog preferences, autonomous disclosure/follow-up, personality-based contact logs and short activity timing, this build makes explicit edits to who knows a secret take precedence over older shared-server memories. A later real disclosure records the new setting revision correctly.

## Verification and artifact

- Source/runtime commit: `c80b852c`, pushed to `dev`.
- Chrome and WebKit: source and final packaged UI, create/edit/reload, custom HTML escaping, trigger recommendations, all three languages, quick shortcut; 1024px landscape tablet Chrome also passed.
- Model/server tests: knowledge isolation and explicit override, repeated disclosure prevention, later follow-up, paired directives, per-pair contact variations, rejection branch, three-minute morning prep, shared persistence and isolation from personal state.
- Existing reported501, cooking482 and group-sleep453 regressions passed. The historical directed-kiss31 false-return assertion also fails on unchanged 502; current rejection-scene behavior is explicitly tested and passes.
- Android AAB: `C:/Users/Public/drawer-releases/drawervillage-1.0.452-504-internal.aab`.
- Size: 105,522,786 bytes. SHA256: `1D90583552014A5292B2B51E56EDB8407E5B972EAB89E9497ADF125126BE1059`.
- Signature verified. All 586 prepared web assets match the final bundle byte-for-byte; dependency closure contains 288 modules.
- Play review: one standard missing-deobfuscation-file warning, zero supported-device losses; displayed installation size 105MB, +26.2KB versus 502.
- Shared server: final revision `sharedtownapi-00140-xix`, updated 2026-09-26 05:47:33 UTC. Downloaded deployed source matches all 195 staged files; only nine feature runtime modules differ from pre-task revision137. Exact delta: `backend504.patch`.
- iOS 1.0.452/504: local preparation checks passed; no signed IPA, Mac/Xcode compilation, device verification or TestFlight delivery performed here.
- New/changed EN and JA strings: 100%. Existing static screen coverage EN2246/2978 and JA2245/2978, both75.4%.

## Records

All trauma events, recommended trigger mappings and other selectors are listed in [secrets503-catalog.md](secrets503-catalog.md). Play copy is [play504.txt](play504.txt). Main receives release records only because the existing main branch still has old web deployment wiring. Runtime changes are on dev. No public/closed-track promotion and no in-game announcement.

## Delivery confirmed

2026-09-26 14:49 KST: Play internal release378, 504 (1.0.452), **provided to internal testers**; exactly one version code, 504. Release details: https://play.google.com/console/u/0/developers/8991176563921452894/app/4975654600304836532/tracks/4701300702493397907/releases/378/details
