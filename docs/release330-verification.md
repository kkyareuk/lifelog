# 330 / 1.0.297

Clothing was referenced by inventory IDs but definitions lived separately in the personal catalog. Admission and refresh now embed owned/referenced clothing in the sanitized profile. Shared world rebuild remaps ownership and clothing/outfit IDs per resident, avoiding collisions. Character editor save retains wardrobe definitions. Older profiles can recover definitions from their own original personal character on this device; absent source data cannot be recovered. Narrow wardrobe accessor avoids copying an entire world on every rebuild.

Mail: recipient users currently receive text only; character recipients receive gift inventory entries. Server gifts allow food/drink/flower/misc/fashion/perfume/book/toy. The screenshot alone cannot establish whether the empty list is an unsupported category or absent catalog data. Added empty-list guidance, user-mail guidance in KO/EN/JA, and guarded an empty picker result. No unsupported gift categories were enabled.

Validation: check-wardrobe330 PASS (details, image, ownership, outfit references, repeated rebuild, second group, source isolation). Modified JS syntax checks PASS. app:prepare and build PASS, module closure107; Gradle APK/AAB release PASS. Signatures verified and 312 web assets match both archives. aapt confirms330/1.0.297. No real two-account transfer or physical device verification. No backend or Play deployment and no user messages sent.

Translations: all new messages supplied in KO/EN/JA; overall static EN2247/2958=76.0%, JA2246/2958=75.9%.
