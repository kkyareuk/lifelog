# 1-1 메모리 누수 점검·수정

작업 기준: dev 0028f34. Android334(1.0.301) 및 공개 웹335 버전 유지. 운영 배포 없이 dev에 반영.

## 확인한 누수

매 render()에서 실행되는 bind()가 #app 바깥의 영구 footer data-email-compose 링크에 클릭 리스너를 계속 등록했다. 핸들러가 bind의 공유 lexical context를 유지해 mobileCharacterDialog 등 이전 화면을 붙잡았다.

수정 전 Heap snapshot 역참조 경로:
`이전 select → 캐릭터 편집 dialog → Context.mobileCharacterDialog → EventListener → 영구 이메일 a → document`

이벤트를 모듈 최상위의 위임 리스너 1개로 분리했다. 이메일 클릭을 실제 발생시키고 window.open 호출 수가 1인지 검사했다(메일을 발송하거나 외부 창을 열지는 않음).

## 화면 수명 정리

cleanupRenderedScreen()은 실제 DOM 교체 직전에 이전 예약 프레임을 취소한다. afterScreenRender()로 등록한 프레임은 완료되면 정리 목록에서도 제거된다. pagehide에서도 정리한다. 저장/로그인처럼 화면 밖에서도 완료되어야 하는 비동기 작업은 무조건 취소하지 않는다.

크레딧은 기존 제거되는 부모 관찰 방식으로는 화면 교체를 감지하지 못했다. 영구 #app의 subtree를 감시하고, 제거 또는 close 시 observer/회전 timer/visibility 리스너를 정리한다.

Firestore 구독은 화면보다 계정·선택 방이 소유자다. 탭 이동마다 해제/재구독하는 변경은 하지 않았다. 기존 해제 경로는 목록 문서 참고.

## 검증

로컬 Chrome, 테스트 인증 모듈, 외부 요청 차단. 캐릭터↔설정 5회 워밍업 후 10회 단위 측정. 각 측정 전 GC 2회. 동일 최종 화면 비교. Heap snapshot도 저장.

|조건|워밍업 DOM/리스너|20회 왕복 후 DOM/리스너|
|---|---:|---:|
|수정 전|18,368 / 1,012|90,248 / 4,752|
|수정 후|398 / 76|398 / 76|
|80명 합성 데이터|398 / 76|398 / 76|

수정 후 30회까지 DOM/리스너 일정. 단일 캐릭터 힙은 10회 이후 약5.74~5.76MB, 80명은 약8.07~8.09MB. 초기 JIT/캐시 증가를 누수로 간주하지 않는다. 80명은 이미지 없는 로컬 복제 fixture로, 실제 80명 멀티 서버·대량 사진·실기기 프레임 성능 전체를 보장하지 않는다.

PASS: navigation boundary 9 checks, qa-web335 KO/EN/JA·mobile/account/cart, web build106 modules. 누수 전체가 없다는 선언이 아니라 재현한 누적 경로의 수정 검증이다. 정적 전수 목록의 해제 후보는 정확한 짝을 자동 증명하지 않는다.

## 파일

- lifecycle-inventory336.md / csv: 런타임 등록·타이머·컬렉션 변경 위치 전체 및 수동 분석.
- lifecycle336.diff: 코드 전후 diff.
- lifecycle336-results.json: 측정 원본.
- scripts/qa-memory336.mjs: 재현 가능한 테스트. QA_CHARACTERS=80, AUDIT_PHASE=after-80으로 80명 조건.
- qa-memory336/*.heapsnapshot: 로컬 개발자 도구에서 열 수 있는 스냅샷(큰 파일은 커밋하지 않음).

사용자 문구 변경 없음. 이번 수정의 영어/일본어 추가 번역 대상0건. 전체 번역률 재측정 없음.

다음 순서:1-2 비용 예산/사용량 확인 →2-1 이미지 경로 및 비용 검증 →2-2 로그 보관 →멀티 구조. 제공된 비용표/무료할당/캐시 과금 단정은 실제 지역·상품·요금표를 확인한 뒤 판단한다.
