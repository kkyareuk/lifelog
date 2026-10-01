// Apply the configured screen-pixel floor to walking, standing and seated actors.
// Bed occupants keep their art-aware pillow layout in bed-occupant-layout.js.
export function sizeRoomOccupants(root){
 const actors=[...root.querySelectorAll('.home-person:not(.is-using-couple-bed)')];
 const visuals=actors.map(actor=>({actor,face:actor.querySelector('.home-person-visual .avatar,.home-person-visual .sprite')})).filter(x=>x.face);
 for(const {face} of visuals){if(face.dataset.screenMinimum){face.style.removeProperty('min-width');face.style.removeProperty('min-height');delete face.dataset.screenMinimum}}
 const sizes=visuals.map(({actor,face})=>{const minimum=[0,24,32,40].includes(Number(actor.dataset.roomIconMinimum))?Number(actor.dataset.roomIconMinimum):32,rect=face.getBoundingClientRect();return {face,minimum,rect,width:face.offsetWidth,height:face.offsetHeight}});
 for(const {face,minimum,rect,width,height} of sizes){if(!minimum||!rect.width||!rect.height)continue;if(Math.min(rect.width,rect.height)<minimum){const ratio=minimum/Math.min(rect.width,rect.height);face.style.setProperty('min-width',`${width*ratio}px`,'important');face.style.setProperty('min-height',`${height*ratio}px`,'important');face.dataset.screenMinimum='1'}}
}
