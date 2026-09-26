# Internal 505 — secret editor corrections

- Version 1.0.453 / Android code 505 / iOS build 505.
- Source commit: 23a3f217, based on dev 9439d2cd.
- Secrets moved after game abilities: standard full-settings page 12, with forward/backward buttons, swipe ordering, tablet spread order and menu order aligned. Existing optional court overview adds one page as elsewhere in the book.
- Trauma uses only “예전에 …을 겪었다”. Old memory/aftermath definitions keep their experience and use the fixed sentence.
- Past experience, relationship target, relationship, identity and wish selectors include an explicit custom input. Hidden preferences accept custom text in the searchable picker. Typed content remains literal across languages, saves and shared logs; it does not automatically infer triggers.
- New trauma starts without triggers. “No triggers” clears selected triggers and stops a currently active reaction tied to a removed trigger. Recommended predefined triggers remain selectable and cannot be replaced with arbitrary text.
- Existing catalog remains 32 experiences / 36 triggers; see secrets503-catalog.md for all predefined choices.

## Verification

- check-secrets503 and check-secrets505 pass: sharing, knowledge override, runtime persistence, literal custom content in KO/EN/JA, fixed old frames, trigger allowlist and clearing an active reaction.
- Packaged Chrome mobile, WebKit mobile and Chrome tablet UI checks pass: page 12, 11→12→13 navigation, custom selectors, trigger-free saves, reload, escaped text, searchable preference picker and quick-settings shortcut.
- AAB signed and verified; all 586 prepared web assets match packaged bytes. Dependency closure 288 modules.
- AAB: C:/Users/Public/drawer-releases/drawervillage-1.0.453-505-internal.aab
- SHA256: A500B46B463FC7AC53FE917EB1E7FAC563D4A1A27F9DD4296EB9DC5B92E3EDAD
- iOS preparation and project checks passed; Mac compilation, signing, real-device checks and TestFlight not performed.
- Changed UI EN/JA translations complete. Overall static screen coverage: EN 2246/2978 (75.4%); JA 2245/2978 (75.4%).
- Runtime changes on dev; main receives release documentation only under repository deployment rules. Taskboard records go to its main branch.

## Shared runtime

- Deployed revision sharedtownapi-00141-pem, 2026-09-26 06:20:55 UTC. Downloaded deployment source matches staged files byte-for-byte; only character-secrets.js differs from previous revision140. Delta: backend505.patch.
- Play validation: one missing-deobfuscation-file warning, no supported-device losses.

## Delivery confirmed

2026-09-26 15:22 KST: Play internal release379, 505 (1.0.453), provided to internal testers. Exactly one version code: 505.
https://play.google.com/console/u/0/developers/8991176563921452894/app/4975654600304836532/tracks/4701300702493397907/releases/379/details
