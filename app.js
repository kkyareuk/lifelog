import {state, active, save, replaceState, createCharacter, deleteCharacter, setActive, setActiveHome, updateCharacter, toggleChip, addRelationship, updateRelationship, deleteRelationship, setHomeImage, setHomeBackground, setPlaceImage, setPlaceInteriorImage, setCharacterImage, setWorldBackground, addPlace, deletePlace, movePlace, updatePlace, resetAll, cloneState, setHomeEditMode, updateHome, updateRoom, addRoom, addPet, updatePet, deletePet, setPetImage, toggleFurniture, setHomeResidents, moveCharacter, addCatalogItem, updateCatalogItem, deleteCatalogItem, toggleFavorite, toggleOwned, togglePlaceStock, setCharacterPane, addTown, switchTown, deleteTown} from "./state.js?v=20260802ag";
import {eventFor} from "./simulation.js?v=20260802ag";
import {renderApp, setAccountLabel, setAccountEntitlements} from "./views.js?v=20260802ag";

let pendingImage=null;
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
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
const addRoutine=characterId=>{
  state.routines[characterId]=Array.isArray(state.routines[characterId])?state.routines[characterId]:[];
  const item={id:crypto.randomUUID?.()||`${Date.now()}-${Math.random()}`,day:1,start:"09:00",end:"10:00",type:"개인 일정",title:"새 일정",placeId:"",withIds:[],notes:""};
  state.routines[characterId].push(item);save(true);return item.id;
};
const updateRoutine=(characterId,id,patch)=>{const item=state.routines[characterId]?.find(r=>r.id===id);if(item){Object.assign(item,patch);save(true)}};
const deleteRoutine=(characterId,id)=>{state.routines[characterId]=(state.routines[characterId]||[]).filter(r=>r.id!==id);save(true)};
const addCar=homeId=>{const home=state.homes[homeId];if(!home)return;home.cars=Array.isArray(home.cars)?home.cars:[];home.cars.push({id:crypto.randomUUID?.()||`${Date.now()}-${Math.random()}`,name:"우리 집 자동차",type:"승용차",color:"",seats:5});save(true)};
const updateCar=(homeId,id,patch)=>{const car=state.homes[homeId]?.cars?.find(item=>item.id===id);if(car){Object.assign(car,patch);save(true)}};
const deleteCar=(homeId,id)=>{const home=state.homes[homeId];if(home){home.cars=(home.cars||[]).filter(item=>item.id!==id);save(true)}};

function render(){
  try{
    renderApp(state);
    bind();
    applyTheme();
    requestAnimationFrame(()=>document.querySelectorAll(".life-log ol").forEach(log=>{log.scrollTop=log.scrollHeight}));
  }catch(error){
    console.error("화면 복구 필요",error);
    document.querySelector("#app").innerHTML=`<section class="panel empty"><h1>화면을 복구하는 중 문제가 생겼어요</h1><p>저장 데이터는 지우지 않았습니다. 아래 버튼으로 다시 불러와 주세요.</p><button class="primary" id="safe-reload">다시 불러오기</button></section>`;
    document.querySelector("#safe-reload")?.addEventListener("click",()=>location.reload());
  }
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
  $$("[data-tab]").forEach(el=>el.onclick=()=>{state.activeTab=el.dataset.tab;save();render()});
  $$("[data-new]").forEach(el=>el.onclick=()=>{createCharacter();render()});
  $$("[data-edit]").forEach(el=>el.onclick=()=>{setActive(el.dataset.edit);setCharacterPane("profile");render()});
  $$("[data-sort]").forEach(el=>el.onclick=event=>{
    event.stopPropagation();
    moveCharacter(el.dataset.sort,Number(el.dataset.direction||0));
    render();
  });
  $$("[data-delete-character]").forEach(el=>el.onclick=()=>{
    if(confirm("이 캐릭터와 연결된 관계를 삭제할까요?")){deleteCharacter(el.dataset.deleteCharacter);render()}
  });
  $$("[data-roster],[data-person]").forEach(el=>el.onclick=()=>focusCharacter(el.dataset.roster||el.dataset.person));
  $$("[data-home-person]").forEach(el=>el.onclick=()=>focusHomeCharacter(el.dataset.homePerson));
  $("[data-all-sleep-home]")?.addEventListener("click",()=>focusHomeCharacter(state.activeId||state.order[0]));
  $$("[data-observe-town]").forEach(el=>el.onclick=()=>{switchTown(el.dataset.observeTown);render()});
  $$("[data-home-select]").forEach(el=>el.onclick=()=>{setActiveHome(el.dataset.homeSelect);render()});
  $("[data-home-edit]")?.addEventListener("click",async()=>{const was=state.homeEditMode;setHomeEditMode(!was);was?await explicitSave("집 편집 저장"):render()});
  $("[data-add-room]")?.addEventListener("click",()=>{addRoom(state.activeHomeId);render()});
  $("[data-add-pet]")?.addEventListener("click",()=>{addPet(state.activeHomeId);render()});
  $("[data-add-car]")?.addEventListener("click",()=>{addCar(state.activeHomeId);render()});
  $$("[data-car-field]").forEach(el=>el.oninput=()=>updateCar(el.dataset.homeId,el.dataset.carId,{[el.dataset.carField]:el.type==="number"?Number(el.value):el.value}));
  $$("[data-delete-car]").forEach(el=>el.onclick=()=>{deleteCar(el.dataset.homeId,el.dataset.deleteCar);render()});
  $$("[data-character-check]").forEach(el=>el.onchange=()=>{updateCharacter(el.dataset.characterCheck,{[el.dataset.field]:el.checked});render()});
  $$("[data-pet-field]").forEach(el=>{
    const apply=()=>{const value=el.dataset.petField==="neutered"?el.checked:el.value;updatePet(el.dataset.homeId,el.dataset.petId,{[el.dataset.petField]:value});if(["species","room"].includes(el.dataset.petField))render()};
    el.oninput=apply;el.onchange=apply;
  });
  $$("[data-delete-pet]").forEach(el=>el.onclick=()=>{if(confirm("이 반려동물을 삭제할까요?")){deletePet(el.dataset.homeId,el.dataset.deletePet);render()}});
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
  $$("[data-town-select]").forEach(el=>el.onclick=()=>{switchTown(el.dataset.townSelect);render()});
  $("[data-add-town]")?.addEventListener("click",()=>{addTown();render()});
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
    if(confirm("이 관계를 삭제할까요?")){deleteRelationship(el.dataset.deleteRel);render()}
  });
  $$("[data-delete-group]").forEach(el=>el.onclick=()=>{
    if(!confirm("이 그룹 관계 전체를 삭제할까요?"))return;
    Object.values(state.relationships).filter(r=>r.groupId===el.dataset.deleteGroup).forEach(r=>deleteRelationship(r.id));
    render();
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
    dialog.innerHTML=`<form method="dialog"><div class="title"><h2>이미지 주소로 사진 추가</h2><button value="cancel" aria-label="닫기">×</button></div><label>이미지 파일 주소<input name="url" type="url" placeholder="https://.../photo.jpg" required></label><small>웹페이지 주소가 아니라 주소 끝이 jpg, png, webp 등으로 끝나는 실제 이미지 주소를 넣어 주세요.</small><div class="crop-actions"><button value="cancel">취소</button><button class="primary" value="apply">사진 불러오기</button></div></form>`;
    document.body.append(dialog);
    dialog.onclose=()=>{
      const value=dialog.returnValue==="apply"?dialog.querySelector('[name="url"]').value.trim():"";
      dialog.remove();resolve(value);
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
  const square=["icon","photo","petIcon","petPhoto","catalogImage"].includes(type);
  const output=square?420:800;
  const ratio=square?1:16/9;
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

function openRelationDialog(id=""){
  if(state.order.length<2)return alert("캐릭터가 두 명 이상 필요해요.");
  const old=id?state.relationships[id]:null;
  const dialog=document.createElement("dialog");
  dialog.className="relation-dialog";
  const options=state.order.map(cid=>`<option value="${cid}">${state.characters[cid].name}</option>`).join("");
  dialog.innerHTML=`<form method="dialog"><h2>${old?"관계 편집":"관계 추가"}</h2>
    ${old?"":`<label class="group-toggle"><input type="checkbox" name="groupMode"> 세 명 이상을 한 관계로 묶기</label><fieldset class="group-members" hidden><legend>구성원 선택</legend>${state.order.map(cid=>`<label><input type="checkbox" name="member" value="${cid}"> ${state.characters[cid].name}</label>`).join("")}</fieldset>`}
    <label>첫 번째 캐릭터<select name="a">${options}</select></label>
    <label>두 번째 캐릭터<select name="b">${options}</select></label>
    <label>관계<select name="type">${["친구","절친","연인","폴리 관계","부부","가족","대학 동기","친구 무리","동아리 동료","직장 동료","짝사랑","라이벌","혐관"].map(x=>`<option>${x}</option>`).join("")}</select></label>
    <label>친밀도 <output name="intimacyOut">75</output><input type="range" name="intimacy" min="0" max="100" value="75"></label>
    <label>갈등도 <output name="conflictOut">20</output><input type="range" name="conflict" min="0" max="100" value="20"></label>
    <label class="cohabit"><input type="checkbox" name="cohabit"> 함께 살기</label>
    <p class="hint">함께 살기를 켜면 집과 반려동물만 공유해요. 취향·관심사·테마는 각자 그대로 유지됩니다.</p>
    <div><button value="cancel">취소</button><button class="primary" value="save">저장</button></div>
  </form>`;
  document.body.append(dialog);
  const f=dialog.querySelector("form");
  if(f.groupMode)f.groupMode.onchange=()=>{
    f.querySelector(".group-members").hidden=!f.groupMode.checked;
    f.a.closest("label").hidden=f.groupMode.checked;f.b.closest("label").hidden=f.groupMode.checked;
  };
  f.a.value=old?.a||state.activeId;
  f.b.value=old?.b||state.order.find(x=>x!==f.a.value);
  f.type.value=old?.type||"친구";
  f.intimacy.value=old?.intimacy??75;
  f.conflict.value=old?.conflict??20;
  f.intimacyOut.value=f.intimacy.value;
  f.conflictOut.value=f.conflict.value;
  f.intimacy.oninput=()=>f.intimacyOut.value=f.intimacy.value;
  f.conflict.oninput=()=>f.conflictOut.value=f.conflict.value;
  f.cohabit.checked=Boolean(old?.cohabit);
  dialog.onclose=()=>{
    if(dialog.returnValue==="save"){
      const members=f.groupMode?.checked?[...f.querySelectorAll('[name="member"]:checked')].map(input=>input.value):[];
      if(f.groupMode?.checked&&members.length<3)alert("그룹 관계는 세 명 이상 선택해 주세요.");
      else if(!f.groupMode?.checked&&f.a.value===f.b.value)alert("서로 다른 캐릭터를 골라 주세요.");
      else{
        const base={type:f.type.value,cohabit:f.cohabit.checked,intimacy:Number(f.intimacy.value),conflict:Number(f.conflict.value)};
        if(f.groupMode?.checked){
          for(let i=0;i<members.length;i++)for(let j=i+1;j<members.length;j++)addRelationship({...base,a:members[i],b:members[j],groupId:`group-${members.slice().sort().join("-")}`,groupMembers:members});
        }else{
          const data={...base,a:f.a.value,b:f.b.value};
          old?updateRelationship(id,data):addRelationship(data);
        }
        render();
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
window.addEventListener("parallel-city-cloud-loaded",render);
setInterval(()=>{if(["observe","home"].includes(state.activeTab))render()},60000);
render();
if(localStorage.getItem("drawer-village-hide-photo-backup-notice")!=="1"&&localStorage.getItem("parallel-city-hide-photo-backup-notice")!=="1"){
  const notice=document.createElement("dialog");notice.className="backup-notice";
  notice.innerHTML=`<form method="dialog"><h2>사진 보관 안내</h2><p>Google 계정에는 고유 사진을 <b>최대 120장·총 60MB</b>까지 저장해요. 같은 사진은 여러 곳에 사용해도 한 번만 올라갑니다. 오래 보관할 중요한 데이터는 설정의 <b>백업 파일 내보내기</b>로도 보관해 주세요.</p><label><input type="checkbox" name="hide"> 다시는 보지 않기</label><button class="primary" value="ok">알겠어요</button></form>`;
  notice.onclose=()=>{if(notice.querySelector('[name="hide"]')?.checked)localStorage.setItem("drawer-village-hide-photo-backup-notice","1");notice.remove()};
  document.body.append(notice);notice.showModal();
}
import("./auth.js?v=20260802ag").catch(error=>{
  console.warn("로그인 기능을 불러오지 못했지만 게임은 계속 실행됩니다.",error);
  setAccountLabel("Google 로그인");
});
if("serviceWorker" in navigator){
  navigator.serviceWorker.register("./sw.js?v=20260802ag").catch(error=>console.warn("오프라인 업데이트 준비 실패",error));
}
