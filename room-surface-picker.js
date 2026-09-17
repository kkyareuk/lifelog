import {HOME_SURFACE_KEYS,HOME_WALL_KEYS,homeSurfaceImage,wallSurfaceImage,homeSurfaceLabel} from './home-surfaces.js?v=20260909dev305';
export function bindRoomSurfacePicker(select,{room,language='ko',floor=()=>room.floorMaterial,onCustom}){
 const wall=select.name==='wallMaterial',t=(ko,en,ja)=>({ko,en,ja}[language]||ko),label=select.closest('label');
 const button=document.createElement('button');button.type='button';button.className='room-surface-picker-open';button.dataset.roomSurfacePicker=select.name;button.textContent=wall?t('벽지 고르기','Choose wallpaper','壁紙を選ぶ'):t('바닥재 고르기','Choose flooring','床材を選ぶ');
 select.hidden=true;label.replaceChildren(select,button);
 button.onclick=()=>{
  const d=document.createElement('dialog');d.className='room-surface-picker';const header=document.createElement('header'),title=document.createElement('h2'),close=document.createElement('button');title.textContent=button.textContent;close.type='button';close.textContent=t('닫기','Close','閉じる');close.onclick=()=>d.close();header.append(title,close);d.append(header);
  const grid=document.createElement('div');grid.className='room-surface-choices';const keys=wall?HOME_WALL_KEYS:[...HOME_SURFACE_KEYS,...(room.floorImage?['customTile','custom']:[])];
  for(const key of keys){const b=document.createElement('button'),img=document.createElement('img'),text=document.createElement('span');b.type='button';b.dataset.surfaceValue=key;b.setAttribute('aria-pressed',String(select.value===key));img.src=wall?wallSurfaceImage(key,floor(),room.floorImage,room.type):homeSurfaceImage(key,room.floorImage,room.type);img.alt='';text.textContent=homeSurfaceLabel(key,language);b.append(img,text);b.onclick=()=>{if(!select.isConnected)return d.close();select.value=key;select.dispatchEvent(new Event('change',{bubbles:true}));d.close()};grid.append(b)}
  d.append(grid);if(!wall&&onCustom){const custom=document.createElement('button');custom.type='button';custom.textContent=t('바닥 이미지 첨부','Add floor image','床の画像を追加');custom.onclick=()=>{d.close();onCustom()};d.append(custom)}
  d.onclose=()=>{d.remove();if(button.isConnected)button.focus({preventScroll:true})};document.body.append(d);d.showModal();
 };
 return button;
}
