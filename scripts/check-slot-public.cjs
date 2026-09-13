const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
for(const file of ['functions/index.js',...(process.env.DEPLOYED_SOURCE?[process.env.DEPLOYED_SOURCE]:[])]){
 const s=fs.readFileSync(file,'utf8'),ctx={};vm.createContext(ctx);
 const products=s.slice(s.indexOf('const WEB_PRODUCTS='),s.indexOf('const TOSS_MID='));
 const funcs=s.slice(s.indexOf('function nextEntitlements('),s.indexOf('app.post("/payments/orders"'));
 vm.runInContext(products+'\nconst WEB_GAME_PAYMENT_LIMIT=50000;\n'+funcs+'\nthis.test={nextEntitlements,webCart,orderSummary};',ctx);
 const {nextEntitlements,webCart,orderSummary}=ctx.test;
 assert.equal(orderSummary(webCart([{packageId:'character_slot_1',quantity:2},{packageId:'character_slots_5',quantity:1}])).amount,6800);
 let e=nextEntitlements({characterSlotPacks:2},'character_slot_1',2);assert.equal(e.characterSlotPacks,2);assert.equal(e.characterSingleSlots,2);
 e=nextEntitlements(e,'character_slots_5',1);assert.equal(5+e.characterSlotPacks*5+e.characterSingleSlots,22);
 assert.equal(nextEntitlements({purchases:['character_slots_5']},'character_slots_5',1).characterSlotPacks,2);
 assert.equal(nextEntitlements({characterSlotPacks:0,purchases:['character_slots_5']},'character_slots_5',1).characterSlotPacks,1);
 assert.throws(()=>webCart([{packageId:'character_slot_1',quantity:-1}]));
 assert.throws(()=>webCart([{packageId:'character_slot_1',quantity:1},{packageId:'character_slot_1',quantity:1}]));
 console.log(file+': prices, mixed quantities, legacy grants, explicit zero, invalid cart PASS');
}
