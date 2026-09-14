# Development 1.0.336 / code 388

Date: 2026-09-14. Based on dev 649606c. Native build tag: 20260914dev388.

## Changes

- Character slot usage appears directly below Selected as used/total.
- Automatic conversation no longer falls back to the entire catalog when the speaker has no favorites. Removed housemate-hobby exploration from the home activity pool; art, games, collecting and gardening require matching personal interests.
- Home status cards use a foreground UI layer. Actual painted furniture bounds account for transparent image padding and the separate bed overlay. Cards stay within room/viewport bounds; north table seats move upward by 16% of character width.
- Awake characters using the same table, sofa or bed can share a furniture encounter. Individual logs retain each character's perspective and common event identity; seated status cards combine names. Sleeping characters, explicit schedules, direct commands and blocked conversations are not replaced.
- Five need satisfaction values (sleep, hunger, toilet, hygiene, social) decay with elapsed time and recover from observed corresponding activity. Initial values are 80/100. Offline decay is capped at 24 hours; recovery is credited only to the previously observed activity, at most ten minutes at a time. These meters track life activity; they do not override schedules or introduce penalties.
- Full settings page 10 contains needs, relationship policy and activity restrictions. Freeze needs preserves current values. Relationship policy has three choices: freeze scores and relationships; scores change with relationship/stage fixed; scores and relationships change. The stricter partner policy applies, while manual relationship editing remains possible.
- Shared life serialization preserves need values. No live multiplayer server deployment was performed.

## Verification

- check-life388: need decay, recovery, freeze, backward time and value bounds; policy precedence and shared furniture identities.
- qa-life388 in Chromium and WebKit: KO/EN/JA dialog layout/save, persisted settings after reload, all relationship modes and partner freeze, duplicate-event protection, catalog isolation, shared table encounter, shared sofa status card, slot location and bed card foreground/viewport bounds.
- check-needs386 and home-life simulation (70 checks) passed. Existing qa-needs-bed386 updated for the additional freeze checkbox.
- Android web preparation, module closure (145 modules) and asset inclusion (364 assets) passed. Web preparation passed (144 modules).
- iOS native project check could not complete: GoogleService-Info.plist is absent from this isolated checkout. WebKit coverage is not an iPhone/iPad device test.
- No APK/AAB/IPA was built or uploaded. No website or store deployment, promotion, user announcement or Discord posting was requested/performed.
- New UI strings: English 100%, Japanese 100%. Existing whole-app/log translation coverage was not measured.

## Prepared release notes

<ko-KR>
선택됨 아래에 사용 중인 캐릭터 슬롯/전체 슬롯을 표시해요.
설정과 무관한 취미가 자동 행동에 섞이던 경로를 수정했어요. 이름상황표가 가구 뒤에 숨거나 화면 밖으로 나가지 않도록 정리하고 북쪽 의자 위치를 조정했어요.
같은 가구에 앉아 있는 캐릭터의 공동 상황표와 개인별 상호작용 로그를 연결했어요.
전체설정 10페이지에 수면·허기·용변·청결·사교 충족도, 욕구 고정, 관계 점수와 관계 변화 3가지 설정을 추가했어요.
</ko-KR>
<en-US>
Character slots now show used/total below Selected. Fixed unrelated hobbies entering automatic activities. Status cards appear in front of furniture and stay on screen; north-facing table seating is adjusted. Characters sharing furniture can interact, with a shared status card and individual logs. Full settings page 10 adds five need meters, Freeze needs, and three modes for relationship and score changes.
</en-US>
<ja-JP>
選択中の下に使用枠数/合計枠数を表示します。設定と無関係な趣味が自発行動に混ざる経路を修正しました。名前と行動の表示を家具より手前に保ち、画面外へのはみ出しと北側の椅子の位置を調整しました。同じ家具に座る人物の交流を共通表示と個別ログに反映します。全体設定10ページに5つの欲求充足度、欲求固定、関係とスコアの変化を選ぶ3つのモードを追加しました。
</ja-JP>
