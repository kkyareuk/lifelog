# 1.0.402 / 454 internal

## Changes
- Title progress observes completion of initial visible image requests and account readiness, then disappears when the entry button is ready. It does not fetch the asset catalog or invent a percentage.
- Pinch cancels the pending room long-press. Pointer geometry is cached during the gesture and paint is batched to animation frames. Full scene rerenders are deferred during gestures and self-discovery dialogs.
- Question eligibility builds the answered-ID set once per candidate pass. Passive account cooldown refresh is cached for five minutes; authoritative use/reward checks remain unchanged. No additional server service or paid AI calls.
- Coffee drinking restores the sleep need. Outside configured sleep hours, urgent sleep need chooses coffee in an allowed kitchen instead of a nap. Existing fixed needs and scheduled/manual actions remain respected.
- Ongoing spouses do not startle at each other's private scene alone. Former marriages or a third participant do not inherit the exemption.

## Validation and limits
- Chromium/WebKit title entry, pinch, fixed controls, dropdown and book scroll pass, including waiting past the room hold threshold after a pinch.
- Coffee recovery KO/EN/JA, room rules, marriage exclusions, question eligibility, needs418 and group/sleep453 checks pass.
- Furniture sprite dimensions and scale factors match the previous version. The reported subtle shrinking is not yet reproduced; no arbitrary global resizing applied.
- Real-device frame-time improvements, previous S25 FE startup and Apple-login reports are not claimed resolved.
- New copy KO/EN/JA complete. Existing static inventory EN2260/2993 and JA2259/2993 (75.5% each).

## Play release notes
<ko-KR>
타이틀의 로딩 진행 표시를 수정했습니다. 집·마을 확대 중 방 편집이 잘못 열리는 문제를 고치고 화면 갱신 부담을 줄였습니다. 자아만들기 질문 처리와 화면 갱신을 개선했습니다. 커피로 수면 욕구를 회복하고, 설정한 취침 시간 밖에서는 커피를 우선 선택합니다. 부부끼리 사적인 모습을 보고 놀라는 반응을 조정했습니다.
</ko-KR>
<en-US>
Fixed title loading progress. Pinching homes or towns no longer triggers room editing, and gesture rendering is lighter. Improved self-discovery question processing. Drinking coffee restores energy, with coffee preferred outside configured sleep hours. Adjusted private-scene reactions between spouses.
</en-US>
<ja-JP>
タイトルの読み込み表示を修正しました。家・村の拡大中に部屋編集が開く問題を修正し、画面更新の負荷を軽減しました。自分探しの質問処理を改善しました。コーヒーで睡眠欲求が回復し、設定した就寝時間外ではコーヒーを優先します。夫婦間の私的な場面への反応を調整しました。
</ja-JP>
