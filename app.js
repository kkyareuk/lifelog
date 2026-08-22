import {state, active, save, replaceState, createCharacter, deleteCharacter, setActive, setActiveHome, updateCharacter, updateCharacterView, toggleChip, addRelationship, updateRelationship, deleteRelationship, setHomeImage, setHomeBackground, setPlaceInteriorImage, setCharacterImage, setWorldBackground, addPlace, deletePlace, movePlace, moveHomeOnTown, updatePlace, reorderPlace, resetAll, cloneState, setHomeEditMode, updateHome, createHome, deleteHome, addCharacterResidence, removeCharacterResidence, updateCharacterResidence, updateRoom, addRoom, setHomeFloorCount, setActiveHomeFloor, setRoomType, deleteRoom, addPet, updatePet, deletePet, setPetImage, addCar, updateCar, deleteCar, toggleFurniture, setHomeResidents, moveCharacter, addCatalogItem, updateCatalogItem, deleteCatalogItem, toggleFavorite, toggleOwned, togglePlaceStock, setCharacterPane, addTown, switchTown, deleteTown, recordCharacterInteraction, setDailyQuestion, updateRoutineDays, scheduleCharacterChoice, settleScheduledChoices} from "./state.js?v=20260822charactergrouplayout1";
import {eventFor,forceCharactersHome} from "./simulation.js?v=20260822charactergrouplayout1";
import {renderApp, catalogCardMarkup, setAccountLabel, setAccountEntitlements, setMobileTownEditing, setMobileTownPanel, setSettingsPane, translateDynamicInterface} from "./views.js?v=20260822charactergrouplayout1";
import {initializeLocalMediaState,persistLocalImage,informationOnlyState,localMediaUsage,isPendingLocalImage} from "./local-media.js?v=20260822charactergrouplayout1";
import {SPEECH_STYLE_OPTIONS,characterQuestionPrompt,characterContactSpeech} from "./speech-styles.js?v=20260822charactergrouplayout1";
import {characterNotificationsAvailable,characterNotificationPermission,requestCharacterNotificationPermission,initializeCharacterNotifications,replaceCharacterNotifications,scheduleCharacterNotification,cancelCharacterNotifications,characterNotificationLargeIcon} from "./character-notifications.js?v=20260822charactergrouplayout1";
import {mergeImportedBackupState} from "./sync-merge.js?v=20260822charactergrouplayout1";

// IndexedDB 사진 복원은 화면 부팅과 독립적으로 진행한다. 저장소가 느리거나
// 잠겨 있어도 render()와 버튼 이벤트 연결은 즉시 끝나야 한다.
let localMediaHydration=null,lastLocalMediaResult={found:0,resolved:0,pending:0};
const refreshLocalMedia=()=>{
  if(localMediaHydration)return localMediaHydration;
  localMediaHydration=initializeLocalMediaState(state).then(result=>{
    lastLocalMediaResult=result;
    if(result.resolved){
      save(true,false);
      render();
    }
    return result;
  }).catch(error=>{
    console.warn("기기 사진 복원을 잠시 미루고 앱을 계속 실행합니다",error);
    lastLocalMediaResult={found:0,resolved:0,pending:0};return lastLocalMediaResult;
  }).finally(()=>{localMediaHydration=null});
  return localMediaHydration;
};
const localMediaReady=refreshLocalMedia();
window.DrawerVillageLocalMedia={...(window.DrawerVillageLocalMedia||{}),ready:localMediaReady};

let pendingImage=null;
let deferredInstallPrompt=null;
let mobileCharacterEditorPane="";
let mobileCharacterReorderOpen=false;
let mobileCharacterDraftDirty=false;
let deferredRenderWhileMobileText=false;
let homeCharacterPickerScroll=0;
let observeRosterScroll=0;
let mobileCharacterStripScroll=0;
let mobileCharacterEditorScroll=0;
let mobileCharacterEditorOpenDetails=[];
let mobileCharacterEditorDetailsCaptured=false;
let resetScrollAfterRender=false;
let navigationTabIntent="";
const setNavigationTabIntent=tab=>{navigationTabIntent=tab;state.activeTab=tab;return tab};
const guidePending=new Set();
const PAGE_GUIDES={
  observe:["관찰","가운데 캐릭터를 바꾸면 홈 화면은 그대로 유지한 채 그 캐릭터의 현재 장면으로 전환돼요. ‘지금 이 순간’을 누르면 잘리지 않은 전문과 오늘의 생활로그를 볼 수 있습니다."],
  home:["집","위에서 집을 고르고 ‘집 편집’을 켜세요. 한 줄 도구의 ‘방 추가·구성’에서 방을 늘리고, 방 자체를 누르면 이름·크기·사진·가구를 바꿀 수 있어요."],
  character:["캐릭터","위쪽에서 캐릭터를 고른 뒤 아래 항목 중 바꾸려는 설정을 누르세요. 프로필 내보내기는 캐릭터 이름 옆에서 바로 할 수 있고, 사진·아이콘·테마에서는 이미지와 대표색을 관리해요."],
  catalog:["취향 사전","음식, 작품, 음악, 향과 소지품을 등록하는 도감이에요. 직접 올린 사진은 동그랗게, 사이트 일러스트는 투명 배경과 원본 비율로 보이며 실제 생활 장면에도 연결됩니다."],
  relationship:["관계","먼저 마음을 보는 사람을 고른 뒤, 그 마음이 향하는 대상을 선택하세요. ‘OO가 OO을 OO으로 여김’ 문장으로 방향을 바로 확인할 수 있어요."],
  routine:["일정","주간 일정에는 반복할 요일을, 월간 일정에는 날짜가 정해진 약속을 기록해요. 시간이 정해진 행동은 무작위 생활 장면보다 먼저 적용됩니다."],
  town:["마을","평소에는 캐릭터 위치를 관찰하고, 편집 모드를 켠 뒤에만 건물을 옮기거나 정보를 바꿀 수 있어요. 건물을 누르면 편집 창이 열립니다."],
  shop:["상점","캐릭터·마을 슬롯과 개발 응원을 장바구니에 담는 화면이에요. 구매하지 않아도 이미 만든 캐릭터와 데이터가 임의로 사라지지 않습니다."],
  settings:["설정","백업 파일, 계정 동기화, 화면 표시와 피드백을 관리해요. 데이터 업로드는 여기에서 ‘동기화’를 눌렀을 때만 실행됩니다."]
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
const floorLabel=value=>state.uiLanguage==="en"?`Floor ${value}`:state.uiLanguage==="ja"?`${value}階`:`${value}층`;
const weekdayLabels=()=>state.uiLanguage==="en"?["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]:state.uiLanguage==="ja"?["日","月","火","水","木","金","土"]:["일","월","화","수","목","금","토"];
function replaceBrokenAvatar(image){
  if(!image?.isConnected)return;
  // IndexedDB 복원이 끝나기 전의 내부 참조는 실제 손상 파일이 아니다.
  // 거대한 글자 대체물로 바꾸지 않고 숨겨 두면 포그라운드 복원 뒤
  // 정상 이미지로 다시 렌더링할 수 있다.
  if(isPendingLocalImage(image.getAttribute("src"))){image.hidden=true;return}
  const fallback=document.createElement("span");
  const extra=[...image.classList].filter(name=>!["sprite","avatar","profile-photo-fallback"].includes(name));
  fallback.className=["avatar","synced-avatar-fallback",...extra].join(" ");
  fallback.textContent=image.dataset.avatarFallback||"새";
  fallback.setAttribute("role","img");
  fallback.setAttribute("aria-label",`${fallback.textContent} 캐릭터 이미지`);
  image.replaceWith(fallback);
}
window.DrawerVillageAvatarFallback=replaceBrokenAvatar;
const htmlEsc=(value="")=>String(value).replace(/[&<>"']/g,character=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[character]));
const hasBatchim=value=>{
  const code=[...String(value||"").trim()].at(-1)?.charCodeAt(0);
  return Number.isFinite(code)&&code>=0xac00&&code<=0xd7a3&&(code-0xac00)%28!==0;
};
const subjectText=value=>`${value||""}${hasBatchim(value)?"이":"가"}`;
const objectText=value=>`${value||""}${hasBatchim(value)?"을":"를"}`;
const overallViewPhrase=value=>({
  "정하지 않음":"아직 어떤 사람인지 판단하지 않음",
  "선택하지 않음":"아직 어떤 사람인지 판단하지 않음",
  "경쟁심을 느낌":"상대로 경쟁심을 느낌",
  "애증을 느낌":"향해 애정과 미움을 함께 느낌",
  "그저 그런 사람":"그저 그런 사람으로 여김",
  "흥미롭게 여김":"흥미로운 사람으로 여김",
  "인간적인 호감이 있음":"인간적으로 호감 있게 여김",
  "친구로 좋아함":"친구로서 좋아함",
  "연애 감정이 싹틈":"연애 감정으로 의식하기 시작함",
  "없어서는 안 될 사람":"없어서는 안 될 사람으로 여김"
}[value]||String(value||"어떤 사람인지 판단하지 않음"));
const purchases=()=>window.ParallelCityAuth?.getInfo?.().entitlements||{};
const characterLimit=()=>5+(Math.max(0,Number(purchases().characterSlotPacks)||0)*5);
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
  {id:"type-restaurant",name:"음식점",src:"world-assets/building-types/restaurant-handdrawn.png",types:["음식점"]},
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
const STRUCTURED_APPEARANCE_TAGS=["검은 머리","갈색 머리","금발","백발·은발","빨간 머리","분홍 머리","보라 머리","파란 머리","청록 머리","초록 머리","올백머리","장발","단발","숏컷","곱슬머리","웨이브머리","땋은 머리","포니테일","투톤 헤어","특이한 머리색","검은 눈","갈색 눈","호박색 눈","금색 눈","초록색 눈","파란색 눈","청회색 눈","회색 눈","보라색 눈","오드아이","문신","피어싱","흉터","주근깨","점이 있음","창백한 피부","구릿빛 피부","근육질","탄탄한 체형","마른 체형","통통한 체형","글래머","키가 큼","키가 작음","손이 큼"];
const HAIR_STYLE_ATTRACTION_TAGS=["자연스럽게 풀어 둠","앞머리 있음","앞머리 없음","시스루 앞머리","일자 앞머리","처피뱅","커튼뱅","옆으로 넘긴 앞머리","앞머리가 한쪽 눈을 가림","앞머리가 양쪽 눈을 가림","올백","슬릭백","보브컷","픽시컷","댄디컷","리프컷","레이어드컷","허쉬컷","샤기컷","울프컷","투블럭","언더컷","모히칸","리젠트","포니테일","사이드 포니테일","트윈테일","양갈래","반묶음","하프업 번","땋은 머리","프렌치 브레이드","피시테일 브레이드","콘로우","박스 브레이드","로우번","하이번","스페이스 번","브레이드 업두","드레드록","히메컷","롱 스트레이트","단발 웨이브","웨이브 스타일","베이비펌","히피펌","가르마펌","고데기 스타일링"];
const APPEARANCE_TAGS=["안경을 씀","안대","특이동공","세로동공","삼백안","날카로운 눈매","처진 눈매","속눈썹이 김","두꺼운 눈썹","중성적인 인상","부드러운 인상","날카로운 인상","아름다움","잘생김","귀여움","우아함","위압적인 분위기","단정한 분위기","퇴폐적인 분위기","신비로운 분위기","소년미","성숙미"];
const WEALTH_OPTIONS=["생계가 빠듯함","여유가 적음","평범한 형편","경제적으로 여유로움","부유함","대부호","재산을 알 수 없음"];
const PROFILE_TAG_OPTIONS={
  attractedGenders:["남성","여성","그외","없음"],
  appearanceTags:APPEARANCE_TAGS,
  attractionTraits:[...new Set([...STRUCTURED_APPEARANCE_TAGS,...HAIR_STYLE_ATTRACTION_TAGS,...APPEARANCE_TAGS,"단정한 사람","자기 관리를 잘함","전문직","예술가 기질","제복이 어울림","지적인 분위기","말투가 다정함","목소리가 좋음","능력 있는 사람","성실한 사람","책임감이 강함","리더십이 있음","침착한 사람","유머 감각이 있음","자신감이 있음","수줍은 사람","상냥한 사람","강단 있는 사람","신비로운 사람","위험한 분위기","연상","연하","동갑",...WEALTH_OPTIONS])]
};
PROFILE_TAG_OPTIONS.dislikedAttractionTraits=PROFILE_TAG_OPTIONS.attractionTraits;
function openProfileTagsDialog(field){
  const character=active(),options=PROFILE_TAG_OPTIONS[field];if(!character||!options)return;
  let selected=[...(character[field]||[])].filter(value=>field!=="appearanceTags"||options.includes(value));
  const titles={attractedGenders:"성지향 설정",appearanceTags:"외모 태그 정하기",attractionTraits:"끌리는 특징 정하기",dislikedAttractionTraits:"비선호하는 특징 정하기"};
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
  const body=character.bodyProfile||{},appearance=body.appearance||{},wheelchair=body.wheelchair||{},arm=body.prostheticArm||{},leg=body.prostheticLeg||{},hearing=body.hearing||{},vision=body.vision||{};
  const physicalTraits=[...new Set([...(body.physicalTraits||[]),...(character.appearanceTags||[])])];
  const leftEye=exportValue(appearance.leftEyeColor),rightEye=exportValue(appearance.rightEyeColor);
  const eyeColor=leftEye&&rightEye&&leftEye!==rightEye?`왼쪽 ${leftEye} · 오른쪽 ${rightEye}`:leftEye||rightEye;
  const sections=[
    exportSection("기본 정보",[["이름",character.name],["나이대",character.ageGroup],["성별",character.gender==="그외"?"":character.gender],["끌리는 대상",character.attractionTarget],["새로운 사람에게 끌리는 정도",character.relationshipOpenness],["직업",character.jobTitle||character.job],["생일",character.birthday?`${character.birthday.slice(0,2)}월 ${character.birthday.slice(2)}일`:""],["재산",character.wealth],["소비 유형",character.income],["기상 시각",character.wake],["기상 습관",character.wakeHabit],["취침 시각",character.sleep],["수면 습관",character.sleepHabit],["신체 접촉 반응",character.touchReaction],["외모가 눈에 띄는 정도",character.appearanceLevel==="보통"?"":character.appearanceLevel],["상대 외모를 보는 정도",character.appearanceInterest==="보통"?"":character.appearanceInterest],["끌리는 특징",listText(character.attractionTraits)]]),
    exportSection("성격",[["전체적인 유형",listText(character.personalityTypes)],["사람과 어울리는 방식",character.socialStyle],["정보를 받아들이는 방식",character.perceptionStyle],["판단하는 방식",character.decisionStyle],["일정을 다루는 방식",character.planningStyle],["행동 전환",character.activityTempo],["깔끔함",character.neatness],["패션 감각",character.fashionSense],["간섭 성향",character.interference],["갈등 대응",character.conflictStyle],["애정 표현",character.affectionStyle],["생활 에너지",character.energyRhythm],["유머·장난 성향",character.humorStyle],["감정 표현의 크기",character.emotionalExpression],["충동을 참는 정도",character.impulseControl],["서사·인지 특성",listText(character.characterTraits)],["장면에 반영할 특성 표현",listText(character.traitExpressions)],["특성 표현 메모",character.traitNotes],["메모를 로그에 반영",character.traitNotesInScripts?"사용":""]]),
    exportSection("신체·외형",[["체형",body.bodySize],["신체 특성",listText(physicalTraits)],["현재 머리색",appearance.hairColor],["머리색 설정",appearance.hairColorOrigin],["본래 머리색",appearance.naturalHairColor],["머리 기장",appearance.hairLength],["머리 결",appearance.hairTexture],["머리 스타일",listText(appearance.hairStyles)],["눈 색",eyeColor],["화장 정도",appearance.makeupLevel],["화장 스타일",listText(appearance.makeupStyles)],["미용실 방문 빈도",appearance.salonFrequency],["성형·외형 의료 시술",appearance.cosmeticSurgery],["성형·외형 의료 시술 부위",listText(appearance.cosmeticSurgeryAreas)]]),
    exportSection("건강·장애·접근성",[["만성질환·건강 관리",listText(body.healthConditions)],["기타 건강 상태",body.healthOther],["휠체어",wheelchair.type],["휠체어 이용 방식",wheelchair.pattern],["의수 사용 부위",arm.side],["의수 종류",arm.custom||arm.type],["의족 사용 부위",leg.side],["의족 종류",leg.custom||leg.type],["청각장애·난청 부위",hearing.side],["청각 특성",hearing.level],["청각 접근 방식",listText(hearing.supports)],["시각장애·저시력 부위",vision.side],["시각 특성",vision.level],["시각 접근 방식",listText(vision.supports)],["상호작용에서 지킬 방식",listText(body.accessibilityPreferences)],["표현 메모",body.notes]]),
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
  const channels=[0,2,4].map(i=>(parseInt(full.slice(i,i+2),16)||0)/255).map(value=>value<=.03928?value/12.92:Math.pow((value+.055)/1.055,2.4));
  const luminance=.2126*channels[0]+.7152*channels[1]+.0722*channels[2];
  const darkLuminance=.012,whiteContrast=1.05/(luminance+.05),darkContrast=(luminance+.05)/(darkLuminance+.05);
  return darkContrast>=whiteContrast?"#241c18":"#ffffff";
};
const mixThemeColors=(first,second)=>{
  const rgb=value=>{
    const hex=String(value||"").trim().replace("#",""),full=hex.length===3?hex.split("").map(x=>x+x).join(""):hex;
    return /^[0-9a-f]{6}$/i.test(full)?[0,2,4].map(i=>parseInt(full.slice(i,i+2),16)):[32,36,42];
  };
  const a=rgb(first),b=rgb(second);
  return `#${a.map((value,index)=>Math.round((value+b[index])/2).toString(16).padStart(2,"0")).join("")}`;
};
const globalThemeValue=(name,fallback)=>getComputedStyle(document.documentElement).getPropertyValue(name).trim()||fallback;
async function exportProfilePng(character){
  await document.fonts?.load?.('32px "Noto Sans KR"');await document.fonts?.ready;
  const sections=profileExportLines(character),canvas=document.createElement("canvas"),ctx=canvas.getContext("2d"),width=1400,pad=70,rowH=58;
  const rows=sections.reduce((sum,[,items])=>sum+items.length,0);
  canvas.width=width;canvas.height=Math.max(1750,430+sections.length*72+rows*rowH);
  const primary=globalThemeValue("--p","#765036"),secondary=globalThemeValue("--s",primary),ink=readableInk(primary);
  ctx.fillStyle="#fffdf9";ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle="#24201d";ctx.lineWidth=3;ctx.strokeRect(pad,55,width-pad*2,canvas.height-110);
  ctx.fillStyle=primary;ctx.fillRect(pad,55,width-pad*2,110);
  ctx.fillStyle=ink;ctx.textAlign="center";ctx.font='700 56px "Noto Sans KR","Malgun Gothic",sans-serif';ctx.fillText("캐 릭 터  설 정 표",width/2,128);
  const portrait=await exportImage(character.photo),icon=await exportImage(character.icon);
  const imageX=pad+24,imageY=190,imageW=250,imageH=250;
  ctx.fillStyle="#f4f0ea";ctx.fillRect(imageX,imageY,imageW,imageH);ctx.strokeStyle="#24201d";ctx.lineWidth=2;ctx.strokeRect(imageX,imageY,imageW,imageH);
  const drawContain=(image,x,y,w,h)=>{if(!image)return false;const scale=Math.min(w/image.width,h/image.height),dw=image.width*scale,dh=image.height*scale;ctx.drawImage(image,x+(w-dw)/2,y+(h-dh)/2,dw,dh);return true};
  if(!drawContain(portrait,imageX,imageY,imageW,imageH)){ctx.fillStyle=primary;ctx.font='700 72px "Noto Sans KR","Malgun Gothic",sans-serif';ctx.fillText(character.name.slice(0,1),imageX+imageW/2,imageY+145)}
  if(icon)drawContain(icon,imageX+178,imageY+178,66,66);
  ctx.textAlign="left";ctx.fillStyle="#24201d";ctx.font='700 48px "Noto Sans KR","Malgun Gothic",sans-serif';ctx.fillText(character.name,pad+310,260);
  ctx.font='500 24px "Noto Sans KR","Malgun Gothic",sans-serif';ctx.fillStyle="#665d56";ctx.fillText("서랍마을 인물 기록 · 설정된 항목만 표기",pad+310,310);
  ctx.strokeStyle="#24201d";ctx.strokeRect(pad+290,190,width-pad*2-314,250);
  let y=480;
  sections.forEach(([title,items])=>{
    ctx.fillStyle=primary;ctx.fillRect(pad,y,210,56);ctx.fillStyle=ink;ctx.font='700 29px "Noto Sans KR","Malgun Gothic",sans-serif';ctx.fillText(title,pad+22,y+39);
    ctx.strokeStyle="#24201d";ctx.lineWidth=2;ctx.strokeRect(pad,y,width-pad*2,56);y+=56;
    items.forEach(([label,value])=>{
      ctx.strokeRect(pad,y,width-pad*2,rowH);ctx.beginPath();ctx.moveTo(pad+270,y);ctx.lineTo(pad+270,y+rowH);ctx.stroke();
      ctx.fillStyle="#f0ece6";ctx.fillRect(pad+1,y+1,269,rowH-2);
      ctx.fillStyle="#302925";ctx.font='600 23px "Noto Sans KR","Malgun Gothic",sans-serif';ctx.fillText(label,pad+18,y+38);
      ctx.font='22px "Malgun Gothic",sans-serif';ctx.fillText(String(value).slice(0,72),pad+292,y+38);y+=rowH;
    });
    y+=22;
  });
  ctx.fillStyle=primary;ctx.font='600 22px "Noto Sans KR","Malgun Gothic",sans-serif';ctx.fillText(`서랍마을 · ${new Date().toLocaleDateString("ko-KR")}`,pad+15,canvas.height-75);
  try{const link=document.createElement("a");link.download=`${character.name}-설정표.png`;link.href=canvas.toDataURL("image/png");link.click()}catch{showToast("외부 이미지 보안 제한으로 PNG를 만들 수 없어요. PDF 내보내기를 이용해 주세요.")}
}
async function exportProfilePngV2(character,download=true){
  await document.fonts?.ready;
  const sections=profileExportLines(character),canvas=document.createElement("canvas"),ctx=canvas.getContext("2d"),width=1400,pad=72;
  const bodyStack='"Malgun Gothic","Apple SD Gothic Neo","Noto Sans KR",sans-serif';
  canvas.width=width;canvas.height=1;
  const wrap=(text,maxWidth,font=`22px ${bodyStack}`)=>{
    ctx.font=font;const out=[];
    String(text||"").split(/\n/).forEach(paragraph=>{let line="";for(const char of paragraph){const next=line+char;if(line&&ctx.measureText(next).width>maxWidth){out.push(line);line=char}else line=next}out.push(line||" ")});
    return out;
  };
  const contentW=width-pad*2,labelW=170,cellW=contentW/2,valueW=cellW-labelW-28;
  const layouts=sections.map(([title,items])=>{
    const rows=[];for(let index=0;index<items.length;index+=2){
      const pair=items.slice(index,index+2).map(([label,value])=>({
        label,
        value,
        labelLines:wrap(label,labelW-26,`700 17px ${bodyStack}`),
        lines:wrap(value,valueW)
      }));
      rows.push({pair,height:Math.max(58,...pair.map(item=>Math.max(30+item.labelLines.length*25,34+item.lines.length*32)))});
    }
    return {title,rows,height:52+rows.reduce((sum,row)=>sum+row.height,0)};
  });
  canvas.height=Math.max(1680,390+layouts.reduce((sum,section)=>sum+section.height+28,0)+150);
  const portrait=await exportImage(character.photo||character.icon);
  const contain=(image,x,y,w,h)=>{if(!image)return false;const scale=Math.min(w/image.width,h/image.height),dw=image.width*scale,dh=image.height*scale;ctx.drawImage(image,x+(w-dw)/2,y+(h-dh)/2,dw,dh);return true};
  ctx.fillStyle="#fbfaf6";ctx.fillRect(0,0,width,canvas.height);
  ctx.strokeStyle="#1f2428";ctx.lineWidth=4;ctx.strokeRect(38,38,width-76,canvas.height-76);
  ctx.lineWidth=1;ctx.strokeRect(50,50,width-100,canvas.height-100);
  ctx.fillStyle="#111";ctx.textAlign="center";ctx.font=`700 50px ${bodyStack}`;ctx.fillText("서랍마을 캐릭터 등록사항 증명서",width/2,118);
  ctx.font=`18px ${bodyStack}`;ctx.fillText("DRAWER CITY · CHARACTER REGISTRATION RECORD",width/2,154);
  const documentSeed=String(character.id||character.name||"drawer-city");
  ctx.textAlign="left";ctx.font=`17px ${bodyStack}`;ctx.fillText(`문서번호  서랍마을-${new Date().getFullYear()}-${String(Math.abs([...documentSeed].reduce((sum,char)=>sum+char.charCodeAt(0),0))).padStart(6,"0").slice(-6)}`,pad,196);
  ctx.textAlign="right";ctx.fillText(`발급일  ${new Date().toLocaleDateString("ko-KR")}`,width-pad,196);
  const identityY=218,identityH=130,portraitSize=104;
  ctx.strokeStyle="#222";ctx.strokeRect(pad,identityY,contentW,identityH);
  ctx.fillStyle="#ecebe7";ctx.fillRect(pad,identityY,190,identityH);
  ctx.fillStyle="#111";ctx.textAlign="center";ctx.font=`700 23px ${bodyStack}`;ctx.fillText("등록 인물",pad+95,identityY+74);
  ctx.strokeRect(width-pad-portraitSize-18,identityY+13,portraitSize,portraitSize);
  if(!contain(portrait,width-pad-portraitSize-18,identityY+13,portraitSize,portraitSize)){
    ctx.fillStyle="#e6e2da";ctx.fillRect(width-pad-portraitSize-17,identityY+14,portraitSize-2,portraitSize-2);
    ctx.fillStyle="#333";ctx.font=`700 46px ${bodyStack}`;ctx.fillText(String(character.name||"?").slice(0,1),width-pad-portraitSize/2-18,identityY+80);
  }
  ctx.textAlign="left";ctx.fillStyle="#111";ctx.font=`700 34px ${bodyStack}`;ctx.fillText(character.name,pad+220,identityY+56);
  ctx.font=`20px ${bodyStack}`;ctx.fillStyle="#444";ctx.fillText(`${character.jobTitle||character.job||"직업 미설정"} · ${character.ageGroup||"나이대 미설정"}`,pad+220,identityY+96);
  let y=382;
  layouts.forEach(section=>{
    ctx.fillStyle="#25333a";ctx.fillRect(pad,y,contentW,52);
    ctx.fillStyle="#fff";ctx.font=`700 23px ${bodyStack}`;ctx.textAlign="left";ctx.fillText(section.title,pad+18,y+34);
    y+=52;
    section.rows.forEach(row=>{
      let x=pad;
      row.pair.forEach(item=>{
        ctx.fillStyle="#efeee9";ctx.fillRect(x,y,labelW,row.height);
        ctx.strokeStyle="#454545";ctx.strokeRect(x,y,cellW,row.height);
        ctx.beginPath();ctx.moveTo(x+labelW,y);ctx.lineTo(x+labelW,y+row.height);ctx.stroke();
        ctx.fillStyle="#222";ctx.font=`700 17px ${bodyStack}`;item.labelLines.forEach((line,lineIndex)=>ctx.fillText(line,x+13,y+29+lineIndex*25));
        ctx.font=`20px ${bodyStack}`;item.lines.forEach((line,lineIndex)=>ctx.fillText(line,x+labelW+14,y+31+lineIndex*32));
        x+=cellW;
      });
      if(row.pair.length===1){ctx.fillStyle="#faf9f5";ctx.fillRect(x,y,cellW,row.height);ctx.strokeRect(x,y,cellW,row.height)}
      y+=row.height;
    });
    y+=28;
  });
  const stampX=width-176,stampY=canvas.height-125;
  ctx.save();ctx.translate(stampX,stampY);ctx.rotate(-.12);ctx.strokeStyle="#b31f24";ctx.fillStyle="#b31f24";ctx.lineWidth=6;ctx.beginPath();ctx.arc(0,0,57,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(0,0,46,0,Math.PI*2);ctx.stroke();ctx.textAlign="center";ctx.font=`700 20px ${bodyStack}`;ctx.fillText("서 랍 도 시",0,-5);ctx.font=`700 16px ${bodyStack}`;ctx.fillText("기 록 인",0,22);ctx.restore();
  ctx.fillStyle="#333";ctx.textAlign="left";ctx.font=`17px ${bodyStack}`;ctx.fillText("위 인물의 등록사항을 서랍마을 기록 기준에 따라 증명합니다.",pad,canvas.height-122);
  ctx.fillText("※ 사용자가 직접 설정한 항목만 기록하며, 미설정 항목은 임의로 추정하지 않습니다.",pad,canvas.height-86);
  if(download)try{const link=document.createElement("a");link.download=`${character.name}-서랍마을-등록사항증명서.png`;link.href=canvas.toDataURL("image/png");link.click()}catch{showToast("외부 이미지 보안 제한으로 PNG를 만들 수 없어요. PDF 내보내기를 이용해 주세요.")}
  return canvas;
}
function exportProfilePdf(character){
  const sections=profileExportLines(character),win=window.open("","_blank");if(!win){showToast("팝업을 허용한 뒤 다시 시도해 주세요");return}
  const primary=globalThemeValue("--p","#765036"),secondary=globalThemeValue("--s",primary),ink=readableInk(primary),photo=character.photo||character.icon;
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${character.name} 설정표</title><link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&display=swap" rel="stylesheet"><style>@page{size:A4;margin:12mm}*{box-sizing:border-box}body{margin:0;color:#211d1a;background:#eee;font-family:"Noto Sans KR","Malgun Gothic",sans-serif}.sheet{width:190mm;min-height:270mm;margin:12px auto;padding:8mm;background:#fff;border:1px solid #222}.title{padding:10px;color:${ink};background:${primary};text-align:center;font-size:34px;font-weight:900;letter-spacing:8px}.identity{display:grid;grid-template-columns:42mm 1fr;margin-top:7mm;border:1px solid #222}.portrait{width:42mm;height:42mm;object-fit:contain;border-right:1px solid #222;background:#f5f2ed}.identity div{padding:8mm}.identity h1{margin:0;font-size:32px;font-weight:900}.identity p{color:#746b64}section{margin-top:6mm;break-inside:avoid}h2{margin:0;padding:7px 10px;color:${ink};background:${primary};font-size:22px;font-weight:900}table{width:100%;border-collapse:collapse;table-layout:fixed}th,td{border:1px solid #333;padding:7px 9px;vertical-align:top;font-size:13px;overflow-wrap:anywhere}th{width:34%;background:#f1ede7;text-align:left;font-size:15px;font-weight:900}button{width:100%;margin-top:8mm;padding:12px;border:0;color:#fff;background:${primary};font:700 18px "Noto Sans KR","Malgun Gothic",sans-serif}@media print{body{background:#fff}.sheet{width:auto;min-height:0;margin:0;padding:0;border:0}button{display:none}}</style></head><body><main class="sheet"><div class="title">캐 릭 터 설 정 표</div><div class="identity">${photo?`<img class="portrait" src="${photo}" alt="">`:`<div class="portrait"></div>`}<div><h1>${character.name}</h1><p>서랍마을 인물 기록 · 설정된 항목만 표기</p></div></div>${sections.map(([title,rows])=>`<section><h2>${title}</h2><table>${rows.map(([label,value])=>`<tr><th>${label}</th><td>${value}</td></tr>`).join("")}</table></section>`).join("")}<button onclick="print()">PDF로 저장 / 인쇄</button></main></body></html>`);
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
  dialog.innerHTML=`<form method="dialog"><div class="title"><div><h2>프로필 내보내기</h2><small>한글이 깨지지 않는 기본 글꼴로 관공서 제출 서류처럼 만들고, 아래에 서랍마을 기록 도장을 찍어요.</small></div><button value="cancel">×</button></div><div class="profile-export-options"><button type="button" data-export-format="png"><b>PNG 증명서</b><small>이미지 파일로 바로 저장</small></button><button type="button" data-export-format="pdf"><b>PDF 증명서</b><small>같은 문서를 PDF로 저장·인쇄</small></button></div></form>`;
  dialog.querySelector('[data-export-format="png"]').onclick=()=>{exportProfilePngV2(character,true);dialog.close()};
  dialog.querySelector('[data-export-format="pdf"]').onclick=()=>{exportProfilePdfV2(character);dialog.close()};
  dialog.onclose=()=>dialog.remove();document.body.append(dialog);dialog.showModal();
}
function enhanceCatalogCards(root=document){
  const selector='[data-kind="fashion"][data-catalog-field="image"]';
  const inputs=[...(root.matches?.(selector)?[root]:[]),...root.querySelectorAll(selector)];
  inputs.forEach(input=>{
    const detail=input.closest(".catalog-detail");if(!detail||detail.querySelector('.fashion-extra-fields'))return;
    const item=state.catalog.fashion.find(value=>value.id===input.dataset.item);if(!item)return;
    const box=document.createElement("div");box.className="fashion-extra-fields";
    const group=(title,field,values)=>`<section class="chips"><b>${title}</b><div>${values.map(value=>`<button type="button" data-fashion-attr="${field}" data-item="${item.id}" data-value="${value}" class="${(item[field]||[]).includes(value)?"on":""}">${value}</button>`).join("")}</div></section>`;
    box.innerHTML=group("재질","materials",FASHION_MATERIALS)+group("색","colors",FASHION_COLORS)+group("분위기·화려함","flairs",FASHION_FLAIRS);
    input.closest("label").insertAdjacentElement("beforebegin",box);
  });
}
function catalogCardElement(kind,item){
  const template=document.createElement("template");
  template.innerHTML=catalogCardMarkup(kind,item).trim();
  return template.content.firstElementChild;
}
function replaceCatalogCard(kind,itemId,{open=true}={}){
  const item=state.catalog?.[kind]?.find(value=>value.id===itemId);
  const current=document.querySelector(`.catalog-dex-card[data-kind="${CSS.escape(kind)}"][data-catalog-card="${CSS.escape(itemId)}"]`);
  if(!item||!current)return null;
  const next=catalogCardElement(kind,item);if(!next)return null;
  next.open=open||current.open;
  current.replaceWith(next);
  enhanceCatalogCards(next);
  translateDynamicInterface(next);
  return next;
}
function appendCatalogCard(kind,itemId){
  const item=state.catalog?.[kind]?.find(value=>value.id===itemId),grid=document.querySelector(`[data-catalog-grid="${CSS.escape(kind)}"]`);
  if(!item||!grid)return null;
  grid.querySelector("[data-catalog-empty]")?.remove();
  const card=catalogCardElement(kind,item);if(!card)return null;
  card.open=true;grid.append(card);enhanceCatalogCards(card);translateDynamicInterface(card);
  return card;
}
function enhanceDynamicForms(){
  document.querySelectorAll(".profile-license").forEach(profile=>{
    profile.querySelectorAll('[data-personality-field="interference"]').forEach(button=>{
      if(button.dataset.value==="컨트롤프릭"){button.dataset.value="통제광";button.textContent="통제광"}
    });
    const fields=profile.querySelector(".fields");
    if(fields&&!profile.querySelector('[data-field="wakeHabit"]')){
      const label=document.createElement("label");label.className="wake-habit-field";label.innerHTML=`기상 습관<select data-field="wakeHabit">${["알람을 듣고 천천히 일어남","알람이 울리기 전에 눈을 뜸","알람을 여러 번 미룸","눈을 뜨자마자 바로 일어남","이불 속에서 한참 뒹굶","일어나자마자 창문을 엶","일어나자마자 물을 마심","침대에서 오늘 일정을 확인함","비몽사몽한 채 방을 돌아다님","누가 깨워 줘야 일어남"].map(value=>`<option value="${htmlEsc(value)}" ${active().wakeHabit===value?"selected":""}>${value}</option>`).join("")}</select><small>기상 직후 장면과 아침 행동에 반영돼요.</small>`;fields.append(label);
    }
    if(fields&&!profile.querySelector('[data-field="sleepHabit"]')){
      const label=document.createElement("label");label.className="sleep-habit-field";label.innerHTML=`수면 습관<select data-field="sleepHabit">${["이불을 단정히 덮고 잠","이불을 걷어차며 잠","옆으로 웅크려 잠","팔다리를 뻗고 잠","베개를 끌어안고 잠","잠꼬대를 자주 함","뒤척임이 많음","아주 얌전히 잠","새벽에 자주 깸","코를 골며 깊이 잠"].map(value=>`<option value="${htmlEsc(value)}" ${active().sleepHabit===value?"selected":""}>${value}</option>`).join("")}</select><small>자는 중 현재 장면에 반영돼요. 수면 중인 내용은 생활 로그에 기록하지 않아요.</small>`;fields.append(label);
    }
    if(fields&&!profile.querySelector('[data-field="gender"]')){
      const block=document.createElement("div");block.className="profile-extra-settings";
      const select=(field,title,values,current,help="")=>`<label>${title}<select data-field="${field}">${values.map(value=>`<option value="${htmlEsc(value)}" ${value===current?"selected":""}>${value}</option>`).join("")}</select>${help?`<small>${help}</small>`:""}</label>`;
      block.innerHTML=
        select("gender","성별",["설정하지 않음","남성","여성","그외"],active().gender||"설정하지 않음")+
        select("speechStyle","캐릭터 말투",SPEECH_STYLE_OPTIONS,active().speechStyle||"자동 · 성격에 맞춤","질문 팝업과 캐릭터가 직접 하는 말에 실제로 반영돼요. ‘자동’은 성격 유형을 보고 어울리는 말투를 고릅니다.")+
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
      const job=labelOf('[data-field="job"]'),jobTitle=labelOf('[data-field="jobTitle"]'),workplace=labelOf('[data-field="workplaceId"]'),income=labelOf('[data-field="income"]'),gender=labelOf('[data-field="gender"]'),speech=labelOf('[data-field="speechStyle"]'),orientation=labelOf('[data-field="attractionTarget"]'),wealth=labelOf('[data-field="wealth"]');
      if(job&&gender&&orientation)job.before(gender,...(speech?[speech]:[]),orientation);
      if(job&&jobTitle)job.after(jobTitle);
      if(income&&wealth)income.before(wealth);
      if(workplace&&!profile.querySelector('[data-field="birthday"]')){
        const birthday=document.createElement("label");
        birthday.innerHTML=`생일 · 월일<input type="text" inputmode="numeric" maxlength="4" pattern="(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])" data-field="birthday" value="${active().birthday||""}" placeholder="예: 0804"><small>연도 없이 네 자리로 입력해요. 생일파티는 당일 오후 7시에 생성돼요.</small>`;
        workplace.after(birthday);
      }
      const license=profile.querySelector('input[data-character-check][data-field="driverLicense"]')?.closest("label");
      if(license)fields.append(license);
      const exportButton=profile.querySelector("[data-export-profile]");
      if(exportButton)profile.append(exportButton);
    }
  });
  document.querySelectorAll("[data-profile-tags-summary]").forEach(summary=>{
    const values=active()[summary.dataset.profileTagsSummary]||[];
    summary.textContent=values.length?values.join(" · "):({en:"Not set",ja:"未設定"}[state.uiLanguage]||"정하지 않음");
  });
  enhanceCatalogCards();
  document.querySelectorAll(".place-editor details").forEach(details=>{
    const placeId=details.querySelector("[data-place-id]")?.dataset.placeId;if(!placeId||details.querySelector("[data-building-shape-open]"))return;
    const button=document.createElement("button");button.type="button";button.dataset.buildingShapeOpen=placeId;button.className="building-shape-open";button.textContent="건물 모양 선택";
    details.querySelector(".place-config")?.insertAdjacentElement("afterend",button);
  });
  const sync=document.querySelector(".sync-panel");
  if(sync&&!sync.querySelector(".storage-meter")){
    const storageCopy={
      en:{title:"Photo storage",usage:"Checking this device…",summary:"Originals stay on this device, while optimized uncropped copies sync with your Google account."},
      ja:{title:"写真ストレージ",usage:"端末の使用量を確認中…",summary:"原本はこの端末に残し、切り抜かない保存用コピーをGoogleアカウントと同期します。"}
    }[state.uiLanguage]||{title:"사진 저장 공간",usage:"기기 사용량 확인 중…",summary:"원본은 이 기기에 유지하고, 자르지 않은 저장용 사본을 Google 계정과 동기화해요."};
    const meter=document.createElement("div");meter.className="storage-meter";meter.innerHTML=`<h3>${storageCopy.title}</h3><div><i style="width:0"></i></div><b>${storageCopy.usage}</b><small>${storageCopy.summary}</small>`;sync.append(meter);
    localMediaUsage(state).then(usage=>{
      if(!meter.isConnected)return;
      const amount=usage.bytes===0?"0B":usage.bytes<1048576?`${Math.max(0.1,usage.bytes/1024).toFixed(1)}KB`:`${(usage.bytes/1048576).toFixed(1)}MB`;
      const cloudUsage=window.ParallelCityAuth?.getInfo?.().storageUsage||{},cloudCount=Math.max(Number(cloudUsage.count)||0,Number(usage.cloudCount)||0),cloudBytes=Number(cloudUsage.bytes)||0;
      const cloudAmount=cloudBytes===0?"0B":cloudBytes<1048576?`${Math.max(0.1,cloudBytes/1024).toFixed(1)}KB`:`${(cloudBytes/1048576).toFixed(1)}MB`;
      meter.querySelector("b").textContent=state.uiLanguage==="en"?`Device originals ${usage.count} · ${amount} / Cloud copies ${cloudCount} · ${cloudAmount}`:state.uiLanguage==="ja"?`端末の原本 ${usage.count}枚・${amount} / クラウド ${cloudCount}枚・${cloudAmount}`:`기기 원본 ${usage.count}장 · ${amount} / 클라우드 사본 ${cloudCount}장 · ${cloudAmount}`;
      const maximum=Number(cloudUsage.maxBytes)||20*1048576;
      meter.querySelector("i").style.width=`${Math.min(100,cloudBytes/maximum*100)}%`;
    });
  }
}
const newId=()=>crypto.randomUUID?.()||`${Date.now()}-${Math.random()}`;
const newRoutineDraft=()=>{const id=newId();return {id,seriesId:id,day:1,start:"09:00",end:"10:00",type:"개인 일정",title:"새 일정",placeId:"",visitHomeId:"",withIds:[],notes:""}};
const updateRoutine=(characterId,id,patch)=>{const item=state.routines[characterId]?.find(r=>r.id===id);if(item){Object.assign(item,patch);save(true)}};
const deleteRoutine=(characterId,id)=>{state.routines[characterId]=(state.routines[characterId]||[]).filter(r=>r.id!==id);save(true)};
const currentMonthKey=()=>{const date=new Date();return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}`};
const newMonthlyRoutineDraft=()=>{
  const month=state.routineMonth||currentMonthKey(),today=new Date(),date=month===currentMonthKey()?`${month}-${String(today.getDate()).padStart(2,"0")}`:`${month}-01`;
  return {id:newId(),date,start:"09:00",end:"10:00",type:"개인 일정",title:"새 일정",placeId:"",visitHomeId:"",withIds:[],notes:""};
};
const updateMonthlyRoutine=(characterId,id,patch)=>{const item=state.monthlyRoutines?.[characterId]?.find(r=>r.id===id);if(item){Object.assign(item,patch);state.characters[characterId].timelineResetAt=Date.now();save(true)}};
const deleteMonthlyRoutine=(characterId,id)=>{state.monthlyRoutines[characterId]=(state.monthlyRoutines?.[characterId]||[]).filter(r=>r.id!==id);state.characters[characterId].timelineResetAt=Date.now();save(true)};
const maintenanceConfig=()=>window.PARALLEL_CITY_CONFIG?.maintenance||{};
const maintenanceEnabled=()=>Boolean(maintenanceConfig().enabled);
const ONBOARDING_KEY="drawer-village-onboarding-v2";
const SETUP_COACH_KEY="drawer-village-first-setup-v2";
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

const CATALOG_APP_ART={
  food:["🍲","🍱","🍰","🍜"],drink:["☕","🫖","🥤","🍹"],fashion:["👗","🧥","👟","👜"],
  music:["🎧","🎹","🎸","🎼"],idol:["🎤","✨","💿","🎙️"],book:["📖","📚","✒️","🗞️"],
  movie:["🎬","📺","🎞️","🍿"],game:["🎮","🕹️","🎲","♟️"],perfume:["🧴","🌸","🌿","✨"],
  hobby:["🎨","🧶","📷","🧩"],electronics:["💻","📱","📷","🎧"],weapon:["⚔️","🏹","🛡️","🗡️"]
};
const catalogIllustration=(kind="hobby",index=0)=>{
  const symbols=CATALOG_APP_ART[kind]||CATALOG_APP_ART.hobby,symbol=symbols[index%symbols.length];
  const accents=["#ffd36f","#88d7ca","#f4a6c1","#aeb8ff"],accent=accents[index%accents.length];
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 320"><defs><filter id="s"><feDropShadow dx="0" dy="12" stdDeviation="10" flood-color="#07111f" flood-opacity=".24"/></filter></defs><path d="M79 230c-19-39-11-99 20-133 30-34 84-50 134-36 49 14 102 58 104 108 3 51-44 91-94 106-49 15-137-1-164-45Z" fill="${accent}" opacity=".36"/><text x="210" y="220" text-anchor="middle" font-size="156" font-family="Apple Color Emoji,Segoe UI Emoji,Noto Color Emoji,sans-serif" filter="url(#s)">${symbol}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};
function openCatalogIllustrationPicker(itemId,kind){
  const item=state.catalog?.[kind]?.find(entry=>entry.id===itemId);if(!item)return;
  const dialog=document.createElement("dialog");dialog.className="catalog-illustration-dialog";
  const symbols=CATALOG_APP_ART[kind]||CATALOG_APP_ART.hobby;
  dialog.innerHTML=`<form method="dialog"><div class="title"><div><small>앱 기본 그림</small><h2>${htmlEsc(item.name||"항목")} 일러스트</h2></div><button value="close" aria-label="닫기">×</button></div><p>사진 첨부와 별개인 서랍마을 기본 일러스트예요. 투명 배경과 원본 비율로 표시됩니다.</p><div class="catalog-illustration-grid">${symbols.map((symbol,index)=>`<button type="button" data-catalog-app-art="${index}"><img src="${catalogIllustration(kind,index)}" alt=""><span>${symbol} 일러스트 ${index+1}</span></button>`).join("")}</div></form>`;
  dialog.querySelectorAll("[data-catalog-app-art]").forEach(button=>button.onclick=()=>{
    updateCatalogItem(kind,itemId,{image:catalogIllustration(kind,Number(button.dataset.catalogAppArt)),imageSource:"app"});
    dialog.close();replaceCatalogCard(kind,itemId,{open:true});
  });
  dialog.onclose=()=>dialog.remove();document.body.append(dialog);dialog.showModal();
}

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
  const interiorStyles=["설정하지 않음","미니멀","모던","북유럽풍","유럽풍","클래식","빈티지","인더스트리얼","한옥풍","일본식","지중해풍","맥시멀","아기자기","자연친화","고딕","미래적","기타"];
  const floorCount=Math.max(1,Number(state.homes[homeId]?.floorCount)||1);
  dialog.innerHTML=`<form method="dialog"><div class="title"><div><small>방 편집</small><h2>${room.name||"방"}</h2></div><button value="close">×</button></div><div class="room-editor-fields"><label>방 이름<input name="name" value="${String(room.name||"방").replace(/"/g,"&quot;")}"></label><label>방 유형<select name="type">${Object.entries(ROOM_EDITOR_TYPES).map(([value,label])=>`<option value="${value}" ${room.type===value?"selected":""}>${label}</option>`).join("")}</select></label><label>방이 있는 층<select name="floor">${Array.from({length:floorCount},(_,index)=>index+1).map(value=>`<option value="${value}" ${value===(Number(room.floor)||1)?"selected":""}>${value}층</option>`).join("")}</select></label><label>방 크기<select name="size">${["작은 방","보통 방","큰 방","넓고 긴 방"].map(value=>`<option ${value===(room.size||"보통 방")?"selected":""}>${value}</option>`).join("")}</select><small>집 편집 모드에서 위치와 크기가 12×16 격자 칸에 자석처럼 맞춰져요.</small></label><label>방 사진 표시<select name="imageFit"><option value="contain" ${room.imageFit!=="cover"?"selected":""}>전체 보기 · 자르지 않음</option><option value="cover" ${room.imageFit==="cover"?"selected":""}>공간 채우기 · 가장자리 잘림</option></select><small>침실처럼 사진 전체가 중요한 방은 ‘전체 보기’를 권장해요.</small></label><label>인테리어 스타일<select name="interiorStyle">${interiorStyles.map(value=>`<option ${value===(room.interiorStyle||"설정하지 않음")?"selected":""}>${value}</option>`).join("")}</select><small>가끔 공간의 무드와 캐릭터의 기분 묘사에 반영돼요.</small></label></div><button type="button" class="room-editor-photo" data-edit-room-photo>${room.image?`<span style="background-image:url('${room.image}')"></span><b>방 사진 변경</b>`:"<span>＋</span><b>방 사진 추가하기</b>"}</button><div class="room-editor-furniture-wrap"><b>이 방에 있는 가구</b><p class="room-editor-note">장면에 실제로 등장할 수 있는 가구만 선택해 주세요. 주민의 취미가 맞으면 능숙하게 즐기고, 낯선 취미라면 서툴게 시도하거나 관심 없이 지나쳐요.</p><div class="room-editor-furniture">${drawFurniture()}</div></div><div class="crop-actions"><button type="button" data-room-layout-reset ${room.layout?"":"hidden"}>자동 배치로 되돌리기</button><button type="button" class="danger" data-room-delete>방 삭제</button><button class="primary" value="save">완료</button></div></form>`;
  const titleToneField=document.createElement("label");
  titleToneField.innerHTML=`방 제목 색<select name="titleTone"><option value="light" ${room.titleTone!=="dark"?"selected":""}>밝은 글자</option><option value="dark" ${room.titleTone==="dark"?"selected":""}>어두운 글자</option></select><small>사진 밝기에 맞춰 방 이름이 잘 보이는 쪽을 고르세요.</small>`;
  dialog.querySelector(".room-editor-fields").insertBefore(titleToneField,dialog.querySelector('[name="type"]').closest("label"));
  const sync=()=>{updateRoom(homeId,roomKey,{name:dialog.querySelector('[name="name"]').value.trim()||"방",floor:Number(dialog.querySelector('[name="floor"]').value)||1,size:dialog.querySelector('[name="size"]').value,imageFit:dialog.querySelector('[name="imageFit"]').value==="cover"?"cover":"contain",interiorStyle:dialog.querySelector('[name="interiorStyle"]').value,titleTone:dialog.querySelector('[name="titleTone"]').value});const nextType=dialog.querySelector('[name="type"]').value;if(nextType!==room.type)setRoomType(homeId,roomKey,nextType)};
  dialog.querySelector('[name="type"]').onchange=()=>{sync();dialog.close();openRoomEditor(homeId,roomKey)};
  dialog.querySelector("[data-edit-room-photo]").onclick=()=>{sync();dialog.returnValue="photo";dialog.close();openRoomImageMenu(homeId,roomKey,{returnToEditor:true})};
  dialog.querySelectorAll("[data-room-furniture]").forEach(button=>button.onclick=()=>{toggleFurniture(homeId,roomKey,button.dataset.roomFurniture);button.classList.toggle("on")});
  dialog.querySelector("[data-room-layout-reset]")?.addEventListener("click",()=>{updateRoom(homeId,roomKey,{layout:undefined},false);delete state.homes[homeId].rooms[roomKey].layout;save(true);dialog.close();render();showToast("이 층의 자동 배치 기준으로 되돌렸어요")});
  dialog.querySelector("[data-room-delete]").onclick=()=>{if(confirm(`${room.name||"이 방"}을 삭제할까요?`)){deleteRoom(homeId,roomKey);dialog.close();explicitSave("방 삭제")}};
  dialog.onclose=()=>{if(dialog.returnValue==="save"){sync();save(true);render()}dialog.remove()};
  translateDynamicInterface(dialog);document.body.append(dialog);dialog.showModal();
}

const ROOM_LAYOUT_GRID={columns:12,rows:16,minColumns:2,minRows:2};
function snapRoomLayout(layout){
  const {columns,rows,minColumns,minRows}=ROOM_LAYOUT_GRID,cellX=100/columns,cellY=100/rows;
  let widthCells=Math.max(minColumns,Math.min(columns,Math.round((Number(layout.w)||cellX*minColumns)/cellX)));
  let heightCells=Math.max(minRows,Math.min(rows,Math.round((Number(layout.h)||cellY*minRows)/cellY)));
  let xCells=Math.max(0,Math.min(columns-widthCells,Math.round((Number(layout.x)||0)/cellX)));
  let yCells=Math.max(0,Math.min(rows-heightCells,Math.round((Number(layout.y)||0)/cellY)));
  return{x:xCells*cellX,y:yCells*cellY,w:widthCells*cellX,h:heightCells*cellY};
}
function setRoomLayoutStyle(room,layout){
  room.style.setProperty("--mobile-room-x",`${layout.x}%`);
  room.style.setProperty("--mobile-room-y",`${layout.y}%`);
  room.style.setProperty("--mobile-room-w",`${layout.w}%`);
  room.style.setProperty("--mobile-room-h",`${layout.h}%`);
}
function captureRoomCanvasLayouts(canvas){
  const box=canvas?.getBoundingClientRect();if(!box?.width||!box?.height)return false;
  canvas.querySelectorAll(".room[data-room-key]").forEach(room=>{
    const rect=room.getBoundingClientRect(),width=Math.max(16,Math.min(100,rect.width/box.width*100)),height=Math.max(16,Math.min(100,rect.height/box.height*100));
    const layout=snapRoomLayout({x:Math.max(0,Math.min(100-width,(rect.left-box.left)/box.width*100)),y:Math.max(0,Math.min(100-height,(rect.top-box.top)/box.height*100)),w:width,h:height});
    updateRoom(canvas.dataset.homeId,room.dataset.roomKey,{layout},false);setRoomLayoutStyle(room,layout);
  });
  save(true);return true;
}

function bindRoomGeometryHandle(handle,mode){
  let pointerId=null,startX=0,startY=0,startLayout=null,room=null,canvas=null;
  const finish=event=>{
    if(pointerId===null)return;
    if(handle.hasPointerCapture(pointerId))handle.releasePointerCapture(pointerId);
    pointerId=null;room?.classList.remove("room-dragging");
    if(startLayout&&room)updateRoom(handle.dataset.homeId,mode==="move"?handle.dataset.roomDrag:handle.dataset.roomResize,{layout:snapRoomLayout({
      x:parseFloat(room.style.getPropertyValue("--mobile-room-x"))||0,
      y:parseFloat(room.style.getPropertyValue("--mobile-room-y"))||0,
      w:parseFloat(room.style.getPropertyValue("--mobile-room-w"))||startLayout.w,
      h:parseFloat(room.style.getPropertyValue("--mobile-room-h"))||startLayout.h
    })},true);
    event?.preventDefault?.();event?.stopPropagation?.();
  };
  handle.onclick=event=>{event.preventDefault();event.stopPropagation()};
  handle.onpointerdown=event=>{
    event.preventDefault();event.stopPropagation();
    room=handle.closest(".room");canvas=handle.closest("[data-room-canvas]");if(!room||!canvas)return;
    if(!state.homes[handle.dataset.homeId]?.rooms?.[room.dataset.roomKey]?.layout)captureRoomCanvasLayouts(canvas);
    const saved=state.homes[handle.dataset.homeId]?.rooms?.[room.dataset.roomKey]?.layout;if(!saved)return;
    startLayout=snapRoomLayout(saved);setRoomLayoutStyle(room,startLayout);startX=event.clientX;startY=event.clientY;pointerId=event.pointerId;
    handle.setPointerCapture(pointerId);room.classList.add("room-dragging");
  };
  handle.onpointermove=event=>{
    if(pointerId!==event.pointerId||!startLayout||!canvas)return;
    event.preventDefault();event.stopPropagation();
    const box=canvas.getBoundingClientRect(),dx=(event.clientX-startX)/box.width*100,dy=(event.clientY-startY)/box.height*100;
    if(mode==="move"){
      setRoomLayoutStyle(room,snapRoomLayout({...startLayout,x:startLayout.x+dx,y:startLayout.y+dy}));
    }else{
      setRoomLayoutStyle(room,snapRoomLayout({...startLayout,w:startLayout.w+dx,h:startLayout.h+dy}));
    }
  };
  handle.onpointerup=finish;handle.onpointercancel=finish;
}

function showOnboarding(){
  if(state.activeTab==="settings"||state.order.length||localStorage.getItem(ONBOARDING_KEY)==="done"||document.querySelector(".onboarding-dialog"))return;
  const openDialog=document.querySelector("dialog[open]");
  if(openDialog){
    if(openDialog.dataset.waitingForOnboarding!=="1"){
      openDialog.dataset.waitingForOnboarding="1";
      openDialog.addEventListener("close",()=>requestAnimationFrame(showOnboarding),{once:true});
    }
    return;
  }
  let step=0,userName=localStorage.getItem("drawer-village-user-name")||"";
  const dialog=document.createElement("dialog");dialog.className="onboarding-dialog";
  const pages=[
    ()=>`<div class="onboarding-welcome-art"><img src="./icons/drawer-village-logo.png" alt="서랍 속에 담긴 서랍마을"></div><small>캐릭터 생활 시뮬레이션</small><h1>서랍을 열면,<br><em>나만의 마을이 시작돼요</em></h1><p>내가 만든 캐릭터들이 집과 관계, 일정을 이어 가며<br>각자의 하루를 살아갑니다.</p><div class="onboarding-welcome-points" aria-label="서랍마을 핵심 기능"><span>캐릭터</span><span>집과 마을</span><span>관계와 하루</span></div><div class="onboarding-actions"><button type="button" data-onboarding-settings>설정 먼저 보기</button><button class="primary onboarding-start" type="button" data-onboarding-next>서랍마을 시작하기</button></div>`,
    ()=>`<div class="onboarding-hero-icon">✦</div><small>STEP 1 · 마을의 주인</small><h1>어떻게 불러드릴까요?</h1><p>게임 안내에서만 사용할 이름이에요. 캐릭터 이름과는 별개이고 나중에도 바꿀 수 있어요.</p><label class="onboarding-name">내 이름 또는 별명<input name="userName" value="${userName.replace(/"/g,"&quot;")}" maxlength="20" autocomplete="nickname" placeholder="예: 꺄륵"></label><button class="primary" type="button" data-onboarding-next>다음</button>`,
    ()=>`<div class="onboarding-hero-icon">◇</div><small>STEP 2 · 저장 방식</small><h1>${userName||"마을 주인"}님의 기록은<br>먼저 이 기기에 저장돼요</h1><p>계정을 연결해도 드롭다운 하나를 바꿀 때마다 자동 업로드하지 않아요. 설정에서 <b>동기화</b>를 눌렀을 때만 올리고, <b>불러오기</b>를 눌렀을 때만 다른 기기의 기록을 가져와요.</p><div class="onboarding-safe-note"><b>캐릭터·관계·집을 자동으로 만들지 않습니다.</b><span>백업 파일은 설정에서 언제든 내보낼 수 있어요.</span></div><div class="onboarding-actions"><button type="button" data-onboarding-login>Google 계정 연결</button><button class="primary" type="button" data-onboarding-next>지금은 기기에만 저장</button></div>`,
    ()=>`<div class="onboarding-hero-icon">＋</div><small>STEP 3 · 첫 주민</small><h1>첫 캐릭터부터<br>직접 만들어 볼까요?</h1><p>캐릭터를 만든 뒤에는 설정 화면에서 이름과 사진을 정하고, 이어서 집과 마을을 차례로 편집해요.</p><div class="onboarding-route"><span><b>1</b>캐릭터 만들기</span><i>→</i><span><b>2</b>캐릭터 설정</span><i>→</i><span><b>3</b>집 편집</span><i>→</i><span><b>4</b>마을 편집</span></div><button class="primary" type="button" data-onboarding-create>첫 캐릭터 만들기</button>`
  ];
  const paint=()=>{
    dialog.innerHTML=`<form method="dialog" class="${step===0?"onboarding-first":""}"><div class="onboarding-progress" aria-label="${step+1} / ${pages.length} 단계">${pages.map((_,index)=>`<i class="${index<=step?"on":""}"></i>`).join("")}</div><section class="${step===0?"onboarding-welcome":""}">${pages[step]()}</section>${step?`<button type="button" class="onboarding-back" data-onboarding-back>← 이전</button>`:""}</form>`;
    dialog.querySelector("[data-onboarding-back]")?.addEventListener("click",()=>{step=Math.max(0,step-1);paint()});
    dialog.querySelector("[data-onboarding-next]")?.addEventListener("click",()=>{
      const input=dialog.querySelector('[name="userName"]');if(input){if(!input.value.trim()){input.focus();return}userName=input.value.trim();localStorage.setItem("drawer-village-user-name",userName);state.ownerName=userName;save(true)}
      step=Math.min(pages.length-1,step+1);paint();
    });
    dialog.querySelector("[data-onboarding-login]")?.addEventListener("click",async event=>{const auth=window.ParallelCityAuth;if(!auth)return showToast("로그인 기능을 불러오는 중이에요");const button=event.currentTarget;button.disabled=true;button.textContent="Google 로그인 여는 중…";const connected=await auth.login();if(connected){step=3;paint()}else{button.disabled=false;button.textContent="Google 계정 연결"}});
    dialog.querySelector("[data-onboarding-settings]")?.addEventListener("click",()=>{setNavigationTabIntent("settings");dialog.close();save();render()});
    dialog.querySelector("[data-onboarding-create]")?.addEventListener("click",()=>{if(createCharacter(characterLimit())){localStorage.setItem(ONBOARDING_KEY,"done");localStorage.setItem(SETUP_COACH_KEY,"character");dialog.close();setNavigationTabIntent("character");setCharacterPane("profile");save();render();showToast("첫 캐릭터의 이름부터 정해 볼까요?")}});
  };
  dialog.onclose=()=>dialog.remove();
  dialog.setAttribute("aria-label","첫 시작 안내");
  document.body.append(dialog);
  paint();
  // iPhone Safari에서 전체 화면 dialog를 modal로 연 직후 다른 렌더가 겹치면
  // 배경만 흐려진 채 내용이 눌리지 않는 경우가 있어 모바일은 자체 전체화면으로 연다.
  try{
    if(document.documentElement.classList.contains("native-app"))dialog.show();
    else dialog.showModal();
  }catch(error){
    dialog.setAttribute("open","");
  }
}
function showSetupCoach(){
  const step=localStorage.getItem(SETUP_COACH_KEY);
  if(!state.order.length||!["character","home","town"].includes(step)||document.querySelector("dialog[open]"))return;
  const dialog=document.createElement("dialog");dialog.className="setup-coach-dialog";
  if(step==="character"){
    dialog.innerHTML=`<form method="dialog"><span class="setup-coach-icon">♙</span><small>첫 번째 설정 · 캐릭터</small><h2>먼저 이 캐릭터를 알려 주세요</h2><p>이름과 사진처럼 꼭 필요한 항목만 정해도 바로 생활을 시작할 수 있어요. 성격과 취향을 자세히 적을수록 장면이 더 구체적으로 달라집니다.</p><ol><li>프로필에서 이름과 기본 정보를 정해요.</li><li>원하면 신체·성격·취향을 더 자세히 설정해요.</li><li><b>캐릭터 저장</b>을 누르면 집 편집으로 이어져요.</li></ol><div><button value="later">나중에</button><button type="button" class="primary" data-start-character-setup>캐릭터 설정 열기</button></div></form>`;
    dialog.querySelector("[data-start-character-setup]").onclick=()=>{localStorage.setItem(SETUP_COACH_KEY,"character-editing");setNavigationTabIntent("character");setCharacterPane("profile");dialog.close();render()};
  }else if(step==="home"){
    dialog.innerHTML=`<form method="dialog"><span class="setup-coach-icon">⌂</span><small>첫 번째 꾸미기 · 집</small><h2>방을 눌러 생활 공간을 만들어 보세요</h2><p>집 편집을 켜면 위쪽 한 줄의 <b>방 추가·구성</b>에서 방을 늘릴 수 있어요. 방 자체를 누르면 이름, 크기, 사진과 실제 가구를 바꿀 수 있습니다.</p><ol><li>‘방 추가·구성’에서 필요한 방을 추가해요.</li><li>각 방을 눌러 크기와 사진을 정해요.</li><li>구성원에서 이 집을 본가·별채·주말집으로 연결해요.</li></ol><div><button value="later">나중에</button><button type="button" class="primary" data-start-home-setup>집 편집 시작</button></div></form>`;
    dialog.querySelector("[data-start-home-setup]").onclick=()=>{localStorage.setItem(SETUP_COACH_KEY,"home-editing");setNavigationTabIntent("home");setActiveHome(active()?.homeId||state.activeHomeId);setHomeEditMode(true);dialog.close();render()};
  }else{
    dialog.innerHTML=`<form method="dialog"><span class="setup-coach-icon">⌖</span><small>두 번째 꾸미기 · 마을</small><h2>편집 모드에서만 건물이 움직여요</h2><p>평소에는 캐릭터 위치를 관찰하고, <b>편집 모드</b>를 켠 뒤 건물을 누르면 이름·종류·실내 사진을 바꿀 수 있어요. 생활 목적이 있는 캐릭터만 그 장소를 방문합니다.</p><ol><li>편집 모드를 켭니다.</li><li>건물을 눌러 정보를 바꿉니다.</li><li>필요할 때만 위치를 옮깁니다.</li></ol><div><button value="later">나중에</button><button type="button" class="primary" data-start-town-setup>마을 편집 보기</button></div></form>`;
    dialog.querySelector("[data-start-town-setup]").onclick=()=>{localStorage.setItem(SETUP_COACH_KEY,"done");setNavigationTabIntent("town");dialog.close();render()};
  }
  dialog.onclose=()=>{if(dialog.returnValue==="later")localStorage.setItem(SETUP_COACH_KEY,"done");dialog.remove()};
  document.body.append(dialog);dialog.showModal();
}

function advanceFirstSetupAfterCharacter(){
  const step=localStorage.getItem(SETUP_COACH_KEY);
  if(!["character","character-editing"].includes(step))return false;
  localStorage.setItem(SETUP_COACH_KEY,"home-editing");
  setNavigationTabIntent("home");
  setActiveHome(active()?.homeId||state.activeHomeId);
  setHomeEditMode(true);
  render();
  showToast("이제 첫 집의 방을 편집해 보세요.");
  return true;
}
function renderMaintenance(){
  const config=maintenanceConfig();
  document.body.classList.add("maintenance-mode");
  document.querySelector("#app").innerHTML=`<main class="maintenance-screen"><section><span>🛠️</span><p>EMERGENCY MAINTENANCE</p><h1>${config.title||"서랍마을을 잠시 점검하고 있어요"}</h1><p>${config.message||"예상치 못한 문제를 확인하고 있습니다."}</p><small>${config.eta||""}</small><button class="primary" type="button" id="maintenance-reload">다시 확인하기</button></section></main>`;
  document.querySelector("#maintenance-reload")?.addEventListener("click",()=>location.reload());
}

function replaceFeedbackFormWithEmailLink(){
  const card=document.querySelector(".feedback-card");
  if(!card)return;
  const copy={
    ko:{title:"개발자에게 피드백 보내기",description:"보내려는 내용의 유형을 고르면 기기의 메일 앱이 열려요. 아래 진단 정보가 함께 들어가 문제를 확인하는 데 도움을 줍니다.",recipient:"받는 주소",diagnostics:"자동 첨부 진단 정보",prompt:"아래에 자세한 내용을 적어 주세요.",types:[["오류 신고","오류","어떤 동작을 했을 때 무엇이 잘못되었는지, 다시 발생하는 순서를 적어 주세요."],["기능 제안","제안","원하는 기능과 사용 상황을 적어 주세요."],["생활 장면·관계","장면/관계","어떤 캐릭터 설정에서 어떤 장면이 어색했는지 적어 주세요. 캐릭터 이름은 필요한 경우에만 직접 적어 주세요."],["번역·문구","번역","언어와 어색하거나 잘못된 문구를 적어 주세요."],["결제·계정·동기화","결제/동기화","표시된 오류 문구와 시도한 순서를 적어 주세요. 비밀번호나 API 비밀키는 적지 마세요."],["디자인·사용성","UI","보기 어렵거나 누르기 불편한 위치와 원하는 모습을 적어 주세요."]]},
    en:{title:"Send feedback to the developer",description:"Choose a category to open your email app. Helpful device diagnostics are included automatically.",recipient:"Recipient",diagnostics:"Automatically included diagnostics",prompt:"Please describe the details below.",types:[["Report a bug","Bug","Describe what you did, what went wrong, and how to reproduce it."],["Suggest a feature","Feature","Describe the feature and when you would use it."],["Life scenes & relationships","Scene/Relationship","Describe which settings produced an awkward scene. Add character names only if needed."],["Translation & wording","Translation","Tell us the language and the incorrect or awkward text."],["Payments, account & sync","Payment/Sync","Include the error message and steps you tried. Never include passwords or secret API keys."],["Design & usability","UI","Describe what was hard to read or use and what you expected instead."]]},
    ja:{title:"開発者へフィードバック",description:"種類を選ぶとメールアプリが開きます。確認に役立つ端末情報も自動で入ります。",recipient:"宛先",diagnostics:"自動添付される診断情報",prompt:"詳しい内容を下に入力してください。",types:[["不具合を報告","不具合","行った操作、問題、再現手順を記入してください。"],["機能を提案","機能提案","ほしい機能と利用場面を記入してください。"],["生活シーン・関係","シーン/関係","どの設定で不自然なシーンが出たか記入してください。必要な場合のみ名前を追加してください。"],["翻訳・文言","翻訳","言語と不自然または誤った文言を記入してください。"],["決済・アカウント・同期","決済/同期","エラー文と試した手順を記入してください。パスワードや秘密鍵は書かないでください。"],["デザイン・操作性","UI","読みにくい、操作しにくい場所と期待した表示を記入してください。"]]}
  }[state.uiLanguage]||null;
  const text=copy||{title:"개발자에게 피드백 보내기",description:"유형을 고르면 기기의 메일 앱이 열려요.",recipient:"받는 주소",diagnostics:"자동 첨부 진단 정보",prompt:"아래에 자세한 내용을 적어 주세요.",types:[["오류 신고","오류","문제와 재현 순서를 적어 주세요."]]};
  const build=String(window.DRAWER_VILLAGE_NATIVE_BUILD||"web");
  const appVersion=String(window.DRAWER_VILLAGE_APP_VERSION||"web"),versionCode=String(window.DRAWER_VILLAGE_VERSION_CODE||"-");
  const deviceModel=navigator.userAgentData?.model||String(navigator.userAgent||"").match(/Android[^;]*;\s*([^;)]+?)\s+Build\//)?.[1]||"not exposed by this browser";
  const diagnostics=[
    `Version: ${appVersion} / code ${versionCode}`,
    `Build: ${build} (${window.DRAWER_VILLAGE_NATIVE?"Android app":"Web"})`,
    `Device/model: ${deviceModel}`,
    `User agent: ${navigator.userAgent||"unknown"}`,
    `Platform: ${navigator.userAgentData?.platform||navigator.platform||"unknown"}`,
    `Screen: ${screen.width}x${screen.height} / viewport ${window.innerWidth}x${window.innerHeight} / DPR ${window.devicePixelRatio||1}`,
    `Language: ${navigator.language||"unknown"} / UI ${state.uiLanguage||"ko"}`,
    `Time zone: ${Intl.DateTimeFormat().resolvedOptions().timeZone||"unknown"}`,
    `Online: ${navigator.onLine?"yes":"no"}`,
    `Theme: ${state.colorMode||"light"} / ${state.visualTheme||"monochrome"}`,
    `Data counts: characters ${state.order?.length||0}, towns ${state.towns?.length||0}`,
    `Media restore: found ${lastLocalMediaResult.found}, restored ${lastLocalMediaResult.resolved}, pending ${lastLocalMediaResult.pending}`
  ].join("\n");
  const links=text.types.map(([label,prefix,hint])=>{
    const subject=encodeURIComponent(`[${state.uiLanguage==="ja"?"ひきだし村":state.uiLanguage==="en"?"Drawer Village":"서랍마을"}][${prefix}]`);
    const body=encodeURIComponent(`${text.prompt}\n${hint}\n\n--- ${text.diagnostics} ---\n${diagnostics}`);
    return `<a class="primary feedback-email-button feedback-email-type" href="mailto:kkyaareuk@gmail.com?subject=${subject}&body=${body}">${label}</a>`;
  }).join("");
  card.innerHTML=`<h2>${text.title}</h2><p>${text.description}</p><div class="feedback-email-types">${links}</div><small>${text.recipient} · kkyaareuk@gmail.com</small>`;
}

function restoreWindowScroll(x,y){
  const restore=()=>window.scrollTo({left:x,top:y,behavior:"auto"});
  requestAnimationFrame(()=>{restore();requestAnimationFrame(restore)});
  setTimeout(restore,40);
}
function restoreMainScroll(left,top,openCatalogKeys=[]){
  const restore=()=>{
    const main=document.querySelector("#app>main");
    if(main){main.scrollLeft=left;main.scrollTop=top}
    openCatalogKeys.forEach(key=>{
      const [kind,itemId]=String(key).split(":");
      document.querySelector(`.catalog-dex-card [data-catalog-field][data-kind="${CSS.escape(kind||"")}"][data-item="${CSS.escape(itemId||"")}"]`)?.closest("details")?.setAttribute("open","");
    });
  };
  requestAnimationFrame(()=>{restore();requestAnimationFrame(restore)});
  setTimeout(restore,40);
}
function preserveSelectionScroll(element){
  const page={x:window.scrollX,y:window.scrollY},main=document.querySelector("#app>main");
  const mainPosition={left:main?.scrollLeft||0,top:main?.scrollTop||0};
  const details=element?.closest?.("details"),detailsPosition=details?{left:details.scrollLeft,top:details.scrollTop}:null;
  const restore=()=>{
    window.scrollTo({left:page.x,top:page.y,behavior:"auto"});
    if(main?.isConnected){main.scrollLeft=mainPosition.left;main.scrollTop=mainPosition.top}
    if(details?.isConnected&&detailsPosition){details.scrollLeft=detailsPosition.left;details.scrollTop=detailsPosition.top}
  };
  // Android의 네이티브 선택창은 change 직후와 닫힘 애니메이션 뒤 두 번
  // 포커스를 돌려주기도 한다. 두 프레임과 짧은 지연 뒤까지 같은 위치를 고정한다.
  requestAnimationFrame(()=>{restore();requestAnimationFrame(restore)});
  setTimeout(restore,50);setTimeout(restore,180);
  return restore;
}
function characterEditorDetailKey(details){
  if(details?.dataset?.bodyOptionGroup)return `body:${details.dataset.bodyOptionGroup}`;
  if(details?.classList?.contains("profile-advanced-settings"))return "profile:advanced";
  if(details?.classList?.contains("personality-advanced-settings"))return "personality:advanced";
  if(details?.classList?.contains("body-advanced-settings"))return "body:advanced";
  return "";
}
function restoreMobileCharacterEditorContinuity(dialog){
  const restore=()=>{
    const current=document.querySelector("[data-mobile-character-editor-dialog][open]")||dialog;
    if(!current)return;
    if(mobileCharacterEditorDetailsCaptured)current.querySelectorAll("details").forEach(details=>{
      const key=characterEditorDetailKey(details);
      if(key)details.open=mobileCharacterEditorOpenDetails.includes(key);
    });
    const body=current.querySelector(".mobile-character-editor-body");
    if(body)body.scrollTop=mobileCharacterEditorScroll;
  };
  requestAnimationFrame(()=>{restore();requestAnimationFrame(restore)});
  setTimeout(restore,60);
}
function stabilizeInteractiveScroll(root,resolveScroller){
  if(!root||root.dataset.stableScrollBound==="1")return;
  root.dataset.stableScrollBound="1";
  let left=0,top=0,armed=false;
  const remember=()=>{
    const scroller=resolveScroller();
    if(!scroller)return;
    left=scroller.scrollLeft;top=scroller.scrollTop;armed=true;
  };
  const restore=()=>{
    if(!armed)return;
    const apply=()=>{
      const scroller=resolveScroller();
      if(!scroller)return;
      scroller.scrollLeft=left;scroller.scrollTop=top;
      if(scroller.matches?.(".mobile-character-editor-body"))mobileCharacterEditorScroll=top;
    };
    requestAnimationFrame(()=>{apply();requestAnimationFrame(apply)});
    setTimeout(apply,60);
  };
  root.addEventListener("pointerdown",remember,true);
  root.addEventListener("keydown",event=>{if(["Enter"," "].includes(event.key))remember()},true);
  root.addEventListener("change",restore,true);
  root.addEventListener("click",restore,true);
}
function render({force=false}={}){
  // Samsung 천지인처럼 여러 단계로 한 글자를 조합하는 키보드는 포커스된
  // input 노드가 교체되는 순간 직전 음절을 다시 확정할 수 있다. 사진 복원,
  // 로그인, 시뮬레이션 타이머 등 외부 갱신도 타이핑 중에는 화면을 교체하지
  // 않고 다음 명시적 화면 전환까지 미룬다.
  // 사진 복원·로그인·초기 안내처럼 늦게 끝나는 작업이 저장 상태의 예전
  // activeTab을 되돌려도, 사용자가 마지막으로 확정한 화면 이동이 우선이다.
  if(navigationTabIntent&&state.activeTab!==navigationTabIntent)state.activeTab=navigationTabIntent;
  if(!force&&document.documentElement.dataset.drawerRendered==="1"&&isDeferredMobileTextControl(document.activeElement)){
    deferredRenderWhileMobileText=true;
    return;
  }
  deferredRenderWhileMobileText=false;
  document.querySelector("#app-loading")?.remove();
  // Older Android WebViews could suspend requestAnimationFrame immediately
  // after a page transition. The old transition guard then stayed on <html>
  // and made the entire app untappable. Always recover from that stale state
  // before rebuilding the screen; navigation no longer disables pointer input.
  document.documentElement.classList.remove("page-switching");
  const preservePageScroll=document.documentElement.dataset.drawerRendered==="1"&&!resetScrollAfterRender;
  const previousPageX=window.scrollX,previousPageY=window.scrollY;
  // 앱에서는 window가 아니라 main이 실제 세로 스크롤을 담당한다. 이 값을
  // 따로 보존하지 않으면 취향 도감의 모든 재렌더가 화면을 맨 위로 보낸다.
  const previousMain=document.querySelector("#app>main"),previousMainLeft=previousMain?.scrollLeft||0,previousMainTop=previousMain?.scrollTop||0;
  const openCatalogKeys=[...document.querySelectorAll(".catalog-dex-card[open]")].map(card=>{
    const field=card.querySelector("[data-catalog-field][data-kind][data-item]");
    return field?`${field.dataset.kind}:${field.dataset.item}`:"";
  }).filter(Boolean);
  const openCharacterEditor=document.querySelector("[data-mobile-character-editor-dialog][open]");
  const openCharacterEditorBody=openCharacterEditor?.querySelector(".mobile-character-editor-body");
  if(openCharacterEditorBody){
    mobileCharacterEditorScroll=openCharacterEditorBody.scrollTop;
    mobileCharacterEditorOpenDetails=[...openCharacterEditorBody.querySelectorAll("details[open]")].map(characterEditorDetailKey).filter(Boolean);
    mobileCharacterEditorDetailsCaptured=true;
  }
  resetScrollAfterRender=false;
  try{
    const mobileSite=window.matchMedia?.("(max-width:720px)")?.matches??window.innerWidth<=720;
    const nativePlatform=Boolean(window.DRAWER_VILLAGE_NATIVE||window.Capacitor?.isNativePlatform?.()||((location.hostname==="127.0.0.1"||location.hostname==="localhost")&&new URLSearchParams(location.search).has("native-preview")));
    const appLayout=nativePlatform||mobileSite;
    // 모바일 웹도 Android 앱과 같은 DOM·레이어·터치 규칙을 사용한다.
    // 실제 네이티브 기능 여부는 window.DRAWER_VILLAGE_NATIVE로만 판단한다.
    document.documentElement.classList.toggle("native-app",appLayout);
    document.documentElement.classList.toggle("native-platform",appLayout);
    document.documentElement.classList.toggle("mobile-site",!nativePlatform&&mobileSite);
    document.documentElement.lang=({en:"en",ja:"ja"}[state.uiLanguage]||"ko");
    document.title=({en:"Drawer Village",ja:"ひきだし村"}[state.uiLanguage]||"서랍마을");
    delete document.documentElement.dataset.uiFont;
    document.documentElement.dataset.uiScale=state.uiScale||"normal";
    if(maintenanceEnabled()){renderMaintenance();return}
    document.body.classList.remove("maintenance-mode");
    if(["character","mailbox"].includes(state.activeTab))ensureDailyQuestionSchedule();
    renderApp(state);
    replaceFeedbackFormWithEmailLink();
    // A data-action button without an explicit type must never submit an
    // enclosing form. Accidental form submissions were jumping mobile pages
    // back to the top before the actual click handler finished.
    document.querySelectorAll("button:not([type])").forEach(button=>{
      if(button.closest('form[method="dialog"]')&&button.hasAttribute("value"))return;
      button.type="button";
    });
    // 사진과 일러스트가 많아져도 첫 화면을 막지 않도록, 현재 관찰 장면과
    // 로고를 제외한 아래쪽 이미지는 브라우저의 지연 디코딩에 맡긴다.
    document.querySelectorAll("#app img").forEach(image=>{
      image.decoding="async";
      if(!image.matches(".native-observe-background,.native-main-character,.native-scene-lineup-person img,.app-loading-logo")){
        image.loading="lazy";
        image.fetchPriority="low";
      }
    });
    const grid=document.querySelector(".shop-product-grid");
    if(grid&&!grid.querySelector('[data-product-id="green_tea"]')){
      const card=document.createElement("article");
      card.className="premium-product one-time-product";
      const teaCopy={en:{tag:"Support",small:"Support Drawer Village",title:"Drawer Village Support Gift 🎁",thanks:"Support the next Drawer Village update.",cart:"Add to cart"},ja:{tag:"応援",small:"ひきだし村を応援",title:"ひきだし村 応援ギフト 🎁",thanks:"ひきだし村の次のアップデートを応援してください。",cart:"カートに追加"}}[state.uiLanguage]||{tag:"응원",small:"서랍마을 응원",title:"서랍마을 응원 선물 🎁",thanks:"서랍마을의 다음 업데이트를 응원해 주세요.",cart:"장바구니에 담기"};
      card.innerHTML=`<div class="premium-product-heading"><span>${teaCopy.tag}</span><div><small>${teaCopy.small}</small><h2>${teaCopy.title}</h2></div><b>3,000원</b></div><p>${teaCopy.thanks}</p><button class="primary premium-buy" data-cart-add="green_tea">${teaCopy.cart}</button>`;
      grid.insertBefore(card,grid.lastElementChild);
    }
    bind();
    applyTheme();
    requestAnimationFrame(bindRelationshipRoulette);
    requestAnimationFrame(restoreMobileCharacterDialogs);
    requestAnimationFrame(showOnboarding);
    requestAnimationFrame(showSetupCoach);
    requestAnimationFrame(()=>document.querySelectorAll(".life-log ol").forEach(log=>{log.scrollTop=log.scrollHeight}));
    requestAnimationFrame(maybeShowPageGuide);
    // The desktop observation map is already positioned by CSS. Smoothly
    // scrolling its large canvas after every render made the whole site feel
    // delayed and could briefly place an invisible scroll layer over the nav.
    if(state.activeTab==="town")centerMobileTownMap();
    document.documentElement.dataset.drawerRendered="1";
    if(preservePageScroll){
      restoreWindowScroll(previousPageX,previousPageY);
      restoreMainScroll(previousMainLeft,previousMainTop,openCatalogKeys);
    }
  }catch(error){
    console.error("화면 복구 필요",error);
    document.querySelector("#app").innerHTML=`<section class="panel empty"><h1>화면을 복구하는 중 문제가 생겼어요</h1><p>저장 데이터는 지우지 않았습니다. 아래 버튼으로 다시 불러와 주세요.</p><button class="primary" id="safe-reload">다시 불러오기</button></section>`;
    document.querySelector("#safe-reload")?.addEventListener("click",()=>location.reload());
  }
}

function isMobileCharacterDraftControl(element){
  return Boolean(element?.closest?.("[data-mobile-character-editor-dialog]"));
}
function isDeferredMobileTextControl(element){
  if(!isMobileCharacterDraftControl(element))return false;
  if(element?.tagName==="TEXTAREA")return true;
  if(element?.tagName!=="INPUT")return false;
  return !["checkbox","radio","range","color","file","button","submit"].includes(String(element.type||"text").toLowerCase());
}
function markMobileCharacterDraft(element){
  if(isMobileCharacterDraftControl(element)){
    mobileCharacterDraftDirty=true;
    // Android/Samsung IME가 조합 중인 input에 포커스가 남아 있을 때
    // 타이머 저장을 실행하면 마지막 음절이 늦게 보이거나, 다음 입력에서
    // 직전 음절이 한 번 더 확정될 수 있다. 편집 중에는 DOM을 그대로 두고
    // 포커스 이탈·편집 완료 시 현재 DOM 값을 한 번만 저장한다.
  }
  return isMobileCharacterDraftControl(element);
}
const numericCharacterFields=new Set(["spiceTolerance","sweetPreference","socialEnergy","sensingIntuition","thinkingFeeling","perceivingJudging","homeVisualScale"]);
function characterPatchFromField(element){
  if(!element?.dataset?.field)return null;
  const field=element.dataset.field;
  const value=element.type==="checkbox"?element.checked:numericCharacterFields.has(field)?Number(element.value):element.value;
  const patch={[field]:value};
  if(field==="attractionTarget")patch.attractedGenders={
    "여성에게 끌림":["여성"],"남성에게 끌림":["남성"],"여성과 남성에게 끌림":["여성","남성"],
    "성별과 무관하게 끌림":["남성","여성","그외"],"그외 성별에게 끌림":["그외"]
  }[element.value]||["없음"];
  return patch;
}
function setNestedObjectValue(target,path,value){
  const parts=String(path||"").split("."),last=parts.pop();
  let cursor=target;
  parts.forEach(part=>{
    if(!cursor[part]||typeof cursor[part]!=="object"||Array.isArray(cursor[part]))cursor[part]={};
    cursor=cursor[part];
  });
  if(last)cursor[last]=value;
}
function syncCharacterControls(source,attribute){
  const key=source?.getAttribute?.(attribute);
  if(!key)return;
  document.querySelectorAll(`[${attribute}="${CSS.escape(key)}"]`).forEach(target=>{
    if(target===source)return;
    if(target.type==="checkbox")target.checked=source.checked;
    else if("value" in target)target.value=source.value;
  });
}
function syncOpenCharacterEditorDraft(){
  const dialog=document.querySelector("[data-mobile-character-editor-dialog]");
  const character=active();
  if(!dialog||!character)return;
  // Android 한글 키보드는 마지막 조합 글자의 input 이벤트가 저장 버튼의
  // click보다 늦을 수 있다. 현재 DOM 값을 직접 읽어 마지막 글자도 보존한다.
  const patch={};
  dialog.querySelectorAll("[data-field]").forEach(element=>{
    const fieldPatch=characterPatchFromField(element);
    if(fieldPatch)Object.assign(patch,fieldPatch);
  });
  dialog.querySelectorAll("[data-personality-field]").forEach(element=>{
    patch[element.dataset.personalityField]=element.value;
  });
  const traitNotes=dialog.querySelector("[data-trait-notes]");
  if(traitNotes)patch.traitNotes=traitNotes.value.slice(0,1200);
  const bodyFields=[...dialog.querySelectorAll("[data-body-field]")];
  if(bodyFields.length){
    const bodyProfile=structuredClone(character.bodyProfile||{});
    bodyFields.forEach(element=>setNestedObjectValue(bodyProfile,element.dataset.bodyField,element.value));
    patch.bodyProfile=bodyProfile;
  }
  updateCharacter(character.id,patch,false);
}
function renderPreservingPageScroll(element){
  const pageX=window.scrollX,pageY=window.scrollY;
  const main=document.querySelector("#app>main"),mainLeft=main?.scrollLeft||0,mainTop=main?.scrollTop||0;
  const placeId=element?.closest?.("[data-place-editor-id]")?.dataset.placeEditorId||element?.dataset?.placeId||element?.dataset?.placeAudience||element?.dataset?.placeStock||"";
  const homeCard=element?.closest?.("[data-home-card]"),homeFeature=element?.closest?.("[data-home-feature]");
  const homeContext=homeCard&&homeFeature?{homeId:homeCard.dataset.homeCard,feature:homeFeature.dataset.homeFeature,left:homeFeature.scrollLeft,top:homeFeature.scrollTop}:null;
  const townPanel=element?.closest?.(".town-editor-panel"),townPanelPosition=townPanel?{left:townPanel.scrollLeft,top:townPanel.scrollTop}:null;
  element?.blur?.();
  render();
  const restore=()=>{
    restoreWindowScroll(pageX,pageY);
    const nextMain=document.querySelector("#app>main");
    if(nextMain){nextMain.scrollLeft=mainLeft;nextMain.scrollTop=mainTop}
    if(placeId){
      const marker=document.querySelector(`[data-place-id="${CSS.escape(placeId)}"],[data-place-audience="${CSS.escape(placeId)}"],[data-place-stock="${CSS.escape(placeId)}"]`);
      if(marker?.closest("details"))marker.closest("details").open=true;
    }
    if(homeContext){
      const nextCard=document.querySelector(`[data-home-card="${CSS.escape(homeContext.homeId)}"]`);
      const nextFeature=nextCard?.querySelector(`[data-home-feature="${CSS.escape(homeContext.feature)}"]`);
      const nextButton=nextCard?.querySelector(`[data-open-home-feature="${CSS.escape(homeContext.feature)}"]`);
      nextFeature?.classList.add("open");nextButton?.classList.add("on");
      if(nextFeature){nextFeature.scrollLeft=homeContext.left;nextFeature.scrollTop=homeContext.top}
    }
    if(townPanelPosition){
      const nextTownPanel=document.querySelector(".town-editor-panel");
      if(nextTownPanel){nextTownPanel.scrollLeft=townPanelPosition.left;nextTownPanel.scrollTop=townPanelPosition.top}
    }
  };
  requestAnimationFrame(()=>{restore();requestAnimationFrame(restore)});
  setTimeout(restore,60);setTimeout(restore,180);
}
function flushMobileCharacterDraft({closeEditor=true}={}){
  if(mobileCharacterDraftDirty){
    syncOpenCharacterEditorDraft();
    save(true);
  }
  mobileCharacterDraftDirty=false;
  if(closeEditor)mobileCharacterEditorPane="";
}
function restoreMobileCharacterDialogs(){
  if(!document.documentElement.classList.contains("native-app")||state.activeTab!=="character")return;
  if(mobileCharacterEditorPane){
    const dialog=document.querySelector("[data-mobile-character-editor-dialog]");
    if(dialog&&!dialog.open&&!document.querySelector("dialog[open]")){
      dialog.showModal();
      restoreMobileCharacterEditorContinuity(dialog);
    }
  }else if(mobileCharacterReorderOpen){
    const dialog=document.querySelector("[data-mobile-character-reorder-dialog]");
    if(dialog&&!dialog.open&&!document.querySelector("dialog[open]"))dialog.showModal();
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
  dialog.innerHTML=`<form method="dialog"><div class="page-guide-heading"><span>${({observe:"◉",home:"⌂",character:"✦",catalog:"♡",relationship:"↝",routine:"▦",town:"⌖",shop:"◇",settings:"⚙"}[tab]||"·")}</span><div><small>화면 사용법</small><h2>${guide[0]}</h2></div><button value="ok" aria-label="안내 닫기">×</button></div><p>${guide[1]}</p><button class="primary" value="ok">확인했어요</button></form>`;
  dialog.onclose=()=>{localStorage.setItem(key,"1");window.ParallelCityAuth?.markGuideSeen?.(tab);guidePending.delete(tab);dialog.remove()};
  document.body.append(dialog);dialog.show();
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

function downloadCharacterStatisticsReport(dialog){
  if(!dialog)return;
  const clean=value=>String(value||"").replace(/\s+/g," ").trim();
  const escapeHtml=value=>clean(value).replace(/[&<>"']/g,character=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[character]);
  const total=clean(dialog.querySelector(".character-stat-summary b")?.textContent)||"0";
  const highlights=[...dialog.querySelectorAll(".character-stat-highlights article")].map(card=>({
    label:clean(card.querySelector("small")?.textContent),value:clean(card.querySelector("b")?.textContent)
  }));
  const charts=[...dialog.querySelectorAll(".character-stat-donuts article")].map(card=>({
    label:clean(card.querySelector("span")?.textContent),percent:Math.max(0,Math.min(100,Number(card.dataset.percent)||0))
  }));
  const sections=[...dialog.querySelectorAll(".character-stat-grid section")].map(section=>({
    title:clean(section.querySelector("h3")?.textContent),
    rows:[...section.querySelectorAll("li")].map(row=>({
      label:clean(row.querySelector("b")?.textContent||row.textContent),value:clean(row.querySelector("small")?.textContent)
    }))
  }));
  const created=new Date(),dateLabel=created.toLocaleString();
  const report=`<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>서랍마을 캐릭터 통계 보고서</title><style>body{margin:0;background:#f4f0ea;color:#27231f;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}main{max-width:980px;margin:auto;padding:42px 24px 70px}header{padding:28px;border-radius:24px;background:linear-gradient(135deg,#273449,#6b7a91);color:#fff}h1{margin:6px 0 10px}header p{margin:0;opacity:.82}.summary,.charts{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin:22px 0}.summary article,.chart,.group{padding:18px;border:1px solid #d8d0c6;border-radius:18px;background:#fff}.summary small{display:block;color:#746c64}.summary b{display:block;margin-top:8px;font-size:26px}.charts{margin-top:0}.chart{display:grid;place-items:center;gap:9px}.chart i{display:grid;place-items:center;width:96px;height:96px;border-radius:50%;font-style:normal;background:conic-gradient(#435a7b calc(var(--percent)*1%),#e7e0d8 0);position:relative}.chart i:after{content:"";position:absolute;inset:11px;background:#fff;border-radius:50%}.chart b{position:relative;z-index:1;font-size:20px}.groups{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px}.group h2{margin:0 0 12px;font-size:18px}.group ul{display:grid;gap:9px;margin:0;padding:0;list-style:none}.group li{display:flex;justify-content:space-between;gap:14px;padding-bottom:8px;border-bottom:1px solid #eee7df}.group em{color:#756d66;font-style:normal;white-space:nowrap}footer{margin-top:24px;color:#786f67;font-size:13px}</style></head><body><main><header><small>DRAWER VILLAGE · CHARACTER REPORT</small><h1>캐릭터 통계 보고서</h1><p>${escapeHtml(dateLabel)} · 저장된 캐릭터 ${escapeHtml(total)}명</p></header><section class="summary">${highlights.map(item=>`<article><small>${escapeHtml(item.label)}</small><b>${escapeHtml(item.value)}</b></article>`).join("")}</section><section class="charts">${charts.map(item=>`<article class="chart"><i style="--percent:${item.percent}"><b>${item.percent}%</b></i><span>${escapeHtml(item.label)}</span></article>`).join("")}</section><section class="groups">${sections.map(section=>`<article class="group"><h2>${escapeHtml(section.title)}</h2><ul>${section.rows.map(row=>`<li><span>${escapeHtml(row.label)}</span><em>${escapeHtml(row.value)}</em></li>`).join("")}</ul></article>`).join("")}</section><footer>이 보고서는 기기에 저장된 캐릭터 설정을 집계해 만들었습니다.</footer></main></body></html>`;
  const blob=new Blob([report],{type:"text/html;charset=utf-8"}),url=URL.createObjectURL(blob),link=document.createElement("a");
  link.href=url;link.download=`서랍마을-캐릭터-통계-${created.toISOString().slice(0,10)}.html`;
  document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
  showToast("캐릭터 통계 보고서를 저장했습니다");
}

function openHomeOccupantSheet(button){
  if(!button)return;
  document.querySelector("[data-home-occupant-sheet]")?.remove();
  const dialog=document.createElement("aside");
  dialog.className="home-occupant-sheet home-occupant-popover";
  dialog.dataset.homeOccupantSheet="";
  dialog.setAttribute("role","status");
  dialog.innerHTML=`<button class="home-occupant-popover-close" type="button" aria-label="닫기">×</button><div class="home-occupant-sheet-content"><div class="home-occupant-visual"></div><span><small>${button.dataset.homeOccupant==="pet"?"반려생물":"지금 이 방에 있는 캐릭터"} · ${htmlEsc(button.dataset.occupantRoom||"집 안")}</small><h2></h2><b></b><p></p></span></div>`;
  const sourceVisual=button.querySelector(".avatar,.sprite,.room-pet-icon,.room-pet-photo,.room-pet-emoji");
  if(sourceVisual)dialog.querySelector(".home-occupant-visual").append(sourceVisual.cloneNode(true));
  dialog.querySelector("h2").textContent=button.dataset.occupantName||"이름 없음";
  dialog.querySelector("b").textContent=button.dataset.occupantTitle||"집에서 시간을 보내는 중";
  dialog.querySelector("p").textContent=button.dataset.occupantDesc||"조용히 자기 시간을 보내고 있어요.";
  document.body.append(dialog);
  requestAnimationFrame(()=>dialog.classList.add("show"));
  dialog.querySelector(".home-occupant-popover-close").onclick=()=>dialog.remove();
  clearTimeout(openHomeOccupantSheet.timer);
  openHomeOccupantSheet.timer=setTimeout(()=>dialog.remove(),5000);
}

function openCarEditor(homeId,carId){
  const car=state.homes[homeId]?.cars?.find(item=>item.id===carId);
  if(!car)return;
  document.querySelector("[data-home-car-dialog]")?.remove();
  const types=["경차","승용차","SUV","승합차","스포츠카","전기차","오토바이","기타"];
  const dialog=document.createElement("dialog");
  dialog.className="home-car-dialog";
  dialog.dataset.homeCarDialog="";
  dialog.innerHTML=`<form method="dialog"><div class="mobile-editor-head"><span><small>CAR SETTING</small><b>${htmlEsc(car.name)}</b></span><button value="cancel" aria-label="닫기">×</button></div><div class="home-car-preview">${car.image?`<img src="${htmlEsc(car.image)}" alt="">`:"<span>🚙</span>"}</div><div class="fields"><label>차량 이름<input name="name" value="${htmlEsc(car.name)}"></label><label>종류<select name="type">${types.map(type=>`<option ${type===car.type?"selected":""}>${type}</option>`).join("")}</select></label><label>색상<input name="color" value="${htmlEsc(car.color||"")}"></label><label>좌석 수<input name="seats" type="number" min="1" max="12" value="${Number(car.seats)||5}"></label></div><div class="image-actions"><button type="button" data-dialog-car-image>차 사진 선택</button><button type="button" data-dialog-car-url>사진 링크</button></div><div class="crop-actions"><button type="button" class="danger" data-dialog-delete-car>자동차 삭제</button><button value="cancel">취소</button><button class="primary" value="save">편집 완료</button></div></form>`;
  dialog.querySelector("[data-dialog-car-image]").onclick=()=>{
    dialog.close("cancel");
    pickImage("car",homeId,carId);
  };
  dialog.querySelector("[data-dialog-car-url]").onclick=()=>{
    dialog.close("cancel");
    useImageUrl("car",homeId,carId);
  };
  dialog.querySelector("[data-dialog-delete-car]").onclick=()=>{
    if(!confirm(`${objectText(car.name)} 삭제하시겠습니까?\n삭제한 자동차는 되돌릴 수 없습니다.`))return;
    deleteCar(homeId,carId);
    dialog.close("deleted");
    render();
  };
  dialog.onclose=()=>{
    if(dialog.returnValue==="save"){
      const form=dialog.querySelector("form");
      updateCar(homeId,carId,{
        name:form.name.value.trim()||"이름 없는 자동차",
        type:form.type.value,
        color:form.color.value.trim(),
        seats:Math.max(1,Math.min(12,Number(form.seats.value)||5))
      });
      render();
      showToast("자동차 설정을 저장했습니다");
    }
    dialog.remove();
  };
  document.body.append(dialog);
  dialog.showModal();
}

function applyTheme(){
  const mode=state.colorMode==="light"?"light":"dark";
  const palettes={
    monochrome:{light:["#20242a","#6d747d","#e8eaed","#ffffff","#1d2126","#626a73","#cbd0d5"],dark:["#7f8791","#c0c6ce","#090c10","#151a20","#f4f6f8","#b5bbc3","#343b44"]},
    cream:{light:["#b06a00","#f2a93b","#fff4d8","#fffdf8","#3a2508","#80613a","#f2d39b"],dark:["#f0a83a","#ffd073","#190f02","#30200b","#fff8e9","#e2c18d","#684617"]},
    peach:{light:["#ef536f","#ff986e","#fff0e9","#fffaf8","#481923","#955d5d","#ffc6ba"],dark:["#ff7185","#ffad82","#1d080d","#381318","#fff2ef","#efb6ae","#7b3340"]},
    mint:{light:["#00a982","#4bd8aa","#e9fff6","#fbfffd","#073e32","#4f8878","#b4efd9"],dark:["#21cea3","#6af0c0","#031913","#073128","#effff9","#9ce3cd","#1e7560"]},
    sunshine:{light:["#d98b00","#ffd23f","#fff8d2","#fffef7","#3e2b00","#836b27","#f4dc82"],dark:["#ffb51f","#ffe05f","#1c1300","#352703","#fffbe8","#e9d184","#735513"]},
    sage:{light:["#2f855a","#76c36a","#ecf8ed","#fbfffc","#143823","#5a7f66","#bfe1c4"],dark:["#55bc79","#99db76","#06150c","#0f2b19","#effcf3","#a8d4b4","#28643e"]},
    rose:{light:["#80502f","#b77a4b","#f7efe5","#fffaf4","#2f241d","#75675d","#dfcdbc"],dark:["#d9a46f","#a66e45","#16100c","#241a14","#fff7ef","#d1bfae","#6d4b34"]},
    ocean:{light:["#007fc2","#36c0e8","#e9f9ff","#fbfeff","#073952","#4f7f93","#b6e8f7"],dark:["#29a9e8","#5cdaf0","#031720","#082f41","#effbff","#9ed7e6","#1e607b"]},
    lavender:{light:["#7547e8","#c26de8","#f5edff","#fffaff","#2e1652","#76588d","#ddc2fa"],dark:["#956cff","#db86f4","#10051d","#27103b","#faf2ff","#d1afe4","#593180"]},
    berry:{light:["#be2cff","#ff45b5","#f9ecff","#ffffff","#321044","#7d4a8c","#e5b6f8"],dark:["#d65cff","#ff69c5","#16051d","#2c0c38","#fff2ff","#d9a8e8","#663077"]},
    sky:{light:["#078cff","#55c8ff","#eaf7ff","#ffffff","#082f50","#4b7895","#b5e2ff"],dark:["#31a8ff","#68ddff","#031522","#092c43","#eefaff","#9ed5ee","#245b79"]},
    cobalt:{light:["#112250","#3c507d","#f3f0e9","#fffaf4","#112250","#65708a","#d9cbc2"],dark:["#e0c58f","#3c507d","#071124","#101e3b","#f3f0e9","#bac3d7","#3c507d"]},
    aqua:{light:["#00a9b5","#21dfc5","#e7fffb","#ffffff","#073d3d","#4e8580","#aff1e7"],dark:["#13cbd1","#40f0cd","#031817","#092f2d","#edfffb","#9ce0d6","#1d7069"]},
    lime:{light:["#52a900","#b4d900","#f3ffe3","#ffffff","#203600","#687f3c","#d3efa8"],dark:["#76ce22","#c9ef43","#0b1602","#1b3309","#f7ffe9","#c0dd99","#466f21"]},
    coral:{light:["#ff4f62","#ff9770","#fff0ec","#ffffff","#49151b","#955b58","#ffc6ba"],dark:["#ff6674","#ffad82","#1d080b","#381316","#fff3f0","#efb6ae","#7d3439"]},
    baroque:{light:["#ad6d15","#efbb55","#fbf5d2","#fff9e8","#441004","#79380b","#e2bf6d"],dark:["#efbb55","#ad6d15","#180b03","#2a1306","#fff2cf","#d7ad71","#79380b"]},
    "moonlit-drawer":{light:["#172a58","#d4a84f","#eef1f8","#fffaf0","#17213b","#5d6170","#c9b477"],dark:["#d4a84f","#6f85bb","#071127","#10204a","#fff4d3","#c8c9d2","#8f743e"]},
    "ruined-rose":{light:["#681f2a","#9a877f","#e9e4df","#f8f5f1","#241d1d","#6d6060","#b8aaa4"],dark:["#d16b78","#96847e","#08090b","#151315","#f6eff0","#b8aaad","#514449"]},
    "healing-glasshouse":{light:["#3e755e","#9bb88a","#eef5e9","#fffdf7","#203129","#65766b","#c8d8c5"],dark:["#a8d39d","#6d9b82","#0c1712","#17261d","#eff8ee","#b6c9bb","#405c4b"]},
    "reverie-ward":{light:["#6551a5","#36a9a0","#f0edf8","#fbf9ff","#27213a","#706887","#c9c1df"],dark:["#b49cff","#4fd5c7","#080716","#15122b","#f5f0ff","#bbb0d3","#4c426e"]},
    "noir-rain":{light:["#a21f2d","#3e454d","#e9eaec","#fafafa","#191b1f","#63676d","#b8bcc2"],dark:["#e3515e","#8f969e","#050607","#121417","#f4f4f2","#b9bdc2","#44484e"]}
  };
  const selected=state.visualTheme||"monochrome";
  const [primary,secondary,bg,panel,ink,muted,line]=(palettes[selected]||palettes.monochrome)[mode];
  document.documentElement.dataset.colorMode=mode;
  document.documentElement.dataset.visualTheme=selected;
  document.documentElement.style.setProperty("--p",primary);
  document.documentElement.style.setProperty("--s",secondary);
  document.documentElement.style.setProperty("--bg",bg);
  document.documentElement.style.setProperty("--panel",panel);
  document.documentElement.style.setProperty("--ink",ink);
  document.documentElement.style.setProperty("--muted",muted);
  document.documentElement.style.setProperty("--line",line);
  document.documentElement.style.setProperty("--theme-wash",`color-mix(in srgb, ${primary} 13%, ${bg})`);
  document.documentElement.style.setProperty("--theme-surface",`color-mix(in srgb, ${primary} 6%, ${panel})`);
  document.documentElement.style.setProperty("--theme-surface-strong",`color-mix(in srgb, ${secondary} 12%, ${panel})`);
  document.documentElement.style.setProperty("--theme-border",`color-mix(in srgb, ${primary} 34%, ${line})`);
  document.documentElement.style.setProperty("--theme-shadow",`color-mix(in srgb, ${primary} 20%, transparent)`);
  document.documentElement.style.setProperty("--on-p",readableInk(primary));
  document.documentElement.style.setProperty("--on-s",readableInk(secondary));
  document.documentElement.style.setProperty("--on-grad",readableInk(mixThemeColors(primary,secondary)));
  document.documentElement.style.setProperty("--character-p",primary);
  document.documentElement.style.setProperty("--character-s",secondary);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content",bg);
}

async function explicitSave(label="저장 완료"){
  save(true);
  render();
  const auth=window.ParallelCityAuth,info=auth?.getInfo?.();
  if(info?.user){
    const synced=await auth.upload({reason:label});
    if(!synced)showToast("기기에는 저장했지만 계정 동기화는 완료하지 못했어요");
  }else showToast("기기에 저장되었습니다");
}

function openCharacterDeleteDialog(characterId){
  const character=state.characters[characterId];
  if(!character)return;
  document.querySelector("[data-character-delete-dialog]")?.remove();
  const dialog=document.createElement("dialog");
  dialog.className="character-delete-dialog";
  dialog.dataset.characterDeleteDialog=characterId;
  dialog.innerHTML=`<form method="dialog"><div class="character-delete-dialog-icon" aria-hidden="true">!</div><small>CHARACTER DELETE</small><h2>${htmlEsc(objectText(character.name||"이름 없는 캐릭터"))} 삭제할까요?</h2><p>이 캐릭터의 주간 루틴, 생활 기록과 연결된 공식 관계도 함께 정리됩니다. 삭제한 뒤에는 되돌릴 수 없어요.</p><div class="character-delete-dialog-summary"><b>삭제되는 캐릭터</b><span>${htmlEsc(character.name||"이름 없음")}</span></div><div class="character-delete-dialog-actions"><button value="cancel">취소</button><button value="delete" class="danger">캐릭터 영구 삭제</button></div></form>`;
  dialog.addEventListener("close",()=>{
    if(dialog.returnValue==="delete"){
      mobileCharacterEditorPane="";
      mobileCharacterDraftDirty=false;
      deleteCharacter(characterId);
      render();
      showToast("캐릭터를 삭제했습니다");
    }
    dialog.remove();
  });
  document.body.append(dialog);
  dialog.showModal();
}

const defaultCharacterSceneLayout=()=>({x:0,y:0,scale:1,actionX:0,actionY:0});
const characterSceneLayout=(character,mode)=>({
  ...defaultCharacterSceneLayout(),
  ...(character?.homeSceneLayout?.[mode]||{})
});
const clampSceneLayout=(layout)=>({
  x:Math.max(-45,Math.min(45,Number(layout.x)||0)),
  y:Math.max(-45,Math.min(45,Number(layout.y)||0)),
  scale:Math.max(.45,Math.min(2.5,Number(layout.scale)||1)),
  actionX:Math.max(-45,Math.min(45,Number(layout.actionX)||0)),
  actionY:Math.max(-45,Math.min(45,Number(layout.actionY)||0))
});
function applyCharacterSceneLayoutPreview(characterId,mode,layout){
  const globalScale=Math.max(70,Math.min(150,Number(mode==="ld"?state.homeLdScale:state.homeSdScale)||100))/100;
  document.querySelectorAll(`[data-home-layout-editor][data-character-id="${CSS.escape(characterId)}"] [data-home-layout-layer="${mode}"]`).forEach(layer=>{
    layer.style.setProperty("--character-art-x",`${layout.x}%`);
    layer.style.setProperty("--character-art-y",`${layout.y}%`);
    layer.style.setProperty("--character-art-scale",String(layout.scale));
    layer.style.setProperty("--character-render-scale",String(globalScale*layout.scale));
    layer.style.setProperty("--character-action-x",`${layout.actionX}%`);
    layer.style.setProperty("--character-action-y",`${layout.actionY}%`);
  });
}
function persistCharacterSceneLayout(characterId,mode,layout){
  const character=state.characters[characterId];
  if(!character)return;
  const next=clampSceneLayout(layout);
  updateCharacter(characterId,{homeSceneLayout:{
    sd:characterSceneLayout(character,"sd"),
    ld:characterSceneLayout(character,"ld"),
    [mode]:next
  }},true);
  applyCharacterSceneLayoutPreview(characterId,mode,next);
}
function bindCharacterSceneLayoutEditors(){
  $$('[data-home-layout-editor]').forEach(editor=>{
    const characterId=editor.dataset.characterId;
    const character=state.characters[characterId];
    if(!character)return;
    editor.querySelectorAll('[data-home-layout-mode]').forEach(button=>button.onclick=()=>{
      const mode=button.dataset.homeLayoutMode;
      if(!["sd","ld"].includes(mode)||button.disabled)return;
      editor.dataset.mode=mode;
      editor.querySelectorAll('[data-home-layout-mode]').forEach(candidate=>candidate.classList.toggle("on",candidate===button));
    });
    editor.querySelector('[data-home-layout-reset]')?.addEventListener("click",()=>{
      const mode=editor.dataset.mode==="ld"?"ld":"sd";
      persistCharacterSceneLayout(characterId,mode,defaultCharacterSceneLayout());
      showToast(`${mode.toUpperCase()} 배치를 초기화했습니다`);
    });
    editor.querySelectorAll('[data-home-layout-nudge]').forEach(button=>button.addEventListener("click",()=>{
      const mode=editor.dataset.mode==="ld"?"ld":"sd";
      const current=clampSceneLayout(characterSceneLayout(state.characters[characterId],mode));
      const target=button.dataset.homeLayoutTarget==="action"?"action":"art";
      const dx=Number(button.dataset.homeLayoutDx)||0;
      const dy=Number(button.dataset.homeLayoutDy)||0;
      const scale=Number(button.dataset.homeLayoutScale)||0;
      const next={...current};
      if(target==="action"){
        next.actionX+=dx;
        next.actionY+=dy;
      }else{
        next.x+=dx;
        next.y+=dy;
        next.scale+=scale;
      }
      persistCharacterSceneLayout(characterId,mode,next);
      const note=editor.querySelector('.home-layout-save-note');
      if(note)note.textContent=`${mode.toUpperCase()} 배치를 저장했습니다.`;
    }));
    editor.querySelectorAll('[data-home-layout-layer]').forEach(layer=>{
      const mode=layer.dataset.homeLayoutLayer;
      const canvas=editor.querySelector('.home-layout-preview');
      const art=layer.querySelector('[data-home-layout-drag="art"]');
      const action=layer.querySelector('[data-home-layout-drag="action"]');
      const resizeHandle=layer.querySelector('[data-home-layout-resize]');
      const startDrag=(event,kind)=>{
        if(event.button!==undefined&&event.button!==0)return;
        event.preventDefault();event.stopPropagation();
        const starting=clampSceneLayout(characterSceneLayout(state.characters[characterId],mode));
        // Always measure against the whole preview. The old SD implementation
        // measured its small art layer, making a short finger movement jump all
        // the way to the +/-45% limit on Android.
        const canvasRect=canvas.getBoundingClientRect();
        const artRect=art.getBoundingClientRect();
        const startDistance=Math.max(20,Math.hypot(event.clientX-(artRect.left+artRect.width/2),event.clientY-(artRect.top+artRect.height/2)));
        const pointerId=event.pointerId;
        event.currentTarget.setPointerCapture?.(pointerId);
        const move=moveEvent=>{
          if(moveEvent.pointerId!==pointerId)return;
          moveEvent.preventDefault();
          const dx=(moveEvent.clientX-event.clientX)/Math.max(1,canvasRect.width)*100;
          const dy=(moveEvent.clientY-event.clientY)/Math.max(1,canvasRect.height)*100;
          const next={...starting};
          if(kind==="art"){next.x=starting.x+dx;next.y=starting.y+dy}
          else if(kind==="action"){next.actionX=starting.actionX+dx;next.actionY=starting.actionY+dy}
          else{
            const distance=Math.max(12,Math.hypot(moveEvent.clientX-(artRect.left+artRect.width/2),moveEvent.clientY-(artRect.top+artRect.height/2)));
            next.scale=starting.scale*(distance/startDistance);
          }
          const clamped=clampSceneLayout(next);
          layer.dataset.pendingLayout=JSON.stringify(clamped);
          applyCharacterSceneLayoutPreview(characterId,mode,clamped);
        };
        const finish=finishEvent=>{
          if(finishEvent.pointerId!==pointerId)return;
          window.removeEventListener("pointermove",move);
          window.removeEventListener("pointerup",finish);
          window.removeEventListener("pointercancel",finish);
          try{event.currentTarget.releasePointerCapture?.(pointerId)}catch{}
          const pending=layer.dataset.pendingLayout?JSON.parse(layer.dataset.pendingLayout):starting;
          delete layer.dataset.pendingLayout;
          persistCharacterSceneLayout(characterId,mode,pending);
          const note=editor.querySelector('.home-layout-save-note');
          if(note)note.textContent=`${mode.toUpperCase()} 배치를 저장했습니다.`;
        };
        window.addEventListener("pointermove",move,{passive:false});
        window.addEventListener("pointerup",finish);
        window.addEventListener("pointercancel",finish);
      };
      art?.addEventListener("pointerdown",event=>{if(!event.target.closest('[data-home-layout-resize]'))startDrag(event,"art")},{passive:false});
      action?.addEventListener("pointerdown",event=>startDrag(event,"action"),{passive:false});
      resizeHandle?.addEventListener("pointerdown",event=>startDrag(event,"resize"),{passive:false});
    });
  });
}

function activateCharacterInObservedTown(id){
  const character=state.characters[id];
  if(!character)return;
  const townId=eventFor(character)?.townId||character.townId;
  if(townId&&townId!==state.activeTownId&&state.towns.some(town=>town.id===townId))switchTown(townId);
  setActive(id);
}

function bindHorizontalWheelNavigation(){
  document.querySelectorAll(".standard-observe-view>.roster,.native-character-picker,.game-hud-roster-options").forEach(strip=>{
    strip.addEventListener("wheel",event=>{
      if(strip.scrollWidth<=strip.clientWidth+1)return;
      const movement=Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY;
      if(!movement)return;
      event.preventDefault();
      strip.scrollLeft+=movement;
    },{passive:false});
  });
}

function bindNativeObserveCharacterSwipe(){
  if(!document.documentElement.classList.contains("native-app")||state.activeTab!=="observe")return;
  const hud=document.querySelector(".game-observe-hud");
  if(!hud)return;
  const localOrder=[...document.querySelectorAll("[data-home-character]")]
    .map(button=>button.dataset.homeCharacter)
    .filter(Boolean);
  if(localOrder.length<2)return;
  let start=null,lastSwitch=0;
  const interactive="button,a,input,select,textarea,summary,dialog,[contenteditable=true]";
  const begin=(target,x,y,source,id=0)=>{
    if(target.closest(interactive)||document.querySelector("dialog[open]"))return;
    start={x,y,source,id};
  };
  const finish=(x,y,source,id=0)=>{
    if(!start||start.source!==source||start.id!==id)return;
    const dx=x-start.x,dy=y-start.y;
    start=null;
    const threshold=Math.max(48,Math.min(72,window.innerWidth*.13));
    if(Date.now()-lastSwitch<350||Math.abs(dx)<threshold||Math.abs(dx)<=Math.abs(dy)*1.25)return;
    lastSwitch=Date.now();
    const currentIndex=Math.max(0,localOrder.indexOf(state.activeId));
    const direction=dx<0?1:-1;
    activateCharacterInObservedTown(localOrder[(currentIndex+direction+localOrder.length)%localOrder.length]);
    render();
  };
  hud.addEventListener("touchstart",event=>{
    if(event.touches.length!==1)return;
    const touch=event.touches[0];
    begin(event.target,touch.clientX,touch.clientY,"touch",touch.identifier);
  },{capture:true,passive:true});
  hud.addEventListener("touchend",event=>{
    const touch=event.changedTouches[0];
    if(touch)finish(touch.clientX,touch.clientY,"touch",touch.identifier);
  },{capture:true,passive:true});
  hud.addEventListener("touchcancel",()=>{start=null},{capture:true,passive:true});
  hud.addEventListener("pointerdown",event=>{
    if(event.pointerType!=="mouse")return;
    begin(event.target,event.clientX,event.clientY,"mouse",event.pointerId);
  },{passive:true});
  hud.addEventListener("pointerup",event=>{
    if(event.pointerType==="mouse")finish(event.clientX,event.clientY,"mouse",event.pointerId);
  },{passive:true});
  hud.addEventListener("pointercancel",()=>{start=null},{passive:true});
}

function bind(){
  bindHorizontalWheelNavigation();
  bindNativeObserveCharacterSwipe();
  // Cloud sync intentionally does not copy device-only photos. If an old
  // device URL is unavailable, replace the broken image with the character's
  // initial so the relationship screen stays readable and tappable.
  $$("img[data-avatar-fallback]").forEach(image=>{
    const showFallback=()=>replaceBrokenAvatar(image);
    image.addEventListener("error",showFallback,{once:true});
    if(image.complete&&image.naturalWidth===0)showFallback();
  });
  const openNativeLog=()=>document.querySelector("[data-native-log-dialog]")?.showModal();
  $$('[data-open-native-log]').forEach(button=>button.addEventListener('click',event=>{
    event.preventDefault();
    event.stopPropagation();
    openNativeLog();
  }));
  const toggleGameHudMoment=(button,event)=>{
    event.preventDefault();
    event.stopPropagation();
    const card=button.closest('[data-game-hud-moment]');
    if(!card)return;
    const expanded=card.classList.toggle('expanded');
    card.querySelectorAll('[data-toggle-game-hud-moment]').forEach(toggle=>{
      toggle.setAttribute('aria-expanded',String(expanded));
      const label=toggle.querySelector('span');
      if(label&&toggle.dataset.expandLabel)label.textContent=expanded?toggle.dataset.collapseLabel:toggle.dataset.expandLabel;
    });
  };
  $$('[data-toggle-game-hud-moment]').forEach(button=>{
    button.addEventListener('click',event=>toggleGameHudMoment(button,event));
    button.addEventListener('keydown',event=>{
      if(event.key!=="Enter"&&event.key!==" ")return;
      toggleGameHudMoment(button,event);
    });
  });
  $$("[data-open-native-log-card]").forEach(card=>{
    card.addEventListener("click",event=>{
      if(event.target.closest("[data-tab]"))return;
      openNativeLog();
    });
    card.addEventListener("keydown",event=>{
      if(event.key!=="Enter"&&event.key!==" ")return;
      if(event.target.closest("button")&&event.target!==event.currentTarget)return;
      event.preventDefault();
      openNativeLog();
    });
  });
  $("[data-open-home-display-editor]")?.addEventListener("click",event=>{
    event.stopPropagation();
    const dialog=$("[data-home-display-editor-dialog]");
    if(dialog&&!dialog.open)dialog.showModal();
  });
  $("[data-open-character-stats]")?.addEventListener("click",event=>{
    event.stopPropagation();
    const dialog=$("[data-character-stats-dialog]");
    if(dialog&&!dialog.open)dialog.showModal();
  });
  $("[data-download-character-stats]")?.addEventListener("click",event=>{
    event.stopPropagation();
    downloadCharacterStatisticsReport(event.currentTarget.closest("[data-character-stats-dialog],[data-character-statistics-page]"));
  });
  $$('[data-home-display-field]').forEach(field=>{
    const apply=(persist=false)=>{
      const characterId=field.dataset.characterId,property=field.dataset.homeDisplayField;
      if(!characterId||!property)return;
      const numeric=property==="homeSdScale"||property==="homeLdScale";
      const value=numeric?Math.max(70,Math.min(150,Number(field.value)||100)):field.value;
      updateCharacter(characterId,{[property]:value},persist);
      if(numeric){
        const output=document.querySelector(`[data-home-display-value="${property}"]`);
        if(output)output.textContent=`${Math.round(value)}%`;
        const currentMode=active()?.homeVisualMode==="ld"?"ld":"sd";
        if((property==="homeLdScale"&&currentMode==="ld")||(property==="homeSdScale"&&currentMode==="sd")){
          document.querySelectorAll(".native-character-stage").forEach(stage=>stage.style.setProperty("--home-visual-scale",String(value/100)));
        }
      }
    };
    field.addEventListener("input",()=>apply(false));
    field.addEventListener("change",()=>{
      apply(true);
      if(field.dataset.homeDisplayField==="homeVisualMode")render();
    });
  });
  $$("[data-home-character]").forEach(el=>el.onclick=event=>{
    event.stopPropagation();
    const picker=el.closest(".native-character-picker,.game-hud-roster-options");
    if(picker)homeCharacterPickerScroll=picker.scrollLeft;
    el.closest("details")?.removeAttribute("open");
    activateCharacterInObservedTown(el.dataset.homeCharacter);
    picker?.closest("dialog")?.close();
    render();
    requestAnimationFrame(()=>{const nextPicker=document.querySelector(".native-character-picker,.game-hud-roster-options");if(nextPicker)nextPicker.scrollLeft=homeCharacterPickerScroll});
  });
  $("[data-mobile-town-edit-toggle]")?.addEventListener("click",()=>{
    const editing=document.querySelector(".mobile-town-shell")?.classList.contains("editing");
    setMobileTownEditing(!editing);
    render();
  });
  $("[data-mobile-town-settings]")?.addEventListener("click",()=>{setMobileTownPanel("world");render()});
  $("[data-mobile-town-close]")?.addEventListener("click",()=>{setMobileTownPanel("");render()});
  $$("[data-mobile-town-character]").forEach(el=>el.onclick=()=>{setActive(el.dataset.mobileTownCharacter);render();centerMobileTownMap(el.dataset.mobileTownCharacter)});
  try{
    enhanceDynamicForms();
    translateDynamicInterface(document.querySelector("#app"));
  }catch(error){console.error("동적 편집 화면 연결 실패",error)}
  const cartKey="drawer-village-cart";
  const cartLimit=50000;
  const cartPrices={character_slots_5:1200,town_slot_1:1900,green_tea:3000,storage_50mb:2900};
  const readCart=()=>{try{return JSON.parse(localStorage.getItem(cartKey)||"{}")||{}}catch{return {}}};
  const cartTotal=cart=>Object.entries(cart||{}).reduce((sum,[id,qty])=>sum+(Number(cartPrices[id])||0)*Math.max(0,Number(qty)||0),0);
  const writeCart=cart=>{localStorage.setItem(cartKey,JSON.stringify(cart));render()};
  const addCartItem=(cart,id)=>{
    const price=Number(cartPrices[id])||0;
    const nextQuantity=id==="storage_50mb"?1:(Number(cart[id])||0)+1;
    const nextTotal=cartTotal(cart)+(id==="storage_50mb"&&Number(cart[id])>0?0:price);
    if(!price||nextTotal>=cartLimit){
      const message=state.uiLanguage==="en"?"A single checkout must stay under KRW 50,000.":state.uiLanguage==="ja"?"1回の決済金額は5万ウォン未満にしてください。":"한 번 결제 금액은 5만원 미만이어야 해요.";
      showToast(message);
      return false;
    }
    cart[id]=nextQuantity;
    writeCart(cart);
    return true;
  };
  const playButtons=$$("[data-play-purchase]");
  playButtons.forEach(button=>button.onclick=async()=>{
    const productId=button.dataset.playPurchase;
    button.disabled=true;
    const original=button.textContent;
    button.textContent="결제창 여는 중…";
    try{
      await window.DrawerVillagePlayBilling?.purchase?.(productId);
      showToast("구매가 완료되어 상품을 지급했습니다");
      render();
    }catch(error){
      console.error(error);
      showToast(error?.message||"결제를 완료하지 못했습니다");
      button.disabled=false;
      button.textContent=original;
    }
  });
  if(playButtons.length&&window.DrawerVillagePlayBilling?.enabled?.()){
    window.DrawerVillagePlayBilling.loadProducts().then(result=>{
      const products=Array.isArray(result)?result:(result?.products||[]);
      const available=new Set(products.map(product=>product.productId));
      for(const product of products){
        const price=document.querySelector(`[data-play-price="${CSS.escape(product.productId)}"]`);
        if(price&&product.formattedPrice)price.textContent=product.formattedPrice;
      }
      playButtons.forEach(button=>{
        if(available.has(button.dataset.playPurchase)){
          button.disabled=false;
          button.textContent="구매하기";
          return;
        }
        button.disabled=true;
        button.textContent="현재 구매할 수 없음";
        const price=document.querySelector(`[data-play-price="${CSS.escape(button.dataset.playPurchase)}"]`);
        if(price)price.textContent="상품 준비 중";
      });
    }).catch(error=>{
      console.warn("상품 조회 실패",error);
      playButtons.forEach(button=>{button.disabled=true;button.textContent="잠시 후 다시 시도해 주세요"});
    });
  }
  $("[data-play-restore]")?.addEventListener("click",async event=>{
    const button=event.currentTarget;
    button.disabled=true;
    try{
      const result=await window.DrawerVillagePlayBilling?.restorePurchases?.();
      showToast(result?.restored?`${result.restored}개의 구매 내역을 복원했습니다`:"복원할 구매 내역이 없습니다");
    }catch(error){showToast(error?.message||"구매 내역을 확인하지 못했습니다")}
    finally{button.disabled=false}
  });
  $$("[data-cart-add]").forEach(el=>el.onclick=()=>{const cart=readCart(),id=el.dataset.cartAdd;if(addCartItem(cart,id))showToast(id==="green_tea"?`응원 선물 ${cart[id]}개를 장바구니에 담았어요`:"장바구니에 담았어요")});
  $$("[data-cart-plus]").forEach(el=>el.onclick=()=>{const cart=readCart();addCartItem(cart,el.dataset.cartPlus)});
  $$("[data-cart-minus]").forEach(el=>el.onclick=()=>{const cart=readCart(),id=el.dataset.cartMinus,next=(Number(cart[id])||0)-1;if(next>0)cart[id]=next;else delete cart[id];writeCart(cart)});
  $$("[data-cart-remove]").forEach(el=>el.onclick=()=>{const cart=readCart();delete cart[el.dataset.cartRemove];writeCart(cart)});
  $$("[data-wardrobe-character]").forEach(el=>el.onclick=()=>{setActive(el.dataset.wardrobeCharacter);setNavigationTabIntent("catalog");save();render()});
  $("[data-new-clothing]")?.addEventListener("click",()=>openClothingEditor());
  $$("[data-edit-clothing]").forEach(el=>el.onclick=event=>{event.stopPropagation();openClothingEditor(el.dataset.editClothing)});
  $("[data-new-outfit]")?.addEventListener("click",()=>openOutfitEditor());
  $$("[data-edit-outfit]").forEach(el=>el.onclick=()=>openOutfitEditor(el.dataset.editOutfit));
  $$("[data-new]").forEach(el=>el.onclick=()=>{const limit=characterLimit();if(!createCharacter(limit))showToast(`현재 캐릭터 슬롯은 ${limit}명까지예요`);render()});
  $$("[data-edit]").forEach(el=>el.onclick=()=>{setActive(el.dataset.edit);setCharacterPane("profile");render()});
  $$("[data-mobile-character-select]").forEach(el=>el.onclick=()=>{
    mobileCharacterStripScroll=el.closest(".mobile-character-strip")?.scrollLeft||0;
    if(mobileCharacterDraftDirty){
      syncOpenCharacterEditorDraft();
      save(true);
      mobileCharacterDraftDirty=false;
    }
    setActive(el.dataset.mobileCharacterSelect);
    render();
    requestAnimationFrame(()=>{const strip=document.querySelector(".mobile-character-strip");if(strip)strip.scrollLeft=mobileCharacterStripScroll});
  });
  $$("[data-open-character-pane]").forEach(el=>el.onclick=()=>{
    state.characterPane=el.dataset.openCharacterPane;
    mobileCharacterEditorPane=state.characterPane;
    mobileCharacterDraftDirty=false;
    mobileCharacterEditorScroll=0;
    mobileCharacterEditorOpenDetails=[];
    mobileCharacterEditorDetailsCaptured=false;
    render();
  });
  $("[data-open-character-reorder]")?.addEventListener("click",()=>{
    mobileCharacterReorderOpen=true;
    render();
  });
  const mobileCharacterDialog=$("[data-mobile-character-editor-dialog]");
  if(mobileCharacterDialog){
    const body=mobileCharacterDialog.querySelector(".mobile-character-editor-body");
    body?.addEventListener("scroll",()=>{mobileCharacterEditorScroll=body.scrollTop},{passive:true});
    body?.querySelectorAll("details").forEach(details=>details.addEventListener("toggle",()=>{
      const key=characterEditorDetailKey(details);if(!key)return;
      mobileCharacterEditorOpenDetails=details.open?[...new Set([...mobileCharacterEditorOpenDetails,key])]:mobileCharacterEditorOpenDetails.filter(value=>value!==key);
    }));
    stabilizeInteractiveScroll(mobileCharacterDialog,()=>document.querySelector("[data-mobile-character-editor-dialog][open] .mobile-character-editor-body")||body);
    mobileCharacterDialog.onclose=()=>{
      flushMobileCharacterDraft();
      render();
    };
  }
  $$("[data-close-mobile-character-editor],[data-save-mobile-character-editor]").forEach(el=>{
    // 버튼이 포커스를 가져가기 전에 조합 중인 글자까지 DOM에서 먼저 읽는다.
    el.addEventListener("pointerdown",syncOpenCharacterEditorDraft,{capture:true,passive:true});
    el.onclick=async()=>{
      const shouldSync=el.hasAttribute("data-save-mobile-character-editor");
      syncOpenCharacterEditorDraft();
      document.activeElement?.blur?.();
      // Samsung IME는 blur 직후 compositionend/input을 한 박자 늦게 보낼 수
      // 있으므로 다음 이벤트 묶음이 끝난 뒤 최종 값을 한 번 더 읽는다.
      await new Promise(resolve=>setTimeout(resolve,64));
      syncOpenCharacterEditorDraft();
      flushMobileCharacterDraft({closeEditor:false});
      mobileCharacterDialog?.close(shouldSync?"save":"close");
      if(shouldSync){await explicitSave("캐릭터 저장");advanceFirstSetupAfterCharacter()}
    };
  });
  const mobileReorderDialog=$("[data-mobile-character-reorder-dialog]");
  if(mobileReorderDialog)mobileReorderDialog.onclose=()=>{mobileCharacterReorderOpen=false;render()};
  $$("[data-sort]").forEach(el=>el.onclick=event=>{
    event.stopPropagation();
    if(el.closest("[data-mobile-character-reorder-dialog]"))mobileCharacterReorderOpen=true;
    moveCharacter(el.dataset.sort,Number(el.dataset.direction||0));
    render();
  });
  $$("[data-delete-character]").forEach(el=>el.onclick=()=>openCharacterDeleteDialog(el.dataset.deleteCharacter));
  $$("[data-roster]").forEach(el=>el.onclick=event=>{
    event.stopPropagation();
    const strip=el.closest(".roster");
    if(strip)observeRosterScroll=strip.scrollLeft;
    activateCharacterInObservedTown(el.dataset.roster);
    render();
    requestAnimationFrame(()=>{const next=document.querySelector(".standard-observe-view .roster");if(next)next.scrollLeft=observeRosterScroll});
  });
  $$("[data-person]").forEach(el=>el.onclick=event=>{
    event.stopPropagation();
    activateCharacterInObservedTown(el.dataset.person);
    render();
  });
  $$("[data-home-person]").forEach(el=>el.onclick=()=>focusHomeCharacter(el.dataset.homePerson));
  $("[data-all-sleep-home]")?.addEventListener("click",()=>focusHomeCharacter(state.activeId||state.order[0]));
  $$("[data-observe-town]").forEach(el=>el.onclick=event=>{
    event.stopPropagation();
    el.closest("details")?.removeAttribute("open");
    switchTown(el.dataset.observeTown);
    render();
  });
  $$("[data-home-select]").forEach(el=>el.onclick=()=>{
    const homeId=el.dataset.homeSelect;
    setActiveHome(homeId);
    const residents=state.order.filter(id=>state.characters[id]?.residences?.some(item=>item.homeId===homeId));
    if(residents.length&&!residents.includes(state.activeId))setActive(residents[0]);
    render();
  });
  $("[data-add-home]")?.addEventListener("click",()=>{createHome();render();showToast("캐릭터와 별개인 새 집을 만들었습니다")});
  $$("[data-home-edit]").forEach(button=>button.addEventListener("click",async()=>{
    const residents=state.order.filter(id=>state.characters[id]?.residences?.some(item=>item.homeId===state.activeHomeId));
    if(residents.length&&!residents.includes(state.activeId))setActive(residents[0]);
    const was=state.homeEditMode;
    setHomeEditMode(!was);
    const continueFirstSetup=was&&localStorage.getItem(SETUP_COACH_KEY)==="home-editing";
    if(continueFirstSetup){
      localStorage.setItem(SETUP_COACH_KEY,"done");
      setNavigationTabIntent("town");
      setMobileTownEditing(true);
    }
    render();
    if(was){
      await explicitSave("집 편집 저장");
      if(continueFirstSetup)showToast("마지막으로 마을의 건물과 배치를 정해 보세요.");
    }
  }));
  $$("[data-email-compose]").forEach(link=>link.addEventListener("click",event=>{
    event.preventDefault();
    const opened=window.open(link.href,"_blank");
    if(!opened)window.location.href="mailto:kkyaareuk@gmail.com";
  }));
  $$("[data-add-room]").forEach(button=>button.addEventListener("click",()=>{
    const canvas=button.closest("[data-room-canvas]")||document.querySelector(`[data-room-canvas][data-home-id="${CSS.escape(state.activeHomeId||"")}"]`);
    if(canvas?.querySelector(".room"))captureRoomCanvasLayouts(canvas);
    addRoom(state.activeHomeId,state.homes[state.activeHomeId]?.activeFloor||1);render();
  }));
  $$("[data-home-floor]").forEach(button=>button.addEventListener("click",()=>{setActiveHomeFloor(button.dataset.homeId,button.dataset.homeFloor);render()}));
  $$("[data-open-room-editor]").forEach(el=>{
    el.onclick=event=>{
      if(event.target.closest("[data-home-person],[data-home-occupant],.room-pet,.room-drag-handle,.room-resize-handle"))return;
      event.stopPropagation();
      openRoomEditor(el.dataset.homeId,el.dataset.openRoomEditor);
    };
    el.onkeydown=event=>{if(["Enter"," "].includes(event.key)){event.preventDefault();openRoomEditor(el.dataset.homeId,el.dataset.openRoomEditor)}};
  });
  $$("[data-room-drag]").forEach(handle=>bindRoomGeometryHandle(handle,"move"));
  $$("[data-room-resize]").forEach(handle=>bindRoomGeometryHandle(handle,"resize"));
  $$("[data-open-home-feature]").forEach(button=>button.onclick=()=>{
    const card=button.closest("[data-home-card]"),panel=card?.querySelector(`[data-home-feature="${CSS.escape(button.dataset.openHomeFeature)}"]`);
    if(!panel)return;
    const wasOpen=panel.classList.contains("open");
    card.querySelectorAll("[data-home-feature].open").forEach(item=>item.classList.remove("open"));
    card.querySelectorAll("[data-open-home-feature].on").forEach(item=>item.classList.remove("on"));
    if(!wasOpen){
      panel.classList.add("open");
      button.classList.add("on");
    }
  });
  $$("[data-close-home-feature]").forEach(button=>button.onclick=()=>{
    const card=button.closest("[data-home-card]");
    button.closest("[data-home-feature]")?.classList.remove("open");
    card?.querySelectorAll("[data-open-home-feature].on").forEach(item=>item.classList.remove("on"));
  });
  $$("[data-home-occupant]").forEach(button=>{
    button.onclick=event=>{
      event.stopPropagation();
      openHomeOccupantSheet(button);
    };
    button.onkeydown=event=>{
      if(!["Enter"," "].includes(event.key))return;
      event.preventDefault();
      button.click();
    };
  });
  $$("[data-open-room-image-menu]").forEach(el=>el.onclick=event=>{event.stopPropagation();openRoomImageMenu(el.dataset.homeId,el.dataset.openRoomImageMenu)});
  $("[data-add-pet]")?.addEventListener("click",()=>{
    addPet(state.activeHomeId);
    render();
    requestAnimationFrame(()=>document.querySelector('[data-open-home-feature="pets"]')?.click());
  });
  $("[data-add-car]")?.addEventListener("click",()=>{
    const homeId=state.activeHomeId,carId=addCar(homeId);
    render();
    requestAnimationFrame(()=>openCarEditor(homeId,carId));
  });
  $$("[data-open-car-editor]").forEach(button=>button.onclick=event=>{
    event.stopPropagation();
    openCarEditor(button.dataset.homeId,button.dataset.openCarEditor);
  });
  $$("[data-car-field]").forEach(el=>el.oninput=()=>updateCar(el.dataset.homeId,el.dataset.carId,{[el.dataset.carField]:el.type==="number"?Number(el.value):el.value}));
  $$("[data-car-image]").forEach(el=>el.onclick=()=>pickImage("car",el.dataset.homeId,el.dataset.carImage));
  $$("[data-delete-car]").forEach(el=>el.onclick=()=>{deleteCar(el.dataset.homeId,el.dataset.deleteCar);render()});
  $$("[data-character-check]").forEach(el=>el.onchange=()=>{
    const mobileDraft=markMobileCharacterDraft(el);
    updateCharacter(el.dataset.characterCheck,{[el.dataset.field]:el.checked},!mobileDraft);
  });
  $$("[data-pet-field]").forEach(el=>{
    const apply=()=>{const value=["neutered","needsWalk","rideable"].includes(el.dataset.petField)?el.checked:el.value;updatePet(el.dataset.homeId,el.dataset.petId,{[el.dataset.petField]:value});if(["species","room"].includes(el.dataset.petField))render()};
    if(el.tagName==="SELECT")el.onchange=apply;else el.oninput=apply;
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
            body:JSON.stringify({_subject:`[서랍마을 ${category}] 사용자 피드백`,_template:"table",_captcha:"false",_replyto:info.user.email||"",분류:category,내용:message,현재_화면:PAGE_GUIDES[state.activeTab]?.[0]||state.activeTab,선택_캐릭터:character?.name||"없음",보낸_시각:new Date().toLocaleString("ko-KR")})
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
      const body=encodeURIComponent(`${message}\n\n현재 화면: ${PAGE_GUIDES[state.activeTab]?.[0]||state.activeTab}\n선택 캐릭터: ${character?.name||"없음"}\n보낸 시각: ${new Date().toLocaleString("ko-KR")}`);
      const gmailUrl=`https://mail.google.com/mail/?view=cm&fs=1&to=kkyaareuk%40gmail.com&su=${subject}&body=${body}`;
      const code=String(error?.code||error?.message||"알 수 없는 오류").replace("firebase/","");
      status.innerHTML=`피드백함 저장 실패 (${htmlEsc(code)}). Firebase 보안 규칙을 게시했는지 확인해 주세요. <a href="${gmailUrl}" target="_blank" rel="noopener noreferrer">Gmail 작성창으로 대신 보내기</a>`;
      showToast("피드백 저장에 실패했어요 · 화면의 오류를 확인해 주세요");
    }finally{button.disabled=false;button.textContent="피드백 보내기"}
  });
  $$("[data-delete-pet]").forEach(el=>el.onclick=()=>{if(confirm("이 반려생물을 삭제할까요?")){deletePet(el.dataset.homeId,el.dataset.deletePet);render()}});
  $$("[data-pet-image]").forEach(el=>el.onclick=()=>pickImage(`pet${el.dataset.petImage==="icon"?"Icon":"Photo"}`,el.dataset.homeId,el.dataset.petId));
  $$("[data-home-name]").forEach(el=>el.oninput=()=>updateHome(el.dataset.homeId,{name:el.value.trim()||"이름 없는 집"}));
  $$("[data-home-field]").forEach(el=>{
    const apply=()=>updateHome(el.dataset.homeId,{[el.dataset.homeField]:el.value});
    el.oninput=apply;el.onchange=apply;
  });
  $$("[data-home-floor-count]").forEach(el=>el.onchange=()=>{setHomeFloorCount(el.dataset.homeId,el.value);render();showToast(`${el.value}층 집으로 바꿨어요`)});
  $$("[data-delete-home]").forEach(el=>el.onclick=()=>{
    const home=state.homes[el.dataset.deleteHome];if(!home)return;
    if(confirm(`‘${home.name}’을 삭제할까요?\n\n이 집의 방·사진·반려생물·자동차도 함께 삭제됩니다. 연결된 캐릭터는 삭제되지 않고 다른 집 연결은 유지됩니다.`)){
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
  $$("[data-sleep-room]").forEach(el=>el.onchange=()=>{updateCharacter(el.dataset.sleepRoom,{sleepRoomId:el.value});renderPreservingPageScroll(el)});
  $$("[data-furniture]").forEach(el=>el.onclick=()=>{
    toggleFurniture(el.dataset.homeId,el.dataset.room,el.dataset.furniture);
    el.classList.toggle("on",state.homes[el.dataset.homeId]?.rooms?.[el.dataset.room]?.furniture?.includes(el.dataset.furniture));
    document.querySelectorAll(`[data-furniture="${CSS.escape(el.dataset.furniture)}"][data-home-id="${CSS.escape(el.dataset.homeId)}"][data-room="${CSS.escape(el.dataset.room)}"]`).forEach(button=>button.classList.toggle("on",el.classList.contains("on")));
  });
  $$("[data-home-resident]").forEach(el=>el.onclick=()=>{
    const homeId=el.dataset.homeId,id=el.dataset.homeResident;
    const connected=state.characters[id]?.residences?.some(item=>item.homeId===homeId);
    connected?removeCharacterResidence(id,homeId):addCharacterResidence(id,homeId);
    renderPreservingPageScroll(el);
  });
  $$("[data-residence-field]").forEach(el=>{
    const apply=()=>{
      const field=el.dataset.residenceField;
      if(field==="visitDates"){
        el.value=el.value.replace(/(\d{2})-(\d{2})/g,"$1$2").replace(/[^\d,\s]/g,"").slice(0,80);
      }
      updateCharacterResidence(el.dataset.characterId,el.dataset.homeId,{[field]:el.value});
    };
    if(el.tagName==="SELECT")el.onchange=apply;else el.oninput=apply;
  });
  $$("[data-residence-day]").forEach(el=>el.onclick=()=>{
    const c=state.characters[el.dataset.characterId],residence=c?.residences?.find(item=>item.homeId===el.dataset.homeId);if(!residence)return;
    const day=Number(el.dataset.residenceDay),days=Array.isArray(residence.visitDays)?residence.visitDays:[];
    const nextDays=days.includes(day)?days.filter(value=>value!==day):[...days,day].sort((a,b)=>a-b);
    updateCharacterResidence(c.id,residence.homeId,{visitDays:nextDays});
    const selected=nextDays.includes(day);
    el.classList.toggle("on",selected);el.setAttribute("aria-pressed",String(selected));
  });
  $$("[data-residence-primary]").forEach(el=>el.onclick=()=>{updateCharacterResidence(el.dataset.residencePrimary,el.dataset.homeId,{isPrimary:true});renderPreservingPageScroll(el);showToast("기준 주거지로 지정했습니다")});
  $$("[data-home-town]").forEach(el=>el.onchange=()=>{updateCharacter(el.dataset.homeTown,{townId:el.value});render()});
  $$("[data-personality-field]").forEach(el=>el.onchange=()=>{
    const mobileDraft=markMobileCharacterDraft(el);
    updateCharacter(active().id,{[el.dataset.personalityField]:el.value},false);
    syncCharacterControls(el,"data-personality-field");
    if(!mobileDraft)save(true);
  });
  $$("[data-personality-type]").forEach(el=>el.onclick=()=>{
    const character=active(),value=el.dataset.personalityType,current=Array.isArray(character.personalityTypes)?character.personalityTypes:[];
    let next;
    if(current.includes(value))next=current.filter(item=>item!==value);
    else if(current.length<4)next=[...current,value];
    else return showToast("전체 성격 유형은 최대 4개까지 고를 수 있어요");
    const mobileDraft=markMobileCharacterDraft(el);
    updateCharacter(character.id,{personalityTypes:next},false);
    if(!mobileDraft)save(true);
    document.querySelectorAll(`[data-personality-type="${CSS.escape(value)}"]`).forEach(button=>button.classList.toggle("on",next.includes(value)));
  });
  const toggleTraitSetting=(key,value,element)=>{
    const character=active(),current=Array.isArray(character[key])?character[key]:[];
    let next;
    if(current.includes(value))next=current.filter(item=>item!==value);
    else if(current.length<8)next=[...current,value];
    else return showToast("서사·인지 특성은 각 영역에서 최대 8개까지 고를 수 있어요");
    const mobileDraft=markMobileCharacterDraft(element);
    updateCharacter(character.id,{[key]:next},false);
    if(!mobileDraft)save(true);
    const attribute=key==="characterTraits"?"data-character-trait":"data-trait-expression";
    document.querySelectorAll(`[${attribute}="${CSS.escape(value)}"]`).forEach(button=>button.classList.toggle("on",next.includes(value)));
  };
  $$("[data-character-trait]").forEach(el=>el.onclick=()=>toggleTraitSetting("characterTraits",el.dataset.characterTrait,el));
  $$("[data-trait-expression]").forEach(el=>el.onclick=()=>toggleTraitSetting("traitExpressions",el.dataset.traitExpression,el));
  $$("[data-trait-notes]").forEach(el=>{
    if(isDeferredMobileTextControl(el)){
      el.oninput=()=>markMobileCharacterDraft(el);
      return;
    }
    const apply=()=>updateCharacter(active().id,{traitNotes:el.value.slice(0,1200)},false);
    el.oninput=()=>{apply();save()};
  });
  $$("[data-trait-notes-in-scripts]").forEach(el=>el.addEventListener("change",e=>{
    const mobileDraft=markMobileCharacterDraft(el);
    updateCharacter(active().id,{traitNotesInScripts:e.target.checked},false);
    if(!mobileDraft)save(true);
  }));
  $$("[data-body-field]").forEach(el=>{
    const eventName=el.tagName==="SELECT"?"change":"input";
    if(eventName==="input"&&isDeferredMobileTextControl(el)){
      el.addEventListener("input",()=>markMobileCharacterDraft(el),{passive:true});
      return;
    }
    const apply=()=>{
      const character=active(),bodyProfile=structuredClone(character.bodyProfile||{});
      const previousLeft=bodyProfile.appearance?.leftEyeColor||"설정하지 않음",previousRight=bodyProfile.appearance?.rightEyeColor||"설정하지 않음";
      setNestedObjectValue(bodyProfile,el.dataset.bodyField,el.value);
      if(["appearance.leftEyeColor","appearance.rightEyeColor"].includes(el.dataset.bodyField)&&previousLeft==="설정하지 않음"&&previousRight==="설정하지 않음"&&el.value!=="설정하지 않음"){
        bodyProfile.appearance.leftEyeColor=el.value;
        bodyProfile.appearance.rightEyeColor=el.value;
      }
      const mobileDraft=markMobileCharacterDraft(el);
      updateCharacter(character.id,{bodyProfile},false);
      syncCharacterControls(el,"data-body-field");
      if(!mobileDraft)save(el.tagName==="SELECT");
    };
    el.addEventListener(eventName,apply);
  });
  $$("[data-body-list]").forEach(el=>el.onclick=()=>{
    const character=active(),bodyProfile=structuredClone(character.bodyProfile||{}),bodyPath=el.dataset.bodyList.split(":")[0],parts=bodyPath.split("."),last=parts.pop();
    let cursor=bodyProfile;
    parts.forEach(part=>{if(!cursor[part]||typeof cursor[part]!=="object"||Array.isArray(cursor[part]))cursor[part]={};cursor=cursor[part]});
    const current=Array.isArray(cursor[last])?cursor[last]:[],value=el.dataset.value;
    const legacyAppearance=bodyPath==="physicalTraits"&&Array.isArray(character.appearanceTags)?character.appearanceTags:[];
    const selected=current.includes(value)||legacyAppearance.includes(value);
    cursor[last]=selected?current.filter(item=>item!==value):[...current,value];
    const patch={bodyProfile};
    if(bodyPath==="physicalTraits"&&legacyAppearance.includes(value))patch.appearanceTags=legacyAppearance.filter(item=>item!==value);
    const mobileDraft=markMobileCharacterDraft(el);
    updateCharacter(character.id,patch,false);
    if(!mobileDraft)save(true);
    document.querySelectorAll(`[data-body-list="${CSS.escape(el.dataset.bodyList)}"][data-value="${CSS.escape(value)}"]`).forEach(button=>button.classList.toggle("on",!selected));
  });
  $$("[data-field]").forEach(el=>{
    if(isDeferredMobileTextControl(el)){
      // 모바일 자유 입력은 DOM이 단 하나의 진실 공급원이다. 천지인 조합
      // 중에는 state, 미러 입력, localStorage를 전혀 건드리지 않는다.
      el.addEventListener("input",()=>markMobileCharacterDraft(el),{passive:true});
      return;
    }
    const apply=()=>{
    const patch=characterPatchFromField(el);
    if(!patch)return;
    updateCharacter(active().id,patch,false);
    syncCharacterControls(el,"data-field");
    if(!markMobileCharacterDraft(el))save(el.tagName==="SELECT");
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
    if(el.dataset.field==="homeVisualScale")el.closest("label")?.querySelector("[data-home-visual-scale-value]")?.replaceChildren(document.createTextNode(`${Math.round(Number(el.value))}%`));
    };
    el.oninput=apply;
    // IME 조합 종료와 포커스 이탈 때 최종 DOM 값을 한 번 더 반영한다.
    el.addEventListener("compositionend",apply);
    el.addEventListener("change",()=>{
      apply();
      if(isMobileCharacterDraftControl(el))save(false,false);
    });
  });
  $$("[data-color]").forEach(el=>el.oninput=()=>{
    const mobileDraft=markMobileCharacterDraft(el);
    updateCharacter(active().id,{theme:{...active().theme,[el.dataset.color]:el.value}},false);
    if(!mobileDraft)save();
    applyTheme();
    const hexInput=document.querySelector(`[data-theme-hex="${CSS.escape(el.dataset.color)}"]`);
    if(hexInput)hexInput.value=String(el.value||"").toUpperCase();
  });
  $$("[data-theme-hex]").forEach(el=>{
    const apply=()=>{
      const value=String(el.value||"").trim();
      if(!/^#[0-9a-f]{6}$/i.test(value)){el.setCustomValidity("예: #176B60처럼 6자리 HEX 색상을 입력해 주세요.");return}
      el.setCustomValidity("");
      const field=el.dataset.themeHex;
      const mobileDraft=markMobileCharacterDraft(el);
      updateCharacter(active().id,{theme:{...active().theme,[field]:value.toUpperCase()}},false);
      if(!mobileDraft)save();
      applyTheme();
      const colorInput=document.querySelector(`[data-color="${CSS.escape(field)}"]`);
      if(colorInput)colorInput.value=value;
    };
    el.onchange=apply;
    el.onkeydown=event=>{if(event.key==="Enter"){event.preventDefault();apply()}};
  });
  $$("[data-theme-swatch]").forEach(el=>el.onclick=()=>{
    const field=el.dataset.themeSwatch,value=el.dataset.colorValue;
    if(!["primary","secondary"].includes(field)||!/^#[0-9a-f]{6}$/i.test(value||""))return;
    updateCharacter(active().id,{theme:{...active().theme,[field]:value}},true);
    applyTheme();
    document.querySelectorAll(`[data-theme-swatch="${CSS.escape(field)}"]`).forEach(button=>button.classList.toggle("selected",button.dataset.colorValue===value));
  });
  $$("[data-gradient]").forEach(el=>el.addEventListener("change",e=>{
    const mobileDraft=markMobileCharacterDraft(el);
    updateCharacter(active().id,{theme:{...active().theme,gradient:e.target.checked}},false);
    if(!mobileDraft)save(true);
    applyTheme();
  }));
  $$("[data-chip]").forEach(el=>el.onclick=()=>{
    const mobileDraft=markMobileCharacterDraft(el);
    const field=el.dataset.chip,value=el.dataset.value;
    toggleChip(active().id,field,value,false);
    if(!mobileDraft)save(true);
    const selected=(active()[field]||[]).includes(value);
    document.querySelectorAll(`[data-chip="${CSS.escape(field)}"][data-value="${CSS.escape(value)}"]`).forEach(button=>button.classList.toggle("on",selected));
  });
  $$("[data-favorite-kind]").forEach(el=>el.onclick=()=>{
    const mobileDraft=markMobileCharacterDraft(el);
    const kind=el.dataset.favoriteKind,itemId=el.dataset.favoriteId;
    toggleFavorite(active().id,kind,itemId,!mobileDraft);
    const selected=(active().favorites?.[kind]||[]).includes(itemId);
    document.querySelectorAll(`[data-favorite-kind="${CSS.escape(kind)}"][data-favorite-id="${CSS.escape(itemId)}"]`).forEach(button=>button.classList.toggle("on",selected));
  });
  $$("[data-owned-kind]").forEach(el=>el.onclick=()=>{
    const mobileDraft=markMobileCharacterDraft(el);
    const kind=el.dataset.ownedKind,itemId=el.dataset.ownedId;
    toggleOwned(active().id,kind,itemId,!mobileDraft);
    const selected=(active().inventory?.[kind]||[]).includes(itemId);
    document.querySelectorAll(`[data-owned-kind="${CSS.escape(kind)}"][data-owned-id="${CSS.escape(itemId)}"]`).forEach(button=>button.classList.toggle("on",selected));
  });
  $$("[data-character-interaction]").forEach(el=>el.onclick=()=>{
    const item=String($("[data-character-interaction-item]")?.value||"").split(":");
    const type=el.dataset.characterInteraction,targetId=$("[data-character-interaction-target]")?.value||"";
    if(recordCharacterInteraction({type,actorId:active().id,targetId,itemKind:item[0],itemId:item.slice(1).join(":")})){
      showToast(type==="gift"?"선물을 건넸어요":type==="exercise"?"함께 운동을 시작했어요":type==="outing"?"함께 나들이를 시작했어요":"물건을 구매했어요");render();
    }else showToast("상대와 물건을 먼저 골라 주세요");
  });
  const catalogShell=document.querySelector(".catalog-shell");
  if(catalogShell){
    // 취향사전은 카드 단위로만 갱신한다. 선택 하나 때문에 header/main과
    // 도감 전체를 다시 만들지 않으므로 스크롤과 열린 카드가 그대로 남는다.
    catalogShell.addEventListener("change",event=>{
      const field=event.target.closest?.("[data-catalog-field]");
      if(!field||!catalogShell.contains(field))return;
      const kind=field.dataset.kind,itemId=field.dataset.item,key=field.dataset.catalogField;
      const value=["spicy","sweet"].includes(key)?Number(field.value):field.value,patch={[key]:value};
      if(key==="category")patch.subtype="";
      if(key==="image")patch.imageSource="user";
      updateCatalogItem(kind,itemId,patch);
      const card=field.closest(".catalog-dex-card");if(card)card.open=true;
      if(["category","subtype","image"].includes(key))replaceCatalogCard(kind,itemId,{open:true});
      else if(key==="name")card?.querySelector("summary b")?.replaceChildren(document.createTextNode(value||"새 항목"));
      showToast("항목에 반영되었습니다");
    });
    catalogShell.addEventListener("click",event=>{
      const button=event.target.closest?.("button");if(!button||!catalogShell.contains(button))return;
      if(button.dataset.addCatalog){
        event.preventDefault();
        const kind=button.dataset.addCatalog,itemId=addCatalogItem(kind,{name:"새 항목",category:"기타"});
        appendCatalogCard(kind,itemId);
        return;
      }
      if(button.dataset.catalogKeyword){
        event.preventDefault();
        const kind=button.dataset.kind,item=state.catalog?.[kind]?.find(value=>value.id===button.dataset.catalogKeyword),list=item?.keywords||[],value=button.dataset.value;
        const selected=!list.includes(value);
        updateCatalogItem(kind,button.dataset.catalogKeyword,{keywords:selected?[...list,value]:list.filter(entry=>entry!==value)});
        button.classList.toggle("on",selected);
        return;
      }
      if(button.dataset.deleteCatalog){
        event.preventDefault();
        if(!confirm("이 항목을 삭제할까요?"))return;
        const card=button.closest(".catalog-dex-card"),grid=card?.parentElement;
        deleteCatalogItem(button.dataset.kind,button.dataset.deleteCatalog);card?.remove();
        if(grid&&!grid.querySelector(".catalog-dex-card")){const empty=document.createElement("p");empty.dataset.catalogEmpty="";empty.textContent="아직 등록된 항목이 없어요.";grid.append(empty)}
        return;
      }
      if(button.dataset.catalogImage){event.preventDefault();openCatalogIllustrationPicker(button.dataset.catalogImage,button.dataset.kind);return}
      if(button.dataset.catalogPhoto){event.preventDefault();pickImage("catalogImage",button.dataset.catalogPhoto,button.dataset.kind);return}
      if(button.dataset.fashionAttr){
        event.preventDefault();
        const item=state.catalog.fashion.find(value=>value.id===button.dataset.item);if(!item)return;
        const field=button.dataset.fashionAttr,value=button.dataset.value,list=Array.isArray(item[field])?[...item[field]]:[],selected=!list.includes(value);
        updateCatalogItem("fashion",item.id,{[field]:selected?[...list,value]:list.filter(entry=>entry!==value)});
        button.classList.toggle("on",selected);
      }
    });
  }
  $$("[data-place-stock]").forEach(el=>el.onclick=()=>{
    togglePlaceStock(el.dataset.placeStock,el.dataset.itemId);
    const place=state.world.places.find(p=>p.id===el.dataset.placeStock);
    el.classList.toggle("on",Boolean(place?.stock?.includes(el.dataset.itemId)));
  });
  const layerCopy={
    en:{label:"Building layer order",back:"Send backward",front:"Bring forward",backDone:"Moved the building one layer backward.",frontDone:"Moved the building one layer forward."},
    ja:{label:"建物の重なり順",back:"背面へ移動",front:"前面へ移動",backDone:"建物を1段階背面へ移動しました。",frontDone:"建物を1段階前面へ移動しました。"}
  }[state.uiLanguage]||{label:"건물 겹침 순서",back:"뒤로 보내기",front:"앞으로 보내기",backDone:"건물을 한 칸 뒤로 보냈어요.",frontDone:"건물을 한 칸 앞으로 보냈어요."};
  $$(".place-edit-heading").forEach(heading=>{
    const deleteButton=heading.querySelector("[data-delete-place]"),placeId=deleteButton?.dataset.deletePlace;
    if(!placeId||heading.querySelector(".place-layer-tools"))return;
    const index=state.world.places.findIndex(place=>place.id===placeId),tools=document.createElement("div");
    tools.className="place-layer-tools";
    tools.innerHTML=`<small>${layerCopy.label}</small><button type="button" data-place-layer="back" data-place-id="${placeId}" ${index<=0?"disabled":""}>${layerCopy.back}</button><button type="button" data-place-layer="front" data-place-id="${placeId}" ${index>=state.world.places.length-1?"disabled":""}>${layerCopy.front}</button>`;
    heading.insertBefore(tools,deleteButton);
  });
  $$("[data-place-layer]").forEach(button=>button.onclick=()=>{
    const direction=button.dataset.placeLayer,placeId=button.dataset.placeId;
    if(!reorderPlace(placeId,direction))return;
    setMobileTownPanel(placeId);
    render();
    showToast(direction==="front"?layerCopy.frontDone:layerCopy.backDone);
  });
  $$("[data-delete-place]").forEach(el=>el.onclick=()=>{
    if(confirm("이 건물을 삭제할까요?")){deletePlace(el.dataset.deletePlace);render()}
  });
  $$("[data-save]").forEach(button=>button.addEventListener("click",async()=>{await explicitSave("캐릭터 저장");advanceFirstSetupAfterCharacter()}));
  $("[data-catalog-save]")?.addEventListener("click",()=>explicitSave("취향 사전 저장"));
  $("[data-town-save]")?.addEventListener("click",()=>explicitSave("마을 저장"));
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
  $$('[data-building-detail-open]').forEach(button=>button.onclick=event=>{
    if(button.closest('.mobile-town-shell')?.classList.contains('editing'))return;
    event.preventDefault();
    event.stopPropagation();
    const dialog=document.querySelector(`[data-building-detail-dialog="${CSS.escape(button.dataset.buildingDetailOpen)}"]`);
    if(dialog&&!dialog.open)dialog.showModal();
  });
  $$('[data-home-visual-mode]').forEach(button=>button.onclick=()=>{
    state.homeVisualMode=button.dataset.homeVisualMode==="ld"?"ld":"sd";
    save(true);
    render();
  });
  $$("[data-image]").forEach(el=>el.onclick=()=>pickImage(el.dataset.image,active().id));
  $$('[data-clear-character-image]').forEach(button=>button.onclick=()=>{
    setCharacterImage(active().id,button.dataset.clearCharacterImage,"");
    render();
  });
  bindCharacterSceneLayoutEditors();
  $$("[data-room-bg]").forEach(el=>el.onclick=()=>pickImage("room",el.dataset.homeId,el.dataset.room));
  $$("[data-home-bg]").forEach(el=>el.onclick=()=>pickImage("home",el.dataset.homeBg));
  $$("[data-place-interior-image]").forEach(el=>el.onclick=()=>pickImage("placeInterior",el.dataset.placeInteriorImage));
  $$("[data-image-url]").forEach(el=>el.onclick=()=>useImageUrl(el.dataset.imageUrl,el.dataset.id,el.dataset.room||""));
  $$("[data-clear-room-bg]").forEach(el=>el.onclick=()=>{setHomeImage(el.dataset.homeId,el.dataset.room,"");render()});
  $$("[data-clear-home-bg]").forEach(el=>el.onclick=()=>{setHomeBackground(el.dataset.clearHomeBg,"");render()});
  $$("[data-clear-place-interior-image]").forEach(el=>el.onclick=()=>{setPlaceInteriorImage(el.dataset.clearPlaceInteriorImage,"");render()});
  $$("[data-character-pane]").forEach(el=>el.onclick=()=>{setCharacterPane(el.dataset.characterPane);renderPreservingPageScroll(el)});
  $$("[data-profile-tags]").forEach(el=>el.onclick=()=>openProfileTagsDialog(el.dataset.profileTags));
  $$("[data-export-profile]").forEach(el=>el.addEventListener("click",openProfileExportDialog));
  $("[data-character-notification-toggle]")?.addEventListener("click",async event=>{
    if(state.characterNotificationsEnabled){
      state.characterNotificationsEnabled=false;
      await cancelCharacterNotifications();
      save(true);showToast("캐릭터 연락 알림을 껐어요");updateCharacterNotificationControls();return;
    }
    await enableCharacterNotificationsWithConsent(event.currentTarget);
  });
  $$('[data-character-notification-character]').forEach(input=>input.onchange=async()=>{
    const restoreScroll=preserveSelectionScroll(input);
    const settings=state.characterNotificationSettings,all=state.order.filter(id=>state.characters[id]);
    let selected=settings.characterIds?.length?[...settings.characterIds]:[...all];
    selected=input.checked?[...new Set([...selected,input.dataset.characterNotificationCharacter])]:selected.filter(id=>id!==input.dataset.characterNotificationCharacter);
    if(!selected.length){input.checked=true;input.closest("label")?.classList.add("on");showToast("연락받을 캐릭터를 한 명 이상 골라 주세요");return}
    settings.characterIds=selected;
    input.closest("label")?.classList.toggle("on",input.checked);
    save(true);input.blur();queueCharacterNotificationSchedule();restoreScroll();
  });
  $$('[data-character-notification-setting]').forEach(select=>select.onchange=()=>{
    const restoreScroll=preserveSelectionScroll(select);
    const key=select.dataset.characterNotificationSetting,value=["startHour","endHour","timesPerDay","intervalHours"].includes(key)?Number(select.value):select.value;
    state.characterNotificationSettings[key]=value;
    if(state.characterNotificationSettings.endHour<=state.characterNotificationSettings.startHour)state.characterNotificationSettings.endHour=Math.min(21,state.characterNotificationSettings.startHour+4);
    save(true);select.blur();queueCharacterNotificationSchedule();restoreScroll();
  });
  $$('[data-character-notification-kind]').forEach(button=>button.onclick=()=>{
    const settings=state.characterNotificationSettings,kind=button.dataset.characterNotificationKind,current=new Set(settings.contentKinds||[]);
    const selected=current.has(kind);
    if(selected&&current.size===1){showToast("연락 종류를 하나 이상 골라 주세요");return}
    selected?current.delete(kind):current.add(kind);
    settings.contentKinds=[...current];
    button.classList.toggle("on",!selected);button.setAttribute("aria-pressed",String(!selected));
    save(true);queueCharacterNotificationSchedule();
  });
  $('[data-character-update-notices]')?.addEventListener('change',event=>{
    state.characterNotificationSettings.updateNotices=event.currentTarget.checked;
    save(true);event.currentTarget.blur();
    if(event.currentTarget.checked)queueCurrentBuildUpdateNotice();
  });
  $('[data-character-schedule-end-notices]')?.addEventListener('change',event=>{
    state.characterNotificationSettings.scheduleEnds=event.currentTarget.checked;
    save(true);event.currentTarget.blur();queueCharacterNotificationSchedule();
  });
  $('[data-prevent-intertown-movement]')?.addEventListener('change',event=>{
    state.preventInterTownMovement=event.currentTarget.checked;
    state.order.forEach(id=>{if(state.characters[id])state.characters[id].timelineResetAt=Date.now()});
    save(true);event.currentTarget.blur();showToast(state.preventInterTownMovement?"캐릭터의 마을 사이 이동을 막았어요":"캐릭터가 다시 마을 사이를 이동할 수 있어요");
  });
  $("[data-character-notification-test]")?.addEventListener("click",sendCharacterNotificationTest);
  $$('[data-open-character-contact]').forEach(button=>button.onclick=()=>{
    const dialog=$('[data-character-contact-dialog]');
    if(dialog&&!dialog.open)dialog.showModal();
  });
  $$('[data-open-daily-question]').forEach(button=>button.onclick=()=>{
    button.closest('dialog[open]')?.close();
    const question=ensureDailyQuestionSchedule();
    if(question&&!question.answered)requestAnimationFrame(()=>openDailyCharacterQuestion({...question,shown:true}));
  });
  $$("[data-setting]").forEach(el=>el.onchange=()=>{
    const key=el.dataset.setting;
    state[key]=["homeSdScale","homeLdScale"].includes(key)?Math.max(70,Math.min(150,Number(el.value)||100)):el.value;
    if(key==="ownerName") localStorage.setItem("drawer-village-user-name",String(el.value||"").trim());
    save(true);
    if(key==="uiLanguage"){renderPreservingPageScroll(el);return}
    document.documentElement.dataset.uiScale=state.uiScale||"normal";
    if(["homeSdScale","homeLdScale"].includes(key))el.closest("label")?.querySelector("output")?.replaceChildren(document.createTextNode(`${Math.round(Number(el.value))}%`));
    el.blur();
  });
  $$("button[data-color-mode]").forEach(button=>button.onclick=event=>{
    event.stopPropagation();
    state.colorMode=button.dataset.colorMode==="light"?"light":"dark";
    save(true);
    renderPreservingPageScroll(button);
  });
  $$("button[data-visual-theme]").forEach(button=>button.onclick=event=>{
    event.stopPropagation();
    state.visualTheme=button.dataset.visualTheme||"monochrome";
    save(true);
    renderPreservingPageScroll(button);
  });
  $("[data-open-visual-theme-dialog]")?.addEventListener("click",()=>{
    const dialog=$("[data-visual-theme-dialog]");
    if(dialog&&!dialog.open)dialog.showModal();
  });
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
        renderPreservingPageScroll(el);
        return;
      }
      if(field==="imageScale"){
        const card=document.querySelector(`.place[data-place="${CSS.escape(el.dataset.placeId)}"]`);
        card?.style.setProperty("--place-scale",el.value);
      }
      save(el.tagName==="SELECT");
    };
    if(el.tagName==="SELECT")el.onchange=apply;else el.oninput=apply;
  });
  $$("[data-place-audience]").forEach(el=>el.onclick=()=>{
    const p=state.world.places.find(x=>x.id===el.dataset.placeAudience);
    const value=el.dataset.value, current=p?.audiences||[];
    const next=current.includes(value)?current.filter(x=>x!==value):[...current,value];
    updatePlace(p.id,{audiences:next},false);save();
    el.classList.toggle("on",next.includes(value));
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
  $$("[data-town-select]").forEach(el=>el.onclick=()=>{setMobileTownPanel("");switchTown(el.dataset.townSelect);render();centerMobileTownMap()});
  $$("[data-add-town]").forEach(el=>el.addEventListener("click",()=>{
    const limit=townLimit();
    if(!addTown(limit))showToast(`현재 마을 슬롯은 ${limit}개까지예요`);
    render();
  }));
  $$("[data-delete-town]").forEach(el=>el.onclick=()=>{if(confirm("이 마을을 삭제할까요?")){deleteTown(el.dataset.deleteTown);render()}});
  $$("[data-add-place]").forEach(el=>el.addEventListener("click",()=>{
    const before=new Set(state.world.places.map(place=>place.id));
    addPlace();
    const added=state.world.places.find(place=>!before.has(place.id));
    if(added)setMobileTownPanel(added.id);
    render();
  }));
  const addPlaceButton=$("[data-add-place]");
  $("[data-add-rel]")?.addEventListener("click",()=>openRelationDialog());
  $$("[data-edit-rel]").forEach(el=>el.onclick=()=>{
    el.closest("[data-official-relation-dialog]")?.close();
    openRelationDialog(el.dataset.editRel);
  });
  $$("[data-view-source]").forEach(control=>control.onchange=()=>{
    state.characterViewSource=control.value;
    setActive(state.characterViewSource);
    if(state.characterViewTarget===state.characterViewSource||!state.characters[state.characterViewTarget]){
      state.characterViewTarget=state.order.find(id=>id!==state.characterViewSource)||"";
    }
    save(true);
    render();
  });
  $$("[data-view-target]").forEach(control=>control.onchange=()=>{
    if(control.value===state.characterViewSource)return;
    state.characterViewTarget=control.value;
    save(true);
    render();
  });
  $$("[data-open-view-dialog]").forEach(button=>button.onclick=()=>{
    const dialog=document.querySelector(`[data-view-dialog="${CSS.escape(button.dataset.openViewDialog)}"]`);
    if(dialog){
      dialog.dataset.dirty="";
      dialog.onclose=()=>{
        if(dialog.dataset.dirty==="1")save(true);
        render();
      };
    }
    dialog?.showModal();
  });
  $("[data-open-relationship-map]")?.addEventListener("click",openRelationshipMap);
  $("[data-open-official-relations]")?.addEventListener("click",()=>{
    const dialog=$("[data-official-relation-dialog]");
    if(dialog&&!dialog.open)dialog.showModal();
  });
  $("[data-refresh-relationship-map]")?.addEventListener("click",()=>{
    render();
    requestAnimationFrame(openRelationshipMap);
  });
  $("[data-export-relationship-map]")?.addEventListener("click",exportRelationshipMapPng);
  $$("[data-character-view]").forEach(select=>select.onchange=()=>{
    const source=select.dataset.source,target=select.dataset.target,field=select.dataset.viewField;
    if(field==="touchIntensity"&&select.value==="성인 간 친밀한 접촉까지"&&[source,target].some(id=>["영아","유아","어린이","청소년"].includes(state.characters[id]?.ageGroup))){
      select.value="신체 접촉 없음";
      showToast("성인 간 친밀한 접촉 범위는 성인 캐릭터끼리만 설정할 수 있어요");
    }
    updateCharacterView(source,target,field,select.value);
    if(field==="overall"){
      const summary=$$("[data-view-summary]").find(item=>item.dataset.viewSummary===`${source}:${target}`);
      if(summary){
        summary.textContent=overallViewPhrase(select.value);
      }
    }
    const dialog=select.closest("[data-view-dialog]");
    if(dialog)dialog.dataset.dirty="1";
    const physicalWarning=field==="aggressionAction"&&["상대를 밀칠 수 있음","실제로 때릴 수 있음","심한 폭력을 행사할 수 있음"].includes(select.value);
    showToast(physicalWarning
      ?"주의: 이 단계부터는 충동·갈등·성격 조건이 함께 맞을 때 물리적 행동 장면이 나올 수 있어요"
      :`${state.characters[source]?.name||"캐릭터"}의 생각을 반영했어요 · 편집 완료 시 저장돼요`);
  });
  $$("[data-reset-character-view]").forEach(button=>button.onclick=()=>{
    const [source,target]=String(button.dataset.resetCharacterView||"").split(":");
    if(!source||!target||!confirm("이 두 사람 사이에서 현재 캐릭터가 느끼는 감정 설정을 초기화할까요?\n공식 관계가 있으면 그 관계의 기본값만 다시 표시됩니다."))return;
    if(state.characterViews?.[source])delete state.characterViews[source][target];
    const dialog=button.closest("[data-view-dialog]");
    if(dialog?.open)dialog.close();
    save(true);
    render();
    showToast("이 캐릭터의 시선 설정을 초기화했습니다");
  });
  $$("[data-delete-rel]").forEach(el=>el.onclick=()=>{
    if(confirm("이 관계를 삭제할까요?")){deleteRelationship(el.dataset.deleteRel);render();explicitSave("관계 삭제")}
  });
  $$("[data-delete-group]").forEach(el=>el.onclick=()=>{
    if(!confirm("이 그룹 관계 전체를 삭제할까요?"))return;
    Object.values(state.relationships).filter(r=>r.groupId===el.dataset.deleteGroup).forEach(r=>deleteRelationship(r.id));
    render();explicitSave("그룹 관계 삭제");
  });
  $("[data-add-character-group]")?.addEventListener("click",()=>openCharacterGroupDialog());
  $$("[data-edit-character-group]").forEach(button=>button.onclick=()=>openCharacterGroupDialog(button.dataset.editCharacterGroup));
  $$("[data-delete-character-group]").forEach(button=>button.onclick=()=>{
    const group=(state.characterGroups||[]).find(item=>item.id===button.dataset.deleteCharacterGroup);
    if(!group||!confirm(`‘${group.name}’ 그룹을 삭제할까요?\n캐릭터와 관계는 삭제되지 않습니다.`))return;
    state.characterGroups=state.characterGroups.filter(item=>item.id!==group.id);save(true);render();showToast("캐릭터 그룹을 삭제했어요");
  });
  $$("[data-routine-character]").forEach(el=>el.onclick=()=>{setActive(el.dataset.routineCharacter);render()});
  $$("[data-force-home]").forEach(el=>el.onclick=()=>{
    const ids=el.dataset.forceHome==="all"?[...state.order]:[active().id],count=forceCharactersHome(ids,new Date());
    const copy={en:count===1?"The selected character is heading home.":`${count} characters are heading home.`,ja:count===1?"選択したキャラクターを帰宅させました。":`${count}人のキャラクターを帰宅させました。`,ko:count===1?"선택한 캐릭터를 집으로 돌려보냈어요.":`${count}명의 캐릭터를 집으로 돌려보냈어요.`}[state.uiLanguage]||"캐릭터를 집으로 돌려보냈어요.";
    render();showToast(copy);
  });
  $("[data-add-routine]")?.addEventListener("click",()=>openRoutineDialog("",newRoutineDraft()));
  $$("[data-add-routine-day]").forEach(el=>el.addEventListener("click",()=>{
    const draft=newRoutineDraft();draft.day=Math.max(0,Math.min(6,Number(el.dataset.addRoutineDay)||0));openRoutineDialog("",draft);
  }));
  $("[data-add-monthly-routine]")?.addEventListener("click",()=>openMonthlyRoutineDialog("",newMonthlyRoutineDraft()));
  $("[data-add-anniversary]")?.addEventListener("click",()=>openAnniversaryDialog());
  $$("[data-routine-view]").forEach(el=>el.onclick=()=>{state.routineView=el.dataset.routineView==="monthly"?"monthly":"weekly";if(!state.routineMonth)state.routineMonth=currentMonthKey();save();render()});
  $$("[data-routine-month-step]").forEach(el=>el.onclick=()=>{const [year,month]=(state.routineMonth||currentMonthKey()).split("-").map(Number),next=new Date(year,month-1+Number(el.dataset.routineMonthStep),1);state.routineMonth=`${next.getFullYear()}-${String(next.getMonth()+1).padStart(2,"0")}`;save();render()});
  $$("[data-edit-routine]").forEach(el=>el.onclick=()=>openRoutineDialog(el.dataset.editRoutine));
  $$("[data-edit-monthly-routine]").forEach(el=>el.onclick=()=>openMonthlyRoutineDialog(el.dataset.editMonthlyRoutine));
  $$("[data-edit-anniversary]").forEach(el=>el.onclick=()=>openAnniversaryDialog(el.dataset.editAnniversary));
  $$("[data-delete-routine]").forEach(el=>el.onclick=()=>{
    const routine=(state.routines?.[active().id]||[]).find(item=>item.id===el.dataset.deleteRoutine);
    if(!confirm(`이 주간 루틴을 삭제하시겠습니까?\n\n일정: ${routine?.title||"제목 없음"}\n삭제한 일정은 되돌릴 수 없습니다.`))return;
    deleteRoutine(active().id,el.dataset.deleteRoutine);render();
  });
  $$("[data-delete-monthly-routine]").forEach(el=>el.onclick=()=>{
    const routine=(state.monthlyRoutines?.[active().id]||[]).find(item=>item.id===el.dataset.deleteMonthlyRoutine);
    if(!confirm(`이 월간 일정을 삭제하시겠습니까?\n\n일정: ${routine?.title||"제목 없음"}\n삭제한 일정은 되돌릴 수 없습니다.`))return;
    deleteMonthlyRoutine(active().id,el.dataset.deleteMonthlyRoutine);render();
  });
  $("[data-export-file]")?.addEventListener("click",()=>{
    const blob=new Blob([JSON.stringify({format:"drawer-village-backup",version:2,mediaPolicy:"device-only",exportedAt:new Date().toISOString(),gameState:informationOnlyState(cloneState())})],{type:"application/json"});
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
        const incoming=informationOnlyState(next),incomingCount=Array.isArray(incoming.characters)?incoming.characters.length:Object.keys(incoming.characters||{}).length;
        if(!incomingCount)throw new Error("empty-backup");
        const imported=mergeImportedBackupState(cloneState(),incoming),resultCount=Object.keys(imported.characters||{}).length;
        if(resultCount<incomingCount)throw new Error("incomplete-backup-merge");
        window.ParallelCity.replaceState(imported);
        try{localStorage.setItem(ONBOARDING_KEY,"done")}catch{}
        showToast(`백업의 캐릭터 ${incomingCount}명을 불러왔습니다 · 기기의 기존 캐릭터와 사진도 유지했습니다`);
      }catch(error){
        console.error(error);
        showToast(error?.code==="backup-storage-full"?"기기 저장 공간이 부족해 불러오기를 중단했습니다 · 기존 데이터는 바꾸지 않았습니다":"캐릭터가 들어 있는 서랍마을 백업 파일인지 확인해 주세요");
      }
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

async function applyImage(type,id,room,data){
  data=await persistLocalImage(data);
  if(type==="room")setHomeImage(id,room,data);
  else if(type==="home")setHomeBackground(id,data);
  else if(type==="placeInterior")setPlaceInteriorImage(id,data);
  else if(type==="petPhoto")setPetImage(id,room,"photo",data);
  else if(type==="petIcon")setPetImage(id,room,"icon",data);
  else if(type==="car")updateCar(id,room,{image:data});
  else if(type==="catalogImage")updateCatalogItem(room,id,{image:data,imageSource:"user"});
  else setCharacterImage(id,type,data);
}

const APP_TABS=["observe","mailbox","home","character","catalog","relationship","routine","statistics","town","shop","settings"];
let observeProfileShieldUntil=0;
function armObserveProfileInputShield(duration=760){
  observeProfileShieldUntil=performance.now()+duration;
  document.documentElement.dataset.observeProfileShield="1";
  setTimeout(()=>{
    if(performance.now()>=observeProfileShieldUntil)delete document.documentElement.dataset.observeProfileShield;
  },duration+40);
}
function blockObserveProfileInputAfterNavigation(event){
  if(performance.now()>observeProfileShieldUntil)return;
  const target=event.target instanceof Element?event.target:null;
  if(!target?.closest?.("[data-open-game-hud-roster]"))return;
  event.preventDefault();
  event.stopImmediatePropagation();
}
["pointerdown","pointerup","touchend","click"].forEach(type=>document.addEventListener(type,blockObserveProfileInputAfterNavigation,true));
function recordTabHistory(tab,replace=false){
  if(!APP_TABS.includes(tab))return;
  try{sessionStorage.setItem("drawer-village-active-tab",tab)}catch{}
  const url=new URL(location.href);
  const pane=tab==="settings"?new URLSearchParams(location.hash.replace(/^#/,"")).get("pane"):"";
  url.hash=pane?`tab=settings&pane=${encodeURIComponent(pane)}`:`tab=${tab}`;
  const next={...(history.state||{}),drawerVillageTab:tab};
  if(replace)history.replaceState(next,"",url);
  else if(history.state?.drawerVillageTab!==tab)history.pushState(next,"",url);
}
function navigateToTab(tab,{recordHistory=true}={}){
  if(!APP_TABS.includes(tab))return;
  const returningToObserve=tab==="observe"&&state.activeTab!=="observe";
  if(returningToObserve)armObserveProfileInputShield();
  document.querySelector(".page-guide[open]")?.close("navigate");
  if(tab!=="home")state.homeEditMode=false;
  if(tab!=="character"){
    flushMobileCharacterDraft();
    mobileCharacterReorderOpen=false;
  }
  if(tab==="settings"&&!new URLSearchParams(location.hash.replace(/^#/,"")).get("pane"))setSettingsPane("home");
  if(tab==="home"){
    const character=active(),current=character?eventFor(character):null;
    const currentHomeId=current?.home?(current.visitHomeId||character?.homeId):character?.homeId;
    if(currentHomeId&&state.homes[currentHomeId])setActiveHome(currentHomeId);
  }
  if(tab==="relationship"&&state.characters[state.activeId]){
    state.characterViewSource=state.activeId;
    if(state.characterViewTarget===state.activeId||!state.characters[state.characterViewTarget]){
      state.characterViewTarget=state.order.find(id=>id!==state.activeId)||"";
    }
  }
  setNavigationTabIntent(tab);
  document.documentElement.dataset.lastNavigation=tab;
  // 화면 이동은 입력 보호용 지연 렌더보다 우선한다. 이전에는 해시만 먼저
  // 바뀐 뒤 렌더가 보류되면서 주소는 새 메뉴인데 화면은 그대로 남을 수
  // 있었다. 실제 화면을 먼저 확정한 다음 히스토리를 기록한다.
  if(document.activeElement instanceof HTMLElement)document.activeElement.blur();
  resetScrollAfterRender=true;
  render({force:true});
  if(recordHistory)recordTabHistory(tab);
  if(tab==="town")centerMobileTownMap();
  window.scrollTo({top:0,behavior:"auto"});
}

function navigateBackToObserve(){
  const opened=document.querySelector("dialog[open]");
  if(opened){
    try{opened.close("back")}catch{opened.removeAttribute("open")}
    return true;
  }
  if(state.activeTab!=="observe"){
    navigateToTab("observe");
    return true;
  }
  return false;
}
window.DrawerVillageNavigation={
  go:tab=>navigateToTab(tab),
  back:navigateBackToObserve,
  current:()=>state.activeTab
};

// 탭 전환은 브라우저가 한 번만 확정해서 보내는 click에서 처리한다.
// pointerup에서 먼저 화면 전체를 다시 그리면 Android WebView가 뒤이어
// 보내는 click의 대상이 새 화면의 다른 버튼으로 바뀌어, 열었던 화면이
// 즉시 닫히거나 버튼이 번쩍이기만 하는 문제가 생긴다.
function tabButtonFromEvent(event){
  const path=typeof event.composedPath==="function"?event.composedPath():[];
  return path.find(node=>node?.matches?.("[data-tab]"))||event.target?.closest?.("[data-tab]");
}
function captureTabClick(event){
  const button=tabButtonFromEvent(event);
  const tab=button?.dataset?.tab;
  if(!APP_TABS.includes(tab))return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if(tab==="settings"&&button.dataset.settingsPane){
    openSettingsPane(button.dataset.settingsPane);
    return;
  }
  navigateToTab(tab);
}
document.addEventListener("click",captureTabClick,true);

// 설정 카테고리는 URL과 화면 상태를 함께 바꾼다. 이를 한 함수에서
// 처리해야 주소만 바뀌거나 화면만 남는 두 상태가 다시 생기지 않는다.
function openSettingsPane(pane="home"){
  setSettingsPane(pane);
  if(document.activeElement instanceof HTMLElement)document.activeElement.blur();
  resetScrollAfterRender=true;
  render({force:true});
  const url=new URL(location.href);
  url.hash=pane==="home"?"tab=settings":`tab=settings&pane=${encodeURIComponent(pane)}`;
  history.replaceState({...history.state,drawerVillageTab:"settings"},"",url);
  window.scrollTo({top:0,left:0,behavior:"auto"});
}

window.addEventListener("drawer-village-native-back",event=>{
  if(navigateBackToObserve())event.preventDefault();
});

function centerMobileTownMap(characterId){
  requestAnimationFrame(()=>{
    const scroller=document.querySelector(".town-map-scroll")||document.querySelector(".standard-observe-view .viewport"),world=scroller?.querySelector(".world");
    if(!scroller||!world)return;
    // 모바일 마을 화면은 현재 마을에 실제로 표시 중인 캐릭터 카드를 우선한다.
    // 마을 전환 직후 다른 마을의 activeId 좌표로 움직이거나 지도 한가운데로
    // 이동하지 않고, 사용자가 보고 있는 캐릭터의 건물·집 위치로 바로 간다.
    const visibleCharacterId=characterId||document.querySelector("[data-mobile-town-character]")?.dataset.mobileTownCharacter||state.activeId;
    const character=state.characters[visibleCharacterId],entry=character?eventFor(character):null;
    const place=entry?.placeId?state.world.places.find(item=>item.id===entry.placeId):null;
    const home=entry?.home?state.homes[entry.visitHomeId||character?.homeId]:null;
    const target=place||home;
    // 위치 정보가 없는 캐릭터를 선택했을 때 임의로 지도 한가운데로 보내지 않는다.
    if(!target)return;
    const ratioX=Math.max(0,Math.min(1,Number(place?target.x:target.mapX)/100));
    const ratioY=Math.max(0,Math.min(1,Number(place?target.y:target.mapY)/100));
    const left=Math.max(0,world.scrollWidth*ratioX-scroller.clientWidth/2);
    const top=Math.max(0,world.scrollHeight*ratioY-scroller.clientHeight/2);
    scroller.scrollTo({left,top,behavior:"smooth"});
  });
}

function centerRelationshipSelectors(){
  if(state.activeTab!=="relationship")return;
  requestAnimationFrame(()=>{
    document.querySelectorAll(".relationship-character-rail").forEach(rail=>{
      const selected=rail.querySelector("button.on");
      if(!selected)return;
      rail.scrollTo({top:Math.max(0,selected.offsetTop-(rail.clientHeight-selected.offsetHeight)/2),behavior:"auto"});
    });
  });
}

function bindRelationshipRoulette(){
  if(state.activeTab!=="relationship"||!document.documentElement.classList.contains("native-app"))return;
  document.querySelectorAll(".relationship-character-rail").forEach(rail=>{
    let frame=0,commitTimer=0,scrollFlagTimer=0,ready=false;
    const sourceRail=rail.classList.contains("source-rail");
    const selectedId=sourceRail?state.characterViewSource:state.characterViewTarget;
    const selectedMiddle=[...rail.querySelectorAll('button[data-roulette-cycle="1"]')].find(button=>(sourceRail?button.dataset.viewSource:button.dataset.viewTarget)===selectedId);
    const centerButton=button=>{
      if(!button)return;
      rail.scrollTop=Math.max(0,button.offsetTop-(rail.clientHeight-button.offsetHeight)/2);
    };
    const update=(commit=false)=>{
      frame=0;
      const buttons=[...rail.querySelectorAll("button")];if(!buttons.length)return;
      const railRect=rail.getBoundingClientRect(),center=railRect.top+railRect.height/2;
      let selectedIndex=0,bestDistance=Infinity;
      buttons.forEach((button,index)=>{
        const rect=button.getBoundingClientRect(),distance=Math.abs(rect.top+rect.height/2-center);
        if(distance<bestDistance){bestDistance=distance;selectedIndex=index}
      });
      buttons.forEach((button,index)=>{
        const rect=button.getBoundingClientRect();
        const distance=(rect.top+rect.height/2-center)/Math.max(1,button.offsetHeight);
        button.classList.toggle("roulette-preview",index===selectedIndex);
        button.classList.toggle("on",index===selectedIndex);
        button.style.setProperty("--roulette-distance",distance);
        button.style.setProperty("--fan-angle",`${Math.max(-24,Math.min(24,distance*7))*(sourceRail?-1:1)}deg`);
        const inward=Math.max(0,20-Math.min(20,Math.abs(distance)*6));
        button.style.setProperty("--fan-shift",`${inward*(sourceRail?1:-1)}px`);
      });
      if(!commit||!ready)return;
      clearTimeout(commitTimer);
      commitTimer=window.setTimeout(()=>{
        const button=buttons[selectedIndex],id=sourceRail?button?.dataset.viewSource:button?.dataset.viewTarget;
        if(!id)return;
        if(sourceRail){
          state.characterViewSource=id;
          state.activeId=id;
          if(state.characterViewTarget===id||!state.characters[state.characterViewTarget]){
            state.characterViewTarget=state.order.find(characterId=>characterId!==id)||"";
          }
        }else{
          if(id===state.characterViewSource)return;
          state.characterViewTarget=id;
        }
        save(true);
        render();
      },180);
    };
    rail.addEventListener("scroll",()=>{
      if(!ready)return;
      rail.dataset.rouletteScrolling="1";
      clearTimeout(scrollFlagTimer);
      scrollFlagTimer=window.setTimeout(()=>{rail.dataset.rouletteScrolling=""},260);
      if(frame)return;
      frame=requestAnimationFrame(()=>update(true));
    },{passive:true});
    centerButton(selectedMiddle);
    requestAnimationFrame(()=>{
      centerButton(selectedMiddle);
      update(false);
      ready=true;
    });
  });
}

function openRelationshipMap(){
  const dialog=document.querySelector("[data-relationship-map-dialog]");
  if(!dialog)return;
  if(!dialog.open)dialog.showModal();
  requestAnimationFrame(()=>{
    const scroller=dialog.querySelector(".relationship-map-scroll");
    if(scroller)scroller.scrollLeft=Math.max(0,(scroller.scrollWidth-scroller.clientWidth)/2);
  });
}

async function relationshipExportImage(src){
  if(!src)return "";
  if(/^data:image\//i.test(src))return src;
  try{
    const response=await fetch(new URL(src,location.href).href,{cache:"force-cache"});
    if(!response.ok)throw new Error(`image-${response.status}`);
    const blob=await response.blob();
    return await new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onload=()=>resolve(String(reader.result||""));
      reader.onerror=reject;
      reader.readAsDataURL(blob);
    });
  }catch(error){
    console.warn("관계도 이미지 포함 실패",src,error);
    return "";
  }
}

async function exportRelationshipMapPng(){
  const source=document.querySelector("[data-relationship-map-dialog] .relationship-map-canvas svg");
  if(!source){showToast("저장할 관계도가 없어요");return}
  const clone=source.cloneNode(true),svgNs="http://www.w3.org/2000/svg";
  clone.setAttribute("xmlns",svgNs);
  clone.setAttribute("width","1800");
  clone.setAttribute("height","1800");
  const defs=document.createElementNS(svgNs,"defs");
  clone.prepend(defs);
  const foreignNodes=[...clone.querySelectorAll("foreignObject")];
  for(const [index,foreign] of foreignNodes.entries()){
    const x=Number(foreign.getAttribute("x"))||0,y=Number(foreign.getAttribute("y"))||0;
    const width=Number(foreign.getAttribute("width"))||110,height=Number(foreign.getAttribute("height"))||110;
    const img=foreign.querySelector("img"),name=foreign.querySelector("b")?.textContent||"";
    const group=document.createElementNS(svgNs,"g");
    const visualSize=Math.min(width,height)*.58,cx=x+width/2,cy=y+height*.39;
    const circle=document.createElementNS(svgNs,"circle");
    circle.setAttribute("cx",String(cx));circle.setAttribute("cy",String(cy));
    circle.setAttribute("r",String(visualSize/2+3));circle.setAttribute("fill","#fff");
    circle.setAttribute("stroke","#d8cec4");circle.setAttribute("stroke-width","3");
    group.append(circle);
    const embeddedSource=await relationshipExportImage(img?.getAttribute("src")||"");
    if(embeddedSource){
      const clipId=`relationship-avatar-${index}`;
      const clip=document.createElementNS(svgNs,"clipPath"),clipCircle=document.createElementNS(svgNs,"circle");
      clip.setAttribute("id",clipId);clipCircle.setAttribute("cx",String(cx));clipCircle.setAttribute("cy",String(cy));clipCircle.setAttribute("r",String(visualSize/2));
      clip.append(clipCircle);defs.append(clip);
      const image=document.createElementNS(svgNs,"image");
      image.setAttribute("href",embeddedSource);
      image.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",embeddedSource);
      image.setAttribute("x",String(cx-visualSize/2));image.setAttribute("y",String(cy-visualSize/2));
      image.setAttribute("width",String(visualSize));image.setAttribute("height",String(visualSize));
      image.setAttribute("preserveAspectRatio","xMidYMid meet");image.setAttribute("clip-path",`url(#${clipId})`);
      group.append(image);
    }else{
      const symbol=document.createElementNS(svgNs,"text");
      symbol.setAttribute("x",String(cx));symbol.setAttribute("y",String(cy+10));symbol.setAttribute("text-anchor","middle");
      symbol.setAttribute("font-size",String(visualSize*.55));symbol.textContent=foreign.textContent?.trim()?.slice(0,1)||"•";
      group.append(symbol);
    }
    const label=document.createElementNS(svgNs,"text");
    label.setAttribute("x",String(cx));label.setAttribute("y",String(y+height*.83));label.setAttribute("text-anchor","middle");
    label.setAttribute("font-size",width>130?"24":"18");label.setAttribute("font-weight","800");
    label.setAttribute("fill","#2f2924");label.setAttribute("stroke","#fff");label.setAttribute("stroke-width","5");
    label.setAttribute("paint-order","stroke");label.textContent=name;
    group.append(label);
    foreign.replaceWith(group);
  }
  const style=document.createElementNS(svgNs,"style");
  style.textContent=`.map-official rect{display:none}.map-relation{font:800 15px sans-serif;fill:#33261f;paint-order:stroke;stroke:#fffdf9;stroke-width:5px;stroke-linejoin:round}.map-stage{font:600 11px sans-serif;fill:#6f625a;paint-order:stroke;stroke:#fffdf9;stroke-width:4px;stroke-linejoin:round}.map-heart{font:900 24px sans-serif;stroke:#fff;stroke-width:4;paint-order:stroke}`;
  defs.after(style);
  const serialized=new XMLSerializer().serializeToString(clone);
  const blob=new Blob([serialized],{type:"image/svg+xml;charset=utf-8"});
  const url=URL.createObjectURL(blob),image=new Image();
  try{
    await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject;image.src=url});
    const canvas=document.createElement("canvas");canvas.width=1800;canvas.height=1800;
    const context=canvas.getContext("2d");
    context.fillStyle="#f7f2eb";context.fillRect(0,0,canvas.width,canvas.height);
    context.drawImage(image,0,0,canvas.width,canvas.height);
    const png=await new Promise(resolve=>canvas.toBlob(resolve,"image/png",1));
    if(!png)throw new Error("png-encode-failed");
    const link=document.createElement("a"),pngUrl=URL.createObjectURL(png);
    link.href=pngUrl;link.download=`서랍마을-인물관계도-${new Date().toISOString().slice(0,10)}.png`;link.click();
    setTimeout(()=>URL.revokeObjectURL(pngUrl),1000);
    showToast("인물 관계도를 PNG로 저장했습니다");
  }catch(error){
    console.error("관계도 PNG 저장 실패",error);
    showToast("이미지 보안 제한으로 관계도 PNG를 만들지 못했어요");
  }finally{URL.revokeObjectURL(url)}
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
    await applyImage(type,id,room,url.href);
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
        await applyImage(type,id,room,resolved);
        render();
        showToast("이미지 주소로 사진을 추가했습니다");
        return;
      }
      showToast("직접 표시할 수 있는 이미지 주소를 입력해 주세요");
      return;
    }
    if(["http:","https:"].includes(url.protocol)){
      await applyImage(type,id,room,url.href);
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
    await applyImage(task.type,task.id,task.room,data);
    if(task.type==="catalogImage")replaceCatalogCard(task.room,task.id,{open:true});
    else render();
  }catch(err){
    console.error(err);
    alert("사진을 저장하지 못했어요. 다른 사진으로 다시 시도해 주세요.");
  }
};

function prepareCatalogIllustration(file){
  return new Promise((resolve,reject)=>{
    const url=URL.createObjectURL(file),img=new Image();
    img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error("image-load-failed"))};
    img.onload=()=>{
      const maxSide=1200,scale=Math.min(1,maxSide/Math.max(img.naturalWidth,img.naturalHeight));
      const canvas=document.createElement("canvas");
      canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));
      canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
      const context=canvas.getContext("2d");
      context.clearRect(0,0,canvas.width,canvas.height);
      context.drawImage(img,0,0,canvas.width,canvas.height);
      const data=canvas.toDataURL("image/webp",.84);
      URL.revokeObjectURL(url);
      resolve(data);
    };
    img.src=url;
  });
}

function prepareTransparentIcon(file){
  return new Promise((resolve,reject)=>{
    const url=URL.createObjectURL(file),img=new Image();
    img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error("image-load-failed"))};
    img.onload=()=>{
      const size=512,padding=20,available=size-padding*2;
      const scale=Math.min(available/img.naturalWidth,available/img.naturalHeight);
      const width=Math.max(1,Math.round(img.naturalWidth*scale)),height=Math.max(1,Math.round(img.naturalHeight*scale));
      const canvas=document.createElement("canvas"),context=canvas.getContext("2d");
      canvas.width=size;canvas.height=size;
      context.clearRect(0,0,size,size);
      context.drawImage(img,Math.round((size-width)/2),Math.round((size-height)/2),width,height);
      const data=canvas.toDataURL("image/webp",.92);
      URL.revokeObjectURL(url);
      resolve(data);
    };
    img.src=url;
  });
}

function prepareLargeArt(file){
  return new Promise((resolve,reject)=>{
    const url=URL.createObjectURL(file),img=new Image();
    img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error("image-load-failed"))};
    img.onload=()=>{
      const maxSide=1800,scale=Math.min(1,maxSide/Math.max(img.naturalWidth,img.naturalHeight));
      const canvas=document.createElement("canvas"),context=canvas.getContext("2d",{alpha:true});
      canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));
      canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
      context.imageSmoothingEnabled=true;context.imageSmoothingQuality="high";
      context.clearRect(0,0,canvas.width,canvas.height);
      context.drawImage(img,0,0,canvas.width,canvas.height);
      const data=canvas.toDataURL("image/webp",.88);
      URL.revokeObjectURL(url);resolve(data);
    };
    img.src=url;
  });
}

function cropImage(file,type){
  if(type==="catalogImage")return prepareCatalogIllustration(file);
  if(type==="icon"||type==="petIcon")return prepareTransparentIcon(file);
  if(type==="ldImage"||/^ld(?:Neutral|Joy|Sad|Angry|Tired)$/.test(type))return prepareLargeArt(file);
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
        const data=applied?canvas.toDataURL("image/webp",.66):null;
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
    setNavigationTabIntent("home");
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
  if(state.activeTab!=="home")setNavigationTabIntent("home");
  save();
  render();
  requestAnimationFrame(()=>{
    const marker=document.querySelector(`[data-home-person="${CSS.escape(id)}"]`);
    marker?.scrollIntoView({behavior:"smooth",block:"center",inline:"center"});
  });
}

function openCharacterGroupDialog(id=""){
  const existing=(state.characterGroups||[]).find(group=>group.id===id),draft=existing?{...existing,memberIds:[...(existing.memberIds||[])]}:{id:newId(),name:"",memberIds:[]};
  const dialog=document.createElement("dialog");dialog.className="relation-dialog character-group-dialog";
  dialog.innerHTML=`<form><div class="title"><div><small>CHARACTER GROUP</small><h2>${existing?"캐릭터 그룹 편집":"캐릭터 그룹 만들기"}</h2></div><button type="button" data-character-group-cancel aria-label="닫기">×</button></div><label>그룹 이름<input name="name" maxlength="40" value="${htmlEsc(draft.name)}" placeholder="예: 빌런즈"></label><fieldset class="group-members"><legend>그룹에 넣을 캐릭터</legend>${state.order.map(characterId=>`<label><input type="checkbox" name="memberId" value="${htmlEsc(characterId)}" ${draft.memberIds.includes(characterId)?"checked":""}>${htmlEsc(state.characters[characterId]?.name||"")}</label>`).join("")}</fieldset><p>그룹은 캐릭터와 기존 관계를 바꾸지 않으며, 일정의 함께하는 인물을 빠르게 고를 때 사용합니다.</p><div class="crop-actions"><button type="button" data-character-group-cancel>취소</button><button type="button" class="primary" data-character-group-save>저장</button></div></form>`;
  translateDynamicInterface(dialog);document.body.append(dialog);
  dialog.querySelectorAll("[data-character-group-cancel]").forEach(button=>button.onclick=()=>dialog.close());
  dialog.querySelector("[data-character-group-save]").onclick=()=>{
    const name=dialog.querySelector("[name=name]").value.trim(),memberIds=[...dialog.querySelectorAll("[name=memberId]:checked")].map(input=>input.value);
    if(!name){showToast("그룹 이름을 입력해 주세요");return}
    if(!memberIds.length){showToast("그룹에 넣을 캐릭터를 한 명 이상 골라 주세요");return}
    Object.assign(draft,{name,memberIds});
    state.characterGroups=Array.isArray(state.characterGroups)?state.characterGroups:[];
    if(existing)Object.assign(existing,draft);else state.characterGroups.push(draft);
    save(true);dialog.close("save");
  };
  dialog.onclose=()=>{const changed=dialog.returnValue==="save";dialog.remove();if(changed)render()};dialog.showModal();
}

function routineDestinationOptions(item){
  const labels={
    en:{automatic:"My home or automatic",homes:"Character homes",places:"Town buildings",homeSuffix:"'s home"},
    ja:{automatic:"自宅または自動選択",homes:"キャラクターの家",places:"村の建物",homeSuffix:"の家"},
    ko:{automatic:"내 집 또는 자동 선택",homes:"캐릭터의 집",places:"마을의 건물",homeSuffix:"의 집"}
  }[state.uiLanguage]||{automatic:"내 집 또는 자동 선택",homes:"캐릭터의 집",places:"마을의 건물",homeSuffix:"의 집"};
  const current=item.visitHomeId?`home:${item.visitHomeId}`:item.placeId?`place:${item.placeId}`:"";
  const homeOptions=Object.values(state.homes||{}).map(home=>{
    const town=state.towns.find(value=>value.id===home.townId);
    const residents=state.order.map(id=>state.characters[id]).filter(character=>character&&(character.homeId===home.id||(character.residences||[]).some(residence=>residence.homeId===home.id)));
    const owner=residents.map(character=>character.name).filter(Boolean).join(" · "),name=owner?`${owner}${labels.homeSuffix}`:(home.name||labels.homes);
    return `<option value="home:${htmlEsc(home.id)}" ${current===`home:${home.id}`?"selected":""}>${htmlEsc(town?.name||"")} · ${htmlEsc(name)}</option>`;
  }).join("");
  const placeOptions=state.towns.flatMap(town=>(town.id===state.activeTownId?state.world.places:town.places).map(place=>`<option value="place:${htmlEsc(place.id)}" ${current===`place:${place.id}`?"selected":""}>${htmlEsc(town.name)} · ${htmlEsc(place.name)}</option>`)).join("");
  return `<option value="" ${current?"":"selected"}>${labels.automatic}</option>${homeOptions?`<optgroup label="${labels.homes}">${homeOptions}</optgroup>`:""}${placeOptions?`<optgroup label="${labels.places}">${placeOptions}</optgroup>`:""}`;
}
function routineDestinationPatch(dialog){
  const destination=dialog.querySelector("[name=destination]")?.value||"";
  return {placeId:destination.startsWith("place:")?destination.slice(6):"",visitHomeId:destination.startsWith("home:")?destination.slice(5):""};
}

let activeRoutineSheet=null;
function closeRoutineSheet(sheet,result="cancel",afterClose){
  if(!sheet||sheet.classList.contains("is-closing"))return;
  sheet.classList.add("is-closing");
  sheet.querySelector(".routine-bottom-sheet")?.setAttribute("aria-hidden","true");
  setTimeout(()=>{
    if(activeRoutineSheet===sheet)activeRoutineSheet=null;
    sheet.remove();
    afterClose?.(result);
  },240);
}
function openRoutineSheet(className,title,body){
  activeRoutineSheet?.remove();
  const sheet=document.createElement("div");
  sheet.className=`routine-sheet-backdrop ${className||""}`;
  sheet.dataset.routineSheet="";
  sheet.innerHTML=`<section class="routine-bottom-sheet" role="dialog" aria-modal="true" aria-label="${htmlEsc(title)}"><div class="routine-sheet-handle" aria-hidden="true"></div><form><h2>${htmlEsc(title)}</h2>${body}</form></section>`;
  translateDynamicInterface(sheet);document.body.append(sheet);activeRoutineSheet=sheet;
  requestAnimationFrame(()=>sheet.classList.add("is-open"));
  sheet.addEventListener("pointerdown",event=>{if(event.target===sheet)closeRoutineSheet(sheet)});
  sheet.addEventListener("keydown",event=>{if(event.key==="Escape"){event.preventDefault();closeRoutineSheet(sheet)}});
  return sheet;
}
window.addEventListener("drawer-village-native-back",event=>{
  if(!activeRoutineSheet)return;
  event.preventDefault();closeRoutineSheet(activeRoutineSheet);
});
function routineGroupShortcuts(excludedId){
  const groups=(state.characterGroups||[]).filter(group=>(group.memberIds||[]).some(id=>id!==excludedId&&state.characters[id]));
  if(!groups.length)return "";
  return `<div class="routine-group-shortcuts"><small>그룹으로 빠르게 선택</small><div>${groups.map(group=>`<button type="button" data-routine-group="${htmlEsc(group.id)}">${htmlEsc(group.name)}</button>`).join("")}</div></div>`;
}
function wireRoutineGroupShortcuts(sheet,excludedId){
  sheet.querySelectorAll("[data-routine-group]").forEach(button=>button.onclick=()=>{
    const members=(state.characterGroups||[]).find(group=>group.id===button.dataset.routineGroup)?.memberIds?.filter(id=>id!==excludedId&&state.characters[id])||[];
    const boxes=members.map(id=>sheet.querySelector(`[name="withId"][value="${CSS.escape(id)}"]`)).filter(Boolean),select=!boxes.length?false:!boxes.every(box=>box.checked);
    boxes.forEach(box=>{box.checked=select});button.classList.toggle("on",select);
  });
}

function openRoutineDialog(id,draft=null){
  const c=active(),item=draft||state.routines[c.id]?.find(r=>r.id===id);if(!item)return;
  const isNew=Boolean(draft),seriesId=String(item.seriesId||item.id),series=isNew?[item]:(state.routines[c.id]||[]).filter(r=>String(r.seriesId||r.id)===seriesId),selectedDays=new Set(series.map(r=>Number(r.day)));
  const dialog=openRoutineSheet("weekly-routine-sheet","주간 일정 편집",`
    <fieldset class="routine-day-picker"><legend>반복할 요일 · 여러 개 선택 가능</legend><div class="routine-day-presets"><button type="button" data-routine-day-preset="weekdays">평일</button><button type="button" data-routine-day-preset="weekend">주말</button><button type="button" data-routine-day-preset="everyday">매일</button><button type="button" data-routine-day-preset="clear">선택 해제</button></div><div class="routine-day-pills">${weekdayLabels().map((day,index)=>`<label><input type="checkbox" name="day" value="${index}" ${selectedDays.has(index)?"checked":""}><span>${day}</span></label>`).join("")}</div><small data-routine-day-summary>같은 시간과 내용의 일정을 선택한 모든 요일에 한 번에 적용해요.</small></fieldset>
    <label>시작 시각<input type="time" name="start" value="${item.start}"></label>
    <label>종료 시각<input type="time" name="end" value="${item.end}"></label>
    <label>일정 종류<select name="type">${["회사 일정","수업","데이트","친구 약속","가족 일정","병원","운동","취미","개인 일정","휴식"].map(type=>`<option ${item.type===type?"selected":""}>${type}</option>`).join("")}</select></label>
    <label>일정 이름<input name="title" value="${htmlEsc(item.title)}"></label>
    <label>장소<select name="destination">${routineDestinationOptions(item)}</select></label>
    ${routineGroupShortcuts(c.id)}<fieldset class="group-members"><legend>함께하는 캐릭터</legend>${state.order.filter(id=>id!==c.id).map(cid=>`<label><input type="checkbox" name="withId" value="${cid}" ${(item.withIds||[]).includes(cid)?"checked":""}> ${state.characters[cid].name}</label>`).join("")}</fieldset>
    <label>메모<textarea name="notes">${htmlEsc(item.notes||"")}</textarea></label>
    <div class="routine-sheet-actions"><button type="button" data-routine-cancel>취소</button><button type="button" class="primary" data-routine-save>저장</button></div>`);
  const updateDaySummary=()=>{const days=[...dialog.querySelectorAll('[name="day"]:checked')].map(input=>weekdayLabels()[Number(input.value)]);dialog.querySelector('[data-routine-day-summary]').textContent=days.length?`선택됨: ${days.join(" · ")}`:"요일을 하나 이상 선택해 주세요."};
  dialog.querySelectorAll('[data-routine-day-preset]').forEach(button=>button.onclick=()=>{const preset=button.dataset.routineDayPreset,values=preset==="weekdays"?[1,2,3,4,5]:preset==="weekend"?[0,6]:preset==="everyday"?[0,1,2,3,4,5,6]:[];dialog.querySelectorAll('[name="day"]').forEach(input=>input.checked=values.includes(Number(input.value)));updateDaySummary()});
  dialog.querySelectorAll('[name="day"]').forEach(input=>input.onchange=updateDaySummary);
  updateDaySummary();wireRoutineGroupShortcuts(dialog,c.id);
  dialog.querySelector("[data-routine-cancel]").onclick=()=>closeRoutineSheet(dialog);
  dialog.querySelector("[data-routine-save]").onclick=()=>{
    const days=[...dialog.querySelectorAll('[name="day"]:checked')].map(input=>Number(input.value));
    if(!days.length){showToast("일정을 적용할 요일을 하나 이상 골라 주세요");return}
    if(isNew){state.routines[c.id]=Array.isArray(state.routines[c.id])?state.routines[c.id]:[];state.routines[c.id].push(item)}
    const saved=updateRoutineDays(c.id,item.id,days,{start:dialog.querySelector("[name=start]").value,end:dialog.querySelector("[name=end]").value,type:dialog.querySelector("[name=type]").value,title:dialog.querySelector("[name=title]").value.trim()||"일정",...routineDestinationPatch(dialog),withIds:[...dialog.querySelectorAll("[name=withId]:checked")].map(x=>x.value),notes:dialog.querySelector("[name=notes]").value.trim()});
    if(saved)closeRoutineSheet(dialog,"save",()=>render());
  };
}

function openMonthlyRoutineDialog(id,draft=null){
  const c=active(),item=draft||state.monthlyRoutines?.[c.id]?.find(r=>r.id===id);if(!item)return;
  const isNew=Boolean(draft);
  const dialog=openRoutineSheet("monthly-routine-sheet","월간 일정 편집",`
    <label>날짜<input type="date" name="date" value="${item.date}"></label>
    <label>시작 시각<input type="time" name="start" value="${item.start}"></label>
    <label>종료 시각<input type="time" name="end" value="${item.end}"></label>
    <label>일정 종류<select name="type">${["회사 일정","수업","데이트","친구 약속","가족 일정","병원","운동","취미","개인 일정","휴식"].map(type=>`<option ${item.type===type?"selected":""}>${type}</option>`).join("")}</select></label>
    <label>일정 이름<input name="title" value="${htmlEsc(item.title)}"></label>
    <label>장소<select name="destination">${routineDestinationOptions(item)}</select></label>
    ${routineGroupShortcuts(c.id)}<fieldset class="group-members"><legend>함께하는 캐릭터</legend>${state.order.filter(id=>id!==c.id).map(cid=>`<label><input type="checkbox" name="withId" value="${cid}" ${(item.withIds||[]).includes(cid)?"checked":""}><span>${state.characters[cid].name}</span></label>`).join("")}</fieldset>
    <label>메모<textarea name="notes">${htmlEsc(item.notes||"")}</textarea></label>
    <div class="routine-sheet-actions"><button type="button" data-routine-cancel>취소</button><button type="button" class="primary" data-routine-save>저장</button></div>`);
  wireRoutineGroupShortcuts(dialog,c.id);
  dialog.querySelector("[data-routine-cancel]").onclick=()=>closeRoutineSheet(dialog);
  dialog.querySelector("[data-routine-save]").onclick=()=>{
    if(!dialog.querySelector("[name=date]").value){showToast("날짜를 선택해 주세요");return}
    if(isNew){state.monthlyRoutines[c.id]=Array.isArray(state.monthlyRoutines[c.id])?state.monthlyRoutines[c.id]:[];state.monthlyRoutines[c.id].push(item)}
    updateMonthlyRoutine(c.id,item.id,{date:dialog.querySelector("[name=date]").value,start:dialog.querySelector("[name=start]").value,end:dialog.querySelector("[name=end]").value,type:dialog.querySelector("[name=type]").value,title:dialog.querySelector("[name=title]").value.trim()||"일정",...routineDestinationPatch(dialog),withIds:[...dialog.querySelectorAll("[name=withId]:checked")].map(x=>x.value),notes:dialog.querySelector("[name=notes]").value.trim()});
    closeRoutineSheet(dialog,"save",()=>render());
  };
}

const ANNIVERSARY_TYPES=["첫 만남","연애 시작","결혼","가족이 된 날","함께 살기 시작한 날","이사","입학·졸업","입사·창업","반려생물과 만난 날","추모일","사용자 지정"];
function openAnniversaryDialog(id=""){
  const existing=(state.anniversaries||[]).find(item=>item.id===id),item=existing||{id:newId(),date:"0101",type:"첫 만남",title:"",characterId:active().id,targetId:"",notes:""};
  const month=Math.max(1,Math.min(12,Number(String(item.date||"0101").slice(0,2))||1)),day=Math.max(1,Math.min(31,Number(String(item.date||"0101").slice(2,4))||1));
  const monthLabel=value=>state.uiLanguage==="en"?new Intl.DateTimeFormat("en",{month:"long"}).format(new Date(2024,value-1,1)):state.uiLanguage==="ja"?`${value}月`:`${value}월`;
  const dayLabel=value=>state.uiLanguage==="ja"?`${value}日`:state.uiLanguage==="en"?String(value):`${value}일`;
  const dayOptions=(selectedMonth,selectedDay)=>Array.from({length:new Date(2024,selectedMonth,0).getDate()},(_,index)=>index+1).map(value=>`<option value="${value}" ${value===selectedDay?"selected":""}>${dayLabel(value)}</option>`).join("");
  const dialog=openRoutineSheet("anniversary-routine-sheet",existing?"기념일 편집":"기념일 추가",`<fieldset class="anniversary-date-fields"><legend>날짜 · 매년 반복</legend><label>월<select name="month">${Array.from({length:12},(_,index)=>index+1).map(value=>`<option value="${value}" ${value===month?"selected":""}>${monthLabel(value)}</option>`).join("")}</select></label><label>일<select name="day">${dayOptions(month,day)}</select></label></fieldset><label>기념일 유형<select name="type">${ANNIVERSARY_TYPES.map(type=>`<option ${item.type===type?"selected":""}>${type}</option>`).join("")}</select></label><label>표시할 이름<input name="title" maxlength="80" value="${htmlEsc(item.title||"")}" placeholder="비우면 기념일 유형으로 표시"></label><label>연락을 보낼 캐릭터<select name="characterId">${state.order.map(characterId=>`<option value="${characterId}" ${item.characterId===characterId?"selected":""}>${htmlEsc(state.characters[characterId]?.name||"")}</option>`).join("")}</select></label><label>함께 기념할 캐릭터<select name="targetId"><option value="">선택하지 않음</option>${state.order.map(characterId=>`<option value="${characterId}" ${item.targetId===characterId?"selected":""}>${htmlEsc(state.characters[characterId]?.name||"")}</option>`).join("")}</select></label><label>메모<textarea name="notes">${htmlEsc(item.notes||"")}</textarea></label><div class="routine-sheet-actions">${existing?'<button type="button" class="danger" data-delete-anniversary>삭제</button>':""}<button type="button" data-routine-cancel>취소</button><button type="button" class="primary" data-routine-save>저장</button></div>`);
  dialog.querySelector("[name=month]").onchange=event=>{const daySelect=dialog.querySelector("[name=day]"),current=Math.min(Number(daySelect.value)||1,new Date(2024,Number(event.currentTarget.value),0).getDate());daySelect.innerHTML=dayOptions(Number(event.currentTarget.value),current)};
  dialog.querySelector("[data-routine-cancel]").onclick=()=>closeRoutineSheet(dialog);
  dialog.querySelector("[data-delete-anniversary]")?.addEventListener("click",()=>{if(confirm("이 기념일을 삭제하시겠습니까?")){state.anniversaries=(state.anniversaries||[]).filter(entry=>entry.id!==item.id);save(true);closeRoutineSheet(dialog,"delete",()=>render())}});
  dialog.querySelector("[data-routine-save]").onclick=()=>{
    const date=`${String(dialog.querySelector("[name=month]").value).padStart(2,"0")}${String(dialog.querySelector("[name=day]").value).padStart(2,"0")}`;
    Object.assign(item,{date,type:dialog.querySelector("[name=type]").value,title:dialog.querySelector("[name=title]").value.trim(),characterId:dialog.querySelector("[name=characterId]").value,targetId:dialog.querySelector("[name=targetId]").value,notes:dialog.querySelector("[name=notes]").value.trim()});
    if(!existing){state.anniversaries=Array.isArray(state.anniversaries)?state.anniversaries:[];state.anniversaries.push(item)}
    state.order.forEach(characterId=>{if(state.characters[characterId])state.characters[characterId].timelineResetAt=Date.now()});save(true);queueCharacterNotificationSchedule();closeRoutineSheet(dialog,"save",()=>render());
  };
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
  dialog.innerHTML=`<form method="dialog"><div class="title"><div><h2>${old?"관계 편집":"관계 추가"}</h2><p>함께할 캐릭터와 관계 종류부터 정해 주세요.</p></div><button value="cancel">×</button></div>
    <section class="relationship-basic-settings relation-official-basic"><div class="settings-section-heading compact"><span><small>BASIC RELATIONSHIP</small><h3>기본 설정</h3></span><p>관계를 만드는 데 꼭 필요한 항목만 보여요.</p></div>
    <fieldset class="relation-member-picker"><legend>관계에 포함할 캐릭터 · 두 명 이상</legend><div>${characterChecks("member",oldMembers.length?oldMembers:[state.activeId,state.order.find(cid=>cid!==state.activeId)].filter(Boolean))}</div><small>여기서 바로 캐릭터를 더하거나 뺄 수 있어요. 여러 명의 연인·부부 관계도 가능해요.</small></fieldset>
    <label>관계 종류<select name="type">${RELATION_TYPES.map(type=>`<option value="${type}">${type}</option>`).join("")}</select><small class="relation-type-help" data-relation-type-help></small></label>
    <label><span data-stage-label>현재 관계 단계</span><select name="stage"></select></label></section>
    <details class="settings-advanced-group relation-official-advanced"><summary><span><small>DETAILS</small><b>고급 설정</b><em>과거 관계·표시 순서·가족 역할·공개 범위·동거</em></span><i aria-hidden="true">＋</i></summary><div class="settings-advanced-body">
    <label class="relation-temporal"><input type="checkbox" name="temporalStatus" value="past" ${old?.temporalStatus==="past"?"checked":""}><span><b>과거의 관계</b><small>체크하면 ‘헤어진 연인·이혼한 부부·절연한 친구’처럼 바뀝니다.</small></span></label>
    <section class="relation-order-control"><b>관계 구성원 표시 순서</b><span data-relation-order-label></span><div class="relation-member-order-list" data-relation-member-order-list></div><button type="button" data-swap-relation-order>↔ 두 사람 좌우 바꾸기</button><small>두 명 관계의 왼쪽·오른쪽과 여러 명이 함께 만날 때의 배치를 이 순서대로 유지해요.</small></section>
    <fieldset class="parent-direction" hidden><legend>선택한 구성원의 부모와 자녀 역할</legend><div class="parent-columns"><section><b>엄마 역할 · 여러 명 가능</b><div>${characterChecks("mother",oldMothers)}</div></section><section><b>아빠 역할 · 여러 명 가능</b><div>${characterChecks("father",oldFathers)}</div></section><span>→</span><section><b>자녀 · 여러 명 가능</b><div>${characterChecks("child",oldChildren)}</div></section></div><div class="parent-kinship-grid" data-parent-kinship></div><small>위에서 선택한 관계 구성원만 표시됩니다. 부모와 자녀 조합마다 혈연 여부를 따로 정할 수 있어요.</small></fieldset>
    <fieldset class="sibling-direction" hidden><legend>선택한 구성원의 형제·자매 순서와 혈연</legend><div class="sibling-role-list">${state.order.map((cid,index)=>`<label data-role-character="${cid}"><b>${state.characters[cid].name}</b><span>순서<select name="siblingOrder" data-sibling-id="${cid}">${state.order.map((_,order)=>`<option value="${order+1}" ${(old?.siblingOrder?.[cid]||index+1)===order+1?"selected":""}>${order+1}번째</option>`).join("")}</select></span></label>`).join("")}</div><div class="sibling-kinship-grid" data-sibling-kinship></div><small>혈연은 사람 한 명이 아니라 두 사람의 조합마다 정합니다. 셋이 모두 비혈연이면 성별 구성에 따라 의형제·의자매·의남매로 표시돼요.</small></fieldset>
    <fieldset class="past-fault" hidden><legend>관계가 끝난 책임과 이유</legend><label>주된 책임이 있는 쪽<select name="faultParty"></select></label><label>무슨 일이 있었나요?<select name="faultReason">${FAULT_REASONS.map(value=>`<option ${old?.faultReason===value?"selected":""}>${value}</option>`).join("")}</select></label><small>속마음이나 호감과는 별개예요. 관계가 끝난 사건과 이후 장면의 긴장에 사용됩니다.</small></fieldset>
    <label class="relation-officiality">관계가 밖에서 다뤄지는 방식<select name="legalStatus">${["관계를 따로 명명하지 않음","당사자끼리만 관계를 인정함","가까운 사람에게만 알림","누구에게나 공개함","법적으로 관계가 등록됨"].map(value=>`<option>${value}</option>`).join("")}</select><small data-officiality-help>감정을 뜻하는 항목이 아니에요. 맨 위는 밖에서 관계 이름을 쓰지 않는 상태이고, 아래로 갈수록 공개 범위가 넓어집니다.</small></label>
    <label class="cohabit"><input type="checkbox" name="cohabit"> 함께 살기</label>
    <label class="cohabit relation-stay-together"><input type="checkbox" name="stayTogether"><span><b>함께 다니기</b><small>둘 다 별도 일정이 없을 때 같은 장소에서 함께 행동하고, 생활 로그에도 함께 표시해요.</small></span></label>
    <p class="hint">공식 관계와 관계 단계, 각 캐릭터의 성격과 신체 접촉 반응을 함께 분석해 상호작용을 자동으로 만들어요.</p></div></details>
    <div><button value="cancel">취소</button><button class="primary" value="save">저장</button></div>
  </form>`;
  document.body.append(dialog);const f=dialog.querySelector("form");
  let memberOrder=Array.isArray(old?.displayOrder)&&old.displayOrder.length===oldMembers.length
    ?[...old.displayOrder]:[...oldMembers];
  const checkedMembers=()=>[...f.querySelectorAll('[name="member"]:checked')].map(input=>input.value);
  const syncPairOrder=()=>{
    const selected=checkedMembers();
    memberOrder=[...memberOrder.filter(member=>selected.includes(member)),...selected.filter(member=>!memberOrder.includes(member))];
    const orderAvailable=selected.length>=2&&!["부모·자녀","형제·자매"].includes(f.type.value);
    f.querySelector(".relation-order-control").hidden=!orderAvailable;
    f.querySelector("[data-relation-order-label]").textContent=orderAvailable?memberOrder.map(id=>state.characters[id]?.name||"").join(" × "):"구성원을 두 명 이상 선택하면 순서를 정할 수 있어요.";
    const list=f.querySelector("[data-relation-member-order-list]");
    if(list)list.innerHTML=memberOrder.map((id,index)=>`<span>${miniAvatar(id)}<b>${state.characters[id]?.name||""}</b><button type="button" data-relation-order-move="${id}" data-direction="-1" ${index===0?"disabled":""}>←</button><button type="button" data-relation-order-move="${id}" data-direction="1" ${index===memberOrder.length-1?"disabled":""}>→</button></span>`).join("");
    const swap=f.querySelector("[data-swap-relation-order]");
    if(swap)swap.hidden=memberOrder.length!==2;
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
  const refreshStages=()=>{refreshTemporalLabels();const values=stagesFor(f.type.value,temporalStatus()),selected=old?.stage&&values.includes(old.stage)?old.stage:values[0];f.stage.innerHTML=values.map(value=>`<option ${value===selected?"selected":""}>${value}</option>`).join("")};
  const relationTypeHelp={
    "부모·자녀":"누가 부모이고 누가 자녀인지 역할이 있는 관계예요. 혈연·입양·법적 등록 여부는 아래 공개·공적 기록 항목으로 따로 정합니다.",
    "형제·자매":"선택한 구성원마다 첫째·둘째 순서와 혈연·이복·이부·비혈연 여부를 따로 정하는 관계예요.",
    동거인:"같은 집에서 생활을 공유하는 관계예요. 거의 모르는 사이부터 친구, 유사가족 같은 동거인까지 단계로 표현합니다."
  };
  const updateType=()=>{
    refreshStages();
    const parent=f.type.value==="부모·자녀",sibling=f.type.value==="형제·자매";
    const advanced=f.querySelector(".relation-official-advanced");
    if(advanced&&(parent||sibling))advanced.open=true;
    f.querySelector(".parent-direction").hidden=!parent;
    f.querySelector(".sibling-direction").hidden=!sibling;
    f.querySelector(".relation-member-picker").hidden=false;
    f.querySelector("[data-relation-type-help]").textContent=relationTypeHelp[f.type.value]||"두 사람 사이를 밖에서 어떤 관계라고 부르는지 정합니다. 속마음과 신뢰는 캐릭터별 시선에서 따로 설정해요.";
    f.querySelector("[data-officiality-help]").textContent=["부모·자녀","형제·자매"].includes(f.type.value)?"마지막 ‘법적으로 관계가 등록됨’은 가족관계·입양처럼 이 가족 역할이 공적 서류에 기록된 경우예요. 혈연 여부와는 별개입니다.":"맨 위는 밖에서 관계 이름을 쓰지 않는 상태이고, 아래로 갈수록 공개 범위가 넓어집니다. 마지막은 이 관계와 관련된 공적 서류가 있는 경우예요.";
    if(f.type.value==="동거인")f.cohabit.checked=true;
    f.cohabit.disabled=f.type.value==="동거인";
    const married=f.type.value==="부부";
    if(married)f.legalStatus.value="법적으로 관계가 등록됨";
    f.legalStatus.disabled=married;
    syncPairOrder();
    refreshFaultParties();
  };
  const officialityMigration={"법적으로 명시되지 않음":"관계를 따로 명명하지 않음","외부에는 숨김":"당사자끼리만 관계를 인정함","당사자 사이에서만 인정함":"당사자끼리만 관계를 인정함","남들 앞에서도 공개함":"누구에게나 공개함","법적으로 가족임":"법적으로 관계가 등록됨","법적으로 보호 관계임":"법적으로 관계가 등록됨"};
  f.type.value=old?.type==="폴리 관계"?"연인":old?.type==="절친"||old?.type==="대학 동기"||old?.type==="젊은 날의 친구들"?"친구":["유사가족","가족","보호·피보호"].includes(old?.type)?"동거인":old?.type||"친구";
  f.legalStatus.value=f.type.value==="부부"?"법적으로 관계가 등록됨":officialityMigration[old?.legalStatus]||old?.legalStatus||"가까운 사람에게만 알림";
  updateType();f.type.onchange=updateType;f.cohabit.checked=Boolean(old?.cohabit);f.stayTogether.checked=Boolean(old?.stayTogether);
  f.querySelectorAll('[name="member"]').forEach(input=>input.onchange=syncPairOrder);
  f.querySelectorAll('[name="temporalStatus"]').forEach(input=>input.onchange=()=>{refreshStages();refreshFaultParties()});
  f.querySelectorAll('[name="mother"],[name="father"],[name="child"]').forEach(input=>input.onchange=refreshParentKinship);
  f.querySelector("[data-swap-relation-order]").onclick=()=>{if(memberOrder.length===2){memberOrder.reverse();syncPairOrder()}};
  f.querySelector("[data-relation-member-order-list]").onclick=event=>{
    const button=event.target.closest("[data-relation-order-move]");if(!button)return;
    const index=memberOrder.indexOf(button.dataset.relationOrderMove),next=index+Number(button.dataset.direction);
    if(index<0||next<0||next>=memberOrder.length)return;
    [memberOrder[index],memberOrder[next]]=[memberOrder[next],memberOrder[index]];
    syncPairOrder();
  };
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
        const hostile=f.type.value==="혐관",base={type:f.type.value,temporalStatus:temporal,stage:f.stage.value,faultParty:temporal==="past"?f.faultParty.value:"",faultReason:temporal==="past"?f.faultReason.value:"",legalStatus:f.type.value==="부부"?"법적으로 관계가 등록됨":f.legalStatus.value,kinshipByPair,siblingOrder,siblingKinshipByPair,interactions:old?.interactions||[],interactionsAll:Boolean(old?.interactionsAll),cohabit:f.cohabit.checked||f.type.value==="동거인",stayTogether:f.stayTogether.checked&&temporal!=="past",intimacy:hostile?Math.round(35+ratio*30):Math.round(ratio*100),conflict:hostile?Math.round(100-ratio*55):Math.round((1-ratio)*75),updatedAt:Date.now()};
        if(old?.groupId)Object.values(state.relationships).filter(r=>r.groupId===old.groupId).forEach(r=>deleteRelationship(r.id));
        else if(old&&(f.type.value==="부모·자녀"||members.length!==2))deleteRelationship(id);
        if(f.type.value==="부모·자녀"){
          const groupId=parentPairs.length>1?`family-${Date.now()}`:"";
          parentPairs.forEach(([parent,child,parentRole])=>addRelationship({...base,a:parent,b:child,parentId:parent,childId:child,parentRole,kinship:kinshipByPair[kinshipKey(parent,child)]||"blood",directional:true,groupId,groupMembers:[...new Set([...mothers,...fathers,...children])]}));
        }else if(members.length===2){
          const ordered=memberOrder.length===2&&memberOrder.every(member=>members.includes(member))?memberOrder:members;
          const patch={...base,a:ordered[0],b:ordered[1],displayOrder:[...ordered],directional:false,groupId:"",groupMembers:[]};
          old&&!old.groupId&&state.relationships[id]?updateRelationship(id,patch):addRelationship(patch);
        }
        else{
          const groupId=`group-${members.slice().sort().join("-")}-${Date.now()}`;
          const ordered=memberOrder.length===members.length&&memberOrder.every(member=>members.includes(member))?memberOrder:members;
          for(let i=0;i<members.length;i++)for(let j=i+1;j<members.length;j++)addRelationship({...base,a:members[i],b:members[j],groupId,groupMembers:[...members],displayOrder:[...ordered]});
        }
        render();explicitSave("관계 저장");
      }
    }
    dialog.remove();
  };
  dialog.showModal();
}

function bindPlaceDrag(){
  const mobile=document.documentElement.classList.contains("native-app");
  const editing=document.querySelector(".mobile-town-shell")?.classList.contains("editing");
  if(mobile&&!editing)return;
  $$(".town-edit .place").forEach(el=>el.onpointerdown=e=>{
    e.preventDefault();
    let moved=false;
    const pointerStart={x:e.clientX,y:e.clientY};
    const startRect=el.getBoundingClientRect();
    const grabX=(e.clientX-(startRect.left+startRect.width/2))/startRect.width;
    const grabY=(e.clientY-(startRect.top+startRect.height/2))/startRect.height;
    el.setPointerCapture(e.pointerId);
    el.classList.add("dragging");
    el.onpointermove=ev=>{
      if(Math.hypot(ev.clientX-pointerStart.x,ev.clientY-pointerStart.y)>5)moved=true;
      const box=el.parentElement.getBoundingClientRect();
      const currentRect=el.getBoundingClientRect();
      const x=Math.max(4,Math.min(96,(ev.clientX-grabX*currentRect.width-box.left)/box.width*100));
      const y=Math.max(5,Math.min(95,(ev.clientY-grabY*currentRect.height-box.top)/box.height*100));
      const homeId=el.dataset.homeMap,placeId=el.dataset.place;
      if(homeId)moveHomeOnTown(homeId,x,y,false);else movePlace(placeId,x,y,false);
      const target=homeId?state.homes[homeId]:state.world.places.find(item=>item.id===placeId);
      if(target){el.style.left=(homeId?target.mapX:target.x)+"%";el.style.top=(homeId?target.mapY:target.y)+"%"}
    };
    const finish=()=>{
      el.onpointermove=null;
      el.classList.remove("dragging");
      save();
      if(!moved){
        if(mobile&&el.dataset.place){
          setMobileTownPanel(el.dataset.place);
          render();
        }else{
          const detailKey=el.dataset.homeMap?`home:${el.dataset.homeMap}`:el.dataset.place;
          const dialog=document.querySelector(`[data-building-detail-dialog="${CSS.escape(detailKey)}"]`);
          if(dialog&&!dialog.open)dialog.showModal();
        }
      }
    };
    el.onpointerup=finish;el.onpointercancel=finish;
  });
}

window.ParallelCity={
  getState:cloneState,
  replaceState:x=>{
    const view={activeTab:state.activeTab,characterPane:state.characterPane,activeId:state.activeId,activeHomeId:state.activeHomeId,activeTownId:state.activeTownId};
    replaceState(x);
    setNavigationTabIntent(view.activeTab);
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

window.addEventListener("drawer-village-cloud-loaded",()=>{
  // The onboarding/setup dialogs live directly under <body>, so replacing the
  // app view after a cloud download does not remove them. Close only those
  // stale first-run dialogs and paint the downloaded village immediately.
  document.querySelectorAll(".onboarding-dialog,.setup-coach-dialog").forEach(dialog=>{
    try{if(dialog.open)dialog.close()}catch(error){console.warn("동기화 뒤 안내 창을 닫지 못했습니다",error)}
    dialog.remove();
  });
  if(state.order.length)localStorage.setItem(ONBOARDING_KEY,"done");
  render();
  if(state.characterNotificationsEnabled&&characterNotificationsAvailable())setTimeout(syncCharacterNotificationSchedule,1000);
});
window.addEventListener("drawer-village-guide-state",()=>requestAnimationFrame(maybeShowPageGuide));
window.addEventListener("drawer-village-storage-usage",()=>{if(state.activeTab==="settings")render()});
window.addEventListener("parallel-city-cloud-loaded",render);
window.addEventListener("beforeinstallprompt",event=>{event.preventDefault();deferredInstallPrompt=event;showInstallButton()});
window.addEventListener("appinstalled",()=>{deferredInstallPrompt=null;document.querySelector("#install-drawer-village")?.remove();showToast("서랍마을 앱이 설치되었습니다")});
window.addEventListener("popstate",event=>{
  const tab=event.state?.drawerVillageTab;
  if(APP_TABS.includes(tab))navigateToTab(tab,{recordHistory:false});
});
window.addEventListener("hashchange",()=>{
  const params=new URLSearchParams(location.hash.replace(/^#/,"")),tab=params.get("tab");
  if(tab==="settings")setSettingsPane(params.get("pane")||"home");
  if(APP_TABS.includes(tab))navigateToTab(tab,{recordHistory:false});
});
const localDateKey=date=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
const atLocalTime=(date,hour,minute=0)=>new Date(date.getFullYear(),date.getMonth(),date.getDate(),hour,minute,0,0).getTime();
const nextSaturdayAt=(date,hour=14)=>{
  const target=new Date(date);let days=(6-date.getDay()+7)%7;
  if(days===0&&date.getHours()>=hour)days=7;
  target.setDate(date.getDate()+days);return atLocalTime(target,hour,0);
};
const relatedTargets=character=>{
  const ids=new Set();
  Object.values(state.relationships||{}).forEach(relation=>{
    if(relation?.temporalStatus==="past")return;
    if(relation.a===character.id&&state.characters[relation.b])ids.add(relation.b);
    if(relation.b===character.id&&state.characters[relation.a])ids.add(relation.a);
  });
  return [...ids].map(id=>state.characters[id]).filter(Boolean);
};
const giftCatalogItems=()=>Object.entries(state.catalog||{}).flatMap(([kind,items])=>(items||[]).filter(item=>item&&item.id&&!['food','drink'].includes(kind)).map(item=>({...item,kind})));
function availableDailyQuestionKinds(character){
  const kinds=["weekend","everyday"];
  if(relatedTargets(character).length&&giftCatalogItems().length)kinds.push("gift");
  const dlcs=window.ParallelCityAuth?.getInfo?.().entitlements?.dlcPacks||[];
  if(dlcs.includes("job_expansion")&&!['','무직','학생'].includes(character.job||""))kinds.push("work");
  return kinds;
}
function ensureDailyQuestionSchedule(now=new Date()){
  const day=localDateKey(now),current=state.dailyQuestion;
  if(current?.day===day)return current;
  const characters=state.order.map(id=>state.characters[id]).filter(Boolean);
  if(!characters.length)return null;
  const character=characters[Math.floor(Math.random()*characters.length)],kinds=availableDailyQuestionKinds(character);
  return setDailyQuestion({day,minute:600+Math.floor(Math.random()*480),characterId:character.id,kind:kinds[Math.floor(Math.random()*kinds.length)],shown:false,answered:false});
}
const questionCopy=language=>({
  ko:{label:"캐릭터가 물어봐요",later:"오늘은 맡길게",weekend:"이번 주말에는 뭘 할까요?",work:"회사에서 무엇부터 할까요?",everyday:"오늘 남는 시간에는 뭘 할까요?",gift:target=>`${target}에게 어떤 선물을 사 줄까요?`,saved:"정한 일정이 캐릭터의 생활에 반영됩니다."},
  en:{label:"A character has a question",later:"Let them decide today",weekend:"What should I do this weekend?",work:"What should I do first at work?",everyday:"What should I do with my free time today?",gift:target=>`What gift should I buy for ${target}?`,saved:"Your choice will appear in the character's actual schedule."},
  ja:{label:"キャラクターからの質問",later:"今日は本人に任せる",weekend:"今週末は何をしよう？",work:"会社では何から始めよう？",everyday:"今日の空き時間は何をしよう？",gift:target=>`${target}へのプレゼントは何にしよう？`,saved:"選んだ予定はキャラクターの実際の生活に反映されます。"}
}[language]||null)||questionCopy("ko");
function everydayOptions(character,now){
  const start=now.getHours()<17?now.getTime()+75*60000:atLocalTime(new Date(now.getFullYear(),now.getMonth(),now.getDate()+1),11,0);
  return [
    {label:{ko:"집에서 좋아하는 취미",en:"Enjoy a favorite hobby at home",ja:"家で好きな趣味を楽しむ"},placeType:"",copy:{ko:{title:"집에서 좋아하는 취미를 즐기는 중",desc:"마을 주인과 정한 대로 필요한 도구를 꺼내 방해받지 않고 취미에 집중하고 있어요."},en:{title:"Enjoying a favorite hobby at home",desc:"They took out the tools they needed and settled into the hobby chosen with the village owner."},ja:{title:"家で好きな趣味を楽しんでいるところ",desc:"村の持ち主と決めた通り、必要な道具を出して趣味に集中しています。"}}},
    {label:{ko:"공원으로 산책",en:"Take a walk in the park",ja:"公園を散歩する"},placeType:"공원",copy:{ko:{title:"공원으로 산책 나온 중",desc:"정해 둔 길을 천천히 걸으며 눈에 띄는 풍경 앞에서 잠깐씩 멈추고 있어요."},en:{title:"Taking a walk in the park",desc:"They are following the chosen path slowly and pausing whenever something catches their eye."},ja:{title:"公園を散歩しているところ",desc:"決めた道をゆっくり歩き、気になる景色の前で時々立ち止まっています。"}}},
    {label:{ko:"저녁 요리 만들기",en:"Cook dinner",ja:"夕食を作る"},placeType:"",copy:{ko:{title:"직접 고른 저녁을 요리하는 중",desc:"먹고 싶은 메뉴를 정하고 재료를 꺼내 순서대로 손질하며 저녁을 만들고 있어요."},en:{title:"Cooking the dinner they chose",desc:"They chose a menu, laid out the ingredients, and are preparing dinner step by step."},ja:{title:"自分で選んだ夕食を作っているところ",desc:"食べたい献立を決め、材料を出して順番に夕食を作っています。"}}}
  ].map(option=>({...option,startAt:start,kind:"everyday",characterId:character.id}));
}
function weekendOptions(character,now){
  const startAt=nextSaturdayAt(now,14);
  return [
    {label:{ko:"카페에서 느긋하게",en:"Relax at a café",ja:"カフェでのんびり"},placeType:"카페",copy:{ko:{title:"카페에서 느긋한 주말을 보내는 중",desc:"창가 자리를 골라 좋아하는 음료를 천천히 마시며 주말 시간을 보내고 있어요."},en:{title:"Spending a slow weekend at a café",desc:"They chose a window seat and are taking their time over a favorite drink."},ja:{title:"カフェでのんびり週末を過ごしているところ",desc:"窓際の席で好きな飲み物をゆっくり楽しんでいます。"}}},
    {label:{ko:"공원에서 긴 산책",en:"Take a long park walk",ja:"公園を長く散歩する"},placeType:"공원",copy:{ko:{title:"공원에서 긴 주말 산책을 하는 중",desc:"평소보다 먼 길을 골라 천천히 걷고 벤치에서 쉬며 시간을 보내고 있어요."},en:{title:"Taking a long weekend walk",desc:"They picked a longer route, walking slowly and taking breaks on park benches."},ja:{title:"公園で週末の長い散歩をしているところ",desc:"いつもより長い道を選び、ベンチで休みながらゆっくり歩いています。"}}},
    {label:{ko:"집에서 완전히 쉬기",en:"Stay home and fully rest",ja:"家でゆっくり休む"},placeType:"",copy:{ko:{title:"주말을 집에서 푹 쉬는 중",desc:"급한 일은 미뤄 두고 편한 옷으로 갈아입은 뒤 좋아하는 것만 곁에 두고 쉬고 있어요."},en:{title:"Resting at home for the weekend",desc:"They put off anything non-urgent, changed into comfortable clothes, and kept only favorite things nearby."},ja:{title:"週末を家でゆっくり休んでいるところ",desc:"急ぎでない用事は後にして、楽な服に着替え、好きな物だけをそばに置いて休んでいます。"}}}
  ].map(option=>({...option,startAt,kind:"weekend",characterId:character.id}));
}
function workOptions(character,now){
  const tomorrow=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1),startAt=atLocalTime(tomorrow,10,0);
  return [
    {label:{ko:"미뤄 둔 핵심 업무",en:"Finish the most important delayed task",ja:"後回しにした重要業務"},copy:{ko:{title:"미뤄 둔 핵심 업무를 끝내는 중",desc:"방해되는 알림을 끄고 필요한 자료만 펼쳐 두고 가장 중요한 업무부터 처리하고 있어요."},en:{title:"Finishing an important delayed task",desc:"They silenced distractions, gathered the necessary files, and started with the most important work."},ja:{title:"後回しにした重要業務を終わらせているところ",desc:"通知を切り、必要な資料だけを広げて重要な仕事から進めています。"}}},
    {label:{ko:"곤란한 동료 도와주기",en:"Help a struggling coworker",ja:"困っている同僚を手伝う"},copy:{ko:{title:"곤란한 동료의 업무를 돕는 중",desc:"자기 업무와 겹치지 않는 범위를 확인한 뒤 동료가 막힌 부분을 함께 살펴보고 있어요."},en:{title:"Helping a coworker with a difficult task",desc:"After checking their own workload, they sat down to work through the coworker's blocker."},ja:{title:"困っている同僚の仕事を手伝っているところ",desc:"自分の業務に支障がない範囲を確認して、同僚が詰まった部分を一緒に見ています。"}}},
    {label:{ko:"정시에 마치고 퇴근",en:"Finish on time and leave work",ja:"定時で仕事を終える"},copy:{ko:{title:"정시 퇴근을 위해 업무를 정리하는 중",desc:"남은 일을 급한 순서대로 마무리하고 내일 할 일은 짧게 기록해 두고 있어요."},en:{title:"Wrapping up for an on-time departure",desc:"They are finishing urgent items first and leaving concise notes for tomorrow."},ja:{title:"定時退勤のため仕事を整理しているところ",desc:"急ぎの仕事から終わらせ、明日の作業を短く記録しています。"}}}
  ].map(option=>({...option,startAt,kind:"work",characterId:character.id,placeType:"사무실"}));
}
function giftOptions(character,target,now){
  const owned=new Set(target.inventory?Object.values(target.inventory).flat():[]),favorites=new Set(target.favorites?Object.values(target.favorites).flat():[]);
  const items=giftCatalogItems().sort((a,b)=>Number(favorites.has(b.id))-Number(favorites.has(a.id))||Number(owned.has(a.id))-Number(owned.has(b.id))).slice(0,3);
  const base=now.getHours()<17?now.getTime():atLocalTime(new Date(now.getFullYear(),now.getMonth(),now.getDate()+1),11,0);
  return items.map((item,index)=>({label:{ko:item.name,en:item.name,ja:item.name},kind:"gift",characterId:character.id,targetId:target.id,itemKind:item.kind,itemId:item.id,buyAt:base+(45+index*10)*60000,giveAt:base+(150+index*10)*60000,copy:{
    ko:{buyTitle:`${item.name}을(를) 사러 가는 중`,buyDesc:`${target.name}에게 줄 ${item.name}을(를) 직접 확인하고 포장을 부탁했어요.`,giveTitle:`${target.name}에게 ${item.name}을(를) 건네는 중`,giveDesc:`${target.name}의 반응을 살피며 직접 고른 ${item.name}을(를) 건넸어요.`,receiveTitle:`${character.name}에게 ${item.name}을(를) 받는 중`,receiveDesc:`포장을 풀어 ${item.name}을(를) 확인하고 ${character.name}에게 고맙다고 말했어요.`},
    en:{buyTitle:`Shopping for ${item.name}`,buyDesc:`They checked the ${item.name} in person and asked for it to be wrapped for ${target.name}.`,giveTitle:`Giving ${item.name} to ${target.name}`,giveDesc:`They watched ${target.name}'s reaction while handing over the carefully chosen ${item.name}.`,receiveTitle:`Receiving ${item.name} from ${character.name}`,receiveDesc:`They unwrapped the ${item.name} and thanked ${character.name}.`},
    ja:{buyTitle:`${item.name}を買いに行っているところ`,buyDesc:`${target.name}に贈る${item.name}を自分で確かめ、包装を頼みました。`,giveTitle:`${target.name}に${item.name}を渡しているところ`,giveDesc:`${target.name}の反応を見ながら、自分で選んだ${item.name}を渡しました。`,receiveTitle:`${character.name}から${item.name}を受け取っているところ`,receiveDesc:`包みを開けて${item.name}を確認し、${character.name}にお礼を言いました。`}
  }}));
}
function openDailyCharacterQuestion(question,now=new Date()){
  const character=state.characters[question.characterId];if(!character)return;
  const language=state.uiLanguage||"ko",copy=questionCopy(language),targets=relatedTargets(character),target=state.characters[question.targetId]||targets[Math.floor(Math.random()*targets.length)];
  let options=question.kind==="weekend"?weekendOptions(character,now):question.kind==="work"?workOptions(character,now):question.kind==="gift"&&target?giftOptions(character,target,now):everydayOptions(character,now);
  if(!options.length)options=everydayOptions(character,now);
  const kind=question.kind==="gift"&&target?"gift":question.kind==="work"?"work":question.kind==="weekend"?"weekend":"everyday";
  const basePrompt=kind==="gift"?copy.gift(target.name):copy[kind];
  const prompt=characterQuestionPrompt(character,{kind,target:target?.name||"",language,base:basePrompt});
  const dialog=document.createElement("dialog"),image=character.icon||character.photo;
  dialog.className="character-question-dialog";
  dialog.innerHTML=`<form method="dialog"><div class="character-question-speaker">${image?`<img src="${htmlEsc(image)}" alt="">`:`<span>${htmlEsc(character.name.slice(0,1))}</span>`}<div><small>${copy.label}</small><b>${htmlEsc(character.name)}</b></div></div><h2>${htmlEsc(prompt)}</h2><p>${copy.saved}</p><div class="character-question-options">${options.map((option,index)=>`<button type="button" data-character-question-option="${index}">${htmlEsc(option.label[language]||option.label.ko)}</button>`).join("")}</div><button value="later" class="character-question-later">${copy.later}</button></form>`;
  dialog.querySelectorAll("[data-character-question-option]").forEach(button=>button.onclick=()=>{
    const option=options[Number(button.dataset.characterQuestionOption)];
    if(scheduleCharacterChoice(option)){dialog.close("answered");showToast(copy.saved);render()}
  });
  dialog.onclose=()=>dialog.remove();document.body.append(dialog);dialog.showModal();
}
const notificationText=(value,language=state.uiLanguage||"ko")=>typeof value==="string"?value:(value?.[language]||value?.ko||"");
const notificationHash=value=>[...String(value)].reduce((total,character)=>Math.imul(total^character.charCodeAt(0),16777619)>>>0,2166136261);
const fillNotificationText=(text,context)=>String(text).replace(/\{(\w+)\}/g,(_,key)=>context[key]||"");
function updateCharacterNotificationControls(){
  const enabled=Boolean(state.characterNotificationsEnabled),button=document.querySelector("[data-character-notification-toggle]"),status=document.querySelector("[data-character-notification-status]");
  if(button){button.textContent=enabled?"알림 끄기":"알림 켜기";button.classList.toggle("danger",enabled);button.classList.toggle("primary",!enabled)}
  if(status)status.textContent=enabled?"알림 사용 중":state.characterNotificationConsent==="granted"?"알림 꺼짐 · 권한은 유지됨":state.characterNotificationConsent==="denied"?"휴대폰에서 알림이 거부됨":"아직 알림을 요청하지 않음";
  document.querySelector("[data-character-notification-test]")?.toggleAttribute("disabled",!enabled);
  translateDynamicInterface(document.querySelector(".character-notification-card")||document.body);
}
const CHARACTER_CONTACT_PHRASES={
  checkins:{
    actions:[
      {ko:"오늘은 어떤 하루였어요? 마음에 오래 남은 순간이 하나 있었나요?",en:"How was your day? Was there one moment that stayed with you?",ja:"今日はどんな一日でしたか？ 心に残った瞬間はありましたか？"},
      {ko:"밥은 챙겨 먹었어요? 아직이라면 너무 늦기 전에 간단한 것이라도 같이 골라요.",en:"Did you get something to eat? If not, let's choose something simple before it gets too late.",ja:"ちゃんと食事はできましたか？ まだなら、遅くなる前に簡単なものでも一緒に選びましょう。"},
      {ko:"지금 기분을 날씨로 말하면 맑음, 흐림, 비 중 어디에 가까워요?",en:"If your mood were weather, would it be sunny, cloudy, or rainy right now?",ja:"今の気分を天気にたとえるなら、晴れ、曇り、雨のどれに近いですか？"},
      {ko:"오늘 한 일 중에서 스스로 잘했다고 말해 줄 수 있는 게 하나 있나요?",en:"Is there one thing you did today that you can give yourself credit for?",ja:"今日したことの中で、自分を褒めてあげられることは一つありますか？"},
      {ko:"지금 물 한 잔 마시고 어깨를 한 번 펴 볼래요? 나는 잠깐 기다리고 있을게요.",en:"Want to drink a glass of water and stretch your shoulders? I'll wait here for a moment.",ja:"水を一杯飲んで、肩を少し伸ばしませんか？ ここで待っています。"}
    ],
    endings:[
      {ko:"길게 답하지 않아도 괜찮아요.",en:"You don't have to give a long answer.",ja:"長く答えなくても大丈夫です。"},
      {ko:"좋았던 일도 힘들었던 일도 그냥 들어 줄게요.",en:"I'll listen, whether it was good or difficult.",ja:"良かったことも大変だったことも、ただ聞きます。"},
      {ko:"지금 대답하기 싫으면 조용히 지나가도 괜찮아요.",en:"If you don't feel like answering now, it's okay to let this pass quietly.",ja:"今は答えたくなければ、そのまま静かに流しても大丈夫です。"}
    ]
  },
  worries:{
    actions:[
      {ko:"해야 할 일은 남았는데 집중이 잘 안 돼요. 10분만 시작할까요, 오늘은 쉬어 갈까요?",en:"I still have things to do, but I can't focus. Should I try for ten minutes or rest for today?",ja:"やることは残っているのに集中できません。10分だけ始めるか、今日は休むか迷っています。"},
      {ko:"{target}에게 먼저 연락할지 조금 더 기다릴지 고민이에요. 당신이라면 어떻게 할래요?",en:"I'm wondering whether to contact {target} first or wait a little longer. What would you do?",ja:"{target}に先に連絡するか、もう少し待つか迷っています。あなたならどうしますか？"},
      {ko:"좋아하는 걸 하며 쉴지 일찍 잘지 고민 중이에요. 지금 내게 더 필요한 건 뭘까요?",en:"I'm torn between relaxing with something I like and going to bed early. Which do I need more?",ja:"好きなことをして休むか、早く寝るか迷っています。今の私に必要なのはどちらでしょう？"},
      {ko:"말을 꺼내면 괜히 분위기를 무겁게 만들까 봐 망설이고 있어요. 짧게라도 솔직히 말해 볼까요?",en:"I'm hesitating because I might make things feel heavy. Should I be honest, even briefly?",ja:"話すと空気を重くしそうで迷っています。短くても正直に伝えてみるべきでしょうか？"}
    ],
    endings:[
      {ko:"정답보다 지금 할 수 있는 쪽을 고르고 싶어요.",en:"I'd rather choose what I can manage now than search for a perfect answer.",ja:"正解より、今できるほうを選びたいです。"},
      {ko:"당장 결정하지 않아도 된다고 말해 줘도 좋아요.",en:"You can also tell me I don't have to decide right away.",ja:"今すぐ決めなくてもいいと言ってくれても大丈夫です。"},
      {ko:"작은 선택 하나만 같이 정해 주세요.",en:"Help me settle just one small choice.",ja:"小さな選択を一つだけ、一緒に決めてください。"}
    ]
  },
  comfort:{
    actions:[
      {ko:"오늘 계획을 다 못 지켜도 괜찮아요. 지금까지 해낸 것만으로도 하루는 충분히 지나왔어요.",en:"It's okay if you didn't finish every plan today. What you've done is already enough for one day.",ja:"今日の予定を全部こなせなくても大丈夫です。ここまでできたことだけで十分な一日です。"},
      {ko:"마음이 복잡하면 답을 바로 정하지 않아도 돼요. 숨부터 천천히 쉬어요.",en:"If your mind feels crowded, you don't have to decide right away. Start with one slow breath.",ja:"気持ちが複雑なら、すぐに答えを決めなくても大丈夫です。まずゆっくり呼吸しましょう。"},
      {ko:"오늘 유난히 지쳤다면 의지가 약한 게 아니라 정말 많이 버틴 걸 수도 있어요.",en:"If you're unusually tired today, it may not be weakness—you may simply have carried a lot.",ja:"今日は特に疲れたなら、意志が弱いのではなく、本当にたくさん耐えたのかもしれません。"},
      {ko:"아무것도 하지 않는 시간도 회복하는 시간이에요. 잠깐 가만히 있어도 괜찮아요.",en:"Time spent doing nothing can still be recovery. It's okay to be still for a while.",ja:"何もしない時間も回復の時間です。少しじっとしていても大丈夫です。"}
    ],
    endings:[
      {ko:"오늘의 당신 편은 여기에도 있어요.",en:"You have someone on your side here today, too.",ja:"今日のあなたの味方は、ここにもいます。"},
      {ko:"조금 나아질 때까지 서두르지 않을게요.",en:"I won't rush you while things get a little easier.",ja:"少し楽になるまで、急かしません。"},
      {ko:"지금은 잘 버티는 것보다 편히 쉬는 게 먼저예요.",en:"Right now, resting matters more than holding everything together.",ja:"今は頑張り続けることより、安心して休むことが先です。"}
    ]
  },
  moments:{
    actions:[
      {ko:"잠깐 숨을 고르며 다음에 할 일을 살펴보고 있어요.",en:"I'm taking a short pause and looking over what comes next.",ja:"少しひと息ついて、次にすることを確認しています。"},
      {ko:"예상보다 일찍 끝난 일이 있어 작은 여유가 생겼어요.",en:"Something finished earlier than expected, so I have a little time to spare.",ja:"予定より早く終わったことがあり、少し余裕ができました。"},
      {ko:"하던 일을 정리하고 주변을 천천히 둘러보는 중이에요.",en:"I'm wrapping up what I was doing and taking a quiet look around.",ja:"していたことを片づけて、周りをゆっくり見ています。"},
      {ko:"오늘 계획에서 하나를 마치고 다음 순서를 고르는 중이에요.",en:"I finished one part of today's plan and I'm choosing what to do next.",ja:"今日の予定を一つ終えて、次の順番を選んでいます。"},
      {ko:"잠시 자리를 옮겨 기분을 환기하고 있어요.",en:"I moved to a different spot for a small change of pace.",ja:"少し場所を変えて気分転換しています。"},
      {ko:"필요한 물건을 챙기고 다음 일정에 나설 준비를 하고 있어요.",en:"I'm gathering what I need and getting ready for the next plan.",ja:"必要な物をそろえて、次の予定に出る準備をしています。"}
    ],
    endings:[
      {ko:"별일은 아니지만 그냥 알려 주고 싶었어요.",en:"Nothing urgent—I just wanted to let you know.",ja:"急ぎではないけれど、ちょっと知らせたくなりました。"},
      {ko:"마을은 지금 꽤 조용해요.",en:"The village is fairly quiet right now.",ja:"村は今、かなり静かです。"},
      {ko:"조금 뒤에는 다른 일을 시작할 것 같아요.",en:"I think I'll start something else in a little while.",ja:"もう少ししたら別のことを始めそうです。"},
      {ko:"오늘의 흐름은 아직 천천히 이어지고 있어요.",en:"The day is still moving at an easy pace.",ja:"今日の流れはまだゆっくり続いています。"}
    ]
  },
  home:{
    actions:[
      {ko:"{home}에서 창문을 열고 방 안 공기를 바꾸고 있어요.",en:"I'm opening a window at {home} to let fresh air in.",ja:"{home}で窓を開けて、部屋の空気を入れ替えています。"},
      {ko:"눈에 띄는 물건 몇 개를 제자리로 돌려놓고 있어요.",en:"I'm putting a few things back where they belong.",ja:"目についた物をいくつか元の場所へ戻しています。"},
      {ko:"편한 자리를 골라 잠깐 쉬고 있어요.",en:"I found a comfortable spot and I'm resting for a moment.",ja:"落ち着く場所を選んで、少し休んでいます。"},
      {ko:"마실 것을 챙겨 가장 익숙한 방으로 돌아왔어요.",en:"I brought something to drink back to my favorite room.",ja:"飲み物を用意して、いちばん慣れた部屋へ戻ってきました。"},
      {ko:"조명이 너무 밝지 않게 맞추고 조용히 시간을 보내고 있어요.",en:"I lowered the lights and I'm spending some quiet time.",ja:"照明を少し落として、静かに過ごしています。"},
      {ko:"내일 필요한 물건을 미리 한곳에 모아 두고 있어요.",en:"I'm gathering tomorrow's things in one place ahead of time.",ja:"明日必要な物を、前もって一か所にまとめています。"}
    ],
    endings:[
      {ko:"집 안이 조금 더 편안해졌어요.",en:"Home feels a little more comfortable now.",ja:"家の中が少し居心地よくなりました。"},
      {ko:"이 정도만 해도 충분할 것 같아요.",en:"I think that's enough for now.",ja:"今はこのくらいで十分そうです。"},
      {ko:"다 끝나면 좋아하는 일을 조금 하려고요.",en:"When I'm done, I want to spend a little time on something I like.",ja:"終わったら、好きなことを少しするつもりです。"},
      {ko:"아무도 재촉하지 않아서 천천히 하고 있어요.",en:"No one is rushing me, so I'm taking my time.",ja:"急かす人もいないので、ゆっくりしています。"}
    ]
  },
  relationships:{
    actions:[
      {ko:"{target}에게 먼저 안부를 물어볼까 생각하고 있어요.",en:"I'm thinking about checking in with {target} first.",ja:"{target}に先に元気か聞いてみようか考えています。"},
      {ko:"{target}와 나눴던 이야기가 문득 다시 떠올랐어요.",en:"Something from my last conversation with {target} came back to me.",ja:"{target}と話したことをふと思い出しました。"},
      {ko:"{target}에게 부담되지 않는 선에서 작은 도움을 줄까 해요.",en:"I might offer {target} a little help without making it a burden.",ja:"{target}の負担にならない程度に、少し手伝おうかと思っています。"},
      {ko:"{target}와 다음에 만날 때 무엇을 이야기할지 생각하고 있어요.",en:"I'm thinking about what to talk about the next time I see {target}.",ja:"次に{target}と会った時、何を話そうか考えています。"},
      {ko:"{target}의 반응을 재촉하지 않고 조금 기다려 보기로 했어요.",en:"I decided to give {target} time instead of rushing for an answer.",ja:"{target}の返事を急かさず、少し待つことにしました。"},
      {ko:"{target}에게 건넬 짧은 말을 몇 번 고쳐 보고 있어요.",en:"I'm revising a short message I want to send to {target}.",ja:"{target}に送る短い言葉を何度か書き直しています。"}
    ],
    endings:[
      {ko:"관계에 맞는 거리를 지키면서 행동하려고요.",en:"I want to act while respecting the distance that fits our relationship.",ja:"関係に合った距離を守りながら行動するつもりです。"},
      {ko:"지금은 거창한 표현보다 작은 행동이 나을 것 같아요.",en:"A small action feels better than a grand gesture right now.",ja:"今は大げさな表現より、小さな行動のほうがよさそうです。"},
      {ko:"상대가 편한 쪽을 먼저 살펴보려고 해요.",en:"I want to consider what feels comfortable for them first.",ja:"まず相手が楽なほうを考えてみます。"},
      {ko:"서두르지 않으면 자연스럽게 기회가 생기겠죠.",en:"If I don't rush, a natural opportunity will probably come.",ja:"急がなければ、自然な機会が来ると思います。"}
    ]
  },
  work:{
    actions:[
      {ko:"{job} 일을 시작하기 전에 가장 급한 것부터 다시 나누고 있어요.",en:"Before starting my {job} work, I'm sorting out what is most urgent.",ja:"{job}の仕事を始める前に、急ぎのものから整理し直しています。"},
      {ko:"집중이 필요한 일 하나를 먼저 끝내려고 알림을 잠시 줄였어요.",en:"I muted distractions so I can finish one task that needs focus.",ja:"集中が必要な仕事を一つ終えるため、通知を少し減らしました。"},
      {ko:"진행 중인 일을 어디까지 했는지 짧게 기록하고 있어요.",en:"I'm making a short note of how far I've gotten with my work.",ja:"進行中の仕事がどこまで進んだか、短く記録しています。"},
      {ko:"막힌 부분을 혼자 더 볼지 도움을 구할지 판단하는 중이에요.",en:"I'm deciding whether to keep working alone or ask for help with a blocker.",ja:"詰まった部分をもう少し一人で見るか、助けを求めるか考えています。"},
      {ko:"오늘 안에 끝낼 일과 내일로 넘길 일을 구분하고 있어요.",en:"I'm separating what must be done today from what can wait until tomorrow.",ja:"今日中に終えることと、明日に回すことを分けています。"},
      {ko:"잠깐 쉬었다가 다시 집중할 수 있도록 자리를 정리했어요.",en:"I tidied my space so I can focus again after a short break.",ja:"少し休んだ後に集中できるよう、周りを整えました。"}
    ],
    endings:[
      {ko:"급하게 끝내기보다는 실수 없이 마치려고요.",en:"I'd rather finish carefully than rush and make a mistake.",ja:"急ぐより、間違えずに終えるつもりです。"},
      {ko:"하나씩 끝내면 생각보다 오래 걸리지는 않을 것 같아요.",en:"It shouldn't take too long if I finish things one at a time.",ja:"一つずつ終えれば、思ったほど時間はかからなさそうです。"},
      {ko:"끝나면 일 생각은 잠시 내려놓으려고 해요.",en:"When it's done, I plan to put work out of mind for a while.",ja:"終わったら、しばらく仕事のことは置いておくつもりです。"},
      {ko:"오늘의 우선순위는 이제 꽤 분명해졌어요.",en:"Today's priorities are much clearer now.",ja:"今日の優先順位がかなりはっきりしました。"}
    ]
  },
  tastes:{
    actions:[
      {ko:"문득 {item} 생각이 나서 오늘 즐길 수 있을지 보고 있어요.",en:"I suddenly thought of {item} and I'm seeing if I can enjoy it today.",ja:"ふと{item}を思い出して、今日楽しめるか考えています。"},
      {ko:"취향 사전에 넣어 둔 {item}을 다시 들여다보고 있어요.",en:"I'm looking back at {item} from the taste collection.",ja:"好み図鑑に入れておいた{item}をもう一度見ています。"},
      {ko:"오늘 기분에는 {item}이 잘 맞을 것 같아요.",en:"{item} feels like it would suit my mood today.",ja:"今日の気分には{item}が合いそうです。"},
      {ko:"비슷한 것들 사이에서 결국 {item} 쪽으로 마음이 가고 있어요.",en:"Among a few similar choices, I keep leaning toward {item}.",ja:"似たものの中でも、やっぱり{item}が気になっています。"},
      {ko:"{item}을 천천히 즐길 시간을 어디에 넣을지 생각 중이에요.",en:"I'm deciding where to make time to enjoy {item} slowly.",ja:"{item}をゆっくり楽しむ時間をどこに入れるか考えています。"},
      {ko:"한동안 잊고 있던 {item}을 다시 꺼내 보고 싶어졌어요.",en:"I feel like returning to {item} after leaving it alone for a while.",ja:"しばらく忘れていた{item}を、また楽しみたくなりました。"}
    ],
    endings:[
      {ko:"좋아하는 건 가끔 다시 확인해도 질리지 않네요.",en:"It never gets old to return to something I like once in a while.",ja:"好きなものは、時々また確かめても飽きませんね。"},
      {ko:"시간이 맞으면 오늘 일정에 살짝 넣어 볼게요.",en:"If the timing works, I'll fit it into today's schedule.",ja:"時間が合えば、今日の予定に少し入れてみます。"},
      {ko:"지금 당장은 아니어도 곧 즐길 수 있으면 좋겠어요.",en:"Even if not right now, I hope I can enjoy it soon.",ja:"今すぐでなくても、近いうちに楽しめたらいいですね。"},
      {ko:"작은 취향 하나가 하루 분위기를 꽤 바꾸는 것 같아요.",en:"One small favorite can change the mood of a whole day.",ja:"小さな好み一つで、一日の雰囲気がかなり変わる気がします。"}
    ]
  }
};
function notificationContextFor(character,seed){
  const home=state.homes[character.homeId]||Object.values(state.homes).find(item=>(item.residentIds||[]).includes(character.id));
  const targets=relatedTargets(character),target=targets[seed%Math.max(1,targets.length)];
  const preferredIds=Object.values(character.favorites||{}).flat(),catalogItems=Object.values(state.catalog||{}).flat().filter(Boolean);
  const item=catalogItems.find(entry=>preferredIds.includes(entry.id))||catalogItems[seed%Math.max(1,catalogItems.length)];
  return {home:home?.name||"집",target:target?.name||"가까운 사람",targetId:target?.id||"",item:item?.name||"좋아하는 것",job:character.jobTitle||character.job||"오늘의"};
}
function notificationSelectedCharacters(){
  const chosen=state.characterNotificationSettings?.characterIds||[],ids=chosen.length?chosen:state.order;
  return ids.map(id=>state.characters[id]).filter(Boolean);
}
function notificationTopicsFor(character){
  const wanted=state.characterNotificationSettings?.contentKinds||["questions","checkins","comfort","lifeLogs"],context=notificationContextFor(character,1);
  return wanted.filter(kind=>kind!=="relationships"||context.targetId).filter(kind=>kind!=="work"||character.job||character.jobTitle);
}
function buildQuestionNotification(character,at,seed){
  const language=state.uiLanguage||"ko",copy=questionCopy(language),context=notificationContextFor(character,seed),kinds=availableDailyQuestionKinds(character);
  const kind=kinds[seed%kinds.length],base=kind==="gift"?copy.gift(context.target):copy[kind],mode=state.characterNotificationSettings?.voiceMode||"mixed";
  const body=mode==="character"||(mode==="mixed"&&seed%3===0)?characterQuestionPrompt(character,{kind,target:context.target,language,base}):base;
  const titles={ko:["선택을 물어봤어요","잠깐 상의하고 싶대요","결정을 기다리고 있어요","오늘의 질문이 도착했어요"],en:["A question for you","A quick decision","Waiting for your choice","Today's question"],ja:["選んでほしいことがあります","少し相談したいようです","選択を待っています","今日の質問が届きました"]};
  return {title:`${character.name} · ${titles[language]?.[seed%4]||titles.ko[seed%4]}`,body,signature:`question:${kind}:${seed%7}:${character.id}`,extra:{mode:"question",characterId:character.id,targetId:kind==="gift"?context.targetId:"",questionKind:kind,scheduledAt:at.toISOString()}};
}
function buildMomentNotification(character,topic,at,seed){
  const language=state.uiLanguage||"ko",context=notificationContextFor(character,seed),phrases=CHARACTER_CONTACT_PHRASES[topic]||CHARACTER_CONTACT_PHRASES.moments;
  const action=fillNotificationText(notificationText(phrases.actions[seed%phrases.actions.length],language),context),ending=fillNotificationText(notificationText(phrases.endings[Math.floor(seed/7)%phrases.endings.length],language),context);
  const titles={
    checkins:{ko:["오늘은 어땠어요?","밥은 챙겼어요?","잠깐 안부를 물어요"],en:["How was your day?","Did you eat?","A quick check-in"],ja:["今日はどうでしたか？","食事はできましたか？","ちょっと様子を聞かせて"]},
    worries:{ko:["작은 고민이 있어요","당신 생각이 궁금해요","같이 골라 줄래요?"],en:["I have a small worry","What do you think?","Will you help me choose?"],ja:["少し悩んでいます","あなたの考えを聞かせて","一緒に選んでくれますか？"]},
    comfort:{ko:["잠깐 쉬어 가도 돼요","오늘도 충분히 애썼어요","서두르지 않아도 괜찮아요"],en:["It's okay to pause","You did enough today","You don't have to rush"],ja:["少し休んでも大丈夫","今日も十分頑張りました","急がなくても大丈夫です"]},
    relationships:{ko:["사람 사이의 작은 고민","연락해 볼까요?","마음에 걸리는 사람이 있어요"],en:["A small relationship question","Should I reach out?","Someone is on my mind"],ja:["人との小さな悩み","連絡してみましょうか？","気になる人がいます"]},
    home:{ko:["집에서 잠깐","집을 조금 돌보는 중","오늘의 집 이야기"],en:["A moment at home","Taking care of home","A note from home"],ja:["家で少し","家を整えています","今日の家の話"]},
    work:{ko:["일을 어떻게 나눌까요?","잠깐 업무 고민","오늘 할 일을 정리했어요"],en:["How should I split the work?","A quick work question","Sorting today's work"],ja:["仕事をどう分けましょう？","仕事の小さな悩み","今日の仕事を整理しました"]},
    tastes:{ko:["오늘 생각난 취향","이게 당기는 날이에요","좋아하는 것 이야기"],en:["Something I like today","I'm craving this today","A favorite thing"],ja:["今日思い出した好み","今日はこれが気になります","好きなものの話"]}
  };
  const titlePool=titles[topic]?.[language]||titles[topic]?.ko||titles.checkins.ko,mode=state.characterNotificationSettings?.voiceMode||"mixed";
  const neutral=`${action} ${ending}`,body=mode==="concise"?neutral:mode==="character"||seed%3!==0?characterContactSpeech(character,neutral,{language}):neutral;
  return {title:`${character.name} · ${titlePool[seed%titlePool.length]}`,body,signature:`${topic}:${seed%phrases.actions.length}:${Math.floor(seed/7)%phrases.endings.length}:${character.id}:${context.targetId}`,extra:{mode:"moment",characterId:character.id,topic,scheduledAt:at.toISOString()}};
}
function buildLifeLogNotification(character,at,seed){
  const language=state.uiLanguage||"ko",context=notificationContextFor(character,seed),logs=[
    {title:{ko:"물 한 잔을 마시는 중",en:"Drinking a glass of water",ja:"水を一杯飲んでいるところ"},body:{ko:"컵을 천천히 비운 뒤 싱크대에 헹궈 두었어요.",en:"They slowly finished the glass and rinsed it in the sink.",ja:"ゆっくり飲み終え、コップを流しで軽くすすぎました。"}},
    {title:{ko:"{home}에서 침구를 정리하는 중",en:"Tidying the bedding at {home}",ja:"{home}で寝具を整えているところ"},body:{ko:"구겨진 이불을 펴고 베개 위치를 바로잡았어요.",en:"They smoothed the rumpled blanket and put the pillow back in place.",ja:"しわになった布団を伸ばし、枕の位置を整えました。"}},
    {title:{ko:"{item}을 천천히 즐기는 중",en:"Taking time to enjoy {item}",ja:"{item}をゆっくり楽しんでいるところ"},body:{ko:"다른 일을 잠깐 멈추고 좋아하는 것에만 집중하고 있어요.",en:"They paused everything else and focused only on something they enjoy.",ja:"ほかのことを少し止め、好きなものだけに集中しています。"}},
    {title:{ko:"{target}에게 안부를 보내는 중",en:"Checking in with {target}",ja:"{target}に近況を尋ねているところ"},body:{ko:"부담스럽지 않게 짧은 문장을 고른 뒤 전송했어요.",en:"They chose a short, low-pressure message and sent it.",ja:"負担にならない短い文を選んで送信しました。"}},
    {title:{ko:"잠깐 바깥 공기를 쐬는 중",en:"Stepping out for some air",ja:"少し外の空気を吸っているところ"},body:{ko:"휴대폰을 주머니에 넣고 가까운 길을 천천히 걷고 있어요.",en:"They put the phone away and are walking slowly along a nearby path.",ja:"スマートフォンをポケットに入れ、近くの道をゆっくり歩いています。"}},
    {title:{ko:"내일 쓸 물건을 챙기는 중",en:"Preparing things for tomorrow",ja:"明日使う物を準備しているところ"},body:{ko:"가방 옆에 필요한 물건을 하나씩 모아 두었어요.",en:"They gathered the things they'll need beside their bag, one by one.",ja:"必要な物を一つずつ鞄のそばにまとめました。"}}
  ],entry=logs[seed%logs.length],title=fillNotificationText(notificationText(entry.title,language),context),body=fillNotificationText(notificationText(entry.body,language),context);
  const label={ko:"생활로그",en:"Life log",ja:"生活ログ"}[language]||"생활로그";
  return {title:`${character.name} · ${label} · ${title}`,body,signature:`lifeLog:${seed%logs.length}:${character.id}:${context.targetId}`,extra:{mode:"lifeLog",characterId:character.id,topic:"lifeLogs",scheduledAt:at.toISOString()}};
}
function buildSpecialDateNotification(character,kind,item,at){
  const language=state.uiLanguage||"ko",target=state.characters[item?.targetId],targetName=target?.name||({ko:"소중한 사람",en:"someone important",ja:"大切な人"}[language]),type=item?.type||"사용자 지정";
  if(kind==="birthday"){
    const base={ko:"오늘은 제 생일이에요. 함께 축하해 줄래요?",en:"It's my birthday today. Will you celebrate with me?",ja:"今日は私の誕生日です。一緒にお祝いしてくれますか？"}[language];
    return {title:`🎂 ${character.name} · ${language==="en"?"Birthday":language==="ja"?"誕生日":"생일"}`,body:characterContactSpeech(character,base,{language}),extra:{mode:"specialDate",specialKind:"birthday",characterId:character.id,scheduledAt:at.toISOString()}};
  }
  const messages={
    "첫 만남":{ko:`오늘은 ${targetName}와 처음 만난 날이에요. 그날 이야기를 잠깐 떠올려 볼까요?`,en:`Today marks the day I first met ${targetName}. Shall we remember it for a moment?`,ja:`今日は${targetName}と初めて会った日です。あの日を少し思い出してみませんか？`},
    "연애 시작":{ko:`오늘은 ${targetName}와 마음을 확인한 날이에요. 함께 기념하고 싶어요.`,en:`Today is when ${targetName} and I became a couple. I'd like to celebrate it together.`,ja:`今日は${targetName}と恋人になった日です。一緒に記念したいです。`},
    "결혼":{ko:`오늘은 ${targetName}와 결혼한 기념일이에요. 둘만의 시간을 보내고 싶어요.`,en:`It's my wedding anniversary with ${targetName}. I'd like us to spend some time together.`,ja:`今日は${targetName}との結婚記念日です。二人で過ごしたいです。`},
    "가족이 된 날":{ko:`오늘은 ${targetName}와 가족이 된 날이에요. 평소보다 조금 특별하게 보내요.`,en:`Today is when ${targetName} and I became family. Let's make it a little special.`,ja:`今日は${targetName}と家族になった日です。いつもより少し特別に過ごしましょう。`},
    "추모일":{ko:"오늘은 잊지 않고 기억하고 싶은 날이에요. 조용히 마음을 나누어 줄래요?",en:"Today is a day I want to remember. Will you share a quiet moment with me?",ja:"今日は忘れずに覚えていたい日です。静かな時間を一緒に過ごしてくれますか？"}
  },fallback={ko:`오늘은 ${item?.title||type} 기념일이에요. 이 날을 함께 기억해 줘요.`,en:`Today is ${item?.title||type}. Please remember this day with me.`,ja:`今日は${item?.title||type}の記念日です。この日を一緒に覚えていてください。`},base=(messages[type]||fallback)[language]||(messages[type]||fallback).ko;
  return {title:`💌 ${character.name} · ${item?.title||type}`,body:characterContactSpeech(character,base,{language}),extra:{mode:"specialDate",specialKind:"anniversary",anniversaryId:item?.id||"",characterId:character.id,targetId:item?.targetId||"",scheduledAt:at.toISOString()}};
}
function buildCharacterContactSchedule(now=new Date()){
  const settings=state.characterNotificationSettings,characters=notificationSelectedCharacters();if(!settings||!characters.length)return [];
  const recent=new Set(settings.recentSignatures||[]),generated=[],newSignatures=[],language=state.uiLanguage||"ko";
  // 앱을 며칠 열지 않아도 연락이 끊기지 않도록 2주치를 기기에 예약한다.
  // 정확한 시각이 필요한 알람이 아니므로 별도의 exact-alarm 권한은 요구하지 않는다.
  for(let dayOffset=0;dayOffset<15;dayOffset+=1){
    const date=new Date(now.getFullYear(),now.getMonth(),now.getDate()+dayOffset),dayKey=localDateKey(date),daySeed=notificationHash(`${dayKey}:${characters.map(item=>item.id).join(":")}`);
    const recurringKey=`${String(date.getMonth()+1).padStart(2,"0")}${String(date.getDate()).padStart(2,"0")}`,specialAt=new Date(date.getFullYear(),date.getMonth(),date.getDate(),11,0,0,0),specials=[...state.order.map(id=>state.characters[id]).filter(character=>character?.birthday===recurringKey).map(character=>({kind:"birthday",character,item:null})),...(state.anniversaries||[]).filter(item=>item.date===recurringKey).map(item=>({kind:"anniversary",character:state.characters[item.characterId]||characters[0],item}))].filter(entry=>entry.character);
    if(specialAt.getTime()>=now.getTime()+5*60*1000)specials.forEach((special,index)=>{const item=buildSpecialDateNotification(special.character,special.kind,special.item,specialAt);generated.push({id:830000000+(Number(dayKey.replaceAll("-",""))%100000)*100+index,title:item.title,body:item.body,summaryText:language==="en"?"Drawer Village":language==="ja"?"ひきだし村":"서랍마을",at:specialAt,extra:item.extra})});
    if(settings.scheduleEnds){
      const endingCopy={ko:{title:"일정이 끝났어요",body:title=>`‘${title}’ 일정을 마칠 시간이 되었어요.`},en:{title:"Schedule finished",body:title=>`It's time to finish “${title}”.`},ja:{title:"予定が終わりました",body:title=>`「${title}」を終える時間です。`}}[language]||{title:"일정이 끝났어요",body:title=>`‘${title}’ 일정을 마칠 시간이 되었어요.`};
      let endIndex=0;
      characters.forEach(character=>{
        const endingRoutines=[...(state.routines?.[character.id]||[]).filter(routine=>Number(routine.day)===date.getDay()),...(state.monthlyRoutines?.[character.id]||[]).filter(routine=>routine.date===dayKey)];
        endingRoutines.forEach(routine=>{
          const match=/^(\d{1,2}):(\d{2})$/.exec(String(routine.end||""));if(!match)return;
          const at=new Date(date.getFullYear(),date.getMonth(),date.getDate(),Number(match[1]),Number(match[2]),0,0);if(at.getTime()<now.getTime()+5*60*1000)return;
          generated.push({id:840000000+(Number(dayKey.replaceAll("-",""))%100000)*100+(endIndex++%100),title:`${character.name} · ${endingCopy.title}`,body:endingCopy.body(routine.title||routine.type||"일정"),summaryText:language==="en"?"Drawer Village":language==="ja"?"ひきだし村":"서랍마을",at,extra:{mode:"scheduleEnd",characterId:character.id,routineId:routine.id,scheduledAt:at.toISOString()}});
        });
      });
    }
    const start=Number(settings.startHour)||10,end=Math.max(start+1,Number(settings.endHour)||18),span=Math.max(60,(end-start)*60),minutes=settings.frequencyMode==="interval"?Array.from({length:Math.max(1,Math.ceil((end-start)/Math.max(2,Number(settings.intervalHours)||4)))},(_,slot)=>start*60+slot*Math.max(2,Number(settings.intervalHours)||4)*60).filter(minute=>minute<end*60):Array.from({length:Math.max(1,Math.min(6,Number(settings.timesPerDay)||1))},(_,slot,array)=>{const part=Math.floor(span/array.length);return start*60+slot*part+(daySeed+slot*137)%Math.max(30,part)});
    for(let slot=0;slot<minutes.length;slot+=1){
      const minute=minutes[slot];
      const at=new Date(date.getFullYear(),date.getMonth(),date.getDate(),Math.floor(minute/60),minute%60,0,0);if(at.getTime()<now.getTime()+5*60*1000)continue;
      // 날짜 해시의 우연에 맡기지 않고 날짜와 슬롯 기준으로 발신자를 순환한다.
      // 하루 한 번 설정이어도 여러 날 연속 같은 첫 캐릭터만 고정되지 않는다.
      const daySerial=Math.floor(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())/86400000);
      let character=characters[(daySerial+slot)%characters.length];
      if(generated.at(-1)?.extra?.characterId===character.id&&characters.length>1)character=characters[(characters.indexOf(character)+1)%characters.length];
      const topics=notificationTopicsFor(character),fallbackTopics=topics.length?topics:["questions","moments"];
      let topic=fallbackTopics[(daySeed+slot*5)%fallbackTopics.length],seed=daySeed+dayOffset*31+slot*17,item;
      for(let attempt=0;attempt<12;attempt+=1){
        topic=fallbackTopics[(daySeed+slot*5+attempt)%fallbackTopics.length];
        item=topic==="questions"?buildQuestionNotification(character,at,seed+attempt):topic==="lifeLogs"?buildLifeLogNotification(character,at,seed+attempt):buildMomentNotification(character,topic,at,seed+attempt);
        if(!recent.has(item.signature)&&!newSignatures.includes(item.signature))break;
      }
      generated.push({id:820000000+(Number(dayKey.replaceAll("-",""))%100000)*100+slot,title:item.title,body:item.body,summaryText:language==="en"?"Drawer Village":language==="ja"?"ひきだし村":"서랍마을",at,extra:item.extra});newSignatures.push(item.signature);
    }
  }
  settings.recentSignatures=[...(settings.recentSignatures||[]),...newSignatures].slice(-24);settings.lastScheduledAt=Date.now();
  return generated;
}
let characterNotificationScheduleTimer=0;
function queueCharacterNotificationSchedule(){
  clearTimeout(characterNotificationScheduleTimer);
  if(!state.characterNotificationsEnabled)return;
  characterNotificationScheduleTimer=setTimeout(()=>syncCharacterNotificationSchedule().catch(error=>console.warn("알림 일정 갱신을 다음 변경 때 다시 시도합니다",error)),650);
}
async function syncCharacterNotificationSchedule(){
  if(!state.characterNotificationsEnabled||!characterNotificationsAvailable())return false;
  const permission=await characterNotificationPermission();
  if(permission!=="granted"){state.characterNotificationsEnabled=false;state.characterNotificationConsent="denied";save(true);return false}
  const items=buildCharacterContactSchedule(),icons=new Map();
  await Promise.all(items.map(async item=>{
    const character=state.characters[item.extra?.characterId],source=character?.icon||character?.photo||"";
    if(!icons.has(source))icons.set(source,characterNotificationLargeIcon(source));
    item.largeIcon=await icons.get(source);
  }));
  await replaceCharacterNotifications(items);save(true);return true;
}
let currentBuildUpdateNoticeTimer=0;
function queueCurrentBuildUpdateNotice(){
  clearTimeout(currentBuildUpdateNoticeTimer);
  currentBuildUpdateNoticeTimer=setTimeout(()=>scheduleCurrentBuildUpdateNotice().catch(error=>console.warn("업데이트 알림 예약 실패",error)),1200);
}
async function scheduleCurrentBuildUpdateNotice(){
  if(!state.characterNotificationsEnabled||state.characterNotificationSettings?.updateNotices===false||!characterNotificationsAvailable())return false;
  if(await characterNotificationPermission()!=="granted")return false;
  const version=String(window.DRAWER_VILLAGE_APP_VERSION||"").trim();
  if(!version)return false;
  const key=`drawer-village-update-notice:${version}`;
  if(localStorage.getItem(key)==="scheduled")return false;
  const updateCharacters=notificationSelectedCharacters(),versionCode=Number(window.DRAWER_VILLAGE_VERSION_CODE)||0;
  const character=updateCharacters.length?updateCharacters[versionCode%updateCharacters.length]:active();if(!character)return false;
  const language=state.uiLanguage||"ko",copy=({
    ko:`설정 화면이 더 안정적으로 움직이고, 오늘의 질문은 캐릭터 화면에서 편하게 확인할 수 있게 바뀌었어요.`,
    en:`Settings now stay in place, and today's questions can be opened calmly from the Character screen.`,
    ja:`設定画面が安定し、今日の質問はキャラクター画面から落ち着いて確認できるようになりました。`
  })[language]||"";
  const largeIcon=await characterNotificationLargeIcon(character.icon||character.photo||"");
  await scheduleCharacterNotification({id:829000000+(Number(window.DRAWER_VILLAGE_VERSION_CODE)||0),title:`${character.name} · ${language==="en"?"Update news":language==="ja"?"アップデートのお知らせ":"업데이트 소식"}`,body:copy,largeIcon,at:new Date(Date.now()+12000),extra:{mode:"update",characterId:character.id,version}});
  localStorage.setItem(key,"scheduled");return true;
}
function notificationConsentCopy(){
  const language=state.uiLanguage||"ko";
  return ({
    ko:{title:"캐릭터의 연락을 받아볼까요?",body:"선택한 캐릭터가 낮 시간에 생활 소식이나 질문을 보내요. 하루 횟수와 캐릭터는 설정에서 바꿀 수 있고, 답한 선택은 실제 일정에 반영됩니다.",bullets:["오전·낮 시간에만 무작위로 도착","설정에서 언제든 끄기 가능","캐릭터 정보는 서버로 보내지 않음"],allow:"Android 허용창 보기",cancel:"나중에"},
    en:{title:"Receive messages from your characters?",body:"Selected characters can send daytime life updates or questions. You control the characters and frequency, and your answers can continue into their schedules.",bullets:["Random delivery only during your daytime window","Turn it off in Settings at any time","Character data never leaves the device for notifications"],allow:"Continue to Android permission",cancel:"Not now"},
    ja:{title:"キャラクターからの連絡を受け取りますか？",body:"選んだキャラクターが昼間に近況や質問を送ります。キャラクターと頻度は設定で変更でき、回答は実際の予定に反映されます。",bullets:["午前・昼間の設定時間内にランダムで届きます","設定からいつでもオフにできます","通知のためにキャラクター情報をサーバーへ送りません"],allow:"Androidの許可画面へ",cancel:"後で"}
  })[language]||null;
}
function confirmCharacterNotificationConsent(){
  return new Promise(resolve=>{
    const copy=notificationConsentCopy(),dialog=document.createElement("dialog");dialog.className="character-notification-consent";
    dialog.innerHTML=`<form method="dialog"><div class="title"><div><small>NOTIFICATIONS</small><h2>${htmlEsc(copy.title)}</h2></div><button value="cancel" aria-label="닫기">×</button></div><p>${htmlEsc(copy.body)}</p><ul>${copy.bullets.map(item=>`<li>${htmlEsc(item)}</li>`).join("")}</ul><div class="crop-actions"><button value="cancel">${htmlEsc(copy.cancel)}</button><button value="allow" class="primary">${htmlEsc(copy.allow)}</button></div></form>`;
    dialog.onclose=()=>{resolve(dialog.returnValue==="allow");dialog.remove()};document.body.append(dialog);dialog.showModal();
  });
}
async function enableCharacterNotificationsWithConsent(source){
  if(!characterNotificationsAvailable()){showToast("캐릭터 연락 알림은 Android 앱에서 사용할 수 있어요");return false}
  const current=await characterNotificationPermission();
  if(current!=="granted"&&!(await confirmCharacterNotificationConsent()))return false;
  const permission=current==="granted"?current:await requestCharacterNotificationPermission();
  state.characterNotificationConsent=permission==="granted"?"granted":"denied";state.characterNotificationsEnabled=permission==="granted";
  if(permission==="granted"){await initializeCharacterNotifications();await syncCharacterNotificationSchedule();queueCurrentBuildUpdateNotice();showToast("캐릭터 연락 알림을 켰어요")}
  else showToast("알림이 허용되지 않았어요. 휴대폰 설정에서 다시 켤 수 있어요");
  save(true);updateCharacterNotificationControls();return permission==="granted";
}
async function sendCharacterNotificationTest(){
  const testCharacters=notificationSelectedCharacters();
  const previousTestId=localStorage.getItem("drawer-village-last-test-notification-character")||"";
  const previousIndex=testCharacters.findIndex(character=>character.id===previousTestId);
  const character=testCharacters.length?testCharacters[(previousIndex+1)%testCharacters.length]:active();if(!character)return showToast("알림을 보낼 캐릭터가 없어요");
  localStorage.setItem("drawer-village-last-test-notification-character",character.id);
  const at=new Date(Date.now()+5000),seed=notificationHash(String(Date.now())),topics=notificationTopicsFor(character),topic=topics[seed%Math.max(1,topics.length)]||"checkins",item=topic==="questions"?buildQuestionNotification(character,at,seed):topic==="lifeLogs"?buildLifeLogNotification(character,at,seed):buildMomentNotification(character,topic,at,seed),largeIcon=await characterNotificationLargeIcon(character.icon||character.photo||"");
  await scheduleCharacterNotification({id:829999999,title:item.title,body:item.body,largeIcon,at,extra:item.extra});showToast("5초 뒤 시험 알림이 도착해요");
}
window.addEventListener("drawer-village-character-notification-open",event=>{
  const extra=event.detail||{},character=state.characters[extra.characterId];if(!character)return;
  setActive(character.id);
  if(extra.mode==="question"){
    const now=new Date(extra.scheduledAt||Date.now());
    setDailyQuestion({day:localDateKey(now),minute:now.getHours()*60+now.getMinutes(),characterId:character.id,targetId:extra.targetId||"",kind:extra.questionKind||"everyday",shown:true,answered:false});
    navigateToTab("mailbox");return;
  }
  if(extra.mode==="update"){navigateToTab("mailbox");return}
  navigateToTab("observe");
});
function scheduleLiveSceneRefresh(){
  const delay=(15+Math.floor(Math.random()*16))*60*1000;
  setTimeout(()=>{
    if(["observe","home"].includes(state.activeTab)){
      const now=new Date();
      settleScheduledChoices(now.getTime());
      state.order.map(id=>state.characters[id]).filter(Boolean).forEach(character=>eventFor(character,now));
      render();
    }
    scheduleLiveSceneRefresh();
  },delay);
}
scheduleLiveSceneRefresh();
ensureDailyQuestionSchedule();
if(state.characterNotificationsEnabled&&characterNotificationsAvailable())initializeCharacterNotifications().then(()=>{
  if(Date.now()-Number(state.characterNotificationSettings?.lastScheduledAt||0)>6*60*60*1000)setTimeout(syncCharacterNotificationSchedule,800);
  queueCurrentBuildUpdateNotice();
});
const restoreForegroundState=()=>{
  refreshLocalMedia();
};
window.addEventListener("focus",restoreForegroundState);
window.addEventListener("pageshow",restoreForegroundState);
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")restoreForegroundState()});

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
const mobileSiteQuery=window.matchMedia?.("(max-width:720px)");
mobileSiteQuery?.addEventListener?.("change",()=>render());
// 사이트는 공유하거나 새로고침한 #tab 주소를 그대로 복원한다. Android
// 앱의 새 실행만 관찰 화면에서 시작한다. 무엇보다 초기 화면을 그린 뒤에는
// 이 부팅 코드가 사용자가 이미 누른 탭을 다시 덮어쓰지 않는다.
const startupHashTab=new URLSearchParams(location.hash.replace(/^#/,"")).get("tab");
const startupSettingsPane=new URLSearchParams(location.hash.replace(/^#/,"")).get("pane");
const nativeStartup=Boolean(window.DRAWER_VILLAGE_NATIVE||window.Capacitor?.isNativePlatform?.());
let startupSessionTab="";
try{startupSessionTab=sessionStorage.getItem("drawer-village-active-tab")||""}catch{}
const startupTab=nativeStartup?"observe":APP_TABS.includes(startupHashTab)?startupHashTab:APP_TABS.includes(startupSessionTab)?startupSessionTab:"observe";
document.documentElement.dataset.startupTab=startupTab;
document.documentElement.dataset.startupNative=String(nativeStartup);
if(document.documentElement.dataset.drawerRendered!=="1")setNavigationTabIntent(startupTab);
if(startupTab==="settings")setSettingsPane(startupSettingsPane||"home");
recordTabHistory(state.activeTab,true);
render();
if(!maintenanceEnabled())showInstallButton();
if(!maintenanceEnabled()){
  import("./auth.js?v=20260822charactergrouplayout1").catch(error=>{
    console.warn("로그인 기능을 불러오지 못했지만 게임은 계속 실행됩니다.",error);
    setAccountLabel("Google 로그인");
  });
}
if("serviceWorker" in navigator){
  const nativeRuntime=Boolean(window.DRAWER_VILLAGE_NATIVE||window.Capacitor?.isNativePlatform?.());
  if(nativeRuntime){
    // The Android package already carries every web asset. A service worker can
    // otherwise keep serving an index.html from an older APK after an update.
    Promise.all([
      navigator.serviceWorker.getRegistrations().then(registrations=>Promise.all(registrations.map(registration=>registration.unregister()))),
      globalThis.caches?.keys?.().then(keys=>Promise.all(keys.map(key=>caches.delete(key))))
    ]).catch(error=>console.warn("앱의 이전 웹 캐시를 정리하지 못했습니다",error));
  }else{
    navigator.serviceWorker.register("./sw.js?v=20260822charactergrouplayout1",{updateViaCache:"none"}).then(registration=>registration.update()).catch(error=>console.warn("오프라인 업데이트 준비 실패",error));
  }
}
const lockPortrait=()=>screen.orientation?.lock?.("portrait").catch(()=>{});
if(matchMedia("(display-mode: standalone)").matches||navigator.standalone)lockPortrait();
window.addEventListener("orientationchange",lockPortrait);
