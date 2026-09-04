# 맥 없이 iOS 빌드 준비 — 1.0.198 / iOS build 3

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
build 3에서는 로컬 iOS 준비판이 외부 Firebase 로그인 모듈을 기다리지 않도록 별도 auth를 패키징한다. 저장 데이터 삭제/계정 전환/유료 권한 부여 없이 ready 상태를 알리고, 로그인/동기화는 기존 준비 중 안내만 표시한다. 해당 안내 영어·일본어 각 100%, 전체 게임/로그 번역률은 재측정하지 않았다.

## 공식 근거

- https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#workflow_dispatch
- https://github.com/actions/runner-images/blob/main/images/macos/macos-15-Readme.md
- https://docs.github.com/en/billing/concepts/product-billing/github-actions
- https://docs.github.com/en/actions/how-tos/deploy/deploy-to-third-party-platforms/sign-xcode-applications
- https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds/

## 실행 결과

첫 실행: https://github.com/kkyareuk/lifelog/actions/runs/33865160953
build 2: CocoaPods/Xcode 빌드 통과, iPhone 17 Pro / iOS 26.2 설치·프로세스 실행 확인. 스크린샷은 계정 기록 확인 화면으로 정상 플레이 확인은 아니다. iPad 실행 단계에서 수동 중단해 전체 workflow 결과는 cancelled. 9분 7초 소요. 서명/IPA/TestFlight 업로드는 실행하지 않음.
실제 저장된 진단 화면을 보고 준비판도 외부 auth를 불러오던 초기화 구조를 확인했고, build 3에서 로컬 전용 모듈로 분리했다. 외부 로그인 스크립트 로딩을 기다리지 않으며 Android/웹은 기존 auth를 그대로 사용함을 바이트 비교했다. 재검사 결과는 아래에 추가한다.

최종 재검사: https://github.com/kkyareuk/lifelog/actions/runs/33866155299 — **success**, 10분 3초, 실행 소스 0d1532c.
- Xcode 26.3 / iOS Simulator 26.2, CocoaPods 및 Swift/Objective-C/리소스 빌드 통과.
- iPhone 17 Pro 및 iPad Pro 13-inch(M5): 설치·실행·프로세스 생존 검사 통과, 양쪽 PNG 생성.
- iPhone PNG 육안 검수: 계정 기록 로딩 대신 첫 캐릭터 만들기/내 마을 불러오기/언어 선택 화면 표시 확인. 실제 버튼 조작/게임 플레이/음원/사진 QA는 아님.
- iPad PNG는 로컬 뷰어가 해석하지 못했으므로 생성과 프로세스 검사만 확인했으며 육안 검수는 남김.
- Actions 구버전 액션의 Node 20 런타임 경고가 있으나 실행은 Node 24 강제 전환으로 성공. npm 앱 빌드 런타임은 Node 22.
- 두 번만 실행했으며 추가 자동 재시도 없음. 계정 과금 설정/저장소 공개 범위/운영 main은 변경하지 않음.
- 로컬 진단 파일: ios/build/cloud-run-33866155299/ (Git 제외). 첫 실패/취소 기록은 삭제하지 않음.
- 당시 Apple 서명 자료 GitHub secret 목록은 비어 있었음. 이후 준비 상태는 아래 기록을 따른다.

## 2026-09-04 서명 준비 진행

- GitHub에서 ASC_KEY_ID, ASC_ISSUER_ID, ASC_PRIVATE_KEY 이름 등록 확인. 값은 읽지 않았으며 API 인증 성공을 검사한 것은 아니다.
- Windows에서 RSA 2048 / SHA-256 인증서 요청(CSR) 생성, CSR 자체 서명 및 개인키 유효성 검사 통과.
- 개인키는 저장소와 OneDrive 밖의 사용자 전용 접근 폴더에 암호화해 보관한다. 암호 역시 Windows 사용자 보호 방식으로 저장하며 Git/채팅/작업판에 포함하지 않는다.
- 사용자가 다운로드 폴더의 DrawerVillage-AppleDistribution.certSigningRequest를 Apple Developer의 Certificates → + → Apple Distribution에 업로드하고 인증서(.cer)를 다운로드해야 한다.
- 이어 Profiles → + → Distribution의 App Store Connect → com.drawervillage.app → 방금 만든 배포 인증서 → 이름 DrawerVillage AppStore → Generate → Download로 프로파일(.mobileprovision)을 받는다.
- 기존 인증서를 임의로 폐기하지 않는다. 다운로드한 두 파일을 확인한 후 인증서-개인키 일치, Team/Bundle ID, 만료 및 배포 유형을 검사하고 P12/서명 작업을 연결한다.
- 아직 Apple 인증서 발급·프로파일 발급·서명 IPA·TestFlight 업로드는 완료하지 않았다. 버전 1.0.198 / Android 213 / iOS build 3 유지.

### 같은 날 인증서 수령 후 로컬 검사

- 사용자가 발급받은 Apple Distribution 인증서와 App Store Connect 프로파일 확인 완료.
- 인증서와 로컬 개인키 공개키 일치, 프로파일 내 인증서 일치, Team 및 com.drawervillage.app 일치, 배포 유형 및 유효기간 검사 통과. 인증서/프로파일 만료일은 2027-09-04.
- 프로파일 CMS 서명 무결성 검사 통과. 이 로컬 검사의 `-noverify`는 CA 체인 신뢰 검사를 생략하므로 Apple/Xcode의 배포 신뢰 검증 완료를 뜻하지 않는다.
- 암호화된 P12 생성 및 암호/MAC 검증 완료. 파일과 암호는 기존 사용자 전용 로컬 폴더에만 보관한다.
- `scripts/prepare-ios-signing.ps1`은 기본적으로 로컬 검사/생성만 하며, 기존 P12/암호를 덮어쓰지 않는다. `-PublishSecrets`는 별도의 명시적 업로드 승인이 필요하다. 암호를 명령 인자나 출력에 쓰지 않는다.
- GitHub 서명 secret 세 항목 전송은 자동 보안 검토에서 승인 범위 부족으로 차단됨. 외부 전송하지 않았으며 사용자에게 P12/암호/프로파일의 Actions Secrets 저장 승인을 요청한다. 기존 ASC API secret 세 항목은 변경하지 않음.
- IPA 빌드·TestFlight 업로드는 아직 미실행. 앱 코드/버전/번역은 변경하지 않음.

### 명시적 승인 후 GitHub 서명 자료 저장 완료

- 사용자가 P12·암호·프로파일을 kkyareuk/lifelog의 Actions Secrets에 저장하도록 승인함.
- 기존 P12를 재생성하지 않고 `-ReuseExisting -PublishSecrets`로 재검증하여 세 secret 저장 완료. P12의 개인키 포함 여부와 인증서 일치도 메모리 내 가져오기로 검사하며 Windows 인증서 저장소에는 설치하지 않음.
- ASC_KEY_ID, ASC_ISSUER_ID, ASC_PRIVATE_KEY 및 IOS_DISTRIBUTION_P12_BASE64, IOS_DISTRIBUTION_P12_PASSWORD, IOS_PROVISION_PROFILE_BASE64의 여섯 이름 등록 확인. 기존 ASC 키는 수정하지 않았고 값도 읽지 않음.
- 비밀값은 표준입력으로만 전달했으며 공개 Git, 문서, 채팅, 작업판에 넣지 않음. 로컬 암호화 자료 보존.
- 이 완료 상태는 secret 저장까지만 뜻함. Apple API 인증, Mac 키체인 가져오기/신뢰 체인, 실제 서명 빌드, TestFlight 업로드는 후속 검증 대상. 기존 미리보기 workflow는 그대로 유지되어 서명 자료를 사용하거나 자동 업로드하지 않음.
- 앱 1.0.198 / Android 213 / iOS build 3 및 운영 main 유지. 게임 UI 변경이 없어 신규 번역 대상 없음.
