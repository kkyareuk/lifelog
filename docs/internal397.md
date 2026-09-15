# 1.0.345 (397) 공개 웹·우편 읽음·마을 화면

기준 dev513e4fb / Android396. 사용자가 drawervillage.com 공개 배포를 명시함. 게임 main과 기존 자동 배포 연결은 변경하지 않고 dist를 Cloudflare production으로 배포.

## 변경
- 우편함 공지/받은우편에 전체 읽음으로 표시. 이전 페이지를 불러온 뒤 계정별 읽음 상태를 한 번에 저장. 제안/선물의 수락·응답 상태는 유지. 실패 시 성공 안내 없이 재시도. 계정 전환 시 중단.
- 질문받기 아이콘: 숨겨진 탭에서 렌더될 때 기존 아이콘만 지우고 재생성하지 않던 조건 제거.
- 마을 캔버스가 화면보다 짧지 않게 계산. 긴 화면의 지도 하단 빈 공간, 마을 이름/선택 버튼의 높이 의존 겹침 수정. 데스크톱은 지도 비율을 유지하며 넘치는 지도는 이동 가능.
- 웹은 최신dev 런타임 전체를 배포. 전 웹341 이후 앱에서 수정한 대명사·욕구·관계·저장·공유 집 수정 포함.
- 최초 서비스워커의 대량 이미지/글꼴 선다운로드 제거. 새 버전 키가 붙은 JS/CSS는 서비스워커 cache-first. HTML/config는 네트워크 확인 유지.
- 웹 패키지의 정적 이미지216개 참조를 기존 검증 WebP로 연결. 대상98개 원본 합42,223,140B → WebP합23,803,612B(전체 페이지 전송량/로딩 개선율과 다름). 사용자 이미지/데이터는 변환하지 않음.
- 웹 런타임157모듈의 버전 키 통일, 동적 import 의존 파일도 포함. 최종web cache20260915web397b.

## 검증
- qa-web397: 400×960/400×1600/800×1920/1440×1000 가로 넘침·지도 경계, 질문 버튼. 60건 읽음·그룹 식별·새 우편 미읽음, 실제 전체읽음 클릭과 이전페이지 로드 및 제안pending 보존.
- qa-web341 회귀: KO/EN/JA 데스크톱 메뉴·계정·멀티·브라우저 음소거·모바일HUD·상점, pageerror 없음.
- 긴 모바일 마을 화면 렌더 확인. 초기에 발견한 마을 제목/버튼 겹침을 수정한 후 재검증.
- Gradle 서명release 빌드 통과, AAB 웹377개 www원본과 일치. SHA256 C6431E61C63C921885EC198B40677A833B2D0D010CCC391C251EE6A27F1887E0.
- 속도 검증 범위는 초기 자산/캐시 구조와 로컬 10명 UI 경로. 실제 사용자 계정의 클라우드 동기화 지연이나 기기별 전체 속도 개선율은 미측정.
- 새 UI 문구 영어100% / 일본어100%, 전체 앱 번역률 미측정. iOS 공통코드 영향, 신규IPA 배포 없음.

## 배포
- 공개웹 https://drawervillage.com : 최종 Cloudflare Pages 0f7bf9b5. web397b app.js 제공 및 공개 우편함 전체읽음 버튼 확인.
- Android1.0.345 / code397 / Build20260915dev397. Play 내부 테스트 release294, 2026-09-15 11:02 KST 내부 테스터에게 제공됨 확인.
- AAB C:/Users/Public/drawer-releases/drawervillage-1.0.345-397-internal.aab

## Play 출시 노트
<ko-KR>
우편함에 전체 읽음으로 표시 버튼을 추가했어요. 긴 화면에서도 마을 배경이 끝까지 채워지도록 하고, 상단 마을 이름과 버튼 겹침을 수정했어요. 질문받기 아이콘이 화면 갱신 중 사라지는 문제를 개선했어요.
</ko-KR>
<en-US>
Added Mark all as read to the mailbox. The town map now fills tall screens, and town names no longer overlap the header buttons. Fixed the question icon disappearing during background screen updates.
</en-US>
<ja-JP>
郵便箱に「すべて既読にする」を追加しました。縦長の画面でも村の背景が下まで表示され、上部の村名とボタンが重ならないようにしました。画面の更新中に質問アイコンが消える問題を改善しました。
</ja-JP>
