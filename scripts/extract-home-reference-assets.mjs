import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const [sourceDirectory,sharpModule='sharp']=process.argv.slice(2);
if(!sourceDirectory)throw new Error('Usage: node scripts/extract-home-reference-assets.mjs <SVG directory> [sharp module path]');
const sharp=createRequire(import.meta.url)(sharpModule);
const output=new URL('../assets/home-design/',import.meta.url);
await fs.mkdir(output,{recursive:true});
for(const [source,name] of [['집-방 정보','wood'],['집-집정보','town']]){
  const svg=await fs.readFile(`${sourceDirectory}/${source}.svg`,'utf8');
  const rect=svg.match(/<rect\b[^>]*\/>/)[0],defs=svg.match(/<defs>[\s\S]*?<\/defs>/)[0];
  const background=`<svg width="412" height="917" viewBox="0 0 412 917" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">${rect}${defs}</svg>`;
  await sharp(Buffer.from(background),{unlimited:true}).resize(824,1834).webp({quality:92}).toFile(fileURLToPath(new URL(`${name}.webp`,output)));
}
