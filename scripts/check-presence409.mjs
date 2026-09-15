import {advanceSharedLife} from '../server-life.mjs';
import assert from 'node:assert/strict';
const S=await import('../state.js?v=20260909dev305'),{createCharacter,runIsolatedWorld}=S;
const {buildSharedWorld}=await import('../shared-world.js?v=20260909dev305');
const {eventFor,visibleTimeline,timeline}=await import('../simulation.js?v=20260909dev305');
const id=createCharacter(5),profile=structuredClone(S.state.characters[id]);profile.createdAt=1;
const snapshot={group:{id:'g',towns:[{id:'t',name:'Village',places:[{id:'hospital',name:'병원',type:'병원',x:50,y:50}]}]},residents:[0,1].map(i=>({id:'r'+i,ownerUid:'u'+i,name:'Resident '+i,townId:'t',sharedHomeId:'h',profileJson:JSON.stringify({...profile,bodyProfile:{...profile.bodyProfile,...(i?{carePlan:{mode:'낮 병동',weekdays:['월'],start:'09:00',end:'16:00',placeId:'hospital'}}:{})}}),scheduleJson:'{}'})),homes:[{id:'h',name:'Home',townId:'t',layoutJson:JSON.stringify({rooms:{living:{id:'living',type:'living',name:'거실',furniture:[]},bedroom:{id:'bedroom',type:'bedroom',name:'침실',furniture:[]}}})}]};
const date=new Date('2026-09-14T11:00:00+09:00');
runIsolatedWorld(buildSharedWorld(snapshot),()=>{
 const a=S.state.characters.r0,b=S.state.characters.r1;
 for(const c of [a,b])timeline(c,date);
 const row={minute:660,time:'11:00',home:true,homeId:'h',room:'living',title:'상대와 대화하는 중',desc:'같은 방에서 상대에게 말을 건네고 있어요.',withId:'r1',withIds:['r1'],holdMinutes:30};
 a.days['2026-9-14'].entries.push(row);
 b.days['2026-9-14'].entries.push({...row,withId:'r0',withIds:['r0']});
 assert.equal(eventFor(b,date).routineId,'care-r1');
 assert(!eventFor(a,date).withIds?.includes('r1'),'absent housemate must not be an interaction');
 const logs=visibleTimeline(b,date);assert(logs.filter(x=>x.minute>=540&&x.minute<960).every(x=>x.routineId==='care-r1'),'hospital interval contains home filler');
 assert(!visibleTimeline(a,date).some(x=>x.withId==='r1'&&x.minute===660),'home log has absent partner');
 delete S.state.characters.r1;S.state.order=['r0'];a.days['2026-9-14'].entries.push({...row,withId:undefined,withIds:[],profileScene:true});
 for(const lang of ['ko','en','ja']){S.state.uiLanguage=lang;assert(!/상대와|상대에게/.test(eventFor(a,date).title+' '+eventFor(a,date).desc));}
});
console.log('PASS407 same-home absent partner, both directions, hospital logs, legacy solo profile wording, KO EN JA');


const records=advanceSharedLife(snapshot,date.getTime());
const outside=JSON.parse(records.find(r=>r.id==='r1').lifeJson);
assert(outside.days['2026-9-14'].entries.filter(e=>e.minute>=540&&e.minute<=660).every(e=>e.routineId==='care-r1'),'wire payload exposed unfiltered home filler');
assert.equal(outside.scene.routineId,'care-r1');
console.log('PASS409 shared server persistence excludes home filler during hospital routine');

assert(outside.days['2026-9-14'].entries.some(e=>e.minute>660),'server must retain future schedule entries for next transitions');
