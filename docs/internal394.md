# 1.0.342 (394) 대명사·자칭 및 영어 문구

기준: 게임 dev d94045e / Android393. 이번 작업은 dev 계열이며 공개 웹 main은 유지한다.

## 반영 범위
- 성별 아래 대명사·자칭 카드. 현재 언어를 먼저 보이고 나머지 언어는 펼침 영역. 직접 입력과 문장 미리보기 제공.
- 한국어 자칭/제3자 지칭, 자칭의 주어/소유 형태. 일본어 자칭/제3자 지칭. 영어 he/she/they, 5형태 직접 입력, is/are 동사 활용, themself/themselves.
- 성별로 대명사를 추정하지 않음. 언어별 필드는 저장·공유코드·멀티 프로필 데이터에 보존.
- 작성된 질문·관계편지·연락의 자칭을 적용. 주어 생략 문장은 유지. 기본 영어 생활 로그/음료 로그/생활 알림의 소유자 지칭에 적용. 기존 사용자 자유문장이나 전체 과거 로그를 일괄 치환하지 않음.
- 영어 원고는 실제 37종×22개=814문구. 기존 앱과 명시적으로 대응한 31종×22개=682문구 등록. 기존 앱에 없는 archaic_high, archaic_low, expert, tsundere, languid, whimsical 6종은 원고 데이터 보존, 선택지/실행 연결은 보류. 기본 추천안을 알린 뒤 기존 대응 범위로 진행; 신규 유형 확정 답변 없음.
- 영어 지역 슬롯의 표시와 푸시를 Frontier Plainspoken / Seafaring Adventure로 대응. 한국어 저장 말투 값 유지. 관련 영어 관계 편지32개도 같은 표현 방식으로 정리. 지역에 성격을 부여하는 원고 설명은 반영하지 않음.
- 강한 욕설은 기호 표기, 원고의 강압적인 일부 표현 수정. 원고의 중세영어 역사/문법 정확성을 인증하거나 전부 원어민 감수 완료했다고 주장하지 않음.

## 검증
- check-language394: 37개 원고 풀 길이, 31개 대응 출력, 자리표시자, 강한 욕설 검사, 성별 독립, 영어 활용, 자칭 형태, 로그 연결.
- qa-language394 Chromium/WebKit: 384×854 실제 프로필 화면, KO/EN/JA 입력·미리보기·저장·재실행·언어간 유지·공유코드 가져오기 프로필 복제. 화면 경계 및 시각 확인.
- qa-save391 Chromium: 잠긴 noise 질문8개·재실행, 욕구/정책 보존, 실패 롤백, 기존 디스크 보존, 재시도, pagehide 저장 통과.
- qa-interaction391 Chromium: 캐릭터 상호작용·기준 캐릭터·관계 UI·공지사진 분리 회귀 통과.
- check-speech393 및 qa-speech393: 기존 말투35선택지/별칭/3개 언어/마스킹 회귀 통과. 기존 영어 질문에 반드시 Damn이 있어야 한다는 구문 검사는 신규 원고로 바뀌어 제거; 가벼운 표현 보존 검사는 유지.
- Android Gradle bundleRelease 성공. jarsigner jar verified. 런타임157모듈 포함, AAB 웹 파일376개 원본 바이트 일치.
- 이 검증은 로컬 모의 계정 기반이며 실제 제보 기기나 운영계정 공유코드 재현을 의미하지 않음. iOS는 공통 코드 영향 + WebKit 검사, 신규 IPA 빌드/업로드 없음.

## 번역 및 남은 범위
새 설정 UI: EN100% / JA100%. 영어 원고 연결: 31/37종 (83.8%). 보류6종의 KO/JA 대사·말투 최종대응은 미완료. 기존 일본어 말투 대사는 유지. 앱 전체 번역률 미측정.

## 배포
- Android 1.0.342 / versionCode394 / Build20260914dev394
- AAB: C:/Users/Public/drawer-releases/drawer-village-1.0.342-394.aab
- SHA256: 486304BFF525E36DDF539D5C04419E313CD43D4B36DFBD954629A99F044F9AB0
- Play 내부 테스트 release291: 2026-09-14 22:41 KST 내부 테스터에게 제공됨 확인.

## Play 출시 노트
<ko-KR>
캐릭터 프로필의 성별 아래에 대명사·자칭 설정을 추가했어요. 한국어·영어·일본어 표현을 따로 고르거나 직접 입력하고 예문으로 확인할 수 있어요. 대사와 생활 로그의 해당 문장에 설정을 반영해요. 기존 말투 31종의 영어 연락 문구를 다듬고, 두 장르 말투의 관계 편지도 맞췄어요.
</ko-KR>
<en-US>
Added pronouns and self-reference below gender in Character Profile. Set Korean, English and Japanese expressions independently, including custom forms and previews. Supported dialogue and life-log sentences now use these settings. Refined English contact messages for 31 existing voices and aligned relationship letters for the frontier and seafaring voices.
</en-US>
<ja-JP>
キャラクタープロフィールの性別の下に、代名詞・一人称の設定を追加しました。韓国語・英語・日本語を個別に選択・自由入力し、例文で確認できます。対応する台詞と生活ログの文に設定を反映します。既存31種類の英語連絡文を調整し、開拓・航海風の関係の手紙も統一しました。
</ja-JP>
