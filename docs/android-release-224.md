# Android 1.0.207 · versionCode 224

2026-09-05 `dev` 내부 테스트 빌드입니다. Play Console 업로드·배포는 진행하지 않았습니다. Play Console에 이미 `versionCode 224` 이상이 등록되어 있다면 이 AAB를 업로드하지 말고 더 큰 버전 코드로 다시 빌드해야 합니다.

## 파일

- 바로 설치용 APK: `drawer-village-v1.0.207-code224-dev-debug.apk`
- Play Console 업로드용 AAB: `drawer-village-v1.0.207-code224-dev-release.aab`
- APK SHA-256: `5A79CEE74E2C8620D32BD5F6619A7C8A61B998D2CB21666A14C6B3EC5CB7ADAE`
- AAB SHA-256: `5A864FF12D5190F2AC9065714F0753F7398C343C165D14D57AF67BB7D6B1880D`

## 한국어 출시 노트

서랍마을 1.0.207 업데이트

- Android 태블릿에서도 휴대폰과 똑같은 단일 화면 구성으로 캐릭터·홈·마을·설정을 이용할 수 있습니다.
- 태블릿 앱은 세로 화면으로 실행되며, 캐릭터 창도 휴대폰과 같은 주민등록증·빠른설정·전체설정 흐름을 사용합니다.
- 관찰 화면과 마을 화면의 흰색 상단 제목 크기와 위치를 홈 화면 기준으로 통일했습니다.
- 가로 태블릿에서 캐릭터 목록만 보이고 상세 설정 영역이 비어 있던 오류를 제거했습니다.

## English release notes

Drawer Village 1.0.207 Update

- Android tablets now use the same single-column phone layout across Characters, Home, Town, and Settings.
- The tablet app opens in portrait, and the Characters screen follows the same ID-card, Quick Settings, and Full Settings flow as phones.
- White header titles on Observe and Town now match the Home screen's size and position.
- Fixed an issue where the character roster appeared but the details area stayed blank on a landscape tablet.

## 日本語リリースノート

ひきだし村 1.0.207 アップデート

- Androidタブレットでも、人物・家・村・設定をスマートフォンと同じ1カラム画面で利用できるようになりました。
- タブレット版は縦画面で起動し、人物画面もスマートフォンと同じ住民登録証・クイック設定・全設定の流れを使用します。
- 観察画面と村画面の白い上部タイトルの大きさと位置を、家画面の基準に統一しました。
- 横向きタブレットで人物一覧だけが表示され、詳細設定欄が空白になる問題を修正しました。

## 검증

- 224 전용 검사에서 Android 게임 카테고리, 세로 방향 요청, Android 16 호환 속성, 태블릿의 480px 휴대폰 레이아웃 전환, 캐릭터 휴대폰 허브 분기, 관찰·마을 제목 좌표를 확인했습니다.
- 캐릭터 편집 UI, 선택 상태 연속성, 계정 격리·첫 로그인 데이터 보존, 기존 제보 오류, 보행·태블릿 설정 회귀검사를 통과했습니다.
- Android 앱 자산 준비와 동기화, 32개 모듈 의존성, 214개 빌드 자산의 AAB 바이트 일치를 확인했습니다.
- `clean assembleDebug bundleRelease`가 성공했습니다. debug APK에서 패키지 `com.drawervillage.app`, `versionCode 224`, `versionName 1.0.207`, `screenOrientation=portrait`, `appCategory=game`, Android 16 호환 속성을 확인했습니다.
- release AAB는 `jar verified`입니다. 자체 서명 체인과 타임스탬프 없음 경고는 남아 있습니다.
- 전체 UI 정적 번역률: 영어 2083/2771 (75.2%), 일본어 2082/2771 (75.1%). 이번 변경의 출시 노트는 한국어·영어·일본어로 작성했습니다.
- 실제 Galaxy 태블릿에서의 세로 고정·휴대폰 레이아웃 체감 확인과 Play Console 업로드는 아직 진행하지 않았습니다.
