import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {advanceSharedLife} from '../server-life.mjs';
const {createSharedTownService}=createRequire(import.meta.url)('../functions/shared-town.js');
const game=await import('../state.js?v=20260908dev277');
const source=game.createCharacter(5),profile=structuredClone(game.state.characters[source]);profile.createdAt=1;
const count=200,minutes=60,data=new Map([['groups/g',{ownerUid:'u',towns:[{id:'t',name:'Town',places:[]}]}],['groups/g/members/u',{role:'owner'}]]);
for(let i=0;i<count;i++)data.set('groups/g/residents/r'+i,{name:'Resident '+i,ownerUid:'u',townId:'t',sourceCharacterId:source,profileJson:JSON.stringify({...profile,id:'r'+i}),scheduleJson:'{}'});
const ref=(path,isCollection=false)=>({path,id:path.split('/').at(-1),isCollection,collection:k=>ref(path+'/'+k,true),doc:k=>ref(path+'/'+k)});
const snapshot=path=>({id:path.split('/').at(-1),exists:data.has(path),data:()=>structuredClone(data.get(path))});
let writes=0,reads=0,bytes=0,residentWrites=0,now=new Date('2026-09-08T12:00:00+09:00').getTime();
const db={collection:k=>ref(k,true),runTransaction:async run=>{const pending=[];const result=await run({get:async r=>{if(!r.isCollection){reads++;return snapshot(r.path)}const docs=[...data.keys()].filter(k=>k.startsWith(r.path+'/')&&!k.slice(r.path.length+1).includes('/')).map(snapshot);reads+=Math.max(1,docs.length);return {docs}},update:(r,patch)=>pending.push([r.path,patch])});for(const [path,patch] of pending){writes++;if(path.includes('/residents/')){residentWrites++;bytes+=Buffer.byteLength(JSON.stringify({...data.get(path),...patch}))}data.set(path,{...data.get(path),...patch})}return result}};
let expected=[];const service=createSharedTownService({db,engine:async()=>(...args)=>{expected=advanceSharedLife(...args);return expected},clock:()=>now});
let unchanged=0;
for(let minute=0;minute<minutes;minute++){const result=await service.advance('u',{groupId:'g'});unchanged+=count-result.changedCount;for(const row of expected)assert.equal(data.get('groups/g/residents/'+row.id).lifeJson,row.lifeJson,'Every persisted scene and log matches the unmodified engine');now+=60000;}
assert.equal(data.size,count+2);assert.ok(residentWrites<count*minutes);for(let i=0;i<count;i++){const life=JSON.parse(data.get('groups/g/residents/r'+i).lifeJson);assert.ok(life.scene.title);assert.ok(Object.keys(life.days).length)}
const baseline=(count+1)*minutes;
console.log(JSON.stringify({scenario:'200 residents, 60 minute updates, one viewer; unchanged gameplay engine',baselineWrites:baseline,writes,residentWrites,unchangedResidentWritesAvoided:unchanged,writeReductionPercent:Number((100*(baseline-writes)/baseline).toFixed(1)),serverReads:reads,residentPayloadBytes:bytes},null,2));
// Even an unchanged command must retain the throttle marker.
const r=await service.advance('u',{groupId:'g',command:{characterId:'r0',kind:'rest'}});assert.equal(data.get('groups/g/residents/r0').commandAt,now);await assert.rejects(service.advance('u',{groupId:'g',command:{characterId:'r0',kind:'rest'}}),e=>e.status===429);
console.log('PASS retained scenes, logs, command application and command rate limit');
