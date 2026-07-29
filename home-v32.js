/* 평행도시 집 화면 v32 — 기존 지도/집 코드와 분리된 단일 렌더러 */
(()=>{
  const layouts={
    studio:{label:'원룸',rooms:[['living','생활 공간',3,4,64,92],['kitchen','주방',69,4,28,42],['bath','욕실',69,48,28,48]]},
    apartmentA:{label:'아파트 A형',rooms:[['living','거실',3,4,55,50],['kitchen','주방',60,4,37,29],['entry','현관',60,35,18,19],['bath','욕실',80,35,17,19],['bedroom1','침실 1',3,56,30,40],['bedroom2','침실 2',35,56,28,40],['study','서재·취미방',65,56,32,40]]},
    apartmentB:{label:'아파트 B형',rooms:[['bedroom1','침실 1',3,4,29,39],['living','거실·다이닝',34,4,43,60],['kitchen','주방',79,4,18,60],['bedroom2','침실 2',3,45,29,51],['study','취미방',34,66,29,30],['bath','욕실',65,66,15,30],['entry','현관',82,66,15,30]]},
    mansion:{label:'대저택',rooms:[['living','대형 거실',3,4,39,43],['kitchen','주방',44,4,25,25],['dining','다이닝룸',71,4,26,25],['study','서재',44,31,25,33],['bath','욕실',71,31,12,33],['entry','홀',85,31,12,33],['bedroom1','마스터 침실',3,49,30,47],['bedroom2','침실 2',35,66,29,30],['bedroom3','침실 3',66,66,31,30]]}
  };
  const petColors={brown:'#9a6b45',white:'#e7e4dc',black:'#343434',gray:'#8b929b',orange:'#d7923d',tuxedo:'#30343a',calico:'#b77b54'};
  const minuteNow=()=>new Date().getHours()*60+new Date().getMinutes();
  function eventFor(character,minute){
    const past=(character.today||[]).filter(item=>mins(item.time)<=minute);
    return past[past.length-1]||{title:'취침 중',detail:'다음 일정 전까지 집에서 자는 중',kind:'home',home:true,room:'bedroom'};
  }
  function atHome(event){return !!event&&(event.home||event.kind==='home'||/기상|하루 정리|귀가|집에서|잠든|취침/.test(event.title||''))}
  function groupKey(character){
    const relation=(state.relations||[]).find(item=>item.cohabit==='yes'&&(item.a===character.id||item.b===character.id));
    return relation?`shared-${[relation.a,relation.b].sort().join('-')}`:`solo-${character.id}`;
  }
  function layoutFor(character){return layouts[character.homeLayout]||layouts[character.homeType]||layouts.apartmentA}
  function furniture(room){
    const key=room[0];
    if(key.startsWith('bedroom'))return'<i class="furniture bed"></i><i class="furniture desk"></i><i class="door"></i>';
    if(key==='living')return'<i class="furniture sofa"></i><i class="furniture table"></i><i class="door"></i>';
    if(key==='kitchen')return'<i class="furniture counter"></i><i class="furniture table"></i><i class="door"></i>';
    if(key==='study')return'<i class="furniture desk"></i><i class="door"></i>';
    if(key==='bath')return'<i class="furniture tub"></i><i class="door"></i>';
    return'<i class="door"></i>';
  }
  function activity(character,event,minute,mates,index){
    if(event?.room)return{room:event.room==='bedroom'?'bedroom1':event.room,action:event.detail||event.title};
    const hour=Math.floor(minute/60),partner=mates.find(person=>person.id!==character.id),seed=(minute+character.id.length*17)%6;
    if(hour<7||hour>=22){
      const room=character.sleepArrangement==='separateRooms'?`bedroom${Math.min(index+1,3)}`:'bedroom1';
      const actions=partner?['함께 하루 이야기를 나누는 중','나란히 누워 영상을 보는 중','서로 등을 기대고 쉬는 중','잠들기 전에 책을 읽는 중']:['침대에서 책을 읽는 중','이불 속에서 휴대폰을 보는 중','잠들 준비를 하는 중'];
      return{room,action:actions[seed%actions.length]};
    }
    if(character.pet&&character.pet!=='none'&&hour>=20&&hour<21)return{room:'living',action:partner?`${partner.name}와 반려동물을 돌보는 중`:'반려동물과 놀아주는 중'};
    if(hour>=18&&hour<20)return{room:'kitchen',action:partner?`${partner.name}와 저녁을 만드는 중`:'저녁을 준비하는 중'};
    if(partner&&hour>=20)return{room:'living',action:[`${partner.name}와 드라마를 보는 중`,`${partner.name}와 보드게임 중`,`${partner.name}와 차를 마시며 이야기 중`,`${partner.name}와 소파에서 각자 취미 중`][seed%4]};
    return{room:'living',action:['소파에서 음악을 듣는 중','밀린 영상을 보는 중','창가에서 멍하니 쉬는 중','간단히 스트레칭하는 중','휴대폰을 보며 뒹구는 중','아무것도 하지 않고 쉬는 중'][seed]};
  }
  function point(layout,room,index,count){
    const found=layout.rooms.find(item=>item[0]===room)||layout.rooms.find(item=>item[0]==='living')||layout.rooms[0];
    return{x:found[2]+found[4]/2+(count>1?(index-(count-1)/2)*8:0),y:found[3]+found[5]/2+(index%2?5:-3)};
  }
  function petName(character){
    if(character.pet==='dog')return({maltese:'말티즈',poodle:'푸들',retriever:'리트리버',shiba:'시바견',corgi:'웰시코기',jindo:'진돗개',mixed:'믹스견'}[character.dogBreed]||'강아지');
    return({korean:'코리안 쇼트헤어',persian:'페르시안',ragdoll:'랙돌',siamese:'샴',british:'브리티시 쇼트헤어',mainecoon:'메인쿤',scottish:'스코티시 폴드'}[character.catBreed]||'고양이');
  }
  function render(){
    const world=document.querySelector('#homeWorld');if(!world)return;
    const minute=minuteNow(),clock=document.querySelector('#homeClock');if(clock)clock.textContent=new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'});
    const residents=state.characters.filter(character=>atHome(eventFor(character,minute)));
    if(!residents.length){world.innerHTML='<div class="card empty-home">현재 집에 들어온 캐릭터가 없어요.</div>';return}
    const groups=new Map();residents.forEach(character=>{const key=groupKey(character);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(character)});
    world.innerHTML='';
    groups.forEach(characters=>{
      const first=characters[0],layout=layoutFor(first),building=document.createElement('article');
      building.className='home-building';
      const rooms=layout.rooms.map(room=>`<div class="blueprint-room" data-room="${room[0]}" style="left:${room[2]}%;top:${room[3]}%;width:${room[4]}%;height:${room[5]}%"><span>${room[1]}</span>${furniture(room)}</div>`).join('');
      building.innerHTML=`<div class="home-building-head"><div><h3>🏠 ${layout.label}${first.home?' · '+esc(first.home):''}</h3><div class="meta">${characters.map(c=>esc(c.name)).join(' · ')} 귀가 중 · 침대 ${Number(first.bedCount)||1}개</div></div><span class="mood">${characters.length}명</span></div><div class="floorplan blueprint">${rooms}</div>`;
      const floor=building.querySelector('.floorplan');
      characters.forEach((character,index)=>{
        const info=activity(character,eventFor(character,minute),minute,characters,index),position=point(layout,info.room,index,characters.length),theme=ensureCharTheme(character),marker=document.createElement('div');
        marker.className='home-marker';marker.style.cssText=`--person-color:${theme.accent};left:${position.x}%;top:${position.y}%`;
        marker.innerHTML=`${character.photo?`<img src="${character.photo}" alt="">`:esc(character.name.slice(0,1))}<div class="home-action"><b>${esc(character.name)}</b>${esc(info.action)}</div>`;
        floor.appendChild(marker);
      });
      const owner=characters.find(character=>character.pet&&character.pet!=='none');
      if(owner){const marker=document.createElement('div');marker.className='pet-marker';marker.style.cssText=`left:62%;top:45%;--pet-color:${petColors[owner.petColor]||petColors.brown}`;marker.innerHTML=`${owner.pet==='dog'?'🐕':'🐈'}<small>${esc(petName(owner))}도 집에서 쉬는 중</small>`;floor.appendChild(marker)}
      world.appendChild(building);
    });
  }
  window.ParallelCityHome={render,isHome:character=>atHome(eventFor(character,minuteNow()))};
  document.querySelector('.tab[data-view="home"]')?.addEventListener('click',()=>setTimeout(render,0));
  setInterval(()=>{if(document.querySelector('#view-home')?.classList.contains('active'))render()},30000);
})();
