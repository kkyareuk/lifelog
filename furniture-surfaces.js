// Shared geometry for drag snapping, persisted attachments and scene depth.
export const isSurface=p=>p?.item==='카운터'||p?.item==='협탁';
export const canPlaceOnSurface=p=>!isSurface(p)&&!/침대|소파|의자|냉장고|옷장|책장|식탁|테이블|세탁|욕조|변기|샤워/.test(p?.item||'');
export function surfaceArea(p,box){
 const side=Math.abs(Number(p.rotation)||0)%180===90;
 const area=p.item==='협탁'?[.17,.12,.66,.27]:side?[.12,.12,.76,.76]:[.05,.04,.90,.56];
 return {left:box.left+box.width*area[0],top:box.top+box.height*area[1],width:box.width*area[2],height:box.height*area[3]};
}
export function snapToSurface(point,item,surfaces,placements){
 if(!canPlaceOnSurface(item))return null;
 for(const {placement,box} of surfaces){
  const a=surfaceArea(placement,box),margin=10;
  if(point.x<a.left-margin||point.x>a.left+a.width+margin||point.y<a.top-margin||point.y>a.top+a.height+margin)continue;
  const peers=placements.filter(p=>p.id!==item.id&&p.surfaceId===placement.id);
  if(placement.item==='협탁'&&peers.length)continue;
  const columns=placement.item==='협탁'?1:Math.max(4,Math.round((placement.counterSpan||1)*4)),rows=placement.item==='협탁'?1:3;
  const col=Math.max(0,Math.min(columns-1,Math.floor((point.x-a.left)/a.width*columns))),row=Math.max(0,Math.min(rows-1,Math.floor((point.y-a.top)/a.height*rows)));
  const u=(col+.5)/columns,v=(row+.5)/rows;
  if(peers.some(p=>Math.abs(p.surfaceU-u)<.5/columns&&Math.abs(p.surfaceV-v)<.5/rows))continue;
  return {surfaceId:placement.id,surfaceU:u,surfaceV:v,x:a.left+a.width*u,y:a.top+a.height*v};
 }
 return null;
}
export function positionSurfaceFurniture(scene){
 const elements=[...scene.querySelectorAll('[data-furniture-placement]')],byId=new Map(elements.map(el=>[el.dataset.furniturePlacement,el]));
 for(const el of elements){
  const parent=byId.get(el.dataset.surfaceId);if(!parent||parent===el)continue;
  const art=parent.querySelector('.furniture-sprite')||parent,box=art.getBoundingClientRect(),layer=el.offsetParent?.getBoundingClientRect();if(!layer?.width)continue;
  const area=surfaceArea({item:parent.dataset.furnitureKind==='nightstand'?'협탁':'카운터',rotation:parent.dataset.surfaceRotation},box);
  const own=(el.querySelector('.room-furniture-art')||el).getBoundingClientRect();
  // Persist a base contact point; the whole image grows upward from the surface.
  const x=area.left+area.width*Number(el.dataset.surfaceU),y=area.top+area.height*Number(el.dataset.surfaceV);
  const style=getComputedStyle(el),cx=parseFloat(style.getPropertyValue('--furniture-x'))||0,cy=parseFloat(style.getPropertyValue('--furniture-y'))||0;
  el.style.setProperty('--furniture-x',(cx+(x-own.left-own.width/2)/layer.width*100)+'%');
  el.style.setProperty('--furniture-y',(cy+(y-own.bottom)/layer.height*100)+'%');
  el.style.zIndex=String((Number(parent.style.zIndex)||10)+1);
 }
}
