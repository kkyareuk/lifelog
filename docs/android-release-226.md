# Android 1.0.209 · versionCode 226

2026-09-06 `dev` 내부 테스트 빌드입니다. Play Console 업로드·배포는 진행하지 않았습니다. Play Console에 이미 `versionCode 226` 이상이 등록되어 있다면 이 AAB를 업로드하지 말고 더 큰 버전 코드로 다시 빌드해야 합니다.

## 파일

- 바로 설치용 APK: `drawer-village-v1.0.209-code226-dev-debug.apk`
- Play Console 업로드용 AAB: `drawer-village-v1.0.209-code226-dev-release.aab`
- APK SHA-256: `37EBD3C374CEB7B69B75720BCD80FEBDFE60D9EC0AAE13BDA2F2CA95F7F5BF26`
- AAB SHA-256: `31083143C7958C792C74042FB85BB9FC3B0F705998A88BFE321E844C307A7909`

## 한국어 출시 노트

서랍마을 1.0.209 업데이트

- 메인 관찰 화면의 원래 제목 크기와 위치를 복원하고, 집·마을 제목만 그 기준에 정확히 맞췄습니다.
- 두 캐릭터가 침대에서 함께 시간을 보낼 때 머리를 베개 쪽에 두고 더 크게 보이도록 배치했습니다.
- 침대 활동 중 캐릭터가 이불 아래에서 천천히 움직이며, 이름과 행동 요약은 두 사람에게 하나의 카드로 표시됩니다.
- 침대 활동 상태 카드를 이불과 침대 하단 프레임보다 앞에 표시해 가려지지 않게 했습니다.
- Android 태블릿의 가로·세로 화면 구성을 복원하고, 캐릭터 상세 패널·가로형 두 페이지 설정책·마을 장식 테두리·관찰 화면 배치를 수정했습니다.

## English release notes

Drawer Village 1.0.209 Update

- Restored the original Observe-screen title position and size, then aligned only Home and Town titles to that baseline.
- Enlarged and repositioned both character icons toward the pillows during shared bed activities.
- Characters now move gently under the quilt while spending time together, with one shared name and activity summary card.
- Moved the bed activity card in front of the quilt and footboard so it remains readable.
- Restored orientation-aware Android tablet layouts and fixed the character details panel, landscape two-page settings book, town decoration outlines, and Observe-screen composition.

## 日本語リリースノート

ひきだし村 1.0.209 アップデート

- 観察画面の元のタイトル位置と文字サイズを復元し、家・村のタイトルだけをその基準に揃えました。
- 2人でベッドにいる活動では、人物アイコンを大きくして枕側へ配置しました。
- 2人が一緒に過ごしている間は布団の下でゆっくり動き、名前と行動要約を1枚の共有カードにまとめて表示します。
- ベッド活動カードを布団と足元フレームより手前へ移し、隠れないようにしました。
- Androidタブレットの縦横レイアウトを復元し、人物詳細欄・横向きの見開き設定本・村装飾の枠・観察画面の配置を修正しました。

## 검증

- 휴대폰 592×1285와 태블릿 가로 1205×753에서 메인·집·마을 제목 글자의 X/Y 좌표, 글자 크기, 줄 높이가 각각 일치하는지 실제 계산 스타일로 확인했습니다.
- 휴대폰 384×853과 태블릿 세로 753×1205에서 침대 캐릭터의 크기·베개 정렬·이불 아래 레이어·전용 움직임·공유 상태 카드와 전경 레이어를 확인했습니다.
- 캐릭터 편집, 태블릿 보행, 제보 오류, 새 캐릭터 생활 시작, 선택 상태 연속성 회귀검사를 통과했습니다.
- 첫 로그인 시 로그인 전 게스트 캐릭터를 계정으로 가져와 업로드하고 복구본을 보존하는 검사를 통과했습니다.
- JavaScript 구문 검사와 `git diff --check`를 통과했습니다.
- `clean assembleDebug bundleRelease`가 성공했습니다. debug APK에서 패키지 `com.drawervillage.app`, `versionCode 226`, `versionName 1.0.209`를 확인했으며 세로 고정·제한 크기 호환 속성이 없음을 확인했습니다.
- release AAB는 `jar verified`입니다. 자체 서명 체인과 타임스탬프 없음 경고는 기존과 같습니다.
- 전체 UI 정적 번역률: 영어 2090/2778 (75.2%), 일본어 2089/2778 (75.2%). 이번 변경은 기존 번역 가능한 이름·행동 문구를 재사용하며 새 미번역 사용자 문구를 추가하지 않았습니다.
- 실제 Galaxy 태블릿 설치 체감 확인과 Play Console 업로드는 아직 진행하지 않았습니다.
