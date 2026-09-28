import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../native-app.js',import.meta.url),'utf8');
function setup({history=[],verify=true,restoreFails=false,hangRestore=false,refreshFails=false,payment}={}){
 const events={},timers=[],calls=[],storage=new Map();let user={uid:'buyer'};
 const receipt={products:['town_slot_1'],purchaseToken:'new',purchaseState:1,acknowledged:false};
 const plugin={getProducts:async()=>({products:[]}),restorePurchases:async()=>{calls.push('restore');if(restoreFails)throw Error('offline');if(hangRestore)return new Promise(()=>{});return {purchases:history}},purchase:async()=>{calls.push('purchase');return payment?await payment:receipt},finishPurchase:async()=>calls.push('finish')};
 const w={Capacitor:{isNativePlatform:()=>true,getPlatform:()=> 'android',Plugins:{App:{addListener(){}},PlayBilling:plugin}},PARALLEL_CITY_CONFIG:{playBilling:{enabled:true,backendUrl:'https://test.invalid',products:{town_slot_1:'town_slot_1',storage_50mb:'storage_50mb'}}},ParallelCityAuth:{getInfo:()=>({user}),getIdToken:async()=> 'test-token',refreshEntitlements:async()=>{calls.push('refresh');if(refreshFails)throw Error('refresh failed')},download:async()=>{throw Error('must not replace game save')}},addEventListener:(k,f)=>events[k]=f};
 const style={removeProperty(){}},d={documentElement:{lang:'en',classList:{add(){}},style},body:{style},querySelector:()=>({}),head:{append(){}}};
 const context={window:w,document:d,navigator:{language:'en'},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},AbortSignal,console,requestAnimationFrame(){},setTimeout:(f,ms)=>{const t={f,ms,active:true};timers.push(t);return t},clearTimeout:t=>{if(t)t.active=false},fetch:async()=>{calls.push('verify');return {ok:verify,json:async()=>({verified:verify,entitlementApplied:verify,purchaseFinished:true,message:'verify failed'})}}};
 vm.runInNewContext(source.slice(0,source.indexOf('  if(isAndroid)App.addListener("backButton"'))+'\n}',context);
 return {billing:w.DrawerVillagePlayBilling,events,calls,timers,storage,changeUser:()=>{user={uid:'other'}}};
}
const old={products:['town_slot_1'],purchaseToken:'old',purchaseState:1,acknowledged:false};
{const s=setup();await s.billing.purchase('town_slot_1');assert.deepEqual(s.calls,['restore','purchase','verify','refresh']);}
{const s=setup({history:[old]});assert.equal((await s.billing.purchase('town_slot_1')).restored,true);assert(!s.calls.includes('purchase'));}
{const s=setup({history:[{...old,products:['storage_50mb'],acknowledged:true}]});await s.billing.purchase('town_slot_1');assert(s.calls.includes('purchase'),'Owned nonconsumable must not prevent another purchase');}
for(const options of [{restoreFails:true},{history:[old],verify:false},{history:[{...old,purchaseState:2}]}]){const s=setup(options);await assert.rejects(s.billing.purchase('town_slot_1'));assert(!s.calls.includes('purchase'));}
{const s=setup({hangRestore:true});const p=s.billing.purchase('town_slot_1');await Promise.resolve();s.timers.find(t=>t.ms===25000).f();await assert.rejects(p,/timed out/);assert(!s.calls.includes('purchase'));}
{let resolve;const payment=new Promise(r=>resolve=r);const s=setup({payment});const p=s.billing.purchase('town_slot_1');for(let i=0;i<12;i++)await Promise.resolve();await assert.rejects(s.billing.purchase('town_slot_1'));await assert.rejects(s.billing.restorePurchases());resolve(old);await p;assert.equal(s.calls.filter(x=>x==='purchase').length,1);}
{const s=setup({refreshFails:true});await s.billing.purchase('town_slot_1');assert(s.calls.includes('verify'));}
{const s=setup({history:[old]});s.events['drawer-village-cloud-loaded']();s.timers.find(t=>t.ms===1200).f();for(let i=0;i<30;i++)await Promise.resolve();assert(s.calls.includes('verify'),'Recover store receipt even with empty local storage');assert(!s.calls.includes('purchase'));}
{let resolve;const payment=new Promise(r=>resolve=r);const s=setup({payment});const p=s.billing.purchase('town_slot_1');for(let i=0;i<12;i++)await Promise.resolve();s.changeUser();resolve(old);await assert.rejects(p);assert(!s.calls.includes('verify'));assert([...s.storage.values()].some(v=>v.includes('old')));}
console.log('PASS Android purchase: preflight/recovery, failed/pending/timeout no charge, owned item, concurrent lock, refresh failure, empty-cache recovery, account change');
