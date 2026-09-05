# Android 운영 핫픽스 1.0.204.3 (code 231)

- 브랜치: `main`
- 기준 배포본: `1.0.204.2` / code `221`
- 빌드 표식: `20260906hotfix231`
- 상태: APK/AAB 생성 및 로컬 검증 완료. Google Play에는 업로드하지 않음.

## 원인

- Android 17 계열 일부 기기에서 Google Credential Manager 호출이 계정 선택창을 띄우지 않고 응답도 돌려주지 않아 로그인 버튼이 무반응처럼 남을 수 있었습니다.
- 앱 로그인에 실패하므로 동기화·불러오기와 로그인 필수 유료 상품 구매도 함께 진행할 수 없었습니다.

## 변경 사항

- Android 네이티브 로그인은 Activity 결과를 반환하는 Google 계정 선택창을 직접 열도록 변경했습니다.
- 로그인 버튼을 누르면 계정 선택창을 여는 중이라는 상태와 안내가 즉시 표시됩니다.
- 로그인 처리 중 중복 탭을 차단하고, 취소했을 때도 취소 안내를 표시합니다.
- 새 로그인 상태 안내를 한국어·영어·일본어로 반영했습니다.
- 로그인 전 기기 저장 캐릭터를 보존하고 로그인 계정으로 전환하는 기존 계정 격리·동기화 정책은 유지했습니다.

## 산출물

- `drawer-village-v1.0.204.3-code231-hotfix-debug.apk`
  - SHA-256: `4168E307F46FEFAB1DA0E1BD5E52818183FFBA3B63037397B365AF4525C1CCAA`
- `drawer-village-v1.0.204.3-code231-hotfix-release.aab`
  - SHA-256: `604EA9495771ED22C3A8ED2795E7842E309A9B8D7833CCC9B69D6245F10EF13C`

## 검증

- Android 17 모의 네이티브 환경에서 로그인 버튼이 `useCredentialManager: false` 계정 선택창을 정확히 한 번 호출하고 Firebase JS 자격 증명으로 연결하는 동적 검사 통과
- 계정 선택창 진행 안내 및 중복 탭 방지 정적·동적 검사 통과
- 계정 전환·게스트 저장 보존·클라우드 병합·수동 불러오기 회귀검사 통과
- Google Play 상품 조회·구매·서버 지급·중복 지급 방지 회귀검사 통과
- Gradle `clean assembleDebug bundleRelease` 성공
- 패키지 `com.drawervillage.app`, versionCode `231`, versionName `1.0.204.3` 확인
- APK 안의 Google 로그인 플러그인 등록과 `useCredentialManager: false` 로그인 자산 확인
- AAB 서명 확인 (`jar verified`)

## 번역

- 한국어: 이번 변경 문구 반영 완료
- 영어: 2083/2771 (75.2%)
- 일본어: 2082/2771 (75.1%)
