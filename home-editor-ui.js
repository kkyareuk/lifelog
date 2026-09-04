import {FURNITURE_CATALOG,furnitureLabel,furnitureIcon} from "./furniture-layout.js?v=20260904home210";

const escape=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const COPY={
  ko:{back:"뒤로",add:"추가",homePhoto:"집 사진 변경",terrain:"마을 지형 · 기후",owner:"소유 캐릭터/단체",rooms:"방 정보",searchRooms:"방 검색",all:"전체",addRoom:"방 추가",editRoom:"방 편집",searchFurniture:"가구 검색",allThemes:"모든 테마 보기",collapse:"가구창 접기",expand:"가구창 펼치기",members:"구성원",residents:"구성원",pets:"반려생물",cars:"차",editHome:"집 정보 편집하기",summary:"요약",logs:"로그",front:"정면",left:"왼쪽",right:"오른쪽",flip:"좌우반전",direction:"방향",missingSide:"옆모습 그림 준비 중 · 정면 그림 표시",assign:"침대 지정",empty:"검색 결과가 없어요.",floor:n=>`${n}층`,living:"거실",kitchen:"주방",entry:"현관",bath:"욕실",bedroom:"침실",study:"서재",dining:"식당",nursery:"아기방",guest:"손님방",hobby:"취미방",balcony:"발코니",storage:"창고",other:"기타"},
  en:{back:"Back",add:"Add",homePhoto:"Change home photo",terrain:"Town terrain · climate",owner:"Owner / group",rooms:"Rooms",searchRooms:"Search rooms",all:"All",addRoom:"Add room",editRoom:"Edit room",searchFurniture:"Search furniture",allThemes:"All themes",collapse:"Collapse furniture",expand:"Expand furniture",members:"Members",residents:"Resident list",pets:"Pets",cars:"Cars",editHome:"Edit home information",summary:"Summary",logs:"Logs",front:"Front",left:"Left",right:"Right",flip:"Flip",direction:"Facing",missingSide:"Side artwork pending · showing front",assign:"Assign bed",empty:"No results.",floor:n=>`Floor ${n}`,living:"Living",kitchen:"Kitchen",entry:"Entry",bath:"Bath",bedroom:"Bedroom",study:"Study",dining:"Dining",nursery:"Nursery",guest:"Guest",hobby:"Hobby",balcony:"Balcony",storage:"Storage",other:"Other"},
  ja:{back:"戻る",add:"追加",homePhoto:"家の写真を変更",terrain:"村の地形・気候",owner:"所有者・団体",rooms:"部屋情報",searchRooms:"部屋を検索",all:"すべて",addRoom:"部屋を追加",editRoom:"部屋を編集",searchFurniture:"家具を検索",allThemes:"すべてのテーマ",collapse:"家具一覧を閉じる",expand:"家具一覧を開く",members:"メンバー",residents:"住人一覧",pets:"ペット",cars:"車",editHome:"家の情報を編集",summary:"まとめ",logs:"記録",front:"正面",left:"左向き",right:"右向き",flip:"左右反転",direction:"向き",missingSide:"横向きの絵は準備中・正面の絵を表示",assign:"ベッド指定",empty:"見つかりませんでした。",floor:n=>`${n}階`,living:"居間",kitchen:"キッチン",entry:"玄関",bath:"浴室",bedroom:"寝室",study:"書斎",dining:"食堂",nursery:"子供部屋",guest:"客室",hobby:"趣味の部屋",balcony:"バルコニー",storage:"物置",other:"その他"}
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
      <details class="home-drawer-search-panel"><summary>${copy.allThemes}</summary><div class="home-drawer-search"><input type="search" data-home-furniture-search value="${escape(ui.query)}" placeholder="${copy.searchFurniture}" aria-label="${copy.searchFurniture}"><select data-home-furniture-room aria-label="${copy.rooms}">${Object.entries(home.rooms||{}).filter(([,room])=>(Number(room.floor)||1)===(Number(home.activeFloor)||1)).map(([key,room])=>`<option value="${escape(key)}" ${key===ui.room?"selected":""}>${escape(room.name||key)}</option>`).join("")}</select></div></details>
      <nav class="home-drawer-categories" aria-label="${copy.allThemes}">${["all",...Object.keys(FURNITURE_CATALOG)].map(key=>`<button type="button" data-home-furniture-category="${key}" aria-pressed="${ui.category===key}" class="${ui.category===key?"on":""}">${copy[key]}</button>`).join("")}</nav>
      <div class="home-drawer-items" data-home-furniture-items></div><p data-home-furniture-empty hidden>${copy.empty}</p>
    </div>
  </section>`;
}
export function homeRoomBrowser(home,locale,translateLabel=value=>value){
  const copy=homeEditorCopy(locale);
  return `<section class="home-room-browser home-feature-panel" data-home-feature="room-info">
    <header><button type="button" class="home-feature-close" data-close-home-feature aria-label="${copy.back}">←</button><input type="search" data-room-search placeholder="${copy.searchRooms}" aria-label="${copy.searchRooms}"></header>
    <nav class="home-room-filters">${[0,...Array.from({length:Math.max(1,Number(home.floorCount)||1)},(_,i)=>i+1)].map(floor=>`<button type="button" data-room-filter="${floor}" class="${floor===0?"on":""}" aria-pressed="${floor===0}">${floor?copy.floor(floor):copy.all}</button>`).join("")}</nav>
    <div class="home-room-cards">${Object.entries(home.rooms||{}).map(([key,room])=>`<button type="button" class="home-room-card" data-room-info-edit="${escape(key)}" data-home-id="${escape(home.id)}" data-room-name="${escape(`${room.name||key} ${translateLabel(room.name||key)} ${copy[room.type]||""}`)}" data-room-floor="${Number(room.floor)||1}">${room.image||room.floorImage?`<img src="${escape(room.image||room.floorImage)}" alt="" loading="lazy">`:`<span class="home-room-preview" aria-hidden="true">${({living:"🛋️",bedroom:"🛏️",bath:"🛁",kitchen:"🍳",study:"📚"})[room.type]||"🚪"}</span>`}<b>${escape(room.name||key)}</b></button>`).join("")}</div>
    <button type="button" class="home-room-add" data-add-room><img src="assets/character-ui/add.png" alt=""><span>${copy.addRoom}</span></button>
  </section>`;
}
export function homeMemberMenu(home,characters,locale){
  const c=homeEditorCopy(locale),card=(kind,item,art)=>`<button type="button" class="home-member-card" data-member-edit="${kind}" data-member-id="${escape(item.id)}" data-home-id="${escape(home.id)}">${art?`<img src="${escape(art)}" alt="">`:`<span aria-hidden="true">${kind==="resident"?escape(item.name?.slice(0,1)||"?"):kind==="pet"?"🐾":"🚙"}</span>`}<b>${escape(item.name)}</b></button>`;
  return `<section class="home-feature-panel home-design-page home-members" data-home-feature="members"><header class="home-design-head"><button type="button" class="home-design-back" data-close-home-feature aria-label="${c.back}"></button><h2>${c.members}</h2></header>${[
    ["resident",c.members,characters.map(p=>card("resident",p,p.icon||p.photo)).join("")],
    ["pet",c.pets,(home.pets||[]).map(p=>card("pet",p,p.photo||p.icon)).join("")],
    ["car",c.cars,(home.cars||[]).map(p=>card("car",p,p.image)).join("")]
  ].map(([kind,label,cards])=>`<section class="home-member-section"><h3>${label}</h3><div class="home-member-grid">${cards}<button type="button" class="home-member-card home-member-add" data-member-add="${kind}" data-home-id="${escape(home.id)}"><span>＋</span><b>${c.add}</b></button></div></section>`).join("")}</section>`;
}
export function homeInformationMarkup(home,photo,state,t){
  const c=homeEditorCopy(state.uiLanguage),id=escape(home.id);
  const select=(key,label,values)=>`<label>${label}<select data-home-field="${key}" data-home-id="${id}">${[...new Set([...(home[key]?[home[key]]:[]),...values])].map(v=>`<option value="${escape(v)}" ${v===home[key]?"selected":""}>${escape(t(v,v))}</option>`).join("")}</select></label>`;
  return `<section class="home-feature-panel home-design-page home-design-info" data-home-feature="house-info">
    <header class="home-design-head"><button type="button" class="home-design-back" data-close-home-feature aria-label="${c.back}"></button><h2>${escape(home.name)}</h2></header>
    <button type="button" class="home-design-photo" data-home-building-shape="${id}" aria-label="${c.homePhoto}"><img src="${escape(photo)}" alt=""></button>
    <div class="home-design-fields">
      <label class="wide">${t("집 이름","집 이름")}<input data-home-name data-home-id="${id}" value="${escape(home.name)}" maxlength="80"></label>
      <div>${select("kind",t("집 유형","집 유형"),["일반 주거","본가","별채","주말집","업무용 숙소","공동 주거","기숙사","사택","기타"])}${select("ownershipType",`<span class="sr-only">${t("거주 방식","거주 방식")}</span>`,["설정하지 않음","자가","전세","월세","기숙사","사택","무상 거주","임시 거주","기타"])}</div>
      <label>${t("마을","마을")}<select data-home-field="townId" data-home-id="${id}">${state.towns.map(town=>`<option value="${escape(town.id)}" ${town.id===home.townId?"selected":""}>${escape(town.name)}</option>`).join("")}</select></label>
      ${select("exteriorStyle",t("집 스타일","집 스타일"),["설정하지 않음","현대적","미니멀","모던","유럽풍","클래식","빈티지","한옥풍","일본식","지중해풍","전원주택풍","고딕","미래적","기타"])}
      <label>${t("건물 층수","건물 층수")}<select data-home-floor-count data-home-id="${id}">${[1,2,3,4,5].map(n=>`<option value="${n}" ${n===(home.floorCount||1)?"selected":""}>${c.floor(n)}</option>`).join("")}</select></label>
      ${select("beautyLevel",t("집의 아름다운 정도","집의 아름다운 정도"),["매우 소박함","소박함","평범함","보기 좋음","아름다움","눈에 띄게 아름다움"])}
      ${select("ownerKind",t("소유자 종류","소유자 종류"),["설정하지 않음","캐릭터","기타 인물","단체","공동 소유","기타"])}
      <label>${c.terrain}<span class="home-design-readonly">${escape([state.towns.find(town=>town.id===home.townId)?.terrain,state.towns.find(town=>town.id===home.townId)?.climate].filter(Boolean).map(v=>t(v,v)).join(" · ")||t("설정하지 않음","설정하지 않음"))}</span></label>
      <label>${c.owner}<select data-home-field="ownerCharacterId" data-home-id="${id}" ${home.ownerKind!=="캐릭터"?"hidden":""}><option value="">${t("설정하지 않음","설정하지 않음")}</option>${state.order.map(cid=>`<option value="${escape(cid)}" ${cid===home.ownerCharacterId?"selected":""}>${escape(state.characters[cid]?.name||"")}</option>`).join("")}</select><input data-home-field="ownerName" data-home-id="${id}" aria-label="${c.owner}" value="${escape(home.ownerName||"")}" ${home.ownerKind==="캐릭터"?"hidden":""}></label>
    </div></section>`;
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
