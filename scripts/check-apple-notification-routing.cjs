const assert=require('node:assert/strict');
const express=require('../functions/node_modules/express');
const {installAppleBilling}=require('../functions/apple-billing');
(async()=>{
 const notice={notificationType:'TEST',data:{bundleId:'com.drawervillage.app',environment:'Sandbox'}};
 const good='header.'+Buffer.from(JSON.stringify(notice)).toString('base64url')+'.verified';
 const selected=[];const app=express();app.use(express.json());
 installAppleBilling(app,{db:{runTransaction(){throw Error('TEST must not write')}},services:environment=>({environment,verifier:{verifyAndDecodeNotification:async jws=>{selected.push(environment);assert.equal(environment,'Sandbox');if(jws!==good)throw Error('Invalid signature');return notice}}})});
 const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 try{const send=signedPayload=>fetch('http://127.0.0.1:'+server.address().port+'/apple-billing/notifications',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({signedPayload})});
 assert.equal((await send(good.replace('.verified','.forged'))).status,503);
 assert.equal((await send(good)).status,200);
 assert.equal((await send('malformed')).status,400);
 assert.deepEqual(selected,['Sandbox','Sandbox']);
 console.log('PASS notification routing: Sandbox TEST without appAppleId accepted only after signature verification; forged and malformed rejected; no writes');
 }finally{server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
