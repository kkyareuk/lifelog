# Public recovery release 1.0.470 (522)

User explicitly authorized Android production and iOS review submission on 2026-10-15. Baseline public520; runtime identical to tested internal521 (fa5e1e22). New build is required because iOS521 is internal-only.

Recovery tests passed on Chromium and WebKit, including same-account filtering, read-only search, stale selection rejection, restore/reload, missing/failed reads, KO/EN/JA and storage-full protection. Reporter device data has not been accessed or recovered.

Submission pending. Main remains unchanged because it is older and connected to GitHub Pages. Release commits go to dev.

## Build evidence
- Android Gradle bundle succeeded; jarsigner verified. All628 packaged web assets match prepared source. SHA25632d76b604e341d656353bb6091e3180dc57548e582443b327b900ce47a552420.
- App Store eligible request consistency and submission-script syntax checks pass. CI run38691096724 builds source5d1eaf20.
- KO/EN/JA release notes complete; new recovery UI translation100%; overall EN2250/2983 and JA2249/2983 (75.4% each).

## Android submission
Internal release395 confirmed available2026-10-15 15:17KST. Production release47 submitted at100% to all existing target countries; retained legacy467 for API23 and replaced520. Zero supported-device loss. Only existing missing-mapping advisories for467/522. Publishing overview confirms522 under changes in review, automated quick checks still running; managed publishing disabled (automatic after approval). Screenshot C:/Users/Public/drawer-releases/play522-review.jpg.
