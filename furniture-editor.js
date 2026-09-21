import {bindFurnitureDrag} from './furniture-drag.js';
import {furnitureSprite} from './furniture-sprites.js';
import {furnitureFootprint,isBedFurniture} from './furniture-layout.js';
import {bedPerspective} from './bed-perspective.js?v=20260909dev305';
import {fitFurnitureSelection} from './home-editor-ui.js';
import {homeEditorCopy} from './home-editor-ui.js?v=20260909dev305';
import {scheduleSceneDepth} from './scene-depth.js?v=20260909dev305';

function setFurniturePlacementStyle(element,placement){
  if(!element||!placement)return;
  element.style.setProperty("--furniture-x",`${placement.x}%`);
  element.style.setProperty("--furniture-y",`${placement.y}%`);
  element.style.setProperty("--furniture-scale",String(placement.scale));
  const perspective=bedPerspective(placement),couple=placement.item==='커플 침대',sprite=furnitureSprite(placement);
  element.style.setProperty("--furniture-rotation",`${sprite?0:couple?perspective.artRotation:placement.rotation}deg`);
  element.style.setProperty("--furniture-layer",String(placement.layer));
  element.style.setProperty("--furniture-flip",String(sprite?.flip??(couple?perspective.artFlip:placement.flipped?-1:1)));
  if(couple){element.dataset.bedSide=String(perspective.side);element.dataset.bedDirection=String(perspective.direction);element.querySelectorAll('.couple-bed-layer').forEach(image=>{const layer=['base','quilt','footboard'].find(key=>image.classList.contains('couple-bed-'+key));image.src=`assets/furniture/couple-bed/couple-bed-${perspective.side?'side-':''}${layer}.${perspective.side?'svg':'png'}`})}
  if(sprite){
    element.style.setProperty("--sprite-width",String(sprite.width/527*2*sprite.scale/furnitureFootprint(placement.item).columns));
    element.style.setProperty("--sprite-ratio",String(sprite.width/sprite.height));
    const art=element.querySelector('.furniture-sprite');if(sprite.kind==='counter')art.style.borderImageSource=`url(${sprite.src})`;else art.src=sprite.src;
    element.dataset.surfaceRotation=placement.rotation;element.dataset.seatDirection=sprite.direction;const grid=element.querySelector('.furniture-surface-grid');if(grid)grid.dataset.surfaceSide=String(['left','right'].includes(sprite.direction));
    const layer=element.closest('.room-furniture-layer');
    let overlay=[...layer.querySelectorAll('[data-chair-frame]')].find(el=>el.dataset.chairFrame===placement.id);
    if(sprite.frame){
      if(!overlay){overlay=document.createElement('span');overlay.className='chair-frame-overlay';overlay.dataset.chairFrame=placement.id;overlay.innerHTML='<span class="room-furniture-art"><img class="furniture-sprite" alt=""></span>';layer.append(overlay)}
      overlay.style.cssText=element.style.cssText;overlay.querySelector('img').src=sprite.frame;
    }else overlay?.remove();
  }
  scheduleSceneDepth();
  element.dataset.furnitureFacing=placement.facing||"front";
  fitFurnitureSelection(element);
}

export function bindFurnitureEditor(root,{state,updateFurniturePlacement,moveFurniturePlacement,deleteFurniturePlacement,setActiveHomeFloor,render,openFurniturePropsDialog,openBedAssignmentDialog,pending=null,onPending=()=>{}}){
  if(!root)return;
  let pendingFurnitureSelection=pending;
  const rerender=()=>{onPending(pendingFurnitureSelection);render()};
  const toolbar=root.querySelector("[data-furniture-edit-toolbar]");
  if(!toolbar)return;
  let selected=null;
  const positionToolbar=()=>{
    if(!selected?.isConnected||toolbar.hidden)return;
    if(!toolbar.closest('.home-editor-dock')){toolbar.style.removeProperty('top');toolbar.style.removeProperty('bottom');}

  };
  root?.addEventListener('scroll',positionToolbar,true);
  const clearSelection=()=>{
    root.querySelectorAll("[data-furniture-placement].is-selected").forEach(item=>item.classList.remove("is-selected"));
    selected=null;toolbar.hidden=true;
  };
  const selectFurniture=element=>{
    if(!element)return;
    root.querySelectorAll("[data-furniture-placement].is-selected").forEach(item=>item.classList.remove("is-selected"));
    selected=element;element.classList.add("is-selected");toolbar.hidden=false;toolbar.classList.remove("is-collapsed");
    fitFurnitureSelection(element);
    const image=element.querySelector(".couple-bed-base");if(image&&!image.complete)image.addEventListener("load",()=>{if(element.isConnected)fitFurnitureSelection(element)},{once:true});
    const placement=state.homes[element.dataset.homeId]?.rooms?.[element.dataset.roomKey]?.furniturePlacements?.find(item=>item.id===element.dataset.furniturePlacement);
    const copy=homeEditorCopy(state.uiLanguage),facing=toolbar.querySelector("[data-furniture-facing-label]");
    if(facing){facing.textContent=copy[placement?.facing||"front"];facing.title=placement?.facing&&placement.facing!=="front"?copy.missingSide:""}
    const assign=toolbar.querySelector('[data-furniture-command="assign"]');if(assign)assign.hidden=!isBedFurniture(placement?.item);
    toolbar.dataset.homeId=element.dataset.homeId||"";
    toolbar.dataset.roomKey=element.dataset.roomKey||"";
    toolbar.dataset.placementId=element.dataset.furniturePlacement||"";
    const destination=toolbar.querySelector('[data-furniture-move-room]');if(destination)destination.value=element.dataset.roomKey;
    const name=toolbar.querySelector("[data-furniture-edit-name]");if(name)name.textContent=element.dataset.furnitureName||"가구";
    const props=toolbar.querySelector('[data-furniture-command="props"]');if(props)props.hidden=element.dataset.furnitureSupportsProps!=="true";
    positionToolbar();element.dispatchEvent(new CustomEvent('furniture-selection',{bubbles:true}));
  };
  bindFurnitureDrag(root,{resize:(el,span)=>{updateFurniturePlacement(el.dataset.homeId,el.dataset.roomKey,el.dataset.furniturePlacement,{counterSpan:span});pendingFurnitureSelection={homeId:el.dataset.homeId,roomKey:el.dataset.roomKey,placementId:el.dataset.furniturePlacement};rerender()},getHome:id=>state.homes[id],select:selectFurniture,language:state.uiLanguage,move:(element,position)=>{
    const {homeId,roomKey,furniturePlacement:id}=element.dataset;
    if(moveFurniturePlacement(homeId,roomKey,position.roomKey,id,position)){pendingFurnitureSelection={homeId,roomKey:position.roomKey,placementId:id};rerender()}
  }});
  const destination=toolbar.querySelector('[data-furniture-move-room]');
  if(destination)destination.onchange=()=>{
    const {homeId,roomKey,placementId}=toolbar.dataset,toRoomKey=destination.value;
    if(moveFurniturePlacement(homeId,roomKey,toRoomKey,placementId)){
      setActiveHomeFloor(homeId,state.homes[homeId].rooms[toRoomKey].floor||1);
      pendingFurnitureSelection={homeId,roomKey:toRoomKey,placementId};rerender();
    }else destination.value=roomKey;
  };
  const toolbarToggle=toolbar.querySelector('[data-furniture-toolbar-toggle]');
  if(toolbarToggle)toolbarToggle.onclick=event=>{
    event.preventDefault();event.stopPropagation();
    const collapsed=toolbar.classList.toggle('is-collapsed'),copy=homeEditorCopy(state.uiLanguage);
    toolbarToggle.setAttribute('aria-expanded',String(!collapsed));
    toolbarToggle.setAttribute('aria-label',collapsed?copy.expand:copy.collapse);
    toolbarToggle.textContent=collapsed?'＋':'−';
    positionToolbar();
  };
  toolbar.querySelectorAll("[data-furniture-command]").forEach(button=>button.onclick=event=>{
    event.preventDefault();event.stopPropagation();
    const command=button.dataset.furnitureCommand;
    if(command==="done"){clearSelection();return}
    const {homeId,roomKey,placementId}=toolbar.dataset;
    const current=state.homes[homeId]?.rooms?.[roomKey]?.furniturePlacements?.find(item=>item.id===placementId);if(!current)return;
    if(command==="props"){openFurniturePropsDialog?.(homeId,roomKey,placementId);return}
    if(command==="assign"){openBedAssignmentDialog?.(homeId,roomKey,placementId,{returnToFurniture:false});return}
    if(command==="delete"){
      if(confirm(`‘${current.item}’ 가구를 방에서 치울까요?`)){deleteFurniturePlacement(homeId,roomKey,placementId);pendingFurnitureSelection=null;rerender()}
      return;
    }
    const patch=command==="smaller"?{scale:current.scale-.25}
      :command==="larger"?{scale:current.scale+.25}
      :command==="rotate"?{rotation:(Number(current.rotation)||0)+90}
      :command==="flip"?{flipped:!current.flipped}
      :command==="back"?{layerAction:"back"}
      :command==="front"?{layerAction:"front"}:{};
    const next=updateFurniturePlacement(homeId,roomKey,placementId,patch,true);if(next&&selected){setFurniturePlacementStyle(selected,next);selectFurniture(selected)}
  });
  root.addEventListener('click',event=>{const el=event.target.closest('[data-furniture-placement]');if(el&&event.detail===0)selectFurniture(el)});
  if(pendingFurnitureSelection){
    const target=[...root.querySelectorAll("[data-furniture-placement]")].find(element=>element.dataset.homeId===pendingFurnitureSelection.homeId&&element.dataset.roomKey===pendingFurnitureSelection.roomKey&&element.dataset.furniturePlacement===pendingFurnitureSelection.placementId);
    if(target)requestAnimationFrame(()=>{selectFurniture(target)});
    pendingFurnitureSelection=null;
  }
}
