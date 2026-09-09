# 서랍마을 개발판 1.0.242 (275)

2026-09-08 · dev Android APK/AAB. 운영 main은 핫픽스 274 유지. Play Console 업로드 미실행. iOS 빌드/제출 미실행.

## 한국어

- 멀티 목록에 방장·관리자가 저장한 대표사진을 둥근 사각형으로 표시합니다.
- 목록에 유저 수, 캐릭터 수, 마을 수를 따로 표시합니다. 목록 갱신 시 인원 집계를 읽고, 현재 그룹은 기존 구독 정보로 갱신합니다.
- 마을 이동의 ‘현재 멀티 마을’을 언어 설정에 맞춰 표시합니다.
- 마을 캐릭터 묶음과 이름 뒤의 흰 배경을 제거했습니다.
- 멀티 마을의 기본 건물 표시 크기를 줄였습니다. 저장된 배율과 배치 좌표는 유지합니다.
- 멀티 집에서도 가구를 드래그하는 동안 실제 격자에 맞춰 미리보기가 움직이며 다른 방으로 옮길 수 있습니다. 손을 놓거나 Android 드래그가 종료될 때 마지막 유효 위치를 저장합니다.
- 관계의 그룹 선택을 뒤로가기 오른쪽으로 옮겼습니다.
- 사전 물품 선택은 사진이 있는 3열 카드로 표시합니다. 검색, 전체 선택, 선택 해제, 선택 개수 표시를 유지합니다.
- 내 마을의 행동 선택은 단계별로 이동하며, 선택 후 이전 단계로 돌아가고 뒤로가기로 선택창 전체가 닫히지 않도록 정리했습니다.
- 내 마을과 멀티에 손잡기, 어깨에 기대기, 조심스러운 키스, 화해의 키스를 추가했습니다. 멀티에는 포옹과 일반 키스도 선택할 수 있습니다.
- 상대에게 도착한 뒤 홈화면에서 키스 동작과 하트 효과가 표시됩니다. 조심스러움·화해·화난 기분에 따른 색을 구분하며 동작 줄이기를 지원합니다.
- 새 친밀 행동은 성인 캐릭터 대상으로 제공하며, 접촉 거부 설정을 확인합니다. 기존 이동 경로를 한 번 저장한 뒤 화면에서 이동을 계산하는 방식은 유지합니다.
- 이전 핫픽스의 사진 포함 캐릭터 코드 발행/불러오기, 캐릭터별 옷장 30개 제한, 신체접촉 반응 설정, 사제 관계, 긴 특성 선택지 수정도 이 개발판에 포함합니다.

## English

- Multiplayer directory cards show the host/manager’s cover image, with separate user, character and town counts.
- Localized the current multiplayer town label and removed white surfaces behind town character groups and names.
- Reduced the shared town building display size while preserving saved positions and scale factors.
- Shared furniture drag previews snap to the actual grid and support moving into another room, including Android pointer termination.
- Moved the relationship group selector next to Back. Dictionary item selection now uses three columns of photo cards with search and selection controls.
- Personal-town action selection uses reversible steps within one dialog.
- Added adult hand-holding, shoulder leaning, cautious and reconciliation kisses to personal and shared towns. Shared towns also offer hugs and ordinary kisses.
- Home kiss animations appear after arrival, with mood-specific colors and reduced-motion support. Contact refusal is checked. Movement still uses a single saved route and local animation.
- Includes the earlier photo-code import/export, 30-item wardrobe cap, touch-response settings, mentor relationships and long-option layout fixes.

## 日本語

- マルチ一覧に管理者が設定した代表画像と、ユーザー数・キャラクター数・タウン数を表示します。
- 現在のマルチタウンの表示を翻訳し、タウンの人物と名前の背後にある白い背景を削除しました。
- 共有タウンの建物表示を縮小しました。保存済みの座標と倍率は維持します。
- 共有の家でも家具のドラッグ中にグリッドへ合わせて表示し、別の部屋へ移動できます。
- 関係のグループ選択を戻るボタンの右へ移動しました。辞典の品物選択は画像付きの3列カードになりました。
- 自分のタウンの行動選択を、同じダイアログ内で戻れる段階式にしました。
- 成人同士の手つなぎ、肩に寄り添う行動、慎重なキス、仲直りのキスを追加しました。共有タウンでは抱擁と通常のキスも選べます。
- 到着後のホーム画面にキスの動きと感情に応じたハートの色を表示します。動きを減らす設定と接触拒否の設定に対応します。移動中に座標を連続保存しません。
- 画像付きキャラクターコード、衣装30点の上限、身体接触への反応、師弟関係、長い選択肢の修正を含みます。

## Validation

- Shared UI regression: relationship/schedule proposals, permissions, gift/user mail, room-grid resizing and cross-room furniture transfer.
- Added browser checks: directory cover/counts, compact relationship header, child-step back navigation, three-column photo picker, post-arrival kiss animation.
- Shared engine/service checks and 200-character simulation; age/contact restrictions; retained photo-code/wardrobe and startup/cost optimizations.
- APK/AAB signing/build, packaged web-file equality and offline boot/save/reload checks.
- Static translation coverage: EN 2197/2885 (76.2%), JA 2196/2885 (76.1%). Newly added inline copy is provided in KO/EN/JA.
- Real two-device behavior, Firestore count permissions on live accounts, device heat and Play upload remain to be checked. Firebase cost is not claimed to be zero.
