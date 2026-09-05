import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";

const read=file=>readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const auth=read("auth.js"),app=read("app.js"),index=read("index.html");
const gradle=read("android/app/build.gradle"),capacitor=read("capacitor.config.json"),pkg=read("package.json");

assert.match(gradle,/versionCode\s+232/);
assert.match(gradle,/versionName\s+"1\.0\.214"/);
assert.match(index,/app\.js\?v=20260906dev232/);
assert.match(app,/auth\.js\?v=20260906dev232/);

assert.match(capacitor,/"FirebaseAuthentication"/);
assert.match(capacitor,/"google\.com"/);
assert.match(pkg,/@capacitor-firebase\/authentication/);
assert.match(auth,/signInWithGoogle\(\{\s*skipNativeAuth:true,\s*useCredentialManager:false\s*\}\)/);
assert.doesNotMatch(auth,/useCredentialManager:true/);
assert.match(auth,/loginBusy=true;\s*status\(copy\.opening\);\s*toast\(copy\.opening\)/);
assert.match(auth,/finally\{\s*loginBusy=false;\s*window\.dispatchEvent\(new Event\("drawer-village-auth-busy"\)\)/);
assert.match(auth,/busy:busy\|\|loginBusy\|\|switchingAccount/);

assert.match(app,/const button=event\.currentTarget/);
assert.match(app,/if\(info\?\.busy\)return showToast/);
assert.match(app,/button\.disabled=true/);
assert.match(app,/if\(button\.isConnected\)button\.disabled=false/);

assert.match(auth,/Opening the Google account chooser/);
assert.match(auth,/Googleアカウント選択画面を開いています/);
assert.match(app,/Preparing account data\. Please wait a moment\./);
assert.match(app,/アカウントデータを準備しています/);

const nativeCalls=[],statuses=[],toasts=[];
const storage={scope:"guest",getItem:()=>null,setItem(){},removeItem(){}};
class MockGoogleAuthProvider{
  setCustomParameters(){}
  static credential(idToken){return{idToken}}
}
const fakeWindow={
  PARALLEL_CITY_FIREBASE:{apiKey:"test",projectId:"test",authDomain:"test"},
  ParallelCity:{getState:()=>({uiLanguage:"ko",characters:{}}),setAccountStatus:text=>statuses.push(text),toast:text=>toasts.push(text)},
  Capacitor:{isNativePlatform:()=>true,Plugins:{FirebaseAuthentication:{signInWithGoogle:async options=>{nativeCalls.push(options);return{credential:{idToken:"native-id-token"}}}}}},
  dispatchEvent(){}
};
let signedCredential=null;
const source=auth.replace(/^import .*;\r?\n/gm,"");
await vm.runInNewContext(`(async()=>{${source}\n})()`,{
  window:fakeWindow,localStorage:storage,console,Event,Date,Map,Set,Promise,setTimeout,clearTimeout,URL,Blob,TextEncoder,crypto:globalThis.crypto,
  location:{origin:"http://test",href:"http://test"},navigator:{userAgent:"Android 17"},alert(){},
  initializeApp:()=>({}),getAuth:()=>({}),getFirestore:()=>({}),getStorage:()=>({}),setPersistence:async()=>{},browserLocalPersistence:{},getRedirectResult:async()=>{},onAuthStateChanged(){},
  GoogleAuthProvider:MockGoogleAuthProvider,signInWithCredential:async(_,credential)=>{signedCredential=credential},signInWithPopup:async()=>{},signInWithRedirect:async()=>{},signOut:async()=>{},
  doc:()=>({}),collection:()=>({}),getDoc:async()=>({exists:()=>false}),getDocFromServer:async()=>({exists:()=>false}),getDocs:async()=>({docs:[]}),getDocsFromServer:async()=>({docs:[]}),setDoc:async()=>{},deleteDoc:async()=>{},deleteField:()=>{},serverTimestamp:()=>0,arrayUnion:(...items)=>items,
  mergeCloudRestoreState:value=>value,mergeDeviceAndCloudState:value=>value,gzipBytes:value=>value,ungzipBytes:value=>value
});
assert.equal(await fakeWindow.ParallelCityAuth.login(),true);
assert.equal(nativeCalls.length,1);
assert.equal(nativeCalls[0].skipNativeAuth,true);
assert.equal(nativeCalls[0].useCredentialManager,false);
assert.equal(signedCredential.idToken,"native-id-token");
assert.ok(statuses.includes("Google 계정 선택창을 여는 중이에요…"));
assert.ok(toasts.includes("Google 계정 선택창을 여는 중이에요…"));

console.log("PASS 232: Android Google sign-in uses the visible legacy account chooser with immediate feedback and duplicate-tap protection");
