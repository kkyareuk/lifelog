import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=file=>readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const app=read("app.js"),views=read("views.js"),state=read("state.js");
const css=read("app.css"),bookCss=read("character-book.css"),audio=read("audio.js");
const native=read("native-app.js"),gradle=read("android/app/build.gradle");

assert.match(gradle,/versionCode\s+22[01]/);
assert.match(gradle,/versionName\s+"1\.0\.204\.[12]"/);

const corrected221=/versionCode\s+221/.test(gradle);
if(corrected221){
  assert.match(app,/if\(tab==="character"\)state\.characterSettingsView="hub"/);
  assert.match(app,/if\(startupTab==="character"\)state\.characterSettingsView="hub"/);
  assert.match(app,/\[data-close-full-character-settings\]/);
  assert.match(state,/state\.activeTab="character";state\.characterSettingsView="hub"/);
  assert.match(views,/class="character-book-v8-back" data-close-full-character-settings/);
}else{
  assert.match(app,/if\(tab==="character"\)state\.characterSettingsView="full"/);
  assert.match(app,/if\(startupTab==="character"\)state\.characterSettingsView="full"/);
  assert.doesNotMatch(app,/\[data-close-full-character-settings\]/);
  assert.match(state,/state\.activeTab="character";state\.characterSettingsView="full"/);
  assert.match(views,/class="character-book-v8-back" data-tab="observe"/);
}
assert.match(views,/character-editor-tablet-full/);
if(corrected221)assert.match(views,/character-full-only-shell">\$\{fullBook\}<\/section>/);
else assert.match(views,/character-full-only-shell">\$\{fullBook\}\$\{quickSettings\}/);
assert.match(views,/data-open-quick-character-settings/);
assert.match(bookCss,/tablet-character-book \.character-book-v8-back\{display:block!important\}/);

assert.match(css,/character-quick-settings-dialog :is\([^}]+font-family:var\(--ui-font\)!important/);
assert.doesNotMatch(css,/character-quick-(?:fields|icon|actions)[^\n]+KoPubWorldBatangPro/);

assert.match(css,/@supports \(offset-path:polygon/);
assert.match(css,/town-traveler-village-route-composited/);
assert.doesNotMatch(audio,/getBoundingClientRect\(\)/);
assert.doesNotMatch(audio,/getComputedStyle\(element\)/);

assert.match(native,/window\.DrawerVillageNavigation\?\.back\?\.\(\)/);
for(const marker of ["character-draft-back","relationship-back-button","routine-back-button","town-native-back","drawer-shop-back"]){
  const line=views.split("\n").find(value=>value.includes(marker));
  assert.ok(line?.includes('data-tab="observe"'),`${marker} must use shared back navigation`);
}

console.log(corrected221?"PASS 220 baseline under 221: back navigation, stable quick-settings font, and composited town walking":"PASS 220: character back navigation, direct full settings, stable quick-settings font, and composited town walking");
