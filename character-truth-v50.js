(()=>{
 'use strict';
 const $=(q,r=document)=>r.querySelector(q),$$=(q,r=document)=>[...r.querySelectorAll(q)];
 const DOWNTOWN='./world-assets/downtown-six-lot-v50.png';
 let lockedId=state.activeId;
 const char=id=>state.characters?.find(c=>c.id===id);
 const nowEvent=c=>typeof currentEvent==='function'?currentEvent(c,new Date().getHours()*60+new Date().getMinutes()):null;
 const homeEvent=e=>!e||e.home||e.kind==='home'||/집에서|귀가|취침|기상|하루 정리/.test(e.title||'');
 function normalize(c){
  if(!c)return;
  c.tastes=structuredClone(c.tastes||[]);c.interests=structuredClone(c.interests||[]);c.hobbies=structuredClone(c.hobbies||[]);
  c.settings=structuredClone(c.settings||{});c.routines=structuredClone(c.routines||Array.from({length:7},()=>[]));
  const raw=typeof c.theme==='string'?{accent:c.theme}:structuredClone(c.theme||{});
  c.theme={accent:raw.accent||'#6f7cff',secondary:raw.secondary||raw.accent||'#6f7cff',ring:raw.accent||'#6f7cff',useSecondary:!!raw.useSecondary};
 }
 function theme(c){
  normalize(c);const t=c.theme,second=t.useSecondary?t.secondary:t.accent,r=document.documentElement;
  r.style.setProperty('--accent',t.accent);r.style.setProperty('--accent2',second);r.style.setProperty('--char-accent',t.accent);r.style.setProperty('--char-secondary',second);r.style.setProperty('--char-ring',t.accent);
  if($('#charAccent'))$('#charAccent').value=t.accent;if($('#charSecondary'))$('#charSecondary').value=t.secondary;if($('#charUseSecondary'))$('#charUseSecondary').checked=t.useSecondary;
  if($('#charSecondaryWrap'))$('#charSecondaryWrap').style.display=t.useSecondary?'block':'none';
  const preview=$('#charThemePreview');if(preview){preview.style.setProperty('--char-accent',t.accent);preview.style.setProperty('--char-secondary',second);const label=preview.querySelector('strong');if(label)label.textContent=`${c.name}만의 색`}
  $$(`[data-character-id="${CSS.escape(c.id)}"]`).forEach(el=>{el.style.setProperty('--char-ring',t.accent);el.style.setProperty('--card-ring',t.accent);el.style.setProperty('--card-accent',t.accent)});
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',t.accent);
 }
 function select(c,focus=false){
  if(!c)return;lockedId=c.id;state.activeId=c.id;theme(c);save?.();
  if(focus){
   const e=nowEvent(c);if(homeEvent(e)){document.querySelector('.tab[data-view="home"]')?.click()}
   else if(window.ParallelCityRoadsV47?.focusCharacter)window.ParallelCityRoadsV47.focusCharacter(c);
  }else{fillForm?.();renderCharacters?.()}
  renderObserve?.();setTimeout(()=>{theme(c);truth();cluster()},40);
 }
 function bindSelections(){
  $$('#characterList .char-item').forEach((row,i)=>{row.dataset.characterId=state.characters[i]?.id||'';if(row.dataset.truth50)return;row.dataset.truth50='1';row.addEventListener('click',e=>{if(e.target.closest('.char-order'))return;e.preventDefault();e.stopImmediatePropagation();select(char(row.dataset.characterId),false)},true)});
  $$('#observeCharacterPicker .observe-character-card').forEach((row,i)=>{row.dataset.characterId=state.characters[i]?.id||'';if(row.dataset.truth50)return;row.dataset.truth50='1';row.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();select(char(row.dataset.characterId),true)},true)});
  const portrait=$('#portrait');if(portrait&&!portrait.dataset.truth50){portrait.dataset.truth50='1';portrait.style.cursor='pointer';portrait.addEventListener('click',()=>select(active(),true))}
  const quick=$('#quickChar');if(quick&&!quick.dataset.truth50){quick.dataset.truth50='1';quick.addEventListener('change',e=>{e.stopImmediatePropagation();select(char(e.target.value),true)},true)}
  const add=$('#newChar');if(add&&!add.dataset.truth50){add.dataset.truth50='1';add.addEventListener('click',()=>setTimeout(()=>{lockedId=state.activeId;normalize(active());theme(active())},30))}
 }
 function selectionCapture(e){
  const row=e.target.closest('#characterList .char-item');if(row&&!e.target.closest('.char-order')){e.preventDefault();e.stopImmediatePropagation();select(char(row.dataset.characterId),false);return}
  const card=e.target.closest('#observeCharacterPicker .observe-character-card');if(card){e.preventDefault();e.stopImmediatePropagation();select(char(card.dataset.characterId),true);return}
  if(e.target.closest('#portrait')){e.preventDefault();e.stopImmediatePropagation();select(char(lockedId)||active(),true)}
 }
 function quickCapture(e){if(e.target.id!=='quickChar')return;e.stopImmediatePropagation();select(char(e.target.value),true)}
 function privateInputs(e){
  const c=char(lockedId)||active();if(!c)return;
  if(e.target.matches('#charAccent,#charSecondary,#charUseSecondary')){
   e.preventDefault();e.stopImmediatePropagation();normalize(c);
   if(e.target.id==='charAccent'){c.theme.accent=e.target.value;c.theme.ring=e.target.value}
   if(e.target.id==='charSecondary')c.theme.secondary=e.target.value;
   if(e.target.id==='charUseSecondary')c.theme.useSecondary=e.target.checked;
   theme(c);save?.();return;
  }
  const chip=e.target.closest('.chips .chip');if(!chip)return;
  e.preventDefault();e.stopImmediatePropagation();const box=chip.closest('.chips'),key=box.id==='tasteChips'?'tastes':box.id==='interestChips'?'interests':'hobbies',arr=[...(c[key]||[])],i=arr.indexOf(chip.textContent);
  i>=0?arr.splice(i,1):arr.push(chip.textContent);c[key]=arr;chip.classList.toggle('selected',i<0);save?.();
 }
 function truth(){
  const c=char(lockedId)||active();if(!c)return;if(state.activeId!==c.id)state.activeId=c.id;
  theme(c);const e=nowEvent(c),title=e?.title||(homeEvent(e)?'집에서 생활 중':'아직 일정이 시작되지 않음');
  if($('#mapState'))$('#mapState').textContent=`${c.name} · ${title}`;
  if($('#activityTitle'))$('#activityTitle').textContent=title;
  if($('#activityDetail')&&e)$('#activityDetail').textContent=e.detail||'';
 }
 function cluster(){
  const groups=new Map();
  $$('#map .world-character').forEach(el=>{const x=el.style.getPropertyValue('--x'),y=el.style.getPropertyValue('--y'),key=`${x}/${y}`;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(el)});
  groups.forEach(items=>items.forEach((el,i)=>{if(items.length<2){el.classList.remove('clustered');el.style.transform='translate(-50%,-50%)';return}const angle=Math.PI*2*i/items.length,r=24;el.classList.add('clustered');el.style.transform=`translate(calc(-50% + ${Math.cos(angle)*r}px),calc(-50% + ${Math.sin(angle)*r}px))`}));
 }
 function hideRealityFields(){
  ['charHome','charWork'].forEach(id=>{const el=$('#'+id);if(el)el.parentElement.style.display='none'});
  $$('.location-privacy-help,.notice').forEach(el=>{if(/생활권|실제 지도|GPS|주소/.test(el.textContent||''))el.style.display='none'});
 }
 function addDowntown(){
  if(Number(state.downtownVersion||0)>=50)return;
  const id=()=>crypto.randomUUID(),hoodId=id(),districtId=id(),worldId=id();
  state.worlds=state.worlds||{items:[]};
  state.worlds.items.push({id:worldId,name:'별빛 번화가',theme:'city',districts:[{id:districtId,name:'중심 상업 구역',theme:'city',neighborhoods:[{id:hoodId,name:'메인 거리',theme:'city',background:DOWNTOWN,builtinArt:'',buildings:[],customRoadNodes:[[4,14],[28,15],[52,14],[80,12],[96,18],[7,43],[28,39],[52,42],[77,39],[95,46],[6,76],[28,70],[54,73],[78,69],[96,78]],customRoadEdges:[[0,1],[1,2],[2,3],[3,4],[0,5],[1,6],[2,7],[3,8],[4,9],[5,6],[6,7],[7,8],[8,9],[5,10],[6,11],[7,12],[8,13],[9,14],[10,11],[11,12],[12,13],[13,14]]}]}]});
  state.downtownVersion=50;save?.();
 }
 function keepRoadTools(){
  const api=window.ParallelCityVillage;if(api&&!api._truth50&&api.renderEditor){api._truth50=true;const old=api.renderEditor;api.renderEditor=function(){const out=old.apply(this,arguments);setTimeout(()=>window.ParallelCityRoadEditorV49?.render?.(),30);return out}}
 }
 function preventObserveMove(){
  const map=$('#map .world-map');if(!map||map.classList.contains('edit-mode'))return;
  $$('.world-building',map).forEach(b=>{b.draggable=false;b.onpointermove=null;b.onpointerup=null});
 }
 function install(){if(char(lockedId)&&state.activeId!==lockedId)state.activeId=lockedId;bindSelections();hideRealityFields();keepRoadTools();preventObserveMove();truth();cluster()}
 window.addEventListener('input',privateInputs,true);window.addEventListener('click',selectionCapture,true);window.addEventListener('click',e=>{if(e.target.closest('.chips .chip'))privateInputs(e)},true);window.addEventListener('change',quickCapture,true);
 addEventListener('DOMContentLoaded',()=>{state.characters.forEach(normalize);addDowntown();save?.();install();setTimeout(install,600)},{once:true});
 let timer=0;new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(install,180)}).observe(document.documentElement,{subtree:true,childList:true});
 setInterval(()=>{truth();cluster()},60000);
})();
