import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
const root=new URL("../",import.meta.url);
const read=path=>readFileSync(new URL(path,root),"utf8");
const release=JSON.parse(read("ios-release.json"));
const config=JSON.parse(read("capacitor.config.json"));
const pkg=JSON.parse(read("package.json"));
const project=read("ios/App/App.xcodeproj/project.pbxproj");
assert.ok(read("ios/App/App.xcworkspace/contents.xcworkspacedata").includes("App.xcodeproj"));
assert.equal(config.appId,"com.drawervillage.app");
assert.equal(pkg.dependencies["@capacitor/ios"],"7.6.8");
assert.ok(!config.ios.includePlugins.includes("@capacitor-firebase/authentication"),"Unconfigured Firebase must not crash preview at launch");
assert.equal((project.match(new RegExp("MARKETING_VERSION = "+release.version.replaceAll(".","\\.")+";","g"))||[]).length,2);
assert.equal((project.match(new RegExp("CURRENT_PROJECT_VERSION = "+release.build+";","g"))||[]).length,2);
const gradle=read("android/app/build.gradle");
assert.ok(gradle.includes('versionName "'+release.version+'"'),"Synchronize release version across targets deliberately");
assert.ok(gradle.includes("versionCode "+release.sourceAndroidCode));
assert.ok(read("native-app.js").includes('if(isAndroid)App.addListener("backButton"'));
assert.ok(read("auth.js").includes("iosPreview"));
assert.ok(read("views.js").includes("if(window.PARALLEL_CITY_CONFIG?.iosPreview)"));
for(const file of ["index.html","audio.js","assets/audio/shoe-walking.m4a","room-permissions.js","mood-event-causes.js"]){
 assert.ok(existsSync(new URL("ios/App/App/public/"+file,root)),"Missing iOS asset "+file);
}
assert.ok(read("ios/App/App/public/index.html").includes('name="drawer-village-app" content="ios"'));
assert.ok(read("ios/App/App/public/config.js").includes("iosPreview=true"));
assert.ok(read("ios/App/App/public/auth.js").includes("ready:true"),"Local preview must settle without network login");
assert.ok(!read("ios/App/App/public/auth.js").includes("gstatic.com"),"Local preview must not load external auth SDK");
assert.ok(read("ios/App/App/public/config.js").includes("playBilling||{}),enabled:false"));
assert.ok(!read("ios/App/Podfile").includes("FirebaseAuthentication"));
console.log("PASS iOS preparation: Xcode project, version, six native plugins, bundled modules/audio, disabled unconfigured login and purchase paths.");
if(process.argv.includes("--release")){
 assert.equal(release.appStoreReady,true,"NOT READY: signing, device QA, final icon, Apple login, StoreKit/server verification, account deletion and privacy review remain. Simulator compilation alone is not release approval. See APP-IOS.md.");
}
