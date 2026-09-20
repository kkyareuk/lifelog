# Public hotfix 461 / 1.0.409

2026-09-20. Branch codex/public461, based on public457 plus startup recovery460. User explicitly authorized production promotion. No experimental economy459 features included.

## Delivery
- Signed Android AAB: C:/Users/Public/drawer-releases/drawervillage-1.0.409-461-hotfix.aab
- SHA256: 6573D6966A51FF40F69A47626AF07A85E0A7D96291479332B7B0EAB52F60C058
- Play internal release340: available to internal testers at 10:49 KST.
- Play production release35: 461 promoted, 100% rollout, review request accepted; publishing overview shows review pending with automatic prechecks running. Managed publishing disabled. Public availability is not yet verified; previous public457 remains the last confirmed live version.
- sharedTownApi deployed revision sharedtownapi-00104-wuy at 10:49 KST. Deployment preserved the downloaded existing source/runtime and changed only shared-mail.js, account-mailbox.js, mail-portrait.js. All three files verified against the newly deployed source archive. The first discovery attempt timed out; retry with a longer discovery timeout succeeded.
- Common source commit44e158d, Android version0609be3; main2f9246b, dev98d169e. Test compatibility mainced1787/deve08cf96.

## Changes
- Retains startup460 recovery and supporter list (8 approved, no pending at review; latest 고스트다이브).
- Reproduced shared bedroom sleeper at x6/y764 while bed was near x246/y259. Shared-world rendering skipped the personal-home positioning callback. Now hydrates placement inside the shared isolated world, without persisting it to personal save. Remaps assigned bed IDs to group resident IDs. Sleeper follows moved/rotated bed.
- A remote-village letter opened before its account-wide portrait fetch stayed blank. Missing portraits now refresh inside the already-open letter, scoped to its group and recipient session. Same character ID from the selected different village is not substituted.
- New character letters preserve their public portrait URL so removing/moving the resident does not remove the letter's portrait. Existing letters still resolve a current resident portrait. Device-only image references are skipped in favor of a portable photo. No owner's avatar is substituted for a missing character. Historical letters whose resident and original photo are already gone cannot be reconstructed by this change.
- Removed automatic post-login profile form. Explicit Settings profile editing remains and pre-fills supplied identity. No additional email form added.
- Black sclera (역안) and Irezumi (이레즈미) already existed in public source; selection/save/reload confirmed. No duplicate options added.
- Added EN/JA labels for single bed and hiding furniture. Static inventory: EN2262/2993 (75.6%), JA2261/2993 (75.5%). Release notes complete in KO/EN/JA.

## Validation
- qa-public461 Chromium and WebKit: personal/shared beds; moved/rotated assigned bed; Apple sign-in completion without profile gate and explicit editor prefill; delayed cross-village portrait and group isolation; existing requested appearance choices retained after reload.
- Dev received common changes and Chromium regression suite passed.
- Packaged www boots offline without missing assets and retains saved character after reload. Signed bundle485 assets match byte for byte; jarsigner verifies signature.
- Mail gift/portrait, gift receipts/quotas, staff permissions, cursor pagination and block isolation tests passed.
- Older check-home-life-simulation source-selector assertion fails identically on untouched public457 and current source (old relationship CSS selector). Not a passing check. Main's older web shell also does not satisfy the new full bed fixture; main syntax and mail backend checks passed, but full visual QA is claimed only for current Android source and dev, not old main.
- No native iOS signing, upload, device test or Apple resubmission performed in this task.

## Apple review
App Store Connect submission a1d94db3-aa3b-444d-82aa-41f67e37d1a7, iOS1.0.405(457), reviewed September19 on iPad Air5. Guideline4 Design: asks for name/email again after Sign in with Apple. Ad-removal IAP is waiting because the app version was rejected; no separate IAP rejection reason shown. Common code fix above is prepared. A new signed iOS build and resubmission remain outstanding; no reviewer message sent.

## Replies to users (drafts, not sent)

### Startup / reinstall question
안녕하세요. 업데이트 후에도 접속하지 못하게 해 드려 정말 죄송합니다. 저장 데이터가 남아 있는데 앱을 열지 못하는 원인 중 하나를 수정한 1.0.409 버전을 Google Play에 심사 제출했습니다. 아직 스토어에 보이지 않을 수 있으며, 승인 후 업데이트로 제공됩니다. 데이터 보호를 위해 앱 삭제·재설치나 데이터 삭제는 하지 말아 주세요. 1.0.409 업데이트 후에도 동일하다면 기기 모델, 설치 버전, 오류 화면을 보내 주시면 이어서 확인하겠습니다.

### Repeated failure follow-up
계속 기다리게 해 드려 죄송합니다. 기존에 받으신 업데이트와 별도로 실행 오류를 수정한 1.0.409 버전을 심사 제출했습니다. 현재 Google 검토 대기 상태라 아직 업데이트가 표시되지 않을 수 있습니다. 데이터 보호를 위해 재설치·데이터 삭제는 잠시 보류해 주세요. 배포된 1.0.409에서도 문제가 이어지면 오류 화면과 버전을 확인해 추가로 살펴보겠습니다.

### Bedroom position
제보 감사합니다. 멀티 마을의 집에서 캐릭터가 침대 대신 왼쪽 아래에 표시되는 문제를 확인해 수정했습니다. 침대를 옮기거나 회전해도 위치에 맞춰 표시되는지 함께 확인했으며, Android 1.0.409 업데이트에 포함해 심사 제출했습니다. 불편을 드려 죄송합니다.

### Appearance request
의견 감사합니다! 역안과 이레즈미는 현재 선택할 수 있습니다. 캐릭터의 신체 설정에서 눈 특징에 ‘역안’, 문신 항목의 유형에 ‘이레즈미’가 있어요. 해당 항목이 보이지 않으면 사용 중인 앱 버전과 화면을 알려 주세요.

### Cross-village mail portrait
제보 감사합니다. 다른 멀티 마을의 편지를 먼저 열었을 때 사진이 나중에 조회되어도 반영되지 않는 부분을 수정했습니다. 새 편지는 발신 캐릭터가 마을을 떠나도 사진이 남도록 함께 개선했습니다. Android 화면 수정은 1.0.409에 포함해 심사 제출했습니다.

## Play release notes
<ko-KR>
저장 데이터가 남아 있는데 앱을 열지 못하는 일부 문제를 수정했어요. 멀티 마을에서 잠자는 캐릭터가 침대 위치에 맞게 표시되도록 고쳤어요. 다른 멀티 마을의 우편 사진 로딩을 개선하고 후원자 명단을 갱신했어요. 로그인 후 프로필 입력창이 자동으로 뜨지 않도록 개선했어요.
</ko-KR>
<en-US>
Fixed some startup failures while saved data is still present. Sleeping characters in multiplayer villages now follow their bed positions. Improved portrait loading in mail from other multiplayer villages and updated supporter credits. Profile editing no longer opens automatically after sign-in.
</en-US>
<ja-JP>
保存データが残っていても起動できない一部の問題を修正しました。マルチの村で眠るキャラクターをベッドの位置に合わせて表示します。別のマルチの村から届く手紙の画像読み込みを改善し、応援者名簿を更新しました。ログイン後にプロフィール入力画面が自動で開かなくなりました。
</ja-JP>
