# 서랍마을 1.0.215.11 (273) 핫픽스

운영판 기반 Android 업데이트입니다. 개발 중인 멀티 화면 전체를 포함한 버전은 아닙니다.

## 한국어
- 일부 캐릭터 설정 때문에 생활 장면 계산에 실패해도 다른 캐릭터·마을로 이동하고 설정을 열 수 있도록 보완했습니다.
- 이전 버전의 일부 취향 설정 형식을 읽지 못하던 문제를 수정했습니다. 기존 설정과 생활 기록은 보존합니다.
- 사전 저장·뒤로가기, 등록 일정 시간 범위, 가구 위치·회전 저장, 답변한 우편 상태와 공동 일정에 대한 기존 운영판 수정을 포함합니다.
- 음료 선택에 소다, 모히토, 무알코올 모히토, 에이드, 스무디를 추가했습니다.
- 음료 사전의 맵기 항목을 없애고 단맛·산미·탄산·카페인·알코올·온도를 설정할 수 있게 했습니다.
- 관심사에 정신건강·정신건강 지식, 기술 숙련에 심리학·정신건강 지식을 추가했습니다. 의학·의료 항목 근처에서 찾을 수 있습니다.
- 격투기·태권도·권법·검술·창술을 관심사·취미·기술의 운동 관련 항목 근처에 추가했습니다.

## English
- A resident's scene calculation failure no longer prevents switching residents or towns and opening character settings.
- Improved support for some legacy preference values while preserving saved settings and life records.
- Includes previous production fixes for dictionary saving and navigation, schedule time boundaries, furniture placement and rotation, answered mail, and shared schedules.
- Added soda, mojito, alcohol-free mojito, fruit ade, and smoothie choices.
- Replaced the drink dictionary's spice field with sweetness, acidity, carbonation, caffeine, alcohol, and temperature settings.
- Added mental health interests and psychology/mental health knowledge skills beside medicine-related options.
- Added martial arts, taekwondo, unarmed martial arts, swordsmanship, and spear training near exercise-related interests, hobbies, and skills.

## 日本語
- 一人のキャラクターの生活シーン計算に失敗しても、別のキャラクターや村への切り替え、設定画面の表示を妨げないよう改善しました。
- 以前のバージョンの一部の好み設定を読み込めない問題を修正しました。設定と生活記録は保持します。
- 辞典の保存と戻る操作、予定の時間範囲、家具の位置・回転、回答済みの手紙、共同予定に関する既存の公開版の修正を含みます。
- ソーダ、モヒート、ノンアルコールモヒート、フルーツエード、スムージーを追加しました。
- 飲み物の辞典から辛さを除き、甘さ・酸味・炭酸・カフェイン・アルコール・温度を設定できるようにしました。
- 関心事にメンタルヘルスと精神保健の知識、スキルに心理学と精神保健の知識を追加し、医学・医療の近くに配置しました。
- 格闘技・テコンドー・拳法・剣術・槍術を、関心事・趣味・スキルの運動関連項目の近くに追加しました。

## 検証・검증 및 배포 상태
- 생활 계산 오류 주입 후 캐릭터 전환·마을 전환·설정 진입, 이전 취향 형식·로그 보존·설정 수정 후 재계산 검사 통과.
- 가구 저장·공동 일정·답변한 우편 회귀 검사 통과. 음료 사전 저장 후 재실행 보존 확인.
- 제보자의 실제 저장본은 제공되지 않아 그 캐릭터의 정확한 원인은 미확정입니다. 동일 문구가 남으면 273의 진단 정보로 추가 확인이 필요합니다.
- Android APK는 직접 설치용, AAB는 Play Console 업로드용입니다. Play 업로드는 실행하지 않았습니다.
- iOS 빌드·서명·TestFlight 업로드는 하지 않았습니다. 공통 웹 소스에도 반영되는 수정입니다.
- 전체 정적 UI 번역률: 영어 2116/2803 (75.5%), 일본어 2115/2803 (75.5%). 신규 항목은 두 언어 모두 반영했습니다.

- 최종 APK/AAB 서명·버전(273/1.0.215.11), 실행 자산 210개 일치 및 패키지 오프라인 실행·저장 후 재실행 검사 통과.
