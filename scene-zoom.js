const views=new Map();
export function bindSceneZoom(root=document){
 for(const viewport of root.querySelectorAll('.home-canvas-viewport,.town-map-scroll')){
  if(viewport.dataset.zoomBound)return;const scene=viewport.querySelector(':scope > .rooms,:scope > .world');if(!scene)continue;
  viewport.dataset.zoomBound='1';viewport.style.touchAction='none';viewport.style.setProperty('overflow','hidden','important');viewport.style.overflowAnchor='none';viewport.scrollLeft=0;viewport.scrollTop=0;
  const key=viewport.dataset.homePan||'town',pose=views.get(key)||{scale:1,x:0,y:0};views.set(key,pose);if(views.size>80)views.delete(views.keys().next().value);
  const eventRoot=viewport.closest('.home-page')||viewport;
  const points=new Map();let gesture=null,consumed=false,frame=0,rect=viewport.getBoundingClientRect();
  const draw=()=>{frame=0;const w=viewport.clientWidth,h=viewport.clientHeight;pose.x=Math.max(Math.min(0,w-scene.offsetWidth*pose.scale),Math.min(0,pose.x));pose.y=Math.max(Math.min(0,h-scene.offsetHeight*pose.scale),Math.min(0,pose.y));viewport.scrollLeft=0;viewport.scrollTop=0;scene.style.transformOrigin='0 0';scene.style.transform=`translate(${pose.x}px,${pose.y}px) scale(${pose.scale})`;};
  viewport.addEventListener('scroll',()=>{if(viewport.scrollLeft||viewport.scrollTop){viewport.scrollLeft=0;viewport.scrollTop=0}},{passive:true});
  const measure=()=>{const a=[...points.values()];return {x:(a[0].x+(a[1]?.x??a[0].x))/2-rect.left,y:(a[0].y+(a[1]?.y??a[0].y))/2-rect.top,d:a[1]?Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y):0}};
  const begin=()=>{gesture={...measure(),...{pose:{...pose}}}};
  eventRoot.addEventListener('pointerdown',e=>{
   if(e.pointerType!=='touch'||!viewport.contains(e.target)&&!points.size)return;points.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(points.size===1){consumed=false;rect=viewport.getBoundingClientRect()}
   if(points.size===2||pose.scale>1&&!e.target.closest('button,input,select,[data-furniture-placement],[data-room-drag],[data-room-resize]')){
    consumed=true;document.documentElement.dataset.sceneGesture='1';begin();e.preventDefault();e.stopImmediatePropagation();
    if(points.size===2)eventRoot.dispatchEvent(new CustomEvent('drawer-scene-pinch',{bubbles:true}));
    for(const id of points.keys())try{viewport.setPointerCapture(id)}catch{}
   }
  },true);
  eventRoot.addEventListener('pointermove',e=>{if(!points.has(e.pointerId))return;points.set(e.pointerId,{x:e.clientX,y:e.clientY});if(!gesture)return;e.preventDefault();e.stopImmediatePropagation();const m=measure(),start=gesture.pose;pose.scale=gesture.d&&m.d?Math.max(1,Math.min(3,start.scale*m.d/gesture.d)):start.scale;pose.x=m.x-(gesture.x-start.x)*pose.scale/start.scale;pose.y=m.y-(gesture.y-start.y)*pose.scale/start.scale;if(!frame)frame=requestAnimationFrame(draw);},true);
  const end=e=>{if(!points.has(e.pointerId))return;points.delete(e.pointerId);if(consumed){e.preventDefault();e.stopImmediatePropagation()}if(frame){cancelAnimationFrame(frame);draw()}if(points.size&&gesture)begin();else {gesture=null;delete document.documentElement.dataset.sceneGesture;window.dispatchEvent(new Event('drawer-scene-gesture-ended'))}};
  eventRoot.addEventListener('pointerup',end,true);eventRoot.addEventListener('pointercancel',end,true);
  viewport.addEventListener('click',e=>{if(consumed){e.preventDefault();e.stopImmediatePropagation();consumed=false}},true);draw();
 }
}
