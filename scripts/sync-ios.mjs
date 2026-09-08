import {readFile,writeFile} from "node:fs/promises";
import {spawnSync} from "node:child_process";
import {fileURLToPath} from "node:url";
const root=fileURLToPath(new URL("../",import.meta.url));
const release=JSON.parse(await readFile(new URL("../ios-release.json",import.meta.url),"utf8"));
if(!/^\d+\.\d+\.\d+$/.test(release.version)||!Number.isSafeInteger(release.build)||release.build<1)throw new Error("Invalid iOS version/build");
const project=new URL("../ios/App/App.xcodeproj/project.pbxproj",import.meta.url);
let source=await readFile(project,"utf8");
source=source.replace(/MARKETING_VERSION = [^;]+;/g,`MARKETING_VERSION = ${release.version};`).replace(/CURRENT_PROJECT_VERSION = [^;]+;/g,`CURRENT_PROJECT_VERSION = ${release.build};`);
await writeFile(project,source);
// Firebase mobile configuration is public app metadata; generate the ignored plist reproducibly.
const firebase=JSON.parse(await readFile(new URL("../ios-firebase-config.json",import.meta.url),"utf8"));
if(firebase.BUNDLE_ID!=="com.drawervillage.app"||firebase.PROJECT_ID!=="lifelog-98fff"||!firebase.CLIENT_ID||!firebase.REVERSED_CLIENT_ID)throw new Error("Invalid Firebase iOS configuration");
const xml=value=>String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
const plist='<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0"><dict>'+Object.entries(firebase).map(([k,v])=>'<key>'+xml(k)+'</key>'+(typeof v==='boolean'?(v?'<true/>':'<false/>'):'<string>'+xml(v)+'</string>')).join('')+'</dict></plist>\n';
await writeFile(new URL("../ios/App/App/GoogleService-Info.plist",import.meta.url),plist);
const podfile=new URL("../ios/App/Podfile",import.meta.url);
let pods=await readFile(podfile,"utf8");
pods=pods.replace(/\.\.\/\.\.\/\.\.\/drawer-village-[^/"'\s]+\/node_modules/g,"../../node_modules");
if(!pods.includes("CapacitorFirebaseAuthentication/Google"))pods=pods.replace("  # Add your Pods here","  # Add your Pods here\n  pod 'CapacitorFirebaseAuthentication/Google', :path => '../../node_modules/@capacitor-firebase/authentication'");
pods=pods.replace("platform :ios, '14.0'","platform :ios, '15.0'");
await writeFile(podfile,pods);
function run(args){
 const result=spawnSync(process.execPath,args,{cwd:root,stdio:"inherit"});
 if(result.error)throw result.error;
 if(result.status!==0)process.exit(result.status||1);
}
run(["scripts/prepare-app.mjs","--ios"]);
run(["scripts/check-native-module-closure.mjs"]);
const shim=process.platform==="win32"?["--require","./scripts/windows-userinfo-shim.cjs"]:[];
run([...shim,"./node_modules/@capacitor/cli/bin/capacitor","sync","ios"]);
await writeFile(podfile,(await readFile(podfile,"utf8")).replace(/\.\.\/\.\.\/\.\.\/drawer-village-[^/"'\s]+\/node_modules/g,"../../node_modules"));
run(["scripts/check-ios-project.mjs"]);
if(process.platform!=="darwin")console.log("iOS project/assets prepared only. CocoaPods, Xcode compilation, signing and device tests must run on a Mac.");
