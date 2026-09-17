import {FURNITURE_PROPS,furniturePropIcon,furniturePropLabel,supportsFurnitureProps} from './furniture-layout.js';
const htmlEsc=(value="")=>String(value).replace(/[&<>"']/g,character=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[character]));
export function showFurnitureProps(homeId,roomKey,placementId,{state,addFurnitureProp,deleteFurnitureProp,onClose}){
  const placement=state.homes[homeId]?.rooms?.[roomKey]?.furniturePlacements?.find(item=>item.id===placementId);if(!placement||!supportsFurnitureProps(placement.item))return;
  const copy={
    ko:{eyebrow:"선반 위 꾸미기",title:"소품 올리기",available:"올릴 소품",attached:"현재 올려둔 소품",empty:"아직 올려둔 소품이 없어요.",remove:"치우기",close:"완료",limit:"선반 소품은 4개까지 올려요."},
    en:{eyebrow:"Decorate the surface",title:"Add props",available:"Available props",attached:"Placed props",empty:"No props placed yet.",remove:"Remove",close:"Done",limit:"Place up to four shelf decorations."},
    ja:{eyebrow:"棚の上を飾る",title:"小物を置く",available:"置ける小物",attached:"置いている小物",empty:"小物はまだありません。",remove:"片付ける",close:"完了",limit:"棚の小物は4個まで置けます。"}
  }[state.uiLanguage]||null;
  const dialog=document.createElement("dialog");dialog.className="furniture-props-dialog";
  const draw=()=>{
    const current=state.homes[homeId]?.rooms?.[roomKey]?.furniturePlacements?.find(item=>item.id===placementId),props=current?.props||[],full=props.length>=4;
    dialog.innerHTML=`<form method="dialog"><div class="title"><div><small>${copy.eyebrow}</small><h2>${copy.title}</h2></div><button value="close" aria-label="${copy.close}">×</button></div><p>${copy.limit}</p><section><h3>${copy.available}</h3><div class="furniture-prop-picker">${FURNITURE_PROPS.map(item=>`<button type="button" data-add-furniture-prop="${item}" ${full?"disabled":""}><span aria-hidden="true">${furniturePropIcon(item)}</span><b>${htmlEsc(furniturePropLabel(item,state.uiLanguage))}</b></button>`).join("")}</div></section><section><h3>${copy.attached}</h3><div class="furniture-prop-current">${props.length?props.map(prop=>`<button type="button" data-delete-furniture-prop="${htmlEsc(prop.id)}"><span aria-hidden="true">${furniturePropIcon(prop.item)}</span><b>${htmlEsc(furniturePropLabel(prop.item,state.uiLanguage))}</b><small>${copy.remove}</small></button>`).join(""):`<p>${copy.empty}</p>`}</div></section><button class="primary furniture-props-done" value="close">${copy.close}</button></form>`;
    dialog.querySelectorAll("[data-add-furniture-prop]").forEach(button=>button.onclick=()=>{if(addFurnitureProp(homeId,roomKey,placementId,button.dataset.addFurnitureProp))draw()});
    dialog.querySelectorAll("[data-delete-furniture-prop]").forEach(button=>button.onclick=()=>{if(deleteFurnitureProp(homeId,roomKey,placementId,button.dataset.deleteFurnitureProp))draw()});
  };
  draw();dialog.onclose=()=>{dialog.remove();onClose({homeId,roomKey,placementId})};document.body.append(dialog);dialog.showModal();
}
