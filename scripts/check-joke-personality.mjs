import assert from 'node:assert/strict';
import {playfulPersonality,oneSidedJoke,dailyInteractionLine} from '../scene-context.js';
const cold={id:'a',name:'A',humorStyle:'장난을 거의 하지 않음',personalityTypes:['냉정하고 논리적','다정하고 세심함','무심하고 독립적'],conflictStyle:'바로 따짐',socialEnergy:1};
const easy={id:'b',name:'B',humorStyle:'장난을 즐김',personalityTypes:['차분하고 신중함'],diligence:'매우 느긋함'};
assert.equal(playfulPersonality(cold),false);assert.equal(playfulPersonality({...cold,personalityTypes:['장난기 많음']}),false);
for(const lang of ['ko','en','ja'])for(let n=0;n<8;n++){
 const p=oneSidedJoke(cold,easy,n,lang),r=oneSidedJoke(easy,cold,n,lang);assert.equal(p.first,r.second);assert.equal(p.second,r.first);assert.ok(p.first&&p.second);
 if(lang==='ko'){assert.doesNotMatch(p.first,/웃|농담으로|받아치/);assert.match(p.second,/여유롭게/);assert.match(p.first,n%2===0?/짜증/:/대꾸하지/)}
}
assert.equal(oneSidedJoke(easy,{...easy,id:'c'},0),null);assert.equal(oneSidedJoke(cold,{...cold,id:'c'},0),null);
for(let n=0;n<12;n++)assert.doesNotMatch(dailyInteractionLine({...cold,socialEnergy:5},easy,{}, {},n),/농담|장난/);
console.log('PASS explicit low humor, mixed traits, asymmetric responses, reverse perspectives, relaxed follow-up and KO/EN/JA');
