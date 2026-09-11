const copy={
 ko:{title:'이 방에서의 내 프로필',help:'이름과 사진은 이 멀티방에서만 사용해요. 다른 방과 계정 프로필은 바뀌지 않아요.',name:'이 방에서 사용할 이름',photo:'프로필 사진',remove:'사진 지우기',save:'저장',join:'이 프로필로 참여하기',cancel:'취소',busy:'저장하고 있어요…',error:'저장하지 못했어요. 연결을 확인하고 다시 시도해 주세요.'},
 en:{title:'My profile in this group',help:'This name and photo apply only to this group. Your account and other groups stay the same.',name:'Name in this group',photo:'Profile photo',remove:'Remove photo',save:'Save',join:'Join with this profile',cancel:'Cancel',busy:'Saving…',error:'Could not save. Check your connection and try again.'},
 ja:{title:'このグループでのプロフィール',help:'名前と写真はこのグループだけで使用します。アカウントや他のグループには反映されません。',name:'このグループで使う名前',photo:'プロフィール写真',remove:'写真を削除',save:'保存',join:'このプロフィールで参加',cancel:'キャンセル',busy:'保存中…',error:'保存できませんでした。接続を確認して再試行してください。'}
};
export function openMemberProfile({language='ko',profile={},joining=false,onSave,onComplete=()=>{}}){
 const t=copy[language]||copy.ko,dialog=document.createElement('dialog');
 dialog.className='member-profile-dialog';
 dialog.innerHTML=`<form><h2></h2><p data-help></p><label data-name-label><input name="name" maxlength="20" required autocomplete="nickname"></label><img data-preview alt="" width="96" height="96"><label data-photo-label><input name="photo" type="file" accept="image/*"></label><button type="button" data-remove></button><p role="status"></p><footer><button type="button" data-cancel></button><button type="submit"></button></footer></form>`;
 const form=dialog.querySelector('form'),name=form.elements.name,photo=form.elements.photo,preview=dialog.querySelector('[data-preview]'),status=dialog.querySelector('[role=status]');
 dialog.querySelector('h2').textContent=t.title;dialog.querySelector('[data-help]').textContent=t.help;
 dialog.querySelector('[data-name-label]').prepend(t.name);dialog.querySelector('[data-photo-label]').prepend(t.photo);
 dialog.querySelector('[data-remove]').textContent=t.remove;dialog.querySelector('[data-cancel]').textContent=t.cancel;
 dialog.querySelector('[type=submit]').textContent=joining?t.join:t.save;
 name.value=profile.displayName||profile.name||'';
 let photoURL=profile.photoURL||'',file=null,objectURL='',busy=false;
 const show=()=>{preview.hidden=!photoURL;if(photoURL)preview.src=photoURL;else preview.removeAttribute('src')};show();
 const revoke=()=>{if(objectURL)URL.revokeObjectURL(objectURL);objectURL=''};
 photo.onchange=()=>{file=photo.files[0]||null;if(file){revoke();photoURL=objectURL=URL.createObjectURL(file);show()}};
 dialog.querySelector('[data-remove]').onclick=()=>{file=null;photo.value='';revoke();photoURL='';show()};
 dialog.querySelector('[data-cancel]').onclick=()=>dialog.close();
 dialog.addEventListener('close',()=>{revoke();dialog.remove()},{once:true});
 form.onsubmit=async event=>{event.preventDefault();if(busy||!name.value.trim())return;busy=true;status.textContent=t.busy;
 const values={name:name.value.trim(),photoURL:objectURL?'':photoURL,file};
 // Keep cancellation available even while the request is pending.
 [...form.elements].filter(el=>!el.hasAttribute('data-cancel')).forEach(el=>el.disabled=true);
 try{await onSave(values);if(dialog.isConnected){dialog.close();onComplete()}}
 catch(error){if(dialog.isConnected){status.textContent=t.error;[...form.elements].forEach(el=>el.disabled=false)}}finally{busy=false}
 };
 document.body.append(dialog);dialog.showModal();name.focus();return dialog;
}
