import {homeRoomBrowser,homeMemberMenu} from './home-editor-ui.js?v=20260909dev305';
import {state,runIsolatedWorld,save} from './state.js?v=20260909dev305';
import {homeCard,currentSceneFor,profileAvatar} from './views.js?v=20260909dev305';
import {buildingInterior} from './building-interior-model.js';
import {buildSharedWorld} from './shared-world.js?v=20260909dev305';
import {bindSharedHome} from './shared-home-editor.js?v=20260909dev305';
import {bindEditorPosition} from './home-editor-position.js';
import {bindSceneZoom} from './scene-zoom.js';
import {bindSceneDepth} from './scene-depth.js?v=20260909dev305';
import {latestSaveQueue} from './latest-save-queue.js?v=20260909dev305';
import {careerCaption} from './salary.js';

export function openBuildingInterior(placeId,{snapshot=null,bindRoomGeometry,editBuilding=()=>{},toast=()=>{}}={}){
 const groupId=snapshot?.activeGroupId||'',account=window.ParallelCityAuth?.getInfo?.()?.user?.uid||'',personal=state;
 const world=groupId?buildSharedWorld(snapshot,state.uiLanguage):{...state,homes:{...state.homes}},town=world.towns.find(t=>t.id===world.activeTownId)||world.world,place=town.places.find(p=>p.id===placeId);if(!place)return;
 const canEdit=!groupId||snapshot.group?.ownerUid===account||['owner','manager','operator'].includes(snapshot.members?.find(m=>(m.uid||m.id)===account)?.role||snapshot.role);
 const home=buildingInterior(place,town.id,world.uiLanguage),selection={homeEditMode:false,floors:{}};world.homes={...world.homes,[home.id]:home};world.activeHomeId=home.id;
 const tr=(ko,en,ja)=>({ko,en,ja}[world.uiLanguage]||ko),d=document.createElement('dialog');d.className='building-interior-dialog';
 let status,saveError=null,closed=false;
 const valid=()=>personal===state&&(window.ParallelCityAuth?.getInfo?.()?.user?.uid||'')===account&&(!groupId||window.DrawerVillageGroups?.getSnapshot?.()?.activeGroupId===groupId);
 const queue=latestSaveQueue(async layout=>{
  if(!valid())throw Error(tr('계정이나 마을이 바뀌었어요.','Account or village changed.','アカウントまたは村が変わりました。'));
  if(groupId){
   const api=window.DrawerVillageGroups,current=api.getSnapshot(),result=await api.saveBuilding({id:placeId,townId:town.id,revision:Number(current.group.buildingRevision)||0,patch:{interior:layout}});
   if(valid()){current.group.towns=current.group.towns.map(t=>t.id===town.id?result.town:t);current.group.buildingRevision=result.revision;}
  }else{const current=personal.towns.find(t=>t.id===town.id)?.places.find(p=>p.id===placeId);if(!current)throw Error(tr('건물이 삭제되었어요.','The building was deleted.','建物が削除されました。'));current.interior=layout;if(personal.activeTownId===town.id){const visible=personal.world.places.find(p=>p.id===placeId);if(visible)visible.interior=layout;}if(!await save(true))throw Error(tr('저장하지 못했어요.','Could not save.','保存できませんでした。'));}
  saveError=null;if(status)status.textContent='';
 });
 const commit=layout=>{const result=queue.push(structuredClone(layout));result.catch(error=>{saveError=error;if(status)status.textContent=error.message;toast(error.message)});return result};
 const leave=async()=>{try{await queue.done;if(saveError)throw saveError;d.close()}catch(error){toast(error.message)}};
 d.oncancel=e=>{e.preventDefault();void leave()};d.onclose=()=>{closed=true;d.remove();window.dispatchEvent(new Event('drawer-context-dismissed'))};
 const employees=()=>world.order.map(id=>world.characters[id]).filter(c=>c?.workplaceId===placeId);
 const staffCopy=c=>runIsolatedWorld(world,()=>{const scene=currentSceneFor(c);return scene?.placeId===placeId?scene.desc:tr('지금은 근무지에 없어요.','Currently away from this workplace.','現在は職場にいません。')});
 const refreshWorld=()=>{const latest=groupId?buildSharedWorld(window.DrawerVillageGroups.getSnapshot(),world.uiLanguage):state;world.characters=latest.characters;world.order=latest.order;world.characterDirectives=latest.characterDirectives;};
 let refreshTimer;
 const close=d.onclose;d.onclose=()=>{clearInterval(refreshTimer);close()};
 function render(){
  if(closed||!valid())return;refreshWorld();world.homeEditMode=selection.homeEditMode;home.activeFloor=selection.floors[home.id]||home.activeFloor;
  const template=document.createElement('template');template.innerHTML=runIsolatedWorld(world,()=>homeCard(home.id,employees()));
  const root=document.createElement('section');root.className='home-page home-native-page building-interior-page';
  const heading=document.createElement('header');heading.className='building-interior-heading';
  const back=document.createElement('button');back.className='building-interior-back';back.setAttribute('aria-label',tr('마을로 돌아가기','Back to village','村に戻る'));back.onclick=leave;heading.append(back);
  const name=document.createElement('strong');name.textContent=place.name;heading.append(name);
  const floor=document.createElement('small');floor.textContent=tr(home.activeFloor+'층','Floor '+home.activeFloor,home.activeFloor+'階');heading.append(floor);
  const side=document.createElement('nav');side.className='building-interior-side home-native-side';
  const panel=document.createElement('section');panel.className='building-interior-panel';panel.hidden=true;
  const showPanel=(title)=>{panel.replaceChildren();panel.hidden=false;const h=document.createElement('h2');h.textContent=title;const close=document.createElement('button');close.className='building-panel-close';close.textContent='×';close.setAttribute('aria-label',tr('닫기','Close','閉じる'));close.onclick=()=>panel.hidden=true;panel.append(h,close)};
  const button=(text,fn)=>{const b=document.createElement('button');b.type='button';b.className='home-native-pill';const span=document.createElement('span');span.textContent=text;b.append(span);b.onclick=fn;side.append(b);return b};
  button(tr('건물 편집','Building','建物編集'),async()=>{if(!canEdit)return;await queue.done;if(saveError)return;d.close();editBuilding(placeId)}).disabled=!canEdit;
  button(tr('방 정보','Rooms','部屋情報'),()=>{showPanel(tr('방 정보','Rooms','部屋情報'));panel.innerHTML=homeRoomBrowser(home,world.uiLanguage);const browser=panel.firstElementChild;browser.classList.add('open');browser.style.display='block';browser.querySelector('[data-close-home-feature]').onclick=()=>panel.hidden=true;const count=document.createElement('label');count.textContent=tr('건물 층수','Number of floors','建物の階数');const floors=document.createElement('select');floors.dataset.homeFloorCount='';for(let n=1;n<=5;n++)floors.add(new Option(tr(n+'층','Floor '+n,n+'階'),String(n),false,n===home.floorCount));floors.disabled=!canEdit;count.append(floors);browser.append(count);let filter=0;const search=browser.querySelector('[data-room-search]');const apply=()=>browser.querySelectorAll('[data-room-info-edit]').forEach(b=>b.hidden=Boolean(filter&&Number(b.dataset.roomFloor)!==filter)||!b.dataset.roomName.toLowerCase().includes(search.value.toLowerCase()));search.oninput=apply;browser.querySelectorAll('[data-room-filter]').forEach(b=>b.onclick=()=>{filter=Number(b.dataset.roomFilter);browser.querySelectorAll('[data-room-filter]').forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',String(x===b))});apply()})}).dataset.openHomeFeature='room-info';
  button(tr('직원','Staff','従業員'),()=>{showPanel(tr('직원','Staff','従業員'));panel.innerHTML=homeMemberMenu(home,employees(),world.uiLanguage);const members=panel.firstElementChild;members.classList.add('open');members.style.display='block';members.querySelector('h2').textContent=tr('직원','Staff','従業員');members.querySelector('[data-close-home-feature]').onclick=()=>panel.hidden=true;members.querySelectorAll('.home-member-section').forEach((section,i)=>{if(i)section.remove()});members.querySelectorAll('.home-resident-remove,.home-member-add,.home-resident-help,h3').forEach(n=>n.remove());members.querySelector('.home-member-grid').classList.add('building-staff-grid');members.querySelectorAll('[data-member-id]').forEach(b=>{const c=world.characters[b.dataset.memberId];const caption=document.createElement('small');caption.textContent=careerCaption(world,c);b.append(caption);b.onclick=()=>{showPanel(c.name);const p=document.createElement('p');p.textContent=staffCopy(c);panel.append(p)}})}).dataset.openHomeFeature='members';
  const edit=button(selection.homeEditMode?tr('편집 완료','Done','編集完了'):tr('편집모드','Edit mode','編集モード'),()=>{});edit.dataset.homeEdit='';edit.disabled=!canEdit;
  status=document.createElement('p');status.className='building-interior-status';status.setAttribute('role','status');status.textContent=saveError?.message||'';
  const article=document.createElement('article');article.className='home building-interior-home'+(selection.homeEditMode?' is-editing':'');article.dataset.homeId=home.id;
  for(const selector of ['.home-canvas-viewport','.home-edit-visibility','.home-furniture-drawer','.furniture-edit-toolbar']){const node=template.content.querySelector(selector);if(node)article.append(node)}
  const elevator=template.content.querySelector('.home-native-elevator');if(elevator){elevator.querySelectorAll('[data-home-floor-step]').forEach(b=>b.onclick=()=>{selection.floors[home.id]=Math.max(1,Math.min(home.floorCount,home.activeFloor+Number(b.dataset.homeFloorStep)));render()});root.append(elevator)}
  const hide=document.createElement('button');hide.className='home-native-pill home-native-ui-toggle';hide.innerHTML='<span></span>';hide.querySelector('span').textContent=tr('UI 숨김','Hide UI','UI非表示');hide.onclick=()=>{const hidden=root.classList.toggle('home-ui-hidden');hide.setAttribute('aria-pressed',String(hidden));hide.querySelector('span').textContent=hidden?tr('UI 보기','Show UI','UI表示'):tr('UI 숨김','Hide UI','UI非表示')};root.append(hide);
  for(const [key,room] of Object.entries(home.rooms))if(room.outdoor){const el=[...article.querySelectorAll('.room')].find(n=>n.dataset.roomKey===key);el?.classList.add('building-lawn')}
  root.append(heading,status,article,side,panel);d.replaceChildren(root);
  bindSharedHome(root,snapshot||{activeGroupId:'',group:{}},render,toast,bindRoomGeometry,{world,selection,canEdit,commit,allowRoomPhotos:false});
  let down=null;root.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY}});
  root.addEventListener('click',e=>{if(selection.homeEditMode||e.target.closest('button:not([data-furniture-placement]),nav,header,.building-interior-panel')||down&&Math.hypot(e.clientX-down.x,e.clientY-down.y)>12)return;const el=e.target.closest('[data-furniture-placement],.room[data-room-key]');if(!el)return;e.preventDefault();e.stopPropagation();document.dispatchEvent(new CustomEvent('drawer-building-activities',{detail:{anchor:el,info:{state:world,groupId,uid:groupId?account:''},placeId}}))});
  bindEditorPosition(root,home.id,world.uiLanguage);bindSceneZoom(root);bindSceneDepth(root);
 }
 document.body.append(d);render();d.showModal();
 let signature='';refreshTimer=setInterval(()=>{if(closed||!valid()||selection.homeEditMode||!d.querySelector('.building-interior-panel')?.hidden||document.querySelector('dialog[open]:not(.building-interior-dialog)'))return;refreshWorld();const next=runIsolatedWorld(world,()=>world.order.map(id=>{const c=world.characters[id];if(!c)return '';const scene=currentSceneFor(c);return scene?.placeId===placeId?id+':'+scene.officeTaskId+':'+scene.title:''}).join('|'));if(next!==signature){signature=next;render()}},10000);
 return d;
}
