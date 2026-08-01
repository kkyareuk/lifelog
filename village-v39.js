/* 평행도시 가상 마을 엔진 v39 — 외부 지도·장소 API 없음 */
(()=>{
 const $=(q,r=document)=>r.querySelector(q),$$=(q,r=document)=>[...r.querySelectorAll(q)];
 const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const id=()=>crypto.randomUUID(), hash=s=>[...String(s)].reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,17);
 const TYPES={
  company:['회사','🏢'],school:['학교','🏫'],cafe:['카페','☕'],restaurant:['음식점','🍽️'],bakery:['빵집','🥐'],salon:['미용실','💇'],
  hospital:['병원','🏥'],pharmacy:['약국','💊'],convenience:['편의점','🏪'],market:['마트','🛒'],bookstore:['서점','📚'],library:['도서관','🏛️'],
  anime:['굿즈숍','🎀'],perfume:['향수 공방','🧴'],workshop:['공방','🛠️'],park:['공원','🌳'],gym:['운동 시설','🏋️'],cinema:['영화관','🎬'],
  mall:['쇼핑몰','🛍️'],station:['정류장','🚏'],pet:['반려동물 시설','🐾'],bar:['술집','🍸'],public:['공공시설','🏤']
 };
 const defaults=()=>[
  ['company','은하출판사',15,12,'#91a7ff'],['school','별빛대학교',61,10,'#74c0fc'],['cafe','달무리 카페',34,24,'#d0a17b'],
  ['restaurant','윤슬식당',73,29,'#ff9f80'],['salon','라일락 미용실',13,43,'#e7a6d8'],['hospital','새봄의원',53,43,'#80cbc4'],
  ['convenience','24시 별편의점',82,48,'#8ed081'],['bookstore','종이달 서점',29,59,'#b39ddb'],['anime','은하 굿즈상점',67,61,'#ff8fab'],
  ['perfume','안개 조향공방',45,73,'#9fa8da'],['park','별고리 중앙공원',12,75,'#75c991'],['gym','파동 체육관',80,78,'#f7b267'],
  ['cinema','유성 영화관',29,88,'#7e8ce0'],['market','구름 마트',58,88,'#7bc8a4'],['station','평행역',91,17,'#90a4ae']
 ].map(([type,name,x,y,color])=>({id:id(),type,name,x,y,color,description:`${name}에서 시간을 보낼 수 있어요.`,open:'09:00',close:'22:00'}));
 function ensureVillage(){
  state.village=state.village||{name:'별고리 마을',buildings:defaults()};
  state.village.name=state.village.name||'별고리 마을';
  if(!Array.isArray(state.village.buildings)||!state.village.buildings.length)state.village.buildings=defaults();
  state.characters.forEach(c=>{c.villageHomeId=c.villageHomeId||'';c.workBuildingId=c.workBuildingId||''});
  return state.village;
 }
 function typeForEvent(event,character){
  if(event?.home||event?.kind==='home'||/집|취침|기상|귀가/.test(event?.title||''))return'home';
  if(event?.category)return({books:'bookstore',shopping:'mall',anime:'anime',perfume:'perfume',restaurant:'restaurant',cafe:'cafe',park:'park',hospital:'hospital',pharmacy:'pharmacy'}[event.category]||event.category);
  const text=`${event?.title||''} ${event?.detail||''}`;
  if(/출근|회사|근무|야근|직장/.test(text))return'company';if(/학교|수업|대학/.test(text))return'school';
  if(/미용|헤어|염색/.test(text))return'salon';if(/병원|진료/.test(text))return'hospital';if(/약국/.test(text))return'pharmacy';
  if(/영화/.test(text))return'cinema';if(/운동|헬스/.test(text))return'gym';if(/책|독서|서점/.test(text))return'bookstore';
  if(/공원|산책/.test(text))return'park';if(/식사|점심|저녁|밥/.test(text))return'restaurant';if(/카페|커피/.test(text))return'cafe';
  return character?.workBuildingId?'company':'park';
 }
 function candidates(type){
  const village=ensureVillage(),direct=village.buildings.filter(b=>b.type===type);
  return direct.length?direct:village.buildings;
 }
 function chooseBuilding(character,type,seed=''){
  if(['company','school'].includes(type)&&character.workBuildingId){
   const fixed=ensureVillage().buildings.find(b=>b.id===character.workBuildingId);if(fixed)return fixed;
  }
  const list=candidates(type);return list[hash(`${character.id}-${seed}-${new Date().toLocaleDateString('sv-SE')}`)%list.length];
 }
 function buildingPlace(building){return{name:building.name,address:`${ensureVillage().name} · ${TYPES[building.type]?.[0]||'건물'}`,villageBuildingId:building.id,virtual:true}}
 function assignEvent(character,event,index=0){
  if(!event||typeForEvent(event,character)==='home')return event;
  const building=chooseBuilding(character,typeForEvent(event,character),`${event.time}-${index}`);
  event.place=buildingPlace(building);event.villageBuildingId=building.id;
  const suffix=/점심/.test(event.title)?'에서 점심':/저녁/.test(event.title)?'에서 저녁 식사':/방문|탐험|들르기/.test(event.title)?' 방문':'';
  if(suffix)event.title=`${building.name}${suffix}`;
  event.detail=`${ensureVillage().name}의 ${building.name}에서 ${event.detail||'시간을 보내는 중'}`;
  delete event.loc;return event;
 }
 function currentBuilding(character){
  const now=new Date(),event=currentEvent(character,now.getHours()*60+now.getMinutes());
  if(!event||typeForEvent(event,character)==='home')return null;
  return ensureVillage().buildings.find(b=>b.id===(event.villageBuildingId||event.place?.villageBuildingId))||chooseBuilding(character,typeForEvent(event,character),event.time);
 }
 function avatar(character){
  return character.photo?`<img src="${character.photo}" alt="">`:`<span>${escape((character.name||'?')[0])}</span>`;
 }
 function renderVillage(){
  ensureVillage();const root=$('#map');if(!root)return;
  const activeCharacter=active(),buildings=state.village.buildings;
  root.innerHTML=`<div class="village-map" id="villageMap"><div class="village-sky"><b>${escape(state.village.name)}</b><span>캐릭터들이 살아가는 가상의 마을</span></div><div class="village-river"></div><div class="village-road road-a"></div><div class="village-road road-b"></div>${buildings.map(b=>`<button class="village-building type-${b.type}" data-id="${b.id}" style="--x:${b.x}%;--y:${b.y}%;--building:${b.color||'#aab4c3'}"><i>${TYPES[b.type]?.[1]||'🏠'}</i><b>${escape(b.name)}</b><small>${escape(TYPES[b.type]?.[0]||'건물')}</small></button>`).join('')}<div class="village-characters">${state.characters.map(c=>{const b=currentBuilding(c);if(!b)return'';return`<button class="village-character ${c.id===activeCharacter.id?'active':''}" data-character="${c.id}" style="--x:${b.x}%;--y:${b.y}%;--person:${c.theme?.accent||c.theme||'#6f7cff'}">${avatar(c)}<em>${escape(c.name)}<small>${escape(b.name)}</small></em></button>`}).join('')}</div></div>`;
  $$('.village-building',root).forEach(el=>el.onclick=()=>{const b=buildings.find(x=>x.id===el.dataset.id);$('#mapState').textContent=b.name;el.classList.add('peek');setTimeout(()=>el.classList.remove('peek'),900)});
  $$('.village-character',root).forEach(el=>el.onclick=()=>{const c=state.characters.find(x=>x.id===el.dataset.character);if(!c)return;state.activeId=c.id;save();applyActiveCharacterTheme();renderAll();renderVillage()});
  const current=currentBuilding(activeCharacter);if(current)$('#mapState').textContent=current.name;
 }
 function renderBuildingEditor(){
  ensureVillage();const box=$('#villageBuildingList');if(!box)return;
  box.innerHTML=state.village.buildings.map(b=>`<div class="village-edit-row" data-id="${b.id}"><div class="building-icon">${TYPES[b.type]?.[1]||'🏠'}</div><div><strong>${escape(b.name)}</strong><span>${escape(TYPES[b.type]?.[0]||'건물')} · ${escape(b.open)}~${escape(b.close)}</span></div><button class="icon-btn edit-building">편집</button><button class="icon-btn delete-building">삭제</button></div>`).join('');
  $$('.edit-building',box).forEach(btn=>btn.onclick=()=>fillBuildingForm(btn.closest('[data-id]').dataset.id));
  $$('.delete-building',box).forEach(btn=>btn.onclick=()=>{const buildingId=btn.closest('[data-id]').dataset.id;if(!confirm('이 건물을 마을에서 삭제할까요?'))return;state.village.buildings=state.village.buildings.filter(b=>b.id!==buildingId);state.characters.forEach(c=>{if(c.workBuildingId===buildingId)c.workBuildingId=''});save();renderBuildingEditor();renderVillage();renderWorkSelect()});
 }
 function fillBuildingForm(buildingId=''){
  const b=ensureVillage().buildings.find(x=>x.id===buildingId);
  $('#buildingId').value=b?.id||'';$('#buildingName').value=b?.name||'';$('#buildingType').value=b?.type||'company';$('#buildingDescription').value=b?.description||'';$('#buildingOpen').value=b?.open||'09:00';$('#buildingClose').value=b?.close||'22:00';$('#buildingColor').value=b?.color||'#91a7ff';$('#buildingX').value=b?.x??50;$('#buildingY').value=b?.y??50;
 }
 function saveBuilding(){
  const existing=state.village.buildings.find(b=>b.id===$('#buildingId').value),building=existing||{id:id()};
  Object.assign(building,{name:$('#buildingName').value.trim()||'이름 없는 건물',type:$('#buildingType').value,description:$('#buildingDescription').value.trim(),open:$('#buildingOpen').value,close:$('#buildingClose').value,color:$('#buildingColor').value,x:Number($('#buildingX').value),y:Number($('#buildingY').value)});
  if(!existing)state.village.buildings.push(building);save();fillBuildingForm();renderBuildingEditor();renderVillage();renderWorkSelect();toast(existing?'건물을 수정했습니다.':'마을에 새 건물을 추가했습니다.');
 }
 function installVillageUI(){
  ensureVillage();
  state.characters.forEach(character=>(character.today||[]).forEach((event,index)=>assignEvent(character,event,index)));
  save();
  const mapCard=$('#observationMapCard');mapCard?.classList.add('virtual-village-card');
  const privacy=$('.privacy-map-note');if(privacy)privacy.textContent='이곳은 실제 지도나 GPS가 아닌, 사용자가 꾸미는 가상의 마을입니다.';
  const placeTab=$('.tab[data-view="places"]');if(placeTab)placeTab.textContent='마을';
  const placeView=$('#view-places');if(placeView)placeView.innerHTML=`<div class="village-editor-layout"><section class="card panel"><div class="title-row"><div><h3>🏘️ 가상 마을 편집</h3><span>회사·카페·미용실 등 원하는 건물을 직접 만들어요.</span></div></div><div class="fields"><div class="full"><label>마을 이름</label><input id="villageName"></div><input type="hidden" id="buildingId"><div><label>건물 이름</label><input id="buildingName" placeholder="예: 별무리 디자인 회사"></div><div><label>건물 종류</label><select id="buildingType">${Object.entries(TYPES).map(([v,[label,icon]])=>`<option value="${v}">${icon} ${label}</option>`).join('')}</select></div><div class="full"><label>건물 설명</label><input id="buildingDescription" placeholder="이곳에서 캐릭터가 무엇을 할 수 있는지"></div><div><label>문 여는 시간</label><input type="time" id="buildingOpen" value="09:00"></div><div><label>문 닫는 시간</label><input type="time" id="buildingClose" value="22:00"></div><div><label>건물 색</label><input type="color" id="buildingColor" value="#91a7ff"></div><div><label>마을 가로 위치</label><input type="range" id="buildingX" min="5" max="95" value="50"></div><div><label>마을 세로 위치</label><input type="range" id="buildingY" min="8" max="92" value="50"></div></div><div class="actions"><button class="btn" id="saveBuilding">건물 저장</button><button class="btn secondary" id="clearBuilding">새 건물</button></div></section><section class="card panel"><h3>마을 건물 목록</h3><div id="villageBuildingList"></div></section></div>`;
  const googleSection=$('#view-theme .section:nth-child(2)');if(googleSection&&/Google|API/.test(googleSection.textContent))googleSection.remove();
  $$('.quick a').find(a=>/콜라/.test(a.textContent))?.remove();
  const homeText=$('#view-home .home-view-head p');if(homeText)homeText.textContent='집 안의 캐릭터는 이곳에서 보여요. 외부 지도 API를 사용하지 않습니다.';
  $('#villageName').value=state.village.name;$('#villageName').onchange=e=>{state.village.name=e.target.value.trim()||'이름 없는 마을';save();renderVillage()};
  $('#saveBuilding').onclick=saveBuilding;$('#clearBuilding').onclick=()=>fillBuildingForm();
  fillBuildingForm();renderBuildingEditor();installWorkSelect();renderVillage();
 }
 function installWorkSelect(){
  if($('#charVillageWork'))return;
  const old=$('#charWork'),wrap=old?.parentElement;if(!wrap)return;
  wrap.innerHTML='<label>직장·학교 건물</label><select id="charVillageWork"></select>';
  renderWorkSelect();
  $('#saveChar')?.addEventListener('click',()=>{active().workBuildingId=$('#charVillageWork').value;const b=state.village.buildings.find(x=>x.id===active().workBuildingId);active().work=b?.name||'';save();setTimeout(()=>{renderVillage();window.queueParallelCityCloudSync?.()},0)},true);
 }
 function renderWorkSelect(){
  const select=$('#charVillageWork');if(!select)return;const current=active();
  select.innerHTML='<option value="">직장·학교 없음</option>'+state.village.buildings.filter(b=>['company','school','cafe','restaurant','salon','hospital','shop','public'].includes(b.type)).map(b=>`<option value="${b.id}">${TYPES[b.type]?.[1]||'🏢'} ${escape(b.name)}</option>`).join('');
  select.value=current.workBuildingId||'';
 }
 /* 외부 지도·장소 호출을 완전히 비활성화하고 가상 마을로 치환 */
 window.loadGooglePlaces=async()=>null;window.ensureGoogleObservationMap=async()=>({setCenter(){},setZoom(){},panTo(){},getCenter(){return{lat:()=>0,lng:()=>0}}});
 window.forceGoogleMap=async()=>{renderVillage();return null};window.searchGooglePlaces=()=>{};window.testGooglePlacesAccess=async()=>true;
 window.geocodeArea=async()=>({lat:0,lng:0});window.resolveRealEventPlace=async(c,e)=>assignEvent(c,e);window.resolveRealPlacesForDay=async(c,list)=>{(list||[]).forEach((e,i)=>assignEvent(c,e,i));return list};
 window.refreshWeather=async()=>{const day=new Date().getDate(),weather=['맑음','구름 조금','바람','가상 소나기'][day%4];state.weather={rain:weather==='가상 소나기',label:weather,checkedAt:Date.now()};return state.weather};
 window.concreteActivity=(character,category)=>{const type=({books:'bookstore',shopping:'mall',anime:'anime',perfume:'perfume',restaurant:'restaurant',cafe:'cafe',park:'park'}[category]||category),building=chooseBuilding(character,type,category);return{place:buildingPlace(building),detail:`${building.name}을(를) 선택함 · ${building.description||'가상 마을의 장소'}`}};
 window.updateMarkers=renderVillage;
 window.map={setView(){renderVillage()},panTo(){renderVillage()},getCenter(){return{lat:0,lng:0}},invalidateSize(){renderVillage()},scrollWheelZoom:{disable(){}},doubleClickZoom:{disable(){}},touchZoom:{enable(){}},options:{},eachLayer(){},removeLayer(){}};
 const baseFill=window.fillForm;window.fillForm=function(){baseFill?.();renderWorkSelect()};
 const baseRender=window.renderAll;window.renderAll=function(){baseRender?.();renderWorkSelect();renderVillage()};
 window.ParallelCityVillage={render:renderVillage,renderEditor:renderBuildingEditor,ensure:ensureVillage,assignEvent};
 window.addEventListener('DOMContentLoaded',installVillageUI,{once:true});
 if(document.readyState!=='loading')installVillageUI();
 window.addEventListener('pageshow',()=>setTimeout(()=>{renderVillage();renderBuildingEditor();renderWorkSelect()},100));
 setInterval(renderVillage,60000);
})();
