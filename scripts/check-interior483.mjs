import assert from 'node:assert/strict';
import {defaultBuildingRooms} from '../building-interior-presets.js';
import {buildingInterior} from '../building-interior-model.js';
import {buildingRoomKey} from '../building-room-location.js';
import {contextDestination} from '../context-actions.js?v=20260909dev305';
import {planMeetingJourney,meetingScene} from '../meeting-journey.js?v=20260909dev305';
import {officeDuty} from '../career-duties.js';
import {careerWeeklyRoutines} from '../career-work.js';
import {routineScene,nextRoutinePhaseAt} from '../routine-scenes.js';
const place={id:'hall',type:'공연장',name:'Hall'},town={id:'t',places:[place]},world={uiLanguage:'ko',activeTownId:'t',towns:[town],world:town,homes:{},characters:{},characterDirectives:{}};
for(const lang of ['ko','en','ja']){
 const old=defaultBuildingRooms(place,lang,false);assert.equal(Object.keys(old).length,4);
 assert.equal(Object.keys(buildingInterior({...place,interior:{rooms:old}},'t',lang).rooms).length,3);
 old.area0.name='Custom';assert.equal(Object.keys(buildingInterior({...place,interior:{rooms:old}},'t',lang).rooms).length,4);
}
const home=buildingInterior(place,'t'),c={id:'performer',name:'Performer',townId:'t',job:'가수',wallet:{employments:[{id:'e',jobId:'builtin-singer',rankId:'rank-1'}]}};
assert.equal(buildingRoomKey(home,{room:'living',lifeTaskId:'clean'}),'area3');
assert.equal(buildingRoomKey(home,{room:'area0',lifeTaskId:'clean'}),'area0');
const destination=contextDestination(world,c,{type:'furniture',placeId:'hall',homeId:home.id,room:'area0',id:'area0-f0'},'music',Date.now(),'play_piano');assert(destination);assert.equal(destination.room,'area0');
assert.equal(contextDestination(world,c,{type:'furniture',placeId:'hall',homeId:home.id,room:'area3',id:'area3-f0'},'music',Date.now(),'play_piano'),null);
const now=new Date(2026,8,23,15,0).getTime(),journey=planMeetingJourney(world,c,c,now,{},destination),directive={id:'d',journey,startedAt:now,endsAt:now+1800000,lifeTask:'play_piano'};
assert.equal(journey.to.room,'area0');assert.equal(meetingScene({},directive,c.id,journey.arrivesAt+1).room,'area0');
for(const jobId of ['builtin-singer','builtin-idol']){
 c.wallet.employments[0].jobId=jobId;
 const routine=careerWeeklyRoutines(world,c).find(r=>r.day===3);assert.equal(routine.placeId,'hall');
 const start=Number(routine.start.slice(0,2))*60,end=Number(routine.end.slice(0,2))*60;
 for(const lang of ['ko','en','ja']){
  const titles=new Set();for(let m=start+10;m<end-10;m+=35){const duty=officeDuty(c,new Date(2026,8,23,0,m),start,end,lang,'e');assert(duty.desc);titles.add(duty.title);assert.equal(buildingRoomKey(home,duty),'area0')};assert(titles.size>=5);
  assert.equal(buildingRoomKey(home,officeDuty(c,new Date(2026,8,23,0,start+1),start,end,lang,'e')),'area2');
 }
 assert.equal(officeDuty(c,new Date(2026,8,23,0,start-1),start,end,'ko','e'),null);
 assert.equal(officeDuty(c,new Date(2026,8,23,0,end),start,end,'ko','e'),null);
 const scene=routineScene({routineId:'r',routineType:'업무',careerEmploymentId:'e',routineStartMinute:start,routineEndMinute:end,placeId:'hall'},c,world,now);assert(scene.officeTaskId);assert(nextRoutinePhaseAt(scene,now)>now);
 c.workplaceId='other';assert.equal(careerWeeklyRoutines(world,c)[0].placeId,'other');delete c.workplaceId;
}
console.log('PASS483 domain: default migration/custom preservation, validated instrument, destination room retention, performer venue/schedule/3-language duties and phase boundaries');
