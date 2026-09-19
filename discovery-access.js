const cache=new Map();
const uid=()=>window.ParallelCityAuth?.getInfo?.()?.user?.uid||'guest';
const key=id=>'drawer-discovery-account:'+encodeURIComponent(id);
function entry(id=uid()){
 if(!cache.has(id)){let lastAt=0;try{lastAt=Number(localStorage.getItem(key(id)))||0;for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k?.startsWith('drawer-discovery-request:'+encodeURIComponent(id)+':'))lastAt=Math.max(lastAt,Number(localStorage.getItem(k))||0)}}catch{}cache.set(id,{lastAt,offset:0,checkedAt:0})}
 return cache.get(id);
}
export function discoveryAccountLast(){const value=entry();return value.lastAt-value.offset}
export function setDiscoveryEntitlement(adFree){const value=entry();const changed=value.adFree!==(adFree===true);value.adFree=adFree===true;value.interval=adFree?60000:600000;if(changed)value.checkedAt=0;window.dispatchEvent(new Event('drawer-ads-update'));}
export function discoveryPremium(){return entry().adFree===true}
export function discoveryAdsResolved(){const info=window.ParallelCityAuth?.getInfo?.();return !!info?.ready&&!info.startupSyncing&&!info.startupError&&(uid()==='guest'||typeof entry().adFree==='boolean')}
export function discoveryRemaining(){const value=entry();return value.rewardCredits>0?0:Math.max(0,(value.interval||600000)-(Date.now()-discoveryAccountLast()))}
export function discoveryRewardCredit(){return entry().rewardCredits>0}
async function request(action,body={}){
 const account=uid(),token=await window.ParallelCityAuth?.getIdToken?.();if(account==='guest'||!token)throw Error('discovery-login');
 const response=await fetch(window.PARALLEL_CITY_CONFIG.diamonds.backendUrl+'/discovery/'+action,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
 const value=await response.json();if(account!==uid())throw Error('account-changed');if(!response.ok)throw Error(value.code||'discovery-unavailable');
 const old=entry(account);if(Number.isFinite(value.lastAt)&&(!Number.isFinite(value.serverNow)||value.serverNow>=(old.serverStamp||0))){Object.assign(old,{serverStamp:value.serverNow||0,lastAt:Math.max(0,value.lastAt),offset:Number.isFinite(value.serverNow)?value.serverNow-Date.now():old.offset,checkedAt:Date.now(),rewardCredits:value.rewardCredits||0,interval:value.interval||600000,adFree:value.adFree===true});localStorage.setItem(key(account),String(old.lastAt));}return value;
}
export function refreshDiscoveryAccess(){const value=entry();if(uid()==='guest'||Date.now()-value.checkedAt<300000)return Promise.resolve();if(!value.pending)value.pending=request('read').finally(()=>{value.pending=null});return value.pending}
export async function consumeDiscoveryAccess(){
 const account=uid(),value=entry();
 if(account==='guest'){if(Date.now()-value.lastAt<600000)return false;value.lastAt=Date.now();localStorage.setItem(key(account),String(value.lastAt));return true}
 value.requestId??=crypto.randomUUID();const result=await request('use',{requestId:value.requestId});value.requestId=null;return result.granted;
}
export async function watchDiscoveryAd(){
 const {adsTesting,adPlatform,runRewardAd}=await import('./native-ads.js');
 const account=uid();if(account==='guest')throw Error('discovery-login');
 const ticket=await request('prepareAd',{platform:adPlatform()});
 const earned=await runRewardAd(ticket,account);if(!earned)return 'cancelled';
 // Demo ads have no SSV; the server permits one-use QA rewards only for authorized test accounts.
 if(adsTesting()){try{await request('testReward',{ticketId:ticket.ticketId});await request('read');return discoveryRewardCredit()?'ready':'test'}catch(e){if(e.message==='ads-test-account-required')return 'test';throw e}}
 for(let i=0;i<10;i++){await request('read');if(discoveryRewardCredit())return 'ready';await new Promise(r=>setTimeout(r,1500));}
 return 'pending';
}
