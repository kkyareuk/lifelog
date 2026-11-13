export const MAX_CHARACTER_GIF_BYTES=1536*1024;
export const isCharacterImageType=type=>["icon","ldImage","sceneVariantIcon","sceneVariantLd"].includes(type);
export async function characterGifData(file,type){
  if(!isCharacterImageType(type))return null;
  const header=new Uint8Array(await file.slice(0,6).arrayBuffer());
  const signature=String.fromCharCode(...header);
  if(!["GIF87a","GIF89a"].includes(signature))return null;
  if(file.size>MAX_CHARACTER_GIF_BYTES)throw Object.assign(new Error("gif-too-large"),{code:"gif-too-large"});
  return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).replace(/^data:[^;]*;/,"data:image/gif;"));reader.onerror=()=>reject(reader.error);reader.readAsDataURL(file)});
}
