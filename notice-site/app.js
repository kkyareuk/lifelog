import {initializeApp} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js';
import {getAuth,GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js';
const auth=getAuth(initializeApp(window.PARALLEL_CITY_FIREBASE)),el=id=>document.getElementById(id),api='https://asia-northeast3-lifelog-98fff.cloudfunctions.net/sharedTownApi/notice-admin/';
let drafts=[],current=null,identity=null,busy=false;
const status=text=>el('status').textContent=text;
const form=()=>({...current,subject:el('subject').value.trim(),body:el('body').value.trim()});
function controls(){const enabled=!!identity&&!busy&&!current?.publishedAt;for(const id of ['subject','body','save','review'])el(id).disabled=!enabled;el('send').disabled=!enabled;}
async function call(action,data={}){const owner=auth.currentUser;if(!owner)throw Error('로그인이 필요해요.');const token=await owner.getIdToken();const response=await fetch(api+action,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify(data)});const value=await response.json();if(auth.currentUser!==owner)throw Error('계정이 변경됐어요.');if(!response.ok)throw Error(value.message||'요청에 실패했어요.');return value;}
function choose(d){current={...d};el('subject').value=d.subject;el('body').value=d.body;status(d.publishedAt?'이미 발송한 공지예요.':'초안을 수정하고 저장한 뒤 내용을 확인해 주세요.');draw();controls();}
function draw(){el('drafts').replaceChildren();for(const d of drafts){const b=document.createElement('button');b.textContent=(d.publishedAt?'✓ ':'')+d.subject;b.className=current?.id===d.id?'selected':'';b.onclick=()=>{if(busy)return;if(current&&!current.publishedAt&&(el('subject').value!==current.subject||el('body').value!==current.body)&&!confirm('저장하지 않은 수정을 버리고 다른 초안을 열까요?'))return;choose(d)};el('drafts').append(b)}}
async function saving(){const value=await call('save',form());current={...current,...value};drafts=drafts.map(d=>d.id===current.id?current:d);draw();status('초안을 저장했어요. 아직 발송하지 않았어요.');}
async function run(fn){if(busy)return;busy=true;controls();try{await fn()}catch(e){status(e.message);el('preview').close()}finally{busy=false;controls()}}
el('login').onclick=()=>signInWithPopup(auth,new GoogleAuthProvider()).catch(e=>status(e.message));el('logout').onclick=()=>signOut(auth);
el('save').onclick=()=>run(saving);
el('review').onclick=()=>run(async()=>{await saving();el('preview-title').textContent=current.subject;el('preview-body').textContent=current.body;el('preview').showModal()});
el('cancel').onclick=()=>el('preview').close();
el('send').onclick=()=>run(async()=>{const result=await call('publish',{...current,confirm:true});if(result.published){current.publishedAt=Date.now();drafts=drafts.map(d=>d.id===current.id?current:d);el('preview').close();draw();status('인게임 공지사항에 발송했어요. 푸시·이메일은 보내지 않았어요.')}});
onAuthStateChanged(auth,async user=>{identity=null;current=null;el('subject').value='';el('body').value='';el('drafts').replaceChildren();el('preview').close();el('account').textContent=user?.email||'';el('login').hidden=!!user;el('logout').hidden=!user;controls();if(!user){status('관리자 계정으로 로그인해 주세요.');return}try{const result=await call('list'),seed=await fetch('drafts.json').then(r=>r.json());if(auth.currentUser!==user)return;identity=user;drafts=[...result.drafts,...seed.filter(d=>!result.drafts.some(x=>x.id===d.id))];if(drafts.length)choose(drafts[0]);else status('준비된 초안이 없어요.');controls()}catch(e){status(e.message)}});
