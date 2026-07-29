/* 가상도시와 Google 현실 지도를 안전하게 전환하는 다리 */
(()=>{
 const real={
  loadGooglePlaces:window.loadGooglePlaces,
  ensureGoogleObservationMap:window.ensureGoogleObservationMap,
  updateMarkers:window.updateMarkers,
  searchGooglePlaces:window.searchGooglePlaces,
  testGooglePlacesAccess:window.testGooglePlacesAccess,
  resolveRealEventPlace:window.resolveRealEventPlace,
  resolveRealPlacesForDay:window.resolveRealPlacesForDay
 };
 let virtual=null,opening=false;
 const use=set=>Object.entries(set||{}).forEach(([key,value])=>{if(typeof value==='function')window[key]=value});
 window.ParallelCityGoogleBridge={
  setVirtual(value){virtual=value},
  activate(mode){
   state.observationMode=mode==='real'?'real':'virtual';save?.();
   if(state.observationMode==='real')use(real);else use(virtual);
  },
  async show(){
   if(opening)return;opening=true;use(real);
   try{await real.ensureGoogleObservationMap?.();await real.updateMarkers?.()}
   catch(error){
    console.error(error);
    const map=document.querySelector('#map');
    if(map)map.innerHTML=`<div class="google-mode-error"><b>Google 지도를 불러오지 못했어요.</b><span>${String(error?.message||error)}</span><button type="button" data-open-settings>설정에서 API 연결 확인</button></div>`;
    map?.querySelector('[data-open-settings]')?.addEventListener('click',()=>document.querySelector('.tab[data-view="theme"]')?.click());
   }finally{opening=false}
  },
  real
 };
})();
