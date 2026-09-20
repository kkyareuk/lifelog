# Home image hotfix — Android1.0.413 /465

2026-09-20. User explicitly requested production repair and dev backport for feedback35df2f56-e6bc-48d0-b4ec-347d7c79f7d7 (Android437, Android12). User does not know whether the affected home is personal or multiplayer. No reporter-device or original-photo reproduction was possible; do not claim that every image failure is resolved.

Branch `codex/home-images465`, based on public462. Originally planned463, changed before upload because Play already contained development464. No court/economy development features included in the production artifact.

## Fix
- Shared exterior upload referenced `groupApi` outside its lexical scope, causing save failure. Capture the actual group API and authenticated group session before opening the editor, and check that session before/after upload.
- Shared room editing had no working photo input. Added room-photo and full-room artwork inputs using the existing crop/resize pipeline, shared photo upload and revisioned home-layout save queue. Only editors can open this editor. Local base64 is not written into shared layouts.
- Reject uploads after the account/group changes, and stop saving after the editor is removed. Personal exterior saves also retain their initial world identity.
- Preserve dev's existing `space` editor and its photo callback; use the new controls only for ordinary shared homes. Preserve older main's existing furniture/layout code.
- All new controls/messages translated KO/EN/JA. Static public-source inventory EN2262/2993 (75.6%), JA2261/2993 (75.5%).

## Verification
- `qa-home-photos465.mjs`: Chromium and WebKit passed personal exterior/full-room upload, IndexedDB save/reload, shared exterior upload callback, room/full-room HTTPS layout saves, account-change cancellation. Shared cloud APIs were fixture doubles, not writes to the reporter's account. WebKit test supplies the file input directly because its headless chooser event differs.
- Dev passed the same Chromium regression and `check-court464.cjs` after preserving its separate space editor.
- Older main passed personal exterior plus shared room/exterior/session regression; its legacy personal-floor UI fixture timed out, so a full main personal-floor UI pass is not claimed.
- Packaged offline startup/reload passes, missing assets0. Signed AAB487 prepared assets match byte-for-byte; jarsigner verifies.
- iOS common-code/WebKit checks only; no signed IPA, native device test, upload or Apple resubmission.

## Delivery
- Internal release344: available to internal testers September20 17:25 KST.
- Production465: 100% all existing target countries, review request accepted around17:28 KST. Publishing overview shows465 under review with automated prechecks running. Managed publishing disabled; public availability is not yet confirmed.
- main runtime Pages deployment passed. No user notice or direct reply sent.

## Artifact
`C:/Users/Public/drawer-releases/drawervillage-1.0.413-465-hotfix.aab`

SHA256 `056B039CF6D7DA78DB9D96D548962EE2AADA1AD5CE93DAD8D5D4BAE957075D8C`

Common6e1c997; version000c865; test6eff409/dd868b0. Main common2214422; dev commonb88ae8c. Main/dev Android versions retained separately; production AAB comes from its public-source hotfix branch.

## Reply draft (not sent)
안녕하세요. 집 사진을 저장하지 못해 불편을 드려 죄송합니다. 멀티 마을에서 집 외형 사진이 저장되지 않는 오류를 수정하고, 집 편집 권한이 있는 사용자가 방 편집에서 사진과 방 전체 그림을 넣을 수 있도록 개선했습니다. 개인 마을의 사진 저장과 앱 재실행 후 유지도 확인했습니다. 수정한 1.0.413(465)을 Google Play 심사에 제출했습니다. 승인 전에는 스토어에 업데이트가 보이지 않을 수 있습니다. 업데이트 후에도 문제가 이어진다면 개인/멀티 마을 중 어느 쪽인지, 오류가 뜨는 화면과 사진 파일 형식을 알려 주시면 추가로 확인하겠습니다. 앱 삭제나 데이터 초기화는 필요하지 않습니다.

## Play notes
<ko-KR>
멀티 마을에서 집 외형 사진이 저장되지 않는 오류를 수정했어요. 집 편집 권한이 있는 사용자가 방 사진과 방 전체 그림을 추가·변경할 수 있도록 개선했어요. 사진 선택 중 계정이나 마을이 바뀌면 잘못된 곳에 저장되지 않도록 보완했어요.
</ko-KR>
<en-US>
Fixed house exterior photo saving in multiplayer villages. Users with home editing permission can now add or change room photos and full-room artwork. Photo saving stops if the account or village changes during selection.
</en-US>
<ja-JP>
マルチの村で家の外観写真が保存できない不具合を修正しました。家の編集権限があるユーザーは部屋写真や部屋全体の絵を追加・変更できます。写真選択中にアカウントや村が変わると保存を中断します。
</ja-JP>
