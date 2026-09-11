# 355 / 1.0.322 — dev input replay protection

Discard trusted pointer/click events originating before the latest screen/interaction commit. Track rejected gestures because browser synthesized click timestamps can be newer than the original pointer events. No timeout-based UI lock, no pointer-events overlay; fresh input stays enabled. Keyboard clicks and programmatic actions remain supported.

Verified with CDP trusted mouse events timestamped after document creation but before latest interaction: old gesture does not execute new-screen button; next fresh click executes. Book chooser/context regression pass.

Town loop: Chrome mobile viewport384x854, synthetic9characters, auth stub, no user photos, warmup5 plus30 town/home/observe cycles. Post-GC home DOM451/451/450/450; listeners109 throughout; heap6532764/6842508/6868892/6899808. This does not establish a continuing DOM/listener leak. Small heap growth not sufficient to prove leak absence. Final heap snapshot saved in qa-town355. Not Android device measurement. User 2–6 second stalls remain unresolved.

Town lighting already clears its previous timeout. Current home preparation already runs inside simulation batch. No evidence supporting274 as cause. Avoid speculative cache/simulation rewrites.

Attached speech v2 part1 is reference only this release; no claim of35 styles applied. It includes previously removed novel style, which remains excluded per direct instruction.
