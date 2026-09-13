# Internal 1.0.334 (386) — 2026-09-14

Branch: dev. Public slot pricing is separate main commit 5ceb0cf; this AAB is internal only. No new iOS app binary in this release.

## Included
- Page 10 restrictions grouped into needs, hobbies/leisure, daily life/care and social activities. Sleep, meals and toilet needs may be disabled separately. Direct commands and registered schedules remain available. Existing restrictions retained.
- Automatic sleep and generated need actions honor restrictions; updating settings invalidates the character timeline signature. Historical records remain separate.
- An explicit shared bed label suppresses individual duplicate labels even while furniture is in use. The shared label sits below the complete bed artwork.
- Two sleeping occupants are no longer unconditionally presented as having a conversation.

## Verification
- check-needs386: taxonomy, KO/EN/JA, needs, manual/schedule exceptions, showers and medical care preserved.
- qa-needs-bed386: Chrome and WebKit at 384x820; all three languages, 19 options, scroll to bottom, save, sleep toggle, generated needs filtering, actual rendering helper shared/individual-label assertions, geometry below bed.
- Existing home-life simulation: 70 checks passed.
- Native module closure/assets/sync, Gradle bundleRelease and jarsigner verification passed.
- AAB SHA256: E4CABBD8FA4E03816B5AC775DFF2C876E1D6DA967450F21B07942370A0BEBBA8
- No physical iPhone/Android interaction test in this run. Translation coverage for new strings: English/Japanese 100%; whole-app coverage not measured.

## Play release notes
<ko-KR>
10페이지 금지행동 설정을 욕구·취미와 여가·생활과 관리·대인관계로 나눴어요. 잠·식사·용변을 자동으로 하지 않도록 각각 설정할 수 있어요. 직접 지시와 등록 일정은 유지돼요.
침대에서 함께 상호작용하는 두 캐릭터의 이름표를 하나로 표시하고 침대 아래에 겹치던 문구를 정리했어요. 생활 로그는 각각 유지돼요.
</ko-KR>
<en-US>
Page 10 activity restrictions are grouped into needs, hobbies, daily care and social activities. Disable automatic sleeping, eating or toilet use individually; direct commands and scheduled activities remain available.
Characters interacting in the same bed share one status card below the bed. Removed duplicate labels. Individual life logs are preserved.
</en-US>
<ja-JP>
10ページの禁止行動を欲求・趣味と余暇・生活と手入れ・対人関係に分類。自発的な睡眠・食事・用足しを個別に無効にできます。直接の指示と登録した予定は維持されます。
同じベッドで交流する2人の名前と行動を1枚の表示にまとめ、ベッド下の重複表示を修正しました。生活ログは別々に残ります。
</ja-JP>

## Discord — internal 385 → 386
서랍마을 1.0.334 (386) 내부 테스트 업데이트

이번 업데이트에서 변경된 주요 내용을 안내드립니다.

✨ 새로운 기능
- 금지행동 설정에 ‘잠을 자지 않음’, ‘밥을 먹지 않음’, ‘용변을 보지 않음’을 추가했습니다. 자동 행동에 적용되며 직접 지시와 등록한 일정은 유지됩니다.

🎨 UI/UX
- 10페이지 금지행동을 욕구, 취미·여가, 생활·관리, 대인관계로 나눴습니다.
- 침대에서 함께 상호작용하는 두 캐릭터의 이름과 행동을 한 카드로 표시합니다. 생활 로그는 각각 유지됩니다.

🐛 오류 수정
- 침대 아래에 이름표와 행동 문구가 중복되거나 가구에 가려지는 문제를 수정했습니다.
- 함께 자는 두 캐릭터에게 대화 연출이 일괄 적용되던 부분을 수정했습니다.

## Wider tester announcement, cumulative since public/internal baseline 381
The previous internal 385 notice in docs/mail-support385.md covers 383–385. For a future closed-test release, verify the actual last closed-test code before using this draft. Include its final gift acceptance/sender labels, idol/band and hobby gift categories, mailbox quota/retry recovery, and the above 386 items; do not imply a closed-test deployment occurred in this run.

## Deployment verified
2026-09-14 01:09 KST: Google Play internal release285, 386 (1.0.334), internally available. dev c49f514. Public promotion not performed. Board main d6da2a2.
