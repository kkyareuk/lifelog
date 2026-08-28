import assert from "node:assert/strict";
import {access,readFile,readdir} from "node:fs/promises";

const read=name=>readFile(new URL(`../${name}`,import.meta.url),"utf8");
const [surfaces,simulation,views,css,app]=await Promise.all([
  read("home-surfaces.js"),read("simulation.js"),read("views.js"),read("app.css"),read("app.js")
]);
const walls=["cream-panel.png","cream-plain.png","stone-panel.png","taupe-panel.png","sky-tile.png","navy-tile.png","amber-tile.png"];
const actual=(await readdir(new URL("../assets/home-walls/",import.meta.url))).filter(name=>name.endsWith(".png")).sort();
assert.deepEqual(actual,[...walls].sort(),"사용자가 보낸 벽지 7종만 남아야 합니다");
for(const name of walls)await access(new URL(`../assets/home-walls/${name}`,import.meta.url));
assert.doesNotMatch(surfaces,/drawer-cream-wall|home-surfaces\/.+wall/);
assert.match(surfaces,/HOME_WALL_KEYS/);
assert.match(surfaces,/Cream paneled wall/);
assert.match(surfaces,/クリームの腰壁/);

assert.match(simulation,/rawEnd===start\?start\+30/);
assert.match(simulation,/const sharedMinute=current\.routineId/);
assert.match(simulation,/if\(item\?\.withId===c\.id\)return null/);
assert.doesNotMatch(simulation,/반복되는 행동을 멈춰 달라고/);
assert.doesNotMatch(simulation,/사람 자체가 싫다고 몰아붙이지 않고/);
assert.match(simulation,/말을 세 번 끊지 말라고 따지는 중/);

assert.match(views,/game:\["PC 게임","콘솔 게임","모바일 게임","보드게임","기타"\]/);
assert.match(views,/"영화":\["드라마","로맨스"/);
assert.match(views,/"기타":\[\]/);
assert.match(app,/HOME_WALL_KEYS\.map/);

assert.match(css,/모바일·태블릿 앱 셸[\s\S]{0,100}@media\(max-width:1200px\)/);
assert.match(css,/@media\(min-width:721px\) and \(max-width:1200px\)/);
assert.match(css,/width:min\(100vw,480px\)/);
assert.match(css,/home-pet-roam var\(--pet-roam-duration,14s\) linear/);
console.log("사용자 벽지 · 일정 시각 · 사전 기타/드라마 · 자연 이동 · 태블릿 레이아웃 검증 완료");
