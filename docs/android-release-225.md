# Android 1.0.208 · versionCode 225

2026-09-06 `dev` 내부 테스트 빌드입니다. Play Console 업로드·배포는 진행하지 않았습니다. Play Console에 이미 `versionCode 225` 이상이 등록되어 있다면 이 AAB를 업로드하지 말고 더 큰 버전 코드로 다시 빌드해야 합니다.

## 파일

- 바로 설치용 APK: `drawer-village-v1.0.208-code225-dev-debug.apk`
- Play Console 업로드용 AAB: `drawer-village-v1.0.208-code225-dev-release.aab`
- APK SHA-256: `EDB319F0AC4E825A5E9C397A73FA18AEA9025388AC30BE475CD588940BCFD7C1`
- AAB SHA-256: `3787D0B81825588F7160C413CE5EE47B9D1806D9429C6533FF9D039DC6AED189`

## 한국어 출시 노트

서랍마을 1.0.208 업데이트

- Android 태블릿의 세로 고정을 해제하고, 가로·세로 방향에 맞는 기존 태블릿 화면 구성을 복원했습니다.
- 캐릭터 목록 오른쪽이 비어 있던 문제를 수정해 선택한 캐릭터 정보와 빠른설정·전체설정 바로가기가 표시됩니다.
- 가로 태블릿의 전체설정은 펼친 책 양쪽을 한 번에 보여 주며, 한 번 넘길 때 두 페이지씩 이동합니다. 휴대폰과 세로 태블릿은 한 페이지 구성을 유지합니다.
- 태블릿 마을에서 장식 주변에 보이던 큰 흰색 선택 테두리를 제거했습니다.
- 세로 태블릿 관찰 화면의 캐릭터를 스마트폰과 같은 화면 비율로 키우고, 상태 카드 바로 위에 배치해 공중에 뜬 것처럼 보이지 않게 했습니다.
- 태블릿에서 상단 정보와 메뉴 글자가 눌리거나 화면 밖으로 밀리던 문제를 수정했습니다.

## English release notes

Drawer Village 1.0.208 Update

- Restored orientation-aware tablet layouts on Android instead of forcing tablets into portrait phone mode.
- Fixed the empty character details panel so the selected character's information and Quick/Full Settings shortcuts are visible.
- Full Settings now displays a complete two-page book spread on landscape tablets and turns two pages at a time. Phones and portrait tablets keep the single-page view.
- Removed the large white selection outlines that appeared around town decorations on tablets.
- Resized and anchored characters above the status card on portrait tablets to match the phone composition instead of appearing to float.
- Fixed compressed or off-screen header and menu text on tablet layouts.

## 日本語リリースノート

ひきだし村 1.0.208 アップデート

- Androidタブレットを縦向きのスマートフォン表示に固定せず、画面の向きに合う従来のタブレット構成へ戻しました。
- 人物一覧の右側が空白になる問題を修正し、選択中の人物情報とクイック設定・全設定へのボタンを表示します。
- 横向きタブレットの全設定では、見開きの本を左右2ページ同時に表示し、1回で2ページずつ移動します。スマートフォンと縦向きタブレットは1ページ表示を維持します。
- タブレットの村で装飾の周囲に表示されていた大きな白い選択枠を削除しました。
- 縦向きタブレットの人物をスマートフォンと同じ画面比率に拡大し、状態カードの直上に固定して浮いて見えないようにしました。
- タブレットで上部情報やメニュー文字がつぶれたり画面外へずれたりする問題を修正しました。

## 검증

- SM-X700 진단값에 맞춘 Android WebView 에뮬레이션에서 1205×753 가로와 753×1205 세로 전환을 검사했습니다.
- 가로 태블릿에서 캐릭터 상세 패널 표시, 2페이지 펼침, 2페이지 단위 이동과 화면 전체 책 배치를 확인했습니다.
- 세로 태블릿에서 단일 책 페이지 유지, 관찰 캐릭터의 하단 고정, HUD·상태 카드·하단 메뉴의 화면 내 배치를 확인했습니다.
- 태블릿 마을 장식의 계산 스타일이 `border: 0`, `outline: 0`, 투명 배경인지 확인했습니다.
- 첫 로그인 게스트 캐릭터 보존·업로드·복구본 유지, 캐릭터 편집, 선택 상태 연속성, 제보 오류, 태블릿 보행 회귀검사를 통과했습니다.
- Android 앱 자산 준비와 동기화, 32개 모듈 의존성, 214개 빌드 자산의 AAB 바이트 일치를 확인했습니다.
- `clean assembleDebug bundleRelease`가 성공했습니다. debug APK에서 패키지 `com.drawervillage.app`, `versionCode 225`, `versionName 1.0.208`을 확인했으며 세로 고정·제한 크기 호환 속성이 없음을 확인했습니다.
- release AAB는 `jar verified` / 종료 코드 0입니다. 자체 서명 체인과 타임스탬프 없음 경고는 남아 있습니다.
- 전체 UI 정적 번역률: 영어 2090/2778 (75.2%), 일본어 2089/2778 (75.2%). 이번에 추가한 캐릭터 패널·펼친 책 문구는 영어·일본어 모두 번역했습니다.
- 기존 관찰 HUD 검사는 code 221 이후의 사용자 글꼴 선택 정책 및 새 제목 위치와 충돌하는 과거 고정 기대값 2개가 남아 있고, 기존 마을 격자 검사는 이후 UI 개편과 충돌하는 과거 기대값 6개가 남아 있습니다. 이번 태블릿 전용 검사와 실제 계산 스타일 검사는 통과했습니다.
- 실제 Galaxy 태블릿 설치 체감 확인과 Play Console 업로드는 아직 진행하지 않았습니다.
