/* 평행도시 v47 — 도로 생활 시뮬레이션, 사진/아이콘 분리, 공동 식사 정합성 */
(()=>{
 const $=(q,r=document)=>r.querySelector(q),$$=(q,r=document)=>[...r.querySelectorAll(q)];
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const hash=v=>[...String(v)].reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,29);
 const min=v=>{const [h,m]=String(v||'0:0').split(':').map(Number);return h*60+m};
 const nowMinute=()=>new Date().getHours()*60+new Date().getMinutes()+new Date().getSeconds()/60;
 const characterTheme=c=>typeof ensureCharTheme==='function'?ensureCharTheme(c):{accent:c?.theme?.accent||c?.theme||'#6f7cff'};

 /* 각 세부지역은 같은 비율의 숨은 도로망을 가집니다. 배경 그림 위 도로와 맞출 때 노드만 바꾸면 됩니다. */
 const ROAD_NODES=[
  [3,89],[17,79],[31,73],[43,91],[58,84],[75,78],[94,86],
  [6,54],[18,46],[31,41],[43,53],[56,53],[70,48],[89,61],
  [11,34],[27,36],[38,27],[52,28],[66,30],[80,20],[96,7],[56,13]
 ];
 const ROAD_EDGES=[
  [0,1],[1,2],[2,3],[3,4],[4,5],[5,6],
  [0,7],[7,8],[8,9],[9,10],[10,11],[11,12],[12,13],[13,6],
  [7,14],[14,15],[15,16],[16,17],[17,18],[18,19],[19,20],
  [10,16],[11,17],[12,18],[17,21],[21,19],[4,10],[5,13]
 ];
 function distance(a,b){return Math.hypot(a[0]-b[0],a[1]-b[1])}
 function nearestNode(x,y){let best=0,d=Infinity;ROAD_NODES.forEach((p,i)=>{const n=distance(p,[x,y]);if(n<d){d=n;best=i}});return best}
 function graph(){
  const g=ROAD_NODES.map(()=>[]);
  ROAD_EDGES.forEach(([a,b])=>{const d=distance(ROAD_NODES[a],ROAD_NODES[b]);g[a].push([b,d]);g[b].push([a,d])});return g;
 }
 function shortest(start,end){
  const G=graph();
  const d=ROAD_NODES.map(()=>Infinity),prev=[],open=new Set(ROAD_NODES.map((_,i)=>i));d[start]=0;
  while(open.size){let u=[...open].sort((a,b)=>d[a]-d[b])[0];open.delete(u);if(u===end)break;for(const [v,w] of G[u])if(open.has(v)&&d[u]+w<d[v]){d[v]=d[u]+w;prev[v]=u}}
  const path=[];let at=end;while(at!==undefined){path.unshift(at);if(at===start)break;at=prev[at]}return{path,distance:d[end]};
 }
 function pointOn(path,progress){
  const points=path.map(i=>ROAD_NODES[i]);if(points.length<2)return points[0]||ROAD_NODES[0];
  const lengths=points.slice(1).map((p,i)=>distance(points[i],p)),total=lengths.reduce((a,b)=>a+b,0),target=total*progress;
  let used=0;for(let i=0;i<lengths.length;i++){if(used+lengths[i]>=target){const t=(target-used)/lengths[i];return[points[i][0]+(points[i+1][0]-points[i][0])*t,points[i][1]+(points[i+1][1]-points[i][1])*t]}used+=lengths[i]}return points.at(-1);
 }
 function allBuildings(){return window.ParallelCityVillage?.allBuildings?.()||[]}
 function buildingForEvent(e){return window.ParallelCityVillage?.locate?.(e?.villageBuildingId||e?.place?.villageBuildingId)}
 function travelMinutes(c,d){
  const t=String(c.transport||'');
  const factor=/자가용|자동차/.test(t)?.13:/대중교통|버스|지하철/.test(t)?.18:.42;
  return Math.max(5,Math.min(48,Math.ceil(d*factor)));
 }
 function movementAt(c,minute=nowMinute()){
  const events=(c.today||[]).slice().sort((a,b)=>min(a.time)-min(b.time));
  const next=events.find(e=>min(e.time)>minute&&buildingForEvent(e));if(!next)return null;
  const nextBuilding=buildingForEvent(next),prior=[...events].reverse().find(e=>min(e.time)<=minute&&buildingForEvent(e));
  const priorBuilding=buildingForEvent(prior),endNode=nearestNode(nextBuilding.x,nextBuilding.y),startNode=priorBuilding&&priorBuilding.neighborhoodId===nextBuilding.neighborhoodId?nearestNode(priorBuilding.x,priorBuilding.y):nearestNode(4,84);
  const route=shortest(startNode,endNode),duration=travelMinutes(c,route.distance),arrival=min(next.time),departure=arrival-duration;
  if(minute<departure||minute>=arrival)return null;
  const rawProgress=Math.max(0,Math.min(1,(minute-departure)/duration)),progress=Math.floor(rawProgress*8)/8,point=pointOn(route.path,progress);
  return{...point,x:point[0],y:point[1],progress,route,duration,destination:nextBuilding,from:priorBuilding,mode:/자가용|자동차/.test(c.transport||'')?'🚗':/대중교통|버스|지하철/.test(c.transport||'')?'🚌':'🚶'};
 }
 function roadSvg(){
  return`<svg class="parallel-road-network" viewBox="0 0 100 100" preserveAspectRatio="none">${ROAD_EDGES.map(([a,b])=>`<line x1="${ROAD_NODES[a]?.[0]??0}" y1="${ROAD_NODES[a]?.[1]??0}" x2="${ROAD_NODES[b]?.[0]??0}" y2="${ROAD_NODES[b]?.[1]??0}"/>`).join('')}</svg>`;
 }
 function avatarSource(c){return c.iconPhoto||c.photo||''}
 function avatarMarkup(c){
  const source=avatarSource(c),theme=characterTheme(c).accent;
  if(source)return`<img class="${c.iconPhoto?'road-cutout':'road-photo'}" src="${source}" alt="">`;
  return`<span style="--person:${theme}">${esc((c.name||'새')[0])}</span>`;
 }
 function decorateWorld(){
  if(state.observationMode==='real')return;
  const map=$('#map .world-map');if(!map)return;
  $('.world-location-roster',map)?.remove();
  if(!$('.parallel-road-network',map))map.insertAdjacentHTML('afterbegin',roadSvg());
  const hoodId=state.worlds?.activeNeighborhoodId;
  for(const c of state.characters||[]){
   const movement=movementAt(c);if(!movement||movement.destination.neighborhoodId!==hoodId)continue;
   let el=$(`.world-character[data-character="${CSS.escape(c.id)}"]`,map);
   if(!el){el=document.createElement('button');el.className='world-character walking';el.dataset.character=c.id;el.innerHTML=`${avatarMarkup(c)}<em><b>${esc(c.name)}</b><small></small></em>`;map.append(el)}
   el.classList.add('walking');el.style.setProperty('--x',`${movement.x}%`);el.style.setProperty('--y',`${movement.y}%`);el.style.setProperty('--person',characterTheme(c).accent);
   $('small',el).textContent=`${movement.mode} ${movement.destination.name}(으)로 이동 중`;
   el.onclick=()=>focusCharacter(c);
  }
 }
 function focusCharacter(c){
  if(!c)return;state.activeId=c.id;applyActiveCharacterTheme?.();
  const movement=movementAt(c),building=movement?.destination||window.ParallelCityVillage?.currentBuilding?.(c);
  if(building&&state.observationMode!=='real'){
   state.worlds.activeWorldId=building.worldId;state.worlds.activeDistrictId=building.districtId;state.worlds.activeNeighborhoodId=building.neighborhoodId;
  }
  save?.();renderAll?.();window.ParallelCityVillage?.render?.();
  if(state.observationMode==='real')setTimeout(()=>window.updateMarkers?.(),50);
 }
 function snapBuildings(){
  const region=state.worlds?.items?.flatMap(w=>w.districts||[]).flatMap(d=>d.neighborhoods||[]).find(n=>n.id===state.worlds?.activeNeighborhoodId);
  if(!region)return;
  for(const b of region.buildings||[]){const node=nearestNode(Number(b.x)||50,Number(b.y)||50);b.roadNode=node;b.x=ROAD_NODES[node][0];b.y=ROAD_NODES[node][1]-3}
 }
 function bindMagnet(){
  $$('.world-map.edit-mode .world-building').forEach(el=>{
   if(el.dataset.magnet47)return;el.dataset.magnet47='1';
   el.addEventListener('pointerup',()=>setTimeout(()=>{
    const b=window.ParallelCityVillage?.locate?.(el.dataset.id);if(!b)return;
    const node=nearestNode(Number(b.x)||50,Number(b.y)||50);b.roadNode=node;b.x=ROAD_NODES[node][0];b.y=ROAD_NODES[node][1]-3;
    el.style.setProperty('--x',`${b.x}%`);el.style.setProperty('--y',`${b.y}%`);save?.();window.queueParallelCityCloudSync?.();
   },0),true);
  });
  const edit=$('#worldEditMap .world-map');if(edit&&!$('.parallel-road-network',edit))edit.insertAdjacentHTML('afterbegin',roadSvg());
  const addHood=$('[data-add-hood]');
  if(addHood&&!addHood.dataset.limit47){addHood.dataset.limit47='1';addHood.addEventListener('click',()=>setTimeout(()=>{
   const region=state.worlds?.items?.flatMap(w=>w.districts||[]).flatMap(d=>d.neighborhoods||[]).find(n=>n.id===state.worlds?.activeNeighborhoodId);
   if(!region)return;
   region.buildings=(region.buildings||[]).slice(0,12);region.buildings.forEach(b=>{const node=nearestNode(Number(b.x)||50,Number(b.y)||50);b.roadNode=node;b.x=ROAD_NODES[node][0];b.y=ROAD_NODES[node][1]-3});
   save?.();window.ParallelCityVillage?.renderEditor?.();
  },30))};
 }
 function migrateWorld(){
  if(Number(state.worldSemanticVersion||0)>=47)return;
  for(const w of state.worlds?.items||[])for(const d of w.districts||[])for(const n of d.neighborhoods||[]){
   const custom=(n.buildings||[]).filter(b=>b.icon||b.photo||b.userCreated||b.description!==`${b.name}에서 시간을 보낼 수 있어요.`);
   const generated=(n.buildings||[]).filter(b=>!custom.includes(b)).slice(0,Math.max(0,12-custom.length));
   n.buildings=[...custom,...generated];n.buildings.forEach(b=>{const node=nearestNode(Number(b.x)||50,Number(b.y)||50);b.roadNode=node;b.x=ROAD_NODES[node][0];b.y=ROAD_NODES[node][1]-3});
  }
  state.worldSemanticVersion=47;save?.();
 }
 function isolateCharacterArrays(){
  for(const c of state.characters||[]){c.tastes=[...(c.tastes||[])];c.interests=[...(c.interests||[])];c.hobbies=[...(c.hobbies||[])]}
 }
 const menus=['김치찌개','돈가스','파스타','비빔밥','우동','제육볶음','샌드위치'];
 function mealName(c,building){
  if(/우동/.test(building?.name||''))return'우동';
  if(/국밥/.test(building?.name||''))return'국밥';
  if(/반점|중식/.test(building?.name||''))return'짜장면';
  if(c.tastes?.includes('아재 입맛'))return['국밥','제육볶음','김치찌개'][hash(c.id)%3];
  if(c.tastes?.includes('어린이 입맛'))return['돈가스','오므라이스','햄버거'][hash(c.id)%3];
  return menus[hash(`${c.id}-${todayKey()}`)%menus.length];
 }
 function syncSharedMeals(){
  const chars=state.characters||[];
  for(let i=0;i<chars.length;i++)for(let j=i+1;j<chars.length;j++){
   const a=chars[i],b=chars[j];
   for(const ea of a.today||[]){
    const ba=buildingForEvent(ea);if(!ba||!/점심|저녁|식사|밥|우동|국밥|반점/.test(`${ea.title} ${ea.detail}`))continue;
    const eb=(b.today||[]).find(e=>{const bb=buildingForEvent(e);return bb?.id===ba.id&&Math.abs(min(e.time)-min(ea.time))<=15&&/점심|저녁|식사|밥|우동|국밥|반점/.test(`${e.title} ${e.detail}`)});
    if(!eb)continue;
    const menu=ea.sharedMenu||eb.sharedMenu||mealName(a,ba),meal=/점심/.test(`${ea.title}${eb.title}`)?'점심으로':'함께';
    ea.sharedMenu=eb.sharedMenu=menu;ea.togetherWith=b.id;eb.togetherWith=a.id;
    ea.title=`${b.name}와 함께 ${ba.name}에서 ${menu} 먹는 중`;eb.title=`${a.name}와 함께 ${ba.name}에서 ${menu} 먹는 중`;
    ea.detail=`${meal} ${menu}을(를) 골라 같이 식사하고 있음`;eb.detail=ea.detail;
   }
  }
 }
 const todayKey=()=>new Date().toLocaleDateString('sv-SE');

 function forceCropMode(promise,mode){
  let tries=0;const seek=()=>{const modal=$('.avatar-crop-modal');if(!modal&&tries++<60)return requestAnimationFrame(seek);if(!modal)return;
   const button=$(`[data-mode="${mode}"]`,modal);button?.click();const picks=$('.avatar-mode-picks',modal);if(picks)picks.style.display='none';
   const note=$('.avatar-crop-dialog>small',modal);if(note)note.textContent=mode==='cutout'?'단색 배경의 그림일수록 투명화가 자연스러워요.':'이 사진은 관찰 상세 화면과 원형 프로필에 사용돼요.';
  };requestAnimationFrame(seek);return promise;
 }
 const read=file=>new Promise((ok,fail)=>{const r=new FileReader();r.onload=()=>ok(r.result);r.onerror=fail;r.readAsDataURL(file)});
 async function saveImage(file,mode){
  const id=active?.().id;if(!id||!file)return;
  const result=await forceCropMode(window.ParallelCityAvatarV46.crop(await read(file)),mode);if(!result)return;
  const c=state.characters.find(x=>x.id===id);if(mode==='profile'){c.photo=result.data;c.avatarMode='profile'}else{c.iconPhoto=result.data;c.iconMode='cutout'}
  state.pendingCloudSave=true;save?.();renderAll?.();await window.pushParallelCityCloudState?.();toast?.(mode==='profile'?'프로필 사진을 저장했어요.':'캐릭터 아이콘을 저장했어요.');
 }
 function installSeparateUploads(){
  let photo=$('#charPhoto');if(!photo)return;
  if(!$('#charIconPhoto')){
   const wrap=document.createElement('div');wrap.innerHTML='<label>캐릭터 아이콘 (선택)</label><input id="charIconPhoto" type="file" accept="image/*"><small>첨부하지 않으면 프로필 사진이 원형 아이콘으로 사용됩니다.</small>';
   photo.parentElement.after(wrap);
  }
  if(!photo.dataset.separate47){const clean=photo.cloneNode(true);photo.replaceWith(clean);photo=clean;photo.dataset.v46='1';photo.dataset.separate47='1';photo.onchange=async()=>{try{await saveImage(photo.files?.[0],'profile')}catch(e){console.error(e);toast?.(`사진을 저장하지 못했어요: ${e.message}`)}finally{photo.value=''}}}
  const icon=$('#charIconPhoto');if(icon&&!icon.dataset.separate47){icon.dataset.separate47='1';icon.onchange=async()=>{try{await saveImage(icon.files?.[0],'cutout')}catch(e){console.error(e);toast?.(`아이콘을 저장하지 못했어요: ${e.message}`)}finally{icon.value=''}}}
 }
 function applyIconSources(){
  const chars=state.characters||[];
  $$('#characterList .char-item').forEach((row,i)=>{const c=chars[i],img=$('img.avatar',row);if(c?.iconPhoto&&img){img.src=c.iconPhoto;img.classList.add('avatar-cutout')}});
  $$('#observeCharacterPicker .observe-character-card').forEach((row,i)=>{const c=chars[i],img=$('img.avatar',row);if(c?.iconPhoto&&img){img.src=c.iconPhoto;img.classList.add('avatar-cutout')}});
 }
 function removeObservationModeSwitch(){$$('.map-card > .observation-mode-switch').forEach(el=>el.remove())}
 let changingMode=false;
 async function regenerateForMode(mode){
  if(changingMode)return;changingMode=true;
  try{
   for(const c of state.characters||[]){c.todayDate='';c.todayAlgorithmVersion=0;await generateDay?.(c)}
   syncSharedMeals();save?.();renderAll?.();if(mode==='real')window.ParallelCityGoogleBridge?.show?.();else window.ParallelCityVillage?.render?.();
  }finally{changingMode=false}
 }
 function bindSettingMode(){
  $$('#view-theme [data-observation-mode]').forEach(button=>{if(button.dataset.realReset47)return;button.dataset.realReset47='1';button.addEventListener('click',()=>setTimeout(()=>regenerateForMode(button.dataset.observationMode),80))});
 }
 function bindTopFocus(){
  $$('#observeCharacterPicker .observe-character-card').forEach((row,i)=>{if(row.dataset.focus47)return;row.dataset.focus47='1';row.addEventListener('click',()=>focusCharacter(state.characters[i]),true)});
 }
 function fixHomeContradiction(){window.renderBlueprintHomes?.()}
 function install(){
  removeObservationModeSwitch();installSeparateUploads();applyIconSources();bindSettingMode();bindTopFocus();bindMagnet();decorateWorld();
 }
 let observerTimer=0;
 const observer=new MutationObserver(()=>{clearTimeout(observerTimer);observerTimer=setTimeout(install,350)});
 addEventListener('DOMContentLoaded',()=>{
  isolateCharacterArrays();migrateWorld();snapBuildings();syncSharedMeals();save?.();
  observer.observe(document.body,{subtree:true,childList:true});install();setTimeout(()=>{window.ParallelCityVillage?.render?.();install()},500);
 },{once:true});
 addEventListener('pageshow',()=>setTimeout(()=>{syncSharedMeals();install();fixHomeContradiction()},150));
 setInterval(()=>{syncSharedMeals();decorateWorld();fixHomeContradiction()},300000);
 window.ParallelCityRoadsV47={nodes:ROAD_NODES,edges:ROAD_EDGES,nearestNode,shortest,movementAt,focusCharacter};
})();
