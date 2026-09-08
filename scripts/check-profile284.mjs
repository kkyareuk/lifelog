import assert from 'node:assert/strict';import vm from 'node:vm';import fs from 'node:fs';
const source=fs.readFileSync('auth.js','utf8'),body=source.slice(source.indexOf('async function registerSignedInUser(){'),source.indexOf('const normalizeEntitlements='));
for(const [exists,configured,expected] of [[false,undefined,false],[true,true,true],[true,undefined,true],[true,false,false]]){
 const writes=[],ctx=vm.createContext({user:{uid:'u',providerData:[]},captureSession:()=>({uid:'u'}),sessionStamp:()=>Date.now(),REFRESH_GUARD_MS:60000,cloudDoc:()=>({}),getDoc:async()=>({exists:()=>exists,data:()=>({profile:{configured}})}),assertSession(){},accountName:()=> 'Name',accountPhoto:()=>'',location:{origin:'test'},cfg:{projectId:'p',appId:'a'},serverTimestamp:()=>1,arrayUnion:x=>[x],setDoc:async(ref,data)=>writes.push(data),stampSession(){},Date});
 await vm.runInContext('let profileSetupComplete=false;'+body+';registerSignedInUser().then(()=>profileSetupComplete)',ctx).then(value=>assert.equal(value,expected));
 assert.equal(writes.length,exists?0:1);if(!exists)assert.equal(writes[0].profile.configured,false);
}
console.log('PASS server account profile state checked even when presence write is cached; existing accounts do not repeat onboarding');
