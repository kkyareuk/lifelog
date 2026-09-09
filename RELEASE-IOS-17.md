# iOS 1.0.260 (17) — TestFlight candidate

- Android293 game source747de94 merged into iOS15641be; current game features retained with native Apple auth and StoreKit adapters.
- macOS Actions34313516893 succeeded: archive, code signature, IPA export, Apple validation and upload.
- App Store Connect shows upload completed for build17, ID f0104b07-f52c-4f14-b6ed-989ab9da121e. CI status queried before the record became visible returned null; the later browser record confirms processing completed.
- Export encryption response saved after checking the app uses platform networking/security and SHA-256 media hashing, without a custom encryption implementation.
- The existing App Review submission remains rejected on1.0.215(16). No resubmission or public release was performed.
- Physical-device QA/video and user-generated-content report/block flows remain required before resubmission. This candidate is for testing.
- Local Android and iOS bundled-file startup and saved-character reload checks pass. They are not physical iPad testing.

- Final ASC UI: existing internal group `나만 테스트` includes17; tester status displays installed1.0.260(17) on an iPad. This is ASC installation telemetry, not completed functional QA or the requested recording. No extra testers or external group were added.
