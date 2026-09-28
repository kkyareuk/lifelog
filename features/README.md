# 기능별 코드

새 코드와 이번에 분리한 기존 코드를 기능별로 모은다. 진입 파일의 상대 경로와 웹·네이티브 자산 포함을 함께 검증한다.

- `characters/starter-presets.js`: 새 캐릭터의 성격·생활 프리셋과 선택창. 기존 프로필을 변경하지 않는다.
- `home/occupant-size.js`: 작은 방 침대 아이콘의 최소 표시 크기.
- `mail/contact-phrases.js`: 캐릭터 연락 문장 원본(한국어·영어·일본어).
- `mail/portrait.js`: 개인·멀티 프로필 이미지 선택과 실패 시 대체 사진.
- `mail/select-picker.js`: 편지 발신·수신자 선택창. 기존 select/FormData를 단일 상태로 유지한다.
- `settings/contact-picker.js`: 알림 캐릭터 선택창과 열기·닫기.

이번 정리는 전체 재작성의 완료가 아니다. 다음 분리 후보는 app.js의 알림 일정 생성과 views.js의 설정 화면이다. 각각 상태 변경 및 기존 저장 형식을 보존하는 단위로 옮긴다. 단순 복사본을 남기거나 CSS 끝에 우선순위 덮어쓰기를 누적하지 않는다.
