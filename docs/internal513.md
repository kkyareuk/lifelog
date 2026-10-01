# Internal 513 — seven-day mobile timetable

2026-10-01 · 1.0.461 (513) · application dev 75c3e417.

- Replaced the 192px minimum day columns with seven equal flexible columns and a 26px time rail. Sunday through Saturday fit without horizontal scrolling.
- Small screens display complete compact category labels inside the blocks. Full titles, times, participants and notes remain accessible through each event and the full daily agenda. Desktop keeps the detailed grid labels.
- At most two overlap columns and manually added schedule priority remain unchanged.
- Updated explanatory text and compact labels in Korean, English and Japanese.
- Chromium/WebKit actual app QA passed, including widths320/360/393/430, all seven day headers inside the scroll viewport, shared schedules, manual schedule priority, two overlap columns and third event retained in the agenda. check-timetable-access and check-native-platforms passed.
- Android app sync, signed Gradle AAB and all633 packaged web asset byte comparisons passed. SHA256 1a4f21ef3bea85b694a51fc685f4a1104b5e37d79dce075973bf46e4848cb4f7.
- iOS shares the layout fix and WebKit QA, release metadata stays at the submitted512. No new Mac archive, TestFlight upload or production submission in this request. Existing512 production reviews remain unchanged.
- New UI/notes KO/EN/JA complete. Existing static translation coverage EN2250/2983(75.4%), JA2249/2983(75.4%).
- Screenshot C:/Users/Public/drawer-releases/timetable513-mobile.png. KO/EN/JA store notes: play513-notes.txt.
- Main receives documentation only under the repository's existing Pages restriction. Taskboard records version and final internal release state.

## Verified release

Google Play internal release386, 513(1.0.461), available to internal testers at 2026-10-01 14:30 KST. Same supported devices as512. Existing mapping-file advisory only; no blocking errors. Proof: C:/Users/Public/drawer-releases/play513-internal.jpg. No production promotion or change to the pending512 reviews.
