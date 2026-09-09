# dev305-diamonds1 · 다이아 상점과 선택형 광고 (미배포)

사용자 결정: 현금 충전 + 이벤트·플레이 보상, 보상 광고 + 작은 배너. AdMob 계정은 아직 없음. 앱은 dev에만 반영하며 Android 305 / 1.0.272를 유지한다. 기존 운영 main과 Apple 심사 빌드32를 수정하거나 배포하지 않았다.

## 구현한 동작

| 항목 | 개발 기준 |
| --- | --- |
| 유료 충전 | 다이아 100개 / 한국 가격 1,000원 |
| 캐릭터 슬롯 | 1칸 / 100다이아 |
| 마을 슬롯 | 1칸 / 190다이아 |
| 사진 저장 공간 | 50MB / 290다이아, 중복 구매 방지 |
| 방문 보상 | 한국 시간 기준 하루 1다이아 |
| 보상 광고 | 사용자 선택 시 3다이아, 하루 최대 3회 |
| 이벤트 | 운영자가 등록한 기간·수량·대상 설정, 계정당 한 번 |
| 배너 | 상점 하단의 320×50 배너, 홈·다른 메뉴에서는 제거 |

충전분 `diamondPaid`와 보상분 `diamondBonus`는 서버의 기존 보호된 entitlements 안에 분리 저장한다. 보너스부터 사용하고, 충전분의 시간 만료는 없다. 슬롯 차감과 지급은 같은 트랜잭션에서 처리하며 재요청 ID를 저장해 통신 실패·동시 구매의 중복을 막는다. 구매 후 전체 게임 저장을 다시 내려받지 않고 이용권만 갱신한다.

기존 5칸 팩과 단품 영수증은 계속 원래 수량으로 검증·복원·환불한다. 응원 선물의 기존 직접 결제도 유지한다. 신규 다이아 상품 ID는 Play `diamonds_100`, Apple `com.drawervillage.app.diamonds_100`이다.

Google SSV 원문 서명을 확인한 뒤 광고 보상을 지급한다. 클라이언트의 광고 완료 이벤트만으로 잔액을 늘리지 않는다. 광고를 중간에 닫거나 SDK의 보상 Promise가 끝나지 않는 경우도 닫기 이벤트·제한 시간으로 정리한다. 배너가 구매 복원 버튼을 가리지 않게 화면 공간을 확보한다.

Apple 환불 알림, Google Play 취소 내역의 시간별 확인, Toss 취소 알림을 처리한다. 이미 사용한 유료 다이아가 환불되면 잔액을 임의로 0으로 덮지 않고 음수 조정액을 남겨 추가 사용을 중지한다. 기존 캐릭터/구매 슬롯을 임의로 삭제하지 않으며 고객센터 확인 문구를 표시한다. 삭제된 계정의 잔액 문서를 환불 처리로 다시 만들지 않는다.

Apple Sandbox 충전·지출은 `appleSandboxAccounts`에 격리한다. 테스트 잔액은 실제 계정 이용권을 지급하지 않는다. 실제 iOS 기기에서의 충전부터 기능 사용까지 검증은 Mac/Xcode 및 테스트 계정으로 별도 진행해야 한다.

## 활성화 전에 남은 작업

1. AdMob 계정 생성 후 Android/iOS 앱 등록. 각 플랫폼의 앱 ID, 보상형 광고 단위 ID, 배너 광고 단위 ID를 준비한다. 아직 실제 계정·광고 단위는 생성하지 않았다.
2. Android `admob_app_id` 및 iOS `GADApplicationIdentifier`의 Google 테스트 앱 ID를 실제 등록 값으로 바꾼다. `config.js`의 ads는 현재 `enabled:false, testing:true`다. SDK 초기화는 실제 광고 활성화 설정과 상점 진입 이후에만 요청한다.
3. AdMob의 보상형 광고 설정을 `reward_item=diamond`, 수량 3으로 지정한다. SSV URL은 배포 후 `https://asia-northeast3-lifelog-98fff.cloudfunctions.net/diamondWalletApi/admob-ssv`로 연결한다. 테스트 광고에서 실제 서버 콜백을 받는지는 별도로 확인한다.
4. AdMob 개인정보 메시지 설정과 앱의 개인정보처리방침·스토어 데이터 안전/개인정보 표시·광고 포함 표시를 실제 SDK 및 운영 설정에 맞춰 갱신한다. 현재 공개 방침에 새 광고가 운영 중인 것처럼 적지 않았다. 비개인화 요청 `npa:true`, 추적 권한 자동 요청 비활성화를 기본으로 준비했다.
5. Play/App Store에 신규 소모성 다이아 상품을 등록한다. 한국 가격 1,000원과 해외 현지 표시 가격을 확인한다. 현재 심사 중인 빌드32의 기존 상품은 자동 교체하지 않는다.
6. 결제 서버, `diamondWalletApi`, `reconcileDiamondPlayRefunds`, 만료 광고 티켓 정리 변경을 배포한다. Google Play 결제 서비스 계정에 구매·취소 내역 조회 권한이 필요하다. Toss 취소 Webhook은 기존 api의 `/payments/diamond-refund`에 연결한다. 웹 다이아 충전 주문은 다른 상품과 섞지 않는다.
7. 서버 설정 `economySettings/live`를 등록하고 테스트한다. 실제 검증 전에는 `enabled`와 `adsEnabled`를 false로 둔다. 아래 값은 형태 예시이며, 운영 DB에는 쓰지 않았다.

```json
{
  "enabled": false,
  "adsEnabled": false,
  "adUnits": {"android": "실제 보상형 광고 단위 ID", "ios": "실제 보상형 광고 단위 ID"},
  "bannerUnits": {"android": "실제 배너 광고 단위 ID", "ios": "실제 배너 광고 단위 ID"}
}
```

이벤트는 서버 전용 `diamondEvents/{eventId}`에 `active`, `startAt`/`endAt`(epoch ms), `title`, `amount`(1~10,000), 선택적 `eligibleUids`와 `maxClaims`를 등록한다. `claims`는 서버가 증가시킨다. 실제 이벤트는 아직 만들지 않았다. 운영용 이벤트 편집 화면은 이번 범위에 포함하지 않았다.

## 검증 결과

- `check-diamond-wallet.cjs`: 동시 구매·같은 요청 재전송·부족 잔액·기존 팩 보존·방문/이벤트 중복·광고 일일 상한·다른 계정 보상 거절·SSV 서명 변조·Sandbox 분리·충전/부분 환불·광고 조기 종료 통과.
- 기존 단품/5칸 상점 회귀 및 Apple 모의 구매 검사 통과. Apple 테스트는 `--diamonds`도 검사한다.
- `qa-diamond-shop.mjs`: 360×840 / 1180×820, KO/EN/JA 레이아웃·구매·방문 보상·선택형 광고·클라이언트 보상 미지급·상점 이탈 시 배너 제거·복원 버튼 공간 검사 통과.
- Android AdMob 7.2.0 플러그인 동기화 및 `:app:compileDebugJavaWithJavac` 성공. 분리 작업 폴더에서 제외된 기본 Android 템플릿 리소스/Gradle 설정은 기존 로컬 템플릿으로 준비했다. 결과는 작업 폴더의 격리된 QA 빌드 경로에 생성했다.
- 웹·Android·iOS 웹 자산 준비와 모듈 포함 검사 통과. AAB/IPA 생성, 실제 결제/광고 송출, iOS 네이티브 컴파일/실기기 검증, 서버 배포는 미실시.
- 신규 다이아 문구 KO/EN/JA 제공. 측정기 대상 전체 UI: EN 2240/2945 (76.1%), JA 2239/2945 (76.0%). 별도 다이아 사전도 집계에 포함하도록 수정했다.

## 공지 상태

기존 ‘9월14일부터 슬롯 1개 1,000원’ 사과문은 다이아 방식 결정으로 보류했다. 등록 계정 489개와 운영 푸시 트리거를 읽기 조회만 했다. 게임 우편 0건, 푸시 0건 발송했다. 발송 도구는 초안의 held 상태에서 실제 발송을 차단한다. 향후 공지는 푸시 없이 우편함에만 보내도록 준비했다. 새로운 적용일은 미정이다.

## 참고한 공식/원본 문서

- [AdMob 플러그인](https://github.com/capacitor-community/admob)
- [Google 보상형 광고 서버 검증](https://developers.google.com/admob/android/ssv)
- [Apple 심사 지침](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play 결제 정책](https://support.google.com/googleplay/android-developer/answer/9858738?hl=en)
