import fs from "node:fs";
import assert from "node:assert/strict";
import {normalizeTownProfile,townIllustrationsFor,transportBetween,canTravelBetween,TOWN_TYPES,TOWN_REPUTATIONS,TOWN_TERRAINS} from "../town-profile.js";

const read=file=>fs.readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const views=read("views.js"),app=read("app.js"),state=read("state.js"),simulation=read("simulation.js"),gradle=read("android/app/build.gradle");

assert(TOWN_TYPES.length>=18,"마을 대분류가 충분하지 않습니다");
assert(TOWN_REPUTATIONS.length>=25,"마을 평판 선택지가 충분하지 않습니다");
assert(TOWN_TERRAINS.length>=15,"지형 선택지가 충분하지 않습니다");
const migrated=normalizeTownProfile({townType:"관광 마을",terrainClimate:"해안·해양성",transportModes:["철도"],bg:"world-assets/downtown-optimized.jpg"});
assert.equal(migrated.townType,"관광 중심");
assert.equal(migrated.terrain,"해안");
assert.equal(migrated.bg,"world-assets/owner-forest-town.webp");
assert.equal(townIllustrationsFor(migrated).length,1);
assert.equal(transportBetween({transportModes:["철도"]},{transportModes:["철도"]}),"철도");
assert.equal(canTravelBetween({id:"a",travelAllowed:false},{id:"b",travelAllowed:true}),false);

assert.doesNotMatch(views,/data-town-illustration-open/);
assert.doesNotMatch(views,/data-town-illustration-locked/);
assert.match(views,/등록된 마을 일러스트가 없어요/);
assert.doesNotMatch(views,/class="town-information-hero" data-town-photo/);
assert.match(state,/export function setWorldBackground\(value\)/);
assert.match(app,/f\.elements\.namedItem\("name"\)/);
assert.match(views,/bodySelect\("appearance\.salonFrequency",SALON_FREQUENCIES/);
assert.match(state,/affectedCharacterIds\.forEach\(id=>delete state\.dailyPlans\?\.\[id\]\)/);
assert.match(simulation,/deleted\.has\(key\)\|\|seen\.has\(key\)/);
assert.match(simulation,/sharedCanonicalTitle:current\.sharedCanonicalTitle/);
assert.match(simulation,/function townProfileEvent/);
assert.match(simulation,/transportSceneCopy/);
assert.match(gradle,/versionCode 181/);
assert.match(gradle,/versionName "1\.0\.168"/);

console.log("PASS town profile, illustration, relationship-name, salon, schedule deletion, and shared-log regressions");
