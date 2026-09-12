import {preserveFurnitureDragSize} from './furniture-drag-size.js';
import {snapFurniturePosition,furnitureGridForRoom,furnitureFootprint} from './furniture-layout.js?v=20260909dev305';
let cleanupActive=null;
export const furnitureArt=el=>el.querySelector('.furniture-sprite,.couple-bed-base,.room-furniture-art')||el;
export function bindFurnitureDrag(root,{getHome,select=()=>{},move,language='ko'}){
 cleanupActive?.();cleanupActive=null;if(!root)return;const controller=new AbortController(),signal=controller.signal;let drag=null,last=null,frame=0;
 const text=(ko,en,ja)=>({ko,en,ja}[language]||ko);let magnet=true;try{magnet=localStorage.getItem('drawer-chair-magnet')!=='off'}catch{}
 const bar=root.querySelector('[data-furniture-edit-toolbar]')||root.querySelector('[data-home-furniture-drawer]');
 const toggle=document.createElement('button');toggle.type='button';toggle.dataset.chairMagnet='';toggle.className='chair-magnet-toggle';const label=()=>{toggle.textContent=text('의자 자동 붙이기','Snap chairs to tables','椅子をテーブルに吸着');toggle.setAttribute('aria-pressed',String(magnet))};label();toggle.onclick=()=>{magnet=!magnet;label();try{localStorage.setItem('drawer-chair-magnet',magnet?'on':'off')}catch{}};(bar?.querySelector('.furniture-edit-heading')||bar)?.prepend(toggle);
 const clearPreview=d=>{d?.ghost?.remove();d?.element.classList.remove('furniture-drag-source');for(const part of d?.parts||[]){part.ghost?.remove();part.element.classList.remove('furniture-drag-source')}};
 const stop=e=>{e.preventDefault();e.stopImmediatePropagation()};
 const paint=()=>{frame=0;if(!drag?.point)return;const d=drag,p=d.point;const target=d.rooms.find(r=>p.x>=r.box.left&&p.x<=r.box.right&&p.y>=r.box.top&&p.y<=r.box.bottom);if(!target)return;
  const box=target.box,x=p.x+d.offsetX,y=p.y+d.offsetY;
  let pos=snapFurniturePosition((x-box.left)/box.width*100,(y-box.top)/box.height*100,furnitureGridForRoom(box,d.canvasBox),furnitureFootprint(d.item.item));pos.tableId='';pos.seatSide='';
  if(magnet&&d.item.item==='의자'){
   const home=getHome(d.element.dataset.homeId),placements=home.rooms[target.key].furniturePlacements||[];let best=null;
   for(const table of target.tables){for(const [side,sx,sy,rotation] of [['north',.5,.10,0],['south',.5,.95,180],['west',.02,.5,90],['east',.98,.5,270]]){
    if(placements.some(c=>c.id!==d.item.id&&c.tableId===table.id&&c.seatSide===side))continue;
    const ax=table.box.left+table.box.width*sx,ay=table.box.top+table.box.height*sy,distance=Math.hypot(x-ax,y-ay);
    if(distance<=Math.max(28,table.box.width*.32)&&(!best||distance<best.distance))best={distance,x:(ax-box.left)/box.width*100,y:(ay-box.top)/box.height*100,tableId:table.id,seatSide:side,rotation};
   }}if(best)pos={...pos,...best};
  }
  d.latest={...pos,roomKey:target.key};if(!d.ghost){d.ghost=d.element.cloneNode(true);d.ghost.removeAttribute('data-furniture-placement');d.ghost.classList.add('furniture-drag-preview');d.ghost.inert=true;preserveFurnitureDragSize(d.element,d.ghost);d.element.classList.add('furniture-drag-source');for(const part of d.parts){part.ghost=part.element.cloneNode(true);part.ghost.removeAttribute('data-furniture-placement');part.ghost.classList.add('furniture-drag-preview');part.ghost.inert=true;preserveFurnitureDragSize(part.element,part.ghost);part.element.classList.add('furniture-drag-source')}}
  if(d.ghost.parentElement!==target.layer)target.layer.append(d.ghost);d.ghost.style.setProperty('--furniture-x',pos.x+'%');d.ghost.style.setProperty('--furniture-y',pos.y+'%');for(const part of d.parts){if(part.ghost.parentElement!==target.layer)target.layer.append(part.ghost);part.ghost.style.setProperty('--furniture-x',(pos.x+part.dx)+'%');part.ghost.style.setProperty('--furniture-y',(pos.y+part.dy)+'%')}
 };
 root.addEventListener('pointerdown',e=>{
  if(e.button!==0||drag||!root.querySelector('.home.is-editing')&&!root.matches('.home.is-editing')||e.target.closest('dialog,.furniture-edit-toolbar,[data-home-furniture-drawer]'))return;
  const room=e.target.closest('.room[data-room-key]');if(!room)return;
  const hits=[...room.querySelectorAll('[data-furniture-placement]')].filter(el=>{const r=furnitureArt(el).getBoundingClientRect();return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom}).sort((a,b)=>Number(b.style.zIndex||0)-Number(a.style.zIndex||0));if(!hits.length)return;
  stop(e);const key=hits.map(el=>el.dataset.furniturePlacement).join('|'),repeat=last?.key===key&&Math.hypot(e.clientX-last.x,e.clientY-last.y)<18,index=repeat?(last.index+1)%hits.length:0,element=hits[index];last={key,index,x:e.clientX,y:e.clientY};select(element);
  const home=getHome(element.dataset.homeId),item=home.rooms[element.dataset.roomKey].furniturePlacements.find(p=>p.id===element.dataset.furniturePlacement),canvas=room.closest('[data-room-canvas]'),r=element.getBoundingClientRect();
  const linked=home.rooms[element.dataset.roomKey].furniturePlacements.filter(p=>p.id===item.id||item.item==='식탁'&&p.tableId===item.id);const parts=[...room.querySelectorAll('[data-furniture-placement],[data-chair-frame]')].filter(el=>el!==element&&linked.some(p=>p.id===(el.dataset.furniturePlacement||el.dataset.chairFrame))).map(el=>{const p=linked.find(p=>p.id===(el.dataset.furniturePlacement||el.dataset.chairFrame));return {element:el,dx:p.x-item.x,dy:p.y-item.y}});
  drag={element,item,parts,pointer:e.pointerId,startX:e.clientX,startY:e.clientY,offsetX:r.left+r.width/2-e.clientX,offsetY:r.top+r.height/2-e.clientY,canvasBox:canvas.getBoundingClientRect(),rooms:[...canvas.querySelectorAll('.room[data-room-key]')].map(room=>({key:room.dataset.roomKey,layer:room.querySelector('.room-furniture-layer'),box:room.querySelector('.room-furniture-layer').getBoundingClientRect(),tables:[...room.querySelectorAll('[data-furniture-kind="table"]')].map(t=>({id:t.dataset.furniturePlacement,box:furnitureArt(t).getBoundingClientRect()}))}))};root.setPointerCapture(e.pointerId);
 },{capture:true,signal});
 root.addEventListener('pointermove',e=>{if(!drag||drag.pointer!==e.pointerId)return;stop(e);if(!drag.point&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)<5)return;drag.point={x:e.clientX,y:e.clientY};if(!frame)frame=requestAnimationFrame(paint)},{capture:true,signal});
 const end=e=>{if(!drag||drag.pointer!==e.pointerId)return;stop(e);if(frame){cancelAnimationFrame(frame);paint()}const d=drag;drag=null;clearPreview(d);if(root.hasPointerCapture(e.pointerId))root.releasePointerCapture(e.pointerId);if(d.latest){last=null;move(d.element,d.latest)}};
 for(const event of ['pointerup','pointercancel','lostpointercapture'])root.addEventListener(event,end,{capture:true,signal});
 root.addEventListener('click',e=>{if(e.target.closest('[data-furniture-placement]')&& (root.querySelector('.home.is-editing')||root.matches('.home.is-editing')))stop(e)},{capture:true,signal});
 cleanupActive=()=>{controller.abort();if(frame)cancelAnimationFrame(frame);clearPreview(drag);toggle.remove()};
}
