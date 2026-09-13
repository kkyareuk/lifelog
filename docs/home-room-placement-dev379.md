# Home placement and bathing room fixes — dev after 379

Version remains 1.0.330/code379. The already distributed379 APK/TestFlight build does not contain this subsequent source change. No new app, website or backend deployment in this task.

- Reviewed the supplied377 video using sampled frames. Reproduced the editor shift by moving furniture into a lower room: the old pending-selection scrollIntoView scrolled the overflow-hidden rooms canvas by195px. Removed this automatic ancestor scrolling while retaining furniture selection and the contextual toolbar.
- Bathing room selection now first considers accessible rooms with actual shower/bathtub placements, including rooms whose names/types were customized. Washer/dryer-only rooms do not qualify. Explicit rooms with fixtures and owned equipped rooms retain priority. Access checks remain in force. Existing room-type fallback remains when there is no accessible bathing fixture; this change does not create fixtures or grant access.
- Dish washing and laundry are not reclassified as bathing. No new user-facing strings; existing KO/EN/JA copy is reused.

Validation: scripts/qa-home-room379.mjs on Chrome and WebKit402×820, real catalog insertion and cross-room pointer drag, room/container scroll positions, toolbar availability, bath fixture selection and permission denial. The --baseline-scroll mode reinstates the old scroll behavior and fails with195px of unintended room scrolling. Seventy existing home simulation checks pass. No physical phone/iPhone validation claimed. Common JS applies to web/Android/iOS once a future build is distributed.
