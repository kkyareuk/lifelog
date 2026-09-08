# 서랍마을 1.0.215.12 (274) 핫픽스

버전 코드 274의 운영판 기반 Android APK/AAB입니다. 273의 생활 장면 복구·음료·정신건강 지식 관련 수정도 포함합니다.

## 한국어
- 사진 포함 캐릭터 공유 코드를 만들고, 받은 코드의 캐릭터를 미리 본 뒤 새 캐릭터로 불러올 수 있습니다.
- 프로필 사진·SD·LD·상황별 이미지 설정을 함께 불러옵니다. 원본 캐릭터와 별도로 편집하며, 기존 관계·생활 기록·소지품 연결은 복제하지 않습니다.
- 내보내기는 캐릭터의 ‘프로필 내보내기’, 불러오기는 같은 창 또는 ‘설정 → 계정·백업’에서 이용합니다. 로그인과 남은 캐릭터 슬롯이 필요합니다.
- 옷장은 인물별로 30개까지 추가 등록할 수 있습니다. 이미 30개를 넘긴 옷은 자동 삭제하지 않으며 기존 옷의 수정·삭제는 가능합니다.
- 인지·감각·상호작용의 긴 선택지와 하단 완료 버튼이 잘리지 않도록 수정했습니다.
- 전체설정의 기분과 정서 성향 페이지에 신체 접촉 반응을 추가했습니다. 촉각에 둔감함·간지럼·갑작스러운 접촉에 놀람·낯선 기척 경계 등을 선택할 수 있습니다.
- 이인관과 그룹관의 공식 관계에 사제 관계와 관련 단계를 추가했습니다.

## English
- Create a character sharing code with photos, preview a received code, and import it as a new character.
- Profile photos, SD/LD art, and scene image settings are included. Imported characters are edited independently; existing relationships, life history, and inventory links are not copied.
- Export from the character profile export menu. Import there or under Settings → Account & backup. Sign-in and a free character slot are required.
- Each character can register up to 30 wardrobe items. Existing items above the limit are kept, and editing/removing existing clothing remains available.
- Fixed clipping of long cognitive, sensory, and interaction choices and the completion button.
- Added physical-contact responses to the emotional temperament page, including reduced touch sensitivity, ticklishness, startling at unexpected touch, and wariness of unfamiliar people approaching.
- Added teacher–student relationships and stages for pairs and groups.

## 日本語
- 写真付きのキャラクター共有コードを発行し、受け取ったコードをプレビューして新しい人物として読み込めます。
- プロフィール写真・SD・LD・状況別画像設定を含みます。元の人物とは別に編集でき、既存の関係・生活記録・持ち物の参照は複製しません。
- 書き出しは人物のプロフィール書き出しから、読み込みは同じ画面または設定のアカウント・バックアップから利用できます。ログインと空きキャラクター枠が必要です。
- クローゼットは一人につき30着まで追加登録できます。既に上限を超えた服は自動削除せず、編集・削除も引き続き可能です。
- 認知・感覚・関わり方の長い選択肢と完了ボタンが切れる問題を修正しました。
- 全体設定の感情傾向ページに身体接触への反応を追加しました。触覚の鈍さ、くすぐったがり、突然の接触への驚き、見慣れない人の気配への警戒などを選べます。
- 二人・グループの公式関係に師弟関係と関係段階を追加しました。

## 검증·배포 상태
- 캐릭터별 30개 제한·수정·삭제, 사진/LD 및 새 ID·집 보존, 슬롯 부족 시 되돌리기, 이인관/그룹관 사제 관계 저장 검사 통과.
- 코드 발행의 선택 캐릭터만 처리하는 흐름, 서버 코드 사진 참조·원본 소유자만 중단 가능 검사 통과.
- 384px 브라우저에서 긴 문장·완료 버튼 시각 검사, 신체접촉 반응 저장, 코드 미리보기/불러오기, 기존 생활 계산 오류·음료 저장 회귀 검사 통과.
- Android 증분 빌드의 외부 파일 캐시를 바로잡고 최종 APK/AAB 실행 자산 211개 일치·서명·오프라인 실행·저장 재실행 검사 완료.
- 코드 UI/API는 자동 검사로 검증했습니다. 두 실계정·실기기 사이 사진 공유는 미확인입니다. 기존 배포된 캐릭터 코드 서버를 사용하며 이번에 서버를 다시 배포하지 않았습니다.
- Play Console 업로드와 iOS 빌드/업로드는 하지 않았습니다. dev에는 같은 기능/제한/화면 및 빌드 수정의 소스를 반영하며 별도 dev 설치 파일은 만들지 않았습니다.
- 운영 UI 번역률: 영어 2130/2817 (75.6%), 일본어 2129/2817 (75.6%). dev: 영어 2197/2885 (76.2%), 일본어 2196/2885 (76.1%).
