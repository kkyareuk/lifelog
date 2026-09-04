# 서랍마을 iOS 준비 — v1.0.198 / iOS build 4

현재 상태: **build 3 시뮬레이터 설치·실행 검사 통과. build 4는 Mac 서명·Apple 검증·내부 TestFlight 업로드 수락 완료. Apple 처리와 테스트 접근 설정/실기기 확인은 별도. App Store 제출 가능 상태 아님.**
Android 대응 버전은 1.0.198 / code 213이다. 집 메뉴 버튼과 가구 편집창 개선은 웹·Android·iOS가 공유한다.

## 준비된 것

- 기존 게임 코드와 그림을 사용하는 Capacitor 7.6.8 iOS 프로젝트: ios/App/App.xcworkspace
- bundle ID: com.drawervillage.app (2026-09-04 사용자 제공 화면에서 App ID 및 App Store Connect 앱 레코드 생성 확인)
- App/Browser/Network/Local Notifications/Splash Screen/Status Bar 연결
- iOS용 웹 자산 준비, 버전 동기화, 잘못된 Android 자산 혼입 검사
- 미설정 Firebase iOS 플러그인은 제외. 로그인/동기화와 구매는 준비 중으로 표시하며 Google Play/웹 결제로 우회하지 않는다.
- iOS build 3은 로컬 준비판용 auth를 패키징하여 외부 Firebase SDK나 계정 복구 응답 없이 시작한다. Android/웹 auth와 기존 저장 데이터·권한은 바꾸지 않는다.
- 한국어·영어·일본어 준비 상태 문구
- 사진 선택 시 필요한 기본 카메라/사진 권한 설명(영문). iOS 시스템 권한 문구의 한국어·일본어 현지화는 출시 전 후속 항목.

## App Store Connect에서 신규 앱 등록

앱 레코드를 만드는 단계이며, 생성만으로 앱이 공개되거나 심사에 제출되지는 않는다.
2026-09-04 현재 사용자가 보내 준 신규 앱 화면에서 다음 값으로 진행한다.

| 항목 | 입력 / 선택 |
| --- | --- |
| 플랫폼 | iOS |
| 이름 | 서랍마을: 캐릭터 생활 시뮬레이터 |
| 기본 언어 | 한국어 |
| 번들 ID | com.drawervillage.app |
| SKU | drawervillage-ios (계정 내에서 사용하지 않은 내부 관리용 식별자) |
| 사용자 액세스 권한 | 전체 액세스 (개발팀 사용자의 접근 권한이며 일반 이용자 공개 여부가 아님) |

번들 ID가 목록에 없으면 Certificates, Identifiers & Profiles → Identifiers → + →
App IDs → App → 설명 Drawer Village → Explicit Bundle ID com.drawervillage.app →
Continue → Register 순서로 등록한 뒤 돌아와 목록을 새로 고친다.
같은 ID가 이미 다른 용도로 등록되어 있거나 등록이 거절되면 임의의 ID를 고르지 말고,
Apple 계정의 소유권/등록 상태를 확인한다. ID 변경은 프로젝트 설정과 함께 해야 한다.

생성 후에는 앱 설명·스크린샷·지원 URL·개인정보·연령등급·가격/배포 지역을 준비한다.
EU 배포 관련 거래자 정보는 실제 사업 상태에 맞춰 제출하며 추측해서 선택하지 않는다.
등록 화면은 사용자 제공 캡처로 확인했다. 인증서·프로비저닝과 API 키는 GitHub Actions Secrets에 저장 완료. 실제 Mac 서명과 Apple 업로드 결과는 docs/ios-cloud-preview.md의 최신 실행 기록을 따른다.

공식 안내:
- https://developer.apple.com/help/app-store-connect/create-an-app-record/add-a-new-app/
- https://developer.apple.com/help/account/identifiers/register-an-app-id/

## Mac에서 이어서 실행

맥이 없는 경우에는 아래 클라우드 빌드 절차를 사용한다. 아이패드만으로 이 Capacitor 프로젝트를 빌드하는 절차는 아니다.
실행 방식, 비용 제한, TestFlight 서명 자료를 한 번에 준비하는 목록은 [iOS 클라우드 빌드 안내](docs/ios-cloud-preview.md)에 정리했다.

Xcode 26 이상과 iOS 26 SDK 이상, Node.js 22, CocoaPods를 준비한다.
Windows에서 만든 ios 폴더만이 아니라 이 저장소 전체를 Mac에 가져온다.

```sh
npm ci
npm run app:sync:ios
npm run app:open:ios
```

Xcode에서 App 타깃의 Signing & Capabilities → 본인 Team 선택.
먼저 iPhone 시뮬레이터와 실기기에서 실행한다. 위 명령은 업로드하지 않는다.
Windows 자체에서는 pod install/Swift 컴파일을 실행할 수 없지만 GitHub macOS runner에서 CocoaPods와 Xcode 컴파일은 통과했다. 서명·실기기 실행·TestFlight는 별도다.

## 출시 전에 남은 항목 — 자동 완료로 취급하지 말 것

1. App ID/App Store Connect 앱 레코드 생성은 사용자 화면 확인. Apple Developer Program 유효 상태 및 계약, 서명 인증서/프로파일과 업로드 권한 연결은 별도 확인 필요.
2. 기본 Capacitor 자리표시 아이콘/스플래시를 실제 앱 아이콘/시작 화면으로 교체. 최종 아이콘은 1024px 비투명 원본으로 검증.
3. Firebase에 iOS 앱 등록, GoogleService-Info.plist 및 URL scheme 설정. 현재 제외한 authentication 플러그인은 이 설정과 함께 다시 연결.
4. Google 로그인 유지 시 Apple 로그인 등 4.8 요건 검토/구현, 계정 연결 및 앱 내 계정 삭제 테스트.
5. 디지털 상품의 StoreKit 구매/복원, 서버 영수증 검증·중복 지급 방지·환불 반영. 기존 Google Play 서버로 Apple 영수증을 보내면 안 됨.
6. SDK 개인정보 매니페스트/필수 사유 API, 실제 수집·공유 데이터에 맞는 App Privacy 응답, 개인정보처리방침 검토. 확인 없이 '수집 없음'으로 제출하지 않음.
7. 사진 선택·저장/내보내기·백업 복원·알림·음원·키보드·안전영역·오프라인·업데이트 데이터 유지 실기기 검증.
8. 본인 권리가 있는 캐릭터/그림만 사용한 스크린샷, 연령등급·지원 URL·심사 메모 준비.
9. Xcode Archive → Validate → App Store Connect 업로드 → TestFlight 테스트 → 심사 제출.

`npm run ios:release:check`는 현재 의도적으로 실패한다. 플래그만 true로 바꾸는 것으로 위 검증을 대체할 수 없다.
Apple 계정 비밀번호/인증서 개인키는 채팅이나 Git에 올리지 않는다.

## 앞으로 업데이트하는 방법

공통 게임 코드 수정은 한 번 한다. 세 플랫폼의 검증/산출물/배포는 별개이다.

| 대상 | 준비/빌드 | 결과 |
|---|---|---|
| 사이트 | npm run build | 웹 정적 파일; 별도 승인된 사이트 배포 |
| Google Play | npm run app:sync → Android Gradle bundleRelease | AAB; 테스트용 APK 별도 |
| App Store | npm run app:sync:ios → Mac Xcode Archive | 서명된 iOS 아카이브/IPA, TestFlight |

- dev에서 개발하고 배포 시점을 명시한다. 실제 서비스 main에 개발 중 기능을 섞지 않는다.
- 게임 버전명은 같은 업데이트끼리 맞출 수 있지만 Android versionCode와 iOS build는 별도 증가한다.
- ios-release.json의 version/build/sourceAndroidCode를 릴리스 계획에 맞춰 갱신한다.
- 앱의 공통 기능을 바꾸면 세 대상 모두 확인한다. Android 전용 핫픽스가 매번 iOS/사이트 즉시 배포를 뜻하지는 않는다.
- 웹을 배포해도 이미 설치된 앱이 자동으로 새 게임 코드로 바뀌지는 않는다. 앱은 스토어 업데이트가 필요하다.
- iOS 준비 명령 다음에 Android를 빌드할 때는 반드시 app:sync를 다시 실행한다. www는 공통 임시 준비 폴더다.

## 공식 자료 (2026-09-04 확인)

- https://capacitorjs.com/docs/v7/ios
- https://developer.apple.com/app-store/submitting/ — 현재 제출은 iOS/iPadOS 26 SDK 이상 필요
- https://developer.apple.com/programs/enroll/ — 개발자 등록
- https://developer.apple.com/app-store/review/guidelines/ — 결제 3.1, 로그인 4.8, 계정 삭제 5.1.1
- https://capacitorjs.com/docs/v7/ios/privacy-manifest

## 이번 환경의 검증 기록

- 2026-09-04 build 3: https://github.com/kkyareuk/lifelog/actions/runs/33866155299 — 전체 workflow 성공(10분 3초). Xcode 26.3 / iOS 26.2에서 iPhone 17 Pro와 iPad Pro 13-inch(M5) 설치·실행·프로세스 생존 확인. iPhone 스크린샷에서 첫 캐릭터 만들기 화면 시각 검수 완료. iPad PNG는 생성됐으나 로컬 이미지 뷰어가 해석하지 못해 육안 검수 완료로 표기하지 않음.
- build 3 로컬 auth / 첫 캐릭터 화면 진입 ko/en/ja 검사, iOS 프로젝트/자산, native 플랫폼 분리, Android auth 원본 동일성 통과. 서명·IPA·TestFlight·실기기 기능 QA는 미실행.
- 아래는 build 1/2의 Windows 준비 당시 기록이며, macOS 검증은 위 최신 기록을 따른다.

- app:sync:ios 및 test:ios: 프로젝트/버전/필수 파일 검사 통과. CocoaPods 설치와 Xcode 빌드는 도구 부재로 건너뜀.
- check-native-platforms: Android 결제/뒤로가기 유지, iOS Play API 차단, 웹 비영향 실행 테스트.
- iOS 준비 뒤 Android app:prepare를 재실행해 Android 설정 복원과 31개 모듈/213개 필수 자산 검사 통과.
- check-mood-details-212 통과. 기존 check-native-shop-billing은 오래된 캐시 버전 정규식에서 실패하므로 전체 통과로 표기하지 않음.
- ios:release:check는 미완료 출시 요건 때문에 의도된 실패. 실제 iPhone 실행·음원 청취·서명·IPA 생성은 수행하지 못함.
