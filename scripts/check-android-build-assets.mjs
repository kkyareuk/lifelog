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
  "index.html","app.js","views.js","state.js","simulation.js","auth.js",
  "icons/drawer-village-logo.png","assets/character-ui/paper.png",
  "assets/character-ui/wallet.png","fonts/KCC-Hanbit.ttf"
];
const failures=[];

if(!gradle.includes("'-WebSource', rootProject.file('../www').absolutePath")){
  failures.push("Gradle is not staging the prepared www directory directly");
}
if(!copier.includes("$publicDestination = Join-Path $destinationRoot 'public'")){
  failures.push("The external asset copier does not create the public asset root");
}
if(!copier.includes("Android web asset staging is incomplete")){
  failures.push("The external asset copier does not reject incomplete staging");
}
for(const path of required){
  const absolute=resolve(wwwRoot,path);
  if(!existsSync(absolute)||!statSync(absolute).isFile()||statSync(absolute).size===0){
    failures.push(`Missing required prepared asset: ${path}`);
  }
}
if(preparedFiles.length<100){
  failures.push(`Prepared web asset set is unexpectedly small: ${preparedFiles.length}`);
}

if(failures.length){
  console.error(failures.map(message=>`FAIL ${message}`).join("\n"));
  process.exit(1);
}

console.log(`PASS Android builds stage all ${preparedFiles.length} prepared web assets directly from www.`);
