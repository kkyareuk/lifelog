import {SNAPSHOT_REF} from './snapshot-store.js';
import {unpack} from './snapshot-codec.js';
const names=new Set(['drawer-village-game-v1','drawer-village-last-nonempty-state-v1','drawer-village-recovery-before-cloud','parallel-city-game-v4','parallel-city-game-v3','parallel-city-game-v2']);
export const recoveryOwner=storage=>storage.getItem('drawer-village-active-data-owner-v1')||'guest';
const prefix=owner=>owner==='guest'?'':`drawer-account:${encodeURIComponent(owner)}:`;
function ownedKey(key,owner){const p=prefix(owner);if(!key.startsWith(p))return false;const name=key.slice(p.length);return names.has(name)||/^drawer-village-unreadable-primary-v1:\d/.test(name)}
export function decodeRecovery(raw){
 const value=JSON.parse(unpack(raw));
 if(!value||typeof value!=='object'||!value.characters||typeof value.characters!=='object')throw Error('invalid-save');
 const characters=Object.values(value.characters).filter(c=>c&&typeof c==='object'&&(typeof c.name==='string'||typeof c.id==='string'));
 if(!characters.length)throw Error('empty-save');
 return {value,count:characters.length,names:characters.slice(0,4).map(c=>String(c.name||'').slice(0,80)),saved:Number.isFinite(Number(value.lastSaved))?Number(value.lastSaved):0};
}
// Open only this app's snapshot database. Never create a database during search.
function openExisting(factory){return new Promise((resolve,reject)=>{
 if(!factory){reject(Error('unavailable'));return}
 let done=false;const request=factory.open('drawer-game-snapshots-v1');
 const timer=setTimeout(()=>{done=true;reject(Error('timeout'))},8000);
 request.onupgradeneeded=()=>request.transaction.abort();
 request.onerror=()=>{clearTimeout(timer);reject(request.error||Error('unavailable'))};
 request.onsuccess=()=>{clearTimeout(timer);if(done){request.result.close();return}resolve(request.result)};
})}
function readRecord(db,id){return new Promise((resolve,reject)=>{
 const tx=db.transaction('snapshots','readonly'),request=tx.objectStore('snapshots').get(id);
 const timer=setTimeout(()=>{try{tx.abort()}catch{}reject(Error('timeout'))},8000);
 request.onsuccess=()=>{clearTimeout(timer);resolve(request.result)};
 request.onerror=()=>{clearTimeout(timer);reject(request.error)};
 tx.onabort=()=>{clearTimeout(timer);reject(tx.error||Error('aborted'))};
})}
export async function searchLocalRecovery(storage=localStorage,factory=globalThis.indexedDB){
 const owner=recoveryOwner(storage),primaryKey=prefix(owner)+'drawer-village-game-v1',primary=storage.getItem(primaryKey);
 const keys=Array.from({length:storage.length},(_,i)=>storage.key(i)).filter(k=>k&&ownedKey(k,owner)).sort((a,b)=>Number(b===primaryKey)-Number(a===primaryKey)||b.localeCompare(a));
 const report={checked:0,missing:0,unreadable:0,invalid:0,changed:0,limited:keys.length>100},candidates=[],seen=new Set();let db=null,dbFailed=false;
 try{for(const key of keys.slice(0,100)){
  if(recoveryOwner(storage)!==owner)throw Error('account-changed');
  const stored=storage.getItem(key);if(!stored)continue;report.checked++;let raw=stored;
  if(stored.startsWith(SNAPSHOT_REF)){
   if(dbFailed){report.unreadable++;continue}
   try{db??=await openExisting(factory);raw=await readRecord(db,stored.slice(SNAPSHOT_REF.length));if(typeof raw!=='string'){report.missing++;continue}}
   catch{report.unreadable++;dbFailed=true;continue}
  }
  if(storage.getItem(key)!==stored){report.changed++;continue}
  try{const summary=decodeRecovery(raw);if(seen.has(raw))continue;seen.add(raw);candidates.push({key,stored,raw,...summary})}catch{report.invalid++}
 }}finally{db?.close()}
 if(recoveryOwner(storage)!==owner)throw Error('account-changed');
 candidates.sort((a,b)=>b.saved-a.saved);
 return {owner,primaryKey,primary,candidates,report};
}
export function verifyRecoverySelection(storage,search,candidate){
 if(recoveryOwner(storage)!==search.owner||!search.candidates.includes(candidate)||!ownedKey(candidate.key,search.owner))throw Error('account-changed');
 if(storage.getItem(search.primaryKey)!==search.primary||storage.getItem(candidate.key)!==candidate.stored)throw Error('save-changed');
 decodeRecovery(candidate.raw);
}
