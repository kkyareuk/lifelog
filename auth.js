import {initializeApp} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {getAuth,GoogleAuthProvider,setPersistence,browserLocalPersistence,onAuthStateChanged,signInWithPopup,signInWithRedirect,getRedirectResult,signOut} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {getFirestore,doc,getDoc,setDoc,serverTimestamp} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import {getStorage,ref,uploadBytes,getDownloadURL} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";

const cfg=window.PARALLEL_CITY_FIREBASE||{};
const ready=Boolean(cfg.apiKey&&cfg.projectId&&cfg.authDomain);
const status=text=>window.ParallelCity?.setAccountStatus(text);
const clone=value=>JSON.parse(JSON.stringify(value));
const isData=value=>typeof value==="string"&&value.startsWith("data:");
let auth,db,storage,user,busy=false;
const uploadedCache=new Map();

function shortError(error){
  const code=String(error?.code||"unknown").replace(/^firebase\//,"");
  if(code.includes("permission-denied")||code.includes("unauthorized"))return "저장 권한 확인 필요";
  if(code.includes("bucket-not-found")||code.includes("object-not-found"))return "사진 저장소 확인 필요";
  if(code.includes("quota"))return "저장 용량 초과";
  if(code.includes("network"))return "인터넷 연결 확인";
  return code;
}
const cloudDoc=()=>doc(db,"users",user.uid);

async function uploadDataUrl(dataUrl,path){
  if(uploadedCache.has(dataUrl))return uploadedCache.get(dataUrl);
  const blob=await (await fetch(dataUrl)).blob();
  if(blob.size>9*1024*1024)throw Object.assign(new Error("image-too-large"),{code:"storage/image-too-large"});
  const target=ref(storage,`users/${user.uid}/media/${path}.webp`);
  await uploadBytes(target,blob,{contentType:blob.type||"image/webp",cacheControl:"public,max-age=31536000"});
  const url=await getDownloadURL(target);
  uploadedCache.set(dataUrl,url);
  return url;
}

async function prepareState(local){
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
    jobs[i].node[jobs[i].key]=await uploadDataUrl(jobs[i].value,jobs[i].path);
  }
  return next;
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
  if(!user){if(!silent)alert("설정에서 Google 계정에 먼저 로그인해 주세요.");return false}
  if(busy)return false;busy=true;
  try{
    status(`${user.displayName||"계정"} · 올리는 중`);
    const gameState=await prepareState(window.ParallelCity.getState());
    await setDoc(cloudDoc(),{gameState,updatedAt:serverTimestamp(),profile:{name:user.displayName||"",email:user.email||""}},{merge:true});
    status(`${user.displayName||"계정"} · ${reason||"계정 저장"} 완료`);
    if(!silent)alert("현재 기기의 데이터를 계정에 저장했어요.");
    return true;
  }catch(error){
    console.error(error);status(`저장 실패 · ${shortError(error)}`);
    if(!silent)alert(`동기화 실패: ${shortError(error)}`);
    return false;
  }finally{busy=false}
}

async function download(){
  if(!user){alert("설정에서 Google 계정에 먼저 로그인해 주세요.");return}
  if(busy)return;busy=true;
  try{
    status(`${user.displayName||"계정"} · 불러오는 중`);
    const snapshot=await getDoc(cloudDoc());
    const remote=snapshot.exists()?snapshot.data().gameState:null;
    if(!remote){status(`${user.displayName||"계정"} · 저장 데이터 없음`);alert("이 계정에 저장된 데이터가 아직 없어요.");return}
    if(!confirm("이 기기의 현재 데이터를 계정에 저장된 데이터로 바꿀까요?"))return;
    window.ParallelCity.replaceState(clone(remote));
    window.dispatchEvent(new Event("parallel-city-cloud-loaded"));
    status(`${user.displayName||"계정"} · 불러오기 완료`);
  }catch(error){console.error(error);status(`불러오기 실패 · ${shortError(error)}`);alert(`불러오기 실패: ${shortError(error)}`)}finally{busy=false}
}

if(ready){
  try{
    const app=initializeApp(cfg);auth=getAuth(app);db=getFirestore(app);storage=getStorage(app);
    await setPersistence(auth,browserLocalPersistence);
    try{await getRedirectResult(auth)}catch(error){console.warn(error)}
    onAuthStateChanged(auth,next=>{user=next;status(user?`${user.displayName||"Google 계정"} · 수동 동기화 준비됨`:"Google 로그인 안 됨")});
  }catch(error){status(`로그인 초기화 실패 · ${shortError(error)}`)}
}else status("Firebase 설정 필요");

window.ParallelCityAuth={login,upload,download,logout:async()=>user&&signOut(auth),getInfo:()=>({ready,user,busy})};
