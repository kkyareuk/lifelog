import {state,runIsolatedWorld,save} from './state.js?v=20260909dev305';
import {homeCard} from './views.js?v=20260909dev305';
import {buildingInterior} from './building-interior-model.js';
import {buildSharedWorld} from './shared-world.js?v=20260909dev305';
import {bindSharedHome} from './shared-home-editor.js?v=20260909dev305';
import {bindEditorPosition} from './home-editor-position.js';
import {bindSceneZoom} from './scene-zoom.js';
import {bindSceneDepth} from './scene-depth.js?v=20260909dev305';
import {latestSaveQueue} from './latest-save-queue.js?v=20260909dev305';
import {persistLocalImage} from './local-media.js?v=20260909dev305';

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
 const choosePhoto=()=>new Promise(resolve=>{const input=document.createElement('input');input.type='file';input.accept='image/*';input.oncancel=()=>resolve(null);input.onchange=async()=>{const file=input.files?.[0];if(!file)return resolve(null);try{if(file.size>10*1024*1024)throw Error(tr('10MB 이하 이미지를 골라 주세요.','Choose an image under 10MB.','10MB以下の画像を選んでください。'));const url=groupId?await window.DrawerVillageGroups.uploadHomeMemberImage(file):await persistLocalImage(await new Promise((ok,fail)=>{const reader=new FileReader();reader.onload=()=>ok(reader.result);reader.onerror=()=>fail(reader.error);reader.readAsDataURL(file)}));resolve(valid()&&!closed?url:null)}catch(error){toast(error.message);resolve(null)}};input.click()});
 function render(){
  if(closed||!valid())return;world.homeEditMode=selection.homeEditMode;home.activeFloor=selection.floors[home.id]||home.activeFloor;
  const template=document.createElement('template');template.innerHTML=runIsolatedWorld(world,()=>homeCard(home.id,[]));
  const root=document.createElement('section');root.className='home-page home-native-page building-interior-page';
  const heading=document.createElement('header');heading.className='building-interior-heading';
  const button=(text,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=fn;heading.append(b);return b};
  button(tr('‹ 마을','‹ Village','‹ 村'),leave);const name=document.createElement('strong');name.textContent=place.name;heading.append(name);
  button(tr('이곳에서 할 일','Activities here','ここでの行動'),()=>document.dispatchEvent(new CustomEvent('drawer-open-place-activities',{detail:{id:placeId,anchor:heading}})));
  const edit=button(selection.homeEditMode?tr('편집 완료','Finish editing','編集完了'):tr('꾸미기','Decorate','飾る'),()=>{});edit.dataset.homeEdit='';edit.disabled=!canEdit;
  if(selection.homeEditMode){const add=button(tr('+ 방','+ Room','+ 部屋'),()=>{});add.dataset.addRoom='';const floors=document.createElement('select');floors.dataset.homeFloorCount='';floors.dataset.homeId=home.id;floors.setAttribute('aria-label',tr('건물 층수','Number of floors','建物の階数'));for(let n=1;n<=5;n++)floors.add(new Option(tr(n+'층',n+' floors',n+'階'),String(n),false,n===home.floorCount));heading.append(floors)}
  if(home.floorCount>1){const floor=document.createElement('select');floor.dataset.homeFloorSelect='';floor.dataset.homeId=home.id;floor.setAttribute('aria-label',tr('현재 층','Current floor','現在の階'));for(let n=1;n<=home.floorCount;n++)floor.add(new Option(tr(n+'층','Floor '+n,n+'階'),String(n),false,n===home.activeFloor));heading.append(floor)}
  status=document.createElement('p');status.className='building-interior-status';status.setAttribute('role','status');status.textContent=saveError?.message||'';
  const article=document.createElement('article');article.className='home building-interior-home'+(selection.homeEditMode?' is-editing':'');article.dataset.homeId=home.id;
  for(const selector of ['.home-canvas-viewport','.home-edit-visibility','.home-furniture-drawer','.furniture-edit-toolbar']){const node=template.content.querySelector(selector);if(node)article.append(node)}
  root.append(heading,status,article);d.replaceChildren(root);
  bindSharedHome(root,snapshot||{activeGroupId:'',group:{}},render,toast,bindRoomGeometry,{world,selection,canEdit,commit,choosePhoto});
  bindEditorPosition(root,home.id,world.uiLanguage);bindSceneZoom(root);bindSceneDepth(root);
 }
 document.body.append(d);render();d.showModal();return d;
}
