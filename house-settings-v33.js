/* 평행도시 집·수면·반려동물 설정 v33 */
(()=>{
 const baseFurniture=[['bed','침대'],['sofa','소파'],['tv','TV'],['desk','책상'],['stove','조리대'],['table','식탁'],['bath','욕조·샤워'],['pet','반려동물 용품']];
 const hobbyFurniture={덕질:['goods','굿즈장'],독서:['bookshelf','책장'],게임:['console','게임기'],음악:['audio','오디오·악기'],영화:['projector','빔프로젝터'],향수:['perfumeShelf','향수장'],미술:['easel','이젤'],사진:['camera','촬영 장비'],쇼핑:['wardrobe','의상장'],운동:['fitness','운동 기구'],요리:['oven','오븐·조리도구'],'피규어 수집':['displayCase','피규어 장식장'],코스프레:['costume','코스튬 의상장'],'공방 체험':['workbench','작업대'],'카페 탐방':['coffee','커피 머신']};
 function furnitureList(){
  const list=[...baseFurniture],seen=new Set(list.map(x=>x[0]));
  state.characters.forEach(c=>[...(c.hobbies||[]),...(c.interests||[])].forEach(h=>{const item=hobbyFurniture[h];if(item&&!seen.has(item[0])){seen.add(item[0]);list.push(item)}}));
  return list;
 }
 const mins=value=>{const [h,m]=String(value||'00:00').split(':').map(Number);return h*60+m};
 const roomDefaults=(count=1)=>{
  const rooms=[
   {id:'living',type:'living',name:'거실',photo:'',furniture:['sofa','tv','table','pet']},
   {id:'kitchen',type:'kitchen',name:'주방',photo:'',furniture:['stove','table']},
   {id:'bath',type:'bath',name:'욕실',photo:'',furniture:['bath']}
  ];
  for(let i=1;i<=count;i++)rooms.push({id:`bedroom${i}`,type:'bedroom',name:`침실 ${i}`,photo:'',furniture:['bed','desk']});
  return rooms;
 };
 function normalize(character){
  character.bedroomCount=Math.max(1,Number(character.bedroomCount||character.bedCount)||1);
  character.bedCount=character.bedroomCount;
  character.bedtime=character.bedtime||'00:30';character.wakeTime=character.wakeTime||'07:30';
  character.petName=character.petName||'';character.petPhoto=character.petPhoto||'';
  character.hometown=character.hometown||'';character.specialDays=Array.isArray(character.specialDays)?character.specialDays:[];
  const existing=Array.isArray(character.rooms)?character.rooms:[];
  const wanted=roomDefaults(character.bedroomCount);
  character.rooms=wanted.map(room=>({...room,...(existing.find(old=>old.id===room.id)||{})}));
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
   Object.assign(member,{home:character.home,homeLayout:character.homeLayout,homeType:character.homeType,bedroomCount:character.bedroomCount,bedCount:character.bedroomCount,sleepArrangement:character.sleepArrangement,rooms:structuredClone(character.rooms),pet:character.pet,dogBreed:character.dogBreed,catBreed:character.catBreed,petColor:character.petColor,petName:character.petName,petPhoto:character.petPhoto});
  });
 }
 function install(){
  const sleep=document.querySelector('#charSleepArrangement');if(!sleep||document.querySelector('#charBedtime'))return;
  const count=document.querySelector('#charBedCount');if(count)count.previousElementSibling.textContent='침실 개수';
  sleep.parentElement.insertAdjacentHTML('afterend','<div><label>대략적인 취침 시각</label><input type="time" id="charBedtime" value="00:30"></div><div><label>대략적인 기상 시각</label><input type="time" id="charWakeTime" value="07:30"></div><div><label>본가 생활권</label><input id="charHometown" placeholder="명절에 방문할 동네·역"></div><div><label>반려동물 이름</label><input id="charPetName" placeholder="예: 모카"></div><div><label>반려동물 사진</label><input type="file" accept="image/*" id="charPetPhoto"></div>');
  const section=document.createElement('div');section.className='section';section.innerHTML='<h3>방 설정</h3><div class="notice">방 사진은 집 화면의 배경으로 사용됩니다. 가구는 그림으로 표시하지 않고, 해당 방에서 가능한 행동을 결정할 때만 사용됩니다.</div><div id="roomEditor" class="room-editor"></div></div><div class="section"><h3>특별한 날</h3><div class="fields"><div><label>날짜</label><input type="date" id="specialDate"></div><div><label>종류</label><select id="specialType"><option value="anniversary">기념일·데이트</option><option value="holiday">명절·본가 방문</option></select></div><div><label>이름</label><input id="specialTitle" placeholder="예: 결혼기념일"></div><div style="align-self:end"><button type="button" class="btn secondary" id="addSpecialDay">추가</button></div></div><div id="specialDayList"></div></div>';
  document.querySelector('#view-characters .panel .section:last-child')?.before(section);
  document.querySelector('#charBedCount')?.addEventListener('change',()=>{const c=active();c.bedroomCount=Number(document.querySelector('#charBedCount').value);c.rooms=roomDefaults(c.bedroomCount).map(r=>({...r,...((c.rooms||[]).find(old=>old.id===r.id)||{})}));renderRooms(c)});
  document.querySelector('#charPetPhoto')?.addEventListener('change',async event=>{const file=event.target.files[0];if(!file)return;const c=active();c.petPhoto=await compactCharacterPhoto(file);save();event.target.value='';toast('반려동물 사진을 저장했습니다.')});
  document.querySelector('#addSpecialDay')?.addEventListener('click',()=>{const c=normalize(active()),date=document.querySelector('#specialDate').value;if(!date)return toast('날짜를 선택해 주세요.');c.specialDays.push({id:crypto.randomUUID(),date,type:document.querySelector('#specialType').value,title:document.querySelector('#specialTitle').value.trim()||'특별한 날'});save();fill();});
  installHomeEditor();
 }
 function installHomeEditor(){
  if(document.querySelector('#homeEditPanel'))return;
  const view=document.querySelector('#view-home'),head=view?.querySelector('.home-view-head'),world=document.querySelector('#homeWorld');if(!view||!head||!world)return;
  const button=document.createElement('button');button.type='button';button.className='btn secondary';button.id='toggleHomeEdit';button.textContent='집 편집';
  head.appendChild(button);
  const panel=document.createElement('section');panel.id='homeEditPanel';panel.className='card panel house-edit-panel';panel.hidden=true;
  panel.innerHTML='<div class="title-row"><h3>우리 집 편집</h3><button type="button" class="icon-btn" id="closeHomeEdit">닫기</button></div><div class="fields"><div><label>집 유형</label><select id="houseHomeType"><option value="studio">원룸</option><option value="apartmentA">아파트 A형</option><option value="apartmentB">아파트 B형</option><option value="house">주택</option><option value="mansion">대저택</option></select></div><div><label>침실 개수</label><select id="houseBedroomCount"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option></select></div><div><label>잠자리 구성</label><select id="houseSleepArrangement"><option value="oneBed">한 방 · 한 침대</option><option value="sameRoom">한 방 · 각자 침대</option><option value="separateRooms">각방 사용</option></select></div></div><div id="homeRoomEditorSlot"></div><div class="actions"><button type="button" class="btn" id="saveHouseEdit">집 저장</button></div>';
  view.insertBefore(panel,world);
  const roomSection=document.querySelector('#roomEditor')?.closest('.section');if(roomSection)document.querySelector('#homeRoomEditorSlot').appendChild(roomSection);
  ['charHomeType','charBedCount','charSleepArrangement'].forEach(id=>{const field=document.querySelector(`#${id}`)?.parentElement;if(field)field.style.display='none'});
  button.onclick=()=>{panel.hidden=!panel.hidden;if(!panel.hidden)fillHouseEditor()};
  panel.querySelector('#closeHomeEdit').onclick=()=>panel.hidden=true;
  panel.querySelector('#houseBedroomCount').onchange=()=>{const c=normalize(active()),count=Number(panel.querySelector('#houseBedroomCount').value);c.bedroomCount=count;c.bedCount=count;c.rooms=roomDefaults(count).map(r=>({...r,...((c.rooms||[]).find(old=>old.id===r.id)||{})}));renderRooms(c)};
  panel.querySelector('#saveHouseEdit').onclick=()=>{const c=normalize(active());c.homeLayout=panel.querySelector('#houseHomeType').value;c.homeType=c.homeLayout;c.bedroomCount=Number(panel.querySelector('#houseBedroomCount').value);c.bedCount=c.bedroomCount;c.sleepArrangement=panel.querySelector('#houseSleepArrangement').value;syncFrom(c);save();renderRooms(c);window.ParallelCityHome?.render();toast('집 설정을 저장했습니다.')};
 }
 function fillHouseEditor(){
  const panel=document.querySelector('#homeEditPanel');if(!panel)return;const c=normalize(active());
  panel.querySelector('#houseHomeType').value=c.homeLayout||c.homeType||'studio';panel.querySelector('#houseBedroomCount').value=String(c.bedroomCount);panel.querySelector('#houseSleepArrangement').value=c.sleepArrangement||'oneBed';renderRooms(c);
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
   card.querySelector('.room-photo').onchange=async e=>{const file=e.target.files[0];if(!file)return;room.photo=await compactCharacterPhoto(file);save();renderRooms(character);toast(`${room.name} 사진을 저장했습니다.`)};
   box.appendChild(card);
  });
 }
 function renderSpecial(character){
  const box=document.querySelector('#specialDayList');if(!box)return;box.innerHTML=character.specialDays.length?'':'<div class="empty">등록된 특별한 날이 없습니다.</div>';
  character.specialDays.forEach(day=>{const row=document.createElement('div');row.className='place';row.innerHTML=`<strong>${esc(day.date)} · ${esc(day.title)}</strong><span>${day.type==='holiday'?'명절·본가 방문':'기념일·데이트 장소 우선'}</span><button class="icon-btn">삭제</button>`;row.querySelector('button').onclick=()=>{character.specialDays=character.specialDays.filter(x=>x.id!==day.id);save();fill()};box.appendChild(row)});
 }
 function fill(){
  install();const c=normalize(active());
  const count=document.querySelector('#charBedCount');if(count)count.value=String(c.bedroomCount);
  document.querySelector('#charBedtime').value=c.bedtime;document.querySelector('#charWakeTime').value=c.wakeTime;document.querySelector('#charHometown').value=c.hometown;document.querySelector('#charPetName').value=c.petName;
  renderRooms(c);renderSpecial(c);
  fillHouseEditor();
 }
 function collect(){
  const c=normalize(active());c.bedroomCount=Number(document.querySelector('#charBedCount')?.value)||1;c.bedCount=c.bedroomCount;c.bedtime=document.querySelector('#charBedtime')?.value||'00:30';c.wakeTime=document.querySelector('#charWakeTime')?.value||'07:30';c.hometown=document.querySelector('#charHometown')?.value.trim()||'';c.petName=document.querySelector('#charPetName')?.value.trim()||'';syncFrom(c);
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
 document.querySelector('#characterList')?.addEventListener('click',()=>setTimeout(fill,0),true);
 const baseGenerate=window.generateDay;
 if(typeof baseGenerate==='function')window.generateDay=async function(target=active()){const result=await baseGenerate(target);applySpecialDay(target);save();if(target.id===active().id)renderObserve();return result};
 window.ParallelCityHouseSettings={normalize,household,syncFrom,fill,collect,applySpecialDay};
})();
