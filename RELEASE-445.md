# Internal 445 / 1.0.393

## Changes
- Remove the actual Linked sign-in provider row from Shop, preserving Settings identity and billing controls.
- Prefer the painted image over its earlier wrapper when resolving furniture selection/hit bounds. Nested bed art now excludes contain letterboxing.
- Open selection popups after pointer release and consume the compatibility click for that same gesture. Touch release cannot activate the new popup; parent dialogs remain open. Keyboard/mouse supported.
- Explain Android banner no-fill code3 in KO/EN/JA and retain bounded automatic retry.
- Confirm ad-free entitlement releases both banner and camera inset reservation; upper controls regain original viewport while bottom navigation stays fixed. No live purchase performed.

## Verification
Chrome/WebKit qa-input445, qa-home445, qa-ads445 passed. Touch/mouse/keyboard and nested wrapper coverage; shared furniture drag/canvas regression; premium restores full832px viewport and zero ad height. Android bundleRelease passed, jarsigner verified, all467 web assets byte-identical. iOS preparation passed, no signed IPA/TestFlight upload. Physical phone validation remains pending.
New copy KO/EN/JA complete; existing static translation coverage EN2258/2990 and JA2257/2990 (75.5% each).
AdMob account verification in progress; Android/iOS app verification required. Android app-ads recheck still fails although https://drawervillage.com/app-ads.txt returns the expected publisher row. Do not claim real ad fill fixed. Code3 means no fill per Google Android AdRequest reference.

## Artifact
C:/Users/Public/drawer-release433/drawer-village-1.0.393-445-internal.aab
SHA256:F8C955896C937F305717A34B925297AAC5108C83411439478943B70192603E47

## Play notes
<ko-KR>
상점의 연결된 로그인 표시를 제거했어요. 드롭다운을 누른 동작이 새 창의 항목까지 누르지 않도록 수정했어요. 침대 선택 영역을 실제 그림에 맞게 수정했어요. 제공할 광고가 없을 때 안내를 개선했어요.
</ko-KR>
<en-US>
Removed linked sign-in text from Shop. Fixed dropdown opening gestures activating items in the new popup. Bed selection now follows the painted artwork. Improved the message when no ad is available.
</en-US>
<ja-JP>
店の連携ログイン表示を削除しました。ドロップダウンを開く操作で新しい画面の項目まで押される問題を修正しました。ベッドの選択範囲を画像に合わせました。配信できる広告がない場合の案内を改善しました。
</ja-JP>
