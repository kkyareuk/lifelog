import {state, active, save, replaceState, createCharacter, deleteCharacter, setActive, setActiveHome, updateCharacter, toggleChip, addRelationship, updateRelationship, deleteRelationship, setHomeImage, setHomeBackground, setPlaceImage, setPlaceInteriorImage, setCharacterImage, setWorldBackground, addPlace, deletePlace, movePlace, updatePlace, resetAll, cloneState, setHomeEditMode, updateHome, updateRoom, addRoom, addPet, updatePet, deletePet, setPetImage, toggleFurniture, setHomeResidents, moveCharacter, addCatalogItem, updateCatalogItem, deleteCatalogItem, toggleFavorite, toggleOwned, togglePlaceStock, setCharacterPane, addTown, switchTown, deleteTown} from "./state.js?v=20260803bc";
import {eventFor} from "./simulation.js?v=20260803bc";
import {renderApp, setAccountLabel, setAccountEntitlements} from "./views.js?v=20260803bd";

let pendingImage=null;
let deferredInstallPrompt=null;
const guidePending=new Set();
const PAGE_GUIDES={
  observe:["관찰","캐릭터가 지금 어디에서 무엇을 하는지 볼 수 있어요. 위쪽에서 캐릭터와 마을을 바꾸고, 아래 생활로그에서 오늘의 흐름을 확인해 보세요."],
  home:["집","방마다 누가 무엇을 하는지 보고, 집 편집에서 방 사진·동거인·함께 사는 존재·자동차를 설정할 수 있어요."],
  character:["캐릭터","프로필과 성격, 취향을 설정하면 생활 장면과 대사가 달라져요. 일반회원은 캐릭터를 최대 7명까지 만들 수 있습니다."],
  wardrobe:["옷장","옷을 등록하고 코디를 저장하면 캐릭터가 일정과 장소에 맞춰 옷을 골라 입어요."],
  catalog:["취향 사전","음식, 작품, 음악, 향 같은 세계의 물건을 등록해 캐릭터 취향과 생활 장면에 연결할 수 있어요."],
  relationship:["관계","둘 이상의 캐릭터 관계와 자주 하는 행동을 정하면 상호작용과 생활로그에 반영돼요."],
  routine:["주간 루틴","요일과 시간을 골라 출근, 데이트, 휴식 같은 반복 일정을 만들 수 있어요."],
  town:["마을","마을은 최대 2개까지 만들 수 있어요. 건물을 추가하고 지도 위에서 위치를 옮겨 보세요."],
  settings:["설정","동기화와 백업, 지도 표시 방식을 관리하고 개발자에게 피드백을 보낼 수 있어요."]
};

function showInstallButton(){
  const installed=window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===true||window.Capacitor?.isNativePlatform?.()===true;
  if(installed){document.querySelector("#install-drawer-village")?.remove();return}
  if(document.querySelector("#install-drawer-village"))return;
  const button=document.createElement("button");
  button.id="install-drawer-village";
  button.className="install-app-button";
  button.textContent="앱 설치";
  button.onclick=async()=>{
    if(deferredInstallPrompt){
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt=null;
      button.remove();
      return;
    }
    alert(/iphone|ipad|ipod/i.test(navigator.userAgent)?"Safari의 공유 버튼을 누른 뒤 ‘홈 화면에 추가’를 선택해 주세요.":"브라우저 메뉴에서 ‘앱 설치’ 또는 ‘홈 화면에 추가’를 선택해 주세요.");
  };
  document.body.append(button);
}
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const isPremiumMember=()=>{const value=window.ParallelCityAuth?.getInfo?.().entitlements||{};return Boolean(value.premium||value.plan==="premium")};
const characterLimit=()=>isPremiumMember()?Number.MAX_SAFE_INTEGER:7;
const BASE_AUDIENCES=["혼자 조용히 있고 싶은 사람","연인·데이트","부부","가족","친구 모임","직장인","학생","대학생","어린이","청소년","중장년","고소득층","가성비 중시","디저트 러버","커피 애호가","차 애호가","매운 음식 마니아","채식 선호","한식파","일식파","면 요리 마니아","신상 맛집파","SF 덕후","로맨스 덕후","판타지 덕후","미스터리 덕후","공포 덕후","액션 덕후","코미디 덕후","애니메이션 팬","영화 팬","드라마 팬","관찰 예능 팬","게임 방송 팬","음악 팬","아이돌 팬","인디 음악 팬","클래식 애호가","게임 마니아","보드게임 팬","e스포츠 팬","패션 관심층","빈티지 애호가","향수 애호가","사진 애호가","미술 애호가","독서가","여행 애호가","반려동물 동반","운동 애호가","야외 활동파","집순이·집돌이","오타쿠","얼리어답터"];
function audienceOptions(){
  const values=new Set(BASE_AUDIENCES),fields=["interests","hobbies","foodPreferences","drinks","favoriteStoryGenres","musicGenres","favoriteFashionStyles","favoriteVideoGenres","favoriteGameGenres","favoriteScentNotes"];
  Object.values(state.characters).forEach(c=>fields.forEach(field=>(c[field]||[]).forEach(value=>values.add(value))));
  return [...values].sort((a,b)=>a.localeCompare(b,"ko"));
}
function openAudienceDialog(placeId){
  const place=state.world.places.find(p=>p.id===placeId);if(!place)return;
  const selected=new Set(place.audiences||[]),dialog=document.createElement("dialog");dialog.className="audience-dialog";
  dialog.innerHTML=`<form method="dialog"><div class="title"><div><h2>${place.name} 주요 이용층</h2><small>캐릭터 취향을 포함해 여러 개 선택할 수 있어요.</small></div><button value="cancel" aria-label="닫기">×</button></div><input type="search" name="search" placeholder="예: 디저트, SF, 관찰 예능"><div class="audience-dialog-list">${audienceOptions().map(value=>`<button type="button" data-audience-value="${value.replace(/"/g,"&quot;")}" class="${selected.has(value)?"on":""}">${value}</button>`).join("")}</div><div class="crop-actions"><button value="cancel">취소</button><button class="primary" value="apply">선택 적용</button></div></form>`;
  const filter=()=>{const q=dialog.querySelector('[name="search"]').value.trim().toLowerCase();dialog.querySelectorAll("[data-audience-value]").forEach(button=>button.hidden=q&&!button.textContent.toLowerCase().includes(q))};
  dialog.querySelector('[name="search"]').oninput=filter;
  dialog.querySelectorAll("[data-audience-value]").forEach(button=>button.onclick=()=>{const value=button.dataset.audienceValue;selected.has(value)?selected.delete(value):selected.add(value);button.classList.toggle("on",selected.has(value))});
  dialog.onclose=()=>{if(dialog.returnValue==="apply"){updatePlace(placeId,{audiences:[...selected]},true);render();showToast("주요 이용층을 적용했습니다")}dialog.remove()};
  document.body.append(dialog);dialog.showModal();
}
const BUILDING_SHAPES=[
  {id:"drawer-building",name:"쌍둥이 서랍 건물",src:"world-assets/drawer-building.png"},
  {id:"drawer-home",name:"빨간 지붕 건물",src:"world-assets/drawer-home.png"},
  {id:"medieval-castle",name:"중세 성채",src:"world-assets/medieval-castle.svg"},
  {id:"medieval-tavern",name:"중세 여관",src:"world-assets/medieval-tavern.svg"},
  {id:"medieval-market",name:"중세 시장",src:"world-assets/medieval-market.svg"}
];
const FASHION_MATERIALS=["면","데님","니트","울","가죽","스웨이드","실크","린넨","폴리에스터","나일론","벨벳","레이스"];
const FASHION_COLORS=["검정","흰색","아이보리","회색","갈색","베이지","빨강","주황","노랑","초록","파랑","남색","보라","분홍","은색","금색","여러 색"];
const FASHION_FLAIRS=["무지","미니멀","단정함","편안함","캐주얼","스포티","빈티지","스트리트","러블리","우아함","화려함","개성적","정장","유니폼","파티용"];
const OCCASION_TAGS=["일상복","출근복","유니폼","정장","데이트룩","파티복","잠옷","운동복","외출복","실내복","여행복","격식 있는 자리"];
const ORDINARY_LEVELS=["아주 무난함","무난함","적당히 개성 있음","눈에 띔","매우 독특함"];
const CLOTHING_CATEGORIES=["상의","하의","아우터","원피스","세트","신발","가방","액세서리","모자"];
const stablePick=(list,seed)=>list.length?list[[...seed].reduce((sum,char)=>sum+char.charCodeAt(0),0)%list.length]:null;
function currentOutfit(character){
  const event=eventFor(character),owned=new Set(character.inventory?.fashion||[]),items=(state.catalog?.fashion||[]).filter(item=>owned.has(item.id));
  const text=`${event.title} ${event.desc}`,work=/출근|업무|근무|회사|직장/.test(text),sleep=/자는 중|취침|잠/.test(text),date=/데이트|연인/.test(text),party=/파티|연회|공연/.test(text);
  const wanted=work?["출근복","유니폼","정장"]:sleep?["잠옷","실내복"]:date?["데이트룩","외출복"]:party?["파티복","격식 있는 자리"]:["일상복","외출복"];
  const saved=(character.savedOutfits||[]).filter(outfit=>(outfit.tags||[]).some(tag=>wanted.includes(tag)));
  const savedChoice=stablePick(saved,`${character.id}:${new Date().toDateString()}:${event.title}:saved`);
  if(savedChoice){
    const savedItems=savedChoice.itemIds.map(id=>items.find(item=>item.id===id)).filter(Boolean);
    if(savedItems.length)return {event,work,items:savedItems,savedOutfit:savedChoice};
  }
  const suitable=items.filter(item=>(item.occasionTags||[]).some(tag=>wanted.includes(tag)));
  const sense=["패션에 전혀 관심 없음","조합을 자주 틀림","무난하게 입음","센스 있게 입음","스타일링에 능숙함"].indexOf(character.fashionSense);
  const pool=suitable.length&&(sense>=2||work||sleep)?[...suitable,...items.filter(item=>["신발","가방","액세서리","모자"].includes(item.category))]:items;
  const categories=["상의","하의","아우터","원피스","신발","가방","액세서리"],seed=`${character.id}:${new Date().toDateString()}:${event.title}`;
  let chosen=categories.map(category=>stablePick(pool.filter(item=>item.category===category),`${seed}:${category}`)).filter(Boolean);
  const onePiece=stablePick(pool.filter(item=>["원피스","세트"].includes(item.category)),`${seed}:onepiece`);
  if(onePiece&&sense>=2)chosen=[onePiece,...chosen.filter(item=>!["상의","하의"].includes(item.category))];
  if(sense>=3&&chosen.length){
    const baseColors=chosen.find(item=>item.colors?.length)?.colors||[];
    chosen=chosen.filter((item,index)=>index<2||!item.colors?.length||item.colors.some(color=>baseColors.includes(color)||["검정","흰색","회색","베이지","네이비"].includes(color)));
  }
  if(sense<=1)chosen=chosen.filter(item=>item.category!=="액세서리");
  return {event,work,items:[...new Map(chosen.map(item=>[item.id,item])).values()]};
}
function openOutfitDialog(characterId){
  const character=state.characters[characterId];if(!character)return;const outfit=currentOutfit(character),dialog=document.createElement("dialog");dialog.className="outfit-dialog";
  dialog.innerHTML=`<form method="dialog"><div class="title"><div><h2>${character.name}의 오늘 패션</h2><small>${outfit.work?"직장 일정에 맞춰 유니폼·정장 계열을 우선 골랐어요.":"현재 일정에 맞춰 옷장에서 자동으로 골랐어요."}</small></div><button value="close">×</button></div><div class="outfit-grid">${outfit.items.map(item=>`<article>${item.image?`<img src="${item.image}" alt="">`:`<span>👕</span>`}<b>${item.name}</b><small>${[item.category,...(item.colors||[]),...(item.materials||[]),...(item.flairs||[])].filter(Boolean).join(" · ")}</small></article>`).join("")||"<div class='empty-mini'><b>입을 옷이 아직 없어요.</b><p>캐릭터 옷장에서 옷을 소지품으로 선택해 주세요.</p></div>"}</div></form>`;
  dialog.onclose=()=>dialog.remove();document.body.append(dialog);dialog.showModal();
}
function openClothingEditor(itemId=""){
  const character=active();if(!character)return;
  const isNew=!itemId;let item=state.catalog.fashion.find(value=>value.id===itemId);
  if(!item){
    const id=addCatalogItem("fashion",{name:"새 옷",category:"상의",image:"",materials:[],colors:[],flairs:[],occasionTags:["일상복"],ordinary:"무난함",ownerId:character.id});
    character.inventory.fashion=[...new Set([...(character.inventory.fashion||[]),id])];
    item=state.catalog.fashion.find(value=>value.id===id);save(true);
  }
  const dialog=document.createElement("dialog");dialog.className="clothing-editor-dialog";
  const chips=(field,values)=>`<div class="closet-chip-grid">${values.map(value=>`<button type="button" data-clothing-chip="${field}" data-value="${value}" class="${(item[field]||[]).includes(value)?"on":""}">${value}</button>`).join("")}</div>`;
  dialog.innerHTML=`<form method="dialog"><div class="title"><div><h2>옷 등록·편집</h2><small>상황 태그는 여러 개를 골라도 돼요. 자동 코디가 이 정보를 사용합니다.</small></div><button value="cancel">×</button></div><div class="clothing-editor-grid"><section class="clothing-preview">${item.image?`<img src="${item.image}" alt="">`:"<span>👕</span>"}<label>이미지 주소<input name="image" value="${item.image||""}" placeholder="https://..."></label></section><section class="clothing-fields"><label>이름<input name="name" value="${item.name||""}"></label><label>분류<select name="category">${CLOTHING_CATEGORIES.map(value=>`<option ${item.category===value?"selected":""}>${value}</option>`).join("")}</select></label><label>평범한 정도<select name="ordinary">${ORDINARY_LEVELS.map(value=>`<option ${item.ordinary===value?"selected":""}>${value}</option>`).join("")}</select><h3>입는 상황 · 중복 선택</h3>${chips("occasionTags",OCCASION_TAGS)}<h3>색 · 중복 선택</h3>${chips("colors",FASHION_COLORS)}<h3>재질 · 중복 선택</h3>${chips("materials",FASHION_MATERIALS)}<h3>분위기 · 중복 선택</h3>${chips("flairs",FASHION_FLAIRS)}</section></div><div class="crop-actions"><button type="button" class="danger" data-delete-clothing>옷 삭제</button><button value="cancel">취소</button><button class="primary" value="save">저장</button></div></form>`;
  dialog.querySelectorAll("[data-clothing-chip]").forEach(button=>button.onclick=()=>{const field=button.dataset.clothingChip,value=button.dataset.value,list=item[field]||[];item[field]=list.includes(value)?list.filter(entry=>entry!==value):[...list,value];button.classList.toggle("on",item[field].includes(value))});
  dialog.querySelector("[data-delete-clothing]").onclick=()=>{state.catalog.fashion=state.catalog.fashion.filter(value=>value.id!==item.id);character.inventory.fashion=(character.inventory.fashion||[]).filter(id=>id!==item.id);character.savedOutfits=(character.savedOutfits||[]).map(outfit=>({...outfit,itemIds:outfit.itemIds.filter(id=>id!==item.id)}));save(true);dialog.close("deleted")};
  dialog.onclose=()=>{if(dialog.returnValue==="save"){const form=new FormData(dialog.querySelector("form"));Object.assign(item,{name:String(form.get("name")||"새 옷"),image:String(form.get("image")||""),category:String(form.get("category")||"상의"),ordinary:String(form.get("ordinary")||"무난함"),ownerId:character.id});save(true)}else if(isNew&&dialog.returnValue!=="deleted"){state.catalog.fashion=state.catalog.fashion.filter(value=>value.id!==item.id);character.inventory.fashion=(character.inventory.fashion||[]).filter(id=>id!==item.id);save(true)}dialog.remove();render()};
  document.body.append(dialog);dialog.showModal();
}
function openOutfitEditor(outfitId=""){
  const character=active();if(!character)return;
  const owned=new Set(character.inventory?.fashion||[]),items=(state.catalog.fashion||[]).filter(item=>owned.has(item.id));
  let outfit=(character.savedOutfits||[]).find(value=>value.id===outfitId);
  if(!outfit)outfit={id:crypto.randomUUID?.()||`${Date.now()}-${Math.random()}`,name:"새 코디",layout:"cluster-1",itemIds:[],tags:["일상복"]};
  const layouts=Array.from({length:13},(_,index)=>`cluster-${index+1}`);
  const dialog=document.createElement("dialog");dialog.className="outfit-editor-dialog";
  dialog.innerHTML=`<form method="dialog"><div class="title"><div><h2>코디 만들기</h2><small>보드 레이아웃과 함께 입을 옷을 골라 저장해요.</small></div><button value="cancel">×</button></div><label>코디 이름<input name="name" value="${outfit.name||""}"></label><h3>레이아웃 선택</h3><div class="layout-picker">${layouts.map(layout=>`<button type="button" data-outfit-layout="${layout}" class="${outfit.layout===layout?"on":""}"><span class="${layout}"><i></i><i></i><i></i><i></i><i></i></span></button>`).join("")}</div><h3>함께 입을 옷</h3><div class="outfit-item-picker">${items.map(item=>`<button type="button" data-outfit-item="${item.id}" class="${outfit.itemIds.includes(item.id)?"on":""}">${item.image?`<img src="${item.image}" alt="">`:"<span>👕</span>"}<b>${item.name}</b></button>`).join("")}</div><h3>코디 상황</h3><div class="closet-chip-grid">${OCCASION_TAGS.map(tag=>`<button type="button" data-outfit-tag="${tag}" class="${outfit.tags.includes(tag)?"on":""}">${tag}</button>`).join("")}</div><div class="crop-actions"><button type="button" class="danger" data-delete-outfit ${outfitId?"":"hidden"}>코디 삭제</button><button value="cancel">취소</button><button class="primary" value="save">코디 저장</button></div></form>`;
  dialog.querySelectorAll("[data-outfit-layout]").forEach(button=>button.onclick=()=>{outfit.layout=button.dataset.outfitLayout;dialog.querySelectorAll("[data-outfit-layout]").forEach(value=>value.classList.toggle("on",value===button))});
  dialog.querySelectorAll("[data-outfit-item]").forEach(button=>button.onclick=()=>{const id=button.dataset.outfitItem;outfit.itemIds=outfit.itemIds.includes(id)?outfit.itemIds.filter(value=>value!==id):[...outfit.itemIds,id];button.classList.toggle("on",outfit.itemIds.includes(id))});
  dialog.querySelectorAll("[data-outfit-tag]").forEach(button=>button.onclick=()=>{const tag=button.dataset.outfitTag;outfit.tags=outfit.tags.includes(tag)?outfit.tags.filter(value=>value!==tag):[...outfit.tags,tag];button.classList.toggle("on",outfit.tags.includes(tag))});
  dialog.querySelector("[data-delete-outfit]").onclick=()=>{character.savedOutfits=(character.savedOutfits||[]).filter(value=>value.id!==outfit.id);save(true);dialog.close("deleted")};
  dialog.onclose=()=>{if(dialog.returnValue==="save"){outfit.name=String(new FormData(dialog.querySelector("form")).get("name")||"저장 코디");const index=(character.savedOutfits||[]).findIndex(value=>value.id===outfit.id);index<0?character.savedOutfits.push(outfit):character.savedOutfits.splice(index,1,outfit);save(true)}dialog.remove();render()};
  document.body.append(dialog);dialog.showModal();
}
function openBuildingShapeDialog(placeId){
  const place=state.world.places.find(item=>item.id===placeId);if(!place)return;
  const dialog=document.createElement("dialog");dialog.className="building-shape-dialog";
  dialog.innerHTML=`<form method="dialog"><div class="title"><div><h2>건물 모양 선택</h2><small>건물 용도와 상관없이 원하는 모양을 고를 수 있어요.</small></div><button value="cancel">×</button></div><div class="building-shape-dex">${BUILDING_SHAPES.map(shape=>`<button type="button" data-building-shape="${shape.id}" class="${place.iconPreset===shape.id?"on":""}"><img src="${shape.src}" alt=""><b>${shape.name}</b></button>`).join("")}</div></form>`;
  dialog.querySelectorAll("[data-building-shape]").forEach(button=>button.onclick=()=>{
    if(button.dataset.buildingShape.startsWith("medieval-")&&!window.ParallelCityAuth?.getInfo?.().entitlements?.dlcPacks?.includes("medieval")){showToast("중세 건물 모양은 중세의 하루 DLC에 포함돼요");return}
    updatePlace(placeId,{iconPreset:button.dataset.buildingShape},true);dialog.close();render();showToast("건물 모양을 바꿨습니다");
  });
  dialog.onclose=()=>dialog.remove();document.body.append(dialog);dialog.showModal();
}
function enhanceDynamicForms(){
  const profile=document.querySelector(".profile-license");
  if(profile&&!profile.querySelector('[data-field="sleepHabit"]')){
    const label=document.createElement("label");label.className="sleep-habit-field";label.innerHTML=`수면 습관<select data-field="sleepHabit">${["이불을 단정히 덮고 잠","이불을 걷어차며 잠","옆으로 웅크려 잠","팔다리를 뻗고 잠","베개를 끌어안고 잠","잠꼬대를 자주 함","뒤척임이 많음","아주 얌전히 잠","새벽에 자주 깸","코를 골며 깊이 잠"].map(value=>`<option ${active().sleepHabit===value?"selected":""}>${value}</option>`).join("")}</select><small>자는 중 현재 장면에 반영돼요. 수면 중인 내용은 생활 로그에 기록하지 않아요.</small>`;profile.append(label);
  }
  document.querySelectorAll('.catalog-dex-card [data-kind="fashion"][data-catalog-field="image"]').forEach(input=>{
    const detail=input.closest(".catalog-detail");if(!detail||detail.querySelector('[data-catalog-field="material"]'))return;
    const item=state.catalog.fashion.find(value=>value.id===input.dataset.item),box=document.createElement("div");box.className="fashion-extra-fields";
    const group=(title,field,values)=>`<section class="chips"><b>${title}</b><div>${values.map(value=>`<button type="button" data-fashion-attr="${field}" data-item="${item.id}" data-value="${value}" class="${(item[field]||[]).includes(value)?"on":""}">${value}</button>`).join("")}</div></section>`;
    box.innerHTML=group("재질","materials",FASHION_MATERIALS)+group("색","colors",FASHION_COLORS)+group("분위기·화려함","flairs",FASHION_FLAIRS);
    input.closest("label").insertAdjacentElement("beforebegin",box);
  });
  document.querySelectorAll(".place-editor details").forEach(details=>{
    const placeId=details.querySelector("[data-place-id]")?.dataset.placeId;if(!placeId||details.querySelector("[data-building-shape-open]"))return;
    const button=document.createElement("button");button.type="button";button.dataset.buildingShapeOpen=placeId;button.className="building-shape-open";button.textContent="건물 모양 선택";
    details.querySelector(".place-config")?.insertAdjacentElement("afterend",button);
  });
  const sync=document.querySelector(".sync-panel");
  if(sync&&!sync.querySelector(".storage-meter")){
    const usage=window.ParallelCityAuth?.getInfo?.().storageUsage||JSON.parse(localStorage.getItem("drawer-village-storage-usage")||'{"count":0,"bytes":0,"maxCount":120,"maxBytes":15728640}');
    const unlimited=Boolean(usage.unlimited||isPremiumMember()),percent=unlimited?100:Math.min(100,Math.round((usage.bytes||0)/(usage.maxBytes||15728640)*100)),used=((usage.bytes||0)/1048576).toFixed(1),left=unlimited?"무제한":`${Math.max(0,((usage.maxBytes||15728640)-(usage.bytes||0))/1048576).toFixed(1)}MB 남음`;
    const meter=document.createElement("div");meter.className="storage-meter";meter.innerHTML=`<h3>사진 저장 공간</h3><div><i style="width:${percent}%"></i></div><b>${used}MB 사용 · ${left}</b><small>${unlimited?"프리미엄 이용 중 · 사진과 캐릭터 슬롯 무제한":"일반회원 · 총 20MB · 캐릭터 7명"} · 이미지 링크는 이 용량을 사용하지 않아요.</small>`;sync.append(meter);
  }
  if(state.activeTab==="observe"&&!document.querySelector("[data-show-outfit]")&&document.querySelector(".detail")){
    const button=document.createElement("button");button.type="button";button.className="show-outfit-button";button.dataset.showOutfit=state.activeId;button.textContent="오늘의 캐릭터 패션";document.querySelector(".detail h2")?.insertAdjacentElement("afterend",button);
  }
}
const addRoutine=characterId=>{
  state.routines[characterId]=Array.isArray(state.routines[characterId])?state.routines[characterId]:[];
  const item={id:crypto.randomUUID?.()||`${Date.now()}-${Math.random()}`,day:1,start:"09:00",end:"10:00",type:"개인 일정",title:"새 일정",placeId:"",withIds:[],notes:""};
  state.routines[characterId].push(item);save(true);return item.id;
};
const updateRoutine=(characterId,id,patch)=>{const item=state.routines[characterId]?.find(r=>r.id===id);if(item){Object.assign(item,patch);save(true)}};
const deleteRoutine=(characterId,id)=>{state.routines[characterId]=(state.routines[characterId]||[]).filter(r=>r.id!==id);save(true)};
const addCar=homeId=>{const home=state.homes[homeId];if(!home)return;home.cars=Array.isArray(home.cars)?home.cars:[];home.cars.push({id:crypto.randomUUID?.()||`${Date.now()}-${Math.random()}`,name:"우리 집 자동차",type:"승용차",color:"",seats:5,image:""});save(true)};
const updateCar=(homeId,id,patch)=>{const car=state.homes[homeId]?.cars?.find(item=>item.id===id);if(car){Object.assign(car,patch);save(true)}};
const deleteCar=(homeId,id)=>{const home=state.homes[homeId];if(home){home.cars=(home.cars||[]).filter(item=>item.id!==id);save(true)}};

function render(){
  try{
    renderApp(state);
    bind();
    applyTheme();
    requestAnimationFrame(()=>document.querySelectorAll(".life-log ol").forEach(log=>{log.scrollTop=log.scrollHeight}));
    requestAnimationFrame(maybeShowPageGuide);
  }catch(error){
    console.error("화면 복구 필요",error);
    document.querySelector("#app").innerHTML=`<section class="panel empty"><h1>화면을 복구하는 중 문제가 생겼어요</h1><p>저장 데이터는 지우지 않았습니다. 아래 버튼으로 다시 불러와 주세요.</p><button class="primary" id="safe-reload">다시 불러오기</button></section>`;
    document.querySelector("#safe-reload")?.addEventListener("click",()=>location.reload());
  }
}

function maybeShowPageGuide(){
  const tab=state.activeTab==="dlc"?"observe":state.activeTab,guide=PAGE_GUIDES[tab],key=`drawer-village-guide-${tab}`;
  if(!guide||!state.order.length||localStorage.getItem(key)==="1"||guidePending.has(tab))return;
  guidePending.add(tab);
  const openDialog=document.querySelector("dialog[open]");
  if(openDialog){openDialog.addEventListener("close",()=>{guidePending.delete(tab);maybeShowPageGuide()},{once:true});return}
  const dialog=document.createElement("dialog");dialog.className="page-guide";
  dialog.innerHTML=`<form method="dialog"><small>처음 오셨나요?</small><h2>${guide[0]}</h2><p>${guide[1]}</p><button class="primary" value="ok">확인</button></form>`;
  dialog.onclose=()=>{localStorage.setItem(key,"1");guidePending.delete(tab);dialog.remove()};
  document.body.append(dialog);dialog.showModal();
}

function showToast(message){
  let toast=document.querySelector("#mini-toast");
  if(!toast){
    toast=document.createElement("div");
    toast.id="mini-toast";
    document.body.append(toast);
  }
  toast.textContent=message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer=setTimeout(()=>toast.classList.remove("show"),1800);
}

function applyTheme(){
  const c=active();
  const primary=c?.theme?.primary||"#176b60";
  const secondary=c?.theme?.gradient?(c.theme.secondary||primary):primary;
  document.documentElement.style.setProperty("--p",primary);
  document.documentElement.style.setProperty("--s",secondary);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content",primary);
}

async function explicitSave(label="저장 완료"){
  save(true);
  showToast("저장되었습니다");
  const auth=window.ParallelCityAuth;
  if(auth?.getInfo?.().user) await auth.upload({silent:true,reason:label});
  render();
}

function bind(){
  enhanceDynamicForms();
  $$("[data-tab]").forEach(el=>el.onclick=()=>{state.activeTab=el.dataset.tab;save();render()});
  $$("[data-wardrobe-character]").forEach(el=>el.onclick=()=>{setActive(el.dataset.wardrobeCharacter);state.activeTab="wardrobe";save();render()});
  $("[data-new-clothing]")?.addEventListener("click",()=>openClothingEditor());
  $$("[data-edit-clothing]").forEach(el=>el.onclick=event=>{event.stopPropagation();openClothingEditor(el.dataset.editClothing)});
  $("[data-new-outfit]")?.addEventListener("click",()=>openOutfitEditor());
  $$("[data-edit-outfit]").forEach(el=>el.onclick=()=>openOutfitEditor(el.dataset.editOutfit));
  $$("[data-new]").forEach(el=>el.onclick=()=>{const limit=characterLimit();if(!createCharacter(limit))showToast(`${isPremiumMember()?"프리미엄 회원":"일반회원"}은 캐릭터를 최대 ${limit}명까지 만들 수 있어요`);render()});
  $$("[data-edit]").forEach(el=>el.onclick=()=>{setActive(el.dataset.edit);setCharacterPane("profile");render()});
  $$("[data-sort]").forEach(el=>el.onclick=event=>{
    event.stopPropagation();
    moveCharacter(el.dataset.sort,Number(el.dataset.direction||0));
    render();
  });
  $$("[data-delete-character]").forEach(el=>el.onclick=()=>{
    if(confirm("이 캐릭터와 연결된 관계를 삭제할까요?")){deleteCharacter(el.dataset.deleteCharacter);render()}
  });
  $$("[data-roster],[data-person]").forEach(el=>el.onclick=event=>{event.stopPropagation();focusCharacter(el.dataset.roster||el.dataset.person)});
  $$("[data-home-person]").forEach(el=>el.onclick=()=>focusHomeCharacter(el.dataset.homePerson));
  $("[data-all-sleep-home]")?.addEventListener("click",()=>focusHomeCharacter(state.activeId||state.order[0]));
  $$("[data-observe-town]").forEach(el=>el.onclick=()=>{switchTown(el.dataset.observeTown);render()});
  $$("[data-home-select]").forEach(el=>el.onclick=()=>{setActiveHome(el.dataset.homeSelect);render()});
  $("[data-home-edit]")?.addEventListener("click",async()=>{const was=state.homeEditMode;setHomeEditMode(!was);was?await explicitSave("집 편집 저장"):render()});
  $("[data-add-room]")?.addEventListener("click",()=>{addRoom(state.activeHomeId);render()});
  $("[data-add-pet]")?.addEventListener("click",()=>{addPet(state.activeHomeId);render()});
  $("[data-add-car]")?.addEventListener("click",()=>{addCar(state.activeHomeId);render()});
  $$("[data-car-field]").forEach(el=>el.oninput=()=>updateCar(el.dataset.homeId,el.dataset.carId,{[el.dataset.carField]:el.type==="number"?Number(el.value):el.value}));
  $$("[data-car-image]").forEach(el=>el.onclick=()=>pickImage("car",el.dataset.homeId,el.dataset.carImage));
  $$("[data-delete-car]").forEach(el=>el.onclick=()=>{deleteCar(el.dataset.homeId,el.dataset.deleteCar);render()});
  $$("[data-character-check]").forEach(el=>el.onchange=()=>{updateCharacter(el.dataset.characterCheck,{[el.dataset.field]:el.checked});render()});
  $$("[data-pet-field]").forEach(el=>{
    const apply=()=>{const value=["neutered","needsWalk","rideable"].includes(el.dataset.petField)?el.checked:el.value;updatePet(el.dataset.homeId,el.dataset.petId,{[el.dataset.petField]:value});if(["species","room"].includes(el.dataset.petField))render()};
    el.oninput=apply;el.onchange=apply;
  });
  $$("[data-delete-pet]").forEach(el=>el.onclick=()=>{if(confirm("이 함께 사는 존재를 삭제할까요?")){deletePet(el.dataset.homeId,el.dataset.deletePet);render()}});
  $$("[data-pet-image]").forEach(el=>el.onclick=()=>pickImage(`pet${el.dataset.petImage==="icon"?"Icon":"Photo"}`,el.dataset.homeId,el.dataset.petId));
  $$("[data-home-name]").forEach(el=>el.oninput=()=>updateHome(el.dataset.homeId,{name:el.value.trim()||"이름 없는 집"}));
  $$("[data-room-name]").forEach(el=>el.oninput=()=>updateRoom(el.dataset.homeId,el.dataset.roomName,{name:el.value.trim()||"방"}));
  $$("[data-sleep-room]").forEach(el=>el.onchange=()=>{updateCharacter(el.dataset.sleepRoom,{sleepRoomId:el.value});render()});
  $$("[data-furniture]").forEach(el=>el.onclick=()=>{toggleFurniture(el.dataset.homeId,el.dataset.room,el.dataset.furniture);render()});
  $$("[data-home-resident]").forEach(el=>el.onclick=()=>{
    const homeId=el.dataset.homeId,id=el.dataset.homeResident;
    const residents=state.order.filter(cid=>state.characters[cid].homeId===homeId);
    const next=residents.includes(id)?residents.filter(cid=>cid!==id):[...residents,id];
    if(!next.length){alert("집에는 최소 한 명이 거주해야 해요.");return}
    setHomeResidents(homeId,next);render();
  });
  $$("[data-home-town]").forEach(el=>el.onchange=()=>{updateCharacter(el.dataset.homeTown,{townId:el.value});render()});
  $$("[data-personality-field]").forEach(el=>el.onclick=()=>{updateCharacter(active().id,{[el.dataset.personalityField]:el.dataset.value});render()});
  $$("[data-field]").forEach(el=>el.oninput=()=>{
    const numeric=["spiceTolerance","sweetPreference","socialEnergy","sensingIntuition","thinkingFeeling","perceivingJudging"].includes(el.dataset.field);
    updateCharacter(active().id,{[el.dataset.field]:numeric?Number(el.value):el.value},false);
    if(el.dataset.levels){
      const labelSets={
        spice:["안 매움","살짝 매콤","순한맛","보통 라면 맵기","매운맛","아주 매운맛"],
        sweet:["안 달음","은은한 단맛","적당히 달콤","달콤함","아주 달콤함","극강의 단맛"],
        socialEnergy:["사람이 버거움","혼자가 편함","수줍음","상황에 따라 다름","먼저 어울림","인싸","무리의 중심"],
        sensingIntuition:["눈앞의 현실 중시","매우 현실적","구체적인 편","균형형","가능성을 봄","직관적","상상의 세계"],
        thinkingFeeling:["논리 최우선","이성적","차분한 판단","균형형","마음을 살핌","공감형","감정에 깊이 공명"],
        perceivingJudging:["완전 즉흥적","흐름에 맡김","유연한 편","균형형","미리 정리함","계획적","철저한 계획형"]
      };
      const labels=labelSets[el.dataset.levels]||labelSets.sweet;
      el.closest("label")?.querySelector("[data-range-label]")?.replaceChildren(document.createTextNode(labels[Number(el.value)]));
    }
  });
  $$("[data-color]").forEach(el=>el.oninput=()=>{updateCharacter(active().id,{theme:{...active().theme,[el.dataset.color]:el.value}},false);applyTheme()});
  $("[data-gradient]")?.addEventListener("change",e=>{updateCharacter(active().id,{theme:{...active().theme,gradient:e.target.checked}},false);applyTheme()});
  $$("[data-chip]").forEach(el=>el.onclick=()=>{toggleChip(active().id,el.dataset.chip,el.dataset.value);render()});
  $$("[data-favorite-kind]").forEach(el=>el.onclick=()=>{toggleFavorite(active().id,el.dataset.favoriteKind,el.dataset.favoriteId);render()});
  $$("[data-owned-kind]").forEach(el=>el.onclick=()=>{toggleOwned(active().id,el.dataset.ownedKind,el.dataset.ownedId);render()});
  $$("[data-add-catalog]").forEach(el=>el.onclick=()=>{addCatalogItem(el.dataset.addCatalog,{name:"새 항목",category:"기타"});render()});
  $$("[data-catalog-field]").forEach(el=>el.onchange=()=>{
    const value=["spicy","sweet"].includes(el.dataset.catalogField)?Number(el.value):el.value;
    updateCatalogItem(el.dataset.kind,el.dataset.item,{[el.dataset.catalogField]:value});
    if(el.dataset.catalogField==="category"){
      const y=window.scrollY,kind=el.dataset.kind,item=el.dataset.item;
      render();
      requestAnimationFrame(()=>{
        document.querySelector(`[data-catalog-field="category"][data-kind="${CSS.escape(kind)}"][data-item="${CSS.escape(item)}"]`)?.closest("details")?.setAttribute("open","");
        window.scrollTo({top:y});
      });
      return;
    }
    const detail=el.closest("details");if(detail)detail.open=true;
    showToast("항목에 반영되었습니다");
  });
  $$("[data-catalog-keyword]").forEach(el=>el.onclick=()=>{
    const item=state.catalog?.[el.dataset.kind]?.find(x=>x.id===el.dataset.catalogKeyword),list=item?.keywords||[],value=el.dataset.value;
    updateCatalogItem(el.dataset.kind,el.dataset.catalogKeyword,{keywords:list.includes(value)?list.filter(x=>x!==value):[...list,value]});render();
  });
  $$("[data-delete-catalog]").forEach(el=>el.onclick=()=>{if(confirm("이 항목을 삭제할까요?")){deleteCatalogItem(el.dataset.kind,el.dataset.deleteCatalog);render()}});
  $$("[data-place-stock]").forEach(el=>el.onclick=()=>{togglePlaceStock(el.dataset.placeStock,el.dataset.itemId);render()});
  $$("[data-delete-place]").forEach(el=>el.onclick=()=>{
    if(confirm("이 건물을 삭제할까요?")){deletePlace(el.dataset.deletePlace);render()}
  });
  $("[data-save]")?.addEventListener("click",()=>explicitSave("캐릭터 저장"));
  $("[data-catalog-save]")?.addEventListener("click",()=>explicitSave("취향 사전 저장"));
  $("[data-town-save]")?.addEventListener("click",()=>explicitSave("마을 저장"));
  $$('[data-catalog-field="image"]').forEach(input=>{
    if(input.parentElement?.querySelector("[data-catalog-image]"))return;
    const button=document.createElement("button");
    button.type="button";button.textContent="사진 첨부·자동 압축";
    button.dataset.catalogImage=input.dataset.item;button.dataset.kind=input.dataset.kind;
    input.insertAdjacentElement("afterend",button);
  });
  $$("[data-catalog-image]").forEach(el=>el.onclick=()=>pickImage("catalogImage",el.dataset.catalogImage,el.dataset.kind));
  $$(".place-editor details").forEach(details=>{
    const audienceTitle=[...details.querySelectorAll("h4")].find(title=>title.textContent.trim()==="주요 이용층");
    const oldPicker=audienceTitle?.nextElementSibling,placeId=oldPicker?.querySelector("[data-place-audience]")?.dataset.placeAudience;
    if(audienceTitle&&oldPicker&&placeId){
      const place=state.world.places.find(item=>item.id===placeId),button=document.createElement("button");
      button.type="button";button.className="audience-open-button";button.dataset.editAudiences=placeId;
      button.innerHTML=`<b>주요 이용층 선택</b><small>${place?.audiences?.length?`${place.audiences.length}개 선택됨 · ${place.audiences.slice(0,3).join(", ")}${place.audiences.length>3?"…":""}`:"아직 선택하지 않음"}</small>`;
      oldPicker.replaceWith(button);
    }
  });
  $$('[data-edit-audiences]').forEach(button=>button.onclick=()=>openAudienceDialog(button.dataset.editAudiences));
  $$('[data-building-shape-open]').forEach(button=>button.onclick=()=>openBuildingShapeDialog(button.dataset.buildingShapeOpen));
  $$('[data-fashion-attr]').forEach(button=>button.onclick=()=>{
    const item=state.catalog.fashion.find(value=>value.id===button.dataset.item);if(!item)return;const field=button.dataset.fashionAttr,value=button.dataset.value,list=Array.isArray(item[field])?[...item[field]]:[];
    updateCatalogItem("fashion",item.id,{[field]:list.includes(value)?list.filter(entry=>entry!==value):[...list,value]});render();
  });
  $$('[data-show-outfit]').forEach(button=>button.onclick=()=>openOutfitDialog(button.dataset.showOutfit));
  $$("[data-image]").forEach(el=>el.onclick=()=>pickImage(el.dataset.image,active().id));
  $$("[data-room-bg]").forEach(el=>el.onclick=()=>pickImage("room",el.dataset.homeId,el.dataset.room));
  $$("[data-home-bg]").forEach(el=>el.onclick=()=>pickImage("home",el.dataset.homeBg));
  $$("[data-place-interior-image]").forEach(el=>el.onclick=()=>pickImage("placeInterior",el.dataset.placeInteriorImage));
  $$("[data-image-url]").forEach(el=>el.onclick=()=>useImageUrl(el.dataset.imageUrl,el.dataset.id,el.dataset.room||""));
  $$("[data-clear-room-bg]").forEach(el=>el.onclick=()=>{setHomeImage(el.dataset.homeId,el.dataset.room,"");render()});
  $$("[data-clear-home-bg]").forEach(el=>el.onclick=()=>{setHomeBackground(el.dataset.clearHomeBg,"");render()});
  $$("[data-clear-place-interior-image]").forEach(el=>el.onclick=()=>{setPlaceInteriorImage(el.dataset.clearPlaceInteriorImage,"");render()});
  $$("[data-character-pane]").forEach(el=>el.onclick=()=>{setCharacterPane(el.dataset.characterPane);render()});
  $$("[data-setting]").forEach(el=>el.onchange=()=>{state[el.dataset.setting]=el.value;save(true);render()});
  $("[data-sync-upload]")?.addEventListener("click",()=>window.ParallelCityAuth?.upload());
  $("[data-sync-download]")?.addEventListener("click",()=>window.ParallelCityAuth?.download());
  $("[data-auth]")?.addEventListener("click",async()=>{
    const auth=window.ParallelCityAuth;if(!auth)return alert("계정 기능을 불러오는 중이에요.");
    const info=auth.getInfo?.();
    if(info?.user){if(confirm("Google 계정에서 로그아웃할까요?"))await auth.logout();}
    else await auth.login();
  });
  $("[data-cloud-upload]")?.addEventListener("click",async()=>window.ParallelCityAuth?.upload());
  $("[data-cloud-download]")?.addEventListener("click",async()=>window.ParallelCityAuth?.download());
  $$("[data-place-image]").forEach(button=>{
    const id=button.dataset.placeImage,place=state.world.places.find(item=>item.id===id),tools=button.closest(".place-photo-tools");
    const label=button.parentElement?.previousElementSibling;
    if(label)label.textContent="마을 지도용 건물 아이콘";
    if(button.parentElement)button.parentElement.innerHTML=`<small>현재 모든 건물에 공통 건물 아이콘이 적용됩니다.</small>`;
    tools?.querySelector('[data-image-url="place"]')?.remove();
  });
  $$("[data-place-field]").forEach(el=>{
    const apply=()=>{
      const field=el.dataset.placeField;
      const numeric=["imageScale","spicy","sweet"].includes(field);
      updatePlace(el.dataset.placeId,{[field]:numeric?Number(el.value):el.value},false);
      if(field==="type"){
        updatePlace(el.dataset.placeId,{subtype:""},false);
        save();
        render();
        return;
      }
      if(field==="imageScale"){
        const card=document.querySelector(`.place[data-place="${CSS.escape(el.dataset.placeId)}"]`);
        card?.style.setProperty("--place-scale",el.value);
      }
    };
    el.oninput=apply;el.onchange=apply;
  });
  $$("[data-place-audience]").forEach(el=>el.onclick=()=>{
    const p=state.world.places.find(x=>x.id===el.dataset.placeAudience);
    const value=el.dataset.value, current=p?.audiences||[];
    updatePlace(p.id,{audiences:current.includes(value)?current.filter(x=>x!==value):[...current,value]},false);
    render();
  });
  const worldBgSelect=$("[data-world-bg]");
  if(worldBgSelect)worldBgSelect.value=state.world.bg;
  worldBgSelect?.addEventListener("change",e=>{
    if(e.target.value.includes("department-store-premium")&&!window.ParallelCityAuth?.getInfo?.().entitlements?.backgroundPacks?.includes("department-store")){
      e.target.value=state.world.bg;
      showToast("구매한 계정에서 사용할 수 있는 백화점 배경입니다");
      return;
    }
    setWorldBackground(e.target.value);render();
  });
  $("[data-world-name]")?.addEventListener("input",e=>{state.world.name=e.target.value;save()});
  $("[data-world-era]")?.addEventListener("change",e=>{
    if(e.target.value==="medieval"&&!window.ParallelCityAuth?.getInfo?.().entitlements?.dlcPacks?.includes("medieval")){
      e.target.value=state.world.era||"modern";showToast("중세의 하루 DLC를 구매한 계정에서 사용할 수 있어요");return;
    }
    state.world.era=e.target.value;save(true);render();showToast(e.target.value==="medieval"?"이 마을에 중세 생활 스크립트가 적용됩니다":"이 마을을 현대 시대로 바꿨습니다");
  });
  $$("[data-town-select]").forEach(el=>el.onclick=()=>{switchTown(el.dataset.townSelect);render()});
  $("[data-add-town]")?.addEventListener("click",()=>{if(!addTown())showToast("마을은 최대 2개까지 만들 수 있어요");render()});
  $$("[data-delete-town]").forEach(el=>el.onclick=()=>{if(confirm("이 마을을 삭제할까요?")){deleteTown(el.dataset.deleteTown);render()}});
  $("[data-add-place]")?.addEventListener("click",()=>{addPlace();render()});
  const addPlaceButton=$("[data-add-place]");
  if(addPlaceButton&&state.world.places.length){
    const actions=document.createElement("div");actions.className="place-main-actions";
    actions.innerHTML=`<select aria-label="삭제할 건물">${state.world.places.map(place=>`<option value="${place.id}">${place.name}</option>`).join("")}</select><button type="button" class="danger">선택 건물 삭제</button>`;
    actions.querySelector("button").onclick=()=>{const id=actions.querySelector("select").value,place=state.world.places.find(item=>item.id===id);if(place&&confirm(`${place.name} 건물을 삭제할까요?`)){deletePlace(id);render()}};
    addPlaceButton.insertAdjacentElement("afterend",actions);
  }
  $$(".place-editor [data-delete-place]").forEach(button=>button.remove());
  $("[data-add-rel]")?.addEventListener("click",()=>openRelationDialog());
  $$("[data-edit-rel]").forEach(el=>el.onclick=()=>openRelationDialog(el.dataset.editRel));
  $$("[data-delete-rel]").forEach(el=>el.onclick=()=>{
    if(confirm("이 관계를 삭제할까요?")){deleteRelationship(el.dataset.deleteRel);render();explicitSave("관계 삭제")}
  });
  $$("[data-delete-group]").forEach(el=>el.onclick=()=>{
    if(!confirm("이 그룹 관계 전체를 삭제할까요?"))return;
    Object.values(state.relationships).filter(r=>r.groupId===el.dataset.deleteGroup).forEach(r=>deleteRelationship(r.id));
    render();explicitSave("그룹 관계 삭제");
  });
  $$("[data-routine-character]").forEach(el=>el.onclick=()=>{setActive(el.dataset.routineCharacter);render()});
  $("[data-add-routine]")?.addEventListener("click",()=>{const id=addRoutine(active().id);render();requestAnimationFrame(()=>openRoutineDialog(id))});
  $$("[data-edit-routine]").forEach(el=>el.onclick=()=>openRoutineDialog(el.dataset.editRoutine));
  $$("[data-delete-routine]").forEach(el=>el.onclick=()=>{deleteRoutine(active().id,el.dataset.deleteRoutine);render()});
  $("[data-export-file]")?.addEventListener("click",()=>{
    const blob=new Blob([JSON.stringify({format:"drawer-village-backup",version:1,exportedAt:new Date().toISOString(),gameState:cloneState()})],{type:"application/json"});
    const url=URL.createObjectURL(blob),link=document.createElement("a");
    link.href=url;link.download=`서랍마을-백업-${new Date().toISOString().slice(0,10)}.json`;
    document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    showToast("백업 파일을 내보냈습니다");
  });
  $("[data-import-file]")?.addEventListener("click",()=>{
    const input=document.createElement("input");input.type="file";input.accept=".json,application/json";
    input.onchange=async()=>{
      const file=input.files?.[0];if(!file)return;
      try{
        const parsed=JSON.parse(await file.text()),next=["drawer-village-backup","parallel-city-backup"].includes(parsed?.format)?parsed.gameState:parsed;
        if(!next||typeof next!=="object"||!next.characters)throw new Error("invalid-backup");
        window.ParallelCity.replaceState(next);showToast("백업 파일을 불러왔습니다");
      }catch(error){console.error(error);showToast("서랍마을 백업 파일을 확인해 주세요")}
    };
    input.click();
  });
  $("[data-guide-reset]")?.addEventListener("click",()=>{
    Object.keys(PAGE_GUIDES).forEach(tab=>localStorage.removeItem(`drawer-village-guide-${tab}`));
    showToast("페이지 안내를 다시 볼 수 있게 했어요");
    maybeShowPageGuide();
  });
  $("[data-reset]")?.addEventListener("click",()=>{if(confirm("모든 기기 저장 데이터를 지울까요?")){resetAll();render()}});
  if(state.activeTab==="town")bindPlaceDrag();
}

function applyImage(type,id,room,data){
  if(type==="room")setHomeImage(id,room,data);
  else if(type==="home")setHomeBackground(id,data);
  else if(type==="place")setPlaceImage(id,data);
  else if(type==="placeInterior")setPlaceInteriorImage(id,data);
  else if(type==="petPhoto")setPetImage(id,room,"photo",data);
  else if(type==="petIcon")setPetImage(id,room,"icon",data);
  else if(type==="car")updateCar(id,room,{image:data});
  else if(type==="catalogImage")updateCatalogItem(room,id,{image:data});
  else setCharacterImage(id,type,data);
}

async function useImageUrl(type,id,room){
  const value=await askImageUrl();
  if(!value)return;
  let resolved=value;
  try{
    resolved=await resolveSharedImageUrl(value);
    const url=new URL(resolved,location.href);
    if(!["http:","https:","data:"].includes(url.protocol))throw new Error();
    const response=await fetch(url.href,{mode:"cors"});
    if(!response.ok)throw new Error("image-download-failed");
    const blob=await response.blob();
    if(!blob.type.startsWith("image/"))throw new Error("not-an-image");
    const cropped=await cropImage(new File([blob],"linked-image",{type:blob.type}),type);
    if(!cropped)return;
    applyImage(type,id,room,cropped);
    render();
  }catch(error){
    console.error(error);
    const url=new URL(value,location.href);
    if(url.hostname==="share.google"){
      showToast("Google 공유 링크에서 원본 이미지를 찾지 못했어요. Google 이미지 결과 주소나 원본 이미지 주소를 넣어 주세요.");
      return;
    }
    if(/(^|\.)pinterest\.[a-z.]+$|(^|\.)pin\.it$/i.test(url.hostname)){
      if(resolved!==value){
        applyImage(type,id,room,resolved);
        render();
        showToast("이미지 주소로 사진을 추가했습니다");
        return;
      }
      showToast("직접 표시할 수 있는 이미지 주소를 입력해 주세요");
      return;
    }
    if(["http:","https:"].includes(url.protocol)){
      applyImage(type,id,room,url.href);
      render();
      showToast("원본 링크로 추가했습니다 · 이 주소는 자르기를 지원하지 않아요");
      return;
    }
    showToast("이미지 주소를 확인해 주세요");
  }
}

async function resolveSharedImageUrl(value){
  const url=new URL(value,location.href);
  if(url.hostname==="www.google.com"&&url.pathname==="/imgres"&&url.searchParams.get("imgurl"))return url.searchParams.get("imgurl");
  if(url.hostname==="share.google"){
    try{
      const response=await fetch(`https://api.microlink.io?url=${encodeURIComponent(url.href)}`,{mode:"cors"});
      if(response.ok){
        const payload=await response.json(),finalUrl=payload?.data?.url||"";
        if(payload?.data?.image?.url)return payload.data.image.url;
        if(finalUrl){
          const final=new URL(finalUrl);
          if(final.hostname==="www.google.com"&&final.pathname==="/imgres"&&final.searchParams.get("imgurl"))return final.searchParams.get("imgurl");
        }
      }
    }catch{}
    throw new Error("google-share-image-unavailable");
  }
  if(!/(^|\.)pinterest\.[a-z.]+$|(^|\.)pin\.it$/i.test(url.hostname))return url.href;
  try{
    const reader=await fetch(`https://r.jina.ai/http://${url.host}${url.pathname}${url.search}`,{mode:"cors"});
    if(reader.ok){
      const text=await reader.text(),match=text.match(/https:\/\/i\.pinimg\.com\/[^\s)"']+/i);
      if(match)return match[0].replace(/\\u002F/g,"/");
    }
  }catch{}
  try{
    const response=await fetch(`https://api.microlink.io?url=${encodeURIComponent(url.href)}`,{mode:"cors"});
    if(response.ok){
      const payload=await response.json();
      const image=payload?.data?.image?.url||payload?.data?.logo?.url;
      if(image)return image;
    }
  }catch{}
  const endpoints=[
    `https://www.pinterest.com/oembed.json?url=${encodeURIComponent(url.href)}`,
    `https://www.pinterest.com/oembed/?url=${encodeURIComponent(url.href)}`,
    `https://noembed.com/embed?url=${encodeURIComponent(url.href)}`
  ];
  for(const endpoint of endpoints){
    try{
      const response=await fetch(endpoint,{mode:"cors"});
      if(!response.ok)continue;
      const data=await response.json();
      const image=data.thumbnail_url||data.image_url||data.media_url;
      if(image)return new URL(image,url.href).href.replace(/\/(236x|474x|564x|736x)\//,"/originals/");
    }catch{}
  }
  throw new Error("pinterest-pin-unavailable");
}

function askImageUrl(){
  return new Promise(resolve=>{
    const dialog=document.createElement("dialog");
    dialog.className="image-url-dialog";
    dialog.innerHTML=`<form><div class="title"><h2>이미지 주소로 사진 추가</h2><button type="button" data-image-url-cancel aria-label="닫기">×</button></div><label>이미지 파일 주소<input name="url" type="url" placeholder="https://.../photo.jpg" required></label><small>웹페이지 주소가 아니라 주소 끝이 jpg, png, webp 등으로 끝나는 실제 이미지 주소를 넣어 주세요.</small><div class="crop-actions"><button type="button" data-image-url-cancel>취소</button><button class="primary" type="submit">사진 불러오기</button></div></form>`;
    document.body.append(dialog);
    dialog.onclose=()=>{
      const value=dialog.returnValue==="apply"?dialog.querySelector('[name="url"]').value.trim():"";
      dialog.remove();resolve(value);
    };
    dialog.querySelectorAll("[data-image-url-cancel]").forEach(button=>button.onclick=()=>dialog.close("cancel"));
    dialog.querySelector("form").onsubmit=event=>{
      event.preventDefault();
      dialog.close("apply");
    };
    dialog.showModal();
  });
}

function pickImage(type,id,room=""){
  pendingImage={type,id,room};
  $("#image-picker").click();
}

$("#image-picker").onchange=async e=>{
  const file=e.target.files?.[0], task=pendingImage;
  e.target.value="";
  if(!file||!task)return;
  try{
    const data=await cropImage(file,task.type);
    if(!data)return;
    applyImage(task.type,task.id,task.room,data);
    render();
  }catch(err){
    console.error(err);
    alert("사진을 저장하지 못했어요. 다른 사진으로 다시 시도해 주세요.");
  }
};

function cropImage(file,type){
  const ratios={photo:4/5,icon:1,petIcon:1,petPhoto:4/3,catalogImage:4/3,room:16/9,home:16/9,place:1,placeInterior:16/9};
  const ratio=ratios[type]||16/9;
  const output=ratio<1?600:ratio===1?500:800;
  return new Promise((resolve,reject)=>{
    const url=URL.createObjectURL(file),img=new Image();
    img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error("image-load-failed"))};
    img.onload=()=>{
      const dialog=document.createElement("dialog");
      dialog.className="crop-dialog";
      dialog.innerHTML=`<form method="dialog"><div class="title"><h2>사진 자르기</h2><button value="cancel" aria-label="닫기">×</button></div><div class="crop-stage" style="aspect-ratio:${ratio}"><canvas></canvas><div class="crop-guide">사진을 직접 드래그해서 위치를 맞추세요</div></div><label>확대<input name="zoom" type="range" min="1" max="3" step=".01" value="1"></label><small>사진 위를 손가락이나 마우스로 끌어 원하는 부분을 화면 가운데에 놓을 수 있어요.</small><div class="crop-actions"><button value="cancel">취소</button><button class="primary" value="apply">이대로 자르기</button></div></form>`;
      document.body.append(dialog);
      const canvas=dialog.querySelector("canvas"),ctx=canvas.getContext("2d");
      canvas.width=output;canvas.height=Math.round(output/ratio);
      let offsetX=0,offsetY=0,startX=0,startY=0,startOffsetX=0,startOffsetY=0;
      const draw=()=>{
        const zoom=Number(dialog.querySelector('[name="zoom"]').value);
        const cover=Math.max(canvas.width/img.width,canvas.height/img.height)*zoom;
        const w=img.width*cover,h=img.height*cover;
        const maxX=Math.max(0,(w-canvas.width)/2),maxY=Math.max(0,(h-canvas.height)/2);
        offsetX=Math.max(-maxX,Math.min(maxX,offsetX));offsetY=Math.max(-maxY,Math.min(maxY,offsetY));
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(img,(canvas.width-w)/2+offsetX,(canvas.height-h)/2+offsetY,w,h);
      };
      dialog.querySelector('[name="zoom"]').oninput=draw;
      const stage=dialog.querySelector(".crop-stage");
      stage.onpointerdown=e=>{stage.setPointerCapture(e.pointerId);startX=e.clientX;startY=e.clientY;startOffsetX=offsetX;startOffsetY=offsetY;stage.classList.add("dragging")};
      stage.onpointermove=e=>{if(!stage.hasPointerCapture(e.pointerId))return;const scale=canvas.width/stage.clientWidth;offsetX=startOffsetX+(e.clientX-startX)*scale;offsetY=startOffsetY+(e.clientY-startY)*scale;draw()};
      stage.onpointerup=e=>{stage.releasePointerCapture(e.pointerId);stage.classList.remove("dragging")};
      dialog.onclose=()=>{
        const applied=dialog.returnValue==="apply";
        const transparent=["icon","petIcon"].includes(type);
        const data=applied?canvas.toDataURL("image/webp",transparent ? .78 : .66):null;
        URL.revokeObjectURL(url);dialog.remove();resolve(data);
      };
      draw();dialog.showModal();
    };
    img.src=url;
  });
}

function focusCharacter(id){
  setActive(id);
  const e=eventFor(state.characters[id]);
  if(e.home){
    state.activeTab="home";
    state.activeHomeId=state.characters[id].homeId||id;
    save();
    render();
    requestAnimationFrame(()=>focusHomeCharacter(id));
    return;
  }
  if(e.townId&&e.townId!==state.activeTownId)switchTown(e.townId);
  render();
  requestAnimationFrame(()=>{
    const marker=document.querySelector(`[data-person="${CSS.escape(id)}"]`);
    marker?.scrollIntoView({behavior:"smooth",block:"center",inline:"center"});
  });
}

function focusHomeCharacter(id){
  setActive(id);
  state.activeHomeId=state.characters[id]?.homeId||id;
  if(state.activeTab!=="home")state.activeTab="home";
  save();
  render();
  requestAnimationFrame(()=>{
    const marker=document.querySelector(`[data-home-person="${CSS.escape(id)}"]`);
    marker?.scrollIntoView({behavior:"smooth",block:"center",inline:"center"});
  });
}

function openRoutineDialog(id){
  const c=active(),item=state.routines[c.id]?.find(r=>r.id===id);if(!item)return;
  const places=state.towns.flatMap(t=>(t.id===state.activeTownId?state.world.places:t.places).map(p=>({...p,townName:t.name})));
  const dialog=document.createElement("dialog");dialog.className="relation-dialog routine-dialog";
  dialog.innerHTML=`<form method="dialog"><h2>주간 일정 편집</h2>
    <label>요일<select name="day">${["일","월","화","수","목","금","토"].map((day,index)=>`<option value="${index}" ${item.day===index?"selected":""}>${day}요일</option>`).join("")}</select></label>
    <label>시작 시각<input type="time" name="start" value="${item.start}"></label>
    <label>종료 시각<input type="time" name="end" value="${item.end}"></label>
    <label>일정 종류<select name="type">${["회사 일정","수업","데이트","친구 약속","가족 일정","병원","운동","취미","개인 일정","휴식"].map(type=>`<option ${item.type===type?"selected":""}>${type}</option>`).join("")}</select></label>
    <label>일정 이름<input name="title" value="${item.title.replace(/"/g,"&quot;")}"></label>
    <label>장소<select name="placeId"><option value="">집 또는 자동 선택</option>${places.map(p=>`<option value="${p.id}" ${item.placeId===p.id?"selected":""}>${p.townName} · ${p.name}</option>`).join("")}</select></label>
    <fieldset class="group-members"><legend>함께하는 캐릭터</legend>${state.order.filter(id=>id!==c.id).map(cid=>`<label><input type="checkbox" name="withId" value="${cid}" ${(item.withIds||[]).includes(cid)?"checked":""}> ${state.characters[cid].name}</label>`).join("")}</fieldset>
    <label>메모<textarea name="notes">${item.notes||""}</textarea></label>
    <div><button value="cancel">취소</button><button class="primary" value="save">저장</button></div></form>`;
  document.body.append(dialog);
  dialog.onclose=()=>{
    if(dialog.returnValue==="save")updateRoutine(c.id,id,{day:Number(dialog.querySelector("[name=day]").value),start:dialog.querySelector("[name=start]").value,end:dialog.querySelector("[name=end]").value,type:dialog.querySelector("[name=type]").value,title:dialog.querySelector("[name=title]").value.trim()||"일정",placeId:dialog.querySelector("[name=placeId]").value,withIds:[...dialog.querySelectorAll("[name=withId]:checked")].map(x=>x.value),notes:dialog.querySelector("[name=notes]").value.trim()});
    dialog.remove();render();
  };
  dialog.showModal();
}

const RELATION_TYPES=["친구","연인","부부","부모·자녀","가족","소꿉친구","학창 시절 친구들","젊은 날의 친구들","친구 모임","산악회","동아리 동료","직장 동료","짝사랑","라이벌","혐관","기타"];
const RELATION_STAGES={
  연인:["이별 통보 직전","마음이 멀어지는 중","위태로운 사이","서로 알아가는 중","편안한 연인","서로를 깊이 사랑함","운명의 상대"],
  부부:["이혼 서류가 오가는 중","별거를 고민하는 중","권태기","생활 동반자","애정이 깊은 부부","서로 없이는 못 사는 사이","운명의 상대"],
  친구:["거의 안 친함","어색한 사이","가끔 연락함","편한 친구","가까운 친구","아주 가까운 친구","베스트 프렌드"],
  혐관:["원수지간","마주치면 싸움","서로 못마땅함","신경전 중","경쟁하며 의식함","티격태격함"],
  짝사랑:["포기하려는 중","마음을 숨기는 중","멀리서 바라봄","조심스럽게 다가가는 중","감정이 깊어짐","고백을 결심함"],
  가족:["연락을 끊다시피 함","서먹한 가족","필요할 때 연락함","무난한 가족","서로 챙기는 가족","각별한 가족"],
  "부모·자녀":["연락이 끊긴 사이","서먹한 부모와 자녀","필요할 때만 연락함","무난한 부모와 자녀","서로 의지하는 가족","무척 각별한 부모와 자녀"],
  default:["매우 불편함","서먹함","조금 가까움","편안함","가까움","매우 가까움"]
};
const RELATION_INTERACTION_GROUPS={
  "일상·돌봄":["아침 안부 묻기","잘 자라고 인사하기","병원 같이 가기","데려다주기","마중 나가기","격려하기","고민 들어주기","조언하기","편들어주기","밥 챙겨주기","간식 나눠 먹기","함께 요리하기","같이 장보기","집안일 나누기","서로의 일정 챙기기","아플 때 돌보기","밤새 간호하기","공부 도와주기","업무 도와주기","함께 사는 존재 돌보기"],
  "로맨스·애정":["데이트하기","여행하기","기념일 챙기기","스킨십하기","포옹하기","손잡기","머리 쓰다듬기","선물하기","연락 자주 하기"],
  "우정·놀이":["비밀 공유하기","산책하기","운동하기","취미 함께하기","장난치기","놀리기","게임 대결하기","술자리 함께하기","가족 행사 참석하기"],
  "경쟁·모험":["결투하기","훈련하기","내기하기","경쟁하기","구해주기","위험에서 보호하기","함께 사건 조사하기","작전 짜기"],
  "갈등·통제":["간섭하기","잔소리하기","말다툼하기","화해하기","사과하기","험담 나누기","무시하기","감시하기"]
};
const stagesFor=type=>RELATION_STAGES[type]||(["소꿉친구","학창 시절 친구들","젊은 날의 친구들","친구 모임","산악회"].includes(type)?RELATION_STAGES.친구:RELATION_STAGES.default);
function openRelationDialog(id=""){
  if(state.order.length<2)return alert("캐릭터가 두 명 이상 필요해요.");
  const old=id?state.relationships[id]:null,dialog=document.createElement("dialog");dialog.className="relation-dialog relation-editor-dialog";
  const oldMembers=old?.groupMembers?.length?old.groupMembers:[old?.a,old?.b].filter(Boolean);
  const characterChecks=(name,selected=[])=>state.order.map(cid=>`<label class="relation-character-chip"><input type="checkbox" name="${name}" value="${cid}" ${selected.includes(cid)?"checked":""}> ${state.characters[cid].name}</label>`).join("");
  dialog.innerHTML=`<form method="dialog"><div class="title"><div><h2>${old?"관계 편집":"관계 추가"}</h2><small>숫자 대신 관계의 현재 단계를 골라 주세요.</small></div><button value="cancel">×</button></div>
    <fieldset class="relation-member-picker"><legend>관계에 포함할 캐릭터 · 두 명 이상</legend><div>${characterChecks("member",oldMembers.length?oldMembers:[state.activeId,state.order.find(cid=>cid!==state.activeId)].filter(Boolean))}</div><small>여기서 바로 캐릭터를 더하거나 뺄 수 있어요. 여러 명의 연인·부부 관계도 가능해요.</small></fieldset>
    <section class="relation-order-control"><b>두 명 관계 카드의 표시 순서</b><span data-relation-order-label></span><button type="button" data-swap-relation-order>↔ 좌우 바꾸기</button><small>예: 리바이 × 안테와 안테 × 리바이 중 원하는 배치를 선택해요.</small></section>
    <fieldset class="crush-direction" hidden><legend>짝사랑의 방향</legend><div class="crush-columns"><section><b>마음을 가진 사람 · 여러 명 가능</b><div>${characterChecks("admirer",old?.admirerId?[old.admirerId]:[])}</div></section><span>→</span><section><b>짝사랑 대상 · 여러 명 가능</b><div>${characterChecks("target",old?.targetId?[old.targetId]:[])}</div></section></div></fieldset>
    <fieldset class="parent-direction" hidden><legend>부모와 자녀 지정</legend><div class="parent-columns"><section><b>엄마 역할 · 여러 명 가능</b><div>${characterChecks("mother",old?.parentRole==="엄마"?[old.parentId||old.a]:[])}</div></section><section><b>아빠 역할 · 여러 명 가능</b><div>${characterChecks("father",old?.parentRole==="아빠"?[old.parentId||old.a]:[])}</div></section><span>→</span><section><b>자녀 · 여러 명 가능</b><div>${characterChecks("child",old?.childId?[old.childId]:[])}</div></section></div><small>엄마 두 명, 아빠 두 명, 엄마와 아빠 등 원하는 가족 구성이 모두 가능해요.</small></fieldset>
    <label>관계 종류<select name="type">${RELATION_TYPES.map(type=>`<option>${type}</option>`).join("")}</select></label>
    <label>현재 관계 단계<select name="stage"></select></label>
    <label class="cohabit"><input type="checkbox" name="cohabit"> 함께 살기</label>
    <section class="relation-interaction-picker"><div class="relation-interaction-title"><h3>이 관계에서 자주 일어나는 행동</h3><button type="button" data-interaction-all>모두 선택</button><button type="button" data-interaction-clear>모두 해제</button></div>${Object.entries(RELATION_INTERACTION_GROUPS).map(([group,values])=>`<details open><summary><b>${group}</b><span><button type="button" data-group-all="${group}">전체 선택</button><button type="button" data-group-clear="${group}">해제</button></span></summary><div>${values.map(value=>`<button type="button" data-relation-interaction="${value}" data-interaction-group="${group}" class="${(old?.interactions||[]).includes(value)?"on":""}">${value}</button>`).join("")}</div></details>`).join("")}</section>
    <p class="hint">선택한 행동과 관계 단계가 생활 로그와 상호작용 대사에 반영돼요. 여러 명을 함께 선택해도 모두 같은 관계 종류로 저장돼요.</p>
    <div><button value="cancel">취소</button><button class="primary" value="save">저장</button></div>
  </form>`;
  const allInteractionValues=Object.values(RELATION_INTERACTION_GROUPS).flat();
  document.body.append(dialog);const f=dialog.querySelector("form"),selectedInteractions=new Set(old?.interactionsAll?allInteractionValues:(old?.interactions||[]));
  let pairOrder=Array.isArray(old?.displayOrder)&&old.displayOrder.length===2?old.displayOrder:[old?.a,old?.b].filter(Boolean);
  if(pairOrder.length!==2)pairOrder=oldMembers.slice(0,2);
  const checkedMembers=()=>[...f.querySelectorAll('[name="member"]:checked')].map(input=>input.value);
  const syncPairOrder=()=>{
    const selected=checkedMembers();
    if(selected.length===2&&!selected.every(member=>pairOrder.includes(member)))pairOrder=[...selected];
    if(selected.length===2&&(pairOrder.length!==2||!pairOrder.every(member=>selected.includes(member))))pairOrder=[...selected];
    f.querySelector(".relation-order-control").hidden=selected.length!==2||["짝사랑","부모·자녀"].includes(f.type.value);
    f.querySelector("[data-relation-order-label]").textContent=selected.length===2?`${state.characters[pairOrder[0]]?.name||""} × ${state.characters[pairOrder[1]]?.name||""}`:"두 명을 선택하면 순서를 바꿀 수 있어요.";
  };
  const refreshStages=()=>{const values=stagesFor(f.type.value),selected=old?.stage&&values.includes(old.stage)?old.stage:values[Math.floor(values.length/2)];f.stage.innerHTML=values.map(value=>`<option ${value===selected?"selected":""}>${value}</option>`).join("")};
  const syncButtons=()=>f.querySelectorAll("[data-relation-interaction]").forEach(button=>button.classList.toggle("on",selectedInteractions.has(button.dataset.relationInteraction)));
  const setValues=(values,on)=>{values.forEach(value=>on?selectedInteractions.add(value):selectedInteractions.delete(value));syncButtons()};
  const updateType=()=>{refreshStages();const crush=f.type.value==="짝사랑",parent=f.type.value==="부모·자녀";f.querySelector(".crush-direction").hidden=!crush;f.querySelector(".parent-direction").hidden=!parent;f.querySelector(".relation-member-picker").hidden=crush||parent;syncPairOrder()};
  f.type.value=old?.type==="폴리 관계"?"연인":old?.type==="절친"?"친구":old?.type==="대학 동기"?"젊은 날의 친구들":old?.type||"친구";updateType();f.type.onchange=updateType;f.cohabit.checked=Boolean(old?.cohabit);
  f.querySelectorAll('[name="member"]').forEach(input=>input.onchange=syncPairOrder);
  f.querySelector("[data-swap-relation-order]").onclick=()=>{if(pairOrder.length===2){pairOrder.reverse();syncPairOrder()}};
  f.querySelectorAll("[data-relation-interaction]").forEach(button=>button.onclick=()=>{const value=button.dataset.relationInteraction;selectedInteractions.has(value)?selectedInteractions.delete(value):selectedInteractions.add(value);syncButtons()});
  f.querySelector("[data-interaction-all]").onclick=()=>setValues(Object.values(RELATION_INTERACTION_GROUPS).flat(),true);
  f.querySelector("[data-interaction-clear]").onclick=()=>setValues([...selectedInteractions],false);
  f.querySelectorAll("[data-group-all]").forEach(button=>button.onclick=()=>setValues(RELATION_INTERACTION_GROUPS[button.dataset.groupAll],true));
  f.querySelectorAll("[data-group-clear]").forEach(button=>button.onclick=()=>setValues(RELATION_INTERACTION_GROUPS[button.dataset.groupClear],false));
  dialog.onclose=()=>{
    if(dialog.returnValue==="save"){
      const members=checkedMembers();
      const admirers=[...f.querySelectorAll('[name="admirer"]:checked')].map(input=>input.value),targets=[...f.querySelectorAll('[name="target"]:checked')].map(input=>input.value);
      const directionalPairs=f.type.value==="짝사랑"?admirers.flatMap(a=>targets.filter(b=>b!==a).map(b=>[a,b])):[];
      const mothers=[...f.querySelectorAll('[name="mother"]:checked')].map(input=>input.value),fathers=[...f.querySelectorAll('[name="father"]:checked')].map(input=>input.value),children=[...f.querySelectorAll('[name="child"]:checked')].map(input=>input.value);
      const parentPairs=f.type.value==="부모·자녀"?[...mothers.map(id=>[id,"엄마"]),...fathers.map(id=>[id,"아빠"])].flatMap(([parent,role])=>children.filter(child=>child!==parent).map(child=>[parent,child,role])):[];
      if(f.type.value==="짝사랑"&&!directionalPairs.length)alert("마음을 가진 사람과 짝사랑 대상을 한 명 이상씩 골라 주세요.");
      else if(f.type.value==="부모·자녀"&&!parentPairs.length)alert("엄마 또는 아빠와 자녀를 한 명 이상씩 골라 주세요.");
      else if(!["짝사랑","부모·자녀"].includes(f.type.value)&&members.length<2)alert("관계에 포함할 캐릭터를 두 명 이상 골라 주세요.");
      else{
        const levels=stagesFor(f.type.value),index=Math.max(0,levels.indexOf(f.stage.value)),ratio=levels.length<=1?1:index/(levels.length-1);
        const hostile=f.type.value==="혐관",base={type:f.type.value,stage:f.stage.value,interactions:[...selectedInteractions],interactionsAll:selectedInteractions.size===allInteractionValues.length,cohabit:f.cohabit.checked,intimacy:hostile?Math.round(35+ratio*30):Math.round(ratio*100),conflict:hostile?Math.round(100-ratio*55):Math.round((1-ratio)*75),updatedAt:Date.now()};
        if(old?.groupId)Object.values(state.relationships).filter(r=>r.groupId===old.groupId).forEach(r=>deleteRelationship(r.id));
        else if(old&&(["짝사랑","부모·자녀"].includes(f.type.value)||members.length!==2))deleteRelationship(id);
        if(f.type.value==="짝사랑"){
          const groupId=directionalPairs.length>1?`crush-${Date.now()}`:"";
          directionalPairs.forEach(([a,b])=>addRelationship({...base,a,b,admirerId:a,targetId:b,directional:true,groupId,groupMembers:[...new Set([...admirers,...targets])]}));
        }else if(f.type.value==="부모·자녀"){
          const groupId=parentPairs.length>1?`family-${Date.now()}`:"";
          parentPairs.forEach(([parent,child,parentRole])=>addRelationship({...base,a:parent,b:child,parentId:parent,childId:child,parentRole,directional:true,groupId,groupMembers:[...new Set([...mothers,...fathers,...children])]}));
        }else if(members.length===2){
          const ordered=pairOrder.length===2&&pairOrder.every(member=>members.includes(member))?pairOrder:members;
          const patch={...base,a:ordered[0],b:ordered[1],displayOrder:[...ordered],directional:false,groupId:"",groupMembers:[]};
          old?updateRelationship(id,patch):addRelationship(patch);
        }
        else{
          const groupId=`group-${members.slice().sort().join("-")}-${Date.now()}`;
          for(let i=0;i<members.length;i++)for(let j=i+1;j<members.length;j++)addRelationship({...base,a:members[i],b:members[j],groupId,groupMembers:members});
        }
        render();explicitSave("관계 저장");
      }
    }
    dialog.remove();
  };
  dialog.showModal();
}

function bindPlaceDrag(){
  $$(".town-edit .place").forEach(el=>el.onpointerdown=e=>{
    e.preventDefault();
    const startRect=el.getBoundingClientRect();
    const grabX=(e.clientX-(startRect.left+startRect.width/2))/startRect.width;
    const grabY=(e.clientY-(startRect.top+startRect.height/2))/startRect.height;
    el.setPointerCapture(e.pointerId);
    el.classList.add("dragging");
    el.onpointermove=ev=>{
      const box=el.parentElement.getBoundingClientRect();
      const currentRect=el.getBoundingClientRect();
      movePlace(el.dataset.place,
        Math.max(4,Math.min(96,(ev.clientX-grabX*currentRect.width-box.left)/box.width*100)),
        Math.max(5,Math.min(95,(ev.clientY-grabY*currentRect.height-box.top)/box.height*100)),false);
      const p=state.world.places.find(x=>x.id===el.dataset.place);
      el.style.left=p.x+"%";el.style.top=p.y+"%";
    };
    const finish=()=>{el.onpointermove=null;el.classList.remove("dragging");save()};
    el.onpointerup=finish;el.onpointercancel=finish;
  });
}

window.ParallelCity={
  getState:cloneState,
  replaceState:x=>{
    const view={activeTab:state.activeTab,characterPane:state.characterPane,activeId:state.activeId,activeHomeId:state.activeHomeId,activeTownId:state.activeTownId};
    replaceState(x);
    state.activeTab=view.activeTab;
    state.characterPane=view.characterPane;
    if(state.characters[view.activeId])state.activeId=view.activeId;
    if(state.homes[view.activeHomeId])state.activeHomeId=view.activeHomeId;
    if(state.towns.some(t=>t.id===view.activeTownId)){state.activeTownId=view.activeTownId;state.world=JSON.parse(JSON.stringify(state.towns.find(t=>t.id===view.activeTownId)))}
    save(true);render();
  },
  setAccountStatus:t=>setAccountLabel(t),
  setEntitlements:value=>{setAccountEntitlements(value);render()},
  toast:showToast,
  mediaChanged:()=>render()
};

window.addEventListener("drawer-village-cloud-loaded",render);
window.addEventListener("drawer-village-storage-usage",()=>{if(state.activeTab==="settings")render()});
window.addEventListener("drawer-village-premium-ending",event=>{
  const until=Number(event.detail?.premiumUntil)||0,key=`drawer-village-premium-ending-${until}`;
  if(!until||sessionStorage.getItem(key))return;
  sessionStorage.setItem(key,"1");
  const date=new Date(until).toLocaleDateString("ko-KR",{year:"numeric",month:"long",day:"numeric"});
  alert(`프리미엄 이용이 ${date}에 종료될 예정이에요.\n\n종료일까지는 사진과 캐릭터를 무제한으로 사용할 수 있습니다. 종료 후에는 일반회원 한도(캐릭터 7명·사진 20MB)가 적용되며, 초과 슬롯과 사진은 삭제 대상이 됩니다. 필요한 데이터는 종료 전에 백업 파일로 내보내 주세요.`);
});
window.addEventListener("parallel-city-cloud-loaded",render);
window.addEventListener("beforeinstallprompt",event=>{event.preventDefault();deferredInstallPrompt=event;showInstallButton()});
window.addEventListener("appinstalled",()=>{deferredInstallPrompt=null;document.querySelector("#install-drawer-village")?.remove();showToast("서랍마을 앱이 설치되었습니다")});
setInterval(()=>{if(["observe","home"].includes(state.activeTab))render()},60000);
render();
showInstallButton();
if(localStorage.getItem("drawer-village-hide-photo-backup-notice")!=="1"&&localStorage.getItem("parallel-city-hide-photo-backup-notice")!=="1"){
  const notice=document.createElement("dialog");notice.className="backup-notice";
  notice.innerHTML=`<form method="dialog"><h2>사진 보관 안내</h2><p>사진 파일을 직접 올리면 Google 저장 공간에 함께 보관돼요. 용량을 아끼고 싶다면 사진 파일 대신 <b>웹에 공개된 이미지 주소</b>를 입력해 주세요. 일반회원은 직접 올린 사진을 <b>최대 120장·총 20MB</b>까지 저장할 수 있고, 같은 사진은 중복으로 올리지 않아요. 현재 사용량은 설정에서 확인할 수 있습니다.</p><label><input type="checkbox" name="hide"> 다시는 보지 않기</label><button class="primary" value="ok">알겠어요</button></form>`;
  notice.onclose=()=>{if(notice.querySelector('[name="hide"]')?.checked)localStorage.setItem("drawer-village-hide-photo-backup-notice","1");notice.remove()};
  document.body.append(notice);notice.showModal();
}
import("./auth.js?v=20260803bd").catch(error=>{
  console.warn("로그인 기능을 불러오지 못했지만 게임은 계속 실행됩니다.",error);
  setAccountLabel("Google 로그인");
});
if("serviceWorker" in navigator){
  navigator.serviceWorker.register("./sw.js?v=20260803be").catch(error=>console.warn("오프라인 업데이트 준비 실패",error));
}
const lockPortrait=()=>screen.orientation?.lock?.("portrait").catch(()=>{});
if(matchMedia("(display-mode: standalone)").matches||navigator.standalone)lockPortrait();
window.addEventListener("orientationchange",lockPortrait);





