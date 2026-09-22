# Drawer Village internal 1.0.420 (472)

## Scope
- Bottom Multiplayer replaces Plaza while retaining its fountain icon. Right-side multiplayer shortcut removed; residents live in multiplayer settings.
- Plaza games (including mafia and court dialogue minigames) removed from UI, packaging and API routes. Existing saved records are retained; multiplayer story/rank settings remain.
- Left wallet/work shortcuts move higher and use the plaster-bust menu icon. Default character views use the same bust.
- One Cooking screen, three-column icon cards, ascending price or level sorting. No AI-generated artwork included.
- Supplied simplified 100 recipes +40 convenience +20 gourmet +20 fantasy =180. 99 staple +30 fantasy ingredients, all referenced. Recipe costs derive from ingredient prices. Existing cooking inventory/jobs survive the recipe revision, including retired bean-sprout soup.
- Four to six progressive steps per recipe. New playback stages last 8–180 seconds (within the requested 3–180 range), based on action; ordinary activity title/body with no step counter.
- Boiling volume multiplied by1.6 within the user volume limit; added original procedural mixing WAV. Existing supplied cooking audio retained.

## Verification
- Node: ingredient integrity,180 distinct recipes, eight cuisine groups, EN/JA coverage, stage boundaries, shared start/persistence/replay billing/once-only completion and personal-world isolation.
- Retained court-world rank permissions and profile round trips passed; obsolete game assertions removed.
- Chromium and WebKit360px: icon grid, sorting, cooking detail/start/reload/completion; navigation/bust/left rail; multiplayer resident list/detail/back interactions. Screenshots inspected; embedded resident layout corrected.
- Packaged offline boot and save reload passed; all531 packaged assets match signed AAB byte-for-byte.
- Device listening, physical Android device and signed iOS checks were not performed.

## Delivery
- dev feature work; main receives documentation only because its older web deployment must not receive dev features.
- AAB: C:/Users/Public/drawer-releases/drawervillage-1.0.420-472-internal.aab
- SHA256: 6BD483A1932894E0A08CCE12FD8698EB0F1EC32D478CEF430A7068CB7E73DAC6
- Play internal release351: upload in progress. Production and Apple not submitted for472.
- sharedTownApi: selective actual-production baseline111 patch, new revision sharedtownapi-00112-jef, updated2026-09-22T11:10:45.092014321Z. Re-downloaded all161 files byte-identical to prepared package; retired game modules absent. Other deployed functions preserved.

## Translation
Static catalog: EN2256/2984 (75.6%), JA2255/2984 (75.6%). All180 dish names,129 ingredient names and new UI have both languages. Cooking-stage text uses localized action/ingredient templates; this is complete display coverage, not a verbatim translation of every source sentence.
