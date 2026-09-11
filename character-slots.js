export function slotText(world,info,usage=info?.slotUsage){
 const lang=world.uiLanguage||'ko',p=info?.entitlements||info?.purchases||{};
 const total=(info?.appleSandbox?undefined:usage?.characterLimit)??(5+(Number(p.characterSlotPacks)||0)*5+(Number(p.characterSingleSlots)||0));
 const shared=!!window.DrawerVillageGroups?.getSnapshot?.()?.activeGroupId;
 const used=(shared?(usage?.personalCharacters??0):(world.order||[]).length)+(usage?.characters||0),remaining=Math.max(0,total-used);
 return {used,remaining,total,text:({ko:`사용한 슬롯 ${used} / 남은 슬롯 ${remaining}`,en:`Slots used ${used} / remaining ${remaining}`,ja:`使用済み ${used}枠 / 残り ${remaining}枠`})[lang]};
}
export function showSlotCreator(world,create){
 const dialog=document.createElement('dialog');dialog.className='directory-create-dialog';const form=document.createElement('form');form.method='dialog';
 const title=document.createElement('h2'),count=document.createElement('p'),yes=document.createElement('button'),no=document.createElement('button');const lang=world.uiLanguage||'ko';
 title.textContent=({ko:'새 캐릭터',en:'New character',ja:'新しいキャラクター'})[lang];yes.textContent=({ko:'만들기',en:'Create',ja:'作成'})[lang];no.textContent=({ko:'닫기',en:'Close',ja:'閉じる'})[lang];yes.value='create';no.value='close';
 const update=usage=>{const v=slotText(world,window.ParallelCityAuth?.getInfo?.(),usage);count.textContent=v.text;yes.disabled=v.remaining<=0};update();
 form.append(title,count,no,yes);dialog.append(form);document.body.append(dialog);dialog.onclose=()=>{if(dialog.returnValue==='create')create();dialog.remove()};dialog.showModal();
 window.DrawerVillageGroups?.refreshSlotUsage?.().then(v=>{if(dialog.isConnected)update(v)}).catch(()=>{});
}
