# Android 1.0.341 (393) 내부 테스트

기준: dev 946aec5 / 392. 이번 말투 변경은 dev 개발이며 게임 main은 유지한다.

## 변경
- 인터넷소설 감성체·스타트업 업무체를 복원하고 이전 저장 이름을 호환한다.
- 장난스러운 게임 채팅체 추가: 일상 연락 22종, 관계 편지 16종 × 한국어·영어·일본어 = 114개 문구. 나이·브랜드 표현을 이름에 사용하지 않는다.
- 과묵한 직설체의 가벼운 젠장·망할 표현은 유지하고, 상스러운 말투의 욕설은 @#$%로 표시한다. 작성된 캐릭터 대사의 강한 욕설은 기호로 가린다.
- 긴 일본어 예문이 말투 선택창을 넘지 않도록 기존 그리드와 줄바꿈 규칙 수정.
- 이번 변경 문구 EN/JA 번역 100%. 앱 전체 번역률은 미측정.

## 검증
- check-speech393: 별칭 호환, 35개 말투, 3개 언어 질문·연락·계획·관계 편지, 마스킹, 새 문구 114개 및 자리표시자 통과.
- qa-speech393 Chromium/WebKit: 3개 언어 말투 선택·저장·384px 화면 경계 통과.
- qa-interaction391 Chromium: 캐릭터 상호작용 팝업, 안내 사진 분리, 기존 캐릭터 우편 표시 마스킹, 관계 선택 회귀 통과.
- qa-save391 Chromium: 잠긴 질문 8개 선택·새로고침, 욕구·정책, 실패 롤백·기존 저장 유지·재시도·pagehide 통과. 제보 기기 실측 검증은 아님.
- Android Gradle bundleRelease 성공, jarsigner jar verified, 154개 런타임 모듈 포함, 패키징된 웹 파일 373개 원본 바이트 일치.
- WebKit 검증은 브라우저 검사이며 iOS 실기기·새 IPA 검증이 아니다. iOS 391 기존 심사 제출은 유지한다.

## App Store Connect 수익화 확인
수익화는 클릭 가능한 링크가 아닌 섹션 제목이다. 하위 가격 및 사용 가능 여부 / 앱 내 구입 / 구독 메뉴를 사용한다. 계약·은행·세금 활성 확인. town_slot_1·green_tea 승인, character_slot_1 심사 대기, 이전 character_slots_5 개발자 판매 제거. 설정 변경 없음.

## 빌드
- 파일: C:/Users/Public/drawer-releases/drawer-village-1.0.341-393.aab
- SHA256: 00D895392EEF5B32D2B696D2D9F0CB8092B4DE6212E544019E04ED76ADB3DD69
- Play 내부 테스트 release 290: 2026-09-14 21:22 KST 내부 테스터에게 제공됨 확인.

## Play 출시 노트
<ko-KR>
인터넷소설 감성체와 스타트업 업무체를 다시 선택할 수 있어요. 장난스러운 게임 채팅체를 추가했어요. 과묵한 직설체에는 가벼운 거친 표현을 쓰고, 상스러운 말투의 욕설은 기호로 표시해요. 영어·일본어 대사를 다듬고 긴 예문이 선택창 밖으로 나가던 문제를 수정했어요.
</ko-KR>
<en-US>
Restored nostalgic web-romance chat and startup office jargon, and added playful gaming chat. Terse speech uses mild expressions, while vulgar speech uses symbols for swearing. Refined English and Japanese dialogue and fixed long examples overflowing the voice picker.
</en-US>
<ja-JP>
懐かしのケータイ小説風とスタートアップ業務口調を再び選べるようにし、ノリのいいゲームチャット口調を追加しました。寡黙な口調では軽い苛立ちの表現を使い、下品な口調の悪態は記号で表示します。英語・日本語の台詞を調整し、長い例文が選択画面からはみ出す問題を修正しました。
</ja-JP>
