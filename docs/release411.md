# Public hotfix 411 / 1.0.359

Base: public405 (7e85e81), confirmed in Play Console on 2026-09-16. Apple405 is waiting for review, not a completed public release.

Scope: home activity entry, bounded resident popovers, shared restriction draft synchronization, owned shared notification roster, authorized orphan group deletion, vacant-bed fallback with explicit-room priority, shared label overlay and duplicate actors, unsafe chair placement.

Validation: Chromium and WebKit popup tests in KO/EN/JA, including 360x648, 384x832 and shortened viewports; shared restriction save/reopen; roster ownership; empty-bed and explicit-room priority; 70 home-life checks; seating375 and seats391 integration tests.

Legacy check-character-notifications has four pre-existing assumptions/failures (schema31, speech transformations, status bar and old build number); this is not a clean pass. Shared characters receive authored check-in messages, not fabricated personal-world life logs. Only loaded multiplayer residents can be added from the current roster.

Deployment: pending. Public plaza remains disabled. Dev fixes must be ported without replacing ongoing feature work. New/changed copy supplied in KO/EN/JA; full-project translation coverage has not been measured.
