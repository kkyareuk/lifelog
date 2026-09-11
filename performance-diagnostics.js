// Bounded, device-local timings only: no names, input text, mail, or images.
const recent=[];
function record(kind,ms){if(ms<50)return;recent.push({kind,ms:Math.round(ms)});if(recent.length>24)recent.shift()}
export function timeOperation(kind,work){const start=performance.now();try{return work()}finally{record(kind,performance.now()-start)}}
try{new PerformanceObserver(list=>{for(const e of list.getEntries())record('main-thread',e.duration)}).observe({type:'longtask',buffered:false})}catch{}
try{new PerformanceObserver(list=>{for(const e of list.getEntries()){if(e.name==='click'||e.name==='pointerup'){record('input-wait',e.processingStart-e.startTime);record('input-handler',e.processingEnd-e.processingStart);record('input-to-paint',e.duration)}}}).observe({type:'event',durationThreshold:104,buffered:false})}catch{}
export function performanceSummary(){return recent.length?recent.map(e=>e.kind+':'+e.ms+'ms').join(', '):'No slow sample recorded'}
