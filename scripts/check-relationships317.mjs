import assert from 'node:assert/strict';
import {OFFICIAL_RELATIONSHIP_DETAILS as specs,normalizeRelationshipDetails,relationshipReality,narrativeRate} from '../official-relationship-details.js?v=20260909dev305';
import {relationshipMemory} from '../relationship-memories.js?v=20260909dev305';
import {relationshipReaction} from '../relationship-context.js?v=20260909dev305';
import {personConversation,topicConversation} from '../conversation-narrative.js?v=20260909dev305';
import {leisureNarrative} from '../leisure-narrative.js?v=20260909dev305';
import {ADULT_AGE_GROUPS} from '../age-groups.js?v=20260909dev305';
const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};globalThis.document={querySelector:()=>null,addEventListener(){},activeElement:null};globalThis.window={addEventListener(){},dispatchEvent(){}};
const game=await import('../state.js?v=20260909dev305');game.resetAll();const {state}=game,a=state.characters[game.createCharacter()],b=state.characters[game.createCharacter()],c=state.characters[game.createCharacter()];a.name='A';b.name='B';c.name='C';
assert.equal(Object.keys(specs).length,23);let checked=0;
for(const [type,spec]of Object.entries(specs))for(const f of spec.fields)for(const o of f.options){
 state.relationships={};const details={[f.id]:o.id};assert.deepEqual(normalizeRelationshipDetails(type,{...details,invented:'x'}),details);
 const id=game.addRelationship({a:a.id,b:b.id,type,details});assert.deepEqual(state.relationships[id].details,details);
 for(const language of ['ko','en','ja']){const scene=relationshipMemory(a,b,state.relationships[id],{importance:'높음'},{language,seed:'case'});assert(scene?.text);assert(!scene.text.includes('undefined'));assert(scene.solo);if(language!=='ko')assert(!/[가-힣]/.test(scene.text));checked++}
 game.updateRelationship(id,{type:'친구',details:{origin:'invalid'}});assert.deepEqual(state.relationships[id].details,{});
}
const r={id:'r',type:'부부',stage:'이혼 서류가 오가는 중',details:{origin:'2'}},view={importance:'높음',overall:'애증을 느낌',closeness:'가까운 사이',trust:'의심함'};
assert.equal(relationshipReality(r,view).tone,'strained');assert.equal(relationshipReality({...r,stage:'권태기'},view).tone,'uneasy');
assert.equal(relationshipReality(r,{...view,importance:'비중 없음'}).tone,'practical');assert.equal(relationshipReality(r,{...view,overall:'그저 그런 사람'}).tone,'practical');
for(let seed=0;seed<100;seed++){
 const zero=relationshipMemory(a,b,r,{...view,importance:'비중 없음'},{seed});assert(!/후회|미련|되돌릴|선택할 수/.test(zero.text));
 const mild=relationshipMemory(a,b,{...r,stage:'권태기'},view,{seed});assert(/당시|그때|어긋남/.test(mild.text));
 const noHistory=relationshipMemory(a,b,{type:'부부',details:{}},view,{seed});assert.equal(noHistory,null);
 const selected=relationshipMemory(a,b,{...r,details:{firstMeeting:'rain'}},view,{seed});assert(selected.text.includes('처마'));assert(!selected.text.includes('벚꽃'));
}
const counts=[];for(const importance of ['비중 없음','낮음','보통','높음','매우 높음']){let n=0;for(let seed=0;seed<1000;seed++)n+=relationshipReaction(a,b,{...view,importance},r,{seed}).key.startsWith('memory:');counts.push(n)}assert.equal(counts[0],0);for(let i=1;i<counts.length;i++)assert(counts[i]>counts[i-1]);
for(const type of Object.keys(specs))assert.equal(game.relationshipViewDefaults(type).importance,'비중 없음');
for(const age of ADULT_AGE_GROUPS){a.ageGroup=age;b.ageGroup='성인';for(const[x,y]of[[a,b],[b,a]])game.updateCharacterView(x.id,y.id,'touchIntensity','성인 간 친밀한 접촉까지');assert(game.contactAllowed(a,b,'affection'),age)}
for(const age of ['영아','유아','어린이','청소년','나이 불명']){a.ageGroup=age;assert(!game.contactAllowed(a,b,'affection'),age)}
state.characterViews={[a.id]:{[c.id]:{overall:'연애 감정으로 좋아함',awareness:'자기 감정을 전혀 모름'}},[b.id]:{[c.id]:{overall:'매우 싫어함'},[a.id]:{conflictIntensity:'자주 충돌함'}}};
c.personalityTypes=['냉정하고 논리적'];a.personalityTypes=['수줍고 내향적'];b.personalityTypes=['수줍고 내향적'];
let talk=personConversation(state,a,b,c);assert(talk.speakerText.includes('나쁘지 않'));assert(!talk.speakerText.includes('끌린다'));assert.equal(talk.mode,'polite-distance');
state.characterViews[a.id][c.id].overall='친구로 좋아함';assert(!personConversation(state,a,b,c).speakerText.includes('끌린다'));state.characterViews[a.id][c.id].overall='연애 감정으로 좋아함';
b.personalityTypes=['완고함'];talk=personConversation(state,a,b,c);assert.equal(talk.mode,'argument');
state.characterViews[b.id][a.id].fear='많이 두려움';assert.equal(personConversation(state,a,b,c).mode,'polite-distance');
a.favoriteStoryGenres=['청춘'];b.dislikedStoryGenres=['청춘'];state.characterViews[b.id][a.id]={conflictIntensity:'자주 충돌함'};assert.equal(topicConversation(state,a,b,'청춘').mode,'argument');assert.equal(topicConversation(state,a,b,'청춘','ko',{allowConflict:false}).mode,'disagree');
assert(game.directCharacterActivity(a.id,'talk',{targetId:b.id,subjectId:c.id,now:Date.now()}));assert(state.characterDirectives[a.id].copy.ko.desc.includes('나쁘지 않'));assert(state.characterDirectives[b.id].copy.ko.desc.includes('이야기'));assert.equal(state.characterDirectives[a.id].subjectId,c.id);
const topics=['청춘','추리','로맨스','판타지','공포','코미디','음악','게임','공예','다큐','요리','축구','알 수 없는 사용자 취향'];
const distinct=new Set();for(const topic of topics)for(const language of ['ko','en','ja']){const scene=leisureNarrative(a,topic,'test',language);assert(scene.text);if(language==='ko')distinct.add(scene.text);else assert(!/[가-힣]/.test(scene.text))}assert.equal(distinct.size,topics.length);
a.personalityTypes=['무심하고 독립적'];assert(!leisureNarrative(a,'청춘').text.includes('입꼬리'));a.personalityTypes=['활발함'];assert(leisureNarrative(a,'청춘').text.includes('입꼬리'));assert(!leisureNarrative(a,'청춘','x','ko',{moodScore:-20}).text.includes('입꼬리'));
console.log(JSON.stringify({types:23,fields:46,options:138,localizedOptionChecks:checked,weightCounts:counts,leisureCategories:topics.length,adultGroups:ADULT_AGE_GROUPS.length,status:'PASS'}));game.flushSave(false);
