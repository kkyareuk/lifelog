import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=file=>readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const simulation=read("simulation.js"),views=read("views.js"),css=read("app.css"),gradle=read("android/app/build.gradle");

assert.match(simulation,/town-decoration-use`\)%3!==0/);
assert.match(simulation,/movementKind:"decoration-visit"/);
assert.match(simulation,/movementKind:"village-walk"/);
assert.match(views,/const decorationGroups=new Map\(\)/);
assert.match(views,/Math\.floor\(decorationIndex\/6\)/);
assert.match(views,/decorationRadius=decoration\?16\+decorationRing\*12:0/);
assert.match(views,/const villageRoutes=\[/);
assert.match(views,/routePoints=route\.map/);
assert.match(views,/movementClass=conversation\?"is-conversation":decoration\?"is-decoration-visit":villageWalk\?"is-village-walk"/);
assert.match(css,/\.town-traveler\.is-decoration-visit\{animation:none\}/);
assert.match(css,/@keyframes town-traveler-village-route/);
for(const index of [0,1,2,3,4,5])assert.match(css,new RegExp(`--route-[xy]${index}`));

const points=Array.from({length:12},(_,index)=>{
  const ring=Math.floor(index/6),angle=(index%6)*Math.PI/3+(ring%2?Math.PI/6:0),radius=16+ring*12;
  return [50+Math.cos(angle)*radius,50+Math.sin(angle)*radius*.45];
});
assert.equal(new Set(points.map(([x,y])=>`${x.toFixed(3)},${y.toFixed(3)}`)).size,12,"장식 방문자 12명의 위치가 중복되지 않는다");
assert.ok(Number(gradle.match(/versionCode\s+(\d+)/)?.[1]||0)>=218);
assert.ok(Number(gradle.match(/versionName\s+"1\.0\.(\d+)"/)?.[1]||0)>=203);
console.log("PASS town walking: decoration crowd spacing and whole-village walking routes");
