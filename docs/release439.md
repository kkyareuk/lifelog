# Public439 /1.0.387 — prepared, not submitted

User authorized production fixes, then added account-wide discovery cooldown, optional reward ads and top banners in home/town/house. Advertising account was newly created; app/ad-unit IDs and the release decision while ads are unconfigured are pending. Do not claim439 uploaded/submitted or ads enabled.

## Completed source
- Surface attachment ordering is applied as a constraint in final home depth sorting, rather than a z-index later overwritten. Shared furniture-depth module also binds Mafia rooms, observing image load/resize and cleaning up on render; each Mafia room isolates its layers.
- Dining tables now support surface snaps, grid and persisted prop attachments, using a10%/8%/80%/65% top area. Counter/nightstand behavior retained.
- Bed occupant layout extracted from editor lifecycle and called by scene layout. Transformed viewport coordinates map into the occupant's parent, avoiding offset assumptions across nested/scaled containers. Clears stale explicit top/left. Basic one-bed report did not reproduce verbatim; moved/nested/scaled bed fixtures now verified. Real reporter save not accessed.
- Discovery uses an authenticated server transaction for one question every600000ms across an account, shared among personal/multiplayer characters and devices. Guest fallback is device-local. Per-character old local timestamps migrate into account cache. Retry request IDs are idempotent. New diamondWalletApi /discovery/read and /discovery/use routes deployed, without enabling diamond shop or ads.
- Story questions share the candidate pool with ordinary questions; recent topics are excluded. Answered home/cooking themes suppressed for seven days, rather than repeating with date-only IDs.
- No ads are active. Reward intended: wait10min free or fully watch for immediate1use. Requested top banners home/town/house still pending AdMob app ID, reward unit and banner unit plus native setup.

## Validation
Chromium/WebKit qa-layer439: counter/nightstand/table prop depths, Mafia fixture, moved bed X/Y and nested transformed frame. qa-bed418 existing single-bed front/side; Chromium/WebKit qa-discovery439 actual open/skip and second-character shared countdown in KO/EN/JA. check-discovery439: simultaneous account requests, retries, different accounts, expiry and repeated-question suppression. Android bundle and jarsigner pass; changed modules match bundled files. iOS preparation only, no Mac signing or device tests. New UI/notes EN/JA100%, whole-app coverage not measured.

AAB: C:/Users/Public/drawer-release433/drawer-village-1.0.387-439-public.aab
SHA256 ebfac6d6399edb2c931ee36ad7bc79d96aeb9ea204246e7aa4ce1359dcea76c6
Public plaza remains disabled. 437 was withdrawn from review back to editable pending changes so it can be replaced. 438 remains the last internal release.

## AdMob website verification
Observed live /app-ads.txt served game HTML instead of text. Public web source5ac4797 at421 received only app-ads.txt and build inclusion, committed/pushed main38d3eec. Live endpoint verified text/plain with google.com, pub-2970618408876751, DIRECT, f08c47fec0942fa0. AdMob recheck is external; no claim it is approved. Same file/build support included in dev. No account credentials/payment details were handled.
