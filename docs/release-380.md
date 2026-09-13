# 1.0.331 (380) — Android internal / internal TestFlight

Includes all source changes in 379 plus the unreleased 2fa3994 home fixes and the settings/credits changes in this release. Production and public website/server are unchanged. No App Store review.

Credits audit: 5 submitted records, 3 approved and 2 pending. Creator requested all credits in internal testing. The two named requests are sanitized through the existing verified-support model and scoped to native build380 only. Remote public refresh cannot remove these two internal previews; other versions use the public roster. No UID, actual payment amounts or credentials are bundled. Server approval status remains unchanged so public377 does not receive a test-only roster change.

Validation: Chrome and WebKit402x820 save/question choices, inquiry position/open/close, help tour, life-log sorting, furniture add/cross-room movement and shower-room selection. Credits KO/EN/JA, five internal names, public377 excludes additions, remote refresh retains additions. Physical iPhone not tested. Android build/signing and TestFlight deployment recorded below when verified.

Known scope: 379 legacy shared-schedule backend recovery and shared automatic mail/notifications remain separate, not announced as fixed by this client-only build. Character ownership transfer is not currently exposed. Sent mail selection-delete hides only the sender’s own history; it does not recall the recipient’s copy.

## Discord — changes since internal379

서랍마을 1.0.331 (380) 내부 테스트 업데이트

이번 업데이트에서 변경된 주요 내용을 안내드립니다.

🔧 개선 사항
- 접수된 응원자 두 분을 테스트 버전 크레딧에 추가했습니다.
- 익명 문의를 설정의 ‘함께 만든 서랍마을’ 바로 아래로 옮겼습니다.

🐛 오류 수정
- 가구를 놓거나 다른 방으로 옮긴 뒤 집 화면이 위로 밀리던 문제를 수정했습니다.
- 샤워할 때 실제 샤워부스나 욕조가 있는 출입 가능한 방을 우선 선택하도록 수정했습니다.

기존 379의 저장·질문 응답·생활 로그·도움말·가구 관련 변경도 포함되어 있습니다. 이번 배포는 내부 테스트용이며 공개 버전은 변경되지 않습니다.

## Play / TestFlight copy

<ko-KR>
응원자 두 분을 테스트 크레딧에 추가했습니다. 익명 문의를 ‘함께 만든 서랍마을’ 아래로 옮겼습니다. 가구 배치 후 화면이 위로 밀리는 문제와 샤워 장소 선택을 수정했습니다. 기존 저장·생활 로그·도움말 개선도 포함합니다.
</ko-KR>
<en-US>
Added two supporters to the test credits. Moved Anonymous inquiry below Together in Drawer Village. Fixed the house view shifting after furniture placement and improved shower room selection. Includes previous save, life log and help improvements.
</en-US>
<ja-JP>
テスト版クレジットに応援者2名を追加しました。匿名のお問い合わせを「みんなで作る引き出し村」の下へ移動しました。家具配置後に画面がずれる問題とシャワーの場所選びを修正しました。これまでの保存・生活ログ・ヘルプの改善も含みます。
</ja-JP>

## Deployment evidence

Android APK/AAB built successfully; signed APK reports1.0.331/code380 and contains the changed credit/settings assets. Google Play internal release282 verified "provided to internal testers" September13 22:03 KST. TestFlight run34758674382 succeeded; Apple accepted internal-only380, no review submitted. Apple build6ccb509a-2820-4f19-94ae-0a7710e6b23b finished processing and UI confirmed Ready to Test with existing internal group 나만 테스트 (1 tester). Encryption questionnaire was answered consistently with379; no cryptographic implementation/dependency changes in the release diff. Test instructions saved. App source9adfeb7 is pushed to dev; no appmain promotion.
