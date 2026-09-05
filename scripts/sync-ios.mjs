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
function run(args){
 const result=spawnSync(process.execPath,args,{cwd:root,stdio:"inherit"});
 if(result.error)throw result.error;
 if(result.status!==0)process.exit(result.status||1);
}
run(["scripts/prepare-app.mjs","--ios"]);
run(["scripts/check-native-module-closure.mjs"]);
const shim=process.platform==="win32"?["--require","./scripts/windows-userinfo-shim.cjs"]:[];
run([...shim,"./node_modules/@capacitor/cli/bin/capacitor","sync","ios"]);
run(["scripts/check-ios-project.mjs"]);
if(process.platform!=="darwin")console.log("iOS project/assets prepared only. CocoaPods, Xcode compilation, signing and device tests must run on a Mac.");
