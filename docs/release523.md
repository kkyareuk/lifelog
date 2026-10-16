# Settings scroll hotfix — iOS 1.0.471 (523)

Base: public522 source 5d1eaf20 plus release evidence 5e71b79d. Apple522 READY_FOR_SALE confirmed by Actions38843514573. No unreleased development is included.

Fix a settings scroll region being replaced during touch/momentum; defer background renders until scrolling is quiet. Use one bounded settings scroller. Remove setting-card content-visibility placeholders that collapse the scroll range during restoration (notifications restored to zero before the card was laid out). Preserve native panning over selects and distinguish drags from taps.

Validation: Chromium trusted touch input across nine settings panes, three sizes (402x749, 874x402, 820x1180), KO/EN/JA. WebKit source and prepared iOS assets pass the same layout/end-access/scroll-preservation matrix with programmatic scrolling. Restoring the old card optimization reproduces the notification-pane reset in the regression test. Character full-settings selection/persistence and scene pinch regressions pass Chromium/WebKit. Native module closure, platform isolation, real-auth isolation, selection continuity and App Store request checks pass. Physical iPhone verification remains unavailable.

No new UI strings. Release notes KO/en-US/ja complete. Overall translation EN2250/2983 and JA2249/2983 (75.4% each).

Android candidate code523/version1.0.471 is prepared to satisfy shared version checks; Play upload awaits confirmation of the highest registered versionCode. Initial iOS CI38845972250 stopped before signing/upload because the shared versionName check caught Android522/1.0.470. Corrected both targets without bypassing validation. iOS523 upload/submission pending. Main web backport is separate because its source differs from the mobile public baseline.
