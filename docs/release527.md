# Internal 1.0.475 (527): character reflections and court settings

Scope: dev only; no production promotion. Personal villages gain 100 authored logs, each in Korean, English and Japanese: 40 emotional/relationship reflections, 24 secret after-effects and 36 reflections for nine court ranks. Friendship does not automatically become romance. Memories refer to earlier encounters, and repeated rendering does not reroll feelings.

Secrets gain an opt-out for private reflections and 2/8/24-hour after-effect settings. The actual secret text is never copied into these logs; existing disclosure/knowledge rules remain authoritative. New reflections are personal-world only; shared-world autonomous stories are unchanged.

Town settings label the court story explicitly and link to a local resident's court settings. Character settings survive changing the town story. Japanese secret controls use a bounded existing grid layout. Native packaging includes the desktop stylesheet already referenced by the app.

Reflections are stored separately from scheduled/activity entries, displayed together in the timeline, and preserved when settings regenerate future activities. They cannot become a simulated activity or erase a same-minute action. No automatic affinity gain was added in this increment.

Validation: check-character-life526 (100 unique rows in all languages, all ranks and secret types, privacy, duration, repeated render/reload, context and shared-world exclusion); existing secrets503/505; Chromium and WebKit mobile402/desktop1280 UI, all three languages, secret persistence, court navigation, no overflow; actual simulation history append/idempotence/regeneration. Native module closure and asset checks.

Legacy checks check-log-sync-continuity and check-town-profile-bugfixes contain outdated source-pattern expectations (room allowedActivities and fixed versionCode187) and fail on unchanged baseline code. Their earlier log-continuity assertions pass; the new runtime history test verifies the changed path.

Translation: all new logs and controls EN/JA100%. Existing dictionary scanner: EN2249/2981 and JA2248/2981, both75.4%; this is dictionary coverage, not an exhaustive whole-app audit.

## Player release notes

<ko-KR>
감정과 관계, 비밀의 여운, 궁정 신분에 따른 일상 로그 100종을 추가했어요.
비밀마다 일상에 여운을 표시할지, 얼마나 오래 이어질지 설정할 수 있어요.
마을 설정에서 궁정 이야기를 고르고 주민의 궁정 설정으로 바로 이동할 수 있어요.
</ko-KR>
<en-US>
Added 100 daily reflections about feelings, relationships, secrets and court ranks.
Choose whether each secret leaves private reflections and how long they linger.
Select Court story in town settings and jump to a resident's court settings.
</en-US>
<ja-JP>
感情や関係、秘密の余韻、宮廷の身分に応じた日常の記録を100種類追加しました。
秘密ごとに余韻を表示するか、どのくらい続くかを設定できます。
村の設定で宮廷物語を選び、住人の宮廷設定へ移動できます。
</ja-JP>

## Delivery

Android signed bundle verified: all633 prepared assets match. SHA256 AF8A85D928FEC414B615DAC1CFC57B5CBFED6505C3903EE50CC38A6AF53FEAB6. Play internal release396 upload in progress. Build526 remains unreleased;527 also corrects the empty-town shortcut notice.
iOS1.0.475(527): project/assets prepared and project checks passed. CocoaPods/Xcode compilation, signing and real-device checks require Mac; no IPA or App Store submission.
