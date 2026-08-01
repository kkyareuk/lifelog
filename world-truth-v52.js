(()=>{
 'use strict';
 const $=(q,r=document)=>r.querySelector(q),$$=(q,r=document)=>[...r.querySelectorAll(q)];
 const id=()=>crypto.randomUUID();
 const buildings=(prefix)=>[
  {id:id(),type:'cafe',name:`${prefix} 카페`,x:20,y:38,color:'#80cbc4',open:'09:00',close:'22:00',description:'조용히 쉬거나 대화를 나누는 카페'},
  {id:id(),type:'restaurant',name:`${prefix} 식당`,x:42,y:67,color:'#8ed081',open:'10:30',close:'22:00',description:'한 끼를 먹을 수 있는 동네 식당'},
  {id:id(),type:'company',name:`${prefix} 오피스`,x:53,y:29,color:'#91a7ff',open:'08:00',close:'21:00',description:'캐릭터가 근무하는 사무실'},
  {id:id(),type:'clinic',name:`${prefix} 의원`,x:76,y:39,color:'#74c0fc',open:'09:00',close:'19:00',description:'몸이 아플 때 방문하는 의원'},
  {id:id(),type:'park',name:`${prefix} 공원`,x:68,y:72,color:'#75c991',open:'00:00',close:'23:59',description:'산책과 휴식을 즐기는 공원'}
 ];
 function defaultWorld(name,background,prefix){
  const hood=id(),district=id();
  return{id:id(),name,theme:'town',districts:[{id:district,name:'중심 구역',theme:'town',neighborhoods:[{id:hood,name:'중심 거리',theme:'town',background,builtinArt:'',buildings:buildings(prefix),customRoadNodes:[[8,25],[30,36],[52,30],[78,38],[91,56],[70,73],[43,68],[18,72]],customRoadEdges:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,0],[1,6],[2,5]]}]}]};
 }
 function resetWorldsOnce(){
  if(Number(state.virtualPrivacyVersion||0)>=52)return;
  const cozy=defaultWorld('평행마을','./world-assets/cozy-five-lot-town-v48.png','달무리');
  const city=defaultWorld('평행 번화가','./world-assets/downtown-six-lot-v50.png','마리나');
  state.worlds={items:[cozy,city],activeWorldId:cozy.id,activeDistrictId:cozy.districts[0].id,activeNeighborhoodId:cozy.districts[0].neighborhoods[0].id};
  state.observationMode='virtual';
  state.characters.forEach((c,index)=>{
    c.home='';
    c.location=null;
    c.tastes=[...(c.tastes||[])];c.interests=[...(c.interests||[])];c.hobbies=[...(c.hobbies||[])];
    const office=cozy.districts[0].neighborhoods[0].buildings[2];
    if(c.workBuildingId)c.workBuildingId=office.id;
    if(c.work)c.work=office.name;
    const wake=c.wakeTime||c.wake||'07:30',bed=c.bedTime||c.bed||'23:30';
    c.todayDate=new Date().toISOString().slice(0,10);
    c.today=[
      {time:wake,title:'기상',detail:'집에서 하루를 시작함',kind:'home',home:true},
      ...(c.workBuildingId?[{time:'09:00',title:`${office.name}에서 일하는 중`,detail:'오전 업무를 처리하고 있음',villageBuildingId:office.id,worldId:cozy.id,districtId:cozy.districts[0].id,neighborhoodId:cozy.districts[0].neighborhoods[0].id}]:[]),
      {time:'12:10',title:'달무리 식당에서 점심',detail:'가까운 식당에서 점심을 먹는 중',villageBuildingId:cozy.districts[0].neighborhoods[0].buildings[1].id,worldId:cozy.id,districtId:cozy.districts[0].id,neighborhoodId:cozy.districts[0].neighborhoods[0].id},
      {time:'18:30',title:'달무리 카페 방문',detail:'가벼운 외출을 즐기는 중',villageBuildingId:cozy.districts[0].neighborhoods[0].buildings[0].id,worldId:cozy.id,districtId:cozy.districts[0].id,neighborhoodId:cozy.districts[0].neighborhoods[0].id},
      {time:'22:00',title:'귀가',detail:'집으로 돌아와 쉬는 중',kind:'home',home:true},
      {time:bed,title:'취침',detail:'침실에서 자는 중',kind:'home',home:true}
    ].sort((a,b)=>a.time.localeCompare(b.time));
  });
  state.virtualPrivacyVersion=52;
  state.pendingCloudSave=true;
  save?.();
 }
 function trimHud(){
  const map=$('#map'),head=$('#map .world-map-head');if(!map||!head)return;
  let toolbar=$('#virtualMapToolbar');
  if(!toolbar){toolbar=document.createElement('div');toolbar.id='virtualMapToolbar';map.before(toolbar)}
  const nav=head.querySelector('.world-navigator');
  if(nav&&nav.parentElement!==toolbar)toolbar.replaceChildren(nav);
  head.remove();
  $$('.privacy-map-note,.world-location-roster,#map .drag-help').forEach(el=>el.remove());
 }
 function lockObserveBuildings(){
  $$('#map .world-building').forEach(el=>{el.draggable=false;el.style.cursor='pointer';el.onpointerdown=null;el.onpointermove=null;el.onpointerup=null});
 }
 document.addEventListener('pointerdown',event=>{
  if(event.target.closest('#map .world-building')){
   event.preventDefault();event.stopImmediatePropagation();
  }
 },true);
 function addDeleteButtons(){
  const view=$('#view-places');if(!view||$('#deleteDistrictV52'))return;
  const drill=view.querySelector('.world-drill');if(!drill)return;
  drill.insertAdjacentHTML('afterend','<div class="v52-delete-row"><button class="btn danger" id="deleteDistrictV52">현재 구역 삭제</button><button class="btn danger" id="deleteHoodV52">현재 세부지역 삭제</button></div>');
  $('#deleteDistrictV52').onclick=()=>{
   const worlds=state.worlds,w=worlds.items.find(x=>x.id===worlds.activeWorldId)||worlds.items[0];
   if(w.districts.length<=1)return toast?.('구역은 하나 이상 필요해요.');
   if(!confirm('현재 구역을 삭제할까요?'))return;
   w.districts=w.districts.filter(d=>d.id!==worlds.activeDistrictId);worlds.activeDistrictId=w.districts[0].id;worlds.activeNeighborhoodId=w.districts[0].neighborhoods[0].id;save?.();window.ParallelCityVillage?.renderEditor?.();
  };
  $('#deleteHoodV52').onclick=()=>{
   const worlds=state.worlds,w=worlds.items.find(x=>x.id===worlds.activeWorldId)||worlds.items[0],d=w.districts.find(x=>x.id===worlds.activeDistrictId)||w.districts[0];
   if(d.neighborhoods.length<=1)return toast?.('세부지역은 하나 이상 필요해요.');
   if(!confirm('현재 세부지역을 삭제할까요?'))return;
   d.neighborhoods=d.neighborhoods.filter(n=>n.id!==worlds.activeNeighborhoodId);worlds.activeNeighborhoodId=d.neighborhoods[0].id;save?.();window.ParallelCityVillage?.renderEditor?.();
  };
 }
 function repair(){
  state.observationMode='virtual';
  trimHud();lockObserveBuildings();addDeleteButtons();
 }
 addEventListener('DOMContentLoaded',()=>{resetWorldsOnce();setTimeout(()=>{window.ParallelCityVillage?.render?.();window.ParallelCityVillage?.renderEditor?.();repair()},120)},{once:true});
 let timer;new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(repair,50)}).observe(document.documentElement,{childList:true,subtree:true});
 addEventListener('pageshow',()=>setTimeout(repair,180));
})();
