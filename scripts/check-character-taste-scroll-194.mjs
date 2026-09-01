import fs from "node:fs";
import assert from "node:assert/strict";

const read=file=>fs.readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const views=read("views.js"),css=read("character-book.css"),gradle=read("android/app/build.gradle"),index=read("index.html"),sw=read("sw.js");

assert.match(gradle,/versionCode\s+(?:194|195|196)/);
assert.match(gradle,/versionName\s+["']1\.0\.(?:181|182|183)["']/);
assert.match(index,/20260902(?:taste194|personality195|emotion196)/);
assert.match(sw,/(?:taste-scroll-194|personality-home-195|emotion-tastes-196)/);

assert.match(views,/<div class="personality-emotion-heading">/);
assert.doesNotMatch(views,/<header class="personality-emotion-heading">/);
assert.doesNotMatch(views,/personality-emotion-note/);

assert.match(css,/\.taste-category-dialog>form\{grid-template-rows:auto minmax\(0,1fr\) auto!important/);
assert.match(css,/height:calc\(100dvh - 56px - env\(safe-area-inset-top\) - env\(safe-area-inset-bottom\)\)!important/);
assert.match(css,/\.taste-category-list\{[^}]*min-height:0[^}]*overflow-y:auto[^}]*-webkit-overflow-scrolling:touch/);
assert.match(css,/\.character-body-choice-dialog>form\{[^}]*height:min\(82dvh,730px\)!important[^}]*overflow:hidden!important/);
assert.match(css,/\.character-body-choice-dialog header\{[^}]*position:static!important[^}]*flex-wrap:nowrap!important[^}]*height:auto!important[^}]*background:transparent!important/);
assert.match(css,/\.character-body-choice-dialog header span\{[^}]*min-width:0!important/);
assert.match(css,/\.character-body-choice-panel\{[^}]*min-height:0!important[^}]*overflow-y:auto!important/);

console.log("v1.0.181 / 194 취향·사전·소지품 팝업 스크롤과 정서 화면 구조 검증 완료");
