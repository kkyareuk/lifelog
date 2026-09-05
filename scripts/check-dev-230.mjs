import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const storage=new Map();
globalThis.localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,String(value)),removeItem:key=>storage.delete(key)};
globalThis.window={DRAWER_VILLAGE_NATIVE:false,addEventListener(){},dispatchEvent(){}};
globalThis.document={querySelector:()=>null,addEventListener(){},activeElement:null,visibilityState:"visible"};

const read=file=>readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const stateSource=read("state.js"),simulationSource=read("simulation.js"),views=read("views.js"),app=read("app.js");
const css=read("app.css"),bookCss=read("character-book.css"),dictionaryCss=read("dictionary.css"),activity=read("android/app/src/main/java/com/drawervillage/app/MainActivity.java");
const gradle=read("android/app/build.gradle"),index=read("index.html"),prepareApp=read("scripts/prepare-app.mjs");

assert.match(gradle,/versionCode\s+230/);assert.match(gradle,/versionName\s+"1\.0\.213"/);
assert.match(index,/app\.css\?v=20260906dev230/);assert.match(prepareApp,/DRAWER_VILLAGE_NATIVE_BUILD="20260906dev230"/);
assert.match(stateSource,/export function directCharacterActivity/);
assert.match(simulationSource,/const directed=manualDirectiveEventFor\(c,date\);if\(directed\)return commitLiveEntry/);
assert.match(app,/data-direct-activity/);assert.match(views,/data-character-command/);
assert.match(stateSource,/export function recordAutomaticRelationshipMoment/);
assert.match(simulationSource,/recordAutomaticRelationshipMoment\(\[c\.id/);
assert.match(stateSource,/autoDeveloped:true,autoManagedStage:true/);
assert.match(bookCss,/character-editor-tablet-portrait-full/);
assert.match(bookCss,/760px\)!important/);
assert.match(dictionaryCss,/1600px/);
assert.match(css,/tablet-observe-world button\.town-decoration/);
assert.match(css,/tablet-observe-world \.place-person-face :is\(\.avatar,\.sprite\)/);
assert.match(css,/relationship-list-dialog>form\{width:calc\(100% - 48px\)!important;max-width:1600px/);
assert.match(activity,/WindowCompat\.setDecorFitsSystemWindows\(getWindow\(\), false\)/);
assert.match(activity,/WindowInsetsCompat\.Type\.navigationBars\(\)/);

const game=await import("../state.js?v=20260906dev230");
const simulation=await import("../simulation.js?v=20260906dev230");
game.resetAll();
const first=game.createCharacter(),second=game.createCharacter();
Object.assign(game.state.characters[first],{name:"잠든 캐릭터",wake:"23:50",sleep:"00:10"});
assert.equal(game.directCharacterActivity(first,"meal"),true);
const directed=simulation.eventFor(game.state.characters[first],new Date());
assert.equal(directed.manualDirective,true,"지시한 활동이 수면보다 우선하는 현재 장면이 된다");
assert.equal(directed.room,"kitchen","선택한 활동에 맞는 방으로 이동한다");
for(let index=1;index<=4;index++)assert.equal(game.recordAutomaticRelationshipMoment([first,second],`test-moment-${index}`),true);
assert.equal(game.recordAutomaticRelationshipMoment([first,second],"test-moment-4"),false,"같은 상호작용은 중복 성장하지 않는다");
const automatic=Object.values(game.state.relationships).find(item=>item.autoDeveloped);
assert.ok(automatic&&automatic.type==="친구"&&automatic.stage==="아는 사이","반복된 실제 교류가 자동 친구 관계를 만든다");

console.log("PASS 230: direct wake/activity commands, automatic relationship growth, Android insets, and tablet layouts are wired to the release build");
