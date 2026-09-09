import {state} from './state.js?v=20260909dev302';
import {mt} from './mailbox-center.js?v=20260909dev302';
import {sharedSelection} from './shared-world.js?v=20260909dev302';

// Dialog state stays local until Save. No personal-world event handlers are reused.
export function bindSharedHomeMembers(root,s,world,canEdit,render,toast){
 const api=window.DrawerVillageGroups,home=world.homes[world.activeHomeId],uid=window.ParallelCityAuth?.getInfo?.()?.user?.uid;
 const staff=s.group?.ownerUid===uid||s.members?.some(m=>(m.uid||m.id)===uid&&['owner','manager','operator'].includes(m.role));
 const allowed=character=>canEdit&&(!character||staff||character.ownerUid===uid);
 root.querySelectorAll('[data-member-add],[data-member-edit]').forEach(b=>b.disabled=!allowed(b.dataset.memberEdit==='resident'?world.characters[b.dataset.memberId]:null));
 root.addEventListener('click',e=>{
  const b=e.target.closest('[data-member-add],[data-member-edit],[data-open-car-editor]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();if(!canEdit)return;
  const kind=b.dataset.memberAdd||b.dataset.memberEdit||(b.hasAttribute('data-open-car-editor')?'car':''),id=b.dataset.memberId||b.dataset.openCarEditor;
  if(kind==='resident'&&!id){picker();return}if(kind==='resident'&&!allowed(world.characters[id]))return;editor(kind,id);
 },true);
 function sheet(title){
  const d=document.createElement('dialog');d.className='home-design-page home-member-editor shared-home-dialog';
  const head=document.createElement('header');head.className='home-design-head';const back=document.createElement('button');back.className='home-design-back';back.type='button';back.setAttribute('aria-label',mt('취소','Cancel','キャンセル'));back.onclick=()=>d.close();const h=document.createElement('h2');h.textContent=title;head.append(back,h);d.append(head);
  const body=document.createElement('div');body.className='home-design-fields';d.append(body);d.onclose=()=>{d.remove();render();document.querySelector('[data-home-feature="members"]')?.classList.add('open')};document.body.append(d);d.showModal();return {d,body};
 }
 function picker(){const {d,body}=sheet(mt('구성원 추가','Add resident','住民を追加'));for(const c of Object.values(world.characters).filter(c=>c.townId===home.townId&&allowed(c)&&!c.residences?.some(r=>r.homeId===home.id))){const b=document.createElement('button');b.textContent=c.name;b.onclick=()=>{d.remove();editor('resident',c.id)};body.append(b)}}
 function editor(kind,id){
  const collection=kind==='pet'?'pets':'cars',character=world.characters[id],existing=kind==='resident'?character?.residences?.find(r=>r.homeId===home.id):home[collection]?.find(i=>i.id===id);
  const item=structuredClone(existing||(kind==='pet'?{name:mt('새 식구','New companion','新しい家族'),species:'강아지',size:'중형',sex:'모름',room:Object.keys(home.rooms)[0],needsWalk:true}:kind==='car'?{name:mt('우리 집 자동차','Family car','家族の車'),type:'승용차',seats:5}:{role:'주거지',stayPattern:'상시 거주',sleepRoomId:Object.keys(home.rooms)[0],visitDays:[],isPrimary:!character?.residences?.length}));
  const {d,body}=sheet(kind==='resident'?character.name:mt(kind==='pet'?'반려생물 편집':'차량 편집',kind==='pet'?'Edit companion':'Edit vehicle',kind==='pet'?'ペットを編集':'車を編集'));
  const record=kind==='resident'?s.residents.find(r=>r.id===id):s.homes.find(h=>h.id===home.id),revision=Number(record[kind==='resident'?'residenceRevision':'layoutRevision'])||0;
  const fields={};
  function field(key,label,options,type='text',max=500){const l=document.createElement('label');l.textContent=label;const input=document.createElement(options?'select':'input');input.name=key;if(options)for(const option of options){const [value,text]=Array.isArray(option)?option:[option,option];input.add(new Option(text,value))}else{input.type=type;input.maxLength=max}if(type==='checkbox'){l.className='check';input.checked=!!item[key];}else input.value=item[key]??'';input.oninput=input.onchange=()=>{item[key]=type==='checkbox'?input.checked:type==='number'?Number(input.value):input.value};if(type==='checkbox')l.prepend(input);else l.append(input);body.append(l);fields[key]=input;return input}
  const opts=(ko,en,ja)=>ko.map((v,i)=>[v,mt(v,en[i],ja[i])]),rooms=Object.entries(home.rooms).map(([id,r])=>[id,r.name||id]);
  if(kind==='resident'){
   field('role',mt('이 캐릭터에게 어떤 집인가요?','Home role','この家との関係'),opts(['주거지','본가','별채','주말집','업무용 숙소','연인의 집','친척집','기타'],['Residence','Family home','Annex','Weekend home','Work accommodation','Partner’s home','Relative’s home','Other'],['住居','実家','別宅','週末の家','仕事用宿舎','恋人の家','親戚の家','その他']));
   field('stayPattern',mt('머무는 때','When to stay','滞在する時'),opts(['상시 거주','평일 중심','주말 중심','요일 지정','필요할 때 방문'],['Always','Weekdays','Weekends','Selected days','Visit when needed'],['常時','平日中心','週末中心','曜日指定','必要な時に訪問']));
   field('sleepRoomId',mt('자는 방','Sleeping room','寝る部屋'),[['__none__',mt('숙박하지 않음','No overnight stays','宿泊しない')],...rooms]);
   field('notes',mt('방문 목적·설명','Visit notes','訪問目的・説明'),null,'text',200);field('isPrimary',mt('기준 주거지','Primary home','主な住居'),null,'checkbox');
   const days=document.createElement('fieldset');const legend=document.createElement('legend');legend.textContent=mt('방문 요일','Visit weekdays','訪問曜日');days.append(legend);for(let day=0;day<7;day++){const l=document.createElement('label'),c=document.createElement('input');l.className='check';c.type='checkbox';c.checked=(item.visitDays||[]).includes(day);c.onchange=()=>item.visitDays=c.checked?[...new Set([...(item.visitDays||[]),day])]:(item.visitDays||[]).filter(v=>v!==day);l.append(c,document.createTextNode(mt(['일','월','화','수','목','금','토'][day],['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][day],['日','月','火','水','木','金','土'][day])));days.append(l)}body.append(days);
  }else{
   field('name',mt('이름','Name','名前'),null,'text',80).required=true;
   if(kind==='pet'){
    field('species',mt('종류','Species','種類'),opts(['아기','강아지','고양이','새','거북이','호랑이','식물','드래곤','인공지능','기타'],['Baby','Dog','Cat','Bird','Turtle','Tiger','Plant','Dragon','AI','Other'],['赤ちゃん','犬','猫','鳥','亀','虎','植物','ドラゴン','人工知能','その他']));
    field('customSpecies',mt('종류 이름 (기타)','Custom species','種類名（その他）'),null,'text',80);field('size',mt('크기','Size','大きさ'),opts(['소형','중형','대형'],['Small','Medium','Large'],['小型','中型','大型']));field('breed',mt('품종','Breed','品種'),null,'text',200);field('room',mt('주로 있는 방','Usual room','主にいる部屋'),rooms);field('sex',mt('성별','Sex','性別'),opts(['모름','수컷','암컷'],['Unknown','Male','Female'],['不明','オス','メス']));
    for(const [key,ko,en,ja] of [['neutered','중성화 완료','Neutered','去勢・避妊済み'],['needsWalk','함께 산책이 필요함','Needs walks','散歩が必要'],['rideable','등에 타고 이동할 수 있음','Can be ridden','背中に乗れる']])field(key,mt(ko,en,ja),null,'checkbox');
    for(const [key,label,values,en,ja] of [['temperaments',mt('성향','Temperament','性格'),['온순함','활발함','사고뭉치','진중함','호기심 많음','겁이 많음','사람을 잘 따름','독립적'],['Gentle','Active','Mischievous','Serious','Curious','Timid','Friendly','Independent'],['穏やか','活発','いたずら好き','落ち着いている','好奇心旺盛','怖がり','人懐こい','独立的']],['bodyTraits',mt('신체 특징','Physical traits','身体的特徴'),['털','비늘','깃털','날개','지느러미','뿔','꼬리','발광','독성'],['Fur','Scales','Feathers','Wings','Fins','Horns','Tail','Glowing','Venomous'],['毛','鱗','羽毛','翼','ひれ','角','尾','発光','毒性']]]){const box=document.createElement('fieldset'),legend=document.createElement('legend');legend.textContent=label;box.append(legend);values.forEach((v,i)=>{const l=document.createElement('label'),c=document.createElement('input');l.className='check';c.type='checkbox';c.checked=(item[key]||[]).includes(v);c.onchange=()=>item[key]=c.checked?[...(item[key]||[]),v]:(item[key]||[]).filter(x=>x!==v);l.append(c,document.createTextNode(mt(v,en[i],ja[i])));box.append(l)});body.append(box)}
   }else{
    field('type',mt('종류','Type','種類'),opts(['경차','승용차','SUV','승합차','스포츠카','전기차','오토바이','기타'],['Compact','Sedan','SUV','Van','Sports car','Electric car','Motorcycle','Other'],['軽自動車','乗用車','SUV','ワゴン','スポーツカー','電気自動車','バイク','その他']));field('color',mt('색상','Color','色'),null,'text',80);const seats=field('seats',mt('좌석 수','Seats','座席数'),null,'number');seats.min=1;seats.max=12;field('ownerCharacterId',mt('차 소유주','Vehicle owner','車の所有者'),[['',mt('공동 차량','Shared vehicle','共用車')],...Object.values(world.characters).map(c=>[c.id,c.name])]);
   }
   for(const key of kind==='pet'?['photo','icon']:['image']){
    const input=field(key,mt(key==='icon'?'아이콘 링크':'사진 링크',key==='icon'?'Icon URL':'Photo URL',key==='icon'?'アイコンURL':'写真URL'),null,'url',2000);const file=document.createElement('input');file.type='file';file.accept='image/*';file.setAttribute('aria-label',mt('사진 선택','Choose image','画像を選択'));file.onchange=async()=>{if(!file.files[0])return;file.disabled=true;save.disabled=true;try{const url=await api.uploadHomeMemberImage(file.files[0]);item[key]=url;input.value=url}catch(e){toast(e.message)}finally{file.disabled=false;save.disabled=false}};body.append(file);
   }
  }
  const actions=document.createElement('div');actions.className='editor-save-actions';const save=document.createElement('button');save.type='button';save.className='primary';save.textContent=mt('편집 완료','Save changes','編集完了');actions.append(save);d.append(actions);
  let saving=false;async function submit(remove=false){if(saving)return;if(!remove&&Object.values(fields).some(input=>!input.reportValidity()))return;saving=true;save.disabled=true;try{if(api.getSnapshot().activeGroupId!==s.activeGroupId)throw Error(mt('그룹이 바뀌었어요.','The group changed.','グループが変わりました。'));const result=await api.saveHomeMember({homeId:home.id,kind,id:id||crypto.randomUUID(),revision,item,remove});if(kind==='resident')Object.assign(record,{residences:result.residences,sharedHomeId:result.sharedHomeId,residenceRevision:result.revision});else{Object.assign(record,{layoutJson:result.layoutJson,layoutRevision:result.revision});Object.assign(home,JSON.parse(result.layoutJson));const draft=sharedSelection(s).homeDrafts?.[home.id];if(draft)Object.assign(draft,{pets:home.pets,cars:home.cars})}d.close()}catch(e){toast(e.message==='groups/edit-conflict'?mt('다른 편집이 저장됐어요. 다시 열어 최신 내용을 확인해 주세요.','Another edit was saved. Reopen to review the latest changes.','別の編集が保存されました。開き直して最新の内容を確認してください。'):e.message)}finally{saving=false;save.disabled=false}}
  save.onclick=()=>submit();d.addEventListener('cancel',e=>{if(saving)e.preventDefault()});
  if(existing){const remove=document.createElement('button');remove.type='button';remove.className='danger';remove.textContent=kind==='resident'?mt('집 연결 해제','Disconnect home','家の接続を解除'):mt('삭제','Delete','削除');remove.onclick=()=>{if(confirm(mt('이 항목을 삭제하거나 집 연결을 해제할까요?','Remove this item or disconnect this home?','この項目を削除、または家の接続を解除しますか？')))submit(true)};actions.prepend(remove)}
 }
}
