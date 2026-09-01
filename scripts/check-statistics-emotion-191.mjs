import fs from "node:fs";
import assert from "node:assert/strict";
import {characterMood} from "../character-mood.js";

const read=file=>fs.readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const state=read("state.js"),views=read("views.js"),app=read("app.js"),css=read("app.css"),bookCss=read("character-book.css"),gradle=read("android/app/build.gradle"),sw=read("sw.js");

assert.match(state,/const defaultCatalog=\(\)=>Object\.fromEntries/,"새 월드 사전은 빈 목록이어야 합니다.");
assert.doesNotMatch(state,/food-malatang|name:"마라탕"/,"초기 마라탕 데이터가 남아 있습니다.");
assert.match(state,/statisticsTownId:"all"/);
assert.match(state,/angerResponse/);
assert.match(state,/flirtResponse/);
assert.match(views,/data-character-theme="drawer-default"/);
assert.match(views,/data-open-advanced-ld/);
assert.match(views,/class="character-book-v8-ink" data-save/);
assert.match(views,/statisticsDashboard/);
assert.match(views,/population-pyramid/);
assert.match(views,/PERSONALITY TOP 3/);
assert.match(views,/data-routine-month-today/);
assert.match(views,/aria-current="date"/);
assert.match(app,/state\.routineMonth=currentMonthKey\(\)/);
assert.match(app,/data-statistics-scope/);
assert.match(app,/그림 전체를 통째로 바꿉니다/);
assert.match(app,/sceneLayout:\{sd:/);
assert.match(css,/statistics-report/);
assert.match(css,/monthly-day\.is-today/);
assert.match(bookCss,/clothing-layout-grid/);
assert.match(bookCss,/personality-emotion-grid\{top:69cqw/);
assert.match(gradle,/versionCode\s+191/);
assert.match(gradle,/versionName\s+["']1\.0\.178["']/);
assert.match(sw,/statistics-191/);

const world={uiLanguage:"ko",homes:{},towns:[],relationships:{},routines:{},monthlyRoutines:{},catalog:{fashion:[]},characters:{},world:{id:"town",name:"테스트 마을",reputation:"평판 정보 없음",places:[]}};
const base={id:"character",townId:"town",wake:"07:30",sleep:"00:30",inventory:{fashion:[]},personalityTypes:[],characterTraits:[],interests:[],hobbies:[],emotionalBaseline:"현실적인 편",moodVolatility:"상황에 따라 달라짐",positiveMoodResponse:"미소와 말로 표현함",stressMoodResponse:"잠시 거리를 둠",moodRecoveryStyle:"혼자 정리하며 회복"};
const assertive=characterMood({...base,angerResponse:"해결책을 분명히 요구함"},{title:"심하게 다투고 화가 난 상태",date:"2026-09-01",minute:720},world);
assert.equal(assertive.tone,"angry","분노 반응 설정이 실제 기분 산출에 반영되어야 합니다.");
const receptive=characterMood({...base,flirtResponse:"은근히 받아줌"},{title:"호감 신호를 받는 중",date:"2026-09-01",minute:730},world);
assert.ok(receptive.reasons.some(reason=>reason.text.includes("호감 신호")),"유혹·호감 반응 설정의 이유가 표시되어야 합니다.");

console.log("v1.0.178 / 191 빈 사전·정서·통계·오늘 달력 검증 완료");
