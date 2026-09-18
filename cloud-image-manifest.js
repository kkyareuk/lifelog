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
 const seen=new Map(),sources=new Map(),result=[];
 for(const item of items||[]){
  if(!item||typeof item.hash!=='string'||typeof item.url!=='string')continue;
  const key=cloudImageKey(item.url)||item.url;
  if(uid&&cloudImageKey(item.url)&&!ownedPhotoKeys(item.url,uid).size)continue;
  const existing=seen.get(key)||sources.get(item.hash)||(item.sourceHash&&sources.get(item.sourceHash));
  const urls=[item.url,...(Array.isArray(item.aliases)?item.aliases:[])].filter(url=>typeof url==='string'&&(!uid||ownedPhotoKeys(url,uid).size));
  if(existing){existing.aliases=[...new Set([...(existing.aliases||[]),...urls])].filter(url=>url!==existing.url);continue;}
  const entry={...item,aliases:urls.filter(url=>url!==item.url)};
  seen.set(key,entry);sources.set(item.hash,entry);if(item.sourceHash)sources.set(item.sourceHash,entry);result.push(entry);
 }
 return result;
}
export function photoManifestForState(manifest,state,uid){
 const keys=ownedPhotoKeys(state,uid),urls=item=>[item.url,...(Array.isArray(item.aliases)?item.aliases:[])];
 const referenced=(manifest.items||[]).filter(item=>item&&urls(item).some(url=>keys.has(cloudImageKey(url))));
 const knownKeys=new Set(referenced.filter(item=>typeof item.hash==='string').flatMap(item=>urls(item).map(cloudImageKey)));
 const items=uniqueManifestImages(referenced,uid);
 return {...manifest,items,legacyCount:[...keys].filter(key=>!knownKeys.has(key)).length};
}
