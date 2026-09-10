import assert from 'node:assert/strict';
import {LIFESTYLE_EVENTS} from '../discovery-lifestyle.js?v=20260909dev305';
import {discoveryAnswer,repeatDiscoveryCandidates,discoveryCandidates,DISCOVERY_SCENES} from '../character-discovery-rules.js';
import {personalChoices} from '../automatic-activities.js';
import {autonomousAllowed} from '../autonomous-activities.js';
const c={id:'n',townId:'t',ageGroup:'성인',personalityTypes:['다정'],discovery:{lockRevision:333,locks:{}}};
for(const q of LIFESTYLE_EVENTS){const patch=discoveryAnswer(structuredClone(c),q,0);assert.equal(patch[q.fields[0]],q.choices[0].setting.value);assert(q.choices.every(o=>o.text.ko&&o.text.en&&o.text.ja));const locked=structuredClone(c);locked.discovery.locks[q.fields[0]]=true;assert.equal(discoveryAnswer(locked,q,0),null);}
const all=structuredClone(c);all.discovery.answered=DISCOVERY_SCENES.map(q=>q.id);assert.equal(discoveryCandidates(all,{title:'question'}).length,0);const again=repeatDiscoveryCandidates(all);assert(again.length>0);assert(discoveryAnswer(all,again[0],0));assert(!again.some(q=>q.field||q.form||q.setting));
const world={characters:{n:c,m:{id:'m',townId:'t',name:'Meda'},k:{id:'k',townId:'t',name:'Crow'}},relationships:{r:{a:'n',b:'k',type:'연인'}},characterViews:{n:{k:{overall:'사랑함'},m:{overall:'그저 그런 사람'}}}};
assert.equal(personalChoices(world,c).find(a=>a.kind==='comfort').targetId,'k');
assert(!autonomousAllowed({autonomousActivityBlocks:['care']},{title:'메다를 챙겨주는 중'}));assert(autonomousAllowed({autonomousActivityBlocks:['care']},{title:'메다를 챙겨주는 중',manualDirective:true}));
console.log(`PASS ${LIFESTYLE_EVENTS.length} lifestyle questions, locked values, renewable traits, relationship priority, autonomous restrictions`);
