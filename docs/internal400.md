# 1.0.348 (400) — 홈 참여 게임 · 마을 선택 · 첫 진술

기준: dev ffd485d / Android 399. 새 기능은 dev에만 반영하며 game main은 유지한다.

## 변경
- 참여 놀이 목록을 실제 프로필 원의 아래로 배치. 일반 테마 버튼 규칙에서 제외하여 미색 네모 배경 제거.
- 멀티 멤버의 방장 프로필 사진을 원 안에 표시. 사진이 없거나 로드 실패하면 이름 첫 글자. 게임명은 흰색·검은 테두리, 아래에 현재 단계의 남은 시간과 참가 인원/정원.
- 심리테스트 메뉴를 자아만들기 / Self-discovery / 自分づくり로 변경.
- 홈 날짜·시간 아래에 내 마을/참여 멀티 선택. 기존 인증된 마을 전환 이벤트 이용.
- 마피아 회의 첫 라운드는 아침·점심·저녁·밤 진술. 본인 초안을 수정하여 제출하고 NPC/미제출자는 기본 진술. 공개 주장은 개인 증거 카드와 구분하며 전원 진술 후 카드 토론·투표로 이어진다.
- 이전 앱이 첫 라운드에 기존 토론 동작을 제출해도 기본 진술로 호환. 제출자 소유권/장소/동작 검증과 비밀 역할·카드 분리 유지.
- 첨부 설계안 전체(60초 동시 턴, 끼어들기, 실제 지도 등)는 이번 UI/첫 진술 요청의 구현 확정으로 취급하지 않음. 기존 비동기 단계 시간 유지.

## 검증
- check-games400: 네 시간대 순서, 사용자 수정, NPC 기본 진술, 개인 초안/역할 분리, 증거와 주장 구분, 중복 방지, 기존 게임·클라이언트 호환 및 인증/소유권/입력 정규화.
- check-games399: 100개 seed 완주와 결정론, 게임 권한·NPC 동의·역할/개인 카드·자동 진행 회귀 통과.
- qa-home400 실제 dist: KO/EN/JA, 360×640·384×854·412×892·1024×768 native preview. 프로필 겹침·사진/흰 글씨/투명 배경·시간/참여 인원·마을 선택 이벤트·기존 서랍/친구/광장 경계 검사.
- qa-games400 실제 dist Chromium/WebKit: 3개 언어, 계획/첫 진술/카드 토론/투표 화면 경계와 제출 경로 검사.
- 친구 요청 및 계정 삭제 회귀 통과. AAB의 공통 UI 파일 원본 바이트·400 빌드 표식·jarsigner 서명 확인.
- 영어/일본어: 이번 변경 문구 각 100%. 전체 앱 번역률은 미측정.
- iOS 영향: 공통 UI 및 WebKit 검사만 수행. 신규 서명 IPA/스토어 배포 없음.
- 실제 사용자 계정 간 장시간 멀티 플레이와 밸런스는 미검증.

## 배포
- 공개 사이트 drawervillage.com: Cloudflare Pages c56b9c77 / web400 배포 완료. 공개 DOM에서 app.js?v=20260915web400, 자아만들기와 모바일 마을 선택·가로 넘침 없음 확인.
- sharedTownApi: 최종 호환 처리 포함 업데이트 성공.
- Android: Play 내부 테스트 release297, 2026-09-15 14:31 KST 내부 테스터에게 제공됨 확인. 프로덕션/비공개 테스트 승격 없음.
- AAB: C:/Users/Public/drawer-releases/drawervillage-1.0.348-400-internal.aab
- SHA256: b4ef4a74e2c9ff3372454c6fca2a8cdee15e7c7bee8365e4a405419b510a74de

## Play 출시노트
<ko-KR>
참여 중인 놀이를 프로필 아래로 옮겼어요. 방장 프로필 사진과 남은 시간·참여 인원을 표시하고 네모 배경을 없앴어요. 심리테스트 이름을 자아만들기로 바꾸고 날짜·시간 아래에 마을 선택을 추가했어요. 마피아 회의 첫 차례에 아침·점심·저녁·밤의 행동을 진술하고, 모두의 진술을 목격 카드와 비교할 수 있어요.
</ko-KR>
<en-US>
Moved joined games below your profile. Game shortcuts show the host’s portrait, time remaining and player count without a square background. Renamed the personality test to Self-discovery and added a village selector below the clock. Mafia meetings now start with statements about the morning, afternoon, evening and night, ready to compare with witness cards.
</en-US>
<ja-JP>
参加中のゲームをプロフィールの下へ移しました。四角い背景をなくし、ホストの写真・残り時間・参加人数を表示します。心理テストの名称を「自分づくり」に変更し、時計の下に村の選択を追加しました。マフィアの会議では最初に朝・昼・夕方・夜の行動を証言し、全員の証言を目撃カードと比較できます。
</ja-JP>
