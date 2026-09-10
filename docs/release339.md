# Android 339 / 1.0.306

Source: dev. Comparison for tester notes: last delivered Android 334 / 1.0.301, including internal web335, memory336, dictionary337, performance338 and context339. This is an APK/AAB delivery, not a Play Console release or iOS submission.

## Implementation

- One anchored interaction dialog on home/town targets. Furniture, room, place and person route to the existing activity engine. The actor is explicit. Edit mode retains placement controls. Menu positioning clamps to the viewport; controls are at least 44px.
- Commands carry an explicit destination through the shared backend. Validate actual furniture, action type, access and occupied bed before creating a directive. Existing movement handles the journey to the target.
- Actual observed conflict, repeated cooking and recent observed home days create questions before the existing profile question pool. Five localized choices per event type, existing ten-minute request interval and locks retained. No offline pop-up backlog.
- Trait targets use the existing bounded 80% current + 20% answer rule. Answers retain an intent used in later conversation narratives; they do not force the other character's feelings or instantly declare reconciliation.
- Event memory is bounded to 120 relevant events / 60 days; observed-day summaries to 30 days and responses to 120. Shared memory travels in the existing life snapshot. No new polling or per-question Firestore collection. This is NOT a permanent archive of every log; full log archival remains a separate pending task.
- New dialog exposes events and choices for the selected character. Existing random profile questions remain available when no event question qualifies.
- Includes prior dictionary cards/editor, listener cleanup, navigation batching, notification readiness and BGM resume-race fixes. See dictionary337.md and performance338 documentation for scope and benchmarks.

## Verification

- check-context339: target access/deletion/occupied bed, event deduplication, contextual questions, answer memory.
- check-shared-context339: actual server life engine preserves selected room, rejects deleted home, serializes event memory and restores personal state.
- qa-context339: 384x854 KO/EN/JA dialog bounds, action execution, no page errors (local auth mock).
- check-dictionary337: shared catalog role permissions, CRUD, conflicts, media and total limit.
- Android asset closure: 111 modules / 316 assets; release assemble and bundle successful.
- Existing check-shared-life fails its expected waiting-title assertion; reproduced identically using unmodified 9473f2c dependencies. Existing check-shared-town-service stops at personal-character-missing in a legacy transfer fixture; no functions code changed by context339. Neither is reported as passing. Existing notification hardcoded-version assertions remain documented in performance338.
- Real Galaxy audio, native notification launch, image-heavy 80-person multiplayer and simultaneous real-account edits still require device testing. Synthetic performance numbers are not a guarantee of lag-free operation.

New user-facing copy: English 100%, Japanese 100%; this does not assert full-app translation coverage.

## Play release notes

<ko-KR>
집과 마을에서 가구·방·건물·캐릭터를 눌러 행동을 고를 수 있어요.
실제로 겪은 다툼과 요리, 최근 생활을 바탕으로 질문이 나와요. 선택은 성향과 이후 대화에 반영돼요.
멀티 사전의 카드 보기와 편집을 개선했어요.
화면 전환과 복귀 시 중복 처리를 줄이고, 알림 진입·배경음 재생 흐름을 수정했어요.
</ko-KR>
<en-US>
Tap furniture, rooms, buildings or characters to choose an activity.
Questions now draw on arguments, cooking and recent daily life. Choices shape traits and later conversations.
Improved multiplayer dictionary cards and editing.
Reduced repeated work during navigation and resume, and improved notification opening and background music handling.
</en-US>
<ja-JP>
家や村の家具・部屋・建物・キャラクターを押して行動を選べます。
実際の喧嘩や料理、最近の暮らしをもとに質問が届き、選択が性格や後の会話に反映されます。
マルチの辞典カード表示と編集を改善しました。
画面切り替え・復帰時の重複処理を減らし、通知からの起動とBGMの再生処理を改善しました。
</ja-JP>

## Discord — copy from here

서랍마을 1.0.306 (339) 업데이트

이번 업데이트에서 변경된 주요 내용을 안내드립니다.

✨ 새로운 기능
- 집과 마을에서 가구·방·건물·캐릭터를 누르면, 선택한 대상 가까이에 행동 메뉴가 열려요. 행동할 캐릭터를 골라 실행할 수 있어요.
- 실제로 겪은 다툼이나 여러 번의 요리, 최근 집에서 보낸 날들을 바탕으로 새로운 질문이 나와요. 질문받기는 기존처럼 10분 간격이며, 관련 사건이 없으면 기존 질문이 나와요.
- 답변은 성향과 이후 대화에 반영돼요. 행동 메뉴의 ‘사건과 선택 기록’에서 최근 관련 사건과 답변을 돌아볼 수 있어요.

🔧 개선 사항
- 화면을 여러 번 오갈 때 쌓이던 불필요한 처리를 줄였어요.
- 캐릭터가 많을 때 집 화면과 메뉴를 여는 처리, 앱에 돌아왔을 때의 갱신을 개선했어요.

🎨 UI/UX
- 멀티 사전도 개인 사전처럼 사진 카드와 검색으로 볼 수 있어요. 내 사전·참여 그룹을 위에서 고르고, 아래에서 사전 분류를 선택해요.
- 권한이 있는 멀티 운영자는 공유 사전 항목과 사진을 편집할 수 있어요.
- PC 웹은 넓은 화면에 맞는 메뉴와 계정·멀티 진입 구성을 제공해요.

🐛 오류 수정
- 화면이 준비되기 전에 알림 내용부터 열리던 흐름을 수정했어요.
- 앱 복귀 시 배경음 재생 요청이 겹치는 문제를 수정했어요.
- 공유 사전에서 동시에 편집한 내용을 덮어쓰지 않도록 충돌 처리를 개선했어요.

## Delivery verification

sharedTownApi deployment completed in asia-northeast3 (only this function). Initial CLI discovery timeout resolved by raising deployment discovery wait; function runtime configuration unchanged. APK signature verification and AAB jar verification succeeded. APK manifest: com.drawervillage.app, 339 / 1.0.306. All 316 packaged public assets byte-match prepared www. Files delivered as flat APK/AAB in workspace 앱 전달.
