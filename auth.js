import {initializeApp} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {getAuth,GoogleAuthProvider,setPersistence,browserLocalPersistence,onAuthStateChanged,signInWithPopup,signInWithRedirect,getRedirectResult,signOut} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {getFirestore,doc,getDoc,setDoc,serverTimestamp} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import {getStorage,ref,uploadBytes,getDownloadURL} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";

const cfg=window.PARALLEL_CITY_FIREBASE||{};
const ready=Boolean(cfg.apiKey&&cfg.projectId&&cfg.authDomain);
let auth,db,storage,user,uploadTimer,applying=false,lastCloudState=null,lastMediaIssue="";
const status=text=>window.ParallelCity?.setAccountStatus(text);
const clone=value=>JSON.parse(JSON.stringify(value));
const isData=value=>typeof value==="string"&&value.startsWith("data:");
const isRemote=value=>typeof value==="string"&&/^https?:\/\//.test(value);

if(ready){
  const app=initializeApp(cfg);
  auth=getAuth(app);db=getFirestore(app);storage=getStorage(app);
  await setPersistence(auth,browserLocalPersistence);
  try{await getRedirectResult(auth)}catch(error){console.warn("redirect",error)}
  onAuthStateChanged(auth,async next=>{
    user=next;
    if(!user){lastCloudState=null;status("Google 로그인");return}
    status(`${user.displayName||"계정"} · 동기화 중`);
    try{
      const snap=await getDoc(doc(db,"users",user.uid));
      const local=window.ParallelCity.getState();
      const cloud=snap.exists()?snap.data().gameState:null;
      lastCloudState=cloud?clone(cloud):null;
      if(cloud&&(cloud.lastSaved||0)>(local.lastSaved||0)){
        applying=true;window.ParallelCity.replaceState(cloud);applying=false;
        window.dispatchEvent(new Event("parallel-city-cloud-loaded"));
      }else await upload();
      if(!lastMediaIssue)status(`${user.displayName||"계정"} · 저장됨`);
    }catch(error){
      console.error("cloud load",error);
      status(`동기화 실패 · ${shortError(error)}`);
    }
  });
  window.addEventListener("parallel-city-saved",()=>{
    if(!user||applying)return;
    clearTimeout(uploadTimer);uploadTimer=setTimeout(upload,1400);
  });
}else status("로그인 설정 필요");

function shortError(error){
  const code=String(error?.code||"unknown").replace(/^firebase\//,"");
  if(code.includes("unauthorized"))return "저장소 권한";
  if(code.includes("bucket-not-found"))return "저장소 없음";
  if(code.includes("quota"))return "저장 용량";
  if(code.includes("permission-denied"))return "DB 권한";
  return code;
}

async function uploadMedia(dataUrl,path){
  const blob=await (await fetch(dataUrl)).blob();
  if(blob.size>9*1024*1024)throw Object.assign(new Error("image-too-large"),{code:"storage/image-too-large"});
  const mediaRef=ref(storage,`users/${user.uid}/media/${path}`);
  await uploadBytes(mediaRef,blob,{contentType:blob.type||"image/webp",cacheControl:"public,max-age=31536000"});
  return getDownloadURL(mediaRef);
}

function mediaJobs(cloud,previous){
  const jobs=[];
  const walk=(node,oldNode,path=[])=>{
    if(!node||typeof node!=="object")return;
    Object.keys(node).forEach(key=>{
      const value=node[key],oldValue=oldNode?.[key],nextPath=[...path,key];
      if(isData(value)){
        const safe=nextPath.join("-").replace(/[^a-zA-Z0-9가-힣_-]/g,"_").slice(0,180);
        jobs.push({node,key,value,oldValue,path:`${safe}.webp`});
      }else if(value&&typeof value==="object")walk(value,oldValue,nextPath);
    });
  };
  walk(cloud,previous,["game"]);
  return jobs;
}

async function cloudReadyState(local){
  const cloud=clone(local),jobs=mediaJobs(cloud,lastCloudState),failed=[],uploaded=[];
  for(let index=0;index<jobs.length;index+=3){
    await Promise.all(jobs.slice(index,index+3).map(async job=>{
      try{
        job.node[job.key]=await uploadMedia(job.value,job.path);
        uploaded.push(job.path);
      }catch(error){
        console.error("media upload",job.path,error);
        job.node[job.key]=isRemote(job.oldValue)?job.oldValue:"";
        failed.push(shortError(error));
      }
    }));
  }
  return {cloud,failed:[...new Set(failed)],uploaded};
}

async function upload(){
  if(!user)return;
  status(`${user.displayName||"계정"} · 동기화 중`);
  try{
    const local=window.ParallelCity.getState();
    const {cloud,failed}=await cloudReadyState(local);
    await setDoc(doc(db,"users",user.uid),{
      gameState:cloud,updatedAt:serverTimestamp(),
      profile:{name:user.displayName||"",email:user.email||""}
    },{merge:true});
    lastCloudState=clone(cloud);
    lastMediaIssue=failed.join(", ");
    if(!failed.length&&JSON.stringify(cloud)!==JSON.stringify(local)){
      applying=true;window.ParallelCity.replaceState(cloud);applying=false;
    }
    status(failed.length
      ?`설정 저장됨 · 사진 저장소 ${failed.join("/")}`
      :`${user.displayName||"계정"} · 저장됨`);
  }catch(error){
    console.error("cloud save",error);
    status(`동기화 실패 · ${shortError(error)}`);
  }
}

window.ParallelCityAuth={
  async toggle(){
    if(!ready){alert("Firebase 연결 설정을 확인해 주세요.");return}
    if(user&&lastMediaIssue){
      lastMediaIssue="";
      await upload();
      return;
    }
    if(user){await signOut(auth);return}
    const provider=new GoogleAuthProvider();
    provider.setCustomParameters({prompt:"select_account"});
    try{await signInWithPopup(auth,provider)}
    catch(error){
      if(["auth/popup-blocked","auth/operation-not-supported-in-this-environment","auth/cancelled-popup-request"].includes(error.code))await signInWithRedirect(auth,provider);
      else alert(`로그인 실패: ${error.message||error.code}`);
    }
  },
  retry:upload,
  getMediaIssue:()=>lastMediaIssue
};
