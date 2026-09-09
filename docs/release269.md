# 서랍마을 개발판 269 · 1.0.238

개발 브랜치 dev의 Android 설치 APK와 업로드용 AAB입니다. 운영 main264와 iOS14는 유지하며 Play Console에 업로드하지 않았습니다.

## 한국어 업데이트
- 마을 지도를 이동한 뒤 화면이 갱신되면 왼쪽으로 돌아가던 문제를 수정했습니다. 편집 중에도 위치를 유지합니다.
- 유저 프로필 사진 저장 중 updateDoc 오류가 나던 문제를 수정했습니다.
- 멀티 구성원을 건물 정보와 같은 전체 화면 카드 목록으로 변경했습니다. 카드에서 거주지 확인, 집 방문, 사진·설정 갱신, 퇴거 등을 할 수 있습니다.
- 구성원 화면에 입주 신청하기를 추가했습니다. 그룹장이 수락하면 캐릭터와 집이 입주합니다.
- 구성원 상세에 동거 제안하기를 추가했습니다. 집 주인이 수락하면 해당 멀티의 거주지가 변경됩니다.
- 관계 화면 및 구성원 화면에 받은 제안·보낸 제안 버튼을 표시했습니다. 수락·거절과 거절 사유를 확인할 수 있습니다.
- 멀티 정보가 갱신되어도 시선·관계·그룹 설정 창과 입주·동거 작성 화면이 유지됩니다.
- Android 첫 실행 시 알림 권한 요청을 연결하고, 로그인 후 기기의 푸시 등록을 연결했습니다.
- 태블릿 가로 화면 상단 장식을 전체 폭으로 연결하고 나무 상단바를 화면 높이에 맞춰 이름·시간이 들어가도록 수정했습니다.

제안 확인: 멀티 선택 → 관계 → 받은 제안·보낸 제안. 마을 → 구성원에서도 같은 제안함을 열 수 있습니다.
입주 신청: 멀티 마을 → 마을 → 구성원 → 입주 신청하기.
동거 제안: 구성원 카드 → 동거 제안하기 → 내 캐릭터와 함께 살 집 선택.

## English
- Town map refreshes now preserve the camera position, including while editing.
- Fixed the missing updateDoc reference when saving a profile photo.
- Multiplayer residents now use a full-screen card list, with home visits and resident management.
- Added move-in applications approved by the host and shared-home proposals approved by the home owner.
- Made received/sent proposals visible from Relationships and Residents; retain editors during live updates.
- Request Android notification permission on first launch and register the device after sign-in.
- Connected the tablet top decoration across both panes and resized the wooden header to contain the name and clock.

## 日本語
- タウンの更新時や編集中に地図の表示位置が左端へ戻る問題を修正しました。
- プロフィール写真の保存時に発生する updateDoc エラーを修正しました。
- マルチの住民を全画面のカード一覧に変更し、家の訪問や住民管理につなげました。
- ホストが承認する入居申請と、家の所有者が承認する同居提案を追加しました。
- 関係・住民画面から受信／送信した提案を確認できます。更新時も編集中の画面を維持します。
- Android 初回起動時の通知権限リクエストと、ログイン後の端末登録を追加しました。
- タブレットの上部装飾を全幅につなぎ、木製ヘッダーに名前と時計が収まるよう修正しました。

## 検証 / 검증
- 서버 테스트: 입주·동거 수락 전 데이터 보존, 수신자만 응답, 거절 보존, 수락 후 집/주민 생성, 중복 응답, 기존 관계 제안·권한·배치 충돌 검사 통과.
- 브라우저 UI 검사: 멀티 제안 전송·거절·시선 저장, 편집창 갱신 유지, 구성원 전체 화면, 입주·동거 제출, 개인/멀티 지도 위치, 개인 데이터 격리 검사 통과.
- 실제 프로필 저장 함수와 네이티브 푸시 모듈을 대체 SDK로 실행해 사진 업로드→계정→구성원 갱신, 첫 권한 요청→로그인 후 토큰 등록 검사 통과.
- 384px 휴대폰 및 1280×800 / 1536×960 태블릿 화면 확인.
- Android release APK/AAB 빌드 및 APK v1/v2 서명 검증 통과. 패키지의 실행 자산 234개가 준비본과 해시 일치.
- sharedTownApi 및 relationshipNotification 서버 배포 완료.
- 실제 두 휴대폰 사이 푸시 도착, 실계정 사진 업로드, Galaxy 기기 설치 후 동작은 아직 확인하지 않았습니다. 자동 검사와 실기기 검증을 구분합니다.
- 영어 2183/2871 (76.0%), 일본어 2182/2871 (76.0%). 이번 신규 주민 관리 문구는 한국어·영어·일본어 작성.
- 이전의 공유 집 내부 전체 편집·이미지 업로드·삭제/복구, iOS 출시 등 미완료 작업은 작업판에 유지합니다.
