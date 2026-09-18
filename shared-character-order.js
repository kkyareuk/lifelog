const cached=new Map();
const keyFor=(uid,groupId)=>'drawer-shared-order:'+encodeURIComponent(uid||'guest')+':'+encodeURIComponent(groupId);
export function sharedCharacterOrder(ids,uid,groupId){
 const key=keyFor(uid,groupId);let saved=cached.get(key);
 if(!saved){try{saved=JSON.parse(globalThis.localStorage?.getItem(key)||'[]')}catch{saved=[]}}
 if(!Array.isArray(saved))saved=[];
 return [...new Set([...saved.filter(id=>ids.includes(id)),...ids])];
}
export function saveSharedCharacterOrder(ids,uid,groupId){
 const key=keyFor(uid,groupId),order=[...new Set(ids)];cached.set(key,order);
 try{globalThis.localStorage?.setItem(key,JSON.stringify(order))}catch{}
}
