import assert from 'node:assert/strict';
import {advanceNeeds,needsAt} from '../life-needs.js';
import {roomActivityKey} from '../room-activities.js';
import {spousePrivacyExempt} from '../private-scene-policy.js';
import {discoveryCandidates,discoveryAnswered,DISCOVERY_SCENES} from '../character-discovery-rules.js';
const now=+new Date(2026,8,19,12);
for(const title of ['커피를 마시는 중','Drinking coffee','コーヒーを飲んでいます']){
 const c={wake:'07:00',sleep:'23:00',lifeNeeds:{sleep:10,updatedAt:now-1}};
 advanceNeeds(c,{title},now);assert(c.lifeNeeds.recovering.includes('sleep'));
 assert(needsAt(c,now+600000).sleep>45);
}
assert.equal(roomActivityKey({needKey:'sleep',coffeeRecovery:true}),'eating');
const marriage={m:{type:'부부',a:'a',b:'b'}};
assert(spousePrivacyExempt(marriage,'a','b',{}));
assert(!spousePrivacyExempt({m:{...marriage.m,temporalStatus:'past'}},'a','b',{}));
assert(!spousePrivacyExempt(marriage,'a','b',{withIds:['c']}));
const c={discovery:{lockRevision:333,answered:DISCOVERY_SCENES.slice(0,500).map(q=>q.id)}};
const answered=new Set(discoveryAnswered(c)),start=performance.now(),pool=discoveryCandidates(c,{title:'rest'});
assert(pool.every(q=>!answered.has(q.id)));console.log('Question pool',pool.length,'in',Math.round(performance.now()-start),'ms');
console.log('PASS coffee recovery KO/EN/JA, coffee room policy, current spouse only, answered question exclusion');
