import {initializeApp} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {getAuth,GoogleAuthProvider,setPersistence,browserLocalPersistence,onAuthStateChanged,signInWithPopup,signInWithRedirect,getRedirectResult,signOut} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {getFirestore,doc,getDoc,setDoc,serverTimestamp,arrayUnion} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import {getStorage,ref,uploadBytes,getDownloadURL} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";

const cfg=window.PARALLEL_CITY_FIREBASE||{};
const ready=Boolean(cfg.apiKey&&cfg.projectId&&cfg.authDomain);
const status=text=>window.ParallelCity?.setAccountStatus(text);
const clone=value=>JSON.parse(JSON.stringify(value));
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
  return {gameState:next,mediaManifest:manifest};
}

async function login(){
  if(!ready){alert("config.js의 Firebase 웹 앱 설정을 확인해 주세요.");return}
  const provider=new GoogleAuthProvider();
  provider.setCustomParameters({prompt:"select_account"});
  try{await signInWithPopup(auth,provider)}catch(error){
    if(["auth/popup-blocked","auth/operation-not-supported-in-this-environment","auth/cancelled-popup-request"].includes(error.code))await signInWithRedirect(auth,provider);
    else alert(`로그인 실패: ${error.message||error.code}`);
  }
}

async function upload({silent=false,reason=""}={}){
  if(!user){if(!silent)toast("Google 로그인이 필요합니다");return false}
  if(busy)return false;busy=true;
  try{
    status(`${user.displayName||"계정"} · 올리는 중`);
    const previousSnapshot=await getDoc(cloudDoc()),previous=previousSnapshot.exists()?previousSnapshot.data():null;
    const prepared=await prepareState(window.ParallelCity.getState(),normalizeManifest(previous?.mediaManifest,previous?.gameState));
    const {gameState,mediaManifest}=prepared;
    await setDoc(cloudDoc(),{gameState,mediaManifest,updatedAt:serverTimestamp(),profile:{name:user.displayName||"",email:user.email||""}},{merge:true});
    publishStorageUsage(mediaManifest,gameState);
    status(`${user.displayName||"계정"} · ${reason||"계정 저장"} 완료`);
    const storedPhotos=countStoredPhotos(gameState);
    toast(storedPhotos?`동기화되었습니다 · 고유 사진 ${mediaManifest.items.length+mediaManifest.legacyCount}/${maxPhotos()}장`:"동기화되었습니다 · 새로 올릴 기기 사진 없음");
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
    window.ParallelCity.replaceState(clone(remote));
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
window.ParallelCityAuth={login,upload,download,submitFeedback,markGuideSeen,resetGuides,logout:async()=>user&&signOut(auth),getInfo:()=>({ready,user,busy,entitlements,storageUsage,guideState})};
