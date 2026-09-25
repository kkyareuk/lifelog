import {JOB_LOGS,COMMON_LOGS,CALM_LOG} from './job-log-data.js';
import {JOB_LOG_COPY} from './job-log-copy.js';
const hash=s=>[...String(s)].reduce((h,c)=>Math.imul(h^c.charCodeAt(0),16777619)>>>0,2166136261);
const aliases={none:'unemployed',sanitation:'janitor','self-employed':'selfEmployed',religious:'clergy',ceo:'office'};
export function jobLogIdentity(c,employmentId){
 const jobs=c.wallet?.employments||[c.wallet?.employment].filter(Boolean),e=employmentId?jobs.find(e=>e.id===employmentId):jobs[0];
 if(e){if(!e.jobId?.startsWith('builtin-'))return null;const raw=e.jobId.slice(8),key=aliases[raw]||raw;return JOB_LOGS[key]?{key,employment:e}:null;}
 if(jobs.length)return null;
 const key=Object.keys(JOB_LOGS).find(k=>JOB_LOGS[k].name===c.job)||(c.job==='CEO'?'office':String(c.job).startsWith('자영업')?'selfEmployed':null);
 return key?{key,employment:{id:'legacy-builtin-'+key,jobId:'builtin-'+key}}:null;
}
export const JOB_BUILDINGS={student:['학교'],office:['사무실','회사'],doctor:['병원'],nurse:['병원'],teacher:['학교'],professor:['대학교','학교'],politician:['시청','관공서','사무실'],reporter:['방송국','사무실'],chef:['음식점','식당','레스토랑'],programmer:['사무실','회사'],researcher:['연구소','사무실'],singer:['공연장','스튜디오'],idol:['공연장','스튜디오'],artist:['작업실','미술관','사무실'],pirate:['항구'],soldier:['군부대','훈련장'],criminal:['은신처'],janitor:['공원','사무실'],innkeeper:['여관','호텔'],selfEmployed:['상점','가게'],clergy:['교회','성당','사찰','수도원'],barista:['카페']};
export function jobWorkplace(world,c,entry){
 if(c.workplaceId)return c.workplaceId;
 const identity=jobLogIdentity({...c,wallet:{employments:[entry]}},entry.id),types=JOB_BUILDINGS[identity?.key]||[];
 const town=world.towns?.find(t=>t.id===c.townId)||world.world;
 for(const type of types){const candidates=(town?.places||[]).filter(p=>p.type===type&&!p.deleted);if(candidates.length)return candidates[hash(c.id+':workplace')%candidates.length].id;}
 return '';
}
function shuffled(rows,seed){let n=hash(seed);return rows.map((row,index)=>({row,index,order:(n=(Math.imul(n,1664525)+1013904223)>>>0)})).sort((a,b)=>a.order-b.order);}
export function eligibleJobRow(row,c,date,context={}){const rule=row[2]||{};return (!rule.season||rule.season==='winter'&&[11,0,1].includes(date.getMonth()))&&(!rule.needsPartner||!!context.partner)&&(!rule.useHobby||!!c.hobbies?.length)&&(!rule.trait||(rule.trait==='extrovert'?Number(c.socialEnergy)>3:Number(c.socialEnergy)<3));}
export function jobLogText(key,phase,index,language='ko',context={}){
 const row=key==='common'?COMMON_LOGS[phase]?.[index]:key==='calm'?[CALM_LOG.title,CALM_LOG.detail]:JOB_LOGS[key]?.[phase]?.[index];
 if(!row)return null;
 const copy=JOB_LOG_COPY[key]?.[phase]?.[index],offset=language==='en'?0:language==='ja'?2:-1;
 const pair=offset>=0&&copy?[copy[offset],copy[offset+1]]:row;
 return {title:pair[0],desc:pair[1].replaceAll('{partner}',context.partner||'').replaceAll('{hobby}',context.hobby||'')};
}
// A small pure deck: no per-frame random calls, save writes, payroll or movement.
export function jobLogDuty(c,date,start,end,language='ko',employmentId='',context={}){
 const identity=jobLogIdentity(c,employmentId);if(!identity||identity.key==='unemployed')return null;
 const {key}=identity,job=JOB_LOGS[key],minute=date.getHours()*60+date.getMinutes()+date.getSeconds()/60+date.getMilliseconds()/60000;
 if(minute<start||minute>=end||end<=start)return null;
 const day=new Date(date.getFullYear(),date.getMonth(),date.getDate()).getTime(),seed=c.id+':'+identity.employment.id+':'+day;
 const opening=Math.min(10+hash(seed)%6,(end-start)/4),closing=Math.min(10+hash(seed+':close')%6,(end-start)/4);
 let phase='work',index,from=start,to=end,poolKey=key;
 if(minute<start+opening){phase='arrive';index=hash(seed)%job.arrive.length;to=start+opening;}
 else if(minute>=end-closing){phase='leave';index=hash(seed+':leave')%job.leave.length;from=end-closing;}
 else {
  let slot=0,at=start+opening;
  while(slot<144){const duration=20+hash(seed+':duration:'+slot)%31,next=Math.min(end-closing,at+duration);if(minute<next){from=at;to=next;break;}at=next;slot++;}
  const deck=shuffled(job.work,seed).filter(({row})=>eligibleJobRow(row,c,date,context));
  index=deck[slot%deck.length].index;
  // Brief pauses stay at the existing work location. Toileting/food/movement
  // remain real need-driven actions, never a decorative work caption.
  if(slot>0&&slot%4===3&&minute<from+3+hash(seed+':break:'+slot)%8){
   const pauses=shuffled(COMMON_LOGS.break,seed+slot).filter(({row,index})=>![1,3].includes(index)&&eligibleJobRow(row,c,date,context));
   if(pauses.length){poolKey='common';phase='break';index=pauses[0].index;to=Math.min(to,from+3+hash(seed+':break:'+slot)%8);}
  }else if(hash(seed+':surprise:'+slot)%25===0){
   const surpriseEnd=from+1+hash(seed+':surprise-length:'+slot)%3;
   if(minute<surpriseEnd){phase='surprise';index=hash(seed+slot)%job.surprise.length;to=Math.min(to,surpriseEnd);}
   else if(minute<surpriseEnd+.5){poolKey='calm';phase='calm';index=0;from=surpriseEnd;to=Math.min(to,surpriseEnd+.5);}
   else from=surpriseEnd+.5;
  }
 }
 const text=jobLogText(poolKey,phase,index,language,context);
 if(phase==='calm')Object.assign(text,{activityStartedAt:day+from*60000,activityEndsAt:day+to*60000});
 if(phase==='surprise')text.gossipReaction='surprised';
 return {...text,jobLogId:`${key}:${phase}:${index}`,jobLogPhase:phase,jobLogStartsAt:day+from*60000,jobLogEndsAt:day+to*60000,officeTaskId:`job:${key}:${phase}:${index}`,officeRole:'builtin-'+key,officeRoom:['singer','idol'].includes(key)?'stage':'workspace',economyWork:true};
}

export function jobLogContext(world,c,scene,now){
 const people=Object.values(world.characters||{});
 const partner=scene.placeId&&people.find(p=>{const e=p.sharedScene;return p.id!==c.id&&e?.placeId===scene.placeId&&e.townId===scene.townId&&!e.transit&&!e.home&&e.jobLogStartsAt<=now&&e.jobLogEndsAt>now;});
 return {partner:partner?.name||'',hobby:String(c.hobbies?.[0]||'')};
}
export function unemployedHomeLog(c,date,language='ko',slot=0){
 if(jobLogIdentity(c)?.key!=='unemployed')return null;
 // Travel and sleep already have their own real actions. Do not label a person
 // indoors as walking/shopping or put an awake person to sleep with a caption.
 const rows=shuffled(JOB_LOGS.unemployed.day,`${c.id}:${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`)
  .filter(({index})=>![0,4,5,14].includes(index));
 const pick=rows[slot%rows.length];return {...jobLogText('unemployed','day',pick.index,language),room:[3,6,9,19].includes(pick.index)?'living':'study'};
}
