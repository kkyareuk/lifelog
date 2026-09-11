# Release 345 / 1.0.312

Completes the previously uncommitted interaction work on top of dev 2d6c7b1. Original unfinished worktree files are preserved.

- Context menu: recommendations, same-dialog categories, own-character tasks, no history action or detached activity picker; resize-aware scrolling and a usable close button.
- Directional hug/kiss copy considers personality, personal view/awareness, romantic official relationship and mood where a scene is available. Receiver hostility/fear/guardedness may refuse allowed contact; the initiator gets a temporary negative mood. Contact limits and adult checks remain enforced.
- Hug CSS now connected to the actual house meeting pair, native lineup and standalone house person; reduced-motion preference honored. No AI asset changes.
- Personal discovery answers write a small account-scoped durable delta before closing. Full-state save is deferred; startup replays newer deltas, never recreates deleted characters or overwrites a later manual save. Shared answers still await authoritative server save.
- House preparation and context commands reuse the view scene/timeline cache rather than calculating the same scenes again.
- Includes network recovery fix 2d6c7b1 since private build 344.

Validation: real Chromium 384x854 KO/EN/JA category navigation and one-dialog assertion; actual house hug CSS animation name hug-left; differing actor/recipient directive copy; refusal state; question feedback/mail reopen regression; durable delta replay/reset/deletion/quota tests; multiplayer recovery regression. 80-character local save probe: full save 8.7 ms vs answer delta 0.4 ms (desktop, not user handset).

Limitations: all stutter is not proven resolved. Heavy whole-world saves still occur later; cold simulation and large home rendering can remain expensive. Multiplayer commands retain server confirmation. No claim of zero network latency. Play Console submission is not performed here.

New menu and narrative text supplied in KO/EN/JA (new-copy EN/JA 100%, not a claim about the full legacy app).
