# Internal 443 / 1.0.391

## Changes
- Keep the pre442 viewport-sized room footprint. Default placement canvas extends one viewport to the right, with unchanged height. Width/height settings change placement extent, not room scale. Single/shared legacy manual room coordinates migrate once; furniture-local coordinates are preserved. Fixed the catalog drag grid using actual canvas dimensions.
- Collapsed activity description has space for three complete lines with ellipsis. Location shares the bottom row with Choose activity and truncates horizontally.
- Removed global native layout rescanning. Correct immersive banner insets in the AdMob SDK and only update margins when different. Identical native viewport reservations are deduplicated.

## Verification
- Chrome and WebKit: viewport384x832 gives canvas768x754 inside viewport384x754. Scroll restoration, room resize/rebase, shared layout save, attached-object drag tests pass.
- Chrome/WebKit mocked SDK: portrait/landscape banner layout, failure/retry, modal hide/restore, premium removal, fullscreen gating, three full description lines and aligned location/action footer pass. Screenshots inspected.
- 1000 identical reserve calls produce one native bridge call; changed height/message still propagate. Legacy migration is idempotent and retains furniture coordinates.
- Android bundleRelease and jarsigner passed; changed bundled web assets match prepared sources; internal443 marker verified. Real Android device frame-time/ad layout improvement remains to be verified; no claim that all lag is eliminated.
- iOS source/version preparation check passed. No signed IPA/TestFlight upload in this run. Public web and main unchanged. Backend unchanged.
- New copy KO/EN/JA complete; static total EN2258/2990 (75.5%), JA2257/2990 (75.5%).

## Artifact
C:/Users/Public/drawer-release433/drawer-village-1.0.391-443-internal.aab
SHA256: c55a1c31e524a910edf08e7be678c55bc58aea7947c22db2860c0b275bfbf879

## Play notes
<ko-KR>
집의 방·가구 표시 크기를 유지하면서 오른쪽에 빈 배치 공간을 추가했어요. 싱글·멀티에서 배치 영역 크기를 조절하고 옆으로 넘겨볼 수 있어요. 홈 활동 설명은 세 줄까지 온전히 표시하고, 긴 글은 말줄임표로 처리해요. 장소명을 할 일 정하기 옆으로 옮겼어요. 광고 표시 중 불필요한 화면 갱신을 줄였어요.
</ko-KR>
<en-US>
Rooms and furniture keep their previous display size, with extra placement space to the right. Resize and scroll the placement area in single and multiplayer. Home activity descriptions show three complete lines and use ellipses for longer text. Location now sits beside Choose activity. Reduced unnecessary screen updates while showing ads.
</en-US>
<ja-JP>
部屋と家具の表示サイズを保ち、右側に空き配置スペースを追加しました。シングル・マルチで配置エリアの広さを調整し、横にスクロールできます。ホームの行動説明を3行まで表示し、長い文章は省略記号で表示します。場所名を行動選択ボタンの横へ移動しました。広告表示中の不要な画面更新を減らしました。
</ja-JP>

## Distribution
Google Play internal release328: 443 (1.0.391), available to internal testers September17 19:48 KST. Source7bd29aa on dev. No supported devices removed. One nonblocking deobfuscation warning; minification disabled. Production unchanged.
Test link: https://play.google.com/apps/internaltest/4701300702493397907
