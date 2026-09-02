import {mkdir,readFile,readdir,rm,writeFile} from "node:fs/promises";

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
  "character-placement.js","character-mood.js","life-log-localization.js","building-recovery.js",
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

const index=await readFile(new URL("index.html",output),"utf8");
const app=await readFile(new URL("app.js",output),"utf8");
const serviceWorker=await readFile(new URL("sw.js",output),"utf8");
if(!index.includes("20260902visual200"))throw new Error("최신 웹 UI 캐시 표식이 index.html에 없습니다.");
if(!app.includes("20260902visual200"))throw new Error("최신 앱 모듈 표식이 app.js에 없습니다.");
if(!serviceWorker.includes("drawer-village-v20260902-bed-buildings-statistics-200"))throw new Error("최신 서비스워커 캐시 표식이 없습니다.");

console.log("Cloudflare Pages용 최신 웹 파일을 dist 폴더에 준비했습니다.");
