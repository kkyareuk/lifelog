import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import {SLOT_SALE_AT,characterSlotProduct,saleAllows} from '../slot-sale.js';
const source=fs.readFileSync('functions/index.js','utf8');
const gate=source.slice(source.indexOf('const activeSlot='),source.indexOf('const {amount,count,orderName}=orderSummary(items);'));
for(const now of [SLOT_SALE_AT-1,SLOT_SALE_AT,SLOT_SALE_AT+1])for(const id of ['character_slots_5','character_slot_1']){
 const expected=now<SLOT_SALE_AT?'character_slots_5':'character_slot_1';
 assert.equal(characterSlotProduct(now),expected);assert.equal(saleAllows(id,now),id===expected);
 const run=()=>vm.runInNewContext(gate,{items:[{packageId:id}],Date:{now:()=>now,parse:Date.parse},Error,Object});
 if(id===expected)assert.doesNotThrow(run);else assert.throws(run,e=>e.status===409);
}
assert.equal(new Date(SLOT_SALE_AT).toISOString(),'2026-09-13T15:00:00.000Z');
console.log('PASS KST midnight boundary, both SKU selectors and server new-order gate');
