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
  if(f.includes('massageChair'))a.push('안마의자에 몸을 맡기고 피로를 푸는 중');
  if(f.includes('recliner'))a.push('리클라이너를 뒤로 젖히고 느긋하게 쉬는 중');
  if(f.includes('computer'))a.push('컴퓨터로 게임을 하는 중','컴퓨터로 개인 작업을 하는 중','인터넷을 구경하는 중');
  if(f.includes('arcade'))a.push('아케이드 게임의 최고 기록에 도전하는 중');
  if(f.includes('readingChair'))a.push('독서 의자에 앉아 책을 읽는 중');
  if(f.includes('piano'))a.push('피아노로 체르니를 연습하는 중','피아노로 재즈를 즉흥 연주하는 중','좋아하는 곡을 피아노로 연주하는 중');
  if(f.includes('guitar'))a.push('기타 코드를 연습하는 중','기타로 좋아하는 곡을 연주하는 중');
  if(f.includes('violin'))a.push('바이올린 활을 고르고 연습곡을 연주하는 중');
  if(f.includes('drum'))a.push('헤드폰을 쓰고 드럼을 연습하는 중');
  if(f.includes('sewing'))a.push('재봉틀로 옷을 수선하는 중','새 의상을 만드는 중');
  if(f.includes('yoga'))a.push('요가 매트 위에서 스트레칭하는 중');
  if(f.includes('aquarium'))a.push('수조를 바라보며 물고기에게 먹이를 주는 중');
  if(f.includes('plantShelf'))a.push('화분에 물을 주고 잎을 닦는 중');
  if(f.includes('catTower'))a.push(`${c.petName||'고양이'}와 캣타워 앞에서 놀아주는 중`);
  if(f.includes('vanity'))a.push('화장대 앞에서 외출 준비를 하는 중','스킨케어를 하는 중');
  return a[hash(`${c.id}-${new Date().getHours()}-${room.id}`)%Math.max(1,a.length)]||`${room.name}에서 쉬는 중`;
 }
 function person(c,text){return`<div class="home-person" style="--person:${esc(c.theme||'#6f7cff')}">${c.photo?`<img src="${c.photo}" alt="">`:`<span>${esc((c.name||'새')[0])}</span>`}<div><b>${esc(c.name)}</b><small>${esc(text)}</small></div></div>`}
 function pet(c){
  if(!c.pet||c.pet==='none')return'';const breed=c.pet==='cat'?c.catBreed:c.dogBreed;
  const actions=c.pet==='cat'?['창가에서 햇볕을 쬐는 중','소파 위에서 식빵을 굽는 중','집 안을 천천히 순찰하는 중','장난감을 노려보는 중','보호자 곁에서 골골대는 중']:['거실에서 꼬리를 흔드는 중','장난감을 물고 노는 중','보호자 옆에 붙어 쉬는 중','간식 봉지 소리를 기다리는 중','창밖을 구경하는 중'];
  const text=actions[hash(`${c.id}-pet-${new Date().getHours()}`)%actions.length];
  return`<div class="home-pet" style="--person:${esc(c.theme||'#e989a6')}">${c.petPhoto?`<img src="${c.petPhoto}" alt="">`:`<span>${c.pet==='cat'?'🐈':'🐕'}</span>`}<div><b>${esc(c.petName||'반려동물')}</b><small>${esc(breed||'')} · ${esc(text)}</small></div></div>`;
 }
 function groups(){const seen=new Set(),out=[];state.characters.forEach(c=>{if(seen.has(c.id))return;const g=household(c);g.forEach(x=>seen.add(x.id));out.push(g)});return out}
 function render(){
  const root=$('#homeBlueprints')||$('#homeWorld');if(!root)return;
  root.innerHTML=groups().map(people=>{
   const owner=people[0],list=rooms(owner),inside=people.filter(isHome);
   const placed=new Map(list.map(r=>[r.id,[]]));inside.forEach(c=>{const r=assignedRoom(c,people,list);placed.get(r.id)?.push(c)});
   const cards=list.map((r,index)=>{const fallback=['living','kitchen','bath','bedroom','study'].includes(r.type)?r.type:'study';const background=r.photo?`linear-gradient(#fff3,#fff3),url('${r.photo}')`:`linear-gradient(#fff1,#fff1),url('./icons/room-${fallback}.svg')`;return`<section class="photo-room type-${esc(r.type)} room-${index+1} ${r.photo?'has-photo':''}" style="background-image:${background}"><div class="photo-room-title">${esc(r.name)}</div><div class="photo-room-people">${(placed.get(r.id)||[]).map(c=>person(c,action(c,r,people))).join('')}</div>${r.type==='living'?pet(owner):''}</section>`}).join('');
   const layout=owner.homeLayout||owner.homeType||'apartmentA',layoutName={studio:'원룸',apartmentA:'아파트 A형',apartmentB:'아파트 B형',house:'주택',mansion:'대저택'}[layout]||'우리 집';
   return`<article class="home-card"><header><div><h3>🏠 ${esc(layoutName)}</h3><p>${people.map(p=>esc(p.name)).join(' · ')} 함께 거주 중</p></div><b>${inside.length}명 귀가</b></header><div class="photo-room-grid layout-${esc(layout)}">${cards}</div></article>`;
  }).filter(Boolean).join('')||'<div class="empty-state"><b>아직 집에 들어온 캐릭터가 없어요.</b><span>설정한 취침 시각과 오늘 일정에 따라 자동으로 귀가합니다.</span></div>';
 }
 window.ParallelCityHome={render,isHome,sleepState,household};window.renderBlueprintHomes=render;
})();
