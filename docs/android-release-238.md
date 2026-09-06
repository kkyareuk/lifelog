# Android hotfix 238

- Version name: `1.0.215.2`
- Version code: `238`
- Baseline: production `1.0.215` / code `233`, including hotfix `236`
- Cache marker: `20260906hotfix238`

## Player-visible fixes

- 캐릭터 설정의 홈 화면 배치값이 의상별 기본 배치에 다시 덮여 실제 관찰 화면에 적용되지 않던 문제를 수정했습니다.
- 기존에 비기본 좌표로 저장한 캐릭터 배치는 자동으로 캐릭터 전용 배치로 인식해 복구합니다.
- 배치 편집 화면 아래에 안전 영역 위로 고정되는 `배치 저장` 버튼을 추가했습니다.
- 관계 시선 설정 스크롤과 첫 Google 로그인 캐릭터 보호를 포함한 code 236 수정도 유지합니다.

## Verification

- `npm run test:hotfix238`
- `npm run qa:hotfix238` at Android viewport `384 × 784`
- placement persistence, relationship, account-isolation and reported-bug regression checks
- Android `clean assembleDebug bundleRelease` succeeded
- APK manifest reports `versionCode=238`, `versionName=1.0.215.2`, and the release AAB signature verified

## Translation

- `배치 저장`과 저장 완료 안내를 영어·일본어에 함께 추가했습니다.
