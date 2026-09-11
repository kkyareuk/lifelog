# Game asset WebP conversion

Development change after Android 343 / 1.0.310; no release version bump.

100 tracked raster originals in assets, world-assets, theme-assets and shop-assets were decoded, converted losslessly and compared byte-for-byte as RGBA pixels. 98 variants are smaller. Existing WebP artwork is preserved. Platform icons, splash assets, SVGs and user uploads are outside this conversion.

- Original set: 42,491,806 bytes.
- Prefer smaller original/WebP: 24,072,278 bytes (43.35% reduction).
- Web packaging: 214 literal local references rewritten.
- Android packaging: 224 literal local references rewritten.

Both packagers use game-webp-manifest.json. Remote URLs are not changed. Originals remain available for saved references and dynamic paths; this is **not** a reduction in APK size, and the compatibility copies increase package size. Removing them needs saved-state URL migration and full dynamic-reference coverage first. Excluded high-resolution native source files remain excluded, including their converted variants. Raster dimensions are unchanged, so decoded GPU memory is not reduced.

Validation: lossless pixel comparison for all 100 images; manifest byte sizes; query-string preservation; remote URL isolation; idempotent packaging; web build; native module closure (117 modules). No physical-device performance claim or store submission.

No player-facing strings were added. English/Japanese translation additions: not applicable.

Regenerate with Python + Pillow: `python scripts/convert-game-webp.py`.
Verify: `node scripts/check-game-webp.mjs`.

For the 344 performance release, WebP packaging is opt-in with `DRAWER_WEBP=1`. The default native package retains existing paths and omits newly converted duplicates.
