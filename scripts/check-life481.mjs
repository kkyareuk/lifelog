import assert from 'node:assert/strict';
import {defaultBuildingRooms} from '../building-interior-presets.js';
import {contextDestination} from '../context-actions.js?v=20260909dev305';
import {officeDuty} from '../career-duties.js';
import {BUILTIN_CAREERS} from '../career-catalog.js';
const town={id:'t',places:[{id:'cafe',type:'카페'}]},world={activeTownId:'t',towns:[town],world:town,homes:{},characters:{},characterDirectives:{}},c={id:'c',townId:'t'};
const target={type:'furniture',homeId:'place-interior:t:cafe',placeId:'cafe',room:'area0',id:'area0-f0'};
const result=contextDestination(world,c,target,'meal');assert.equal(result.placeId,'cafe');assert.equal(result.home,false);assert.equal(result.furniture.tableId,'area0-f0');assert(['west','east'].includes(result.furniture.seatSide));
assert.equal(contextDestination(world,c,{...target,placeId:'missing'},'meal'),null);
for(const type of ['카페','공원','옷가게','사무실','병원']){const rooms=defaultBuildingRooms({type});for(const r of Object.values(rooms)){for(const [key,cells] of [['x',12],['y',16],['w',12],['h',16]])assert(Math.abs(r.layout[key]/100*cells-Math.round(r.layout[key]/100*cells))<1e-8)}assert(rooms.area3.layout.w*rooms.area3.layout.h<rooms.area0.layout.w*rooms.area0.layout.h)}
assert.equal(Object.keys(defaultBuildingRooms({type:'공원'})).length,2);
for(const job of ['정치인','바리스타']){const person={id:'worker',job};for(const language of ['ko','en','ja']){const seen=[];for(let m=570;m<900;m+=45){const duty=officeDuty(person,new Date(2026,8,23,0,m),540,1080,language);assert(duty?.desc);assert(!duty.desc.includes('하던 일을'));seen.push(duty.desc)}assert(new Set(seen).size>=6)}assert(officeDuty(person,new Date(2026,8,23,17,55),540,1080).desc)}
assert.equal(BUILTIN_CAREERS.find(j=>j.id==='builtin-barista').ranks.length,4);
console.log('PASS481: grid rooms, linked usable cafe seats, place validation, small service rooms, park lawn, concrete work and barista ranks in 3 languages');
