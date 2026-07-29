/* 평행도시 집·수면·반려동물 설정 v33 */
(()=>{
 const baseFurniture=[
  ['bed','침대'],['sofa','소파'],['recliner','리클라이너'],['massageChair','안마의자'],['tv','TV'],['projector','빔프로젝터'],
  ['desk','책상'],['computer','데스크톱 PC'],['console','게임기'],['arcade','아케이드 게임기'],['bookshelf','책장'],['readingChair','독서 의자'],
  ['stove','조리대'],['oven','오븐'],['coffee','커피 머신'],['table','식탁'],['bath','욕조·샤워'],['vanity','화장대'],['wardrobe','옷장'],
  ['piano','피아노'],['guitar','기타'],['violin','바이올린'],['drum','드럼'],['audio','오디오·턴테이블'],
  ['easel','이젤'],['camera','촬영 장비'],['sewing','재봉틀'],['workbench','공방 작업대'],['perfumeShelf','향수장'],['displayCase','피규어·굿즈 장식장'],
  ['fitness','운동 기구'],['yoga','요가 매트'],['aquarium','수조'],['plantShelf','식물 선반'],['catTower','캣타워'],['pet','반려동물 용품']
 ];
 const hobbyFurniture={덕질:['goods','굿즈장'],독서:['bookshelf','책장'],게임:['console','게임기'],음악:['audio','오디오·악기'],영화:['projector','빔프로젝터'],향수:['perfumeShelf','향수장'],미술:['easel','이젤'],사진:['camera','촬영 장비'],쇼핑:['wardrobe','의상장'],운동:['fitness','운동 기구'],요리:['oven','오븐·조리도구'],'피규어 수집':['displayCase','피규어 장식장'],코스프레:['costume','코스튬 의상장'],'공방 체험':['workbench','작업대'],'카페 탐방':['coffee','커피 머신']};
 function furnitureList(){
  const list=[...baseFurniture],seen=new Set(list.map(x=>x[0]));
  state.characters.forEach(c=>[...(c.hobbies||[]),...(c.interests||[])].forEach(h=>{const item=hobbyFurniture[h];if(item&&!seen.has(item[0])){seen.add(item[0]);list.push(item)}}));
  return list;
 }
 const mins=value=>{const [h,m]=String(value||'00:00').split(':').map(Number);return h*60+m};
 const roomDefaults=(count=4)=>{
  const templates=[
   {type:'living',name:'거실',furniture:['sofa','tv','table','pet']},
   {type:'kitchen',name:'주방',furniture:['stove','oven','table']},
   {type:'bath',name:'욕실',furniture:['bath']},
   {type:'bedroom',name:'침실 1',furniture:['bed','desk']}
  ];
  return Array.from({length:Math.max(1,count)},(_,i)=>{
   const base=templates[i]||{type:'bedroom',name:`침실 ${i-2}`,furniture:['bed','desk']};
   if(count===1)return{id:'room1',type:'living',name:'원룸',photo:'',furniture:['bed','sofa','desk','stove','table']};
   return{id:`room${i+1}`,photo:'',...base};
  });
 };
 function normalize(character){
  character.roomCount=Math.max(1,Number(character.roomCount)||((character.rooms||[]).length||Math.max(1,Number(character.bedroomCount||character.bedCount)||1)+3));
  character.bedtime=character.bedtime||'00:30';character.wakeTime=character.wakeTime||'07:30';
  character.petName=character.petName||'';character.petPhoto=character.petPhoto||'';
  character.homeName=character.homeName||`${character.name||'캐릭터'}의 집`;character.specialDays=Array.isArray(character.specialDays)?character.specialDays:[];
  const existing=Array.isArray(character.rooms)?character.rooms:[];
  const wanted=roomDefaults(character.roomCount);
  character.rooms=wanted.map((room,index)=>({...room,...(existing[index]||{})}));
  character.bedroomCount=Math.max(1,character.rooms.filter(room=>room.type==='bedroom').length);
  character.bedCount=character.bedroomCount;
  return character;
 }
 function household(character){
  const ids=new Set([character.id]);let changed=true;
  while(changed){changed=false;(state.relations||[]).filter(r=>r.cohabit==='yes').forEach(r=>{if(ids.has(r.a)||ids.has(r.b)){if(!ids.has(r.a)){ids.add(r.a);changed=true}if(!ids.has(r.b)){ids.add(r.b);changed=true}}})}
  return state.characters.filter(c=>ids.has(c.id));
 }
 function syncFrom(character){
  normalize(character);
  household(character).forEach(member=>{
   if(member.id===character.id)return;
   Object.assign(member,{homeName:character.homeName,homeLayout:character.homeLayout,homeType:character.homeType,roomCount:character.roomCount,bedroomCount:character.bedroomCount,bedCount:character.bedroomCount,sleepArrangement:character.sleepArrangement,rooms:structuredClone(character.rooms),pet:character.pet,dogBreed:character.dogBreed,catBreed:character.catBreed,petColor:character.petColor,petName:character.petName,petPhoto:character.petPhoto});
  });
 }
 function install(){
  const sleep=document.querySelector('#charSleepArrangement');if(!sleep||document.querySelector('#charBedtime'))return;
  const count=document.querySelector('#charBedCount');if(count)count.previousElementSibling.textContent='방 개수';
  sleep.parentElement.insertAdjacentHTML('afterend','<div><label>대략적인 취침 시각</label><input type="time" id="charBedtime" value="00:30"></div><div><label>대략적인 기상 시각</label><input type="time" id="charWakeTime" value="07:30"></div><div><label>반려동물 이름</label><input id="charPetName" placeholder="예: 모카"></div><div><label>반려동물 사진</label><input type="file" accept="image/*" id="charPetPhoto"></div>');
  const roomSection=document.createElement('div');roomSection.className='section house-room-settings';roomSection.innerHTML='<h3>방 설정</h3><div class="notice">평면도의 각 방 전체에 사진이 배경으로 들어갑니다. 가구는 화면에 그리지 않고 캐릭터가 그 방에서 할 수 있는 행동을 정할 때만 사용합니다.</div><div id="roomEditor" class="room-editor"></div>';
  const specialSection=document.createElement('div');specialSection.className='section character-special-days';specialSection.innerHTML='<h3>특별한 날</h3><div class="fields"><div><label>날짜</label><input type="date" id="specialDate"></div><div><label>종류</label><select id="specialType"><option value="anniversary">기념일·데이트</option><option value="holiday">명절·본가 방문</option></select></div><div><label>이름</label><input id="specialTitle" placeholder="예: 결혼기념일"></div><div style="align-self:end"><button type="button" class="btn secondary" id="addSpecialDay">추가</button></div></div><div id="specialDayList"></div>';
  const characterLast=document.querySelector('#view-characters .panel .section:last-child');if(characterLast){characterLast.before(specialSection);characterLast.before(roomSection)}
  document.querySelector('#charBedCount')?.addEventListener('change',()=>{const c=active();c.roomCount=Number(document.querySelector('#charBedCount').value);c.rooms=roomDefaults(c.roomCount).map((r,i)=>({...r,...((c.rooms||[])[i]||{})}));renderRooms(c)});
  document.querySelector('#charPetPhoto')?.addEventListener('change',async event=>{const file=event.target.files[0];if(!file)return;const c=active();c.petPhoto=await compactCharacterPhoto(file);state.pendingCloudSave=true;save();await window.pushParallelCityCloudState?.();event.target.value='';toast('반려동물 사진을 저장했습니다.')});
  document.querySelector('#addSpecialDay')?.addEventListener('click',()=>{const c=normalize(active()),date=document.querySelector('#specialDate').value;if(!date)return toast('날짜를 선택해 주세요.');c.specialDays.push({id:crypto.randomUUID(),date,type:document.querySelector('#specialType').value,title:document.querySelector('#specialTitle').value.trim()||'특별한 날'});save();fill();});
  installHomeEditor();
 }
 function installHomeEditor(){
  if(document.querySelector('#homeEditPanel')){relocateRoomEditor();return}
  const view=document.querySelector('#view-home'),head=view?.querySelector('.home-view-head'),world=document.querySelector('#homeWorld');if(!view||!head||!world)return;
  const button=document.createElement('button');button.type='button';button.className='btn secondary';button.id='toggleHomeEdit';button.textContent='집 편집';
  head.appendChild(button);
  const panel=document.createElement('section');panel.id='homeEditPanel';panel.className='card panel house-edit-panel';panel.hidden=true;
  panel.innerHTML='<div class="title-row"><h3 id="homeEditTitle">집 편집</h3><button type="button" class="icon-btn" id="closeHomeEdit">닫기</button></div><div class="fields"><div><label>편집할 집</label><select id="houseEditCharacter"></select></div><div><label>집 이름</label><input id="houseName" placeholder="예: 안테의 집"></div><div><label>집 유형</label><select id="houseHomeType"><option value="studio">원룸</option><option value="apartment">아파트</option><option value="house">주택</option><option value="mansion">대저택</option></select></div><div><label>방 개수</label><select id="houseRoomCount"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option><option>8</option><option>9</option><option>10</option></select></div><div><label>잠자리 구성</label><select id="houseSleepArrangement"><option value="oneBed">한 방 · 한 침대</option><option value="sameRoom">한 방 · 각자 침대</option><option value="separateRooms">각방 사용</option></select></div></div><div id="homeRoomEditorSlot"></div><div class="actions"><button type="button" class="btn" id="saveHouseEdit">집 저장</button></div>';
  view.insertBefore(panel,world);
  relocateRoomEditor();
  ['charHome','charHomeType','charBedCount','charSleepArrangement'].forEach(id=>{const field=document.querySelector(`#${id}`)?.parentElement;if(field)field.style.display='none'});
  button.onclick=()=>{panel.hidden=!panel.hidden;if(!panel.hidden){const select=panel.querySelector('#houseEditCharacter');select.innerHTML=state.characters.map(c=>`<option value="${c.id}">${esc(c.name)}의 집</option>`).join('');select.value=active().id;fillHouseEditor()}};
  panel.querySelector('#houseEditCharacter').onchange=fillHouseEditor;
  panel.querySelector('#closeHomeEdit').onclick=()=>panel.hidden=true;
  panel.querySelector('#houseRoomCount').onchange=()=>{const c=houseEditing(),count=Number(panel.querySelector('#houseRoomCount').value);c.roomCount=count;c.rooms=roomDefaults(count).map((r,i)=>({...r,...((c.rooms||[])[i]||{})}));renderRooms(c)};
  panel.querySelector('#saveHouseEdit').onclick=async()=>{const c=houseEditing();c.homeName=panel.querySelector('#houseName').value.trim()||`${c.name}의 집`;c.homeLayout=panel.querySelector('#houseHomeType').value;c.homeType=c.homeLayout;c.roomCount=Number(panel.querySelector('#houseRoomCount').value);c.sleepArrangement=panel.querySelector('#houseSleepArrangement').value;c.bedroomCount=Math.max(1,c.rooms.filter(room=>room.type==='bedroom').length);c.bedCount=c.bedroomCount;syncFrom(c);state.pendingCloudSave=true;save();renderRooms(c);window.ParallelCityHome?.render();await window.pushParallelCityCloudState?.();toast('집 설정을 저장했습니다.')};
 }
 function relocateRoomEditor(){
  const slot=document.querySelector('#homeRoomEditorSlot'),editor=document.querySelector('#roomEditor');if(!slot||!editor)return;
  const section=editor.closest('.house-room-settings')||editor.closest('.section')||editor.parentElement;
  if(section&&section.parentElement!==slot)slot.appendChild(section);
  const special=document.querySelector('.character-special-days'),characterLast=document.querySelector('#view-characters .panel .section:last-child');
  if(special&&characterLast&&special.parentElement!==characterLast.parentElement)characterLast.before(special);
  ['charHomeType','charBedCount','charSleepArrangement'].forEach(id=>{const field=document.querySelector(`#${id}`)?.parentElement;if(field)field.style.display='none'});
 }
 function houseEditing(){const id=document.querySelector('#houseEditCharacter')?.value;return normalize(state.characters.find(c=>c.id===id)||active())}
 function fillHouseEditor(){
  const panel=document.querySelector('#homeEditPanel');if(!panel)return;const c=houseEditing(),legacy=c.homeLayout||c.homeType||'studio';
  panel.querySelector('#homeEditTitle').textContent=`${c.name}의 집 편집`;panel.querySelector('#houseName').value=c.homeName||`${c.name}의 집`;panel.querySelector('#houseHomeType').value=['apartmentA','apartmentB'].includes(legacy)?'apartment':legacy;panel.querySelector('#houseRoomCount').value=String(c.roomCount);panel.querySelector('#houseSleepArrangement').value=c.sleepArrangement||'oneBed';renderRooms(c);
 }
 function renderRooms(character){
  const box=document.querySelector('#roomEditor');if(!box)return;normalize(character);box.innerHTML='';
  character.rooms.forEach(room=>{
   const card=document.createElement('div');card.className='room-setting';
   card.innerHTML=`<div class="room-setting-head"><input class="room-name" value="${esc(room.name)}"><select class="room-type"><option value="living">거실</option><option value="kitchen">주방</option><option value="bedroom">침실</option><option value="bath">욕실</option><option value="study">서재·취미방</option><option value="other">기타</option></select></div><div class="furniture-options">${furnitureList().map(([value,label])=>`<label><input type="checkbox" value="${value}" ${(room.furniture||[]).includes(value)?'checked':''}>${label}</label>`).join('')}</div><input class="room-photo" type="file" accept="image/*"><div class="room-photo-preview" ${room.photo?`style="background-image:url('${room.photo}')"`:''}>${room.photo?'사진 변경':'방 사진 추가'}</div>`;
   card.querySelector('.room-type').value=room.type;
   card.querySelector('.room-name').oninput=e=>room.name=e.target.value;
   card.querySelector('.room-type').onchange=e=>room.type=e.target.value;
   card.querySelectorAll('.furniture-options input').forEach(input=>input.onchange=()=>room.furniture=[...card.querySelectorAll('.furniture-options input:checked')].map(x=>x.value));
   card.querySelector('.room-photo').onchange=async e=>{const file=e.target.files[0];if(!file)return;room.photo=await compactCharacterPhoto(file);state.pendingCloudSave=true;save();await window.pushParallelCityCloudState?.();renderRooms(character);toast(`${room.name} 사진을 저장했습니다.`)};
   box.appendChild(card);
  });
 }
 function renderSpecial(character){
  const box=document.querySelector('#specialDayList');if(!box)return;box.innerHTML=character.specialDays.length?'':'<div class="empty">등록된 특별한 날이 없습니다.</div>';
  character.specialDays.forEach(day=>{const row=document.createElement('div');row.className='place';row.innerHTML=`<strong>${esc(day.date)} · ${esc(day.title)}</strong><span>${day.type==='holiday'?'명절·본가 방문':'기념일·데이트 장소 우선'}</span><button class="icon-btn">삭제</button>`;row.querySelector('button').onclick=()=>{character.specialDays=character.specialDays.filter(x=>x.id!==day.id);save();fill()};box.appendChild(row)});
 }
 function fill(){
  install();installHomeEditor();relocateRoomEditor();const c=normalize(active());
  const count=document.querySelector('#charBedCount');if(count)count.value=String(Math.min(5,c.roomCount));
  document.querySelector('#charBedtime').value=c.bedtime;document.querySelector('#charWakeTime').value=c.wakeTime;document.querySelector('#charPetName').value=c.petName;
  renderRooms(c);renderSpecial(c);
  fillHouseEditor();
 }
 function collect(){
  const c=normalize(active());c.bedtime=document.querySelector('#charBedtime')?.value||'00:30';c.wakeTime=document.querySelector('#charWakeTime')?.value||'07:30';c.petName=document.querySelector('#charPetName')?.value.trim()||'';syncFrom(c);
 }
 function applySpecialDay(character){
  normalize(character);const today=new Date().toLocaleDateString('sv-SE');
  let special=character.specialDays.find(day=>day.date===today),specialOwner=character;
  if(!special){
   const relation=(state.relations||[]).find(r=>(r.a===character.id||r.b===character.id)&&['부부','연인','짝사랑'].includes(r.type));
   const other=relation&&state.characters.find(c=>c.id===(relation.a===character.id?relation.b:relation.a));
   const otherSpecial=other&&normalize(other).specialDays.find(day=>day.date===today&&day.type==='anniversary');
   if(otherSpecial){special=otherSpecial;specialOwner=other}
  }
  if(!special||!Array.isArray(character.today))return;
  character.today=character.today.filter(event=>!event.specialDay);
  if(special.type==='holiday'){
   character.today=character.today.filter(event=>mins(event.time)<600||event.kind==='routine');
   character.today.push({time:'10:30',title:`${character.hometown||'본가'}로 이동`,detail:`${special.title}을 맞아 본가에 내려가는 중`,kind:'special',specialDay:true,place:{name:character.hometown||'본가',address:character.hometown||''},loc:eventCoord(character,'leisure')});
   character.today.push({time:'20:30',title:'본가에서 가족과 함께 쉬는 중',detail:'명절 일정을 마치고 가족과 시간을 보내는 중',kind:'home',home:true,specialDay:true,loc:character.location||eventCoord(character,'home')});
  }else{
   character.today=character.today.filter(event=>!(event.meal==='dinner'||(mins(event.time)>=1020&&event.category==='restaurant')));
   const partnerRelation=(state.relations||[]).find(r=>(r.a===character.id||r.b===character.id)&&['부부','연인','짝사랑'].includes(r.type));
   const partner=partnerRelation&&state.characters.find(c=>c.id===(partnerRelation.a===character.id?partnerRelation.b:partnerRelation.a));
   const activity=concreteActivity(character,'restaurant'),withText=partner?`${partner.name}와 함께 `:'';
   character.today.push({time:'19:00',title:`${withText}${activity.place.name} 방문`,detail:`${specialOwner.name||character.name}의 ${special.title} 기념 데이트 · 평소보다 분위기 좋은 장소를 우선 선택함`,kind:'relation',category:'restaurant',meal:'dinner',specialDay:true,togetherWith:partner?.id,place:activity.place,loc:eventCoord(character,'leisure')});
  }
  character.today.sort((a,b)=>a.time.localeCompare(b.time));
 }
 install();fill();
 document.querySelector('#saveChar')?.addEventListener('click',collect,true);
 document.querySelector('#saveChar')?.addEventListener('click',()=>setTimeout(()=>{
  const c=active();syncFrom(c);save();applyActiveCharacterTheme?.();renderAll?.();renderObserveCharacterPicker?.();window.ParallelCityHome?.render?.();updateMarkers?.();window.queueParallelCityCloudSync?.();
 },0));
 document.querySelector('#characterList')?.addEventListener('click',()=>setTimeout(fill,0),true);
 const baseGenerate=window.generateDay;
 if(typeof baseGenerate==='function')window.generateDay=async function(target=active()){const result=await baseGenerate(target);applySpecialDay(target);save();if(target.id===active().id)renderObserve();return result};
 window.ParallelCityHouseSettings={normalize,household,syncFrom,fill,collect,applySpecialDay};
})();
