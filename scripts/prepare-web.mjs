import {access,mkdir,readFile,readdir,rm,writeFile} from "node:fs/promises";
import {relative} from "node:path";
import {fileURLToPath} from "node:url";

const root=new URL("../",import.meta.url);
const output=new URL("../dist/",import.meta.url);

const includedDirectories=new Set([
  "assets",
  "fonts",
  "icons",
  "SB_Aggro",
  "shop-assets",
  "theme-assets",
  "vendor",
  "world-assets"
]);

const includedFiles=new Set([
  "character-placement.js","character-mood.js","character-scene-image.js","life-log-localization.js","building-recovery.js",
  "dictionary.js","dictionary.css","dictionary-copy.js","notification-mail.js",
  "_headers",
  "index.html",
  "login.html",
  "terms.html",
  "privacy.html",
  "payment.html",
  "payment-success.html",
  "payment-fail.html",
  "manifest.webmanifest",
  "social-preview.png",
  "app.css",
  "character-book.css",
  "shop.css",
  "font-preferences.css",
  "home-scene-layout.css",
  "interface-system.css",
  "story-themes.css",
  "theme.css",
  "town-fit.css",
  "ui-theme-sample.css",
  "app.js",
  "audio.js",
  "auth.js",
  "character-notifications.js",
  "config.js",
  "local-media.js",
  "furniture-layout.js",
  "home-simulation.js",
  "home-surfaces.js",
  "room-layout.js",
  "simulation.js",
  "speech-styles.js",
  "contact-voice.js",
  "achievements.js",
  "state.js",
  "account-storage.js",
  "town-lighting.js",
  "town-profile.js",
  "sw.js",
  "sync-merge.js",
  "views.js"
]);

async function copyDirectory(source,target){
  await mkdir(target,{recursive:true});
  for(const entry of await readdir(source,{withFileTypes:true})){
    const from=new URL(`${entry.name}${entry.isDirectory()?"/":""}`,source);
    const to=new URL(`${entry.name}${entry.isDirectory()?"/":""}`,target);
    if(entry.isDirectory())await copyDirectory(from,to);
    else await writeFile(to,await readFile(from));
  }
}

await rm(output,{recursive:true,force:true});
await mkdir(output,{recursive:true});

for(const entry of await readdir(root,{withFileTypes:true})){
  if(entry.isDirectory()){
    if(includedDirectories.has(entry.name)){
      await copyDirectory(new URL(`${entry.name}/`,root),new URL(`${entry.name}/`,output));
    }
    continue;
  }
  if(includedFiles.has(entry.name)){
    await writeFile(new URL(entry.name,output),await readFile(new URL(entry.name,root)));
  }
}

const requiredFiles=[
  "index.html",
  "app.js",
  "audio.js",
  "character-book.css",
  "shop.css",
  "furniture-layout.js",
  "home-simulation.js",
  "home-surfaces.js",
  "room-layout.js",
  "views.js",
  "state.js",
  "town-profile.js",
  "sw.js",
  "manifest.webmanifest",
  "_headers",
  "icons/icon-192.png",
  "icons/icon-512.png"
];
for(const file of requiredFiles)await readFile(new URL(file,output));

const outputPath=fileURLToPath(output);
const expectedModuleCache="20260902relationship202";
const relativeImports=source=>{
  const found=[];
  const pattern=/(?:from\s*|import\s*\(\s*)["'](\.[^"']+)["']/g;
  let match;
  while((match=pattern.exec(source)))found.push(match[1]);
  return found;
};
const moduleQueue=["app.js"],visitedModules=new Set();
while(moduleQueue.length){
  const name=moduleQueue.shift();
  if(visitedModules.has(name))continue;
  visitedModules.add(name);
  const moduleUrl=new URL(name,output),source=await readFile(moduleUrl,"utf8");
  for(const specifier of relativeImports(source)){
    const importedUrl=new URL(specifier,moduleUrl);
    if(importedUrl.pathname.endsWith(".js")&&importedUrl.searchParams.get("v")!==expectedModuleCache){
      throw new Error(`${name}의 모듈 캐시 키가 일치하지 않습니다: ${specifier}`);
    }
    const dependencyUrl=new URL(specifier,moduleUrl);dependencyUrl.search="";dependencyUrl.hash="";
    const dependencyName=relative(outputPath,fileURLToPath(dependencyUrl)).replaceAll("\\","/");
    if(dependencyName.startsWith("../"))throw new Error(`${name}이 웹 배포 폴더 밖의 모듈을 참조합니다: ${specifier}`);
    await access(dependencyUrl);
    if(dependencyName.endsWith(".js"))moduleQueue.push(dependencyName);
  }
}

const index=await readFile(new URL("index.html",output),"utf8");
const app=await readFile(new URL("app.js",output),"utf8");
const serviceWorker=await readFile(new URL("sw.js",output),"utf8");
if(!index.includes("20260902relationship202"))throw new Error("최신 웹 UI 캐시 표식이 index.html에 없습니다.");
if(!app.includes("20260902relationship202"))throw new Error("최신 앱 모듈 표식이 app.js에 없습니다.");
if(!serviceWorker.includes("drawer-village-v20260902-relationship-emotion-202"))throw new Error("최신 서비스워커 캐시 표식이 없습니다.");

console.log(`Cloudflare Pages용 최신 웹 파일과 모듈 ${visitedModules.size}개를 dist 폴더에 준비했습니다.`);
