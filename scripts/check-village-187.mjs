import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {characterMood} from "../character-mood.js";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const app=read("app.js"),views=read("views.js"),simulation=read("simulation.js"),state=read("state.js"),profile=read("town-profile.js"),css=read("character-book.css"),sw=read("sw.js"),gradle=read("android/app/build.gradle");

assert.match(gradle,/versionCode\s+187/);
assert.match(gradle,/versionName\s+["']1\.0\.174["']/);
assert.match(sw,/drawer-village-v20260901-closet-187/);
assert.ok(!views.includes("data-character-scene-images"),"별도 상태 그림 메뉴가 다시 노출되면 안 됩니다.");
assert.match(views,/data-character-pane="closet"/);
assert.match(views,/SMART WARDROBE/);
assert.match(app,/\$\$\("\[data-new-clothing\]"\)\.forEach/);
for(const field of ["iconImage","ldImage","occasionTags","moodTags","warmth","formality","comfort","requiredUniform"])assert.ok(app.includes(field),`${field} 옷장 필드가 필요합니다.`);
assert.match(views,/wardrobeSceneArt\(c,entry,"ldImage"\)/);
assert.match(views,/wardrobeSceneArt\(c,entry,"iconImage"\)/);
assert.match(css,/\.closet-book-grid/);

assert.match(simulation,/20260901-closet-log-187/);
assert.match(simulation,/everyoneActuallyHere/);
assert.match(simulation,/sameLiveLocation\(current,live\)/);
assert.match(simulation,/clarifyLegacyPromiseConflicts/);
assert.match(simulation,/저녁 약속의 예산을 조정하는 중/);
assert.match(simulation,/늦어도 두 시간 전에 알리고/);
assert.match(simulation,/perspectiveDesc/);
assert.match(simulation,/incomingCommittedSharedSceneFor/);

assert.match(profile,/export const TOWN_FAME_LEVELS/);
assert.deepEqual([...profile.matchAll(/export const TOWN_REPUTATIONS=\[([\s\S]*?)\];/g)][0][1].includes("유명"),false,"평판 선택지에 인지도를 섞으면 안 됩니다.");
assert.match(state,/reputation:"평판 정보 없음",fameLevel:"거의 알려지지 않음"/);

const neutralWorld={uiLanguage:"ko",homes:{},towns:[],world:{id:"town",name:"테스트 마을",reputation:"평판 정보 없음"}};
const character={id:"tester",townId:"town",personalityTypes:[],characterTraits:[],interests:[],hobbies:[]};
assert.equal(characterMood(character,{title:"상대와 크게 다투고 화가 난 중",desc:"갈등 끝에 언성이 높아졌어요."},neutralWorld).tone,"angry");
assert.equal(characterMood(character,{title:"밤샘 뒤 피곤해서 졸린 중",desc:"야근으로 지쳤어요."},neutralWorld).tone,"tired");
assert.ok(["good","excited"].includes(characterMood(character,{title:"좋은 선물을 받고 즐겁게 웃는 중",desc:"칭찬도 받았어요."},neutralWorld).tone));

const pngSize=file=>{const buffer=fs.readFileSync(path.join(root,file));assert.equal(buffer.toString("ascii",1,4),"PNG");return [buffer.readUInt32BE(16),buffer.readUInt32BE(20)]};
for(const name of ["cafe","hospital","piano-hall","park","red-roof-home"]){
  const art=`world-assets/building-types/${name}-handdrawn.png`,light=`world-assets/building-types/${name}-light.png`;
  assert.deepEqual(pngSize(art),pngSize(light),`${name}의 건물과 불빛 레이어 크기가 같아야 합니다.`);
  assert.equal(pngSize(art)[0],640,`${name}의 정리된 기준 폭은 640px이어야 합니다.`);
}

console.log("v1.0.174 / 187 옷장·기분·공동 로그·건물 에셋 검증 완료");
