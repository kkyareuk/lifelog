# 서랍마을 1.0.237 · 개발판 268

2026-09-07 / 개발판 267 이후 변경사항

## 한국어 출시노트

✨ 새로운 기능
- 사전에서 원하는 물품만 골라 다운로드하고, 파일을 불러올 때도 추가할 물품을 선택할 수 있어요.
- 유저 이름과 프로필 사진을 설정할 수 있어요. 멀티 구성원 목록에도 표시돼요.
- 2인 침대의 옆면 그림을 추가했어요. 회전·좌우 반전에 맞춰 자는 캐릭터의 방향과 앞뒤 자리도 함께 바뀌어요.

🔧 개선 사항
- 멀티 공식 관계와 캐릭터 그룹을 내 마을과 같은 설정창에서 편집해요. 마지막에 관계/그룹 제안을 보내고, 수정할 때는 수정 제안을 보내요.
- 여러 유저의 캐릭터가 포함된 제안은 관련 유저가 모두 수락해야 적용돼요. 거절 사유와 제안한 설정도 확인할 수 있어요.
- 멀티 마을의 집 탭에서 실제 방 내부를 보고 층을 이동할 수 있어요. 캐릭터 입주 시 집도 함께 공개하며, 권한이 있는 구성원은 건물 정보에서 새 집을 추가할 수 있어요.
- 생활 로그의 과장된 관계 문구를 줄이고 장소, 성격, 공통 관심사와 설정한 시선·역할에 맞는 일상 행동을 보강했어요.

🎨 UI/UX
- 멀티 마을의 마을탭에서 멀티·구성원·마을 정보·건물 정보·편집모드를 찾을 수 있어요.
- 구성원 창에서 그룹 캐릭터 전체를 카드로 보고 이름을 검색할 수 있어요.

🐛 오류 수정
- ‘싸우지 않고’처럼 싸움을 부정하는 평화로운 로그에서 빨간 싸움 효과가 나타나는 문제를 수정했어요.
- 멀티 생활을 계산하는 과정에서 개인 마을 상태에 영향을 줄 수 있던 문제를 수정했어요.

## English release notes

- Choose individual dictionary items to export or import.
- Set your player name and profile photo for multiplayer member lists.
- Added side artwork for double beds. Rotation and mirroring keep sleepers facing the pillows and preserve their assigned sides and depth order.
- Multiplayer relationships and character groups now use the same editors as personal towns. Create or edit proposals, review the proposed settings, and accept or decline with an optional reason. Changes involving several owners require everyone's approval.
- View multiplayer home interiors and switch floors. Moving in a character also shares their home; authorized members can add a new home from building information.
- Added everyday interaction lines based on place, personality, shared interests, perceptions and assigned roles, while reducing unnecessarily dramatic wording.
- Restored multiplayer town navigation and added a searchable character directory.
- Fixed fight effects triggered by peaceful phrases that explicitly negate fighting, and isolated shared life calculations from personal town state.

## 日本語リリースノート

- 辞典の品物を個別に選んで書き出し・取り込みができるようになりました。
- マルチプレイのメンバー一覧に表示するユーザー名とプロフィール写真を設定できます。
- 二人用ベッドの横向きの絵を追加しました。回転や左右反転に合わせて、寝る人物の頭の向き、指定した左右の場所、前後の重なり順も変わります。
- マルチプレイの公式関係とキャラクターグループを、自分の村と同じ設定画面で編集できます。新規・修正の提案内容を確認し、承認または理由付きで辞退できます。複数の所有者に関わる変更は全員の承認後に反映されます。
- マルチプレイの家の室内を表示し、階を切り替えられます。キャラクターの入居時に家も共有され、権限のあるメンバーは建物情報から新しい家を追加できます。
- 場所、性格、共通の関心事、相手への見方や役割に合う日常の記録を増やし、過度に劇的な文章を減らしました。
- マルチプレイの村メニューと、名前で検索できるキャラクター一覧を整えました。
- 喧嘩を否定する穏やかな記録で赤い喧嘩エフェクトが出る問題と、共有生活の計算が個人の村の状態に影響する問題を修正しました。

## 検証・配布 / 검증과 배포 범위

- Android: versionName 1.0.237 / versionCode 268, 서명 APK 및 AAB.
- 웹·모바일 브라우저: 기존 관계창, 제안과 거절, 공유 건물 배치와 되돌리기, 개인 데이터 보존, 물품 1개 선택 내보내기/선택 가져오기, 프로필 저장 흐름, 실제 가구 회전 버튼을 검사.
- 침대: 정면/오른쪽/왼쪽/좌우 반전/180도, 휴대폰·태블릿 너비에서 베개 좌표·인물 방향·앞뒤 순서 검사. 첨부된 정면 그림은 교체에 사용하지 않음. 원본 PNG 픽셀을 SVG 표시 영역으로 참조해 옆면만 사용.
- 서버: 소유자별 수락, 거절 시 기존 관계 보존, 권한·동시 편집 충돌, 공유 그룹 생성, 200명 생활 계산과 개인 상태 보존 검사. 200명 계산 약 655ms는 개발 PC의 서버 실행 측정이며 휴대폰 발열 보장은 아님.
- 번역 측정: 영어 2183/2871 (76.0%), 일본어 2182/2871 (76.0%). 새 화면의 자체 3개 언어 문구는 별도로 작성.
- iOS: 이번 개발판을 새로 서명하거나 업로드하지 않음. 기존 운영264 기반 iOS 빌드14 유지.
- 제한: 공유 집 내부의 방·가구 전체 편집, 내부 이미지 업로드, 집 삭제·복구는 후속 작업. 이번에는 내부 표시·층 이동·집 생성과 마을 배치 편집까지 포함. 실제 기기 두 계정 간 사진 업로드와 푸시 도착은 별도 실기기 확인 필요.
- Google Play 공개/비공개 테스트 트랙 업로드는 수행하지 않음. 이번 노트의 비교 기준은 개발판267이며, 다음 비공개 테스트 배포 시 직전 비공개 테스트 이후 기록 전체를 다시 누적해야 함.
