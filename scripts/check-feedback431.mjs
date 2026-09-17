import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {cleanExactRepeatedEntries} from '../simulation-timeline-cleanup.js';
import {importantReplay} from '../mafia-replay.js';
import {placeActions} from '../place-activities.js';
import {contextActions} from '../context-actions.js';
const previous=execFileSync('git',['show','6ac54fa:simulation.js'],{encoding:'utf8'}),start=previous.indexOf('function cleanExactRepeatedEntries('),end=previous.indexOf('const MAJOR_CLEANUP_PATTERN',start);
const baseline=Function('return ('+previous.slice(start,end).trim()+')')();
const rows=Array.from({length:400},(_,i)=>({minute:i*3,title:'장면 '+i%30+' · 활동 '+i%7,desc:'  오늘  이야기 '+i%50,placeId:'p'+i%4,groupInteraction:i%5===0,dateGroup:i%9===0?'d':'',room:'r'}));
assert.equal(JSON.stringify(cleanExactRepeatedEntries(rows)),JSON.stringify(baseline(rows)));
for(let n=0;n<15;n++){const sample=rows.slice(n,n+90).reverse();assert.equal(JSON.stringify(cleanExactRepeatedEntries(sample)),JSON.stringify(baseline(sample)))}
const time=fn=>{const samples=[];for(let i=0;i<8;i++){const t=performance.now();fn(rows);samples.push(performance.now()-t)}return samples.sort((a,b)=>a-b)[4]};
console.log('400-entry cleanup median ms',JSON.stringify({before:time(baseline),after:time(cleanExactRepeatedEntries)}));
assert(placeActions({type:'cafe'}).some(a=>a.lifeTask==='cafe_favorite'));assert(!placeActions({type:'park'}).some(a=>a.lifeTask==='cafe_favorite'));assert(contextActions({type:'furniture',item:'오디오'}).some(a=>a.lifeTask==='music'));
assert.deepEqual(importantReplay([{kind:'action',action:'move'},{kind:'meeting',action:'pass'},{kind:'action',action:'mourn'},{kind:'observation',card:{kind:'intuition'}},{kind:'observation',card:{kind:'tool',forged:true}},{kind:'belief',subject:'a',target:'b'}]).map(r=>r.kind),['action','belief']);
console.log('PASS431: cleanup equivalence, contextual catalog validation and significant replay filtering');
