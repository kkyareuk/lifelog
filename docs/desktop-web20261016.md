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
