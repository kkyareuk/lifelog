import {careersFor} from './career-world.js';
import {careerLabel} from './career-catalog.js';
const due=(y,m,day)=>new Date(y,m,Math.min(day,new Date(y,m+1,0).getDate()),0,0,0,0).getTime();
export function nextPayDate(at,day){const d=new Date(at),n=due(d.getFullYear(),d.getMonth(),day);return n>at?n:due(d.getFullYear(),d.getMonth()+1,day)}
function previousPayDate(at,day){const d=new Date(at);return due(d.getFullYear(),d.getMonth()-1,day)}
export function employmentOffer(world,jobId,rankId){const job=careersFor(world).find(j=>j.id===jobId&&!j.archived),rank=job?.ranks.find(r=>r.id===rankId);if(!job||!rank)throw Error('career-missing');return {jobId:job.id,rankId:rank.id,jobName:job.name,rankName:rank.name,salary:Math.round(rank.salaryMeals*10000),payDay:job.payDay,duties:structuredClone(rank.duties)}}
// A persisted cursor and due-date receipt prevent repeated views/reloads from paying twice.
const gcd=(a,b)=>b?gcd(b,a%b):a;
export function nextSalaryPayout(employment,at=Date.now()){
 const monthEnd=nextPayDate(at,employment.payDay);if(!['daily','weekly'].includes(employment.frequency))return monthEnd;
 if(employment.frequency==='daily'){const date=new Date(at);return Math.min(monthEnd,new Date(date.getFullYear(),date.getMonth(),date.getDate()+1).getTime())}
 const start=previousPayDate(monthEnd,employment.payDay),weeks=Math.floor((at-start)/604800000)+1;return Math.min(monthEnd,start+weeks*604800000);
}
export function settleSalary(wallet,employment,now,addEntry){
 if(!employment||!Number.isFinite(now)||now<=employment.lastAt)return false;
 let cursor=employment.lastAt,accrued=Number(employment.accrued)||0,paid=false,iterations=0;
 const quantum=gcd(Math.round(employment.salary),1000)||1000;
 while(cursor<now&&iterations++<40000){
  const monthEnd=nextPayDate(cursor,employment.payDay),next=nextSalaryPayout(employment,cursor),end=Math.min(now,next),previous=previousPayDate(monthEnd,employment.payDay);
  accrued+=employment.salary*(end-cursor)/(monthEnd-previous);cursor=end;
  if(end===next){const amount=Math.max(0,Math.floor((accrued+1e-6)/quantum)*quantum),key='salary:'+employment.id+':'+next;if(amount)addEntry(wallet,amount,key,'salary',next,employment.jobName+' · '+employment.rankName);accrued-=amount;paid=true;}
 }
 employment.lastAt=cursor;employment.accrued=Math.max(0,accrued);return paid;
}
export function assignEmployment(world,c,jobId,rankId,now,addEntry,details={}){
 if(details.frequency!==undefined&&!['daily','weekly','monthly'].includes(details.frequency))throw Error('career-invalid');
 for(const key of ['department','specialty'])if(details[key]!==undefined&&(typeof details[key]!=='string'||details[key].length>60))throw Error('career-invalid');
 const next=employmentOffer(world,jobId,rankId),previous=c.wallet.employment;
 if(previous)settleSalary(c.wallet,previous,now,addEntry);
 const retained=previous?.accrued||0;
 c.wallet.employment={...next,frequency:details.frequency||'monthly',department:(details.department||'').trim(),specialty:(details.specialty||'').trim(),id:previous?.id||'employment-'+now,lastAt:now,startedAt:previous?.startedAt||now,accrued:retained};
 c.job=next.jobName;c.wallet.work=null;c.wallet.revision=(c.wallet.revision||0)+1;
 return c.wallet.employment;
}
export function currentDuties(world,c){const e=c.wallet?.employment;if(!e)return [];const job=careersFor(world).find(j=>j.id===e.jobId),rank=job?.ranks.find(r=>r.id===e.rankId);return rank?.duties||e.duties||[]}

export function salaryPreview(employment,now=Date.now()){
 if(!employment)return null;const copy=structuredClone(employment),at=nextSalaryPayout(copy,now),wallet={balance:0};settleSalary(wallet,copy,at,(w,n)=>{w.balance+=n});return {at,amount:wallet.balance};
}

export function careerCaption(world,c){
 if(c.jobTitle)return c.jobTitle;const e=c.wallet?.employment;if(!e)return c.job||'';
 const job=careersFor(world).find(j=>j.id===e.jobId),rank=job?.ranks.find(r=>r.id===e.rankId),language=world.uiLanguage||'ko';
 return [e.department,e.specialty,careerLabel(job,language)||e.jobName,careerLabel(rank,language)||e.rankName].filter(Boolean).join(' · ');
}
