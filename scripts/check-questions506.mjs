import assert from 'node:assert/strict';
import {DISCOVERY_SCENES as events,discoveryChoices,discoveryAnswer,DISCOVERY_AXES} from '../character-discovery-rules.js';
const revised=events.filter(q=>q.choiceRevision===506),fresh=()=>({id:'qa',name:'가람',bodyProfile:{},discovery:{lockRevision:333,locks:{}}});
assert.equal(revised.length,17);
for(const q of revised){
 assert.equal(new Set(q.choices.map(c=>c.text.ko)).size,q.choices.length,q.id);
 for(const [i,c] of q.choices.entries()){
  for(const lang of ['ko','en','ja'])assert(c.text[lang]&&q.question[lang]);
  for(const [key,v] of Object.entries(c.targets||{})){assert(DISCOVERY_AXES[key]);assert(v===null||typeof v==='object'||Number.isFinite(v)&&v>=0&&v<=100);}
  const patch=discoveryAnswer(fresh(),q,i,123456);assert(patch,q.id);assert(patch.discovery.answered.includes(q.id));
 }
 for(let n=0;n<100;n++){const offered=discoveryChoices(fresh(),q);assert.equal(offered.length,5);assert.equal(new Set(offered.map(x=>x.index)).size,5);if(q.choices.some(x=>x.alwaysOffer))assert(offered.some(x=>x.choice.alwaysOffer));}
}
for(const id of ['profile-skill-help','profile-hobby-free-hour','profile-disliked-drink']){const q=events.find(x=>x.id===id),c=fresh();Object.assign(c,{skills:['그림'],hobbies:['독서'],dislikedDrinks:['차']});const patch=discoveryAnswer(c,q,q.choices.findIndex(x=>x.alwaysOffer));assert(!patch.skills&&!patch.hobbies&&!patch.dislikedDrinks);assert(patch.discovery.answerCount===1);}
const tattoo=events.find(x=>x.id==='profile-tattoo-encounter');assert(!discoveryAnswer(fresh(),tattoo,4).bodyProfile);assert(!discoveryAnswer(fresh(),tattoo,4).attractionTraits);
const cake=events.find(x=>x.id==='dilemma-last-dessert');const locked=fresh();locked.discovery.locks.morality=true;locked.discovery.scores={morality:90};assert.equal(discoveryAnswer(locked,cake,2).discovery.scores.morality,90);
console.log('PASS506',revised.length,'revised questions: distinct translated choices, valid effects, save history, 1700 samples, neutral coverage, tattoo identity and manual settings preserved');
