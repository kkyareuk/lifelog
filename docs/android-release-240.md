# Android hotfix 240

- Version name: `1.0.215.3`
- Version code: `240`
- Baseline: production `1.0.215` / code `233`, including hotfixes `236` and `238`
- Cache marker: `20260906hotfix240`

## Player-visible fixes

- 휴대폰 홈 관찰 화면 뒤에서 태블릿 가로용 마을 시뮬레이션이 함께 생성되던 문제를 수정했습니다.
- CSS로 숨겨진 주민을 이동음 재생 대상으로 판단하지 않도록 보조 안전장치를 추가했습니다.
- 태블릿을 회전하면 관찰 화면의 태블릿 전용 마을 DOM을 현재 방향에 맞게 다시 구성합니다.
- 캐릭터 홈 배치 적용, 기존 배치 복구, 명시적 `배치 저장` 버튼을 포함한 code 238 수정도 유지합니다.

## Verification

- `npm run test:hotfix240`
- `npm run qa:hotfix240` at phone `384 × 784` and tablet landscape `1205 × 753`
- placement persistence, relationship, account-isolation, backup and reported-bug regression checks
- Android `clean assembleDebug bundleRelease`

## Translation

- 이번 추가 수정에는 새 사용자 문구가 없어 기존 영어·일본어 번역을 그대로 유지합니다.
