import assert from "node:assert/strict";
import fs from "node:fs";
import {mergeImportedBackupState} from "../sync-merge.js";

const root=new URL("../",import.meta.url);
const read=file=>fs.readFileSync(new URL(file,root),"utf8");
const app=read("app.js"),state=read("state.js"),views=read("views.js"),simulation=read("simulation.js"),css=read("app.css"),prepareApp=read("scripts/prepare-app.mjs"),index=read("index.html");

const device={
  lastSaved:20,activeId:"device",activeHomeId:"device-home",characters:{device:{id:"device",name:"기기 인물"}},order:["device"],
  homes:{"device-home":{id:"device-home",name:"기기 집"}},deletedCharacterIds:["backup"],deletedHomeIds:["backup-home"]
};
const backup={
  lastSaved:10,activeId:"backup",activeHomeId:"backup-home",characters:{backup:{id:"backup",name:"백업 인물"}},order:["backup"],
  homes:{"backup-home":{id:"backup-home",name:"백업 집"}},deletedCharacterIds:[],deletedHomeIds:[]
};
const merged=mergeImportedBackupState(device,backup);
assert.deepEqual(new Set(merged.order),new Set(["device","backup"]));
assert.equal(merged.characters.backup.name,"백업 인물");
assert.equal(merged.homes["backup-home"].name,"백업 집");
assert.equal(merged.homeEditMode,false);

assert.match(app,/mergeImportedBackupState\(cloneState\(\),incoming\)/);
assert.match(app,/preserveSelectionScroll\(select\)/);
assert.match(app,/ROOM_LAYOUT_GRID=\{columns:12,rows:16/);
assert.ok(state.indexOf("localStorage.setItem(KEY,serialized)")<state.indexOf("state=prepared"),"영구 저장 전에 실행 상태가 교체됩니다");
const petFunction=views.slice(views.indexOf("function nativePetForScene"),views.indexOf("function nativeVisualSeed"));
assert.doesNotMatch(petFunction,/Object\.values\(state\.homes/);
assert.match(simulation,/normalizedName==="캣타워"&&!homePets\.some\(pet=>pet\.species==="고양이"\)/);
assert.match(css,/\.home\.is-editing \.rooms::before/);
assert.match(css,/background-size:calc\(100% \/ 12\) calc\(100% \/ 16\)/);
assert.match(prepareApp,/async function copyModuleClosure\(\)/);
assert.match(prepareApp,/relativeModuleImports\(sourceText\)/);
assert.match(index,/앱 화면을 열지 못했어요/);

console.log("PASS 백업 병합, 집별 반려동물, 알림 스크롤, 방 격자 회귀 검사를 통과했습니다");
