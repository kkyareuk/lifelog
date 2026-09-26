// Immutable game snapshots only. Media and other application databases are untouched.
export const SNAPSHOT_REF='drawer-idb-snapshot-v1:';
export async function openSnapshotStore(storage){
 if(typeof indexedDB==='undefined')return null;
 const names=new Set(['drawer-village-game-v1','drawer-village-last-nonempty-state-v1','drawer-village-recovery-before-cloud','parallel-city-game-v4','parallel-city-game-v3','parallel-city-game-v2']);
 const keys=Array.from({length:storage.length||0},(_,i)=>storage.key(i));
 const refs=keys.filter(k=>names.has(k.replace(/^drawer-account:[^:]+:/,''))).map(k=>storage.getItem(k)).filter(v=>v?.startsWith(SNAPSHOT_REF));
 // An unavailable old/account backup must not reject every importing module.
 // Report read failures only when that particular snapshot is actually used.
 let db;try{db=await new Promise((resolve,reject)=>{let ended=false;const timer=setTimeout(()=>{ended=true;reject(Error('Snapshot database timed out'))},8000);const request=indexedDB.open('drawer-game-snapshots-v1',1);request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('snapshots'))request.result.createObjectStore('snapshots')};request.onsuccess=()=>{clearTimeout(timer);if(ended)request.result.close();else resolve(request.result)};request.onerror=()=>{clearTimeout(timer);reject(request.error)}})}catch(error){if(refs.length)return {get(){throw error},async put(){throw error},release(){}};return null}
 const cache=new Map();
 const read=id=>new Promise((resolve,reject)=>{const request=db.transaction('snapshots').objectStore('snapshots').get(id);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)});
 await Promise.all([...new Set(refs)].map(async pointer=>{try{const value=await read(pointer.slice(SNAPSHOT_REF.length));if(typeof value==='string')cache.set(pointer,value)}catch{/* Keep the pointer and original database untouched for retry/recovery. */}}));
 const store={
  get:pointer=>{if(!cache.has(pointer))throw Error('Saved snapshot is unavailable');return cache.get(pointer)},
  async put(value){const id=crypto.randomUUID(),pointer=SNAPSHOT_REF+id;await new Promise((resolve,reject)=>{const tx=db.transaction('snapshots','readwrite',{durability:'strict'});tx.objectStore('snapshots').put(value,id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Snapshot transaction aborted'))});if(await read(id)!==value)throw Error('Snapshot verification failed');cache.set(pointer,value);return pointer},
  release(pointer){if(!pointer?.startsWith(SNAPSHOT_REF))return;for(let i=0;i<storage.length;i++)if(storage.getItem(storage.key(i))===pointer)return;cache.delete(pointer);try{const tx=db.transaction('snapshots','readwrite');tx.objectStore('snapshots').delete(pointer.slice(SNAPSHOT_REF.length));tx.onerror=()=>{}}catch{/* Cleanup must not turn a committed write into a reported failure. */}}
 };
 // Inline saves (including the independent recovery mirror) stay inline.
 // Large writes move to IndexedDB only after the account writer exhausts quota.
 return store;
}
