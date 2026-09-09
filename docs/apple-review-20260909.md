# Apple 심사 추가 정보 준비 — 2026-09-09

App Store Connect에서 직접 확인한 대상: iOS 1.0.215 (16), 제출 ID b325a13b-4082-47ee-9149-977b67760a1c.

사유: Guideline 2.1 — Information Needed — New App Submission. Apple은 심사 이력이 적은 개발자 계정의 앱을 이해하기 위해 아래 자료를 요청했다. 특정 충돌 재현 단계는 이 메시지에 제시하지 않았다. 아래 문서는 준비용이며 Apple에 전송하지 않았다.

## 필수 자료

1. 최신 OS를 설치한 실제 iPhone/iPad에서 촬영한 화면 녹화. 앱 실행부터 일반 이용 흐름, 가입/로그인/계정 삭제, 사용자 콘텐츠 신고 및 차단, 유료 기능 구매 진입을 포함한다. 시뮬레이터 영상으로 대체하지 않는다.
2. 앱 목적과 이용 대상, 제공하는 가치.
3. 주요 기능 접근 방법과 필요한 심사용 계정/샘플.
4. 핵심 기능에 사용되는 외부 서비스 목록.
5. 지역별 기능 차이 또는 동일 동작 확인.
6. 규제 대상 서비스나 보호되는 타사 자료가 있으면 관련 권한 자료.
7. 인앱 구입 상품 설명과 구매 흐름 접근 방법.

Apple은 회신과 App Review Information의 Notes 양쪽에 정보를 넣으라고 요청했다.

## 촬영 순서

- 실제 기기 모델 및 OS 버전을 기록한다. 제출할 빌드 번호와 설치된 빌드 번호를 대조한다.
- 앱을 종료한 상태에서 녹화를 시작하고 앱을 실행한다.
- 초기 안내, 로그인, 캐릭터 생성/편집, 집과 마을, 활동 선택을 보여 준다.
- 멀티 초대/참여와 공유 콘텐츠의 신고/차단을 보여 준다. 기능이 없거나 동작하지 않으면 구현 및 검증 후 촬영한다.
- 상점에서 캐릭터 5명 추가, 마을 1개 추가, 서랍마을 응원 선물의 구매 화면을 보여 준다. 심사용 테스트 결제를 이용한다.
- 폐기 가능한 본인 테스트 계정에서 재인증, 삭제 범위 확인, 계정 삭제 완료까지 보여 준다. 실제 이용자 계정을 촬영용으로 삭제하지 않는다.
- 개인 알림, 비밀번호, 인증번호, 다른 이용자의 개인정보가 영상에 포함되지 않게 확인한다.

## 회신 초안에 사용할 확인된 정보

- 앱은 사용자가 캐릭터의 성격, 관계, 집과 마을을 설정하고 일상 장면을 관찰하는 창작용 생활 시뮬레이터다.
- Firebase Authentication, Cloud Firestore, Cloud Storage, Cloud Functions를 사용한다. 구매는 iOS에서 StoreKit 기반 인앱 구입을 검증해야 한다.
- 제출에 포함된 상품은 캐릭터 5명 추가, 마을 1개 추가, 서랍마을 응원 선물이다.
- 제작자는 기본 그림을 직접 그렸고 음악도 직접 작곡했다고 확인했다. 폰트와 기타 번들 자료의 라이선스까지 이 진술만으로 확인됐다고 쓰지 않는다.

## 아직 확인할 사항

- 실제 기기 영상 및 접근 가능한 영상 링크/첨부.
- iOS 제출 빌드의 로그인, 계정 삭제, 콘텐츠 신고/차단, 구매 동작. Android 개발 소스의 기능을 iOS 16번 빌드에 있다고 설명하지 않는다.
- 실제 제출 빌드의 지역별 차이 및 심사 계정 접근 방법.
- 결제·개인정보 등 민감한 내용을 포함하지 않은 최종 영어 회신. 확인 전에는 제출하지 않는다.

## 1.0.260 / build 17 준비 (2026-09-09)

Android 293 / dev747de94의 공통 게임 모듈을 iOS 후보15641be에 반영했다. Apple 로그인, 네이티브 리디렉션 초기화 방지, StoreKit 연결을 유지하고 새 계정 삭제 흐름에 Apple 재인증 및 토큰 취소를 연결했다. App Store에 기존 제출된 빌드16이 자동으로 바뀌는 것은 아니다.

- 공통 게임 파일의 정규화 SHA256을 ios-production-source.json으로 확인한다.
- Apple nonce 누락 거부, 다른 계정 재인증 시 삭제 API에 도달하지 않음, 사교 명령 UI와 로컬 준비 검사 통과.
- GitHub Actions34313516893에서 서명/업로드 진행. 결과는 별도 기록한다.
- 실제 iPad/iPhone 검증과 화면 녹화는 아직 없음.
- 현재 소스에서 이용자별 UGC 신고/차단을 확인하지 못했다. 피드백 보내기와 방장의 추방 기능을 일반 사용자의 신고/차단 완료라고 설명하지 않는다. 이 흐름을 보완한 후 제출해야 한다.
- 재심사 제출은 아직 하지 않았다.

## 회신 작성용 영문 초안 (미제출, 빈 항목 완료 후 사용)

Thank you for reviewing Drawer Village. We are preparing an updated build and the additional information requested under Guideline 2.1.

1. Physical-device recording: [Attach the completed recording and record the device model, OS version, app version and build number. Include launch, authentication, core gameplay, user-generated-content reporting/blocking, purchases and account deletion.]
2. Purpose and audience: Drawer Village is a character life simulation for people who enjoy creating fictional characters and observing their daily lives. Users configure personalities, relationships, homes and towns, then choose activities and observe the resulting scenes and logs.
3. Main features and access: [Verify the exact onboarding steps on the submitted build. Provide reviewer access to multiplayer and any required demo credentials through the App Review Information fields.]
4. Services: Firebase Authentication, Cloud Firestore, Cloud Storage and Cloud Functions support account and shared-world functions. iOS purchases use StoreKit and server-side transaction verification. [Confirm the final complete service list against the release build.]
5. Regional behavior: [Confirm the final release behavior, localization and storefront availability.]
6. Rights: The developer created the supplied original game illustrations and composed the main theme. [Finish the bundled-font and other-asset license inventory; attach authorization where applicable.]
7. In-App Purchase: The submitted catalog contains an additional five character slots, an additional town slot, and a one-time support gift. Open the Shop from the main screen to view the catalog. [Verify purchase and restore behavior and the final support-gift benefits against the submitted build.]

This draft must not be sent while bracketed items remain. Copy the verified final information into both the App Review reply and App Review Information Notes, as requested.


## 실제 영상 확인 및 재심사 준비 — build 32

- 본편: ScreenRecording_09-09-2026 22-41-25_1.mp4, 약 8분 26초. TestFlight32에서 실행, 캐릭터/마을/멀티 흐름, 5:58 구매 완료, 7:00 신고 접수, 8:10 계정 삭제 완료 확인.
- 보충: ScreenRecording_09-09-2026 23-03-57_1.mp4, 약 1분 55초. Apple 로그인과 최초 사용자 프로필 설정, 1:53 차단 계정 관리 목록에 대상 계정이 표시된 상태 확인.
- 두 영상은 실제 iPad 2732x2048 녹화. 원본을 편집하거나 공개 호스팅하지 않았다.
- App Store 버전 표시를 1.0.269로 저장·확인했다. 현재 연결된 심사 빌드는 여전히16이다. 32 연결 및 첨부/심사 회신/재제출은 완료되지 않았다.
- 멤버 차단·퇴장 선택은32 이후 별도 코드 변경이므로32 영상에서 시연됐다고 설명하지 않는다.
