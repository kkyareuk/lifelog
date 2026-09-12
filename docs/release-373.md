# Android 1.0.328 (373)

Home character mapping is optional/collapsed. Empty multiplayer home import succeeds without any residents. Unmapped character references are cleared; selected-only access with no remaining visitor/group/pet/custom target becomes everyone. Mapped permissions stay intact. Account ownership is unchanged.

Chrome/WebKit home import tests passed, including zero-resident destination, omitted mapping, house image and owner clearing. Chrome also verifies empty selected access becomes everyone.

Existing fixes verified, not newly claimed as 373 changes: shared wardrobe330 roundtrip; reports365 wardrobe/answer persistence; targeted reports373 server test exercises administrator schedule proposal/approval and direct application, fashion gift inventory plus wardrobe definition and repeat idempotency. Earlier broad service-mailcopy test stops at an obsolete unrelated permission expectation; targeted tests replace no production restrictions. The reported user's group data was not inspected, so an actually deleted resident remains a possible cause of resident-missing.

APK/AAB373 build, APK signature/version and optional-copy payload checked. iOS373 project prepared; no Mac archive, TestFlight upload or submission. EN/JA new copy complete; whole-app percentage not measured. No server change in this version.

<ko-KR>
빈 멀티 집에도 캐릭터 연결 없이 집 공유 코드를 적용할 수 있도록 화면을 개선했습니다.
캐릭터 연결은 선택 사항으로 접어 두었습니다.
연결하지 않은 인물 지정은 비워 두며, 출입 대상이 모두 비면 누구나 들어갈 수 있도록 복사됩니다.
집 사진·방·가구 배치는 그대로 복사됩니다.
</ko-KR>
<en-US>
Copy a home code into an empty multiplayer home without matching characters.
Character matching is now optional and collapsed by default.
Unmatched person assignments are cleared. If no allowed visitors remain, room access is set to everyone.
Home photos, rooms and furniture layouts are copied.
</en-US>
<ja-JP>
人物を接続せず、空のマルチの家にも共有コードを適用できます。
人物の接続は任意の折りたたみ項目になりました。
未接続の人物指定は空になり、入室対象がなくなる場合は誰でも入れる設定でコピーします。
家の写真・部屋・家具配置はコピーされます。
</ja-JP>
