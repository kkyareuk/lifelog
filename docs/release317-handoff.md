# 317 / 1.0.284 — Relationship history and narrative weight

New features are on dev; the deployed app main remains unchanged. Play upload and an iOS archive are not part of this handoff.

## Player-visible changes
- 23 official types including engagement. Each has two dedicated fields (origin and shared routine), each with three options: 46 fields / 138 selections. Five optional first-meeting events are explicit facts, not inferred memories.
- 69 origin passages and 69 routine passages in Korean, English and Japanese. Memory tone uses current/past status, stage, directional feeling/trust/closeness, and narrative eligibility. Moderate strain keeps room for circumstances; severe strain can permit regret. No-emphasis or emotionally neutral views do not get contract regret.
- Narrative weight replaces personal ranking: no emphasis (default), low, normal, high, very high. It changes memory frequency, not affection or automatic care. Existing stored ranks are read through a compatibility mapping.
- Directional memories work in automatic scenes and supported social commands. Solo recollections do not pretend that the remembered person is present. Existing historical log snapshots remain unchanged.
- Person-topic conversations compare the speaker and listener's views of the subject and their relationship with each other. Unrecognized affection softens descriptions without naming attraction. Opposing opinions can produce questions, disagreement, polite distance, or verbal conflict; automatic scenes obey the existing conflict opportunity gate.
- 12 leisure subject families plus an unknown-topic fallback have authored descriptive passages, with restrained expression and mood-sensitive alternatives. Connected to story/video mornings, profile activities and applicable direct commands; existing detailed task copies remain intact.
- Compact information controls for all 16 viewpoint fields and three background fields. Viewing help does not change selections.
- Young adult, adult, middle-aged, mature adult, elderly and legacy senior values use the adult contact gate locally and on the shared server. Unknown/minor ages are not silently treated as adult.

## Verification
- check-relationships317: all 23 types / 138 options / 414 localized option checks; sanitized updates; stage and low-weight exclusions; monotonically increasing narrative frequency; direct subject dialogue; opposing-topic reactions; 13 leisure categories; six adult groups.
- check-shared317: all 23 types saved exactly; malformed details rejected; actual server age gate checked.
- qa-relationships317: 384x832 and 1180x820, every type's fields, type-switch drafts, save/reopen, information button isolation.
- Existing contact316, bedroom315, feedback312, feedback308 (640 directional scenes), shared312, log-settings-audit and log-sync-continuity regressions pass.
- Release bundle signature, all 286 prepared assets and advertising-ID exclusion verified. See release317-build.json for artifact size and SHA-256.

## Translation coverage
New background selections, memory passages and help descriptions are authored in all three languages. Existing-app static coverage: English 2240/2944 (76.1%); Japanese 2239/2944 (76.1%). This is not a claim that the entire game is fully translated or that every legacy line has been replaced.

## Practical limits
Desktop browser and simulated shared-server checks are complete; an installed-device purchase or Play rollout was not performed. These are authored conditional narratives, not unrestricted generated prose. Local changes to settings affect future logs, not historical entries. The standalone first-meeting event is user-selected; no unselected physical contact is invented.

SharedTownApi deployment completed successfully in asia-northeast3. Viewpoint-open and narrative-weight selection were additionally tested at both viewport sizes after fixing the editor container markup.
