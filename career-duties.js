import {performanceDuty} from './performance-tasks.js';
import {officeDuty as corporateDuty,officeEmployment as corporateEmployment} from './office-work.js';
import {POLITICIAN_DUTIES,BARISTA_DUTIES} from './career-duty-data.js';
export function officeEmployment(c,id){return corporateEmployment(c,id)||employment(c,id)}
function employment(c,id){const all=c.wallet?.employments||[],entry=id?all.find(e=>e.id===id):all[0];if(entry)return ['builtin-politician','builtin-barista','builtin-singer','builtin-idol'].includes(entry.jobId)?entry:null;return !all.length&&['정치인','바리스타','가수','아이돌'].includes(c.job)?{jobId:({'정치인':'builtin-politician','바리스타':'builtin-barista','가수':'builtin-singer','아이돌':'builtin-idol'})[c.job]}:null}
export function officeDuty(c,date,start,end,language='ko',id){
 const corporate=corporateDuty(c,date,start,end,language,id);if(corporate)return corporate;
 const job=employment(c,id),minute=date.getHours()*60+date.getMinutes()+date.getSeconds()/60;if(!job||minute<start||minute>=end)return null;
 if(['builtin-singer','builtin-idol'].includes(job.jobId))return performanceDuty(c,job,date,start,end,language);
 const list=job.jobId==='builtin-politician'?POLITICIAN_DUTIES:BARISTA_DUTIES;
 const hash=[...String(c.id)+String(id||'')].reduce((h,v)=>(Math.imul(h,31)+v.charCodeAt(0))>>>0,0);
 const slot=Math.floor(date.getTime()/2700000),index=minute>=end-10?list.length-1:minute<start+10?0:1+(slot+hash)%(list.length-2),row=list[index],offset=language==='en'?2:language==='ja'?4:0;
 return {title:row[offset],desc:row[offset+1],officeTaskId:job.jobId+':'+index,officeRole:job.jobId,officeRoom:'workspace',economyWork:true};
}
