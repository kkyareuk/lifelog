// Isolated synthetic state: never connects to an account or player storage.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const memory=new Map();
globalThis.localStorage={get length(){return memory.size},key:i=>[...memory.keys()][i]??null,getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
globalThis.document={querySelector:()=>null,addEventListener(){},activeElement:null};
globalThis.window={addEventListener(){},dispatchEvent(){}};
const source=fs.readFileSync(new URL('../simulation.js',import.meta.url),'utf8');
const query=source.match(/from "\.\/state\.js([^"\n]*)"/)[1];
const game=await import(`../state.js${query}`);
const sim=await import(`../simulation.js${query}`);
const count=Number(process.argv[2]||200);
game.resetAll();
const first=game.createCharacter(20),template=structuredClone(game.state.characters[first]);
game.state.characters={};game.state.order=[];
for(let i=0;i<count;i++){
  const id=`population-${i}`;
  game.state.characters[id]={...structuredClone(template),id,name:`시험 인물 ${i}`,createdAt:1,wake:'07:00',sleep:'23:00',days:{}};
  game.state.order.push(id);
}
game.state.activeId=game.state.order[0];
if(process.argv.includes('--relationships')){
  game.state.relationships={};
  for(let i=0;i<count;i++)for(let offset=1;offset<=2;offset++){
    const id=`relation-${i}-${offset}`;
    game.state.relationships[id]={id,a:`population-${i}`,b:`population-${(i+offset)%count}`,type:'친구',intimacy:50,conflict:0};
  }
}
for(let i=0;i<300;i++)game.state.catalog.perfume.push({id:`perf-${i}`,name:`시험 향수 ${i}`,kind:'perfume',category:'우디'});
const now=new Date();now.setHours(13,0,0,0);
const stringify=JSON.stringify;
let signatures=0,redundantSignatures=0;
const seenSignatures=new WeakMap();
JSON.stringify=function(value,...args){
  if(value?.birthdays&&value?.uiLanguage){
    signatures++;
    const revision=`${value.timelineResetAt}:${value.uiLanguage}:${value.birthdays.length}`;
    if(seenSignatures.get(value.bodyProfile)===revision)redundantSignatures++;
    seenSignatures.set(value.bodyProfile,revision);
  }
  return stringify(value,...args);
};
const results=[];
for(let pass=0;pass<(process.argv.includes('--relationships')?5:3);pass++){
  signatures=0;const start=performance.now();
  const run=()=>{for(const c of Object.values(game.state.characters))assert.ok(sim.eventFor(c,now))};
  if(sim.withSimulationBatch)sim.withSimulationBatch(run);else run();
  const result={population:count,relationships:Object.keys(game.state.relationships||{}).length,pass,ms:Math.round((performance.now()-start)*10)/10,signatures};
  results.push(result);console.log(stringify(result));
}
JSON.stringify=stringify;
assert.equal(Object.keys(game.state.characters).length,count);
if(process.argv.includes('--verify'))assert.equal(redundantSignatures,0,'An unchanged character revision must not be serialized again');
game.save(true,false);
