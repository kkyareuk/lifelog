const assert=require('node:assert/strict'),{db,data}=require('./court-fixture.cjs')();
const service=require('../functions/shared-town').createSharedTownService({db,engine:async()=>({})});
data.set('groups/g',{ownerUid:'host',towns:[{id:'t',name:'Town',places:[]}],rules:{}});
const save=patch=>service.saveTown('host',{groupId:'g',townId:'t',revision:data.get('groups/g').buildingRevision||0,patch});
(async()=>{
 await assert.rejects(save({backgroundSetting:'neo_cacheport'}),/background-dlc-required/);
 await assert.rejects(save({backgroundMusic:'arkenwald'}),/background-dlc-required/);
 data.set('users/host',{entitlements:{dlcPacks:['neo_cacheport']}});
 const first=await save({backgroundSetting:'neo_cacheport',backgroundMusic:'neo_cacheport',backgroundRulesEnabled:true,era:'cyberpunk',culture:'mixed'});assert.equal(first.town.backgroundMusic,'neo_cacheport');
 await assert.rejects(save({backgroundMusic:'arkenwald'}),/background-dlc-required/);
 const second=await save({backgroundRulesEnabled:false,era:'modern'});assert.equal(second.town.backgroundRulesEnabled,false);assert.equal(second.town.backgroundSetting,'neo_cacheport');
 await assert.rejects(save({backgroundRulesEnabled:'false'}),/invalid-value/);
 await assert.rejects(save({backgroundSetting:'invented'}),/invalid-town-setting/);
 data.set('users/host',{entitlements:{dlcPacks:['neo_cacheport','medieval']}});
 assert.equal((await save({backgroundMusic:'arkenwald'})).town.backgroundMusic,'arkenwald');
 await assert.rejects(service.saveTown('member',{groupId:'g',townId:'t',patch:{backgroundSetting:'neo_cacheport'}}),/manager-required/);
 console.log('PASS shared DLC permission, independent music/rules, invalid inputs and member permissions');
})().catch(e=>{console.error(e);process.exitCode=1});
