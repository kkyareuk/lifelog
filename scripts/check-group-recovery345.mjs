import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
const source=fs.readFileSync('auth.js','utf8').replace(/\r\n/g,'\n');
const refresh=source.slice(source.indexOf('async function refreshGroups('),source.indexOf('\nasync function createGroup('));
const original={id:'village',myRole:'owner',memberCount:1,residentCount:2};
let fail=false,selected='',reads=0;
const c={ready:true,db:{},user:{uid:'u'},groupState:{groups:[original],activeGroupId:'village'},groupRefreshGeneration:0,captureSession:()=>({uid:'u'}),assertSession:()=>{},emitGroupState:()=>{},collection:()=>({}),doc:()=>({}),console:{warn(){},error(){}},getDocsFromServer:async()=>{reads++;if(fail)throw {code:'unavailable'};return {docs:[{id:'village',data:()=>({role:'owner'})}]};},getDocFromServer:async()=>({id:'village',exists:()=>true,data:()=>({name:'Restored'})}),mapConcurrent:async(xs,n,fn)=>Promise.all(xs.map(fn)),readGroupContext:()=>({groupId:'village'}),watchActiveGroup:id=>{selected=id},getCountFromServer:async()=>({data:()=>({count:1})}),refreshSlotUsage:async()=>{},slotUsage:{}};
vm.createContext(c);vm.runInContext(refresh,c);
fail=true;await c.refreshGroups();assert.equal(c.groupState.groups[0].id,'village');assert.equal(c.groupState.error,'unavailable');
fail=false;await c.refreshGroups();assert.equal(c.groupState.groups[0].myRole,'owner');assert.equal(selected,'village');assert.equal(c.groupState.error,'');
// A reconnect must refresh even when no active selection survived.
let online,refreshed=0;c.window={addEventListener:(name,fn)=>online=fn};c.refreshGroups=()=>{refreshed++};c.groupState.activeGroupId='';
vm.runInContext(source.slice(source.indexOf("window.addEventListener('online',()=>{\n  if(!user)return;"),source.indexOf('function setGroupDetailActive(')),c);online();assert.equal(refreshed,1);
// Exercise the listener's cache guard with the real expression.
const guard=source.match(/if\(snapshot.metadata\?\.fromCache&&\(mapSnapshot\?snapshot.empty:!snapshot.exists\(\)\)\)return;/)[0];
const applies=new Function('snapshot','mapSnapshot',guard+'return true;');
assert.equal(applies({metadata:{fromCache:true},exists:()=>false},false),undefined);
assert.equal(applies({metadata:{fromCache:true},empty:true},true),undefined);
assert.equal(applies({metadata:{fromCache:false},exists:()=>false},false),true);
assert.equal(applies({metadata:{fromCache:true},empty:false},true),true);
console.log('PASS: outage preserves owner list; recovery restores selection; reconnect without selection refreshes; cache misses cannot delete group/roster; server deletion remains authoritative');
