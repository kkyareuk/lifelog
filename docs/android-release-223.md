# Android 1.0.206 · versionCode 223

2026-09-05 `dev` 내부 테스트 빌드입니다. Play Console 업로드·배포는 진행하지 않았습니다. Play Console에 이미 `versionCode 223` 이상이 등록되어 있다면 이 AAB를 업로드하지 말고 더 큰 버전 코드로 다시 빌드해야 합니다.

## 파일

- 바로 설치용 APK: `drawer-village-v1.0.206-code223-dev-debug.apk`
- Play Console 업로드용 AAB: `drawer-village-v1.0.206-code223-dev-release.aab`
- APK SHA-256: `1D78CF1882ED0D6B5290154F1CE685CCF72E690584C17BF849B64314766DF0D3`
- AAB SHA-256: `25ADB2E89EB3540B04E1482C845ACBA89D49D3A00222453606FB95C3DC10C662`

## 한국어 출시 노트

서랍마을 1.0.206 업데이트

- 집중·휴식 같은 일반적인 장면 문구에서도 지금 사용 중인 찻잔·음료·음식 사진이 행동에 맞게 움직입니다.
- 의상 취향과 개인 취향을 포함한 다중 선택 메뉴에서 선택창을 닫으면 선택 개수가 바로 갱신됩니다.
- 첫 캐릭터를 만든 뒤 처음 Google 로그인해도 캐릭터와 기기 저장 데이터가 그대로 유지되고 계정에 동기화됩니다.

## English release notes

Drawer Village 1.0.206 Update

- Tea, drink, and food photos now animate according to the item being used, even when the surrounding scene uses a general focus or rest description.
- Multi-select summaries, including clothing and personal preferences, now refresh immediately when the selection dialog closes.
- Characters and device data created before the first Google sign-in are now preserved and synced to the account.

## 日本語リリースノート

ひきだし村 1.0.206 アップデート

- 集中・休憩など一般的なシーン説明でも、使用中のティーカップ・ドリンク・食べ物の画像が行動に合わせて動くようになりました。
- 衣装の好みや個人の好みを含む複数選択メニューで、選択ダイアログを閉じた直後に選択数が更新されるようになりました。
- 最初のキャラクターを作成した後に初めてGoogleログインしても、キャラクターと端末内のデータが保持され、アカウントに同期されるようになりました。

## 검증

- 전용 223 회귀검사에서 일반 `idle` 장면의 음료·음식 소품 동작 분류, 선택 요약 즉시 동기화, 첫 로그인 보존 경로를 검사했습니다.
- 실제 로그인·클라우드 모의 검사에서 게스트 첫 캐릭터의 계정 복사와 업로드, 원래 게스트 복구본 유지, 계정 간 자동 혼합 방지, 지연된 다른 계정 동기화 차단을 확인했습니다.
- 선택 상태 연속성, 캐릭터 편집 UI, 취향 팝업, 기존 제보 버그 회귀검사를 통과했습니다. 과거 버전 번호를 고정으로 검사하는 구형 스크립트의 버전 불일치와 221에서 확정된 사용자 선택 UI 글꼴 정책을 이전 고정 글꼴 정책으로 검사하는 항목은 현재 223에서 예상된 결과입니다.
- 웹 빌드, Android 자산 준비, 32개 모듈 의존성, 214개 빌드 자산의 AAB 바이트 일치를 검증했습니다.
- debug APK에서 `versionCode 223`, `versionName 1.0.206`, 패키지 `com.drawervillage.app`을 확인했습니다.
- release AAB는 `jar verified` / 종료 코드 0입니다. 자체 서명 체인·타임스탬프 없음과 ZIP 엔트리 읽기 차이 경고는 남아 있습니다.
- 전체 UI 정적 번역률: 영어 2083/2771 (75.2%), 일본어 2082/2771 (75.1%). 이번 변경의 출시 노트는 한국어·영어·일본어로 작성했습니다.
- 실제 Galaxy 기기에서의 체감 확인과 Play Console 업로드 검증은 아직 진행하지 않았습니다.
