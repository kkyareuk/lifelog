# 1.0.230 / 257 — 200-character population performance

Development branch: `dev`. Production `main` and Play Console are not deployed by this change.

## Changes

- Replace the 64-character signature FIFO with object-lifetime caching. Deleted/replaced characters can be collected without evicting active residents.
- Size the screen cache for two generations of the actual population instead of a fixed 160 entries; use one timestamp per synchronous render.
- Reuse schedules and base scenes within synchronous simulation/render batches. Invalidate scene and date-reservation results when a shared event changes; release all batch caches in `finally`.
- Index relationship pairs and date reservations; reuse unchanged pair scoring instead of repeatedly searching every relationship for every possible pair.
- Coalesce automatic relationship-development saves through the existing save queue. Explicit user saves and lifecycle flushing remain in place.
- Translate three existing home/activity instructions into English and Japanese.

## Verification

- `node scripts/benchmark-population.mjs 200 --verify`: one town, 200 synthetic residents and 300 additional catalog entries. Unchanged signature revisions are never serialized again.
- `node scripts/benchmark-population.mjs 200 --relationships --verify`: add 400 friendship records. Example development-PC run: initial calculation 3552 ms; following passes 814, 556, 560, 532 ms. New relationship development legitimately invalidates individual signatures; steady passes have zero signature rebuilds.
- `node scripts/check-population-cache.mjs`: compares morning/daytime/sleep results with the pre-change engine at commit `6e9c556`, with eight residents and friendships. Also checks exception cleanup, direct-action and language changes after a batch. Requires that Git history commit locally.
- `node scripts/qa-population.mjs`: isolated Chrome profile, external requests blocked, 200 residents in one town; home rendering, settings navigation and save/reload retain all residents. Phone and tablet screenshots. Example home render timings: 463 / 88 / 90 ms.
- Existing character/shared-scene regression (254), multiplayer/layout regression (256), performance checks, Android module/asset closure and iOS cloud configuration checks.
- Web build verified. Android debug APK and signed release AAB built successfully; all 217 prepared web assets match the final signed AAB byte-for-byte. AAB SHA-256: `90F131C141A93C37345A154A29F625CCFF8CC2CF2F55C2F85919813D25D8F5F2`.
- Final dense-fixture run after invalidation review: 3138 / 736 / 623 / 527 / 510 ms; zero signature rebuilds in the final two passes. Basic 200-resident run: 647 / 176 / 179 ms.
- iOS uses the shared source change; no signed IPA, TestFlight upload or physical iPhone/iPad test was performed.

These are synthetic desktop/Chrome measurements, not Android or iPad hardware frame-rate measurements. Large photo libraries, old accumulated histories, dense all-to-all relationships, prolonged battery/thermal behavior and backend sync under real load are not covered. No character cap is imposed or characters discarded. Two hundred occupants of one room can still visually overlap; this change targets computation rather than house layout.

## Translations

Static UI coverage: English 2103/2794 (75.3%); Japanese 2102/2794 (75.2%). Three added translations complete in both languages. This is not whole-story translation coverage.

## Release notes (development build)

### 한국어
- 캐릭터가 많은 마을에서 생활·관계 계산을 반복하던 부분을 줄였습니다.
- 여러 캐릭터가 대화할 때 자동 저장이 연속으로 발생하던 부담을 줄였습니다.
- 집과 행동 선택 안내 일부의 영어·일본어 번역을 보완했습니다.

### English
- Reduced repeated activity and relationship calculations in towns with many characters.
- Reduced repeated automatic saves when characters interact.
- Added English and Japanese translations for several home and activity instructions.

### 日本語
- 人物が多い村で、生活や関係の計算が繰り返される負荷を軽減しました。
- 人物同士の交流時に、自動保存が連続して発生する負荷を軽減しました。
- 家と行動選択に関する一部の案内に、英語・日本語訳を追加しました。
