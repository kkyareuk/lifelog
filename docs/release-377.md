# 1.0.328 (377) — dev

## Cumulative scope
Compared with iOS 1.0.327 (363), includes committed Android development changes through 376 plus 377. Android production baseline verified as 356 (1.0.323). Build 376/377: restores missing affection entry in the contextual menu; sofa/bed companion selection; distinct non-explicit adult contact narratives in KO/EN/JA; declining reactions and positive-only visual effect; hides home status labels during accepted affection. Autonomous affection honors both characters’ disabled activity settings and no longer excludes an initiator by lexical character-ID order.

Fixes old multiplayer schedule edits/cancellations with departed residents without allowing unknown new IDs or bypassing account permissions. Rest prefers sofa; close characters prefer adjacent seats and strangers prefer empty sofas. Rest settles for the second occupant. Restores excessive seat scaling (chair up to60px, sofa64px), sofa art +8.6%, north chair/character/table order. Includes prior async snapshot saves, bounded native backup payloads, iPhone profile/photo placement scroll fixes, shared-home imports into empty homes, furniture cross-room dragging and linked chairs, diagnostic feedback and contextual question feedback.

## Verification so far
Node contact rules/context destinations/three-language perspectives, old schedule mutation/permission/idempotency, sofa capacity/arrival/familiar vs stranger seats, async snapshot failure/revision/quota tests pass. Chrome/WebKit contextual furniture companion flow and primary-tab smoke pass. Chrome navigation and short-height schedule scroll, speech picker, room access, stale click guard, furniture touch/preview/depth/seat/food, positive effect and hidden labels pass. WebKit profile/placement scrolling and anonymous feedback/shared-home copy pass. These are synthetic browser fixtures, not a guarantee every dialog or physical device is error-free. Character-editor static check corrected for existing credits section and passes; actual settings version card visible in WebKit.

Android377 APK/AAB compiled and signature/version verified. Grouped home interactions and separate bed foreground labels also hidden during accepted affection; declined scenes retain neutral labels without romantic effects. Chrome grouped/bed/sofa rendering assertions pass; WebKit furniture companion selection and primary screens pass. iOS local project checks pass. Store upload, simulator build and submission status recorded after completion; this document alone does not claim distribution.

## Store notes
<ko-KR>
화면 이동·저장과 백업의 안정성을 개선했습니다.
프로필 편집, 사진 배치와 일정 화면의 스크롤을 수정했습니다.
멀티 집 공유 코드 적용과 이전 일정 수정·삭제 오류를 개선했습니다.
가구 이동, 의자 연결과 착석 위치를 다듬고 두 사람이 소파를 이용할 수 있게 했습니다.
게임 안에서 문의를 보내고 질문의 선택지에 구체적인 의견을 남길 수 있습니다.
캐릭터 상호작용과 성격에 따른 반응을 다양하게 했습니다.
</ko-KR>
<en-US>
Improved navigation, saving and backup stability.
Fixed scrolling in profile, photo placement and schedule screens.
Improved shared-home imports and editing or deleting older multiplayer schedules.
Refined furniture dragging, linked chairs and seating, including two-person sofas.
Send support requests in game and give specific feedback on question answers.
Added more varied character interactions and personality-based reactions.
</en-US>
<ja-JP>
画面移動・保存・バックアップの安定性を改善しました。
プロフィール、写真配置、予定画面のスクロールを修正しました。
共有ハウスの読み込みと、以前のマルチ予定の編集・削除を改善しました。
家具の移動、椅子の連結と着席位置を調整し、ソファを二人で使えるようにしました。
ゲーム内からお問い合わせや質問の選択肢への詳しい意見を送れます。
キャラクターの交流と性格に応じた反応を増やしました。
</ja-JP>

New/changed UI and narrative text: English100%, Japanese100% scoped; whole-app translation percentage not measured.
