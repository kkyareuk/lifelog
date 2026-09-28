import {counterArt} from './counter-art.js';
import {furnitureSprite} from './furniture-sprites.js';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function counterResizePatch(start,edge,delta,art,room){
 const horizontal=edge==='left'||edge==='right',sign=edge==='left'||edge==='top'?-1:1;
 const key=horizontal?'counterSpan':'counterDepth',old=Number(start[key])||1,size=horizontal?art.width:art.height;
 const value=clamp(old+sign*delta/size*old,1,6),change=(value/old-1)*size;
 return {[key]:value,[horizontal?'x':'y']:clamp(start[horizontal?'x':'y']+sign*change/2/(horizontal?room.width:room.height)*100,.5,99.5)};
}
export function bindCounterEdges(root,{getHome,resize,signal,language}){
 let selected=null,drag=null;const controls=document.createElement('div');controls.className='counter-edge-controls';controls.hidden=true;document.body.append(controls);
 const position=()=>{if(!selected?.isConnected){controls.hidden=true;return}const r=selected.querySelector('.counter-stretch')?.getBoundingClientRect();if(!r)return;controls.hidden=false;controls.style.cssText=`left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px`};
 for(const edge of ['left','right','top','bottom']){const b=document.createElement('button');b.type='button';b.dataset.counterEdge=edge;b.setAttribute('aria-label',({ko:'카운터 가장자리 늘리기',en:'Resize counter edge',ja:'カウンターの端を伸ばす'}[language]||'카운터 가장자리 늘리기')+' '+edge);controls.append(b);
 b.onpointerdown=e=>{if(e.button!==0||drag)return;e.preventDefault();e.stopPropagation();const p=getHome(selected.dataset.homeId)?.rooms[selected.dataset.roomKey]?.furniturePlacements.find(p=>p.id===selected.dataset.furniturePlacement);if(!p)return;drag={pointer:e.pointerId,start:{...p},css:selected.style.cssText,html:selected.querySelector('.counter-stretch').outerHTML,art:selected.querySelector('.counter-stretch').getBoundingClientRect(),room:selected.closest('.room-furniture-layer').getBoundingClientRect(),x:e.clientX,y:e.clientY,edge};b.setPointerCapture(e.pointerId)};
 b.onpointermove=e=>{if(drag?.pointer!==e.pointerId)return;e.preventDefault();const d=drag;d.patch=counterResizePatch(d.start,d.edge,['left','right'].includes(d.edge)?e.clientX-d.x:e.clientY-d.y,d.art,d.room);const p={...d.start,...d.patch},s=furnitureSprite(p);selected.style.setProperty('--furniture-x',p.x+'%');selected.style.setProperty('--furniture-y',p.y+'%');selected.style.setProperty('--sprite-width',s.width/527*2*s.scale);selected.style.setProperty('--sprite-ratio',s.width/s.height);selected.querySelector('.counter-stretch').outerHTML=counterArt(s,p.counterSpan,p.counterDepth);
 const after=selected.querySelector('.counter-stretch').getBoundingClientRect(),horizontal=['left','right'].includes(d.edge),anchor=({left:'right',right:'left',top:'bottom',bottom:'top'})[d.edge],axis=horizontal?'x':'y';
 p[axis]+=(d.art[anchor]-after[anchor])/(horizontal?d.room.width:d.room.height)*100;d.patch[axis]=p[axis];selected.style.setProperty('--furniture-'+axis,p[axis]+'%');position()};
 const end=e=>{if(drag?.pointer!==e.pointerId)return;const d=drag;drag=null;if(b.hasPointerCapture(e.pointerId))b.releasePointerCapture(e.pointerId);if(e.type==='pointerup'&&d.patch)resize(selected,d.patch);else{selected.style.cssText=d.css;selected.querySelector('.counter-stretch').outerHTML=d.html;position()}};
 b.onpointerup=end;b.onpointercancel=end;b.onlostpointercapture=end;
 }
 root.addEventListener('furniture-selection',e=>{selected=e.target.dataset.furnitureKind==='counter'?e.target:null;position()},{signal});
 const observer=new MutationObserver(()=>{if(!root.isConnected){controls.remove();observer.disconnect()}else if(!root.querySelector('.is-editing')&&!root.matches('.is-editing'))controls.hidden=true});observer.observe(root.parentElement||root,{childList:true,subtree:false});signal.addEventListener('abort',()=>observer.disconnect(),{once:true});
 window.addEventListener('scroll',position,{capture:true,signal});window.addEventListener('resize',position,{signal});signal.addEventListener('abort',()=>controls.remove(),{once:true});
}
