# 서랍마을 개발판 1.0.245 (278) 업데이트

2026-09-08 · 이전 제공 개발판277 이후 변경사항입니다.
운영 main274는 유지하며 Play Console 업로드와 iOS 제출은 하지 않았습니다.

## 한국어 · Discord 공지용

이번 업데이트에서 변경된 주요 내용을 안내드립니다.

✨ 새로운 기능
- 집 안의 침대·욕조·샤워기·의자에서 성인 캐릭터가 둘만의 시간을 보낼 수 있습니다. 서로의 접촉 설정을 확인하고, 두 사람이 모두 도착한 뒤 따뜻한 하트와 다가서는 애정 연출을 보여줍니다.
- 멀티 정보에서 그룹 이름과 설명, 대표 사진을 설정할 수 있습니다.

🎨 UI/UX
- 우편함 목록을 제목·날짜·본문 미리보기 중심으로 정리했습니다. ‘편지 · 전달됨’과 발신자 표시를 제거했습니다.
- 편지지를 얇은 테두리와 따뜻한 종이 색으로 다듬고 캐릭터 배경은 편지 안쪽에만 표시합니다.
- 우편함 뒤로가기 버튼의 위치와 크기를 조정하고, 우편함에 30일 삭제 안내를 표시합니다.
- 집 유형·층수 표시를 홈 화면 시계와 같은 높이와 오른쪽 위치에 맞췄습니다.
- 멀티 설정을 멀티 정보와 2열 관리 메뉴로 정리했습니다. 멤버·마을·사전·규칙은 각각 별도 화면에서 관리합니다.
- 방장은 구성원 화면에서 ‘입주하기’로 표시되며 바로 입주할 수 있습니다.
- 사전은 종류를 선택하면 현재 개수/80으로 표시합니다. 전체 보기에는 총 개수와 종류별 최대80개를 표시합니다.

🔧 개선 사항
- 받은 우편은 30일 이후 목록에서 사라지고, 서버의 만료 우편은 매일 오전3시(한국 시간) 정리됩니다. 이미 수락된 관계·일정과 전달된 선물은 유지됩니다.
- 그룹 사전 공유 시 사진 카드에서 물품을 골라 공유합니다. 같은 ID나 같은 이름의 물품은 중복 추가하지 않습니다. 종류별80개 제한을 유지합니다.
- 방문 가능한 집 목록과 별도 방문 제한을 없앴습니다. 그룹의 집은 집 탭에서 확인합니다.
- 편지 본문과 그룹 설명은500자까지 입력할 수 있습니다. 일반 텍스트 설정도500자로 제한하되, 더 짧은 기존 제한은 유지합니다. 기존 저장된 긴 내용을 일괄 삭제하지 않습니다.

🐛 오류 수정
- 씻기·독서·취미 등 혼자 하는 지시에서도 목적지까지 걸어가도록 수정했습니다.
- 지시로 이동하는 캐릭터의 발소리가 빠지던 문제를 수정했습니다.
- 저장한 좌우 순서에 무작위 정렬이 다시 적용되던 문제를 수정했습니다.
- 멀티 설정 갱신 때 관리 화면의 스크롤과 작성 중 내용이 초기화되던 문제를 수정했습니다.

## English

- Adult private-time scenes require a bed, bath, shower or chair inside a home. Both characters walk to the location, respect contact preferences and begin a non-graphic warm-heart/approach animation after arriving.
- Added editable group name, description and cover to multiplayer information, followed by a two-column menu for members, towns, dictionary and rules.
- Mail lists now focus on subject, date and preview. Refined the paper design, back-button geometry and visible 30-day retention notice.
- Expired received mail is removed from the server during daily cleanup at03:00 Korea time. Accepted relationships, schedules and delivered gifts remain.
- Dictionary sharing opens item selection and skips duplicate IDs or names, retaining the80-per-category limit. Category counters show the actual capacity.
- Removed the separate visitable-house list/restriction; use the home tab. Hosts see a direct Move in action.
- Limited message bodies, group descriptions and ordinary text settings to500 characters, retaining tighter existing limits.
- Fixed solo-action teleporting, missing directed-walking sounds, reordered left/right preferences and multiplayer settings scroll/draft resets.

## 日本語

- 成人キャラクターの二人だけの時間は、家のベッド・浴槽・シャワー・椅子で行います。接触設定を尊重し、二人とも歩いて到着した後に、温かなハートと近づく演出を表示します。露骨な描写はありません。
- マルチ情報でグループ名・説明・代表写真を編集できます。その下にメンバー・村・辞典・ルールの2列メニューを配置し、各画面で管理します。
- 郵便一覧を件名・日付・本文のプレビューに整理し、便せん・戻るボタン・30日削除の案内を改善しました。
- 期限切れの受信郵便は、毎日韓国時間03:00の処理でサーバーから削除します。承認済みの関係・予定・配達済みの贈り物は保持します。
- 辞典の共有は品物を選択して行い、同じIDや名前の重複を追加しません。カテゴリごとに80件までとし、選択中のカテゴリには件数/80を表示します。
- 訪問可能な家の一覧と個別の訪問制限を廃止しました。家タブから利用します。ホストには直接入居するボタンを表示します。
- 手紙本文・グループ説明・通常のテキスト設定は500文字までとし、既存のより短い上限は維持します。
- 一人への行動指示で瞬間移動する問題、歩行音の欠落、左右順序の再抽選、マルチ設定のスクロール・入力内容のリセットを修正しました。

## 검증 범위

- 방 이동과 가구 제한, 두 사람의 도착 시점, 좌우 순서, 서버 우편 삭제 배치, 사전 중복과80개 제한, 관리 권한과500자 설명 검사.
- 멀티 UI 회귀, 관리 화면 이동과 입력 유지, 편지320/412/768px·휴대폰 작성 화면 검사.
- APK/AAB 실행 파일·에셋 일치, 서명·버전, 패키지 오프라인 시작/저장/재실행 확인.
- 실제 Android 두 기기에서의 발소리·발열과 동시 플레이, 실제 청구 금액 및 iOS 서명 빌드는 미검증입니다.
- 영어2197/2885(76.2%), 일본어2196/2885(76.1%). 이번 추가 문구는 한국어·영어·일본어로 작성했습니다.
