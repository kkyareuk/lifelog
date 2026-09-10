import {accountStorage} from './account-storage.js?v=20260909dev305';
import {ungzip} from './vendor/pako.esm.mjs';
import {purgeLocalImageRefs} from './local-media.js?v=20260909dev305';
const imageKey=/(image|photo|icon|avatar|thumbnail|watermark|portrait|texture|illustration|background|floor|exterior)/i;
export function stripPersonalImages(value,key=''){
 if(typeof value==='string'){
  if(/^(data:image\/|local-media:\/\/|blob:)/.test(value)||imageKey.test(key)&&/^https?:\/\//.test(value))return '';
  if(key==='profileJson'){try{return JSON.stringify(stripPersonalImages(JSON.parse(value)))}catch{}}
  return value;
 }
 if(Array.isArray(value))return value.map(v=>stripPersonalImages(v,key));
 if(!value||typeof value!=='object')return value;
 return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,stripPersonalImages(v,k)]));
}
const decode=raw=>raw?.startsWith('drawer-gzip-v1:')?ungzip(Uint8Array.from(atob(raw.slice('drawer-gzip-v1:'.length)),c=>c.charCodeAt(0)),{to:'string'}):raw;
export async function clearAccountImages(epoch){
 await window.DrawerVillageLocalMedia?.ready;
 const uid=accountStorage.scope,storage=window.localStorage,prefix=uid==='guest'?'':`drawer-account:${encodeURIComponent(uid)}:`,preserve=[],removed=[];
 const keys=Array.from({length:storage.length},(_,i)=>storage.key(i));
 for(const key of keys){if(!key)continue;let parsed;try{parsed=JSON.parse(decode(storage.getItem(key)))}catch{continue}
  const mine=prefix?key.startsWith(prefix):!key.startsWith('drawer-account:');
  if(!mine){preserve.push(parsed);continue}
  if(!key.includes('drawer')&&!key.includes('parallel-city'))continue;
  const clean=stripPersonalImages(parsed);if(JSON.stringify(clean)!==JSON.stringify(parsed)){removed.push(parsed);accountStorage.setItem(prefix?key.slice(prefix.length):key,JSON.stringify(clean))}
 }
 const current=window.ParallelCity?.getState?.();if(current){removed.push(current);window.ParallelCity.replaceState(stripPersonalImages(current),{preserveImages:false})}
 await purgeLocalImageRefs(removed,preserve);
 accountStorage.setItem('drawer-images-cleared-epoch',epoch);
}

export function installImageDeletion(){
 const words={ko:{title:'내 이미지 전체 삭제',intro:'업로드한 사진, 클라우드 이미지 정보와 이 계정의 기기 사진을 삭제합니다. 캐릭터·관계·우편·구매 내역은 유지됩니다. 삭제한 사진은 복구할 수 없습니다. 다른 기기도 최신 버전으로 업데이트해야 이후 사진 동기화를 사용할 수 있습니다.',check:'복구할 수 없음을 확인했습니다',cancel:'닫기',confirm:'이미지 영구 삭제',loading:'이미지 확인 중…',working:'삭제 중입니다. 완료될 때까지 기다려 주세요.',done:'이미지 삭제가 완료됐어요.',error:'완료하지 못했어요. 연결과 저장 공간을 확인한 뒤 다시 시도해 주세요.',count:'클라우드 이미지 파일'},en:{title:'Delete all my images',intro:'Delete uploaded photos, cloud image references and this account’s device photos. Characters, relationships, mail and purchases stay. Deleted photos cannot be recovered. Update your other devices too before syncing photos again.',check:'I understand this cannot be undone',cancel:'Close',confirm:'Permanently delete images',loading:'Checking images…',working:'Deleting images. Please wait for completion.',done:'Your images have been deleted.',error:'Could not finish. Check your connection and storage, then retry.',count:'Cloud image files'},ja:{title:'自分の画像をすべて削除',intro:'アップロードした写真、クラウドの画像情報とこのアカウントの端末写真を削除します。キャラクター・関係・メール・購入履歴は残ります。削除した写真は復元できません。他の端末も最新版に更新してから写真を同期してください。',check:'元に戻せないことを確認しました',cancel:'閉じる',confirm:'画像を完全に削除',loading:'画像を確認中…',working:'画像を削除しています。完了までお待ちください。',done:'画像の削除が完了しました。',error:'完了できませんでした。接続と空き容量を確認し、再試行してください。',count:'クラウドの画像ファイル'}};
 document.addEventListener('click',async event=>{
  if(!event.target.closest?.('[data-delete-account-images]'))return;
  const w=words[window.ParallelCity?.getState?.()?.uiLanguage]||words.ko,scope=accountStorage.scope;
  const d=document.createElement('dialog');d.className='supporter-dialog image-deletion-dialog';
  const body=document.createElement('div');body.className='supporter-body';d.append(body);
  const add=(tag,text,parent=body)=>{const el=document.createElement(tag);el.textContent=text;parent.append(el);return el};
  add('h2',w.title);add('p',w.intro);const status=add('p',w.loading);status.setAttribute('role','status');
  const label=add('label',''),box=document.createElement('input');box.type='checkbox';label.append(box,document.createTextNode(w.check));
  const actions=add('div','');actions.className='supporter-actions';const close=add('button',w.cancel,actions),remove=add('button',w.confirm,actions);remove.className='danger';remove.disabled=true;
  let ready=false,working=false,requestId=accountStorage.getItem('drawer-image-delete-request')||'';
  box.onchange=()=>remove.disabled=!ready||!box.checked;close.onclick=()=>d.close();d.oncancel=e=>{if(working)e.preventDefault()};d.onclose=()=>d.remove();document.body.append(d);d.showModal();
  try{const result=await window.DrawerVillageAccountImages.request('preview');if(accountStorage.scope!==scope||!d.isConnected)return;requestId=result.requestId||requestId;status.textContent=w.count+': '+result.files;ready=true;box.onchange()}catch{status.textContent=w.error}
  remove.onclick=async()=>{if(working||!box.checked||accountStorage.scope!==scope)return;working=true;remove.disabled=true;close.disabled=true;status.textContent=w.working;
   try{requestId=requestId||crypto.randomUUID();accountStorage.setItem('drawer-image-delete-request',requestId);await window.DrawerVillageAccountImages.request('delete',{confirm:true,requestId});if(accountStorage.scope!==scope)return;accountStorage.removeItem('drawer-image-delete-request');status.textContent=w.done;box.disabled=true;ready=false;}
   catch{status.textContent=w.error}finally{working=false;close.disabled=false;remove.disabled=!ready||!box.checked}
  };
 });
}
