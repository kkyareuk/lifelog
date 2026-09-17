# Public435 / Internal436

User authorized Google Play production with plaza closed, internal testing with plaza open, and an in-game announcement covering version1.0.355 (code407) onward, excluding Mafia. Current Play public421 /1.0.369 and internal432 /1.0.380 were checked before work. Development remains dev; public main/Pages are not overwritten.

## Changes
- Standing interaction IDs now group two names with * and retain one specific conversation topic. Hidden partner status is removed from actor flow, preventing unequal visual heights. A separate scene-conversation-layout module measures actual artwork and room widths and places standing partners on one baseline with a gap. Seat, bed, approaching, hug and affection anchors retain their own layout.
- All ordinary touch sounds now use the first impact (.32~.64s) from user wood-falling-80049 MP3. +6dB followed by limiter and25ms fade. No original source edited.
- Book page+8dB, book close+3dB, drawer open+15dB, drawer close+7dB, movement walk/heels/boots+9dB, with output limiting. UI .7 and footsteps .82 playback attenuation removed; existing volume/mute and max2 movement voices remain.
- Semantic close/back routes include dictionary, mail, menus and home back buttons. Character full-book close retains Heavy Book Falling; page turns retain page effect.

## Validation
- qa-feedback433 Chrome/WebKit: KO/EN/JA material picker persistence, UI restore/back, room heading depth, shared material save. Width95/140/240 standing pairs: one named topic, positive gap, same baseline, stable re-layout. Sound routing and mute.
- qa-feedback431 regression passes: compact panel, drag, counters and shared save retry/context actions.
- check-web-audio341 passes. check-home-life-simulation legacy string assertion expects the pre432 .home-native-page.home-ui-hidden CSS selector and also fails on432; not reported as passing.
- Encoded mean levels: touch-19.2dB, drawer open-15.3dB (previous-29.8), walk-15.7(previous-24.6), heels-27.2(previous-36.1), boots-13.3(previous-20.5). Measured files, not physical-device listening or thermal test.
- Final435/436 AABs contain byte-identical current source/audio and correct plaza flags (435false,436true). Signed bundleRelease success. iOS436 config/assets prepared and WebKit verified; no Mac signing/TestFlight. Web files prepared, not published.
- New UI has no new translatable sentence; retained localized conversation topics. Release notes KO/EN/JA, changed copy EN/JA100%, full coverage unmeasured.

## Artifact hashes
433: 38e5c9d737c06955e1beb85fc80416d94706310b35824bf1ac004ccd02a3af51
434: 4068b331472da8dca4125f1e59754dc4961e02c557f5e16fa7e128d85615472c

## Deployment
- Superseded public433 was withdrawn from review and removed from pending publication; no users received it. Internal434 was excluded from the draft.
- Public435 release29 saved but NOT finally submitted. Held after the user reported severe click lag. Replace with the final optimized build before submission.
- Final internal436 release323: Play Console confirmed 내부 테스터에게 제공됨, September17 16:11 KST, plaza open.
- Announcement final preview checked, waiting for public submission before send. User completed authorized admin login; no push/email.

## Final recipient-label follow-up
- Public announcement To label is now 서랍마을 주민 / Drawer Village residents / 引き出し村の住民. Sender remains 서랍마을. Existing group-mail recipients unchanged. qa-mailbox435 KO/EN/JA ×384/1180 passes.
- Notice admin UI now supports creating a fresh draft without editing old published notices. Save/preview/cancel/send-once mock QA passes; hosting deployed. User authenticated the authorized administrator; announcement draft saved through the normal UI. No direct database write performed.
- Uploaded433 was withdrawn before release; draft434 replaced. Final public435/1.0.383, internal436/1.0.384.
- Final435 SHA256 eaea8ea7b70e41e9cb410b558f38ad083ec5205f50d72b6ffbb20a338982d1f1
- Final436 SHA256 5e2671cf2ae28988a8b1dbe4daeb178b50192c6393d0218e73453ddee43be2ac
- Both jarsigner checks pass; current mailbox/audio/scene files match packaged assets and channel flags.
