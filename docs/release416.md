# Internal 416 · 1.0.364

Final build for the activities/needs/furniture request. Includes all changes and KO/EN/JA notes in release415.md.

The final coverage test compares the picker against every pre-existing DIRECT_ACTIVITY_GROUPS action as well as every LIFE_TASKS entry. It detected uncategorized social options such as take_pause. These are now reachable through More interactions, and future uncategorized options remain reachable. Chromium and WebKit tests pass for all original actions, all life tasks, actual hug command and three-language layouts.

Android: building signed AAB. Apple: internal-only upload requested. Production and public website unchanged.
