/* 평행도시 집 생활 v42 */
(()=>{
 const $=(q,r=document)=>r.querySelector(q),$$=(q,r=document)=>[...r.querySelectorAll(q)];
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const hash=s=>[...String(s)].reduce((n,c)=>(n*31+c.charCodeAt(0))>>>0,7);
 const mins=v=>{const [h,m]=String(v||'00:00').split(':').map(Number);return h*60+m};
 function sleepState(c,now=new Date().getHours()*60+new Date().getMinutes()){
  const jitter=hash(`${c.id}-${new Date().toLocaleDateString('sv-SE')}`)%21-10,bed=(mins(c.bedtime||'00:30')+jitter+1440)%1440,wake=(mins(c.wakeTime||'07:30')+jitter+1440)%1440;
  return{sleeping:bed>wake?now>=bed||now<wake:now>=bed&&now<wake,bed,wake};
 }
 function household(c){
  if(window.ParallelCityHouseSettings?.household)return window.ParallelCityHouseSettings.household(c);
  const ids=new Set([c.id]);let changed=true;while(changed){changed=false;(state.relations||[]).filter(r=>r.cohabit==='yes').forEach(r=>{if(ids.has(r.a)||ids.has(r.b))[r.a,r.b].forEach(id=>{if(!ids.has(id)){ids.add(id);changed=true}})})}return state.characters.filter(x=>ids.has(x.id));
 }
 function defaultRooms(c){
  const count=Math.max(1,Number(c.roomCount)||4),templates=[['living','거실',['sofa','tv','table','pet']],['kitchen','주방',['stove','oven','table']],['bath','욕실',['bath']],['bedroom','침실 1',['bed','desk']]];
  return Array.from({length:count},(_,i)=>{if(count===1)return{id:'room1',type:'living',name:'원룸',photo:'',furniture:['bed','sofa','desk','stove','table']};const t=templates[i]||['bedroom',`침실 ${i-2}`,['bed','desk']];return{id:`room${i+1}`,type:t[0],name:t[1],photo:'',furniture:t[2]}});
 }
 const rooms=c=>Array.isArray(c.rooms)&&c.rooms.length?c.rooms:defaultRooms(c);
 const eventOf=c=>typeof currentEvent==='function'?currentEvent(c,new Date().getHours()*60+new Date().getMinutes()):null;
 function isHome(c){const e=eventOf(c);return sleepState(c).sleeping||Boolean(e&&(e.home||e.kind==='home'||e.room||/집|귀가|취침|기상|하루 정리/.test(`${e.title||''} ${e.detail||''}`)))}
 function assignedRoom(c,people,list){
  const beds=list.filter(r=>r.type==='bedroom'&&(r.furniture||[]).includes('bed'));
  if(sleepState(c).sleeping){if(c.sleepArrangement==='separateRooms')return beds[people.findIndex(x=>x.id===c.id)%Math.max(1,beds.length)]||list[0];return beds[0]||list[0]}
  const wanted=eventOf(c)?.room,exact=list.find(r=>r.id===wanted||r.type===wanted);if(exact)return exact;
  const usable=list.filter(r=>(r.furniture||[]).length);return usable[hash(`${c.id}-${new Date().getHours()}`)%Math.max(1,usable.length)]||list[0];
 }
 function action(c,room,people,clean){
  if(c._autoCleaningUntil&&Date.now()<c._autoCleaningUntil)return`${room.name}을(를) 차근차근 청소하는 중`;
  if(sleepState(c).sleeping)return`${room.name}에서 자는 중`;
  const e=eventOf(c);if(e?.home&&e.detail)return e.detail;
  const partner=people.find(x=>x.id!==c.id),f=room.furniture||[],a=[];
  if(clean<45&&['living','kitchen','bath'].includes(room.type))a.push(`${room.name}을 정리하고 청소하는 중`);
  if(f.includes('stove'))a.push(partner?`${partner.name}를 위해 요리하는 중`:'간단한 요리를 만드는 중');
  if(f.includes('tv'))a.push('소파에 기대 영상을 보는 중','보고 싶던 드라마를 정주행하는 중');
  if(f.includes('desk'))a.push('책상에서 개인 작업 중','메모를 정리하는 중');
  if(f.includes('bath'))a.push('따뜻하게 씻으며 하루를 정리하는 중');
  if(f.includes('bed'))a.push('침대에서 휴대폰을 보는 중','이불 속에서 뒹구는 중','잠들기 전 책을 읽는 중');
  if(f.includes('bookshelf'))a.push('책장에서 책을 골라 읽는 중');
  if(f.includes('console')||f.includes('computer'))a.push('게임에 집중하는 중');
  if(f.includes('piano'))a.push('피아노로 체르니를 연습하는 중','재즈곡을 즉흥 연주하는 중');
  if(f.includes('guitar'))a.push('기타 코드를 연습하는 중');
  if(f.includes('massageChair'))a.push('안마의자에 몸을 맡기고 쉬는 중');
  if(f.includes('perfumeShelf'))a.push('향수를 시향하며 노트를 적는 중');
  if(f.includes('goods'))a.push('굿즈장을 정리하며 최애를 감상하는 중');
  if(f.includes('easel'))a.push('그림 작업에 몰두하는 중');
  if(f.includes('coffee'))a.push('커피를 내려 마시는 중');
  return a[hash(`${c.id}-${new Date().getHours()}-${room.id}`)%Math.max(1,a.length)]||`${room.name}에서 느긋하게 쉬는 중`;
 }
 function person(c,text){return`<div class="home-person" style="--person:${esc(c.theme||'#6f7cff')}">${c.photo?`<img src="${c.photo}" alt="">`:`<span>${esc((c.name||'새')[0])}</span>`}<div><b>${esc(c.name)}</b><small>${esc(text)}</small></div></div>`}
 const breedName=(c)=>({korean:'코리안 쇼트헤어',persian:'페르시안',ragdoll:'랙돌',siamese:'샴',british:'브리티시 쇼트헤어',mainecoon:'메인쿤',scottish:'스코티시 폴드',mixed:'믹스견',maltese:'말티즈',poodle:'푸들',retriever:'리트리버',shiba:'시바견',corgi:'웰시코기',jindo:'진돗개'})[c.pet==='cat'?c.catBreed:c.dogBreed]||(c.pet==='cat'?'고양이':'강아지');
 function pet(c){
  if(!c.pet||c.pet==='none')return'';const cat=['창가에서 햇볕을 쬐는 중','소파에서 식빵을 굽는 중','장난감을 노려보는 중','집 안을 순찰하는 중','물그릇을 확인하는 중'],dog=['꼬리를 흔들며 노는 중','장난감을 물고 다니는 중','현관 소리에 귀를 기울이는 중','푹신한 곳에서 낮잠 중','물그릇 옆에서 쉬는 중'];
  const actions=c.pet==='cat'?cat:dog,text=actions[hash(`${c.id}-pet-${new Date().getHours()}`)%actions.length],mood=hash(`${c.id}-pet-mood-${new Date().getDate()}`)%3;
  return`<div class="home-pet" style="--person:${esc(c.theme||'#e989a6')}">${c.petPhoto?`<img src="${c.petPhoto}" alt="">`:`<span>${c.pet==='cat'?'🐈':'🐕'}</span>`}<div><b>${esc(c.petName||'반려동물')}</b><small>${esc(breedName(c))} · ${esc(text)}</small><em>${['배부름','놀아 달라는 중','아주 편안함'][mood]}</em></div></div>`;
 }
 function cleanliness(owner,people){
  const today=new Date().toLocaleDateString('sv-SE'),last=owner.homeCleanDate||today;
  if(last!==today){const days=Math.max(1,Math.round((new Date(today)-new Date(last))/86400000)),petPenalty=owner.pet&&owner.pet!=='none'?3:0;owner.homeCleanliness=Math.max(5,(Number(owner.homeCleanliness)||82)-days*(2+people.length+petPenalty));owner.homeCleanDate=today}
  owner.homeCleanliness=Number(owner.homeCleanliness)||82;
  const awake=people.filter(c=>isHome(c)&&!sleepState(c).sleeping),cleaner=awake.sort((a,b)=>(hash(a.id)%5)-(hash(b.id)%5))[0],interval=cleaner?1+(hash(`${cleaner.id}-cleaning`)%4):4;
  if(cleaner&&owner.homeAutoCleanDate!==today&&owner.homeCleanliness<78&&hash(`${today}-${cleaner.id}`)%interval===0){owner.homeCleanliness=Math.min(100,owner.homeCleanliness+18);owner.homeAutoCleanDate=today;cleaner._autoCleaningUntil=Date.now()+45*60000;state.pendingCloudSave=true;queueMicrotask(()=>{save?.();window.queueParallelCityCloudSync?.()})}
  return owner.homeCleanliness;
 }
 const cleanLabel=v=>v>=85?'반짝반짝 깨끗함':v>=65?'대체로 깔끔함':v>=40?'조금 어질러짐':'청소가 시급함';
 function groups(){const seen=new Set(),out=[];state.characters.forEach(c=>{if(seen.has(c.id))return;const group=household(c);group.forEach(x=>seen.add(x.id));out.push(group)});return out}
 function render(){
  const root=$('#homeBlueprints')||$('#homeWorld');if(!root)return;
  root.innerHTML=groups().map(people=>{
   const owner=people[0],list=rooms(owner),inside=people.filter(isHome),clean=cleanliness(owner,people),placed=new Map(list.map(r=>[r.id,[]]));
   inside.forEach(c=>{const r=assignedRoom(c,people,list);placed.get(r.id)?.push(c)});
   const cards=list.map((r,index)=>{const byName=/주방/.test(r.name)?'kitchen':/침실|방\s*\d/.test(r.name)?'bedroom':/욕실|화장실/.test(r.name)?'bath':/거실/.test(r.name)?'living':'',fallback=byName||(['living','kitchen','bath','bedroom','study'].includes(r.type)?r.type:'study'),background=r.photo?`linear-gradient(#fff3,#fff3),url('${r.photo}')`:`linear-gradient(#fff1,#fff1),url('./icons/room-${fallback}-v43.svg')`;return`<section class="photo-room type-${esc(fallback)} room-${index+1} ${r.photo?'has-photo':''}" style="background-image:${background}"><div class="photo-room-title">${esc(r.name)}</div><div class="photo-room-people">${(placed.get(r.id)||[]).map(c=>person(c,action(c,r,people,clean))).join('')}</div>${fallback==='living'?pet(owner):''}</section>`}).join('');
   const layout=owner.homeLayout||owner.homeType||'apartment',layoutName={studio:'원룸',apartment:'아파트',apartmentA:'아파트',apartmentB:'아파트',house:'주택',mansion:'대저택'}[layout]||'집';
   return`<article class="home-card"><header><div><h3>🏠 ${esc(owner.homeName||`${owner.name}의 집`)}</h3><p>${esc(layoutName)} · ${people.map(p=>esc(p.name)).join(' · ')} 함께 거주 중</p></div><b>${inside.length?`${inside.length}명 귀가`:'모두 외출 중'}</b></header><div class="home-clean"><span>청결도 · ${cleanLabel(clean)}</span><div><i style="width:${clean}%"></i></div><b>${clean}%</b><button data-clean="${owner.id}">집 청소</button></div><div class="photo-room-grid layout-${esc(layout)}">${cards}</div></article>`;
  }).join('');
  $$('[data-clean]',root).forEach(button=>button.onclick=async()=>{const owner=state.characters.find(c=>c.id===button.dataset.clean);if(!owner)return;owner.homeCleanliness=Math.min(100,(Number(owner.homeCleanliness)||0)+25);owner.homeCleanDate=new Date().toLocaleDateString('sv-SE');state.pendingCloudSave=true;save();await window.pushParallelCityCloudState?.();render();toast?.('집을 깨끗하게 청소했어요!')});
 }
 window.ParallelCityHome={render,isHome,sleepState,household};window.renderBlueprintHomes=render;
})();
