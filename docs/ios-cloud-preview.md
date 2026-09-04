# 맥 없이 iOS 빌드 준비 — 1.0.198 / iOS build 2

Android code 213 유지. 앱 dev에서만 준비하며 운영 main·사이트·스토어 배포는 변경하지 않는다.

## 실행 방식과 비용 제한

- `.github/workflows/ios-preview.yml`: GitHub 표준 macos-15, Xcode 26.3, Node 22.
- dev에서 `.github/ios-preview-request.json`의 request 값을 바꾸고 커밋·푸시할 때만 새 빌드를 요청한다. 일반 게임 코드 수정, PR, 시간표로 자동 실행하지 않는다.
- 같은 브랜치에서 새 요청이 들어오면 이전 실행을 취소한다. 실행 상한 30분.
- Apple 비밀 키를 읽지 않으며 서명·IPA 생성·TestFlight·심사 제출은 하지 않는다.
- 작은 빌드 로그/실행 결과/시뮬레이터 화면만 3일 보관한다. 대형 DerivedData, 앱 파일, 캐시는 업로드하지 않는다.
- 사용자 캡처: GitHub Free, Actions 사용 0/2,000분, 저장 0/0.5GB, 청구 $0. Actions 예산 $0 / Stop usage Yes 유지. 저장소 lifelog는 공개 상태로 확인했다. 공개 표준 runner의 무료 사용 정책과 계정/공개 범위 변경에 따른 비용은 구분한다.
- 기본 브랜치에 workflow가 없으면 Run workflow 버튼/dispatch를 사용할 수 없으므로, main을 건드리지 않고 요청 파일 방식으로 실행한다. workflow_dispatch는 향후 정상 릴리스로 workflow가 main에 포함된 후 dev ref로 사용할 수 있다.

## 빌드가 검사하는 것

1. lockfile 기반 JS 의존성 설치 및 기존 patch-package 적용.
2. 플랫폼 분리 검사, iOS 버전/게임 자산 준비 및 CocoaPods 설치.
3. 공유 App scheme으로 iOS Simulator용 Swift/Objective-C/리소스 빌드.
4. 설치된 iOS 런타임의 iPhone·iPad에 설치/실행 후 프로세스 생존 확인, 스크린샷 저장.

실행 성공은 사진 업로드·저장 복원·음원·로그인·구매 기능이나 실기기 검증 완료가 아니다.
스크린샷은 시작 화면 시각 검수용이며, 그대로 App Store 홍보용 이미지로 제출하지 않는다.
시뮬레이터 App.app은 아이패드에 설치할 수 있는 IPA가 아니다.

## TestFlight로 넘어갈 때 한 번에 준비할 항목

빌드 검사가 성공한 다음 아래 서명 묶음을 연결한다. Apple 비밀번호는 요청하지 않는다.

| GitHub Actions secret 이름 (연결 시 사용할 이름) | 필요한 내용 |
| --- | --- |
| IOS_DISTRIBUTION_P12_BASE64 | Apple Distribution 인증서와 대응 개인키를 포함한 P12의 base64 |
| IOS_DISTRIBUTION_P12_PASSWORD | 위 P12를 암호화한 비밀번호 |
| IOS_PROVISION_PROFILE_BASE64 | com.drawervillage.app용 App Store Connect 배포 프로파일의 base64 |
| ASC_KEY_ID | App Store Connect API 키 ID |
| ASC_ISSUER_ID | 팀 API 키의 Issuer ID |
| ASC_PRIVATE_KEY | 위 API 키의 .p8 내용 |

이 표는 준비 목록이며 **현재 preview workflow가 이 키를 사용한다는 뜻이 아니다**. 서명/업로드 workflow는 키 연결과 테스트 배포 승인 후 추가한다.
GitHub 저장소 Settings → Secrets and variables → Actions에 직접 입력한다. 키를 채팅, 이 문서, request JSON, Git, 작업판에 붙여넣지 않는다. base64는 암호화가 아니다.
맥 없이 인증서를 새로 만들어야 하면 Windows에서 CSR/개인키를 준비하고 Apple에서 인증서와 배포 프로파일을 발급받을 수 있다. 기존 개인키를 잃어버린 인증서 파일만으로 P12를 복원할 수 없다. 기존 배포 인증서는 임의로 폐기하지 않는다.
팀/번들 ID는 Apple 계정과 프로파일이 서로 일치하는지 검사한다. App Store Connect API 키는 업로드에 필요한 권한으로 발급하며 계정 전체 관리자 권한을 무조건 요구하지 않는다.

서명 후 TestFlight 내부 테스트 → 실기기 확인 → 출시 필수 항목 완료 → 사용자 승인 후 App Store 심사 순서다.
미연결 로그인/동기화/구매, 자리표시 아이콘, 개인정보·권한 현지화 등 출시 잔여 항목은 APP-IOS.md를 따른다. appStoreReady를 true로 바꾸어 검사를 우회하지 않는다.

## 로컬에서 먼저 검사

```sh
node scripts/check-ios-cloud.mjs
node scripts/check-native-platforms.mjs
npm run app:sync:ios
```

Windows의 sync 성공은 Xcode 컴파일 성공이 아니다. 실제 결과는 GitHub Actions 실행 기록으로 확인한다.
Android 빌드 전에는 `npm run app:prepare` 또는 `npm run app:sync`로 www를 Android 설정으로 다시 만든다.
이번 작업은 빌드 설정/문서만 변경하므로 새 게임 UI 번역 대상은 없다. 전체 영어·일본어 번역률은 재측정하지 않았다.

## 공식 근거

- https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#workflow_dispatch
- https://github.com/actions/runner-images/blob/main/images/macos/macos-15-Readme.md
- https://docs.github.com/en/billing/concepts/product-billing/github-actions
- https://docs.github.com/en/actions/how-tos/deploy/deploy-to-third-party-platforms/sign-xcode-applications
- https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds/

## 실행 결과

첫 실행: https://github.com/kkyareuk/lifelog/actions/runs/33865160953
결과 확인 중. 서명/IPA/TestFlight 업로드는 실행하지 않음.
