import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const auth=await readFile('auth.js','utf8');
assert.match(auth,/import \{[^\n]*\bupdateDoc\b[^\n]*firebase-firestore/);
const source=auth.slice(auth.indexOf('async function savePublicProfile('),auth.indexOf('window.ParallelCityAuth={',auth.indexOf('async function savePublicProfile(')));
const calls=[];const context={user:{uid:'u'},captureSession:()=>({uid:'u'}),assertSession(){},accountPhoto:()=>'',optimizeCloudImage:async()=>({type:'image/webp'}),ref:()=>({}),storage:{},uploadBytes:async()=>calls.push('upload'),getDownloadURL:async()=>'https://example.test/avatar',updateProfile:async()=>calls.push('auth'),setDoc:async()=>calls.push('account'),cloudDoc:()=>({}),groupState:{groups:[{id:'g'}]},doc:()=>({}),db:{},getDoc:async()=>({exists:()=>true}),updateDoc:async(_,patch)=>{assert.equal(patch.photoURL,'https://example.test/avatar');calls.push('member')},profileSetupComplete:false};
vm.createContext(context);vm.runInContext(source,context);await context.savePublicProfile({name:'Tester',photo:{type:'image/png',size:300}});assert.deepEqual(calls,['upload','auth','account','member']);
const handlers={},events={},pushCalls=[];let signedIn=false;
const window={Capacitor:{getPlatform:()=> 'android',Plugins:{PushNotifications:{checkPermissions:async()=>({receive:'prompt'}),requestPermissions:async()=>{pushCalls.push('permission');return {receive:'granted'}},addListener:async(n,f)=>handlers[n]=f,createChannel:async()=>{},register:async()=>handlers.registration({value:'test-token'}),unregister:async()=>{}}}},ParallelCityAuth:{getInfo:()=>({user:signedIn?{uid:'u'}:null})},DrawerVillageGroups:{registerDevice:async()=>pushCalls.push('device'),select:()=>pushCalls.push('select')},addEventListener:(n,f)=>events[n]=f};
vm.runInNewContext(await readFile('group-push.js','utf8'),{window,document:{readyState:'complete'},location:{},console});await new Promise(r=>setTimeout(r,20));assert.deepEqual(pushCalls,['permission']);signedIn=true;events['drawer-village-auth-busy']();await new Promise(r=>setTimeout(r,20));assert.deepEqual(pushCalls,['permission','device']);
console.log('PASS real profile save function uploads photo and updates member; first launch requests native permission, then registers token after login');

handlers.pushNotificationActionPerformed({notification:{data:{groupId:'g'}}});assert.equal(window.DrawerVillageGroupPush.pending,null);const selects=pushCalls.filter(x=>x==='select').length;events['drawer-village-auth-busy']();events['drawer-village-auth-busy']();assert.equal(pushCalls.filter(x=>x==='select').length,selects,'Auth refresh cannot replay an old notification navigation');
console.log('PASS notification navigation is consumed once, never replayed during home editing');
