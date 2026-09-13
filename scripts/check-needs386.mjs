import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const source=await readFile('autonomous-activities.js','utf8');
const {AUTONOMOUS_ACTIVITIES,ACTIVITY_SECTIONS,autonomousActivity,autonomousAllowed,applyAutonomousPolicy}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const keys=ACTIVITY_SECTIONS.flatMap(section=>section.keys);
assert.equal(new Set(keys).size,keys.length);assert.deepEqual([...keys].sort(),Object.keys(AUTONOMOUS_ACTIVITIES).sort());
assert.deepEqual(ACTIVITY_SECTIONS[0].keys,['sleep','eating','toilet']);
for(const section of ACTIVITY_SECTIONS)assert(section.names.every(Boolean));
for(const names of Object.values(AUTONOMOUS_ACTIVITIES))assert.equal(names.filter(Boolean).length,3);
const c={autonomousActivityBlocks:['sleep','eating','toilet']};
for(const [type,titles] of Object.entries({sleep:['자는 중','낮잠 자는 중','Sleeping','Taking a nap','眠っている'],eating:['간단한 식사를 챙기는 중','Eating breakfast','食事中'],toilet:['화장실 가기','잠시 화장실을 사용','Use the toilet','トイレに行く']})){
 for(const title of titles){assert.equal(autonomousActivity({title}),type,title);assert.equal(autonomousAllowed(c,{title}),false);assert.equal(autonomousAllowed(c,{title,manualDirective:true}),true);assert.equal(autonomousAllowed(c,{title,routineId:'planned'}),true)}
}
for(const title of ['샤워하는 중','욕실에서 씻는 중','요리하는 중','치료받는 중','잠을 이루지 못하는 중'])assert(autonomousAllowed(c,{title}),title);
for(const language of ['ko','en','ja']){const replacement=applyAutonomousPolicy(c,{title:'자는 중',sleeping:true,actionKind:'sleep',withId:'friend'}, {},language);assert.equal(replacement.sleeping,false);assert.equal(replacement.actionKind,undefined);assert.equal(replacement.withId,undefined);assert(!/자는 중/.test(replacement.title))}
assert.equal(autonomousAllowed({autonomousActivityBlocks:['reading']},{title:'책을 읽는 중'}),false);
console.log('PASS needs386: categories, three languages, need blocks, manual/schedule exceptions, shower preserved, stale sleep state cleared');
