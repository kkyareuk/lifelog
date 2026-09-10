const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync('auth.js','utf8');const start=source.indexOf('function watchActiveGroup('),end=source.indexOf("window.addEventListener('online'",start);
const c={console,Date,Map,Set,callbacks:[],user:{uid:'u'},groupSubscriptionKey:'',groupUnsubscribers:[],groupState:{groups:[]},readGroupContext:()=>({}),writeGroupContext(){},emitGroupState(){},groupRefs:()=>({}),collection:()=>({}),db:{},onSnapshot:(ref,success,error)=>{c.callbacks.push({success,error});return ()=>{}},stopGroupSubscriptions:()=>{c.groupUnsubscribers=[];c.groupSubscriptionKey=''},migratedSharedProfiles:new Set()};
vm.createContext(c);vm.runInContext(source.slice(start,end),c);c.watchActiveGroup('a');const old=c.callbacks.at(-1);c.watchActiveGroup('b');old.error({code:'old-denied'});assert.equal(c.groupState.error,null);
const count=c.callbacks.length;c.watchActiveGroup('b');assert.equal(c.callbacks.length,count);c.watchActiveGroup('b',{force:true});assert(c.callbacks.length>count);
c.callbacks.at(-1).error({code:'current-denied'});assert.equal(c.groupState.error,'current-denied');
console.log('PASS stale subscription errors ignored; forced reconnect; current errors preserved');
