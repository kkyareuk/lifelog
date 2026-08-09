# 서랍마을 Google Play 앱 배포 안내

서랍마을의 Android 앱은 기존 웹 화면과 Firebase 계정 데이터를 사용하는 Capacitor 앱입니다. Google Play에 올리는 파일 확장자는 `.abb`가 아니라 **`.aab`(Android App Bundle)** 입니다.

## 현재 결제 구조

- 웹사이트: 기존 Toss 결제를 유지합니다.
- Google Play에서 설치한 Android 앱: Toss 결제 화면을 열지 않고 Google Play Billing만 사용합니다.
- 앱은 구매 직후 권한을 직접 지급하지 않습니다. Firebase Functions가 Google Play Developer API로 구매 토큰을 확인하고, 같은 영수증이 두 번 지급되지 않도록 기록한 뒤 권한을 지급합니다.
- 구매 검증 서버 주소가 비어 있거나 Google 로그인을 하지 않은 상태에서는 결제창 자체를 열지 않습니다.

## 등록해야 할 일회성 상품

Play Console의 `수익 창출 > 제품 > 인앱 상품`에서 아래 상품 ID를 정확히 만들어 활성화합니다. 코드의 ID와 철자·대소문자가 같아야 합니다.

| 상품 ID | 용도 | 소비형 여부 |
| --- | --- | --- |
| `character_slots_5` | 캐릭터 슬롯 5개 | 소비형 |
| `town_slot_1` | 마을 슬롯 1개 | 소비형 |
| `storage_50mb` | 사진 저장 공간 50MB | 비소비형 |
| `green_tea` | 개발자 녹차 응원 | 소비형 |

가격은 Play Console에서 국가별로 정합니다. 앱은 Play Console이 돌려준 현지 통화 가격을 그대로 표시합니다.

## 1. 구매 검증 서버 준비

1. Google Cloud Console에서 이 프로젝트의 **Google Play Android Developer API**를 사용 설정합니다.
2. Firebase Functions가 사용하는 서비스 계정을 Play Console에 연결하고, 인앱 상품 구매를 조회하는 데 필요한 권한만 부여합니다.
3. 프로젝트 폴더에서 다음 명령을 실행합니다.

```powershell
npm.cmd --prefix functions install
firebase login
firebase use lifelog-98fff
firebase deploy --only functions:api
```

4. 배포가 끝나면 표시되는 URL을 `config.js`의 `playBilling.backendUrl`에 입력합니다. 이 프로젝트의 리전 기준 예시는 다음과 같습니다.

```js
backendUrl:"https://asia-northeast3-lifelog-98fff.cloudfunctions.net/api"
```

서버를 배포하기 전에는 테스트 결제도 시작되지 않도록 막혀 있습니다. 서비스 계정 키 JSON을 앱이나 저장소에 넣으면 안 됩니다.

## 2. 앱 빌드

Android Studio에서 JDK 21과 Android SDK를 설치한 뒤 프로젝트 루트에서 실행합니다.

```powershell
npm.cmd install
npm.cmd run app:sync
npm.cmd run app:build:bundle
```

이 저장소는 OneDrive가 Gradle 임시 파일을 잠그는 문제를 피하려고 빌드 산출물을 아래 폴더에 둡니다.

```text
C:\Users\Public\drawervillage-android-build\android\app\outputs\bundle\release\app-release.aab
```

명령으로 만든 release AAB가 서명되지 않았다면 Android Studio에서 `Build > Generate Signed App Bundle or APK > Android App Bundle`을 선택해 업로드 키로 서명합니다. 첫 출시라면 Play App Signing을 켜고 업로드 키를 안전하게 백업합니다. 기존 앱을 업데이트할 때는 같은 업로드 키와 더 높은 `versionCode`가 필요합니다.

현재 앱은 `targetSdk 36`, `versionCode 3`, `versionName 1.0.1`로 설정되어 있습니다. 웹 화면을 고친 뒤에는 반드시 `npm.cmd run app:sync`를 먼저 실행해야 최신 HTML·CSS·JavaScript와 서비스 워커 캐시 버전이 앱에 들어갑니다.

## 3. Play Console 내부 테스트

1. 패키지 이름이 `com.drawervillage.app`인 앱을 Play Console에 만듭니다.
2. 위의 인앱 상품 4개를 만들고 활성화합니다.
3. `테스트 및 출시 > 내부 테스트` 트랙에 서명된 AAB를 업로드합니다.
4. 테스터 이메일을 내부 테스트 명단과 라이선스 테스트 명단에 모두 추가합니다.
5. 테스터는 Play Console의 참여 링크를 연 뒤 **Play 스토어에서** 앱을 설치합니다. APK를 직접 설치한 앱으로는 실제 Play 결제를 제대로 시험할 수 없습니다.
6. Google Play 테스트 결제 수단으로 각 상품을 한 번씩 구매합니다.

반드시 확인할 항목:

- 앱 상점에 Toss 버튼이나 웹 결제 링크가 나타나지 않는지
- 결제 취소 시 슬롯이나 저장 공간이 지급되지 않는지
- 결제 성공 후 서버 검증이 끝나야만 권한이 늘어나는지
- 같은 구매 토큰을 다시 보내도 권한이 중복 지급되지 않는지
- 앱 재설치 후 `구매 복원`으로 비소비형 상품이 복원되는지
- 소비형 상품은 지급 후 정상 소비되어 다시 구매할 수 있는지
- 네트워크가 끊긴 상태에서 결제를 시작하지 않거나 안전하게 실패하는지

## 4. 업데이트 배포

코드를 수정한 뒤 `npm.cmd run app:sync`를 실행하고 새 AAB를 만듭니다. `android/app/build.gradle`의 `versionCode`를 이전 출시보다 올리고, 같은 업로드 키로 서명해 새 릴리스를 올립니다. Play Console에서 심사를 통과하면 사용자는 Play 스토어의 자동 업데이트 설정에 따라 새 버전을 받습니다.

## 로컬에서 확인할 수 없는 것

로컬 컴파일은 결제 모듈 연결과 문법 오류까지만 확인할 수 있습니다. Google Play가 실제 주문을 만들고, 라이선스 테스터 결제를 승인하고, Play Developer API가 해당 주문을 반환하는 전체 과정은 Play Console 내부 테스트 트랙에서만 최종 확인할 수 있습니다.

## 피드백 메일을 실제로 받기

피드백 수신 주소는 `kkyaareuk@gmail.com`입니다. Firebase Functions가 Gmail로 메일을 보내려면 일반 Google 비밀번호가 아니라 Gmail **앱 비밀번호**를 Secret으로 한 번 등록해야 합니다.

```powershell
firebase functions:secrets:set FEEDBACK_GMAIL_APP_PASSWORD
firebase deploy --only functions:api
```

첫 명령이 값을 물으면 `kkyaareuk@gmail.com` 계정에서 만든 16자리 앱 비밀번호를 붙여 넣습니다. 이 값은 저장소나 `config.js`에 적지 않습니다. Secret과 Functions 배포가 없으면 앱은 피드백을 Firestore에만 기록하거나 이메일 앱 열기 방식으로 대체하며, 개발자 메일함에 자동 수신되지 않을 수 있습니다.

## Pixel_7 에뮬레이터가 종료될 때

AVD 데이터 삭제 없이 다음 순서로 확인합니다.

1. Android Studio의 `Tools > Device Manager`를 엽니다.
2. `Pixel_7` 오른쪽의 점 세 개 메뉴에서 `Cold Boot Now`를 누릅니다.
3. 그래도 종료되면 `Edit`에서 `Graphics`를 `Software - GLES 2.0`으로 바꾸고 다시 실행합니다.
4. 동시에 떠 있는 에뮬레이터가 없는데도 `already running`이 나오면 Android Studio를 닫고 작업 관리자에서 `emulator.exe`, `qemu-system-x86_64.exe`가 없는지 확인한 뒤 다시 엽니다.
5. `Wipe Data`는 앱·에뮬레이터 데이터를 지우므로 백업 전에는 누르지 않습니다.

현재 프로젝트의 AVD는 2GB RAM, 4코어, Android 35 Play Store 이미지로 구성되어 있습니다. AVD가 계속 즉시 종료되면 Android Studio의 `Device Manager > Pixel_7 > View Details`와 `Help > Show Log in Explorer`의 마지막 오류를 확인해야 합니다.

## 연령과 콘텐츠 안전 원칙

- 새 캐릭터의 연령대에는 영아·유아를 제공하지 않습니다. 기존 저장 데이터에 이미 있는 값은 강제로 삭제하지 않습니다.
- 어린이·청소년 캐릭터가 포함된 조합에서는 데이트·연애·성인 친밀 행동 후보를 만들지 않습니다.
- `아기`는 캐릭터가 아니라 집의 반려생물/함께 사는 존재 유형에서 돌봄 대상으로 추가합니다.
- Google Play의 `타겟층 및 콘텐츠` 설문에는 실제 게임 내용에 맞는 연령층을 선택하고, 어린이를 타겟으로 선택할 때만 Families 정책 전체를 별도로 충족해야 합니다.
