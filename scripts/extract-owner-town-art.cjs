// Exact extraction of owner-supplied art; no redrawing or generated imagery.
const fs=require('node:fs'),path=require('node:path');
const sharp=require(process.argv[3]||'sharp');
const source=process.argv[2];
if(!source)throw new Error('Usage: node scripts/extract-owner-town-art.cjs <source-directory> [sharp-module]');
const out=path.join(__dirname,'../world-assets/building-types');
async function main(){
  fs.mkdirSync(out,{recursive:true});
  const base=path.join(source,'일러스트 20260830 (2).png');
  const light=path.join(source,'일러스트 20260830 (4).png');
  const crops={cafe:{left:0,top:0,width:900,height:935},hospital:{left:900,top:0,width:850,height:935}};
  for(const [name,crop] of Object.entries(crops)){
    // Identical canvas for both layers is essential for moving/scaling/flipping.
    for(const [file,suffix] of [[base,'handdrawn'],[light,'light']]){
      await sharp(file).extract(crop).resize({width:640}).png({compressionLevel:9}).toFile(path.join(out,`${name}-${suffix}.png`));
    }
  }
  const newBase=path.join(source,'일러스트 20260830 (6).png');
  const newLight=path.join(source,'일러스트 20260830 (7).png');
  const newCrops={
    'piano-hall':{left:1680,top:0,width:1120,height:1050},
    park:{left:1550,top:1780,width:1180,height:980},
    'red-roof-home':{left:5140,top:1000,width:1145,height:930}
  };
  for(const [name,crop] of Object.entries(newCrops)){
    for(const [file,suffix] of [[newBase,'handdrawn'],[newLight,'light']]){
      await sharp(file).extract(crop).resize({width:640}).png({compressionLevel:9}).toFile(path.join(out,`${name}-${suffix}.png`));
    }
  }
  await sharp(path.join(source,'일러스트 20260809 (3).png')).resize({width:2400}).webp({quality:92}).toFile(path.join(out,'../owner-forest-town.webp'));
  console.log('Extracted cafe, hospital, piano hall, park and red-roof home art with matching light layers; restored owner forest background.');
}
main().catch(error=>{console.error(error);process.exitCode=1});
