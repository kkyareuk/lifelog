import {homeGrid,scaleDefaultRooms} from './room-layout.js?v=20260909dev305';
const positions=new Map();
const text=(lang,ko,en,ja)=>({ko,en,ja}[lang]||ko);
// The house now fits its viewport; retain saved grid dimensions for furniture coordinates.
export function homeCanvasSettings(){return "";}
export function resizeCanvas(home,columns,rows,defaults){
 const before=homeGrid(home),rooms=structuredClone(home.rooms),layouts={};
 for(const [key,room] of Object.entries(rooms))layouts[key]=room.layout||defaults[key];
 const minimum={columns:12,rows:16};
 for(const rect of Object.values(layouts)){if(!rect)continue;minimum.columns=Math.max(minimum.columns,Math.ceil((rect.x+rect.w)*before.columns/100-1e-8));minimum.rows=Math.max(minimum.rows,Math.ceil((rect.y+rect.h)*before.rows/100-1e-8));}
 const next=homeGrid({canvasColumns:Math.max(minimum.columns,columns),canvasRows:Math.max(minimum.rows,rows)});
 for(const [key,rect] of Object.entries(layouts))if(rect)rooms[key].layout={x:rect.x*before.columns/next.columns,y:rect.y*before.rows/next.rows,w:rect.w*before.columns/next.columns,h:rect.h*before.rows/next.rows};
 return {rooms,canvasColumns:next.columns,canvasRows:next.rows};
}
export function bindHomeCanvas(root,{home,apply,render,canEdit=true,scope='personal'}={}){
 if(!root||!home)return;
 const pan=root.querySelector('[data-home-pan]');
 if(pan){const key=scope+':'+pan.dataset.homePan,old=positions.get(key);if(old){pan.scrollLeft=old.x;pan.scrollTop=old.y}pan.addEventListener('scroll',()=>{positions.set(key,{x:pan.scrollLeft,y:pan.scrollTop});if(positions.size>100)positions.delete(positions.keys().next().value)},{passive:true});}
 root.querySelectorAll('[data-home-canvas-axis]').forEach(input=>{
  input.disabled=!canEdit;
  input.onchange=async()=>{
   if(!canEdit)return;
   const {mobileRoomLayout}=await import('./views.js?v=20260909dev305');
   const defaults={};for(const floor of new Set(Object.values(home.rooms).map(r=>r.floor||1))){const keys=Object.keys(home.rooms).filter(key=>(home.rooms[key].floor||1)===floor);Object.assign(defaults,scaleDefaultRooms(mobileRoomLayout(keys,home.rooms),home));}
   const current=homeGrid(home),value=Math.round(Number(input.value));if(!Number.isFinite(value))return;
   current[input.dataset.homeCanvasAxis]=value;
   apply(resizeCanvas(home,current.columns,current.rows,defaults));render();
  };
 });
}
