const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const {accountToken,validatePurchase,installAppleBilling,productMap}=require('../functions/apple-billing');
const express=require('../functions/node_modules/express');
(async()=>{
const uid='buyer',environment='Sandbox';
const slotProduct=process.argv.includes('--single')?'character_slot_1':'character_slots_5';
const slotField=slotProduct==='character_slot_1'?'characterSingleSlots':'characterSlotPacks';
const purchase={transactionId:'123',productId:'com.drawervillage.app.'+slotProduct,bundleId:'com.drawervillage.app',environment,type:'Consumable',quantity:1,appAccountToken:accountToken(uid)};
assert.match(accountToken(uid),/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
for(const patch of [{appAccountToken:accountToken('other')},{quantity:0},{revocationDate:1},{bundleId:'fake'},{environment:'Production'},{productId:'storage_50mb'},{type:'Non-Consumable'}])assert.throws(()=>validatePurchase({...purchase,...patch},uid,environment,'123'));
const {SignedDataVerifier,Environment}=require('../functions/node_modules/@apple/app-store-server-library');
const verifier=new SignedDataVerifier([fs.readFileSync(require('node:path').join(__dirname,'../functions/certificates/AppleRootCA-G3.cer'))],true,Environment.SANDBOX,'com.drawervillage.app');
await assert.rejects(()=>verifier.verifyAndDecodeTransaction('forged.receipt.signature'));
const rows=new Map();let queue=Promise.resolve();
const db={collection:name=>({doc:id=>({key:name+'/'+id})}),runTransaction:fn=>{const job=queue.then(()=>fn({get:async ref=>({exists:rows.has(ref.key),data:()=>structuredClone(rows.get(ref.key))}),set:(ref,data,options)=>rows.set(ref.key,options?.merge?{...rows.get(ref.key),...data}:data)}));queue=job.catch(()=>{});return job}};
let revoked=false;
const notificationPayload='header.'+Buffer.from(JSON.stringify({data:{environment}})).toString('base64url')+'.signature';
const app=express();app.use(express.json());
installAppleBilling(app,{db,signedInUser:async req=>{if(req.get('Authorization')!=='Bearer ok')throw Object.assign(Error(),{status:401});return {uid}},nextEntitlements:(old,id,n)=>({...old,[slotField]:(old?.[slotField]||0)+n}),serverTimestamp:()=>1,services:()=>({environment,api:{getTransactionInfo:async()=>({signedTransactionInfo:'signed'})},verifier:{verifyAndDecodeTransaction:async()=>({...purchase,...(revoked?{revocationDate:1}:{})}),verifyAndDecodeNotification:async()=>({notificationType:'REFUND',data:{signedTransactionInfo:'signed'}})}})});
const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
try{
const url='http://127.0.0.1:'+server.address().port+'/apple-billing/';const post=(path,body={},auth='ok')=>fetch(url+path,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+auth},body:JSON.stringify(body)});
assert.equal((await post('prepare',{},'bad')).status,401);
assert.equal((await (await post('prepare')).json()).appAccountToken,accountToken(uid));
await Promise.all(Array.from({length:8},()=>post('verify',{transactionId:'123'})));assert.equal(rows.get('appleSandboxAccounts/buyer').appleSandboxEntitlements[slotField],1);assert.equal(rows.get('appleSandboxAccounts/buyer').entitlements,undefined);
revoked=true;await post('notifications',{signedPayload:notificationPayload});await post('notifications',{signedPayload:notificationPayload});assert.equal(rows.get('appleSandboxAccounts/buyer').appleSandboxEntitlements[slotField],0);assert.equal((await post('verify',{transactionId:'123'})).status,409);
}finally{server.close()}
let buy=0,finish=0,verified=true,loggedIn=true,cancel=false,history=[];
const bridge={getProducts:async()=>({products:[{productId:purchase.productId,formattedPrice:slotProduct==='character_slot_1'?'₩1,000':'₩1,200',regularPaidOffer:true}]}),purchase:async()=>{buy++;if(cancel)throw {code:'PURCHASE_CANCELLED'};return {transactionId:'123'}},finishPurchase:async()=>finish++,restorePurchases:async()=>({purchases:history}),addListener:()=>{}};
const window={Capacitor:{isNativePlatform:()=>true,getPlatform:()=> 'ios',Plugins:{AppleBilling:bridge}},PARALLEL_CITY_CONFIG:{appleBilling:{enabled:true,backendUrl:'https://billing.test',products:{[slotProduct]:purchase.productId}}},ParallelCityAuth:{getIdToken:async()=>loggedIn?'token':null,download:async()=>{}},addEventListener:()=>{}};
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../apple-billing-client.js'),'utf8'),{window,document:{documentElement:{lang:'ko'}},setTimeout,clearTimeout,CustomEvent:class{},AbortSignal,fetch:async url=>({ok:true,json:async()=>url.endsWith('prepare')?{appAccountToken:accountToken(uid),products:productMap}:{verified,entitlementApplied:verified}})});
const billing=window.DrawerVillagePlayBilling;assert.equal((await billing.loadProducts()).products[0].productId,slotProduct);
await billing.purchase(slotProduct);assert.equal(finish,1);
verified=false;await assert.rejects(()=>billing.purchase(slotProduct));assert.equal(finish,1);
verified=true;await billing.restorePurchases(false);loggedIn=false;const before=buy;await assert.rejects(()=>billing.purchase(slotProduct),/로그인/);assert.equal(buy,before);
loggedIn=true;verified=true;cancel=true;await assert.rejects(()=>billing.purchase(slotProduct),/취소/);assert.equal(finish,1);
console.log('PASS Apple billing: identity, signed-receipt rejection, transaction idempotency, sandbox separation, refund replay, server-before-finish, login gate, cancellation, price/product mapping');
})().catch(e=>{console.error(e);process.exitCode=1});
