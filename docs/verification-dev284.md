# Development 284 / 1.0.251 verification

- Development target: origin/dev; operating main and submitted Apple build 16 unchanged.
- Shared life, shared town service (authorization, concurrent commands, throttling): PASS.
- Two isolated browser clients: one command, matching departure/arrival, no additional animation writes: PASS.
- Small-screen activity scrolling, home washing after arrival: PASS.
- Back navigation from relationship/settings/home/town/mailbox, including pending relationship scroll: PASS. Desktop timings are not physical Android measurements.
- Phone and landscape tablet character book sections, multiple touch reactions, multiple accessories, fashion traditional-attire option: PASS.
- Server-backed initial account profile completion, including cached presence writes: PASS.
- Deterministic KO/EN/JA schedule phases and skill-sensitive shared descriptions: PASS.
- Audio fade/mute/volume fallback and mailbox interactions: PASS. Physical audio and WebAudio compressor listening have not been verified.
- Android release APK/AAB built, APK v1/v2 verification, 252 packaged web assets matched; packaged offline boot and saved-character reload passed.
- sharedTownApi deployed. Phase animation requires no per-phase writes; total monthly cloud costs have not been measured.
- UI translation inventory: EN 2216/2912 (76.1%); JA 2215/2912 (76.1%). Heuristic inventory, not a guarantee that all runtime strings are translated.
- Prior legacy notification static-check issues recorded in dev283 remain outside this update's validation.
