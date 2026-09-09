const assert=require('node:assert/strict');
const {createHandler,RECIPIENT}=require('../functions/moderation-email');
const now=Date.now();
let stored={status:'pending'},requests=[];
const ref={get:async()=>({exists:!!stored,data:()=>stored}),update:async patch=>Object.assign(stored,patch)};
const report={targetName:'test',reason:'spam',details:'test details',to:'attacker@example.test',evidence:'PRIVATE EVIDENCE'};
const event={time:new Date(now).toISOString(),params:{reportId:'test-report'},data:{ref,data:()=>report}};
const handler=createHandler({clock:()=>now,config:()=>({apiKey:'test-only',from:'reports@example.test'}),fetcher:async(url,options)=>{requests.push({url,...options});return {ok:true,json:async()=>({id:'receipt'})}}});
(async()=>{
 await handler(event);await handler(event);assert.equal(requests.length,1);
 const payload=JSON.parse(requests[0].body);assert.deepEqual(payload.to,[RECIPIENT]);assert.ok(!payload.text.includes(report.evidence));assert.equal(stored.status,'pending');assert.equal(stored.emailNotification.status,'sent');
 stored={status:'pending'};const failed=createHandler({clock:()=>now,config:()=>({apiKey:'test',from:'reports@example.test'}),fetcher:async()=>({ok:false,status:503})});
 await assert.rejects(failed(event),/send-failed/);assert.equal(stored.status,'pending');assert.equal(stored.emailNotification.status,'retrying');
 await handler(event);assert.equal(requests[0].headers['Idempotency-Key'],requests[1].headers['Idempotency-Key']);
 stored={status:'pending'};await handler({...event,time:new Date(now-24*3600000).toISOString()});assert.equal(stored.emailNotification.status,'needs-attention');assert.equal(requests.length,2);
 stored=null;await handler(event);assert.equal(requests.length,2);
 console.log('PASS fixed recipient, no evidence attachment, deduplication, failure preserves report, bounded retry and deleted report skip');
})().catch(e=>{console.error(e);process.exitCode=1});
