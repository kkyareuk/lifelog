# Secrets implementation — started at 503, delivered in 504

503 was uploaded to the artifact library but never provided to testers. Final release: 1.0.452 (504). See release504.md.

## Player-visible changes

- Full character settings have a Secrets page immediately before clothing preferences. Quick settings have a Set up secrets button at the bottom. Phone and tablet book navigation include the page.
- Up to 100 independent secrets per character. Six types: free text, trauma, hidden relationship, hidden preference, hidden identity, secret goal. Free text is quoted verbatim in sharing logs, escaped when rendered, and never interpreted as structured evidence.
- Trauma: 32 past experiences, 36 triggers, three sentence frames, multiple triggers, experience-based recommendations and three reaction intensities. Changing experience keeps manually chosen triggers. Reactions require scene evidence; they do not disclose the hidden cause. Repeated renders do not append the reaction again; pauses between episodes avoid constant reactions. Strong intensity expresses needing a pause; it is not a forced movement or a medical diagnosis system.
- Hidden relationship: another character or 18 archetypal figures, with 21 relationship choices. Hidden identity uses the same archetypes. These fictional secrets do not overwrite the official relationship chart.
- Hidden preference: like/dislike sentences, 48 basic choices plus every catalog category, searchable three-column picker with progressive loading. Deleted catalog entries retain the saved label.
- Secret goal: 10 sentence choices. Each secret has autonomous disclosure controls and an editable list of characters who know it. Runtime knowledge is stored separately from editable definitions, including shared server life persistence.
- Eligible two-person conversations can share a secret based on trust, comfort and tension; never-share secrets stay undisclosed. Both participants get the same event, with separate speaker/listener titles. Other characters do not gain knowledge. Sharing has a 30-minute per-character cooldown. Later conversations can revisit a previously shared secret after 12 hours, at most once per day per partner, subject to relationship comfort/trust.
- Kiss/hug logs now rotate among personality-specific variants. Four expression styles × three initiator variants × two activities, plus 12 listener variants. Romantic/friendly/unresolved-tension context is added separately. Declined contact keeps its existing rejection text and does not advance the accepted-contact counter. Per-pair rotation persists; repainting does not change the current directive's text.
- Short directed activities now count from arrival: wake/get-ready and generic grooming 3 minutes, hug/kiss 1 minute, conversation 3 minutes, comfort and secret conversation 5 minutes. Recipe steps keep their existing recipe durations. Automatic meals continue using existing prepared food/cooking and prefer eligible recipes within five minutes where available.

## Verification

- `check-secrets503.mjs`: catalogs/translations, trust and knowledge isolation, cooldown/reload, repeated scene rendering, per-pair narrative diversity, actual paired directives, morning duration, shared server life round trip and personal-world isolation.
- `qa-secrets503.mjs`: real 360px Chrome and WebKit and 1024px landscape Chrome, trauma recommendations, multiple secrets, character relation, escaped custom content, search/select, reload, English/Japanese, quick shortcut. Both source and Android-packaged assets verified.
- Existing reported501 storage/sleep/companion regression, cooking482 server replay/completion and group-sleep453 schedule/shared activity tests passed.
- Legacy `check-directed-kisses31.mjs` expects an attempted rejected interaction to return false. It fails identically on unchanged 502, which supports a rejection scene. New contact wording preserves that rejection branch; the current rejection-path test passes, while this old assertion is not counted as passed.
- English/Japanese additions: 100%. Existing static screen coverage: EN 2246/2978 (75.4%), JA 2245/2978 (75.4%). This older global measurement does not enumerate all modular narrative strings; the new catalogs verify all three languages separately.
- Android: signed bundle and exact packaged-asset verification. Final delivery details recorded below after Play processing.
- iOS: project/assets/version prepared and local checks passed. No Xcode build, signing, device test or TestFlight upload from Windows.

## Branch and release boundaries

Runtime work is based on origin/dev 756c9c93, branch codex/secrets503. Main still has the pre-existing web deployment wiring, so only release documentation is reflected there. No public/closed-track promotion or in-game announcement.

The deployed shared server baseline is revision 137. Only nine runtime modules belonging to this feature are staged; unrelated desktop-only changes and deployed files remain intact. The staged backend passes the new shared-life tests before deployment.

Full trauma/trigger catalog: `secrets503-catalog.md`.
