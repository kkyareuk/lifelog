import assert from "node:assert/strict";
import fs from "node:fs";

const read=path=>fs.readFileSync(new URL(`../${path}`,import.meta.url),"utf8");
const groups=read("groups.js");
const auth=read("auth.js");
const app=read("app.js");
const views=read("views.js");
const css=read("groups.css")+read("app.css");
const gradle=read("android/app/build.gradle");
const prepare=read("scripts/prepare-app.mjs");
const index=read("index.html");

assert.match(gradle,/versionCode\s+249\b/);
assert.match(gradle,/versionName\s+"1\.0\.225"/);
assert.ok(prepare.includes('DRAWER_VILLAGE_NATIVE_BUILD="20260906dev249"'));
assert.ok(index.includes("app.js?v=20260906dev249"));

assert.ok(groups.includes('title:"멀티"'));
assert.ok(groups.includes('title:"Multiplayer"'));
assert.ok(groups.includes('title:"マルチ"'));
assert.ok(groups.includes('name="townId"'));
assert.ok(groups.includes("data-group-open"));
assert.ok(groups.includes("data-group-list-back"));
assert.ok(groups.includes('myRole==="owner"'));
assert.ok(!groups.includes("data-group-add-town"));
assert.ok(css.includes(".multiplayer-building-shell"));
assert.ok(css.includes(".multiplayer-card-grid"));

assert.ok(auth.includes("async function createGroup({name,townId}={})"));
assert.ok(auth.includes("const town=ownedTownPayload(townId)"));
assert.ok(auth.includes("hostTownId:town.sourceTownId"));
assert.ok(auth.includes("towns:[town]"));
assert.ok(auth.includes("schemaVersion:2"));
assert.ok(auth.includes("linkTown:linkGroupTown"));
assert.ok(!auth.includes("addTown:addGroupTown"));

assert.ok(views.includes("data-open-multiplayer-switcher"));
assert.ok(views.includes("data-open-town-switcher"));
assert.ok(views.includes("town-native-town-pill"));
assert.ok(views.includes("data-multiplayer-select"));
assert.ok(views.includes("town-information-browser"));
assert.ok(app.includes("showMultiplayerList"));
assert.ok(app.includes("showMultiplayerDetail"));
assert.ok(app.includes("data-group-link-town"));
assert.ok(app.includes("data-multiplayer-select"));
assert.ok(css.includes(".town-native-community"));
assert.ok(css.includes(".town-native-town-pill::before"));

console.log("dev249 multiplayer town-link and navigation checks passed");
