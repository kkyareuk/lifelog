# 1.0.467 (519) — solo monarchy and save-read recovery

2026-10-13. Final follow-up to internal518 (7f223a21). No public release authorization yet.

## Changes

- Final screenshot review found the solo home job badge still used the ordinary career. Court role/title now appears in profile and observation captions; switching to Everyday life restores the original career. Court HUD captions no longer append unrelated ordinary employment duties.

- Solo town information now offers Everyday life / Monarchy as a free story setting, independently of paid background/music packs. The choice persists per town. Character court pages follow the resident's own town; shared groups retain their authoritative group story and rank lists. Switching back preserves ordinary and court profile fields.
- Solo residents can set court roles, titles, preset ranks, allegiance, awareness and background. Shared-only rank requests and public-member wording are absent in solo mode. Social-distance metrics use the solo characters' ranks and factions only within the same monarchy town. This does not add succession or new monarchy event content.
- Home shortcut restored to Schedule with the existing calendar image and navigation to the schedule screen. Gatherings remain inside Schedule.
- Snapshot recovery reconnects an invalid/closed IndexedDB connection, uses bounded read retries/timeouts, and preserves referenced records. Malformed primary JSON now stops startup or uses an existing independent same-account backup rather than becoming a fresh empty village. WebKit startup diagnostics include the error message as well as the stack so storage errors expose recovery controls.
- The reported iPhone's original save has NOT been accessed or recovered. The owner has not confirmed whether the app remains installed or an exported backup exists. No email sent, account data changed, or unrelated device storage scanned/deleted.

## Verification

- qa-solo518 Chromium/WebKit: actual town picker, court editor/save/reload, per-town and character-town context, separation from shared group settings, KO/EN/JA no horizontal overflow, Schedule label/calendar/navigation.
- qa-recovery518 Chromium/WebKit: 90 selected-only notifications, actual closed IDB connection recovery, missing snapshot preservation, real backup file restore and restart, independent auto-backup fallback, malformed primary preserved and no cross-account adoption.
- qa-court517, check-court464, qa-snapshot501 and check-solo518 pass. iOS local preparation and internal-only request checks pass. No physical iPhone QA.
- Translation EN2250/2983 (75.4%), JA2249/2983 (75.4%). All new text supplied in KO/EN/JA.

## Release

Android internal release392, 519(1.0.467), available to internal testers on2026-10-13 at15:27 KST. Same supported devices; existing mapping advisory only. Signed AAB verified and627 packaged web assets byte-match prepared source. SHA256 f3fc15682e6ed9f071606962b68066bad4c6abd99cc3c7f679b0d15bc95624cf. Proof: C:/Users/Public/drawer-releases/play519-internal.jpg.

Source11230e2d on dev. iOS519 workflow38356502268 is in progress; signing/upload success or tester availability is not yet claimed. Intermediate518 Apple upload succeeded, recorded separately. Public Android/App Store release still awaits the user’s explicit approval.

## Play notes

```text
<ko-KR>
솔로 마을에서도 왕정 세계관을 기본 기능으로 선택할 수 있어요. 마을 정보에서 배경을 정하고 주민의 전체설정에서 궁정 직업·직함·신분을 설정해 보세요. 궁정 직업과 직함이 관찰 화면에도 표시됩니다. 일정 버튼의 이름과 달력 아이콘을 원래대로 되돌렸습니다. 저장소 연결이 끊겼을 때 다시 연결하고, 읽지 못한 저장본을 보호하며 자동 백업과 복구 화면을 더 안정적으로 이용하도록 개선했습니다.
</ko-KR>
<en-US>
Monarchy is now included for solo towns. Choose it in Town info and set residents’ court roles, titles and status in full settings. Court roles and titles also appear while observing. Restored the Schedule shortcut and calendar icon. Improved storage reconnection, saved-data protection, automatic backup recovery and startup recovery controls.
</en-US>
<ja-JP>
ソロの村でも王政世界を基本機能として選べます。村の情報で設定し、住民の全設定から宮廷の職業・肩書き・身分を決めましょう。宮廷の職業と肩書きは観察画面にも表示されます。予定ボタンの名前とカレンダーアイコンを元に戻しました。保存領域への再接続、保存データの保護、自動バックアップと起動時の復元機能を改善しました。
</ja-JP>
```

## Subsequent status confirmation (2026-10-13)
Actions38356502268 completed successfully. Its upload.json confirms519 /1.0.467, internalOnly=true, uploadAccepted=true, submittedForReview=false. This verifies upload acceptance, not device recovery or public availability. The user subsequently authorized public520; see release520.md.
