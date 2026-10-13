# 1.0.465 (517) — reported startup, notification and monarchy fixes

2026-10-13. Development branch based on 5ce6e6ef. Public main remains unchanged.

## Verified defects and changes

- Notification daily-count scheduling called Array.from's mapper with a nonexistent third array argument, then accessed array.length. Reproduced TypeError prevented replacement of old pending notifications. Calculate the slot count explicitly. Never substitute disabled categories when the selected topics are unavailable. Preserve an explicitly empty topic selection and increment the scheduling migration version to replace old reservations on update.
- Court jobs were nested inside the separately gated career/pay screen. Move court role and title to the Court settings page, available with the economy feature off; previous-page navigation returns to the basic profile in that mode. After story theme save, read the authoritative server theme before reporting success and update the active group snapshot. Existing rank permissions and separate modern/court profiles remain intact.
- Snapshot reads retry transient failures before failing startup. Existing referenced snapshots, recovery copies and account boundaries remain preserved. A standalone startup recovery panel allows a user-selected valid backup to restore an otherwise unbootable village; archive the unreadable primary before the atomic replacement. Invalid/failed restores do not clear game storage.
- New recovery UI is provided in KO/EN/JA. No claim that the reporter's original data was remotely inspected or recovered: missing IndexedDB records cannot be reconstructed without a surviving backup. No individual user's data was edited.

## Verification

- qa-reports517 Chromium and WebKit: 90 real daily-count notifications, selected categories only, empty selection, committed IDB data after transient get failure, preserved missing primary, actual JSON file picker and successful app boot after restore.
- qa-court517 Chromium and WebKit: manager/member permission flows against the real service fixture; theme switch, rank request/approval, court job/title in real full editor with career disabled; KO/EN/JA responsive screenshots.
- check-court464 and qa-snapshot501 pass, including independent backup preservation and account isolation.
- Legacy check-character-notifications has five stale assertions and check-notifications471 expects obsolete roster IDs. All failures also reproduce on the unchanged a94904cf baseline; not claimed as passing tests.
- iOS project preparation/native modules pass on Windows. Signed Apple upload and internal availability are tracked separately below.
- Static translations EN2250/2983 (75.4%), JA2249/2983 (75.4%); added recovery and court labels complete in all three languages.

## OAuth advisory

Official source: https://support.google.com/cloud/answer/15549257?hl=en
Google distinguishes human-driven OAuth clients from agent clients and says to keep them separate. Code inspection found Firebase Google sign-in and Android Publisher service-account usage, with no Google Workspace MCP endpoint usage. Do not blindly change normal login clients to agentic. Console inventory verification is pending; the other named project cannot be classified from the game repository alone.

## Release status

Android signed AAB and iOS internal-only TestFlight build are being prepared. No public, closed-test or App Store review promotion; no emails or announcements sent.

## Play notes

```text
<ko-KR>
알림 횟수 설정 때문에 새 예약이 적용되지 않던 오류를 수정했습니다. 선택하지 않은 알림 종류가 대신 예약되지 않도록 개선했습니다. 왕정 세계관의 궁정 설정에서 직업과 직함을 바로 고를 수 있으며 배경 저장 후 적용 상태를 확인합니다. 저장 데이터를 읽지 못할 때 재시도하고, 시작 오류 화면에서 백업 파일로 복구할 수 있도록 추가했습니다.
</ko-KR>
<en-US>
Fixed notification scheduling after changing the daily count and prevented disabled categories from being substituted. Court roles and titles are now available directly in Court settings, with confirmation after saving the story theme. Added saved-data read retries and backup-file recovery from the startup error screen.
</en-US>
<ja-JP>
通知回数の設定で新しい予約が適用されない不具合を修正し、選択していない種類の通知への置き換えを防ぎました。宮廷設定から職業と肩書きを選べるようにし、背景保存後の適用状態を確認します。保存データの読み込みを再試行し、起動エラー画面からバックアップを復元できるようにしました。
</ja-JP>
```
