import {gzip,ungzip} from "./vendor/pako.esm.mjs";

// Only game snapshots use this lossless on-device encoding. Settings, purchases,
// media and other applications' storage must never be rewritten or removed.
const PACKED="drawer-gzip-v1:";
const snapshots=new Set(["drawer-village-game-v1","drawer-village-last-nonempty-state-v1","drawer-village-recovery-before-cloud","parallel-city-game-v4","parallel-city-game-v3","parallel-city-game-v2"]);
const isSnapshot=key=>snapshots.has(key.replace(/^drawer-account:[^:]+:/,""));
const quotaError=error=>error?.name==="QuotaExceededError"||error?.name==="NS_ERROR_DOM_QUOTA_REACHED"||error?.code===22||error?.code===1014;
function unpack(value){
  if(!value?.startsWith(PACKED))return value;
  return ungzip(Uint8Array.from(atob(value.slice(PACKED.length)),character=>character.charCodeAt(0)),{to:"string"});
}
function pack(value){
  if(value.length<4096||value.startsWith(PACKED))return value;
  const bytes=gzip(value,{level:1});
  let binary="";
  for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
  const packed=PACKED+btoa(binary);
  return packed.length<value.length&&unpack(packed)===value?packed:value;
}
function compactSnapshots(storage){
  // Origin quotas are shared by accounts. Encoding may reclaim space across
  // accounts, but the keys, ownership and decoded bytes stay exactly the same.
  const keys=Array.from({length:storage.length||0},(_,i)=>storage.key(i));
  for(const key of keys){
    if(!key||!isSnapshot(key))continue;
    const raw=storage.getItem(key);
    if(!raw||raw.startsWith(PACKED))continue;
    try{const packed=pack(raw);if(packed!==raw)storage.setItem(key,packed)}catch{/* Atomic setItem keeps the original on failure. */}
  }
}

// A device can host several accounts. Guest/legacy saves remain separate and
// are never adopted or merged merely because somebody signs in.
export function createAccountStorage(storage){
  const marker="drawer-village-active-data-owner-v1";
  let scope=storage?.getItem(marker)||"guest";
  const key=name=>scope==="guest"?name:`drawer-account:${encodeURIComponent(scope)}:${name}`;
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
      const encoded=isSnapshot(name)&&storage.getItem(target)?.startsWith(PACKED)?pack(raw):raw;
      try{storage.setItem(target,encoded)}catch(error){
        if(!quotaError(error))throw error;
        compactSnapshots(storage);
        storage.setItem(target,isSnapshot(name)?pack(raw):raw);
      }
    },
    removeItem:name=>storage.removeItem(key(name)),
    switchScope(uid){
      const next=String(uid||"guest");
      if(next===scope)return false;
      storage.setItem(marker,next);scope=next;return true;
    }
  };
}
export const accountStorage=createAccountStorage(globalThis.localStorage);
