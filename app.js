import {state, active, save, replaceState, createCharacter, deleteCharacter, setActive, setActiveHome, updateCharacter, toggleChip, addRelationship, updateRelationship, deleteRelationship, setHomeImage, setHomeBackground, setPlaceInteriorImage, setCharacterImage, setWorldBackground, addPlace, deletePlace, movePlace, updatePlace, resetAll, cloneState, setHomeEditMode, updateHome, updateRoom, addRoom, setRoomType, deleteRoom, addPet, updatePet, deletePet, setPetImage, toggleFurniture, setHomeResidents, moveCharacter, addCatalogItem, updateCatalogItem, deleteCatalogItem, toggleFavorite, toggleOwned, togglePlaceStock, setCharacterPane, addTown, switchTown, deleteTown} from "./state.js?v=20260805a";
import {eventFor} from "./simulation.js?v=20260805a";
import {renderApp, setAccountLabel, setAccountEntitlements} from "./views.js?v=20260805a";

let pendingImage=null;
let deferredInstallPrompt=null;
const guidePending=new Set();
const PAGE_GUIDES={
  observe:["관찰","캐릭터가 지금 어디에서 무엇을 하는지 볼 수 있어요. 위쪽에서 캐릭터와 마을을 바꾸고, 아래 생활로그에서 오늘의 흐름을 확인해 보세요."],
  home:["집","방마다 누가 무엇을 하는지 보고, 집 편집에서 방 사진·동거인·함께 사는 존재·자동차를 설정할 수 있어요."],
  character:["캐릭터","프로필과 성격, 취향을 설정하면 생활 장면과 대사가 달라져요. 기본 캐릭터 슬롯은 7명이며 상점에서 더 늘릴 수 있어요."],
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
const purchases=()=>window.ParallelCityAuth?.getInfo?.().entitlements||{};
const characterLimit=()=>7+(Math.max(0,Number(purchases().characterSlotPacks)||0)*5);
const townLimit=()=>2+Math.max(0,Number(purchases().townSlotPacks)||0);
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
const FALLBACK_BUILDING_SHAPES=[
  {id:"type-generic",name:"기본 건물",src:"world-assets/building-types/generic.png",types:["기타","쇼핑몰"]},
  {id:"type-cafe",name:"카페",src:"world-assets/building-types/cafe.png",types:["카페"]},
  {id:"type-restaurant",name:"음식점",src:"world-assets/building-types/restaurant.png",types:["음식점"]},
  {id:"type-hospital",name:"병원",src:"world-assets/building-types/hospital.png",types:["병원"]},
  {id:"type-office",name:"사무실·관공서",src:"world-assets/building-types/office.png",types:["사무실","관공서"]},
  {id:"type-shop",name:"옷가게·상점",src:"world-assets/building-types/shop.png",types:["옷가게","쇼핑몰"]},
  {id:"type-school",name:"학교",src:"world-assets/building-types/school.png",types:["학교"]},
  {id:"type-lodging",name:"숙박·여관",src:"world-assets/building-types/lodging.png",types:["숙박"]},
  {id:"type-library",name:"도서관",src:"world-assets/building-types/library.png",types:["도서관"]},
  {id:"type-theater",name:"공연장",src:"world-assets/building-types/theater.png",types:["공연장"]},
  {id:"type-park",name:"공원",src:"world-assets/building-types/park.png",types:["공원"]},
  {id:"type-home",name:"작은 집",src:"world-assets/building-types/home.png",types:[]},
  {id:"drawer-building",name:"쌍둥이 서랍 건물",src:"world-assets/drawer-building.png"},
  {id:"drawer-home",name:"빨간 지붕 건물",src:"world-assets/drawer-home.png"},
  {id:"medieval-castle",name:"중세 성채",src:"world-assets/medieval-castle.svg"},
  {id:"medieval-tavern",name:"중세 여관",src:"world-assets/medieval-tavern.svg"},
  {id:"medieval-market",name:"중세 시장",src:"world-assets/medieval-market.svg"}
];
const parseBuildingShapeCatalog=text=>text.trim().split(/\r?\n/).slice(1).map(line=>{
  const [id,name,src,types="",features=""]=line.split(",");
  return {id:id?.trim(),name:name?.trim(),src:src?.trim(),types:types.split("|").map(value=>value.trim()).filter(Boolean),features:features.split("|").map(value=>value.trim()).filter(Boolean)};
}).filter(shape=>shape.id&&shape.src);
const catalogBuildingShapes=await fetch("./world-assets/building-shapes.csv",{cache:"no-cache"})
  .then(response=>response.ok?response.text():Promise.reject(new Error("building catalog unavailable")))
  .then(parseBuildingShapeCatalog)
  .catch(()=>FALLBACK_BUILDING_SHAPES);
const BUILDING_SHAPES=[...catalogBuildingShapes,...(state.buildingShapes||[]).filter(custom=>!catalogBuildingShapes.some(shape=>shape.id===custom.id))];
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
  const recommended=BUILDING_SHAPES.filter(shape=>shape.types?.includes(place.type));
  const ordered=[...recommended,...BUILDING_SHAPES.filter(shape=>!recommended.includes(shape))];
  dialog.innerHTML=`<form method="dialog"><div class="title"><div><h2>건물 모양 선택</h2><small><b>${place.type}</b> 유형에 어울리는 모양을 먼저 보여드려요. 보유한 건물 아이콘 팩의 그림도 이곳에 나타나요.</small></div><button value="cancel">×</button></div><div class="building-shape-dex">${ordered.map(shape=>`<button type="button" data-building-shape="${shape.id}" class="${place.iconPreset===shape.id?"on":""} ${recommended.includes(shape)?"recommended":""}"><span>${recommended.includes(shape)?"이 유형 추천":""}</span><img src="${shape.src}" alt=""><b>${shape.name}</b>${shape.features?.length?`<small>${shape.features.join(" · ")}</small>`:""}</button>`).join("")}</div></form>`;
  dialog.querySelectorAll("[data-building-shape]").forEach(button=>button.onclick=()=>{
    if(button.dataset.buildingShape.startsWith("medieval-")&&!window.ParallelCityAuth?.getInfo?.().entitlements?.dlcPacks?.includes("medieval")){showToast("중세 건물 모양은 중세의 하루 DLC에 포함돼요");return}
    const shape=BUILDING_SHAPES.find(item=>item.id===button.dataset.buildingShape);
    updatePlace(placeId,{iconPreset:button.dataset.buildingShape,image:""},true);dialog.close();render();showToast("건물 모양을 바꿨습니다");
  });
  dialog.onclose=()=>dialog.remove();document.body.append(dialog);dialog.showModal();
}
const APPEARANCE_TAGS=["올백머리","장발","단발","숏컷","곱슬머리","웨이브머리","땋은 머리","포니테일","투톤 헤어","특이한 머리색","안경을 씀","안대","특이동공","오드아이","세로동공","삼백안","날카로운 눈매","처진 눈매","속눈썹이 김","두꺼운 눈썹","문신","피어싱","흉터","주근깨","점이 있음","창백한 피부","구릿빛 피부","근육질","탄탄한 체형","마른 체형","통통한 체형","키가 큼","키가 작음","손이 큼","중성적인 인상","부드러운 인상","날카로운 인상","아름다움","잘생김","귀여움","우아함","위압적인 분위기","단정한 분위기","퇴폐적인 분위기","신비로운 분위기","소년미","성숙미"];
const WEALTH_OPTIONS=["생계가 빠듯함","여유가 적음","평범한 형편","경제적으로 여유로움","부유함","대단히 부유함","재산을 알 수 없음"];
const PROFILE_TAG_OPTIONS={
  attractedGenders:["남성","여성","그외","없음"],
  appearanceTags:APPEARANCE_TAGS,
  attractionTraits:[...APPEARANCE_TAGS,"단정한 사람","자기 관리를 잘함","전문직","예술가 기질","제복이 어울림","지적인 분위기","말투가 다정함","목소리가 좋음","능력 있는 사람","성실한 사람","책임감이 강함","리더십이 있음","침착한 사람","유머 감각이 있음","자신감이 있음","수줍은 사람","상냥한 사람","강단 있는 사람","신비로운 사람","위험한 분위기","연상","연하","동갑",...WEALTH_OPTIONS]
};
function openProfileTagsDialog(field){
  const character=active(),options=PROFILE_TAG_OPTIONS[field];if(!character||!options)return;
  let selected=[...(character[field]||[])];
  const titles={attractedGenders:"성지향 설정",appearanceTags:"외모 태그 정하기",attractionTraits:"끌리는 특징 정하기"};
  const dialog=document.createElement("dialog");dialog.className="profile-tags-dialog";
  dialog.innerHTML=`<form method="dialog"><div class="title"><div><h2>${titles[field]}</h2><small>여러 개를 선택할 수 있어요.${field==="attractedGenders"?" ‘없음’을 고르면 다른 선택은 해제돼요.":""}</small></div><button value="cancel">×</button></div><div class="profile-tag-grid">${options.map(value=>`<button type="button" data-profile-tag="${value}" class="${selected.includes(value)?"on":""}">${value}</button>`).join("")}</div><div class="crop-actions"><button value="cancel">취소</button><button class="primary" value="save">저장</button></div></form>`;
  dialog.querySelectorAll("[data-profile-tag]").forEach(button=>button.onclick=()=>{
    const value=button.dataset.profileTag;
    if(field==="attractedGenders"){
      if(value==="없음")selected=selected.includes(value)?[]:["없음"];
      else selected=selected.filter(item=>item!=="없음"),selected=selected.includes(value)?selected.filter(item=>item!==value):[...selected,value];
    }else selected=selected.includes(value)?selected.filter(item=>item!==value):[...selected,value];
    dialog.querySelectorAll("[data-profile-tag]").forEach(item=>item.classList.toggle("on",selected.includes(item.dataset.profileTag)));
  });
  dialog.onclose=()=>{if(dialog.returnValue==="save")updateCharacter(character.id,{[field]:selected},true);dialog.remove();render()};
  document.body.append(dialog);dialog.showModal();
}
const listText=value=>Array.isArray(value)&&value.length?value.join(", "):"";
const exportValue=value=>{
  const text=String(value??"").trim();
  return !text||["정하지 않음","없음","-"].includes(text)?"":text;
};
const exportSection=(title,rows)=>{
  const lines=rows.map(([label,value])=>[label,exportValue(value)]).filter(([,value])=>value);
  return lines.length?[title,lines]:null;
};
function profileExportLines(character){
  const sections=[
    exportSection("기본 정보",[["이름",character.name],["나이대",character.ageGroup],["성별",character.gender==="그외"?"":character.gender],["끌리는 대상",character.attractionTarget],["새로운 사람에게 끌리는 정도",character.relationshipOpenness],["직업",character.jobTitle||character.job],["생일",character.birthday?`${character.birthday.slice(0,2)}월 ${character.birthday.slice(2)}일`:""],["재산",character.wealth],["소비 유형",character.income],["기상 시각",character.wake],["기상 습관",character.wakeHabit],["취침 시각",character.sleep],["수면 습관",character.sleepHabit],["신체 접촉 반응",character.touchReaction],["외모가 눈에 띄는 정도",character.appearanceLevel==="보통"?"":character.appearanceLevel],["외모 태그",listText(character.appearanceTags)],["상대 외모를 보는 정도",character.appearanceInterest==="보통"?"":character.appearanceInterest],["끌리는 특징",listText(character.attractionTraits)]]),
    exportSection("성격",[["사람과 어울리는 방식",character.socialStyle],["정보를 받아들이는 방식",character.perceptionStyle],["판단하는 방식",character.decisionStyle],["일정을 다루는 방식",character.planningStyle],["행동 전환",character.activityTempo],["깔끔함",character.neatness],["간섭 성향",character.interference],["갈등 대응",character.conflictStyle],["애정 표현",character.affectionStyle],["생활 에너지",character.energyRhythm]]),
    exportSection("취향 선택",[["관심사",listText(character.interests)],["취미",listText(character.hobbies)],["음식",listText(character.foodPreferences)],["좋아하는 음료",listText(character.drinks)],["좋아하는 이야기 장르",listText(character.favoriteStoryGenres)],["음악 장르",listText(character.musicGenres)],["패션 스타일",listText(character.favoriteFashionStyles)],["영상 종류",listText(character.favoriteVideoGenres)],["게임 장르",listText(character.favoriteGameGenres)],["향 계열",listText(character.favoriteScentNotes)]])
  ];
  return sections.filter(Boolean);
}
const exportImage=src=>new Promise(resolve=>{
  if(!src)return resolve(null);
  const image=new Image();image.crossOrigin="anonymous";image.onload=()=>resolve(image);image.onerror=()=>resolve(null);image.src=src;
});
const readableInk=color=>{
  const hex=String(color||"#765036").replace("#",""),full=hex.length===3?hex.split("").map(x=>x+x).join(""):hex;
  const rgb=[0,2,4].map(i=>parseInt(full.slice(i,i+2),16)||0),luminance=(.299*rgb[0]+.587*rgb[1]+.114*rgb[2]);
  return luminance>175?"#241c18":"#ffffff";
};
async function exportProfilePng(character){
  await document.fonts?.load?.('32px "Do Hyeon"');await document.fonts?.ready;
  const sections=profileExportLines(character),canvas=document.createElement("canvas"),ctx=canvas.getContext("2d"),width=1400,pad=70,rowH=58;
  const rows=sections.reduce((sum,[,items])=>sum+items.length,0);
  canvas.width=width;canvas.height=Math.max(1750,430+sections.length*72+rows*rowH);
  const primary=character.theme?.primary||"#765036",secondary=character.theme?.secondary||primary,ink=readableInk(primary);
  ctx.fillStyle="#fffdf9";ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle="#24201d";ctx.lineWidth=3;ctx.strokeRect(pad,55,width-pad*2,canvas.height-110);
  ctx.fillStyle=primary;ctx.fillRect(pad,55,width-pad*2,110);
  ctx.fillStyle=ink;ctx.textAlign="center";ctx.font='56px "Do Hyeon","Malgun Gothic",sans-serif';ctx.fillText("캐 릭 터  설 정 표",width/2,128);
  const portrait=await exportImage(character.photo),icon=await exportImage(character.icon);
  const imageX=pad+24,imageY=190,imageW=250,imageH=250;
  ctx.fillStyle="#f4f0ea";ctx.fillRect(imageX,imageY,imageW,imageH);ctx.strokeStyle="#24201d";ctx.lineWidth=2;ctx.strokeRect(imageX,imageY,imageW,imageH);
  const drawContain=(image,x,y,w,h)=>{if(!image)return false;const scale=Math.min(w/image.width,h/image.height),dw=image.width*scale,dh=image.height*scale;ctx.drawImage(image,x+(w-dw)/2,y+(h-dh)/2,dw,dh);return true};
  if(!drawContain(portrait,imageX,imageY,imageW,imageH)){ctx.fillStyle=primary;ctx.font='72px "Do Hyeon","Malgun Gothic",sans-serif';ctx.fillText(character.name.slice(0,1),imageX+imageW/2,imageY+145)}
  if(icon)drawContain(icon,imageX+178,imageY+178,66,66);
  ctx.textAlign="left";ctx.fillStyle="#24201d";ctx.font='48px "Do Hyeon","Malgun Gothic",sans-serif';ctx.fillText(character.name,pad+310,260);
  ctx.font='24px "Do Hyeon","Malgun Gothic",sans-serif';ctx.fillStyle="#665d56";ctx.fillText("서랍마을 인물 기록 · 설정된 항목만 표기",pad+310,310);
  ctx.strokeStyle="#24201d";ctx.strokeRect(pad+290,190,width-pad*2-314,250);
  let y=480;
  sections.forEach(([title,items])=>{
    ctx.fillStyle=primary;ctx.fillRect(pad,y,210,56);ctx.fillStyle=ink;ctx.font='29px "Do Hyeon","Malgun Gothic",sans-serif';ctx.fillText(title,pad+22,y+39);
    ctx.strokeStyle="#24201d";ctx.lineWidth=2;ctx.strokeRect(pad,y,width-pad*2,56);y+=56;
    items.forEach(([label,value])=>{
      ctx.strokeRect(pad,y,width-pad*2,rowH);ctx.beginPath();ctx.moveTo(pad+270,y);ctx.lineTo(pad+270,y+rowH);ctx.stroke();
      ctx.fillStyle="#f0ece6";ctx.fillRect(pad+1,y+1,269,rowH-2);
      ctx.fillStyle="#302925";ctx.font='23px "Do Hyeon","Malgun Gothic",sans-serif';ctx.fillText(label,pad+18,y+38);
      ctx.font='22px "Malgun Gothic",sans-serif';ctx.fillText(String(value).slice(0,72),pad+292,y+38);y+=rowH;
    });
    y+=22;
  });
  ctx.fillStyle=primary;ctx.font='22px "Do Hyeon","Malgun Gothic",sans-serif';ctx.fillText(`서랍마을 · ${new Date().toLocaleDateString("ko-KR")}`,pad+15,canvas.height-75);
  try{const link=document.createElement("a");link.download=`${character.name}-설정표.png`;link.href=canvas.toDataURL("image/png");link.click()}catch{showToast("외부 이미지 보안 제한으로 PNG를 만들 수 없어요. PDF 내보내기를 이용해 주세요.")}
}
async function exportProfilePngV2(character,download=true,bodyFont="Gowun Dodum"){
  await document.fonts?.load?.(`32px "${bodyFont}"`,"가나다라마바사아자차카타파하")?.catch?.(()=>[]);await document.fonts?.load?.('52px "Do Hyeon"',"가나다라마바사아자차카타파하")?.catch?.(()=>[]);await document.fonts?.ready;
  if(document.fonts&&!document.fonts.check(`32px "${bodyFont}"`,"가나다라마바사아자차카타파하"))bodyFont="Gowun Dodum";
  const bodyStack=`"${bodyFont}","Gowun Dodum","Malgun Gothic",sans-serif`,titleStack='"Do Hyeon","Jua","Gowun Dodum",sans-serif';
  const sections=profileExportLines(character),canvas=document.createElement("canvas"),ctx=canvas.getContext("2d"),width=1400,pad=64,gap=24;
  canvas.width=width;
  const primary=character.theme?.primary||"#765036",secondary=character.theme?.secondary||primary;
  const portrait=await exportImage(character.photo),icon=await exportImage(character.icon),cardW=(width-pad*2-gap)/2,valueW=cardW-44;
  const wrap=(text,maxWidth,font=`22px ${bodyStack}`)=>{ctx.font=font;const out=[];String(text).split(/\n/).forEach(paragraph=>{let line="";for(const char of paragraph){const next=line+char;if(line&&ctx.measureText(next).width>maxWidth){out.push(line);line=char}else line=next}out.push(line||" ")});return out};
  const layouts=sections.map(([title,items])=>{const cards=items.map(([label,value])=>{const lines=wrap(value,valueW);return {label,lines,height:58+lines.length*34}});let left=0,right=0;cards.forEach((card,index)=>{card.column=index%2;card.offset=card.column?right:left;if(card.column)right+=card.height+14;else left+=card.height+14});return {title,cards,height:70+Math.max(left,right)}});
  canvas.height=Math.max(1500,420+layouts.reduce((sum,section)=>sum+section.height+24,0)+100);
  const rounded=(x,y,w,h,r=22)=>{ctx.beginPath();ctx.roundRect(x,y,w,h,r)};
  const cover=(image,x,y,w,h)=>{if(!image)return false;const scale=Math.max(w/image.width,h/image.height),dw=image.width*scale,dh=image.height*scale;ctx.drawImage(image,x+(w-dw)/2,y+(h-dh)/2,dw,dh);return true};
  ctx.fillStyle="#f8f5f0";ctx.fillRect(0,0,width,canvas.height);
  const hx=pad,hy=54,hw=width-pad*2,hh=290;
  ctx.save();rounded(hx,hy,hw,hh,34);ctx.clip();ctx.fillStyle=primary;ctx.fillRect(hx,hy,hw,hh);
  const headerImage=portrait;if(headerImage){ctx.filter="blur(18px) brightness(.45) saturate(.9)";cover(headerImage,hx-24,hy-24,hw+48,hh+48);ctx.filter="none";ctx.fillStyle=primary+"55";ctx.fillRect(hx,hy,hw,hh)}
  const avatar=icon||portrait,ax=hx+54,ay=hy+47,size=196;
  ctx.save();ctx.beginPath();ctx.arc(ax+size/2,ay+size/2,size/2,0,Math.PI*2);ctx.clip();
  if(!cover(avatar,ax,ay,size,size)){ctx.fillStyle=secondary;ctx.fillRect(ax,ay,size,size);ctx.fillStyle="#fff";ctx.textAlign="center";ctx.font=`82px ${bodyStack}`;ctx.fillText(character.name.slice(0,1),ax+size/2,ay+126)}
  ctx.restore();if(!icon){ctx.strokeStyle="#ffffffcc";ctx.lineWidth=7;ctx.beginPath();ctx.arc(ax+size/2,ay+size/2,size/2,0,Math.PI*2);ctx.stroke()}
  ctx.textAlign="left";ctx.fillStyle="#fff";ctx.font=`52px ${titleStack}`;const titleLines=wrap(`${character.name}의 프로필`,hw-360,`52px ${titleStack}`).slice(0,2);titleLines.forEach((line,index)=>ctx.fillText(line,hx+300,hy+112+index*58));
  ctx.font=`25px ${bodyStack}`;ctx.fillStyle="#ffffffdd";ctx.fillText("서랍마을 캐릭터 기록",hx+302,hy+135+titleLines.length*58);ctx.restore();
  let y=382;
  layouts.forEach(section=>{ctx.fillStyle=primary;rounded(pad,y,cardW,52,18);ctx.fill();ctx.fillStyle="#fff";ctx.font=`bold 27px ${bodyStack}`;ctx.fillText(section.title,pad+22,y+36);
    section.cards.forEach(card=>{const x=pad+card.column*(cardW+gap),cy=y+66+card.offset;ctx.fillStyle="#fff";rounded(x,cy,cardW,card.height,18);ctx.fill();ctx.strokeStyle=secondary+"88";ctx.lineWidth=2;ctx.stroke();ctx.fillStyle=primary;ctx.font=`bold 20px ${bodyStack}`;ctx.fillText(card.label,x+22,cy+31);ctx.fillStyle="#2f2926";ctx.font=`22px ${bodyStack}`;card.lines.forEach((line,index)=>ctx.fillText(line,x+22,cy+67+index*34))});y+=section.height+24});
  ctx.fillStyle=primary;ctx.font=`20px ${bodyStack}`;ctx.fillText(`서랍마을 · ${new Date().toLocaleDateString("ko-KR")}`,pad,canvas.height-45);
  if(download)try{const link=document.createElement("a");link.download=`${character.name}-프로필.png`;link.href=canvas.toDataURL("image/png");link.click()}catch{showToast("외부 이미지 보안 제한으로 PNG를 만들 수 없어요. PDF 내보내기를 이용해 주세요.")}
  return canvas;
}
function exportProfilePdf(character){
  const sections=profileExportLines(character),win=window.open("","_blank");if(!win){showToast("팝업을 허용한 뒤 다시 시도해 주세요");return}
  const primary=character.theme?.primary||"#765036",secondary=character.theme?.secondary||primary,ink=readableInk(primary),photo=character.photo||character.icon;
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${character.name} 설정표</title><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Do+Hyeon&display=swap" rel="stylesheet"><style>@page{size:A4;margin:12mm}*{box-sizing:border-box}body{margin:0;color:#211d1a;background:#eee;font-family:"Malgun Gothic",sans-serif}.sheet{width:190mm;min-height:270mm;margin:12px auto;padding:8mm;background:#fff;border:1px solid #222}.title{padding:10px;color:${ink};background:${primary};text-align:center;font:34px "Do Hyeon",sans-serif;letter-spacing:8px}.identity{display:grid;grid-template-columns:42mm 1fr;margin-top:7mm;border:1px solid #222}.portrait{width:42mm;height:42mm;object-fit:contain;border-right:1px solid #222;background:#f5f2ed}.identity div{padding:8mm}.identity h1{margin:0;font:32px "Do Hyeon",sans-serif}.identity p{color:#746b64}section{margin-top:6mm;break-inside:avoid}h2{margin:0;padding:7px 10px;color:${ink};background:${primary};font:22px "Do Hyeon",sans-serif}table{width:100%;border-collapse:collapse;table-layout:fixed}th,td{border:1px solid #333;padding:7px 9px;vertical-align:top;font-size:13px;overflow-wrap:anywhere}th{width:34%;background:#f1ede7;text-align:left;font-family:"Do Hyeon",sans-serif;font-size:15px}button{width:100%;margin-top:8mm;padding:12px;border:0;color:#fff;background:${primary};font:18px "Do Hyeon",sans-serif}@media print{body{background:#fff}.sheet{width:auto;min-height:0;margin:0;padding:0;border:0}button{display:none}}</style></head><body><main class="sheet"><div class="title">캐 릭 터 설 정 표</div><div class="identity">${photo?`<img class="portrait" src="${photo}" alt="">`:`<div class="portrait"></div>`}<div><h1>${character.name}</h1><p>서랍마을 인물 기록 · 설정된 항목만 표기</p></div></div>${sections.map(([title,rows])=>`<section><h2>${title}</h2><table>${rows.map(([label,value])=>`<tr><th>${label}</th><td>${value}</td></tr>`).join("")}</table></section>`).join("")}<button onclick="print()">PDF로 저장 / 인쇄</button></main></body></html>`);
  win.document.close();setTimeout(()=>win.print(),900);
}
async function exportProfilePdfV2(character,bodyFont){
  const win=window.open("","_blank");if(!win){showToast("팝업을 허용한 뒤 다시 시도해 주세요");return}
  win.document.write('<!doctype html><html><head><meta charset="utf-8"><title>프로필 준비 중</title></head><body style="font-family:sans-serif;padding:30px">프로필을 만드는 중이에요…</body></html>');
  try{
    const canvas=await exportProfilePngV2(character,false,bodyFont),image=canvas.toDataURL("image/png");
    win.document.open();win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${character.name}의 프로필</title><style>@page{size:A4;margin:0}*{box-sizing:border-box}html,body{margin:0;background:#eee}main{width:210mm;margin:0 auto;background:#fff}img{display:block;width:100%;height:auto}button{position:fixed;right:20px;bottom:20px;padding:12px 18px;border:0;border-radius:12px;color:#fff;background:#333}@media print{html,body,main{width:100%;background:#fff}button{display:none}}</style></head><body><main><img src="${image}" alt="${character.name}의 프로필"></main><button onclick="print()">PDF로 저장 / 인쇄</button></body></html>`);win.document.close();setTimeout(()=>win.print(),500);
  }catch(error){win.close();showToast("PDF를 만들지 못했어요. 프로필 사진의 주소를 확인해 주세요.")}
}
function openProfileExportDialog(){
  const character=active();if(!character)return;const dialog=document.createElement("dialog");dialog.className="profile-export-dialog";
  const fonts=[["Ownglyph Corncorn","온글잎 콘콘체"],["Gowun Dodum","고운돋움"],["Nanum Pen Script","나눔펜스크립트"],["Gamja Flower","감자꽃"],["Gaegu","개구체"],["Poor Story","푸어스토리"],["Nanum Myeongjo","나눔명조"]];
  dialog.innerHTML=`<form method="dialog"><div class="title"><div><h2>프로필 내보내기</h2><small>제목은 배민 도현체로 고정되고, 본문은 한글 전체가 확인된 글꼴만 선택할 수 있어요.</small></div><button value="cancel">×</button></div><label class="export-font-picker">본문 한글 글꼴<select name="exportFont">${fonts.map(([value,label])=>`<option value="${value}">${label}</option>`).join("")}</select></label><div class="profile-export-options"><button type="button" data-export-format="png"><b>PNG 이미지</b><small>선택한 글꼴로 바로 저장</small></button><button type="button" data-export-format="pdf"><b>PDF</b><small>PNG와 완전히 같은 디자인으로 인쇄</small></button></div></form>`;
  const selectedFont=()=>dialog.querySelector('[name="exportFont"]').value;
  dialog.querySelector('[data-export-format="png"]').onclick=()=>{exportProfilePngV2(character,true,selectedFont());dialog.close()};
  dialog.querySelector('[data-export-format="pdf"]').onclick=()=>{exportProfilePdfV2(character,selectedFont());dialog.close()};
  dialog.onclose=()=>dialog.remove();document.body.append(dialog);dialog.showModal();
}
function enhanceDynamicForms(){
  const feedbackIntro=document.querySelector(".feedback-card>p");
  if(feedbackIntro)feedbackIntro.textContent="Google 로그인 주소와 받는 주소가 같아도 전송할 수 있어요. FormSubmit 메일이 막혀도 로그인 상태에서는 Firebase 피드백함에 별도로 저장합니다.";
  const profile=document.querySelector(".profile-license");
  if(profile){
    const fields=profile.querySelector(".fields");
    if(fields&&!profile.querySelector('[data-field="wakeHabit"]')){
      const label=document.createElement("label");label.className="wake-habit-field";label.innerHTML=`기상 습관<select data-field="wakeHabit">${["알람을 듣고 천천히 일어남","알람이 울리기 전에 눈을 뜸","알람을 여러 번 미룸","눈을 뜨자마자 바로 일어남","이불 속에서 한참 뒹굶","일어나자마자 창문을 엶","일어나자마자 물을 마심","침대에서 오늘 일정을 확인함","비몽사몽한 채 방을 돌아다님","누가 깨워 줘야 일어남"].map(value=>`<option ${active().wakeHabit===value?"selected":""}>${value}</option>`).join("")}</select><small>기상 직후 장면과 아침 행동에 반영돼요.</small>`;fields.append(label);
    }
    if(fields&&!profile.querySelector('[data-field="sleepHabit"]')){
      const label=document.createElement("label");label.className="sleep-habit-field";label.innerHTML=`수면 습관<select data-field="sleepHabit">${["이불을 단정히 덮고 잠","이불을 걷어차며 잠","옆으로 웅크려 잠","팔다리를 뻗고 잠","베개를 끌어안고 잠","잠꼬대를 자주 함","뒤척임이 많음","아주 얌전히 잠","새벽에 자주 깸","코를 골며 깊이 잠"].map(value=>`<option ${active().sleepHabit===value?"selected":""}>${value}</option>`).join("")}</select><small>자는 중 현재 장면에 반영돼요. 수면 중인 내용은 생활 로그에 기록하지 않아요.</small>`;fields.append(label);
    }
    if(fields&&!profile.querySelector('[data-field="gender"]')){
      const block=document.createElement("div");block.className="profile-extra-settings";
      const select=(field,title,values,current,help="")=>`<label>${title}<select data-field="${field}">${values.map(value=>`<option ${value===current?"selected":""}>${value}</option>`).join("")}</select>${help?`<small>${help}</small>`:""}</label>`;
      block.innerHTML=
        select("gender","성별",["남성","여성","그외"],active().gender||"그외")+
        select("attractionTarget","끌리는 대상",["설정하지 않음 · 누구에게도 끌리지 않음","여성에게 끌림","남성에게 끌림","여성과 남성에게 끌림","성별과 무관하게 끌림","그외 성별에게 끌림"],active().attractionTarget||"설정하지 않음 · 누구에게도 끌리지 않음")+
        select("relationshipOpenness","새로운 사람에게 끌리는 정도",["설정하지 않음 · 절대 끌리지 않음","연인이 없을 때만 취향이면 끌림","연인이 있어도 취향이면 끌릴 수 있음"],active().relationshipOpenness||"설정하지 않음 · 절대 끌리지 않음","사용자가 직접 설정하지 않으면 새로운 사람에게 절대 끌리지 않아요.")+
        select("wealth","재산",WEALTH_OPTIONS,active().wealth||"평범한 형편","캐릭터가 실제로 가진 경제적 여유예요. 소비 유형과는 별도로 계산돼요.")+
        select("touchReaction","신체 접촉에 대한 반응",["몸에 손이 닿는 것을 극도로 꺼림","몸에 손이 닿는 것을 싫어함","허락 없는 접촉은 불편함","가까운 사람에게만 허용함","상황에 따라 자연스럽게 받아들임","신체 접촉을 좋아함","먼저 다가가는 편"],active().touchReaction||"상황에 따라 자연스럽게 받아들임","상대 캐릭터의 반응과 공식 관계, 관계별 스킨십 강도를 함께 살펴 생활 장면을 자동으로 만들어요.")+
        select("appearanceLevel","외모가 눈에 띄는 정도",["눈에 띄지 않음","수수함","보통","매력적임","매우 아름답거나 잘생김","시선을 사로잡음"],active().appearanceLevel||"보통")+
        select("appearanceInterest","상대의 외모를 보는 정도",["거의 보지 않음","조금 봄","보통","꽤 중요하게 봄","외모에 크게 끌림"],active().appearanceInterest||"보통")+
        `<div class="profile-tag-actions"><button type="button" data-profile-tags="appearanceTags">외모 태그 정하기</button><small data-profile-tags-summary="appearanceTags"></small><button type="button" data-profile-tags="attractionTraits">끌리는 특징 정하기</button><small data-profile-tags-summary="attractionTraits"></small></div>`;
      fields.append(block);
    }
    profile.querySelectorAll("[data-profile-tags-summary]").forEach(summary=>{
      const values=active()[summary.dataset.profileTagsSummary]||[];
      summary.textContent=values.length?values.join(" · "):"정하지 않음";
    });
    if(fields){
      const labelOf=selector=>fields.querySelector(selector)?.closest("label");
      const photo=labelOf('[data-image="photo"]'),primary=labelOf('[data-color="primary"]'),secondary=labelOf('[data-color="secondary"]');
      const gradient=profile.querySelector("[data-gradient]")?.closest("label");
      if(photo&&primary&&secondary&&gradient)photo.after(primary,secondary,gradient);
      const wake=labelOf('[data-field="wake"]'),wakeHabit=labelOf('[data-field="wakeHabit"]');
      const sleep=labelOf('[data-field="sleep"]'),sleepHabit=labelOf('[data-field="sleepHabit"]');
      if(wake&&wakeHabit)wake.after(wakeHabit);
      if(sleep&&sleepHabit)sleep.after(sleepHabit);
      const job=labelOf('[data-field="job"]'),jobTitle=labelOf('[data-field="jobTitle"]'),workplace=labelOf('[data-field="workplaceId"]'),income=labelOf('[data-field="income"]'),gender=labelOf('[data-field="gender"]'),orientation=labelOf('[data-field="attractionTarget"]'),openness=labelOf('[data-field="relationshipOpenness"]'),wealth=labelOf('[data-field="wealth"]'),appearanceInterest=labelOf('[data-field="appearanceInterest"]');
      if(job&&gender&&orientation)job.before(gender,orientation);
      if(job&&jobTitle)job.after(jobTitle);
      if(income&&wealth)income.before(wealth);
      if(workplace&&!profile.querySelector('[data-field="birthday"]')){
        const birthday=document.createElement("label");
        birthday.innerHTML=`생일 · 월일<input type="text" inputmode="numeric" maxlength="4" pattern="(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])" data-field="birthday" value="${active().birthday||""}" placeholder="예: 0804"><small>연도 없이 네 자리로 입력해요. 생일파티는 당일 오후 7시에 생성돼요.</small>`;
        workplace.after(birthday);
      }
      if(appearanceInterest&&openness)appearanceInterest.after(openness);
      const license=profile.querySelector('[data-field="driverLicense"]')?.closest("label");
      if(license)fields.append(license);
      const exportButton=profile.querySelector("[data-export-profile]");
      if(exportButton)profile.append(exportButton);
    }
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
    const usage=window.ParallelCityAuth?.getInfo?.().storageUsage||JSON.parse(localStorage.getItem("drawer-village-storage-usage")||'{"count":0,"bytes":0,"maxCount":120,"maxBytes":20971520}');
    const percent=Math.min(100,Math.round((usage.bytes||0)/(usage.maxBytes||20971520)*100)),used=((usage.bytes||0)/1048576).toFixed(1),limit=((usage.maxBytes||20971520)/1048576).toFixed(0),left=`${Math.max(0,((usage.maxBytes||20971520)-(usage.bytes||0))/1048576).toFixed(1)}MB 남음`;
    const meter=document.createElement("div");meter.className="storage-meter";meter.innerHTML=`<h3>사진 저장 공간</h3><div><i style="width:${percent}%"></i></div><b>${used}MB 사용 · ${left}</b><small>현재 총 ${limit}MB · 캐릭터 ${characterLimit()}명 · 마을 ${townLimit()}개 · 이미지 링크는 이 용량을 사용하지 않아요.</small>`;sync.append(meter);
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
  const accountGuides=window.ParallelCityAuth?.getInfo?.().guideState;
  if(accountGuides&&!accountGuides.loaded)return;
  if(!guide||!state.order.length||accountGuides?.seen?.includes(tab)||localStorage.getItem(key)==="1"||guidePending.has(tab))return;
  guidePending.add(tab);
  const openDialog=document.querySelector("dialog[open]");
  if(openDialog){openDialog.addEventListener("close",()=>{guidePending.delete(tab);maybeShowPageGuide()},{once:true});return}
  const dialog=document.createElement("dialog");dialog.className="page-guide";
  dialog.innerHTML=`<form method="dialog"><small>처음 오셨나요?</small><h2>${guide[0]}</h2><p>${guide[1]}</p><button class="primary" value="ok">확인</button></form>`;
  dialog.onclose=()=>{localStorage.setItem(key,"1");window.ParallelCityAuth?.markGuideSeen?.(tab);guidePending.delete(tab);dialog.remove()};
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
  const cartKey="drawer-village-cart";
  const readCart=()=>{try{return JSON.parse(localStorage.getItem(cartKey)||"{}")||{}}catch{return {}}};
  const writeCart=cart=>{localStorage.setItem(cartKey,JSON.stringify(cart));render()};
  $$("[data-cart-add]").forEach(el=>el.onclick=()=>{const cart=readCart(),id=el.dataset.cartAdd;cart[id]=Math.min(99,(Number(cart[id])||0)+1);writeCart(cart);showToast("장바구니에 담았어요")});
  $$("[data-cart-plus]").forEach(el=>el.onclick=()=>{const cart=readCart(),id=el.dataset.cartPlus;cart[id]=Math.min(99,(Number(cart[id])||0)+1);writeCart(cart)});
  $$("[data-cart-minus]").forEach(el=>el.onclick=()=>{const cart=readCart(),id=el.dataset.cartMinus,next=(Number(cart[id])||0)-1;if(next>0)cart[id]=next;else delete cart[id];writeCart(cart)});
  $$("[data-cart-remove]").forEach(el=>el.onclick=()=>{const cart=readCart();delete cart[el.dataset.cartRemove];writeCart(cart)});
  $$("[data-wardrobe-character]").forEach(el=>el.onclick=()=>{setActive(el.dataset.wardrobeCharacter);state.activeTab="wardrobe";save();render()});
  $("[data-new-clothing]")?.addEventListener("click",()=>openClothingEditor());
  $$("[data-edit-clothing]").forEach(el=>el.onclick=event=>{event.stopPropagation();openClothingEditor(el.dataset.editClothing)});
  $("[data-new-outfit]")?.addEventListener("click",()=>openOutfitEditor());
  $$("[data-edit-outfit]").forEach(el=>el.onclick=()=>openOutfitEditor(el.dataset.editOutfit));
  $$("[data-new]").forEach(el=>el.onclick=()=>{const limit=characterLimit();if(!createCharacter(limit))showToast(`현재 캐릭터 슬롯은 ${limit}명까지예요`);render()});
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
  $$("[data-home-select]").forEach(el=>el.onclick=()=>{
    const homeId=el.dataset.homeSelect;
    setActiveHome(homeId);
    const residents=state.order.filter(id=>state.characters[id]?.homeId===homeId);
    if(residents.length&&!residents.includes(state.activeId))setActive(residents[0]);
    render();
  });
  $("[data-home-edit]")?.addEventListener("click",async()=>{
    const residents=state.order.filter(id=>state.characters[id]?.homeId===state.activeHomeId);
    if(residents.length&&!residents.includes(state.activeId))setActive(residents[0]);
    const was=state.homeEditMode;
    setHomeEditMode(!was);
    render();
    if(was)await explicitSave("집 편집 저장");
  });
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
  $$("[data-pet-trait-field]").forEach(el=>el.onclick=()=>{
    const pet=state.homes[el.dataset.homeId]?.pets?.find(item=>item.id===el.dataset.petId);
    if(!pet)return;
    const field=el.dataset.petTraitField;
    const current=Array.isArray(pet[field])?pet[field]:[];
    updatePet(el.dataset.homeId,el.dataset.petId,{[field]:current.includes(el.dataset.value)?current.filter(value=>value!==el.dataset.value):[...current,el.dataset.value]});
    render();
  });
  $("[data-feedback-form]")?.addEventListener("submit",async event=>{
    event.preventDefault();
    const form=event.currentTarget;
    const data=new FormData(form);
    const category=String(data.get("category")||"기타");
    const message=String(data.get("message")||"").trim();
    if(!message){showToast("피드백 내용을 적어 주세요");return}
    const character=active();
    const button=form.querySelector('button[type="submit"]'),status=form.querySelector(".feedback-status");
    button.disabled=true;button.textContent="보내는 중…";status.textContent="";
    let stored=false;
    try{
      const auth=window.ParallelCityAuth;
      if(auth?.getInfo?.().user&&auth.submitFeedback){
        try{await auth.submitFeedback({category,message,allowReply:true});stored=true}
        catch(storageError){console.warn("피드백함 저장 실패",storageError)}
      }
      const response=await fetch("https://formsubmit.co/ajax/kkyaareuk@gmail.com",{
        method:"POST",
        headers:{"Content-Type":"application/json","Accept":"application/json"},
        body:JSON.stringify({
          _subject:`[서랍마을 ${category}] 사용자 피드백`,
          _template:"table",
          _captcha:"false",
          _replyto:auth?.getInfo?.().user?.email||"",
          분류:category,
          내용:message,
          현재_화면:TAB_META[state.activeTab]?.[0]||state.activeTab,
          선택_캐릭터:character?.name||"없음",
          보낸_시각:new Date().toLocaleString("ko-KR")
        })
      });
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const result=await response.json().catch(()=>null);
      if(!result||![true,"true"].includes(result.success))throw new Error(result?.message||"메일 서비스가 전달을 확인하지 않았습니다.");
      form.reset();status.textContent="보냈어요. 개발자 이메일과 피드백함에 전달됐습니다.";showToast("피드백을 보냈어요");
    }catch(error){
      console.warn("피드백 전송 실패",error);
      status.textContent=stored?"피드백함에는 안전하게 저장했지만 이메일 전달은 확인되지 않았어요. 개발자가 피드백함에서 확인할 수 있습니다.":"이메일 서비스가 전달을 확인하지 않았어요. Google 로그인 후 다시 보내면 피드백함에도 안전하게 저장됩니다.";
      showToast(stored?"피드백함에 저장했어요":"피드백 전송을 확인하지 못했어요");
    }finally{button.disabled=false;button.textContent="피드백 보내기"}
  });
  $$("[data-delete-pet]").forEach(el=>el.onclick=()=>{if(confirm("이 함께 사는 존재를 삭제할까요?")){deletePet(el.dataset.homeId,el.dataset.deletePet);render()}});
  $$("[data-pet-image]").forEach(el=>el.onclick=()=>pickImage(`pet${el.dataset.petImage==="icon"?"Icon":"Photo"}`,el.dataset.homeId,el.dataset.petId));
  $$("[data-home-name]").forEach(el=>el.oninput=()=>updateHome(el.dataset.homeId,{name:el.value.trim()||"이름 없는 집"}));
  $$("[data-room-name]").forEach(el=>el.oninput=()=>updateRoom(el.dataset.homeId,el.dataset.roomName,{name:el.value.trim()||"방"}));
  $$("[data-room-type]").forEach(el=>el.onchange=()=>{setRoomType(el.dataset.homeId,el.dataset.roomType,el.value);render()});
  $$("[data-delete-room]").forEach(el=>el.onclick=()=>{
    const home=state.homes[el.dataset.homeId];
    if(Object.keys(home?.rooms||{}).length<=1)return alert("집에는 방이 최소 하나 필요해요.");
    if(confirm(`‘${home.rooms[el.dataset.deleteRoom]?.name||"이 방"}’을 삭제할까요?\n이 방을 쓰던 구성원은 남은 방으로 자동 이동해요.`)){
      if(deleteRoom(el.dataset.homeId,el.dataset.deleteRoom)){render();explicitSave("방 삭제")}
    }
  });
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
    const patch={[el.dataset.field]:numeric?Number(el.value):el.value};
    if(el.dataset.field==="attractionTarget")patch.attractedGenders={
      "여성에게 끌림":["여성"],"남성에게 끌림":["남성"],"여성과 남성에게 끌림":["여성","남성"],
      "성별과 무관하게 끌림":["남성","여성","그외"],"그외 성별에게 끌림":["그외"]
    }[el.value]||["없음"];
    updateCharacter(active().id,patch,false);
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
  $$("[data-image]").forEach(el=>el.onclick=()=>pickImage(el.dataset.image,active().id));
  $$("[data-room-bg]").forEach(el=>el.onclick=()=>pickImage("room",el.dataset.homeId,el.dataset.room));
  $$("[data-home-bg]").forEach(el=>el.onclick=()=>pickImage("home",el.dataset.homeBg));
  $$("[data-place-interior-image]").forEach(el=>el.onclick=()=>pickImage("placeInterior",el.dataset.placeInteriorImage));
  $$("[data-image-url]").forEach(el=>el.onclick=()=>useImageUrl(el.dataset.imageUrl,el.dataset.id,el.dataset.room||""));
  $$("[data-clear-room-bg]").forEach(el=>el.onclick=()=>{setHomeImage(el.dataset.homeId,el.dataset.room,"");render()});
  $$("[data-clear-home-bg]").forEach(el=>el.onclick=()=>{setHomeBackground(el.dataset.clearHomeBg,"");render()});
  $$("[data-clear-place-interior-image]").forEach(el=>el.onclick=()=>{setPlaceInteriorImage(el.dataset.clearPlaceInteriorImage,"");render()});
  $$("[data-character-pane]").forEach(el=>el.onclick=()=>{setCharacterPane(el.dataset.characterPane);render()});
  $$("[data-profile-tags]").forEach(el=>el.onclick=()=>openProfileTagsDialog(el.dataset.profileTags));
  $("[data-export-profile]")?.addEventListener("click",openProfileExportDialog);
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
  $("[data-add-town]")?.addEventListener("click",()=>{const limit=townLimit();if(!addTown(limit))showToast(`현재 마을 슬롯은 ${limit}개까지예요`);render()});
  $$("[data-delete-town]").forEach(el=>el.onclick=()=>{if(confirm("이 마을을 삭제할까요?")){deleteTown(el.dataset.deleteTown);render()}});
  $("[data-add-place]")?.addEventListener("click",()=>{addPlace();render()});
  const addPlaceButton=$("[data-add-place]");
  $("[data-add-rel]")?.addEventListener("click",()=>openRelationDialog());
  $$("[data-edit-rel]").forEach(el=>el.onclick=()=>openRelationDialog(el.dataset.editRel));
  $$("[data-view-source]").forEach(button=>button.onclick=()=>{
    $$("[data-view-source]").forEach(item=>item.classList.toggle("on",item===button));
    $$("[data-view-panel]").forEach(panel=>panel.hidden=panel.dataset.viewPanel!==button.dataset.viewSource);
  });
  $$(".character-view-card").forEach(card=>card.addEventListener("toggle",()=>{
    if(!card.open)return;
    card.closest("[data-view-panel]")?.querySelectorAll(".character-view-card").forEach(other=>{
      if(other!==card)other.open=false;
    });
  }));
  $$("[data-character-view]").forEach(select=>select.onchange=()=>{
    const source=select.dataset.source,target=select.dataset.target,field=select.dataset.viewField;
    state.characterViews=state.characterViews&&typeof state.characterViews==="object"?state.characterViews:{};
    state.characterViews[source]=state.characterViews[source]&&typeof state.characterViews[source]==="object"?state.characterViews[source]:{};
    state.characterViews[source][target]=state.characterViews[source][target]&&typeof state.characterViews[source][target]==="object"?state.characterViews[source][target]:{};
    if(select.value==="정하지 않음")delete state.characterViews[source][target][field];
    else state.characterViews[source][target][field]=select.value;
    if(field==="overall"){
      const summary=$$("[data-view-summary]").find(item=>item.dataset.viewSummary===`${source}:${target}`);
      if(summary)summary.textContent=select.value;
    }
    save(true);showToast(`${state.characters[source]?.name||"캐릭터"}의 생각을 저장했어요`);
  });
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
  $("[data-guide-reset]")?.addEventListener("click",async()=>{
    Object.keys(PAGE_GUIDES).forEach(tab=>localStorage.removeItem(`drawer-village-guide-${tab}`));
    await window.ParallelCityAuth?.resetGuides?.();
    showToast("페이지 안내를 다시 볼 수 있게 했어요");
    maybeShowPageGuide();
  });
  $("[data-reset]")?.addEventListener("click",()=>{if(confirm("모든 기기 저장 데이터를 지울까요?")){resetAll();render()}});
  if(state.activeTab==="town")bindPlaceDrag();
}

function applyImage(type,id,room,data){
  if(type==="room")setHomeImage(id,room,data);
  else if(type==="home")setHomeBackground(id,data);
  else if(type==="placeInterior")setPlaceInteriorImage(id,data);
  else if(type==="petPhoto")setPetImage(id,room,"photo",data);
  else if(type==="petIcon")setPetImage(id,room,"icon",data);
  else if(type==="car")updateCar(id,room,{image:data});
  else if(type==="catalogImage")updateCatalogItem(room,id,{image:data});
  else setCharacterImage(id,type,data);
}

if(!window.__drawerVillageTabNavigation){
  window.__drawerVillageTabNavigation=true;
  document.addEventListener("click",event=>{
    const tab=event.target.closest?.("[data-tab]");if(!tab)return;
    event.preventDefault();event.stopImmediatePropagation();
    state.activeTab=tab.dataset.tab;save(true);render();window.scrollTo({top:0,behavior:"auto"});
  },true);
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

const RELATION_TYPES=["친구","연인","부부","부모·자녀","가족","유사가족","보호·피보호","소꿉친구","학창 시절 친구들","친구 모임","산악회","동아리 동료","직장 동료","짝사랑","라이벌","혐관","기타"];
const RELATION_STAGES={
  연인:["이별 통보 직전","마음이 멀어지는 중","위태로운 사이","서로 알아가는 중","편안한 연인","서로를 깊이 사랑함","운명의 상대"],
  부부:["이혼 서류가 오가는 중","별거를 고민하는 중","권태기","생활 동반자","애정이 깊은 부부","서로 없이는 못 사는 사이","운명의 상대"],
  친구:["거의 안 친함","어색한 사이","가끔 연락함","편한 친구","가까운 친구","아주 가까운 친구","베스트 프렌드"],
  혐관:["원수지간","마주치면 싸움","서로 못마땅함","신경전 중","경쟁하며 의식함","티격태격함"],
  짝사랑:["무자각 · 자기 감정을 모르는 중","무자각 · 호감이라고만 생각함","무자각 · 이유 없이 자꾸 신경 쓰임","포기하려는 중","마음을 숨기는 중","멀리서 바라봄","조심스럽게 다가가는 중","감정이 깊어짐","고백을 결심함"],
  가족:["연락을 끊다시피 함","서먹한 가족","필요할 때 연락함","무난한 가족","서로 챙기는 가족","각별한 가족"],
  유사가족:["아직 가족이라 부르기 어려움","필요할 때만 함께함","한집안처럼 얽힌 사이","암묵적인 가족","서로를 가족처럼 챙김","떼어 놓을 수 없는 유사가족"],
  "부모·자녀":["연락이 끊긴 사이","서먹한 부모와 자녀","필요할 때만 연락함","무난한 부모와 자녀","서로 의지하는 가족","무척 각별한 부모와 자녀"],
  "보호·피보호":["보호를 거부하는 사이","필요할 때만 도움","암묵적으로 지켜봄","서로 역할을 받아들임","깊이 의지하는 사이","목숨을 맡길 수 있는 사이"],
  default:["매우 불편함","서먹함","조금 가까움","편안함","가까움","매우 가까움"]
};
const stagesFor=type=>RELATION_STAGES[type]||(["소꿉친구","학창 시절 친구들","친구 모임","산악회"].includes(type)?RELATION_STAGES.친구:RELATION_STAGES.default);
function openRelationDialog(id=""){
  if(state.order.length<2)return alert("캐릭터가 두 명 이상 필요해요.");
  const old=id?state.relationships[id]:null,dialog=document.createElement("dialog");dialog.className="relation-dialog relation-editor-dialog";
  const oldMembers=old?.groupMembers?.length?old.groupMembers:[old?.a,old?.b].filter(Boolean);
  const characterChecks=(name,selected=[])=>state.order.map(cid=>`<label class="relation-character-chip"><input type="checkbox" name="${name}" value="${cid}" ${selected.includes(cid)?"checked":""}> ${state.characters[cid].name}</label>`).join("");
  dialog.innerHTML=`<form method="dialog"><div class="title"><div><h2>${old?"관계 편집":"관계 추가"}</h2></div><button value="cancel">×</button></div>
    <fieldset class="relation-member-picker"><legend>관계에 포함할 캐릭터 · 두 명 이상</legend><div>${characterChecks("member",oldMembers.length?oldMembers:[state.activeId,state.order.find(cid=>cid!==state.activeId)].filter(Boolean))}</div><small>여기서 바로 캐릭터를 더하거나 뺄 수 있어요. 여러 명의 연인·부부 관계도 가능해요.</small></fieldset>
    <section class="relation-order-control"><b>두 명 관계 카드의 표시 순서</b><span data-relation-order-label></span><button type="button" data-swap-relation-order>↔ 좌우 바꾸기</button><small>예: 리바이 × 안테와 안테 × 리바이 중 원하는 배치를 선택해요.</small></section>
    <fieldset class="crush-direction" hidden><legend>짝사랑의 방향</legend><div class="crush-columns"><section><b>마음을 가진 사람 · 여러 명 가능</b><div>${characterChecks("admirer",old?.admirerId?[old.admirerId]:[])}</div></section><span>→</span><section><b>짝사랑 대상 · 여러 명 가능</b><div>${characterChecks("target",old?.targetId?[old.targetId]:[])}</div></section></div></fieldset>
    <fieldset class="parent-direction" hidden><legend>부모와 자녀 지정</legend><div class="parent-columns"><section><b>엄마 역할 · 여러 명 가능</b><div>${characterChecks("mother",old?.parentRole==="엄마"?[old.parentId||old.a]:[])}</div></section><section><b>아빠 역할 · 여러 명 가능</b><div>${characterChecks("father",old?.parentRole==="아빠"?[old.parentId||old.a]:[])}</div></section><span>→</span><section><b>자녀 · 여러 명 가능</b><div>${characterChecks("child",old?.childId?[old.childId]:[])}</div></section></div><small>엄마 두 명, 아빠 두 명, 엄마와 아빠 등 원하는 가족 구성이 모두 가능해요.</small></fieldset>
    <label>관계 종류<select name="type">${RELATION_TYPES.map(type=>`<option>${type}</option>`).join("")}</select></label>
    <label>현재 관계 단계<select name="stage"></select></label>
    <label class="relation-officiality">다른 사람에게 알려진 정도<select name="legalStatus">${["관계를 따로 명명하지 않음","당사자끼리만 관계를 인정함","가까운 사람에게만 알림","누구에게나 공개함","법적으로 관계가 등록됨"].map(value=>`<option>${value}</option>`).join("")}</select><small>위에서 아래로 더 공개적이고 공식적인 관계예요. 마지막은 가족관계·입양·후견처럼 서류에 관계가 기록된 경우를 모두 포함해요.</small></label>
    <label class="protection-role" hidden>돌봄·안전 책임의 방향<select name="protectionRole"><option value="none">보호 관계를 설정하지 않음</option><option value="a-protects-b">왼쪽 인물이 오른쪽 인물의 안전과 생활을 주로 챙김</option><option value="b-protects-a">오른쪽 인물이 왼쪽 인물의 안전과 생활을 주로 챙김</option><option value="mutual">서로의 안전과 생활을 함께 챙김</option></select><small>위험하거나 도움이 필요한 상황에서 누가 먼저 살피고 책임지고 돕는지를 뜻해요. 나이·직급·법적 가족 여부와는 별개예요.</small></label>
    <label>스킨십 강도<select name="touchIntensity">${["신체 접촉 없음","거의 하지 않음","가끔 가벼운 접촉","자연스럽게 표현함","애정 표현이 많은 편"].map(value=>`<option>${value}</option>`).join("")}</select><small>연인이나 부부여도 신체 접촉 없이 말과 행동으로 애정을 표현할 수 있어요.</small></label>
    <label class="cohabit"><input type="checkbox" name="cohabit"> 함께 살기</label>
    <p class="hint">공식 관계와 관계 단계, 각 캐릭터의 성격과 신체 접촉 반응을 함께 분석해 상호작용을 자동으로 만들어요.</p>
    <div><button value="cancel">취소</button><button class="primary" value="save">저장</button></div>
  </form>`;
  document.body.append(dialog);const f=dialog.querySelector("form");
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
  const updateType=()=>{refreshStages();const crush=f.type.value==="짝사랑",parent=f.type.value==="부모·자녀",protection=f.type.value==="보호·피보호";f.querySelector(".crush-direction").hidden=!crush;f.querySelector(".parent-direction").hidden=!parent;f.querySelector(".protection-role").hidden=!protection;f.querySelector(".relation-member-picker").hidden=crush||parent;if(!old)f.touchIntensity.value=["연인","부부"].includes(f.type.value)?"가끔 가벼운 접촉":"신체 접촉 없음";syncPairOrder()};
  const officialityMigration={"법적으로 명시되지 않음":"관계를 따로 명명하지 않음","외부에는 숨김":"당사자끼리만 관계를 인정함","당사자 사이에서만 인정함":"당사자끼리만 관계를 인정함","남들 앞에서도 공개함":"누구에게나 공개함","법적으로 가족임":"법적으로 관계가 등록됨","법적으로 보호 관계임":"법적으로 관계가 등록됨"};
  f.type.value=old?.type==="폴리 관계"?"연인":old?.type==="절친"||old?.type==="대학 동기"||old?.type==="젊은 날의 친구들"?"친구":old?.type||"친구";updateType();f.type.onchange=updateType;f.cohabit.checked=Boolean(old?.cohabit);f.touchIntensity.value=old?.touchIntensity||(["연인","부부"].includes(f.type.value)?"가끔 가벼운 접촉":"신체 접촉 없음");f.legalStatus.value=officialityMigration[old?.legalStatus]||old?.legalStatus||"관계를 따로 명명하지 않음";f.protectionRole.value=["a-protects-b","b-protects-a","mutual"].includes(old?.protectionRole)?old.protectionRole:"none";
  f.querySelectorAll('[name="member"]').forEach(input=>input.onchange=syncPairOrder);
  f.querySelector("[data-swap-relation-order]").onclick=()=>{if(pairOrder.length===2){pairOrder.reverse();syncPairOrder()}};
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
        const hostile=f.type.value==="혐관",base={type:f.type.value,stage:f.stage.value,legalStatus:f.legalStatus.value,protectionRole:f.type.value==="보호·피보호"?f.protectionRole.value:"",touchIntensity:f.touchIntensity.value,interactions:old?.interactions||[],interactionsAll:Boolean(old?.interactionsAll),cohabit:f.cohabit.checked,intimacy:hostile?Math.round(35+ratio*30):Math.round(ratio*100),conflict:hostile?Math.round(100-ratio*55):Math.round((1-ratio)*75),updatedAt:Date.now()};
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
window.addEventListener("drawer-village-guide-state",()=>requestAnimationFrame(maybeShowPageGuide));
window.addEventListener("drawer-village-storage-usage",()=>{if(state.activeTab==="settings")render()});
window.addEventListener("parallel-city-cloud-loaded",render);
window.addEventListener("beforeinstallprompt",event=>{event.preventDefault();deferredInstallPrompt=event;showInstallButton()});
window.addEventListener("appinstalled",()=>{deferredInstallPrompt=null;document.querySelector("#install-drawer-village")?.remove();showToast("서랍마을 앱이 설치되었습니다")});
function scheduleLiveSceneRefresh(){
  const delay=(5+Math.floor(Math.random()*11))*60*1000;
  setTimeout(()=>{
    if(["observe","home"].includes(state.activeTab)){
      const now=new Date();
      state.order.map(id=>state.characters[id]).filter(Boolean).forEach(character=>eventFor(character,now));
      render();
    }
    scheduleLiveSceneRefresh();
  },delay);
}
scheduleLiveSceneRefresh();

let automaticCloudSyncTimer=0;
document.addEventListener("change",event=>{
  if(!event.target?.matches("select,input,textarea"))return;
  clearTimeout(automaticCloudSyncTimer);
  automaticCloudSyncTimer=setTimeout(async()=>{
    if(!window.ParallelCityAuth?.getInfo?.().user)return;
    try{await window.ParallelCityAuth.upload?.({silent:true,reason:"자동 저장"})}
    catch(error){console.warn("자동 동기화를 다음 변경 때 다시 시도합니다.",error)}
  },1500);
});
render();
showInstallButton();
if(localStorage.getItem("drawer-village-hide-photo-backup-notice")!=="1"&&localStorage.getItem("parallel-city-hide-photo-backup-notice")!=="1"){
  const notice=document.createElement("dialog");notice.className="backup-notice";
  notice.innerHTML=`<form method="dialog"><h2>사진 보관 안내</h2><p>사진 파일을 직접 올리면 Google 저장 공간에 함께 보관돼요. 용량을 아끼고 싶다면 사진 파일 대신 <b>웹에 공개된 이미지 주소</b>를 입력해 주세요. 기본 사진 저장 공간은 <b>최대 120장·총 20MB</b>이며 상점에서 50MB로 늘릴 수 있어요. 같은 사진은 중복으로 올리지 않고, 현재 사용량은 설정에서 확인할 수 있습니다.</p><label><input type="checkbox" name="hide"> 다시는 보지 않기</label><button class="primary" value="ok">알겠어요</button></form>`;
  notice.onclose=()=>{if(notice.querySelector('[name="hide"]')?.checked)localStorage.setItem("drawer-village-hide-photo-backup-notice","1");notice.remove()};
  document.body.append(notice);notice.showModal();
}
import("./auth.js?v=20260805a").catch(error=>{
  console.warn("로그인 기능을 불러오지 못했지만 게임은 계속 실행됩니다.",error);
  setAccountLabel("Google 로그인");
});
if("serviceWorker" in navigator){
  navigator.serviceWorker.register("./sw.js?v=20260805a",{updateViaCache:"none"}).then(registration=>registration.update()).catch(error=>console.warn("오프라인 업데이트 준비 실패",error));
}
const lockPortrait=()=>screen.orientation?.lock?.("portrait").catch(()=>{});
if(matchMedia("(display-mode: standalone)").matches||navigator.standalone)lockPortrait();
window.addEventListener("orientationchange",lockPortrait);





