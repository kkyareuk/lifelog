"use strict";
const {gunzipSync,gzipSync}=require('node:zlib');
const imageKey=/(?:image|photo|icon|avatar|thumbnail|watermark|portrait|texture|illustration|background|floor|exterior)/i;
function ownedImage(value,uid){try{return /^https?:\/\//.test(value)&&decodeURIComponent(value).includes('users/'+uid+'/')}catch{return false}}
function cleanImages(value,{uid='',personal=true,key=''}={}){
 if(typeof value==='string'){
  if(ownedImage(value,uid)||personal&&(/^(data:image\/|local-media:\/\/|blob:)/.test(value)||imageKey.test(key)&&/^https?:\/\//.test(value)))return '';
  if(key==='profileJson'){try{return JSON.stringify(cleanImages(JSON.parse(value),{uid,personal}))}catch{return value}}
  if(key==='gameStateGzip'){const parsed=JSON.parse(gunzipSync(Buffer.from(value,'base64')).toString('utf8'));return gzipSync(JSON.stringify(cleanImages(parsed,{uid,personal}))).toString('base64')}
  return value;
 }
 if(Array.isArray(value))return value.map(v=>cleanImages(v,{uid,personal,key}));
 if(!value||typeof value!=='object'||Object.getPrototypeOf(value)!==Object.prototype)return value;
 return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,cleanImages(v,{uid,personal,key:k})]));
}
function createImageDeletion({db,bucket,clock=Date.now}){
 const stateRef=uid=>db.collection('imageDeletionState').doc(uid);
 async function preview(uid){const [files]=await bucket.getFiles({prefix:'users/'+uid+'/'});const state=await stateRef(uid).get();return {files:files.length,epoch:state.data()?.epoch||'',status:state.data()?.status||'none',requestId:state.data()?.status==='deleting'?state.data().requestId:''}}
 async function remove(identity,input){
  const uid=identity.uid;if(!uid||uid.includes('/'))throw Object.assign(Error('invalid-user'),{status:401});
  if(input.confirm!==true||!/^[a-zA-Z0-9-]{16,80}$/.test(input.requestId||''))throw Object.assign(Error('confirmation-required'),{status:400});
  const lock=stateRef(uid),requestId=input.requestId;
  const lease=await db.runTransaction(async tx=>{const old=(await tx.get(lock)).data();if(old?.requestId===requestId&&old.status==='complete')return old;if(old?.status==='deleting'&&(old.requestId!==requestId||old.leaseUntil>clock()))throw Object.assign(Error('deletion-in-progress'),{status:409});const next={requestId,epoch:old?.requestId===requestId?old.epoch:String(clock()),status:'deleting',leaseUntil:clock()+600000,startedAt:old?.startedAt||clock()};tx.set(lock,next);return next});
  if(lease.status==='complete')return {deleted:true,epoch:lease.epoch};
  let changed=0;
  try{
  async function scrub(ref,personal){await db.runTransaction(async tx=>{const snap=await tx.get(ref);if(!snap.exists)return;const old=snap.data(),next=cleanImages(old,{uid,personal});if(ref.path==='users/'+uid){next.mediaManifest={version:1,items:[],legacyCount:0};delete next.syncManifest;next.syncRevision='images-deleted-'+lease.epoch;}if(ref.path.startsWith('users/'+uid+'/')||ref.path==='users/'+uid)next._mediaEpoch=lease.epoch;if(JSON.stringify(old)!==JSON.stringify(next)){tx.set(ref,next);changed++}})}
  async function tree(ref,personal){await scrub(ref,personal);for(const collection of await ref.listCollections()){const refs=await collection.listDocuments();for(const child of refs)await tree(child,personal)}}
  await tree(db.collection('users').doc(uid),true);
  const memberships=await db.collection('users').doc(uid).collection('groupMemberships').get();
  const owned=await db.collection('groups').where('ownerUid','==',uid).get();
  const groups=new Set([...memberships.docs.map(d=>d.id),...owned.docs.map(d=>d.id)]);
  for(const gid of groups)await tree(db.collection('groups').doc(gid),false);
  for(const kind of ['characterCodes','worldCodes']){const docs=await db.collection(kind).where('ownerUid','==',uid).get();for(const d of docs.docs)await tree(d.ref,true)}
  await bucket.deleteFiles({prefix:'users/'+uid+'/',force:true});
  const [remaining]=await bucket.getFiles({prefix:'users/'+uid+'/'});if(remaining.length)throw Error('files-remain');
  await lock.set({...lease,status:'complete',completedAt:clock(),changedDocuments:changed});return {deleted:true,epoch:lease.epoch,changedDocuments:changed};
  }catch(error){await lock.set({leaseUntil:0},{merge:true});throw error}
 }
 return {preview,remove};
}
module.exports={cleanImages,ownedImage,createImageDeletion};
