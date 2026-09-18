'use strict';
const assert=require('node:assert/strict');
const {grant,nextSlots,CAMPAIGN}=require('../functions/registration-town-slot');
const rows=new Map();let queue=Promise.resolve();
const ref=key=>({key,collection:n=>({doc:id=>ref(key+'/'+n+'/'+id)})});
const merge=(a,b)=>{const out={...a};for(const [k,v] of Object.entries(b))out[k]=v&&typeof v==='object'&&!Array.isArray(v)?merge(out[k]||{},v):v;return out};
const db={collection:n=>({doc:id=>ref(n+'/'+id)}),runTransaction:fn=>{const result=queue.then(async()=>{const writes=[];const value=await fn({get:async r=>({exists:rows.has(r.key),data:()=>structuredClone(rows.get(r.key))}),set:(r,v)=>writes.push(()=>rows.set(r.key,merge(rows.get(r.key)||{},v))),create:(r,v)=>writes.push(()=>{assert(!rows.has(r.key));rows.set(r.key,v)})});writes.forEach(w=>w());return value});queue=result.catch(()=>{});return result}};
(async()=>{
 assert.deepEqual(nextSlots(),{before:0,after:1});assert.equal(nextSlots({purchases:['town_slot_1','town_slot_1']}).after,3);assert.throws(()=>nextSlots({townSlotPacks:1.5}));
 rows.set('users/existing',{name:'keep',entitlements:{townSlotPacks:7,diamondPaid:99,adFree:true,purchases:['town_slots_5']}});
 assert.equal(await grant(db,'existing'),'granted');assert.equal(rows.get('users/existing').entitlements.townSlotPacks,8);assert.equal(rows.get('users/existing').entitlements.diamondPaid,99);assert.equal(rows.get('users/existing').entitlements.adFree,true);assert.equal(rows.get('users/existing').name,'keep');
 assert.deepEqual((await Promise.all([grant(db,'new'),grant(db,'new')])).sort(),['existing','granted']);assert.equal(2+rows.get('users/new').entitlements.townSlotPacks,3);
 assert.equal(await grant(db,'existing'),'existing');assert.equal(rows.get('users/existing').entitlements.townSlotPacks,8);
 rows.set('deletedAccounts/gone',{});assert.equal(await grant(db,'gone'),'deleted');assert(!rows.has('users/gone'));
 assert.equal(rows.get('users/new/compensationGrants/'+CAMPAIGN).amount,1);
 console.log('PASS existing purchases preserved; new total 3; duplicate/overlap once; deleted account excluded');
})().catch(e=>{console.error(e);process.exitCode=1});
