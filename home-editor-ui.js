import {FURNITURE_CATALOG,furnitureLabel,furnitureIcon} from "./furniture-layout.js?v=20260904home209";

const escape=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const COPY={
  ko:{rooms:"방 정보",searchRooms:"방 검색",all:"전체",addRoom:"방 추가",editRoom:"방 편집",searchFurniture:"가구 검색",allThemes:"모든 가구",collapse:"가구창 접기",expand:"가구창 펼치기",members:"구성원 정보",residents:"구성원 목록",pets:"반려생물",cars:"자동차",editHome:"집 정보 편집하기",summary:"요약",logs:"로그",front:"정면",left:"왼쪽",right:"오른쪽",flip:"좌우반전",direction:"방향",missingSide:"옆모습 그림 준비 중 · 정면 그림 표시",assign:"침대 지정",empty:"검색 결과가 없어요.",floor:n=>`${n}층`,living:"거실",kitchen:"주방",entry:"현관",bath:"욕실",bedroom:"침실",study:"서재",dining:"식당",nursery:"아기방",guest:"손님방",hobby:"취미방",balcony:"발코니",storage:"창고",other:"기타"},
  en:{rooms:"Rooms",searchRooms:"Search rooms",all:"All",addRoom:"Add room",editRoom:"Edit room",searchFurniture:"Search furniture",allThemes:"All furniture",collapse:"Collapse furniture",expand:"Expand furniture",members:"Members",residents:"Resident list",pets:"Pets",cars:"Cars",editHome:"Edit home information",summary:"Summary",logs:"Logs",front:"Front",left:"Left",right:"Right",flip:"Flip",direction:"Facing",missingSide:"Side artwork pending · showing front",assign:"Assign bed",empty:"No results.",floor:n=>`Floor ${n}`,living:"Living",kitchen:"Kitchen",entry:"Entry",bath:"Bath",bedroom:"Bedroom",study:"Study",dining:"Dining",nursery:"Nursery",guest:"Guest",hobby:"Hobby",balcony:"Balcony",storage:"Storage",other:"Other"},
  ja:{rooms:"部屋情報",searchRooms:"部屋を検索",all:"すべて",addRoom:"部屋を追加",editRoom:"部屋を編集",searchFurniture:"家具を検索",allThemes:"すべての家具",collapse:"家具一覧を閉じる",expand:"家具一覧を開く",members:"メンバー情報",residents:"住人一覧",pets:"ペット",cars:"車",editHome:"家の情報を編集",summary:"まとめ",logs:"記録",front:"正面",left:"左向き",right:"右向き",flip:"左右反転",direction:"向き",missingSide:"横向きの絵は準備中・正面の絵を表示",assign:"ベッド指定",empty:"見つかりませんでした。",floor:n=>`${n}階`,living:"居間",kitchen:"キッチン",entry:"玄関",bath:"浴室",bedroom:"寝室",study:"書斎",dining:"食堂",nursery:"子供部屋",guest:"客室",hobby:"趣味の部屋",balcony:"バルコニー",storage:"物置",other:"その他"}
};
export const homeEditorCopy=locale=>COPY[locale]||COPY.ko;
const drawerStates=new Map();
const drawerState=home=>{
  if(!drawerStates.has(home.id))drawerStates.set(home.id,{collapsed:false,query:"",category:"all",room:""});
  const state=drawerStates.get(home.id),keys=Object.keys(home.rooms||{}).filter(key=>(Number(home.rooms[key].floor)||1)===(Number(home.activeFloor)||1));
  if(!keys.includes(state.room))state.room=keys[0]||"";
  return state;
};
export function furniturePickerArt(item){
  return item==="커플 침대"?`<span class="furniture-picker-couple-bed" aria-hidden="true">${["base","quilt","footboard"].map(layer=>`<img src="assets/furniture/couple-bed/couple-bed-${layer}.png" alt="">`).join("")}</span>`:`<span aria-hidden="true">${furnitureIcon(item)}</span>`;
}
export function homeFurnitureDrawer(home,locale){
  const copy=homeEditorCopy(locale),ui=drawerState(home);
  return `<section class="home-furniture-drawer ${ui.collapsed?"is-collapsed":""}" data-home-furniture-drawer data-home-id="${escape(home.id)}">
    <button type="button" class="home-drawer-toggle" data-home-drawer-toggle aria-expanded="${!ui.collapsed}" aria-label="${ui.collapsed?copy.expand:copy.collapse}">${ui.collapsed?"▲":"▼"}</button>
    <div class="home-drawer-content" ${ui.collapsed?"inert":""}>
      <div class="home-drawer-search"><input type="search" data-home-furniture-search value="${escape(ui.query)}" placeholder="${copy.searchFurniture}" aria-label="${copy.searchFurniture}"><select data-home-furniture-room aria-label="${copy.rooms}">${Object.entries(home.rooms||{}).filter(([,room])=>(Number(room.floor)||1)===(Number(home.activeFloor)||1)).map(([key,room])=>`<option value="${escape(key)}" ${key===ui.room?"selected":""}>${escape(room.name||key)}</option>`).join("")}</select></div>
      <nav class="home-drawer-categories" aria-label="${copy.allThemes}">${["all",...Object.keys(FURNITURE_CATALOG)].map(key=>`<button type="button" data-home-furniture-category="${key}" aria-pressed="${ui.category===key}" class="${ui.category===key?"on":""}">${copy[key]}</button>`).join("")}</nav>
      <div class="home-drawer-items" data-home-furniture-items></div><p data-home-furniture-empty hidden>${copy.empty}</p>
    </div>
  </section>`;
}
export function homeRoomBrowser(home,locale,translateLabel=value=>value){
  const copy=homeEditorCopy(locale);
  return `<section class="home-room-browser home-feature-panel" data-home-feature="room-info">
    <header><button type="button" class="home-feature-close" data-close-home-feature aria-label="${copy.rooms}">←</button><input type="search" data-room-search placeholder="${copy.searchRooms}" aria-label="${copy.searchRooms}"></header>
    <nav class="home-room-filters">${[0,...Array.from({length:Math.max(1,Number(home.floorCount)||1)},(_,i)=>i+1)].map(floor=>`<button type="button" data-room-filter="${floor}" class="${floor===0?"on":""}" aria-pressed="${floor===0}">${floor?copy.floor(floor):copy.all}</button>`).join("")}</nav>
    <div class="home-room-cards">${Object.entries(home.rooms||{}).map(([key,room])=>`<button type="button" class="home-room-card" data-room-info-edit="${escape(key)}" data-home-id="${escape(home.id)}" data-room-name="${escape(`${room.name||key} ${translateLabel(room.name||key)} ${copy[room.type]||""}`)}" data-room-floor="${Number(room.floor)||1}">${room.image||room.floorImage?`<img src="${escape(room.image||room.floorImage)}" alt="" loading="lazy">`:`<span class="home-room-preview" aria-hidden="true">${({living:"🛋️",bedroom:"🛏️",bath:"🛁",kitchen:"🍳",study:"📚"})[room.type]||"🚪"}</span>`}<b>${escape(room.name||key)}</b><small>${copy.floor(Number(room.floor)||1)} · ${copy.editRoom}</small></button>`).join("")}</div>
    <button type="button" class="home-room-add" data-add-room>＋ ${copy.addRoom}</button>
  </section>`;
}
export function homeMemberMenu(locale){
  const copy=homeEditorCopy(locale);
  return `<section class="home-feature-panel home-member-menu" data-home-feature="members"><button type="button" class="home-feature-close" data-close-home-feature aria-label="${copy.members}">×</button><h2>${copy.members}</h2>${[["residents",copy.residents],["pets",copy.pets],["cars",copy.cars]].map(([key,label])=>`<button type="button" data-open-home-feature="${key}">${label} →</button>`).join("")}</section>`;
}
export function bindHomeEditorUI(root,{state,addFurniture,openRoom,selectAdded}){
  const copy=homeEditorCopy(state.uiLanguage);
  root.querySelectorAll("[data-room-info-edit]").forEach(button=>button.onclick=()=>openRoom(button.dataset.homeId,button.dataset.roomInfoEdit));
  root.querySelectorAll(".home-room-browser").forEach(panel=>{
    let floor=0;const search=panel.querySelector("[data-room-search]");
    const filter=()=>panel.querySelectorAll("[data-room-info-edit]").forEach(card=>{card.hidden=Boolean((floor&&Number(card.dataset.roomFloor)!==floor)||!card.dataset.roomName.toLocaleLowerCase().includes(search.value.trim().toLocaleLowerCase()))});
    search.oninput=filter;
    panel.querySelectorAll("[data-room-filter]").forEach(button=>button.onclick=()=>{floor=Number(button.dataset.roomFilter);panel.querySelectorAll("[data-room-filter]").forEach(item=>{const on=item===button;item.classList.toggle("on",on);item.setAttribute("aria-pressed",String(on))});filter()});
  });
  const drawer=root.querySelector("[data-home-furniture-drawer]");if(!drawer)return;
  const home=state.homes[drawer.dataset.homeId];if(!home)return;
  const ui=drawerState(home),items=drawer.querySelector("[data-home-furniture-items]"),content=drawer.querySelector(".home-drawer-content");
  const draw=()=>{
    const catalog=ui.category==="all"?[...new Set(Object.values(FURNITURE_CATALOG).flat())]:FURNITURE_CATALOG[ui.category]||[];
    const query=ui.query.trim().toLocaleLowerCase(),matches=catalog.filter(item=>`${item} ${furnitureLabel(item,state.uiLanguage)}`.toLocaleLowerCase().includes(query));
    items.innerHTML=matches.map(item=>`<button type="button" data-home-add-furniture="${escape(item)}" ${ui.room?"":"disabled"}>${furniturePickerArt(item)}<b>${escape(furnitureLabel(item,state.uiLanguage))}</b></button>`).join("");
    drawer.querySelector("[data-home-furniture-empty]").hidden=matches.length>0;
    items.querySelectorAll("[data-home-add-furniture]").forEach(button=>button.onclick=()=>{const id=addFurniture(home.id,ui.room,button.dataset.homeAddFurniture);if(id)selectAdded(home.id,ui.room,id)});
  };
  drawer.querySelector("[data-home-drawer-toggle]").onclick=event=>{
    ui.collapsed=!ui.collapsed;drawer.classList.toggle("is-collapsed",ui.collapsed);content.inert=ui.collapsed;
    event.currentTarget.textContent=ui.collapsed?"▲":"▼";event.currentTarget.setAttribute("aria-expanded",String(!ui.collapsed));event.currentTarget.setAttribute("aria-label",ui.collapsed?copy.expand:copy.collapse);
  };
  drawer.querySelector("[data-home-furniture-search]").oninput=event=>{ui.query=event.target.value;draw()};
  drawer.querySelector("[data-home-furniture-room]").onchange=event=>{ui.room=event.target.value;draw()};
  drawer.querySelectorAll("[data-home-furniture-category]").forEach(button=>button.onclick=()=>{
    ui.category=button.dataset.homeFurnitureCategory;
    drawer.querySelectorAll("[data-home-furniture-category]").forEach(item=>{const on=item===button;item.classList.toggle("on",on);item.setAttribute("aria-pressed",String(on))});draw();
  });
  draw();
}

// A contain image has letterboxing inside its grid footprint. Use its painted
// rectangle for the selection outline, not the transparent footprint.
export function fitFurnitureSelection(element){
  const image=element.querySelector(".couple-bed-base");
  if(!image?.naturalWidth)return;
  const width=element.clientWidth,height=element.clientHeight,ratio=image.naturalWidth/image.naturalHeight;
  const paintedWidth=Math.min(width,height*ratio),paintedHeight=Math.min(height,width/ratio);
  element.style.setProperty("--selection-inset-x",`${Math.max(0,(width-paintedWidth*1.05)/2)}px`);
  element.style.setProperty("--selection-inset-y",`${Math.max(0,(height-paintedHeight*1.05)/2)}px`);
}
