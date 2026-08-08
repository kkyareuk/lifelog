import {initializeApp} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {getAuth,GoogleAuthProvider,setPersistence,browserLocalPersistence,onAuthStateChanged,signInWithPopup,signInWithRedirect,getRedirectResult,signInWithCredential,signOut} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {getFirestore,doc,getDoc,setDoc,serverTimestamp,arrayUnion} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import {getStorage,ref,uploadBytes,getDownloadURL} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";

const cfg=window.PARALLEL_CITY_FIREBASE||{};
const ready=Boolean(cfg.apiKey&&cfg.projectId&&cfg.authDomain);
const status=text=>window.ParallelCity?.setAccountStatus(text);
const clone=value=>JSON.parse(JSON.stringify(value));
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
  if(code.includes("permission-denied")||code.includes("unauthorized"))return "저장 권한 확인 필요";
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
async function registerSignedInUser(){
  if(!user)return;
  const guardKey=`drawer-village-login-write-${user.uid}`;
  if(Date.now()-sessionStamp(guardKey)<REFRESH_GUARD_MS)return;
  const reference=cloudDoc();
  const snapshot=await getDoc(reference);
  const profile={
    name:user.displayName||"",
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
  entitlements.storage50?"사진 50MB":"",
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

async function uploadDataUrl(dataUrl,manifest){
  if(uploadedCache.has(dataUrl))return uploadedCache.get(dataUrl);
  const blob=await (await fetch(dataUrl)).blob();
  if(blob.size>MAX_IMAGE_BYTES)throw Object.assign(new Error("image-too-large"),{code:"storage/image-too-large"});
  const hash=await digestBlob(blob),known=manifest.items.find(item=>item.hash===hash);
  if(known){uploadedCache.set(dataUrl,known.url);return known.url}
  if(manifest.items.length+manifest.legacyCount>=maxPhotos())throw Object.assign(new Error("photo-limit"),{code:"storage/photo-limit"});
  const usedBytes=manifest.items.reduce((sum,item)=>sum+(Number(item.size)||0),0);
  if(usedBytes+blob.size>maxTotalBytes())throw Object.assign(new Error("total-size-limit"),{code:"storage/total-size-limit"});
  const ext=blob.type==="image/png"?"png":"webp";
  const target=ref(storage,`users/${user.uid}/media/${hash}.${ext}`);
  await Promise.race([uploadBytes(target,blob,{contentType:blob.type||"image/webp",cacheControl:"public,max-age=31536000,immutable"}),new Promise((_,reject)=>setTimeout(()=>reject(Object.assign(new Error("storage-timeout"),{code:"storage/timeout"})),25000))]);
  const url=await Promise.race([getDownloadURL(target),new Promise((_,reject)=>setTimeout(()=>reject(Object.assign(new Error("storage-timeout"),{code:"storage/timeout"})),8000))]);
  manifest.items.push({hash,size:blob.size,url});
  uploadedCache.set(dataUrl,url);
  return url;
}

async function prepareState(local,manifest){
  const next=clone(local),jobs=[];
  const walk=(node,path=[])=>{
    if(!node||typeof node!=="object")return;
    Object.keys(node).forEach(key=>{
      const value=node[key],nextPath=[...path,key];
      if(isData(value))jobs.push({node,key,value,path:nextPath.join("-").replace(/[^a-zA-Z0-9가-힣_-]/g,"_").slice(0,170)});
      else if(value&&typeof value==="object")walk(value,nextPath);
    });
  };
  walk(next,["game"]);
  for(let i=0;i<jobs.length;i++){
    status(`${user.displayName||"계정"} · 사진 ${i+1}/${jobs.length} 올리는 중`);
    jobs[i].node[jobs[i].key]=await uploadDataUrl(jobs[i].value,manifest);
  }
  const usedUrls=storedPhotoUrls(next);
  manifest.items=manifest.items.filter(item=>usedUrls.has(item.url));
  manifest.legacyCount=Math.max(0,usedUrls.size-manifest.items.length);
  return {gameState:next,mediaManifest:manifest,uploadedCount:jobs.length};
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
    status(`${user.displayName||"계정"} · 올리는 중`);
    const localState=window.ParallelCity.getState();
    const allowedCharacters=7+(Math.max(0,Number(entitlements.characterSlotPacks)||0)*5);
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
    // 오래된 기기가 전체 상태를 다시 올리더라도 클라우드에 이미 남은 삭제 기록이
    // 캐릭터·관계·집·방보다 우선한다. 이 병합이 없으면 다른 기기의 낡은 배열이
    // 삭제한 관계를 같은 ID 또는 다른 ID로 되살릴 수 있다.
    const tombstoneSafeState=previous?.gameState
      ?applyLocalTombstones(localState,previous.gameState)
      :localState;
    const prepared=await prepareState(tombstoneSafeState,normalizeManifest(previous?.mediaManifest,previous?.gameState));
    const {gameState,mediaManifest,uploadedCount}=prepared;
    await setDoc(cloudDoc(),{gameState,mediaManifest,updatedAt:serverTimestamp(),profile:{name:user.displayName||"",email:user.email||""}},{merge:true});
    publishStorageUsage(mediaManifest,gameState);
    status(`${user.displayName||"계정"} · ${reason||"계정 저장"} 완료`);
    toast(uploadedCount?`동기화되었습니다 · 새 사진 ${uploadedCount}장 저장`:"동기화되었습니다");
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
    status(`${user.displayName||"계정"} · 불러오는 중`);
    const snapshot=await getDoc(cloudDoc());
    const documentData=snapshot.exists()?snapshot.data():null;
    const remoteGuides=Array.isArray(documentData?.uiPreferences?.pageGuides)?documentData.uiPreferences.pageGuides:[];
    const mergedGuides=[...new Set([...remoteGuides,...localGuideKeys()])];
    publishGuideState(mergedGuides);
    if(user&&mergedGuides.length!==remoteGuides.length)await setDoc(cloudDoc(),{uiPreferences:{pageGuides:mergedGuides}},{merge:true});
    publishStorageUsage(documentData?.mediaManifest,documentData?.gameState);
    publishEntitlements(documentData?.entitlements);
    const remote=documentData?.gameState||null;
    if(!remote){status(`${user.displayName||"계정"} · 저장 데이터 없음`);if(!automatic)toast("저장된 데이터가 없습니다");return}
    const countCharacters=value=>Array.isArray(value?.characters)?value.characters.length:Object.keys(value?.characters||{}).length;
    const remoteCount=countCharacters(remote),localCount=countCharacters(window.ParallelCity.getState());
    if(automatic&&remoteCount===0&&localCount>0){
      status(`${user.displayName||"계정"} · 기기 데이터 유지`);
      toast("기기의 캐릭터 데이터를 유지했습니다");
      return;
    }
    const localState=window.ParallelCity.getState();
    const characterIds=value=>new Set(Array.isArray(value?.order)?value.order:Object.keys(value?.characters||{}));
    const localIds=characterIds(localState),remoteIds=characterIds(remote);
    const differentCharacters=localIds.size>0&&remoteIds.size>0&&(localIds.size!==remoteIds.size||[...localIds].some(id=>!remoteIds.has(id)));
    if(differentCharacters){
      if(automatic){
        status(`${user.displayName||"계정"} · 기기와 클라우드 인물 구성이 달라 자동 불러오기 중지`);
        toast("인물 구성이 달라 자동 동기화를 멈췄어요 · 설정에서 어느 데이터를 쓸지 선택해 주세요");
        return false;
      }
      if(!confirm(`현재 기기에는 ${localCount}명, 클라우드에는 ${remoteCount}명이 있어요.\n\n클라우드 데이터로 기기의 마을 전체를 교체할까요?\n취소하면 현재 기기 데이터를 그대로 유지합니다.`)){
        status(`${user.displayName||"계정"} · 기기 데이터 유지`);
        toast("기기의 캐릭터 데이터를 유지했습니다");
        return false;
      }
    }
    if(automatic&&Number(localState?.lastSaved||0)>Number(remote?.lastSaved||0)){
      status(`${user.displayName||"계정"} · 더 최신인 기기 데이터 유지`);
      toast("기기의 최신 변경사항을 유지했습니다");
      return false;
    }
    window.ParallelCity.replaceState(applyLocalTombstones(remote,localState));
    window.dispatchEvent(new Event("drawer-village-cloud-loaded"));
    status(`${user.displayName||"계정"} · ${accessLabel()} · 불러오기 완료`);
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
      status(user?`${user.displayName||"Google 계정"} · ${cfg.projectId} 연결됨 · 저장 시 동기화`:"Google 로그인 안 됨");
      if(user){
        try{await registerSignedInUser()}
        catch(error){console.error(error);status(`${user.displayName||"Google 계정"} · 사용자 등록 실패 · ${shortError(error)}`)}
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
