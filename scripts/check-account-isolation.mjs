import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {mergeCloudRestoreState,mergeDeviceAndCloudState} from '../sync-merge.js';
const memory=new Map();
let storageLimit=Infinity;
globalThis.localStorage={get length(){return memory.size},key:i=>[...memory.keys()][i]??null,getItem:k=>memory.get(k)??null,setItem:(k,v)=>{
  const size=[...memory].reduce((sum,[key,value])=>sum+(key===k?0:key.length+value.length),0)+k.length+String(v).length;
  if(size>storageLimit)throw new DOMException('quota','QuotaExceededError');memory.set(k,String(v));
},removeItem:k=>memory.delete(k)};
globalThis.document={querySelector:()=>null,addEventListener(){},activeElement:null};
globalThis.window={addEventListener(){},dispatchEvent(){}};
const game=await import('../state.js');
const {accountStorage}=await import('../account-storage.js?v=20260905dev223');
const character=(id)=>({id,name:id,days:{}});
const cloud=new Map([['A',{syncFormat:1,gameState:{schema:31,characters:{a:character('a')},order:['a'],lastSaved:100}}],['B',{}]]);
let callback,hold=null;const writes=[];
const pathOf=parts=>parts.filter(part=>typeof part==='string').join('/');
const snapshot=(path)=>({exists:()=>cloud.has(path.split('/')[1]),data:()=>cloud.get(path.split('/')[1])});
const fakeWindow={PARALLEL_CITY_FIREBASE:{apiKey:'test',projectId:'test',authDomain:'test'},dispatchEvent(){},ParallelCity:{getState:game.cloneState,switchAccount:game.switchAccountState,replaceState:game.replaceState,setAccountStatus(){},setEntitlements(){},toast(){}}};
class FakeGoogleAuthProvider{setCustomParameters(){}}
const context={window:fakeWindow,document:globalThis.document,localStorage:accountStorage,console,Event,Date,Map,Set,Promise,setTimeout,clearTimeout,URL,Blob,TextEncoder,crypto:globalThis.crypto,location:{origin:'http://test',href:'http://test'},navigator:{userAgent:'test'},alert(){},mergeCloudRestoreState,mergeDeviceAndCloudState,
 initializeApp:()=>({}),getAuth:()=>({}),getFirestore:()=>({}),getStorage:()=>({}),setPersistence:async()=>{},browserLocalPersistence:{},getRedirectResult:async()=>{},onAuthStateChanged:(_,fn)=>{callback=fn},
 doc:(...parts)=>pathOf(parts),collection:(...parts)=>pathOf(parts),getDoc:async path=>{if(hold&&path==='users/A')await hold.promise;return snapshot(path)},getDocFromServer:async path=>snapshot(path),getDocs:async()=>({docs:[]}),getDocsFromServer:async()=>({docs:[]}),
 setDoc:async(path,data)=>{writes.push({path,data});if(path.split('/').length===2)cloud.set(path.split('/')[1],{...cloud.get(path.split('/')[1]),...data})},deleteDoc:async()=>{},deleteField:()=>undefined,serverTimestamp:()=>0,arrayUnion:(...x)=>x,signOut:async()=>callback(null),
 GoogleAuthProvider:FakeGoogleAuthProvider,signInWithPopup:async()=>callback({uid:'C',email:'c@test'}),signInWithRedirect:async()=>{},signInWithCredential:async()=>{}
};
const source=fs.readFileSync(new URL('../auth.js',import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'');
await vm.runInNewContext(`(async()=>{${source}\n})()`,context);
const auth=fakeWindow.ParallelCityAuth;
await callback({uid:'A',email:'a@test'});
assert.deepEqual(game.state.order,['a']);
await auth.logout();
await callback({uid:'B',email:'b@test'});
assert.equal(game.state.order.length,0,'New account must not inherit A');
game.resetAll();
const b1=game.createCharacter(),b2=game.createCharacter();
game.save(true,false);
await auth.logout();await callback({uid:'A',email:'a@test'});
assert.deepEqual(game.state.order,['a'],'A must not receive B characters');
assert(!game.state.characters[b1]&&!game.state.characters[b2]);
await auth.logout();await callback({uid:'B',email:'b@test'});
assert.equal(game.state.order.length,2,'B local-only save must survive switching');
game.resetAll();
const reloaded=await import(`../state.js?account-reset-test`);
assert.equal(reloaded.state.order.length,0,'Intentional empty reset must not restore recovery characters');
await callback({uid:'A',email:'a@test'});
let release;hold={promise:new Promise(resolve=>{release=resolve})};
const staleDownload=auth.download({automatic:true});
const transition=callback({uid:'B',email:'b@test'});
release();await Promise.all([staleDownload,transition]);hold=null;
assert.equal(game.state.order.length,0,'Late A download cannot overwrite B');
assert.equal(accountStorage.scope,'B');
assert(!writes.some(write=>write.path==='users/B'&&write.data.gameState?.characters?.a));
await callback({uid:'A',email:'a@test'});
hold={promise:new Promise(resolve=>{release=resolve})};
const before=writes.length,staleUpload=auth.upload({silent:true});
await Promise.resolve();await Promise.resolve();
const uploadTransition=callback({uid:'B',email:'b@test'});
release();await Promise.all([staleUpload,uploadTransition]);hold=null;
assert(!writes.slice(before).some(write=>write.data.character||write.data.state||write.data.gameState),'Account change must cancel a pending state upload');
const created=game.createCharacter();game.save(true,false);
assert.equal(await auth.upload({silent:true}),true,'Normal same-account upload still succeeds');
assert(writes.some(write=>write.path.includes('/B/')&&JSON.stringify(write.data).includes(created)));
assert(!writes.some(write=>write.path.includes('/B/')&&write.data.character?.id==='a'));
assert(memory.has('drawer-account:A:drawer-village-game-v1'));
assert(memory.has('drawer-account:B:drawer-village-game-v1'));
assert(memory.has('drawer-village-game-v1'),'Legacy guest save is retained separately');
// Replay the real download handler with device quota already almost exhausted.
cloud.set('A',{syncFormat:1,gameState:{schema:31,characters:{a:{...character('a'),name:'복원한 A',notes:'삭제하지 않을 기록 '.repeat(20000)}},order:['a'],lastSaved:Date.now()+60000}});
storageLimit=[...memory].reduce((n,[key,value])=>n+key.length+value.length,0)+100;
await callback({uid:'A',email:'a@test'});
assert.equal(game.state.characters.a.name,'복원한 A');assert.equal(auth.getInfo().busy,false);
assert.equal(await auth.download(),true,'Manual cloud restore must succeed after lossless device compaction');
assert.equal(accountStorage.getItem('drawer-village-game-v1').includes('복원한 A'),true);
assert(memory.get('drawer-account:B:drawer-village-game-v1'),'B save remains present after A restoration');
await auth.logout();
const guestFirst=game.createCharacter();game.state.characters[guestFirst].name='첫 로그인 전 캐릭터';game.save(true,false);
assert.equal(accountStorage.scope,'guest');
assert.equal(await auth.login(),true);
assert.equal(accountStorage.scope,'C');
assert.equal(game.state.characters[guestFirst]?.name,'첫 로그인 전 캐릭터','Explicit first login must adopt the guest character into the new account');
assert(memory.has('drawer-village-game-v1'),'Guest recovery copy must remain intact after adoption');
assert(memory.has('drawer-account:C:drawer-village-game-v1'),'Adopted first character must be saved under the signed-in account');
assert(writes.some(write=>write.path.includes('/C/')&&JSON.stringify(write.data).includes(guestFirst)),'Adopted first character must be uploaded after the empty-cloud check');
console.log('PASS account switch/reset/reload isolation, guest preservation, stale download and upload rejection, same-account upload');
console.log('PASS actual automatic and manual download handlers under simulated full device storage');
console.log('PASS explicit first login adopts and uploads the pre-login guest character without deleting its recovery copy');
