import {sharedProfile} from './shared-world.js?v=20260908dev280';
import {accountStorage as localStorage} from "./account-storage.js?v=20260908dev280";
import {initializeApp} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {getAuth,GoogleAuthProvider,setPersistence,browserLocalPersistence,onAuthStateChanged,signInWithPopup,signInWithRedirect,getRedirectResult,signInWithCredential,signOut,updateProfile} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {getFirestore,doc,getDoc,getDocFromServer,setDoc,updateDoc,collection,getDocs,getCountFromServer,getDocsFromServer,deleteDoc,deleteField,serverTimestamp,arrayUnion,runTransaction,onSnapshot,writeBatch,query,where} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import {getStorage,ref,uploadBytes,getDownloadURL} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";
import {gzip as gzipBytes,ungzip as ungzipBytes} from "./vendor/pako.esm.mjs";
import {mergeCloudRestoreState,mergeDeviceAndCloudState} from "./sync-merge.js?v=20260908dev280";

const cfg=window.PARALLEL_CITY_FIREBASE||{};
const ready=Boolean(cfg.apiKey&&cfg.projectId&&cfg.authDomain);
let authSettled=!ready;
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
  // Automatic restore (same character IDs) bypasses the full merge. Carry the
  // village/building deletion records through this path as well.
  next.deletedTownIds=[...new Set([...(local?.deletedTownIds||[]),...(next.deletedTownIds||[])].map(String))];
  next.deletedPlaceIds=[...new Set([...(local?.deletedPlaceIds||[]),...(next.deletedPlaceIds||[])].map(String))];
  const mergedTowns=mergeDeviceAndCloudState(local,next);
  next.towns=mergedTowns.towns;next.activeTownId=mergedTowns.activeTownId;next.world=mergedTowns.world;
  const deletedCharacters=new Set([...(local?.deletedCharacterIds||[]),...(next.deletedCharacterIds||[])].map(String));
  const deletedRelationships=new Set([...(local?.deletedRelationshipIds||[]),...(next.deletedRelationshipIds||[])].map(String));
  const deletedRelationshipKeys=new Set([...(local?.deletedRelationshipKeys||[]),...(next.deletedRelationshipKeys||[])].map(normalizeRelationshipTombstoneKey).filter(Boolean));
  const deletedHomes=new Set([...(local?.deletedHomeIds||[]),...(next.deletedHomeIds||[])].map(String));
  const deletedRoutines=new Set([...(local?.deletedRoutineIds||[]),...(next.deletedRoutineIds||[])].map(String));
  const deletedMonthlyRoutines=new Set([...(local?.deletedMonthlyRoutineIds||[]),...(next.deletedMonthlyRoutineIds||[])].map(String));
  next.deletedCharacterIds=[...deletedCharacters];
  next.deletedRelationshipIds=[...deletedRelationships];
  next.deletedRelationshipKeys=[...deletedRelationshipKeys];
  next.deletedHomeIds=[...deletedHomes];
  next.deletedRoutineIds=[...deletedRoutines];
  next.deletedMonthlyRoutineIds=[...deletedMonthlyRoutines];
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
  Object.keys(next.routines||{}).forEach(characterId=>{
    next.routines[characterId]=(Array.isArray(next.routines[characterId])?next.routines[characterId]:[]).filter(item=>!deletedRoutines.has(String(item?.id||"")));
  });
  Object.keys(next.monthlyRoutines||{}).forEach(characterId=>{
    next.monthlyRoutines[characterId]=(Array.isArray(next.monthlyRoutines[characterId])?next.monthlyRoutines[characterId]:[]).filter(item=>!deletedMonthlyRoutines.has(String(item?.id||"")));
  });
  return next;
};
const isData=value=>typeof value==="string"&&value.startsWith("data:");
let auth,db,storage,user,busy=false,loginBusy=false;
const FIRST_LOGIN_GUEST_HANDOFF="drawer-village-first-login-guest-handoff-v1";
let pendingGuestHandoff=null;
const characterCount=value=>Array.isArray(value?.characters)
  ?value.characters.filter(Boolean).length
  :Object.keys(value?.characters||{}).length;
const clearGuestHandoffIntent=()=>{
  pendingGuestHandoff=null;
  try{globalThis.sessionStorage?.removeItem(FIRST_LOGIN_GUEST_HANDOFF)}catch{}
};
const rememberGuestHandoffIntent=()=>{
  const candidate=localStorage.scope==="guest"?window.ParallelCity?.getState?.():null;
  pendingGuestHandoff=characterCount(candidate)>0?clone(candidate):null;
  try{
    if(pendingGuestHandoff)globalThis.sessionStorage?.setItem(FIRST_LOGIN_GUEST_HANDOFF,"1");
    else globalThis.sessionStorage?.removeItem(FIRST_LOGIN_GUEST_HANDOFF);
  }catch{}
};
const takeGuestHandoff=()=>{
  let persisted=false;
  try{persisted=globalThis.sessionStorage?.getItem(FIRST_LOGIN_GUEST_HANDOFF)==="1"}catch{}
  const candidate=pendingGuestHandoff||(persisted&&localStorage.scope==="guest"?window.ParallelCity?.getState?.():null);
  clearGuestHandoffIntent();
  return characterCount(candidate)>0?clone(candidate):null;
};
let profileSetupComplete=false;
const accountPhoto=()=>window.ParallelCity?.getState?.()?.ownerPhoto||user?.photoURL||'';
const accountName=()=>String(
  window.ParallelCity?.getState?.()?.ownerName||
  localStorage.getItem("drawer-village-user-name")||
  user?.displayName||
  "계정"
).trim().slice(0,20)||"계정";
let entitlements={backgroundPacks:[],iconPacks:[],dlcPacks:[],purchases:[],characterSlotPacks:0,townSlotPacks:0,storage50:false,teaSupportMonth:""};
let guideState={loaded:!ready,seen:[]};
let accountEpoch=0,switchingAccount=false,activeSyncDone=Promise.resolve();
const captureSession=()=>({uid:user?.uid,epoch:accountEpoch});
const assertSession=session=>{
  if(!session?.uid||session.uid!==user?.uid||session.epoch!==accountEpoch||localStorage.scope!==session.uid){
    throw Object.assign(new Error("account-changed"),{code:"sync/account-changed"});
  }
};
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
const googleLoginCopy=()=>({
  en:{opening:"Opening the Google account chooser…",cancelled:"Google sign-in was cancelled."},
  ja:{opening:"Googleアカウント選択画面を開いています…",cancelled:"Googleログインをキャンセルしました。"},
  ko:{opening:"Google 계정 선택창을 여는 중이에요…",cancelled:"Google 로그인을 취소했어요."}
}[window.ParallelCity?.getState?.()?.uiLanguage]||{
  opening:"Google 계정 선택창을 여는 중이에요…",cancelled:"Google 로그인을 취소했어요."
});
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
  if(code.includes("backup-storage-full"))return ({en:"Not enough device save space. Your existing save is unchanged. Export a backup before trying again; do not clear app data.",ja:"端末の保存領域が不足しています。既存の記録は変更していません。先にバックアップを書き出してください。アプリのデータは削除しないでください。"}[window.ParallelCity?.getState?.()?.uiLanguage]||"기기 저장 공간 부족 · 기존 기록은 유지했어요. 백업을 내보낸 뒤 다시 시도해 주세요. 앱 데이터는 지우지 마세요.");
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
const cloudDoc=(uid=user?.uid)=>doc(db,"users",uid);
const cloudCoreDoc=(uid=user?.uid)=>doc(db,"users",uid,"sync","core");
const cloudCharacters=(uid=user?.uid)=>collection(db,"users",uid,"characters");
const safeDocumentId=value=>encodeURIComponent(String(value||"unknown")).replaceAll("/","%2F");
const cloudCharacterDoc=(id,uid=user?.uid)=>doc(db,"users",uid,"characters",safeDocumentId(id));
const cloudDays=(id,uid=user?.uid)=>collection(db,"users",uid,"characters",safeDocumentId(id),"days");
const cloudDayDoc=(id,dateKey,uid=user?.uid)=>doc(db,"users",uid,"characters",safeDocumentId(id),"days",safeDocumentId(dateKey));
const SYNC_MANIFEST_VERSION=1;
const syncRevisionKey=uid=>`drawer-village-sync-revision:${uid}`;
const validSyncManifest=value=>Number(value?.version)===SYNC_MANIFEST_VERSION&&value.characters&&typeof value.characters==="object"&&typeof value.coreHash==="string";
const digestState=async value=>digestBlob(new Blob([JSON.stringify(encodeFirestoreState(value))],{type:"application/json"}));
async function createSyncManifest(gameState){
  const next=clone(gameState||{}),characters=next.characters&&typeof next.characters==="object"?next.characters:{};
  delete next.characters;
  const manifest={version:SYNC_MANIFEST_VERSION,coreHash:await digestState(next),characters:{}};
  await Promise.all(Object.entries(characters).map(async([characterId,source])=>{
    const character=clone(source||{}),days=character.days&&typeof character.days==="object"?character.days:{};
    delete character.days;
    const record={characterId:String(characterId),hash:await digestState(character),days:{}};
    await Promise.all(Object.entries(days).map(async([dateKey,day])=>{
      record.days[safeDocumentId(dateKey)]={dateKey:String(dateKey),hash:await digestState(day)};
    }));
    manifest.characters[safeDocumentId(characterId)]=record;
  }));
  return manifest;
}
const stateHasPendingDataImages=value=>{
  let found=false;
  const walk=node=>{
    if(found||!node||typeof node!=="object")return;
    Object.values(node).forEach(item=>{if(isData(item))found=true;else if(item&&typeof item==="object")walk(item)});
  };
  walk(value);return found;
};

async function readCloudGameState(rootData,{fresh=false,uid=user?.uid}={}){
  // 호환 형식으로 저장된 완전한 루트 상태가 있으면, 중간에 끊긴 v2
  // 하위 문서보다 이것을 우선한다.
  if(rootData?.syncFormat===1&&rootData?.gameStateGzip)return decodeCompressedLegacyState(rootData.gameStateGzip);
  if(rootData?.syncFormat===1&&rootData?.gameState)return decodeFirestoreState(rootData.gameState);
  let coreSnapshot;
  const readDocument=fresh?getDocFromServer:getDoc;
  const readDocuments=fresh?getDocsFromServer:getDocs;
  try{coreSnapshot=await readDocument(cloudCoreDoc(uid))}
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
  const characterSnapshots=await readDocuments(cloudCharacters(uid));
  for(const characterSnapshot of characterSnapshots.docs){
    const documentData=characterSnapshot.data()||{};
    const character=decodeFirestoreState(documentData.character||{});
    const characterId=String(documentData.characterId||character.id||characterSnapshot.id);
    const days={};
    const daySnapshots=await readDocuments(cloudDays(characterId,uid));
    daySnapshots.forEach(daySnapshot=>{
      const dayData=daySnapshot.data()||{};
      const dateKey=String(dayData.dateKey||daySnapshot.id);
      days[dateKey]=decodeFirestoreState(dayData.day||{});
    });
    characters[characterId]={...character,id:character.id||characterId,days};
  }
  return {...coreData,characters};
}

async function writeCloudGameState(gameState,session,previousManifest){
  const {uid}=session;assertSession(session);
  const next=clone(gameState||{});
  const characters=next.characters&&typeof next.characters==="object"?next.characters:{};
  delete next.characters;
  const manifest=await createSyncManifest(gameState),canUseManifest=validSyncManifest(previousManifest);
  const wantedCharacterIds=new Set(Object.keys(characters).map(String));
  if(canUseManifest){
    for(const oldRecord of Object.values(previousManifest.characters||{})){
      const existingId=String(oldRecord?.characterId||"");
      if(!existingId||wantedCharacterIds.has(existingId))continue;
      await Promise.all(Object.values(oldRecord.days||{}).map(day=>deleteDoc(cloudDayDoc(existingId,day.dateKey,uid))));
      await deleteDoc(cloudCharacterDoc(existingId,uid));
    }
  }else{
    const existingCharacters=await getDocs(cloudCharacters(uid));
    for(const existing of existingCharacters.docs){
      assertSession(session);
      const existingId=String(existing.data()?.characterId||existing.id);
      if(wantedCharacterIds.has(existingId))continue;
      const oldDays=await getDocs(collection(existing.ref,"days"));
      await Promise.all(oldDays.docs.map(day=>deleteDoc(day.ref)));
      await deleteDoc(existing.ref);
    }
  }

  for(const [characterId,source] of Object.entries(characters)){
    assertSession(session);
    const character=clone(source||{});
    const days=character.days&&typeof character.days==="object"?character.days:{};
    delete character.days;
    const manifestKey=safeDocumentId(characterId),record=manifest.characters[manifestKey],oldRecord=canUseManifest?previousManifest.characters?.[manifestKey]:null;
    if(!oldRecord||oldRecord.hash!==record.hash)await setDoc(cloudCharacterDoc(characterId,uid),{
        characterId:String(characterId),
        character:encodeFirestoreState(character),
        updatedAt:serverTimestamp()
      });
    const wantedDays=new Set(Object.keys(days).map(String));
    if(canUseManifest){
      await Promise.all(Object.values(oldRecord?.days||{}).filter(day=>!wantedDays.has(String(day.dateKey))).map(day=>deleteDoc(cloudDayDoc(characterId,day.dateKey,uid))));
    }else{
      const existingDays=await getDocs(cloudDays(characterId,uid));
      await Promise.all(existingDays.docs.filter(day=>!wantedDays.has(String(day.data()?.dateKey||day.id))).map(day=>deleteDoc(day.ref)));
    }
    await Promise.all(Object.entries(days).filter(([dateKey])=>{
      const key=safeDocumentId(dateKey);
      return !oldRecord?.days?.[key]||oldRecord.days[key].hash!==record.days[key].hash;
    }).map(([dateKey,day])=>setDoc(cloudDayDoc(characterId,dateKey,uid),{
        dateKey:String(dateKey),day:encodeFirestoreState(day),updatedAt:serverTimestamp()
      })));
  }
  // 루트의 syncRevision이 최종 완료 표식이다. core도 달라졌을 때만 쓴다.
  assertSession(session);
  if(!canUseManifest||previousManifest.coreHash!==manifest.coreHash)await setDoc(cloudCoreDoc(uid),{state:encodeFirestoreState(next),updatedAt:serverTimestamp()});
  return manifest;
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
async function writeLegacyCloudGameState(gameState,mediaManifest,session){
  assertSession(session);
  const reference=cloudDoc(session.uid),profile={name:accountName(),email:user.email||""};
  const encoded=encodeFirestoreState(gameState);
  const encodedText=JSON.stringify(encoded);
  const byteLength=new TextEncoder().encode(encodedText).byteLength;
  if(byteLength<=700000){
    await setDoc(reference,{
      gameState:encoded,
      gameStateGzip:deleteField(),
      gameStateCompression:deleteField(),
      syncFormat:1,
      syncManifest:deleteField(),
      syncRevision:deleteField(),
      mediaManifest,
      updatedAt:serverTimestamp(),
      profile
    },{merge:true});
    return;
  }
  const compressed=await encodeCompressedLegacyState(gameState);
  if(!compressed||new TextEncoder().encode(compressed).byteLength>780000)throw Object.assign(new Error("legacy-document-too-large"),{code:"sync/legacy-document-too-large"});
  assertSession(session);
  await setDoc(reference,{
    gameState:deleteField(),
    gameStateGzip:compressed,
    gameStateCompression:"gzip-base64-v1",
    syncFormat:1,
    syncManifest:deleteField(),
    syncRevision:deleteField(),
    mediaManifest,
    updatedAt:serverTimestamp(),
    profile
  },{merge:true});
}
async function registerSignedInUser(){
  if(!user)return;
  const session=captureSession();
  const guardKey=`drawer-village-login-write-${user.uid}`;
  if(Date.now()-sessionStamp(guardKey)<REFRESH_GUARD_MS)return;
  const reference=cloudDoc();
  const snapshot=await getDoc(reference);
  assertSession(session);
  profileSetupComplete=Boolean(snapshot.data()?.profile?.configured);
  const profile={
    name:accountName(),
    email:user.email||"",
    photoURL:accountPhoto(),
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
  assertSession(session);stampSession(guardKey);
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

async function uploadDataUrl(dataUrl,manifest,session){
  assertSession(session);
  const cacheKey=`${session.uid}:${dataUrl}`;
  if(uploadedCache.has(cacheKey))return uploadedCache.get(cacheKey);
  const sourceBlob=await (await fetch(dataUrl)).blob();
  const blob=await optimizeCloudImage(sourceBlob);
  const hash=await digestBlob(blob),known=manifest.items.find(item=>item.hash===hash);
  if(known){assertSession(session);uploadedCache.set(cacheKey,known.url);return known.url}
  if(manifest.items.length+manifest.legacyCount>=maxPhotos())throw Object.assign(new Error("photo-limit"),{code:"storage/photo-limit"});
  const usedBytes=manifest.items.reduce((sum,item)=>sum+(Number(item.size)||0),0);
  if(usedBytes+blob.size>maxTotalBytes())throw Object.assign(new Error("total-size-limit"),{code:"storage/total-size-limit"});
  const ext=blob.type==="image/png"?"png":"webp";
  assertSession(session);
  const target=ref(storage,`users/${session.uid}/media/${hash}.${ext}`);
  await Promise.race([
    uploadBytes(target,blob,{contentType:blob.type||"image/webp",cacheControl:"public,max-age=31536000,immutable"}),
    new Promise((_,reject)=>setTimeout(()=>reject(Object.assign(new Error("storage-timeout"),{code:"storage/timeout"})),30000))
  ]);
  const url=await Promise.race([
    getDownloadURL(target),
    new Promise((_,reject)=>setTimeout(()=>reject(Object.assign(new Error("storage-timeout"),{code:"storage/timeout"})),10000))
  ]);
  assertSession(session);
  manifest.items.push({hash,size:blob.size,url});
  uploadedCache.set(cacheKey,url);
  return url;
}

async function prepareState(local,manifest,previousState,session){
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
    try{assertSession(session);jobs[i].node[jobs[i].key]=await uploadDataUrl(jobs[i].value,manifest,session)}
    catch(error){
      if(error?.code==="sync/account-changed")throw error;
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
  if(window.PARALLEL_CITY_CONFIG?.iosPreview){
    const language=window.DrawerVillageState?.uiLanguage||document.documentElement.lang||"ko";
    alert(language.startsWith("ja")?"iOS版のログインと同期は準備中です。端末内でのプレイは利用できます。":language.startsWith("en")?"Login and sync are not connected in this iOS preview. You can play locally.":"iOS 준비 버전은 로그인·동기화 연결 전이에요. 기기 안에서 플레이할 수 있어요.");
    return false;
  }
  if(!ready){alert("Google 로그인 설정을 불러오지 못했습니다. 앱을 완전히 종료한 뒤 다시 열어 주세요.");return false}
  const copy=googleLoginCopy();
  if(loginBusy){toast(copy.opening);return false}
  loginBusy=true;
  status(copy.opening);
  toast(copy.opening);
  // 첫 캐릭터를 게스트 상태에서 만든 직후 사용자가 직접 로그인한 경우에만
  // 그 기기 저장본을 로그인 계정으로 넘긴다. 앱 시작 시 복원되는 기존 로그인은
  // 이 표식을 만들지 않으므로 공유 기기의 게스트 데이터를 임의로 가져가지 않는다.
  rememberGuestHandoffIntent();
  const provider=new GoogleAuthProvider();
  provider.setCustomParameters({prompt:"select_account"});
  try{
    if(window.Capacitor?.isNativePlatform?.()&&window.Capacitor?.Plugins?.FirebaseAuthentication){
      // Android 17 계열 일부 기기에서는 Credential Manager가 계정창도 띄우지
      // 않은 채 응답하지 않는다. Activity 결과를 돌려주는 검증된 Google 계정
      // 선택창을 직접 사용해 버튼이 무반응 상태에 빠지지 않게 한다.
      const result=await window.Capacitor.Plugins.FirebaseAuthentication.signInWithGoogle({
        skipNativeAuth:true,
        useCredentialManager:false
      });
      const idToken=String(result?.credential?.idToken||"").trim();
      if(!idToken)throw Object.assign(new Error("Google에서 로그인 토큰을 받지 못했습니다."),{code:"native-auth/missing-id-token"});
      const credential=GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth,credential);
      toast("Google 계정이 연결됐어요");
      return true;
    }
    await signInWithPopup(auth,provider);
    return true;
  }catch(error){
    if(!window.Capacitor?.isNativePlatform?.()&&["auth/popup-blocked","auth/operation-not-supported-in-this-environment","auth/cancelled-popup-request"].includes(error?.code)){
      await signInWithRedirect(auth,provider);
      return true;
    }
    const detail=`${error?.code||""} ${error?.message||""}`;
    if(/12501|cancel|canceled|cancelled/i.test(detail)){status("Google 로그인 안 됨");toast(copy.cancelled);clearGuestHandoffIntent();return false}
    const message=/\b10\b|12500|DEVELOPER_ERROR|ApiException: 10/i.test(detail)
      ?"Google 로그인 인증서가 앱 서명과 맞지 않습니다. Firebase에 Google Play 앱 서명 SHA-1을 확인해 주세요."
      :/network|timeout|unavailable/i.test(detail)
        ?"인터넷 연결을 확인한 뒤 Google 로그인을 다시 눌러 주세요."
        :`Google 로그인에 실패했습니다. ${error?.message||error?.code||"잠시 후 다시 시도해 주세요."}`;
    console.error("Google login failed",error);
    status("Google 로그인 실패");
    toast(message);
    alert(message);
    clearGuestHandoffIntent();
    return false;
  }finally{
    loginBusy=false;
    window.dispatchEvent(new Event("drawer-village-auth-busy"));
  }
}

async function upload({silent=false,reason="",accountTransition=false}={}){
  if(switchingAccount&&!accountTransition)return false;
  const session=captureSession();
  await window.DrawerVillageLocalMedia?.ready;
  if(session.epoch!==accountEpoch||session.uid!==user?.uid)return false;
  if(!user){if(!silent)toast("Google 로그인이 필요합니다");return false}
  if(busy){
    const started=Date.now();
    while(busy&&Date.now()-started<30000)await new Promise(resolve=>setTimeout(resolve,80));
    if(busy)return false;
  }
  try{assertSession(session)}catch{return false}
  busy=true;let finishSync;activeSyncDone=new Promise(resolve=>{finishSync=resolve});
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
    const previousSnapshot=await getDoc(cloudDoc(session.uid)),previous=previousSnapshot.exists()?previousSnapshot.data():null;
    // 우리가 마지막으로 내려받거나 올린 revision과 서버 revision이 같고
    // 새 data URL 사진도 없다면 로컬은 서버의 정확한 후속 상태다. 이 경우
    // 수백 개의 과거 날짜 문서를 다시 읽지 않는다.
    const knownRevision=localStorage.getItem(syncRevisionKey(session.uid));
    const canUseDelta=validSyncManifest(previous?.syncManifest)
      &&Boolean(previous?.syncRevision)
      &&String(previous.syncRevision)===String(knownRevision||"")
      &&!stateHasPendingDataImages(localState);
    const previousGameState=canUseDelta?null:await readCloudGameState(previous,{uid:session.uid});
    assertSession(session);
    // 오래된 기기가 전체 상태를 다시 올리더라도 클라우드에 이미 남은 삭제 기록이
    // 캐릭터·관계·집·방보다 우선한다. 이 병합이 없으면 다른 기기의 낡은 배열이
    // 삭제한 관계를 같은 ID 또는 다른 ID로 되살릴 수 있다.
    const tombstoneSafeState=previousGameState
      ?mergeDeviceAndCloudState(localState,previousGameState)
      :localState;
    const prepared=await prepareState(tombstoneSafeState,normalizeManifest(previous?.mediaManifest,previousGameState),previousGameState,session);
    assertSession(session);
    const {gameState,mediaManifest,uploadedCount,photoFailures}=prepared;
    let compatibilityMode=false;
    try{
      const syncManifest=await writeCloudGameState(gameState,session,previous?.syncManifest);
      assertSession(session);
      const syncRevision=`${Date.now()}-${crypto.randomUUID?.()||Math.random().toString(36).slice(2)}`;
      await setDoc(cloudDoc(session.uid),{gameState:deleteField(),syncFormat:2,syncManifest,syncRevision,mediaManifest,updatedAt:serverTimestamp(),profile:{name:accountName(),email:user.email||""}},{merge:true});
      localStorage.setItem(syncRevisionKey(session.uid),syncRevision);
    }catch(error){
      if(!canUseLegacySync(error))throw error;
      await writeLegacyCloudGameState(gameState,mediaManifest,session);
      localStorage.removeItem(syncRevisionKey(session.uid));
      compatibilityMode=true;
    }
    assertSession(session);
    publishStorageUsage(mediaManifest,gameState);
    status(`${accountName()} · ${reason||"계정 저장"} 완료`);
    toast(photoFailures
      ?`정보 동기화 완료 · 사진 ${photoFailures}장은 기존 클라우드 사진을 유지`
      :compatibilityMode?"사진과 정보가 동기화되었습니다 · 호환 저장 사용 중"
        :uploadedCount?`사진과 정보가 동기화되었습니다 · 새 사진 ${uploadedCount}장 저장`
          :"사진과 정보가 동기화되었습니다");
    return true;
  }catch(error){
    if(error?.code==="sync/account-changed")return false;
    console.error(error);status(`저장 실패 · ${shortError(error)}`);
    if(!silent)toast(`동기화 실패 · ${shortError(error)}`);
    return false;
  }finally{busy=false;finishSync();window.dispatchEvent(new Event("drawer-village-auth-busy"))}
}

async function download({automatic=false,accountTransition=false,detailed=false}={}){
  if(switchingAccount&&!accountTransition)return false;
  const session=captureSession();
  if(!user){if(!automatic)toast("Google 로그인이 필요합니다");return}
  if(busy)return false;
  try{assertSession(session)}catch{return false}
  busy=true;let finishSync;activeSyncDone=new Promise(resolve=>{finishSync=resolve});
  try{
    status(`${accountName()} · 불러오는 중`);
    // 사용자가 누른 '불러오기'는 브라우저의 Firestore 로컬 캐시가 아니라
    // 앱이 방금 올린 서버 저장본을 직접 읽는다. 자동 불러오기는 오프라인
    // 복구를 위해 기존 Firestore 동작을 유지한다.
    const snapshot=automatic?await getDoc(cloudDoc(session.uid)):await getDocFromServer(cloudDoc(session.uid));
    assertSession(session);
    const documentData=snapshot.exists()?snapshot.data():null;
    const remoteGuides=Array.isArray(documentData?.uiPreferences?.pageGuides)?documentData.uiPreferences.pageGuides:[];
    const mergedGuides=[...new Set([...remoteGuides,...localGuideKeys()])];
    publishGuideState(mergedGuides);
    if(user&&mergedGuides.length!==remoteGuides.length)await setDoc(cloudDoc(),{uiPreferences:{pageGuides:mergedGuides}},{merge:true});
    const knownRevision=localStorage.getItem(syncRevisionKey(session.uid));
    if(automatic&&documentData?.syncRevision&&knownRevision===String(documentData.syncRevision)&&validSyncManifest(documentData.syncManifest)&&localStorage.getItem("drawer-village-game-v1")&&(window.ParallelCity.getCharacterCount?.()??characterCount(window.ParallelCity.getState()))>0){
      publishStorageUsage(documentData.mediaManifest,null);publishEntitlements(documentData.entitlements);status(`${accountName()} · 동기화 확인 완료`);return detailed?"kept-local":false;
    }
    const remote=await readCloudGameState(documentData,{fresh:!automatic,uid:session.uid});
    assertSession(session);
    publishStorageUsage(documentData?.mediaManifest,remote);
    publishEntitlements(documentData?.entitlements);
    if(!remote){status(`${accountName()} · 저장 데이터 없음`);if(!automatic)toast("저장된 데이터가 없습니다");return detailed?"empty":undefined}
    const remoteCount=characterCount(remote),localCount=(window.ParallelCity.getCharacterCount?.()??characterCount(window.ParallelCity.getState()));
    // 내용 없는 클라우드 문서는 계정 로그인 정보만 만들어졌을 때도 생긴다.
    // 수동 불러오기에서도 이것을 게임 저장본으로 취급하면 기기 캐릭터가
    // 전부 사라져 보이므로, 캐릭터 0명인 저장본은 절대 덮어쓰지 않는다.
    if(remoteCount===0){
      status(`${accountName()} · 기기 데이터 유지`);
      toast(localCount>0?"클라우드에 캐릭터가 없어 기기 데이터를 보호했습니다":"클라우드에 불러올 캐릭터 데이터가 없습니다");
      return detailed?"empty":false;
    }
    const localState=window.ParallelCity.getState();
    const characterIds=value=>new Set(Array.isArray(value?.order)?value.order:Object.keys(value?.characters||{}));
    const localIds=characterIds(localState),remoteIds=characterIds(remote);
    const differentCharacters=localIds.size>0&&remoteIds.size>0&&(localIds.size!==remoteIds.size||[...localIds].some(id=>!remoteIds.has(id)));
    if(automatic&&!differentCharacters&&Number(localState?.lastSaved||0)>Number(remote?.lastSaved||0)){
      status(`${accountName()} · 더 최신인 기기 데이터 유지`);
      toast("기기의 최신 변경사항을 유지했습니다");
      return detailed?"kept-local":false;
    }
    try{
      const raw=localStorage.getItem("drawer-village-game-v1");
      if(raw)localStorage.setItem("drawer-village-recovery-before-cloud",raw);
    }catch(error){console.warn("클라우드 불러오기 전 복구본을 만들지 못했습니다",error)}
    const imported=automatic
      ?differentCharacters?mergeDeviceAndCloudState(localState,remote):applyLocalTombstones(remote,localState)
      :mergeCloudRestoreState(localState,remote);
    window.ParallelCity.replaceState(imported);
    if(documentData?.syncRevision)localStorage.setItem(syncRevisionKey(session.uid),String(documentData.syncRevision));
    else localStorage.removeItem(syncRevisionKey(session.uid));
    window.dispatchEvent(new Event("drawer-village-cloud-loaded"));
    status(`${accountName()} · ${accessLabel()} · 불러오기 완료`);
    toast(differentCharacters
      ?`기기와 클라우드 인물을 합쳐 ${Object.keys(imported.characters||{}).length}명 불러왔습니다`
      :automatic?"자동으로 불러왔습니다":"불러왔습니다");
    return detailed?"loaded":true;
  }catch(error){if(error?.code==="sync/account-changed")return detailed?"cancelled":false;console.error(error);status(`불러오기 실패 · ${shortError(error)}`);if(!automatic)toast(`불러오기 실패 · ${shortError(error)}`);return detailed?"error":false}finally{busy=false;finishSync();window.dispatchEvent(new Event("drawer-village-auth-busy"))}
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

// 그룹 멀티 데이터는 개인 게임 저장본과 분리한다. 그룹에서 주민을
// 내보내거나 집 공개를 취소해도 users/{uid}/sync 및 기기 원본에는 손대지 않는다.
const emptyGroupState=()=>({
  loading:false,error:"",groups:[],activeGroupId:"",group:null,members:[],residents:[],homes:[],catalog:[],relationships:[],characterGroups:[],perceptions:[],incomingProposals:[],outgoingProposals:[],incomingMail:[],outgoingMail:[],schedules:[],
  selectedTownId:"",selectedResidentId:"",visitingHomeId:""
});
const groupContextKey="drawer-village-multiplayer-context-v1";
const readGroupContext=()=>{try{return JSON.parse(localStorage.getItem(groupContextKey)||"{}")||{}}catch{return {}}};
const writeGroupContext=context=>localStorage.setItem(groupContextKey,JSON.stringify({
  groupId:String(context?.groupId||""),townId:String(context?.townId||""),residentId:String(context?.residentId||"")
}));
let groupState=emptyGroupState();
let slotUsage={characters:0,towns:0},slotUsageUid="";
async function refreshSlotUsage(){if(!user)return;const session=captureSession();const value=await sharedTownRequest('readSlotUsage');assertSession(session);slotUsage=value;slotUsageUid=session.uid;return value}
async function createSharedResident(input){
 requireGroupUser();const session=captureSession();if(!await upload({silent:true,reason:'멀티 캐릭터 생성'}))throw Error('Cloud upload failed');assertSession(session);
 const reference=cloudDoc(session.uid),previous=await getDoc(reference),prepared=await prepareState({character:input.profile},structuredClone(normalizeManifest(previous.data()?.mediaManifest,null)),null,session);assertSession(session);if(prepared.photoFailures)throw Error('Photo upload failed');await mergeUploadedMedia(reference,prepared.mediaManifest,session);
 const result=await sharedTownRequest('createResident',{...input,profile:sharedProfile(prepared.gameState.character)});await refreshSlotUsage();return result;
}
let groupUnsubscribers=[];
let accountMailbox={uid:'',at:0,data:{}},mailboxRequest=null;
const groupSnapshot=()=>({...groupState,...(accountMailbox.uid===user?.uid?accountMailbox.data:{})});
async function refreshMailbox(force=false){
 if(!user)return;if(accountMailbox.uid!==user.uid)accountMailbox={uid:user.uid,at:0,data:{}};
 if(mailboxRequest)return mailboxRequest;if(!force&&Date.now()-accountMailbox.at<300000)return;
 const uid=user.uid;mailboxRequest=sharedTownRequest('readMailbox').then(data=>{if(user?.uid===uid){accountMailbox={uid,at:Date.now(),data};emitGroupState()}}).finally(()=>{mailboxRequest=null});return mailboxRequest;
}
let groupEmitTimer=null;
const emitGroupState=()=>{if(groupEmitTimer)return;groupEmitTimer=setTimeout(()=>{groupEmitTimer=null;
  const event=typeof CustomEvent==="function"
    ?new CustomEvent("drawer-village-groups",{detail:groupState})
    :Object.assign(new Event("drawer-village-groups"),{detail:groupState});
  window.dispatchEvent(event);
},50);};
let groupSubscriptionKey="";
const stopGroupSubscriptions=()=>{
  groupSubscriptionKey="";
  groupUnsubscribers.forEach(unsubscribe=>{try{unsubscribe()}catch{}});
  groupUnsubscribers=[];
};
const requireGroupUser=()=>{
  if(!user)throw Object.assign(new Error("Google login required"),{code:"groups/login-required"});
  return user;
};
const cleanGroupName=value=>String(value||"").trim().replace(/\s+/g," ").slice(0,40);
const cleanInviteCode=value=>String(value||"").toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,16);
const inviteDisplay=value=>{
  const code=cleanInviteCode(value);
  return code.length===8?`${code.slice(0,4)}-${code.slice(4)}`:code;
};
const newInviteCode=()=>{
  const alphabet="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes=crypto.getRandomValues(new Uint8Array(8));
  return [...bytes].map(value=>alphabet[value%alphabet.length]).join("");
};
const publicImage=value=>{
  const source=String(value||"").trim();
  return /^https:\/\//i.test(source)?source.slice(0,1500):"";
};
const townSlotCapacity=()=>2+Math.max(0,Number(entitlements?.townSlotPacks)||0);
const ownedMultiplayerTownCount=()=>groupState.groups.filter(group=>group.ownerUid===user?.uid).reduce((n,g)=>n+Math.max(1,g.towns?.length||0),0);
const localTownCount=()=>window.ParallelCity?.getState?.()?.towns?.length||0;
const assertMultiplayerTownSlot=()=>{
  const limit=townSlotCapacity(),used=localTownCount()+Math.max(ownedMultiplayerTownCount(),slotUsage.towns||0);
  if(used>=limit)throw Object.assign(new Error("Town slot required"),{code:"groups/town-slot-required",limit,used});
};
const independentTownPayload=groupId=>({
  id:`multi-town-${groupId}`,name:"새 마을1",illustrationId:"owner-forest",previewImage:"",independent:true,createdAt:Date.now()
});
const activeGroupMember=()=>groupState.members.find(member=>member.uid===user?.uid);
const activeGroupRole=()=>activeGroupMember()?.role||(groupState.group?.ownerUid===user?.uid?"owner":"member");
const isGroupManager=()=>["owner","manager"].includes(activeGroupRole());
const groupRefs=groupId=>({
  group:doc(db,"groups",groupId),members:collection(db,"groups",groupId,"members"),
  residents:collection(db,"groups",groupId,"residents"),homes:collection(db,"groups",groupId,"homes"),relationships:collection(db,"groups",groupId,"relationships"),perceptions:collection(db,"groups",groupId,"perceptions"),proposals:collection(db,"groups",groupId,"proposals"),declarations:collection(db,"groups",groupId,"declarations"),catalog:collection(db,"groups",groupId,"catalog")
});
const groupIndexRef=(uid,groupId)=>doc(db,"users",uid,"groupMemberships",groupId);
let groupDetailActive=false;
const migratingLegacyGroups=new Set();
async function migrateLegacyGroup(group){
  if(!group?.id||group.ownerUid!==user?.uid||Number(group.schemaVersion)>=3&&!group.towns?.some(town=>town?.sourceTownId||town?.ownerUid))return;
  if(migratingLegacyGroups.has(group.id))return;
  migratingLegacyGroups.add(group.id);
  try{
    const existing=group.towns?.[0]||{},town={...independentTownPayload(group.id),id:existing.id||`multi-town-${group.id}`};
    await setDoc(doc(db,"groups",group.id),{hostTownId:"",hostTownName:town.name,towns:[town],schemaVersion:3,updatedAt:serverTimestamp()},{merge:true});
  }catch(error){console.warn("legacy multiplayer town migration failed",error)}
  finally{migratingLegacyGroups.delete(group.id)}
}

function watchActiveGroup(groupId){
  const subscriptionKey=user&&groupId?`${user.uid}:${groupId}`:"";
  if(subscriptionKey&&subscriptionKey===groupSubscriptionKey&&groupUnsubscribers.length&&!groupState.error){emitGroupState();return}
  stopGroupSubscriptions();
  const nextGroupId=String(groupId||""),remembered=readGroupContext(),sameGroup=groupState.activeGroupId===nextGroupId;
  const selectedTownId=sameGroup?groupState.selectedTownId:remembered.groupId===nextGroupId?remembered.townId:"";
  const selectedResidentId=sameGroup?groupState.selectedResidentId:remembered.groupId===nextGroupId?remembered.residentId:"";
  groupState={...groupState,activeGroupId:nextGroupId,group:null,members:[],residents:[],homes:[],catalog:[],relationships:[],characterGroups:[],perceptions:[],incomingProposals:[],outgoingProposals:[],incomingMail:[],outgoingMail:[],schedules:[],selectedTownId,selectedResidentId,visitingHomeId:""};
  writeGroupContext({groupId:nextGroupId,townId:selectedTownId,residentId:selectedResidentId});
  if(!groupId||!user){emitGroupState();return}
  groupSubscriptionKey=subscriptionKey;
  const refs=groupRefs(groupId);
  const listen=(reference,key,mapSnapshot)=>onSnapshot(reference,snapshot=>{
    const value=mapSnapshot
      ?snapshot.docs.map(item=>({id:item.id,...item.data()}))
      :snapshot.exists()?{id:snapshot.id,...snapshot.data()}:null;
    const groups=key==="group"&&value
      ?groupState.groups.map(item=>item.id===value.id?{...item,...value,myRole:item.myRole}:item)
      :['members','residents'].includes(key)?groupState.groups.map(item=>item.id===groupId?{...item,[key==='members'?'memberCount':'residentCount']:value.length}:item):groupState.groups;
    groupState={...groupState,[key]:value,groups,error:"",loading:false};
    if(key==="group"&&!groupState.selectedTownId)groupState.selectedTownId=value?.towns?.[0]?.id||"";
    emitGroupState();
    if(key==="group"&&value)void migrateLegacyGroup(value);
    if(key==="residents"&&value.length){
      const migrationKey=`${user?.uid}:${groupId}`;
      if(value.some(r=>r.ownerUid===user?.uid&&!r.profileJson)&&!migratedSharedProfiles.has(migrationKey)){
        migratedSharedProfiles.add(migrationKey);void refreshSharedResidents().catch(error=>console.warn('Shared profile refresh',error.code));
      }
      if(["observe","town","home"].includes(window.ParallelCity?.getActiveTab?.()||window.ParallelCity?.getState?.()?.activeTab))void advanceSharedLife().catch(error=>console.warn("Shared life",error.code));
    }
  },error=>{
    console.warn(`group ${key} subscription failed`,error);
    groupState={...groupState,error:error?.code||"groups/load-failed",loading:false};emitGroupState();
  });
  // The selected multiplayer context also drives the town and observe screens.
  // Keep its public snapshot live while selected; otherwise leaving the detail
  // page empties the multiplayer roster shown on the home screen.
  groupUnsubscribers=[
    listen(refs.group,"group",false),listen(refs.members,"members",true),
    listen(collection(db,"groups",groupId,"schedules"),"schedules",true),listen(refs.residents,"residents",true),listen(refs.homes,"homes",true),listen(refs.catalog,"catalog",true),listen(refs.relationships,"relationships",true),listen(collection(db,"groups",groupId,"characterGroups"),"characterGroups",true),listen(refs.perceptions,"perceptions",true)
  ];
}

function setGroupDetailActive(active){
  const next=Boolean(active);
  if(groupDetailActive===next)return;
  groupDetailActive=next;
  // Detail visibility does not change the selected group or its subscriptions.
}

async function refreshGroups({preferredId=""}={}){
  if(!ready||!db||!user){stopGroupSubscriptions();groupState=emptyGroupState();emitGroupState();return groupState}
  const session=captureSession();
  groupState={...groupState,loading:true,error:""};emitGroupState();
  try{
    const indexSnapshot=await getDocs(collection(db,"users",session.uid,"groupMemberships"));
    assertSession(session);
    const indexed=indexSnapshot.docs.map(item=>({id:item.id,...item.data()}));
    const groups=(await Promise.all(indexed.map(async membership=>{
      try{
        const snapshot=await getDoc(doc(db,"groups",membership.groupId||membership.id));
        if(!snapshot.exists())return null;
        const result={id:snapshot.id,...snapshot.data(),myRole:membership.role||"member"};
        await Promise.all([['members','memberCount'],['residents','residentCount']].map(async([path,key])=>{try{result[key]=(await getCountFromServer(collection(db,'groups',snapshot.id,path))).data().count}catch(error){console.warn('Group count unavailable',key,error.code)}}));
        return result;
      }catch(error){console.warn("stale group membership",membership.id,error);return null}
    }))).filter(Boolean);
    assertSession(session);
    // A membership refresh must not silently replace the personal town with
    // the first multiplayer space. Only an explicit selection activates one.
    const rememberedId=readGroupContext().groupId;
    const activeId=[preferredId,groupState.activeGroupId,rememberedId].find(id=>groups.some(group=>group.id===id))||"";
    groupState={...groupState,groups,loading:false,error:""};
    watchActiveGroup(activeId);
    if(groups.length)await refreshSlotUsage();else slotUsage={characters:0,towns:0};
    return groupState;
  }catch(error){
    if(error?.code==="sync/account-changed")return groupState;
    console.error("group list failed",error);groupState={...groupState,loading:false,error:error?.code||"groups/load-failed"};emitGroupState();return groupState;
  }
}

async function createGroup({name}={}){
  const account=requireGroupUser(),groupName=cleanGroupName(name);
  if(!groupName)throw Object.assign(new Error("Group name required"),{code:"groups/name-required"});
  assertMultiplayerTownSlot();
  const groupId=crypto.randomUUID?.()||`group_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const town=independentTownPayload(groupId);
  let inviteCode=newInviteCode();
  for(let attempt=0;attempt<4;attempt+=1){
    const exists=await getDoc(doc(db,"groupInvites",inviteCode));
    if(!exists.exists())break;
    inviteCode=newInviteCode();
  }
  const batch=writeBatch(db),createdAt=serverTimestamp();
  batch.set(doc(db,"groups",groupId),{
    name:groupName,ownerUid:account.uid,ownerName:accountName(),inviteCode,createdAt,updatedAt:createdAt,
    rules:{memberCharacterLimit:20,operatorCharacterLimit:100,managerCharacterLimit:100,allowHomeVisits:true},
    hostTownId:"",hostTownName:town.name,towns:[town],schemaVersion:3
  });
  batch.set(doc(db,"groups",groupId,"members",account.uid),{uid:account.uid,displayName:accountName(),photoURL:accountPhoto(),role:"owner",joinedAt:createdAt});
  batch.set(groupIndexRef(account.uid,groupId),{groupId,role:"owner",joinedAt:createdAt});
  batch.set(doc(db,"groupInvites",inviteCode),{groupId,ownerUid:account.uid,active:true,createdAt});
  await batch.commit();
  await refreshGroups({preferredId:groupId});
  return {groupId,inviteCode:inviteDisplay(inviteCode)};
}

async function joinGroup(rawCode){
  const account=requireGroupUser(),inviteCode=cleanInviteCode(rawCode);
  if(inviteCode.length<6)throw Object.assign(new Error("Invalid invite code"),{code:"groups/code-invalid"});
  const invite=await getDoc(doc(db,"groupInvites",inviteCode));
  if(!invite.exists()||invite.data()?.active!==true)throw Object.assign(new Error("Invite not found"),{code:"groups/code-not-found"});
  const groupId=String(invite.data().groupId||"");
  if(!groupId)throw Object.assign(new Error("Invite missing group"),{code:"groups/code-invalid"});
  const batch=writeBatch(db),joinedAt=serverTimestamp();
  batch.set(doc(db,"groups",groupId,"members",account.uid),{uid:account.uid,displayName:accountName(),role:"member",inviteCode,joinedAt},{merge:true});
  batch.set(groupIndexRef(account.uid,groupId),{groupId,role:"member",joinedAt},{merge:true});
  await batch.commit();
  await refreshGroups({preferredId:groupId});
  return groupId;
}

async function updateGroupRules(patch={}){
  requireGroupUser();if(!groupState.group||!isGroupManager())throw Object.assign(new Error("Manager required"),{code:"groups/manager-required"});
  const number=(key,fallback)=>Math.max(1,Math.min(100,Number(patch[key])||fallback));
  const rules={
    ...groupState.group.rules,
    memberCharacterLimit:number("memberCharacterLimit",groupState.group.rules?.memberCharacterLimit||20),
    operatorCharacterLimit:number("operatorCharacterLimit",groupState.group.rules?.operatorCharacterLimit||100),
    managerCharacterLimit:number("managerCharacterLimit",groupState.group.rules?.managerCharacterLimit||100),
    allowRelationshipProposals:patch.allowRelationshipProposals!==false,
    allowScheduleProposals:patch.allowScheduleProposals!==false,
    allowCohabitation:patch.allowCohabitation!==false,
    allowMail:patch.allowMail!==false,
    allowGifts:patch.allowGifts!==false,
    allowHomeVisits:patch.allowHomeVisits!==false
  };
  await setDoc(doc(db,"groups",groupState.activeGroupId),{rules,updatedAt:serverTimestamp()},{merge:true});
}

async function linkGroupTown(townId){
  requireGroupUser();
  throw Object.assign(new Error("Personal towns cannot be linked to multiplayer"),{code:"groups/independent-town-only"});
}

async function mergeUploadedMedia(reference,manifest,session){
  await runTransaction(db,async tx=>{const current=await tx.get(reference);assertSession(session);const latest=normalizeManifest(current.data()?.mediaManifest,null),items=[...new Map([...latest.items,...manifest.items].map(x=>[x.hash,x])).values()];if(items.length+latest.legacyCount>maxPhotos()||items.reduce((sum,item)=>sum+(Number(item.size)||0),0)>maxTotalBytes())throw Object.assign(new Error("storage-limit"),{code:"storage/total-size-limit"});tx.set(reference,{mediaManifest:{...latest,items}},{merge:true})});
}
async function publishCharacterCode(characterId){
  requireGroupUser();await activeSyncDone;const session=captureSession();
  const character=await window.ParallelCity.getCharacterForSharing(characterId);assertSession(session);if(!character)throw Error('Character missing');
  const reference=cloudDoc(session.uid),previous=await getDoc(reference);assertSession(session);
  const manifest=normalizeManifest(previous.data()?.mediaManifest,null),prepared=await prepareState({character},structuredClone(manifest),null,session);
  if(prepared.photoFailures)throw Object.assign(new Error(({ko:'사진을 올리지 못했어요. 사진을 포함하려면 다시 시도해 주세요.',en:'Photo upload failed. Please retry to include every photo.',ja:'写真をアップロードできませんでした。写真を含めるには再試行してください。'})[document.documentElement.lang]||'사진을 올리지 못했어요. 다시 시도해 주세요.'),{code:'groups/photo-upload-failed'});
  await mergeUploadedMedia(reference,prepared.mediaManifest,session);
  assertSession(session);return sharedTownRequest('publishCharacterCode',{character:sharedProfile(prepared.gameState.character)});
}

async function sharedCloudState(){
  const session=captureSession();
  if(!await upload({silent:true,reason:"멀티 공유"}))throw Object.assign(new Error("Cloud upload failed"),{code:"groups/share-upload-failed"});
  assertSession(session);
  const documentSnapshot=await getDoc(cloudDoc(session.uid));
  const cloud=await readCloudGameState(documentSnapshot.data(),{uid:session.uid});
  assertSession(session);return cloud;
}
async function refreshSharedResidents(){
  const account=requireGroupUser(),gid=groupState.activeGroupId;
  if(!gid)return;
  const mine=groupState.residents.filter(r=>r.ownerUid===account.uid);
  if(!mine.length)return;
  const cloud=await sharedCloudState();
  if(groupState.activeGroupId!==gid)return;
  const batch=writeBatch(db);
  for(const r of mine){const c=cloud.characters?.[r.sourceCharacterId];if(!c)continue;
    batch.update(doc(db,'groups',gid,'residents',r.id),{profileJson:JSON.stringify(sharedProfile(c)),scheduleJson:JSON.stringify({routines:cloud.routines?.[c.id]||[],monthlyRoutines:cloud.monthlyRoutines?.[c.id]||[]}),sourceHomeId:c.homeId||'',icon:publicImage(c.icon),photo:publicImage(c.photo),name:c.name,job:c.jobTitle||c.job||'',updatedAt:serverTimestamp()});
  }
  for(const h of groupState.homes.filter(h=>h.ownerUid===account.uid)){const home=cloud.homes?.[h.sourceHomeId];if(home)batch.update(doc(db,'groups',gid,'homes',h.id),{layoutJson:JSON.stringify(sharedProfile(home)),exteriorImage:publicImage(home.exteriorImage||home.image),updatedAt:serverTimestamp()});}
  await batch.commit();await advanceSharedLife(true);
}
const migratedSharedProfiles=new Set();
let advancingShared=false,lastSharedAdvance=new Map();
async function sharedTownRequest(action,body={}){
  requireGroupUser();const gid=groupState.activeGroupId;
  const token=await user.getIdToken();
  const response=await fetch('https://asia-northeast3-lifelog-98fff.cloudfunctions.net/sharedTownApi/'+action,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({groupId:gid,...body})});
  const result=await response.json();if(!response.ok)throw Object.assign(new Error(result.message||'Shared town failed'),{code:result.message||'groups/server-error'});if(['sendMail','respond','propose','requestResidence'].includes(action))await refreshMailbox(true).catch(error=>console.warn('Mailbox refresh',error.code));return result;
}
async function advanceSharedLife(force=false){
  const gid=groupState.activeGroupId;if(!gid||!groupState.group||advancingShared||(!force&&Date.now()-(lastSharedAdvance.get(gid)||0)<60000))return;
  // A different viewer already advanced this world. Keep its authoritative scene.
  if(!force&&groupState.group.lifeUpdatedAt&&(Date.now()-Number(groupState.group.lifeUpdatedAt)<60000||Number(groupState.group.lifeNextAt)>Date.now()))return;
  advancingShared=true;lastSharedAdvance.set(gid,Date.now());
  try{const result=await sharedTownRequest('advance');return result}catch(error){lastSharedAdvance.delete(gid);throw error}finally{advancingShared=false}
}

async function addGroupResident(characterId,townId=""){
  return requestGroupAdmission(characterId,townId);
}
async function requestGroupAdmission(characterId,townId=""){
  requireGroupUser();const gid=groupState.activeGroupId,cloud=await sharedCloudState(),c=cloud.characters?.[characterId];
  if(!c||gid!==groupState.activeGroupId)throw Error('Character or group changed');
  const h=cloud.homes?.[c.homeId],resident={sourceCharacterId:c.id,name:c.name,job:c.jobTitle||c.job||'',townId:townId||groupState.selectedTownId||groupState.group.towns[0].id,sourceHomeId:c.homeId||'',profileJson:JSON.stringify(sharedProfile(c)),scheduleJson:JSON.stringify({routines:cloud.routines?.[c.id]||[],monthlyRoutines:cloud.monthlyRoutines?.[c.id]||[]}),photo:publicImage(c.photo),icon:publicImage(c.icon)};
  return sharedTownRequest('requestResidence',{requestId:crypto.randomUUID(),kind:'admission',resident,...(h?{home:{sourceHomeId:c.homeId,name:h.name,layoutJson:JSON.stringify(sharedProfile(h))}}:{})});
}
async function removeGroupResident(residentId){
  const account=requireGroupUser(),resident=groupState.residents.find(item=>item.id===residentId);
  if(!resident)throw Object.assign(new Error("Resident missing"),{code:"groups/resident-missing"});
  if(resident.ownerUid!==account.uid&&!isGroupManager())throw Object.assign(new Error("Manager required"),{code:"groups/manager-required"});
  // 그룹 주민 문서만 삭제한다. 원본 characterId의 개인 저장 데이터는 건드리지 않는다.
  await deleteDoc(doc(db,"groups",groupState.activeGroupId,"residents",residentId));await refreshSlotUsage();
}

async function publishGroupHome(homeId,townId=""){
  const account=requireGroupUser(),groupId=groupState.activeGroupId,local=await sharedCloudState(),home=local?.homes?.[homeId];
  if(groupId!==groupState.activeGroupId)throw Object.assign(new Error("Group changed"),{code:"groups/context-changed"});
  if(!groupState.group||!home)throw Object.assign(new Error("Home missing"),{code:"groups/home-missing"});
  const sharedHomeId=`${account.uid}_${String(homeId).replace(/[^A-Za-z0-9_-]/g,"_")}`;
  const residents=Object.values(local.characters||{}).filter(character=>character?.homeId===homeId).map(character=>String(character.name||"").slice(0,40)).filter(Boolean).slice(0,30);
  const rooms=Object.values(home.rooms||{}).map(room=>String(room?.name||"").slice(0,30)).filter(Boolean).slice(0,30);
  await setDoc(doc(db,"groups",groupState.activeGroupId,"homes",sharedHomeId),{
    ownerUid:account.uid,ownerName:accountName(),sourceHomeId:homeId,name:String(home.name||"이름 없는 집").slice(0,40),
    kind:String(home.kind||"일반 주거").slice(0,30),townId:townId||groupState.selectedTownId||groupState.group.towns?.[0]?.id||"",
    layoutJson:JSON.stringify(sharedProfile(home)),exteriorImage:publicImage(home.exteriorImage||home.image),residentNames:residents,roomNames:rooms,
    visitPolicy:"members",updatedAt:serverTimestamp(),createdAt:serverTimestamp()
  },{merge:true});
  return sharedHomeId;
}

async function removeGroupHome(homeId){
  const account=requireGroupUser(),home=groupState.homes.find(item=>item.id===homeId);
  if(!home)throw Object.assign(new Error("Home missing"),{code:"groups/home-missing"});
  if(home.ownerUid!==account.uid&&!isGroupManager())throw Object.assign(new Error("Manager required"),{code:"groups/manager-required"});
  await deleteDoc(doc(db,"groups",groupState.activeGroupId,"homes",homeId));
}

async function updateGroupMemberRole(uid,role){
  requireGroupUser();if(!isGroupManager())throw Object.assign(new Error("Manager required"),{code:"groups/manager-required"});
  if(uid===groupState.group?.ownerUid)throw Object.assign(new Error("Owner role fixed"),{code:"groups/owner-fixed"});
  const nextRole=["manager","operator","member"].includes(role)?role:"member";
  // 권한의 단일 기준은 그룹의 member 문서다. 다른 사용자의 개인 색인을
  // 관리자가 수정하게 만들면 계정 경계가 흐려지므로 목록 색인은 건드리지 않는다.
  await setDoc(doc(db,"groups",groupState.activeGroupId,"members",uid),{role:nextRole,updatedAt:serverTimestamp()},{merge:true});
}

async function removeGroupMember(uid){
  requireGroupUser();if(!isGroupManager())throw Object.assign(new Error("Manager required"),{code:"groups/manager-required"});
  if(uid===groupState.group?.ownerUid)throw Object.assign(new Error("Owner cannot be removed"),{code:"groups/owner-fixed"});
  const batch=writeBatch(db);
  groupState.residents.filter(item=>item.ownerUid===uid).forEach(item=>batch.delete(doc(db,"groups",groupState.activeGroupId,"residents",item.id)));
  groupState.homes.filter(item=>item.ownerUid===uid).forEach(item=>batch.delete(doc(db,"groups",groupState.activeGroupId,"homes",item.id)));
  batch.delete(doc(db,"groups",groupState.activeGroupId,"members",uid));
  batch.delete(groupIndexRef(uid,groupState.activeGroupId));
  await batch.commit();
}

async function leaveGroup(){
  const account=requireGroupUser();if(!groupState.activeGroupId)return;
  if(account.uid===groupState.group?.ownerUid)throw Object.assign(new Error("Owner cannot leave"),{code:"groups/owner-cannot-leave"});
  const batch=writeBatch(db);
  groupState.residents.filter(item=>item.ownerUid===account.uid).forEach(item=>batch.delete(doc(db,"groups",groupState.activeGroupId,"residents",item.id)));
  groupState.homes.filter(item=>item.ownerUid===account.uid).forEach(item=>batch.delete(doc(db,"groups",groupState.activeGroupId,"homes",item.id)));
  batch.delete(doc(db,"groups",groupState.activeGroupId,"members",account.uid));
  batch.delete(groupIndexRef(account.uid,groupState.activeGroupId));
  await batch.commit();
  await refreshGroups();
}

window.DrawerVillageGroups={
  getSnapshot:groupSnapshot,refreshMailbox,refresh:refreshGroups,create:createGroup,join:joinGroup,
  publishCatalog:async selected=>{const gid=groupState.activeGroupId,cloud=await sharedCloudState();if(gid!==groupState.activeGroupId)throw Object.assign(new Error('Group changed'),{code:'groups/context-changed'});return sharedTownRequest('publishCatalog',{catalog:Object.fromEntries(Object.entries(selected||{}).map(([kind,items])=>[kind,(sharedProfile(cloud.catalog)?.[kind]||[]).filter(item=>items.some(chosen=>chosen.id===item.id))]))})},
  saveGroupPresentation:input=>sharedTownRequest('saveGroupPresentation',input),
  saveGroupPhoto:async file=>{requireGroupUser();const session=captureSession(),gid=groupState.activeGroupId,reference=cloudDoc(session.uid),previous=await getDoc(reference);assertSession(session);const manifest=normalizeManifest(previous.data()?.mediaManifest,null),data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(file)}),photoURL=await uploadDataUrl(data,manifest,session);await mergeUploadedMedia(reference,manifest,session);assertSession(session);if(gid!==groupState.activeGroupId)throw Error('Group changed');return sharedTownRequest('saveGroupPresentation',{photoURL})},
  createResident:createSharedResident,refreshSlotUsage,readMailTargets:input=>sharedTownRequest('readMailTargets',input),saveMemberGroups:async input=>{const result=await sharedTownRequest('saveMemberGroups',input);window.dispatchEvent(new Event('drawer-village-mail-targets-changed'));return result},publishCharacterCode,readCharacterCode:code=>sharedTownRequest('readCharacterCode',{code}),revokeCharacterCode:code=>sharedTownRequest('revokeCharacterCode',{code}),sendMail:input=>sharedTownRequest('sendMail',{...input,...(input.gift?{positions:window.ParallelCity.getMeetingPositions?.([input.sourceId,input.targetId])}:{})}),requestAdmission:requestGroupAdmission,requestCohabitation:input=>sharedTownRequest('requestResidence',{requestId:crypto.randomUUID(),kind:'cohabitation',...input}),propose:input=>sharedTownRequest('propose',{requestId:crypto.randomUUID(),...input}),respond:input=>sharedTownRequest('respond',input),saveView:input=>sharedTownRequest('saveView',input),registerDevice:input=>sharedTownRequest('registerDevice',input),unregisterDevice:input=>sharedTownRequest('unregisterDevice',input),refreshResidents:refreshSharedResidents,advanceLife:advanceSharedLife,command:command=>sharedTownRequest('advance',{command:{...command,positions:window.ParallelCity.getMeetingPositions?.([command.characterId,command.targetId])}}),saveTownEdit:input=>sharedTownRequest('saveTownEdit',input),saveBuilding:input=>sharedTownRequest('saveBuilding',input),createTown:async({name})=>{if(!await upload({silent:true,reason:"멀티 마을 생성"}))throw Error("Cloud upload failed");assertMultiplayerTownSlot();const result=await sharedTownRequest('saveTown',{create:true,townId:crypto.randomUUID(),patch:{name},revision:Number(groupState.group?.buildingRevision)||0});await refreshSlotUsage();window.DrawerVillageGroups.selectTown(result.town.id);return result;},saveTown:input=>sharedTownRequest('saveTown',input),saveHomeLayout:input=>sharedTownRequest('saveHomeLayout',input),saveHomePlacement:input=>sharedTownRequest('saveHomePlacement',input),saveDecoration:input=>sharedTownRequest('saveDecoration',input),
  setDetailActive:setGroupDetailActive,
  select:groupId=>watchActiveGroup(String(groupId||"")),
  selectTown:townId=>{groupState={...groupState,selectedTownId:String(townId||""),selectedResidentId:""};writeGroupContext({groupId:groupState.activeGroupId,townId:groupState.selectedTownId,residentId:""});emitGroupState()},
  selectResident:residentId=>{groupState={...groupState,selectedResidentId:String(residentId||"")};writeGroupContext({groupId:groupState.activeGroupId,townId:groupState.selectedTownId,residentId:groupState.selectedResidentId});emitGroupState()},
  visitHome:homeId=>{groupState={...groupState,visitingHomeId:String(homeId||"")};emitGroupState()},
  updateRules:updateGroupRules,linkTown:linkGroupTown,addResident:addGroupResident,removeResident:removeGroupResident,
  publishHome:publishGroupHome,removeHome:removeGroupHome,updateMemberRole:updateGroupMemberRole,
  removeMember:removeGroupMember,leave:leaveGroup,inviteDisplay
};

if(ready){
  try{
    const app=initializeApp(cfg);auth=getAuth(app);db=getFirestore(app);storage=getStorage(app);
    await setPersistence(auth,browserLocalPersistence);
    try{await getRedirectResult(auth)}catch(error){console.warn(error)}
    onAuthStateChanged(auth,async next=>{
      const epoch=++accountEpoch;switchingAccount=true;profileSetupComplete=false;user=next;
      try{
        await activeSyncDone;
        if(epoch!==accountEpoch)return;
        const guestHandoff=next?takeGuestHandoff():null;
        window.ParallelCity.switchAccount(next?.uid||null);
        const targetHadSnapshot=Boolean(localStorage.getItem("drawer-village-game-v1"));
        let adoptedGuest=false;
        if(guestHandoff&&!targetHadSnapshot&&(window.ParallelCity.getCharacterCount?.()??characterCount(window.ParallelCity.getState()))===0){
          window.ParallelCity.replaceState(guestHandoff);
          adoptedGuest=true;
        }
        uploadedCache.clear();
        publishEntitlements(null);
        storageUsage={count:0,bytes:0,maxCount:MAX_PHOTOS,maxBytes:FREE_TOTAL_BYTES};
        publishGuideState(localGuideKeys());
        status(user?`Google 계정 연결됨 · ${user.email||accountName()}`:"Google 로그인 안 됨");
        if(user){
          try{await registerSignedInUser()}catch(error){if(epoch!==accountEpoch)return;console.warn(error)}
          if(epoch!==accountEpoch)return;
          // Always load this account, even when it was used minutes ago.
          const downloadOutcome=await download({automatic:true,accountTransition:true,detailed:true});
          if(adoptedGuest&&!['error','cancelled'].includes(downloadOutcome)){
            await upload({silent:true,accountTransition:true});
          }
        }
        await refreshGroups();
      }catch(error){console.error(error);status("계정 데이터를 전환하지 못했습니다 · 다시 로그인해 주세요")}
      finally{if(epoch===accountEpoch){authSettled=true;switchingAccount=false;window.dispatchEvent(new Event("drawer-village-auth-busy"))}}
    });
  }catch(error){authSettled=true;status(`로그인 초기화 실패 · ${shortError(error)}`);window.dispatchEvent(new Event("drawer-village-auth-busy"))}
}else status("Firebase 설정 필요");

try{storageUsage={...storageUsage,...JSON.parse(localStorage.getItem("drawer-village-storage-usage")||"{}"),maxBytes:FREE_TOTAL_BYTES,maxCount:MAX_PHOTOS,unlimited:false}}catch{}
async function savePublicProfile({name,photo}){
 if(!user)throw Error('Google 로그인이 필요해요.');const session=captureSession();name=String(name||'').trim();if(!name||name.length>20)throw Error('이름을 1~20자로 입력해 주세요.');
 let photoURL=accountPhoto();if(photo){if(!photo.type.startsWith('image/')||photo.size>10*1024*1024)throw Error('10MB 이하 이미지를 선택해 주세요.');const blob=await optimizeCloudImage(photo);assertSession(session);const target=ref(storage,'users/'+session.uid+'/profile/avatar');await uploadBytes(target,blob,{contentType:blob.type,cacheControl:'public,max-age=60'});photoURL=await getDownloadURL(target);assertSession(session)}
 await updateProfile(user,{displayName:name,photoURL});assertSession(session);await setDoc(cloudDoc(session.uid),{profile:{name,photoURL,configured:true}},{merge:true});
 for(const group of groupState.groups||[]){const member=doc(db,'groups',group.id,'members',session.uid),existing=await getDoc(member);assertSession(session);if(existing.exists())await updateDoc(member,{displayName:name,photoURL});assertSession(session)}
 profileSetupComplete=true;return {name,photoURL};
}
window.ParallelCityAuth={
  login,upload,download,submitFeedback,savePublicProfile,markGuideSeen,resetGuides,
  logout:async()=>{
    try{await window.DrawerVillageGroupPush?.disable?.()}catch{}
    accountEpoch+=1;switchingAccount=true;
    try{if(user)await signOut(auth)}catch(error){switchingAccount=false;throw error}
    if(window.Capacitor?.isNativePlatform?.()&&window.Capacitor?.Plugins?.FirebaseAuthentication){
      await window.Capacitor.Plugins.FirebaseAuthentication.signOut().catch(()=>{});
    }
  },
  getIdToken:async()=>user?user.getIdToken():null,
  getInfo:()=>({ready:authSettled,user,profileSetupComplete,startupSyncing:switchingAccount,busy:busy||loginBusy||switchingAccount||!authSettled,entitlements,slotUsage:slotUsageUid===user?.uid?slotUsage:{characters:0,towns:0},storageUsage,guideState})
};

setInterval(()=>{if(document.visibilityState!=="hidden"&&["observe","town","home"].includes((window.ParallelCity?.getActiveTab?.()||window.ParallelCity?.getState?.()?.activeTab)))void advanceSharedLife().catch(()=>{})},60000+Math.floor(Math.random()*8000));
