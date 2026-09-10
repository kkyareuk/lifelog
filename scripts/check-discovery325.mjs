import assert from 'node:assert/strict';
import {DISCOVERY_SCENES,DISCOVERY_FIELDS,DISCOVERY_AXES,discoveryLocked,discoveryCandidates,discoveryAnswer,manualDiscoveryPatch,createDiscoverySession} from '../character-discovery-rules.js';
assert.equal(DISCOVERY_FIELDS.length,25);assert.equal(DISCOVERY_SCENES.length,24);const covered=new Set();
for(const q of DISCOVERY_SCENES){assert.equal(q.choices.length,5);for(const lang of ['ko','en','ja'])assert(q.question[lang]);for(const o of q.choices){for(const lang of ['ko','en','ja'])assert(o.text[lang]);for(const [f,w] of Object.entries(o.effects)){covered.add(f);assert(DISCOVERY_AXES[f]);if(typeof w==='number')assert(Math.abs(w)<=1);else assert(DISCOVERY_AXES[f].values[w.toward]);}}}
assert.deepEqual([...covered].sort(),[...DISCOVERY_FIELDS].sort());
const c={id:'a',socialStyle:'조용히 어울림',neatness:'보통',discovery:{version:1,locks:{}}},q=DISCOVERY_SCENES[0];const patch=discoveryAnswer(c,q,0,100);assert.equal(patch.discovery.scores.socialStyle,49);assert.equal(patch.discovery.scores.neatness,51);assert.equal(patch.socialStyle,'조용히 어울림');
Object.assign(c,manualDiscoveryPatch(c,{socialStyle:'먼저 다가감'}));const locked=discoveryAnswer(c,q,0);assert(!Object.hasOwn(locked,'socialStyle'));assert.equal(locked.discovery.scores.socialStyle,75);assert.equal(locked.discovery.scores.neatness,51);
for(const f of DISCOVERY_FIELDS){const edit=manualDiscoveryPatch(c,{[f]:DISCOVERY_AXES[f].values[0]});assert(discoveryLocked({...c,...edit},f));}
const legacy={id:'old'};assert.equal(discoveryCandidates(legacy,{title:'대화'}).length,0);assert.equal(discoveryAnswer(legacy,q,0),null);
const fresh={id:'new',discovery:{version:1}},session=createDiscoverySession(()=>0),scene={title:'걷는 중',minute:1},now=10000000;
assert.equal(session.offer(fresh,scene,{now}),null);assert(session.offer(fresh,{...scene,minute:2},{now:now+1}));assert.equal(session.offer(fresh,{...scene,minute:3},{now:now+2}),null);session.reset();assert.equal(session.offer(fresh,{...scene,minute:4},{now:now+999999}),null);
assert.equal(discoveryCandidates(fresh,{title:'잠을 자는 중'}).length,0);
const numerical={id:'repeat',discovery:{version:1}};for(let i=0;i<300;i++)Object.assign(numerical,discoveryAnswer(numerical,q,0));assert.equal(numerical.discovery.scores.socialStyle,0);assert.equal(numerical.discovery.scores.neatness,100);assert(numerical.discovery.recent.length<=6);
console.log('PASS 25 traits, 24 situations / 120 localized choices, hidden multi-weights, locks, bounded changes, no backlog');
