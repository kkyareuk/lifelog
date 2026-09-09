const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('auth.js','utf8');
const body=source.slice(source.indexOf('let mailboxSignalStop='),source.indexOf('const groupSnapshot='));
let callback,stopped=0,reads=0;const timers=new Map();let sequence=0;
const context={user:{uid:'apple-user'},db:{},console,
 doc:(_db,...parts)=>parts.join('/'),
 onSnapshot:(path,cb)=>{assert.equal(path,'users/apple-user/sync/mailbox-signal');callback=cb;return()=>stopped++},
 refreshMailbox:async force=>{assert.equal(force,true);reads++},
 setTimeout:fn=>{timers.set(++sequence,fn);return sequence},clearTimeout:id=>timers.delete(id)};
vm.createContext(context);vm.runInContext(body,context);
context.watchMailboxSignal();callback();callback();assert.equal(timers.size,1);
for(const fn of timers.values())fn();timers.clear();assert.equal(reads,1);
callback();context.user=null;context.watchMailboxSignal();assert.equal(stopped,1);assert.equal(timers.size,0);
callback();for(const fn of timers.values())fn();assert.equal(reads,1,'old account callback cannot read mail');
console.log('PASS account-scoped mailbox signal, coalesced refresh and sign-out isolation');
