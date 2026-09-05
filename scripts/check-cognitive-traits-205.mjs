import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const read=path=>readFile(new URL(path,import.meta.url),"utf8");
const [views,app,state,css,index,worker,gradle]=await Promise.all([
  read("../views.js"),
  read("../app.js"),
  read("../state.js"),
  read("../character-book.css"),
  read("../index.html"),
  read("../sw.js"),
  read("../android/app/build.gradle")
]);

assert.doesNotMatch(views,/\bCHARACTER_TRAITS\b|data-character-trait=|자폐|ADHD|Autism|自閉/,
  "진단명과 진단 라벨 선택 UI를 제거한다");
assert.match(views,/function cognitiveAccessDialog\(c\)/);
assert.match(views,/const bodyAccessibilityPane=`[\s\S]*?\$\{cognitiveAccessDialog\(c\)\}/,
  "인지·감각·상호작용 특성은 신체·건강의 접근성 페이지에서 연다");
assert.doesNotMatch(views,/특성 설정 안내|사람마다 집중하는 방식|Representation note|진단이나 성격 평가|지능·공감 능력·도덕성·공격성/,
  "선택지를 특별하거나 위험하게 보이게 만드는 별도 안내문을 두지 않는다");
assert.doesNotMatch(views,/성격과 구분해 관리할 수 있도록|건강·접근성 페이지로 옮겼어요|personality-detail-notice/,
  "성격 페이지에는 이동 경위나 별도 안내 상자를 남기지 않는다");
assert.match(app,/data-open-cognitive-traits/);
assert.match(app,/traitExpressions:next/);
assert.doesNotMatch(app,/data-character-trait/);

const exportStart=app.indexOf("function profileExportLines");
const exportEnd=app.indexOf("function downloadProfile",exportStart);
const exportSource=app.slice(exportStart,exportEnd);
assert.match(exportSource,/exportSection\("인지·감각·상호작용"/);
assert.doesNotMatch(exportSource,/characterTraits/,
  "내보내기에서도 진단 라벨을 성격 항목으로 취급하지 않는다");
assert.match(state,/const personalityProfile=\[\.\.\.c\.personalityTypes,c\.energyRhythm,c\.emotionalExpression\]/);
assert.doesNotMatch(state,/const personalityProfile=\[[^\n]*characterTraits/,
  "과거 진단 라벨이 감정 기본값을 추론하지 않는다");

assert.match(css,/\.body-cognitive-entry\{[^}]*top:20\.3cqw/);
assert.match(css,/\.body-wheelchair\{[^}]*top:31\.55cqw/);
assert.match(css,/\.cognitive-access-options\{grid-template-columns:minmax\(0,1fr\)/);
assert.ok(index.includes("character-book.css?v=20260902cognitive205"));
assert.ok(index.includes("app.js?v=20260902cognitive205"));
assert.ok(worker.includes("drawer-village-v20260902-cognitive-205"));
assert.match(gradle,/versionCode\s+205/);
assert.match(gradle,/versionName\s+"1\.0\.191"/);

console.log("v1.0.191 / 205 진단명 없는 인지·감각·상호작용 특성 UI 검증 완료");
