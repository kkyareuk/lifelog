# Public437 / internal438 — September17, 2026

Development remains on dev; game main is unchanged. Public437 (1.0.385), plaza off, release30 was submitted to Google. Publishing overview shows review pending with automatic quick checks still running; it is not yet publicly available. Public421 is the live baseline. Unsubmitted public435 was removed from pending publication and replaced with437.

Internal438 (1.0.386), plaza on, release324: Play confirmed “내부 테스터에게 제공됨”, September17 at16:47 KST. Earlier436 was delivered at16:11. No private/closed-test promotion occurred.

## Changes

- Click feedback and selection popups use a small settings projection, removing two full-world JSON clones per click. CPU4x Chromium, 3,448,216-character fixture (6,906,202 UTF-8 bytes), eight clicks: before16 clones/998.6ms cumulative cloning, median124.2ms; after0 clones, median2.1ms. This measures common click dispatch, not total rendering or phone heat.
- Cloud photo usage identifies objects independently of download tokens, excludes other accounts' uploads, and recalculates referenced manifest/legacy counts rather than retaining inflated historical counts. No photos deleted. A122-iteration regression keeps one own photo at one across aliases and foreign photos. The user's actual104→122 file history was not inspected; updated counts are persisted by successful sync.
- Counter art uses three clipped regions: fixed ends, stretched center. Front tabletop area is5%/4%/90%/56% with fine-grid snapping. Induction users stand on the floor in front of the counter. Chromium/WebKit fixture: end caps14.39px at spans1/3/6, user lowered79px, stable on repeat layout. Screenshot visually inspected.
- Directional feelings initiate compliments, mutually permitted hugs or requests for space when actually together in a home room. Contact, autonomous-action and room restrictions apply. Active/scheduled/protected activities are excluded; persisted directive time and minute cache limit repetition. Policy, art, positioning and cloud-count logic have separate modules.
- Supplied electric-button audio now serves character/action selection with softened peaks and fade-out. Home character selection/swipes use book-page audio. Existing generic taps, drawer/book and footsteps remain supported.
- Restaurant favorite/spicy/taste-matched orders create meal actions and localized records. Companion text is “함께 갈 사람 고르기”. Previous sound volume, grouped conversation labels/spacing, home-editor and menu-close fixes are included.

## Validation and deployment

Passed: check-feedback438; qa-surface438 Chromium/WebKit; qa-feedback433 Chromium/WebKit (actual home swipe/sound, routes/mute, editor, conversation); qa-click-performance437 including KO/EN/JA popups; check-restaurant437 shared meals/records/companions/wrong-location rejection; check-cloud427; check-feedback430; JavaScript syntax and git diff checks.

Old check-home-life-simulation CSS-string assertion fails on baseline432 as well and is not claimed as passing. Physical Android sound/thermal tests were not performed.

sharedTownApi deployed successfully with restaurant and automatic-feelings support. Web prepared190 modules. iOS438 project/assets/config preparation passed; no Mac compilation, signing, IPA or TestFlight delivery claimed.

Both final signed AABs built and jarsigner verified. Changed source/audio match bundled assets and plaza flags were verified. Artifacts: C:/Users/Public/drawer-release433/.

| Artifact | SHA256 |
| --- | --- |
| drawer-village-1.0.385-437-public.aab | 353378dbce67c7bfc31382c6004e88b71c7865c41a858d4ef4d26bb14355ccd6 |
| drawer-village-1.0.386-438-internal.aab | 8cb7bbabb3a14923bd3afe6ad6ace179ed7c6ae62c809a694abf23b2d12c9095 |

Play notes: play-notes437.txt and play-notes438.txt, KO/EN/JA each under500 characters. New/changed EN/JA strings100%; overall coverage unmeasured.

## Announcement

Authorized cumulative notice covers1.0.355/code407 through public437, excludes Mafia, sender “서랍마을” / recipient “서랍마을 주민”. UI confirmed in-game publication after public437 submission, without push or email. ID: notice-639d1546-4310-489f-9a84-e0173aab1643. Exact text: announcement437.json/txt. Task board updated separately on main; game source committed to dev.
