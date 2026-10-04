# Internal 514 — home editor bounds and log times

2026-10-04 · Android 1.0.462 (514) · source dev 564aeefa.

## Fixes and evidence

- Fractional simulation minutes were formatted with modulo without truncating the displayed minute. This rendered long decimal times and overlapped log titles. Shared HH:MM formatting now handles generated and previously saved entries in character, home and desktop logs. Exact simulation timestamps remain unchanged; distinct events within one minute remain separate.
- Home editor placement used viewport coordinates inside a potentially translated/clipping advertising container and did not reserve the native home header/back button or safe area. Bounds now account for those regions and convert viewport placement into containing-block coordinates. Up/down movement restores the panel scroll position and clamps all controls into the available area.
- Baseline editor QA fails with a simulated 44px top safe area. Final Chrome and WebKit QA passes on 360x689, 384x768, advertising and 360x420 layouts, checking header bounds, hit targets and furniture addition. Screenshots visually inspected after finding and fixing header occlusion missed by the initial hit test.
- check-log514, check-reported-life, check-routine284 and check-native-platforms passed. Same-minute distinct entries and legacy decimal strings covered. No claim of testing on the reporter's physical Samsung device.
- Common web code and WebKit behavior verified; iOS version metadata remains at submitted512. No new Apple archive/upload or production release in this request.
- No new UI strings required. Store notes KO/EN/JA complete. Existing static coverage EN2250/2983(75.4%), JA2249/2983(75.4%).

## Android release

- Signed release AAB built and jarsigner verified. All634 packaged web assets byte-match prepared www files.
- SHA256: 9aba565116a956d9d9f54c62cc2e6da6819b709dc53597ae64b3239928bebad2.
- Artifact: C:/Users/Public/drawer-releases/drawervillage-1.0.462-514.aab.
- Play internal release387, 514(1.0.462), available to internal testers 2026-10-04 11:03 KST. Prior internal513 excluded. No supported device loss; existing mapping-file advisory only.
- Proof: C:/Users/Public/drawer-releases/play514-internal.jpg. UI proof: editor514-fixed.png and log514-fixed.png in the same directory.
- Main receives release documentation only due to the existing Pages restriction. Runtime source is on dev; taskboard main records completion.

## Previously requested medieval tester access

After bug validation, matched the player's newly supplied login email exactly through Firebase Authentication. Granted only the medieval DLC in a transaction preserving existing entitlements, checked account/deletion state, recorded an idempotent operator receipt and verified the saved DLC. No additional slots, messages or other permissions changed. Account identifiers are intentionally omitted from repository records.
