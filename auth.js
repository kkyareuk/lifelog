import {initializeApp} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {getAuth,GoogleAuthProvider,setPersistence,browserLocalPersistence,onAuthStateChanged,signInWithPopup,signInWithRedirect,getRedirectResult,signOut} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {getFirestore,doc,getDoc,setDoc,serverTimestamp} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const cfg=window.PARALLEL_CITY_FIREBASE||{};
const ready=Boolean(cfg.apiKey&&cfg.projectId&&cfg.authDomain);
let auth,db,user,uploadTimer,applying=false;
const status=t=>window.ParallelCity?.setAccountStatus(t);

if(ready){
  const firebaseApp=initializeApp(cfg);
  auth=getAuth(firebaseApp);
  db=getFirestore(firebaseApp);
  await setPersistence(auth,browserLocalPersistence);
  try{await getRedirectResult(auth)}catch(e){console.warn(e)}
  onAuthStateChanged(auth,async next=>{
    user=next;
    if(!user){status("Google 로그인");return}
    status(`${user.displayName||"계정"} · 동기화 중`);
    try{
      const ref=doc(db,"users",user.uid);
      const snap=await getDoc(ref);
      const local=window.ParallelCity.getState();
      const cloud=snap.exists()?snap.data().gameState:null;
      if(cloud&&(cloud.lastSaved||0)>(local.lastSaved||0)){
        applying=true;
        window.ParallelCity.replaceState(cloud);
        applying=false;
      }else{
        await upload();
      }
      status(`${user.displayName||"계정"} · 저장됨`);
    }catch(e){
      console.error(e);
      status("동기화 확인 필요");
    }
  });
  window.addEventListener("parallel-city-saved",()=>{
    if(!user||applying)return;
    clearTimeout(uploadTimer);
    uploadTimer=setTimeout(upload,900);
  });
}else status("로그인 설정 필요");

async function upload(){
  if(!user)return;
  status("동기화 중");
  try{
    await setDoc(doc(db,"users",user.uid),{
      gameState:window.ParallelCity.getState(),
      updatedAt:serverTimestamp(),
      profile:{name:user.displayName||"",email:user.email||""}
    },{merge:true});
    status(`${user.displayName||"계정"} · 저장됨`);
  }catch(e){
    console.error(e);
    status("동기화 실패");
  }
}

window.ParallelCityAuth={
  async toggle(){
    if(!ready){alert("Firebase 연결 설정을 확인해 주세요.");return}
    if(user){await signOut(auth);return}
    const provider=new GoogleAuthProvider();
    try{await signInWithPopup(auth,provider)}
    catch(e){
      if(["auth/popup-blocked","auth/operation-not-supported-in-this-environment","auth/cancelled-popup-request"].includes(e.code)){
        await signInWithRedirect(auth,provider);
      }else alert(`로그인 실패: ${e.message||e.code}`);
    }
  }
};
