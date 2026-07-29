/* 평행도시 v43 안정화: 사진·드래그·장소 카드 */
(()=>{
 const $=(q,r=document)=>r.querySelector(q),$$=(q,r=document)=>[...r.querySelectorAll(q)];
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const findBuilding=id=>{
  for(const world of state.worlds?.items||[])for(const district of world.districts||[])for(const area of district.neighborhoods||[]){
   const building=(area.buildings||[]).find(item=>item.id===id);
   if(building)return{building,world,district,area};
  }
 };
 const compress=async file=>{
  if(!file?.type?.startsWith('image/'))throw new Error('이미지 파일이 아닙니다.');
  const source=await new Promise((ok,fail)=>{const reader=new FileReader();reader.onload=()=>ok(reader.result);reader.onerror=fail;reader.readAsDataURL(file)});
  const image=await new Promise((ok,fail)=>{const img=new Image();img.onload=()=>ok(img);img.onerror=fail;img.src=source});
  const max=480,scale=Math.min(1,max/Math.max(image.naturalWidth,image.naturalHeight)),canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
  canvas.getContext('2d',{alpha:false}).drawImage(image,0,0,canvas.width,canvas.height);
  return canvas.toDataURL('image/jpeg',.7);
 };
 async function persist(message){
  state.pendingCloudSave=true;save?.();renderAll?.();
  try{await window.pushParallelCityCloudState?.();toast?.(message)}
  catch(error){console.error(error);toast?.('기기에는 저장됐지만 동기화가 지연되고 있어요.')}
 }
 function bindProfileUpload(){
  let input=$('#charPhoto');if(!input||input.dataset.v44)return;
  const clean=input.cloneNode(true);input.replaceWith(clean);input=clean;input.dataset.v44='1';
  input.addEventListener('change',async event=>{
   event.stopImmediatePropagation();const file=input.files?.[0],id=active?.().id;if(!file||!id)return;
   try{collectCharacterForm?.();const photo=await compress(file),character=state.characters.find(c=>c.id===id);if(!character)return;character.photo=photo;await persist('프로필 사진을 저장했어요.')}
   catch(error){console.error(error);toast?.(`사진을 저장하지 못했어요: ${error.message}`)}
   finally{input.value=''}
  },true);
 }
 const hash=value=>[...String(value)].reduce((total,char)=>(total*33+char.charCodeAt(0))>>>0,19);
 function ensureOccasionalIllness(){
  const date=new Date().toLocaleDateString('sv-SE');if(state.lastIllnessRollDate===date)return;
  state.lastIllnessRollDate=date;
  if(state.characters.length&&hash(`ill-${date}`)%100<12){
   const character=state.characters[hash(date)%state.characters.length],at=9*60+hash(character.id+date)%390,hh=String(Math.floor(at/60)).padStart(2,'0'),mm=String(at%60).padStart(2,'0'),rest=hash(`rest-${date}`)%100<72;
   const event=rest
    ?{time:`${hh}:${mm}`,title:'몸이 좋지 않아 쉬는 중',detail:'갑자기 몸살 기운이 생겨 약을 먹고 집에서 쉬기로 함',kind:'home',home:true,room:'bedroom',illness:true}
    :{time:`${hh}:${mm}`,title:'동네 의원 진료',detail:'컨디션이 좋지 않아 가까운 의원에서 진료를 받는 중',category:'clinic',illness:true};
   character.today=character.today||[];character.today.push(event);character.today.sort((a,b)=>a.time.localeCompare(b.time));window.ParallelCityVillage?.assignEvent?.(character,event,character.today.indexOf(event));
   if(state.observationMode==='real'&&!rest)Promise.resolve(window.resolveRealEventPlace?.(character,event)).then(()=>{save?.();window.queueParallelCityCloudSync?.()}).catch(console.warn);
  }
  state.pendingCloudSave=true;save?.();window.queueParallelCityCloudSync?.();
 }
 function modeSwitchMarkup(){
  const mode=state.observationMode==='real'?'real':'virtual';
  return`<b>관찰 배경</b><button type="button" data-observation-mode="virtual" class="${mode==='virtual'?'active':''}">🏙️ 가상도시</button><button type="button" data-observation-mode="real" class="${mode==='real'?'active':''}">🗺️ 현실 지도</button>`;
 }
 function bindModeSwitch(){
  const map=$('#map'),card=map?.closest('.map-card');if(card&&!$('.observation-mode-switch',card)){const bar=document.createElement('div');bar.className='observation-mode-switch';bar.innerHTML=modeSwitchMarkup();card.insertBefore(bar,map)}
  const settings=$('#view-theme .panel');if(settings&&!$('#observationModeSetting')){const section=document.createElement('div');section.className='section';section.id='observationModeSetting';section.innerHTML=`<h3>관찰 배경 선택</h3><div class="notice">가상도시는 API 없이 이용하고, 현실 지도는 설정된 Google Maps API 키를 사용합니다.</div><div class="observation-mode-switch">${modeSwitchMarkup()}</div>`;settings.prepend(section)}
  $$('[data-observation-mode]').forEach(button=>{if(button.dataset.modeBound)return;button.dataset.modeBound='1';button.onclick=()=>{
   const mode=button.dataset.observationMode;
   if(mode==='real'&&!String(window.PARALLEL_CITY_CONFIG?.googleMapsApiKey||localStorage.getItem('lifelog_google_maps_api_key')||'').trim()){toast?.('먼저 설정에서 Google Maps API 키를 연결해 주세요.');document.querySelector('.tab[data-view="theme"]')?.click();return}
   window.ParallelCityGoogleBridge?.activate(mode);applyActiveCharacterTheme?.();
   if(mode==='real'){
    const minute=new Date().getHours()*60+new Date().getMinutes();
    Promise.all(state.characters.map(character=>{const event=typeof currentEvent==='function'?currentEvent(character,minute):null;return event&&!event.home?Promise.resolve(window.resolveRealEventPlace?.(character,event)):null})).then(()=>{save?.();window.ParallelCityGoogleBridge?.show()}).catch(console.warn);
   }else window.ParallelCityVillage?.render?.();
   $$('.observation-mode-switch').forEach(bar=>bar.innerHTML=modeSwitchMarkup());setTimeout(bindModeSwitch,0);
  }});
 }
 function bindObservationDrag(){
  $$('#map .world-building').forEach(el=>{
   if(el.dataset.dragV43)return;el.dataset.dragV43='1';let moved=false,startX=0,startY=0;
   el.addEventListener('pointerdown',event=>{if(event.button!==undefined&&event.button!==0)return;moved=false;startX=event.clientX;startY=event.clientY;el.setPointerCapture(event.pointerId);el.classList.add('dragging')});
   el.addEventListener('pointermove',event=>{
    if(!el.hasPointerCapture(event.pointerId))return;if(Math.hypot(event.clientX-startX,event.clientY-startY)>3)moved=true;if(!moved)return;
    const rect=el.parentElement.getBoundingClientRect(),found=findBuilding(el.dataset.id);if(!found)return;
    found.building.x=Math.max(4,Math.min(96,(event.clientX-rect.left)/rect.width*100));found.building.y=Math.max(9,Math.min(93,(event.clientY-rect.top)/rect.height*100));
    el.style.setProperty('--x',`${found.building.x}%`);el.style.setProperty('--y',`${found.building.y}%`);
   });
   el.addEventListener('pointerup',event=>{if(el.hasPointerCapture(event.pointerId))el.releasePointerCapture(event.pointerId);el.classList.remove('dragging');if(moved){el.dataset.suppressClick='1';persist('관찰 화면에서 건물 위치를 저장했어요.')}});
   el.addEventListener('click',event=>{if(el.dataset.suppressClick==='1'){event.preventDefault();event.stopImmediatePropagation();delete el.dataset.suppressClick}},true);
  });
 }
 const kindOf=type=>['cafe','bakery'].includes(type)?'cafe':['restaurant','bar'].includes(type)?'restaurant':['park'].includes(type)?'park':['company','office','school','university','public','bank','post','hotel'].includes(type)?'office':['hospital','clinic','pharmacy','pet'].includes(type)?'clinic':'shop';
 function updatePlaceCard(){
  const activity=$('.activity');if(!activity)return;let card=$('.activity-place-v43',activity);
  if(!card){card=document.createElement('figure');card.className='activity-place-v43';card.innerHTML='<div class="place-line"></div><div class="place-photo"></div><figcaption>평행도시 기본 장소 사진 · 사용자가 장소 사진으로 바꿀 수 있어요.</figcaption>';activity.querySelector('.bar')?.before(card)}
  const character=active?.(),building=character&&window.ParallelCityVillage?.currentBuilding?.(character);
  if(!building){card.classList.remove('show');return}
  card.classList.add('show');$('.place-line',card).textContent=`📍 ${building.name} · ${building.neighborhoodName||'현재 지역'}`;
  const photo=$('.place-photo',card),kind=kindOf(building.type);photo.className=`place-photo ${building.photo?'custom':'sprite'}`;photo.dataset.kind=kind;
  photo.style.backgroundImage=building.photo?`url("${building.photo}")`:'';
 }
 function addBuildingPhotoControl(){
  const panel=$('.world-building-panel');if(!panel||$('#buildingPhoto'))return;
  const actions=$('.actions',panel);if(!actions)return;
  const wrap=document.createElement('div');wrap.className='fields';wrap.innerHTML='<div class="full"><label>방문 카드 장소 사진 (선택)</label><input id="buildingPhoto" type="file" accept="image/*"><small>등록하지 않으면 사이트 기본 장소 사진이 보여요.</small></div>';actions.before(wrap);
  $('#buildingPhoto').addEventListener('change',async event=>{const id=$('#buildingId')?.value,file=event.target.files?.[0];if(!id){toast?.('건물을 먼저 저장한 뒤 사진을 추가해 주세요.');return}const found=findBuilding(id);if(!found||!file)return;try{found.building.photo=await compress(file);await persist('장소 사진을 저장했어요.');updatePlaceCard()}catch(error){toast?.(`사진을 저장하지 못했어요: ${error.message}`)}finally{event.target.value=''}});
 }
 function install(){
  $('#portraitOnly')?.remove();screen.orientation?.unlock?.();
  bindProfileUpload();bindObservationDrag();addBuildingPhotoControl();updatePlaceCard();bindModeSwitch();applyActiveCharacterTheme?.();
  $$('.home-clean').forEach(box=>{if(!$('.auto-clean-note',box)){const note=document.createElement('small');note.className='auto-clean-note';note.textContent='자동 청소 · 캐릭터 성향에 따라 1~4일 간격';box.append(note)}});
 }
 const observer=new MutationObserver(()=>requestAnimationFrame(install));
 addEventListener('DOMContentLoaded',()=>{window.ParallelCityGoogleBridge?.setVirtual({loadGooglePlaces:window.loadGooglePlaces,ensureGoogleObservationMap:window.ensureGoogleObservationMap,updateMarkers:window.updateMarkers,searchGooglePlaces:window.searchGooglePlaces,testGooglePlacesAccess:window.testGooglePlacesAccess,resolveRealEventPlace:window.resolveRealEventPlace,resolveRealPlacesForDay:window.resolveRealPlacesForDay});state.observationMode=state.observationMode||'virtual';window.ParallelCityGoogleBridge?.activate(state.observationMode);ensureOccasionalIllness();observer.observe(document.body,{subtree:true,childList:true});install()},{once:true});
 addEventListener('pageshow',install);setInterval(()=>{bindObservationDrag();updatePlaceCard()},15000);
 window.ParallelCityPhotoCompress=compress;
})();
