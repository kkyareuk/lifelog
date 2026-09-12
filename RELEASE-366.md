# 서랍마을 1.0.328 (366)

```text
<ko-KR>
• 소파·의자·식탁 그림과 가구 회전을 개선했어요.
• 집과 마을에서 가구·캐릭터가 겹쳐 보이는 순서를 개선했어요.
• 마을 이동과 사진 복원의 반복 처리를 줄였어요.
• 선택한 답변과 활동이 다시 나타나는 문제를 개선했어요.
• 멀티 멤버 목록과 마을 이동 규칙을 개선했어요.
• 식사·수면과 건강 설정 선택지를 보완했어요.
• 서랍마을 앱 아이콘을 적용했어요.
• 프로필 편집 스크롤과 사진 배치 창의 겹침을 수정했어요.
</ko-KR>
<en-US>
• Updated sofa, chair and dining table artwork and furniture rotation.
• Improved layering of furniture and characters in homes and towns.
• Reduced repeated work during town changes and photo restoration.
• Improved saving of answers and selected activities.
• Improved multiplayer member lists and town travel rules.
• Added eating, sleep and health setting options.
• Added the Drawer Village app icon.
• Fixed profile scrolling and photo layout overlap.
</en-US>
<ja-JP>
• ソファ・椅子・机の絵と家具の回転を改善しました。
• 家と村での家具・キャラクターの重なり順を改善しました。
• 村の移動と写真の復元時の重複処理を減らしました。
• 回答と選んだ活動の保存を改善しました。
• マルチのメンバー一覧と村間移動のルールを改善しました。
• 食事・睡眠・健康の設定項目を追加しました。
• 「引き出し村」のアプリアイコンを追加しました。
• プロフィールのスクロールと写真配置画面の重なりを修正しました。
</ja-JP>
```

Server-dependent wardrobe and schedule-ID fixes are excluded from these notes until backend deployment is verified. Device performance is not claimed fully resolved.

## Discord用・テスト案内（未送信）

서랍마을 1.0.328 (366) 테스트 업데이트

이번 업데이트에서 변경된 주요 내용을 안내드립니다.

🎨 UI/UX
• 서랍마을 앱 아이콘을 적용했어요.
• 소파·의자·식탁 그림을 바꾸고 가구 회전을 개선했어요.
• 집과 마을에서 가구와 캐릭터가 겹쳐 보이는 순서를 개선했어요.

🔧 개선 사항
• 마을 이동과 사진 복원 때 반복되는 작업을 줄였어요.
• 식사·수면과 건강 설정의 선택지를 보완했어요.
• 멀티 마을 이동 규칙을 개인 마을 설정과 분리했어요.

🐛 오류 수정
• 캐릭터 프로필에서 아래 항목까지 스크롤되지 않던 문제를 수정했어요.
• 캐릭터 사진 배치 창에서 안내문이 미리보기와 겹치던 문제를 수정했어요.
• 선택한 답변·활동이 다시 나타나는 문제를 개선했어요.
• 멀티 멤버 관리 목록에서 차단한 계정과 방장을 확인할 수 있도록 고쳤어요.

아직 테스트 중인 버전입니다. 마을 이동 후 반응 속도와 가구 겹침을 확인해 주세요.

## Build verification (2026-09-12)
- Source: 7089ab0779a09daca78421a9f9a826a9b55c463d; version 1.0.328, build 365.
- Android signed APK/AAB completed; package manifest and both corrected CSS files verified inside APK.
- 402x820 Chromium touch scroll and WebKit profile/placement layout checks passed. Profile scroll container stays within dialog; placement caption follows preview without overlap.
- Apple upload 34685294625 accepted. Final app and distribution profile both contain Apple Sign In entitlement.
- ASC selected build 365, export encryption question answered none of the listed algorithms (uses platform cryptography; no custom crypto implementation identified). Manual release selected.
- First iOS simulator attempt timed out in simctl launch after successful compilation. Same-source failed job rerun; review submission awaits that result. No physical iPhone test available.

## 366 추가 검증 및 보류 사항
- 건물 위 재실 표시를 깊이 정렬에서 분리. 새 식탁만 그림을 교체하고 책상류는 원래 그림으로 복구. 소파 35%, 식탁 40% 확대.
- 건강 설정을 내용 흐름+스크롤로 변경. 402×820 Chromium/WebKit, KO/EN/JA 겹침 검사 통과.
- 마지막 사진 페이지는 추가 LD 사진으로 표시. 기존 항목 ID/소지품 데이터는 변경하지 않음.
- 통계는 평균값에 해당하는 기존 세부 단계 설명을 표시. 중앙값 거리·인원 수 부가 표시 제거.
- 실제 질문 아이콘 터치 경로 CPU 4배 감속: 약 80~154ms 표시, 닫기 입력 통과. 답변 저장 및 이후 화면 전환 회귀 검사 통과.
- 실제 Android 제보의 3초 지연/먹통은 미재현. 해결 완료로 발표하지 않음. question-open/question-modal 진단을 추가함.
- Android366 서명 APK/AAB 생성. iOS365 업로드/시뮬레이터 성공했으나 신규 제보로 심사 보류. iOS366 미업로드. 실기기 검증 없음.
- EN/JA 새 문구 해당 범위 번역 완료, 전체 번역률 미산정.
