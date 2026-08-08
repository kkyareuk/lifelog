import {cp, mkdir, readFile, rm, writeFile} from "node:fs/promises";
import {extname} from "node:path";

const root=new URL("../",import.meta.url);
const output=new URL("../www/",import.meta.url);
const excluded=new Set([
  ".git","android","node_modules","www","최신 덮어쓰기","_release_bundle","scripts","functions"
]);
const excludedFiles=new Set(["package.json","package-lock.json","capacitor.config.json","firebase.json"]);
const allowedExtensions=new Set([
  ".html",".css",".js",".json",".webmanifest",".png",".jpg",".jpeg",".webp",
  ".gif",".svg",".woff",".woff2",".ttf",".otf",".txt"
]);

await rm(output,{recursive:true,force:true});
await mkdir(output,{recursive:true});

const entries=await (await import("node:fs/promises")).readdir(root,{withFileTypes:true});
for(const entry of entries){
  if(excluded.has(entry.name)||excludedFiles.has(entry.name)||entry.name.startsWith("서랍마을-v")||entry.name.endsWith(".zip"))continue;
  const source=new URL(entry.name,root);
  const target=new URL(entry.name,output);
  if(entry.isDirectory()){
    if(["fonts","icons","world-assets"].includes(entry.name))await cp(source,target,{recursive:true});
    continue;
  }
  if(allowedExtensions.has(extname(entry.name).toLowerCase())||["_headers","download"].includes(entry.name)){
    await cp(source,target);
  }
}

const indexPath=new URL("index.html",output);
let index=await readFile(indexPath,"utf8");
index=index.replace("</head>",`  <meta name="drawer-village-app" content="android">\n  <script type="module" src="./native-app.js"></script>\n</head>`);
await writeFile(indexPath,index,"utf8");

const configPath=new URL("config.js",output);
let config=await readFile(configPath,"utf8");
config=config.replace(
  "window.PARALLEL_CITY_CONFIG.paymentsEnabled=false;",
  "window.PARALLEL_CITY_CONFIG.paymentsEnabled=false;window.PARALLEL_CITY_CONFIG.nativeApp=true;window.PARALLEL_CITY_CONFIG.beta={...(window.PARALLEL_CITY_CONFIG.beta||{}),enabled:false};"
);
config+=`\nwindow.PARALLEL_CITY_CONFIG.playBilling={...(window.PARALLEL_CITY_CONFIG.playBilling||{}),enabled:true};\n`;
await writeFile(configPath,config,"utf8");

console.log("Android 앱용 웹 파일을 www 폴더에 준비했습니다.");
