import {initializeApp} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {getAuth,GoogleAuthProvider,setPersistence,browserLocalPersistence,onAuthStateChanged,signInWithPopup,signInWithRedirect,getRedirectResult,signOut} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {getFirestore,doc,getDoc,setDoc,serverTimestamp} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import {getStorage,ref,uploadBytes,getDownloadURL} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";

const cfg=window.PARALLEL_CITY_FIREBASE||{};
const ready=Boolean(cfg.apiKey&&cfg.projectId&&cfg.authDomain);
let auth,db,storage,user,uploadTimer,applying=false;
const status=text=>window.ParallelCity?.setAccountStatus(text);
const clone=value=>JSON.parse(JSON.stringify(value));

if(ready){
  const app=initializeApp(cfg);
  auth=getAuth(app);
  db=getFirestore(app);
  storage=getStorage(app);
  await setPersistence(auth,browserLocalPersistence);
  try{await getRedirectResult(auth)}catch(error){console.warn("redirect",error)}
  onAuthStateChanged(auth,async next=>{
    user=next;
    if(!user){status("Google 로그인");return}
    status(`${user.displayName||"계정"} · 동기화 중`);
    try{
      const snap=await getDoc(doc(db,"users",user.uid));
      const local=window.ParallelCity.getState();
      const cloud=snap.exists()?snap.data().gameState:null;
      if(cloud&&(cloud.lastSaved||0)>(local.lastSaved||0)){
        applying=true;
        window.ParallelCity.replaceState(cloud);
        applying=false;
        window.dispatchEvent(new Event("parallel-city-cloud-loaded"));
      }else await upload();
      status(`${user.displayName||"계정"} · 저장됨`);
    }catch(error){
      console.error(error);
      status("동기화 확인 필요");
    }
  });
  window.addEventListener("parallel-city-saved",()=>{
    if(!user||applying)return;
    clearTimeout(uploadTimer);
    uploadTimer=setTimeout(upload,1400);
  });
}else status("로그인 설정 필요");

async function uploadMedia(dataUrl,path){
  if(!String(dataUrl||"").startsWith("data:"))return dataUrl;
  const blob=await (await fetch(dataUrl)).blob();
  const mediaRef=ref(storage,`users/${user.uid}/media/${path}`);
  await uploadBytes(mediaRef,blob,{contentType:blob.type,cacheControl:"public,max-age=31536000"});
  return getDownloadURL(mediaRef);
}

async function cloudReadyState(local){
  const cloud=clone(local);
  const jobs=[];
  Object.values(cloud.characters||{}).forEach(c=>{
    if(c.photo?.startsWith("data:"))jobs.push(()=>uploadMedia(c.photo,`characters/${c.id}-photo-${local.lastSaved}.webp`).then(url=>c.photo=url));
    if(c.icon?.startsWith("data:"))jobs.push(()=>uploadMedia(c.icon,`characters/${c.id}-icon-${local.lastSaved}.png`).then(url=>c.icon=url));
  });
  Object.values(cloud.homes||{}).forEach(h=>{
    Object.entries(h.rooms||{}).forEach(([key,room])=>{
      if(room.image?.startsWith("data:"))jobs.push(()=>uploadMedia(room.image,`homes/${h.id}-${key}-${local.lastSaved}.webp`).then(url=>room.image=url));
    });
  });
  for(let index=0;index<jobs.length;index+=3){
    await Promise.all(jobs.slice(index,index+3).map(job=>job()));
  }
  return cloud;
}

async function upload(){
  if(!user)return;
  status("동기화 중");
  try{
    const gameState=await cloudReadyState(window.ParallelCity.getState());
    await setDoc(doc(db,"users",user.uid),{
      gameState,
      updatedAt:serverTimestamp(),
      profile:{name:user.displayName||"",email:user.email||""}
    },{merge:true});
    if(JSON.stringify(gameState)!==JSON.stringify(window.ParallelCity.getState())){
      applying=true;
      window.ParallelCity.replaceState(gameState);
      applying=false;
    }
    status(`${user.displayName||"계정"} · 저장됨`);
  }catch(error){
    console.error(error);
    status(error?.code?.includes("storage")?"사진 저장소 확인 필요":"동기화 실패");
  }
}

window.ParallelCityAuth={
  async toggle(){
    if(!ready){alert("Firebase 연결 설정을 확인해 주세요.");return}
    if(user){await signOut(auth);return}
    const provider=new GoogleAuthProvider();
    provider.setCustomParameters({prompt:"select_account"});
    try{await signInWithPopup(auth,provider)}
    catch(error){
      if(["auth/popup-blocked","auth/operation-not-supported-in-this-environment","auth/cancelled-popup-request"].includes(error.code))await signInWithRedirect(auth,provider);
      else alert(`로그인 실패: ${error.message||error.code}`);
    }
  }
};
