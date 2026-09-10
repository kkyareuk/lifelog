# 328 / 1.0.295

- dev feature build, no production main/Play/backend/mail deployment.
- Numeric trait updates use 80% previous +20% answer target. Original signed choice signals map to targets 50+20*signal (clamped). Categorical affinities decay 80%, selected category receives20% of5. No accumulating unbounded drift, no five-answer history per axis.
- Manual ID-card question button for current local/owned shared character. Ten-minute cooldown in device localStorage scoped by signed-in UID. No polling server or periodic cooldown writes. Cross-device cooldown enforcement is NOT provided; reinstall/cleared storage can reset it. Skip consumes the local request interval. One opportunity remains ready after 24h, no stack. Automatic popup route removed.
- Category locks cover all46 discovery-modifiable fields in4groups, alongside existing individual controls. Not every arbitrary app setting is a question field.
- Full-settings folding removed at source; scroll viewport preserved. Scores below controls avoid title/lock overlap.
- Statistics includes character selector and26 axis rows. Ordinal traits /100, categorical reaction preference share %, unlearned categories marked manual. No cross-category moral score.
- Original supplied sprite sheet copied without raster editing; CSS selects requested ID icon.
- Tests: check-discovery328, qa-discovery328 (3languages x384/1180px, forms, manual request cooldown, group lock save, no folds, score badges,26stat rows), syntax, app prepare/module closure, web build, signed Android APK/AAB.310www assets byte-identical in both packages. Actual Android/iOS and live2-account multiplayer untested.
- Backend request counts/billing were not measured. Cooldown and calculations add no backend calls; answer/lock save uses existing pipeline.

- Profile personality keyword legend states maximum4 in KO/EN/JA. Existing click handler and normalization both enforce4.
