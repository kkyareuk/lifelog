# Internal 419 · 1.0.367

## Changes
- Recruiting games without meeting history can load again, including empty and joined lobbies.
- Beds offer sleep, nap, rest, reading and sleep routines. General sleep respects the assigned bedroom and selects an available bed. Single/legacy beds now use the actual layered furniture rendering path rather than the social walker path; semantic sleep is preserved during arrival.
- Bookcase and plant art enlarged 20%. Flooring and wallpaper use actual texture thumbnails.
- Home details show one representative interior photo with a smaller, separately selectable exterior icon, matching building details.
- Home Plaza uses the bordered plaza from the supplied sprite sheet (original pixels cropped from illustration 20260820 (20), rectangle 110,4070,480,4390, alpha-trimmed).

## Verification
- check-home419: recruiting without history; sleep/nap/rest on all bed variants, KO/EN/JA.
- qa-home419 Chrome and WebKit: actual app native home, own-bedroom bed selected, anchored single-bed occupant, one interior photo + exterior control, all 5 floor/7 wall images decode and selections update stored controls.
- check-needs418 and check-meeting418 pass (continuous needs, furniture restrictions, meeting and night-cycle regressions).
- Native module closure and 408 packaged assets pass.
- Old check-home-surfaces still rejects the furnitureSprite API introduced in earlier releases; it is not a valid check for the current user-drawn furniture system. Actual surface assets validated in browser instead.
- No physical-device test. New/changed localized labels EN/JA complete; overall legacy translation coverage not measured.

## Delivery
Android signed AAB verified and released to internal testers (Play release311, September 16 19:46 KST). sharedTownApi deployed successfully. Apple internal TestFlight run35086501411 is still building/uploading. No public or website deployment.

## Store notes
<ko-KR>
놀이 모집 화면을 불러오지 못하는 오류를 고쳤어요. 침대에서 잠자기·쉬기 등 다양한 행동을 고를 수 있고, 잠잘 때 지정한 방과 침대를 사용하도록 수정했어요. 1인 침대의 잠자는 위치와 이불 겹침을 고쳤어요. 책장·화분을 키우고 바닥·벽지를 그림으로 골라 볼 수 있게 했어요. 집 정보는 대표 내부사진과 외형 아이콘으로 정리하고 광장 그림을 교체했어요.
</ko-KR>
<en-US>
Fixed games failing to load while recruiting. Beds now offer sleep, rest and more, and sleep commands respect the assigned bedroom and bed. Fixed single-bed sleeping placement and quilt layering. Enlarged bookcases and plants, added visual floor and wall choices, and updated home details to show one interior photo plus an exterior icon. Replaced the Plaza artwork.
</en-US>
<ja-JP>
募集中の遊びを読み込めない不具合を修正。ベッドで睡眠や休憩などを選べるようにし、指定した寝室とベッドで眠るよう修正しました。シングルベッドの寝姿と掛け布団の重なりを改善。本棚と鉢植えを大きくし、床と壁紙を画像で選べるようにしました。家の情報を代表内観写真と外観アイコンに整理し、広場の絵を変更しました。
</ja-JP>
