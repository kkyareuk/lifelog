# Internal test 1.0.337 / 389

2026-09-14. Native build 20260914dev389. Based on dev f196aaf (388).

## Player changes

- Viewpoint character popover shows five current need satisfaction meters instead of recent logs. Other character popovers show relationship meters and direct furniture-style interaction choices. Crown switches the owned viewpoint character.
- Closeness, affection, trust, comfort and tension are stored per pair. Talk, affectionate actions, reassurance and negative interactions apply different bounded deltas; recommendations also consider the metrics. Existing contact/consent restrictions remain effective. Manual intimacy/conflict edits update accumulated metrics. Direct scenes do not count the same interaction twice.
- Reuses the rounded occupant card with opaque background for readable content and a scrollable, viewport-fitted layout. Includes English/Japanese new strings.
- Includes all development388 changes: need and relationship freeze options, unrelated hobby isolation, slot usage, foreground/clamped furniture status cards, north chair adjustment and shared furniture encounters. See development388.md for behavior and limits.
- Default completion policy now includes signed Android bundle and verified Google Play internal testing availability.

## Validation

- qa-occupant389: Chromium and WebKit, KO/EN/JA, self/other meters, direct talk target, crown selection, differentiated relationship deltas, freeze, manual edits and viewport bounds. Screenshots visually reviewed.
- qa-life388 regression passed; home-life simulation 70 checks and check-life388 passed.
- Android module closure 147 modules and 366 assets. All 366 prepared assets match the signed bundle byte-for-byte. Eight Capacitor plugins registered. Gradle release bundle succeeded, jarsigner verified. Basic theme/file provider resources restored in isolated checkout.
- Web preparation passed (146 modules). No website deployment. iOS native build/device validation not performed; WebKit is browser coverage only.
- New English strings 100%, Japanese 100%; whole-app translation coverage not measured.

## Artifact

- drawer-village-1.0.337-389.aab (71,241,463 bytes)
- SHA256: 0DE0EB4A971D7A5DDDDAAD6F05D5C20C3B8A755F23AB39D2E88B95D8C0BAB4E2
- Play Console baseline verified: internal 386 / 1.0.334, production 387 / 1.0.335.
- Internal release 286 is available to internal testers, verified in Play Console on 2026-09-14 at 15:03 KST. Code 389 / 1.0.337 is the latest release. All three release-note languages accepted. No device support loss; only nonblocking missing deobfuscation-map warning (minification disabled).
- Implementation commit d21fab4 pushed to dev. Production was not promoted; game main remains unchanged under the development workflow.

## Release notes

<ko-KR>
기준 캐릭터를 누르면 수면·허기·용변·청결·사교를 확인하고, 상대를 누르면 관계 수치와 상호작용을 바로 선택해요. 왕관으로 기준 캐릭터를 바꿀 수 있어요.
친밀도·애정도·신뢰·편안함·갈등도가 활동에 따라 달라져요. 전체설정에서 욕구와 관계 변화를 고정할 수 있어요.
슬롯 사용량을 선택됨 아래에 표시하고, 가구 상황표의 가림·화면 밖 표시와 북쪽 의자 위치를 수정했어요. 같은 가구에 있는 캐릭터의 공동 상황표와 개인 로그를 연결했어요.
설정하지 않은 취미가 자동 행동에 섞이는 경로와 저장·사진 복원 안정성을 개선했어요.
</ko-KR>
<en-US>
Tap your viewpoint character for five needs, or another for relationship meters and interactions. Switch viewpoint with the crown. Closeness, affection, trust, comfort and tension respond to activities. Freeze needs or relationship changes in settings. See used/total slots below Selected. Fixed furniture status overlap, off-screen cards and north seats. Shared furniture encounters have joint cards and individual logs. Fixed unrelated hobbies; improved saving and photo restoration.
</en-US>
<ja-JP>
基準キャラクターを押すと睡眠・空腹・トイレ・清潔・社交を確認でき、相手を押すと関係の数値と交流を選べます。王冠で基準を切り替えられます。
親密度・愛情度・信頼・安心感・葛藤度が行動に応じて変わります。全体設定で欲求や関係の変化を固定できます。
選択中の下に使用枠数/合計枠数を表示します。家具による表示の隠れ、画面外へのはみ出し、北側の椅子の位置を修正しました。同じ家具にいる人物の共通表示と個別ログを連携しました。
未設定の趣味が自発行動に混ざる経路を修正し、保存と写真復元の安定性を改善しました。
</ja-JP>
