import fs from 'node:fs';
const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};globalThis.document={querySelector:()=>null,addEventListener(){},activeElement:null};globalThis.window={addEventListener(){},dispatchEvent(){}};
const query=fs.readFileSync('simulation.js','utf8').match(/from "\.\/state\.js([^"\n]*)"/)[1];const game=await import('../state.js'+query),sim=await import('../simulation.js'+query);
const a=game.createCharacter(5),b=game.createCharacter(5),base=structuredClone(game.state.characters[a]);base.createdAt=1;game.state.characters[b].createdAt=1;
const src=fs.readFileSync('views.js','utf8');let count=0;
for(const m of src.matchAll(/"([a-zA-Z]+)",\[((?:"[^"\n]*"\s*,?\s*)+)\]/g)){
 const key=m[1];if(!(key in base))continue;let values;try{values=JSON.parse('['+m[2]+']')}catch{continue}
 for(const value of values){game.state.characters[a]={...structuredClone(base),[key]:Array.isArray(base[key])?[value]:value,days:{}};
 try{sim.eventFor(game.state.characters[a],new Date());count++}catch(e){console.log(JSON.stringify({key,value,error:e.stack}));}
 }
}console.log('tested',count);
