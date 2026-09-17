# Internal 441 / 1.0.389

## Changes
- Adaptive full-width top banner on home, town and house screens. Keep the reserved space and show a localized retry/status on failure; retry after 60 seconds and reload for width changes. Suspend ads behind dialogs, fullscreen ads and in background. Premium users have no banner space.
- Report consent / initialization / load stages and SDK error codes for ad failures instead of one generic message. Consent remains mandatory where required.
- Preload a non-rewarded interstitial at the character settings hub and show a ready ad when entering full settings. Share preparation with Mafia, enforce a one-minute interstitial interval and consume readiness once. No late ad if unavailable.
- Enlarge discovery icon for landscape tablets. Scale landscape HUD to the remaining viewport below the banner so the activity card and buttons do not overlap.

## AdMob configuration
- Confirmed no European regulation message existed. Created and published one for Android com.drawervillage.app and iOS 6808600866. Console confirms Published, two apps, English plus Japanese. The provided language list had no Korean option.
- Existing public privacy policy https://drawervillage.com/privacy.html confirmed HTTP200 and linked to both apps. Consent, reject and manage options available; default targeting EEA/UK/Switzerland retained. No tracking authorization prompt added.
- Google says propagation may take up to one hour. Account approval is separate. Real device ad delivery remains unverified.

## Validation
- Chromium and WebKit with mocked native SDK: adaptive banner, retained failure slot, retry, landscape sizing, repeated binding, modal hide/restore, Mafia once/game, settings non-rewarded interstitial, premium banner removal.
- Existing signed reward/cooldown/account-boundary regression tests pass.
- New app copy EN/JA complete. Static whole-app translation: EN2258/2990 (75.5%), JA2257/2990 (75.5%).
- Android release build/signature/source verification and distribution results recorded below when complete. iOS common source updated, no signed IPA/device verification in this Windows run. Web public deployment unchanged.

## Play notes
<ko-KR>
홈·마을·집의 상단 배너를 화면 폭에 맞추고, 광고 로딩 실패 시 안내와 재시도를 추가했어요. 전체 설정 진입 시 전면 광고를 연결했어요. 태블릿 가로 화면의 자아만들기 아이콘과 배너 아래 화면 배치를 개선했어요. 광고 제거 구매자는 배너·전면 광고가 표시되지 않아요.
</ko-KR>
<en-US>
Top banners now fit the screen width on Home, Town and House. Added ad loading status and retry. Added interstitials when entering full character settings. Improved the Self-discovery icon and layout below banners on landscape tablets. Ad-free owners see no banners or interstitials.
</en-US>
<ja-JP>
ホーム・村・家の上部バナーを画面幅に合わせ、広告読み込みの案内と再試行を追加しました。キャラクターの全体設定を開く際に全画面広告を表示します。横向きタブレットの自分づくりアイコンとバナー下の配置を改善しました。広告削除の購入者にはバナー・全画面広告を表示しません。
</ja-JP>
