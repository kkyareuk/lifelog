/* 평행도시 가상 월드 v40 — 외부 지도 API를 사용하지 않습니다. */
(()=>{
 const $=(q,r=document)=>r.querySelector(q), $$=(q,r=document)=>[...r.querySelectorAll(q)];
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const uid=()=>crypto.randomUUID(), hash=s=>[...String(s)].reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,17);
 const TYPES={
  company:['회사','🏢'],office:['사무실','🏬'],school:['학교','🏫'],university:['대학교','🎓'],cafe:['카페','☕'],restaurant:['음식점','🍽️'],
  bakery:['빵집','🥐'],salon:['미용실','💇'],hospital:['병원','🏥'],clinic:['의원','🩺'],pharmacy:['약국','💊'],convenience:['편의점','🏪'],
  market:['마트','🛒'],bookstore:['서점','📚'],library:['도서관','🏛️'],anime:['굿즈숍','🎀'],perfume:['향수 공방','🧴'],workshop:['공방','🧵'],
  park:['공원','🌳'],gym:['운동 시설','🏋️'],cinema:['영화관','🎬'],mall:['쇼핑몰','🛍️'],station:['정류장','🚉'],pet:['반려동물 시설','🐾'],
  bar:['술집','🍸'],public:['공공시설','🏛️'],bank:['은행','🏦'],post:['우체국','📮'],hotel:['호텔','🏨'],museum:['박물관','🏺'],
  gallery:['미술관','🖼️'],karaoke:['노래방','🎤'],arcade:['오락실','🕹️'],laundry:['세탁소','🧺'],flower:['꽃집','💐'],daycare:['보육시설','🧸']
 };
 const THEMES={town:'포근한 마을',city:'현대 도시',western:'서양 거리',fantasy:'판타지',coast:'바닷가',cyber:'사이버 시티',country:'시골',campus:'학원가'};
 const palette=['#91a7ff','#74c0fc','#d0a17b','#ff9f80','#e7a6d8','#80cbc4','#8ed081','#b39ddb','#ff8fab','#9fa8da','#75c991','#f7b267'];
 const names={
  company:['은하 출판사','별빛 디자인','오로라 연구소','새벽 게임즈','푸른 회계법인','라온 스튜디오'],school:['별마루 고등학교','한결 중학교','푸른초등학교'],
  university:['평행대학교','도담예술대학'],cafe:['단무리 카페','달빛 로스터리','유리정원 카페','새벽 한 잔','구름다방'],restaurant:['윤슬식당','모퉁이 국밥','라일락 키친','소담 분식','은하반점','별미 우동'],
  bakery:['오후의 빵집','밀밭 베이커리'],salon:['라일라 미용실','봄결 헤어'],hospital:['새봄병원'],clinic:['한결의원'],pharmacy:['푸른약국'],
  convenience:['별빛24','한밤 편의점'],market:['구름마트','도담시장'],bookstore:['종이달 서점','문장과 밤'],library:['시립 별도서관'],
  anime:['은하 굿즈숍','최애상점'],perfume:['안개 조향공방','향기의 방'],workshop:['손끝 공방','유리 공방'],park:['별고리 중앙공원','물빛 산책공원'],
  gym:['파동 체육관','새벽 피트니스'],cinema:['유성 영화관'],mall:['평행백화점','오로라 몰'],station:['중앙역','별마루역'],pet:['꼬리별 동물병원','포근 펫숍'],
  bar:['달그림자 바'],public:['도시청','주민센터'],bank:['평행은행'],post:['중앙우체국'],hotel:['그랜드 오로라'],museum:['시간박물관'],gallery:['백야미술관'],
  karaoke:['별밤 노래방'],arcade:['픽셀 오락실'],laundry:['보송 세탁소'],flower:['윤슬 꽃집'],daycare:['도담 어린이집']
 };
 function makeBuildings(seed,count,theme){
  const typeList=theme==='city'
   ?['company','office','company','cafe','restaurant','restaurant','convenience','mall','station','hospital','pharmacy','salon','gym','cinema','bank','hotel','gallery','karaoke','arcade','bookstore']
   :['cafe','restaurant','bakery','salon','clinic','pharmacy','convenience','market','bookstore','library','anime','perfume','workshop','park','gym','cinema','flower','laundry','pet','public'];
  return Array.from({length:count},(_,i)=>{
   const type=typeList[(hash(seed+i)+i)%typeList.length], list=names[type]||[TYPES[type][0]], name=list[(hash(seed+type+i))%list.length];
   return{id:uid(),type,name:i>=list.length?`${name} ${i+1}호점`:name,x:7+(hash(seed+'x'+i)%87),y:11+(hash(seed+'y'+i)%78),color:palette[i%palette.length],open:'09:00',close:'22:00',description:`${name}에서 시간을 보낼 수 있어요.`};
  });
 }
 function neighborhood(name,theme,seed,count=26){return{id:uid(),name,theme,background:'',buildings:makeBuildings(seed,count,theme)}}
 function district(name,theme,seed,hoodNames){return{id:uid(),name,theme,background:'',neighborhoods:hoodNames.map((n,i)=>neighborhood(n,theme,seed+i,theme==='city'?34:26))}}
 function freshWorld(){
  const village={id:'village',name:'유저 마을',theme:'town',districts:[
   district('강남 구역','town','v1',['현대백화점 일대','중앙 상가','시민 공원']),
   district('서부 구역','western','v2',['대학로','문화 거리','주거 단지'])
  ]};
  const city={id:'city',name:'도심지',theme:'city',districts:[
   district('중앙 업무 구역','city','c1',['대기업 본사촌','평행역 상권','시청 광장']),
   district('문화 구역','city','c2',['박물관 단지','대학로','먹자골목']),
   district('강변 구역','city','c3',['강변 공원','마리나 상가','수변 주거단지'])
  ]};
  return{activeWorldId:'village',activeDistrictId:village.districts[0].id,activeNeighborhoodId:village.districts[0].neighborhoods[0].id,items:[village,city]};
 }
 function ensureWorld(){
  if(!state.worlds?.items?.length){
   state.worlds=freshWorld();
   const old=state.village?.buildings;
   if(Array.isArray(old)&&old.length)state.worlds.items[0].districts[0].neighborhoods[0].buildings=old.map(b=>({...b,id:b.id||uid()}));
  }
  if(Number(state.worldSemanticVersion||0)<42){
   const rename={['별고리 구역']:'강남 구역',['달맞이 구역']:'서부 구역',['별고리 동네']:'현대백화점 일대',['물빛 동네']:'중앙 상가',['라일락 동네']:'시민 공원',['달맞이 거리']:'대학로',['장미 골목']:'문화 거리',['종이달 동네']:'주거 단지',['중앙 업무 지구']:'중앙 업무 구역',['문화 지구']:'문화 구역',['강변 지구']:'강변 구역',['오로라대로']:'대기업 본사촌',['평행역 상권']:'평행역 상권',['시청 거리']:'시청 광장',['뮤지엄 거리']:'박물관 단지',['별밤 먹자골목']:'먹자골목',['윤슬 강변']:'강변 공원',['마리나 거리']:'마리나 상가'};
   state.worlds.items.forEach(w=>w.districts.forEach(d=>{d.name=rename[d.name]||d.name;d.neighborhoods.forEach(n=>n.name=rename[n.name]||n.name)}));state.worldSemanticVersion=42;queueMicrotask(()=>save?.());
  }
  const w=world(),d=w.districts.find(x=>x.id===state.worlds.activeDistrictId)||w.districts[0],n=d.neighborhoods.find(x=>x.id===state.worlds.activeNeighborhoodId)||d.neighborhoods[0];
  state.worlds.activeDistrictId=d.id;state.worlds.activeNeighborhoodId=n.id;
  state.characters.forEach(c=>{c.workBuildingId=c.workBuildingId||''});
  state.worlds.items.forEach(w=>w.districts.forEach(d=>d.neighborhoods.forEach(n=>{
   if(!n.builtinArt)n.builtinArt=w.id==='city'?'city':'town';
   if(n.layoutVersion===41)return;
   const cols=Math.ceil(Math.sqrt(n.buildings.length*1.55)),rows=Math.ceil(n.buildings.length/cols);
   n.buildings.forEach((b,i)=>{b.x=7+(i%cols)*(86/Math.max(1,cols-1));b.y=18+Math.floor(i/cols)*(73/Math.max(1,rows-1))});
   n.layoutVersion=41;
  })));
  return state.worlds;
 }
 function world(){return state.worlds.items.find(x=>x.id===state.worlds.activeWorldId)||state.worlds.items[0]}
 function districtNow(){const w=world();return w.districts.find(x=>x.id===state.worlds.activeDistrictId)||w.districts[0]}
 function hood(){const d=districtNow();return d.neighborhoods.find(x=>x.id===state.worlds.activeNeighborhoodId)||d.neighborhoods[0]}
 function allBuildings(){return state.worlds.items.flatMap(w=>w.districts.flatMap(d=>d.neighborhoods.flatMap(n=>n.buildings.map(b=>({...b,worldId:w.id,districtId:d.id,neighborhoodId:n.id,worldName:w.name,districtName:d.name,neighborhoodName:n.name})))))}
 function locate(id){return allBuildings().find(b=>b.id===id)}
 function selectLocation(b){if(!b)return;state.worlds.activeWorldId=b.worldId;state.worlds.activeDistrictId=b.districtId;state.worlds.activeNeighborhoodId=b.neighborhoodId}
 function eventType(e,c){
  if(!e||e.home||e.kind==='home'||/집|귀가|취침|기상|하루 정리/.test(`${e.title||''} ${e.detail||''}`))return'home';
  const s=`${e.title||''} ${e.detail||''}`;if(/출근|회사|근무|야근/.test(s))return'company';if(/학교|수업|대학교/.test(s))return'school';
  if(/점심|저녁|식사|밥|국밥|반점/.test(s))return'restaurant';if(/카페|커피/.test(s))return'cafe';if(/미용|헤어/.test(s))return'salon';
  if(/병원|진료/.test(s))return'hospital';if(/약국/.test(s))return'pharmacy';if(/영화/.test(s))return'cinema';if(/운동|헬스/.test(s))return'gym';
  if(/책|독서|서점/.test(s))return'bookstore';if(/굿즈|애니/.test(s))return'anime';if(/향수|조향/.test(s))return'perfume';if(/쇼핑/.test(s))return'mall';return e.category||'park';
 }
 function anchorFor(c,e,index){
  const today=c.today||[],prior=today.slice(0,index).reverse().find(x=>x.villageBuildingId||x.place?.villageBuildingId);
  return locate(prior?.villageBuildingId||prior?.place?.villageBuildingId)||locate(c.workBuildingId);
 }
 function choose(c,type,seed,index=0){
  const fixed=['company','school','university'].includes(type)&&locate(c.workBuildingId);if(fixed)return fixed;
  const anchor=anchorFor(c,{time:seed},index), pool=allBuildings().filter(b=>b.type===type);
  let list=pool;
  if(anchor&&['restaurant','cafe','convenience','pharmacy','bakery'].includes(type)){
   const sameArea=pool.filter(b=>b.neighborhoodId===anchor.neighborhoodId);
   const walking=sameArea.filter(b=>Math.hypot(Number(b.x)-Number(anchor.x),Number(b.y)-Number(anchor.y))<=22);
   if(walking.length)list=walking;
   else if(sameArea.length)list=sameArea.sort((a,b)=>Math.hypot(a.x-anchor.x,a.y-anchor.y)-Math.hypot(b.x-anchor.x,b.y-anchor.y)).slice(0,6);
  }
  if(!list.length)list=allBuildings();
  return list[hash(`${c.id}-${seed}-${new Date().toLocaleDateString('sv-SE')}`)%list.length];
 }
 function assignEvent(c,e,index=0){
  if(!e||eventType(e,c)==='home')return e;const b=choose(c,eventType(e,c),`${e.time}-${index}`,index);if(!b)return e;
  e.villageBuildingId=b.id;e.worldId=b.worldId;e.districtId=b.districtId;e.neighborhoodId=b.neighborhoodId;
  e.place={name:b.name,address:`${b.worldName} · ${b.districtName} · ${b.neighborhoodName}`,villageBuildingId:b.id,virtual:true};
  if(/점심|저녁|식사/.test(e.title||''))e.title=`${b.name}에서 ${/점심/.test(e.title)?'점심':'식사'}`;
  e.detail=`${b.neighborhoodName}의 ${b.name} · ${e.detail||b.description}`;delete e.loc;return e;
 }
 function currentBuilding(c){
  const now=new Date(),e=typeof currentEvent==='function'?currentEvent(c,now.getHours()*60+now.getMinutes()):null;
  if(!e||eventType(e,c)==='home')return null;
  return locate(e.villageBuildingId||e.place?.villageBuildingId)||choose(c,eventType(e,c),e.time,0);
 }
 const avatar=c=>c.photo?`<img src="${c.photo}" alt="">`:`<span>${esc((c.name||'새')[0])}</span>`;
 const BUILTIN_ART={town:'./world-assets/developer-town.svg',city:'./world-assets/developer-city.svg',park:'./world-assets/developer-park.svg'};
 function bgStyle(region){const image=region.background||BUILTIN_ART[region.builtinArt]||'';return image?`background-image:url('${image}')`:''}
 const buildingIcon=b=>b.icon?`<img src="${b.icon}" alt="">`:`<i>${TYPES[b.type]?.[1]||'🏠'}</i>`;
 function renderMap(){
  ensureWorld();const root=$('#map');if(!root)return;const ac=active?.()||state.characters[0],focus=currentBuilding(ac),w=world(),d=districtNow(),n=hood();
  root.innerHTML=`<div class="world-map theme-${esc(n.theme||d.theme||w.theme)}" style="${bgStyle(n)}">
   <div class="world-map-head"><div class="world-navigator"><select id="observeWorld">${state.worlds.items.map(x=>`<option value="${x.id}" ${x.id===w.id?'selected':''}>${x.id==='city'?'🏙️':'🏡'} ${esc(x.name)}</option>`).join('')}</select><select id="observeDistrict">${w.districts.map(x=>`<option value="${x.id}" ${x.id===d.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select><select id="observeHood">${d.neighborhoods.map(x=>`<option value="${x.id}" ${x.id===n.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select></div><small>${focus&&focus.neighborhoodId!==n.id?`${esc(ac.name)}는 지금 ${esc(focus.neighborhoodName)}에 있어요`:'건물을 누르면 이름과 종류를 볼 수 있어요'}</small></div>
   <div class="world-roads"></div>
   ${n.buildings.map(b=>`<button class="world-building type-${b.type}" data-id="${b.id}" style="--x:${b.x}%;--y:${b.y}%;--building:${b.color||'#91a7ff'}">${buildingIcon(b)}<b>${esc(b.name)}</b><small>${esc(TYPES[b.type]?.[0]||'건물')}</small></button>`).join('')}
   ${state.characters.map(c=>{const b=currentBuilding(c);if(!b||b.neighborhoodId!==n.id)return'';return`<button class="world-character ${c.id===ac?.id?'active':''}" data-character="${c.id}" style="--x:${b.x}%;--y:${b.y}%;--person:${c.theme?.accent||c.theme||'#6f7cff'}">${avatar(c)}<em><b>${esc(c.name)}</b><small>${esc(b.name)}</small></em></button>`}).join('')}
   <div class="world-location-roster">${state.characters.map(c=>{const b=currentBuilding(c);return b?`<button data-jump="${c.id}">${avatar(c)}<span><b>${esc(c.name)}</b><small>${esc(b.neighborhoodName)} · ${esc(b.name)}</small></span></button>`:`<button disabled>${avatar(c)}<span><b>${esc(c.name)}</b><small>집에서 생활 중</small></span></button>`}).join('')}</div>
  </div>`;
  $$('.world-building',root).forEach(el=>el.onclick=()=>{const b=locate(el.dataset.id);const ms=$('#mapState');if(ms)ms.textContent=b.name});
  $$('.world-character',root).forEach(el=>el.onclick=()=>{const c=state.characters.find(x=>x.id===el.dataset.character);if(c){state.activeId=c.id;const b=currentBuilding(c);if(b)selectLocation(b);save();applyActiveCharacterTheme?.();renderAll?.();renderMap()}});
  $('#observeWorld').onchange=e=>{state.worlds.activeWorldId=e.target.value;const next=world();state.worlds.activeDistrictId=next.districts[0].id;state.worlds.activeNeighborhoodId=next.districts[0].neighborhoods[0].id;save();renderMap()};
  $('#observeDistrict').onchange=e=>{state.worlds.activeDistrictId=e.target.value;state.worlds.activeNeighborhoodId=districtNow().neighborhoods[0].id;save();renderMap()};
  $('#observeHood').onchange=e=>{state.worlds.activeNeighborhoodId=e.target.value;save();renderMap()};
  $$('[data-jump]',root).forEach(btn=>btn.onclick=()=>{const c=state.characters.find(x=>x.id===btn.dataset.jump),b=c&&currentBuilding(c);if(!b)return;selectLocation(b);state.activeId=c.id;save();applyActiveCharacterTheme?.();renderAll?.();renderMap()});
  const clock=$('#clock'),date=$('#date'),now=new Date();if(clock)clock.textContent=now.toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'});if(date)date.textContent=now.toLocaleDateString('ko-KR',{month:'long',day:'numeric',weekday:'short'});
  const outside=state.characters.filter(c=>currentBuilding(c)),home=state.characters.filter(c=>!currentBuilding(c)),allHome=$('#allHomeMapMessage'),picker=$('#observeCharacterPicker');
  if(picker)[...picker.children].forEach((card,i)=>card.style.display=home.includes(state.characters[i])?'none':'');
  if(allHome){allHome.style.display=outside.length?'none':'grid';const sleeping=state.characters.every(c=>window.ParallelCityHome?.sleepState?.(c)?.sleeping);allHome.querySelector('strong').textContent=sleeping?'모든 인물들이 자고 있어요':'모든 인물들이 집에 있어요';allHome.querySelector('span').textContent='집 화면에서 인물과 반려동물의 상태를 볼 수 있어요.';allHome.querySelector('button').textContent='집으로 이동하기'}
  if(focus){const ms=$('#mapState');if(ms)ms.textContent=`${ac.name} · ${focus.name}`}else{const ms=$('#mapState');if(ms)ms.textContent='집에서 생활 중'}
 }
 function navMarkup(){
  const w=world(),d=districtNow(),n=hood();
  return`<div class="world-switch">${state.worlds.items.map(x=>`<button class="${x.id===w.id?'active':''}" data-world="${x.id}">${x.id==='city'?'🏙️':'🏡'} ${esc(x.name)}</button>`).join('')}</div>
   <div class="world-drill"><div><label>구역</label>${w.districts.map(x=>`<button class="${x.id===d.id?'active':''}" data-district="${x.id}">${esc(x.name)}</button>`).join('')}<button data-add-district>＋ 구역</button></div>
   <div><label>세부지역</label>${d.neighborhoods.map(x=>`<button class="${x.id===n.id?'active':''}" data-hood="${x.id}">${esc(x.name)}</button>`).join('')}<button data-add-hood>＋ 세부지역</button></div></div>`;
 }
 function editorMarkup(){
  const w=world(),d=districtNow(),n=hood();
  return`<section class="card panel world-editor-main">${navMarkup()}
   <div class="world-region-form"><div><label>현재 세부지역 이름</label><input id="regionName" value="${esc(n.name)}"></div><div><label>지역 테마</label><div class="theme-picks">${Object.entries(THEMES).map(([v,l])=>`<button data-theme="${v}" class="${n.theme===v?'active':''}">${l}</button>`).join('')}</div></div>
   <div><label>사이트 기본 그림</label><select id="builtinRegionArt"><option value="">테마 배경</option><option value="town">개발자 그림 · 마을</option><option value="city">개발자 그림 · 도시</option><option value="park">개발자 그림 · 공원</option></select></div>
   <div><label>직접 올리는 지역 그림</label><input id="regionBackground" type="file" accept="image/*"><button class="btn secondary" id="clearRegionBackground">업로드 그림 지우기</button></div></div>
   <p class="drag-help">건물을 손가락이나 마우스로 꾹 잡고 원하는 자리에 끌어 놓으세요.</p>
   <div id="worldEditMap"></div></section>
   <section class="card panel world-building-panel"><h3>건물 만들기</h3><input type="hidden" id="buildingId"><div class="fields"><div><label>건물 이름</label><input id="buildingName" placeholder="예: 별무리 게임 회사"></div><div><label>종류</label><select id="buildingType">${Object.entries(TYPES).map(([v,[l,i]])=>`<option value="${v}">${i} ${l}</option>`).join('')}</select></div><div class="full"><label>설명</label><input id="buildingDescription" placeholder="이 건물에서 무엇을 할 수 있는지"></div><div><label>여는 시간</label><input type="time" id="buildingOpen" value="09:00"></div><div><label>닫는 시간</label><input type="time" id="buildingClose" value="22:00"></div><div><label>건물 색</label><input type="color" id="buildingColor" value="#91a7ff"></div><div><label>내가 그린 건물 아이콘</label><input type="file" id="buildingIcon" accept="image/*"></div></div><div class="actions"><button class="btn" id="saveBuilding">건물 저장</button><button class="btn secondary" id="clearBuilding">새 건물</button></div><div id="worldBuildingList"></div></section>`;
 }
 function renderEditMap(){
  const box=$('#worldEditMap');if(!box)return;const n=hood();
  box.innerHTML=`<div class="world-map edit-mode theme-${n.theme}" style="${bgStyle(n)}"><div class="world-map-head"><strong>${esc(n.name)}</strong><small>건물 직접 배치 모드</small></div><div class="world-roads"></div>${n.buildings.map(b=>`<button class="world-building type-${b.type}" data-id="${b.id}" style="--x:${b.x}%;--y:${b.y}%;--building:${b.color||'#91a7ff'}">${buildingIcon(b)}<b>${esc(b.name)}</b></button>`).join('')}</div>`;
  $$('.world-building',box).forEach(el=>{
   let moved=false;
   el.onpointerdown=e=>{e.preventDefault();moved=false;el.setPointerCapture(e.pointerId);el.classList.add('dragging')};
   el.onpointermove=e=>{if(!el.hasPointerCapture(e.pointerId))return;const rect=el.parentElement.getBoundingClientRect();const b=hood().buildings.find(x=>x.id===el.dataset.id);b.x=Math.max(4,Math.min(96,(e.clientX-rect.left)/rect.width*100));b.y=Math.max(8,Math.min(94,(e.clientY-rect.top)/rect.height*100));el.style.setProperty('--x',`${b.x}%`);el.style.setProperty('--y',`${b.y}%`);moved=true};
   el.onpointerup=e=>{el.releasePointerCapture(e.pointerId);el.classList.remove('dragging');if(moved){save();toast?.('건물 위치를 저장했어요.')}else fillBuilding(el.dataset.id)};
  });
 }
 function renderBuildingList(){
  const box=$('#worldBuildingList');if(!box)return;
  box.innerHTML=hood().buildings.map(b=>`<div class="village-edit-row" data-id="${b.id}"><div class="building-icon">${TYPES[b.type]?.[1]||'🏠'}</div><div><strong>${esc(b.name)}</strong><span>${TYPES[b.type]?.[0]} · ${b.open}~${b.close}</span></div><button class="icon-btn edit-building">편집</button><button class="icon-btn delete-building">삭제</button></div>`).join('');
  $$('.edit-building',box).forEach(x=>x.onclick=()=>fillBuilding(x.closest('[data-id]').dataset.id));
  $$('.delete-building',box).forEach(x=>x.onclick=()=>{const id=x.closest('[data-id]').dataset.id;if(!confirm('이 건물을 삭제할까요?'))return;hood().buildings=hood().buildings.filter(b=>b.id!==id);state.characters.forEach(c=>{if(c.workBuildingId===id)c.workBuildingId=''});save();renderEditor()});
 }
 let draftBuildingIcon='';
 function fillBuilding(id=''){
  const b=hood().buildings.find(x=>x.id===id);draftBuildingIcon=b?.icon||'';$('#buildingId').value=b?.id||'';$('#buildingName').value=b?.name||'';$('#buildingType').value=b?.type||'company';$('#buildingDescription').value=b?.description||'';$('#buildingOpen').value=b?.open||'09:00';$('#buildingClose').value=b?.close||'22:00';$('#buildingColor').value=b?.color||'#91a7ff';if($('#buildingIcon'))$('#buildingIcon').value='';
 }
 function saveBuilding(){
  const old=hood().buildings.find(x=>x.id===$('#buildingId').value),b=old||{id:uid(),x:50,y:50};
  Object.assign(b,{name:$('#buildingName').value.trim()||'이름 없는 건물',type:$('#buildingType').value,description:$('#buildingDescription').value.trim(),open:$('#buildingOpen').value,close:$('#buildingClose').value,color:$('#buildingColor').value,icon:draftBuildingIcon});
  if(!old)hood().buildings.push(b);save();fillBuilding();renderEditor();renderWorkSelect();toast?.(old?'건물을 수정했어요.':'새 건물을 만들었어요.');
 }
 function bindEditor(){
  $$('[data-world]').forEach(b=>b.onclick=()=>{state.worlds.activeWorldId=b.dataset.world;const w=world();state.worlds.activeDistrictId=w.districts[0].id;state.worlds.activeNeighborhoodId=w.districts[0].neighborhoods[0].id;save();renderEditor()});
  $$('[data-district]').forEach(b=>b.onclick=()=>{state.worlds.activeDistrictId=b.dataset.district;state.worlds.activeNeighborhoodId=districtNow().neighborhoods[0].id;save();renderEditor()});
  $$('[data-hood]').forEach(b=>b.onclick=()=>{state.worlds.activeNeighborhoodId=b.dataset.hood;save();renderEditor()});
  $('[data-add-district]')?.addEventListener('click',()=>{const name=prompt('새 구역 이름을 적어 주세요.','새 구역');if(!name)return;const d=district(name,'town',uid(),['첫 번째 동네']);world().districts.push(d);state.worlds.activeDistrictId=d.id;state.worlds.activeNeighborhoodId=d.neighborhoods[0].id;save();renderEditor()});
  $('[data-add-hood]')?.addEventListener('click',()=>{const name=prompt('새 세부지역 이름을 적어 주세요.','새 상가·공원·거리');if(!name)return;const n=neighborhood(name,districtNow().theme,uid(),24);districtNow().neighborhoods.push(n);state.worlds.activeNeighborhoodId=n.id;save();renderEditor()});
  $('#regionName').onchange=e=>{hood().name=e.target.value.trim()||'이름 없는 동네';save();renderEditor()};
  $('#builtinRegionArt').value=hood().builtinArt||'';$('#builtinRegionArt').onchange=e=>{hood().builtinArt=e.target.value;hood().background='';save();renderEditor()};
  $$('[data-theme]').forEach(b=>b.onclick=()=>{hood().theme=b.dataset.theme;save();renderEditor()});
  $('#regionBackground').onchange=async e=>{const f=e.target.files[0];if(!f)return;hood().background=typeof compactCharacterPhoto==='function'?await compactCharacterPhoto(f):await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(f)});state.pendingCloudSave=true;save();await window.pushParallelCityCloudState?.();renderEditor();toast?.('동네 배경 사진을 저장했어요.')};
  $('#clearRegionBackground').onclick=()=>{hood().background='';save();renderEditor()};
  $('#buildingIcon').onchange=async e=>{const file=e.target.files[0];if(!file)return;draftBuildingIcon=await compactCharacterPhoto(file);toast?.('건물 아이콘을 준비했어요. 건물 저장을 눌러 주세요.')};
  $('#saveBuilding').onclick=saveBuilding;$('#clearBuilding').onclick=()=>fillBuilding();
 }
 function renderEditor(){ensureWorld();const view=$('#view-places');if(!view)return;view.innerHTML=`<div class="world-editor-layout">${editorMarkup()}</div>`;bindEditor();renderEditMap();renderBuildingList();fillBuilding()}
 function installWorkSelect(){
  let select=$('#charVillageWork');if(!select){const old=$('#charWork'),wrap=old?.parentElement;if(!wrap)return;wrap.innerHTML='<label>직장·학교 건물</label><select id="charVillageWork"></select>';select=$('#charVillageWork');
   $('#saveChar')?.addEventListener('click',()=>{const c=active();c.workBuildingId=$('#charVillageWork')?.value||'';const b=locate(c.workBuildingId);c.work=b?.name||'';save();setTimeout(()=>{renderMap();window.queueParallelCityCloudSync?.()},0)},true)}
  renderWorkSelect();
 }
 function renderWorkSelect(){
  const s=$('#charVillageWork');if(!s)return;const c=active();s.innerHTML='<option value="">직장·학교 없음</option>'+allBuildings().filter(b=>['company','office','school','university','cafe','restaurant','salon','hospital','clinic','public'].includes(b.type)).map(b=>`<option value="${b.id}">${TYPES[b.type][1]} ${esc(b.name)} — ${esc(b.neighborhoodName)}</option>`).join('');s.value=c.workBuildingId||'';
 }
 function portraitGuard(){
  if(!$('#portraitOnly'))document.body.insertAdjacentHTML('beforeend','<div id="portraitOnly"><b>세로 화면으로 돌려 주세요 📱</b><span>평행도시는 세로 화면에 맞춰져 있어요.</span></div>');
  if(matchMedia('(display-mode: standalone)').matches)screen.orientation?.lock?.('portrait-primary').catch(()=>{});
 }
 function install(){
  ensureWorld();state.characters.forEach(c=>(c.today||[]).forEach((e,i)=>assignEvent(c,e,i)));
 const tab=$('.tab[data-view="places"]');if(tab)tab.textContent='마을';
  $('.quick a[href*="payment"]')?.remove();$('.privacy-map-note')?.remove();
  $$('#view-theme .section').find(section=>/Google|Places|Maps API/.test(section.textContent||''))?.remove();
  const homeText=$('#view-home .home-view-head p');if(homeText)homeText.remove();
  $('#charHome')?.parentElement?.setAttribute('hidden','');
  renderEditor();installWorkSelect();renderMap();
 }
 window.loadGooglePlaces=async()=>null;window.ensureGoogleObservationMap=async()=>({setCenter(){},setZoom(){},panTo(){},getCenter(){return{lat:()=>0,lng:()=>0}}});
 window.forceGoogleMap=async()=>{renderMap();return null};window.searchGooglePlaces=()=>{};window.testGooglePlacesAccess=async()=>true;window.geocodeArea=async()=>({lat:0,lng:0});
 window.resolveRealEventPlace=async(c,e)=>assignEvent(c,e);window.resolveRealPlacesForDay=async(c,list)=>{(list||[]).forEach((e,i)=>assignEvent(c,e,i));return list};
 window.refreshWeather=async()=>{const list=['맑음','구름 조금','산들바람','가벼운 소나기'],label=list[new Date().getDate()%list.length];state.weather={rain:label.includes('비'),label,checkedAt:Date.now()};return state.weather};
 window.updateMarkers=renderMap;window.map={setView(){renderMap()},panTo(){renderMap()},getCenter(){return{lat:0,lng:0}},invalidateSize(){renderMap()},scrollWheelZoom:{disable(){}},doubleClickZoom:{disable(){}},touchZoom:{enable(){}},options:{},eachLayer(){},removeLayer(){}};
 const oldFill=window.fillForm;window.fillForm=function(){oldFill?.();renderWorkSelect()};
 const oldRender=window.renderAll;window.renderAll=function(){oldRender?.();renderWorkSelect();renderMap()};
 window.ParallelCityVillage={render:renderMap,renderEditor,ensure:ensureWorld,assignEvent,locate,currentBuilding,allBuildings};
 addEventListener('DOMContentLoaded',install,{once:true});if(document.readyState!=='loading')install();addEventListener('pageshow',()=>setTimeout(()=>{renderMap();renderEditor();renderWorkSelect()},120));setInterval(renderMap,60000);
})();
