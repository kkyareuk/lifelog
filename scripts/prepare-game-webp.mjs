import {readFile,readdir,writeFile,access} from 'node:fs/promises';

// Transform only packaged code, never saved user data or external image URLs.
// Original files remain available for old saves and dynamically assembled paths.
export async function prepareGameWebp(output){
 const {assets}=JSON.parse(await readFile(new URL('../game-webp-manifest.json',import.meta.url),'utf8'));
 const available=[];
 for(const asset of assets.filter(a=>a.preferred)){
  try{await access(new URL(asset.webp,output));available.push(asset)}catch(error){if(error.code!=='ENOENT')throw error}
 }
 let references=0;
 async function visit(directory){
  for(const entry of await readdir(directory,{withFileTypes:true})){
   if(entry.isDirectory())continue; // Runtime modules/styles are at the package root.
   if(!/\.(js|css|html)$/.test(entry.name))continue;
   const url=new URL(entry.name,directory),source=await readFile(url,'utf8');let result=source;
   for(const asset of available){
    const escaped=asset.source.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    // A quote/parenthesis boundary prevents rewriting an unrelated remote URL.
    const pattern=new RegExp(`(["'\x60(](?:\\./)?)${escaped}(?=[?"'\x60)])`,'g');
    result=result.replace(pattern,(_,prefix)=>{references++;return prefix+asset.webp});
   }
   if(result!==source)await writeFile(url,result);
  }
 }
 await visit(output);
 console.log(`WebP: ${references} local asset references optimized; legacy URLs retained.`);
 return references;
}
