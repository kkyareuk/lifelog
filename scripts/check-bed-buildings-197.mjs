import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFile} from "node:fs/promises";

const sourceUrl=path=>new URL(`../${path}`,import.meta.url);
const text=path=>readFile(sourceUrl(path),"utf8");
const [views,css,townCss,catalog,app,sw,gradle,mood,state,simulation]=await Promise.all([
  text("views.js"),text("app.css"),text("town-fit.css"),text("world-assets/building-shapes.csv"),
  text("app.js"),text("sw.js"),text("android/app/build.gradle"),text("character-mood.js"),text("state.js"),text("simulation.js")
]);

const buildingNames=[
  "cafe","hospital","piano-hall","dress-shop","stadium","office",
  "graduation-school","suitcase-hotel","clock-school","library",
  "generic-building","red-roof-home","park"
];
const importedPairs={
  cafe:{size:{width:799,height:818},base:"2B9DD7023CD792400C0E86DE5290435525E042123D0589AB16C618B61C1CB4CC",light:"BF66B6AADA8952C6C80423CA325FC6BE5F77BBECB24303EAD1EBF663B7EA063A"},
  hospital:{size:{width:765,height:764},base:"0A2ECAF5C7F0BE83E7F0DC9AC8E8337676AEB2272314E3C5ABB52FA7B22A77FF",light:"E3A3888245F38A9F5E77F3CB0121FA0E7752203C617ADD98E2D4F5396EE7D685"},
  "piano-hall":{size:{width:720,height:770},base:"D6F7A5CD22BE398B8FDCA708669393B11ED04731D11271798E2EAE49AABE99AF",light:"7320E67C7D94CA52EF5B048E0999C9810099F901B8A7FDE246E46CFDD1857669"},
  office:{size:{width:786,height:798},base:"58B29C4F709E9A20227DDEA5FD0E44F8520BD28D1B24F8714B7BDA5C278FE0AC",light:"928290AC5D3EE4981CD72801F2A95C3FB6555F7D4692D01AEC5C93017A5D2C4D"},
  park:{size:{width:804,height:668},base:"58615741967AB22F821E72FE8F0D5F25FE752B30C708CFBF453959926EC0A528",light:"0CB67A657B8D8089E67535B542B3D2E28F02329CF0E1BA6BCE60BEB046080F66"},
  "red-roof-home":{size:{width:904,height:765},base:"8904E0C1CBCAFAC3F3AA3C7CA35B3477FC99D315E54E2D3E988F08CE6D25D901",light:"A0AB90D16E89E56820129CAF9ADF1E2F4630C619A348E949ECDAA2919554B5D3"}
};

const pngInfo=async path=>{
  const bytes=await readFile(sourceUrl(path));
  assert.equal(bytes.subarray(1,4).toString(),"PNG",`${path} is a PNG`);
  assert.equal(bytes[25],6,`${path} keeps RGBA pixels, including intentional white artwork`);
  return {
    width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20),
    sha:createHash("sha256").update(bytes).digest("hex").toUpperCase()
  };
};

for(const name of buildingNames){
  const path=`world-assets/building-types/${name}-handdrawn.png`;
  const {width,height}=await pngInfo(path);
  assert.ok(width>=600&&height>=500,`${name} keeps a useful, undistorted source canvas`);
  assert.ok(catalog.includes(path),`${name} is registered in the building catalog`);
  assert.ok(app.includes(path),`${name} remains available when the CSV cannot load`);
  assert.ok(views.includes(path),`${name} can render after selection`);
  assert.ok(sw.includes(path),`${name} is available offline`);
}
for(const [name,expected] of Object.entries(importedPairs)){
  const basePath=`world-assets/building-types/${name}-handdrawn.png`;
  const lightPath=`world-assets/building-types/${name}-light.png`;
  const base=await pngInfo(basePath),light=await pngInfo(lightPath);
  assert.deepEqual({width:base.width,height:base.height},expected.size,`${name} base uses the supplied transparent canvas without recropping`);
  assert.deepEqual({width:light.width,height:light.height},expected.size,`${name} light aligns to its supplied base canvas`);
  assert.equal(base.sha,expected.base,`${name} base bytes are unchanged from the supplied file`);
  assert.equal(light.sha,expected.light,`${name} light bytes are unchanged from the supplied file`);
  assert.ok(views.includes(lightPath),`${name} lighting is mapped explicitly`);
  assert.ok(sw.includes(lightPath),`${name} lighting is available offline`);
}
for(const layer of ["base","quilt","footboard"]){
  const path=`assets/furniture/couple-bed/couple-bed-${layer}.png`;
  const {width,height}=await pngInfo(path);
  assert.deepEqual({width,height},{width:640,height:684},`couple bed ${layer} shares one aligned canvas`);
  assert.ok(sw.includes(path),`couple bed ${layer} is available offline`);
}

assert.ok(views.includes('bedState==="under-cover"?coupleBedImage("quilt")')&&views.includes('coupleBedImage("footboard")'),"sleeping characters are between the quilt and bed base while the footboard stays in front");
assert.ok(views.includes('bedState!=="under-cover"?coupleBedImage("quilt")')&&views.includes('bedState==="default"?coupleBedImage("footboard")'),"free and edited beds keep all three layers in one movable furniture group");
assert.ok(views.includes('["on-bed","under-cover"].includes(bedStates.get(placement.id))'),"occupied beds move only the necessary front layers above the character layer");
assert.ok(views.indexOf("roomFurnitureMarkup(id,key,room,edit,bedStates)")<views.indexOf('class="room-people')&&views.indexOf('class="room-people')<views.indexOf("roomFurnitureOverlayMarkup(room,bedStates)"),"room markup crosses the character layer only for active bed overlays");
assert.ok(views.includes('characterPlacement(a,state.relationships)')&&views.includes('nativeVisualSeed(`${sceneSeed}:${a.id}`)'),"couple bed slots follow character side preferences and deterministically break equal preferences");
assert.ok(views.includes("const COUPLE_BED_ART_SCALE=1.3")&&views.includes("bedVisualScale=bedPlacementScale*COUPLE_BED_ART_SCALE"),"bed pillow slots scale with the enlarged three-layer bed");
assert.ok(views.includes("anchorX=isBedPose?Number(options.bedPlacement?.x):Number(agent?.x)"),"active bed users are anchored to the bed instead of a stale walking target");
assert.ok(views.includes("--couple-bed-character-scale")&&views.includes("--couple-bed-character-rotation"),"bed users receive proportional size and rotation variables");
assert.ok(css.includes("scale(1.3)")&&css.includes("scale(calc(var(--furniture-scale) * 1.3))"),"base and overlay bed layers use the same larger scale");
assert.ok(css.includes("scale:var(--couple-bed-character-scale,1.08)"),"character artwork scales with the assigned bed");
assert.ok(!townCss.includes("mix-blend-mode:plus-lighter")&&townCss.includes(".building-light-core{filter:brightness(1.3) drop-shadow(0 0 2px #ffe4a3)}")&&townCss.includes(".building-light-halo{filter:blur(4px) brightness(1.7);mix-blend-mode:screen}"),"building lights use the original restrained core and halo compositing");

assert.ok(!views.includes("statistics-back-button"),"statistics removes the duplicate floating back button from its scroll content");
assert.ok(css.includes('html.native-app[data-active-tab="statistics"] #app>main')&&css.includes("overflow-y:auto!important"),"only the statistics content area scrolls");
assert.ok(css.includes('html.native-app[data-active-tab="statistics"] #app>.native-sub-header')&&css.includes('url("./assets/home-ui/wood-top.png")'),"statistics keeps one opaque illustrated top bar outside the scroll area");
assert.ok(css.includes('url("./assets/home-ui/pill-left.png"),url("./assets/home-ui/pill-right.png"),url("./assets/home-ui/pill-middle.png")'),"statistics controls use the supplied three-slice button artwork");
assert.ok(css.includes("background-size:auto 100%,auto 100%,auto 100%")&&css.includes("object-fit:contain")||css.includes("background-size:auto 100%,auto 100%,auto 100%"),"statistics artwork preserves its aspect ratio");

assert.ok(css.includes(".town-action-idle")&&css.includes("@keyframes town-action-idle")&&css.includes(".town-action-shop")&&css.includes("@keyframes town-action-shop"),"stationary town actions keep a visible idle animation");
assert.ok(mood.includes("sourceEntry")&&mood.includes("eventReason=kind")&&!mood.includes("'불편하거나 화나는 사건'"),"mood reasons name the actual linked activity instead of a generic upsetting event");
assert.ok(app.includes("mood-source-log")&&app.includes("연결된 행동 로그"),"mood dialog shows its source activity log");
assert.ok(views.includes('bookField("액세서리 착용","accessoryUse"')&&state.includes('c.accessoryUse=["착용하지 않음","착용함"]'),"page 7 stores the simple accessory on/off choice");
assert.ok(app.includes("respectAccessoryUse")&&simulation.includes('c.accessoryUse==="착용함"'),"outfits and life scenes respect the accessory choice");
assert.match(gradle,/versionCode\s+(?:20[0-3])/);
assert.match(gradle,/versionName\s+"1\.0\.(?:187(?:\.1)?|188|189)"/);
assert.ok(/drawer-village-v20260902-(?:bed-buildings-statistics-200|buttons-love-hotfix-201|relationship-emotion-202|language-scene-203)/.test(sw),"service worker cache is separated for build 200+");

console.log("v1.0.189 / 203 bed, supplied buildings, restrained lights, and fixed statistics layout checks passed");
