import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=file=>readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const app=read("app.js"),auth=read("auth.js"),views=read("views.js"),css=read("interface-system.css");
const gradle=read("android/app/build.gradle");

assert.match(gradle,/versionCode\s+223/);
assert.match(gradle,/versionName\s+"1\.0\.206"/);

assert.match(views,/item\?\.kind==="drink"&&\["idle","eating","tea","coffee-drinking"\]\.includes\(actionKind\)/);
assert.match(views,/action-prop-\$\{propActionKind\}/);
assert.match(css,/\.action-prop-tea[\s\S]+animation:native-prop-coffee-sip 2\.25s ease-in-out infinite!important/);
assert.match(css,/\.action-prop-eating[\s\S]+animation:native-prop-eat 1\.7s ease-in-out infinite!important/);

assert.match(app,/function refreshCharacterSelectionSummaries\(root=document\)/);
assert.match(app,/const path=button\.dataset\.bookListPath\|\|button\.dataset\.openBookList/);
assert.match(app,/dialog\.onclose=\(\)=>\{[^\n]+refreshCharacterSelectionSummaries\(\)/);
assert.match(app,/document\.querySelectorAll\("\[data-book-list-choice\]"\)/);
assert.doesNotMatch(app,/data-book-list-path="\$\{CSS\.escape\(path\)\}/);

assert.match(auth,/rememberGuestHandoffIntent\(\)/);
assert.match(auth,/guestHandoff&&!targetHadSnapshot&&characterCount\(window\.ParallelCity\.getState\(\)\)===0/);
assert.match(auth,/download\(\{automatic:true,accountTransition:true,detailed:true\}\)/);
assert.match(auth,/upload\(\{silent:true,accountTransition:true\}\)/);

console.log("PASS 223: props animate, selection summaries refresh, and explicit first login preserves guest characters");
