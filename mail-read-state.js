import {accountStorage} from './account-storage.js?v=20260909dev302';
const key='drawer-mail-read-v1';
let raw,scope,marks={};
function load(){
 const next=accountStorage.getItem(key)||'{}';
 if(raw!==next||scope!==accountStorage.scope){raw=next;scope=accountStorage.scope;try{marks=JSON.parse(next)}catch{marks={}}}
 return marks;
}
const identity=p=>JSON.stringify([p.groupId||'',p.id,!!p.asResponse]);
export const mailWasRead=p=>Boolean(p.read||p.readAt||load()[identity(p)]);
export function markMailRead(p){
 if(mailWasRead(p))return;
 const now=Date.now(),next=Object.fromEntries(Object.entries(load()).filter(([,at])=>at>now-30*86400000));
 next[identity(p)]=now;accountStorage.setItem(key,JSON.stringify(next));
}
