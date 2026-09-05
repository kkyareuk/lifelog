import {FURNITURE_CATALOG,furnitureLabel,furnitureIcon,furnitureFootprint,snapFurniturePosition,furnitureGridForRoom} from "./furniture-layout.js?v=20260906dev230";

const escape=value=>String(value??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const COPY={
  ko:{editFurniture:"선택한 가구 편집",furniture:"가구",smaller:"가구 작게",larger:"가구 크게",backward:"가구 뒤로",forward:"가구 앞으로",remove:"삭제",done:"완료",destination:"설치할 방",moveRoom:"다른 방으로 이동",categoryFilter:"방 종류",typeFilter:"가구 종류",beds:"침대",sinks:"세면대",tables:"식탁·책상",seating:"의자·소파",cabinets:"수납",appliances:"가전",decor:"장식",misc:"기타",back:"뒤로",add:"추가",homePhoto:"집 사진 변경",terrain:"마을 지형 · 기후",owner:"소유 캐릭터/단체",rooms:"방 정보",searchRooms:"방 검색",all:"전체",addRoom:"방 추가",editRoom:"방 편집",searchFurniture:"가구 검색",save:"저장",collapse:"가구창 접기",expand:"가구창 펼치기",members:"구성원",residents:"구성원",pets:"반려생물",cars:"차",editHome:"집 정보 편집하기",summary:"요약",logs:"로그",front:"정면",left:"왼쪽",right:"오른쪽",flip:"좌우반전",direction:"방향",missingSide:"옆모습 그림 준비 중 · 정면 그림 표시",assign:"침대 지정",empty:"검색 결과가 없어요.",floor:n=>`${n}층`,living:"거실",kitchen:"주방",entry:"현관",bath:"욕실",bedroom:"침실",study:"서재",dining:"식당",nursery:"아기방",guest:"손님방",hobby:"취미방",balcony:"발코니",storage:"창고",other:"기타"},
  en:{editFurniture:"Edit selected furniture",furniture:"Furniture",smaller:"Make smaller",larger:"Make larger",backward:"Send backward",forward:"Bring forward",remove:"Delete",done:"Done",destination:"Place in room",moveRoom:"Move to another room",categoryFilter:"Room categories",typeFilter:"Furniture types",beds:"Beds",sinks:"Sinks",tables:"Tables",seating:"Seating",cabinets:"Storage",appliances:"Appliances",decor:"Decor",misc:"Other",back:"Back",add:"Add",homePhoto:"Change home photo",terrain:"Town terrain · climate",owner:"Owner / group",rooms:"Rooms",searchRooms:"Search rooms",all:"All",addRoom:"Add room",editRoom:"Edit room",searchFurniture:"Search furniture",save:"Save",collapse:"Collapse furniture",expand:"Expand furniture",members:"Members",residents:"Resident list",pets:"Pets",cars:"Cars",editHome:"Edit home information",summary:"Summary",logs:"Logs",front:"Front",left:"Left",right:"Right",flip:"Flip",direction:"Facing",missingSide:"Side artwork pending · showing front",assign:"Assign bed",empty:"No results.",floor:n=>`Floor ${n}`,living:"Living",kitchen:"Kitchen",entry:"Entry",bath:"Bath",bedroom:"Bedroom",study:"Study",dining:"Dining",nursery:"Nursery",guest:"Guest",hobby:"Hobby",balcony:"Balcony",storage:"Storage",other:"Other"},
  ja:{editFurniture:"選んだ家具を編集",furniture:"家具",smaller:"小さくする",larger:"大きくする",backward:"奥に移動",forward:"手前に移動",remove:"削除",done:"完了",destination:"設置する部屋",moveRoom:"別の部屋に移動",categoryFilter:"部屋の種類",typeFilter:"家具の種類",beds:"ベッド",sinks:"洗面台",tables:"テーブル・机",seating:"椅子・ソファ",cabinets:"収納",appliances:"家電",decor:"装飾",misc:"その他",back:"戻る",add:"追加",homePhoto:"家の写真を変更",terrain:"村の地形・気候",owner:"所有者・団体",rooms:"部屋情報",searchRooms:"部屋を検索",all:"すべて",addRoom:"部屋を追加",editRoom:"部屋を編集",searchFurniture:"家具を検索",save:"保存",collapse:"家具一覧を閉じる",expand:"家具一覧を開く",members:"メンバー",residents:"住人一覧",pets:"ペット",cars:"車",editHome:"家の情報を編集",summary:"まとめ",logs:"記録",front:"正面",left:"左向き",right:"右向き",flip:"左右反転",direction:"向き",missingSide:"横向きの絵は準備中・正面の絵を表示",assign:"ベッド指定",empty:"見つかりませんでした。",floor:n=>`${n}階`,living:"居間",kitchen:"キッチン",entry:"玄関",bath:"浴室",bedroom:"寝室",study:"書斎",dining:"食堂",nursery:"子供部屋",guest:"客室",hobby:"趣味の部屋",balcony:"バルコニー",storage:"物置",other:"その他"}
};
export const homeEditorCopy=locale=>COPY[locale]||COPY.ko;
export const FURNITURE_TYPES=Object.freeze(["all","beds","sinks","tables","seating","cabinets","appliances","decor","misc"]);
export function furnitureType(item){
  if(/침대/.test(item))return "beds";
  if(item==="세면대")return "sinks";
  if(/식탁|책상|테이블|작업대|조리대|칵테일 바/.test(item))return "tables";
  if(/의자|소파/.test(item))return "seating";
  if(/선반|책장|진열|수납장|신발장|찬장|와인장|상자|옷장|옷걸이|협탁/.test(item))return "cabinets";
  if(/TV|오디오|냉장고|오븐|머신|세척기|세탁기|건조기|프로젝터|컴퓨터|게임기|플레이어|턴테이블|홈시어터/.test(item))return "appliances";
  if(/화분|인형|거울|독서등/.test(item))return "decor";
  return "misc";
}
export function filteredFurniture({category="all",type="all",query=""}={},locale="ko"){
  const catalog=category==="all"?[...new Set(Object.values(FURNITURE_CATALOG).flat())]:FURNITURE_CATALOG[category]||[];
  const search=query.trim().toLocaleLowerCase();
  return catalog.filter(item=>(type==="all"||furnitureType(item)===type)&&`${item} ${furnitureLabel(item,locale)}`.toLocaleLowerCase().includes(search));
}
const drawerStates=new Map();
const drawerState=home=>{
  if(!drawerStates.has(home.id))drawerStates.set(home.id,{collapsed:false,query:"",category:"all",type:"all",room:""});
  const state=drawerStates.get(home.id),keys=Object.keys(home.rooms||{});
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
      <div class="home-drawer-search"><input type="search" data-home-furniture-search value="${escape(ui.query)}" placeholder="${copy.searchFurniture}" aria-label="${copy.searchFurniture}"></div>
      <nav class="home-drawer-categories home-drawer-types" aria-label="${copy.typeFilter}">${FURNITURE_TYPES.map(key=>`<button type="button" data-home-furniture-type="${key}" aria-pressed="${ui.type===key}" class="${ui.type===key?"on":""}">${copy[key]}</button>`).join("")}</nav>
      <div class="home-drawer-results"><div class="home-drawer-items" data-home-furniture-items></div><p data-home-furniture-empty hidden role="status">${copy.empty}</p></div>
    </div>
  </section>`;
}
export function homeRoomBrowser(home,locale,translateLabel=value=>value){
  const copy=homeEditorCopy(locale);
  return `<section class="home-room-browser home-feature-panel" data-home-feature="room-info">
    <header><button type="button" class="home-feature-close" data-close-home-feature aria-label="${copy.back}">←</button><input type="search" data-room-search placeholder="${copy.searchRooms}" aria-label="${copy.searchRooms}"></header>
    <nav class="home-room-filters">${[0,...Array.from({length:Math.max(1,Number(home.floorCount)||1)},(_,i)=>i+1)].map(floor=>`<button type="button" data-room-filter="${floor}" class="${floor===0?"on":""}" aria-pressed="${floor===0}">${floor?copy.floor(floor):copy.all}</button>`).join("")}</nav>
    <div class="home-catalog-paper"><div class="home-room-cards">${Object.entries(home.rooms||{}).map(([key,room])=>`<button type="button" class="home-room-card" data-room-info-edit="${escape(key)}" data-home-id="${escape(home.id)}" data-room-name="${escape(`${room.name||key} ${translateLabel(room.name||key)} ${copy[room.type]||""}`)}" data-room-floor="${Number(room.floor)||1}"><span class="home-catalog-photo">${room.image||room.floorImage?`<img src="${escape(room.image||room.floorImage)}" alt="" loading="lazy">`:`<span class="home-room-preview" aria-hidden="true">${({living:"🛋️",bedroom:"🛏️",bath:"🛁",kitchen:"🍳",study:"📚"})[room.type]||"🚪"}</span>`}</span><b>${escape(translateLabel(room.name||key))}</b></button>`).join("")}</div>
    <button type="button" class="home-room-add" data-add-room><img src="assets/character-ui/add.png" alt=""><span>${copy.addRoom}</span></button>
  </div></section>`;
}
export function homeMemberMenu(home,characters,locale){
  const c=homeEditorCopy(locale),card=(kind,item,art)=>`<button type="button" class="home-member-card" data-member-edit="${kind}" data-member-id="${escape(item.id)}" data-home-id="${escape(home.id)}"><span class="home-catalog-photo">${art&&(/^(?:https?:|data:image\/|blob:|\.?\.?\/|assets\/|theme-assets\/)/i.test(art)||/^[^:\s]+\.(?:png|jpe?g|webp|gif|svg|avif)(?:[?#].*)?$/i.test(art))?`<img class="${kind==="resident"&&!item.icon&&item.photo?"profile-photo-fallback":""}" src="${escape(art)}" alt="" loading="lazy">`:`<span aria-hidden="true">${kind==="resident"?escape(item.name?.slice(0,1)||"?"):kind==="pet"?"🐾":"🚙"}</span>`}</span><b>${escape(item.name)}</b></button>`;
  return `<section class="home-feature-panel home-design-page home-members" data-home-feature="members"><header class="home-design-head"><button type="button" class="home-design-back" data-close-home-feature aria-label="${c.back}"></button><h2>${c.members}</h2></header>${[
    ["resident",c.members,characters.map(p=>card("resident",p,p.icon||p.photo)).join("")],
    ["pet",c.pets,(home.pets||[]).map(p=>card("pet",p,p.icon||p.photo)).join("")],
    ["car",c.cars,(home.cars||[]).map(p=>card("car",p,p.image)).join("")]
  ].map(([kind,label,cards])=>`<section class="home-member-section"><h3>${label}</h3><div class="home-member-grid">${cards}<button type="button" class="home-member-card home-member-add" data-member-add="${kind}" data-home-id="${escape(home.id)}"><span class="home-catalog-photo home-add-symbol">＋</span><b>${c.add}</b></button></div></section>`).join("")}</section>`;
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
    </div><div class="editor-save-actions"><button type="button" class="primary" data-editor-save>${c.save}</button></div></section>`;
}

let bedLayoutObserver;
// Pillow positions use the painted contain-image, not percentages of the room.
// Recalculate only on layout/image changes (including tablet rotation).
export function fitCoupleBedOccupants(root){
  bedLayoutObserver?.disconnect();
  const people=[...root.querySelectorAll('.is-using-couple-bed[data-couple-bed-id]')],statuses=[...root.querySelectorAll('.home-bed-foreground-status[data-bed-status-for]')];
  const layout=()=>people.forEach(person=>{
    if(!person.isConnected)return;
    const room=person.closest('.room'),bed=room?.querySelector(`[data-furniture-placement="${CSS.escape(person.dataset.coupleBedId)}"]`),image=bed?.querySelector('.couple-bed-base');
    if(!image?.naturalWidth||!bed.clientWidth||!bed.clientHeight)return;
    const width=bed.clientWidth,height=bed.clientHeight,ratio=image.naturalWidth/image.naturalHeight;
    const paintedWidth=Math.min(width,height*ratio),paintedHeight=paintedWidth/ratio;
    const style=getComputedStyle(bed),flip=Number(style.getPropertyValue('--furniture-flip'))||1;
    const x=width/2+(Number(person.dataset.bedSlot)===0?-.18:.18)*paintedWidth*1.05*flip;
    // Sleeping occupants sit across the quilt edge: the upper part stays on
    // the pillow and the lower part is actually covered by the foreground quilt.
    const underCover=person.classList.contains('is-under-cover');
    const y=height/2-(underCover?.225:.29)*paintedHeight*1.05;
    const [ox,oy]=style.transformOrigin.split(' ').map(parseFloat);
    const point=new DOMMatrix(style.transform).transformPoint(new DOMPoint(x-ox,y-oy));
    const parent=person.offsetParent,layer=bed.offsetParent;
    person.style.setProperty('--life-x',`${bed.offsetLeft+layer.offsetLeft+ox+point.x-parent.offsetLeft}px`);
    person.style.setProperty('--life-y',`${bed.offsetTop+layer.offsetTop+oy+point.y-parent.offsetTop}px`);
    person.style.setProperty('--bed-face-size',`${Math.max(underCover?46:36,Math.min(underCover?64:56,paintedWidth*(underCover?.32:.28)*(Number(style.getPropertyValue('--furniture-scale'))||1)))}px`);
  });
  const layoutStatuses=()=>statuses.forEach(status=>{
    if(!status.isConnected)return;
    const room=status.closest('.room'),bed=room?.querySelector(`[data-furniture-placement="${CSS.escape(status.dataset.bedStatusFor)}"]`),image=bed?.querySelector('.couple-bed-base');
    if(!image?.naturalWidth||!bed.clientWidth||!bed.clientHeight)return;
    const width=bed.clientWidth,height=bed.clientHeight,ratio=image.naturalWidth/image.naturalHeight;
    const paintedWidth=Math.min(width,height*ratio),paintedHeight=paintedWidth/ratio,style=getComputedStyle(bed);
    const x=width/2,y=height/2+.36*paintedHeight*1.05,[ox,oy]=style.transformOrigin.split(' ').map(parseFloat);
    const point=new DOMMatrix(style.transform).transformPoint(new DOMPoint(x-ox,y-oy)),parent=status.offsetParent,layer=bed.offsetParent;
    status.style.setProperty('--bed-status-x',`${bed.offsetLeft+layer.offsetLeft+ox+point.x-parent.offsetLeft}px`);
    status.style.setProperty('--bed-status-y',`${bed.offsetTop+layer.offsetTop+oy+point.y-parent.offsetTop}px`);
  });
  const fit=()=>{layout();layoutStatuses()};
  if(!people.length&&!statuses.length)return;
  bedLayoutObserver=new ResizeObserver(fit);
  new Set([...people.map(person=>person.closest('.room')),...statuses.map(status=>status.closest('.room'))]).forEach(room=>{
    if(!room)return;bedLayoutObserver.observe(room);
    room.querySelectorAll('.couple-bed-base').forEach(image=>{if(!image.complete)image.addEventListener('load',fit,{once:true})});
  });
  fit();
}

export function bindHomeEditorUI(root,{state,addFurniture,updateFurniture,openRoom,selectAdded}){
  fitCoupleBedOccupants(root);
  const copy=homeEditorCopy(state.uiLanguage);
  root.querySelectorAll('.home-catalog-photo img').forEach(image=>{
    const fallback=()=>{const marker=document.createElement('span');marker.textContent=image.closest('[data-member-edit="car"]')?'🚙':image.closest('[data-member-edit="pet"]')?'🐾':image.closest('[data-member-edit="resident"]')?'?':'🚪';marker.setAttribute('aria-hidden','true');image.replaceWith(marker)};
    image.onerror=fallback;if(image.complete&&!image.naturalWidth)fallback();
  });
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
    const matches=filteredFurniture({...ui,category:"all"},state.uiLanguage);
    items.innerHTML=matches.map(item=>`<button type="button" data-home-add-furniture="${escape(item)}" ${ui.room?"":"disabled"}>${furniturePickerArt(item)}<b>${escape(furnitureLabel(item,state.uiLanguage))}</b></button>`).join("");
    drawer.querySelector("[data-home-furniture-empty]").hidden=matches.length>0;
    items.querySelectorAll("[data-home-add-furniture]").forEach(button=>{
      let pointer=null,start=null,dragging=false,ghost=null,target=null,suppressClick=false;
      const canvas=root.querySelector('[data-room-canvas]');
      const clear=()=>{ghost?.remove();ghost=null;canvas?.querySelectorAll('.is-furniture-drop-target').forEach(el=>el.classList.remove('is-furniture-drop-target'))};
      const place=(roomKey,position)=>{
        const id=addFurniture(home.id,roomKey,button.dataset.homeAddFurniture);
        if(id){if(position)updateFurniture(home.id,roomKey,id,position);selectAdded(home.id,roomKey,id)}
      };
      button.onclick=()=>{
        if(suppressClick){suppressClick=false;return}
        // Keyboard/tap fallback: start in a visible room, never a hidden floor.
        const room=canvas?.querySelector('.room[data-room-key]');if(room)place(room.dataset.roomKey);
      };
      button.onpointerdown=event=>{
        if(event.button!==0||pointer!==null)return;
        pointer=event.pointerId;start={x:event.clientX,y:event.clientY};dragging=false;target=null;suppressClick=false;
        button.setPointerCapture(pointer);
      };
      button.onpointermove=event=>{
        if(event.pointerId!==pointer||!canvas)return;
        if(!dragging&&Math.hypot(event.clientX-start.x,event.clientY-start.y)<8)return;
        dragging=true;event.preventDefault();target?.classList.remove('is-furniture-drop-target');
        if(!ghost){ghost=document.createElement('div');ghost.className='furniture-catalog-drag-preview';ghost.innerHTML=furniturePickerArt(button.dataset.homeAddFurniture);ghost.setAttribute('aria-hidden','true');document.body.append(ghost)}
        ghost.style.left=`${event.clientX}px`;ghost.style.top=`${event.clientY}px`;
        target=document.elementFromPoint(event.clientX,event.clientY)?.closest('.room[data-room-key]');
        if(!target||!canvas.contains(target)){target=null;return}
        target.classList.add('is-furniture-drop-target');
      };
      const finish=event=>{
        if(event.pointerId!==pointer)return;
        const captured=pointer;pointer=null;suppressClick=dragging;
        if(button.hasPointerCapture(captured))button.releasePointerCapture(captured);
        const destination=target;clear();target=null;
        if(event.type==='pointerup'&&dragging&&destination){
          const rect=destination.getBoundingClientRect();
          const position=snapFurniturePosition((event.clientX-rect.left)/rect.width*100,(event.clientY-rect.top)/rect.height*100,furnitureGridForRoom(rect,canvas.getBoundingClientRect()),furnitureFootprint(button.dataset.homeAddFurniture));
          place(destination.dataset.roomKey,position);
        }
      };
      button.onpointerup=finish;button.onpointercancel=finish;button.onlostpointercapture=finish;
    });
  };
  drawer.querySelector("[data-home-drawer-toggle]").onclick=event=>{
    ui.collapsed=!ui.collapsed;drawer.classList.toggle("is-collapsed",ui.collapsed);content.inert=ui.collapsed;
    event.currentTarget.textContent=ui.collapsed?"▲":"▼";event.currentTarget.setAttribute("aria-expanded",String(!ui.collapsed));event.currentTarget.setAttribute("aria-label",ui.collapsed?copy.expand:copy.collapse);
  };
  drawer.querySelector("[data-home-furniture-search]").oninput=event=>{ui.query=event.target.value;draw()};
  drawer.querySelectorAll("[data-home-furniture-type]").forEach(button=>button.onclick=()=>{
    ui.type=button.dataset.homeFurnitureType;
    drawer.querySelectorAll("[data-home-furniture-type]").forEach(item=>{const on=item===button;item.classList.toggle("on",on);item.setAttribute("aria-pressed",String(on))});draw();
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
