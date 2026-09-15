const assert=require('node:assert/strict');
const make=require('../functions/shared-relationship-requests');
const records=new Map([['characterGroups/g',{memberIds:['gone','mine']}],['residents/mine',{ownerUid:'me'}]]);
const root={collection:name=>({doc:id=>({path:name+'/'+id,id})})};
const tx={get:async ref=>({exists:records.has(ref.path),data:()=>records.get(ref.path)}),delete:ref=>records.delete(ref.path),update:()=>{}};
const api=make({db:{runTransaction:fn=>fn(tx)},membership:async(_,gid,uid)=>({root,group:{ownerUid:'host'},member:{role:'member'}}),clock:Date.now,id:v=>{assert.equal(typeof v,'string');assert(!v.includes('/'));return v}});
(async()=>{
 await assert.rejects(api.deleteRelationship('stranger',{groupId:'town',kind:'characterGroup',targetId:'g'}),/character-owner-required/);
 assert(records.has('characterGroups/g'));
 await api.deleteRelationship('me',{groupId:'town',kind:'characterGroup',targetId:'g'});assert(!records.has('characterGroups/g'));assert(records.has('residents/mine'));
 await api.deleteRelationship('me',{groupId:'town',kind:'characterGroup',targetId:'g'});
 records.set('characterGroups/empty',{memberIds:['gone']});await assert.rejects(api.deleteRelationship('me',{groupId:'town',kind:'characterGroup',targetId:'empty'}),/character-owner-required/);
 await api.deleteRelationship('host',{groupId:'town',kind:'characterGroup',targetId:'empty'});assert(!records.has('characterGroups/empty'));
 console.log('PASS orphan group deletion: remaining owner, host, denied stranger, idempotency, residents preserved');
})().catch(e=>{console.error(e);process.exitCode=1});
