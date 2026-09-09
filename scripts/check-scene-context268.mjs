import assert from 'node:assert/strict';
import {conflictEvidence,dailyInteractionLine} from '../scene-context.js';
const negative='둘이 싸우지 않고 돌아올 자리를 지켜주었어요';
assert.doesNotMatch(conflictEvidence(negative),/싸우|싸움/);
assert.match(conflictEvidence('둘이 싸우며 언성을 높였어요'),/싸우/);
assert.match(conflictEvidence('싸우지 않고 기다리다가 결국 다투었어요'),/다투/);
assert.doesNotMatch(conflictEvidence('다투지 않고 갈등을 피했어요'),/다투|갈등/);
const a={id:'a',name:'민',socialEnergy:1,interests:['원예']},b={id:'b',name:'준',interests:['원예']};
assert.match(dailyInteractionLine(a,b,{}, {},0),/원예/);
assert.match(dailyInteractionLine(a,b,{type:'공원'}, {},1),/걸음/);
assert.match(dailyInteractionLine(a,b,{type:'도서관'}, {},1),/읽던/);
assert.match(dailyInteractionLine(a,b,{}, {overall:'불편함'},0),/간격/);
assert.notEqual(dailyInteractionLine(a,b,{}, {},1),dailyInteractionLine({...a,socialEnergy:5,characterTraits:['장난꾸러기']},b,{}, {},1));
assert.match(dailyInteractionLine(a,b,{}, {},2,'ko',{a:'a',b:'b',sourceRole:'보호자'}),/필요한 것/);
for(const language of ['ko','en','ja']){
 const lines=Array.from({length:12},(_,i)=>dailyInteractionLine(a,b,{}, {},i,language));
 assert.ok(new Set(lines).size>=3);
 assert.ok(lines.every(s=>!s.includes('undefined')&&!s.includes('싸우지')));
}
console.log('PASS peaceful negation, positive conflict, place, personality, shared interest, guardian role and three languages');
