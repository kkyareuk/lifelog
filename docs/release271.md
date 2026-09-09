# 서랍마을 개발판 271 · 1.0.240

## 한국어 업데이트
- 멀티 생활과 로그를 유지하면서 바뀌지 않은 상태의 반복 저장을 줄였습니다.
- 같은 멀티 그룹에서 상세 화면을 오가거나 정보를 새로 받아도 연결을 불필요하게 다시 만들지 않습니다.
- 다른 접속자가 이미 갱신한 마을은 중복 갱신 요청을 줄였습니다. 직접 내린 행동 지시와 저장은 유지합니다.
- 로그인 상태 갱신 때 같은 알림 기기를 반복 등록하지 않습니다. 계정·알림 토큰·언어가 바뀌면 다시 반영합니다.
- 현재 열어 둔 그룹의 알림은 이미 연결된 실시간 정보로 받습니다.

## English
- Reduced redundant multiplayer state writes while preserving the same life scenes and logs.
- Reuse the current group connection when opening details or refreshing group information.
- Avoid duplicate refresh requests when another viewer has already updated the world. Direct character commands remain available.
- Avoid repeated notification-device registration; account, token and language changes still update it.
- Notifications for the active group reuse its live data connection.

## 日本語
- マルチの生活場面とログを維持しながら、変化のない状態の重複保存を減らしました。
- 同じグループの詳細画面を開く場合や情報更新時に、接続を無駄に作り直さないようにしました。
- 別の参加者が更新済みの場合、重複した更新要求を減らしました。キャラクターへの直接指示は引き続き使えます。
- 通知端末の重複登録を減らし、アカウント・トークン・言語の変更時には再登録します。
- 表示中のグループの通知は既存のリアルタイム接続を利用します。

## 計測 / 검증
- 200명, 60회(1시간)의 생활 계산, 동일한 기존 엔진·테스트 데이터: 문서 쓰기 12,060 → 8,742회(27.5% 감소), 동일한 주민 저장 3,318회 생략.
- 매분 모든 주민의 저장된 lifeJson이 기존 엔진 결과와 정확히 일치함을 검사했습니다. 장면·기분·로그를 삭제하거나 생성 횟수를 줄여 얻은 수치가 아닙니다.
- 같은 데이터에서 서버 읽기는 12,480회가 남습니다. 모든 조회를 없앴다는 뜻이 아니며, 실제 청구액 절감률로 환산할 수 없습니다.
- 13개 구독 × 상세 전환/새로고침 10회에서 재연결 0회. 그룹·계정 변경과 오류 후 재연결은 유지합니다.
- 알림 권한/등록/언어 변경, 행동 지시와 요청 제한, 관계/그룹 제안, 입주/동거, 선물, 일정, 집 편집·충돌, 개인 데이터 보존 검사 통과.
- Android APK/AAB 실행 자산 236개 일치, 서명 및 오프라인 시작·저장 후 재실행 검증.
- 전체 정적 UI 번역률 EN 2183/2871 (76.0%), JA 2182/2871 (76.0%). 새 플레이어 UI 문구 없음. 출시 노트 3개 언어 제공.
- 개발 dev 대상. 운영 게임 main264 및 iOS14 유지. Play Console 업로드 및 iOS 새 빌드·심사 없음.

## 비용 범위와 남은 개선
이번 변경은 저장과 중복 요청을 줄입니다. 생활 계산에 필요한 서버의 분당 조회, 실제 변경된 로그 전송, 사진 다운로드 및 Cloud Functions 실행 비용은 남습니다. 실제 청구서·사용량을 읽어 월 비용을 계산한 결과는 아닙니다.

생활 문서와 설정/과거 로그를 분리하거나 전송 형식을 압축하는 후속 작업은 이전 버전 앱도 같은 마을을 읽을 수 있도록 마이그레이션을 설계해야 합니다. 이번에는 기존 기능과 읽기 형식을 보존했습니다.

Firestore는 문서 읽기·쓰기뿐 아니라 저장량과 전송량도 과금합니다. 지역과 사용 패턴을 확인하지 않은 DAU별 고정 요금으로 운영비를 판단하지 않습니다. [Firebase 공식 과금 설명](https://firebase.google.com/docs/firestore/pricing)
