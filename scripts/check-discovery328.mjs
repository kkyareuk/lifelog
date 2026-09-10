import assert from 'node:assert/strict';
import {DISCOVERY_SCENES as events,discoveryAnswer,discoveryCandidates,discoveryChoices,manualDiscoveryPatch,discoveryLocked} from '../character-discovery-rules.js';
import {recordFormPatch} from '../discovery-records.js';
const fresh=()=>({id:'x',bodyProfile:{tattoos:[],medications:[],hospitalVisits:[],appearance:{}},discovery:{version:2},attractionTraits:[],dislikedAttractionTraits:[]}),q=id=>events.find(q=>q.id===id);
for(const e of events)for(const l of ['ko','en','ja']){assert(e.question[l]);e.choices.forEach(c=>assert(c.text[l]));}
let c=fresh(),patch=discoveryAnswer(c,q('early'),5);assert.equal(patch.discovery.scores.planningStyle,58);assert.equal(patch.discovery.scores.interference,58);assert.equal(patch.discovery.scores.impulseControl,58);
assert.equal(discoveryAnswer(c,q('early'),6).discovery.scores.planningStyle,42);
patch=discoveryAnswer(c,q('rain'),5);assert.equal(patch.discovery.scores.planningStyle,58);assert.equal(patch.discovery.scores.impulseControl,46);assert.equal(discoveryAnswer(c,q('rain'),6).discovery.scores.aggressionLevel,18);
for(let i=0;i<50;i++){const choices=discoveryChoices(c,q('rain'));assert.equal(choices.length,5);assert.equal(choices.filter(c=>c.choice.stance).length,2);}
Object.assign(c,discoveryAnswer(c,q('profile-tattoo-encounter'),4));assert(c.attractionTraits.includes('문신이 있음'));assert.equal(c.bodyProfile.tattoos.length,0);
c=fresh();Object.assign(c,discoveryAnswer(c,q('profile-tattoo-encounter'),2));assert(c.dislikedAttractionTraits.includes('문신이 있음'));assert.equal(c.bodyProfile.tattoos.length,0);
c=fresh();Object.assign(c,discoveryAnswer(c,q('profile-tattoo-encounter'),0));assert(discoveryCandidates(c,{title:'걷는 중'}).includes(q('profile-tattoo-details')));
const rows=[{name:'꽃',location:'왼팔',type:'꽃·식물',attitude:'아끼며 드러내고 싶어함'},{name:'기억',location:'오른팔',type:'문자·문구',attitude:'그때의 기억을 떠올림'}];
const form={base:{tattoos:structuredClone(c.bodyProfile.tattoos)},records:{tattoos:rows},values:{}};Object.assign(c,discoveryAnswer(c,q('profile-tattoo-details'),0,1,form));assert.equal(c.bodyProfile.tattoos.length,2);assert.equal(c.bodyProfile.tattoos[1].attitude,'그때의 기억을 떠올림');assert.equal(discoveryAnswer(c,q('profile-tattoo-details'),0,2,form),null);
c=fresh();let data={values:{heightCm:'172.5'},records:{},base:{}};patch=discoveryAnswer(c,q('profile-height'),0,1,data);assert.equal(patch.bodyProfile.heightCm,'172.5');data.values.heightCm='invalid';assert.equal(discoveryAnswer(c,q('profile-height'),0,1,data),null);
assert.equal(recordFormPatch(c,'weight',{values:{bodySize:'마른 체형'},records:{}},discoveryLocked).bodyProfile.bodySize,'마른 체형');
const checkup={values:{heightImpression:'키가 큰 편',healthConditions:['천식'],healthOther:'설정 메모'},base:{medications:[],hospitalVisits:[]},records:{medications:[{name:'캐릭터의 약',purpose:'호흡기 관리',frequency:'매일 아침',notes:'설정'}],hospitalVisits:[{department:'내과',purpose:'통원 치료',frequency:'주 1회 이상'}]}};
patch=discoveryAnswer(c,q('profile-checkup'),0,1,checkup);assert.equal(patch.bodyProfile.medications[0].name,'캐릭터의 약');assert.deepEqual(patch.bodyProfile.hospitalDepartments,['내과']);assert.deepEqual(patch.bodyProfile.healthConditions,['천식']);assert.equal(patch.discovery.known['bodyProfile.weightKg'],undefined);
Object.assign(c,manualDiscoveryPatch(c,{bodyProfile:{...c.bodyProfile,medications:[{name:'보존'}]}}));assert(discoveryLocked(c,'bodyProfile.medications'));patch=discoveryAnswer(c,q('profile-checkup'),0,1,checkup);assert.equal(patch.bodyProfile.medications[0].name,'보존');
c=fresh();c.bodyProfile.tattoos=[{name:'외부 수정'}];assert.equal(recordFormPatch(c,'tattoos',{base:{tattoos:[]},records:{tattoos:rows}},discoveryLocked),null);
console.log('PASS contrasting weights ±2, stratified random choices, preference tags, atomic repeatable tattoos/medication/visits/checkup, decimals, locks, stale collection protection, no repeat');

const {createDiscoverySession}=await import('../character-discovery-rules.js');
const session=createDiscoverySession(()=>.1),scene={minute:10,title:'걷는 중'};
assert.equal(session.offer(fresh(),scene,{blocked:true,now:1000000}),null);
assert(session.offer(fresh(),scene,{now:1000000}));
session.reset();assert.equal(session.offer(fresh(),scene,{now:1000001}),null);
assert(events.flatMap(q=>q.choices).some(c=>Object.values(c.effects).some(n=>typeof n==='number'&&n<0)));
const {interactionPriority,strangerScene}=await import('../stranger-interactions.js');
assert.equal(interactionPriority({type:'가족'},{overall:'매우 싫어함'}),2);
assert.equal(interactionPriority(null,{overall:'인간적인 호감'}),1);
assert.equal(interactionPriority({type:'연인',temporalStatus:'past'},{}),0);
assert.equal(interactionPriority(null,{overall:'그저 그런 사람',annoyance:'전혀 성가시지 않음'}),0);
for(const language of ['ko','en','ja'])for(let i=0;i<4;i++){const s=strangerScene({id:'a'},{id:'b'},i,language);assert(s.first&&s.second&&s.relationshipContext);}
console.log('PASS startup question once despite tab/visibility resets, deferred blocked dialogs, negative weights, official > positive view > stranger, 12 localized stranger scenes');

const {discoveryWait}=await import('../character-discovery-rules.js');
assert.equal(discoveryWait(1000000,1000000),600000);assert.equal(discoveryWait(1000000,1600000),0);assert.equal(discoveryWait(1000000,87400000),0);
let stable=fresh();for(let i=0;i<100;i++){stable.discovery.answered=[];stable.discovery.recent=[];Object.assign(stable,discoveryAnswer(stable,q('early'),5));}assert(stable.discovery.scores.planningStyle<=90);assert(stable.discovery.scores.planningStyle>89);
console.log('PASS bounded target convergence, ten-minute availability, no 24-hour expiry');
