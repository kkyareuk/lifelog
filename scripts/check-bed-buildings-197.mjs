import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const text=path=>readFile(new URL(`../${path}`,import.meta.url),"utf8");
const [views,css,catalog,app,sw,gradle]=await Promise.all([
  text("views.js"),text("app.css"),text("world-assets/building-shapes.csv"),
  text("app.js"),text("sw.js"),text("android/app/build.gradle")
]);

const buildingNames=[
  "cafe","hospital","piano-hall","dress-shop","stadium","office",
  "graduation-school","suitcase-hotel","clock-school","library",
  "generic-building","red-roof-home","park"
];
const lightNames=["cafe","hospital","piano-hall","office","red-roof-home","park"];
const pngHeader=async path=>{
  const bytes=await readFile(new URL(`../${path}`,import.meta.url));
  assert.equal(bytes.subarray(1,4).toString(),"PNG",`${path} is a PNG`);
  assert.equal(bytes[25],6,`${path} keeps RGBA pixels instead of converting white artwork to transparency`);
  return {width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)};
};

for(const name of buildingNames){
  const path=`world-assets/building-types/${name}-handdrawn.png`;
  const size=await pngHeader(path);
  assert.equal(size.width,640,`${name} has normalized map width`);
  assert.ok(size.height>=500&&size.height<=760,`${name} keeps its original aspect ratio`);
  assert.ok(catalog.includes(path),`${name} is registered in the building catalog`);
  assert.ok(app.includes(path),`${name} remains available when the CSV cannot load`);
  assert.ok(views.includes(path),`${name} can render after selection`);
  assert.ok(sw.includes(path),`${name} is available offline`);
}
for(const name of lightNames){
  const path=`world-assets/building-types/${name}-light.png`;
  await pngHeader(path);
  assert.ok(views.includes(path),`${name} lighting is mapped explicitly`);
  assert.ok(sw.includes(path),`${name} lighting is available offline`);
}
for(const layer of ["base","quilt","footboard"]){
  const path=`assets/furniture/couple-bed/couple-bed-${layer}.png`;
  const size=await pngHeader(path);
  assert.deepEqual(size,{width:640,height:684},`couple bed ${layer} shares one aligned canvas`);
  assert.ok(sw.includes(path),`couple bed ${layer} is available offline`);
}

assert.ok(views.includes('bedState==="under-cover"?coupleBedImage("quilt")')&&views.includes('coupleBedImage("footboard")'),"sleeping characters are between the quilt and bed base while the footboard stays in front");
assert.ok(views.indexOf("roomFurnitureMarkup(id,key,room,edit,bedStates)")<views.indexOf('class="room-people')&&views.indexOf('class="room-people')<views.indexOf("roomFurnitureOverlayMarkup(room,bedStates)"),"room markup crosses the character layer only for active bed overlays");
assert.ok(views.includes('characterPlacement(a,state.relationships)')&&views.includes('nativeVisualSeed(`${sceneSeed}:${a.id}`)'),"couple bed slots follow character side preferences and deterministically break equal preferences");
assert.ok(views.includes("bedRadians=bedRotation*Math.PI/180")&&views.includes("localBedY=bedSlot>=0?-7:0"),"pillow offsets rotate with the whole bed group");
assert.ok(css.includes(".room-furniture-overlay-layer")&&css.includes(".couple-bed-base")&&css.includes(".couple-bed-quilt")&&css.includes(".couple-bed-footboard"),"all three bed layers have explicit structural styling");
assert.match(gradle,/versionCode\s+197/);
assert.match(gradle,/versionName\s+"1\.0\.184"/);
assert.ok(sw.includes("drawer-village-v20260902-bed-buildings-197"),"service worker cache is separated for build 197");

console.log("v1.0.184 / 197 couple bed and building asset checks passed");
