# 서랍마을 개발판 1.0.244 (277) 업데이트

2026-09-08 · 이전 제공 개발판 276 이후 변경사항입니다.
운영 main274는 유지합니다. Play Console 업로드 및 iOS 제출은 하지 않았습니다.

## 한국어 · Discord 공지용

이번 업데이트에서 변경된 주요 내용을 안내드립니다.

✨ 새로운 기능
- 성인 캐릭터끼리 둘만의 시간을 보내는 스킨십하기 행동을 추가했습니다. 신체접촉 설정을 확인하며 노골적인 묘사는 표시하지 않습니다.
- 집 안에서 선물을 건네는 장면에 선물 전달 효과를 추가했습니다.

🎨 UI/UX
- 우편함의 중복 상단바와 바깥 틀을 없애고 나무 배경이 화면을 채우도록 수정했습니다.
- 받은 우편·보낸 우편·쓰기의 색과 간격을 정리하고, 보내기 버튼이 잘리지 않도록 작성 화면을 개선했습니다.
- 편지의 보내는 이와 받는 이를 구분해 표시합니다. 캐릭터 편지의 큰 배경 아이콘은 편지지 안쪽에서만 보입니다.
- 집에서는 캐릭터 아이콘의 배경은 투명하게 두고 이름·행동 설명에만 밝은 이름표를 표시합니다. 둘의 좌우 설정을 반영합니다.
- 사전 물품 선택 사진을 일정한 정사각형으로 맞췄습니다. 원본 사진은 바꾸지 않습니다.
- 할 일 정하기를 상대·행동을 고르는 단계로 정리하고, 뒤로가기로 이전 선택 단계에 돌아가도록 개선했습니다.

🐛 오류 수정
- 직접 보낸 편지가 받은 우편에도 중복 표시되던 문제를 수정했습니다.
- 캐릭터 알림과 질문을 받은 우편 목록에 통합하고 별도의 ‘캐릭터의 편지와 부탁’ 영역을 없앴습니다. 받은 우편은 30일 이후 목록에서 사라집니다.
- 새 상호작용을 시켰을 때 이전 상대가 계속 선물을 주거나 함께 행동하는 것으로 남는 모순을 수정했습니다. 이미 전달된 선물과 기록은 유지됩니다.

🔧 개선 사항
- 이동 애니메이션은 기기에서 계산하며 좌표를 연속 저장하지 않습니다. 선물 행동 교체 시에도 그룹 전체가 아닌 관련 캐릭터만 확인하도록 개선했습니다.

## English

- Added non-graphic private time for adult characters, respecting contact preferences, and a gift-passing effect inside homes.
- Made the mailbox fill its screen, removed the duplicate app header and refined folder, compose and letter layouts. The Send button remains reachable by scrolling.
- Distinguished sender and recipient, retaining the large character watermark clipped inside the paper.
- Restored readable name/activity captions beneath transparent home portraits, respecting left/right ordering.
- Standardized dictionary picker photos to square crops without changing original images.
- Organized activity selection into character/action steps with return navigation.
- Kept outgoing personal mail out of the inbox; merged character notifications and questions into received mail. Received entries disappear from the list after 30 days.
- Released previous interaction partners when a new action replaces their activity, preserving delivered gifts and history.
- Movement is calculated locally without continuous coordinate saves. Gift replacement checks only relevant characters instead of the whole group.

## 日本語

- 接触設定を尊重する成人キャラクター同士の「二人だけの時間」と、家の中で贈り物を渡す演出を追加しました。露骨な描写はありません。
- 郵便箱を画面全体に広げ、二重のヘッダーを削除しました。受信・送信済み・作成・手紙の配色と配置を整え、送信ボタンまでスクロールできるようにしました。
- 差出人と宛先を分けて表示します。大きなキャラクター背景は便せんの内側に収まります。
- 家のアイコン背景は透明に保ち、名前と行動だけに読みやすい背景を戻しました。左右の設定を反映します。
- 辞典の選択画像を正方形に統一しました。元の画像は変更しません。
- 行動の指示を相手・行動の選択段階に整理し、前の段階へ戻れるようにしました。
- 自分が送った手紙が受信一覧にも出る問題を修正しました。キャラクターの通知・質問は受信一覧にまとめ、30日を過ぎた受信項目は一覧から消えます。
- 新しい交流を始めたときに前の相手が古い行動を続ける問題を修正しました。配達済みの贈り物や記録は保持します。
- 移動は端末で計算し、座標を連続保存しません。贈り物の行動変更では関連するキャラクターのみを確認します。

## 검증 및 범위

- 로컬/서버 상호작용 교체, 성인 조건, 알림 30일 보관, 멀티 UI 회귀, 320/412/768px 편지와 412px 작성 화면 검증.
- APK/AAB 각각 239개 실행 파일·에셋 일치, 서명, 277/1.0.244 버전 및 패키지 오프라인 시작/저장/재시작 검증을 통과했습니다. 멀티 서버 수정도 배포했습니다.
- 실제 기기 두 계정 동시 플레이, 발열 및 청구 금액 측정은 이번 자동 검증에 포함되지 않습니다.
- 공유 서버 우편은 30일 이후 목록에서 제외합니다. 서버 문서 자체의 TTL 일괄 삭제를 새로 설정한 것은 아닙니다.
- 번역 진행률: 영어 2197/2885 (76.2%), 일본어 2196/2885 (76.1%). 이번 추가 문구는 세 언어로 작성했습니다.
