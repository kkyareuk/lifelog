import {initializeApp} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {getAuth,GoogleAuthProvider,setPersistence,browserLocalPersistence,onAuthStateChanged,signInWithPopup,signInWithRedirect,getRedirectResult,signInWithCredential,signOut} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {getFirestore,doc,getDoc,setDoc,collection,getDocs,deleteDoc,deleteField,serverTimestamp,arrayUnion} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import {getStorage,ref,uploadBytes,getDownloadURL} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";
import {gzip as gzipBytes,ungzip as ungzipBytes} from "./vendor/pako.esm.mjs";

const cfg=window.PARALLEL_CITY_FIREBASE||{};
const ready=Boolean(cfg.apiKey&&cfg.projectId&&cfg.authDomain);
const status=text=>window.ParallelCity?.setAccountStatus(text);
const clone=value=>JSON.parse(JSON.stringify(value));
// Firestore는 배열 안에 배열이 들어간 값을 저장하지 못한다. 게임 상태에는
// 방 배치·일정처럼 중첩 배열이 정상적으로 존재하므로 클라우드 문서에서만
// 배열을 표시 객체로 감싸고, 기기에서 사용할 때 원래 배열로 되돌린다.
const FIRESTORE_ARRAY_MARKER="__drawerVillageArrayV1";
const encodeFirestoreState=value=>{
  if(Array.isArray(value))return{[FIRESTORE_ARRAY_MARKER]:value.map(encodeFirestoreState)};
  if(value&&typeof value==="object"){
    const encoded={};
    Object.entries(value).forEach(([key,item])=>{
      if(item===undefined||typeof item==="function"||typeof item==="symbol")return;
      encoded[key]=encodeFirestoreState(item);
    });
    return encoded;
  }
  if(typeof value==="number"&&!Number.isFinite(value))return null;
  return value;
};
const decodeFirestoreState=value=>{
  if(Array.isArray(value))return value.map(decodeFirestoreState);
  if(value&&typeof value==="object"){
    const keys=Object.keys(value);
    if(keys.length===1&&Array.isArray(value[FIRESTORE_ARRAY_MARKER])){
      return value[FIRESTORE_ARRAY_MARKER].map(decodeFirestoreState);
    }
    const decoded={};
    Object.entries(value).forEach(([key,item])=>{decoded[key]=decodeFirestoreState(item)});
    return decoded;
  }
  return value;
};
const canonicalRelationshipType=type=>({
  "폴리 관계":"연인","유사 연인":"연인","비공식 연인":"연인","연애 관계":"연인","커플":"연인",
  "절친":"친구","대학 동기":"친구","젊은 날의 친구들":"친구",
  "유사가족":"동거인","가족":"동거인","보호·피보호":"동거인"
})[type]||String(type||"친구");
const normalizeRelationshipTombstoneKey=value=>{
  const parts=String(value||"").split("|");
  if(parts.length<2)return String(value||"");
  parts[0]=canonicalRelationshipType(parts[0]);
  return parts.join("|");
};
const relationshipIdentity=relation=>{
  if(!relation?.a||!relation?.b||relation.a===relation.b)return"";
  const type=canonicalRelationshipType(relation.type);
  const directional=type==="부모·자녀"||Boolean(relation.directional);
  const pair=directional?`${relation.a}>${relation.b}`:[relation.a,relation.b].sort().join("~");
  return`${type}|${pair}|${String(relation.parentRole||"")}`;
};
const applyLocalTombstones=(remote,local)=>{
  const next=clone(remote||{});
  const deletedCharacters=new Set([...(local?.deletedCharacterIds||[]),...(next.deletedCharacterIds||[])].map(String));
  const deletedRelationships=new Set([...(local?.deletedRelationshipIds||[]),...(next.deletedRelationshipIds||[])].map(String));
  const deletedRelationshipKeys=new Set([...(local?.deletedRelationshipKeys||[]),...(next.deletedRelationshipKeys||[])].map(normalizeRelationshipTombstoneKey).filter(Boolean));
  const deletedHomes=new Set([...(local?.deletedHomeIds||[]),...(next.deletedHomeIds||[])].map(String));
  next.deletedCharacterIds=[...deletedCharacters];
  next.deletedRelationshipIds=[...deletedRelationships];
  next.deletedRelationshipKeys=[...deletedRelationshipKeys];
  next.deletedHomeIds=[...deletedHomes];
  if(Array.isArray(next.characters))next.characters=next.characters.filter(character=>character&&!deletedCharacters.has(String(character.id)));
  else Object.keys(next.characters||{}).forEach(id=>{if(deletedCharacters.has(String(id)))delete next.characters[id]});
  next.order=(Array.isArray(next.order)?next.order:[]).filter(id=>!deletedCharacters.has(String(id)));
  if(Array.isArray(next.relationships)){
    next.relationships=next.relationships.filter(relation=>relation&&!deletedRelationships.has(String(relation.id))&&!deletedRelationshipKeys.has(relationshipIdentity(relation))&&!deletedCharacters.has(String(relation.a))&&!deletedCharacters.has(String(relation.b)));
  }else{
    Object.entries(next.relationships||{}).forEach(([id,relation])=>{
      if(deletedRelationships.has(String(id))||deletedRelationshipKeys.has(relationshipIdentity(relation))||deletedCharacters.has(String(relation?.a))||deletedCharacters.has(String(relation?.b)))delete next.relationships[id];
    });
  }
  if(Array.isArray(next.homes))next.homes=next.homes.filter(home=>home&&!deletedHomes.has(String(home.id)));
  Object.entries(next.homes||{}).forEach(([homeId,home])=>{
    if(deletedHomes.has(String(homeId))||deletedHomes.has(String(home?.id))){delete next.homes[homeId];return}
    if(!home||typeof home!=="object")return;
    const localDeleted=local?.homes?.[homeId]?.deletedRoomKeys||[];
    home.deletedRoomKeys=[...new Set([...localDeleted,...(home.deletedRoomKeys||[])].map(String))];
    home.deletedRoomKeys.forEach(key=>{if(home.rooms&&typeof home.rooms==="object")delete home.rooms[key]});
  });
  Object.values(next.characters||{}).forEach(character=>{
    if(!character||typeof character!=="object")return;
    if(Array.isArray(character.residences))character.residences=character.residences.filter(item=>item&&!deletedHomes.has(String(item.homeId)));
    if(deletedHomes.has(String(character.homeId)))character.homeId="";
  });
  return next;
};
const isData=value=>typeof value==="string"&&value.startsWith("data:");
let auth,db,storage,user,busy=false;
const accountName=()=>String(
  window.ParallelCity?.getState?.()?.ownerName||
  localStorage.getItem("drawer-village-user-name")||
  user?.displayName||
  "계정"
).trim().slice(0,20)||"계정";
let entitlements={backgroundPacks:[],iconPacks:[],dlcPacks:[],purchases:[],characterSlotPacks:0,townSlotPacks:0,storage50:false,teaSupportMonth:""};
let guideState={loaded:!ready,seen:[]};
let autoLoadStarted=false;
const REFRESH_GUARD_MS=30*60*1000;
const sessionStamp=key=>Number(localStorage.getItem(key)||0);
const stampSession=key=>localStorage.setItem(key,String(Date.now()));
const uploadedCache=new Map();
const MAX_PHOTOS=120;
const FREE_TOTAL_BYTES=20*1024*1024;
const STORAGE_50_TOTAL_BYTES=50*1024*1024;
const MAX_IMAGE_BYTES=1536*1024;
const hasStorage50=()=>Boolean(entitlements.storage50||entitlements.purchases?.includes("storage_50mb"));
const maxPhotos=()=>hasStorage50()?400:MAX_PHOTOS;
const maxTotalBytes=()=>hasStorage50()?STORAGE_50_TOTAL_BYTES:FREE_TOTAL_BYTES;
let storageUsage={count:0,bytes:0,maxCount:MAX_PHOTOS,maxBytes:FREE_TOTAL_BYTES};
const toast=text=>window.ParallelCity?.toast?.(text);
const storedPhotoUrls=value=>{
  const urls=new Set();
  const walk=node=>{
    if(typeof node==="string"&&/firebasestorage\.googleapis\.com|firebasestorage\.app|storage\.googleapis\.com/.test(node)){urls.add(node);return}
    if(!node||typeof node!=="object")return;
    Object.values(node).forEach(walk);
  };
  walk(value);return urls;
};
const countStoredPhotos=value=>storedPhotoUrls(value).size;
const normalizeManifest=(value,gameState)=>({
  items:Array.isArray(value?.items)?value.items.filter(item=>item&&typeof item.hash==="string"&&typeof item.url==="string").slice(0,maxPhotos()):[],
  legacyCount:Math.max(Number(value?.legacyCount)||0,Math.max(0,countStoredPhotos(gameState)-(Array.isArray(value?.items)?value.items.length:0)))
});
const publishStorageUsage=(manifest,gameState)=>{
  const normalized=normalizeManifest(manifest,gameState);
  storageUsage={count:normalized.items.length+normalized.legacyCount,bytes:normalized.items.reduce((sum,item)=>sum+(Number(item.size)||0),0),maxCount:maxPhotos(),maxBytes:maxTotalBytes(),unlimited:false};
  localStorage.setItem("drawer-village-storage-usage",JSON.stringify(storageUsage));
  window.dispatchEvent(new Event("drawer-village-storage-usage"));
};
const digestBlob=async blob=>{
  const bytes=await crypto.subtle.digest("SHA-256",await blob.arrayBuffer());
  return [...new Uint8Array(bytes)].map(value=>value.toString(16).padStart(2,"0")).join("");
};

function shortError(error){
  const code=String(error?.code||"unknown").replace(/^firebase\//,"");
  if(code.includes("character-slot-limit"))return `캐릭터 슬롯 초과 (${error?.detail||""}) · 초과 인원을 정리한 뒤 다시 저장해 주세요`;
  if(code.includes("legacy-document-too-large"))return "동기화 데이터가 너무 큼 · 사진을 줄이거나 Firebase 프로젝트 권한을 확인해 주세요";
  if(code.includes("permission-denied")||code.includes("unauthorized"))return "저장 권한 확인 필요";
  if(code.includes("resource-exhausted"))return "저장 데이터가 너무 큼 · 인물별 분할 저장을 다시 시도해 주세요";
  if(code.includes("failed-precondition"))return "Firebase 데이터베이스 설정 확인 필요";
  if(code.includes("unavailable"))return "Google 동기화 서버에 잠시 연결할 수 없음";
  if(code.includes("bucket-not-found")||code.includes("object-not-found"))return "사진 저장소 확인 필요";
  if(code.includes("quota"))return "Storage 용량 초과 · Firebase 요금제와 저장 파일을 확인해 주세요";
  if(code.includes("unauthenticated")||code.includes("billing")||code.includes("payment-required"))return "Firebase Storage는 Blaze 요금제 연결이 필요해요";
  if(code.includes("unknown")||code.includes("retry-limit"))return "Storage 접근 실패 · Blaze 요금제와 버킷 설정을 확인해 주세요";
  if(code.includes("photo-limit"))return `사진은 계정당 최대 ${MAX_PHOTOS}장까지 저장할 수 있어요`;
  if(code.includes("total-size-limit"))return `사진 저장 용량은 현재 총 ${Math.round(maxTotalBytes()/1048576)}MB까지예요`;
  if(code.includes("image-too-large"))return "압축된 사진 한 장은 1.5MB 이하여야 해요";
  if(code.includes("timeout"))return "사진 업로드 응답 없음 · Storage 요금제와 규칙을 확인해 주세요";
  if(code.includes("network"))return "인터넷 연결 확인";
  return code;
}
const cloudDoc=()=>doc(db,"users",user.uid);
const cloudCoreDoc=()=>doc(db,"users",user.uid,"sync","core");
const cloudCharacters=()=>collection(db,"users",user.uid,"characters");
const safeDocumentId=value=>encodeURIComponent(String(value||"unknown")).replaceAll("/","%2F");
const cloudCharacterDoc=id=>doc(db,"users",user.uid,"characters",safeDocumentId(id));
const cloudDays=id=>collection(db,"users",user.uid,"characters",safeDocumentId(id),"days");
const cloudDayDoc=(id,dateKey)=>doc(db,"users",user.uid,"characters",safeDocumentId(id),"days",safeDocumentId(dateKey));

async function readCloudGameState(rootData){
  // 호환 형식으로 저장된 완전한 루트 상태가 있으면, 중간에 끊긴 v2
  // 하위 문서보다 이것을 우선한다.
  if(rootData?.syncFormat===1&&rootData?.gameStateGzip)return decodeCompressedLegacyState(rootData.gameStateGzip);
  if(rootData?.syncFormat===1&&rootData?.gameState)return decodeFirestoreState(rootData.gameState);
  let coreSnapshot;
  try{coreSnapshot=await getDoc(cloudCoreDoc())}
  catch(error){
    // 아직 하위 문서 규칙을 배포하지 않은 기존 Firebase 프로젝트도
    // 루트 문서 백업은 계속 읽고 쓸 수 있어야 한다.
    if(canUseLegacySync(error))return rootData?.gameStateGzip
      ?decodeCompressedLegacyState(rootData.gameStateGzip)
      :decodeFirestoreState(rootData?.gameState||null);
    throw error;
  }
  if(!coreSnapshot.exists())return rootData?.gameStateGzip
    ?decodeCompressedLegacyState(rootData.gameStateGzip)
    :decodeFirestoreState(rootData?.gameState||null);
  const coreData=decodeFirestoreState(coreSnapshot.data()?.state||{});
  const characters={};
  const characterSnapshots=await getDocs(cloudCharacters());
  for(const characterSnapshot of characterSnapshots.docs){
    const documentData=characterSnapshot.data()||{};
    const character=decodeFirestoreState(documentData.character||{});
    const characterId=String(documentData.characterId||character.id||characterSnapshot.id);
    const days={};
    const daySnapshots=await getDocs(cloudDays(characterId));
    daySnapshots.forEach(daySnapshot=>{
      const dayData=daySnapshot.data()||{};
      const dateKey=String(dayData.dateKey||daySnapshot.id);
      days[dateKey]=decodeFirestoreState(dayData.day||{});
    });
    characters[characterId]={...character,id:character.id||characterId,days};
  }
  return {...coreData,characters};
}

async function writeCloudGameState(gameState){
  const next=clone(gameState||{});
  const characters=next.characters&&typeof next.characters==="object"?next.characters:{};
  delete next.characters;
  const wantedCharacterIds=new Set(Object.keys(characters).map(String));
  const existingCharacters=await getDocs(cloudCharacters());
  for(const existing of existingCharacters.docs){
    const existingId=String(existing.data()?.characterId||existing.id);
    if(wantedCharacterIds.has(existingId))continue;
    const oldDays=await getDocs(collection(existing.ref,"days"));
    await Promise.all(oldDays.docs.map(day=>deleteDoc(day.ref)));
    await deleteDoc(existing.ref);
  }

  for(const [characterId,source] of Object.entries(characters)){
    const character=clone(source||{});
    const days=character.days&&typeof character.days==="object"?character.days:{};
    delete character.days;
    await setDoc(cloudCharacterDoc(characterId),{
      characterId:String(characterId),
      character:encodeFirestoreState(character),
      updatedAt:serverTimestamp()
    });
    const wantedDays=new Set(Object.keys(days).map(String));
    const existingDays=await getDocs(cloudDays(characterId));
    await Promise.all(existingDays.docs.filter(day=>!wantedDays.has(String(day.data()?.dateKey||day.id))).map(day=>deleteDoc(day.ref)));
    await Promise.all(Object.entries(days).map(([dateKey,day])=>setDoc(cloudDayDoc(characterId,dateKey),{
      dateKey:String(dateKey),day:encodeFirestoreState(day),updatedAt:serverTimestamp()
    })));
  }
  // core 문서는 모든 하위 문서 저장이 끝났다는 완료 표식이기도 하다.
  // 마지막에 기록해야 다운로드가 부분 저장본을 완성본으로 오인하지 않는다.
  await setDoc(cloudCoreDoc(),{state:encodeFirestoreState(next),updatedAt:serverTimestamp()});
}

const canUseLegacySync=error=>{
  const code=String(error?.code||error?.message||"").toLowerCase();
  return code.includes("permission-denied")||code.includes("failed-precondition")||code.includes("not-found");
};
const bytesToBase64=bytes=>{
  let binary="";
  for(let offset=0;offset<bytes.length;offset+=32768){
    binary+=String.fromCharCode(...bytes.subarray(offset,offset+32768));
  }
  return btoa(binary);
};
const base64ToBytes=value=>Uint8Array.from(atob(String(value||"")),character=>character.charCodeAt(0));
async function encodeCompressedLegacyState(gameState){
  const json=JSON.stringify(encodeFirestoreState(gameState));
  if(typeof CompressionStream==="function"){
    const stream=new Blob([json],{type:"application/json"}).stream().pipeThrough(new CompressionStream("gzip"));
    return bytesToBase64(new Uint8Array(await new Response(stream).arrayBuffer()));
  }
  return bytesToBase64(gzipBytes(json));
}
async function decodeCompressedLegacyState(value){
  const bytes=base64ToBytes(value);
  const json=typeof DecompressionStream==="function"
    ?await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"))).text()
    :ungzipBytes(bytes,{to:"string"});
  return decodeFirestoreState(JSON.parse(json));
}
async function writeLegacyCloudGameState(gameState,mediaManifest){
  const encoded=encodeFirestoreState(gameState);
  const encodedText=JSON.stringify(encoded);
  const byteLength=new TextEncoder().encode(encodedText).byteLength;
  if(byteLength<=700000){
    await setDoc(cloudDoc(),{
      gameState:encoded,
      gameStateGzip:deleteField(),
      gameStateCompression:deleteField(),
      syncFormat:1,
      mediaManifest,
      updatedAt:serverTimestamp(),
      profile:{name:accountName(),email:user.email||""}
    },{merge:true});
    return;
  }
  const compressed=await encodeCompressedLegacyState(gameState);
  if(!compressed||new TextEncoder().encode(compressed).byteLength>780000)throw Object.assign(new Error("legacy-document-too-large"),{code:"sync/legacy-document-too-large"});
  await setDoc(cloudDoc(),{
    gameState:deleteField(),
    gameStateGzip:compressed,
    gameStateCompression:"gzip-base64-v1",
    syncFormat:1,
    mediaManifest,
    updatedAt:serverTimestamp(),
    profile:{name:accountName(),email:user.email||""}
  },{merge:true});
}
async function registerSignedInUser(){
  if(!user)return;
  const guardKey=`drawer-village-login-write-${user.uid}`;
  if(Date.now()-sessionStamp(guardKey)<REFRESH_GUARD_MS)return;
  const reference=cloudDoc();
  const snapshot=await getDoc(reference);
  const profile={
    name:accountName(),
    email:user.email||"",
    photoURL:user.photoURL||"",
    provider:user.providerData?.[0]?.providerId||"google.com"
  };
  const presence={
    profile,
    lastLoginAt:serverTimestamp(),
    lastLoginOrigin:location.origin,
    loginOrigins:arrayUnion(location.origin),
    firebaseProjectId:cfg.projectId,
    firebaseAppId:cfg.appId,
    accountSchemaVersion:2
  };
  if(!snapshot.exists())presence.createdAt=serverTimestamp();
  await setDoc(reference,presence,{merge:true});
  stampSession(guardKey);
}
const normalizeEntitlements=value=>{
  const purchases=Array.isArray(value?.purchases)?value.purchases.filter(x=>typeof x==="string"):[];
  return {
    backgroundPacks:Array.isArray(value?.backgroundPacks)?value.backgroundPacks.filter(x=>typeof x==="string"):[],
    iconPacks:Array.isArray(value?.iconPacks)?value.iconPacks.filter(x=>typeof x==="string"):[],
    dlcPacks:Array.isArray(value?.dlcPacks)?value.dlcPacks.filter(x=>typeof x==="string"):[],
    purchases,
    characterSlotPacks:Math.max(0,Number(value?.characterSlotPacks)||purchases.filter(x=>x==="character_slots_5").length),
    townSlotPacks:Math.max(0,Number(value?.townSlotPacks)||purchases.filter(x=>x==="town_slot_1").length),
    storage50:Boolean(value?.storage50||purchases.includes("storage_50mb")),
    teaSupportMonth:typeof value?.teaSupportMonth==="string"?value.teaSupportMonth:"",
    grantedBy:typeof value?.grantedBy==="string"?value.grantedBy:"",
    note:typeof value?.note==="string"?value.note:""
  };
};
const publishEntitlements=value=>{
  entitlements=normalizeEntitlements(value);
  storageUsage={...storageUsage,maxCount:maxPhotos(),maxBytes:maxTotalBytes(),unlimited:false};
  localStorage.setItem("drawer-village-storage-usage",JSON.stringify(storageUsage));
  window.ParallelCity?.setEntitlements?.(entitlements);
};
const accessLabel=()=>[
  entitlements.characterSlotPacks?`캐릭터 슬롯 +${entitlements.characterSlotPacks*5}`:"",
  entitlements.townSlotPacks?`마을 슬롯 +${entitlements.townSlotPacks}`:"",
  entitlements.backgroundPacks.length?`배경 팩 ${entitlements.backgroundPacks.length}개`:"",
  entitlements.iconPacks.length?`아이콘 팩 ${entitlements.iconPacks.length}개`:"",
  entitlements.dlcPacks.length?`DLC ${entitlements.dlcPacks.length}개`:""
].filter(Boolean).join(" · ")||"일반 이용자";
const localGuideKeys=()=>["observe","home","character","catalog","relationship","routine","town","settings"].filter(tab=>localStorage.getItem(`drawer-village-guide-${tab}`)==="1");
const publishGuideState=value=>{
  guideState={loaded:true,seen:[...new Set(Array.isArray(value)?value.filter(x=>typeof x==="string"):[])]};
  window.dispatchEvent(new Event("drawer-village-guide-state"));
};
async function markGuideSeen(tab){
  if(!tab)return;
  publishGuideState([...guideState.seen,tab]);
  localStorage.setItem(`drawer-village-guide-${tab}`,"1");
  if(user)await setDoc(cloudDoc(),{uiPreferences:{pageGuides:guideState.seen}},{merge:true});
}
async function resetGuides(){
  publishGuideState([]);
  localGuideKeys().forEach(tab=>localStorage.removeItem(`drawer-village-guide-${tab}`));
  if(user)await setDoc(cloudDoc(),{uiPreferences:{pageGuides:[]}},{merge:true});
}

const canvasBlob=(canvas,type,quality)=>new Promise(resolve=>canvas.toBlob(resolve,type,quality));
async function imageBitmapForCloud(blob){
  if(typeof createImageBitmap==="function")return createImageBitmap(blob);
  return new Promise((resolve,reject)=>{
    const url=URL.createObjectURL(blob),image=new Image();
    image.onload=()=>{URL.revokeObjectURL(url);resolve(image)};
    image.onerror=error=>{URL.revokeObjectURL(url);reject(error)};
    image.src=url;
  });
}
async function optimizeCloudImage(original){
  if(original.size<=MAX_IMAGE_BYTES)return original;
  const image=await imageBitmapForCloud(original);
  const sourceWidth=Number(image.width)||1,sourceHeight=Number(image.height)||1;
  let scale=Math.min(1,2200/sourceWidth,2200/sourceHeight),quality=.9;
  try{
    for(let attempt=0;attempt<7;attempt+=1){
      const canvas=document.createElement("canvas");
      canvas.width=Math.max(1,Math.round(sourceWidth*scale));
      canvas.height=Math.max(1,Math.round(sourceHeight*scale));
      const context=canvas.getContext("2d",{alpha:true});
      context.imageSmoothingEnabled=true;
      context.imageSmoothingQuality="high";
      // drawImage의 전체 원본 영역을 전체 캔버스에 비례 축소한다. cover나
      // 잘라내기는 사용하지 않으므로 세로 LD도 머리와 발끝이 모두 보존된다.
      context.drawImage(image,0,0,sourceWidth,sourceHeight,0,0,canvas.width,canvas.height);
      const optimized=await canvasBlob(canvas,"image/webp",quality);
      if(optimized&&optimized.size<=MAX_IMAGE_BYTES)return optimized;
      scale*=.82;
      quality=Math.max(.68,quality-.04);
    }
  }finally{if(typeof image.close==="function")image.close()}
  throw Object.assign(new Error("image-too-large"),{code:"storage/image-too-large"});
}

async function uploadDataUrl(dataUrl,manifest){
  if(uploadedCache.has(dataUrl))return uploadedCache.get(dataUrl);
  const sourceBlob=await (await fetch(dataUrl)).blob();
  const blob=await optimizeCloudImage(sourceBlob);
  const hash=await digestBlob(blob),known=manifest.items.find(item=>item.hash===hash);
  if(known){uploadedCache.set(dataUrl,known.url);return known.url}
  if(manifest.items.length+manifest.legacyCount>=maxPhotos())throw Object.assign(new Error("photo-limit"),{code:"storage/photo-limit"});
  const usedBytes=manifest.items.reduce((sum,item)=>sum+(Number(item.size)||0),0);
  if(usedBytes+blob.size>maxTotalBytes())throw Object.assign(new Error("total-size-limit"),{code:"storage/total-size-limit"});
  const ext=blob.type==="image/png"?"png":"webp";
  const target=ref(storage,`users/${user.uid}/media/${hash}.${ext}`);
  await Promise.race([
    uploadBytes(target,blob,{contentType:blob.type||"image/webp",cacheControl:"public,max-age=31536000,immutable"}),
    new Promise((_,reject)=>setTimeout(()=>reject(Object.assign(new Error("storage-timeout"),{code:"storage/timeout"})),30000))
  ]);
  const url=await Promise.race([
    getDownloadURL(target),
    new Promise((_,reject)=>setTimeout(()=>reject(Object.assign(new Error("storage-timeout"),{code:"storage/timeout"})),10000))
  ]);
  manifest.items.push({hash,size:blob.size,url});
  uploadedCache.set(dataUrl,url);
  return url;
}

async function prepareState(local,manifest,previousState){
  const next=clone(local),jobs=[];
  const walk=(node,path=[])=>{
    if(!node||typeof node!=="object")return;
    Object.keys(node).forEach(key=>{
      const value=node[key],nextPath=[...path,key];
      if(isData(value))jobs.push({node,key,value,path:nextPath});
      else if(value&&typeof value==="object")walk(value,nextPath);
    });
  };
  walk(next,[]);
  let photoFailures=0;
  for(let i=0;i<jobs.length;i+=1){
    status(`${accountName()} · 사진 ${i+1}/${jobs.length} 올리는 중`);
    try{jobs[i].node[jobs[i].key]=await uploadDataUrl(jobs[i].value,manifest)}
    catch(error){
      console.warn("사진 업로드에 실패했지만 기존 클라우드 사진과 정보 동기화를 유지합니다",error);
      photoFailures+=1;
      const previousValue=jobs[i].path.reduce((value,key)=>value&&typeof value==="object"?value[key]:undefined,previousState);
      jobs[i].node[jobs[i].key]=typeof previousValue==="string"&&!isData(previousValue)?previousValue:"";
    }
  }
  const usedUrls=storedPhotoUrls(next);
  manifest.items=manifest.items.filter(item=>usedUrls.has(item.url));
  manifest.legacyCount=Math.max(0,usedUrls.size-manifest.items.length);
  return {gameState:next,mediaManifest:manifest,uploadedCount:jobs.length-photoFailures,photoFailures};
}

async function login(){
  if(!ready){alert("config.js의 Firebase 웹 앱 설정을 확인해 주세요.");return}
  const provider=new GoogleAuthProvider();
  provider.setCustomParameters({prompt:"select_account"});
  if(window.Capacitor?.isNativePlatform?.()&&window.Capacitor?.Plugins?.FirebaseAuthentication){
    const result=await window.Capacitor.Plugins.FirebaseAuthentication.signInWithGoogle();
    const credential=GoogleAuthProvider.credential(result.credential?.idToken,result.credential?.accessToken);
    await signInWithCredential(auth,credential);
    return;
  }
  try{await signInWithPopup(auth,provider)}catch(error){
    if(["auth/popup-blocked","auth/operation-not-supported-in-this-environment","auth/cancelled-popup-request"].includes(error.code))await signInWithRedirect(auth,provider);
    else alert(`로그인 실패: ${error.message||error.code}`);
  }
}

async function upload({silent=false,reason=""}={}){
  if(!user){if(!silent)toast("Google 로그인이 필요합니다");return false}
  if(busy){
    const started=Date.now();
    while(busy&&Date.now()-started<30000)await new Promise(resolve=>setTimeout(resolve,80));
    if(busy)return false;
  }
  busy=true;
  try{
    status(`${accountName()} · 올리는 중`);
    const localState=window.ParallelCity.getState();
    const allowedCharacters=5+(Math.max(0,Number(entitlements.characterSlotPacks)||0)*5);
    const localCharacterCount=Array.isArray(localState?.order)
      ?new Set(localState.order.filter(id=>localState.characters?.[id])).size
      :Object.keys(localState?.characters||{}).length;
    if(localCharacterCount>allowedCharacters){
      throw Object.assign(new Error("character-slot-limit"),{
        code:"sync/character-slot-limit",
        detail:`${localCharacterCount}/${allowedCharacters}`
      });
    }
    const previousSnapshot=await getDoc(cloudDoc()),previous=previousSnapshot.exists()?previousSnapshot.data():null;
    const previousGameState=await readCloudGameState(previous);
    // 오래된 기기가 전체 상태를 다시 올리더라도 클라우드에 이미 남은 삭제 기록이
    // 캐릭터·관계·집·방보다 우선한다. 이 병합이 없으면 다른 기기의 낡은 배열이
    // 삭제한 관계를 같은 ID 또는 다른 ID로 되살릴 수 있다.
    const tombstoneSafeState=previousGameState
      ?applyLocalTombstones(localState,previousGameState)
      :localState;
    const prepared=await prepareState(tombstoneSafeState,normalizeManifest(previous?.mediaManifest,previousGameState),previousGameState);
    const {gameState,mediaManifest,uploadedCount,photoFailures}=prepared;
    let compatibilityMode=false;
    try{
      await writeCloudGameState(gameState);
      await setDoc(cloudDoc(),{gameState:deleteField(),syncFormat:2,mediaManifest,updatedAt:serverTimestamp(),profile:{name:accountName(),email:user.email||""}},{merge:true});
    }catch(error){
      if(!canUseLegacySync(error))throw error;
      await writeLegacyCloudGameState(gameState,mediaManifest);
      compatibilityMode=true;
    }
    publishStorageUsage(mediaManifest,gameState);
    status(`${accountName()} · ${reason||"계정 저장"} 완료`);
    toast(photoFailures
      ?`정보 동기화 완료 · 사진 ${photoFailures}장은 기존 클라우드 사진을 유지`
      :compatibilityMode?"사진과 정보가 동기화되었습니다 · 호환 저장 사용 중"
        :uploadedCount?`사진과 정보가 동기화되었습니다 · 새 사진 ${uploadedCount}장 저장`
          :"사진과 정보가 동기화되었습니다");
    return true;
  }catch(error){
    console.error(error);status(`저장 실패 · ${shortError(error)}`);
    if(!silent)toast(`동기화 실패 · ${shortError(error)}`);
    return false;
  }finally{busy=false}
}

async function download({automatic=false}={}){
  if(!user){if(!automatic)toast("Google 로그인이 필요합니다");return}
  if(busy)return;busy=true;
  try{
    status(`${accountName()} · 불러오는 중`);
    const snapshot=await getDoc(cloudDoc());
    const documentData=snapshot.exists()?snapshot.data():null;
    const remoteGuides=Array.isArray(documentData?.uiPreferences?.pageGuides)?documentData.uiPreferences.pageGuides:[];
    const mergedGuides=[...new Set([...remoteGuides,...localGuideKeys()])];
    publishGuideState(mergedGuides);
    if(user&&mergedGuides.length!==remoteGuides.length)await setDoc(cloudDoc(),{uiPreferences:{pageGuides:mergedGuides}},{merge:true});
    const remote=await readCloudGameState(documentData);
    publishStorageUsage(documentData?.mediaManifest,remote);
    publishEntitlements(documentData?.entitlements);
    if(!remote){status(`${accountName()} · 저장 데이터 없음`);if(!automatic)toast("저장된 데이터가 없습니다");return}
    const countCharacters=value=>Array.isArray(value?.characters)?value.characters.length:Object.keys(value?.characters||{}).length;
    const remoteCount=countCharacters(remote),localCount=countCharacters(window.ParallelCity.getState());
    if(automatic&&remoteCount===0&&localCount>0){
      status(`${accountName()} · 기기 데이터 유지`);
      toast("기기의 캐릭터 데이터를 유지했습니다");
      return;
    }
    const localState=window.ParallelCity.getState();
    const characterIds=value=>new Set(Array.isArray(value?.order)?value.order:Object.keys(value?.characters||{}));
    const localIds=characterIds(localState),remoteIds=characterIds(remote);
    const differentCharacters=localIds.size>0&&remoteIds.size>0&&(localIds.size!==remoteIds.size||[...localIds].some(id=>!remoteIds.has(id)));
    if(differentCharacters){
      if(automatic){
        status(`${accountName()} · 기기와 클라우드 인물 구성이 달라 자동 불러오기 중지`);
        toast("인물 구성이 달라 자동 동기화를 멈췄어요 · 설정에서 어느 데이터를 쓸지 선택해 주세요");
        return false;
      }
      if(!confirm(`현재 기기에는 ${localCount}명, 클라우드에는 ${remoteCount}명이 있어요.\n\n클라우드 데이터로 기기의 마을 전체를 교체할까요?\n취소하면 현재 기기 데이터를 그대로 유지합니다.`)){
        status(`${accountName()} · 기기 데이터 유지`);
        toast("기기의 캐릭터 데이터를 유지했습니다");
        return false;
      }
    }
    if(automatic&&Number(localState?.lastSaved||0)>Number(remote?.lastSaved||0)){
      status(`${accountName()} · 더 최신인 기기 데이터 유지`);
      toast("기기의 최신 변경사항을 유지했습니다");
      return false;
    }
    window.ParallelCity.replaceState(applyLocalTombstones(remote,localState));
    window.dispatchEvent(new Event("drawer-village-cloud-loaded"));
    status(`${accountName()} · ${accessLabel()} · 불러오기 완료`);
    toast(automatic?"자동으로 불러왔습니다":"불러왔습니다");
    return true;
  }catch(error){console.error(error);status(`불러오기 실패 · ${shortError(error)}`);if(!automatic)toast(`불러오기 실패 · ${shortError(error)}`);return false}finally{busy=false}
}

async function submitFeedback({category,message,allowReply=false}={}){
  if(!user)throw Object.assign(new Error("Google 로그인이 필요합니다."),{code:"feedback/login-required"});
  const cleanMessage=String(message||"").trim();
  if(!cleanMessage)throw Object.assign(new Error("피드백 내용을 입력해 주세요."),{code:"feedback/empty"});
  const feedbackId=`${user.uid}_${Date.now()}_${crypto.randomUUID?.()||Math.random().toString(36).slice(2)}`;
  await setDoc(doc(db,"feedback",feedbackId),{
    uid:user.uid,
    category:String(category||"기타").slice(0,40),
    message:cleanMessage.slice(0,3000),
    replyEmail:allowReply?(user.email||""):"",
    page:location.href.slice(0,500),
    userAgent:navigator.userAgent.slice(0,500),
    status:"new",
    createdAt:serverTimestamp()
  });
  return true;
}

if(ready){
  try{
    const app=initializeApp(cfg);auth=getAuth(app);db=getFirestore(app);storage=getStorage(app);
    await setPersistence(auth,browserLocalPersistence);
    try{await getRedirectResult(auth)}catch(error){console.warn(error)}
    onAuthStateChanged(auth,async next=>{
      user=next;
      if(!user){publishEntitlements(null);publishGuideState(localGuideKeys())}
      status(user?`${accountName()} · ${cfg.projectId} 연결됨 · 저장 시 동기화`:"Google 로그인 안 됨");
      if(user){
        try{await registerSignedInUser()}
        catch(error){console.error(error);status(`${accountName()} · 사용자 등록 실패 · ${shortError(error)}`)}
        const loadKey=`drawer-village-auto-load-${user.uid}`;
        if(!autoLoadStarted&&Date.now()-sessionStamp(loadKey)>=REFRESH_GUARD_MS){
          autoLoadStarted=true;
          const loaded=await download({automatic:true});
          if(loaded!==false)stampSession(loadKey);
        }
      }
    });
  }catch(error){status(`로그인 초기화 실패 · ${shortError(error)}`)}
}else status("Firebase 설정 필요");

try{storageUsage={...storageUsage,...JSON.parse(localStorage.getItem("drawer-village-storage-usage")||"{}"),maxBytes:FREE_TOTAL_BYTES,maxCount:MAX_PHOTOS,unlimited:false}}catch{}
window.ParallelCityAuth={
  login,upload,download,submitFeedback,markGuideSeen,resetGuides,
  logout:async()=>user&&signOut(auth),
  getIdToken:async()=>user?user.getIdToken():null,
  getInfo:()=>({ready,user,busy,entitlements,storageUsage,guideState})
};
