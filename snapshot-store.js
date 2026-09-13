// Immutable game snapshots only. Media and other application databases are untouched.
export const SNAPSHOT_REF='drawer-idb-snapshot-v1:';
export async function openSnapshotStore(storage){
 if(typeof indexedDB==='undefined')return null;
 const names=new Set(['drawer-village-game-v1','drawer-village-last-nonempty-state-v1','drawer-village-recovery-before-cloud','parallel-city-game-v4','parallel-city-game-v3','parallel-city-game-v2']);
 const keys=Array.from({length:storage.length||0},(_,i)=>storage.key(i));
 const refs=keys.filter(k=>names.has(k.replace(/^drawer-account:[^:]+:/,''))).map(k=>storage.getItem(k)).filter(v=>v?.startsWith(SNAPSHOT_REF));
 let db;try{db=await new Promise((resolve,reject)=>{const request=indexedDB.open('drawer-game-snapshots-v1',1);request.onupgradeneeded=()=>request.result.createObjectStore('snapshots');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)})}catch(error){if(refs.length)throw error;return null}
 const cache=new Map();
 const read=id=>new Promise((resolve,reject)=>{const request=db.transaction('snapshots').objectStore('snapshots').get(id);request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)});
 for(const pointer of new Set(refs)){const value=await read(pointer.slice(SNAPSHOT_REF.length));if(typeof value!=='string')throw Error('Saved snapshot is unavailable');cache.set(pointer,value)}
 const store={
  get:pointer=>{if(!cache.has(pointer))throw Error('Saved snapshot is unavailable');return cache.get(pointer)},
  async put(value){const id=crypto.randomUUID(),pointer=SNAPSHOT_REF+id;await new Promise((resolve,reject)=>{const tx=db.transaction('snapshots','readwrite');tx.objectStore('snapshots').put(value,id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Snapshot transaction aborted'))});if(await read(id)!==value)throw Error('Snapshot verification failed');cache.set(pointer,value);return pointer},
  release(pointer){if(!pointer?.startsWith(SNAPSHOT_REF))return;for(let i=0;i<storage.length;i++)if(storage.getItem(storage.key(i))===pointer)return;cache.delete(pointer);const tx=db.transaction('snapshots','readwrite');tx.objectStore('snapshots').delete(pointer.slice(SNAPSHOT_REF.length));tx.onerror=()=>{};}
 };
 // Move only verified game snapshots, before synchronous state loading. Keeping
 // the same encoded bytes preserves recovery and account ownership exactly.
 for(const key of keys){const value=storage.getItem(key);if(!names.has(key.replace(/^drawer-account:[^:]+:/,''))||!value||value.startsWith(SNAPSHOT_REF)||value.length<131072)continue;
  let pointer;try{pointer=await store.put(value);if(storage.getItem(key)===value)storage.setItem(key,pointer);else store.release(pointer)}catch{store.release(pointer);/* The original storage entry is still intact. */}
 }
 return store;
}

