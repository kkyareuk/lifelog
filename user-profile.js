import {runBackgroundAction} from './background-actions.js?v=20260909dev303';
import {state,save} from './state.js?v=20260909dev303';
const copy=()=>({ko:['유저 프로필','어떻게 불러드릴까요?','프로필 사진','저장','나중에','멀티 구성원에게 이 이름과 사진이 표시돼요.','저장 중…'],en:['User profile','What should we call you?','Profile photo','Save','Later','Group members will see this name and photo.','Saving…'],ja:['ユーザープロフィール','何とお呼びしましょうか？','プロフィール写真','保存','あとで','グループのメンバーにこの名前と写真が表示されます。','保存中…']}[["ko","en","ja"].includes(state.uiLanguage)?state.uiLanguage:"ko"]);
let promptedUid='';
export function openUserProfile(){
 if(document.querySelector('[data-user-profile-dialog]'))return;
 const auth=window.ParallelCityAuth,info=auth?.getInfo?.();if(!info?.user){auth?.login?.();return}
 const uid=info.user.uid,c=copy(),d=document.createElement('dialog');d.dataset.userProfileDialog='';d.className='directory-create-dialog';
 const form=document.createElement('form'),title=document.createElement('h2'),hint=document.createElement('p'),nameLabel=document.createElement('label'),name=document.createElement('input'),photoLabel=document.createElement('label'),photo=document.createElement('input'),preview=document.createElement('img'),status=document.createElement('p'),submit=document.createElement('button'),cancel=document.createElement('button');
 title.textContent=c[0];hint.textContent=c[5];nameLabel.textContent=c[1];name.name='name';name.required=true;name.maxLength=20;name.value=state.ownerName||info.user.displayName||'';nameLabel.append(name);
 photoLabel.textContent=c[2];photo.type='file';photo.accept='image/*';photoLabel.append(photo);preview.src=state.ownerPhoto||info.user.photoURL||'assets/home-ui/profile-placeholder.png';preview.style.cssText='width:80px;height:80px;object-fit:cover;border-radius:50%';
 let previewUrl='',croppedPhoto=null;
 photo.onchange=async()=>{const file=photo.files[0];if(!file)return;photo.disabled=true;try{const data=await window.ParallelCity.cropUserProfile(file);if(!data)return;const blob=await(await fetch(data)).blob();croppedPhoto=new File([blob],'profile.webp',{type:blob.type});if(previewUrl)URL.revokeObjectURL(previewUrl);previewUrl=URL.createObjectURL(croppedPhoto);preview.src=previewUrl}catch(error){status.textContent=error.message}finally{photo.disabled=false}};
 submit.type='submit';submit.textContent=c[3];cancel.type='button';cancel.textContent=c[4];cancel.onclick=()=>d.close();
 form.append(title,hint,preview,nameLabel,photoLabel,status,submit,cancel);d.append(form);document.body.append(d);
 form.onsubmit=e=>{e.preventDefault();if(photo.disabled)return;submit.disabled=true;const payload={name:name.value,photo:croppedPhoto};d.close();void runBackgroundAction('profile:'+uid,async()=>{if(auth.getInfo().user?.uid!==uid)throw Error('Account changed');const result=await auth.savePublicProfile(payload);if(auth.getInfo().user?.uid!==uid)return;state.ownerName=result.name;state.ownerPhoto=result.photoURL;state.userProfileConfigured=true;save(true);window.ParallelCity?.mediaChanged?.()})};
 d.onclose=()=>{if(previewUrl)URL.revokeObjectURL(previewUrl);d.remove()};d.showModal();
}
document.addEventListener('click',e=>{if(e.target.closest('[data-user-profile]'))openUserProfile()});
window.addEventListener('drawer-village-auth-busy',()=>{const info=window.ParallelCityAuth?.getInfo?.();if(!info?.user||info.busy||!info.ready||info.profileSetupComplete||promptedUid===info.user.uid)return;promptedUid=info.user.uid;openUserProfile()});
