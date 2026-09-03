import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {HOUSE_FURNITURE_GRID,furnitureFootprint} from "../furniture-layout.js";

const read=path=>readFile(new URL(path,import.meta.url),"utf8");
const [auth,views,app,css,appCss,simulation,mood,worker,gradle]=await Promise.all([
  "../auth.js","../views.js","../app.js","../character-book.css","../app.css","../simulation.js","../character-mood.js","../sw.js","../android/app/build.gradle"
].map(read));

assert.deepEqual(HOUSE_FURNITURE_GRID,{columns:12,rows:24},"portrait furniture placement uses a denser vertical grid");
assert.deepEqual(furnitureFootprint("커플 침대"),{columns:3,rows:4},"couple bed has a visibly larger footprint");
assert.match(views,/const bedCharacterScale=\.68/,"bed placement scale does not enlarge sleepers");
assert.ok(views.includes("quietBedSleep")&&views.includes('sleeping&&!quietBedSleep'),"couple-bed sleepers hide labels and sleep marks");
assert.ok(appCss.includes("scale(1.05)")&&appCss.includes("--couple-bed-character-scale,.68"),"bed layers and fixed sleeper scale stay aligned");

assert.ok(auth.includes("SYNC_MANIFEST_VERSION=1")&&auth.includes("canUseDelta")&&auth.includes("syncRevision"),"sync supports revision-based delta saves");
assert.ok(auth.includes("oldRecord.hash!==record.hash")&&auth.includes("oldRecord.days[key].hash!==record.days[key].hash"),"unchanged character and day documents are skipped");
assert.ok(auth.includes("previousManifest.characters")&&auth.includes("deleteDoc(cloudDayDoc"),"manifest deletes removed sharded documents without collection scans");

assert.ok(simulation.includes("isProtectedSoloActivity(baseSceneFrom(otherEvent))")&&simulation.includes("!isProtectedSoloActivity(soloBase)"),"research and other protected solo work cannot be reused as someone else's conversation");
assert.ok(!mood.includes("오늘의 생활 리듬이 평소보다 무거움")&&mood.includes("오늘은 쉽게 지치고 평소보다 행동 속도가 느려짐"),"mood variation uses a concrete bodily and behavioral description");

assert.ok(views.includes('character-book-v8-book')&&views.includes('book-right-page.png'),"full settings renders the supplied original book asset separately from wood");
assert.ok(css.includes(".character-book-v8-book")&&css.includes("left:1.5%")&&css.includes("width:97%"),"the book spine has visible side room and preserves its aspect ratio");
assert.ok(!views.slice(views.indexOf("const bodyAccessibilityPane"),views.indexOf("const bodyPane")).includes("cognitiveAccessDialog(c)"),"cognitive traits no longer overlap body page 6");
const emotionPane=views.slice(views.indexOf("const personalityEmotionPane"),views.indexOf("const personalityBookPane"));
assert.ok(emotionPane.includes('bookField("감정 표현의 크기"')&&emotionPane.includes('bookField("충동을 참는 정도"')&&emotionPane.includes("cognitiveAccessDialog(c)"),"pages 9 and 10 are merged with cognitive traits below");
assert.ok(views.includes("bookPageControls(10")&&views.includes("bookPageControls(11"),"taste and closet pages are renumbered after the merge");
assert.ok(views.includes('bookListSummary(c.interests||[],"관심사")'),"page 10 summary names the selected category and values");
assert.ok(css.includes("grid-template-columns:repeat(3,minmax(0,1fr))")&&css.includes("background:#6a4b3c"),"multi-select and taste controls use three columns and Drawer Village brown");
assert.ok(app.includes("data-furniture-search")&&app.includes("data-furniture-search-label"),"the furniture bottom sheet has localized search filtering");
assert.ok(app.includes("furniture-picker-couple-bed")&&app.includes("couple-bed-quilt.png")&&app.includes("couple-bed-footboard.png"),"the couple bed uses its layered illustration in the furniture picker");
assert.ok(appCss.includes("inset:auto 0 0!important")&&appCss.includes("grid-template-columns:repeat(3,minmax(0,1fr))"),"the mobile furniture catalog opens from the bottom in a three-column grid");
assert.ok(worker.includes("drawer-village-v20260903-food-image-dev-208"),"release 206 uses an isolated offline cache");
assert.match(gradle,/versionCode\s+208/);
assert.match(gradle,/versionName\s+"1\.0\.193"/);

console.log("v1.0.193 / 208 delta sync, shared scenes, beds, character book, and food image checks passed");
