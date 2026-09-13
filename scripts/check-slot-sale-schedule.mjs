import assert from 'node:assert/strict';
import fs from 'node:fs';
import {SLOT_SALE_AT,characterSlotProduct,saleAllows} from '../slot-sale.js';
// The new catalog keeps both pack sizes, including across the old sale boundary.
for(const now of [SLOT_SALE_AT-1,SLOT_SALE_AT,SLOT_SALE_AT+1]){
 assert.equal(characterSlotProduct(now),'character_slot_1');
 for(const id of ['character_slot_1','character_slots_5','town_slot_1','town_slots_5'])assert.equal(saleAllows(id,now),true);
}
assert.doesNotMatch(fs.readFileSync('functions/index.js','utf8'),/const activeSlot=/);
console.log('PASS both slot sizes remain available across the previous sale date');
