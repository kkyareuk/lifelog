import {gzip,ungzip} from "./vendor/pako.esm.mjs";
export const PACKED="drawer-gzip-v1:";
export function unpack(value){
  if(!value?.startsWith(PACKED))return value;
  return ungzip(Uint8Array.from(atob(value.slice(PACKED.length)),character=>character.charCodeAt(0)),{to:"string"});
}
export function pack(value,level=1){
  if(value.length<4096||value.startsWith(PACKED))return value;
  const bytes=gzip(value,{level});
  let binary="";
  for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
  const packed=PACKED+btoa(binary);
  return packed.length<value.length&&unpack(packed)===value?packed:value;
}
