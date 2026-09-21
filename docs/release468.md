# 내부 1.0.416 (468) — 생활 행동·대화 다양성

## 범위와 원인
- dev 전용 변경. 공개467/main 및 Apple 심사본은 변경하지 않음.
- 집 화면은 기존 생활 장면을 표시하고 가구 엔진은 위치를 계산한다. ACTION_COPY가 현재 로그를 덮는 것은 아님.
- liveGapEvent 후속 행동에서 빨래·세탁/화분 키워드가 다시 일치해 동일 마무리로 되돌아갈 수 있었음.
- 자유 행동 후보의 제목 전체를 3일 동안 제외하면 같은 제목·다른 본문도 함께 사라짐.

## 변경
- 후속 행동을 한 단계로 마무리하고 다른 자유 행동으로 전환. 구버전 동일 후속 제목도 인식.
- 캐릭터의 저장된 최근 5개 로그를 읽어 행동 ID/본문을 기준으로 선택. 풀이 모두 사용되면 가장 오래 전에 쓴 후보 선택. 별도 로컬 전역 상태나 Date.now 난수 없음.
- 같은 시각 재계산은 같은 선택 유지. 미래 로그 제외, 월 경계와 0 없는 날짜 키 처리.
- 같은 제목이라도 서로 다른 새 행동 ID의 로그는 보존. 기존 로그 원문 덮어쓰기 없음.
- 추리·음악·청춘/연애·판타지/SF·게임·음식 6개 주제군에 소재 각3개(총18개), 비교 소재 연결. 영어·일본어 모두 작성.
- 기존 취향·갈등·소극적 반응 유지. 주제 분류가 없는 사용자 주제는 기존 문구 사용.
- 취미 본문 풀 확장은 이번 범위에 포함하지 않음.

## 검증
- check-narrative468: 최근 회피·소진·재로드·구로그·월경계·미래 제외·한영일·소극적 반응 통과.
- Chrome/WebKit 실제 앱 모듈: 빨래 후속 탈출, 재계산 안정성, 같은 제목/다른 본문 저장 통과. Chrome 식물 후속 탈출도 통과.
- check-home466: 식탁/의자 점유 회귀 통과. 가구 위치 코드 변경 없음.
- 기존 check-log-sync-continuity는 allowedActivities가 없는 오래된 정규식에서 실패. 이번에 바꾸지 않은 HEAD의 state.js에서도 동일한 조건 불일치 확인. 새 실제 로그 저장 검사는 통과.
- Android 모듈231개·웹자산500개 포함/서명 AAB 바이트 비교·jarsigner 통과.
- iOS 플랫폼 격리/실제 인증 유지 검사 통과. 새 iOS 서명·업로드는 하지 않음.
- 공유 서버 런타임84모듈 준비 및 새 의존성 검사. 운영 공유 서버는 배포하지 않음. 서버 생성 멀티 로그는 이번 내부 앱 변경이 아직 적용되지 않음.
- 정적 전체 번역 EN2260/2988(75.6%), JA2259/2988(75.6%). 새 소재18개와 연결문구는 한영일100%.

## 배포
- Play 내부 release347: 2026-09-21 16:02 KST 내부 테스터에게 제공됨 확인. 소스 c3ef69b0, origin/dev 반영 완료.
- AAB: C:/Users/Public/drawer-releases/drawervillage-1.0.416-468-internal.aab
- SHA256: D5AD04BEFC82FAAA00DE478791E57AAE2DDCE614F89AE0DE710B7D89A3B3E201

## Play 출시노트
<ko-KR>
빨래·식물 돌보기 뒤 같은 마무리 행동에 머무는 현상을 수정했어요. 집에서 최근에 한 행동을 피하고 다른 내용의 생활 로그를 고르게 개선했어요. 추리·음악·게임·요리 등의 대화에 구체적인 소재를 추가했어요.
</ko-KR>
<en-US>
Fixed repeated follow-up actions after laundry and plant care. Home activities now avoid recently used scenes and keep distinct log entries even when their titles match. Added concrete details to conversations about mysteries, music, games, cooking and more.
</en-US>
<ja-JP>
洗濯や植物の世話の後に同じ片づけを繰り返す現象を修正しました。家では最近の行動を避け、題名が同じでも内容の異なる生活記録を残せるよう改善しました。推理・音楽・ゲーム・料理などの会話に具体的な話題を追加しました。
</ja-JP>
