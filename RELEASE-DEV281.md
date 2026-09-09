# 서랍마을 1.0.248 · 개발판 281

Google Play 업로드용 Android App Bundle입니다. 이전 개발판은 280 / 1.0.247입니다.

## 한국어

- 멀티 마을과 집에서 캐릭터를 선택하고 행동을 시킬 때 해당 그룹의 캐릭터와 연결되도록 수정했습니다.
- 멀티에서 상대를 만나러 가는 이동, 기다림, 도착 후 행동 표시를 개선했습니다.
- 태블릿 가로 홈 화면에서 이동 중인 캐릭터를 표시하고, 옆 지도에서 캐릭터를 눌러 관찰할 수 있습니다.
- 태블릿 상단 장식의 비율과 2인 장면의 좌우 배치를 수정했습니다.
- 태블릿 캐릭터 선택 목록 위치, 저장·내보내기·삭제 버튼 양끝, 주민등록증 글자 정렬을 개선했습니다.
- 태블릿 집 선택창이 상단바 아래에 표시되도록 수정했습니다.
- 설정 → 게임플레이에 애니메이션 효과 강도 ‘기본 / 낮음 / 끄기’를 추가했습니다. 이동과 행동 진행은 유지됩니다.
- 방장이 멀티 그룹을 삭제할 수 있습니다. 삭제 전에 확인하며, 그룹의 마을·캐릭터·집과 공유 설정이 삭제됩니다.
- 마을 편집은 편집 완료 시 저장하며, 이동 장면은 좌표를 반복 저장하지 않는 방식을 유지합니다.

## English

- Fixed character selection and action commands in multiplayer towns and homes so they use the selected group's characters.
- Improved shared travel, waiting and arrival scenes when characters meet.
- The landscape tablet map shows traveling characters and lets you tap a character to observe them.
- Fixed tablet header artwork proportions and left/right placement in two-character scenes.
- Improved the tablet character picker, export/save/delete button edges and ID card text layout.
- Fixed the house picker appearing behind the tablet header.
- Added Normal / Reduced / Off animation intensity under Settings → Gameplay. Travel and activity progress remain visible.
- Group owners can delete their multiplayer group after confirmation. This deletes the group's towns, characters, homes and shared settings.
- Town edits remain saved on completion. Movement does not repeatedly save coordinates.

## 日本語

- マルチのタウンや家でキャラクターを選択・指示する際、選択中のグループのキャラクターを使うよう修正しました。
- 相手に会いに向かう移動、待機、到着後の行動表示を改善しました。
- タブレット横画面の地図に移動中のキャラクターを表示し、タップして観察できます。
- タブレット上部の装飾の比率と、二人の場面の左右配置を修正しました。
- キャラクター選択リストの位置、書き出し・保存・削除ボタンの両端、住民票の文字配置を改善しました。
- 家の選択リストがタブレットの上部バーに隠れる問題を修正しました。
- 設定 → ゲームプレイにアニメーションの強さ「通常 / 控えめ / オフ」を追加しました。移動と行動の進行は維持されます。
- グループのオーナーは確認後にマルチグループを削除できます。グループのタウン・キャラクター・家・共有設定が削除されます。
- タウンの編集は完了時に保存します。移動座標を繰り返し保存しない方式を維持しています。

## 플랫폼 상태

- Android: 281 / 1.0.248 서명 AAB·APK 생성 및 검증.
- 개발 소스: dev 계열. 운영 게임 main에는 새 기능을 합치지 않음.
- Firebase: sharedTownApi, expireVillageMail, Firestore 규칙 반영.
- 공개 웹: 이번 요청으로 배포하지 않음.
- Apple: 앞서 제출한 iOS 1.0.215 빌드 16은 운영 274 기반. 이 문서의 개발판 281 변경은 해당 제출본에 포함되지 않음. Apple 심사 제출을 변경하지 않았음.
