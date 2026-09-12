// One batched geometry read after layout/placement, never an animation loop.
let root=null,observer=null,frame=0;
const actors='.room-furniture-item,.home-person,.room-pet,.room-couple-bed-overlay,.chair-frame-overlay';
export function scheduleSceneDepth(){
  if(frame||!root)return;
  frame=requestAnimationFrame(()=>{
    frame=0;if(!root?.isConnected)return;
    const updates=[],seats=[],pulls=[],meals=[];
    for(const scene of root.querySelectorAll('.room,.world.town-environment')){
      const items=[...scene.querySelectorAll(scene.matches('.room')?actors:'.map-art-button,.person:not(.place-people),.meeting-walker')];
      const bounds=items.map(element=>{
        const art=element.querySelector('.furniture-sprite,.room-furniture-art,.home-person-visual .avatar,.home-person-visual .sprite,.room-pet-icon,.room-pet-photo,.room-pet-emoji,img')||element;
        const rect=art.getBoundingClientRect();
        // object-fit:contain may leave vertical padding around the actual art.
        const height=art.naturalWidth?Math.min(rect.height,rect.width*art.naturalHeight/art.naturalWidth):rect.height;
        return {element,bottom:rect.top+(rect.height+height)/2};
      });
      const seated=items.filter(el=>el.dataset.seatId),usedSeats=new Set(seated.map(el=>el.dataset.seatId));
      for(const chair of items.filter(el=>el.dataset.furniturePlacement)){
        if(!usedSeats.has(chair.dataset.furniturePlacement)){pulls.push([chair,0]);const frame=items.find(el=>el.dataset.chairFrame===chair.dataset.furniturePlacement);if(frame)pulls.push([frame,0])}
      }
      for(const person of seated){
        const chair=items.find(el=>el.dataset.furniturePlacement===person.dataset.seatId);
        if(!chair)continue;
        const art=chair.querySelector('.furniture-sprite')||chair,r=art.getBoundingClientRect(),container=(person.offsetParent||scene).getBoundingClientRect(),sofa=chair.dataset.furnitureKind==='sofa';
        const prior=Number(chair.dataset.seatPull)||0,baseLeft=r.left-prior;
        const table=items.find(el=>el.dataset.furniturePlacement===chair.dataset.tableId);
        const side=chair.dataset.seatSide,sideChair=!sofa&&['left','right'].includes(chair.dataset.seatDirection);
        const width=sofa?Math.min(64,Math.max(38,(r.width>r.height?r.width:r.height)*.45)):Math.min(60,Math.max(36,r.width*.9));
        let pull=0;
        if(table&&sideChair){
          const tr=(table.querySelector('.furniture-sprite')||table).getBoundingClientRect();
          const left=side==='west'||side!=='east'&&baseLeft+r.width/2<tr.left+tr.width/2;
          const desired=left?tr.left-width*.62:tr.right+width*.62;
          pull=desired-(baseLeft+r.width/2);
        }
        pulls.push([chair,pull]);
        const frame=items.find(el=>el.dataset.chairFrame===chair.dataset.furniturePlacement);if(frame)pulls.push([frame,pull]);
        const occupants=seated.filter(el=>el.dataset.seatId===person.dataset.seatId).sort((a,b)=>Number(a.dataset.seatOrder||0)-Number(b.dataset.seatOrder||0)||(a.dataset.characterId||'').localeCompare(b.dataset.characterId||''));
        const slot=occupants.indexOf(person),sideSofa=sofa&&['left','right'].includes(chair.dataset.seatDirection);
        const x=baseLeft+pull+r.width*(sofa&&!sideSofa?(slot===0?.32:.68):.5);
        const y=r.top+r.height*(sofa?(sideSofa?(slot===0?.42:.72):.80):.66);
        person.dataset.seatSlot=String(slot);
        seats.push([person,(x-container.left)/container.width*100,(y-container.top)/container.height*100,width]);
        const row=bounds.find(row=>row.element===person),chairRow=bounds.find(row=>row.element===chair);
        row.bottom=chairRow.bottom+.1;
        if(table){
          // Seat separation keeps faces outside the tabletop. Only this table
          // receives an occupant ordering exception; unrelated depth is kept.
          const tableBottom=bounds.find(row=>row.element===table).bottom;
          if(side==='north'){chairRow.bottom=Math.min(chairRow.bottom,tableBottom-.3);row.bottom=tableBottom-.2}else if(sideChair||side==='south')row.bottom=Math.max(row.bottom,tableBottom+.1);
          if(person.classList.contains('scene-action-eating'))meals.push([table,person.dataset.characterId||person.dataset.homePerson,side||'north']);
        }
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
    for(const [element,x] of pulls){element.style.translate=x?`${x}px 0`:'';element.dataset.seatPull=String(x)}
    root.querySelectorAll('[data-seat-meal]').forEach(el=>el.remove());
    for(const [table,id,side] of meals){
      const marker=document.createElement('span');marker.dataset.seatMeal=id;marker.className='seat-meal';marker.setAttribute('aria-hidden','true');marker.textContent='🍛';
      const [x,y]=({north:[50,24],south:[50,65],west:[25,45],east:[75,45]})[side]||[50,35];
      marker.style.cssText=`position:absolute;left:${x}%;top:${y}%;transform:translate(-50%,-50%);font-size:clamp(18px,4vw,24px)!important;line-height:1!important;pointer-events:none`;const surface=table.querySelector('.room-furniture-art')||table;if(surface!==table)surface.style.position='relative';surface.append(marker);
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
