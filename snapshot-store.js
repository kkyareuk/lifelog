// Immutable game snapshots only. Media and other application databases are untouched.
export const SNAPSHOT_REF='drawer-idb-snapshot-v1:';
export async function openSnapshotStore(storage){
 if(typeof indexedDB==='undefined')return null;
 const names=new Set(['drawer-village-game-v1','drawer-village-last-nonempty-state-v1','drawer-village-recovery-before-cloud','parallel-city-game-v4','parallel-city-game-v3','parallel-city-game-v2']);
 const keys=Array.from({length:storage.length||0},(_,i)=>storage.key(i));
 const refs=keys.filter(k=>k&&(names.has(k.replace(/^drawer-account:[^:]+:/,''))||k.replace(/^drawer-account:[^:]+:/,'').startsWith('drawer-village-unreadable-primary-v1:'))).map(k=>storage.getItem(k)).filter(v=>v?.startsWith(SNAPSHOT_REF));
 // An unavailable old/account backup must not reject every importing module.
 // Report read failures only when that particular snapshot is actually used.
 let db=null,opening=null;
 const connect=()=>{
  if(db)return Promise.resolve(db);
  if(opening)return opening;
  opening=new Promise((resolve,reject)=>{
   let ended=false;
   const timer=setTimeout(()=>{ended=true;reject(Error('Snapshot database timed out'))},8000);
   const request=indexedDB.open('drawer-game-snapshots-v1',1);
   request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('snapshots'))request.result.createObjectStore('snapshots')};
   request.onsuccess=()=>{clearTimeout(timer);const connection=request.result;if(ended){connection.close();return}db=connection;connection.onclose=()=>{if(db===connection)db=null};connection.onversionchange=()=>{connection.close();if(db===connection)db=null};resolve(connection)};
   request.onerror=()=>{clearTimeout(timer);reject(request.error||Error('Snapshot database could not open'))};
  }).finally(()=>{opening=null});
  return opening;
 };
 const cache=new Map();
 const read=async id=>{
  const connection=await connect();
  return new Promise((resolve,reject)=>{
   const tx=connection.transaction('snapshots'),request=tx.objectStore('snapshots').get(id);
   const timer=setTimeout(()=>{try{tx.abort()}catch{}reject(Error('Snapshot read timed out'))},8000);
   request.onsuccess=()=>{clearTimeout(timer);resolve(request.result)};
   request.onerror=()=>{clearTimeout(timer);reject(request.error)};
   tx.onabort=()=>{clearTimeout(timer);reject(tx.error||Error('Snapshot read aborted'))};
  });
 };
 // A failed WebKit connection must be reopened, not reused for every retry.
 // Reads stay scoped to pointers already referenced by this installation.
 for(const pointer of new Set(refs)){
  for(let attempt=0;attempt<3;attempt++){
   try{const value=await read(pointer.slice(SNAPSHOT_REF.length));if(typeof value==='string'){cache.set(pointer,value);break}}
   catch{try{db?.close()}catch{}db=null}
   if(attempt<2)await new Promise(resolve=>setTimeout(resolve,200*(attempt+1)));
  }
 }
 const store={
  get:pointer=>{if(!cache.has(pointer))throw Error('Saved snapshot is unavailable');return cache.get(pointer)},
  async put(value){await connect();const id=crypto.randomUUID(),pointer=SNAPSHOT_REF+id;await new Promise((resolve,reject)=>{const tx=db.transaction('snapshots','readwrite',{durability:'strict'});tx.objectStore('snapshots').put(value,id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('Snapshot transaction aborted'))});if(await read(id)!==value)throw Error('Snapshot verification failed');cache.set(pointer,value);return pointer},
  release(pointer){if(!pointer?.startsWith(SNAPSHOT_REF))return;for(let i=0;i<storage.length;i++)if(storage.getItem(storage.key(i))===pointer)return;cache.delete(pointer);try{const tx=db.transaction('snapshots','readwrite');tx.objectStore('snapshots').delete(pointer.slice(SNAPSHOT_REF.length));tx.onerror=()=>{}}catch{/* Cleanup must not turn a committed write into a reported failure. */}}
 };
 // Inline saves (including the independent recovery mirror) stay inline.
 // Large writes move to IndexedDB only after the account writer exhausts quota.
 return store;
}
