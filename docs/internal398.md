# 398 · 홈 재구성 및 친구 코드

Android 1.0.346 / code398 / Build20260915dev398. dev 개발, 게임 main 유지.

## 변경
- 첨부 HTML을 기준으로 모바일 홈 하단 집·마을·광장·서랍·상점. 왼쪽 메뉴는 서랍 안 6개 기능으로 통합.
- 사용자 새 그림의 서랍과 휴대폰을 추출하고 광장에는 기존 공원 외관 사용.
- 오른쪽 우편함 아래 친구, 그 아래 설정. 심리테스트와 남은 시간은 생활 카드의 이전 할 일 정하기 위치.
- 광장은 실제 멀티 목록·참여 경로를 제공. 원형 바로가기는 실제 참여 멀티를 표시. 마피아·무도회 및 게임 진행/차례 모델은 후속 작업이며 구현된 것으로 표시하지 않음.
- 친구 코드 검색→요청→상대 수락 후 양쪽 친구 목록에 저장. 거절·요청 취소·친구 해제 제공. 계정별 코드, 중복 방지, 상대방 수락 권한, 양방향 차단 검사, 수량·요청 제한, 계정 삭제 연동.
- 자동 폴링 없이 친구 창 열기 및 새로고침 때만 조회. 받은 요청은 친구 창에서 확인.
- 데스크톱 관찰에도 광장·서랍·친구 진입 추가.

## 검증
- check-friends398: 개인 코드, 검색, 자기 자신 제한, 중복·교차 요청, 수신자 외 수락 거부, 양쪽 친구 등록·해제, 거절·취소, 차단·요청량 제한, Firestore 읽기/쓰기 순서 통과.
- qa-home398 Chromium/WebKit: KO/EN/JA, 360·412px 홈/서랍/광장 경계와 진입, 심리테스트 위치, 친구 수락 UI 및 이름 HTML 이스케이프 통과. 친구 UI는 격리 fixture로 검증, 실제 사용자 두 계정 간 실기기 왕복은 미검증.
- qa-web397: 지도 화면 채움, 질문 아이콘, 전체 읽음 및 제안 상태 보존 회귀 통과.
- 기존 user-safety 검사 통과. 서명 AAB 빌드 성공, 새 JS/CSS/이미지 원본 바이트와 index398 표식 일치, jarsigner 검증 통과.
- AAB SHA256: 599431E15A374E0BB4CC22E73D330B64FA1E0808A6BF01B804DF9F6DAA5E0ACE
- 새 화면 영어100% / 일본어100%, 앱 전체 번역률 미측정. iOS는 공통 WebKit 검증, 이번 IPA 업로드 없음.

## 출시 노트
<ko-KR>
홈 하단을 집·마을·광장·서랍·상점으로 정리했어요. 캐릭터·관계·사전·일정·기록·통계를 서랍에서 열 수 있어요. 우편함 아래에 친구를 추가하고, 친구 코드 검색과 요청·수락·거절·취소를 지원해요. 심리테스트와 남은 시간을 생활 카드로 옮겼어요.
</ko-KR>
<en-US>
Reorganized the home dock into Home, Town, Plaza, Drawer and Shop. Open character settings, relationships, the dictionary, schedules, records and stats from the Drawer. Added Friends below Mail, with friend codes and requests you can accept, decline or cancel. Moved the personality test and countdown to the activity card.
</en-US>
<ja-JP>
ホーム下部を家・村・広場・引き出し・店に整理しました。キャラクター・関係・辞典・予定・記録・統計は引き出しから開けます。郵便の下にフレンドを追加し、コード検索と申請・承認・辞退・取消に対応しました。心理テストと残り時間を生活カードに移動しました。
</ja-JP>

## 배포 완료
- 공개웹 drawervillage.com: Cloudflare Pages e666db1e, web398. 실제 공개 홈의 광장·서랍·친구·심리테스트 표시와 서랍 팝업 확인.
- sharedTownApi, accountDeletionApi 서버 배포 완료. 원래 공개 API 인증 경로 사용, 새 데이터 컬렉션은 서버에서만 접근.
- Android 내부 테스트 release295, 2026-09-15 12:06 KST 내부 테스터에게 제공됨 확인.
- 계정 삭제 회귀에 친구 코드 삭제 및 다른 사용자의 관계만 정리하는 검사 추가·통과.
