// Watch only visible, active walks. No whole-scene render or path search per tick.
export function movementStalled(previous,point,now){
 if(!previous||Math.hypot(point.x-previous.x,point.y-previous.y)>.5)return {...point,since:now,stalled:false};
 return {...previous,stalled:now-previous.since>=700};
}
let timer=0;
export function watchMovement(root=document){
 clearTimeout(timer);
 const tracked=new WeakMap();
 const tick=()=>{
  if(document.hidden||!root.isConnected&&root!==document)return;
  const actors=[...root.querySelectorAll('.meeting-walker:not(.is-stationary),.home-life-walking')];let pending=false;
  for(const actor of actors){
   const end=Number(actor.dataset.journeyEnd);if(!end||Date.now()>=end||actor.dataset.collisionBypass)continue;
   pending=true;
   const r=actor.getBoundingClientRect(),parent=actor.offsetParent?.getBoundingClientRect();if(!parent||!r.width)continue;
   const sample=movementStalled(tracked.get(actor),{x:r.x-parent.x,y:r.y-parent.y},performance.now());tracked.set(actor,sample);
   if(!sample.stalled)continue;
   // Keep the destination and resume from the exact painted position. The
   // standing collision pass excludes walkers until this journey completes.
   const style=getComputedStyle(actor),meeting=actor.classList.contains('meeting-walker');
   const from=meeting?{left:style.left,top:style.top}:{transform:style.transform};
   const to=meeting?{left:style.getPropertyValue('--meeting-x1'),top:style.getPropertyValue('--meeting-y1')}:{transform:'translate(-50%,-72%)'};
   actor.dataset.collisionBypass='true';
   const animation=actor.animate([from,to],{duration:Math.max(1,end-Date.now()),easing:'linear',fill:'forwards'});
   animation.onfinish=()=>{delete actor.dataset.collisionBypass};
  }
  if(pending)timer=setTimeout(tick,100);
 };tick();
}
