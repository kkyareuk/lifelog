Drawer Village 1.0.233 development update — versionCode 262

This is a dev build; production main remains 1.0.215.9 / 259. Not uploaded to Google Play.

New features
- Download character settings as JSON or import them as a new character using an available slot, from Export Profile beside the character name. Individual settings exclude photos, life logs and relationships.
- Download a full settings backup from the same dialog. Full backups include relationships and life records; photos remain device-managed. Restore through the existing backup import in Settings.
- Added Flowers and Miscellaneous Items to the dictionary, including user-created dolls and other objects.
- Manually export/import the entire dictionary. Re-importing the same entries updates them. New entries are limited to 80 per category; existing over-limit data is preserved.
- Added soda, mojito, non-alcoholic mojito, ade and smoothie choices; added loafers, business shoes, Oxfords, Derbies, monk straps, geta, ippon-ba geta, zori and traditional footwear.

Improvements and fixes
- Bedroom ownership and residents' sleeping-room selections now update each other.
- Drink entries use sweetness, acidity, carbonation, caffeine, alcohol and temperature instead of spiciness.
- Multiplayer directory uses the supplied SVG artwork and a three-column layout, with search, owned-group filtering, sorting and a group creation dialog showing available town slots.
- Smaller, wrapping personality keyword text. Updated supplied social thumbnail in web build assets; production website deployment is separate.
- Includes the dev fix for immediate appearance-summary updates and persistence after reload, plus previous dictionary recovery, schedule expiry and population optimizations.

Not included: server-hosted shared dictionaries/interiors, full multiplayer life and relationship proposal notifications, new health or complex family settings. Transfers remain manual. No new BGM was created.

Validated: mobile browser flows, JSON downloads/round-trip, bedroom linkage, 80-entry limits, multiplayer controls, dictionary quota recovery and schedule expiry; Android builds. Physical-device sustained heat and Play rollout remain unverified.
Translation coverage: EN 2158/2846 (75.8%); JA 2157/2846 (75.8%).

Added in 262: Cafe logs now reflect the chosen dictionary drink’s sweetness, acidity, carbonation, temperature, caffeine and alcohol settings, with at most two details per log. Sweetness is compared with the character’s preference. Unspecified properties are not invented, and saved observations survive later dictionary edits. Mixed shop stock selects only drinks. Korean, English, Japanese and actual cafe timeline generation were tested. No new footwear/flower/miscellaneous-item log behavior is included.
