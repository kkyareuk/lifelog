import assert from 'node:assert/strict';
const data=new Map();let limit=Infinity,deny=false;
globalThis.localStorage={get length(){return data.size},key:i=>[...data.keys()][i]??null,getItem:k=>data.get(k)??null,removeItem:k=>data.delete(k),setItem(k,v){
  v=String(v);const bytes=[...data].reduce((n,[key,value])=>n+(key===k?0:key.length+value.length),0)+k.length+v.length;
  if(deny||bytes>limit)throw new DOMException('quota','QuotaExceededError');data.set(k,v);
}};
globalThis.document={querySelector:()=>null,addEventListener(){},activeElement:null};
globalThis.window={addEventListener(){},dispatchEvent(){}};
const {createAccountStorage}=await import('../account-storage.js');
const store=createAccountStorage(localStorage),primary='drawer-village-game-v1',backup='drawer-village-recovery-before-cloud';
const save=id=>JSON.stringify({schema:31,characters:{[id]:{id,name:id,notes:'계정별 보존 🏡 '.repeat(15000),days:{}}},order:[id]});
const a=save('A'),b=save('B'),next=save('Restored');
store.switchScope('A');store.setItem(primary,a);store.setItem(backup,a);
store.switchScope('B');store.setItem(primary,b);store.setItem('other-app-data','keep me');
limit=[...data].reduce((n,[k,v])=>n+k.length+v.length,0)+100;
store.setItem(backup,b);store.setItem(primary,next);
assert.equal(store.getItem(primary),next);assert.equal(store.getItem(backup),b);
assert.equal(store.getItem('other-app-data'),'keep me');
store.switchScope('A');assert.equal(store.getItem(primary),a);assert.equal(store.getItem(backup),a);
assert(data.get('drawer-account:A:'+primary).startsWith('drawer-gzip-v1:'));
const reload=createAccountStorage(localStorage);assert.equal(reload.getItem(primary),a,'Fresh reader decodes exactly');
// Failed replacement must not delete legacy copies or mutate in-memory state.
limit=Infinity;
const game=await import('../state.js');
const before=game.cloneState();store.setItem('parallel-city-game-v2',a);deny=true;
assert.throws(()=>game.replaceState(JSON.parse(next)),{code:'backup-storage-full'});
assert.deepEqual(game.cloneState(),before);assert.equal(store.getItem(primary),a);assert.equal(store.getItem('parallel-city-game-v2'),a);
deny=false;limit=30000;game.replaceState(JSON.parse(next));
assert.deepEqual(game.state.order,['Restored']);assert.equal(JSON.parse(store.getItem(primary)).characters.Restored.name,'Restored');
// Corrupt packed data is retained verbatim rather than erased during recovery.
limit=Infinity;localStorage.setItem('drawer-account:A:'+backup,'drawer-gzip-v1:broken');
assert.equal(store.getItem(backup),'drawer-gzip-v1:broken');
console.log('PASS quota recovery, lossless Unicode, cross-account ownership, reload, failed-write rollback, legacy preservation and corrupt-copy preservation');
