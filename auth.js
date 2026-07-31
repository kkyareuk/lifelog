import {initializeApp} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {getAuth,GoogleAuthProvider,setPersistence,browserLocalPersistence,onAuthStateChanged,signInWithPopup,signInWithRedirect,getRedirectResult,signOut} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {getFirestore,doc,getDoc,setDoc,serverTimestamp,onSnapshot} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import {getStorage,ref,uploadBytes,getDownloadURL} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";

const cfg=window.PARALLEL_CITY_FIREBASE||{};
const ready=Boolean(cfg.apiKey&&cfg.projectId&&cfg.authDomain);
let auth,db,storage,user,uploadTimer,unsubscribeCloud;
let applying=false,uploadRunning=false,uploadQueued=false,lastCloudState=null,lastMediaIssue="";
const status=text=>window.ParallelCity?.setAccountStatus(text);
const clone=value=>JSON.parse(JSON.stringify(value));
const isData=value=>typeof value==="string"&&value.startsWith("data:");
const isRemote=value=>typeof value==="string"&&/^https?:\/\//.test(value);
const clock=()=>new Date().toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
const localState=()=>window.ParallelCity.getState();
const cloudDoc=()=>doc(db,"users",user.uid);

if(ready){
  const app=initializeApp(cfg);
  auth=getAuth(app);db=getFirestore(app);storage=getStorage(app);
  await setPersistence(auth,browserLocalPersistence);
  try{await getRedirectResult(auth)}catch(error){console.warn("redirect",error)}
  onAuthStateChanged(auth,connectAccount);
  window.addEventListener("parallel-city-saved",()=>{
    if(!user||applying)return;
    clearTimeout(uploadTimer);
    status(`${user.displayName||"계정"} · 저장 대기 중`);
    uploadTimer=setTimeout(queueUpload,900);
  });
}else status("로그인 설정 필요");

async function connectAccount(next){
  unsubscribeCloud?.();unsubscribeCloud=null;user=next;
  if(!user){lastCloudState=null;status("Google 로그인");return}
  status(`${user.displayName||"계정"} · 데이터 불러오는 중`);
  try{
    const snap=await getDoc(cloudDoc()),local=localState();
    const cloud=snap.exists()?snap.data().gameState:null;
    lastCloudState=cloud?clone(cloud):null;
    if(cloud&&((cloud.lastSaved||0)>(local.lastSaved||0)||!local.order?.length)){
      applyCloud(cloud,"계정 데이터 불러옴");
    }else if(local.order?.length){
      await queueUpload();
    }else status(`${user.displayName||"계정"} · 동기화 완료`);
    unsubscribeCloud=onSnapshot(cloudDoc(),{includeMetadataChanges:true},snapshot=>{
      if(!snapshot.exists()||snapshot.metadata.hasPendingWrites||applying)return;
      const remote=snapshot.data().gameState,current=localState();
      if(remote&&(remote.lastSaved||0)>(current.lastSaved||0)){
        lastCloudState=clone(remote);
        applyCloud(remote,"다른 기기 변경 반영");
      }
    },error=>status(`실시간 동기화 중단 · ${shortError(error)}`));
  }catch(error){
    console.error("cloud load",error);
    status(`동기화 실패 · ${shortError(error)}`);
  }
}

function applyCloud(cloud,message){
  applying=true;
  window.ParallelCity.replaceState(clone(cloud));
  applying=false;
  window.dispatchEvent(new Event("parallel-city-cloud-loaded"));
  status(`${clock()} · ${message}`);
}

function shortError(error){
  const code=String(error?.code||"unknown").replace(/^firebase\//,"");
  if(code.includes("unauthorized")||code.includes("permission-denied"))return "권한 확인 필요";
  if(code.includes("bucket-not-found"))return "Firebase Storage 생성 필요";
  if(code.includes("object-not-found"))return "사진 파일 없음";
  if(code.includes("quota"))return "저장 용량 초과";
  if(code.includes("network"))return "인터넷 연결 확인";
  if(code.includes("image-too-large"))return "사진이 너무 큼";
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
  const cloud=clone(local),jobs=mediaJobs(cloud,lastCloudState),failed=[];
  let done=0;
  for(let index=0;index<jobs.length;index+=2){
    await Promise.all(jobs.slice(index,index+2).map(async job=>{
      try{job.node[job.key]=await uploadMedia(job.value,job.path)}
      catch(error){
        console.error("media upload",job.path,error);
        job.node[job.key]=isRemote(job.oldValue)?job.oldValue:"";
        failed.push(shortError(error));
      }finally{
        done++;
        status(`${user.displayName||"계정"} · 사진 ${done}/${jobs.length} 저장 중`);
      }
    }));
  }
  return {cloud,failed:[...new Set(failed)]};
}

async function queueUpload(){
  if(!user)return;
  if(uploadRunning){uploadQueued=true;return}
  uploadRunning=true;
  try{
    do{uploadQueued=false;await performUpload()}while(uploadQueued&&user);
  }finally{uploadRunning=false}
}

async function performUpload(){
  if(!user)return;
  status(`${user.displayName||"계정"} · 설정 동기화 중`);
  try{
    const local=clone(localState()),savedAt=local.lastSaved||0;
    const {cloud,failed}=await cloudReadyState(local);
    await setDoc(cloudDoc(),{
      gameState:cloud,updatedAt:serverTimestamp(),
      profile:{name:user.displayName||"",email:user.email||""}
    },{merge:true});
    lastCloudState=clone(cloud);
    lastMediaIssue=failed.join(", ");
    const current=localState();
    if(!failed.length&&(current.lastSaved||0)===savedAt&&JSON.stringify(cloud)!==JSON.stringify(current)){
      applying=true;window.ParallelCity.replaceState(cloud);applying=false;
    }else if((current.lastSaved||0)>savedAt)uploadQueued=true;
    status(failed.length?`설정 완료 · 사진 실패(${failed.join("/")}) · 눌러서 재시도`:`${clock()} · 동기화 완료`);
  }catch(error){
    console.error("cloud save",error);
    status(`동기화 실패 · ${shortError(error)} · 눌러서 재시도`);
    lastMediaIssue=shortError(error);
  }
}

window.ParallelCityAuth={
  async toggle(){
    if(!ready){alert("Firebase 연결 설정을 확인해 주세요.");return}
    if(user&&lastMediaIssue){lastMediaIssue="";await queueUpload();return}
    if(user){await signOut(auth);return}
    const provider=new GoogleAuthProvider();
    provider.setCustomParameters({prompt:"select_account"});
    try{await signInWithPopup(auth,provider)}
    catch(error){
      if(["auth/popup-blocked","auth/operation-not-supported-in-this-environment","auth/cancelled-popup-request"].includes(error.code))await signInWithRedirect(auth,provider);
      else alert(`로그인 실패: ${error.message||error.code}`);
    }
  },
  retry:queueUpload,
  getMediaIssue:()=>lastMediaIssue
};
