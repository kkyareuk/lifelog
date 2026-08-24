import {access,readdir,readFile} from "node:fs/promises";

const root=new URL("../",import.meta.url);
const expected=["apricot-planks.png","natural-planks.png","cream-planks.png","charcoal-planks.png","walnut-planks.png"];
const expectedWalls=["amber-tile.png","cream-panel.png","cream-plain.png","navy-tile.png","sky-tile.png","stone-panel.png","taupe-panel.png"];
const actual=(await readdir(new URL("../assets/home-surfaces/",import.meta.url))).filter(name=>name.endsWith(".png")).sort();
if(actual.join("\n")!==[...expected].sort().join("\n"))throw new Error(`집 표면 재질은 다섯 개여야 합니다. 현재: ${actual.join(", ")}`);
for(const name of expected)await access(new URL(`../assets/home-surfaces/${name}`,import.meta.url));
const actualWalls=(await readdir(new URL("../assets/home-walls/",import.meta.url))).filter(name=>name.endsWith(".png")).sort();
if(actualWalls.join("\n")!==expectedWalls.join("\n"))throw new Error(`사용자 벽지는 일곱 개여야 합니다. 현재: ${actualWalls.join(", ")}`);
for(const name of expectedWalls)await access(new URL(`../assets/home-walls/${name}`,import.meta.url));
await access(new URL("../artist-templates/home-v1.0.122/furniture-redraw-template-6x4.png",import.meta.url));
await access(new URL("../artist-templates/home-v1.0.122/furniture-redraw-reference-6x4.png",import.meta.url));

const sources=await Promise.all(["app.js","views.js","state.js","home-surfaces.js","app.css"].map(async name=>[name,await readFile(new URL(`../${name}`,import.meta.url),"utf8")]));
const combined=sources.map(([,value])=>value).join("\n");
for(const removed of ["assets/home-floors","assets/home-furniture","furnitureSprite("]){
  if(combined.includes(removed))throw new Error(`제거한 AI 자산 참조가 남았습니다: ${removed}`);
}
for(const required of ["room-wall-shell","wallMaterial","home-ui-hidden .home-native-back","home.is-editing :is(.room-people,.room-pets,.home-life-roaming-layer)"]){
  if(!combined.includes(required))throw new Error(`집 재질/편집 UI 연결 누락: ${required}`);
}
if(!combined.includes('"cream-panel":"./assets/home-walls/cream-panel.png"'))throw new Error("기본 사용자 벽지 연결이 누락되었습니다.");
if(combined.includes("drawer-cream-wall.png")||combined.includes("wall-redraw-reference.png"))throw new Error("제거한 AI 벽지 참조가 남았습니다.");
if(!combined.includes("border:2px solid #000"))throw new Error("방별 2px 검은 외곽선이 누락되었습니다.");
if(combined.includes("furniture-redraw-reference-6x4.png"))throw new Error("덧그리기용 가구 참고 그림을 앱 화면에 연결하면 안 됩니다.");
console.log(`집 바닥 ${expected.length}종 · 사용자 벽지 ${expectedWalls.length}종 · 편집 숨김/이모지 가구 검증 완료`);
