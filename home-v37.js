/* 평행도시 사진형 집 생활 화면 v33 */
(()=>{
 const $=(q,r=document)=>r.querySelector(q), esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const mins=v=>{const [h,m]=String(v||'00:00').split(':').map(Number);return h*60+m};
 const hash=s=>[...String(s)].reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,7);
 function sleepState(c,now=new Date().getHours()*60+new Date().getMinutes()){
  const j=hash(`${c.id}-${new Date().toLocaleDateString('sv-SE')}`)%21-10;
  const bed=(mins(c.bedtime||'00:30')+j+1440)%1440,wake=(mins(c.wakeTime||'07:30')+j+1440)%1440;
  return{sleeping:bed>wake?(now>=bed||now<wake):(now>=bed&&now<wake),bed,wake};
 }
 function household(c){
  if(window.ParallelCityHouseSettings?.household)return window.ParallelCityHouseSettings.household(c);
  const ids=new Set([c.id]);let changed=true;
  while(changed){changed=false;(state.relations||[]).filter(r=>r.cohabit==='yes').forEach(r=>{if(ids.has(r.a)||ids.has(r.b))[r.a,r.b].forEach(id=>{if(!ids.has(id)){ids.add(id);changed=true}})})}
  return state.characters.filter(x=>ids.has(x.id));
 }
 function defaultRooms(c){
  const count=Math.max(1,Number(c.bedroomCount||c.bedCount)||1);
  return[{id:'living',type:'living',name:'거실',furniture:['sofa','tv','table','pet']},{id:'kitchen',type:'kitchen',name:'부엌',furniture:['stove','table']},{id:'bath',type:'bath',name:'욕실',furniture:['bath']},...Array.from({length:count},(_,i)=>({id:`bedroom${i+1}`,type:'bedroom',name:`침실 ${i+1}`,furniture:['bed','desk']}))];
 }
 const rooms=c=>Array.isArray(c.rooms)&&c.rooms.length?c.rooms:defaultRooms(c);
 const eventOf=c=>typeof currentEvent==='function'?currentEvent(c,new Date().getHours()*60+new Date().getMinutes()):null;
 function isHome(c){const e=eventOf(c);return sleepState(c).sleeping||Boolean(e&&(e.home||e.kind==='home'||e.room||/집|귀가|취침|기상|하루 정리/.test(`${e.title} ${e.detail}`)))}
 function assignedRoom(c,people,list){
  const bedrooms=list.filter(r=>r.type==='bedroom'&&(r.furniture||[]).includes('bed'));
  if(sleepState(c).sleeping){
   if(c.sleepArrangement==='separateRooms')return bedrooms[people.findIndex(x=>x.id===c.id)%Math.max(1,bedrooms.length)]||list[0];
   return bedrooms[0]||list[0];
  }
  const wanted=eventOf(c)?.room,exact=list.find(r=>r.id===wanted||r.type===wanted);if(exact)return exact;
  const usable=list.filter(r=>(r.furniture||[]).length);return usable[hash(`${c.id}-${new Date().getHours()}`)%Math.max(1,usable.length)]||list[0];
 }
 function action(c,room,people){
  if(sleepState(c).sleeping)return`${room.name}에서 자는 중`;
  const e=eventOf(c);if(e?.home&&e.detail)return e.detail;
  const partner=people.find(x=>x.id!==c.id),f=room.furniture||[],a=[];
  if(f.includes('stove'))a.push(partner?`${partner.name}을(를) 위해 요리하는 중`:'간단한 요리를 하는 중');
  if(f.includes('tv'))a.push('소파에 기대 영상을 보는 중');
  if(f.includes('desk'))a.push('책상에서 자기 할 일을 하는 중');
  if(f.includes('hobby'))a.push('취미에 푹 빠져 있는 중');
  if(f.includes('bath'))a.push('씻으며 하루를 정리하는 중');
  if(f.includes('bed'))a.push('침대에서 휴대폰을 보는 중','이불 속에서 뒹구는 중','조용히 쉬는 중');
  if(f.includes('goods'))a.push('굿즈장을 정리하며 최애를 감상하는 중');
  if(f.includes('bookshelf'))a.push('책장에서 읽을 책을 골라 독서하는 중');
  if(f.includes('console'))a.push('게임에 집중하는 중');
  if(f.includes('audio'))a.push('좋아하는 음악을 크게 듣는 중','악기를 연습하는 중');
  if(f.includes('projector'))a.push('불을 끄고 영화를 보는 중');
  if(f.includes('perfumeShelf'))a.push('향수를 시향하고 노트를 기록하는 중');
  if(f.includes('easel'))a.push('그림을 그리는 중');
  if(f.includes('camera'))a.push('사진 장비를 손질하는 중');
  if(f.includes('wardrobe'))a.push('옷을 골라 코디해 보는 중');
  if(f.includes('fitness'))a.push('홈 트레이닝을 하는 중');
  if(f.includes('oven'))a.push(partner?`${partner.name}와 먹을 간식을 굽는 중`:'베이킹을 하는 중');
  if(f.includes('displayCase'))a.push('피규어 진열장을 정리하는 중');
  if(f.includes('costume'))a.push('코스튬을 손질하고 착용해 보는 중');
  if(f.includes('workbench'))a.push('작업대에서 무언가 만드는 중');
  if(f.includes('coffee'))a.push(partner?`${partner.name}의 커피도 함께 내리는 중`:'커피를 내려 마시는 중');
  return a[hash(`${c.id}-${new Date().getHours()}-${room.id}`)%Math.max(1,a.length)]||`${room.name}에서 쉬는 중`;
 }
 function person(c,text){return`<div class="home-person" style="--person:${esc(c.theme||'#6f7cff')}">${c.photo?`<img src="${c.photo}" alt="">`:`<span>${esc((c.name||'새')[0])}</span>`}<div><b>${esc(c.name)}</b><small>${esc(text)}</small></div></div>`}
 function pet(c){
  if(!c.pet||c.pet==='none')return'';const breed=c.pet==='cat'?c.catBreed:c.dogBreed;
  return`<div class="home-pet">${c.petPhoto?`<img src="${c.petPhoto}" alt="">`:`<span>${c.pet==='cat'?'🐈':'🐕'}</span>`}<div><b>${esc(c.petName||'반려동물')}</b><small>${esc(breed||'')} · 집에서 쉬는 중</small></div></div>`;
 }
 function groups(){const seen=new Set(),out=[];state.characters.forEach(c=>{if(seen.has(c.id))return;const g=household(c);g.forEach(x=>seen.add(x.id));out.push(g)});return out}
 function render(){
  const root=$('#homeBlueprints')||$('#homeWorld');if(!root)return;
  root.innerHTML=groups().map(people=>{
   const owner=people[0],list=rooms(owner),inside=people.filter(isHome);
   const placed=new Map(list.map(r=>[r.id,[]]));inside.forEach(c=>{const r=assignedRoom(c,people,list);placed.get(r.id)?.push(c)});
   const cards=list.map((r,index)=>`<section class="photo-room type-${esc(r.type)} room-${index+1} ${r.photo?'has-photo':''}" ${r.photo?`style="background-image:linear-gradient(#fff3,#fff3),url('${r.photo}')"`:''}><div class="photo-room-title">${esc(r.name)}</div>${r.photo?'':'<div class="photo-room-empty">방 사진을 추가해 주세요</div>'}<div class="photo-room-people">${(placed.get(r.id)||[]).map(c=>person(c,action(c,r,people))).join('')}</div>${r.type==='living'?pet(owner):''}</section>`).join('');
   return`<article class="home-card"><header><div><h3>${esc(owner.homeLayout||'우리 집')} · ${esc(owner.home||'생활권 미설정')}</h3><p>${people.map(p=>esc(p.name)).join(' · ')} 함께 거주 중</p></div><b>${inside.length}명 귀가</b></header><div class="photo-room-grid layout-${esc(owner.homeLayout||owner.homeType||'apartmentA')}">${cards}</div></article>`;
  }).filter(Boolean).join('')||'<div class="empty-state"><b>아직 집에 들어온 캐릭터가 없어요.</b><span>설정한 취침 시각과 오늘 일정에 따라 자동으로 귀가합니다.</span></div>';
 }
 window.ParallelCityHome={render,isHome,sleepState,household};window.renderBlueprintHomes=render;
})();
