import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=file=>readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const gradle=read("android/app/build.gradle"),index=read("index.html"),app=read("app.js"),views=read("views.js");
const css=read("app.css"),book=read("character-book.css"),sw=read("sw.js");

assert.match(gradle,/versionCode\s+234/);assert.match(gradle,/versionName\s+"1\.0\.216"/);
assert.match(index,/app\.js\?v=20260906dev234/);assert.match(app,/auth\.js\?v=20260906dev234/);
assert.match(sw,/drawer-village-v20260906-dev-234/);
assert.match(views,/\(min-width:721px\) and \(orientation:landscape\)/);
assert.match(css,/\.tablet-observe-map\{[^}]*inset:112px 42% 132px 18px!important[^}]*border:2px solid #574330!important/);
assert.match(css,/@media\(min-width:721px\) and \(orientation:landscape\)\{\s*html\.native-app\[data-active-tab="town"\]/);
assert.match(css,/@media\(max-width:720px\),\(min-width:721px\) and \(max-width:900px\) and \(orientation:portrait\)/);
assert.match(book,/@media\(min-width:721px\) and \(orientation:landscape\)\{/);
assert.match(book,/\.tablet-character-summary\{display:none!important\}/);
assert.match(book,/\.mobile-character-dashboard\[data-character-ui-version="8"\]\{display:block!important;width:min\(100%,44\.92912dvh\)!important/);
console.log("PASS dev234: portrait phone layouts and landscape iPad character/town split");
