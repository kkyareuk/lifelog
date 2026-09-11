# Photo-bearing navigation diagnosis (351)

Local Chromium, 384x854, CPU throttled 4x, 9 cloned characters. Synthetic 512px JPEG (236087-character data URL) assigned to photo and LD fields. This is a deliberately inline-image fixture, not a captured user save or a normal persisted-image restoration test. No external network requests.

Navigation synchronous duration / next paint opportunity (rAF plus timer, not a measured presentation timestamp): shop 65/210ms, character hub plus full settings 423/757ms, town 112/257ms, home 228/311ms; repeats town70/88, home219/291, character155/218. Individual long tasks reached426ms. CPU samples prominently include renderAppContents, render, showModal, garbage collection and localStorage.setItem. The helper afterScreenRender defers execution but does not run it on a separate thread.

Prior small photo-free fixtures did not represent image-heavy use. Whole-root innerHTML replacement rebuilds the current page on each render, including unchanged image elements. Whole-state serialization/storage can also block the main thread. These are measured candidates, not proof that all reported freezes share one cause or that version351 regressed. A larger synthetic run was interrupted without results and is not evidence of app failure.

Next: compare persisted-image and inline-image fixtures, actual click-to-presentation traces, selected-character/visible-scene updates without whole-root replacement, and save timing under normal user media. Preserve pending edits, save durability, ownership and navigation semantics. Physical-device version and traces remain unknown. No production code change or new build in this diagnosis.
