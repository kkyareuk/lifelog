import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root=path.resolve(import.meta.dirname,"..");
const app=fs.readFileSync(path.join(root,"app.js"),"utf8");
const css=fs.readFileSync(path.join(root,"app.css"),"utf8");

const storage=new Map();
globalThis.localStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value),removeItem:key=>storage.delete(key)};
globalThis.window={DRAWER_VILLAGE_NATIVE:false,addEventListener:()=>{},dispatchEvent:()=>{}};
globalThis.document={addEventListener:()=>{},querySelector:()=>null,activeElement:null,visibilityState:"visible"};
const stateModule=await import(`../state.js?selection-continuity=${Date.now()}`);
const {state,updateCharacterView,characterViewFor,switchTown,toggleFavorite}=stateModule;
state.characters={source:{id:"source",name:"관찰자"},target:{id:"target",name:"상대"}};
state.relationships={cohabit:{id:"cohabit",a:"source",b:"target",type:"동거인"}};
state.characterViews={};

assert.equal(updateCharacterView("source","target","comfort","공간도 대화도 완벽하게 편안함"),true);
assert.equal(characterViewFor("source","target").comfort,"공간도 대화도 완벽하게 편안함");
assert.equal(updateCharacterView("source","target","comfort","선택하지 않음"),true);
assert.equal(characterViewFor("source","target").comfort,"선택하지 않음");
assert.deepEqual(state.characterViews.source.target._editedFields,["comfort"]);

state.towns=[{id:"town-a",name:"A",places:[]},{id:"town-b",name:"B",places:[]}];
state.world={id:"town-a",name:"A",places:[]};
state.activeTownId="town-a";
state.activeTab="town";
state.characters.source.townId="town-a";
state.characters.target.townId="town-a";
state.order=["source","target"];
state.activeId="source";
const emptyTown=switchTown("town-b");
assert.deepEqual(emptyTown,{id:"town-b",activeId:null,hasCharacters:false});
assert.equal(state.activeTab,"town");
assert.equal(state.activeId,null);

state.catalog={gift:[{id:"tea",name:"차"}]};
state.characters.source.favorites={};
toggleFavorite("source","gift","tea",true);
assert.deepEqual(state.characters.source.favorites.gift,["tea"]);
assert.deepEqual(JSON.parse(storage.get("drawer-village-game-v1")).characters.source.favorites.gift,["tea"]);

const comfortOptions=["정하지 않음","함께 있으면 매우 불편하고 대화도 전혀 통하지 않음","같은 공간에서는 숨 막히지만 농담과 장난은 잘 통함","공간 공유는 불편하지만 대화는 편안함","긴장하고 대화도 조심스러움","어색하지만 필요한 대화는 무난함","함께 있는 건 편하지만 대화 호흡은 평범함","편안하고 농담과 장난이 잘 통함","말없이 함께 있어도 편안함","공간도 대화도 완벽하게 편안함"];
for(const comfort of comfortOptions){
  state.characterViews={source:{target:{comfort:"함께 있는 건 편하지만 대화 호흡은 평범함",spaceComfort:"같이 있어도 편안함",rapport:"대화 호흡은 평범함"}}};
  assert.equal(updateCharacterView("source","target","comfort",comfort,{persist:true}),true);
  const stored=JSON.parse(storage.get("drawer-village-game-v1"));
  assert.equal(stored.characterViews.source.target.comfort,comfort);
  assert.equal(Object.hasOwn(stored.characterViews.source.target,"spaceComfort"),false);
  assert.equal(Object.hasOwn(stored.characterViews.source.target,"rapport"),false);
  state.characterViews=stored.characterViews;
  assert.equal(characterViewFor("source","target").comfort,comfort);
}

const residenceBinding=app.match(/\$\$\("\[data-residence-field\]"\)[\s\S]*?\$\$\("\[data-residence-day\]"\)/)?.[0]||"";
assert.match(residenceBinding,/if\(el\.tagName==="SELECT"\)el\.onchange=apply;else el\.oninput=apply/);
assert.doesNotMatch(residenceBinding,/renderPreservingPageScroll/);
assert.match(app,/homeContext[\s\S]*data-open-home-feature/);
assert.match(app,/townPanelPosition[\s\S]*\.town-editor-panel/);
assert.match(css,/\.game-hud-top\{\s*position:absolute!important;z-index:40!important/);
assert.match(css,/\.game-hud-roster-options button>span\{border:0!important;background:transparent!important/);

console.log("PASS 설정 선택값, 열린 편집 패널, 내부 스크롤 연속성 회귀 검사");
