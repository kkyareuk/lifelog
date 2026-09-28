export function positionDeskUsers(scene){
 for(const desk of scene.querySelectorAll('[data-furniture-kind="desk"]')){
  const image=desk.querySelector('.furniture-sprite');if(!image)continue;const r=image.getBoundingClientRect(),container=desk.offsetParent,origin=container.getBoundingClientRect(),sx=origin.width/container.offsetWidth||1,sy=origin.height/container.offsetHeight||1,z=Number(desk.style.zIndex)||10;
  const frame=[...scene.querySelectorAll('[data-chair-frame]')].find(e=>e.dataset.chairFrame===desk.dataset.furniturePlacement);
  if(frame){frame.style.cssText=`left:${(r.left-origin.left)/sx-container.clientLeft}px;top:${(r.top-origin.top)/sy-container.clientTop}px;width:${r.width/sx}px;height:${r.height/sy}px;padding:0;transform:none;z-index:${z+2};--furniture-flip:${getComputedStyle(desk).getPropertyValue('--furniture-flip')||1}`;frame.querySelector('.room-furniture-art').style.cssText='width:100%;height:100%';}
  if(scene.closest('.is-editing'))continue;
  for(const person of scene.querySelectorAll('.home-person')){
   if(person.dataset.usingFurniture!==desk.dataset.furniturePlacement||person.classList.contains('home-life-walking'))continue;
   const avatar=person.querySelector('.home-person-visual .avatar,.home-person-visual .sprite');if(!avatar)continue;const a=avatar.getBoundingClientRect(),p=person.offsetParent.getBoundingClientRect();
   person.style.left=((parseFloat(person.style.left)||parseFloat(person.style.getPropertyValue('--life-x'))||50)+(r.left+r.width*.5-a.left-a.width/2)/p.width*100)+'%';person.style.top=((parseFloat(person.style.top)||parseFloat(person.style.getPropertyValue('--life-y'))||50)+(r.top+r.height*.52-a.top-a.height*.7)/p.height*100)+'%';person.style.zIndex=String(z+1);
  }
 }
}
