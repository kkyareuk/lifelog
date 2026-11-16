# Public 1.0.479 (531)

Explicitly authorized 2026-11-16. Isolated from released528 e5c94670 plus feature commits 74bb4a09 and 0f3a56d1. Excludes unrelated desktop/dev changes. Resolved views.js import by including only sceneImageFor/sceneImageCopy, not desktopVillageCopy.

Chrome/WebKit three-language help QA and image fallback tests passed; Android assets/module closure and iOS project preparation passed. New EN/JA text 100%; total-app coverage unmeasured. Android signed AAB uploaded to production release52; review requested and Google prechecks running. Existing API23 fallback467 retained; no supported-device loss. AAB SHA256 C24D2A2633BD1043A85E0337A56ED2508F2EF76FB86B136A80991816241AE089. Apple initially blocked access due to agreements; owner accepted updated agreements and upload preflight succeeded. Mac archive/sign/upload run43829818124 in progress. iOS review submission is pending.

Release notes include both 529 image/GIF features and 530 clothing help since public528. In-game notice must wait for actual platform availability and deduplicate against notice528.

## Final submission status · 2026-11-16
- Android production release52: Google prechecks completed; now under review. 100% rollout after approval; managed publishing disabled. Evidence C:/Users/Public/drawer-releases/play531-review.jpg.
- iOS signed archive and IPA validated and upload accepted in run43829818124; only post-upload status fetch failed. No duplicate binary upload.
- Apple prepare43830861982 succeeded, build531 VALID; submission43831317406 succeeded with WAITING_FOR_REVIEW, AFTER_APPROVAL. Version ID81f6e82f-cbba-472c-be3e-e0aca223c07f; build IDaea8f89a-e661-4349-8b7b-72753379d6be.
- Actual shipped source pinned to133e7a786b1553c4497a41d7331eeacdf49be26b. Workflow report source5860a7af is the dispatching dev workflow commit, not checked-out app source.
- Neither store is confirmed publicly live yet. Notice draft retained; daily release follow-up recorded without duplicate upload or notice.
