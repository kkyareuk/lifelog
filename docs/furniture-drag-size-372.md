# 372 preparation: furniture drag size

Fixed the committed personal-home drag path dropping furnitureSprite.scale when updating --sprite-width. A chair was rendered at 1.8x, then reset to 1x on the first move (QA reproduced width 32.453125 -> 18.03125 px).

Personal and shared previews now preserve the source computed width and height before reparenting into another room. This keeps percentage-based room cells from resizing the preview.

Validation: QA_STAGED=1 node scripts/qa-touch371.mjs tested the staged app/shared/CSS with Chrome mobile touch input. Twenty intermediate drag positions retained artwork width/height within 1 CSS px in each world; room transfer, bed/person/table/pet depth checks passed. This is browser automation, not a physical Android/iPhone result.

No new user-facing strings. EN/JA translation for this fix: no additions required. No APK/AAB or store deployment in this scoped commit. Other 372 development remains in the working tree and is not included in this commit.
