import {pack,unpack} from './snapshot-codec.js';
let worker=null,sequence=0;
const pending=new Map();
function fail(error){
  worker?.terminate();worker=null;
  for(const task of pending.values()){clearTimeout(task.timer);task.reject(error)}
  pending.clear();
}
export function encodeSnapshot(value,level=1,repack=false){
  if(typeof Worker==='undefined')return Promise.resolve().then(()=>pack(repack?unpack(value):value,level));
  return new Promise((resolve,reject)=>{
    try{
      if(!worker){worker=new Worker(new URL('./snapshot-worker.js',import.meta.url),{type:'module'});
        worker.onmessage=({data})=>{const task=pending.get(data.id);if(!task)return;pending.delete(data.id);clearTimeout(task.timer);data.error?task.reject(new Error(data.error)):task.resolve(data.value)};
        worker.onerror=()=>fail(new Error('snapshot-worker-failed'));
      }
      const id=++sequence,timer=setTimeout(()=>fail(new Error('snapshot-worker-timeout')),30000);
      pending.set(id,{resolve,reject,timer});worker.postMessage({id,value,level,repack});
    }catch(error){fail(error);reject(error)}
  });
}
