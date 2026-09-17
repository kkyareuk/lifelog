// Tokens and download query parameters do not identify a different photo.
export function cloudImageKey(value){
 try{
  const url=new URL(value);
  if(url.hostname==='firebasestorage.googleapis.com'||url.hostname.endsWith('.firebasestorage.app')){
   const match=url.pathname.match(/^\/v0\/b\/([^/]+)\/o\/(.+)$/);
   return match?decodeURIComponent(match[1])+'/'+decodeURIComponent(match[2]):null;
  }
  if(url.hostname==='storage.googleapis.com')return decodeURIComponent(url.pathname.slice(1));
 }catch{}
 return null;
}
export function ownedPhotoKeys(value,uid){
 const keys=new Set();
 const walk=node=>{
  if(typeof node==='string'){const key=cloudImageKey(node);if(key&&key.slice(key.indexOf('/')+1).startsWith('users/'+uid+'/'))keys.add(key);return}
  if(node&&typeof node==='object')Object.values(node).forEach(walk);
 };
 if(uid)walk(value);return keys;
}
export function uniqueManifestImages(items,uid){
 const seen=new Set(),sources=new Set(),result=[];
 for(const item of items||[]){
  if(!item||typeof item.hash!=='string'||typeof item.url!=='string')continue;
  const key=cloudImageKey(item.url)||item.url;
  if(uid&&cloudImageKey(item.url)&&!ownedPhotoKeys(item.url,uid).size)continue;
  if(seen.has(key)||sources.has(item.hash))continue;
  seen.add(key);sources.add(item.hash);result.push(item);
 }
 return result;
}
export function photoManifestForState(manifest,state,uid){
 const keys=ownedPhotoKeys(state,uid),items=uniqueManifestImages(manifest.items,uid).filter(item=>keys.has(cloudImageKey(item.url)));
 return {...manifest,items,legacyCount:Math.max(0,keys.size-items.length)};
}
