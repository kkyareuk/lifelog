# 서랍마을 iOS — v1.0.201 / build 7 준비 · 최근 업로드 build 5

## 2026-09-05 build 7 준비 (아직 업로드하지 않음)

- 캐릭터 소지품 선택 화면에서 사전 항목의 내부 ID 대신 이름이나 선택 개수를 표시한다.
- 부부 관계는 법적으로 등록된 관계와 등록되지 않은 관계를 나누어 저장할 수 있다.
- 우편함에서 편지를 하나씩 또는 모두 삭제할 수 있고, 알림 일정 재계산 뒤에도 삭제한 편지가 되살아나지 않는다.
- 신규 기능의 한국어·영어·일본어 문구를 함께 포함한다. 전체 UI 정적 번역률은 영어 2086/2774(75.2%), 일본어 2085/2774(75.2%)다.
- Android 1.0.201 / code 216과 공통 소스를 맞춘 로컬 준비판이다. Mac 서명·IPA·TestFlight 업로드와 App Store 심사는 요청하거나 실행하지 않았다.

## 2026-09-05 build 6 준비 (아직 업로드하지 않음)

- 가구는 방 종류와 관계없이 설치하고, 편집 중 다른 방으로 끌어놓을 수 있다. 선택 가구의 방 선택 메뉴로 다른 층에도 이동한다.
- 기존 ID·소품·침대 지정·크기·방향·반전을 유지하고, 원래 방의 사용 예약을 해제한다. 취소/잘못된 대상은 이동을 저장하지 않는다.
- SD 대신 표시되는 프로필 사진만 원형으로 표시한다. SD/LD 원화는 자르지 않고, 사진/아이콘 원본 데이터도 바꾸지 않는다.
- iOS 상점을 상품 목록과 분류 탭으로 열었다. 구매·복원은 아직 미연결이며 Play 결제/웹 결제로 우회하지 않는다. 가격도 iOS 확정 가격으로 표시하지 않는다.
- 구글 로그인 연동 요청 접수. 프로젝트와 Downloads에서 GoogleService-Info.plist를 찾지 못했다. 기존 Firebase 프로젝트의 com.drawervillage.app iOS 설정 파일을 사용자에게 요청했다. 파일 확인 전 로컬 인증 대체 코드 및 로그인/동기화 잠금을 유지한다. 실제 로그인 연동 완료 아님.
- 영어/일본어 신규 문구 각 100%; 전체 게임/기존 로그 번역률 미측정.
- iOS/Android 자산 준비 및 플랫폼 분리, 생활 시뮬레이션 70개 검사 통과. Chrome 다섯 화면 크기에서 방/층 이동, 취소, 소품/침대 보존, 사진 원형/SD 무자름, 상점 분류와 결제 잠금을 검사한다. 실기기 iPad/WebView 검증은 별도다.
- Android code 213 유지, dev 개발분. .github/ios-testflight-request.json은 이전 build 5 요청 그대로다. build 6 Mac 서명·IPA·TestFlight 업로드는 실행하지 않았다.

현재 상태: **2026-09-05 build 5 내부 TestFlight 업로드 수락 완료. Actions 33888877404 success (7분 29초), Mac Archive·codesign·내부 IPA export·Apple validate/upload 통과. 업로드 보고서 uploadAccepted=true, submittedForReview=false. 종료 시 Apple 조회는 build=null이므로 처리 완료/설치 가능은 아직 미확인이다. 실제 iPad 재검증과 App Store 출시는 별도다.**

## build 5 태블릿 배치 수정

### 2026-09-05 회전 재검증

- 가로 전용 미디어 조건에 들어 있던 태블릿 마을 규칙을 모든 태블릿 방향에 적용하도록 수정했다. 기존 준비본에서도 세로로 회전하면 일반 웹 레이아웃이 섞여 거대한 뒤로가기/좁은 지도/빈 공간이 생겼다.
- 같은 페이지를 다시 열지 않고 가로 → 세로 → 가로 전환 검사 추가. 마을 전체 화면, 집의 닫힌 구성원 패널/옆 정보 숨김, 관계 1명 뒤로가기, 방 목록을 연 상태의 회전을 확인한다.
- 방 편집 입력 중 회전 후 내용 유지와 뒤로가기 → 방 목록 복귀, 구성원 목록 열기/닫기, 옆 집 사진 비율도 자동 검사한다. Chrome의 화면 크기 변경 검사이며 iPad OS 실제 회전 재검증은 별도다.
- 이번 수정은 표시 조건 변경으로 새 번역 문구가 없다. 기존 build 5 신규 안내의 영어/일본어 검사를 유지한다.
- 이전 빌드 4에 수정이 자동 적용되지 않는다. 2026-09-05 명시적 업로드 요청에 따라 빌드 5 업로드 요청 파일을 변경했다.
- 기존 `check-town-grid-editor.mjs` 문자열 기반 검사 5건은 변경 전 HEAD의 CSS로 재실행해도 같은 실패가 재현된다. 새 회전 동작 검사는 통과했으며, 이 기존 실패를 전체 검사 통과로 표현하지 않는다.

- 닫힌 집 편집 패널이 큰 화면에서 드러나던 표시 상태 규칙 수정.
- 집·방 정보 패널 폭 680px 상한, 검색창/제목/사진 최대 크기 제한, 사진 전체 표시.
- 태블릿 가로 지도·장면·메뉴 공간 분리, 집 메뉴와 요약 패널 정리. 세로 화면 방 영역의 큰 빈칸 수정.
- 캐릭터가 한 명일 때 관계 화면에 뒤로가기와 캐릭터 추가 안내 제공. 신규 안내 영어·일본어 각 100%, 전체 게임/로그 번역률 미측정.
- `scripts/qa-tablet-layout.mjs`: 격리된 Chrome에서 1366×994, 1024×746, 820×1180, 1194×820, 384×853 화면 검사. 사용자 계정/저장 데이터는 사용하지 않는다. iPad Safari/WebView 검증의 대체는 아니다.
- `.github/ios-testflight-request.json`은 승인된 build 5 요청이다. 실제 업로드 전 버전/빌드 일치·내부 전용·정식 심사 미제출 검사를 통과했다.
- 실기기 저장/복원, 소리, 발열, 회전 및 build 5 화면 재확인은 남아 있다.
- 관찰 HUD 기존 정적 검사 중 글꼴 설정 제거 조건 1건은 변경 전 코드의 `uiFont` 설정과 이미 불일치한다. 이번 태블릿 검사 및 나머지 HUD 36개 항목은 통과하며, 글꼴 기능을 임의로 삭제하지 않았다.
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
