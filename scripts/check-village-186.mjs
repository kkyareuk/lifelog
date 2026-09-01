import assert from "node:assert/strict";
import fs from "node:fs";
import {mergeDeviceAndCloudState,mergeCloudRestoreState} from "../sync-merge.js";
import {sceneImageFor,sceneImageVariantKey} from "../character-scene-image.js";

const place=(id,townId="")=>({id,name:id,type:"카페",townId});
const town=(id,places=[])=>({id,name:id,places});
const device={lastSaved:10,activeTownId:"a",towns:[town("a",[place("cafe","a")]),town("b",[place("hospital","b")])],world:{...town("a",[place("cafe","a"),place("world-ghost","a")])},characters:{},homes:{}};
const contaminated={lastSaved:20,activeTownId:"b",towns:[town("a",[place("cafe")]),town("b",[place("hospital"),place("cafe")])],world:town("b",[place("hospital"),place("cafe")]),characters:{},homes:{}};
for(const merge of [mergeDeviceAndCloudState,mergeCloudRestoreState]){
  const result=merge(device,contaminated);
  const owners=result.towns.filter(item=>item.places.some(item=>item.id==="cafe")).map(item=>item.id);
  assert.deepEqual(owners,["a"],"a duplicated building is recovered into exactly one original town");
  assert.equal(result.towns.find(item=>item.id==="a").places.find(item=>item.id==="cafe").townId,"a");
  assert.equal(result.towns.some(item=>item.places.some(place=>place.id==="world-ghost")),false,"the active world mirror is not treated as an authoritative building source");
}

const character={icon:"base-sd.png",ldImage:"base-ld.png",sceneImageVariants:{sleep:{icon:"sleep-sd.png",ldImage:"sleep-ld.png"},work:{icon:"work-sd.png"}}};
assert.equal(sceneImageVariantKey({title:"욕실에서 샤워하는 중"}),"bath");
assert.equal(sceneImageVariantKey({title:"회사에서 근무 중",work:true}),"work");
assert.equal(sceneImageFor(character,{title:"자는 중"},"icon").src,"sleep-sd.png");
assert.equal(sceneImageFor(character,{title:"자는 중"},"ldImage").src,"sleep-ld.png");
assert.equal(sceneImageFor(character,{title:"회사에서 근무 중",work:true},"ldImage").src,"base-ld.png","missing variants fall back to the base image");

const root=new URL("../",import.meta.url),read=file=>fs.readFileSync(new URL(file,root),"utf8");
const views=read("views.js"),app=read("app.js"),state=read("state.js"),auth=read("auth.js"),book=read("character-book.css"),gradle=read("android/app/build.gradle");
assert.match(views,/overview-animation-placement[\s\S]*data-character-placement-open/);
assert.match(views,/data-character-scene-images/);
assert.match(app,/data-add-town-home/);
assert.match(app,/sceneVariantIcon/);
assert.match(state,/createTownHome/);
assert.match(state,/sceneImageVariants=normalizeSceneImageVariants/);
assert.match(auth,/authSettled/);
assert.match(book,/character-scene-image-opener/);
assert.match(gradle,/versionCode 186/);assert.match(gradle,/versionName "1\.0\.173"/);
for(const file of ["piano-hall-handdrawn.png","piano-hall-light.png","park-handdrawn.png","park-light.png","red-roof-home-handdrawn.png","red-roof-home-light.png"]){
  assert(fs.statSync(new URL(`world-assets/building-types/${file}`,root)).size>1000,`${file} is a non-empty owner artwork asset`);
}
console.log("PASS 186: account gate, town ownership repair, scene image fallback, character placement entry, town home creation, owner building and light assets");
