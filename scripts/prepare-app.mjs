import {mkdir, readFile, readdir, rm, writeFile} from "node:fs/promises";
import {relative,join,dirname} from "node:path";
import {fileURLToPath} from "node:url";

const root=new URL("../",import.meta.url);
const output=new URL("../www/",import.meta.url);
const androidGradle=await readFile(new URL("../android/app/build.gradle",import.meta.url),"utf8");
const appVersionName=androidGradle.match(/versionName\s+["']([^"']+)["']/)?.[1]||"";
const appVersionCode=androidGradle.match(/versionCode\s+(\d+)/)?.[1]||"";
const includedDirectories=new Set(["fonts","icons","assets","world-assets","vendor","shop-assets","theme-assets"]);
// Keep high-resolution source artwork in the repository without shipping it
// in every APK. Runtime state and selectors use the optimized town JPEG; the
// source files below are editing leftovers; packaged views use optimized variants.
const excludedAndroidAssets=new Set([
  "world-assets/cozy-town.png",
  "world-assets/downtown.png",
  "assets/character-ui/paper.png"
]);
const excludedAndroidAssetPrefixes=[];
const includedFiles=new Set([
  "index.html","app.css","character-book.css","interface-system.css","home-scene-layout.css","theme.css","app.js","auth.js","config.js",
  "font-preferences.css","manifest.webmanifest",
  "native-app.js","payment.html","payment-success.html","payment-fail.html",
  "privacy.html","terms.html","simulation.js","state.js","local-media.js","speech-styles.js","character-notifications.js","sw.js","views.js",
  "town-fit.css"
]);
const relativeModuleImports=source=>{
  const found=[];
  const pattern=/(?:from\s*|import\s*\(\s*)["'](\.[^"']+)["']/g;
  let match;
  while((match=pattern.exec(source)))found.push(match[1].split(/[?#]/)[0]);
  return found;
};

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
      const relativePath=relative(fileURLToPath(root),fileURLToPath(from)).replaceAll("\\","/");
      if(excludedAndroidAssets.has(relativePath)||excludedAndroidAssetPrefixes.some(prefix=>relativePath.startsWith(prefix)))continue;
      try{await writeFile(to,await readFile(from));}
      catch(error){
        if(error?.code!=="EPERM")throw error;
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

// Android 웹 자산은 수동 파일 목록만 믿지 않는다. 진입 모듈에서 시작해
// 상대 import를 끝까지 따라가며 필요한 모듈을 자동으로 복사한다. 새 모듈을
// 추가하고 목록 갱신을 빼먹더라도 앱이 로딩 화면에서 멈추는 빌드는 만들지 않는다.
async function copyModuleClosure(){
  const rootPath=fileURLToPath(root),queue=[...includedFiles].filter(name=>name.endsWith(".js")),visited=new Set();
  while(queue.length){
    const moduleName=queue.shift();
    if(visited.has(moduleName))continue;
    visited.add(moduleName);
    const sourceUrl=new URL(moduleName,root),sourceText=await readFile(sourceUrl,"utf8");
    for(const specifier of relativeModuleImports(sourceText)){
      const dependencyUrl=new URL(specifier,sourceUrl);
      const dependencyName=relative(rootPath,fileURLToPath(dependencyUrl)).replaceAll("\\","/");
      if(dependencyName.startsWith("../")||dependencyName==="..")throw new Error(`Android 모듈이 프로젝트 밖을 가리킵니다: ${moduleName} -> ${specifier}`);
      const targetPath=fileURLToPath(new URL(dependencyName,output));
      await mkdir(dirname(targetPath),{recursive:true});
      await writeFile(targetPath,await readFile(dependencyUrl));
      if(dependencyName.endsWith(".js")&&!visited.has(dependencyName))queue.push(dependencyName);
    }
  }
  return visited;
}
await copyModuleClosure();

// The character book used to be a separately requested stylesheet. Because it
// was missing from the manually maintained Android asset list, WebView rendered
// the full-settings artwork at its intrinsic size (the giant wood-only screen).
// Bundle it into the already-required app.css so the native shell cannot start
// with only half of the character UI styles, and keep a source copy for audits.
const appCssPath=new URL("app.css",output);
const characterBookCssPath=new URL("character-book.css",output);
const appCss=await readFile(appCssPath,"utf8");
const characterBookCss=await readFile(characterBookCssPath,"utf8");
if(!characterBookCss.includes(".character-book-v8{display:none!important}")){
  throw new Error("character-book.css is missing the native character-book visibility contract");
}
await writeFile(appCssPath,`${appCss}\n\n/* bundled: character-book.css */\n${characterBookCss}\n`,"utf8");

const indexPath=new URL("index.html",output);
let index=await readFile(indexPath,"utf8");
index=index.replace(/\s*<link rel="stylesheet" href="character-book\.css[^>]*>/,"\n");
index=index.replace(/\s*<footer class="site-footer"[\s\S]*?<\/footer>/,"\n");
index=index.replace(
  '<div id="app"></div>',
  '<div id="app"><main class="native-startup" data-native-startup><span>서랍마을</span><b>마을을 여는 중이에요</b><small>잠시만 기다려 주세요.</small></main></div>'
);
index=index.replace("</head>",`  <meta name="drawer-village-app" content="android">
  <style>
    html.native-platform .site-footer{display:none!important}
    .native-startup{position:fixed;inset:0;display:grid;place-content:center;gap:10px;padding:28px;background:#fff;color:#2b2321;text-align:center;font-family:sans-serif}
    .native-startup span{color:#9c514a;font-size:2rem;font-weight:900}.native-startup b{margin-top:28vh;font-size:1.15rem}.native-startup small{font-size:.9rem}
  </style>
  <script>
    document.documentElement.classList.add("native-app","native-platform");
    window.DRAWER_VILLAGE_NATIVE=true;
window.DRAWER_VILLAGE_NATIVE_BUILD="20260828town178b";
    window.DRAWER_VILLAGE_APP_VERSION="${appVersionName}";
    window.DRAWER_VILLAGE_VERSION_CODE="${appVersionCode}";
    if("serviceWorker" in navigator){
      navigator.serviceWorker.getRegistrations().then(items=>Promise.all(items.map(item=>item.unregister()))).catch(()=>{});
    }
    globalThis.caches?.keys?.().then(keys=>Promise.all(keys.map(key=>caches.delete(key)))).catch(()=>{});
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
