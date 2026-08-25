import {access,readdir,readFile} from "node:fs/promises";

const root=new URL("../",import.meta.url);
const expected=["apricot-planks.png","natural-planks.png","cream-planks.png","charcoal-planks.png","walnut-planks.png"];
const actual=(await readdir(new URL("../assets/home-surfaces/",import.meta.url))).filter(name=>name.endsWith(".png")).sort();
if(actual.join("\n")!==[...expected].sort().join("\n"))throw new Error(`집 표면 재질은 다섯 개여야 합니다. 현재: ${actual.join(", ")}`);
for(const name of expected)await access(new URL(`../assets/home-surfaces/${name}`,import.meta.url));

const sources=await Promise.all(["app.js","views.js","state.js","home-surfaces.js","app.css"].map(async name=>[name,await readFile(new URL(`../${name}`,import.meta.url),"utf8")]));
const combined=sources.map(([,value])=>value).join("\n");
for(const removed of ["assets/home-floors","assets/home-furniture","furnitureSprite("]){
  if(combined.includes(removed))throw new Error(`제거한 AI 자산 참조가 남았습니다: ${removed}`);
}
for(const required of ["room-wall-shell","wallMaterial","home-ui-hidden .home-native-back","home.is-editing :is(.room-people,.room-pets,.home-life-roaming-layer)"]){
  if(!combined.includes(required))throw new Error(`집 재질/편집 UI 연결 누락: ${required}`);
}
console.log(`집 재질 ${expected.length}종 · 벽/편집 숨김/이모지 가구 검증 완료`);
