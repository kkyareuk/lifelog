import assert from 'node:assert/strict';
import {DISCOVERY_SCENES as events,discoveryEligible,discoveryAnswer,discoveryLocked} from '../character-discovery-rules.js';
const find=id=>events.find(q=>q.id===id);
const c={gender:'여성',ageGroup:'청년',bodyProfile:{appearance:{hairColor:'검은색'},medications:[{name:'약'}],tattoos:[{name:'꽃'}]},discovery:{locks:{neatness:true},scores:{neatness:68}}};
for(const id of ['profile-age-peer','profile-gender-card','profile-hair-color','profile-tattoo-encounter'])assert(!discoveryEligible(c,find(id)),id);
assert(discoveryLocked(c,'bodyProfile.medications'));assert(!discoveryLocked(c,'neatness'));assert.equal(c.discovery.scores.neatness,68);
const blank={gender:'설정하지 않음',bodyProfile:{appearance:{hairColor:'설정하지 않음'}}};assert(discoveryEligible(blank,find('profile-gender-card')));const patch=discoveryAnswer(blank,find('profile-gender-card'),0,1,'여성');assert.equal(patch.gender,'여성');Object.assign(blank,patch);assert(!discoveryEligible(blank,find('profile-gender-intro')));assert.equal(discoveryAnswer(blank,find('profile-gender-card'),0,2,'남성'),null);
const none={bodyProfile:{medications:[]},discovery:{known:{'bodyProfile.medications':true}}};assert(discoveryLocked(none,'bodyProfile.medications'));console.log('PASS fixed identity/body only when unset, first answer final, explicit none, personality unlocked and scores retained');
