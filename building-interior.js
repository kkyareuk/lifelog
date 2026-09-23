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

export function openBuildingInterior(placeId,{snapshot=null,bindRoomGeometry,toast=()=>{}}={}){
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
 let refreshTimer;
 const close=d.onclose;d.onclose=()=>{clearInterval(refreshTimer);close()};
 function render(){
  if(closed||!valid())return;world.homeEditMode=selection.homeEditMode;home.activeFloor=selection.floors[home.id]||home.activeFloor;
  const template=document.createElement('template');template.innerHTML=runIsolatedWorld(world,()=>homeCard(home.id,employees()));
  const root=document.createElement('section');root.className='home-page home-native-page building-interior-page';
  const heading=document.createElement('header');heading.className='building-interior-heading';
  const back=document.createElement('button');back.className='building-interior-back';back.setAttribute('aria-label',tr('마을로 돌아가기','Back to village','村に戻る'));back.onclick=leave;heading.append(back);
  const name=document.createElement('strong');name.textContent=place.name;heading.append(name);
  const floor=document.createElement('select');floor.dataset.homeFloorSelect='';floor.dataset.homeId=home.id;floor.setAttribute('aria-label',tr('현재 층','Current floor','現在の階'));for(let n=1;n<=home.floorCount;n++)floor.add(new Option(tr(n+'층','Floor '+n,n+'階'),String(n),false,n===home.activeFloor));heading.append(floor);
  const side=document.createElement('nav');side.className='building-interior-side';
  const panel=document.createElement('section');panel.className='building-interior-panel';panel.hidden=true;
  const showPanel=(title)=>{panel.replaceChildren();panel.hidden=false;const h=document.createElement('h2');h.textContent=title;const close=document.createElement('button');close.className='building-panel-close';close.textContent='×';close.setAttribute('aria-label',tr('닫기','Close','閉じる'));close.onclick=()=>panel.hidden=true;panel.append(h,close)};
  const button=(text,fn)=>{const b=document.createElement('button');b.type='button';const span=document.createElement('span');span.textContent=text;b.append(span);b.onclick=fn;side.append(b);return b};
  button(tr('건물 편집','Building','建物編集'),()=>{showPanel(tr('건물 편집','Edit building','建物編集'));const label=document.createElement('label');label.textContent=tr('건물 층수','Number of floors','建物の階数');const select=document.createElement('select');select.dataset.homeFloorCount='';select.dataset.homeId=home.id;for(let n=1;n<=5;n++)select.add(new Option(tr(n+'층',n+' floors',n+'階'),String(n),false,n===home.floorCount));label.append(select);const add=document.createElement('button');add.textContent=tr('방 추가','Add room','部屋を追加');add.dataset.addRoom='';add.disabled=!canEdit;select.disabled=!canEdit;panel.append(label,add)});
  button(tr('방 정보','Rooms','部屋情報'),()=>{showPanel(tr('방 정보','Rooms','部屋情報'));for(const [key,room] of Object.entries(home.rooms)){const b=document.createElement('button');b.textContent=room.name;b.dataset.openRoomEditor=key;b.dataset.homeId=home.id;b.disabled=!canEdit;panel.append(b)}});
  button(tr('직원','Staff','従業員'),()=>{showPanel(tr('직원','Staff','従業員'));const grid=document.createElement('div');grid.className='building-staff-grid';for(const c of employees()){const b=document.createElement('button');b.innerHTML=runIsolatedWorld(world,()=>profileAvatar(c));const name=document.createElement('b');name.textContent=c.name;const job=document.createElement('small');job.textContent=careerCaption(world,c);b.append(name,job);b.onclick=()=>{showPanel(c.name);const description=document.createElement('p');description.textContent=staffCopy(c);panel.append(description)};grid.append(b)}if(!grid.children.length){const p=document.createElement('p');p.textContent=tr('이 건물을 근무지로 설정한 캐릭터가 없어요.','No characters have this building set as their workplace.','この建物を勤務先にしているキャラクターはいません。');panel.append(p)}panel.append(grid)});
  const edit=button(selection.homeEditMode?tr('편집 완료','Done','編集完了'):tr('편집모드','Edit mode','編集モード'),()=>{});edit.dataset.homeEdit='';edit.disabled=!canEdit;
  status=document.createElement('p');status.className='building-interior-status';status.setAttribute('role','status');status.textContent=saveError?.message||'';
  const article=document.createElement('article');article.className='home building-interior-home'+(selection.homeEditMode?' is-editing':'');article.dataset.homeId=home.id;
  for(const selector of ['.home-canvas-viewport','.home-edit-visibility','.home-furniture-drawer','.furniture-edit-toolbar']){const node=template.content.querySelector(selector);if(node)article.append(node)}
  root.append(heading,status,article,side,panel);d.replaceChildren(root);
  bindSharedHome(root,snapshot||{activeGroupId:'',group:{}},render,toast,bindRoomGeometry,{world,selection,canEdit,commit,allowRoomPhotos:false});
  bindEditorPosition(root,home.id,world.uiLanguage);bindSceneZoom(root);bindSceneDepth(root);
 }
 document.body.append(d);render();d.showModal();
 let signature='';refreshTimer=setInterval(()=>{if(closed||!valid()||selection.homeEditMode||!d.querySelector('.building-interior-panel')?.hidden||document.querySelector('dialog[open]:not(.building-interior-dialog)'))return;const next=runIsolatedWorld(world,()=>world.order.map(id=>{const c=world.characters[id];if(!c)return '';const scene=currentSceneFor(c);return scene?.placeId===placeId?id+':'+scene.officeTaskId+':'+scene.title:''}).join('|'));if(next!==signature){signature=next;render()}},10000);
 return d;
}
