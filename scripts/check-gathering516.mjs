import assert from 'node:assert/strict';
import {scheduledSocialScene,socialScheduleRows,socialLogCopy,socialInterval} from '../gathering.js';
import {SOCIAL_LOGS} from '../gathering-logs.js';
await import('../server-life.mjs');
const {state:s,createCharacter,deleteMonthlyRoutine}=await import('../state.js?v=20260909dev305');
const {eventFor,visibleTimeline}=await import('../simulation.js?v=20260909dev305');
const ids=[createCharacter(),createCharacter(),createCharacter()],host=ids[0];
const now=+new Date(2026,9,9,14,35);Date.now=()=>now;
for(const [i,id] of ids.entries()){const c=s.characters[id];c.name=['하루','다온','소리'][i];c.job='무직';c.createdAt=+new Date(2026,9,8,8);c.timelineResetAt=now-86400000;c.needsFixed=true;}
s.monthlyRoutines[host]=[{id:'meeting516',date:'2026-10-09',start:'14:00',end:'16:00',title:'오후 모임',type:'모임',visitHomeId:host,withIds:ids.slice(1)}];
const scenes=ids.map(id=>eventFor(s.characters[id],new Date(now)));
console.log(scenes.map(e=>({title:e.title,routineId:e.routineId,withIds:e.withIds,social:e.socialEvent,start:e.routineStartMinute,end:e.routineEndMinute,phase:e.routinePhase,minute:e.minute})));
assert(scenes.every(e=>e.routineId==='meeting516'&&e.socialEvent),'all guests follow the same existing schedule');
assert(scenes.every(e=>e.routinePhase===3),'current activity advances with schedule time');
assert.equal(new Set(scenes.map(e=>e.desc)).size,1,'same shared story from each participant');
const logs=visibleTimeline(s.characters[host],new Date(now)).filter(e=>e.routineId==='meeting516');
assert(logs.length>=3,'distinct moments in ordinary life logs');assert(logs.every(e=>e.minute<=875),'future entries hidden');
assert.equal(socialScheduleRows(s,ids[1]).length,1,'guest schedule includes host invitation');
assert.deepEqual(eventFor(s.characters[host],new Date(now)).socialEvent,scenes[0].socialEvent,'rerenders do not reroll');
for(const lang of ['en','ja']){const translated=socialLogCopy(logs[1],s,lang);assert(translated.desc.length>20);assert.notEqual(translated.desc,logs[1].desc);}
assert.equal(Object.values(SOCIAL_LOGS).flat().length,25);assert(Object.values(SOCIAL_LOGS).flat().every(e=>e.copy.length===3&&e.copy.every(Boolean)));
assert(socialInterval({routineStartMinute:0,routineEndMinute:1440})>=120,'long schedules have at most 12 moments');
const denied=structuredClone(s);for(const id of ids)denied.characters[id].autonomousActivityBlocks=['talk','cooking','games','digital','care'];
const base={...scenes[0],socialEvent:undefined,title:'original'};assert.equal(scheduledSocialScene(base,denied.characters[host],denied,now).title,'original','blocked activities respected');
deleteMonthlyRoutine(host,'meeting516');assert.equal(socialScheduleRows(s,ids[1]).length,0);assert.notEqual(eventFor(s.characters[host],new Date(now)).routineId,'meeting516','deletion releases real simulation');
console.log('PASS516 scheduled gatherings: shared attendance, stable autonomous choices, native life logs, deletion, permissions, translations and bounded generation');
