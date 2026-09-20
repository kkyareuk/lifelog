export function sharedImageSession(){
 const api=window.DrawerVillageGroups,groupId=api?.getSnapshot?.()?.activeGroupId,uid=window.ParallelCityAuth?.getInfo?.()?.user?.uid;
 const assertCurrent=()=>{if(!uid||!groupId||window.ParallelCityAuth?.getInfo?.()?.user?.uid!==uid||api.getSnapshot()?.activeGroupId!==groupId)throw Error('image-target-changed')};
 return {assertCurrent,upload:async data=>{assertCurrent();const blob=await(await fetch(data)).blob();assertCurrent();const url=await api.uploadHomeMemberImage(blob);assertCurrent();return url}};
}

export function addSharedRoomPhotos(dialog,{room,prepareImage,apply,language='ko',toast}){
 const text=(ko,en,ja)=>({ko,en,ja}[language]||ko),session=sharedImageSession();
 for(const [field,type,label] of [['image','room',text('방 사진 추가·변경','Add or change room photo','部屋写真を追加・変更')],['floorImage','roomScene',text('방 전체 그림 추가·변경','Add or change full-room art','部屋全体の絵を追加・変更')]]){
  const wrap=document.createElement('label'),input=document.createElement('input');wrap.textContent=label;input.type='file';input.accept='image/*';input.setAttribute('aria-label',label);input.dataset.sharedRoomPhoto=field;wrap.append(input);dialog.append(wrap);
  input.onchange=async()=>{const file=input.files?.[0];if(!file)return;input.disabled=true;
   try{const data=await prepareImage(file,type);if(!data)return;session.assertCurrent();if(!dialog.isConnected)return;const url=await session.upload(data);if(!dialog.isConnected)return;
    await apply(field==='image'?{image:url,usePhoto:true}:{floorImage:url,floorMaterial:'custom',usePhoto:true});
    toast(text('사진을 저장했어요.','Photo saved.','写真を保存しました。'));
   }catch(error){console.error(error);toast(error.message==='image-target-changed'?text('계정이나 마을이 바뀌어 사진 저장을 중단했어요.','Photo saving stopped because the account or village changed.','アカウントまたは村が変わったため写真の保存を中断しました。'):text('사진을 저장하지 못했어요. 다시 시도해 주세요.','Could not save the photo. Please try again.','写真を保存できませんでした。もう一度お試しください。'));}
   finally{input.disabled=false;input.value=''}
  };
 }
}
