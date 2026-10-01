export const isAutomaticSchedule=r=>Boolean(r.automatic||r.plannedLunch||r.careerEmploymentId||String(r.id||'').startsWith('career-work:'));
// Sort low priority first; the runtime selects the final active schedule.
export const compareSchedulePriority=(a,b)=>Number(isAutomaticSchedule(b))-Number(isAutomaticSchedule(a));
export function trimAutomaticSchedules(rows){
 const manual=rows.filter(r=>!isAutomaticSchedule(r));
 return rows.flatMap(row=>{
  if(!isAutomaticSchedule(row))return [row];
  let pieces=[row];
  for(const event of manual.filter(r=>r.day===row.day))pieces=pieces.flatMap(p=>event.endMinute<=p.startMinute||event.startMinute>=p.endMinute?[p]:[{...p,endMinute:Math.min(p.endMinute,event.startMinute)},{...p,startMinute:Math.max(p.startMinute,event.endMinute)}].filter(r=>r.endMinute>r.startMinute));
  return pieces;
 });
}
