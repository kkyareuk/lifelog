import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('..',import.meta.url))),out=path.join(root,'functions/runtime'),seen=new Set();
function include(relative){
 if(seen.has(relative))return;seen.add(relative);
 const source=path.resolve(root,relative);if(!source.startsWith(root+path.sep))throw new Error('Invalid runtime dependency');
 const text=fs.readFileSync(source,'utf8'),dest=path.join(out,relative);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,text);
 for(const match of text.matchAll(/(?:from\s*|import\s*\(\s*)["'](\.[^"']+)["']/g))include(path.normalize(path.join(path.dirname(relative),match[1].split('?')[0])));
}
include('server-life.mjs');include('relationship-roles.js');include('relationship-housing.js');fs.writeFileSync(path.join(out,'package.json'),'{"type":"module"}\n');
console.log(`Prepared shared server life engine (${seen.size} modules).`);
