# Development 283 verification

- Android versionCode 283 / versionName 1.0.250. Gradle assembleRelease and bundleRelease succeeded.
- 250 prepared assets match the signed AAB byte-for-byte; bundled main-theme.mp3 matches the supplied asset.
- APK v1/v2 verified, AAB jar verified. Standard self-signed Android upload certificate/JAR metadata warnings remain.
- Extracted APK: offline startup, no missing JS/CSS, saved-character reload passed.
- Browser: unread home badge, read and accepted labels, open-letter background stability, backdrop input isolation, audio one-player lifecycle/volume/zero/mute passed.
- Two isolated browser accounts using the server engine: common activity chooser, departure, same route, waiting and arrival passed with one command request and no animation writes.
- Server engine: talk-to-solo-read cancellation with a stale target, reverse initiator movement, shared meal identity and scheduled care boundaries passed. 200-character fixture completed in 342 ms (test-machine measurement, not phone latency).
- Relationship viewpoint/emotion and log continuity checks passed.
- Older check-character-notifications.mjs has three pre-existing static expectations failing (schema wording, system-bar implementation, old build number). No claim that the whole legacy suite passed.
- sharedTownApi deployment succeeded on 2026-09-09.
- Read markers persist per account on this device, not between devices. Proposal acceptance/rejection is server state.
- UI coverage heuristic: EN 2198/2894 (76.0%), JA 2197/2894 (75.9%). New controls and messages have KO/EN/JA copy.
- No physical-device heat/latency, real-device audio or production billing measurement. Web and submitted Apple build16 unchanged; operating main unchanged.
- AAB SHA256: A8FC7113F4E3060172A34D3C5DE2B7C3DEE294A834B186D3D992D28F496D18A8
