# 1.0.339 (391) 내부 테스트

- Development branch dev. Release288 prepared after internal390; no production or closed-track promotion.
- 하오체/하게체 replace the scholar variants. Old saved keys migrate through canonical aliases. Startup and internet-novel labels excluded from choices; existing values map to business/casual styles.
- Regional labels: Scottish accent / Southern US accent, 大阪弁 / 広島弁. Classical voices: Classical orator / Old-fashioned mentor, 古風な丁寧口調 / 古風な語り口. Four voice sets, 38 entries each, 3 languages = 456 strings. PDF 41 pages.
- Strong authored profanity softened to mild wording. Cached character notification mail softened when read; future envelopes softened before scheduling. Player-written mail is not rewritten.
- Meeting walkers use data-person: context-menu capture no longer steals these clicks from character-detail handlers.
- Shared furniture cards group by same seat or same table; generic co-location keeps individual activity logs. Actual shared interaction ID displays conversation. Seated sprite sizing increased about 10–15%.
- Official update announcements do not use sender/user photo fallback. Personal mail keeps its images.
- Relationship village switcher is one compact selector; return button only when visiting a multiplayer village.

## Checks
Chromium/WebKit interaction391: execute talk then dispatch click on the real meeting-walker; correct character popup, no context furniture menu. Three language occupant geometry/crown/actions. Cached profanity and official/private mail photo checks. Aliases and labels checked. Independent shared-seat card tested without shared interaction metadata; individual simulations no longer forced into conversation by co-location. Android release build and signature verified; 370 assets match bundle byte-for-byte.
SHA256: 5673EC3067F6769A97C7D6C439AB6AE71BBDFD12F235D05F00E681B1BE01DBD0
EN/JA: 100% of changed scope; whole-app coverage not remeasured.

## Deployment
2026-09-14 18:16 Asia/Seoul: Play Console shows 391 (1.0.339), 내부 테스터에게 제공됨. Release288. No supported-device losses; only the existing missing deobfuscation-map warning. Implementation bde4cdb pushed to dev.
