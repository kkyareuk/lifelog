import {showRoomEditor} from './room-editor-dialog.js';
import {translateDynamicInterface} from './views.js?v=20260909dev305';
import {canEditSharedHome} from './shared-home-access.js';
import {bindHomeCanvas} from './home-canvas.js';
import {addSharedRoomPhotos,sharedImageSession} from './shared-home-photo.js';
import {bindRoomSurfacePicker} from './room-surface-picker.js';
import {showFurnitureProps} from './furniture-props-editor.js';
import {bindSharedHomeDeletion} from './shared-home-delete.js';
import {bindFurnitureEditor} from './furniture-editor.js';
import {latestSaveQueue} from './latest-save-queue.js?v=20260909dev305';
import {state,runIsolatedWorld,addFurniturePlacement,updateFurniturePlacement,moveFurniturePlacement,deleteFurniturePlacement,addFurnitureProp,deleteFurnitureProp,deleteRoom,addRoom,updateRoom,setRoomType,setHomeFloorCount,assignFurnitureBed} from './state.js?v=20260909dev305';
import {buildSharedWorld,sharedSelection} from './shared-world.js?v=20260909dev305';
import {bindHomeEditorUI} from './home-editor-ui.js?v=20260909dev305';
import {mt} from './mailbox-center.js?v=20260909dev305';
import {bindSharedHomeMembers} from './shared-home-members.js?v=20260909dev305';
const queues=new Map();
export function bindSharedHome(root,s,render,toast,bindRoomGeometry,space=null,prepareImage){
 const api=window.DrawerVillageGroups,selection=space?.selection||sharedSelection(s),world=space?.world||buildSharedWorld(s,state.uiLanguage),home=world.homes[world.activeHomeId];if(!home)return;
 const uid=window.ParallelCityAuth?.getInfo?.()?.user?.uid,canEdit=space?space.canEdit:canEditSharedHome(s,home.id,uid),key=uid+':'+s.activeGroupId+':'+home.id;
 const stop=e=>{e.preventDefault();e.stopImmediatePropagation()};
 function commit(){
  const layout=structuredClone({rooms:home.rooms,roomPresets:home.roomPresets||[],deletedRoomKeys:home.deletedRoomKeys||[],floorCount:home.floorCount,activeFloor:home.activeFloor,canvasColumns:home.canvasColumns,canvasRows:home.canvasRows,canvasFitVersion:home.canvasFitVersion});
  if(space)return Promise.resolve(space.commit(layout));
  selection.homeDrafts??={};selection.homeDrafts[home.id]=layout;
  let queue=queues.get(key);
  if(!queue){queue=latestSaveQueue(async layout=>{
   const current=api.getSnapshot();
   if(window.ParallelCityAuth?.getInfo?.()?.user?.uid!==uid||current.activeGroupId!==s.activeGroupId)throw Error(mt('그룹이나 계정이 바뀌었어요.','The group or account changed.','グループまたはアカウントが変わりました。'));
   const record=current.homes.find(h=>h.id===home.id);if(!record)throw Error(mt('집을 찾지 못했어요.','The home could not be found.','家が見つかりません。'));
   const result=await api.saveHomeLayout({id:home.id,revision:Number(record.layoutRevision)||0,layout});
   record.layoutRevision=result.revision;record.layoutJson=JSON.stringify({...JSON.parse(record.layoutJson||'{}'),...layout});
   if(JSON.stringify(selection.homeDrafts?.[home.id])===JSON.stringify(layout))delete selection.homeDrafts[home.id];
  });queues.set(key,queue)}
  const next=queue.push(layout);next.catch(e=>toast(e.message));return next;
 }
 bindHomeCanvas(root,{home,canEdit,scope:s.activeGroupId,apply:patch=>{Object.assign(home,patch);commit()},render});
 const photoOptions={...(s.activeGroupId?sharedImageSession():{}),flush:commit};
 const change=fn=>{if(!canEdit)return;const result=runIsolatedWorld(world,fn);commit();return result};
 root.querySelectorAll('[data-home-edit]').forEach(b=>b.disabled=!canEdit);
 root.querySelectorAll('[data-room-drag],[data-room-resize]').forEach(h=>{h.disabled=!canEdit;if(canEdit&&bindRoomGeometry)bindRoomGeometry(h,h.hasAttribute('data-room-drag')?'move':'resize',{world,update:(...args)=>{runIsolatedWorld(world,()=>updateRoom(...args.slice(0,3),false));if(args[3])commit()},saveAll:()=>{}})});
 // Unconnected personal-world actions must never write into the private world.
 if(!space)bindSharedHomeMembers(root,s,world,canEdit&&(home.ownerUid===uid||s.group?.ownerUid===uid||s.members?.some(m=>(m.uid||m.id)===uid&&['owner','manager','operator'].includes(m.role))),render,toast);
 root.querySelectorAll('[data-home-image],[data-open-room-image-menu]').forEach(b=>b.disabled=true);
 if(!space)bindSharedHomeDeletion(root,s,render,toast,async id=>{const queueKey=uid+':'+s.activeGroupId+':'+id;await (queues.get(queueKey)?.done||Promise.resolve());queues.delete(queueKey)});
 root.querySelectorAll('[data-home-floor-count]').forEach(b=>b.disabled=!canEdit);
 root.addEventListener('change',e=>{if(e.target.matches('[data-home-floor-select]')){stop(e);selection.floors??={};selection.floors[home.id]=Math.max(1,Math.min(home.floorCount||1,Number(e.target.value)||1));render()}},true);
 root.addEventListener('change',e=>{if(e.target.matches('[data-home-floor-count]')){stop(e);if(canEdit){change(()=>setHomeFloorCount(home.id,e.target.value));render()}}},true);
 root.addEventListener('click',e=>{
  const b=e.target.closest('button,[data-furniture-placement],[data-open-room-editor]');if(!b)return;
  if(b.matches('[data-home-edit]')){stop(e);if(!canEdit)return;if(selection.homeEditMode){const button=b;button.disabled=true;commit().then(()=>{selection.homeEditMode=false;delete selection.homeDrafts?.[home.id];render()}).catch(error=>{button.disabled=false;toast(error.message)})}else{selection.editStart=structuredClone(home.rooms);selection.homeEditMode=true;render()}return}
  if(b.matches('[data-home-edit-cancel]')&&space){stop(e);if(selection.editStart)home.rooms=structuredClone(selection.editStart);commit().then(()=>{selection.homeEditMode=false;render()}).catch(error=>toast(error.message));return}
  if(b.matches('[data-close-home-feature]')&&b.closest('[data-home-feature="room-info"]')){stop(e);selection.homeEditMode=false;render();return}
  if(b.matches('[data-add-room]')){stop(e);change(()=>addRoom(home.id,home.activeFloor||1));render();return}
  if(b.matches('[data-open-room-editor],[data-open-furniture-layout],[data-room-info-edit]')){if(e.target.closest('[data-home-occupant],[data-home-person],[data-furniture-placement],.room-drag-handle,.room-resize-handle'))return;stop(e);if(canEdit)roomDialog(b.dataset.roomInfoEdit||b.dataset.openRoomEditor||Object.keys(home.rooms)[0]);return}
  if(b.matches('[data-furniture-placement]')&&selection.homeEditMode)return;
  if(selection.homeEditMode&&b.matches('[data-delete-home],[data-home-image],[data-open-room-image-menu]')){stop(e);return}
 },true);
 // Replace personal callbacks with isolated shared-world callbacks; search and drag/drop keep the existing drawer.
 if(canEdit){bindHomeEditorUI(root,{state:world,photoOptions,addFurniture:(id,room,item)=>change(()=>addFurniturePlacement(id,room,item)),updateFurniture:(id,room,p,patch)=>change(()=>updateFurniturePlacement(id,room,p,patch)),openRoom:(_,room)=>roomDialog(room),addFloor:()=>{change(()=>setHomeFloorCount(home.id,Math.min(5,(home.floorCount||1)+1)));selection.floors??={};selection.floors[home.id]=home.floorCount;render()},selectAdded:()=>render()})}
 if(selection.homeEditMode&&canEdit)bindFurnitureEditor(root,{state:world,render,photoOptions,
  updateFurniturePlacement:(...args)=>change(()=>updateFurniturePlacement(...args)),
  moveFurniturePlacement:(...args)=>change(()=>moveFurniturePlacement(...args)),
  deleteFurniturePlacement:(...args)=>change(()=>deleteFurniturePlacement(...args)),
  setActiveHomeFloor:()=>{},pending:selection.furnitureSelection,onPending:value=>selection.furnitureSelection=value,
  openFurniturePropsDialog:(id,room,p)=>showFurnitureProps(id,room,p,{state:world,addFurnitureProp:(...args)=>change(()=>addFurnitureProp(...args)),deleteFurnitureProp:(...args)=>change(()=>deleteFurnitureProp(...args)),onClose:value=>{selection.furnitureSelection=value;render()}}),
  openBedAssignmentDialog:(_,room,id)=>furnitureDialog(room,id)
 });
 selection.furnitureSelection=null;

 function dialog(title,exitEdit=false){const d=document.createElement('dialog');d.className='mail-reader shared-home-dialog home-design-page';const h=document.createElement('h2');h.textContent=title;const close=document.createElement('button');close.textContent=mt('닫기','Close','閉じる');close.onclick=()=>d.close();const head=document.createElement('header');head.className='home-design-head';close.className='home-design-back';close.setAttribute('aria-label',mt('닫기','Close','閉じる'));close.textContent='';head.append(close,h);d.append(head);d.onclose=()=>{if(exitEdit)selection.homeEditMode=false;d.remove();render()};document.body.append(d);d.showModal();return d}
 function roomDialog(roomKey){
  if(!canEdit)return;
  return showRoomEditor(home.id,roomKey,{state:world,render,translateDynamicInterface,showToast:toast,
   updateRoom:(...args)=>runIsolatedWorld(world,()=>updateRoom(...args.slice(0,3),false)),
   setRoomType:(...args)=>runIsolatedWorld(world,()=>setRoomType(...args)),
   deleteRoom:(...args)=>change(()=>deleteRoom(...args)),save:commit,explicitSave:()=>{commit();render()},
   configurePhotos:(d,{sync,room})=>{
    const apply=async patch=>{Object.assign(room,patch);await commit();d.close('reopen');roomDialog(roomKey)};
    const photo=d.querySelector('[data-edit-room-photo]'),floor=d.querySelector('[data-edit-room-floor]');
    const choose=async()=>{sync();try{const image=await space.choosePhoto();if(image&&d.isConnected)await apply({image,floorImage:image,usePhoto:true,floorMaterial:'custom'})}catch(e){toast(e.message)}};
    if(space){photo.onclick=choose;floor.onclick=choose;photo.disabled=!space.choosePhoto;if(space.allowRoomPhotos===false){d.querySelector('[name="usePhoto"]').disabled=true;floor.disabled=true;for(const o of d.querySelectorAll('[name="floorMaterial"] option'))if(['custom','customTile'].includes(o.value))o.disabled=true;}}
    else if(prepareImage){const uploads=document.createElement('div');uploads.hidden=true;d.append(uploads);addSharedRoomPhotos(uploads,{room,prepareImage,language:world.uiLanguage,toast,apply});photo.onclick=()=>{sync();uploads.querySelector('[data-shared-room-photo="image"]').click()};floor.onclick=()=>{sync();uploads.querySelector('[data-shared-room-photo="floorImage"]').click()};}
    else{photo.disabled=true;floor.disabled=true;}
    const close=d.onclose;d.onclose=()=>{close();commit()};
   }
  });
 }
 function furnitureDialog(roomKey,id){const item=home.rooms[roomKey]?.furniturePlacements?.find(p=>p.id===id);if(!item)return;const d=dialog(mt('침대 배정','Assign bed','ベッドの割り当て'));const action=(label,fn)=>{const b=document.createElement('button');b.textContent=label;b.onclick=()=>{change(fn);d.close()};d.append(b)};
  if(String(item.item).includes('침대')){for(const c of Object.values(world.characters).filter(c=>c.homeId===home.id)){const l=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=(item.assignedCharacterIds||[]).includes(c.id);input.onchange=()=>change(()=>assignFurnitureBed(home.id,roomKey,id,c.id,input.checked));l.append(input,document.createTextNode(c.name));d.append(l)}}action(mt('가구 삭제','Remove furniture','家具を削除'),()=>deleteFurniturePlacement(home.id,roomKey,id));
 }
}
