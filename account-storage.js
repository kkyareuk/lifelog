import {PACKED,pack,unpack} from "./snapshot-codec.js";
import {encodeSnapshot} from "./snapshot-worker-client.js";

// Only game snapshots use this lossless on-device encoding. Settings, purchases,
// media and other applications' storage must never be rewritten or removed.
const snapshots=new Set(["drawer-village-game-v1","drawer-village-last-nonempty-state-v1","drawer-village-recovery-before-cloud","parallel-city-game-v4","parallel-city-game-v3","parallel-city-game-v2"]);
const isSnapshot=key=>snapshots.has(key.replace(/^drawer-account:[^:]+:/,""));
const quotaError=error=>error?.name==="QuotaExceededError"||error?.name==="NS_ERROR_DOM_QUOTA_REACHED"||error?.code===22||error?.code===1014;
function compactSnapshots(storage){
  // Origin quotas are shared by accounts. Encoding may reclaim space across
  // accounts, but the keys, ownership and decoded bytes stay exactly the same.
  const keys=Array.from({length:storage.length||0},(_,i)=>storage.key(i));
  for(const key of keys){
    if(!key||!isSnapshot(key))continue;
    const raw=storage.getItem(key);
    if(!raw)continue;
    // Only on quota failure, recompress even old level-1 snapshots. Never
    // discard another account's data or a recovery copy to make room.
    try{const packed=pack(unpack(raw),9);if(packed.length<raw.length)storage.setItem(key,packed)}catch{/* Atomic setItem keeps the original on failure. */}
  }
}

// A device can host several accounts. Guest/legacy saves remain separate and
// are never adopted or merged merely because somebody signs in.
export function createAccountStorage(storage,encode=encodeSnapshot){
  const marker="drawer-village-active-data-owner-v1";
  let scope=storage?.getItem(marker)||"guest";
  let scopeEpoch=0;
  const key=name=>scope==="guest"?name:`drawer-account:${encodeURIComponent(scope)}:${name}`;
  const revisions=new Map();
  const changed=target=>{const revision=(revisions.get(target)||0)+1;revisions.set(target,revision);return revision};
  return {
    get scope(){return scope},
    getItem:name=>{
      const raw=storage.getItem(key(name));
      // Leave malformed snapshots intact for recovery; the state loader can
      // reject their non-JSON contents and try another existing recovery copy.
      try{return isSnapshot(name)?unpack(raw):raw}catch{return raw}
    },
    setItem:(name,value)=>{
      const target=key(name),raw=String(value);
      changed(target);
      const encoded=isSnapshot(name)&&storage.getItem(target)?.startsWith(PACKED)?pack(raw):raw;
      try{storage.setItem(target,encoded)}catch(error){
        if(!quotaError(error))throw error;
        compactSnapshots(storage);
        storage.setItem(target,isSnapshot(name)?pack(raw,9):raw);
      }
    },
    async setItemAsync(name,value,current=()=>true){
      const target=key(name),ownerEpoch=scopeEpoch,revision=changed(target),raw=String(value);
      const valid=()=>scopeEpoch===ownerEpoch&&revisions.get(target)===revision&&current();
      const encoded=isSnapshot(name)&&storage.getItem(target)?.startsWith(PACKED)?await encode(raw):raw;
      if(!valid())return false;
      try{storage.setItem(target,encoded);return true}catch(error){if(!quotaError(error))throw error}
      // Compression, verification and quota recovery run outside the UI thread.
      // Never replace a snapshot changed while its old bytes were being encoded.
      const keys=Array.from({length:storage.length||0},(_,i)=>storage.key(i));
      for(const candidate of keys){
        if(!valid())return false;
        if(!candidate||candidate===target||!isSnapshot(candidate))continue;
        const previous=storage.getItem(candidate);if(!previous)continue;
        let packed;try{packed=await encode(previous,9,true)}catch{continue}
        if(!valid())return false;
        if(storage.getItem(candidate)===previous&&packed.length<previous.length){try{storage.setItem(candidate,packed)}catch(error){if(!quotaError(error))throw error}}
      }
      const packed=isSnapshot(name)?await encode(raw,9):raw;
      if(!valid())return false;
      storage.setItem(target,packed);return true;
    },
    copyItem(source,destination){const value=storage.getItem(key(source));if(value===null)return false;changed(key(destination));storage.setItem(key(destination),value);return true},
    removeItem:name=>{changed(key(name));storage.removeItem(key(name))},
    switchScope(uid){
      const next=String(uid||"guest");
      if(next===scope)return false;
      storage.setItem(marker,next);scope=next;scopeEpoch++;return true;
    }
  };
}
export const accountStorage=createAccountStorage(globalThis.localStorage);
