// Source identity survives browser-specific recompression of the same image.
export async function imageSourceHash(blob){
 const bytes=await crypto.subtle.digest('SHA-256',await blob.arrayBuffer());
 return [...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
export function reusableImage(items,sourceHash,encodedHash){
 return items.find(item=>item.sourceHash===sourceHash||item.hash===sourceHash||encodedHash&&item.hash===encodedHash);
}
export function retainImage(manifest,item){
 if(!manifest.items.some(existing=>existing.url===item.url))manifest.items.push(item);
 return item.url;
}
