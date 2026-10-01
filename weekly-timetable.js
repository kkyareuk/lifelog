import {careerWeeklyRoutines} from './career-work.js';
import {sleepWindow} from './sleep-clock.js';
export const minute=s=>{const m=/^(\d{2}):(\d{2})$/.exec(s||'');return m&&+m[1]<24&&+m[2]<60?+m[1]*60 + +m[2]:null};
export function lunchWindow(c){return {start:minute(c.lunchStart)??720,end:minute(c.lunchEnd)??780};}
export function lunchRoutine(c,date){
 const {start,end}=lunchWindow(c);if(end<=start||c.autonomousActivityBlocks?.includes('eating'))return null;
 const time=n=>`${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;
 return {id:`lunch:${c.id}:${date.getDay()}`,day:date.getDay(),start:time(start),end:time(end),type:'식사',title:'점심',home:true,room:'kitchen',plannedLunch:true,withIds:[]};
}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function participantSchedules(w,c,monthly=false){
 const deleted=new Set([...(w.deletedRoutineIds||[]),...(w.deletedMonthlyRoutineIds||[])]),seen=new Set();
 return Object.entries(monthly?w.monthlyRoutines||{}:w.routines||{}).sort(([a],[b])=>Number(b===c.id)-Number(a===c.id)).flatMap(([ownerId,rows])=>rows.filter(r=>ownerId===c.id||r.withIds?.includes(c.id)).map(r=>({...r,ownerId}))).filter(r=>{if(deleted.has(r.id)||seen.has(r.id))return false;seen.add(r.id);return true});
}
export function timetableItems(w,c){
 const rows=participantSchedules(w,c).filter(r=>!['업무','work'].includes(r.type)||r.ownerId!==c.id);
 rows.push(...careerWeeklyRoutines(w,c).map(r=>({...r,ownerId:c.id,category:'work',automatic:true})));
 const {wake,sleep,disabled}=sleepWindow(c),lunch=lunchWindow(c);
 for(let day=0;day<7;day++){
  if(!disabled)rows.push({id:'sleep:'+day,day,start:sleep,end:wake,category:'sleep',automatic:true});
  if(lunch.end>lunch.start&&!c.autonomousActivityBlocks?.includes('eating'))rows.push({id:'lunch:'+day,day,start:lunch.start,end:lunch.end,category:'meal',automatic:true});
 }
 const segments=[];
 for(const r of rows){
  const start=typeof r.start==='number'?r.start:minute(r.start),end=typeof r.end==='number'?r.end:minute(r.end);if(start===null||end===null||start===end)continue;
  // careerWeeklyRoutines already emits the after-midnight segment.
  const category=r.category||(/업무|회사|수업|work/.test(r.type)?'work':/식사|점심/.test(r.type)?'meal':/수면|잠/.test(r.type)?'sleep':r.withIds?.length?'shared':'personal');
  const add=(day,a,b)=>{if(b>a)segments.push({...r,day,startMinute:a,endMinute:b,category})};
  add(Number(r.day),start,end<start?1440:end);
  if(end<start&&!r.careerEmploymentId)add((Number(r.day)+1)%7,0,end);
 }
 return segments.flatMap(r=>{
  if(r.category!=='work'||!r.automatic||c.autonomousActivityBlocks?.includes('eating'))return [r];
  if(lunch.end<=r.startMinute||lunch.start>=r.endMinute)return [r];
  return [{...r,endMinute:Math.min(r.endMinute,lunch.start)},{...r,startMinute:Math.max(r.startMinute,lunch.end)}].filter(x=>x.endMinute>x.startMinute);
 });
}
export function layoutDay(items){
 const sorted=items.map(r=>({...r})).sort((a,b)=>a.startMinute-b.startMinute||b.endMinute-a.endMinute);let group=[],ends=[];
 const flush=()=>{for(const r of group)r.columns=ends.length;group=[];ends=[]};
 for(const r of sorted){if(group.length&&r.startMinute>=Math.max(...ends))flush();let lane=ends.findIndex(end=>end<=r.startMinute);if(lane<0)lane=ends.length;ends[lane]=r.endMinute;r.lane=lane;group.push(r)}flush();return sorted;
}
export function weeklyTimetable(w,c,days){
 const lang=w.uiLanguage||'ko',copy={ko:['수면','점심','업무·수업','함께하는 일정','개인 일정','생활 시간 설정','시간','일정 추가','설정한 생활 시간과 참여 일정이에요. 겹치는 일정은 나란히 표시돼요.'],en:['Sleep','Lunch','Work / class','Together','Personal','Set daily times','Time','Add schedule','Daily times and joined schedules. Overlapping events appear side by side.'],ja:['睡眠','昼食','仕事・授業','共同の予定','個人の予定','生活時間の設定','時刻','予定を追加','生活時間と参加する予定です。重なる予定は横に並びます。']}[lang]||[];
 const labels=Object.fromEntries(['sleep','meal','work','shared','personal'].map((k,i)=>[k,copy[i]])),items=timetableItems(w,c);
 const time=n=>`${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;
 return `<section class="timetable"><div class="timetable-tools"><div class="timetable-legend">${Object.entries(labels).map(([k,v])=>`<span class="tt-${k}">${v}</span>`).join('')}</div><button type="button" data-life-times>${copy[5]}</button></div><p class="timetable-hint">${copy[8]}</p><div class="timetable-scroll"><div class="timetable-grid"><div class="timetable-corner">${copy[6]}</div>${days.map((d,i)=>`<div class="timetable-day-head">${d}<button type="button" data-add-routine-day="${i}" aria-label="${d} ${copy[7]}">＋</button></div>`).join('')}<div class="timetable-hours">${Array.from({length:24},(_,h)=>`<span style="top:${h/24*100}%">${String(h).padStart(2,'0')}</span>`).join('')}</div>${days.map((d,day)=>`<div class="timetable-day" data-timetable-day="${day}">${layoutDay(items.filter(r=>r.day===day)).map(r=>{
 const names=[r.ownerId,...(r.withIds||[])].filter((id,i,a)=>id&&a.indexOf(id)===i).map(id=>w.characters[id]?.name).filter(Boolean).join(' · '),title=r.title||labels[r.category],detail=[labels[r.category],title,`${time(r.startMinute)}–${time(r.endMinute)}`,names,r.notes].filter(Boolean).join('\n');
 return `<button type="button" class="timetable-event tt-${r.category}" style="top:${r.startMinute/1440*100}%;height:${(r.endMinute-r.startMinute)/1440*100}%;left:${r.lane/r.columns*100}%;width:${100/r.columns}%" data-timetable-detail="${esc(detail)}" ${!r.automatic&&r.ownerId===c.id?`data-edit-routine="${esc(r.id)}"`:''} aria-label="${esc(detail)}"><small>${esc(labels[r.category])}</small><strong>${esc(title)}</strong><time><span>${time(r.startMinute)}</span><span>${time(r.endMinute)}</span></time>${names?`<span>${esc(names)}</span>`:''}</button>`;
 }).join('')}</div>`).join('')}</div></div></section>`;
}
