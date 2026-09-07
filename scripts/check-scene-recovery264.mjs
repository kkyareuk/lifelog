import assert from 'node:assert/strict';import fs from 'node:fs';
const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};globalThis.document={querySelector:()=>null,addEventListener(){},activeElement:null};globalThis.window={addEventListener(){},dispatchEvent(){}};
const query=fs.readFileSync(new URL('../simulation.js',import.meta.url),'utf8').match(/from "\.\/state\.js([^"\n]*)"/)[1];const game=await import('../state.js'+query),sim=await import('../simulation.js'+query);
const a=game.createCharacter(5),b=game.createCharacter(5),bad=game.state.characters[a],good=game.state.characters[b];bad.createdAt=good.createdAt=1;
const date=new Date();date.setHours(13,30,0,0);const key=[date.getFullYear(),date.getMonth()+1,date.getDate()].join('-');
// An actual non-array legacy preference used to throw in catalogSelections.
bad.favorites={drink:'legacy-id'};assert.doesNotThrow(()=>sim.eventFor(bad,date));assert.equal(bad.favorites.drink,'legacy-id');
const saved={minute:10,title:'보존할 기록',desc:'기존 본문',home:true,room:'living'};bad.days={[key]:{entries:[saved],engineVersion:'old'}};
// Fault injection also covers a future failure which input guards do not know about.
bad.timelineResetAt=Date.now();Object.defineProperty(bad,'wake',{configurable:true,get(){throw new Error('injected resident failure')}});
const original=JSON.stringify(bad.days),warn=console.warn;console.warn=()=>{};
try{
 const scene=sim.eventFor(bad,date);assert.equal(scene.sceneUnavailable,true);assert.ok(sim.nextSceneRefreshDelay(bad,date)>=1000);
 assert.deepEqual(sim.timeline(bad,date),[saved]);assert.equal(JSON.stringify(bad.days),original);
 sim.withSimulationBatch(()=>{assert.equal(sim.eventFor(bad,date).sceneUnavailable,true);assert.ok(!sim.eventFor(good,date).sceneUnavailable)});
 game.setActive(b);assert.equal(game.state.activeId,b);
}finally{console.warn=warn;bad.timelineResetAt=Date.now();Object.defineProperty(bad,'wake',{configurable:true,writable:true,value:'07:00'})}
assert.ok(!sim.eventFor(bad,date).sceneUnavailable,'correcting the setting retries immediately');
assert.ok(bad.days[key].entries.some(e=>e.title===saved.title&&e.desc===saved.desc));
console.log('PASS: scalar preference, per-resident isolation, refresh, preserved logs, immediate recovery');


