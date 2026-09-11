# 352 / 1.0.319 — image rendering cost

User confirmed 351 Android stalls on actions while music continues. This does not prove network or CPU causality alone.

Views image src attributes now use memoized blob URLs for inline images. Durable character data, saves and exports retain originals. Cache is limited to 128 entries / 32MiB of source strings (blob memory is additional); at the limit rendering falls back to the original source. No unbounded allocation or asynchronous image-state mutation. Remote URLs unchanged.

9-character synthetic inline JPEG, Chromium CPU4x: home synchronous228→126ms, repeated219→104ms; next paint opportunity311→250ms and291→194ms. Initial character hub+settings366ms / paint opportunity828ms versus423/757ms baseline: initial-presentation improvement NOT established. Shop64/215 versus65/210ms: unchanged. These are not physical-device or real user data. Full-root rebuild and whole-state save remain work to do; no all-stalls-fixed claim.

Validated image decode, URL reuse, original save contents, IndexedDB restoration, remote URL passthrough, real visible shop button click after acknowledging the tutorial, real speech picker, common/private room rules. Early click test attempts were blocked by a hidden legacy nav and then the tutorial modal; corrected visible-player route passes. Android APK/AAB built, signature and packaged asset parity checked. No Play/web deployment or announcement sent. No added player text (EN/JA not applicable).
