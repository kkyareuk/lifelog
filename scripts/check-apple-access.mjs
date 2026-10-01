import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../apple-billing-client.js',import.meta.url),'utf8');
for(const failed of [false,true]){
 let finished=0,refreshes=0;
 const bridge={getDiagnostics:async()=>({}),getProducts:async()=>({products:[{productId:"ad_free"}]}),restorePurchases:async()=>({purchases:[]}),purchase:async()=>({transactionId:'receipt'}),finishPurchase:async()=>finished++,addListener(){}};
 const window={Capacitor:{isNativePlatform:()=>true,getPlatform:()=> 'ios',Plugins:{AppleBilling:bridge}},PARALLEL_CITY_CONFIG:{appleBilling:{enabled:true,backendUrl:'https://mock.invalid',products:{ad_free:'ad_free'}}},ParallelCityAuth:{getIdToken:async()=> 'token',getInfo:()=>({user:{uid:'buyer'}}),refreshEntitlements:async()=>{refreshes++;if(failed)throw Error('offline')}},addEventListener(){},dispatchEvent(){}};
 vm.runInNewContext(source,{window,document:{documentElement:{lang:'en'}},setTimeout,clearTimeout,CustomEvent:class{},AbortSignal,fetch:async url=>({ok:true,json:async()=>url.endsWith('prepare')?{appAccountToken:'mock-account-token',products:{ad_free:'ad_free'}}:{verified:true,entitlementApplied:true}})});
 const result=await window.DrawerVillagePlayBilling.purchase('ad_free');assert.equal(result.accessPending,failed);assert.equal(finished,1);assert.equal(refreshes,1);
}
console.log('PASS Apple client waits for entitlement refresh and reports pending application separately from payment');
