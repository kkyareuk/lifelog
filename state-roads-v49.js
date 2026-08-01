(()=>{
 'use strict';
 const $=(q,r=document)=>r.querySelector(q),$$=(q,r=document)=>[...r.querySelectorAll(q)];
 const roads=()=>window.ParallelCityRoadsV47;
 const DEFAULT_NODES=(window.ParallelCityRoadsV47?.nodes||[]).map(p=>[...p]);
 const DEFAULT_EDGES=(window.ParallelCityRoadsV47?.edges||[]).map(e=>[...e]);
 const hood=()=>state.worlds?.items?.flatMap(w=>w.districts||[]).flatMap(d=>d.neighborhoods||[]).find(n=>n.id===state.worlds?.activeNeighborhoodId);
 const eventNow=c=>typeof currentEvent==='function'?currentEvent(c,new Date().getHours()*60+new Date().getMinutes()):null;
 const isHome=e=>!e||e.home||e.kind==='home'||/집에서|귀가|취침|기상|하루 정리/.test(e.title||'');
 function themeOf(c){return typeof ensureCharTheme==='function'?ensureCharTheme(c):(c.theme||{accent:'#6f7cff',secondary:'#6f7cff',useSecondary:false})}
 function applyCharacter(c){
  if(!c)return;state.activeId=c.id;
  const t=themeOf(c),second=t.useSecondary?t.secondary:t.accent,root=document.documentElement;
  [['--accent',t.accent],['--accent2',second],['--char-accent',t.accent],['--char-secondary',second],['--char-ring',t.accent]].forEach(([k,v])=>root.style.setProperty(k,v));
  const accent=$('#charAccent'),secondary=$('#charSecondary'),toggle=$('#charUseSecondary');
  if(accent)accent.value=t.accent;if(secondary)secondary.value=t.secondary||t.accent;if(toggle)toggle.checked=!!t.useSecondary;
  $('#charSecondaryWrap')?.style.setProperty('display',t.useSecondary?'block':'none');
  updateThemePreview?.();save?.();
 }
 function selectInEditor(c){
  applyCharacter(c);fillForm?.();renderCharacters?.();renderObserveCharacterPicker?.();renderObserve?.();
 }
 function focusInWorld(c){
  applyCharacter(c);const e=eventNow(c);if(isHome(e)){document.querySelector('.tab[data-view="home"]')?.click();setTimeout(authoritative,50);return}
  if(window.ParallelCityRoadsV47?.focusCharacter){window.ParallelCityRoadsV47.focusCharacter(c);setTimeout(authoritative,50);return}
  const b=window.ParallelCityVillage?.locate?.(e?.villageBuildingId||e?.place?.villageBuildingId);
  if(b){state.worlds.activeWorldId=b.worldId;state.worlds.activeDistrictId=b.districtId;state.worlds.activeNeighborhoodId=b.neighborhoodId;save?.();window.ParallelCityVillage?.render?.()}
  setTimeout(authoritative,50);
 }
 function isolate(){
  for(const c of state.characters||[]){
   c.tastes=structuredClone(c.tastes||[]);c.interests=structuredClone(c.interests||[]);c.hobbies=structuredClone(c.hobbies||[]);
   c.theme=structuredClone(themeOf(c));
  }
 }
 function bindCharacterSelection(){
  $$('#characterList .char-item').forEach((row,i)=>{if(row.dataset.pick49)return;row.dataset.pick49='1';row.addEventListener('click',e=>{if(e.target.closest('.char-order'))return;e.preventDefault();e.stopImmediatePropagation();selectInEditor(state.characters[i])},true)});
  $$('#observeCharacterPicker .observe-character-card').forEach((row,i)=>{if(row.dataset.pick49)return;row.dataset.pick49='1';row.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();focusInWorld(state.characters[i])},true)});
  const quick=$('#quickChar');if(quick&&!quick.dataset.pick49){quick.dataset.pick49='1';quick.addEventListener('change',e=>{e.stopImmediatePropagation();const c=state.characters.find(x=>x.id===e.target.value);if(c)focusInWorld(c)},true)}
 }
 function bindPrivateChips(){
  $$('.chips .chip').forEach(btn=>{if(btn.dataset.private49)return;btn.dataset.private49='1';btn.addEventListener('click',e=>{
   e.preventDefault();e.stopImmediatePropagation();const c=active(),box=btn.closest('.chips'),key=box?.id==='tasteChips'?'tastes':box?.id==='interestChips'?'interests':'hobbies';
   const arr=[...(c[key]||[])],at=arr.indexOf(btn.textContent);at>=0?arr.splice(at,1):arr.push(btn.textContent);c[key]=arr;btn.classList.toggle('selected',at<0);save?.();
  },true)});
 }
 function cleanLogs(){
  for(const c of state.characters||[])for(const e of c.today||[]){
   if(!e._baseDetail){
    let text=String(e.detail||'');
    const chunks=text.split(' · ');if(chunks.length>3)text=chunks.slice(-1)[0];
    e._baseDetail=text;
   }
   const b=window.ParallelCityVillage?.locate?.(e.villageBuildingId||e.place?.villageBuildingId);
   if(b)e.detail=`${b.neighborhoodName} · ${b.name} · ${e._baseDetail}`;
  }
 }
 function authoritative(){
  const c=active(),e=eventNow(c);if(!c)return;
  const title=e?.title||(isHome(e)?'집에서 생활 중':'아직 오늘 일정이 시작되지 않음');
  if($('#mapState'))$('#mapState').textContent=`${c.name} · ${title}`;
  if($('#activityTitle'))$('#activityTitle').textContent=title;
  if($('#activityDetail')&&e)$('#activityDetail').textContent=e.detail||'';
  $$('#observeCharacterPicker .observe-character-card').forEach((card,i)=>{
   const ce=eventNow(state.characters[i]),small=card.querySelector('small');if(small)small.textContent=ce?.title||'집에서 생활 중';
  });
 }
 function loadRoad(){
  const n=hood(),api=roads();if(!n||!api)return;
  if(!Array.isArray(n.customRoadNodes)||n.customRoadNodes.length<2){n.customRoadNodes=DEFAULT_NODES.map(p=>[...p]);n.customRoadEdges=DEFAULT_EDGES.map(e=>[...e])}
  api.nodes.splice(0,api.nodes.length,...n.customRoadNodes.map(p=>[...p]));
  api.edges.splice(0,api.edges.length,...(n.customRoadEdges||[]).map(e=>[...e]));
 }
 function roadSvg(n){
  return`<svg class="custom-road-editor" viewBox="0 0 100 100" preserveAspectRatio="none">${(n.customRoadEdges||[]).map(([a,b])=>`<line x1="${n.customRoadNodes[a]?.[0]||0}" y1="${n.customRoadNodes[a]?.[1]||0}" x2="${n.customRoadNodes[b]?.[0]||0}" y2="${n.customRoadNodes[b]?.[1]||0}"/>`).join('')}${(n.customRoadNodes||[]).map((p,i)=>`<circle data-node="${i}" cx="${p[0]}" cy="${p[1]}" r="1.25"/>`).join('')}</svg>`}
 function renderRoadEditor(){
  const map=$('#worldEditMap .world-map'),n=hood();if(!map||!n)return;loadRoad();
  $('.custom-road-editor',map)?.remove();map.insertAdjacentHTML('afterbegin',roadSvg(n));
  let tools=$('.road-editor-tools');if(!tools){const help=$('.drag-help');help?.insertAdjacentHTML('afterend','<div class="road-editor-tools"><button id="toggleRoadEdit">길 직접 편집</button><button id="addRoadPoint">새 길 이어 그리기</button><button id="undoRoadPoint">마지막 점 지우기</button><button id="resetRoads">기본 길 복원</button><small>점을 끌어 길을 옮기거나, 빈 곳을 눌러 길을 이어 그릴 수 있어요.</small></div>');tools=$('.road-editor-tools')}
  const toggle=$('#toggleRoadEdit');toggle.onclick=()=>{map.classList.toggle('road-editing');toggle.classList.toggle('active',map.classList.contains('road-editing'))};
  $('#addRoadPoint').onclick=()=>{map.classList.add('road-editing');toggle.classList.add('active');map.dataset.addRoad='1'};
  $('#undoRoadPoint').onclick=()=>{if(n.customRoadNodes.length<=2)return;n.customRoadNodes.pop();n.customRoadEdges=(n.customRoadEdges||[]).filter(([a,b])=>a<n.customRoadNodes.length&&b<n.customRoadNodes.length);save?.();renderRoadEditor()};
  $('#resetRoads').onclick=()=>{n.customRoadNodes=DEFAULT_NODES.map(p=>[...p]);n.customRoadEdges=DEFAULT_EDGES.map(e=>[...e]);loadRoad();save?.();renderRoadEditor()};
  const svg=$('.custom-road-editor',map);
  svg.addEventListener('pointerdown',e=>{const circle=e.target.closest('circle');if(!circle)return;e.preventDefault();circle.setPointerCapture(e.pointerId)});
  svg.addEventListener('pointermove',e=>{const circle=e.target.closest('circle');if(!circle||!circle.hasPointerCapture(e.pointerId))return;const r=svg.getBoundingClientRect(),i=+circle.dataset.node,x=Math.max(1,Math.min(99,(e.clientX-r.left)/r.width*100)),y=Math.max(1,Math.min(99,(e.clientY-r.top)/r.height*100));n.customRoadNodes[i]=[x,y];circle.setAttribute('cx',x);circle.setAttribute('cy',y)});
  svg.addEventListener('pointerup',e=>{const circle=e.target.closest('circle');if(circle){map.dataset.branchFrom=circle.dataset.node;save?.();loadRoad();renderRoadEditor();toast?.('이 모서리에서 새 길을 시작해요. 길을 끝낼 곳을 눌러 주세요.');return}if(map.dataset.addRoad!=='1'&&!map.dataset.branchFrom)return;const r=svg.getBoundingClientRect(),p=[(e.clientX-r.left)/r.width*100,(e.clientY-r.top)/r.height*100],last=map.dataset.branchFrom===''||map.dataset.branchFrom==null?n.customRoadNodes.length-1:Number(map.dataset.branchFrom),next=n.customRoadNodes.length;n.customRoadNodes.push(p);n.customRoadEdges.push([last,next]);delete map.dataset.branchFrom;save?.();loadRoad();renderRoadEditor()});
  $$('#worldEditMap .world-building').forEach(el=>{if(el.dataset.snap49)return;el.dataset.snap49='1';el.addEventListener('pointerup',()=>setTimeout(()=>{const b=window.ParallelCityVillage?.locate?.(el.dataset.id);if(!b)return;let best=0,d=Infinity;n.customRoadNodes.forEach((p,i)=>{const q=Math.hypot(b.x-p[0],b.y-p[1]);if(q<d){d=q;best=i}});b.roadNode=best;b.x=n.customRoadNodes[best][0];b.y=n.customRoadNodes[best][1]-3;save?.();window.ParallelCityVillage?.renderEditor?.()},70),true)});
 }
 function install(){loadRoad();bindCharacterSelection();bindPrivateChips();renderRoadEditor();authoritative()}
 addEventListener('DOMContentLoaded',()=>{isolate();cleanLogs();save?.();install();setTimeout(install,600)},{once:true});
 let timer=0;new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(install,220)}).observe(document.documentElement,{subtree:true,childList:true});
 setInterval(authoritative,60000);
 window.ParallelCityRoadEditorV49={render:renderRoadEditor,install};
})();
