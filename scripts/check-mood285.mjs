import assert from 'node:assert/strict';
import {characterMood} from '../character-mood.js';
import {localizeLifeLog} from '../life-log-localization.js';
const a={id:'a',name:'A',townId:'t'},b={id:'b',name:'B',townId:'t'},world={uiLanguage:'ko',characters:{a,b},relationships:{r:{a:'a',b:'b',type:'연인'}},towns:[],homes:{},world:{id:'t'}};
const scene={groupInteraction:true,withId:'b',withIds:['b'],title:'조심스러운 키스를 나누는 중',desc:'서로의 마음을 확인했어요.',home:true};
assert.equal(characterMood(a,scene,world).label,'설렘');
assert.equal(characterMood(a,{...scene,title:'화해의 키스를 나누는 중'},world).label,'누그러짐');
assert.equal(characterMood(a,{...scene,meetingKind:'affection'},world).label,'불타오름');
assert.notEqual(characterMood(a,{...scene,desc:'상대가 원하지 않아 거절했어요.'},world).label,'설렘');
for(const language of ['en','ja']){const log=localizeLifeLog({...scene,mentorScene:true,mentorTeaching:true},language,world,'a');assert.ok(log.title.includes('B'));assert.ok(!/[가-힣]/.test(log.title))}
console.log('PASS contextual contact mood, refusal exclusion and mentor log translations');
