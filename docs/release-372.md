# 1.0.328 / Android 372

## Included
- Shared drag controller caches room/table geometry at pickup; one animation-frame update handles pointer movement. Rebinding aborts previous controller/listeners.
- Preserve preview dimensions and artwork scale. Cycle overlapping items by painted bounds; optional chair/table snapping.
- Editing no longer requests scenes for every character. 13-character, Chrome CPU4x fixture: 65 -> 0 home-card scene requests over five renders. Render samples before [114,525,147,206,157] ms, after [68,137,144,133,136] ms. Synthetic fixture, not a phone promise.
- Sofa scale 1.6 -> 1.75; smaller chair occupant width; lowered seat anchors; honor explicit furniture target.
- Dining table requires a nearby or linked unoccupied chair.
- Shared home code applies house image and remaps accessCharacterIds, retaining destination account ownership and revision checks.

## Verification / limits
- Chrome touch: personal/shared cross-room drag, preview size at 20 points, overlap selection, snapping on/off; scene depth regressions pass.
- Chrome/WebKit: KO/EN/JA anonymous form retries, home-code image/owner/access mapping, chair availability pass.
- Server ownership/revision/atomic rollback and world-package tests pass.
- Async snapshot tests pass, latest-edit/exit/reset preserved. CPU4x 6M-character serialization fixture: synchronous max gap347ms, worker path74ms. This is a regression check of the previously introduced worker, not a new372 gain.
- Legacy check-home-life-simulation stops at its obsolete fixed pet/person z-index assertion; 371 changed this deliberately to depth ordering. Browser depth behavior passed; do not report the entire legacy suite as passing.
- APK/AAB372 built; package/version/signature and selected packaged JS bytes checked.
- iOS372 source/project prepared and static checks pass only. No Mac archive, physical iPhone check or App Store submission.
- Physical phone smoothness and first-entry latency remain unverified. No production app release. New tutorial script remains pending.
- New button text KO/EN/JA complete; whole-app translation percentage not measured.

## User replies (before app rollout)

안녕하세요! 자세히 알려주셔서 감사합니다. 멀티 집에 공유 코드를 적용할 때 집 사진과 출입 허용 대상이 제대로 반영되지 않는 부분을 수정했습니다. 수정 사항은 다음 업데이트에 포함할 예정입니다. 적용 화면에서 방 주인과 출입 대상 캐릭터를 연결한 뒤 해당 멀티 집에 적용해 주세요. 이용에 불편을 드려 죄송합니다.

안녕하세요! 멀티 그룹에서 내 마을로 돌아가도 그룹에서 탈퇴되지는 않습니다. 멀티 화면의 ‘내 마을로 돌아가기’ 버튼으로 이동하실 수 있습니다. 기존 버전에서 복귀 위치를 찾기 어려웠던 점을 개선해 다음 업데이트에 포함했습니다. 불편을 드려 죄송합니다.

## Store notes

<ko-KR>
가구를 옮길 때 순간적으로 작아지는 문제를 수정했습니다.
방 사이 가구 이동과 편집 반응을 개선했습니다.
겹친 가구는 같은 위치를 다시 눌러 뒤쪽 가구를 선택할 수 있습니다.
의자를 식탁에 자동으로 붙이는 기능과 켜기·끄기를 추가했습니다.
식탁은 빈 의자가 있을 때 이용하도록 조정했습니다.
소파 크기와 의자·소파에 앉는 위치를 조정했습니다.
멀티 집 공유 코드의 집 사진·출입 대상 적용을 수정했습니다.
</ko-KR>
<en-US>
Fixed furniture briefly shrinking while being moved.
Improved room-to-room dragging and editing responsiveness.
Tap overlapping furniture again to select the item behind it.
Added optional chair snapping to dining tables.
Dining tables now require a free chair.
Adjusted sofa size and seated character alignment.
Fixed home photos and visitor settings when applying home codes in multiplayer.
</en-US>
<ja-JP>
家具を動かすと一瞬小さくなる不具合を修正しました。
部屋をまたぐ家具移動と編集の反応を改善しました。
家具が重なる場所を再度押すと、奥の家具を選べます。
椅子を食卓に吸着させる機能と切り替えを追加しました。
食卓は空いている椅子がある場合に利用できます。
ソファの大きさと着席位置を調整しました。
マルチの家に共有コードを適用した際の家の写真・入室対象を修正しました。
</ja-JP>
