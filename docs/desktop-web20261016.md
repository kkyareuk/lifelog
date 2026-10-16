# Public desktop village · web20261016

- User authorized public web promotion on 2026-10-16. Based on public main 8af3d90a, selectively backporting desktop feature e0295243; unrelated dev features are excluded.
- Desktop opens the live village, with residents, selected character activity, action controls, home entry and resident selection. Characters without artwork display initials.
- Desktop home uses the available screen width and correctly hides closed feature panels. New directional furniture artwork includes desks, refrigerators, baths, counters, single beds, plants and shelves.
- Furniture placement and reload persistence are preserved. Phone HUD remains available.
- Public target: https://drawervillage.com (Cloudflare Pages drawervillage). Cache: drawer-village-web20261016-20261016.
- Android versionCode remains 523. No mobile binary/store release.
- QA: Korean/English/Japanese, widths 1024/1440/1920, resident selection, activity picker, home panels, furniture loading/add/save, 390px phone HUD. External services are blocked in disposable browser tests.
- Build: 167-module closure and 226 WebP references validated. Added desktop copy EN/JA 100%; existing dictionary coverage measured separately.

## Deployment confirmation

- Public main implementation: eb041fad. Cloudflare Pages production deployment f8751553 completed on 2026-10-16.
- drawervillage.com serves the new index, cache, desktop modules and furniture PNGs with HTTP 200 and correct content types.
- Public URL browser QA passed the same three-language/layout/interaction suite using disposable local state, intercepted preview authentication and blocked external services; no production account writes.
- Dictionary coverage: EN 2249/2962 (75.9%), JA 2248/2962 (75.9%). New desktop copy: both 100%.
- Workboard main release record: 48eec11.
