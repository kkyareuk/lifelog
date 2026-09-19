import {furniturePaintedBounds,furnitureArt} from './furniture-painted-bounds.js';
import {isSurface,snapToSurface} from './furniture-surfaces.js';
import {preserveFurnitureDragSize} from './furniture-drag-size.js';
import {snapFurniturePosition,furnitureGridForRoom,furnitureFootprint} from './furniture-layout.js?v=20260909dev305';
let cleanupActive=null;
export {furnitureArt} from './furniture-painted-bounds.js';
export function counterSnap(point,own,neighbors){
 let best=null;
 for(const other of neighbors)for(const side of [-1,1]){const x=side<0?other.box.left-own.width/2+1:other.box.right+own.width/2-1,y=other.box.top+own.height/2,distance=Math.hypot(point.x-x,point.y-y);if(distance<Math.max(22,own.width*.4)&&(!best||distance<best.distance))best={x,y,distance};}
 return best;
}
export function bindFurnitureDrag(root,{getHome,select=()=>{},move,resize=()=>{},language='ko'}){
 cleanupActive?.();cleanupActive=null;if(!root)return;const controller=new AbortController(),signal=controller.signal;let drag=null,last=null,frame=0;
 const text=(ko,en,ja)=>({ko,en,ja}[language]||ko);let magnet=true;try{magnet=localStorage.getItem('drawer-chair-magnet')!=='off'}catch{}
 const bar=root.querySelector('[data-furniture-edit-toolbar]')||root.querySelector('[data-home-furniture-drawer]');
 const toggle=document.createElement('button');toggle.type='button';toggle.dataset.chairMagnet='';toggle.className='chair-magnet-toggle';const label=()=>{toggle.textContent=text('의자 자동 붙이기','Snap chairs to tables','椅子をテーブルに吸着');toggle.setAttribute('aria-pressed',String(magnet))};label();toggle.onclick=()=>{magnet=!magnet;label();try{localStorage.setItem('drawer-chair-magnet',magnet?'on':'off')}catch{}};(bar?.querySelector('.furniture-edit-heading')||bar)?.prepend(toggle);
 const stretch=document.createElement('label');stretch.hidden=true;stretch.textContent=text('카운터 길이','Counter length','カウンターの長さ');const length=document.createElement('input');length.type='range';length.min='1';length.max='6';length.step='.25';length.setAttribute('aria-label',stretch.textContent);stretch.append(length);bar?.append(stretch);let selectedCounter=null;root.addEventListener('furniture-selection',e=>{selectedCounter=e.target;stretch.hidden=e.target.dataset.furnitureKind!=='counter';length.value=e.target.dataset.counterSpan||1},{signal});length.onchange=()=>{if(selectedCounter)resize(selectedCounter,Number(length.value))};
 root.addEventListener('drawer-scene-pinch',()=>{if(frame){cancelAnimationFrame(frame);frame=0}const old=drag;drag=null;clearPreview(old);if(old&&root.hasPointerCapture(old.pointer))root.releasePointerCapture(old.pointer)},{signal});
 const clearPreview=d=>{root.querySelectorAll('.surface-drop-target').forEach(el=>el.classList.remove('surface-drop-target'));d?.ghost?.remove();d?.element.classList.remove('furniture-drag-source');for(const part of d?.parts||[]){part.ghost?.remove();part.element.classList.remove('furniture-drag-source')}};
 const stop=e=>{e.preventDefault();e.stopImmediatePropagation()};
 const paint=()=>{frame=0;if(!drag?.point)return;const d=drag,p=d.point;const target=d.rooms.find(r=>p.x>=r.box.left&&p.x<=r.box.right&&p.y>=r.box.top&&p.y<=r.box.bottom);if(!target)return;
  const box=target.box,x=p.x+d.offsetX,y=p.y+d.offsetY;
  let pos=snapFurniturePosition((x-box.left)/box.width*100,(y-box.top)/box.height*100,furnitureGridForRoom(box,d.canvasBox),furnitureFootprint(d.item.item));pos.tableId='';pos.seatSide='';pos.surfaceId='';pos.surfaceU=.5;pos.surfaceV=.5;
  if(magnet&&d.item.item==='의자'){
   const home=getHome(d.element.dataset.homeId),placements=home.rooms[target.key].furniturePlacements||[];let best=null;
   for(const table of target.tables){for(const [side,sx,sy,rotation] of [['north',.5,.10,0],['south',.5,.95,180],['west',.02,.5,90],['east',.98,.5,270]]){
    if(placements.some(c=>c.id!==d.item.id&&c.tableId===table.id&&c.seatSide===side))continue;
    const ax=table.box.left+table.box.width*sx,ay=table.box.top+table.box.height*sy,distance=Math.hypot(x-ax,y-ay);
    if(distance<=Math.max(28,table.box.width*.32)&&(!best||distance<best.distance))best={distance,x:(ax-box.left)/box.width*100,y:(ay-box.top)/box.height*100,tableId:table.id,seatSide:side,rotation};
   }}if(best)pos={...pos,...best};
  }
  if(d.item.item.startsWith('카운터')){const snap=counterSnap({x,y},furnitureArt(d.element).getBoundingClientRect(),target.counters.filter(c=>c.id!==d.item.id));if(snap)pos={...pos,x:(snap.x-box.left)/box.width*100,y:(snap.y-box.top)/box.height*100};}
  const placements=getHome(d.element.dataset.homeId).rooms[target.key].furniturePlacements||[];
  const surface=snapToSurface({x:p.x,y:p.y},d.item,target.surfaces,placements);
  target.surfaces.forEach(s=>s.element.classList.toggle('surface-drop-target',s.placement.id===surface?.surfaceId));
  if(surface){const own=furnitureArt(d.element).getBoundingClientRect();pos={...pos,...surface,x:(surface.x-box.left)/box.width*100,y:(surface.y-own.height/2-box.top)/box.height*100};}
  d.latest={...pos,roomKey:target.key};if(!d.ghost){d.ghost=d.element.cloneNode(true);d.ghost.removeAttribute('data-furniture-placement');d.ghost.classList.add('furniture-drag-preview');d.ghost.inert=true;preserveFurnitureDragSize(d.element,d.ghost);d.element.classList.add('furniture-drag-source');for(const part of d.parts){part.ghost=part.element.cloneNode(true);part.ghost.removeAttribute('data-furniture-placement');part.ghost.classList.add('furniture-drag-preview');part.ghost.inert=true;preserveFurnitureDragSize(part.element,part.ghost);part.element.classList.add('furniture-drag-source')}}
  if(d.ghost.parentElement!==target.layer)target.layer.append(d.ghost);d.ghost.style.setProperty('--furniture-x',pos.x+'%');d.ghost.style.setProperty('--furniture-y',pos.y+'%');for(const part of d.parts){if(part.ghost.parentElement!==target.layer)target.layer.append(part.ghost);part.ghost.style.setProperty('--furniture-x',(pos.x+part.dx)+'%');part.ghost.style.setProperty('--furniture-y',(pos.y+part.dy)+'%')}
 };
 root.addEventListener('pointerdown',e=>{
  if(e.button!==0||drag||!root.querySelector('.home.is-editing')&&!root.matches('.home.is-editing')||e.target.closest('dialog,.furniture-edit-toolbar,[data-home-furniture-drawer]'))return;
  const room=e.target.closest('.room[data-room-key]');if(!room)return;
  const hits=[...room.querySelectorAll('[data-furniture-placement]')].filter(el=>{const r=furniturePaintedBounds(furnitureArt(el));return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom}).sort((a,b)=>Number(getComputedStyle(b).zIndex||0)-Number(getComputedStyle(a).zIndex||0)||(a.compareDocumentPosition(b)&Node.DOCUMENT_POSITION_FOLLOWING?1:-1));if(!hits.length)return;
  // Cycle layers only after a tap finishes. Starting another drag must not select the support underneath.
  stop(e);const key=hits.map(el=>el.dataset.furniturePlacement).join('|'),repeat=last?.key===key&&Math.hypot(e.clientX-last.x,e.clientY-last.y)<18,index=repeat?(last.index+1)%hits.length:0,element=hits[0];select(element);selectedCounter=element;stretch.hidden=element.dataset.furnitureKind!=='counter';length.value=element.dataset.counterSpan||1;
  const home=getHome(element.dataset.homeId),item=home.rooms[element.dataset.roomKey].furniturePlacements.find(p=>p.id===element.dataset.furniturePlacement),canvas=room.closest('[data-room-canvas]'),r=element.getBoundingClientRect();
  const linked=home.rooms[element.dataset.roomKey].furniturePlacements.filter(p=>p.id===item.id||p.surfaceId===item.id||item.item==='식탁'&&p.tableId===item.id);const parts=[...room.querySelectorAll('[data-furniture-placement],[data-chair-frame]')].filter(el=>el!==element&&linked.some(p=>p.id===(el.dataset.furniturePlacement||el.dataset.chairFrame))).map(el=>{const p=linked.find(p=>p.id===(el.dataset.furniturePlacement||el.dataset.chairFrame));return {element:el,dx:p.x-item.x,dy:p.y-item.y}});
  drag={element,item,parts,tap:{hits,key,index,x:e.clientX,y:e.clientY},pointer:e.pointerId,startX:e.clientX,startY:e.clientY,offsetX:r.left+r.width/2-e.clientX,offsetY:r.top+r.height/2-e.clientY,canvasBox:Object.assign(canvas.getBoundingClientRect(),{columns:Number(canvas.dataset.roomGridCols),rows:Number(canvas.dataset.roomGridRows)}),rooms:[...canvas.querySelectorAll('.room[data-room-key]')].map(room=>({key:room.dataset.roomKey,surfaces:[...room.querySelectorAll('[data-furniture-placement]')].map(element=>({element,placement:home.rooms[room.dataset.roomKey].furniturePlacements.find(p=>p.id===element.dataset.furniturePlacement),box:furnitureArt(element).getBoundingClientRect()})).filter(s=>isSurface(s.placement)&&s.placement.id!==item.id),layer:room.querySelector('.room-furniture-layer'),box:room.querySelector('.room-furniture-layer').getBoundingClientRect(),counters:[...room.querySelectorAll('[data-furniture-kind^="counter"]')].map(t=>({id:t.dataset.furniturePlacement,box:furnitureArt(t).getBoundingClientRect()})),tables:[...room.querySelectorAll('[data-furniture-kind="table"]')].map(t=>({id:t.dataset.furniturePlacement,box:furnitureArt(t).getBoundingClientRect()}))}))};root.setPointerCapture(e.pointerId);
 },{capture:true,signal});
 root.addEventListener('pointermove',e=>{if(!drag||drag.pointer!==e.pointerId)return;stop(e);if(!drag.point&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)<5)return;drag.point={x:e.clientX,y:e.clientY};if(!frame)frame=requestAnimationFrame(paint)},{capture:true,signal});
 const end=e=>{if(!drag||drag.pointer!==e.pointerId)return;stop(e);if(frame){cancelAnimationFrame(frame);paint()}const d=drag;drag=null;clearPreview(d);if(root.hasPointerCapture(e.pointerId))root.releasePointerCapture(e.pointerId);if(d.latest){last=null;if(e.type==='pointerup')move(d.element,d.latest)}else if(e.type==='pointerup'){const {hits,...tap}=d.tap;last=tap;const selected=hits[tap.index];select(selected);selectedCounter=selected;stretch.hidden=selected.dataset.furnitureKind!=='counter';length.value=selected.dataset.counterSpan||1}};
 for(const event of ['pointerup','pointercancel','lostpointercapture'])root.addEventListener(event,end,{capture:true,signal});
 root.addEventListener('click',e=>{if(e.target.closest('[data-furniture-placement]')&& (root.querySelector('.home.is-editing')||root.matches('.home.is-editing')))stop(e)},{capture:true,signal});
 cleanupActive=()=>{controller.abort();if(frame)cancelAnimationFrame(frame);clearPreview(drag);toggle.remove();stretch.remove()};
}
