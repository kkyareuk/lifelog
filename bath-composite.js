// Composite art shares the real furniture rectangle, including room zoom.
export function positionBathUsers(scene){
 const editing=!!scene.closest('.is-editing');
 for(const tub of scene.querySelectorAll('[data-furniture-kind="bathtub"]')){
  const people=[...scene.querySelectorAll('.home-person')].filter(p=>!editing&&p.dataset.usingFurniture===tub.dataset.furniturePlacement&&!p.classList.contains('home-life-walking'));
  const image=tub.querySelector('.furniture-sprite');if(!image)continue;
  const path='assets/furniture/wood/',src=path+(people.length?'bathtub-back.png':'bathtub-front.png');if(!image.src.endsWith(src))image.src=src;
  let layers=[...scene.querySelectorAll('[data-bath-layer]')].filter(e=>e.dataset.bathId===tub.dataset.furniturePlacement);
  if(!people.length){layers.forEach(e=>e.remove());continue}
  const layer=tub.parentElement,box=image.getBoundingClientRect(),container=tub.offsetParent,origin=container.getBoundingClientRect(),sx=origin.width/container.offsetWidth||1,sy=origin.height/container.offsetHeight||1,z=Number(tub.style.zIndex)||10;
  if(!layers.length){for(const name of ['water-back','water-front','frame']){const e=document.createElement('span');e.className='bath-composite-layer';e.dataset.bathLayer=name;e.dataset.bathId=tub.dataset.furniturePlacement;e.innerHTML=`<img alt="" src="${path+(name==='frame'?'bathtub-frame':'bath-'+name)}.png">`;layer.append(e);layers.push(e)}}
  for(const e of layers){const name=e.dataset.bathLayer,water=name!=='frame',front=name==='water-front';e.style.cssText=`left:${(box.left-origin.left)/sx-container.clientLeft}px;top:${(box.top-origin.top)/sy-container.clientTop}px;width:${box.width/sx}px;height:${box.height/sy}px;z-index:${z+(front?3:water?1:4)};--bath-flip:${getComputedStyle(tub).getPropertyValue('--furniture-flip')||1}`;e.querySelector('img').style.cssText=water?`left:5%;width:92.7%;top:${front?49:27}%;height:${front?41.3:54.3}%`:'';}
  for(const [i,p] of people.entries()){
   p.classList.add('is-bathing');const v=p.querySelector('.home-person-visual'),avatar=v?.querySelector('.avatar,.sprite');if(!v||!avatar)continue;
   const parent=p.offsetParent.getBoundingClientRect(),r=avatar.getBoundingClientRect(),x=box.left+box.width*(people.length>1?(i===0?.35:.65):.5),y=box.top+box.height*.47;
   p.style.left=((parseFloat(p.style.left)||parseFloat(p.style.getPropertyValue('--life-x'))||50)+(x-r.left-r.width/2)/parent.width*100)+'%';p.style.top=((parseFloat(p.style.top)||parseFloat(p.style.getPropertyValue('--life-y'))||50)+(y-r.top-r.height*.65)/parent.height*100)+'%';p.style.zIndex=String(z+2);
  }
 }
}
