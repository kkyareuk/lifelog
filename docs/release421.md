# public421 · 1.0.369

Needs updates now run after all scene branches, including manual commands and policies. Semantic activity/task IDs drive recovery; travel gives no recovery; directives bound recovery to their end time. Room activity switches default to all allowed and persist with room data, filter furniture menus, enforce commands and automatic room routing.

Chrome and WebKit actual command + clock tests: sleep/eat/wash/toilet continuous recovery without duplicate credit, default room permission, empty room permission, allowed room routing, policy during active commands, editor and persistence after page reload. No physical-device test. New EN/JA copy complete; overall translation coverage not measured.

Android preparation now reads channel metadata for Android as well as iOS. Prior internal420 upload verification missed that its bundled flag was public; corrected and artifact gate verification required in this release. Public games remain Coming Soon.

Delivery pending.
Shared-server command/snapshot recovery and blocked-room tests pass. Existing check-shared-life.mjs meal-location assertion also fails on unchanged 420 baseline; not counted as a passed regression.
