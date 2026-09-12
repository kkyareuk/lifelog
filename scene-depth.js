// One batched geometry read after layout/placement, never an animation loop.
let root=null,observer=null,frame=0;
const actors='.room-furniture-item,.home-person,.room-pet,.room-couple-bed-overlay,.chair-frame-overlay';
export function scheduleSceneDepth(){
  if(frame||!root)return;
  frame=requestAnimationFrame(()=>{
    frame=0;if(!root?.isConnected)return;
    const updates=[],seats=[];
    for(const scene of root.querySelectorAll('.room,.world.town-environment')){
      const items=[...scene.querySelectorAll(scene.matches('.room')?actors:'.map-art-button,.person:not(.place-people),.meeting-walker')];
      const bounds=items.map(element=>{
        const art=element.querySelector('.furniture-sprite,.room-furniture-art,.home-person-visual .avatar,.home-person-visual .sprite,.room-pet-icon,.room-pet-photo,.room-pet-emoji,img')||element;
        const rect=art.getBoundingClientRect();
        // object-fit:contain may leave vertical padding around the actual art.
        const height=art.naturalWidth?Math.min(rect.height,rect.width*art.naturalHeight/art.naturalWidth):rect.height;
        return {element,bottom:rect.top+(rect.height+height)/2};
      });
      for(const person of items.filter(el=>el.dataset.seatId)){
        const chair=items.find(el=>el.dataset.furniturePlacement===person.dataset.seatId);
        if(!chair)continue;
        const r=(chair.querySelector('.furniture-sprite')||chair).getBoundingClientRect(),container=(person.offsetParent||scene).getBoundingClientRect(),sofa=chair.dataset.furnitureKind==='sofa';
        seats.push([person,(r.left+r.width/2-container.left)/container.width*100,(r.top+r.height*(sofa?.86:.76)-container.top)/container.height*100,r.width*(sofa?.42:.76)]);
        bounds.find(row=>row.element===person).bottom=bounds.find(row=>row.element===chair).bottom+.1;
      }
      for(const occupant of bounds.filter(row=>row.element.dataset.coupleBedId)) {
        const bed=bounds.find(row=>row.element.dataset.furniturePlacement===occupant.element.dataset.coupleBedId);
        if(bed)occupant.bottom=bed.bottom+.1;
      }
      for(const overlay of bounds.filter(row=>row.element.dataset.bedOverlay)) {
        const bed=bounds.find(row=>row.element.dataset.furniturePlacement===overlay.element.dataset.bedOverlay);
        if(bed)overlay.bottom=bed.bottom+.2;
      }
      bounds.sort((a,b)=>a.bottom-b.bottom);
      bounds.forEach(({element},index)=>updates.push([element,10+index*3]));
      // Occupancy badges are UI labels, not actors standing behind buildings.
      if(!scene.matches('.room'))scene.querySelectorAll('.place-people').forEach(element=>updates.push([element,20+bounds.length*3]));
      // Back frame remains above a table intersecting its seat, without raising
      // every chair above unrelated furniture elsewhere in the room.
      for(const item of bounds.filter(x=>x.element.matches('.chair-frame-overlay'))){
        const rect=item.element.getBoundingClientRect();
        const seated=updates.find(([person])=>person.dataset.seatId===item.element.dataset.chairFrame);
        if(seated)updates.find(row=>row[0]===item.element)[1]=Math.max(updates.find(row=>row[0]===item.element)[1],seated[1]+1);
        for(const [other,z] of updates){
          if(other.dataset.furnitureKind!=='table')continue;
          const r=other.getBoundingClientRect();
          if(r.left<rect.right&&r.right>rect.left&&r.top<rect.bottom&&r.bottom>rect.top){
            const own=updates.find(row=>row[0]===item.element);own[1]=Math.max(own[1],z+1);
          }
        }
      }
    }
    for(const [element,z] of updates)element.style.zIndex=String(z);
    for(const [person,x,y,width] of seats){
      person.classList.add('is-seated');person.style.left=x+'%';person.style.top=y+'%';person.style.setProperty('--seat-person-width',width+'px');
    }
  });
}
export function bindSceneDepth(nextRoot){
  observer?.disconnect();if(frame)cancelAnimationFrame(frame);frame=0;
  root=nextRoot;
  if(!root?.querySelector('.room,.world.town-environment'))return;
  observer=new ResizeObserver(scheduleSceneDepth);
  root.querySelectorAll('.room,.world.town-environment,.room-furniture-art,.home-person-visual').forEach(el=>observer.observe(el));
  scheduleSceneDepth();
}
