import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=file=>readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const gradle=read("android/app/build.gradle"),index=read("index.html"),app=read("app.js");
const css=read("app.css"),book=read("character-book.css"),main=read("android/app/src/main/java/com/drawervillage/app/MainActivity.java");
const exporter=read("android/app/src/main/java/com/drawervillage/app/ProfileExportPlugin.java"),sw=read("sw.js");

assert.match(gradle,/versionCode\s+233/);assert.match(gradle,/versionName\s+"1\.0\.215"/);
assert.match(index,/app\.js\?v=20260906dev233/);assert.match(app,/auth\.js\?v=20260906dev233/);
assert.match(sw,/drawer-village-v20260906-dev-233/);
assert.match(book,/\.character-editor-hub-only \.tablet-character-summary\{display:grid!important/);
assert.doesNotMatch(book,/html\.native-app\[data-active-tab="character"\] \.tablet-character-summary(?:\{|\s)/);
assert.match(css,/\.tablet-observe-map\{[^}]*inset:0!important[^}]*border:0!important[^}]*border-radius:0!important/);
assert.match(css,/\.game-hud-profile-copy\{left:88px!important;top:0!important/);
assert.match(css,/\.mobile-town-shell \.town-map-scroll button\.town-decoration\{[^}]*background:transparent!important[^}]*box-shadow:none!important/);
assert.match(main,/params\.leftMargin = 0;[\s\S]*params\.rightMargin = 0;/);
assert.match(exporter,/Intent\.ACTION_CREATE_DOCUMENT/);assert.match(exporter,/@ActivityCallback[\s\S]*saveJsonResult/);
assert.match(exporter,/output\.write\(data\.getBytes\(StandardCharsets\.UTF_8\)\)/);
assert.match(app,/Choose where to save the backup/);assert.match(app,/バックアップファイルを保存しました/);assert.match(app,/백업 파일을 저장했어요/);
console.log("PASS dev233: tablet layout roots and Android backup save picker");
