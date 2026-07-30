(()=>{
 'use strict';
 const ART='./world-assets/cozy-five-lot-town-v48.png';
 const LOTS=[[17,28],[53,16],[79,35],[22,55],[59,81]];
 const walk=(fn)=>{for(const w of state.worlds?.items||[])for(const d of w.districts||[])for(const n of d.neighborhoods||[])fn(n)};
 const hood=()=>state.worlds?.items?.flatMap(w=>w.districts||[]).flatMap(d=>d.neighborhoods||[]).find(n=>n.id===state.worlds?.activeNeighborhoodId);
 const dist=(a,b)=>Math.hypot(Number(a.x)-b[0],Number(a.y)-b[1]);
 const nearestLot=b=>LOTS.reduce((best,p)=>dist(b,p)<dist(b,best)?p:best,LOTS[0]);
 function migrate(){
  state.observationMode='virtual';
  if(Number(state.fastTownVersion||0)>=48)return;
  walk(n=>{
   if(!n.background||/developer-(town|city|park)\.svg/.test(n.background))n.background=ART;
   n.builtinArt='';
   const custom=(n.buildings||[]).filter(b=>b.userCreated||b.icon||b.photo);
   const basic=(n.buildings||[]).filter(b=>!custom.includes(b)).slice(0,Math.max(0,5-custom.length));
   n.buildings=[...custom,...basic];
   n.buildings.forEach((b,i)=>{
    const p=LOTS[i%LOTS.length];b.x=p[0];b.y=p[1];
    if(i>=LOTS.length){b.x+=((i%3)-1)*2;b.y+=Math.floor(i/3)%2?2:-2}
   });
  });
  state.fastTownVersion=48;save?.();
 }
 function forceVirtual(){
  if(state.observationMode!=='virtual'){state.observationMode='virtual';save?.()}
  document.querySelector('#observationModeSetting')?.remove();
  document.querySelectorAll('.observation-mode-switch').forEach(x=>x.remove());
  const api=document.querySelector('#googleApiKey')?.closest('.section');api?.remove();
 }
 function hardTheme(){
  const c=typeof active==='function'?active():state.characters?.find(x=>x.id===state.activeId)||state.characters?.[0];
  if(!c)return;
  const t=typeof ensureCharTheme==='function'?ensureCharTheme(c):(c.theme||{accent:'#6f7cff',secondary:'#6f7cff'});
  const secondary=t.useSecondary?t.secondary:t.accent;
  const root=document.documentElement;
  root.style.setProperty('--accent',t.accent);
  root.style.setProperty('--accent2',secondary);
  root.style.setProperty('--char-accent',t.accent);
  root.style.setProperty('--char-secondary',secondary);
  root.style.setProperty('--char-ring',t.accent);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',t.accent);
 }
 function decorate(){
  document.querySelectorAll('.world-map').forEach(map=>{
   if(!map.style.backgroundImage||/developer-(town|city|park)/.test(map.style.backgroundImage))map.style.backgroundImage=`url("${ART}")`;
  });
 }
 function snapEditor(){
  document.querySelectorAll('#worldEditMap .world-building').forEach(el=>{
   if(el.dataset.lot48)return;el.dataset.lot48='1';
   el.addEventListener('pointerup',()=>setTimeout(()=>{
    const n=hood(),b=n?.buildings?.find(x=>x.id===el.dataset.id);if(!b)return;
    const p=nearestLot(b);b.x=p[0];b.y=p[1];save?.();
    window.ParallelCityVillage?.renderEditor?.();toast?.('건물을 가장 가까운 부지에 붙였어요.');
   },30));
  });
 }
 function markNewBuilding(){
  const btn=document.querySelector('#saveBuilding');if(!btn||btn.dataset.v48)return;btn.dataset.v48='1';
  btn.addEventListener('click',()=>setTimeout(()=>{
   const n=hood(),id=document.querySelector('#buildingId')?.value,b=n?.buildings?.find(x=>x.id===id)||n?.buildings?.at(-1);
   if(!b)return;b.userCreated=true;const p=nearestLot(b);b.x=p[0];b.y=p[1];save?.();
  },40),true);
 }
 function install(){forceVirtual();hardTheme();decorate()}
 document.addEventListener('click',e=>{
  if(e.target.closest('.char-item,.observe-character-card,#quickChar,.world-character,[data-character]'))setTimeout(()=>{hardTheme();decorate()},20);
 },true);
 document.addEventListener('input',e=>{
  if(e.target.matches('#charAccent,#charSecondary,#charUseSecondary'))setTimeout(hardTheme,0);
 },true);
 let timer=0;
 new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(install,250)}).observe(document.documentElement,{subtree:true,childList:true});
 addEventListener('DOMContentLoaded',()=>{migrate();install();setTimeout(()=>{window.ParallelCityVillage?.render?.();install()},450)},{once:true});
 addEventListener('pageshow',()=>setTimeout(install,100));
 setInterval(()=>{window.ParallelCityVillage?.render?.();install()},300000);
 window.ParallelCityFastTownV48={lots:LOTS,install};
})();
