const minute=value=>{const m=/^(\d{1,2}):(\d{2})$/.exec(String(value||''));return m&&+m[1]<24&&+m[2]<60?+m[1]*60 + +m[2]:null};
export function sleepWindow(character){
 const wake=minute(character.wake),sleep=minute(character.sleep);
 return {wake:wake??420,sleep:sleep??1380,disabled:character.autonomousActivityBlocks?.includes('sleep')||wake===sleep&&wake!==null};
}
export function scheduledSleeping(character,date=new Date()){
 const {wake,sleep,disabled}=sleepWindow(character),n=date.getHours()*60+date.getMinutes();
 return !disabled&&(sleep<wake?n>=sleep&&n<wake:n>=sleep||n<wake);
}
// Integrate the saved timetable, not the action seen when the app was closed.
// At most 24 hours are used, matching the existing needs catch-up limit.
export function sleepNeedAfter(character,value,from,to){
 from=Math.max(from,to-86400000);if(!(to>from))return value;
 const {wake,sleep,disabled}=sleepWindow(character),edges=[from,to],day=new Date(from);day.setHours(0,0,0,0);
 for(;+day<to;day.setDate(day.getDate()+1))for(const minute of [wake,sleep]){const at=new Date(day);at.setMinutes(minute);if(+at>from&&+at<to)edges.push(+at)}
 edges.sort((a,b)=>a-b);
 for(let i=1;i<edges.length;i++){const minutes=(edges[i]-edges[i-1])/60000;value=Math.max(0,Math.min(100,value+minutes*(!disabled&&scheduledSleeping(character,new Date(edges[i-1]))?4-5/60:-5/60)))}
 return value;
}
