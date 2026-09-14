# 1.0.338 / 390 内部测试

- Branch: dev. Release 287 uploading to internal test; final availability recorded below after Console confirmation.
- Report 94f4aa14-09d5-4e68-9859-dea14c1ff2d4: valid discovery answer can have no trait delta when its affected axes are locked. Keep locked traits and record the answer; stale answers no longer masquerade as storage failures.
- Name cards: removed conflicting relative-position rule from detached UI labels; screen-space placement avoids actor art and earlier cards. Offscreen actors are not pulled to viewport edges. Seat positions are measured before label placement. When a room has no collision-free space, chooses least overlap.
- Relationship scores continue according to selected policy; formal relationships change only after a proposal response. Pending/declined/later states persist; policy, age and family guards rechecked. Housing/family proposals require the existing editor, not silent home or registry mutations. The 16-text catalogue is not a claim that all 16 triggers are enabled.
- Character Profile emphasis; detailed settings optional. Removed six-month disappearance reassurance sentence.
- Supporter credits: removed build-specific preview filter; public server and offline fallback now have 7 approved public names. Four pending entries reviewed against existing support entitlements and approved. No account identifiers in this record.
- Five reviewed voices × 38 entries × 3 languages = 570 strings. Existing supplied Korean relationship voices are also retained. New five voice catalogue and changed UI: EN/JA 100%; entire app translation coverage not remeasured.
- PDF: output/pdf/drawer-village-dialogues-390.pdf, 51 pages. Scope is the five revised voices, not a claim that all supplied source appendices were fully retranslated.

## Validation
Chromium and WebKit: locked noise answer saves without changing locked trait; proposal/reply/close/idempotence/reload; fixed relationship; 570 entries and aliases; profile and seven credits. Life UI: needs/locks/shared furniture/bed edge. Occupant UI: crown and direct interactions. Stacked-name-card regression at 384×832 and 384×600. Existing discovery and simulation checks passed during development.
Android bundleRelease successful; jarsigner verified; 369 prepared assets match bundle byte-for-byte.
SHA256: ACF0DB2C42B9680901A1B4C58ED9BF0E581F8A5F4F1046B25FDFA01D85626975

## Deployment
Pending final Console availability verification.
