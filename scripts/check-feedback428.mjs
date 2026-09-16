import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {gzip,ungzip} from '../vendor/pako.esm.mjs';
import {needsCompressedCloudState} from '../cloud-document-shape.js';
import {readCloudCharacters} from '../cloud-character-reader.js';
import {advanceHomeLifeSimulation} from '../home-simulation.js';
const source=await readFile(new URL('../auth.js',import.meta.url),'utf8');
const start=source.indexOf('const FIRESTORE_ARRAY_MARKER='),end=source.indexOf('\n};',source.indexOf('const decodeFirestoreState='))+3;
const context={needsCompressedCloudState,TextEncoder,CompressionStream:undefined,DecompressionStream:undefined,gzipBytes:gzip,ungzipBytes:ungzip,btoa,atob,Uint8Array};
vm.createContext(context);vm.runInContext(source.slice(start,end)+source.slice(source.indexOf('const bytesToBase64='),source.indexOf('async function writeLegacyCloudGameState(')),context);
const encode=x=>context.encodeCloudRecord(x),decode=x=>context.decodeCloudRecord(x);
let nested={photo:'https://firebasestorage.googleapis.com/v0/b/test/o/users%2Ftest%2Fmedia%2Fphoto?alt=media'};for(let i=0;i<24;i++)nested={child:nested};
const encoded=await encode(nested);assert.equal(encoded.recordEncoding,'gzip-v1');assert.equal(JSON.stringify(await decode(encoded)),JSON.stringify(nested));assert(!needsCompressedCloudState(encoded));
const large={notes:'large record '.repeat(90000),nested};const packed=await encode(large);assert.equal(JSON.stringify(await decode(packed)),JSON.stringify(large));assert(JSON.stringify(packed).length<650000);
const snapshot=(id,data)=>({id,data:()=>data});const result=await readCloudCharacters([snapshot('c',{characterId:'c',character:await encode({id:'c',nested})})],{decode,readDays:async()=>({docs:[snapshot('d',{dateKey:'d',day:await encode(large)})]})});assert.equal(result.c.days.d.notes,large.notes);assert.equal(JSON.stringify(result.c.nested),JSON.stringify(nested));
assert(!source.includes('if(needsCompressedCloudState(encodeFirestoreState(gameState)))throw'));
const home={rooms:{bedroom:{furniturePlacements:[{id:'bed',item:'커플 침대',x:50,y:50}]},bath:{furniturePlacements:[{id:'wc',item:'변기',x:50,y:50}]},study:{furniturePlacements:[{id:'desk',item:'책상',x:50,y:50}]}}};
for(const [actionKind,title,room,expected] of [['eating','식사하는 중','bedroom',''],['wash','용변을 보는 중','bath','wc'],['study','공부하는 중','study','desk']]){const scene={room,title,actionKind,...(title.includes('용변')?{lifeTaskId:'toilet'}:{})};const r=advanceHomeLifeSimulation(home,['p'],{p:{scene,roomKey:room,animateMovement:false}},100000);assert.equal(r.simulation.agents.p.furnitureId,expected);}
console.log('PASS428 records: deep and >1MB records round-trip independently; async character/day decoding; semantic furniture selection.');
import engine from '../functions/mafia-stage.js';
const game={id:'qa428',seed:'qa428',rulesVersion:4,meetingControls:2,notebook:true,drama:true,nightCycle:true,preparationRules:1,capacity:6,mafiaCount:2,moveSeconds:30,actionSeconds:90,meetingSeconds:600,mode:'live',deadlineAt:Date.now()+30000,locations:Array.from({length:3},(_,i)=>({id:'l'+i,name:'Place '+i,selected:true})),players:Array.from({length:6},(_,i)=>({id:'p'+i,name:'P'+i,ownerUid:'u'+i,delegated:false,alive:true,homeId:'h'+i}))};engine.start(game);assert.equal(game.players.filter(p=>p.role==='mafia').length,2);let now=game.deadlineAt;engine.advance(game,now);assert.equal(game.phase,'walk');now=game.deadlineAt;engine.advance(game,now);assert.equal(game.phase,'act');assert.equal(game.deadlineAt-now,90000);assert.equal(engine.view(game,'u0').replay.length,0);engine.advance(game,game.deadlineAt);assert(game.replay.some(r=>r.kind==='action'));game.status='finished';assert(engine.view(game,'u0').replay.length>0);
console.log('PASS428 game: two Mafia, configured action timer, archive hidden until finish.');

const serverDecode=(await import('../functions/cloud-record.js')).default;assert.equal(JSON.stringify(serverDecode(encoded)),JSON.stringify(nested));
