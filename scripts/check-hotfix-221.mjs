import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=file=>readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const app=read("app.js"),views=read("views.js"),state=read("state.js");
const css=read("app.css"),gradle=read("android/app/build.gradle");

assert.match(gradle,/versionCode\s+221/);
assert.match(gradle,/versionName\s+"1\.0\.204\.2"/);

assert.match(state,/state\.activeTab="character";state\.characterSettingsView="hub"/);
assert.match(app,/setNavigationTabIntent\("character"\);state\.characterSettingsView="hub"/);
assert.match(app,/if\(tab==="character"\)state\.characterSettingsView="hub"/);
assert.match(app,/if\(startupTab==="character"\)state\.characterSettingsView="hub"/);
assert.match(app,/\[data-close-full-character-settings\][\s\S]+state\.characterSettingsView="hub"/);
assert.match(app,/state\.activeTab==="character"&&state\.characterSettingsView==="full"[\s\S]+state\.characterSettingsView="hub"/);

assert.match(views,/function nativeCharacterHub\(c\)/);
assert.match(views,/if\(nativeApp&&state\.characterSettingsView!=="full"\)return nativeCharacterHub\(c\)/);
assert.match(views,/character-editor-hub-only/);
assert.match(views,/mobile-character-dashboard/);
assert.match(views,/data-open-quick-character-settings/);
assert.match(views,/data-open-full-character-settings/);
assert.match(views,/data-character-dialog-origin="hub"/);
assert.match(views,/class="character-quick-header"/);
assert.match(views,/class="character-quick-back" data-close-mobile-character-editor/);
assert.match(views,/class="character-quick-save" data-save-mobile-character-editor/);
assert.match(views,/class="character-book-v8-back" data-close-full-character-settings/);

const fullNavigation=views.slice(views.indexOf("const fullNavigation="),views.indexOf("const cornerInk="));
assert.doesNotMatch(fullNavigation,/data-open-quick-character-settings/);
const nativeFull=views.slice(views.indexOf('if(state.characterSettingsView==="full")'),views.indexOf('return `<div class="editor character-editor"'));
assert.doesNotMatch(nativeFull,/\$\{quickSettings\}/);

assert.match(css,/\.character-quick-header\{[^}]*position:absolute/);
assert.match(css,/\.character-quick-fields\{[^}]*top:88px/);
assert.match(css,/character-quick-settings-dialog[^}]+font-family:var\(--ui-font\)!important/);
assert.doesNotMatch(css,/character-quick-(?:fields|icon|actions|header)[^\n]+KoPubWorldBatangPro/);

assert.match(views,/"캐릭터 화면으로 돌아가기":"Back to character screen"/);
assert.match(views,/"캐릭터 화면으로 돌아가기":"キャラクター画面に戻る"/);
assert.match(views,/"뒤로가기":"Back"/);
assert.match(views,/"뒤로가기":"戻る"/);

console.log("PASS 221: character hub first, separate quick/full settings, visible quick back/save, stable font, and full-to-hub navigation");
