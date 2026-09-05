import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {WALKING_STYLE_OPTIONS,walkingGait} from "../walking-gaits.js";

const read=file=>readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const views=read("views.js"),audio=read("audio.js"),css=read("app.css"),bookCss=read("character-book.css"),app=read("app.js"),state=read("state.js"),gradle=read("android/app/build.gradle");

assert.equal(WALKING_STYLE_OPTIONS.length,6);
assert.equal(WALKING_STYLE_OPTIONS.at(-1),"그림자처럼 매우 민첩하게");
const careful=walkingGait("느리고 조심스럽게"),natural=walkingGait("보통 속도로 자연스럽게"),shadow=walkingGait("그림자처럼 매우 민첩하게");
assert.ok(careful.routeDurationFactor>natural.routeDurationFactor&&natural.routeDurationFactor>shadow.routeDurationFactor);
assert.ok(careful.footstepInterval>natural.footstepInterval&&natural.footstepInterval>shadow.footstepInterval);
assert.equal(shadow.sound,"run");

assert.match(audio,/\.town-traveler\.is-village-walk/);
assert.match(audio,/actor\.gait\.footstepInterval/);
assert.match(audio,/channel\.gait!==actor\.gait\.className/);
assert.match(views,/data-walking-style=/);
assert.match(views,/const routeDuration=\(56\+\(seed%13\)\)\*gait\.routeDurationFactor/);
assert.match(views,/--town-step-duration:/);
assert.match(css,/walk-style-shadow/);
assert.match(css,/@keyframes home-life-shadow-step/);
assert.match(css,/town-traveler-route var\(--travel-duration,22s\)/);

assert.match(app,/name="legalRegistration" value="registered"/);
assert.match(app,/\["부부","부모·자녀","형제·자매"\]\.includes\(f\.type\.value\)/);
assert.match(state,/LEGALLY_REGISTERABLE_RELATION_TYPES=new Set\(\["부부","부모·자녀","형제·자매"\]\)/);
assert.match(state,/relation\.legalRegistration=normalizeLegalRegistration/);

assert.match(views,/const tabletFullBook=fullBook\.replace/);
assert.match(views,/\$\{tabletFullBook\}/);
assert.match(views,/const fixedBookMode=state\.characterSettingsView==="full"&&!nativeTabletMode/);
assert.match(bookCss,/\.tablet-character-book\.character-book-v8\.is-open/);
for(const pane of ["visual","profile","body","wardrobe","personality","taste","closet"])assert.match(views,new RegExp(`\\["${pane}"`));

assert.match(gradle,/versionCode\s+219/);
assert.match(gradle,/versionName\s+"1\.0\.204"/);
console.log("PASS 219: audible gait-synced town walking, family legal registration, and shared tablet character book");
