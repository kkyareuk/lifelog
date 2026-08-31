// Extract existing SVG layers only; no generated replacement artwork.
import {readFile,mkdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
const sharp=require(process.env.DRAWER_SHARP||'C:/Users/김세은/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const source=await readFile(process.argv[2],'utf8');
const out=new URL('../assets/dictionary/',import.meta.url);await mkdir(out,{recursive:true});
async function layer(pattern,box,name){
  const rect=[...source.matchAll(/<rect\b[^>]*\/>/g)].map(m=>m[0]).find(s=>s.includes(`url(#${pattern})`));
  const definition=source.match(new RegExp(`<pattern id="${pattern}"[\\s\\S]*?</pattern>`))?.[0];
  const imageId=definition?.match(/href="#([^"]+)"/)?.[1];
  let image=source.match(new RegExp(`<image id="${imageId}"[^>]*\/>`))?.[0];
  if(!rect||!definition||!image)throw Error(`Missing owner layer ${pattern}`);
  const embedded=image.match(/data:image\/[^;]+;base64,([^"]+)/);
  // librsvg does not decode embedded WebP. PNG keeps alpha and avoids the XML
  // 10 MB attribute limit while explicit SVG width/height preserve coordinates.
  const compact=await sharp(Buffer.from(embedded[1],'base64')).resize({width:3072,withoutEnlargement:true}).png({compressionLevel:9}).toBuffer();
  image=image.replace(embedded[0],`data:image/png;base64,${compact.toString('base64')}`);
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${box[2]*3}" height="${box[3]*3}" viewBox="${box.join(' ')}">${rect}<defs>${definition}${image}</defs></svg>`;
  await sharp(Buffer.from(svg),{limitInputPixels:120000000}).webp({quality:94,alphaQuality:100}).toFile(fileURLToPath(new URL(name,out)));
}
await layer('pattern0_169_280',[0,0,412,917],'wood.webp');
await layer('pattern1_169_280',[0,0,412,917],'book.webp');
await layer('pattern3_169_280',[195,100,71,32],'pill.webp');
await layer('pattern5_169_280',[322,789,76,76],'ink.webp');
await layer('pattern7_169_280',[21,44,61,61],'back.webp');
console.log('Extracted original wood, rotated book, pill, ink and back layers at 3×.');
