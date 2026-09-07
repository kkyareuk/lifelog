# iOS 1.0.233 build 11 — 결제 통합 작업 중

정식 결제 활성화나 App Store 심사 제출 완료가 아니다. Android는 262 유지, dev 전용 작업이다. 등록 상품은 사용자의 캡처 및 답변으로 확인했다.

| Apple 상품 ID | 내부 상품 | 유형 |
|---|---|---|
| com.drawervillage.app.character_slots_5 | character_slots_5 | 소모성 |
| com.drawervillage.app.town_slot_1 | town_slot_1 | 소모성 |
| com.drawervillage.app.green_tea | green_tea | 소모성 |

스토리지는 사용자가 등록하지 않았다고 밝혀 이번 iOS 판매 목록에서 제외했다. Android 상품 구성은 유지한다.

구현: StoreKit 2 상품 현지 가격 조회/구매/복원/미완료 거래 재확인, 계정별 appAccountToken, 서버의 현재 Apple 거래 조회와 공식 SDK 서명 검증, 거래 ID 기준 트랜잭션 중복 지급 방지, 검증 확정 후 finish, 환불/취소 통지의 중복 회수 방지. 서버는 별도 appleBillingApi 함수로 분리하여 기존 Play/Toss API를 변경 배포하지 않는다. Sandbox 권한은 appleSandboxEntitlements로 분리하여 무료 테스트 구매가 운영 권한으로 지급되지 않는다.

검사: check-apple-billing.cjs에서 다른 계정/다른 상품/취소/위조 영수증/중복 지급/환불 재전송/테스트 권한 분리/서버 확인 실패 시 거래 미완료/취소/가격 매핑 통과. 실제 Apple 구매 결과는 아님. iOS 자산/프로젝트 및 Android·웹 플랫폼 분리 검사 통과.

미완료와 외부 준비:
- 사용자 Firebase iOS 등록 확인 및 Downloads의 일치하는 GoogleService-Info.plist로 Google 로그인 플러그인/URL scheme/리소스를 연결했다. 기기에서 실제 로그인·계정 동기화 검증은 남아 있다. 앱 배포용 공개 설정값만 ios-firebase-config.json에 보관하고 plist를 빌드 시 생성한다. 서비스 계정/개인키는 포함하지 않는다.
- Apple 로그인 및 앱 내 계정 삭제의 정식 출시 요건은 별도 미완료다.
- Firebase의 별도 appleBillingApi 배포 미실행. APPLE_IAP_PRIVATE_KEY는 Secret Manager로, APPLE_IAP_KEY_ID / APPLE_IAP_ISSUER_ID / APPLE_APP_ID / APPLE_IAP_ENVIRONMENT(Sandbox 또는 Production) / APPLE_BILLING_ENABLED 설정 필요. 업로드용 ASC 키를 임의 재사용하거나 비밀값을 Git/채팅에 넣지 않는다.
- Sandbox 테스트판의 계정 UI에 테스트 권한을 연결하고 테스트 완료 후 Production 설정을 확인해야 한다.
- App Store Server Notifications V2 URL은 배포된 appleBillingApi/apple-billing/notifications로 설정한다. REFUND/REVOKE를 처리한다. 환불 취소(REFUND_REVERSED)의 자동 재지급은 아직 미구현이며 출시 전 정해야 한다.
- Apple 유료 앱 계약/세금/정산, 가격·판매지역·현지화·심사 스크린샷 필요.
- 상품에 심사 추가하여 초안으로 묶는 것은 가능하지만 최종 심사는 결제 가능한 앱 빌드와 같이 진행한다.
- TestFlight 실구매 흐름 및 실기기 테스트, 서명된 출시 후보 업로드는 아직 미실행.

새 결제 메시지는 한국어/영어/일본어 3개 언어 제공. 기존 전체 UI 번역 집계는 별도 스크립트로 측정한다.

Apple SDK: https://github.com/apple/app-store-server-library-node
공개 루트 인증서: https://www.apple.com/certificateauthority/AppleRootCA-G3.cer
첫 인앱결제 제출: https://developer.apple.com/help/app-store-connect/manage-submissions-to-app-review/submit-an-in-app-purchase/

StoreKit 네이티브 컴파일: Actions 34090035958에서 성공, 시뮬레이터 실행 단계 확인 중. Google 로그인 연결 변경은 후속 실행으로 검증한다.
