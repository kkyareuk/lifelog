import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const read=path=>readFile(new URL(path,import.meta.url),"utf8");
const [fonts,app,index,worker,gradle]=await Promise.all([
  read("../font-preferences.css"),
  read("../app.css"),
  read("../index.html"),
  read("../sw.js"),
  read("../android/app/build.gradle")
]);

assert.match(fonts,/:root\{[^}]*--home-ui-font:var\(--ui-font\)/);
assert.match(fonts,/data-ui-font="mplus-rounded"[^}]*ChangwonDangamRound[^}]*MPlusRounded1cLocal/);
assert.doesNotMatch(app,/--home-ui-font:\s*"KCCHanbit"/);
assert.match(app,/--home-ui-font:var\(--ui-font\)/);
assert.ok(index.includes("font-preferences.css?v=20260902font204"));
assert.ok(index.includes("app.css?v=20260902font204"));
assert.ok(/drawer-village-v20260902-(?:font-204|cognitive-205)/.test(worker));
assert.match(gradle,/versionCode\s+(?:204|205)/);
assert.match(gradle,/versionName\s+"1\.0\.(?:190|191)"/);

console.log("v1.0.190 / 204 메인 화면 사용자 글꼴 적용 검증 완료");
