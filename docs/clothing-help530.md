# Internal 1.0.478 (530) — clothing help

Small info buttons beside the clothing editor title, situation tags and mood tags open contextual help. Only one help panel stays open; close, Escape and outside clicks dismiss it without submitting the editor. Copy explains that tags do not cause moods or schedules, and that Home uses emotion/situation images with the user-uploaded base image as fallback. This preserves build 529's image selection rules.

New help copy: Korean, English and Japanese complete (EN/JA 100% of this change; whole-app coverage unmeasured).

Validation: Chrome and WebKit mobile 393×873, all three languages, panel bounds, close/Escape/focus restoration/outside click, unchanged clothing data; JS syntax and diff whitespace checks. Android module closure/assets passed. iOS source/version/assets configuration passed on Windows; no Mac signing, IPA, TestFlight or device claim.

Signed Android AAB built; bundled modules/styles match prepared assets. Play release 398 confirmed available to internal testers on 2026-11-16 17:06 KST. AAB SHA256: E94545D4328C6B4C370762EA46D31CDAF303219A6C53F8077C91F8C310BEE9D3. Production remains 528; app changes target dev only.

## Play release notes
<ko-KR>
옷 설정에 작은 도움말 버튼을 추가했어요. 기분·상황 태그와 캐릭터 사진 표시 방식을 필요한 곳에서 확인할 수 있어요.
</ko-KR>
<en-US>
Added small help buttons to clothing settings. Learn what mood and situation tags mean and how character images are displayed, right where you need it.
</en-US>
<ja-JP>
服の設定に小さなヘルプボタンを追加しました。気分・状況タグの意味とキャラクター画像の表示方法を、その場で確認できます。
</ja-JP>

Web packaging check is blocked by the pre-existing sw.js cache name drawer-village-life527-20261023, which prepare-web.mjs rejects (it expects web/public/internal). The unchanged baseline has the same mismatch. Local browser UI passed; web deployment is not claimed.
