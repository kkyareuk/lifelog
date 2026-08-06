import {state, active, save, replaceState, createCharacter, deleteCharacter, setActive, setActiveHome, updateCharacter, toggleChip, addRelationship, updateRelationship, deleteRelationship, setHomeImage, setHomeBackground, setPlaceInteriorImage, setCharacterImage, setWorldBackground, addPlace, deletePlace, movePlace, updatePlace, resetAll, cloneState, setHomeEditMode, updateHome, createHome, deleteHome, addCharacterResidence, removeCharacterResidence, updateCharacterResidence, updateRoom, addRoom, setRoomType, deleteRoom, addPet, updatePet, deletePet, setPetImage, toggleFurniture, setHomeResidents, moveCharacter, addCatalogItem, updateCatalogItem, deleteCatalogItem, toggleFavorite, toggleOwned, togglePlaceStock, setCharacterPane, addTown, switchTown, deleteTown} from "./state.js?v=20260806be";
import {eventFor} from "./simulation.js?v=20260806be";
import {renderApp, setAccountLabel, setAccountEntitlements} from "./views.js?v=20260806be";
import {recordCharacterInteraction} from "./state.js?v=20260806be";

let pendingImage=null;
let deferredInstallPrompt=null;
const guidePending=new Set();
const PAGE_GUIDES={
  observe:["관찰","캐릭터가 지금 어디에서 무엇을 하는지 볼 수 있어요. 위쪽에서 캐릭터와 마을을 바꾸고, 아래 생활로그에서 오늘의 흐름을 확인해 보세요."],
  home:["집","방마다 누가 무엇을 하는지 보고, 집 편집에서 방 사진·동거인·함께 사는 존재·자동차를 설정할 수 있어요."],
  character:["캐릭터","프로필, 신체·서사·인지 특성, 성격과 취향을 설정하면 생활 장면과 대사가 달라져요. 고르지 않은 신체·인지 특성은 장면에서 지어내지 않아요."],
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
const WEALTH_OPTIONS=["생계가 빠듯함","여유가 적음","평범한 형편","경제적으로 여유로움","부유함","대부호","재산을 알 수 없음"];
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
  return !text||["정하지 않음","설정하지 않음","사용하지 않음","없음","-"].includes(text)?"":text;
};
const exportSection=(title,rows)=>{
  const lines=rows.map(([label,value])=>[label,exportValue(value)]).filter(([,value])=>value);
  return lines.length?[title,lines]:null;
};
function profileExportLines(character){
  const body=character.bodyProfile||{},wheelchair=body.wheelchair||{},arm=body.prostheticArm||{},leg=body.prostheticLeg||{},hearing=body.hearing||{},vision=body.vision||{};
  const sections=[
    exportSection("기본 정보",[["이름",character.name],["나이대",character.ageGroup],["성별",character.gender==="그외"?"":character.gender],["끌리는 대상",character.attractionTarget],["새로운 사람에게 끌리는 정도",character.relationshipOpenness],["직업",character.jobTitle||character.job],["생일",character.birthday?`${character.birthday.slice(0,2)}월 ${character.birthday.slice(2)}일`:""],["재산",character.wealth],["소비 유형",character.income],["기상 시각",character.wake],["기상 습관",character.wakeHabit],["취침 시각",character.sleep],["수면 습관",character.sleepHabit],["신체 접촉 반응",character.touchReaction],["외모가 눈에 띄는 정도",character.appearanceLevel==="보통"?"":character.appearanceLevel],["외모 태그",listText(character.appearanceTags)],["상대 외모를 보는 정도",character.appearanceInterest==="보통"?"":character.appearanceInterest],["끌리는 특징",listText(character.attractionTraits)]]),
    exportSection("성격",[["전체적인 유형",listText(character.personalityTypes)],["사람과 어울리는 방식",character.socialStyle],["정보를 받아들이는 방식",character.perceptionStyle],["판단하는 방식",character.decisionStyle],["일정을 다루는 방식",character.planningStyle],["행동 전환",character.activityTempo],["깔끔함",character.neatness],["패션 감각",character.fashionSense],["간섭 성향",character.interference],["갈등 대응",character.conflictStyle],["애정 표현",character.affectionStyle],["생활 에너지",character.energyRhythm],["유머·장난 성향",character.humorStyle],["감정 표현의 크기",character.emotionalExpression],["충동을 참는 정도",character.impulseControl],["서사·인지 특성",listText(character.characterTraits)],["장면에 반영할 특성 표현",listText(character.traitExpressions)],["특성 표현 메모",character.traitNotes],["메모를 로그에 반영",character.traitNotesInScripts?"사용":""]]),
    exportSection("신체·건강·접근성",[["체형",body.bodySize],["신체 특성",listText(body.physicalTraits)],["만성질환·건강 관리",listText(body.healthConditions)],["기타 건강 상태",body.healthOther],["휠체어",wheelchair.type],["휠체어 이용 방식",wheelchair.pattern],["의수 사용 부위",arm.side],["의수 종류",arm.custom||arm.type],["의족 사용 부위",leg.side],["의족 종류",leg.custom||leg.type],["청각장애·난청 부위",hearing.side],["청각 특성",hearing.level],["청각 접근 방식",listText(hearing.supports)],["시각장애·저시력 부위",vision.side],["시각 특성",vision.level],["시각 접근 방식",listText(vision.supports)],["상호작용에서 지킬 방식",listText(body.accessibilityPreferences)],["표현 메모",body.notes]]),
    exportSection("취향 선택",[["관심사",listText(character.interests)],["취미",listText(character.hobbies)],["음식",listText(character.foodPreferences)],["좋아하는 음료",listText(character.drinks)],["좋아하는 이야기 장르",listText(character.favoriteStoryGenres)],["음악 장르",listText(character.musicGenres)],["패션 스타일",listText(character.favoriteFashionStyles)],["영상 종류",listText(character.favoriteVideoGenres)],["게임 장르",listText(character.favoriteGameGenres)],["향 계열",listText(character.favoriteScentNotes)]])
  ];
  return sections.filter(Boolean);
}
const exportImage=src=>new Promise(resolve=>{
  if(!src)return resolve(null);
  const candidates=[String(src)];
  try{
    const url=new URL(src,location.href);
    if(/i\.imgur\.com$/i.test(url.hostname)){
      url.search="";url.pathname=url.pathname.replace(/_[a-z](?=\.[a-z0-9]+$)/i,"");
      if(!candidates.includes(url.href))candidates.push(url.href);
    }
  }catch{}
  const load=index=>{
    if(index>=candidates.length)return resolve(null);
    const image=new Image();image.crossOrigin="anonymous";image.referrerPolicy="no-referrer";
    image.onload=()=>resolve(image);image.onerror=()=>load(index+1);image.src=candidates[index];
  };
  load(0);
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
  const fonts=[["Noto Sans KR","Noto Sans KR · 가장 안정적"],["KoPubWorldDotum","KoPub 돋움"],["Gowun Dodum","고운돋움"],["OngleipKonkon","온글잎 콘콘체"],["Nanum Myeongjo","나눔명조"],["Nanum Pen Script","나눔펜스크립트"],["Gamja Flower","감자꽃"],["Gaegu","개구체"],["Poor Story","푸어스토리"]];
  dialog.innerHTML=`<form method="dialog"><div class="title"><div><h2>프로필 내보내기</h2><small>제목은 배민 도현체로 고정되고, 본문은 한글 전체가 확인된 글꼴만 선택할 수 있어요.</small></div><button value="cancel">×</button></div><label class="export-font-picker">본문 한글 글꼴<select name="exportFont">${fonts.map(([value,label])=>`<option value="${value}">${label}</option>`).join("")}</select></label><div class="profile-export-options"><button type="button" data-export-format="png"><b>PNG 이미지</b><small>선택한 글꼴로 바로 저장</small></button><button type="button" data-export-format="pdf"><b>PDF</b><small>PNG와 완전히 같은 디자인으로 인쇄</small></button></div></form>`;
  const selectedFont=()=>dialog.querySelector('[name="exportFont"]').value;
  dialog.querySelector('[data-export-format="png"]').onclick=()=>{exportProfilePngV2(character,true,selectedFont());dialog.close()};
  dialog.querySelector('[data-export-format="pdf"]').onclick=()=>{exportProfilePdfV2(character,selectedFont());dialog.close()};
  dialog.onclose=()=>dialog.remove();document.body.append(dialog);dialog.showModal();
}
function enhanceDynamicForms(){
  const feedbackIntro=document.querySelector(".feedback-card>p");
  if(feedbackIntro)feedbackIntro.textContent="Google 로그인 후 Firestore 피드백함에 먼저 저장하고 이메일 전달을 추가로 시도해요. 성공·실패 결과는 버튼 아래에 표시되며 게임 데이터 동기화는 실행하지 않습니다.";
  const profile=document.querySelector(".profile-license");
  if(profile){
    profile.querySelectorAll('[data-personality-field="interference"]').forEach(button=>{
      if(button.dataset.value==="컨트롤프릭"){button.dataset.value="통제광";button.textContent="통제광"}
    });
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
        select("gender","성별",["설정하지 않음","남성","여성","그외"],active().gender||"설정하지 않음")+
        select("attractionTarget","끌리는 대상",["설정하지 않음 · 누구에게도 끌리지 않음","여성에게 끌림","남성에게 끌림","여성과 남성에게 끌림","성별과 무관하게 끌림","그외 성별에게 끌림"],active().attractionTarget||"설정하지 않음 · 누구에게도 끌리지 않음")+
        select("relationshipOpenness","새로운 사람에게 끌리는 정도",["설정하지 않음 · 절대 끌리지 않음","연인이 없을 때만 취향이면 끌림","연인이 있어도 취향이면 끌릴 수 있음"],active().relationshipOpenness||"설정하지 않음 · 절대 끌리지 않음","사용자가 직접 설정하지 않으면 새로운 사람에게 절대 끌리지 않아요.")+
        select("wealth","재산",WEALTH_OPTIONS,active().wealth||"평범한 형편","캐릭터가 실제로 가진 경제적 여유예요. 소비 유형과는 별도로 계산돼요.")+
        select("touchReaction","신체 접촉에 대한 반응",["몸에 손이 닿는 것을 극도로 꺼림","몸에 손이 닿는 것을 싫어함","허락 없는 접촉은 불편함","가까운 사람에게만 허용함","상황에 따라 자연스럽게 받아들임","신체 접촉을 좋아함","먼저 다가가는 편"],active().touchReaction||"상황에 따라 자연스럽게 받아들임","상대 캐릭터의 반응과 공식 관계, 관계별 스킨십 강도를 함께 살펴 생활 장면을 자동으로 만들어요.");
      fields.append(block);
    }
    if(fields){
      const labelOf=selector=>fields.querySelector(selector)?.closest("label");
      const photo=labelOf('[data-image="photo"]'),primary=labelOf('[data-color="primary"]'),secondary=labelOf('[data-color="secondary"]');
      const gradient=profile.querySelector("[data-gradient]")?.closest("label");
      if(photo&&primary&&secondary&&gradient)photo.after(primary,secondary,gradient);
      const wake=labelOf('[data-field="wake"]'),wakeHabit=labelOf('[data-field="wakeHabit"]');
      const sleep=labelOf('[data-field="sleep"]'),sleepHabit=labelOf('[data-field="sleepHabit"]');
      if(wake&&wakeHabit)wake.after(wakeHabit);
      if(sleep&&sleepHabit)sleep.after(sleepHabit);
      const job=labelOf('[data-field="job"]'),jobTitle=labelOf('[data-field="jobTitle"]'),workplace=labelOf('[data-field="workplaceId"]'),income=labelOf('[data-field="income"]'),gender=labelOf('[data-field="gender"]'),orientation=labelOf('[data-field="attractionTarget"]'),wealth=labelOf('[data-field="wealth"]');
      if(job&&gender&&orientation)job.before(gender,orientation);
      if(job&&jobTitle)job.after(jobTitle);
      if(income&&wealth)income.before(wealth);
      if(workplace&&!profile.querySelector('[data-field="birthday"]')){
        const birthday=document.createElement("label");
        birthday.innerHTML=`생일 · 월일<input type="text" inputmode="numeric" maxlength="4" pattern="(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])" data-field="birthday" value="${active().birthday||""}" placeholder="예: 0804"><small>연도 없이 네 자리로 입력해요. 생일파티는 당일 오후 7시에 생성돼요.</small>`;
        workplace.after(birthday);
      }
      const license=profile.querySelector('[data-field="driverLicense"]')?.closest("label");
      if(license)fields.append(license);
      const exportButton=profile.querySelector("[data-export-profile]");
      if(exportButton)profile.append(exportButton);
    }
  }
  document.querySelectorAll("[data-profile-tags-summary]").forEach(summary=>{
    const values=active()[summary.dataset.profileTagsSummary]||[];
    summary.textContent=values.length?values.join(" · "):"정하지 않음";
  });
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
const maintenanceConfig=()=>window.PARALLEL_CITY_CONFIG?.maintenance||{};
const maintenanceEnabled=()=>Boolean(maintenanceConfig().enabled);
const ONBOARDING_KEY="drawer-village-onboarding-v1";
const SETUP_COACH_KEY="drawer-village-first-setup-v1";
const ROOM_EDITOR_TYPES={living:"거실",kitchen:"주방",entry:"현관",bath:"욕실",bedroom:"침실",study:"서재·취미방",dining:"다이닝룸",nursery:"아이방",guest:"손님방",hobby:"취미방",balcony:"베란다",storage:"창고",other:"기타 방"};
const ROOM_EDITOR_FURNITURE={
  living:["소파","TV","책장","오디오","안마의자","게임기","캣타워","턴테이블","보드게임장","홈시어터","프로젝터","악기 진열장","수집품 진열장","독서 의자","반려동물 장난감","러닝머신"],kitchen:["냉장고","조리대","식탁","오븐","커피머신","식기세척기","에스프레소 머신","티 세트","제빵 도구","칵테일 바","와인 냉장고","향신료 선반","요리책 선반"],
  entry:["신발장","전신거울","우산꽂이","반려동물 산책용품","자전거 보관대","운동 장비 선반","캠핑 장비"],bath:["샤워부스","욕조","세면대","세탁기","건조기","입욕제 선반","향수 선반","스킨케어 선반"],
  bedroom:["침대","옷장","화장대","협탁","빔프로젝터","독서등","향수 진열대","레코드 플레이어","작은 게임기","봉제인형","수집품 진열장"],study:["책상","컴퓨터","피아노","기타","그림 도구","재봉틀","운동기구","디지털 드로잉 장비","촬영 장비","보드게임 선반","공예 도구","뜨개 도구","프라모델 작업대","천체망원경","악기"],
  dining:["식탁","의자","찬장","티 테이블","와인장"],nursery:["아기 침대","수납장","놀이 매트","책장","기저귀 교환대"],
  guest:["침대","협탁","옷걸이","작은 책상","전신거울"],hobby:["작업대","수납장","그림 도구","재봉틀","악기","운동기구","디지털 드로잉 장비","촬영 장비","보드게임 선반","공예 도구","뜨개 도구","프라모델 작업대","천체망원경"],
  balcony:["화분","야외 의자","작은 테이블","빨래 건조대","원예 도구","캠핑 의자","천체망원경"],storage:["수납장","선반","보관 상자","옷걸이","캠핑 장비","운동 장비","수집품 상자"],other:["수납장","의자","작은 테이블","책장","오디오"]
};
const roomIllustration=(type="other",index=0)=>{
  const palettes={
    living:[["#e8d6bf","#a5785d"],["#d7e6df","#5b8476"]],kitchen:[["#e8e4da","#8c9a91"],["#f2dfc5","#b9825e"]],
    bedroom:[["#d9d6e8","#716b8d"],["#ead8dc","#a8707b"]],bath:[["#dceaf0","#6e9cac"],["#e3e6df","#779080"]],
    study:[["#dfd3c3","#76634f"],["#d9e1dc","#526f62"]],entry:[["#e6dfd8","#807064"],["#dce1e6","#65798a"]],
    other:[["#e3ded7","#7d7166"],["#d9e4df","#5d7a6e"]]
  };
  const [light,dark]=(palettes[type]||palettes.other)[index%2];
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520"><defs><linearGradient id="g" x2="0" y2="1"><stop stop-color="${light}"/><stop offset="1" stop-color="${dark}"/></linearGradient></defs><rect width="800" height="520" fill="url(#g)"/><rect y="360" width="800" height="160" fill="${dark}" opacity=".25"/><rect x="90" y="100" width="260" height="180" rx="12" fill="#fff" opacity=".42"/><path d="M110 120h220v140H110zM220 120v140M110 190h220" fill="none" stroke="${dark}" stroke-width="12" opacity=".55"/><rect x="430" y="285" width="250" height="95" rx="35" fill="#fff" opacity=".6"/><rect x="465" y="245" width="180" height="75" rx="28" fill="#fff" opacity=".52"/><circle cx="390" cy="405" r="42" fill="#fff" opacity=".42"/><rect x="350" y="400" width="80" height="16" rx="8" fill="${dark}" opacity=".45"/></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

function openRoomImageMenu(homeId,roomKey,{returnToEditor=true}={}){
  const room=state.homes[homeId]?.rooms?.[roomKey];if(!room)return;
  const usage=window.ParallelCityAuth?.getInfo?.().storageUsage||{};
  const usedMB=((Number(usage.bytes)||0)/1048576).toFixed(1);
  const maxMB=((Number(usage.maxBytes)||20*1048576)/1048576).toFixed(0);
  let movedForward=false;
  const dialog=document.createElement("dialog");dialog.className="room-image-dialog";
  dialog.innerHTML=`<form method="dialog"><div class="title"><div><small>${room.name||"방"}</small><h2>어떤 사진을 넣을까요?</h2></div><button value="close" aria-label="닫기">×</button></div><div class="room-image-choice"><button type="button" data-room-illustrations>🎨<b>일러스트 고르기</b><small>앱에 준비된 배경</small></button><button type="button" data-room-file>🖼️<b>이미지 첨부하기</b><small>내 기기에서 선택 · ${usedMB}MB / ${maxMB}MB 사용 중</small></button><button type="button" data-room-link>🔗<b>링크 추가하기</b><small>공개 이미지 주소 · 저장 용량 미사용</small></button></div></form>`;
  dialog.querySelector("[data-room-illustrations]").onclick=()=>{movedForward=true;dialog.close();openRoomIllustrations(homeId,roomKey)};
  dialog.querySelector("[data-room-file]").onclick=()=>{movedForward=true;dialog.close();pickImage("room",homeId,roomKey)};
  dialog.querySelector("[data-room-link]").onclick=async()=>{movedForward=true;dialog.close();await useImageUrl("room",homeId,roomKey)};
  dialog.onclose=()=>{dialog.remove();if(returnToEditor&&!movedForward)openRoomEditor(homeId,roomKey)};
  document.body.append(dialog);dialog.showModal();
}
function openRoomIllustrations(homeId,roomKey){
  const room=state.homes[homeId]?.rooms?.[roomKey];if(!room)return;
  const dialog=document.createElement("dialog");dialog.className="room-illustration-dialog";
  dialog.innerHTML=`<form method="dialog"><div class="title"><h2>방 일러스트 고르기</h2><button value="close">×</button></div><div class="room-illustration-grid">${[0,1].map(index=>`<button type="button" data-room-illustration="${index}" style="background-image:url('${roomIllustration(room.type,index)}')"><span>${index?"차분한 분위기":"포근한 분위기"}</span></button>`).join("")}</div></form>`;
  dialog.querySelectorAll("[data-room-illustration]").forEach(button=>button.onclick=()=>{setHomeImage(homeId,roomKey,roomIllustration(room.type,Number(button.dataset.roomIllustration)));dialog.close();render()});
  dialog.onclose=()=>dialog.remove();document.body.append(dialog);dialog.showModal();
}
function openRoomEditor(homeId,roomKey){
  const room=state.homes[homeId]?.rooms?.[roomKey];if(!room)return;
  const dialog=document.createElement("dialog");dialog.className="room-editor-dialog";
  const drawFurniture=()=>{const list=ROOM_EDITOR_FURNITURE[room.type]||ROOM_EDITOR_FURNITURE.other;return list.map(item=>`<button type="button" data-room-furniture="${item}" class="${(room.furniture||[]).includes(item)?"on":""}">${item}</button>`).join("")};
  dialog.innerHTML=`<form method="dialog"><div class="title"><div><small>방 편집</small><h2>${room.name||"방"}</h2></div><button value="close">×</button></div><div class="room-editor-fields"><label>방 이름<input name="name" value="${String(room.name||"방").replace(/"/g,"&quot;")}"></label><label>방 유형<select name="type">${Object.entries(ROOM_EDITOR_TYPES).map(([value,label])=>`<option value="${value}" ${room.type===value?"selected":""}>${label}</option>`).join("")}</select></label></div><button type="button" class="room-editor-photo" data-edit-room-photo>${room.image?`<span style="background-image:url('${room.image}')"></span><b>방 사진 변경</b>`:"<span>＋</span><b>방 사진 추가하기</b>"}</button><div class="room-editor-furniture-wrap"><b>이 방에 있는 가구</b><p class="room-editor-note">장면에 실제로 등장할 수 있는 가구만 선택해 주세요. 주민의 취미가 맞으면 능숙하게 즐기고, 낯선 취미라면 서툴게 시도하거나 관심 없이 지나쳐요.</p><div class="room-editor-furniture">${drawFurniture()}</div></div><div class="crop-actions"><button type="button" class="danger" data-room-delete>방 삭제</button><button class="primary" value="save">완료</button></div></form>`;
  const sync=()=>{updateRoom(homeId,roomKey,{name:dialog.querySelector('[name="name"]').value.trim()||"방"});const nextType=dialog.querySelector('[name="type"]').value;if(nextType!==room.type)setRoomType(homeId,roomKey,nextType)};
  dialog.querySelector('[name="type"]').onchange=()=>{sync();dialog.close();openRoomEditor(homeId,roomKey)};
  dialog.querySelector("[data-edit-room-photo]").onclick=()=>{sync();dialog.returnValue="photo";dialog.close();openRoomImageMenu(homeId,roomKey,{returnToEditor:true})};
  dialog.querySelectorAll("[data-room-furniture]").forEach(button=>button.onclick=()=>{toggleFurniture(homeId,roomKey,button.dataset.roomFurniture);button.classList.toggle("on")});
  dialog.querySelector("[data-room-delete]").onclick=()=>{if(confirm(`${room.name||"이 방"}을 삭제할까요?`)){deleteRoom(homeId,roomKey);dialog.close();explicitSave("방 삭제")}};
  dialog.onclose=()=>{if(dialog.returnValue==="save"){sync();save(true);render()}dialog.remove()};
  document.body.append(dialog);dialog.showModal();
}

function showOnboarding(){
  if(state.order.length||localStorage.getItem(ONBOARDING_KEY)==="done"||document.querySelector(".onboarding-dialog"))return;
  let step=0,userName=localStorage.getItem("drawer-village-user-name")||"";
  const dialog=document.createElement("dialog");dialog.className="onboarding-dialog";
  const pages=[
    ()=>`<small>WELCOME TO DRAWER VILLAGE</small><h1>서랍마을에 오신 것을 환영해요</h1><p>이곳은 당신의 서랍 안에 있는 작은 마을이에요.<br>캐릭터들은 각자의 집과 일상, 관계를 가지고 살아갑니다.</p><button class="primary" type="button" data-onboarding-next>마을 둘러보기</button>`,
    ()=>`<small>STEP 1 · 마을의 주인</small><h1>당신의 이름은 무엇인가요?</h1><p>마을 안내에서 불러드릴 이름이에요. 언제든 다시 바꿀 수 있어요.</p><label class="onboarding-name">이름<input name="userName" value="${userName.replace(/"/g,"&quot;")}" maxlength="20" placeholder="이름 또는 별명"></label><button class="primary" type="button" data-onboarding-next>다음</button>`,
    ()=>`<small>STEP 2 · 계정</small><h1>${userName||"마을 주인"}님의 기록을 보관할까요?</h1><p>Google 계정을 연결하면 사이트와 앱에서 같은 마을을 불러올 수 있어요. 지금은 건너뛰어도 괜찮아요.</p><div class="onboarding-actions"><button type="button" data-onboarding-login>Google 계정 연결</button><button class="primary" type="button" data-onboarding-next>나중에 연결하기</button></div>`,
    ()=>`<small>STEP 3 · 첫 주민</small><h1>첫 번째 캐릭터를 추가해 볼까요?</h1><p>먼저 기본 프로필만 만들어요. 캐릭터를 만든 다음 집과 마을을 차근차근 꾸밀 수 있어요.</p><button class="primary" type="button" data-onboarding-create>첫 캐릭터 만들기</button>`
  ];
  const paint=()=>{
    dialog.innerHTML=`<form method="dialog"><div class="onboarding-progress">${pages.map((_,index)=>`<i class="${index<=step?"on":""}"></i>`).join("")}</div><section>${pages[step]()}</section>${step?`<button type="button" class="onboarding-back" data-onboarding-back>← 이전</button>`:""}</form>`;
    dialog.querySelector("[data-onboarding-back]")?.addEventListener("click",()=>{step=Math.max(0,step-1);paint()});
    dialog.querySelector("[data-onboarding-next]")?.addEventListener("click",()=>{
      const input=dialog.querySelector('[name="userName"]');if(input){if(!input.value.trim()){input.focus();return}userName=input.value.trim();localStorage.setItem("drawer-village-user-name",userName)}
      step=Math.min(pages.length-1,step+1);paint();
    });
    dialog.querySelector("[data-onboarding-login]")?.addEventListener("click",async()=>{const auth=window.ParallelCityAuth;if(!auth)return showToast("로그인 기능을 불러오는 중이에요");await auth.login();step=3;paint()});
    dialog.querySelector("[data-onboarding-create]")?.addEventListener("click",()=>{if(createCharacter(characterLimit())){localStorage.setItem(ONBOARDING_KEY,"done");localStorage.setItem(SETUP_COACH_KEY,"home");dialog.close();state.activeTab="character";setCharacterPane("profile");save();render();showToast("첫 캐릭터의 이름부터 정해 볼까요?")}});
  };
  dialog.onclose=()=>dialog.remove();document.body.append(dialog);paint();dialog.showModal();
}
function showSetupCoach(){
  const step=localStorage.getItem(SETUP_COACH_KEY);
  if(!state.order.length||!["home","town"].includes(step)||document.querySelector("dialog[open]"))return;
  const dialog=document.createElement("dialog");dialog.className="setup-coach-dialog";
  if(step==="home"){
    dialog.innerHTML=`<form method="dialog"><small>첫 번째 꾸미기</small><h2>캐릭터가 살 집을 꾸며볼까요?</h2><p>방을 눌러 이름과 가구, 사진을 정할 수 있어요. 아직 준비되지 않았다면 나중에 해도 괜찮아요.</p><div><button value="later">나중에</button><button type="button" class="primary" data-start-home-setup>집 편집 시작</button></div></form>`;
    dialog.querySelector("[data-start-home-setup]").onclick=()=>{localStorage.setItem(SETUP_COACH_KEY,"home-editing");state.activeTab="home";setActiveHome(active()?.homeId||state.activeHomeId);setHomeEditMode(true);dialog.close();render()};
  }else{
    dialog.innerHTML=`<form method="dialog"><small>두 번째 꾸미기</small><h2>이제 마을도 둘러볼까요?</h2><p>건물 이름과 종류, 사진을 바꾸면 캐릭터들의 생활 장소도 함께 달라져요.</p><div><button value="later">나중에</button><button type="button" class="primary" data-start-town-setup>마을 편집 보기</button></div></form>`;
    dialog.querySelector("[data-start-town-setup]").onclick=()=>{localStorage.setItem(SETUP_COACH_KEY,"done");state.activeTab="town";dialog.close();render()};
  }
  dialog.onclose=()=>{if(dialog.returnValue==="later")localStorage.setItem(SETUP_COACH_KEY,"done");dialog.remove()};
  document.body.append(dialog);dialog.showModal();
}
function renderMaintenance(){
  const config=maintenanceConfig();
  document.body.classList.add("maintenance-mode");
  document.querySelector("#app").innerHTML=`<main class="maintenance-screen"><section><span>🛠️</span><p>EMERGENCY MAINTENANCE</p><h1>${config.title||"서랍마을을 잠시 점검하고 있어요"}</h1><p>${config.message||"예상치 못한 문제를 확인하고 있습니다."}</p><small>${config.eta||""}</small><button class="primary" type="button" id="maintenance-reload">다시 확인하기</button></section></main>`;
  document.querySelector("#maintenance-reload")?.addEventListener("click",()=>location.reload());
}

function render(){
  try{
    document.documentElement.dataset.uiFont=state.uiFont||"system";
    if(maintenanceEnabled()){renderMaintenance();return}
    document.body.classList.remove("maintenance-mode");
    renderApp(state);
    const grid=document.querySelector(".shop-product-grid");
    if(grid&&!grid.querySelector('[data-product-id="green_tea"]')){
      const card=document.createElement("article");
      card.className="premium-product one-time-product";
      card.innerHTML=`<div class="premium-product-heading"><span>응원</span><div><small>개발 응원</small><h2>개발자에게 녹차 사주기 🍵</h2></div><b>1,500원</b></div><p>원하는 만큼 장바구니에 담아 개발자를 응원할 수 있어요.</p><button class="primary premium-buy" data-cart-add="green_tea">장바구니에 담기</button>`;
      grid.insertBefore(card,grid.lastElementChild);
    }
    bind();
    applyTheme();
    requestAnimationFrame(showOnboarding);
    requestAnimationFrame(showSetupCoach);
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
  render();
}

function bind(){
  $$("[data-tab]").forEach(el=>el.onclick=()=>navigateToTab(el.dataset.tab));
  try{enhanceDynamicForms()}catch(error){console.error("동적 편집 화면 연결 실패",error)}
  const cartKey="drawer-village-cart";
  const readCart=()=>{try{return JSON.parse(localStorage.getItem(cartKey)||"{}")||{}}catch{return {}}};
  const writeCart=cart=>{localStorage.setItem(cartKey,JSON.stringify(cart));render()};
  $$("[data-cart-add]").forEach(el=>el.onclick=()=>{const cart=readCart(),id=el.dataset.cartAdd;cart[id]=(Number(cart[id])||0)+1;writeCart(cart);showToast(id==="green_tea"?`녹차 ${cart[id]}잔을 장바구니에 담았어요`:"장바구니에 담았어요")});
  $$("[data-cart-plus]").forEach(el=>el.onclick=()=>{const cart=readCart(),id=el.dataset.cartPlus;cart[id]=(Number(cart[id])||0)+1;writeCart(cart)});
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
    const residents=state.order.filter(id=>state.characters[id]?.residences?.some(item=>item.homeId===homeId));
    if(residents.length&&!residents.includes(state.activeId))setActive(residents[0]);
    render();
  });
  $("[data-add-home]")?.addEventListener("click",()=>{createHome();render();showToast("캐릭터와 별개인 새 집을 만들었습니다")});
  $("[data-home-edit]")?.addEventListener("click",async()=>{
    const residents=state.order.filter(id=>state.characters[id]?.residences?.some(item=>item.homeId===state.activeHomeId));
    if(residents.length&&!residents.includes(state.activeId))setActive(residents[0]);
    const was=state.homeEditMode;
    setHomeEditMode(!was);
    if(was&&localStorage.getItem(SETUP_COACH_KEY)==="home-editing")localStorage.setItem(SETUP_COACH_KEY,"town");
    render();
    if(was)await explicitSave("집 편집 저장");
  });
  $$("[data-email-compose]").forEach(link=>link.addEventListener("click",event=>{
    event.preventDefault();
    const opened=window.open(link.href,"_blank");
    if(!opened)window.location.href="mailto:kkyaareuk@gmail.com";
  }));
  $("[data-add-room]")?.addEventListener("click",()=>{addRoom(state.activeHomeId);render()});
  $$("[data-open-room-editor]").forEach(el=>{
    el.onclick=event=>{
      if(event.target.closest("[data-home-person],.room-pet"))return;
      event.stopPropagation();
      openRoomEditor(el.dataset.homeId,el.dataset.openRoomEditor);
    };
    el.onkeydown=event=>{if(["Enter"," "].includes(event.key)){event.preventDefault();openRoomEditor(el.dataset.homeId,el.dataset.openRoomEditor)}};
  });
  $$("[data-open-room-image-menu]").forEach(el=>el.onclick=event=>{event.stopPropagation();openRoomImageMenu(el.dataset.homeId,el.dataset.openRoomImageMenu)});
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
    const button=form.querySelector('button[type="submit"]'),status=form.querySelector(".feedback-status");
    if(!message){status.textContent="피드백 내용을 적어 주세요.";showToast("피드백 내용을 적어 주세요");return}
    const character=active(),auth=window.ParallelCityAuth,info=auth?.getInfo?.();
    if(!auth?.submitFeedback){
      status.textContent="Firebase 연결 코드를 불러오지 못했어요. 페이지를 새로고침한 뒤 다시 시도해 주세요.";
      showToast("피드백 연결을 불러오지 못했어요");return;
    }
    if(!info?.user){
      status.textContent="Google 로그인 후 피드백을 보낼 수 있어요. 위의 ‘Google 로그인 / 로그아웃’을 먼저 눌러 주세요.";
      showToast("Google 로그인이 필요합니다");return;
    }
    button.disabled=true;button.textContent="피드백함에 저장 중…";status.textContent="Firestore 피드백함에 안전하게 저장하는 중이에요.";
    try{
      await Promise.race([
        auth.submitFeedback({category,message,allowReply:true}),
        new Promise((_,reject)=>setTimeout(()=>reject(Object.assign(new Error("Firestore 응답 시간 초과"),{code:"feedback/timeout"})),12000))
      ]);
      form.reset();status.textContent="피드백함에 저장됐어요. 이메일 전달도 확인하는 중이에요.";showToast("피드백함에 저장됐어요");
      button.textContent="이메일 전달 확인 중…";
      try{
        const response=await Promise.race([
          fetch("https://formsubmit.co/ajax/kkyaareuk@gmail.com",{
            method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},
            body:JSON.stringify({_subject:`[서랍마을 ${category}] 사용자 피드백`,_template:"table",_captcha:"false",_replyto:info.user.email||"",분류:category,내용:message,현재_화면:TAB_META[state.activeTab]?.[0]||state.activeTab,선택_캐릭터:character?.name||"없음",보낸_시각:new Date().toLocaleString("ko-KR")})
          }),
          new Promise((_,reject)=>setTimeout(()=>reject(new Error("메일 응답 시간 초과")),8000))
        ]);
        const result=response.ok?await response.json().catch(()=>null):null;
        status.textContent=result&&[true,"true"].includes(result.success)
          ?"피드백함에 저장됐고 개발자 이메일에도 전달됐어요."
          :"피드백함 저장 완료 · 이메일 서비스는 전달을 확인하지 못했어요.";
      }catch{
        status.textContent="피드백함 저장 완료 · 이메일 전달은 실패했지만 내용은 안전하게 보관됐어요.";
      }
    }catch(error){
      console.error("Firestore 피드백 저장 실패",error);
      const subject=encodeURIComponent(`[서랍마을 ${category}] 사용자 피드백`);
      const body=encodeURIComponent(`${message}\n\n현재 화면: ${TAB_META[state.activeTab]?.[0]||state.activeTab}\n선택 캐릭터: ${character?.name||"없음"}\n보낸 시각: ${new Date().toLocaleString("ko-KR")}`);
      const gmailUrl=`https://mail.google.com/mail/?view=cm&fs=1&to=kkyaareuk%40gmail.com&su=${subject}&body=${body}`;
      const code=String(error?.code||error?.message||"알 수 없는 오류").replace("firebase/","");
      status.innerHTML=`피드백함 저장 실패 (${esc(code)}). Firebase 보안 규칙을 게시했는지 확인해 주세요. <a href="${gmailUrl}" target="_blank" rel="noopener noreferrer">Gmail 작성창으로 대신 보내기</a>`;
      showToast("피드백 저장에 실패했어요 · 화면의 오류를 확인해 주세요");
    }finally{button.disabled=false;button.textContent="피드백 보내기"}
  });
  $$("[data-delete-pet]").forEach(el=>el.onclick=()=>{if(confirm("이 함께 사는 존재를 삭제할까요?")){deletePet(el.dataset.homeId,el.dataset.deletePet);render()}});
  $$("[data-pet-image]").forEach(el=>el.onclick=()=>pickImage(`pet${el.dataset.petImage==="icon"?"Icon":"Photo"}`,el.dataset.homeId,el.dataset.petId));
  $$("[data-home-name]").forEach(el=>el.oninput=()=>updateHome(el.dataset.homeId,{name:el.value.trim()||"이름 없는 집"}));
  $$("[data-home-field]").forEach(el=>{
    const apply=()=>updateHome(el.dataset.homeId,{[el.dataset.homeField]:el.value});
    el.oninput=apply;el.onchange=apply;
  });
  $$("[data-delete-home]").forEach(el=>el.onclick=()=>{
    const home=state.homes[el.dataset.deleteHome];if(!home)return;
    if(confirm(`‘${home.name}’을 삭제할까요?\n\n이 집의 방·사진·함께 사는 존재·자동차도 함께 삭제됩니다. 연결된 캐릭터는 삭제되지 않고 다른 집 연결은 유지됩니다.`)){
      deleteHome(home.id);render();showToast("집을 삭제하고 삭제 기록을 보관했습니다");
    }
  });
  $$("[data-room-name]").forEach(el=>el.oninput=()=>updateRoom(el.dataset.homeId,el.dataset.roomName,{name:el.value.trim()||"방"}));
  $$("[data-room-type]").forEach(el=>el.onchange=()=>{
    const editors=$$(".mobile-room-editors details"),openIndex=editors.indexOf(el.closest("details"));
    setRoomType(el.dataset.homeId,el.dataset.roomType,el.value);render();
    requestAnimationFrame(()=>{const next=$$(".mobile-room-editors details")[openIndex];if(next)next.open=true});
  });
  $$("[data-delete-room]").forEach(el=>el.onclick=()=>{
    const home=state.homes[el.dataset.homeId];
    if(Object.keys(home?.rooms||{}).length<=1)return alert("집에는 방이 최소 하나 필요해요.");
    if(confirm(`‘${home.rooms[el.dataset.deleteRoom]?.name||"이 방"}’을 삭제할까요?\n이 방을 쓰던 구성원은 남은 방으로 자동 이동해요.`)){
      if(deleteRoom(el.dataset.homeId,el.dataset.deleteRoom)){render();explicitSave("방 삭제")}
    }
  });
  $$("[data-sleep-room]").forEach(el=>el.onchange=()=>{updateCharacter(el.dataset.sleepRoom,{sleepRoomId:el.value});render()});
  $$("[data-furniture]").forEach(el=>el.onclick=()=>{
    toggleFurniture(el.dataset.homeId,el.dataset.room,el.dataset.furniture);
    el.classList.toggle("on",state.homes[el.dataset.homeId]?.rooms?.[el.dataset.room]?.furniture?.includes(el.dataset.furniture));
    document.querySelectorAll(`[data-furniture="${CSS.escape(el.dataset.furniture)}"][data-home-id="${CSS.escape(el.dataset.homeId)}"][data-room="${CSS.escape(el.dataset.room)}"]`).forEach(button=>button.classList.toggle("on",el.classList.contains("on")));
  });
  $$("[data-home-resident]").forEach(el=>el.onclick=()=>{
    const homeId=el.dataset.homeId,id=el.dataset.homeResident;
    const connected=state.characters[id]?.residences?.some(item=>item.homeId===homeId);
    connected?removeCharacterResidence(id,homeId):addCharacterResidence(id,homeId);
    render();
  });
  $$("[data-residence-field]").forEach(el=>{
    const apply=()=>{updateCharacterResidence(el.dataset.characterId,el.dataset.homeId,{[el.dataset.residenceField]:el.value});if(["role","stayPattern","sleepRoomId"].includes(el.dataset.residenceField))render()};
    el.oninput=apply;el.onchange=apply;
  });
  $$("[data-residence-day]").forEach(el=>el.onclick=()=>{
    const c=state.characters[el.dataset.characterId],residence=c?.residences?.find(item=>item.homeId===el.dataset.homeId);if(!residence)return;
    const day=Number(el.dataset.residenceDay),days=Array.isArray(residence.visitDays)?residence.visitDays:[];
    updateCharacterResidence(c.id,residence.homeId,{visitDays:days.includes(day)?days.filter(value=>value!==day):[...days,day].sort()});
    render();
  });
  $$("[data-residence-primary]").forEach(el=>el.onclick=()=>{updateCharacterResidence(el.dataset.residencePrimary,el.dataset.homeId,{isPrimary:true});render();showToast("기준 주거지로 지정했습니다")});
  $$("[data-home-town]").forEach(el=>el.onchange=()=>{updateCharacter(el.dataset.homeTown,{townId:el.value});render()});
  $$("[data-personality-field]").forEach(el=>el.onclick=()=>{updateCharacter(active().id,{[el.dataset.personalityField]:el.dataset.value});render()});
  $$("[data-personality-type]").forEach(el=>el.onclick=()=>{
    const character=active(),value=el.dataset.personalityType,current=Array.isArray(character.personalityTypes)?character.personalityTypes:[];
    let next;
    if(current.includes(value))next=current.filter(item=>item!==value);
    else if(current.length<4)next=[...current,value];
    else return showToast("전체 성격 유형은 최대 4개까지 고를 수 있어요");
    updateCharacter(character.id,{personalityTypes:next});render();
  });
  const toggleTraitSetting=(key,value)=>{
    const character=active(),current=Array.isArray(character[key])?character[key]:[];
    let next;
    if(current.includes(value))next=current.filter(item=>item!==value);
    else if(current.length<8)next=[...current,value];
    else return showToast("서사·인지 특성은 각 영역에서 최대 8개까지 고를 수 있어요");
    updateCharacter(character.id,{[key]:next});render();
  };
  $$("[data-character-trait]").forEach(el=>el.onclick=()=>toggleTraitSetting("characterTraits",el.dataset.characterTrait));
  $$("[data-trait-expression]").forEach(el=>el.onclick=()=>toggleTraitSetting("traitExpressions",el.dataset.traitExpression));
  $$("[data-trait-notes]").forEach(el=>el.oninput=()=>{
    updateCharacter(active().id,{traitNotes:el.value.slice(0,1200)},false);
    save();
  });
  $("[data-trait-notes-in-scripts]")?.addEventListener("change",e=>{updateCharacter(active().id,{traitNotesInScripts:e.target.checked});render()});
  const setNestedValue=(target,path,value)=>{
    const parts=String(path||"").split("."),last=parts.pop();
    let cursor=target;
    parts.forEach(part=>{if(!cursor[part]||typeof cursor[part]!=="object"||Array.isArray(cursor[part]))cursor[part]={};cursor=cursor[part]});
    cursor[last]=value;
  };
  $$("[data-body-field]").forEach(el=>{
    const eventName=el.tagName==="SELECT"?"change":"input";
    el.addEventListener(eventName,()=>{
      const bodyProfile=structuredClone(active().bodyProfile||{});
      setNestedValue(bodyProfile,el.dataset.bodyField,el.value);
      updateCharacter(active().id,{bodyProfile},false);save();
    });
  });
  $$("[data-body-list]").forEach(el=>el.onclick=()=>{
    const bodyProfile=structuredClone(active().bodyProfile||{}),parts=el.dataset.bodyList.split("."),last=parts.pop();
    let cursor=bodyProfile;
    parts.forEach(part=>{if(!cursor[part]||typeof cursor[part]!=="object"||Array.isArray(cursor[part]))cursor[part]={};cursor=cursor[part]});
    const current=Array.isArray(cursor[last])?cursor[last]:[],value=el.dataset.value;
    cursor[last]=current.includes(value)?current.filter(item=>item!==value):[...current,value];
    updateCharacter(active().id,{bodyProfile});render();
  });
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
  $$("[data-character-interaction]").forEach(el=>el.onclick=()=>{
    const item=String($("[data-character-interaction-item]")?.value||"").split(":");
    const type=el.dataset.characterInteraction,targetId=$("[data-character-interaction-target]")?.value||"";
    if(recordCharacterInteraction({type,actorId:active().id,targetId,itemKind:item[0],itemId:item.slice(1).join(":")})){
      showToast(type==="gift"?"선물을 건넸어요":type==="exercise"?"함께 운동을 시작했어요":type==="outing"?"함께 나들이를 시작했어요":"물건을 구매했어요");render();
    }else showToast("상대와 물건을 먼저 골라 주세요");
  });
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
    state.characterViewSource=button.dataset.viewSource;
    save();
    $$("[data-view-source]").forEach(item=>item.classList.toggle("on",item===button));
    $$("[data-view-panel]").forEach(panel=>panel.hidden=panel.dataset.viewPanel!==button.dataset.viewSource);
  });
  $$("[data-open-view-dialog]").forEach(button=>button.onclick=()=>{
    const dialog=document.querySelector(`[data-view-dialog="${CSS.escape(button.dataset.openViewDialog)}"]`);
    dialog?.showModal();
  });
  $$("[data-character-view]").forEach(select=>select.onchange=()=>{
    const source=select.dataset.source,target=select.dataset.target,field=select.dataset.viewField;
    if(field==="touchIntensity"&&select.value==="성인 간 친밀한 접촉까지"&&[source,target].some(id=>["영아","유아","어린이","청소년"].includes(state.characters[id]?.ageGroup))){
      select.value="신체 접촉 없음";
      showToast("성인 간 친밀한 접촉 범위는 성인 캐릭터끼리만 설정할 수 있어요");
    }
    state.characterViews=state.characterViews&&typeof state.characterViews==="object"?state.characterViews:{};
    state.characterViews[source]=state.characterViews[source]&&typeof state.characterViews[source]==="object"?state.characterViews[source]:{};
    state.characterViews[source][target]=state.characterViews[source][target]&&typeof state.characterViews[source][target]==="object"?state.characterViews[source][target]:{};
    if(["정하지 않음","선택하지 않음"].includes(select.value))delete state.characterViews[source][target][field];
    else state.characterViews[source][target][field]=select.value;
    if(field==="overall"){
      const summary=$$("[data-view-summary]").find(item=>item.dataset.viewSummary===`${source}:${target}`);
      if(summary)summary.textContent=select.value;
    }
    const physicalWarning=field==="aggressionAction"&&["상대를 밀칠 수 있음","실제로 때릴 수 있음","심한 폭력을 행사할 수 있음"].includes(select.value);
    save();showToast(physicalWarning
      ?"주의: 이 단계부터는 충동·갈등·성격 조건이 함께 맞을 때 물리적 행동 장면이 나올 수 있어요"
      :`${state.characters[source]?.name||"캐릭터"}의 생각을 저장했어요`);
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

function navigateToTab(tab){
  if(!["observe","home","character","catalog","relationship","routine","town","shop","settings"].includes(tab))return;
  state.activeTab=tab;
  save();
  render();
  window.scrollTo({top:0,behavior:"auto"});
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
    applyImage(type,id,room,url.href);
    render();
    showToast("이미지 링크를 저장했습니다 · 사진 저장 용량을 사용하지 않아요");
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
  const ratios={photo:4/3,icon:1,petIcon:1,petPhoto:4/3,catalogImage:4/3,room:16/9,home:16/9,place:1,placeInterior:16/9};
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
  if(e.townId&&e.townId!==state.activeTownId)switchTown(e.townId,{activeId:id});
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

const RELATION_TYPES=["친구","연인","부부","부모·자녀","형제·자매","동거인","소꿉친구","학창 시절 친구들","친구 모임","산악회","동아리 동료","직장 동료","라이벌","혐관","기타"];
const RELATION_STAGES={
  연인:["이별 통보 직전","마음이 멀어지는 중","위태로운 사이","서로 알아가는 중","편안한 연인","서로를 깊이 사랑함","운명의 상대"],
  부부:["이혼 서류가 오가는 중","별거를 고민하는 중","권태기","생활 동반자","애정이 깊은 부부","서로 없이는 못 사는 사이","운명의 상대"],
  친구:["거의 안 친함","어색한 사이","가끔 연락함","편한 친구","가까운 친구","아주 가까운 친구","베스트 프렌드"],
  혐관:["원수지간","마주치면 싸움","서로 못마땅함","신경전 중","경쟁하며 의식함","티격태격함"],
  "부모·자녀":["연락이 끊긴 사이","서먹한 부모와 자녀","필요할 때만 연락함","무난한 부모와 자녀","서로 의지하는 가족","무척 각별한 부모와 자녀"],
  "형제·자매":["연락이 끊긴 형제자매","서로 불편한 형제자매","필요할 때만 연락함","무난한 형제자매","친구 같은 형제자매","서로를 가장 잘 아는 형제자매"],
  동거인:["서로 거의 모르는 동거인","생활만 공유하는 동거인","어색한 동거인","무난한 동거인","편한 동거인","친구 같은 동거인","유사가족 같은 동거인"],
  default:["매우 불편함","서먹함","조금 가까움","편안함","가까움","매우 가까움"]
};
const PAST_RELATION_STAGES={
  연인:["헤어진 직후라 마음을 추스르는 중","미련이 남은 전 연인","어색한 전 연인","가끔 연락하는 전 연인","완전히 정리된 전 연인"],
  부부:["이혼 직후라 슬퍼하는 중","재산과 생활을 정리하는 중","갈등이 남은 이혼 상대","필요할 때만 연락하는 이혼 상대","완전히 정리된 이혼 상대"],
  친구:["절교 직후","서로 피하는 옛 친구","연락이 끊긴 친구","가끔 소식을 듣는 옛 친구","추억으로 남은 친구"],
  "부모·자녀":["절연 직후","서로 피하는 부모와 자녀","가족 행사에서만 마주침","연락이 끊긴 부모와 자녀"],
  "형제·자매":["절연 직후","서로 피하는 형제자매","가족 행사에서만 마주침","연락이 끊긴 형제자매"],
  default:["관계가 끝난 직후","아직 감정이 남아 있음","서로 피하는 중","필요할 때만 연락함","완전히 정리된 과거 관계"]
};
const stagesFor=(type,temporalStatus="current")=>temporalStatus==="past"?(PAST_RELATION_STAGES[type]||(["소꿉친구","학창 시절 친구들","친구 모임","산악회"].includes(type)?PAST_RELATION_STAGES.친구:PAST_RELATION_STAGES.default)):(RELATION_STAGES[type]||(["소꿉친구","학창 시절 친구들","친구 모임","산악회"].includes(type)?RELATION_STAGES.친구:RELATION_STAGES.default));
const FAULT_REASONS=["정하지 않음","누구의 잘못도 아님","성격 차이","신뢰를 깨뜨림","거짓말과 은폐","금전 문제","빚·과소비","재산·수입 갈등","약속·책임을 지키지 않음","일방적인 연락 단절","지나친 통제와 간섭","반복된 갈등","가족·주변인의 개입","생활 방식·미래 계획 차이","거리·이사·환경 변화","직장·학교 등 여건 변화","서로 자연스럽게 멀어짐","기타"];
const relationViewDefaults=(type,temporalStatus="current")=>{
  if(temporalStatus==="past")return {overall:"그저 그런 사람",importance:"선택하지 않음",awareness:"자기 감정을 분명히 자각함",mutualAwareness:"상대의 마음을 전혀 모름",trust:"조심스럽게 지켜봄",closeness:"거리감 있음",comfort:"어색하지만 필요한 대화는 무난함",annoyance:"가끔 성가심",attention:"관심 없음",jealousy:"질투하지 않음",conflictIntensity:"가끔 부딪힘",expectation:"언제든 끝날 수 있다고 생각함",touchIntensity:"신체 접촉 없음",aggression:"공격 충동 없음",aggressionAction:"행동으로 옮기지 않음"};
  if(["연인","부부"].includes(type))return {overall:"연애 감정으로 좋아함",importance:"1순위 · 가장 중요한 사람",awareness:"자기 감정을 분명히 자각함",mutualAwareness:"서로의 마음을 확인함",trust:"어느 정도 믿음",closeness:"가까운 사이",comfort:"편안하고 농담과 장난이 잘 통함",annoyance:"전혀 귀찮거나 성가시지 않음",attention:"자주 살핌",jealousy:"가끔 신경 쓰임",conflictIntensity:"갈등이 거의 없음",expectation:"오래 함께할 거라 기대함",touchIntensity:"포옹·기대기까지",aggression:"공격 충동 없음",aggressionAction:"행동으로 옮기지 않음"};
  if(["부모·자녀","형제·자매"].includes(type))return {overall:"소중하게 여김",importance:type==="부모·자녀"?"1순위 · 가장 중요한 사람":"2순위",awareness:"자기 감정을 분명히 자각함",mutualAwareness:"상대가 느끼는 감정을 알고 있음",trust:"어느 정도 믿음",closeness:"가까운 사이",comfort:"편안하고 농담과 장난이 잘 통함",annoyance:"가끔 성가심",attention:"종종 신경 씀",jealousy:"질투하지 않음",conflictIntensity:"가끔 부딪힘",expectation:"평생 이어질 관계라고 믿음",touchIntensity:"포옹·기대기까지",aggression:"공격 충동 없음",aggressionAction:"행동으로 옮기지 않음"};
  if(["친구","소꿉친구","학창 시절 친구들","친구 모임"].includes(type))return {overall:"친구로 좋아함",importance:"3순위",awareness:"자기 감정을 분명히 자각함",mutualAwareness:"상대가 느끼는 감정을 알고 있음",trust:"어느 정도 믿음",closeness:"편한 사이",comfort:"편안하고 농담과 장난이 잘 통함",annoyance:"전혀 귀찮거나 성가시지 않음",attention:"종종 신경 씀",jealousy:"질투하지 않음",conflictIntensity:"갈등이 거의 없음",expectation:"오래 함께할 거라 기대함",touchIntensity:"인사·부축 같은 의례적 접촉만",aggression:"공격 충동 없음",aggressionAction:"행동으로 옮기지 않음"};
  if(type==="혐관")return {overall:"매우 싫어함",importance:"선택하지 않음",awareness:"자기 감정을 분명히 자각함",mutualAwareness:"상대가 느끼는 감정을 알고 있음",trust:"전혀 믿지 않음",closeness:"거리감 있음",comfort:"함께 있으면 매우 불편하고 대화도 전혀 통하지 않음",annoyance:"보기만 해도 피곤함",attention:"종종 신경 씀",jealousy:"질투하지 않음",conflictIntensity:"자주 충돌함",expectation:"언제든 끝날 수 있다고 생각함",touchIntensity:"신체 접촉 없음",aggression:"거친 말을 하고 싶은 충동",aggressionAction:"대부분 참지만 가끔 거친 말이 나옴"};
  return {overall:"그저 그런 사람",importance:"선택하지 않음",awareness:"자기 감정을 분명히 자각함",mutualAwareness:"상대의 마음을 전혀 모름",trust:"보통",closeness:"보통",comfort:"어색하지만 필요한 대화는 무난함",annoyance:"전혀 귀찮거나 성가시지 않음",attention:"필요할 때만 봄",jealousy:"질투하지 않음",conflictIntensity:"갈등이 거의 없음",expectation:"정하지 않음",touchIntensity:"신체 접촉 없음",aggression:"공격 충동 없음",aggressionAction:"행동으로 옮기지 않음"};
};
function openRelationDialog(id=""){
  if(state.order.length<2)return alert("캐릭터가 두 명 이상 필요해요.");
  const old=id?state.relationships[id]:null,dialog=document.createElement("dialog");dialog.className="relation-dialog relation-editor-dialog";
  const oldGroup=old?.groupId?Object.values(state.relationships).filter(relation=>relation.groupId===old.groupId):old?[old]:[];
  const oldMembers=old?.groupMembers?.length?old.groupMembers:[old?.a,old?.b].filter(Boolean);
  const oldMothers=[...new Set(oldGroup.filter(relation=>relation.parentRole==="엄마").map(relation=>relation.parentId||relation.a))];
  const oldFathers=[...new Set(oldGroup.filter(relation=>relation.parentRole==="아빠").map(relation=>relation.parentId||relation.a))];
  const oldChildren=[...new Set(oldGroup.filter(relation=>relation.type==="부모·자녀").map(relation=>relation.childId||relation.b))];
  const oldKinshipByPair=Object.assign({},...oldGroup.map(relation=>relation.kinshipByPair||{[[relation.a,relation.b].sort().join("~")]:relation.kinship||"blood"}));
  const oldSiblingKinshipByPair=Object.assign({},...oldGroup.map(relation=>relation.siblingKinshipByPair||{}));
  const characterChecks=(name,selected=[])=>state.order.map(cid=>`<label class="relation-character-chip" data-role-character="${cid}"><input type="checkbox" name="${name}" value="${cid}" ${selected.includes(cid)?"checked":""}> ${state.characters[cid].name}</label>`).join("");
  const miniAvatar=cid=>{const c=state.characters[cid],src=c?.icon||c?.photo;return src?`<img class="relation-mini-avatar" src="${src}" alt="">`:`<span class="relation-mini-avatar fallback">${String(c?.name||"?").slice(0,1)}</span>`};
  dialog.innerHTML=`<form method="dialog"><div class="title"><div><h2>${old?"관계 편집":"관계 추가"}</h2></div><button value="cancel">×</button></div>
    <fieldset class="relation-member-picker"><legend>관계에 포함할 캐릭터 · 두 명 이상</legend><div>${characterChecks("member",oldMembers.length?oldMembers:[state.activeId,state.order.find(cid=>cid!==state.activeId)].filter(Boolean))}</div><small>여기서 바로 캐릭터를 더하거나 뺄 수 있어요. 여러 명의 연인·부부 관계도 가능해요.</small></fieldset>
    <label class="relation-temporal"><input type="checkbox" name="temporalStatus" value="past" ${old?.temporalStatus==="past"?"checked":""}><span><b>과거의 관계</b><small>체크하면 ‘헤어진 연인·이혼한 부부·절연한 친구’처럼 바뀝니다.</small></span></label>
    <section class="relation-order-control"><b>두 명 관계 카드의 표시 순서</b><span data-relation-order-label></span><button type="button" data-swap-relation-order>↔ 좌우 바꾸기</button><small>예: 리바이 × 안테와 안테 × 리바이 중 원하는 배치를 선택해요.</small></section>
    <fieldset class="parent-direction" hidden><legend>선택한 구성원의 부모와 자녀 역할</legend><div class="parent-columns"><section><b>엄마 역할 · 여러 명 가능</b><div>${characterChecks("mother",oldMothers)}</div></section><section><b>아빠 역할 · 여러 명 가능</b><div>${characterChecks("father",oldFathers)}</div></section><span>→</span><section><b>자녀 · 여러 명 가능</b><div>${characterChecks("child",oldChildren)}</div></section></div><div class="parent-kinship-grid" data-parent-kinship></div><small>위에서 선택한 관계 구성원만 표시됩니다. 부모와 자녀 조합마다 혈연 여부를 따로 정할 수 있어요.</small></fieldset>
    <fieldset class="sibling-direction" hidden><legend>선택한 구성원의 형제·자매 순서와 혈연</legend><div class="sibling-role-list">${state.order.map((cid,index)=>`<label data-role-character="${cid}"><b>${state.characters[cid].name}</b><span>순서<select name="siblingOrder" data-sibling-id="${cid}">${state.order.map((_,order)=>`<option value="${order+1}" ${(old?.siblingOrder?.[cid]||index+1)===order+1?"selected":""}>${order+1}번째</option>`).join("")}</select></span></label>`).join("")}</div><div class="sibling-kinship-grid" data-sibling-kinship></div><small>혈연은 사람 한 명이 아니라 두 사람의 조합마다 정합니다. 셋이 모두 비혈연이면 성별 구성에 따라 의형제·의자매·의남매로 표시돼요.</small></fieldset>
    <label>관계의 정체<select name="type">${RELATION_TYPES.map(type=>`<option value="${type}">${type}</option>`).join("")}</select><small class="relation-type-help" data-relation-type-help></small></label>
    <label><span data-stage-label>현재 관계 단계</span><select name="stage"></select></label>
    <fieldset class="past-fault" hidden><legend>관계가 끝난 책임과 이유</legend><label>주된 책임이 있는 쪽<select name="faultParty"></select></label><label>무슨 일이 있었나요?<select name="faultReason">${FAULT_REASONS.map(value=>`<option ${old?.faultReason===value?"selected":""}>${value}</option>`).join("")}</select></label><small>속마음이나 호감과는 별개예요. 관계가 끝난 사건과 이후 장면의 긴장에 사용됩니다.</small></fieldset>
    <label class="relation-officiality">관계가 밖에서 다뤄지는 방식<select name="legalStatus">${["관계를 따로 명명하지 않음","당사자끼리만 관계를 인정함","가까운 사람에게만 알림","누구에게나 공개함","법적으로 관계가 등록됨"].map(value=>`<option>${value}</option>`).join("")}</select><small data-officiality-help>감정을 뜻하는 항목이 아니에요. 맨 위는 밖에서 관계 이름을 쓰지 않는 상태이고, 아래로 갈수록 공개 범위가 넓어집니다.</small></label>
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
    f.querySelector(".relation-order-control").hidden=selected.length!==2||["부모·자녀","형제·자매"].includes(f.type.value);
    f.querySelector("[data-relation-order-label]").textContent=selected.length===2?`${state.characters[pairOrder[0]]?.name||""} × ${state.characters[pairOrder[1]]?.name||""}`:"두 명을 선택하면 순서를 바꿀 수 있어요.";
    [".parent-direction",".sibling-direction"].forEach(selector=>f.querySelector(selector)?.querySelectorAll("[data-role-character]").forEach(label=>{
      const visible=selected.includes(label.dataset.roleCharacter);
      label.hidden=!visible;
      if(!visible)label.querySelectorAll('input[type="checkbox"]').forEach(input=>input.checked=false);
    }));
    refreshParentKinship();
    refreshSiblingKinship();
    refreshFaultParties();
  };
  const kinshipKey=(a,b)=>[a,b].sort().join("~");
  const refreshParentKinship=()=>{
    const box=f.querySelector("[data-parent-kinship]");if(!box)return;
    const parents=[...f.querySelectorAll('[name="mother"]:checked,[name="father"]:checked')].map(input=>input.value),children=[...f.querySelectorAll('[name="child"]:checked')].map(input=>input.value);
    box.innerHTML=parents.flatMap(parent=>children.filter(child=>child!==parent).map(child=>{const key=kinshipKey(parent,child),blood=oldKinshipByPair[key]!=="nonblood";return `<label><span><b>${state.characters[parent]?.name} ↔ ${state.characters[child]?.name}</b><small>이 부모와 자녀 사이</small></span><input type="checkbox" data-parent-blood="${key}" ${blood?"checked":""}> 혈연</label>`})).join("");
  };
  const refreshSiblingKinship=()=>{
    const box=f.querySelector("[data-sibling-kinship]");if(!box)return;
    const members=checkedMembers();
    box.innerHTML=members.flatMap((a,index)=>members.slice(index+1).map(b=>{
      const key=kinshipKey(a,b);
      let selected=oldSiblingKinshipByPair[key];
      if(!selected&&old?.siblingBlood)selected=old.siblingBlood[a]!==false&&old.siblingBlood[b]!==false?(old.siblingBloodType?.[a]==="half"||old.siblingBloodType?.[b]==="half"?"half":"full"):"nonblood";
      selected=selected||"full";
      return `<label class="sibling-pair-card"><span class="sibling-pair-people">${miniAvatar(a)}<b>${state.characters[a]?.name}</b><i>↔</i>${miniAvatar(b)}<b>${state.characters[b]?.name}</b></span><select data-sibling-kinship-pair="${key}"><option value="full" ${selected==="full"?"selected":""}>양쪽 부모가 같은 혈연</option><option value="half" ${selected==="half"?"selected":""}>한쪽 부모만 같은 혈연</option><option value="nonblood" ${selected==="nonblood"?"selected":""}>비혈연 · 서로를 형제로 선택함</option></select></label>`;
    })).join("");
  };
  const temporalStatus=()=>f.querySelector('[name="temporalStatus"]:checked')?.value||"current";
  const refreshFaultParties=()=>{
    const select=f.faultParty;if(!select)return;
    const members=checkedMembers(),values=[["","정하지 않음"],["none","누구의 잘못도 아님"],["both","양쪽 모두"],...members.map(id=>[id,state.characters[id]?.name||id])];
    select.innerHTML=values.map(([value,label])=>`<option value="${value}" ${old?.faultParty===value?"selected":""}>${label}</option>`).join("");
    f.querySelector(".past-fault").hidden=temporalStatus()!=="past";
  };
  const pastTypeLabels={연인:"헤어진 연인",부부:"이혼한 부부",친구:"절연한 친구","소꿉친구":"멀어진 소꿉친구","학창 시절 친구들":"멀어진 학창 시절 친구","직장 동료":"전 직장 동료","형제·자매":"절연한 형제·자매","부모·자녀":"절연한 부모·자녀",동거인:"옛 동거인",라이벌:"과거의 라이벌",혐관:"과거의 악연"};
  const refreshTemporalLabels=()=>{
    const past=temporalStatus()==="past";
    [...f.type.options].forEach(option=>option.textContent=past?(pastTypeLabels[option.value]||`과거의 ${option.value}`):option.value);
    f.querySelector("[data-stage-label]").textContent=past?"과거 관계 단계":"현재 관계 단계";
  };
  const refreshStages=()=>{refreshTemporalLabels();const values=stagesFor(f.type.value,temporalStatus()),selected=old?.stage&&values.includes(old.stage)?old.stage:values[Math.floor(values.length/2)];f.stage.innerHTML=values.map(value=>`<option ${value===selected?"selected":""}>${value}</option>`).join("")};
  const relationTypeHelp={
    "부모·자녀":"누가 부모이고 누가 자녀인지 역할이 있는 관계예요. 혈연·입양·법적 등록 여부는 아래 공개·공적 기록 항목으로 따로 정합니다.",
    "형제·자매":"선택한 구성원마다 첫째·둘째 순서와 혈연·이복·이부·비혈연 여부를 따로 정하는 관계예요.",
    동거인:"같은 집에서 생활을 공유하는 관계예요. 거의 모르는 사이부터 친구, 유사가족 같은 동거인까지 단계로 표현합니다."
  };
  const updateType=()=>{
    refreshStages();
    const parent=f.type.value==="부모·자녀",sibling=f.type.value==="형제·자매";
    f.querySelector(".parent-direction").hidden=!parent;
    f.querySelector(".sibling-direction").hidden=!sibling;
    f.querySelector(".relation-member-picker").hidden=false;
    f.querySelector("[data-relation-type-help]").textContent=relationTypeHelp[f.type.value]||"두 사람 사이를 밖에서 어떤 관계라고 부르는지 정합니다. 속마음과 신뢰는 캐릭터별 시선에서 따로 설정해요.";
    f.querySelector("[data-officiality-help]").textContent=["부모·자녀","형제·자매"].includes(f.type.value)?"마지막 ‘법적으로 관계가 등록됨’은 가족관계·입양처럼 이 가족 역할이 공적 서류에 기록된 경우예요. 혈연 여부와는 별개입니다.":"맨 위는 밖에서 관계 이름을 쓰지 않는 상태이고, 아래로 갈수록 공개 범위가 넓어집니다. 마지막은 이 관계와 관련된 공적 서류가 있는 경우예요.";
    if(f.type.value==="동거인")f.cohabit.checked=true;
    f.cohabit.disabled=f.type.value==="동거인";
    syncPairOrder();
    refreshFaultParties();
  };
  const officialityMigration={"법적으로 명시되지 않음":"관계를 따로 명명하지 않음","외부에는 숨김":"당사자끼리만 관계를 인정함","당사자 사이에서만 인정함":"당사자끼리만 관계를 인정함","남들 앞에서도 공개함":"누구에게나 공개함","법적으로 가족임":"법적으로 관계가 등록됨","법적으로 보호 관계임":"법적으로 관계가 등록됨"};
  f.type.value=old?.type==="폴리 관계"?"연인":old?.type==="절친"||old?.type==="대학 동기"||old?.type==="젊은 날의 친구들"?"친구":["유사가족","가족","보호·피보호"].includes(old?.type)?"동거인":old?.type||"친구";updateType();f.type.onchange=updateType;f.cohabit.checked=Boolean(old?.cohabit);f.legalStatus.value=officialityMigration[old?.legalStatus]||old?.legalStatus||"가까운 사람에게만 알림";
  f.querySelectorAll('[name="member"]').forEach(input=>input.onchange=syncPairOrder);
  f.querySelectorAll('[name="temporalStatus"]').forEach(input=>input.onchange=()=>{refreshStages();refreshFaultParties()});
  f.querySelectorAll('[name="mother"],[name="father"],[name="child"]').forEach(input=>input.onchange=refreshParentKinship);
  f.querySelector("[data-swap-relation-order]").onclick=()=>{if(pairOrder.length===2){pairOrder.reverse();syncPairOrder()}};
  dialog.onclose=()=>{
    if(dialog.returnValue==="save"){
      const members=checkedMembers();
      const mothers=[...f.querySelectorAll('[name="mother"]:checked')].map(input=>input.value),fathers=[...f.querySelectorAll('[name="father"]:checked')].map(input=>input.value),children=[...f.querySelectorAll('[name="child"]:checked')].map(input=>input.value);
      const parentPairs=f.type.value==="부모·자녀"?[...mothers.map(id=>[id,"엄마"]),...fathers.map(id=>[id,"아빠"])].flatMap(([parent,role])=>children.filter(child=>child!==parent).map(child=>[parent,child,role])):[];
      const kinshipByPair=Object.fromEntries([...f.querySelectorAll("[data-parent-blood]")].map(input=>[input.dataset.parentBlood,input.checked?"blood":"nonblood"]));
      const siblingOrder=Object.fromEntries(members.map(id=>[id,Number(f.querySelector(`[data-sibling-id="${CSS.escape(id)}"]`)?.value)||1]));
      const siblingKinshipByPair=Object.fromEntries([...f.querySelectorAll("[data-sibling-kinship-pair]")].map(select=>[select.dataset.siblingKinshipPair,select.value]));
      const duplicateSiblingOrder=f.type.value==="형제·자매"&&new Set(Object.values(siblingOrder)).size!==members.length;
      if(f.type.value==="부모·자녀"&&!parentPairs.length)alert("엄마 또는 아빠와 자녀를 한 명 이상씩 골라 주세요.");
      else if(duplicateSiblingOrder)alert("형제·자매의 첫째·둘째·셋째 순서는 서로 겹치지 않게 골라 주세요.");
      else if(f.type.value!=="부모·자녀"&&members.length<2)alert("관계에 포함할 캐릭터를 두 명 이상 골라 주세요.");
      else{
        const temporal=temporalStatus(),levels=stagesFor(f.type.value,temporal),index=Math.max(0,levels.indexOf(f.stage.value)),ratio=levels.length<=1?1:index/(levels.length-1);
        const hostile=f.type.value==="혐관",base={type:f.type.value,temporalStatus:temporal,stage:f.stage.value,faultParty:temporal==="past"?f.faultParty.value:"",faultReason:temporal==="past"?f.faultReason.value:"",legalStatus:f.legalStatus.value,kinshipByPair,siblingOrder,siblingKinshipByPair,interactions:old?.interactions||[],interactionsAll:Boolean(old?.interactionsAll),cohabit:f.cohabit.checked||f.type.value==="동거인",intimacy:hostile?Math.round(35+ratio*30):Math.round(ratio*100),conflict:hostile?Math.round(100-ratio*55):Math.round((1-ratio)*75),updatedAt:Date.now()};
        if(old?.groupId)Object.values(state.relationships).filter(r=>r.groupId===old.groupId).forEach(r=>deleteRelationship(r.id));
        else if(old&&(f.type.value==="부모·자녀"||members.length!==2))deleteRelationship(id);
        if(f.type.value==="부모·자녀"){
          const groupId=parentPairs.length>1?`family-${Date.now()}`:"";
          parentPairs.forEach(([parent,child,parentRole])=>addRelationship({...base,a:parent,b:child,parentId:parent,childId:child,parentRole,kinship:kinshipByPair[kinshipKey(parent,child)]||"blood",directional:true,groupId,groupMembers:[...new Set([...mothers,...fathers,...children])]}));
        }else if(members.length===2){
          const ordered=pairOrder.length===2&&pairOrder.every(member=>members.includes(member))?pairOrder:members;
          const patch={...base,a:ordered[0],b:ordered[1],displayOrder:[...ordered],directional:false,groupId:"",groupMembers:[]};
          old?updateRelationship(id,patch):addRelationship(patch);
        }
        else{
          const groupId=`group-${members.slice().sort().join("-")}-${Date.now()}`;
          for(let i=0;i<members.length;i++)for(let j=i+1;j<members.length;j++)addRelationship({...base,a:members[i],b:members[j],groupId,groupMembers:members});
        }
        const affectedPairs=f.type.value==="부모·자녀"?parentPairs.map(([a,b])=>[a,b]):members.flatMap((a,index)=>members.slice(index+1).map(b=>[a,b]));
        const defaults=relationViewDefaults(f.type.value,temporal);
        affectedPairs.forEach(([a,b])=>[a,b].forEach((source,index)=>{
          const target=index===0?b:a;
          state.characterViews=state.characterViews||{};
          state.characterViews[source]=state.characterViews[source]||{};
          const view=state.characterViews[source][target]=state.characterViews[source][target]||{};
          Object.entries(defaults).forEach(([key,value])=>{
            if(view[key]!==undefined)return;
            if(key==="importance"&&/^\d+순위/.test(value)){
              const wanted=Number(value.match(/^\d+/)?.[0])||1,rank=Math.min(Math.max(1,state.order.length-1),wanted);
              view[key]=`${rank}순위${rank===1?" · 가장 중요한 사람":""}`;
            }else if(value!=="선택하지 않음"&&value!=="정하지 않음")view[key]=value;
          });
        }));
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
    const view={activeTab:state.activeTab,characterPane:state.characterPane,activeId:state.activeId,activeHomeId:state.activeHomeId,activeTownId:state.activeTownId,homeEditMode:state.homeEditMode};
    replaceState(x);
    state.activeTab=view.activeTab;
    state.characterPane=view.characterPane;
    state.homeEditMode=view.homeEditMode;
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
  const delay=(15+Math.floor(Math.random()*16))*60*1000;
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
  // Cloud writes are explicit only. Form drafts must never overwrite a newer
  // device or resurrect deleted characters, rooms, and relationships.
  return;
  if(!event.target?.matches("select,input,textarea"))return;
  clearTimeout(automaticCloudSyncTimer);
  automaticCloudSyncTimer=setTimeout(async()=>{
    if(!window.ParallelCityAuth?.getInfo?.().user)return;
    try{await window.ParallelCityAuth.upload?.({silent:true,reason:"자동 저장"})}
    catch(error){console.warn("자동 동기화를 다음 변경 때 다시 시도합니다.",error)}
  },1500);
});
render();
if(!maintenanceEnabled())showInstallButton();
if(!maintenanceEnabled()&&state.order.length&&localStorage.getItem("drawer-village-hide-photo-backup-notice")!=="1"&&localStorage.getItem("parallel-city-hide-photo-backup-notice")!=="1"){
  const notice=document.createElement("dialog");notice.className="backup-notice";
  notice.innerHTML=`<form method="dialog"><h2>사진 보관 안내</h2><p>사진 파일을 직접 올리면 Google 저장 공간에 함께 보관돼요. 용량을 아끼고 싶다면 사진 파일 대신 <b>웹에 공개된 이미지 주소</b>를 입력해 주세요. 기본 사진 저장 공간은 <b>최대 120장·총 20MB</b>이며 상점에서 50MB로 늘릴 수 있어요. 같은 사진은 중복으로 올리지 않고, 현재 사용량은 설정에서 확인할 수 있습니다.</p><label><input type="checkbox" name="hide"> 다시는 보지 않기</label><button class="primary" value="ok">알겠어요</button></form>`;
  notice.onclose=()=>{if(notice.querySelector('[name="hide"]')?.checked)localStorage.setItem("drawer-village-hide-photo-backup-notice","1");notice.remove()};
  document.body.append(notice);notice.showModal();
}
if(!maintenanceEnabled()){
  import("./auth.js?v=20260806be").catch(error=>{
    console.warn("로그인 기능을 불러오지 못했지만 게임은 계속 실행됩니다.",error);
    setAccountLabel("Google 로그인");
  });
}
if("serviceWorker" in navigator){
  navigator.serviceWorker.register("./sw.js?v=20260806be",{updateViaCache:"none"}).then(registration=>registration.update()).catch(error=>console.warn("오프라인 업데이트 준비 실패",error));
}
const lockPortrait=()=>screen.orientation?.lock?.("portrait").catch(()=>{});
if(matchMedia("(display-mode: standalone)").matches||navigator.standalone)lockPortrait();
window.addEventListener("orientationchange",lockPortrait);
