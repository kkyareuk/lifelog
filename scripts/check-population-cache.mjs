import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const memory=new Map();
globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
globalThis.document={querySelector:()=>null,addEventListener(){},activeElement:null};
globalThis.window={addEventListener(){},dispatchEvent(){}};
const source=fs.readFileSync(new URL('../simulation.js',import.meta.url),'utf8');
const query=source.match(/from "\.\/state\.js([^"\n]*)"/)[1];
const game=await import(`../state.js${query}`),sim=await import(`../simulation.js${query}`);
game.resetAll();
const id=game.createCharacter(20),template=structuredClone(game.state.characters[id]);
game.state.characters={};game.state.order=[];
for(let i=0;i<8;i++){
  const id=`fixture-${i}`;game.state.order.push(id);
  game.state.characters[id]={...structuredClone(template),id,name:`시험 ${i}`,createdAt:1,wake:'07:00',sleep:'23:00',days:{}};
}
game.state.activeId=game.state.order[0];game.state.relationships={};
for(let i=0;i<4;i++)game.state.relationships[`r${i}`]={id:`r${i}`,a:`fixture-${i*2}`,b:`fixture-${i*2+1}`,type:'친구',intimacy:50,conflict:0};
const seed=structuredClone(game.state),now=new Date();now.setHours(13,0,0,0);
const fixedNow=Date.now();Date.now=()=>fixedNow;
// Pin the pre-change engine rather than the moving HEAD so the regression
// continues checking the same baseline after this change is committed.
let reference=execFileSync('git',['show','6e9c556:simulation.js'],{encoding:'utf8',maxBuffer:4*1024*1024});
reference=reference.replace(/from "(\.\/[^"?]+)(?:\?[^"\n]*)?"/g,(_,path)=>`from "${new URL(`../${path.slice(2)}${query}`,import.meta.url).href}"`);
const old=await import(`data:text/javascript;base64,${Buffer.from(reference).toString('base64')}`);
const run=engine=>{
  Object.assign(game.state,structuredClone(seed));
  const output=[];
  for(const hour of [8,13,23]){
    const date=new Date(now);date.setHours(hour);
    const step=()=>game.state.order.map(id=>engine.eventFor(game.state.characters[id],date));
    output.push(engine.withSimulationBatch?engine.withSimulationBatch(step):step());
  }
  game.save(true,false);
  return output.map(events=>events.map(e=>({title:e.title,desc:e.desc,minute:e.minute,home:e.home,room:e.room,placeId:e.placeId,withId:e.withId,withIds:e.withIds})));
};
const expected=run(old),actual=run(sim);
assert.deepEqual(actual,expected,'Batching must preserve morning, daytime and sleep behavior');
Object.assign(game.state,structuredClone(seed));
assert.throws(()=>sim.withSimulationBatch(()=>{throw new Error('test abort')}),/test abort/);
const first=game.state.characters['fixture-0'];
const editDate=new Date(fixedNow);
sim.eventFor(first,editDate);
assert.equal(game.directCharacterActivity(first.id,'rest'),true);
const directed=sim.eventFor(first,editDate);
assert.equal(directed.manualDirective,true,'Edits after a batch must invalidate scene results');
game.state.uiLanguage='en';
const english=sim.eventFor(first,editDate);
assert.notEqual(english.title,directed.title,'Language changes must not reuse Korean results');
game.save(true,false);
console.log('PASS population cache: reference behavior, clock changes, batch cleanup, direct actions and language invalidation');
