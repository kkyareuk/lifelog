const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const c={structuredClone,Map,Set,window:{},state:{activeTab:'observe',preventInterTownMovement:true},emptyWorld:()=>({world:{},catalog:{},preventInterTownMovement:false}),restoreWardrobe:x=>x,withTownEditDraft:x=>x};
vm.createContext(c);vm.runInContext(fs.readFileSync('shared-world.js','utf8').split('\n').filter(l=>!l.startsWith('import ')).join('\n').replace(/export /g,''),c);
const fixture={group:{id:'g',rules:{allowInterTownMovement:true},towns:[{id:'a'},{id:'b'}]},homes:[{id:'ha',townId:'a',layoutJson:'{}'},{id:'hb',townId:'b',layoutJson:'{}'}],residents:[{id:'r',townId:'a',sharedHomeId:'ha',profileJson:'{}',scheduleJson:JSON.stringify({routines:[{townId:'b',homeId:'hb',visitHomeId:'hb'},{townId:'personal',homeId:'personal'}]})}]};
let w=c.buildSharedWorld(fixture);assert.equal(w.preventInterTownMovement,false);assert.equal(w.routines.r[0].townId,'b');assert.equal(w.routines.r[0].homeId,'hb');assert.equal(w.routines.r[1].townId,'a');assert.equal(w.routines.r[1].homeId,'ha');assert.equal(c.state.preventInterTownMovement,true);
fixture.group.rules.allowInterTownMovement=false;c.state.preventInterTownMovement=false;w=c.buildSharedWorld(fixture);assert.equal(w.preventInterTownMovement,true);assert.equal(c.state.preventInterTownMovement,false);
delete fixture.group.rules.allowInterTownMovement;assert.equal(c.buildSharedWorld(fixture).preventInterTownMovement,false);
assert(fs.readFileSync('simulation.js','utf8').includes('JSON.stringify({preventInterTownMovement:state.preventInterTownMovement'));
console.log('PASS independent group travel rules, legacy default, schedule destinations, personal state isolation, cache invalidation');
