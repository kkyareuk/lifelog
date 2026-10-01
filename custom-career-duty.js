import {careersFor} from './career-world.js';
// Read the current rank, not just the employment snapshot saved at hiring.
export function customCareerDuty(world,c,date,start,end,language='ko',employmentId){
 const entries=c.wallet?.employments||[c.wallet?.employment].filter(Boolean);
 const employment=employmentId?entries.find(e=>e.id===employmentId):entries[0];
 if(!employment||employment.jobId?.startsWith('builtin-'))return null;
 const minute=date.getHours()*60+date.getMinutes()+date.getSeconds()/60;
 if(minute<start||minute>=end)return null;
 const job=careersFor(world||{}).find(j=>j.id===employment.jobId),rank=job?.ranks.find(r=>r.id===employment.rankId);
 const duties=(rank?.duties||employment.duties||[]).filter(d=>d.name&&d.description);
 if(!duties.length)return null;
 const slot=Math.floor((minute-start)/45),seed=[...String(c.id)+employment.id].reduce((h,v)=>(Math.imul(h,31)+v.charCodeAt(0))>>>0,0);
 const duty=duties[(seed+slot)%duties.length],copy=duty.copy?.[language]||duty;
 const day=new Date(date.getFullYear(),date.getMonth(),date.getDate()).getTime();
 return {title:copy.name,desc:copy.description,officeTaskId:`custom:${employment.id}:${slot}`,officeRole:employment.jobId,economyWork:true,
  jobLogStartsAt:day+(start+slot*45)*60000,jobLogEndsAt:day+Math.min(end,start+(slot+1)*45)*60000};
}
