import assert from 'node:assert/strict';
import {hairGrooming} from '../hair-grooming.js';
import {lifeCopy,LIFE_TASKS} from '../life-tasks.js';
import {kissNarrative} from '../kiss-narrative.js';
const hair=LIFE_TASKS.find(t=>t.id==='hair');
for(const lang of ['ko','en','ja'])for(const length of ['짧은 머리','단발','허리 길이','삭발','설정하지 않음']){const c={bodyProfile:{appearance:{hairLength:length,hairStyles:['땋은 머리'],hairTexture:'완전한 직모'}}};const text=hairGrooming(c,lang);assert.equal(lifeCopy(hair,c)[lang][1],text);if(length==='짧은 머리')assert(!/땋|braid|編/.test(text));if(length==='허리 길이')assert(/땋|braid|編/.test(text));}
const actor={id:'a'},target={id:'b',name:'B'},world={relationships:{r:{a:'a',b:'b',type:'연인',intimacy:90,conflict:10}}},view={overall:'깊이 사랑'};
assert.equal(kissNarrative(world,actor,target,view,view,100000).ko.relationshipCue,'kiss-familiar');
world.characterDirectives={a:{targetId:'b',kind:'argue',startedAt:90000}};
assert.equal(kissNarrative(world,actor,target,view,view,100000).ko.relationshipCue,'kiss-reconciled');
assert.equal(kissNarrative(world,actor,target,{overall:'그저 그런 사람'},view,100000).ko.relationshipCue,'kiss-cautious');
assert.equal(kissNarrative(world,actor,target,view,view,9*3600000).ko.relationshipCue,'kiss-familiar');
console.log('PASS hair settings in three languages, manual/automatic shared copy, short hair cannot braid; kiss requires real recent conflict and mutual positive views for reconciliation');
