import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {characterMood} from "../character-mood.js";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const app=read("app.js"),views=read("views.js"),state=read("state.js"),book=read("character-book.css"),town=read("town-fit.css"),sw=read("sw.js"),gradle=read("android/app/build.gradle"),shapes=read("world-assets/building-shapes.csv");

assert.match(gradle,/versionCode\s+188/);
assert.match(gradle,/versionName\s+["']1\.0\.175["']/);
assert.match(sw,/drawer-village-v20260901-wardrobe-188/);
assert.match(views,/closet-book-frame/);
assert.match(views,/data-closet-search/);
assert.match(views,/closet-book-add/);
assert.match(book,/framed three-column catalogue/);
assert.match(book,/aspect-ratio:3\/5/);
assert.ok(!app.includes('<label>분류${select("category"'),"옷 등록창에서 분류를 다시 노출하면 안 됩니다.");
assert.match(app,/"유혹적임"/);
for(const field of ["colors","materials","flairs"])assert.match(app,new RegExp(`data-open-clothing-picker=\\"\\$\\{field\\}`));

assert.match(state,/normalizeDressCode/);
assert.match(views,/buildingDressCodeControls/);
assert.match(app,/routineDressCodeFields/);
assert.match(views,/dress\.requiredUniform/);
assert.match(views,/townActionPresentation/);
assert.ok(!views.includes('scene.transit?"➜":"•"'),"마을 행동 표시에 검은 점을 쓰면 안 됩니다.");
assert.ok(!town.includes("drop-shadow(0 18px 13px"),"마을 건물 뒤 그림자를 되살리면 안 됩니다.");
assert.ok(!shapes.includes("drawer-home"),"조악한 예전 기본 집을 건물 선택지에 남기면 안 됩니다.");

const world={uiLanguage:"ko",homes:{home:{id:"home",townId:"town",cleanliness:90,beautyLevel:"아름다움"}},towns:[],relationships:{},routines:{},monthlyRoutines:{},catalog:{fashion:[]},characters:{},world:{id:"town",name:"테스트 마을",reputation:"평판 정보 없음",places:[]}};
const restrained={id:"cro",townId:"town",homeId:"home",inventory:{fashion:[]},personalityTypes:["과묵함"],characterTraits:["냉정함"],interests:[],hobbies:[],emotionalExpression:"감정을 잘 드러내지 않음"};
const restrainedGood=characterMood(restrained,{title:"칭찬과 선물을 받고 즐겁게 웃는 중",desc:"성공했어요.",date:"2026-09-01",home:true,visitHomeId:"home"},world);
assert.notEqual(restrainedGood.label,"들뜸","감정 표현이 절제된 캐릭터를 들뜸으로 고정하면 안 됩니다.");
assert.ok(restrainedGood.reasons.length>=2,"기분에는 행동과 생활 맥락의 복수 이유가 필요합니다.");

console.log("v1.0.175 / 188 옷장·드레스코드·기분·마을 행동 검증 완료");
