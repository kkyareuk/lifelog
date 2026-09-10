# dev322 / 1.0.289

- 携帯 상점 말풍선 기존 스타일 left6px/width44%,370이하 left5px. Tablet 기존 override 유지.
- 무료 가족 상세 타입 및 기준인/양방향역할 복원. 모든 관계 표시순서 유지, 기준인 제외 다른구성원 nav 화살표 옆 select·혈연 체크. 멀티 본인캐릭터 기준인 선택 제한 유지. 기존 타입/역할 데이터 보존. 기본관계↔familyArchive.roleLinks 함께 저장, 부모/자녀 legacy ID는 역할 방향에 맞춤.
- 가족팩 이름: 캐릭터 탭 기존 이름 입력칸을 누르면 이름/성 dropdown/성추가/미들네임/배치 편집 dialog. 키보드 Enter 지원. familySurnames 계정 상태로 저장, 기존 성 및 캐릭터 nameParts에서 후보 구성. 기존 이름 자동분해 안함. 저장실패 rollback. entitlements.familyLegacy 또는 검증된 purchases의 family_story 기준. 가족팩 내 기존 이름편집도 같은 보유 검사.
- 실제 Play 상품등록/구매영수증 지급 연결은 여전히 미완료. 이번 보유/미보유 UX 검사는 mock entitlement로 검증한 것이며 실결제 성공을 뜻하지 않음. 기본 가족 역할은 무료, 가족팩이 기존 설정을 확장.

검증: Chrome 실제 UI KO/EN/JA×384/1180. 무료 친척 선택·기준인 제외 dropdown·혈연·저장, 비보유 이름창 차단, 보유 캐릭터 이름 입력 클릭·성 추가·성우선배치 저장, 상점 말풍선 이미지 decode 후 시각확인. 기존 친족 역방향/추론/공유시선·가족기록 pure test. 웹/Android module closure. 전체정적번역 EN2239/2945(76.0%),JA2238/2945(76.0%). 새문구3언어.

배포: 앱dev/작업판main, 운영앱main 유지. Play·운영웹·서버 배포 및 공지발송 없음. iOS공통소스 포함, 서명·IPA·실기기검증 없음. dev321의 신규 멀티API 서버배포 요건 유지. 개발팩 실결제 미연결.
