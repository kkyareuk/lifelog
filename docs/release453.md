# Internal 1.0.401 / 453 — September 19, 2026

Approved dev scope: supplied title artwork, house/town pinch zoom, group activities (3+ people), configured sleep hours and bed placement, settings scroll and input investigation. Existing public Android451 and iOS451 review candidate are not replaced automatically.

## Changes
- Original SVG background, title and drawer coordinates retained; live sign-in/guest or saved-game entry controls and actual app version overlay. Title waits for account/restore readiness and suppresses banners.
- House/town-only 1–3x pinch and pan, fixed surrounding UI, cancel furniture/room drag when a second finger starts a pinch.
- Up to eight participants share conversation, hanging out, meals, tea, play, cooking, study and reading. Select extra companions, travel to a room allowed for everyone, share arrival/activity IDs and restore after reconnect. No extra account or slot grant.
- Use configured wake/sleep boundaries without random offsets; recover sleep need during scheduled offline sleeping and avoid stale sleep entries after waking. Pass the actual scene through bedroom activity restrictions so automatic sleep can select its assigned bed.
- Bound long character book fields to the page with vertical scrolling and pointer input.

## Verification
- check-group-sleep453: 2,880 timetable minutes, overnight needs, all eight four-person shared activities and reconnect, invalid companion, separate meeting positions, assigned-bed selection through state wrapper.
- check-sleep-215, check-feedback447, check-needs418, check-apple-login451, check-registration-slots446 and current shared-home ownership checks pass.
- qa-release453 passes Chromium and WebKit: title/guest entry, house/town pinch, long book field scrolling, dropdown selection across rerender. Local browser checks are not device/iOS sign-in validation.
- Legacy check-home-life-simulation contains source-string assumptions about old pair placement and removed UI-hide styles; legacy check-shared-town-service expects owners to be denied moving their own home, superseded by current ownership policy. Dedicated behavioral checks above cover changed behavior; those legacy suites are not reported as passing.
- Static translation inventory: EN2260/2993 and JA2259/2993 (both75.5% rounded); new title/group copy has all three languages.

## Outstanding / release status
- S25 FE startup failure and actual Apple login failure are not reproduced from the supplied reports. No claim of resolution or real-device performance improvement.
- Internal AAB and iOS upload status to be recorded after completion. No public submission or user announcement for453 yet. Main runtime remains unchanged because it still deploys an older separate web release.

## Play notes
<ko-KR>
새 타이틀 화면을 적용했습니다. 집·마을에서 두 손가락으로 확대·축소할 수 있습니다. 여러 캐릭터가 대화·식사·놀이 등에 함께 참여하고 재접속 후에도 활동을 이어갑니다. 설정된 수면 시간과 자동 취침의 침대 선택을 수정하고, 전체 설정의 긴 항목 스크롤을 개선했습니다.
</ko-KR>
<en-US>
New title screen. Pinch to zoom in homes and towns. Multiple characters can share conversations, meals and play, with activities preserved after reconnecting. Fixed configured sleep times and automatic bed selection, and improved scrolling through long full-settings pages.
</en-US>
<ja-JP>
新しいタイトル画面を追加しました。家と村でピンチによる拡大・縮小ができます。複数のキャラクターが会話・食事・遊びに参加し、再接続後も活動が続きます。設定した睡眠時間と自動就寝時のベッド選択を修正し、詳細設定の長い項目をスクロールしやすくしました。
</ja-JP>
