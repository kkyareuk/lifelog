import {careersFor} from './career-world.js';
import {employmentsFor} from './salary.js';
// Game schedules, not a claim about real-world working conditions.
const defaults={
 'builtin-student':[[1,2,3,4,5],'09:00','15:00'],
 'builtin-doctor':[[1,2,3,4,5],'09:00','17:00'],
 'builtin-nurse':[[1,2,3,4,5],'07:00','15:00'],
 'builtin-teacher':[[1,2,3,4,5],'08:30','16:30'],
 'builtin-professor':[[1,2,3,4],'10:00','17:00'],
 'builtin-chef':[[2,3,4,5,6],'11:00','21:00'],
 'builtin-sanitation':[[1,2,3,4,5],'06:00','14:00'],
 'builtin-innkeeper':[[0,2,3,4,5,6],'08:00','18:00'],
 'builtin-religious':[[0,2,3,4,5,6],'08:00','16:00'],
 'builtin-singer':[[2,3,4,5,6],'13:00','21:00'],
 'builtin-idol':[[1,2,3,4,5,6],'10:00','19:00'],
 'builtin-artist':[[1,2,3,4,5],'11:00','18:00'],
 'builtin-soldier':[[1,2,3,4,5],'07:00','17:00'],
 'builtin-criminal':[[1,3,5],'20:00','23:00']
};
export function careerAssignments(world,c){
 const jobs=employmentsFor(c);if(jobs.length)return jobs.filter(e=>e.jobId!=='builtin-none');
 const job=careersFor(world).find(j=>j.name===c.job&&j.id!=='builtin-none');
 return job?[{id:'legacy-'+job.id,jobId:job.id,rankId:job.ranks[0]?.id}]:[];
}
export function validWorkSchedule(value){return value&&Array.isArray(value.days)&&value.days.length<=7&&value.days.every(d=>Number.isInteger(d)&&d>=0&&d<=6)&&['start','end'].every(k=>/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value[k]||''))&&value.start!==value.end}
export function defaultWorkSchedule(entry){
 let [days,start,end]=defaults[entry.jobId]||[[1,2,3,4,5],'09:00','18:00'];
 if(entry.jobId==='builtin-doctor'&&entry.rankId==='rank-1'){start='08:00';end='18:00'}
 if(entry.jobId==='builtin-office'&&/director|executive|president|ceo/.test(entry.rankId)){start='10:00';end='18:00'}
 return {days:[...days],start,end};
}
export function workScheduleFor(c,entry){const own=c.careerSchedules?.[entry.id];return validWorkSchedule(own)?{...own,days:[...new Set(own.days)]}:defaultWorkSchedule(entry)}
export function careerWeeklyRoutines(world,c){
 const entries=careerAssignments(world,c),existing=(world.routines?.[c.id]||[]).filter(r=>['업무','work'].includes(r.type));
 if(existing.length&&!entries.some(e=>c.careerSchedules?.[e.id]==='default'||validWorkSchedule(c.careerSchedules?.[e.id])))return existing;
 return entries.flatMap(entry=>{const schedule=workScheduleFor(c,entry);return schedule.days.flatMap(day=>{const base={id:`career-work:${entry.id}:${day}`,type:'업무',day,start:schedule.start,end:schedule.end,title:entry.jobName||c.job||'',withIds:[],placeId:c.workplaceId==='home'?'':c.workplaceId||'',home:!c.workplaceId||c.workplaceId==='home',visitHomeId:!c.workplaceId||c.workplaceId==='home'?c.homeId:'',room:'study',careerEmploymentId:entry.id};return schedule.end<schedule.start&&schedule.end!=='00:00'?[base,{...base,id:base.id+':after-midnight',day:(day+1)%7,start:'00:00'}]:[base]})});
}
