# Release351 /1.0.318 dev

- Actual full-book !important display style overrode hidden native speech select. Exclude hidden controls from that existing rule, inherit book styling for replacement button and enforce native field visibility. Actual book popup QA passed (not isolated component only).
- Numerical statistics use axis endpoint direction and distance from50; include 0/100 endpoint meanings, exact50 balanced. No vague middle-category labels away from50.
- Shared room access helper for simulation/context/state: everyone accepted; unassigned owners-only room becomes common; assigned private rooms and explicit allow lists stay protected. Contact preflight reports actual contact configuration instead of generic room error in personal context actions.
- updateRoom filters unchanged patches before ownership/sleep reconciliation and timeline invalidation. Closing room editor no longer synchronously serializes whole village; normal debounced save/pagehide flushing remain. Newly mounted book no longer forces zero scroll writes; zero main restore skipped.

## Validation
9chars CPU4x synthetic 350→351 synchronous calls: shop40→39ms, character hub+full425→225ms, town79→60ms, home67→66ms; repeats town49→43ms/home47→44ms/character109→68ms. This does not reproduce user's multi-second shop/photo stalls. Real-device image payload/paint diagnosis remains outstanding; no all-lag-fixed claim.
Actual book hidden select/popup, room everyone/common/private/custom list, unchanged timeline,49.9/50/50.1 stats, interaction/answer durability KO/EN/JA tested. APK/AAB signature and source assets verified. Public comparison340→351; not sent. New strings EN100%JA100%, legacy app not fully audited.
