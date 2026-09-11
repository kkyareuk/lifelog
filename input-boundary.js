// Discard old queued input after a screen/interaction commits, never lock fresh input.
export function createInputBoundary(now=()=>performance.now()){
 let boundary=0;
 return {commit(){boundary=now()},stale(stamp){return Number.isFinite(stamp)&&stamp>0&&stamp+1<boundary},get boundary(){return boundary}};
}
let lastInteraction=-Infinity;
export const inputIdleDelay=(now=performance.now())=>Math.max(0,350-(now-lastInteraction));
const noteInteraction=()=>{lastInteraction=performance.now()};
const guard=createInputBoundary();
export const commitInputBoundary=()=>guard.commit();
export function installInputBoundary(root=document){
 const normalize=event=>event.timeStamp>1e12?event.timeStamp-performance.timeOrigin:event.timeStamp;
 const stop=event=>{event.preventDefault();event.stopImmediatePropagation()};
 let discardedGesture=false;
 const check=event=>{
  if(!event.isTrusted)return;
  noteInteraction();
  const old=guard.stale(normalize(event));
  if(event.type==='pointerdown')discardedGesture=old;
  if(event.type==='pointerup'&&old)discardedGesture=true;
  if(old||(event.type==='click'&&event.detail!==0&&discardedGesture)){stop(event);if(event.type==='click')discardedGesture=false;return}
  // The microtask runs after all synchronous handlers for this click, including
  // DOM replacement, so taps queued during that work cannot hit the new screen.
  if(event.type==='click')queueMicrotask(commitInputBoundary);
 };
 for(const kind of ['pointerdown','pointerup','click'])root.addEventListener(kind,check,{capture:true,passive:false});
 for(const kind of ['pointermove','wheel','keydown'])root.addEventListener(kind,noteInteraction,{capture:true,passive:true});
 root.addEventListener('close',commitInputBoundary,true);
 return ()=>{for(const kind of ['pointermove','wheel','keydown'])root.removeEventListener(kind,noteInteraction,true);for(const kind of ['pointerdown','pointerup','click'])root.removeEventListener(kind,check,true);root.removeEventListener('close',commitInputBoundary,true)};
}
