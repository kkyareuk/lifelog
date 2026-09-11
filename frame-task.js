// Snapshot listeners can notify several times in one frame. Read the newest
// state once when the frame runs, instead of rebuilding the same page repeatedly.
export function frameTask(work,{request=requestAnimationFrame,cancel=cancelAnimationFrame}={}){
 let frame=null;
 const schedule=()=>{if(frame!==null)return;frame=request(()=>{frame=null;work()})};
 schedule.cancel=()=>{if(frame!==null)cancel(frame);frame=null};
 return schedule;
}
