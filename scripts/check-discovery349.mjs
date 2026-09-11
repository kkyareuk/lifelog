import assert from 'node:assert/strict';
import {DISCOVERY_SCENES as DISCOVERY_EVENTS,discoveryCandidates,discoveryAnswer,discoveryChoices,DISCOVERY_AXES} from '../character-discovery-rules.js';
const fresh=()=>({id:'test',discovery:{lockRevision:333,scores:{morality:50,aggressionLevel:50},locks:{}}});
const added=DISCOVERY_EVENTS.filter(q=>q.id.startsWith('dilemma-'));assert.equal(added.length,6);
for(const q of added){assert(discoveryCandidates(fresh(),{title:'쉬는 중'}).includes(q));assert.equal(discoveryChoices(fresh(),q).length,5);for(const [i,c]of q.choices.entries()){for(const lang of ['ko','en','ja'])assert(c.text[lang]&&q.question[lang]);for(const [f,v]of Object.entries(c.targets)){assert(DISCOVERY_AXES[f]);assert(v===null||Number.isFinite(v)&&v>=0&&v<=100)}assert(discoveryAnswer(fresh(),q,i));}}
const q=added.find(q=>q.id==='dilemma-small-secret');const cruel=discoveryAnswer(fresh(),q,2);assert(cruel.discovery.scores.morality<50);assert.equal(cruel.discovery.scores.aggressionLevel,50);const locked=fresh();locked.discovery.locks.morality=true;assert.equal(discoveryAnswer(locked,q,2).discovery.scores.morality,50);
const allLocked=fresh();allLocked.discovery.locks=Object.fromEntries(Object.keys(DISCOVERY_AXES).map(f=>[f,true]));assert(!discoveryCandidates(allLocked,{title:'쉬는 중'}).includes(q));
console.log('PASS 6 scenarios / 30 translated answers, eligible target-only choices, bounded scores, moral decline independent of aggression, locked values preserved');
