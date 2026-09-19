import {normalizeRoomLayout} from './room-layout.js?v=20260909dev305';

const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
// Resize keeps the opposite corner anchored, including at the canvas boundary.
// Preview uses continuous coordinates; only the released size is grid-snapped.
export function roomGestureLayout(start,dx,dy,mode,grid,snap=false){
  if(mode==='move')return {...start,x:clamp(snap?Math.round((start.x+dx)*grid.columns/100)*100/grid.columns:start.x+dx,0,100-start.w),y:clamp(snap?Math.round((start.y+dy)*grid.rows/100)*100/grid.rows:start.y+dy,0,100-start.h)};
  const width=start.w+dx,height=start.h+dy;
  return {...start,w:clamp(snap?Math.round(width*grid.columns/100)*100/grid.columns:width,Math.min(100-start.x,100*grid.minColumns/grid.columns),100-start.x),h:clamp(snap?Math.round(height*grid.rows/100)*100/grid.rows:height,Math.min(100-start.y,100*grid.minRows/grid.rows),100-start.y)};
}

export function bindRoomGesture(handle,mode,{world,update,capture,setStyle}){
  let drag=null;
  const endGesture=()=>{delete document.documentElement.dataset.roomGesture;window.dispatchEvent(new Event('drawer-scene-gesture-ended'))};
  const cancel=()=>{if(!drag)return;const old=drag;drag=null;setStyle(old.room,old.start);old.room.classList.remove('room-dragging');if(handle.hasPointerCapture(old.id))handle.releasePointerCapture(old.id);endGesture()};
  handle.closest('.home-page')?.addEventListener('drawer-scene-pinch',cancel);
  handle.onclick=e=>{e.preventDefault();e.stopPropagation()};
  handle.onpointerdown=e=>{
    if(drag||e.button>0)return;e.preventDefault();e.stopPropagation();
    const room=handle.closest('.room'),canvas=handle.closest('[data-room-canvas]'),home=world.homes[handle.dataset.homeId];if(!room||!canvas||!home)return;
    document.documentElement.dataset.roomGesture='1';
    if(!home.rooms?.[room.dataset.roomKey]?.layout)capture(canvas);
    const grid={columns:Math.max(12,Number(home.canvasColumns)||12),rows:Math.max(16,Number(home.canvasRows)||16),minColumns:2,minRows:2};
    const start=normalizeRoomLayout(home.rooms?.[room.dataset.roomKey]?.layout,grid),box=canvas.getBoundingClientRect();
    if(!start||!box.width||!box.height){endGesture();return}
    drag={id:e.pointerId,x:e.clientX,y:e.clientY,dx:0,dy:0,room,grid,start,box};handle.setPointerCapture(e.pointerId);room.classList.add('room-dragging');
  };
  handle.onpointermove=e=>{if(!drag||drag.id!==e.pointerId)return;e.preventDefault();e.stopPropagation();drag.dx=(e.clientX-drag.x)/drag.box.width*100;drag.dy=(e.clientY-drag.y)/drag.box.height*100;setStyle(drag.room,roomGestureLayout(drag.start,drag.dx,drag.dy,mode,drag.grid))};
  handle.onpointerup=e=>{
    if(!drag||drag.id!==e.pointerId)return;e.preventDefault();e.stopPropagation();const old=drag;drag=null;
    if(handle.hasPointerCapture(old.id))handle.releasePointerCapture(old.id);old.room.classList.remove('room-dragging');
    const layout=roomGestureLayout(old.start,old.dx,old.dy,mode,old.grid,true);setStyle(old.room,layout);
    delete document.documentElement.dataset.roomGesture;
    update(handle.dataset.homeId,old.room.dataset.roomKey,{layout},true);endGesture();
  };
  handle.onpointercancel=cancel;handle.onlostpointercapture=cancel;
}
