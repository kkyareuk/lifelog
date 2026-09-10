# Multiplayer dictionary repair (dev, Android 334 unchanged)

The catalog route previously returned renderSharedCatalog, a plain transfer summary. It now uses the same card/editor UI as the personal dictionary. The top filter is My dictionary / joined multiplayer groups; categories are below it. Place filters are removed.

Shared data is isolated from state.catalog. Owners/managers/operators can add, edit, copy, delete and select built-in art, image URLs or device photos. Other members can inspect read-only fields. Personal file transfer controls do not operate on shared data. Shared device photos use the existing authenticated media preparation/upload pipeline before the catalog write. Saves compare the original item inside a transaction to reject concurrent overwrite; membership, role, total 80-item limit, document size and remote-media validation are enforced by the server.

Deployment: requires the new sharedTownApi saveCatalogItem endpoint and updated web/app together. Neither deployed in this task; no user images migrated/deleted. Existing sharing/import controls in group management are retained.

Validation: scripts/check-dictionary337.cjs (permissions, CRUD, stale updates/deletes, media validation, 80 total); scripts/qa-dictionary337.mjs (360x840 cards, filter order, save isolation, personal/group switching, read-only member); existing check-catalog-media305.cjs; npm run build (106 modules); syntax/diff checks. Browser tests use local mocked auth/group service, not production accounts. Real Storage upload, multi-device concurrent editing and installed Android remain unverified.

New UI copy includes Korean, English and Japanese (100% of new copy). No full-app translation percentage claimed.

## Image storage decision
Current code: auth.js uploadDataUrl stores optimized content-addressed files at users/{uid}/media/{hash}.{ext} in Firebase Storage, with a media manifest and local media cache. Do not move image bytes into Firestore. Keep current images; add/use small thumbnails and measure transfer first. R2 is a later option for optimized media, with Firebase Auth/group authorization at the serving layer and short-lived URLs for private images. R2 egress is free but storage/operations still cost money. Do not expose private OC art through a public bucket.
Official references: https://developers.cloudflare.com/r2/pricing/ ; https://developers.cloudflare.com/r2/api/s3/presigned-urls/ .
