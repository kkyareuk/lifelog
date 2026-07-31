import {initializeApp} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {getAuth,GoogleAuthProvider,setPersistence,browserLocalPersistence,onAuthStateChanged,signInWithPopup,signInWithRedirect,getRedirectResult,signOut} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {getFirestore,doc,getDoc,setDoc,serverTimestamp,onSnapshot} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import {getStorage,ref,uploadBytes,getDownloadURL} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";

const cfg=window.PARALLEL_CITY_FIREBASE||{};
const ready=Boolean(cfg.apiKey&&cfg.projectId&&cfg.authDomain);
const status=text=>window.ParallelCity?.setAccountStatus(text);
const clone=value=>JSON.parse(JSON.stringify(value));
const localState=()=>window.ParallelCity?.getState();
const isData=value=>typeof value==="string"&&value.startsWith("data:");
const isRemote=value=>typeof value==="string"&&/^https?:\/\//.test(value);
const shortTime=()=>new Date().toLocaleTimeString("ko-KR",{hour:"2-digit",minute:"2-digit"});

let auth,db,storage,user,unsubscribeCloud,saveTimer;
let applyingCloud=false;
let uploading=false;
let uploadAgain=false;
let lastCloudState=null;
let mediaIssue="";

function shortError(error){
  const code=String(error?.code||"unknown").replace(/^firebase\//,"");
  if(code.includes("permission-denied")||code.includes("unauthorized"))return "저장 권한 확인 필요";
  if(code.includes("bucket-not-found"))return "Firebase Storage 생성 필요";
  if(code.includes("quota"))return "저장 용량 초과";
  if(code.includes("network"))return "인터넷 연결 확인";
  if(code.includes("image-too-large"))return "사진 용량이 너무 큼";
  return code;
}

function cloudDoc(){
  return doc(db,"users",user.uid);
}

function applyCloud(next,message){
  applyingCloud=true;
  window.ParallelCity.replaceState(clone(next));
  applyingCloud=false;
  window.dispatchEvent(new Event("parallel-city-cloud-loaded"));
  status(`${shortTime()} · ${message}`);
}

async function uploadMedia(dataUrl,path){
  const blob=await (await fetch(dataUrl)).blob();
  if(blob.size>9*1024*1024)throw Object.assign(new Error("image-too-large"),{code:"storage/image-too-large"});
  const target=ref(storage,`users/${user.uid}/media/${path}`);
  await uploadBytes(target,blob,{contentType:blob.type||"image/webp",cacheControl:"public,max-age=31536000"});
  return getDownloadURL(target);
}

function collectMediaJobs(next,previous){
  const jobs=[];
  const walk=(node,oldNode,path=[])=>{
    if(!node||typeof node!=="object")return;
    Object.keys(node).forEach(key=>{
      const value=node[key];
      const nextPath=[...path,key];
      if(isData(value)){
        jobs.push({
          node,key,value,oldValue:oldNode?.[key],
          path:`${nextPath.join("-").replace(/[^a-zA-Z0-9가-힣_-]/g,"_").slice(0,180)}.webp`
        });
      }else if(value&&typeof value==="object")walk(value,oldNode?.[key],nextPath);
    });
  };
  walk(next,previous,["game"]);
  return jobs;
}

async function prepareCloudState(local){
  const next=clone(local);
  const jobs=collectMediaJobs(next,lastCloudState);
  const failed=[];
  let finished=0;
  for(let index=0;index<jobs.length;index+=2){
    await Promise.all(jobs.slice(index,index+2).map(async job=>{
      try{
        job.node[job.key]=await uploadMedia(job.value,job.path);
      }catch(error){
        console.error("media upload",error);
        job.node[job.key]=isRemote(job.oldValue)?job.oldValue:"";
        failed.push(shortError(error));
      }finally{
        finished++;
        status(`${user.displayName||"계정"} · 사진 ${finished}/${jobs.length} 저장 중`);
      }
    }));
  }
  return {next,failed:[...new Set(failed)]};
}

async function performUpload(){
  if(!user)return;
  const local=clone(localState());
  const savedAt=local.lastSaved||0;
  status(`${user.displayName||"계정"} · 동기화 중`);
  const {next,failed}=await prepareCloudState(local);
  await setDoc(cloudDoc(),{
    gameState:next,
    updatedAt:serverTimestamp(),
    profile:{name:user.displayName||"",email:user.email||""}
  },{merge:true});
  lastCloudState=clone(next);
  mediaIssue=failed.join(", ");
  const current=localState();
  if(!failed.length&&(current.lastSaved||0)===savedAt&&JSON.stringify(next)!==JSON.stringify(current)){
    applyingCloud=true;
    window.ParallelCity.replaceState(next);
    applyingCloud=false;
  }else if((current.lastSaved||0)>savedAt){
    uploadAgain=true;
  }
  status(failed.length?`설정 저장됨 · 사진 실패(${failed.join("/")}) · 눌러서 재시도`:`${shortTime()} · 동기화 완료`);
}

async function queueUpload(){
  if(!user)return;
  if(uploading){uploadAgain=true;return}
  uploading=true;
  try{
    do{
      uploadAgain=false;
      try{await performUpload()}
      catch(error){
        console.error("cloud save",error);
        mediaIssue=shortError(error);
        status(`동기화 실패 · ${mediaIssue} · 눌러서 재시도`);
      }
    }while(uploadAgain&&user);
  }finally{
    uploading=false;
  }
}

async function connectAccount(nextUser){
  unsubscribeCloud?.();
  unsubscribeCloud=null;
  user=nextUser;
  if(!user){
    lastCloudState=null;
    status(ready?"Google 로그인":"로그인 설정 필요");
    return;
  }
  status(`${user.displayName||"계정"} · 데이터 불러오는 중`);
  try{
    const snapshot=await getDoc(cloudDoc());
    const local=localState();
    const cloud=snapshot.exists()?snapshot.data().gameState:null;
    lastCloudState=cloud?clone(cloud):null;
    if(cloud&&((cloud.lastSaved||0)>(local.lastSaved||0)||!local.order?.length)){
      applyCloud(cloud,"계정 데이터 불러옴");
    }else if(local.order?.length){
      await queueUpload();
    }else{
      status(`${user.displayName||"계정"} · 동기화 완료`);
    }
    unsubscribeCloud=onSnapshot(cloudDoc(),{includeMetadataChanges:true},snap=>{
      if(!snap.exists()||snap.metadata.hasPendingWrites||applyingCloud)return;
      const remote=snap.data().gameState;
      const current=localState();
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

if(ready){
  try{
    const firebaseApp=initializeApp(cfg);
    auth=getAuth(firebaseApp);
    db=getFirestore(firebaseApp);
    storage=getStorage(firebaseApp);
    await setPersistence(auth,browserLocalPersistence);
    try{await getRedirectResult(auth)}catch(error){console.warn("redirect",error)}
    onAuthStateChanged(auth,connectAccount);
    window.addEventListener("parallel-city-saved",()=>{
      if(!user||applyingCloud)return;
      clearTimeout(saveTimer);
      status(`${user.displayName||"계정"} · 저장 준비 중`);
      saveTimer=setTimeout(queueUpload,900);
    });
  }catch(error){
    console.error("firebase boot",error);
    status(`로그인 초기화 실패 · ${shortError(error)}`);
  }
}else{
  status("로그인 설정 필요");
}

window.ParallelCityAuth={
  async toggle(){
    if(!ready){alert("config.js의 Firebase 웹 앱 설정을 확인해 주세요.");return}
    if(user&&mediaIssue){mediaIssue="";await queueUpload();return}
    if(user){await signOut(auth);return}
    const provider=new GoogleAuthProvider();
    provider.setCustomParameters({prompt:"select_account"});
    try{
      await signInWithPopup(auth,provider);
    }catch(error){
      if(["auth/popup-blocked","auth/operation-not-supported-in-this-environment","auth/cancelled-popup-request"].includes(error.code)){
        await signInWithRedirect(auth,provider);
      }else{
        alert(`로그인 실패: ${error.message||error.code}`);
      }
    }
  },
  retry:queueUpload,
  getMediaIssue:()=>mediaIssue
};
