# Android hotfix 236

- Version name: `1.0.204.4`
- Version code: `236`
- Baseline: production `1.0.215` / code `233`
- Cache marker: `20260906hotfix236`

## Player-visible fixes

- 관계의 시선 설정 화면이 Android 휴대폰에서 세로로 스크롤되지 않던 문제를 수정했습니다.
- 시선 설정 항목을 고정 좌표에서 실제 스크롤 흐름으로 옮겨, 글자 크기나 안전 영역이 달라도 마지막 항목까지 접근할 수 있습니다.
- 로그인 전에 만든 기기 캐릭터를 첫 Google 로그인 때 계정 저장공간으로 넘기고 업로드하는 기존 production 233 보호 기능을 그대로 포함합니다.

## Verification

- `npm run test:hotfix236`
- `npm run test:relationship217`
- `npm run test:account-isolation`
- `npm run test:reported-bugs`
- `npm run qa:hotfix236` at touch viewport `384 × 832`

## Translation

이번 핫픽스는 새 사용자 문구를 추가하지 않아 한국어·영어·일본어 번역 범위는 production 233과 동일합니다.
