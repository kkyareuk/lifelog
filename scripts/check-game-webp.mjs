import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {prepareGameWebp} from './prepare-game-webp.mjs';
const root=new URL('../',import.meta.url);
const manifest=JSON.parse(await readFile(new URL('game-webp-manifest.json',root),'utf8'));
for(const a of manifest.assets){
 assert.equal((await readFile(new URL(a.webp,root))).length,a.webpBytes);
 assert.equal((await readFile(new URL(a.source,root))).length,a.originalBytes);
}
const dir=await mkdtemp(join(tmpdir(),'drawer-webp-'));
try{
 const a=manifest.assets.find(a=>a.preferred),output=pathToFileURL(dir+'/');
 await mkdir(dirname(join(dir,a.webp)),{recursive:true});
 await writeFile(join(dir,a.webp),await readFile(new URL(a.webp,root)));
 await writeFile(join(dir,'example.js'),`const a="./${a.source}?v=1";const b="https://example.com/${a.source}";`);
 await writeFile(join(dir,'example.css'),`.a{background:url('${a.source}')} .b{background:url("./${a.source}")}`);
 assert.equal(await prepareGameWebp(output),3);
 const js=await readFile(join(dir,'example.js'),'utf8');
 assert(js.includes(`./${a.webp}?v=1`));
 assert(js.includes(`https://example.com/${a.source}`));
 assert.equal(await prepareGameWebp(output),0);
 console.log(`PASS: ${manifest.assets.length} asset pairs; local references, cache query, remote URL isolation, idempotency.`);
}finally{await rm(dir,{recursive:true,force:true})}
