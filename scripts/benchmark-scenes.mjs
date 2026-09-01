// Synthetic save only. Never opens a player's browser or account data.
const memory=new Map();
globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
globalThis.document={querySelector:()=>null,addEventListener(){},activeElement:null};
globalThis.window={addEventListener(){},dispatchEvent(){}};
const game=await import('../state.js?v=20260901scene186');
const sim=await import('../simulation.js?v=20260901scene186');
game.resetAll();
for(let i=0;i<12;i++){const id=game.createCharacter(20);Object.assign(game.state.characters[id],{name:`시험 인물 ${i}`,createdAt:1,wake:'07:00',sleep:'23:00'})}
for(let i=0;i<300;i++)game.state.catalog.perfume.push({id:`perf-${i}`,name:`시험 향수 ${i}`,kind:'perfume',category:'우디'});
const now=new Date();now.setHours(13,0,0,0);
for(let pass=0;pass<4;pass++){
  const start=performance.now();
  for(const c of Object.values(game.state.characters))sim.eventFor(c,now);
  console.log(`${pass===0?'cold':'warm'}: ${(performance.now()-start).toFixed(1)}ms / 12 characters, 300 extra items`);
}
game.save(true,false);
