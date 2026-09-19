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

## Delivery
- Source58fe649 pushed to dev. Play internal release336,1.0.402(454), available September19 18:57 KST. No lost supported devices; optional mapping-file warning only.
- Signed AAB: C:/Users/Public/drawer-releases/drawervillage-1.0.402-454-internal.aab. SHA256:69F8125E43F321405C15365109FF09E2A778F6F0004A3533DD55A146A0A7DF79.483 prepared assets match.
- sharedTownApi successfully deployed; no new service, no compensation grant rerun.
- iOS internal workflow35436002705 running; public submission and tester availability not claimed.
- General update email is an unsent draft in update-mail454-draft.md. Public release has not been requested for454.

## Follow-up reports / September 19
- Rechecked the repeated sleep report against current454 without changing runtime code or creating455. Ten-character fixture, low sleep need, eight times for both07:00–23:00 and01:00–03:00 awake windows: scheduled sleep matches actual scenes; awake-time low energy selects coffee. Does not reproduce the reporter's private saved data or claim physical-device verification.
- WebKit402×820 and393×798: scroll controls into view, touch morality/aggression selectors, select an option, assert state and rerender persistence. This verifies reachable scroll bounds and touch selection; programmatic scrollIntoView is not a physical iPhone swipe test.
- Old411 book form could lack a bounded list height while its outer book page clipped overflow, and did not explicitly enable touch scrolling on the list.453 already adds the height fallback and list pointer/pan-y handling. This is app layout/input configuration, not proof of an iPhone hardware or OS defect.
- Tests: scripts/check-reported-sleep454.mjs and scripts/qa-reported-settings454.mjs --webkit pass.
- Email rewritten cumulatively from1.0.399 through454; spouse reaction item removed from the email only. No notice sent and no additional compensation granted.
- iOS workflow35436002705 completed successfully; App Store processing/tester availability and public submission are not inferred from workflow success.
