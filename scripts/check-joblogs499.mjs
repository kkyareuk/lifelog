import assert from 'node:assert/strict';
import {JOB_LOGS,COMMON_LOGS} from '../job-log-data.js';
import {JOB_LOG_COPY} from '../job-log-copy.js';
import {jobLogDuty,jobLogIdentity,jobLogText,jobWorkplace,eligibleJobRow,unemployedHomeLog} from '../job-log-runtime.js';
import {officeDuty} from '../career-duties.js';
import {BUILTIN_CAREERS} from '../career-catalog.js';
import {careerWeeklyRoutines} from '../career-work.js';
import {routineScene,nextRoutinePhaseAt} from '../routine-scenes.js';
let rows=0;
for(const [key,job] of Object.entries({...JOB_LOGS,common:COMMON_LOGS}))for(const [phase,list] of Object.entries(job))if(Array.isArray(list)){
 assert.equal(JOB_LOG_COPY[key]?.[phase]?.length,list.length,key+'.'+phase);
 list.forEach((row,i)=>{assert(row[0].endsWith('중'),row[0]);for(const lang of ['en','ja']){const t=jobLogText(key,phase,i,lang,{partner:'Alex',hobby:'chess'});assert(t.title&&t.desc);assert(!/[가-힣]|\{partner\}|\{hobby\}/.test(t.title+t.desc),key+'.'+phase+i+lang);}rows++;});
}
const date=new Date(2026,8,25,10,30),before=JSON.stringify(JOB_LOGS),world={uiLanguage:'ko',towns:[{id:'town',places:[{id:'hospital',type:'병원'},{id:'cafe',type:'카페'},{id:'school',type:'학교'},{id:'office',type:'사무실'},{id:'stage',type:'공연장'}]}],characters:{},routines:{}};
for(const job of BUILTIN_CAREERS){
 const c={id:'test-'+job.id,job:job.name,townId:'town',homeId:'home',wallet:{employments:[{id:'employment',jobId:job.id,rankId:'rank-1'}]}};
 assert(jobLogIdentity(c),'mapped '+job.name);
 if(job.id==='builtin-none'){assert.equal(jobLogDuty(c,date,540,1080),null);assert(unemployedHomeLog(c,date));continue;}
 const orig=JSON.stringify(c),titles=new Set();
 for(let minute=540;minute<1080;minute++){
  const t=new Date(2026,8,25,Math.floor(minute/60),minute%60),duty=jobLogDuty(c,t,540,1080,'ko','employment');
  assert(duty.title&&duty.desc);assert(duty.jobLogStartsAt<=+t&&duty.jobLogEndsAt>+t);assert(!/제설|난로/.test(duty.title));assert.equal(duty.placeId,undefined);assert.equal(duty.home,undefined);
  assert.deepEqual(jobLogDuty(JSON.parse(orig),t,540,1080,'ko','employment'),duty);titles.add(duty.title);
 }
 assert(titles.size>=8,job.id+' diversity '+titles.size);
 for(const lang of ['ko','en','ja'])assert(officeDuty(c,date,540,1080,lang,'employment')?.title);
 assert.equal(JSON.stringify(c),orig,'pure '+job.id);
 const routines=careerWeeklyRoutines(world,c);assert(routines.length);
 if(job.id==='builtin-doctor')assert.equal(routines[0].placeId,'hospital');
 if(job.id==='builtin-barista')assert.equal(routines[0].placeId,'cafe');
 c.workplaceId='home';assert.equal(jobWorkplace(world,c,c.wallet.employments[0]),'home');
 c.workplaceId='explicit';assert.equal(jobWorkplace(world,c,c.wallet.employments[0]),'explicit');
}
assert.equal(JSON.stringify(JOB_LOGS),before);
assert(!eligibleJobRow(COMMON_LOGS.break[4],{},date));assert(eligibleJobRow(COMMON_LOGS.break[4],{},date,{partner:'Alex'}));
assert(!eligibleJobRow(COMMON_LOGS.break[6],{socialEnergy:1},date));assert(eligibleJobRow(COMMON_LOGS.break[6],{socialEnergy:5},date));
assert(!eligibleJobRow(JOB_LOGS.janitor.work[15],{},date));assert(eligibleJobRow(JOB_LOGS.janitor.work[15],{},new Date(2026,11,20)));
const custom={id:'x',job:'의사',wallet:{employments:[{id:'custom',jobId:'custom-doctor'}]}};assert.equal(jobLogIdentity(custom),null);assert.equal(officeDuty(custom,date,540,1080),null);
const multi={id:'m',wallet:{employments:[{id:'first',jobId:'builtin-doctor'},{id:'second',jobId:'builtin-barista'}]}};assert.equal(jobLogIdentity(multi,'second').key,'barista');assert.equal(jobLogIdentity(multi,'missing'),null);
let calmSeen=false;
for(let i=0;i<100&&!calmSeen;i++)for(let m=550;m<1000;m++){
 const c={id:'surprise'+i,job:'간호사'},t=new Date(2026,8,25,0,m),d=jobLogDuty(c,t,540,1080);
 if(d.jobLogPhase!=='calm')continue;calmSeen=true;assert.equal(d.activityEndsAt-d.activityStartedAt,30000);
 const last=jobLogDuty(c,new Date(d.jobLogEndsAt-1),540,1080);assert.equal(last.jobLogPhase,'calm');const next=jobLogDuty(c,new Date(d.jobLogEndsAt),540,1080);assert.notEqual(next.jobLogPhase,'calm');break;
}
assert(calmSeen);
const scene={routineId:'r',routineType:'업무',routineStartMinute:540,routineEndMinute:1080,home:false,placeId:'hospital',townId:'town'},c={id:'r',job:'의사'};
const projected=routineScene(scene,c,world,+date);assert.equal(projected.placeId,'hospital');assert(nextRoutinePhaseAt(projected,+date)>+date);
assert.deepEqual(routineScene({...scene,transit:true},c,world,+date),{...scene,transit:true});
assert.deepEqual(routineScene({...scene,manualDirective:true},c,world,+date),{...scene,manualDirective:true});
console.log(`PASS 499: ${rows} localized rows; 23 jobs, deterministic varied work, phases, 30-second calm, seasons, partners, custom/multiple jobs, workplace mapping, travel protection.`);
