# Android 1.0.201 · versionCode 216

2026-09-05 `dev` 준비판. 이전 [215 준비판](android-release-215.md)의 변경사항을 모두 포함합니다. 운영 main/웹사이트/iOS 배포 및 Play Console 업로드는 변경하지 않았습니다.

## 파일

- 저장소 루트: `drawer-village-v1.0.201-code216-dev-release.aab`
- SHA-256: `6990226B567D50C9629F164FF6FC23FFCE16B40D97665ED7EDC01E23599D805F`
- release 서명과 실제 manifest `versionCode 216` / `versionName 1.0.201`을 확인했습니다. 준비 자산 213개와 번들 내부 파일 SHA-256이 모두 일치합니다.
- jarsigner `jar verified`/종료 코드 0. 자체 서명 체인·타임스탬프 없음 및 ZIP 엔트리 순서 관련 경고는 있으며 Play 업로드 검사는 아직 하지 않았습니다.
- Play에 이미 216 이상을 올렸다면 더 큰 versionCode로 재빌드해야 합니다. 실기기 업데이트 검사 후 출시하세요.

## 215 이후 변경

- 캐릭터 전체설정의 소지품 선택 화면을 처음 열 때 사전 항목 이름 대신 내부 UUID가 노출되던 문제를 수정했습니다. 저장된 소지품 ID를 사전 이름으로 먼저 변환하며, 찾을 수 없는 이전 항목도 UUID 대신 선택 개수로 표시합니다.
- 부부 관계의 “관계가 밖에서 다뤄지는 방식”에서 `법적으로 관계가 등록됨`과 `법적으로 관계가 등록되지 않음`을 선택할 수 있습니다. 기존 부부 관계는 등록됨 상태를 유지하며 새 선택값은 저장·정규화·복원됩니다.
- 우편함의 편지를 하나씩 삭제하거나 현재 도착한 편지를 모두 삭제할 수 있습니다. 삭제한 편지는 알림 일정이 다시 계산되어도 되살아나지 않으며, 삭제 기록은 계정별로 분리됩니다.
- 위 기능과 확인·완료 문구를 한국어, 영어, 일본어로 함께 적용했습니다.

## 검증과 남은 확인

- 취향 사전 요약이 내부 ID를 직접 출력하지 않는지, 우편 단건·전체 삭제와 재예약 방지 및 계정 분리, 부부 법적 등록 여부 저장 경로를 검사했습니다 (`scripts/check-feedback-mail-relationship-216.mjs`).
- JavaScript 구문 검사와 사전/우편 기존 회귀검사를 통과했습니다.
- Android `clean assembleDebug bundleRelease` 성공. 384×854 화면에서 소지품 요약, 부부 법적 상태 선택, 우편 단건·전체 삭제 버튼의 줄바꿈과 터치 영역을 육안 검수했습니다.
- 전체 UI 정적 번역률: 영어 2086/2774(75.2%), 일본어 2085/2774(75.2%). 동적 로그 전체의 번역률은 아닙니다.
- Play Console 프로덕션 액세스가 열렸더라도 업로드·심사·출시는 별도 단계입니다. 이 준비판은 자동으로 공개되지 않습니다.

## 스토어 변경 문구 (216에서 추가된 내용)

### 한국어

캐릭터 소지품 설정에서 항목 이름이 정상적으로 표시됩니다. 부부 관계에 법적 등록 여부를 설정할 수 있고, 우편함 편지를 하나씩 또는 한꺼번에 삭제할 수 있습니다.

### English

Character belongings now show item names correctly. Married relationships can be marked as legally registered or unregistered, and mailbox letters can be deleted individually or all at once.

### 日本語

キャラクターの所持品設定に項目名が正しく表示されるようになりました。夫婦関係に法的登録の有無を設定でき、郵便箱の手紙を個別または一括で削除できます。
