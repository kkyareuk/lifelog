// Keep the native scroll view alive until the user's drag/momentum finishes.
// Replacing its DOM mid-gesture cancels the browser's scroll, even if scrollTop
// is copied to the replacement element afterwards.
let owner=null,lastScroll=-Infinity,pending=null,timer=0;
const pointers=new Set();
const quietMs=180;
const clearPending=()=>{clearTimeout(timer);timer=0;pending=null};
const schedule=()=>{
 clearTimeout(timer);
 timer=setTimeout(()=>{
  timer=0;
  if(!pending)return;
  if(owner?.isConnected&&(pointers.size||performance.now()-lastScroll<quietMs)){schedule();return}
  const resume=pending;pending=null;resume();
 },quietMs);
};
document.addEventListener('pointerdown',event=>{
 const target=event.target instanceof Element?event.target.closest('[data-settings-scroll]'):null;
 if(!target)return;
 if(owner!==target){pointers.clear();owner=target}
 pointers.add(event.pointerId);lastScroll=performance.now();
},{capture:true,passive:true});
for(const type of ['pointerup','pointercancel'])document.addEventListener(type,event=>{
 if(pointers.delete(event.pointerId)){lastScroll=performance.now();if(pending)schedule()}
},{capture:true,passive:true});
document.addEventListener('scroll',event=>{
 if(event.target!==owner)return;
 lastScroll=performance.now();if(pending)schedule();
},{capture:true,passive:true});
export function deferSettingsScrollRender(tab,resume){
 if(tab!=='settings'||!owner?.isConnected){clearPending();pointers.clear();owner=null;return false}
 if(!pointers.size&&performance.now()-lastScroll>=quietMs){clearPending();return false}
 pending=resume;schedule();return true;
}
window.addEventListener('pagehide',()=>{clearPending();pointers.clear();owner=null});
