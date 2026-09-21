import assert from 'node:assert/strict';
import {pickHomeNarrative,homeNarrativeKey,recentNarrativeEntries,mayFollowUp} from '../narrative-selection.js';
import {topicConversation} from '../conversation-narrative.js';
const pool=[['same','first','living','a'],['same','second','living','b']];
let recent=[];for(let i=0;i<30;i++){const choice=pickHomeNarrative(pool,recent,'stable');assert.notEqual(homeNarrativeKey(choice),recent[0]?.narrativeKey);recent=[{narrativeKey:homeNarrativeKey(choice)},...recent].slice(0,5);assert.deepEqual(choice,pickHomeNarrative(pool,recent.slice(1),'stable'));}
assert.equal(pickHomeNarrative([],[],'s'),null);assert.equal(pickHomeNarrative([pool[0]],recent,'s'),pool[0]);
assert.equal(pickHomeNarrative(pool,[{desc:'first extra flavor'}],'s'),pool[1]);
assert.equal(mayFollowUp({homeFollowup:true},pool[0]),false);
const character={days:{'2026-9-30':{entries:[{minute:500,id:'old'}]},'2026-10-1':{entries:[{minute:501,id:'current'},{minute:499,id:'new'}]},'2026-10-2':{entries:[{minute:1,id:'future'}]}}};
assert.deepEqual(recentNarrativeEntries(character,'2026-10-1',500).map(e=>e.id),['new','old']);
const a={id:'a',name:'가람',favoriteStoryGenres:['추리'],days:{}},b={id:'b',name:'나루',dislikedStoryGenres:['추리'],personalityTypes:['직설적'],days:{}};
const options={seed:'fixed',day:'2026-9-21',minute:600};
const first=topicConversation({},a,b,'추리','ko',options);a.days={'2026-9-21':{entries:[{minute:590,desc:first.speakerText}]}};
const second=topicConversation({},a,b,'추리','ko',options);assert.notEqual(first.speakerText,second.speakerText);
assert.equal(second.speakerText,topicConversation({},JSON.parse(JSON.stringify(a)),b,'추리','ko',options).speakerText);
for(const lang of ['ko','en','ja']){const result=topicConversation({},a,b,'추리',lang,options);assert(result.speakerText&&!/undefined|\. ,|。 ,/.test(result.listenerText));assert.equal(result.mode,'disagree');}
b.personalityTypes=['내향적'];assert.equal(topicConversation({},a,b,'추리','ko',options).mode,'polite-distance');assert(!topicConversation({},a,b,'추리','en',options).listenerText.includes('more weight'));
assert(topicConversation({},a,b,'사용자 정의 주제','ko',options).speakerText.includes('사용자 정의 주제'));
console.log('PASS recent selection: exhaustion, reload, old logs, date boundaries, multilingual concrete topic and personality branches');
