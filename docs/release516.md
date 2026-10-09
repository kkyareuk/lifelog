# 1.0.464 (516) — 모임과 약속

2026-10-09. New feature on dev, based on a94904cf. Public main remains unchanged.

## Player changes

- Gatherings use the existing dated/weekly schedule and its participants/location. Home and schedule screens open the same gathering panel.
- Players choose time, place and company. Characters choose their interaction partners and activities; no separate actor/action/target controls or additional self-discovery prompts.
- Added 25 authored social moments in Korean, English and Japanese, plus arrival/farewell and observer reactions. Friends/family schedules use the same activities.
- Preserve separate activity timestamps in life logs instead of collapsing every social activity to the schedule start. Generated samples are bounded to 12 per schedule.
- Character portrait backgrounds are transparent. The panel checks the live schedule when plans are moved or deleted.
- Existing real-time clock is retained; this build does not claim to introduce time acceleration.

## Verification

- Chrome and WebKit, 360×792: actual schedule editor, participant selection, live autonomous activities, accumulated history, reload, rescheduling, no cream portrait background, KO/EN/JA, no page errors or horizontal overflow.
- check-gathering516: consistent participant stories, deterministic activities, historical/future boundary, schedule deletion, blocked activities, three-language copy and bounded generation.
- Existing timetable access and deletion/sync checks pass.
- Known baseline limitation: deterministic check-autonomy487 next-day hunger assertion fails on both a94904cf and this change. The same seeded fixture reproduces the pre-existing failure; it is not reported as a passing check.
- iOS assets, Xcode version and native module preparation pass on Windows. No signed IPA, Mac build or physical device validation claimed.
- Android sync and signed release AAB build pass. jarsigner reports jar verified (standard self-signed trust-chain advisory). All 626 packaged web assets byte-match www.
- Static translation coverage: EN 2250/2984 (75.4%), JA 2249/2984 (75.4%). All new gathering UI and 25 authored moments have KO/EN/JA copies.

## Artifact

- C:/Users/Public/drawer-releases/drawervillage-1.0.464-516.aab
- SHA256: 24ffdbda4df5b3fc05af6c35f63c9fbd1f71c7c9cdec8f40790fb81f17842c19
- Screenshots: C:/Users/Public/drawer-releases/gathering516-schedule-{edit,live,logs,en,ja}.png (and WebKit variants).

## Distribution

Play Console confirmed previous internal release 515 (1.0.463), available since October 6. Release 389, version 516 (1.0.464), is **available to internal testers**, verified on October 9 at 18:50 KST. No supported-device loss; one existing missing-deobfuscation-file advisory, no blocking error. Source commit cf9191b9 is on dev. Proof: C:/Users/Public/drawer-releases/play516-internal.jpg. No public or closed-test promotion, iOS submission or player announcement was performed.

Windows native browser URL detection had stopped earlier turns. In this turn the supported Codex in-app browser exposed the Play Console URL normally and completed the authorized upload. The root cause of the separate native-window detection failure remains unconfirmed.

## Play release notes

```text
<ko-KR>
일정에서 모임과 약속을 관리해 보세요. 시간·장소·함께할 캐릭터를 정하면 주민들이 알아서 이야기를 이어갑니다. 대화, 간식 만들기, 보드게임 등 다양한 모임 기록을 추가했습니다. 모임 화면의 캐릭터 아이콘 배경을 없애고, 활동별 기록이 각각 남도록 개선했습니다.
</ko-KR>
<en-US>
Manage gatherings through your schedule. Choose a time, place and company, and let the residents take it from there. Added varied moments for chats, snacks, board games and more. Removed portrait backgrounds in the gathering view and preserved separate activity records.
</en-US>
<ja-JP>
予定から集まりや約束を管理できます。時間・場所・一緒に過ごす相手を決めたら、その先は住民におまかせ。会話、おやつ作り、ボードゲームなどの出来事を追加しました。集まり画面のアイコン背景をなくし、活動ごとの記録が残るよう改善しました。
</ja-JP>
```
