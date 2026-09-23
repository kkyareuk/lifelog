import assert from 'node:assert/strict';
import {officeDuty} from '../office-work.js';
import {routineScene,nextRoutinePhaseAt} from '../routine-scenes.js';
import {careerWeeklyRoutines} from '../career-work.js';
import {todayCareerDuty} from '../salary.js';
import {buildingInterior} from '../building-interior-model.js';
const c={id:'worker',job:'회사원',wallet:{employments:[{id:'e',jobId:'builtin-office',rankId:'rank-1'}]},careerSchedules:{e:{days:[3],start:'09:00',end:'18:00'}}},world={uiLanguage:'ko'};
for(const [rank,role] of [['rank-1','junior'],['rank-2','junior'],['rank-3','lead'],['rank-4','lead'],['rank-5','lead'],['director','executive'],['ceo-rank-1','executive']]){
 c.wallet.employments[0].rankId=rank;
 const seen=[];for(let m=570;m<1060;m+=45){const d=new Date(2026,8,23,0,m),v=officeDuty(c,d,540,1080);assert.equal(v.officeRole,role);assert.deepEqual(v,officeDuty(structuredClone(c),d,540,1080));seen.push(v.officeTaskId);for(const lang of ['en','ja'])assert.notEqual(officeDuty(c,d,540,1080,lang).desc,v.desc)}
 assert.equal(new Set(seen).size,seen.length,'No repeated tasks in a standard workday');
}
const date=new Date(2026,8,23,11,10),scene={routineId:'career-work:e:3',routineType:'업무',careerEmploymentId:'e',routineStartMinute:540,routineEndMinute:1080,placeId:'office'};
const projected=routineScene(scene,c,world,date.getTime());assert(projected.officeTaskId);assert.equal(projected.placeId,'office');assert(nextRoutinePhaseAt(projected,date.getTime())>date.getTime());
assert.equal(todayCareerDuty(world,c,date).description,projected.desc);
assert.equal(officeDuty(c,new Date(2026,8,23,8),540,1080),null);
assert.equal(officeDuty(c,new Date(2026,8,23,18),540,1080),null);
assert.equal(officeDuty(c,new Date(2026,8,23,9,1),540,1080).officeTaskId,'arrival');
assert.equal(officeDuty(c,new Date(2026,8,23,17,55),540,1080).officeTaskId,'closing');
assert.equal(careerWeeklyRoutines(world,c).filter(r=>r.day===0).length,0);
c.wallet.employments.push({id:'second',jobId:'builtin-doctor',rankId:'rank-1'});
assert.equal(officeDuty(c,date,540,1080,'ko','second'),null);
const saved={rooms:{custom:{image:'kept.png',floorImage:'kept.png',usePhoto:true,floorMaterial:'custom'}}};
const interior=buildingInterior({id:'b',type:'사무실',interior:saved},'town');assert.equal(interior.rooms.custom.usePhoto,false);assert.equal(interior.rooms.custom.image,'kept.png');assert.equal(saved.rooms.custom.usePhoto,true);
assert(Object.values(buildingInterior({id:'b',type:'병원',interiorImage:'photo.png'},'town').rooms).every(r=>!r.usePhoto));
console.log('PASS480: rank boundaries, 3 languages, repeat-free workday, reload stability, schedule bounds, N-job isolation, photo preservation');
