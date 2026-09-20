# Account and backup recovery — 1.0.410 / Android 462

2026-09-20. Public-source hotfix branch `codex/account-recovery462`, following public461. User explicitly requested production promotion after internal delivery. No experimental dev features included.

## Reports and diagnosis

Reports a3180295-f492-4a73-9f98-6bdd234a64ce and c1cfd874-9ee8-4053-8169-eb36ea06a372 concern Google sign-in hiding guest data and backup import losing photos in Android451 / 1.0.399. The first diagnostic still has two characters, one town, and 12/12 restored media while logged out. This supports remaining device data; it does not prove the user's exact loss/recovery outcome. Both reports are anonymous with no reply address.

Reproduced: an existing empty account snapshot prevents explicit guest handoff. Old auth fails the new regression assertion; fixed auth passes. A populated destination also previously excluded the guest world. Separately, import stripped embedded images and only retained current-account photos, so information-only guest backups did not reconnect remaining guest originals after sign-in.

## Changes

- Explicit sign-in from a populated guest session preserves guest characters alongside existing account data. Automatic session restoration still does not import guest data. Guest recovery copy remains untouched.
- File import retains embedded photos. It resolves matching character/home IDs against guest primary and recovery snapshots, hydrates device media, and merges with current-account data. Different IDs with identical names are excluded. No other signed-in account is searched.
- Account/state changes during asynchronous import cancel the operation. Missing local image references receive an honest partial-photo message. KO/EN/JA messages included.
- New export files remain information-only; this fix cannot recreate originals already removed from the device or absent from a backup.

## Validation

- Actual auth handler: empty/populated account handoff, automatic account isolation, guest original retention, stale downloads/uploads, storage-pressure recovery, stalled request recovery. Passed on public hotfix, old web main, and dev.
- Actual browser file picker with IndexedDB photos: two guest portraits restored alongside an existing account character, save/reload, embedded-photo retention, different-ID isolation, missing media and restricted guest donor reads. Chrome and WebKit passed on public hotfix; Chrome passed on main and dev.
- Packaged Android web assets boot offline without missing modules and retain a saved character after reload.
- Signed AAB: 486 web assets match prepared output byte-for-byte; jarsigner verification passes.
- No native Google OAuth/device reproduction performed on the reporter's phone. iOS shares common code; WebKit validation is not a signed IPA or device test. Apple resubmission remains separate.
- Static translation inventory EN2262/2993 (75.6%), JA2261/2993 (75.5%). New recovery messages and release notes translated in both languages.

## Artifact

Google Play internal release341: **available to internal testers**, September20 13:08 KST. All three release-note languages accepted. Follow-up: production release36 promoted at 100% for all existing target countries and review request accepted on September20 around13:13KST. Publishing overview shows 462 under review with automated prechecks running; checks must pass before review proceeds. Managed publishing is disabled. Approval/public availability is not yet confirmed. No user notice sent.

`C:/Users/Public/drawer-releases/drawervillage-1.0.410-462-hotfix.aab`

SHA256 `ACCFDABFA51A35CCE36BF341A754D0527AD2D8072DF9EF79C2EFAEE1B013BA50`

Runtime commit f424545; Android version cf62ca5; compatible test be3fe8b. Main common commits 3f3928d / 3d3c2c3; dev 2b35eee / 2e4dd7c. Main/dev platform versions deliberately retained; Android462 is built from its public-source branch.

## Reply draft — not sent

안녕하세요. 로그인 후 기존 캐릭터가 보이지 않거나 백업을 불러올 때 사진이 빠지는 문제로 불편을 드려 죄송합니다. 로그인 전 기기 데이터와 계정 데이터를 연결하는 부분, 백업의 사진을 기기에 남아 있는 원본과 연결하는 부분을 수정한 1.0.410 버전을 Google Play 프로덕션 심사에 제출했습니다. 아직 승인 전이라 일반 스토어에 업데이트가 표시되지 않을 수 있습니다. 보내 주신 진단에는 캐릭터 2명과 사진 원본 복원 기록이 확인되므로, 앱 삭제·재설치나 데이터 초기화는 하지 말고 현재 기기와 백업 파일을 보관해 주세요. 이미 원본이 삭제된 사진은 백업에 포함되어 있지 않다면 자동 복원되지 않을 수 있습니다.

## Play notes

<ko-KR>
로그인 전에 만든 캐릭터를 기존 계정 데이터와 함께 유지하도록 수정했어요. 백업을 불러올 때 기기에 남아 있는 같은 캐릭터의 사진과 파일에 포함된 사진을 복원하도록 개선했어요.
</ko-KR>
<en-US>
Fixed sign-in to retain characters created before login alongside existing account data. Backup import now restores matching character photos still on the device and photos included in the file.
</en-US>
<ja-JP>
ログイン前に作成したキャラクターを既存のアカウントデータと一緒に保持するよう修正しました。バックアップ読み込み時、端末に残る同じキャラクターの写真とファイル内の写真を復元するよう改善しました。
</ja-JP>
