import {latestSaveQueue} from './latest-save-queue.js?v=20260909dev305';
import {snapFurniturePosition,furnitureGridForRoom,furnitureFootprint} from './furniture-layout.js?v=20260909dev305';
import {state,runIsolatedWorld,addFurniturePlacement,updateFurniturePlacement,moveFurniturePlacement,deleteFurniturePlacement,deleteRoom,addRoom,updateRoom,setHomeFloorCount,assignFurnitureBed} from './state.js?v=20260909dev305';
import {buildSharedWorld,sharedSelection} from './shared-world.js?v=20260909dev305';
import {bindHomeEditorUI} from './home-editor-ui.js?v=20260909dev305';
import {mt} from './mailbox-center.js?v=20260909dev305';
import {bindSharedHomeMembers} from './shared-home-members.js?v=20260909dev305';
const queues=new Map();
export function bindSharedHome(root,s,render,toast,bindRoomGeometry){
 const api=window.DrawerVillageGroups,selection=sharedSelection(s),world=buildSharedWorld(s,state.uiLanguage),home=world.homes[world.activeHomeId];if(!home)return;
 const uid=window.ParallelCityAuth?.getInfo?.()?.user?.uid,canEdit=s.group?.ownerUid===uid||home.ownerUid===uid||s.members?.some(m=>(m.uid||m.id)===uid&&['owner','manager','operator'].includes(m.role)),key=uid+':'+s.activeGroupId+':'+home.id;
 const stop=e=>{e.preventDefault();e.stopImmediatePropagation()};
 function commit(){
  const layout=structuredClone({rooms:home.rooms,deletedRoomKeys:home.deletedRoomKeys||[],floorCount:home.floorCount,activeFloor:home.activeFloor});
  selection.homeDrafts??={};selection.homeDrafts[home.id]=layout;
  let queue=queues.get(key);
  if(!queue){queue=latestSaveQueue(async layout=>{
   const current=api.getSnapshot();
   if(window.ParallelCityAuth?.getInfo?.()?.user?.uid!==uid||current.activeGroupId!==s.activeGroupId)throw Error(mt('그룹이나 계정이 바뀌었어요.','The group or account changed.','グループまたはアカウントが変わりました。'));
   const record=current.homes.find(h=>h.id===home.id);if(!record)throw Error(mt('집을 찾지 못했어요.','The home could not be found.','家が見つかりません。'));
   const result=await api.saveHomeLayout({id:home.id,revision:Number(record.layoutRevision)||0,layout});
   record.layoutRevision=result.revision;record.layoutJson=JSON.stringify({...JSON.parse(record.layoutJson||'{}'),...layout});
  });queues.set(key,queue)}
  const next=queue.push(layout);next.catch(e=>toast(e.message));return next;
 }
 const change=fn=>{if(!canEdit)return;const result=runIsolatedWorld(world,fn);commit();return result};
 root.querySelectorAll('[data-home-edit]').forEach(b=>b.disabled=!canEdit);
 root.querySelectorAll('[data-room-drag],[data-room-resize]').forEach(h=>{h.disabled=!canEdit;if(canEdit&&bindRoomGeometry)bindRoomGeometry(h,h.hasAttribute('data-room-drag')?'move':'resize',{world,update:(...args)=>{runIsolatedWorld(world,()=>updateRoom(...args.slice(0,3),false));if(args[3])commit()},saveAll:()=>{}})});
 // Unconnected personal-world actions must never write into the private world.
 bindSharedHomeMembers(root,s,world,canEdit,render,toast);
 root.querySelectorAll('[data-delete-home],[data-home-image],[data-open-room-image-menu]').forEach(b=>b.disabled=true);
 root.querySelectorAll('[data-home-floor-count]').forEach(b=>b.disabled=!canEdit);
 root.addEventListener('change',e=>{if(e.target.matches('[data-home-floor-count]')){stop(e);if(canEdit){change(()=>setHomeFloorCount(home.id,e.target.value));render()}}},true);
 root.addEventListener('click',e=>{
  const b=e.target.closest('button,[data-furniture-placement],[data-open-room-editor]');if(!b)return;
  if(b.matches('[data-home-edit]')){stop(e);if(!canEdit)return;if(selection.homeEditMode){const button=b;button.disabled=true;(queues.get(key)?.done||Promise.resolve()).then(()=>{selection.homeEditMode=false;delete selection.homeDrafts?.[home.id];render()}).catch(()=>{button.disabled=false})}else{selection.homeEditMode=true;render()}return}
  if(b.matches('[data-close-home-feature]')&&b.closest('[data-home-feature="room-info"]')){stop(e);selection.homeEditMode=false;render();return}
  if(b.matches('[data-add-room]')){stop(e);change(()=>addRoom(home.id,home.activeFloor||1));render();return}
  if(b.matches('[data-open-room-editor],[data-open-furniture-layout],[data-room-info-edit]')){if(e.target.closest('[data-home-occupant],[data-home-person],[data-furniture-placement],.room-drag-handle,.room-resize-handle'))return;stop(e);if(canEdit)roomDialog(b.dataset.roomInfoEdit||b.dataset.openRoomEditor||Object.keys(home.rooms)[0]);return}
  if(b.matches('[data-furniture-placement]')&&selection.homeEditMode){stop(e);if(canEdit)furnitureDialog(b.closest('[data-room-key]')?.dataset.roomKey,b.dataset.furniturePlacement);return}
  if(selection.homeEditMode&&b.matches('[data-delete-home],[data-home-image],[data-open-room-image-menu]')){stop(e);return}
 },true);
 // Replace personal callbacks with isolated shared-world callbacks; search and drag/drop keep the existing drawer.
 if(canEdit){bindHomeEditorUI(root,{state:world,addFurniture:(id,room,item)=>change(()=>addFurniturePlacement(id,room,item)),updateFurniture:(id,room,p,patch)=>change(()=>updateFurniturePlacement(id,room,p,patch)),openRoom:(_,room)=>roomDialog(room),selectAdded:()=>render()})}
 root.querySelectorAll('[data-furniture-placement]').forEach(el=>{
  el.onpointerdown=null;if(!selection.homeEditMode||!canEdit)return;
  el.onpointerdown=e=>{
   if(e.button!==0)return;stop(e);
   const room=el.closest('[data-room-key]'),roomKey=room.dataset.roomKey,item=home.rooms[roomKey]?.furniturePlacements?.find(p=>p.id===el.dataset.furniturePlacement),canvas=room.closest('[data-room-canvas]')||room.parentElement;
   if(!item)return;
   let latest=null,ghost=null,finished=false;const pointer=e.pointerId,startX=e.clientX,startY=e.clientY;
   el.setPointerCapture(pointer);
   el.onpointermove=m=>{
    if(m.pointerId!==pointer||Math.hypot(m.clientX-startX,m.clientY-startY)<5&&!ghost)return;stop(m);
    const target=document.elementsFromPoint(m.clientX,m.clientY).map(n=>n.closest?.('.room[data-room-key]')).find(n=>n&&canvas.contains(n)),layer=target?.querySelector('.room-furniture-layer');
    if(!layer){ghost?.remove();return}
    const box=layer.getBoundingClientRect(),position=snapFurniturePosition((m.clientX-box.left)/box.width*100,(m.clientY-box.top)/box.height*100,furnitureGridForRoom(box,canvas.getBoundingClientRect()),furnitureFootprint(item.item));
    latest={roomKey:target.dataset.roomKey,...position};
    if(!ghost){ghost=el.cloneNode(true);ghost.removeAttribute('data-furniture-placement');ghost.removeAttribute('id');ghost.classList.add('furniture-drag-preview','is-dragging');ghost.inert=true;ghost.setAttribute('aria-hidden','true');el.classList.add('furniture-drag-source')}
    if(ghost.parentElement!==layer)layer.append(ghost);
    ghost.style.setProperty('--furniture-x',position.x+'%');ghost.style.setProperty('--furniture-y',position.y+'%');
   };
   const finish=m=>{if(finished||m.pointerId!==pointer)return;finished=true;el.onpointermove=null;el.onpointerup=null;el.onpointercancel=null;el.onlostpointercapture=null;ghost?.remove();el.classList.remove('furniture-drag-source');if(el.hasPointerCapture(pointer))el.releasePointerCapture(pointer);if(latest){change(()=>moveFurniturePlacement(home.id,roomKey,latest.roomKey,item.id,latest));el.addEventListener('click',stop,{once:true,capture:true});render()}};
   el.onpointerup=finish;el.onpointercancel=finish;el.onlostpointercapture=finish;
  };
 });

 function dialog(title,exitEdit=false){const d=document.createElement('dialog');d.className='mail-reader shared-home-dialog';const h=document.createElement('h2');h.textContent=title;const close=document.createElement('button');close.textContent=mt('닫기','Close','閉じる');close.onclick=()=>d.close();d.append(h,close);d.onclose=()=>{if(exitEdit)selection.homeEditMode=false;d.remove();render()};document.body.append(d);d.showModal();return d}
 function roomDialog(roomKey){const room=home.rooms[roomKey];if(!room)return;const d=dialog(mt('방 편집','Edit room','部屋の編集'),true);for(const [key,label,type] of [['name',mt('방 이름','Room name','部屋名'),'text'],['floor',mt('층','Floor','階'),'number']]){const l=document.createElement('label');l.textContent=label;const input=document.createElement('input');input.type=type;input.value=room[key]||1;if(type==='number'){input.min=1;input.max=home.floorCount||1}input.onchange=()=>change(()=>updateRoom(home.id,roomKey,{[key]:type==='number'?Math.max(1,Math.min(home.floorCount||1,Number(input.value))):input.value}));l.append(input);d.append(l)}const choose=(field,label,values)=>{const l=document.createElement('label');l.textContent=label;const select=document.createElement('select');for(const [value,ko,en,ja] of values){const o=document.createElement('option');o.value=value;o.textContent=mt(ko,en,ja);select.append(o)}select.value=room[field]||values[0][0];select.onchange=()=>change(()=>updateRoom(home.id,roomKey,{[field]:select.value}));l.append(select);d.append(l)};
 choose('type',mt('방 유형','Room type','部屋の種類'),[['living','거실','Living room','リビング'],['bedroom','침실','Bedroom','寝室'],['kitchen','주방','Kitchen','キッチン'],['bath','욕실','Bathroom','浴室'],['study','서재','Study','書斎'],['balcony','발코니','Balcony','バルコニー']]);
 choose('accessMode',mt('출입 허용','Access','入室許可'),[['everyone','모두','Everyone','全員'],['owners','방 주인만','Owners only','部屋の持ち主のみ']]);
 choose('wallMaterial',mt('벽지','Wallpaper','壁紙'),[['cream-panel','크림 몰딩 벽','Cream panel','クリームの壁'],['cream-plain','크림 벽','Cream wall','クリームの壁'],['stone-panel','석재 벽','Stone wall','石の壁'],['taupe-panel','토프 몰딩 벽','Taupe panel','トープの壁'],['sky-tile','하늘색 타일','Sky tile','空色タイル'],['navy-tile','남색 타일','Navy tile','紺色タイル'],['amber-tile','호박색 타일','Amber tile','琥珀色タイル']]);
 choose('floorMaterial',mt('바닥','Floor','床'),[['natural','내추럴 목재','Natural wood','天然木'],['apricot','살구빛 목재','Apricot wood','アプリコットの木材'],['cream','크림 목재','Cream wood','クリームの木材'],['charcoal','짙은 목재','Charcoal wood','濃い木材'],['walnut','호두나무','Walnut','ウォールナット']]);
 const owners=document.createElement('fieldset'),legend=document.createElement('legend');legend.textContent=mt('방 주인','Room owners','部屋の持ち主');owners.append(legend);for(const c of Object.values(world.characters).filter(c=>c.homeId===home.id||c.residences?.some(r=>r.homeId===home.id))){const l=document.createElement('label'),check=document.createElement('input');check.type='checkbox';check.checked=room.ownerCharacterIds?.includes(c.id)||false;check.onchange=()=>change(()=>updateRoom(home.id,roomKey,{ownerMode:'selected',ownerCharacterIds:[...owners.querySelectorAll('input:checked')].map(el=>el.value)}));check.value=c.id;l.append(check,document.createTextNode(c.name));owners.append(l)}d.append(owners);
 const remove=document.createElement('button');remove.textContent=mt('방 삭제','Delete room','部屋を削除');remove.disabled=Object.keys(home.rooms).length<=1;remove.onclick=()=>{if(!confirm(mt('이 방과 안에 배치한 가구를 삭제할까요?','Delete this room and its furniture?','この部屋と配置した家具を削除しますか？')))return;change(()=>deleteRoom(home.id,roomKey));d.close()};d.append(remove);
 const hint=document.createElement('p');hint.textContent=mt('가구는 아래 가구 목록에서 방으로 끌어 놓거나 눌러 추가할 수 있어요.','Drag furniture into a room or tap it in the catalog below.','下の家具一覧から部屋へドラッグするか、タップして追加できます。');d.append(hint)}
 function furnitureDialog(roomKey,id){const item=home.rooms[roomKey]?.furniturePlacements?.find(p=>p.id===id);if(!item)return;const d=dialog(item.item||mt('가구','Furniture','家具'));const action=(label,fn)=>{const b=document.createElement('button');b.textContent=label;b.onclick=()=>{change(fn);d.close()};d.append(b)};
  const move=document.createElement('select');move.setAttribute('aria-label',mt('다른 방으로 이동','Move to another room','別の部屋へ移動'));for(const [key,room] of Object.entries(home.rooms)){const o=document.createElement('option');o.value=key;o.textContent=room.name;move.append(o)}move.value=roomKey;move.onchange=()=>{change(()=>moveFurniturePlacement(home.id,roomKey,move.value,id,{x:50,y:60}));d.close()};d.append(move);
  action(mt('90° 회전','Rotate 90°','90°回転'),()=>updateFurniturePlacement(home.id,roomKey,id,{rotation:((item.rotation||0)+90)%360}));action(mt('좌우 뒤집기','Flip horizontally','左右反転'),()=>updateFurniturePlacement(home.id,roomKey,id,{flipped:!item.flipped}));
  for(const [field,label,min,max] of [['scale',mt('크기','Scale','大きさ'),.2,3],['x','X',0,100],['y','Y',0,100]]){const l=document.createElement('label');l.textContent=label;const input=document.createElement('input');input.type='range';input.min=min;input.max=max;input.step=field==='scale'?.1:1;input.value=item[field]??1;input.onchange=()=>change(()=>updateFurniturePlacement(home.id,roomKey,id,{[field]:Number(input.value)}));l.append(input);d.append(l)}
  if(String(item.item).includes('침대')){for(const c of Object.values(world.characters).filter(c=>c.homeId===home.id)){const l=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=(item.assignedCharacterIds||[]).includes(c.id);input.onchange=()=>change(()=>assignFurnitureBed(home.id,roomKey,id,c.id,input.checked));l.append(input,document.createTextNode(c.name));d.append(l)}}action(mt('가구 삭제','Remove furniture','家具を削除'),()=>deleteFurniturePlacement(home.id,roomKey,id));
 }
}
