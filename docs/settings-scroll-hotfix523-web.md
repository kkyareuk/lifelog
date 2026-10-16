# Web settings scroll hotfix (2026-10-16)

Base fbeb7655 (existing main / GitHub Pages), separate from mobile public522.

Backport only the bounded single settings scroll region, accurate setting-card layout and deferral of background rendering during pointer/momentum scrolling. The older web app has eight settings panes and no selection-popup module; no new menu, popup or mobile release features were imported. Bump the service-worker cache identifier for the web fix.

Chromium trusted touch: all eight panes across KO/EN/JA and 402x749, 874x402, 820x1180 pass scrolling during a background refresh, retained scroll position and last-item reachability. WebKit passed the same matrix using programmatic scrolling. Physical-device tests were not performed. No Android or iOS version number is changed on main. Mobile hotfix a76f6395 and its release metadata are on dev, rooted at the released522 source.

GitHub Pages built acefeebe successfully. The custom domain is separately served and still returns its previous app shell for the new module URL; do not report the public domain updated or deploy a mismatched web baseline. Main contains the fix; Cloudflare deployment is not performed by this mobile hotfix.
