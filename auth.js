import {initializeApp} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {getAuth,GoogleAuthProvider,setPersistence,browserLocalPersistence,onAuthStateChanged,signInWithPopup,signInWithRedirect,getRedirectResult,signOut} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {getFirestore,doc,getDoc,setDoc,serverTimestamp} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
const cfg=window.PARALLEL_CITY_FIREBASE||{},ready=cfg.apiKey&&cfg.projectId&&cfg.authDomain;
let auth,db,user=null,timer=null,applying=false;
const status=t=>window.ParallelCity?.setAccountStatus(t);
if(ready){
  const app=initializeApp(cfg);auth=getAuth(app);db=getFirestore(app);
  await setPersistence(auth,browserLocalPersistence);
  try{await getRedirectResult(auth)}catch{}
  onAuthStateChanged(auth,async u=>{
    user=u;if(!u){status("Google 로그인");return} status(`${u.displayName||"계정"} · 불러오는 중`);
    try{const snap=await getDoc(doc(db,"users",u.uid));if(snap.exists()&&snap.data().gameState){applying=true;window.ParallelCity.replaceState(snap.data().gameState);applying=false}else await upload()}catch{status("기기 저장됨 · 동기화 확인 필요")}
  });
  window.addEventListener("parallel-city-saved",()=>{if(user&&!applying){clearTimeout(timer);timer=setTimeout(upload,1200)}});
}else status("로그인 설정 필요");
async function upload(){if(!user)return;status("동기화 중");try{await setDoc(doc(db,"users",user.uid),{gameState:window.ParallelCity.getState(),updatedAt:serverTimestamp(),profile:{name:user.displayName||"",email:user.email||""}},{merge:true});status(`${user.displayName||"계정"} · 저장됨`)}catch{status("기기 저장됨 · 동기화 실패")}}
window.ParallelCityAuth={async toggle(){if(!ready){alert("config.js에 Firebase 웹 앱 설정을 입력해 주세요.");return}if(user){await signOut(auth);return}const p=new GoogleAuthProvider();try{await signInWithPopup(auth,p)}catch(e){if(/popup|operation-not-supported|cancelled-popup/.test(e.code||""))await signInWithRedirect(auth,p);else alert("로그인 실패: "+(e.message||e.code))}}};
