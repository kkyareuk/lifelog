import {positionSurfaceFurniture} from './furniture-surfaces.js';

// Keep attached objects next to their support in the depth order, so later
// scene sorting cannot put them behind the very surface they sit on.
export function orderAttachedFurniture(rows){
 const byId=new Map(rows.filter(r=>r.element.dataset.furniturePlacement).map(r=>[r.element.dataset.furniturePlacement,r]));
 const children=new Map(),attached=new Set(),result=[],seen=new Set();
 for(const row of rows){const parent=byId.get(row.element.dataset.surfaceId);if(parent&&parent!==row){const list=children.get(parent)||[];list.push(row);children.set(parent,list);attached.add(row)}}
 const emit=row=>{if(seen.has(row))return;seen.add(row);result.push(row);for(const child of children.get(row)||[])emit(child)};
 rows.filter(r=>!attached.has(r)).forEach(emit);rows.forEach(emit);
 return result;
}

// Mafia renders its own rooms outside the main home renderer. Reuse the same
// attachment ordering and refresh only after images or dimensions change.
export function bindFurnitureSceneDepth(root){
 let frame=0;
 const layout=()=>{frame=0;if(!root.isConnected)return;for(const room of root.querySelectorAll('.mp-room')){
  positionSurfaceFurniture(room);
  const rows=[...room.querySelectorAll('[data-furniture-placement]')].map(element=>({element,bottom:(element.querySelector('.room-furniture-art')||element).getBoundingClientRect().bottom})).sort((a,b)=>a.bottom-b.bottom);
  orderAttachedFurniture(rows).forEach(({element},i)=>element.style.zIndex=String(10+i*3));
  const heading=room.querySelector(':scope > b');if(heading)heading.style.zIndex=String(20+rows.length*3);
 }};
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(layout)};
 const observer=new ResizeObserver(schedule);root.querySelectorAll('.mp-room,.room-furniture-art').forEach(el=>observer.observe(el));root.addEventListener('load',schedule,true);schedule();
 return ()=>{observer.disconnect();root.removeEventListener('load',schedule,true);if(frame)cancelAnimationFrame(frame)};
}
