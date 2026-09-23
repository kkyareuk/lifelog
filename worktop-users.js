// A cook stands on the floor in front of the supporting counter, not on its top.
export function positionWorktopUsers(scene){
 const furniture=new Map([...scene.querySelectorAll('[data-furniture-placement]')].map(el=>[el.dataset.furniturePlacement,el]));
 for(const person of scene.querySelectorAll('.home-person[data-using-furniture]')){
  if(person.classList.contains('home-life-walking'))continue;
  const appliance=furniture.get(person.dataset.usingFurniture);
  if(!appliance)continue;
  const support=appliance.dataset.furnitureKind==='counter'?appliance:furniture.get(appliance.dataset.surfaceId);
  if(support?.dataset.furnitureKind!=='counter')continue;
  const visual=person.querySelector('.home-person-visual'),container=person.offsetParent;
  if(!visual||!container)continue;
  const base=(support.querySelector('.room-furniture-art')||support).getBoundingClientRect(),a=(appliance.querySelector('.room-furniture-art')||appliance).getBoundingClientRect(),v=visual.getBoundingClientRect(),p=container.getBoundingClientRect();
  if(!p.width||!p.height)continue;
  const left=parseFloat(person.style.left)||parseFloat(person.style.getPropertyValue('--life-x'))||50,top=parseFloat(person.style.top)||parseFloat(person.style.getPropertyValue('--life-y'))||50;
  person.style.left=left+(a.left+a.width/2-v.left-v.width/2)/p.width*100+'%';
  person.style.top=top+(base.bottom+v.height*.15-v.bottom)/p.height*100+'%';
 }
}
