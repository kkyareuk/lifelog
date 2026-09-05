import fs from "node:fs";
import assert from "node:assert/strict";

const read=file=>fs.readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const views=read("views.js"),css=read("character-book.css"),gradle=read("android/app/build.gradle"),index=read("index.html"),sw=read("sw.js");

const versionCode=Number(gradle.match(/versionCode\s+(\d+)/)?.[1]||0);
const versionPatch=Number(gradle.match(/versionName\s+["']1\.0\.(\d+)["']/)?.[1]||0);
assert.ok(versionCode>=194,`versionCode ${versionCode} is older than the taste-scroll fix`);
assert.ok(versionPatch>=181,`versionName patch ${versionPatch} is older than the taste-scroll fix`);
assert.match(index,/\.js\?v=2026\d{4}[a-z0-9-]+/);
assert.match(sw,/drawer-village-v2026\d{4}-[a-z0-9-]+/);

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
