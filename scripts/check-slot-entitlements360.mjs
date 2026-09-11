import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {slotText} from '../character-slots.js';
globalThis.window={};
const source=fs.readFileSync(new URL('../auth.js',import.meta.url),'utf8');
const effective=source.slice(source.indexOf('let appleSandboxEntitlements='),source.indexOf('const publishEntitlements='));
const setter=source.match(/setAppleSandboxEntitlements:(.*),\n  refreshEntitlements:/)[1];
const ctx={window:{Capacitor:{isNativePlatform:()=>true,getPlatform:()=> 'ios'},ParallelCity:{setEntitlements:v=>ctx.shown=v}},user:{uid:'buyer'},entitlements:{characterSlotPacks:0,characterSingleSlots:0,townSlotPacks:0},normalizeEntitlements:v=>v};vm.createContext(ctx);vm.runInContext(effective+'\nsetSandbox='+setter+';getEffective=effectiveEntitlements;',ctx);
ctx.setSandbox({characterSlotPacks:1},'buyer');assert.equal(ctx.shown.characterSlotPacks,1);
for(const uiLanguage of ['ko','en','ja']){const s=slotText({uiLanguage,order:['a','b']},{entitlements:ctx.getEffective(),appleSandbox:true,slotUsage:{characterLimit:5}});assert.equal(s.total,10);assert.equal(s.remaining,8);assert.equal(s.used,2)}
ctx.user={uid:'other'};assert.equal(ctx.getEffective().characterSlotPacks,0);ctx.setSandbox({characterSlotPacks:9},'buyer');assert.equal(ctx.getEffective().characterSlotPacks,0);
ctx.user={uid:'buyer'};ctx.entitlements.characterSingleSlots=2;assert.equal(slotText({order:['a','b']},{entitlements:ctx.getEffective(),appleSandbox:true}).remaining,10);assert.equal(ctx.entitlements.characterSlotPacks,0);
console.log('PASS base 5 + verified test 5, used 2 => remaining 8; production retained; other UID isolated; KO/EN/JA');
