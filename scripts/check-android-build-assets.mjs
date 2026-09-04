import {existsSync,readFileSync,readdirSync,statSync} from "node:fs";
import {resolve,relative} from "node:path";

const root=resolve(import.meta.dirname,"..");
const wwwRoot=resolve(root,"www");
const gradle=readFileSync(resolve(root,"android/app/build.gradle"),"utf8");
const copier=readFileSync(resolve(root,"android/copy-assets-for-gradle.ps1"),"utf8");

function filesUnder(directory){
  return readdirSync(directory,{withFileTypes:true}).flatMap(entry=>{
    const path=resolve(directory,entry.name);
    return entry.isDirectory()?filesUnder(path):[path];
  });
}

const preparedFiles=filesUnder(wwwRoot);
const required=[
  "audio.js","assets/audio/shoe-walking.m4a","assets/audio/shoe-running.m4a",
  "account-storage.js","town-lighting.js","world-assets/owner-forest-town.webp",
  "world-assets/building-types/cafe-handdrawn.png","world-assets/building-types/cafe-light.png",
  "world-assets/building-types/hospital-handdrawn.png","world-assets/building-types/hospital-light.png",
  "index.html","app.css","character-book.css","shop.css","app.js","views.js","state.js","simulation.js","auth.js",
  "icons/drawer-village-logo.png","assets/character-ui/paper.webp",
  "assets/character-ui/wallet.png","assets/shop/drawer-shop-wood.jpg","assets/shop/drawer-shop-seller.png","fonts/KCC-Hanbit.ttf"
];
const excluded=["world-assets/cozy-town.png","world-assets/cozy-town-optimized.jpg","world-assets/downtown.png","world-assets/downtown-optimized.jpg","world-assets/developer-town.svg","world-assets/developer-city.svg","assets/character-ui/paper.png"];
const failures=[];
const preparedIndex=readFileSync(resolve(wwwRoot,"index.html"),"utf8");
const preparedAppCss=readFileSync(resolve(wwwRoot,"app.css"),"utf8");

if(!gradle.includes("'-WebSource', rootProject.file('../www').absolutePath")){
  failures.push("Gradle is not staging the prepared www directory directly");
}
if(!copier.includes("$publicDestination = Join-Path $destinationRoot 'public'")){
  failures.push("The external asset copier does not create the public asset root");
}
if(!copier.includes("Android web asset staging is incomplete")){
  failures.push("The external asset copier does not reject incomplete staging");
}
if(preparedIndex.includes('href="character-book.css')){
  failures.push("Prepared Android index still depends on a separately loaded character-book stylesheet");
}
if(!preparedAppCss.includes("/* bundled: character-book.css */")||!preparedAppCss.includes(".character-book-v8{display:none!important}")){
  failures.push("Prepared app.css does not contain the required character-book style bundle");
}
for(const path of required){
  const absolute=resolve(wwwRoot,path);
  if(!existsSync(absolute)||!statSync(absolute).isFile()||statSync(absolute).size===0){
    failures.push(`Missing required prepared asset: ${path}`);
  }
}
for(const path of excluded){
  if(existsSync(resolve(wwwRoot,path)))failures.push(`Unused high-resolution source asset was packaged: ${path}`);
}
if(preparedFiles.length<100){
  failures.push(`Prepared web asset set is unexpectedly small: ${preparedFiles.length}`);
}

if(failures.length){
  console.error(failures.map(message=>`FAIL ${message}`).join("\n"));
  process.exit(1);
}

console.log(`PASS Android builds stage all ${preparedFiles.length} prepared web assets directly from www.`);
