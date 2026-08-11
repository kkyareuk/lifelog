import {mkdir, readFile, readdir, rm, writeFile} from "node:fs/promises";
import {relative,join} from "node:path";
import {fileURLToPath} from "node:url";

const root=new URL("../",import.meta.url);
const output=new URL("../www/",import.meta.url);
const includedDirectories=new Set(["fonts","icons","world-assets","vendor","shop-assets","theme-assets"]);
const includedFiles=new Set([
  "index.html","app.css","theme.css","app.js","auth.js","config.js",
  "font-preferences.css","font-preferences.js","manifest.webmanifest",
  "native-app.js","payment.html","payment-success.html","payment-fail.html",
  "privacy.html","terms.html","simulation.js","state.js","sw.js","views.js",
  "town-fit.css","ui-theme-sample.css"
]);

// OneDrive placeholder/reparse-point files can make fs.cp fail with EPERM on
// Windows. Reading and writing the bytes also hydrates placeholders reliably.
async function copyPortable(source,target){
  const entries=await readdir(source,{withFileTypes:true});
  await mkdir(target,{recursive:true});
  for(const entry of entries){
    const from=new URL(`${entry.name}${entry.isDirectory()?"/":""}`,source);
    const to=new URL(`${entry.name}${entry.isDirectory()?"/":""}`,target);
    if(entry.isDirectory())await copyPortable(from,to);
    else{
      try{await writeFile(to,await readFile(from));}
      catch(error){
        if(error?.code!=="EPERM")throw error;
        const relativePath=relative(fileURLToPath(root),fileURLToPath(from));
        const backupPath=join(fileURLToPath(root),"android","app","src","main","assets","public",relativePath);
        try{
          await writeFile(to,await readFile(backupPath));
          console.warn(`OneDrive 원본 대신 이전 Android 자산에서 복구: ${relativePath}`);
        }catch{
          console.warn(`OneDrive에서 읽을 수 없어 건너뜀: ${decodeURIComponent(from.pathname)}`);
        }
      }
    }
  }
}

await rm(output,{recursive:true,force:true});
await mkdir(output,{recursive:true});

const entries=await (await import("node:fs/promises")).readdir(root,{withFileTypes:true});
for(const entry of entries){
  const source=new URL(entry.name,root);
  const target=new URL(entry.name,output);
  if(entry.isDirectory()){
    if(includedDirectories.has(entry.name))await copyPortable(new URL(`${entry.name}/`,root),new URL(`${entry.name}/`,output));
    continue;
  }
  if(includedFiles.has(entry.name))await writeFile(target,await readFile(source));
}

const indexPath=new URL("index.html",output);
let index=await readFile(indexPath,"utf8");
index=index.replace(/\s*<footer class="site-footer"[\s\S]*?<\/footer>/,"\n");
index=index.replace(
  '<div id="app"></div>',
  '<div id="app"><main class="native-startup" data-native-startup><span>서랍마을</span><b>마을을 여는 중이에요</b><small>잠시만 기다려 주세요.</small></main></div>'
);
index=index.replace("</head>",`  <meta name="drawer-village-app" content="android">
  <style>
    html.native-platform .site-footer{display:none!important}
    .native-startup{position:fixed;inset:0;display:grid;place-content:center;gap:10px;padding:28px;background:linear-gradient(180deg,#5f3e2c,#eee8df 45%,#fff);color:#2f2925;text-align:center;font-family:sans-serif}
    .native-startup span{color:#fff;font-size:2rem;font-weight:900;text-shadow:0 3px 12px #0008}.native-startup b{margin-top:28vh;font-size:1.15rem}.native-startup small{font-size:.9rem}
  </style>
  <script>
    document.documentElement.classList.add("native-app","native-platform");
    window.DRAWER_VILLAGE_NATIVE=true;
    window.DRAWER_VILLAGE_NATIVE_BUILD="20260811u";
    if("serviceWorker" in navigator){
      navigator.serviceWorker.getRegistrations().then(items=>Promise.all(items.map(item=>item.unregister()))).catch(()=>{});
    }
    globalThis.caches?.keys?.().then(keys=>Promise.all(keys.map(key=>caches.delete(key)))).catch(()=>{});
    window.addEventListener("DOMContentLoaded",()=>setTimeout(()=>{
      const startup=document.querySelector("[data-native-startup]");
      if(startup){startup.querySelector("b").textContent="앱 화면을 불러오지 못했어요";startup.querySelector("small").textContent="앱을 완전히 종료한 뒤 다시 열어 주세요. 계속되면 최신 설치 파일로 다시 설치해 주세요."}
    },8000));
  </script>
  <script type="module" src="./native-app.js"></script>
</head>`);
await writeFile(indexPath,index,"utf8");

const configPath=new URL("config.js",output);
let config=await readFile(configPath,"utf8");
config=config.replace(
  /window\.PARALLEL_CITY_CONFIG\.paymentsEnabled=[^;]+;/,
  "window.PARALLEL_CITY_CONFIG.paymentsEnabled=false;window.PARALLEL_CITY_CONFIG.nativeApp=true;window.PARALLEL_CITY_CONFIG.beta={...(window.PARALLEL_CITY_CONFIG.beta||{}),enabled:false};"
);
config+=`\nwindow.PARALLEL_CITY_CONFIG.playBilling={...(window.PARALLEL_CITY_CONFIG.playBilling||{}),enabled:true};\n`;
await writeFile(configPath,config,"utf8");

console.log("Android 앱용 웹 파일을 www 폴더에 준비했습니다.");
