// Screen-space standing footprints. Artwork and room dimensions, rather than
// label boxes or fixed percentage radii, determine the space an occupant needs.
const positions=new Map();
const box=r=>({left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height});
const overlap=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
const moved=(r,x,y)=>({...r,left:x,top:y,right:x+r.width,bottom:y+r.height});
export function findStandingSpace(rect,area,obstacles){
 const pad=3,loX=area.left+pad,hiX=Math.max(loX,area.right-rect.width-pad),loY=area.top+24,hiY=Math.max(loY,area.bottom-rect.height-pad);
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),start=moved(rect,clamp(rect.left,loX,hiX),clamp(rect.top,loY,hiY));
 const score=r=>obstacles.reduce((sum,o)=>sum+overlap(r,{left:o.left-pad,right:o.right+pad,top:o.top-pad,bottom:o.bottom+pad}),0);
 if(!score(start))return start;
 let best=start,bestScore=score(start),bestDistance=0;
 // Include obstacle edges so thin free corridors do not disappear between grid cells.
 const xs=new Set([loX,hiX,start.left]),ys=new Set([loY,hiY,start.top]);
 for(let x=loX;x<=hiX;x+=Math.max(8,(hiX-loX)/24))xs.add(x);for(let y=loY;y<=hiY;y+=Math.max(8,(hiY-loY)/24))ys.add(y);
 for(const o of obstacles){xs.add(clamp(o.left-rect.width-pad,loX,hiX));xs.add(clamp(o.right+pad,loX,hiX));ys.add(clamp(o.top-rect.height-pad,loY,hiY));ys.add(clamp(o.bottom+pad,loY,hiY))}
 const candidates=[...xs].flatMap(x=>[...ys].map(y=>({x,y,d:(x-start.left)**2+(y-start.top)**2}))).sort((a,b)=>a.d-b.d);
 for(const {x,y,d} of candidates){const r=moved(rect,x,y),s=score(r);if(!s)return r;if(s<bestScore||s===bestScore&&d<bestDistance){best=r;bestScore=s;bestDistance=d}}
 return best;
}
export function positionStandingOccupants(scene,rectForFurniture,paintedRect){
 if(scene.closest('.is-editing'))return;
 const area=scene.getBoundingClientRect();if(!area.width||!area.height)return;
 const furniture=[...scene.querySelectorAll('[data-furniture-placement]')].filter(e=>getComputedStyle(e).visibility!=='hidden').map(e=>({element:e,...box(rectForFurniture(scene,e))}));
 const people=[...scene.querySelectorAll('.home-person,.room-pet')].sort((a,b)=>Number(!!b.dataset.usingFurniture)-Number(!!a.dataset.usingFurniture)||(a.dataset.characterId||a.dataset.petId||'').localeCompare(b.dataset.characterId||b.dataset.petId||''));
 const occupied=[...scene.querySelectorAll('.home-life-interaction')].map(e=>box(e.getBoundingClientRect()));
 for(const person of people){
  const pet=person.classList.contains('room-pet');if(pet)person.style.animation='none';
  const visual=person.querySelector('.home-person-visual .avatar,.home-person-visual .sprite,.room-pet-icon,.room-pet-photo,.room-pet-emoji')||person.querySelector('.home-person-visual')||person;
  const r=box(visual.tagName==='IMG'?paintedRect(visual):visual.getBoundingClientRect());if(!r.width||!r.height)continue;
  const using=person.dataset.usingFurniture||person.dataset.seatId||person.dataset.coupleBedId||'',allowed=new Set();let item=furniture.find(f=>f.element.dataset.furniturePlacement===using);
  while(item&&!allowed.has(item.element.dataset.furniturePlacement)){allowed.add(item.element.dataset.furniturePlacement);item=furniture.find(f=>f.element.dataset.furniturePlacement===(item.element.dataset.surfaceId||item.element.dataset.tableId))}
  const reserved=occupied.filter(o=>!using||o.using!==using),obstacles=[...furniture.filter(f=>!allowed.has(f.element.dataset.furniturePlacement)),...reserved];
  // Bed/seat poses are placed by their own slot geometry. A walking actor keeps
  // its animation until arrival, then joins the standing-footprint reservation.
  if(person.dataset.seatId||person.dataset.coupleBedId||person.classList.contains('home-life-walking')){occupied.push({...r,using});continue}
  const container=person.offsetParent||scene,cr=container.getBoundingClientRect();if(!cr.width||!cr.height)continue;
  const key=[scene.closest('[data-home-pan]')?.dataset.homePan||'',scene.className,person.dataset.characterId||person.dataset.petId,using,person.dataset.occupantTitle,Math.round(area.width),Math.round(area.height)].join('|');
  const old=positions.get(key),desired=old?moved(r,area.left+old.x*area.width,area.top+old.y*area.height):r;
  const at=old?desired:findStandingSpace(desired,area,obstacles);
  const left=parseFloat(person.style.left)||parseFloat(person.style.getPropertyValue('--life-x'))||parseFloat(person.style.getPropertyValue('--pet-x'))||50,top=parseFloat(person.style.top)||parseFloat(person.style.getPropertyValue('--life-y'))||parseFloat(person.style.getPropertyValue('--pet-y'))||50;
  person.style.left=left+(at.left-r.left)/cr.width*100+'%';person.style.top=top+(at.top-r.top)/cr.height*100+'%';
  positions.set(key,{x:(at.left-area.left)/area.width,y:(at.top-area.top)/area.height});if(positions.size>500)positions.delete(positions.keys().next().value);
  if(pet){
   let sweep=at,dx=0,dy=0;
   if(!person.classList.contains('is-sleeping'))for(const [x,y] of [[12,0],[-12,0],[0,10],[0,-10],[6,0],[-6,0]]){
    const candidate={left:Math.min(at.left,at.left+x),right:Math.max(at.right,at.right+x),top:Math.min(at.top,at.top+y),bottom:Math.max(at.bottom,at.bottom+y)};
    if(candidate.left>=area.left+3&&candidate.right<=area.right-3&&candidate.top>=area.top+24&&candidate.bottom<=area.bottom-3&&!obstacles.some(o=>overlap(candidate,o))){dx=x;dy=y;sweep=candidate;break}
   }
   person.style.setProperty('--pet-dx',dx/cr.width*100+'cqw');person.style.setProperty('--pet-dy',dy/cr.height*100+'cqh');person.style.removeProperty('animation');occupied.push({...sweep,using});
  }else occupied.push({...at,using});
 }
}
