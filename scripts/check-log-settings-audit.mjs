import assert from 'node:assert/strict';
import {viewSignals,relationshipReaction,relationshipBetween,automaticConflictAllowed} from '../relationship-context.js?v=20260909dev305';
import {lifeTask,lifeCopy} from '../life-tasks.js?v=20260909dev305';
import {relationshipAppraisal} from '../character-mood.js?v=20260909dev305';
const memory=new Map();
globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
globalThis.document={querySelector:()=>null,addEventListener(){},activeElement:null};
globalThis.window={addEventListener(){},dispatchEvent(){}};
const game=await import('../state.js?v=20260909dev305');
const sim=await import('../simulation.js?v=20260909dev305');
game.resetAll();
const {state}=game,aid=game.createCharacter(),bid=game.createCharacter();
const a=state.characters[aid],b=state.characters[bid];
Object.assign(a,{name:'A',createdAt:1,wake:'00:00',sleep:'23:59'});
Object.assign(b,{name:'B',createdAt:1,wake:'00:00',sleep:'23:59'});
const date=new Date();date.setHours(13,0,0,0);
const key=`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
assert.equal(viewSignals({annoyance:'전혀 귀찮거나 성가시지 않음'}).annoyed,false);
assert.equal(viewSignals({annoyance:'전혀 귀찮거나 성가시지 않지만 성가시다고 말함'}).annoyed,false);
assert.equal(viewSignals({fear:'전혀 두렵지 않음'}).afraid,false);
assert.equal(viewSignals({overall:'친구로 좋아함'}).romantic,false);
assert.equal(viewSignals({annoyance:'많이 귀찮고 성가심'}).annoyed,true);

const planned=lifeCopy(lifeTask('full_cook'),{planningStyle:'계획적'});
const spontaneous=lifeCopy(lifeTask('full_cook'),{planningStyle:'즉흥적'});
for(const lang of ['ko','en','ja'])assert.notEqual(planned[lang][1],spontaneous[lang][1]);
assert.notEqual(lifeCopy(lifeTask('hair_dry'),{bodyProfile:{appearance:{hairLength:'허리 길이'}}}).ko[1],lifeCopy(lifeTask('hair_dry'),{}).ko[1]);
assert.deepEqual(lifeCopy(lifeTask('full_cook'),{planningStyle:'계획적',speechStyle:'반말'}),lifeCopy(lifeTask('full_cook'),{planningStyle:'계획적',speechStyle:'존댓말'}),'This change does not override speech style');

const neutral=game.characterViewFor(aid,bid);
const fields={overall:'매우 싫어함',importance:'1순위 · 가장 중요한 사람',awareness:'감정을 우정으로 착각함',mutualAwareness:'상대의 마음을 전혀 모름',trust:'전혀 믿지 않음',fear:'많이 두려움',closeness:'남보다도 멂',comfort:'함께 있으면 매우 불편하고 대화도 전혀 통하지 않음',annoyance:'많이 귀찮고 성가심',attention:'늘 최우선으로 챙김',jealousy:'질투가 심함',conflictIntensity:'자주 충돌함',expectation:'곧 헤어질 거라고 예상함',touchIntensity:'신체 접촉 없음',aggression:'거친 말을 하고 싶은 충동',aggressionAction:'행동으로 옮기지 않음'};
for(const [field,value] of Object.entries(fields).filter(([field])=>field!=='importance')){
  const view={...neutral,[field]:value};
  if(['awareness','mutualAwareness'].includes(field))view.overall='깊이 사랑함';
  if(field==='aggressionAction')view.aggression='거친 말을 하고 싶은 충동';
  if(field==='aggression')view.aggressionAction='거친 말로만 표출함';
  const reaction=relationshipReaction(a,b,view,null,{kind:'talk'});
  assert(reaction.candidateKeys.includes(field),`${field} must reach the scene candidates`);
}
state.relationships={old:{a:aid,b:bid,type:'연인',temporalStatus:'past'},current:{a:aid,b:bid,type:'라이벌',temporalStatus:'current'}};
assert.equal(relationshipBetween(state,aid,bid).type,'라이벌');
state.characterViews={[aid]:{[bid]:{overall:'그저 그런 사람'}}};
state.relationships={couple:{a:aid,b:bid,type:'부부'}};
assert.equal(relationshipAppraisal(a,{withId:bid},state)[0].flags.loving,false,'An explicit neutral view is not overwritten by marriage');
delete state.characterViews[aid][bid];state.relationships.couple.temporalStatus='past';
assert.equal(relationshipAppraisal(a,{withId:bid},state)[0].flags.loving,false,'Former partners are not current lovers by default');
state.relationships={group:{a:'elsewhere',b:aid,groupMembers:['elsewhere',aid,bid],type:'친구'}};
assert.equal(relationshipBetween(state,aid,bid).type,'친구');

state.relationships={couple:{a:aid,b:bid,type:'부부'}};
game.updateCharacterView(aid,bid,'overall','깊이 사랑함');
game.updateCharacterView(bid,aid,'overall','매우 싫어함');
game.updateCharacterView(bid,aid,'trust','전혀 믿지 않음');
const command=(id,kind,options={})=>game.directCharacterActivity(id,kind,{now:date.getTime(),scenes:{[aid]:{home:true,room:'living',visitHomeId:a.homeId,townId:a.townId},[bid]:{home:true,room:'living',visitHomeId:a.homeId,townId:a.townId}},...options});
assert(command(aid,'hangout',{targetId:bid}));
const first=structuredClone(state.characterDirectives[aid].copy),second=state.characterDirectives[bid].copy;
assert.notEqual(first.ko.desc,second.ko.desc,'Each participant has their own reaction');
assert(['trust','overall','comfort'].includes(second.ko.relationshipCue));
for(const lang of ['en','ja'])assert(!/[가-힣]/.test(first[lang].desc+second[lang].desc));
sim.eventFor(a,date);const arrival=new Date(state.characterDirectives[aid].journey.arrivesAt+1000);
const saved=sim.eventFor(a,arrival);assert(saved.manualDirective);
state.uiLanguage='en';const translated=sim.eventFor(a,arrival);assert.equal(translated.desc,first.en.desc);
state.uiLanguage='ja';assert.equal(sim.eventFor(a,arrival).desc,first.ja.desc);
state.uiLanguage='ko';sim.eventFor(a,arrival);
const before=JSON.stringify(a.days[key].entries.filter(e=>e.manualDirective));
game.updateCharacterView(aid,bid,'overall','매우 싫어함');
sim.eventFor(a,arrival);assert.equal(JSON.stringify(a.days[key].entries.filter(e=>e.manualDirective)),before,'Settings edits do not rewrite the ongoing historical snapshot');
date.setMinutes(35);a.planningStyle='계획적';assert(command(aid,'meal',{lifeTask:'full_cook'}));
assert.match(state.characterDirectives[aid].copy.ko.desc,/정해 둔 순서/);
date.setMinutes(36);a.planningStyle='즉흥적';assert(command(aid,'meal',{lifeTask:'full_cook'}));
assert.match(state.characterDirectives[aid].copy.ko.desc,/진행하며 정/);

const calm={conflictIntensity:'갈등이 거의 없음',aggression:'공격 충동 없음'};
const tense={conflictIntensity:'자주 충돌함',aggression:'거친 말을 하고 싶은 충동'};
a.days={};b.days={};let fights=0;
for(let day=1;day<=30;day++)for(let hour=8;hour<=22;hour++){
  const d=new Date(2026,8,day,hour,0);
  assert.equal(automaticConflictAllowed(a,b,calm,calm,d,state),false);
  fights+=Number(automaticConflictAllowed(a,b,tense,tense,d,state));
}
assert(fights>0&&fights<150,`Frequent conflict is possible, not every encounter (${fights}/450)`);
a.days={[key]:{entries:[{minute:date.getHours()*60+date.getMinutes()-30,withId:bid,title:'B와 말다툼하는 중',automaticConflict:true}]}};
assert.equal(automaticConflictAllowed(a,b,tense,tense,date,state),false,'A recent fight gives the pair a cooldown');
console.log(`PASS settings-to-command path, 15 feeling fields (narrative weight tested separately in check-relationships317), official/explicit views, 3 languages, historical snapshots, conflict frequency (${fights}/450)`);
game.flushSave(false);
