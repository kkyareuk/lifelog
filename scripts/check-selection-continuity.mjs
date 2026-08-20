import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root=path.resolve(import.meta.dirname,"..");
const app=fs.readFileSync(path.join(root,"app.js"),"utf8");
const css=fs.readFileSync(path.join(root,"app.css"),"utf8");

globalThis.localStorage={getItem:()=>null,setItem:()=>{},removeItem:()=>{}};
globalThis.window={DRAWER_VILLAGE_NATIVE:false,addEventListener:()=>{}};
globalThis.document={addEventListener:()=>{},visibilityState:"visible"};
const stateModule=await import(`../state.js?selection-continuity=${Date.now()}`);
const {state,updateCharacterView,characterViewFor}=stateModule;
state.characters={source:{id:"source",name:"관찰자"},target:{id:"target",name:"상대"}};
state.relationships={cohabit:{id:"cohabit",a:"source",b:"target",type:"동거인"}};
state.characterViews={};

assert.equal(updateCharacterView("source","target","comfort","공간도 대화도 완벽하게 편안함"),true);
assert.equal(characterViewFor("source","target").comfort,"공간도 대화도 완벽하게 편안함");
assert.equal(updateCharacterView("source","target","comfort","선택하지 않음"),true);
assert.equal(characterViewFor("source","target").comfort,"선택하지 않음");
assert.deepEqual(state.characterViews.source.target._editedFields,["comfort"]);

const residenceBinding=app.match(/\$\$\("\[data-residence-field\]"\)[\s\S]*?\$\$\("\[data-residence-day\]"\)/)?.[0]||"";
assert.match(residenceBinding,/if\(el\.tagName==="SELECT"\)el\.onchange=apply;else el\.oninput=apply/);
assert.doesNotMatch(residenceBinding,/renderPreservingPageScroll/);
assert.match(app,/homeContext[\s\S]*data-open-home-feature/);
assert.match(app,/townPanelPosition[\s\S]*\.town-editor-panel/);
assert.match(css,/\.game-hud-top\{\s*position:absolute!important;z-index:40!important/);
assert.match(css,/\.game-hud-roster-options button>span\{border:0!important;background:transparent!important/);

console.log("PASS 설정 선택값, 열린 편집 패널, 내부 스크롤 연속성 회귀 검사");
