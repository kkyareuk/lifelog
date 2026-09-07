import {sharedSelection,withSharedWorld,decodeShared} from './shared-world.js?v=20260907dev268';
import {state} from './state.js?v=20260907dev268';
import {renderGroupRelations} from './groups.js?v=20260907dev268';
const messages={"다른 구성원이 먼저 수정했어요. 새 배치를 확인한 뒤 다시 시도해 주세요.":["Another member edited this town. Refresh the layout and try again.","他のメンバーが先に編集しました。配置を確認してもう一度お試しください。"],"저장하지 못했어요":["Could not save.","保存できませんでした。"],"건물 편집 권한이 필요해요":["Building editing permission is required.","建物の編集権限が必要です。"],"내 캐릭터의 시선만 설정할 수 있어요":["You can only edit your own character’s viewpoint.","自分のキャラクターの視線だけを設定できます。"],"관계 제안을 보냈어요":["Relationship proposal sent.","関係の提案を送りました。"],"저장했어요":["Saved.","保存しました。"],"이 항목의 공유 편집 연결은 준비 중이에요":["Shared editing for this item is not available yet.","この項目の共有編集は準備中です。"],"이 시선 설정을 초기화할까요?":["Reset this viewpoint?","この視線設定を初期化しますか？"],"이 건물을 삭제할까요?":["Delete this building?","この建物を削除しますか？"],"삭제할까요?":["Delete this item?","削除しますか？"],"내 마을":["My town","自分のタウン"]};
const tr=text=>messages[text]?.[{en:0,ja:1}[state.uiLanguage]]||text;
const api=()=>window.DrawerVillageGroups, snapshot=()=>api()?.getSnapshot?.(),uid=()=>window.ParallelCityAuth?.getInfo?.()?.user?.uid;
export const activeShared=()=>{const s=snapshot();return s?.activeGroupId&&s.group?s:null};
export const canEditShared=s=>['owner','manager','operator'].includes(s.members?.find(m=>(m.uid||m.id)===uid())?.role||s.role||(s.group?.ownerUid===uid()?'owner':''));
const town=s=>s.group.towns?.find(t=>t.id===s.selectedTownId)||s.group.towns?.[0];
let serial=Promise.resolve();
function enqueue(run,toast){const next=serial.then(run);serial=next.catch(e=>toast(e.code==='groups/edit-conflict'?'다른 구성원이 먼저 수정했어요. 새 배치를 확인한 뒤 다시 시도해 주세요.':e.message||e.code||'저장하지 못했어요'));return next.catch(()=>false)}
function applyTown(s,result){if(result.town&&activeShared()?.activeGroupId===s.activeGroupId){const current=snapshot();current.group.towns=current.group.towns.map(t=>t.id===result.town.id?result.town:t);current.group.buildingRevision=result.revision}}
export function bindSharedUi({render,toast:notify,setMode,setPanel,setPlacement,openMap,openShape,openRelation,openGroup}){
 const toast=value=>notify(tr(value));
 const s=activeShared();if(!s)return;const root=document.querySelector('.relationship-page,.mobile-town-shell,.home-page');if(!root)return;
 const proposalButton=document.createElement('button');proposalButton.type='button';proposalButton.textContent=({ko:'받은 제안 · 보낸 제안',en:'Received and sent proposals',ja:'受信・送信した提案'}[state.uiLanguage]);proposalButton.onclick=official;root.querySelector('[data-official-relation-dialog]')?.append(proposalButton);
 const select=sharedSelection(s),owned=id=>s.residents?.find(r=>r.id===id)?.ownerUid===uid();
 const stop=e=>{e.preventDefault();e.stopImmediatePropagation()};
 const saveBuilding=(id,patch={},extra={})=>enqueue(async()=>{const current=activeShared();if(current?.activeGroupId!==s.activeGroupId)throw Error('Group changed');if(!canEditShared(current))throw Error('건물 편집 권한이 필요해요');const result=await api().saveBuilding({id,townId:town(current).id,revision:current.group.buildingRevision||0,patch,...extra});applyTown(current,result);render()},toast);
 const saveView=(sourceId,targetId,field,value,reset=false)=>enqueue(async()=>{if(!owned(sourceId))throw Error('내 캐릭터의 시선만 설정할 수 있어요');await api().saveView({sourceId,targetId,field,value,reset});const current=activeShared();if(current?.activeGroupId!==s.activeGroupId)return;current.perceptions??=[];let p=current.perceptions.find(p=>p.sourceId===sourceId&&p.targetId===targetId);if(!p){p={sourceId,targetId};current.perceptions.push(p)}p.viewJson=JSON.stringify(reset?{}:{...decodeShared(p.viewJson),[field]:value});},toast);

 const saveItem=(kind,id,patch={},extra={})=>kind==='place'?saveBuilding(id,Object.fromEntries(Object.entries(patch).filter(([k])=>!['x','y'].includes(k))),{...('x' in patch?{x:patch.x}:{}),...('y' in patch?{y:patch.y}:{}),...extra}):enqueue(async()=>{
   const current=activeShared();if(current?.activeGroupId!==s.activeGroupId)throw Error('Group changed');
   const result=await api()[kind==='home'?'saveHomePlacement':'saveDecoration']({id,patch,...extra,townId:town(current).id,revision:current.group.buildingRevision||0});
   if(result.home){const h=current.homes.find(h=>h.id===id);if(h)Object.assign(h,result.home);else current.homes.push(result.home);current.group.buildingRevision=result.revision}else applyTown(current,result);render();return true;
 },toast);
 const saveTown=patch=>enqueue(async()=>{const current=activeShared();if(current?.activeGroupId!==s.activeGroupId)throw Error('Group changed');const result=await api().saveTown({townId:town(current).id,revision:current.group.buildingRevision||0,patch});applyTown(current,result);render()},toast);
 const itemFor=el=>el?.dataset.place?['place',town(snapshot()).places.find(p=>p.id===el.dataset.place)]:el?.dataset.homeMap?['home',snapshot().homes.find(h=>h.id===el.dataset.homeMap)]:['decoration',town(snapshot()).decorations?.find(d=>d.id===el?.dataset.townDecoration)];
 const history=select.history??={undo:[],redo:[]};
 root.querySelectorAll('[data-town-placement-command=undo],[data-town-placement-command=redo]').forEach(el=>el.disabled=!canEditShared(s)||!history[el.dataset.townPlacementCommand].length);
 function moveItem(kind,item,patch){const before=Object.fromEntries(Object.keys(patch).map(k=>[k,item[k]??(['mapX','mapY','x','y'].includes(k)?50:['scale','mapScale','imageScale'].includes(k)?1:['flipX','mapFlipX'].includes(k)?false:0)]));saveItem(kind,item.id,patch).then(ok=>{if(ok!==false){history.undo.push({kind,id:item.id,before,after:patch});history.redo=[];render()}})}
 function official(){const dialog=document.createElement('dialog');dialog.className='directory-create-dialog shared-official-dialog';dialog.innerHTML=renderGroupRelations(snapshot());document.body.append(dialog);dialog.querySelector('[data-shared-dialog-close]').onclick=()=>dialog.close();dialog.onclose=()=>{dialog.remove();render()};dialog.querySelector('[data-group-proposal]')?.addEventListener('submit',e=>{e.preventDefault();const input=Object.fromEntries(new FormData(e.currentTarget));enqueue(async()=>{await api().propose(input);dialog.close();toast('관계 제안을 보냈어요')},toast)});dialog.querySelectorAll('[data-group-response]').forEach(form=>form.onsubmit=e=>{e.preventDefault();enqueue(async()=>{await api().respond({proposalId:form.dataset.groupResponse,accept:e.submitter?.name==='accept',reason:form.elements.reason.value});dialog.close()},toast)});dialog.showModal()}
 root.querySelectorAll('[data-character-view]').forEach(el=>el.disabled=!owned(el.dataset.source));
 root.addEventListener('click',e=>{
  const el=e.target.closest('button,[data-building-detail-open]');if(!el)return;
  if(el.matches('[data-relationship-character]')){stop(e);select[el.dataset.relationshipCharacter]=el.dataset.characterId;render();return}
  if(el.matches('[data-open-official-relations]')){stop(e);root.querySelector('[data-official-relation-dialog]')?.showModal();return}
  if(el.matches('[data-open-character-groups]')){stop(e);root.querySelector('[data-character-group-list-dialog]')?.showModal();return}
  if(el.matches('[data-add-rel],[data-edit-rel],[data-add-character-group],[data-edit-character-group]')){stop(e);root.querySelectorAll('dialog[open]').forEach(d=>d.close());const isGroup=el.matches('[data-add-character-group],[data-edit-character-group]'),id=el.dataset.editRel||el.dataset.editCharacterGroup||'';withSharedWorld(snapshot(),()=>(isGroup?openGroup:openRelation)(id,(patch,targetId)=>enqueue(async()=>{if(activeShared()?.activeGroupId!==s.activeGroupId)throw Error('Group changed');await api().propose({kind:isGroup?'characterGroup':'relationship',patch,targetId});toast('관계 제안을 보냈어요');render();return true},toast)));return}
  if(el.matches('[data-delete-rel],[data-delete-character-group],[data-delete-group]')){stop(e);return}
  if(el.matches('[data-open-relationship-map]')){stop(e);withSharedWorld(s,openMap);return}
  if(el.matches('[data-open-view-dialog]')){stop(e);const dialog=root.querySelector(`[data-view-dialog="${CSS.escape(el.dataset.openViewDialog)}"]`);if(dialog){dialog.onclose=()=>serial.then(render);dialog.showModal()}return}
  if(el.matches('[data-reset-character-view]')){stop(e);const [a,b]=el.dataset.resetCharacterView.split(':');if(owned(a)&&confirm(tr('이 시선 설정을 초기화할까요?')))saveView(a,b,'overall','',true).then(render);return}
  if(el.matches('[data-add-town-home],[data-add-home]')){stop(e);const id='home-'+crypto.randomUUID();saveItem('home',id,{}, {create:true}).then(ok=>{if(ok===false)return;if(root.matches('.home-page'))api().visitHome(id);else{setMode('buildings');setPanel('home:'+id);render()}});return}
  if(el.matches('[data-home-select]')){stop(e);api().visitHome(el.dataset.homeSelect);return}
  if(el.matches('[data-home-floor],[data-home-floor-step]')){stop(e);const id=el.dataset.homeId||s.visitingHomeId||s.homes[0]?.id,h=s.homes.find(h=>h.id===id),layout=decodeShared(h?.layoutJson);select.floors??={};select.floors[id]=Math.max(1,Math.min(Math.max(Number(layout.floorCount)||1,...Object.values(layout.rooms||{}).map(r=>Number(r.floor)||1)),el.dataset.homeFloor?Number(el.dataset.homeFloor):(select.floors[id]||1)+Number(el.dataset.homeFloorStep)));render();return}
  if(el.matches('[data-home-edit]')){stop(e);return}
  if(el.matches('[data-shared-residents]')){stop(e);const d=document.createElement('dialog');d.className='directory-create-dialog shared-resident-directory';const close=document.createElement('button');close.textContent='×';close.onclick=()=>d.close();const list=document.createElement('div');list.className='directory-grid';for(const r of s.residents||[]){const b=document.createElement('button');b.className='directory-card';const img=document.createElement('img');img.src=r.photo||r.icon||'assets/home-ui/profile-placeholder.png';img.style.cssText='width:64px;height:64px;object-fit:cover;border-radius:50%';const name=document.createElement('b');name.textContent=r.name;const owner=document.createElement('small');owner.textContent=s.members?.find(m=>(m.uid||m.id)===r.ownerUid)?.displayName||r.ownerName||'';const member=s.members?.find(m=>(m.uid||m.id)===r.ownerUid);if(member?.photoURL){const avatar=document.createElement('img');avatar.src=member.photoURL;avatar.style.cssText='width:24px;height:24px;object-fit:cover;border-radius:50%';owner.prepend(avatar)}b.append(img,name,owner);b.onclick=()=>{d.close();api().selectResident(r.id);location.hash='tab=observe'};list.append(b)}const stage=document.createElement('section');stage.className='multiplayer-directory';const paper=document.createElement('div');paper.className='directory-paper';const inner=document.createElement('div');inner.className='directory-inner';const search=document.createElement('input');search.type='search';search.placeholder=({ko:'구성원 검색',en:'Search residents',ja:'住民を検索'}[state.uiLanguage]||'구성원 검색');search.oninput=()=>list.querySelectorAll('button').forEach(b=>b.hidden=!b.textContent.toLocaleLowerCase().includes(search.value.toLocaleLowerCase()));inner.append(search,list);paper.append(inner);stage.append(close,paper);d.append(stage);d.onclose=()=>d.remove();document.body.append(d);d.showModal();return}
  if(el.matches('[data-editor-save],[data-town-save]')){stop(e);serial.then(()=>toast('저장했어요'));return}
  if(el.matches('[data-world-transport]')){stop(e);const mode=el.dataset.worldTransport,modes=town(snapshot()).transportModes||[];saveTown({transportModes:modes.includes(mode)?modes.filter(m=>m!==mode):[...modes,mode]});return}
  if(el.matches('[data-place-stock],[data-place-audience]')){stop(e);const field=el.hasAttribute('data-place-stock')?'stock':'audiences',id=el.dataset.placeStock||el.dataset.placeAudience,p=town(snapshot()).places.find(p=>p.id===id),value=el.dataset.itemId||el.dataset.value,list=p[field]||[];saveBuilding(id,{[field]:list.includes(value)?list.filter(v=>v!==value):[...list,value]});return}
  if(el.matches('[data-building-shape-open],[data-home-building-shape]')){stop(e);const kind=el.hasAttribute('data-home-building-shape')?'home':'place',id=el.dataset.homeBuildingShape||el.dataset.buildingShapeOpen;withSharedWorld(snapshot(),()=>openShape(id,kind,patch=>saveItem(kind,id,patch)));return}
  if(el.matches('[data-add-town-decoration]')){stop(e);const id='decoration-'+crypto.randomUUID();saveItem('decoration',id,{kind:el.dataset.addTownDecoration,name:el.dataset.decorationLabel,emoji:el.querySelector('span')?.textContent||'✨',x:50,y:50}).then(()=>{setPlacement('decoration',id);render()});return}
  if(el.matches('[data-delete-home],[data-building-recovery],[data-place-interior-image],[data-clear-place-interior-image],[data-image-url],[data-add-town],[data-delete-town],[data-world-image],[data-world-bg-upload]')){stop(e);toast('이 항목의 공유 편집 연결은 준비 중이에요');return}
  if(el.matches('[data-building-browser-open],[data-building-detail-open]')){stop(e);if(root.dataset.townMode==='decorations'){const [kind,item]=itemFor(el);if(item){setPlacement(kind,item.id);render()}return}const id=el.dataset.buildingBrowserOpen||el.dataset.buildingDetailOpen;setMode('buildings');setPanel(id);setPlacement();render();return}
  if(el.matches('[data-add-place]')){stop(e);const id='building-'+crypto.randomUUID();saveBuilding(id,{}, {name:'새 건물',type:'상점',x:50,y:50}).then(()=>{setMode('buildings');setPanel(id);render()});return}
  if(el.matches('[data-delete-place]')){stop(e);if(confirm(tr('이 건물을 삭제할까요?')))saveBuilding(el.dataset.deletePlace,{}, {remove:true});return}
  if(el.matches('[data-town-placement-command]')){stop(e);const command=el.dataset.townPlacementCommand;
   if(command==='done'){setPlacement();render();return}
   if(command==='undo'||command==='redo'){const from=history[command],entry=from.at(-1);if(entry)saveItem(entry.kind,entry.id,command==='undo'?entry.before:entry.after).then(ok=>{if(ok!==false){from.pop();history[command==='undo'?'redo':'undo'].push(entry);render()}});return}
   const [kind,item]=itemFor(root.querySelector('.placement-selected'));if(!item)return;
   if(command==='delete'){if(kind!=='home'&&confirm(tr('삭제할까요?')))saveItem(kind,item.id,{}, {remove:true});return}
   const scale=kind==='home'?'mapScale':kind==='place'?'imageScale':'scale',flip=kind==='home'?'mapFlipX':'flipX';
   const patch=command==='smaller'||command==='larger'?{[scale]:Math.max(.1,Math.min(4,(item[scale]||1)+(command==='larger'?.1:-.1)))}:command==='flip'?{[flip]:!item[flip]}:command==='front'||command==='back'?{mapZ:Math.max(-100,Math.min(1000,(item.mapZ||10)+(command==='front'?1:-1)))}:null;
   if(patch)moveItem(kind,item,patch);return
  }
 },true);
 root.addEventListener('change',e=>{
  const el=e.target;
  if(el.matches('[data-view-source],[data-view-target]')){stop(e);select[el.hasAttribute('data-view-source')?'source':'target']=el.value;render();return}
  if(el.matches('[data-character-view]')){stop(e);saveView(el.dataset.source,el.dataset.target,el.dataset.viewField,el.value);return}
  if(el.matches('[data-place-field]')){stop(e);const field=el.dataset.placeField;saveBuilding(el.dataset.placeId,field==='type'?{}:{[field]:['spicy','sweet'].includes(field)||el.type==='number'||el.type==='range'?Number(el.value):el.value},field==='type'?{type:el.value}:{});return}
  if(el.matches('[data-home-field],[data-home-name]')){stop(e);const field=el.dataset.homeField||'name';if(field==='townId')return;saveItem('home',el.dataset.homeId,{[field]:el.type==='range'?Number(el.value):el.value});return}
  const attr=[...el.attributes].find(a=>a.name.startsWith('data-world-'));if(attr){stop(e);const key=attr.name.slice(11).replace(/-([a-z])/g,(_,c)=>c.toUpperCase());saveTown({[key]:el.type==='checkbox'?el.checked:el.value})}
 },true);
 root.addEventListener('input',e=>{if(e.target.matches('[data-place-field],[data-home-field],[data-home-name],[data-world-name],[data-world-description]'))e.stopImmediatePropagation()},true);
 root.addEventListener('pointerdown',e=>{if(e.target.matches('[data-place-field]'))e.stopImmediatePropagation()},true);
 if(root.matches('.home-page')){
  root.querySelectorAll('[data-home-edit]').forEach(b=>b.disabled=true);
  root.querySelectorAll('input,select,textarea').forEach(el=>el.disabled=true);
  root.addEventListener('change',stop,true);
  // Visiting uses the existing interior and read-only panels. Editing cannot reach personal state.
  root.addEventListener('click',e=>{const b=e.target.closest('button');if(b&&[...b.attributes].some(a=>/^data-(add-room|delete-|open-room-editor|open-furniture|room-surface|home-image)/.test(a.name)))stop(e)},true);
 }
 if(root.matches('.mobile-town-shell')){
  if(!canEditShared(s)){root.querySelectorAll('[data-place-field],[data-home-field],[data-home-name],[data-world-name],[data-world-description],[data-add-place],[data-delete-place],[data-mobile-town-decoration-mode]').forEach(el=>el.disabled=true);root.querySelectorAll('input,select,textarea,[data-world-transport]').forEach(el=>{if([...el.attributes].some(a=>/^data-(world-|home-|place-)/.test(a.name)))el.disabled=true})}
  root.querySelectorAll('[data-home-field="townId"],[data-place-field="townId"],[data-add-town],[data-delete-town]').forEach(el=>el.disabled=true);
  root.querySelectorAll('.town-edit .place').forEach(el=>{el.onpointerdown=null;if(!canEditShared(s)||!['buildings','decorations'].includes(root.dataset.townMode))return;
   el.onpointerdown=e=>{if(e.button!==0)return;e.preventDefault();e.stopPropagation();const [kind,item]=itemFor(el);if(!item)return;
    const xKey=kind==='home'?'mapX':'x',yKey=kind==='home'?'mapY':'y',rect=el.parentElement.getBoundingClientRect(),start={x:e.clientX,y:e.clientY};let x=item[xKey]??50,y=item[yKey]??50,moved=false;el.setPointerCapture(e.pointerId);
    el.onpointermove=move=>{const dx=move.clientX-start.x,dy=move.clientY-start.y;if(Math.abs(dx)+Math.abs(dy)<5&&!moved)return;moved=true;x=Math.max(5,Math.min(95,(item[xKey]??50)+dx/rect.width*100));y=Math.max(5,Math.min(95,(item[yKey]??50)+dy/rect.height*100));el.style.left=x+'%';el.style.top=y+'%'};
    el.onpointerup=()=>{el.onpointermove=null;el.onpointerup=null;setPlacement(kind,item.id);if(moved){el.addEventListener('click',stop,{once:true,capture:true});moveItem(kind,item,{[xKey]:x,[yKey]:y})}else render()};
    el.onpointercancel=()=>{el.onpointermove=null;el.onpointerup=null;render()};
   }
  });
 }
}
