# 2026-09-12 reports — dev only, no new binary

- Authoritative Firestore document IDs now override embedded legacy IDs in shared snapshots and server simulation rows; schedule group shortcuts retain their original world context. The reported account/group data has not been inspected; resident-missing could also mean a genuinely removed resident. No permissions bypass.
- New owned clothing enters its owner inventory; editor wardrobe remapping return values are retained; fashion gifts include wardrobe definitions and respect the30-item capacity atomically. Server deployment pending.
- Daily-choice answers and chosen schedules have a compact durable journal before deferred full save; replay restores unfinished saves after restart, newer full saves win. Mail already has its own answer ledger. Actual user restart reproduction pending.
- Save-stage timings added. Town snapshot cloning avoids serializing photo strings just to clone them. Synthetic9MB desktop test41ms -> <1ms; this does not prove reported Android3–4second stalls fixed.
- Commute modes already exist; car use still requires both driving ability and a usable household car.
- Added unable-to-sleep and no/rare eating options, scene wording adjustment, exposed existing healthOther input in current health page. No species/deceased feature.
- New EN/JA labels and scene copy complete; whole-app translation percentage not measured.

Validation: check-reports365, answer-journal345, wardrobe330, routine284, mail348, membership-roster364, shared-travel364 pass; changed JS syntax checks pass. No APK/IPA built, no server deployment, no customer message sent. iOS1.0.327/363 unchanged.

## Furniture art and mobile follow-up (2026-09-12, dev; no version bump)

- Imported original transparent PNG crops for chairs, sofa, table/desk and single bed. Crop manifest records original rectangles; alpha and RGB pixels unchanged. Existing composite double bed remains intact.
- Rotation selects supplied directional art. Relative art sizes use the single-bed source width as reference; existing placement sizes remain adjustable.
- Home furniture/people now share a stacking context; village/home artwork bottoms determine order. One scheduled layout read after resize/render/placement, no frame loop or image pixel scanning. Old manual layer buttons removed.
- Rear chair uses separate seat/frame artwork; frame can overlap a table while the seat remains behind it. Using-chair agents are positioned at the chair. Physical-device animation verification remains necessary.
- Local photo initialization skips already-persisted images and deduplicates shared strings. Town switching avoids photo JSON roundtrips. Furniture placement edits and post-hydration save use deferred storage.
- LD/profile photos were not migrated into inventory or changed by these fixes. Wardrobe synchronization uses inventory.fashion and catalog definitions.
- QA: original art loading, directional selection, chair-frame/table ordering, saved rotation after restart, error-free home/town navigation pass at384x854. CPU4x synthetic one-character navigation50–234ms (two animation frames); NOT evidence that customer Android3–4second stalls are resolved. Prior photo-safe copy and input-save regression checks pass.
- No new user-facing text; EN/JA existing labels reused. Overall translation completion not measured. No new APK/IPA or production deployment.
