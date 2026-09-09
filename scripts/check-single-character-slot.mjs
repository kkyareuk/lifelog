import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const source=read('functions/index.js');
const next=vm.runInNewContext('('+source.match(/function nextEntitlements[\s\S]*?\n}/)[0]+')');
const normalize=vm.runInNewContext('('+read('auth.js').match(/const normalizeEntitlements=(value=>[\s\S]*?\n});/)[1]+')');
const require=createRequire(import.meta.url);
const {usage,check}=require('../functions/account-slots.js');
const {validatePurchase,accountToken}=require('../functions/apple-billing.js');
for(const [initial,expected] of [[{},8],[{characterSlotPacks:2},18],[{purchases:['character_slots_5']},13],[{purchases:['character_slots_5'],characterSlotPacks:0},8]]){
  const ent=normalize(next(initial,'character_slot_1',3));
  assert.equal(5+ent.characterSlotPacks*5+ent.characterSingleSlots,expected);
  const ref=key=>({key,collection:name=>ref(key+'/'+name),doc:id=>ref(key+'/'+id)});
  const result=await usage({collection:ref},{get:async r=>({data:()=>r.key==='users/u'?{entitlements:ent,gameState:{order:['a','b']}}:{},docs:[]})},'u');
  assert.equal(result.characterLimit,expected);
  assert.equal(result.personalCharacters,2);
  check({...result,characters:expected-3},'characters');
  assert.throws(()=>check({...result,characters:expected-2},'characters'));
}
assert.equal(next({purchases:['character_slots_5']},'character_slots_5',1).characterSlotPacks,2);
assert.equal(next({characterSingleSlots:4},'character_slots_5',2).characterSingleSlots,4);
const catalog=source.match(/const WEB_PRODUCTS=Object.freeze\(([\s\S]*?)\);/)[1];
const webCart=vm.runInNewContext(`const WEB_PRODUCTS=${catalog};const WEB_GAME_PAYMENT_LIMIT=50000;(${source.match(/function webCart[\s\S]*?\n}/)[0]})`);
assert.equal(webCart([{packageId:'character_slot_1',quantity:3}])[0].unitAmount,1000);
assert.equal(webCart([{packageId:'character_slots_5',quantity:1}])[0].unitAmount,1200);
assert.throws(()=>webCart([{packageId:'character_slot_1',quantity:50}]));
for(const id of ['character_slot_1','character_slots_5']){
  validatePurchase({transactionId:'123',productId:'com.drawervillage.app.'+id,bundleId:'com.drawervillage.app',environment:'Sandbox',type:'Consumable',quantity:1,appAccountToken:accountToken('buyer')},'buyer','Sandbox','123');
}
assert.match(read('views.js'),/character_slot_1:\{label:"캐릭터 슬롯",title:"캐릭터 1명 추가"/);
assert.match(read('payment.html'),/saleAllows\(id\)/);
console.log('Single-slot grants, legacy preservation, refund zero, shared capacity, checkout and Apple SKU validation passed.');
