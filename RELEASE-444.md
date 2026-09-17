# Internal444 / 1.0.392

## Changes
- Android camera/status safe area is black, followed by banner then game viewport. Native reserved height includes safe top and ad height; status view shares banner offset. Devices with zero safe top have no added strip. AdMob safe-area callback also covers Android9–14 using AndroidX insets and only mutates changed margins. No global layout polling.
- Banner placement policy includes plaza, shop, multiplayer directory, building details and room editor/info. Unrelated dialogs, payments and fullscreen ads still hide banners; premium entitlement remains respected.
- Decouple plaza-enabled flag from ad testing. Bundled config testing:false now requests configured real Android/iOS IDs. Explicit QA config remains available for development. Actual ad fill/account approval and on-device native positioning remain unverified.
- Render a Self-discovery placeholder with the home rail and retain the functional button during startup sync. Cooldown fades icon/caption to50% while leaving countdown readable and rewarded-ad choice usable.
- Use contain image's painted rectangle for furniture outline and drag hit tests, excluding bed letterbox space.
- Multiplayer directory help text is light on wood, paper text remains dark. Shop omits login status text.

## Verification
- Chrome and WebKit: banner screen allowlist, camera inset viewport simulation, existing banner retry/fullscreen/premium behavior; discovery cooldown across characters/languages and sync visibility; house/shared-save/attached-item regression; bed selection inset >40px on a180x300 fixture; directory computed contrast and screenshot; shop status absent.
- Real ad mode test proves plaza flag no longer selects test ads; explicit QA switch retained. Consent initialization/retry regression passes.
- Android bundleRelease and jarsigner pass; prepared modified assets match AAB and internal444/config testing:false verified. No native physical-device frame/layout or live ad fill test. iOS source preparation passes, no signed IPA/TestFlight upload. Public web/backend/main unchanged.
- New visible copy remains KO/EN/JA; static coverage EN2258/2990 and JA2257/2990, both75.5%.
- Google recommends accounting for display cutouts that obstruct banner visibility: https://developers.google.com/admob/unity/banner/anchored-adaptive

## Artifact
C:/Users/Public/drawer-release433/drawer-village-1.0.392-444-internal.aab
SHA256:e28f3b641218f47ce666db67e7a79b700924998a72be394a570d41e5f6fc594e

## Play notes
<ko-KR>
카메라 영역을 검게 처리하고 그 아래에 광고와 게임 화면을 배치해요. 광장·상점·멀티 목록·건물 정보·방 정보에 배너를 추가했어요. 실제 광고 요청으로 전환했어요. 자아만들기 버튼이 동기화 중 사라지지 않게 하고, 대기 중에는 반투명하게 표시해요. 침대 선택 영역을 그림에 맞추고 멀티 목록 글자 가독성을 개선했어요. 상점의 로그인 상태 문구를 제거했어요.
</ko-KR>
<en-US>
Camera cutout space is black, with ads and game controls below it. Added banners to Plaza, Shop, multiplayer lists, building details and room info. Switched to real ad requests. Self-discovery stays visible during sync and fades during cooldown. Bed selection now fits the artwork. Improved multiplayer text contrast and removed login status from Shop.
</en-US>
<ja-JP>
カメラ領域を黒くし、その下に広告とゲーム画面を配置します。広場・店・マルチ一覧・建物情報・部屋情報にバナーを追加し、実広告のリクエストに切り替えました。同期中も自分づくりボタンを表示し、待機中は半透明にします。ベッドの選択範囲を画像に合わせ、マルチ一覧の文字を読みやすくしました。店のログイン状態表示を削除しました。
</ja-JP>

## Distribution
Google Play internal release329: 444 (1.0.392), available to internal testers September17 20:15 KST. Source49fd1b1 on dev. No supported devices removed. One nonblocking deobfuscation warning. Production unchanged.
Test link: https://play.google.com/apps/internaltest/4701300702493397907
