# Android 1.0.204.2 · versionCode 221

2026-09-05 프로덕션 219용 긴급 핫픽스입니다. 220 빌드는 캐릭터 진입 흐름을 잘못 해석해 Play Console 업로드 전에 폐기했으며, 221이 이를 바로잡아 대체합니다. Play Console 업로드와 프로덕션 심사 제출은 사용자가 진행해야 합니다.

## 파일

- 바로 설치용 APK: `drawer-village-v1.0.204.2-code221-hotfix-debug.apk`
- Play Console 업로드용 AAB: `drawer-village-v1.0.204.2-code221-hotfix-release.aab`
- APK SHA-256: `B0E3428382745BD86670EB4F884BBBAAD0F36550B1BD262B8271062E4418A286`
- AAB SHA-256: `DF079E0841F749FBB75FAF50A02957560F86347C87299D642E83E2FDC6D2E4D2`
- Android 빌드 메타데이터 `versionCode 221` / `versionName 1.0.204.2`를 확인했습니다.
- release AAB 서명은 jarsigner `jar verified`/종료 코드 0이며, 준비 자산 214개와 번들 내부 파일 SHA-256이 모두 일치합니다.
- 자체 서명 체인·타임스탬프 없음 및 ZIP 엔트리 순서 관련 jarsigner 경고는 있습니다. Play Console 업로드 검증은 아직 하지 않았습니다.
- Play Console에 이미 221 이상이 올라가 있다면 이 AAB를 올리지 말고 더 큰 versionCode로 다시 빌드해야 합니다.

## 한국어 출시 노트

서랍마을 1.0.204.2 업데이트

- 첫 캐릭터를 만들거나 캐릭터 탭을 열면 캐릭터 메인 화면이 먼저 표시됩니다.
- 빠른설정과 전체설정을 서로 독립된 메뉴로 분리했습니다.
- 빠른설정에 항상 보이는 뒤로가기와 저장 버튼을 추가하고 앱에서 선택한 UI 글꼴이 일관되게 적용되도록 수정했습니다.
- 전체설정의 뒤로가기는 캐릭터 메인 화면으로 돌아가며, Android 시스템 뒤로가기도 같은 순서를 따릅니다.
- 캐릭터 메인 화면에서 사용하지 않는 전체설정 화면을 미리 만들지 않도록 해 캐릭터가 많을 때의 탭 전환 부담을 줄였습니다.
- 마을 산책과 발소리 처리의 불필요한 화면 계산을 줄여 끊김과 발열을 개선했습니다.

## English release notes

Drawer Village 1.0.204.2 Update

- Creating the first character or opening the Character tab now shows the character hub first.
- Quick Settings and Full Settings are now separate choices.
- Quick Settings now has persistent Back and Save buttons and consistently uses the selected app UI font.
- Back from Full Settings returns to the character hub, and the Android system Back action follows the same order.
- The app no longer builds the unused Full Settings screen while the hub is open, reducing character-tab workload when many characters exist.
- Reduced unnecessary layout work during village walks and footstep playback to improve smoothness and heat usage.

## 日本語リリースノート

ひきだし村 1.0.204.2 アップデート

- 最初のキャラクター作成後とキャラクタータブを開いた時に、キャラクターのメイン画面が最初に表示されるようになりました。
- かんたん設定と全体設定をそれぞれ独立したメニューに分けました。
- かんたん設定に常時表示される戻る・保存ボタンを追加し、選択中のアプリUIフォントが統一して反映されるよう修正しました。
- 全体設定から戻るとキャラクターのメイン画面へ移動し、Androidのシステム戻る操作も同じ順序で動作します。
- メイン画面を開いている間は未使用の全体設定画面を生成しないようにし、キャラクターが多い時のタブ切り替え負荷を軽減しました。
- 村の散歩と足音再生に伴う不要なレイアウト計算を減らし、動作の滑らかさと発熱を改善しました。

## 검증

- `scripts/check-hotfix-221.mjs`에서 첫 생성·탭 진입의 허브 우선, 빠른설정/전체설정 분리, 빠른설정 뒤로가기·저장·글꼴, 전체설정의 허브 복귀를 검사했습니다.
- 메뉴 이동 경계 9종, 성능·발열 안정성 10종, 걸음걸이·가족 관계·태블릿 캐릭터 회귀검사를 통과했습니다.
- 웹 빌드, Android 앱 자산 준비, 모듈 의존성 검사, debug APK와 signed release AAB 빌드를 통과했습니다.
- Android 패키지의 준비 자산 214개가 서명 AAB와 바이트 단위로 일치함을 확인했습니다.
- 전체 UI 정적 번역률: 영어 2083/2771(75.2%), 일본어 2082/2771(75.1%). 이번 변경의 새 사용자 문구는 영어·일본어를 모두 추가했습니다. 이 수치는 동적 생활 로그 전체의 번역률은 아닙니다.
- 실제 Galaxy 기기의 기존 219 설치본 위 업데이트와 장시간 체감 확인은 Play 배포 전 마지막 확인으로 남아 있습니다.
