# 1.0.344 (396) 대명사 팝업 · 공유 집 삭제

기준 dev 3b36ea4 / 내부395. 새 기능과 수정은 dev, 게임 main 유지.

## 변경
- 프로필 성별 아래 대명사 설정 버튼. 기존395 카드 디자인을 모달 안에 표시, 완료로 닫고 프로필 저장. KO/EN/JA 동일.
- 공유 집 화면은 삭제 버튼을 일괄 비활성화하던 처리를 제거. 방장·관리자·집 주인 권한에 맞춰 기존 서버의 공유 집 삭제 API 연결.
- 집 이동 목록에서 현재 집이 아닌 선택한 집을 삭제. 마을 건물 상세 및 배치 도구의 집 삭제도 연결.
- 진행 중인 집 배치 저장이 끝난 뒤 삭제, 중복 클릭 방지, 계정/그룹 변경 시 취소, 실패 후 재시도. 개인 월드 삭제 이벤트 차단.
- 삭제 완료 후 방문 대상과 공유 집 목록 갱신. 캐릭터/개인 집 삭제 없음. Firestore 권한 변경이나 운영 데이터 삭제 테스트 없음.

## 기존 제보 재검증
- 질문 저장387 제보: qa-save391 Chromium에서 잠긴 noise 질문8회·재실행, 5명 욕구·정책 보존, 저장실패 롤백/디스크 보존/재시도/pagehide 통과.
- 공유코드391 제보: 기존392 수정이 유지됨. qa-interaction392 Chromium의 10명 불러오기·영속 저장/재실행·슬롯 부족 거절·실패 롤백·실제 미리보기/불러오기·코드 정규화 통과.
- 위 두 제보의 실제 운영계정·기기 재현이나 모든 저장 오류의 해결을 의미하지 않음. 이번396에서 해당 로직의 추가 변경은 없음.

## 새 검증
- qa-language396 Chromium/WebKit: KO/EN/JA 버튼/모달/직접입력/선택/예문/완료/프로필저장/재실행/공유코드 프로필 복제 및384px 경계. 한국어 팝업 시각 확인.
- qa-home396 Chromium/WebKit: 실제 삭제 핸들러와 모의 API로 방장/관리자/집주인/일반구성원/취소/실패/그룹변경, 대상 집 구분·배치 저장 대기·중복클릭·개인 집 보존 통과.
- 웹/Android/iOS 공통 코드. Android 내부 테스트 대상. WebKit 검증, 신규 IPA/공개 사이트 배포 없음.
- 새 문구 EN100% / JA100%. 전체 앱 번역률 미측정.

## 배포
Android1.0.344 / code396 / Build20260915dev396. Gradle bundleRelease 및 jarsigner 검증 통과. AAB 웹377개 원본 바이트 일치.
AAB: C:/Users/Public/drawer-releases/drawervillage-1.0.344-396-internal.aab
SHA256: 164F78C2F6B8C229307F7E524311088BFE3F6D218C7D0228889EF127FED7F618
Play 내부 테스트 release293: 2026-09-15 10:47 KST 내부 테스터에게 제공됨 확인.

## 출시 노트
<ko-KR>
캐릭터 프로필에 ‘대명사 설정’ 버튼을 두고, 누르면 설정 팝업이 열리도록 바꿨어요. 멀티플레이에서 방장·관리자·집 주인이 공유 집을 삭제할 수 있도록 수정했어요. 삭제에 실패하면 다시 시도할 수 있어요.
</ko-KR>
<en-US>
Character Profile now opens pronoun settings in a popup from a dedicated button. Fixed shared-home deletion for group owners, managers and home owners in multiplayer. Failed deletions can be retried.
</en-US>
<ja-JP>
キャラクタープロフィールの「代名詞の設定」ボタンから、設定ポップアップが開くようにしました。マルチプレイでグループのオーナー・管理者・家の所有者が共有の家を削除できるよう修正しました。削除に失敗した場合は再試行できます。
</ja-JP>
