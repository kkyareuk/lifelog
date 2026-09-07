import assert from 'node:assert/strict';
const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
globalThis.document={querySelector:()=>null,addEventListener(){},activeElement:null};globalThis.window={addEventListener(){},dispatchEvent(){}};
const game=await import('../state.js?v=20260907dev266'),sim=await import('../simulation.js?v=20260907dev266');
const {drinkExperience,drinkLogCopy}=await import('../drink-log.js?v=20260907dev266');
const {localizeLifeLog}=await import('../life-log-localization.js?v=20260907dev266');
const drink={id:'test-drink',kind:'drink',name:'테스트 에이드',sweet:5,acidity:4,carbonation:5,temperature:'차갑게',caffeine:'디카페인',alcohol:'무알코올'};
const cueSet=new Set();for(let seed=0;seed<6;seed++)for(const cue of drinkExperience(drink,{sweetPreference:1},seed).cues)cueSet.add(cue);
for(const cue of ['cold','tooSweet','sour','fizzy','decaf','noAlcohol'])assert.ok(cueSet.has(cue));
assert.deepEqual(drinkExperience({name:'물'},{},0).cues,[]);
for(const language of ['en','ja'])assert.ok(!/[가-힣]/.test(drinkLogCopy(drinkExperience({...drink,name:'Ade'},{},2),language).desc));
game.resetAll();const id=game.createCharacter(20),c=game.state.characters[id];Object.assign(c,{createdAt:1,wake:'00:00',sleep:'23:59',socialStyle:'외향적',job:'무직',days:{}});
game.state.catalog.drink=[drink];game.state.catalog.food=[{id:'food-test',kind:'food',name:'식사'}];
for(const town of game.state.towns)town.places=[{id:'test-cafe',type:'카페',name:'시험 카페',stock:['food-test','test-drink'],townId:town.id}];
let scene;for(let i=0;i<40&&!scene;i++){const date=new Date(2026,8,7+i,18);scene=sim.timeline(c,date).find(e=>e.drinkExperience)}
assert.ok(scene,'actual cafe timeline includes dictionary drink metadata');assert.equal(scene.itemId,drink.id);assert.equal(scene.drinkExperience.name,drink.name);
assert.ok(scene.desc.length>0);assert.ok(!scene.desc.includes('식사'));
const before=structuredClone(scene.drinkExperience);drink.temperature='따뜻하게';drink.name='변경된 이름';
assert.deepEqual(scene.drinkExperience,before,'saved log keeps its original observation after dictionary edits');
for(const language of ['ko','en','ja']){const localized=localizeLifeLog(scene,language,game.state,c.id);assert.ok(localized.title.includes('테스트 에이드'));assert.equal(localized.displayLanguage,language)}
console.log('PASS 262: six configured drink traits, preferences, unspecified values, three languages, actual cafe timeline, mixed stock filtering, immutable saved log');
