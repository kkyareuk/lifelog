# Desktop village · web20261016

- Development source: origin/dev, based on 7dd227b8. Android/iOS metadata remains 1.0.471 (523); no app binary or store release in this desktop web task.
- Desktop startup opens the live village when no explicit tab link is present. Returning players enter after account/save readiness instead of an extra title click. Explicit tab links remain supported.
- Live buildings, homes, residents and travelers form the main scene. The selected character, current activity, home entry and action picker sit beside it; the resident dock switches the selected character.
- Desktop home feature panels now respect their open/closed navigation state. Previously native-only visibility rules exposed all forms before the home. The home canvas has an explicit responsive height so its size container can resolve furniture/room geometry.
- The web build includes current furniture sprites and a fresh web cache identity. Read-only inspection of the public furniture-sprites.js on 2026-10-16 found no current desk/fridge mappings; production remains a separate release.
- Browser QA: Korean/English/Japanese at 1024, 1440 and 1920 px, resident selection, action chooser, home panel open/close, furniture image loading, adding a desk through the picker and persistence after reload, and 390 px mobile HUD. No page errors. Test: node scripts/qa-desktop-village.mjs. Preview blocks external requests and uses disposable local characters.
- Web packaging: node scripts/prepare-web.mjs (315 module closure). JavaScript syntax and git diff whitespace checks pass.
- Added desktop copy: EN/JA 100%. Existing translation scanner: EN 2249/2981, JA 2248/2981 (both 75.4%; dictionary-based coverage, not every generated sentence).
- Owner-only development Site publication is recorded separately after deployment. Public web/main and mobile store releases are not promoted.

## Development publication

- 2026-10-16: Sites owner-only deployment succeeded at https://drawer-village-private-dev.kkyareuk.chatgpt.site.
- Site source commit: 7e5bae83077981cf747abfd26b7d6102487c6119, game source: e02952430f3284e4dfa79f06bd852d162b780acd.
- Deployment: appgdep_6ad1ed36fc388191be6162062d8a7f18. Saved version: appgprj_6aa5f507f1b48191900795a34f6927b0~appgver_b1d1c68a20088191b747161c64d84014.
- Isolated config and CSP block production connections; only device saves are available. Existing live accounts/saves are not copied into this Site.
- Windows packaging used Git Bash on PATH and TAR_OPTIONS=--force-local so the official Sites helper treats C:/ as a local archive path. Source push and packaging completed successfully.
- Workboard main: dbef6b0. Public drawervillage.com and app-store releases remain unchanged.
