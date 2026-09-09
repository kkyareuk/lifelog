# 서랍마을 개발판 270 · 1.0.239

Android 개발판 APK와 Play 업로드용 AAB입니다. 운영 main264와 iOS 빌드14는 유지하며 Play Console 업로드·App Store 심사는 진행하지 않았습니다.

## 한국어 업데이트
- 우편함을 받은 우편 / 보낸 우편 / 쓰기로 나눴습니다. 관계·그룹·입주·동거·일정 제안과 답변은 우편함에서 확인합니다.
- 관계 화면의 받은 제안·보낸 제안 버튼을 제거했습니다. 제안 내용은 설정 이름과 캐릭터 이름으로 표시하며, 거절 사유는 거절을 누른 뒤 입력합니다.
- 나 또는 내 캐릭터를 보내는 이로 선택해 캐릭터에게 편지와 사전의 선물을 보낼 수 있습니다. 선물은 받는 캐릭터의 보유 물품에 추가됩니다.
- 멀티 일정에서 기존 주간·날짜별 일정 창으로 함께할 일정을 제안합니다. 관련 소유자의 수락 후 그룹의 일정에 표시하며, 수정과 취소도 제안으로 처리합니다.
- 멀티 규칙에 관계 제안·일정 제안·동거 제안·우편·선물 허용 여부를 추가했습니다. 구성원과 중복되는 멀티 주민 목록을 제거했습니다.
- 캐릭터 설정에서 사진 포함 공유 코드를 만들고, 코드로 캐릭터와 사진을 불러올 수 있습니다. 만든 코드는 공유 중단할 수 있습니다. 로그인 후 사용할 수 있습니다.
- 멀티 집에서 집 주인과 관리 권한자가 편집 모드를 열어 가구를 추가·이동·회전·반전·크기 조절·삭제하고 침대 사용자를 배정할 수 있습니다. 방 이름·층과 집 층수도 편집할 수 있습니다.
- 이미 확인한 알림이 다시 열려 집 편집 중 관계 화면으로 돌아가던 경로를 수정했습니다.
- 태블릿 가로 화면의 상단 장식을 반복 없이 한 장으로 늘리고, 펼치기 버튼 폭과 직업 글자 크기를 보정했습니다.
- 우편함과 멀티 화면의 내부 제목·초대코드가 스크롤 중 상단에 달라붙던 스타일을 수정했습니다. 우편은 20개씩 표시하고 오래된 캐릭터 편지는 펼칠 때 불러옵니다.
- 침실 대화에서 물건을 둘 자리를 두고 말다툼하는 문구 대신 쉬는 자리를 조정하는 문구를 사용합니다. 집의 행동 표시도 현재 장면의 제목을 사용해 로그와 다른 행동처럼 보이지 않도록 했습니다.

사용 위치: 우편함 → 받은 우편 / 보낸 우편 / 쓰기. 캐릭터 설정 → 내보내기·불러오기 → 사진 포함 공유 코드 만들기 / 캐릭터 코드로 불러오기. 멀티 집 → 편집모드 → 가구 목록.

## English
- Reorganized Mailbox into Inbox, Sent and Compose, including relationship, group, residence and schedule proposals and responses.
- Removed proposal inbox buttons from Relationships. Proposal details use readable setting and character names, with a separate optional decline reason.
- Send letters and dictionary gifts as yourself or an owned character. Gifts are added to the recipient’s inventory.
- Propose shared weekly or dated schedules using the existing editor. Shared schedules and changes apply after the participating owners accept.
- Added group controls for relationship proposals, schedule proposals, cohabitation, mail and gifts. Removed the duplicate resident section.
- Create a character sharing code and import a character with photos. Sign-in is required; the creator can revoke the code.
- Home owners and managers can edit shared furniture placement, rotation, flip, scale, deletion and bed assignments, plus room names and floors.
- Fixed previously opened notifications replaying while editing a home.
- Adjusted the landscape tablet decoration, Expand button and occupation label. Internal Mailbox and multiplayer headers now scroll with their content.
- Bedroom conversations and home activity labels now better match the current scene.

## 日本語
- 郵便箱を受信・送信済み・作成に分け、関係・グループ・入居・同居・予定の提案と返答をまとめました。
- 関係画面から提案一覧ボタンを外しました。提案内容は設定名とキャラクター名で表示し、辞退理由は辞退を選んでから入力します。
- 自分または自分のキャラクターから手紙と辞典の贈り物を送れます。贈り物は受取人の所持品に追加されます。
- 既存の週間・日付別編集画面で共有予定を提案できます。参加者の所有者が承認すると共有され、変更と取り消しも提案で行います。
- 関係・予定・同居の提案、郵便、贈り物の許可設定を追加し、重複した住民一覧を削除しました。
- キャラクター共有コードを作成し、写真と一緒に読み込めます。ログインが必要で、作成者は共有を中止できます。
- 家の所有者と管理者が共有家具の配置・回転・反転・大きさ・削除・ベッドの使用者、部屋名と階を編集できます。
- 家の編集中に以前の通知で別画面へ戻る問題を修正しました。
- タブレット横画面の上部装飾・展開ボタン・職業表示を調整し、郵便箱とマルチの内部見出しが内容と一緒にスクロールするようにしました。
- 寝室の会話と家の行動表示が現在の場面に合うよう修正しました。

## 검증 및 적용 범위
- 서비스 검사: 제안 수락·거절·모든 소유자 승인, 일정 종료 시간/거절된 변경 보존, 선물 중복 지급 방지, 집 소유권·오래된 수정 충돌, 공유 코드 사진 참조·공유 중단 권한.
- Chrome UI: 관계 기존 편집, 받은 제안·거절, 가구 추가·회전, 일정 제안, 선물 보내기, 개인 마을 데이터 보존, 태블릿 1280/1536 화면과 세 언어.
- Android: 서명 APK/AAB 생성, 실행 자산 236개 일치, 오프라인 시작·저장 후 재실행. 실제 두 기기 푸시 도착과 실계정 공유 코드 사진 다운로드는 아직 확인하지 못했습니다.
- 공통 웹 소스 및 멀티 서버 반영. iOS 신규 빌드·실기기 검증·심사 미실행.
- 전체 정적 UI 번역률: EN 2183/2871 (76.0%), JA 2182/2871 (76.0%). 새 화면 문구는 별도의 3개 언어 문구를 포함합니다.
- 남은 후속 범위: 공유 집 내부 사진·집 삭제/복구, 공유 반복 기념일의 전용 편집, 실기기 발열과 푸시. 기존 미완료 요청을 이번 완료 항목으로 처리하지 않습니다.
