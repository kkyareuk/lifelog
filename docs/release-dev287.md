# 서랍마을 1.0.254 / 개발판 287

## 한국어
- 캐릭터 그룹 선택창이 터치를 받지 못하던 문제를 수정했습니다. 주민등록증 위에서 내 마을과 멀티 그룹을 전환할 수 있습니다.
- 운영자와 관리자를 ‘관리자’로 통일했습니다. 역할 선택·규칙·우편 수신 대상에 하나의 관리자 항목을 표시합니다.
- 기존 운영자의 관리 권한을 유지하며, ‘관리자에게 공지’에 기존 운영자도 포함됩니다.

- 캐릭터 전환 시 다른 마을로 이동하면서 즉시 전체 저장하던 처리를 뒤로 미루고, 화면 선택만으로 계정 동기화를 요청하지 않도록 했습니다. 현재 캐릭터 그림은 우선 불러옵니다.

## English
- Fixed the character-group selector not responding to touch. Switch between your town and multiplayer groups above the resident ID card.
- Combined Operator and Manager into Administrator in role selection, rules and mail recipients.
- Existing operators retain administrative access and receive announcements addressed to administrators.

- Character switches defer full saves when changing towns and no longer request cloud sync for selection alone. Current portraits load eagerly.

## 日本語
- キャラクターのグループ選択がタッチに反応しない問題を修正しました。住民登録証の上で自分の村とマルチグループを切り替えられます。
- 運営者と管理者を「管理者」に統一し、役割・ルール・郵便の宛先を整理しました。
- 既存の運営者の管理権限は維持され、管理者宛のお知らせも届きます。
- キャラクター切替時の村移動による即時の全体保存を遅延し、表示の選択だけではクラウド同期を要求しません。表示中の人物画像を優先して読み込みます。
