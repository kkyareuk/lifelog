# 서랍마을 개발판 285 / 1.0.252

## 한국어
- 할 일 정하기의 상대 선택·행동 선택·시키기 버튼 위에서도 터치로 스크롤할 수 있도록 수정했습니다.
- 멀티 행동 명령, 편지 답변, 프로필 저장은 진행 상태를 바로 표시합니다. 전송 실패 시 다시 시도할 수 있습니다.
- 사제 관계에서 스승을 직접 지정할 수 있고, 스승과 제자 관점의 생활 로그를 추가했습니다.
- 유저 프로필 사진에 1:1 자르기를 적용하고 우편 목록에서는 사진이 정사각형을 채우도록 했습니다.
- 뒤로가기의 중복 터치 처리를 제거하고, 기록물의 상세 목록은 열 때만 만들어 화면 갱신 부담을 줄였습니다.
- 기록물에 함께한 캐릭터 아이콘을 추가하고 시간이 두 줄로 잘리지 않도록 정리했습니다.
- 멀티 건물을 드래그하는 동안 그리드에 맞춰 배치됩니다. 마을 편집은 편집 완료 시 저장됩니다.
- 만난 캐릭터 아이콘을 키우고 집 안에서도 각각 선택할 수 있도록 했습니다.
- 애정 어린 접촉은 맥락에 따라 설렘·누그러짐·불타오름을 표현합니다. 사랑하는 상대와의 접촉에는 홍조를 표시하고 분홍 화면 효과는 가장자리 그라데이션으로 완화했습니다.
- 멀티 캐릭터 생성 진행 상태를 즉시 표시합니다. 캐릭터 생성 뒤 사진 저장이 실패하면 같은 캐릭터에 이어서 재시도합니다. 생성 과정에서 다른 개인 캐릭터들의 새 사진을 모두 업로드하느라 기다리는 작업을 분리했습니다.
- 현재 멀티 그룹의 캐릭터를 캐릭터 탭에서 볼 수 있습니다. 소유자는 사진, 이름·직업, 수면 시간, 말투·성격 메모, 애정·갈등 표현, 취미·관심사·패션·액세서리, 복수 신체접촉 반응을 편집할 수 있습니다.

## English
- Touch scrolling now works when a swipe begins on companion, activity and command buttons.
- Multiplayer commands, mail replies and profile saves immediately show progress, with manual retry on failure.
- Mentor relationships now have a selectable teacher and perspective-specific teacher/student logs.
- User portraits can be cropped square and fill their mailbox thumbnails.
- Removed duplicate Back touch handling. Detailed archives are generated only when opened; companion icons and unbroken times improve readability.
- Multiplayer buildings snap while dragging; town edits are saved on completion.
- Meeting portraits are larger and individually selectable at home. Loving contact has contextual moods and blush; pink effects use an edge gradient.
- Character creation shows progress immediately. Photo failures can be retried against the same created character. Unrelated personal photo uploads are separated from creation.
- The Characters tab lists the active multiplayer group. Owners can edit portraits, basic profile, sleep times, speech/personality notes, affection/conflict styles, hobbies/interests/fashion/accessories and multiple touch reactions.

## 日本語
- 相手・行動・実行ボタンの上からスワイプしてもスクロールできます。
- マルチの行動指示、手紙の返答、プロフィール保存はすぐに進行状況を表示し、失敗時は手動で再試行できます。
- 師弟関係で師匠を指定でき、師匠と弟子それぞれの生活ログを追加しました。
- ユーザー写真の正方形トリミングと、郵便一覧のサムネイル表示を改善しました。
- 戻るボタンの重複タッチ処理を削除。詳細な記録は開く時に生成し、相手のアイコンと改行されない時刻を表示します。
- マルチの建物はドラッグ中もグリッドに沿って移動し、村の編集完了時に保存します。
- 会ったキャラクターのアイコンを大きくし、家でも個別に選択できます。愛情のある接触では状況に合う感情と頬染めを表示し、ピンクの演出を画面端のグラデーションに調整しました。
- マルチキャラクター作成はすぐに進行表示します。作成後に写真保存が失敗した場合、同じキャラクターで再試行します。無関係な個人写真のアップロードを作成処理から分離しました。
- 人物タブに現在のマルチグループを表示。所有者は写真、基本情報、睡眠時刻、話し方・性格メモ、愛情・対立への対応、趣味・関心・服装・アクセサリー、複数の接触反応を編集できます。

Android開発版 / Android development build. Appleの提出済みビルドは更新していません。
