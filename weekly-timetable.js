import {isAutomaticSchedule,compareSchedulePriority,trimAutomaticSchedules} from './schedule-priority.js';
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
 rows.push(...careerWeeklyRoutines(w,c).map(r=>({...r,ownerId:c.id,category:'work',automatic:isAutomaticSchedule(r)})));
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
 return trimAutomaticSchedules(segments.flatMap(r=>{
  if(r.category!=='work'||!r.automatic||c.autonomousActivityBlocks?.includes('eating'))return [r];
  if(lunch.end<=r.startMinute||lunch.start>=r.endMinute)return [r];
  return [{...r,endMinute:Math.min(r.endMinute,lunch.start)},{...r,startMinute:Math.max(r.startMinute,lunch.end)}].filter(x=>x.endMinute>x.startMinute);
 }));
}
export function layoutDay(items){
 const sorted=items.map(r=>({...r})).sort((a,b)=>-compareSchedulePriority(a,b)||a.startMinute-b.startMinute||b.endMinute-a.endMinute),lanes=[[],[]];
 for(const r of sorted){const lane=lanes.findIndex(list=>list.every(other=>other.endMinute<=r.startMinute||other.startMinute>=r.endMinute));r.hidden=lane<0;r.lane=Math.max(0,lane);r.columns=2;if(lane>=0)lanes[lane].push(r)}
 for(const r of sorted)if(!r.hidden&&!lanes[1-r.lane].some(other=>other.startMinute<r.endMinute&&other.endMinute>r.startMinute)){r.lane=0;r.columns=1}
 return sorted;

}
export function weeklyTimetable(w,c,days){
 const lang=w.uiLanguage||'ko',copy={ko:['수면','점심','업무·수업','함께하는 일정','개인 일정','생활 시간 설정','시간','일정 추가','직접 추가한 일정이 우선해요. 일~토를 한눈에 보고, 일정을 누르거나 아래 목록에서 전체 내용을 확인하세요. 겹치는 일정은 최대 두 칸으로 표시해요.'],en:['Sleep','Lunch','Work / class','Together','Personal','Set daily times','Time','Add schedule','Your added schedules take priority. See all seven days at once; tap an event or read its full details below. At most two events appear side by side.'],ja:['睡眠','昼食','仕事・授業','共同の予定','個人の予定','生活時間の設定','時刻','予定を追加','追加した予定を優先します。日曜から土曜まで一画面に表示します。予定をタップするか下の一覧で全文を確認できます。重なる予定は最大2列に並べます。']}[lang]||[];
 const compactLabels=({ko:{sleep:'수면',meal:'점심',work:'근무',shared:'함께',personal:'개인'},en:{sleep:'Sleep',meal:'Lunch',work:'Work',shared:'Shared',personal:'Plan'},ja:{sleep:'睡眠',meal:'昼食',work:'仕事',shared:'共同',personal:'個人'}})[lang]||{};
 const labels=Object.fromEntries(['sleep','meal','work','shared','personal'].map((k,i)=>[k,copy[i]])),items=timetableItems(w,c);
 const time=n=>`${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;
 return `<section class="timetable"><div class="timetable-tools"><div class="timetable-legend">${Object.entries(labels).map(([k,v])=>`<span class="tt-${k}">${v}</span>`).join('')}</div><button type="button" data-life-times>${copy[5]}</button></div><p class="timetable-hint">${copy[8]}</p><div class="timetable-scroll"><div class="timetable-grid"><div class="timetable-corner">${copy[6]}</div>${days.map((d,i)=>`<div class="timetable-day-head">${d}<button type="button" data-add-routine-day="${i}" aria-label="${d} ${copy[7]}">＋</button></div>`).join('')}<div class="timetable-hours">${Array.from({length:24},(_,h)=>`<span style="top:${h/24*100}%">${String(h).padStart(2,'0')}</span>`).join('')}</div>${days.map((d,day)=>`<div class="timetable-day" data-timetable-day="${day}">${layoutDay(items.filter(r=>r.day===day)).filter(r=>!r.hidden).map(r=>{
 const names=[r.ownerId,...(r.withIds||[])].filter((id,i,a)=>id&&a.indexOf(id)===i).map(id=>w.characters[id]?.name).filter(Boolean).join(' · '),title=r.title||labels[r.category],detail=[labels[r.category],title,`${time(r.startMinute)}–${time(r.endMinute)}`,names,r.notes].filter(Boolean).join('\n');
 return `<button type="button" class="timetable-event tt-${r.category}" style="top:${r.startMinute/1440*100}%;height:${(r.endMinute-r.startMinute)/1440*100}%;left:${r.lane/r.columns*100}%;width:${100/r.columns}%" data-timetable-detail="${esc(detail)}" ${!r.automatic&&r.ownerId===c.id?`data-edit-routine="${esc(r.id)}"`:''} aria-label="${esc(detail)}"><span class="timetable-compact-label" aria-hidden="true">${esc(compactLabels[r.category])}</span><small>${esc(labels[r.category])}</small><strong>${esc(title)}</strong><time><span>${time(r.startMinute)}</span><span>${time(r.endMinute)}</span></time></button>`;
 }).join('')}</div>`).join('')}</div></div><div class="timetable-agenda">${days.map((day,index)=>`<details ${index===new Date().getDay()?'open':''}><summary>${day} · ${({ko:'전체 일정',en:'All schedules',ja:'すべての予定'})[lang]||'전체 일정'}</summary>${items.filter(r=>r.day===index).sort((a,b)=>a.startMinute-b.startMinute).map(r=>{const names=[r.ownerId,...(r.withIds||[])].filter((id,i,a)=>id&&a.indexOf(id)===i).map(id=>w.characters[id]?.name).filter(Boolean).join(' · '),detail=[r.title||labels[r.category],`${time(r.startMinute)}–${time(r.endMinute)}`,names,r.notes].filter(Boolean).join('\n');return `<button type="button" class="timetable-agenda-item tt-${r.category}" data-timetable-detail="${esc(detail)}" ${!r.automatic&&r.ownerId===c.id?`data-edit-routine="${esc(r.id)}"`:''}><time>${time(r.startMinute)}–${time(r.endMinute)}</time><strong>${esc(r.title||labels[r.category])}</strong><span>${esc(names)}</span>${r.notes?`<span>${esc(r.notes)}</span>`:''}</button>`}).join('')}</details>`).join('')}</div></section>`;
}
