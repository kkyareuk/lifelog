# iOS361 / Android360 — 1.0.327

- Restore retries are no longer permanently blocked by a previous restore failure. Optional account refresh cannot fail an otherwise successful restore. Unverified unfinished transactions still block another charge.
- Purchase errors show a bounded reason/stage; own sandbox entitlement reads remain UID scoped. Character pack, single character, town and support product tests pass, with idempotency and refund checks.
- Settings and shop show linked login providers. Game login and App Store purchasing identity are separate. Native Apple provider registration added to avoid an absent handler; actual Apple capability/signing and device reauthentication are not established by this change.
- Account deletion shows reauthentication/preview progress, cancellation and timeout/error state; local records are retained until confirmed deletion. No real account was deleted for QA.
- Bulk autosave waits for 350ms without input. Answer journal remains immediate; explicit/lifecycle saving is not delayed. Listener cleanup and delayed/immediate save tests pass.
- Synthetic nine-character/photo CPU4x answer test: saved response 43ms; navigation paint 85–435ms. User's multi-second Android356 freeze was NOT reproduced or established fixed.
- Android release signed; 331 bundled assets matched source preparation. iOS public release readiness remains false pending device QA. New KO/EN/JA copy complete; overall translation coverage not measured.
