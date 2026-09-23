import {personalState,save} from './state.js?v=20260909dev305';
import {FURNITURE_CATALOG,furnitureImage,furnitureLabel} from './furniture-layout.js?v=20260909dev305';
export async function prepareFurniturePhoto(file){
 if(!file?.type?.startsWith('image/')||file.size>12*1024*1024)throw Error('image');
 const url=URL.createObjectURL(file);
 try{const img=new Image();img.src=url;await img.decode();const scale=Math.min(1,640/Math.max(img.naturalWidth,img.naturalHeight)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);return {image:canvas.toDataURL('image/webp',.88),imageWidth:canvas.width,imageHeight:canvas.height};}finally{URL.revokeObjectURL(url)}
}
export function furniturePhotoLibrary(world){
 const personal=personalState(),all=[...(personal.furniturePhotos||[])];
 for(const source of [personal,world])for(const home of Object.values(source?.homes||{}))for(const room of Object.values(home.rooms||{}))all.push(...(room.furniturePlacements||[]));
 const seen=new Set();return all.filter(p=>p&&furnitureImage(p.image)&&!seen.has(p.item+'|'+p.image)&&(seen.add(p.item+'|'+p.image),true));
}
export function openFurniturePhotos({world,placement=null,apply,upload,assertCurrent=()=>{}}){
 const lang=world.uiLanguage||'ko',t=(ko,en,ja)=>({ko,en,ja}[lang]||ko),owner=personalState(),account=window.ParallelCityAuth?.getInfo?.()?.user?.uid||'';
 const guard=()=>{assertCurrent();if(personalState()!==owner||(window.ParallelCityAuth?.getInfo?.()?.user?.uid||'')!==account)throw Error('changed')};
 const d=document.createElement('dialog');d.className='furniture-photo-dialog';
 const heading=document.createElement('h2');heading.textContent=t('가구 사진','Furniture photos','家具の写真');d.append(heading);
 const help=document.createElement('p');help.textContent=t('사진은 한 장으로 표시해요. 저장한 사진은 다른 방과 마을에서도 다시 사용할 수 있어요.','Photos are shown as a single flat image. Reuse saved photos in other rooms and villages.','写真は1枚で表示します。保存した写真は別の部屋や村でも使えます。');d.append(help);
 const select=document.createElement('select');select.setAttribute('aria-label',t('가구 종류','Furniture type','家具の種類'));for(const item of [...new Set(Object.values(FURNITURE_CATALOG).flat())]){const o=document.createElement('option');o.value=item;o.textContent=furnitureLabel(item,lang);select.append(o)}select.value=placement?.item||'소파';select.disabled=!!placement;d.append(select);
 const input=document.createElement('input');input.type='file';input.accept='image/*';input.setAttribute('aria-label',t('새 가구 사진 추가','Add furniture photo','家具写真を追加'));d.append(input);
 const status=document.createElement('p');status.setAttribute('role','status');d.append(status);
 const grid=document.createElement('div');grid.className='furniture-photo-grid';d.append(grid);let busy=false;
 const finish=async photo=>{if(busy)return;busy=true;d.querySelectorAll('button,input,select').forEach(el=>el.disabled=true);status.textContent=t('사진을 저장하고 있어요…','Saving photo…','写真を保存しています…');try{guard();let patch={image:photo.image,imageWidth:photo.imageWidth,imageHeight:photo.imageHeight};if(upload&&patch.image&&!/^https:\/\//.test(patch.image))patch.image=await upload(patch.image);guard();if(!d.isConnected)return;await apply({...patch,item:placement?.item||photo.item});guard();if(patch.image){owner.furniturePhotos??=[];if(!owner.furniturePhotos.some(p=>p.image===patch.image&&p.item===(placement?.item||photo.item)))owner.furniturePhotos.push({...patch,item:placement?.item||photo.item});save(true)}d.close()}catch(e){console.error(e);status.textContent=t('사진을 저장하지 못했어요. 연결 상태를 확인하고 다시 시도해 주세요.','Could not save the photo. Check your connection and try again.','写真を保存できませんでした。接続を確認して再試行してください。')}finally{busy=false;d.querySelectorAll('button,input,select').forEach(el=>el.disabled=false);select.disabled=!!placement}};
 const draw=()=>{grid.replaceChildren();for(const entry of furniturePhotoLibrary(world).filter(p=>p.item===select.value)){const b=document.createElement('button');b.type='button';const img=document.createElement('img');img.src=entry.image;img.alt=furnitureLabel(entry.item,lang);b.append(img);b.onclick=()=>finish(entry);grid.append(b)}};select.onchange=draw;draw();
 input.onchange=async()=>{const file=input.files?.[0];if(!file||busy)return;try{const photo=await prepareFurniturePhoto(file);await finish({...photo,item:select.value})}catch{status.textContent=t('12MB 이하의 이미지 파일을 골라 주세요.','Choose an image up to 12 MB.','12MB以下の画像を選んでください。')}finally{input.value=''}};
 if(placement?.image){const reset=document.createElement('button');reset.textContent=t('기본 가구 그림으로','Use default artwork','元の家具画像に戻す');reset.onclick=()=>finish({image:'',item:placement.item});d.append(reset)}
 const close=document.createElement('button');close.textContent=t('닫기','Close','閉じる');close.onclick=()=>d.close();d.append(close);d.addEventListener('cancel',e=>{if(busy)e.preventDefault()});d.onclose=()=>d.remove();document.body.append(d);d.showModal();return d;
}
