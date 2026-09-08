import assert from 'node:assert/strict';
import {planMeetingJourney,meetingScene,journeyPosition} from '../meeting-journey.js';
import {advanceSharedLife} from '../server-life.mjs';
const world={homes:{one:{id:'one',mapX:15,mapY:20,rooms:{living:{floor:1},bedroom:{floor:2}}},two:{id:'two',mapX:75,mapY:60,rooms:{living:{floor:1}}}},world:{places:[]}};
const a={id:'a',name:'A',homeId:'one',townId:'t'},b={id:'b',name:'B',homeId:'two',townId:'t'},now=Date.now();
const journey=planMeetingJourney(world,a,b,now,{home:true,room:'living'},{home:true,room:'living'}),directive={journey,startedAt:now,endsAt:now+600000,withIds:['a','b'],targetId:'b',copy:{ko:{title:'함께 대화하는 중',desc:'서로 이야기하고 있어요.'}}};
assert.deepEqual(journey.segments.map(s=>s.surface),['home','town','home']);
const before=JSON.stringify({world,directive});
for(let time=now;time<journey.arrivesAt;time+=16){
 const walking=meetingScene({},directive,'a',time),waiting=meetingScene({},{...directive,targetId:'a'},'b',time);
 assert.equal(waiting.visitHomeId,'two');assert.ok(waiting.meetingWaiting);assert.match(walking.title,/만나러/);
 const pos=journeyPosition(walking.meetingJourney,time);assert.ok(Number.isFinite(pos.x)&&Number.isFinite(pos.y));
}
assert.equal(JSON.stringify({world,directive}),before,'Thousands of animation frames do not mutate or save route data');
const end=meetingScene({},directive,'a',journey.arrivesAt);assert.equal(end.visitHomeId,'two');assert.equal(end.room,'living');assert.equal(end.groupInteraction,true);assert.equal(end.meetingJourney,null);
const upstairs=planMeetingJourney(world,a,{...b,homeId:'one'},now,{home:true,room:'living'},{home:true,room:'bedroom'});assert.deepEqual(upstairs.segments.map(s=>s.fromRoom),['living','bedroom']);
const snapshot={group:{id:'g',towns:[{id:'t',name:'Town',places:[]}]},homes:Object.values(world.homes).map(h=>({...h,ownerUid:h.id==='one'?'u1':'u2',sourceHomeId:h.id,townId:'t',layoutJson:JSON.stringify(h)})),residents:[a,b].map((c,i)=>({id:c.id,name:c.name,ownerUid:'u'+(i+1),sourceHomeId:c.homeId,townId:'t',profileJson:JSON.stringify({...c,createdAt:1,wake:'07:00',sleep:'23:00'}),lifeJson:JSON.stringify({scene:{home:true,room:'living',visitHomeId:c.homeId,title:'쉬는 중',townId:'t'}})}))};
const start=advanceSharedLife(snapshot,now,{characterId:'a',targetId:'b',kind:'talk'});
const lives=start.map(r=>JSON.parse(r.lifeJson));assert.equal(lives[0].directive.journey.to.homeId,'two');assert.equal(lives[1].scene.visitHomeId,'two');
const synchronized={...snapshot,residents:snapshot.residents.map(r=>({...r,lifeJson:start.find(l=>l.id===r.id).lifeJson}))};
const arrived=advanceSharedLife(synchronized,now+55000).map(r=>JSON.parse(r.lifeJson));assert.ok(arrived.every(l=>l.scene.visitHomeId==='two'&&/대화/.test(l.scene.title)));assert.deepEqual(arrived[0].directive.journey,lives[0].directive.journey);
console.log('PASS meeting: source house → town → target house, separate floors, receiver waits, arrival scene, immutable local animation and server snapshot round trip');
