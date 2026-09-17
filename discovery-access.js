const cache=new Map();
const uid=()=>window.ParallelCityAuth?.getInfo?.()?.user?.uid||'guest';
const key=id=>'drawer-discovery-account:'+encodeURIComponent(id);
function entry(id=uid()){
 if(!cache.has(id)){let lastAt=0;try{lastAt=Number(localStorage.getItem(key(id)))||0;for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k?.startsWith('drawer-discovery-request:'+encodeURIComponent(id)+':'))lastAt=Math.max(lastAt,Number(localStorage.getItem(k))||0)}}catch{}cache.set(id,{lastAt,offset:0,checkedAt:0})}
 return cache.get(id);
}
export function discoveryAccountLast(){const value=entry();return value.lastAt-value.offset}
async function request(action,body={}){
 const account=uid(),token=await window.ParallelCityAuth?.getIdToken?.();if(account==='guest'||!token)throw Error('discovery-login');
 const response=await fetch(window.PARALLEL_CITY_CONFIG.diamonds.backendUrl+'/discovery/'+action,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
 const value=await response.json();if(account!==uid())throw Error('account-changed');if(!response.ok)throw Error(value.code||'discovery-unavailable');
 const old=entry(account);Object.assign(old,{lastAt:Math.max(old.lastAt,value.lastAt),offset:value.serverNow-Date.now(),checkedAt:Date.now()});localStorage.setItem(key(account),String(old.lastAt));return value;
}
export function refreshDiscoveryAccess(){const value=entry();if(uid()==='guest'||Date.now()-value.checkedAt<15000)return Promise.resolve();if(!value.pending)value.pending=request('read').finally(()=>{value.pending=null});return value.pending}
export async function consumeDiscoveryAccess(){
 const account=uid(),value=entry();
 if(account==='guest'){if(Date.now()-value.lastAt<600000)return false;value.lastAt=Date.now();localStorage.setItem(key(account),String(value.lastAt));return true}
 value.requestId??=crypto.randomUUID();const result=await request('use',{requestId:value.requestId});value.requestId=null;return result.granted;
}
