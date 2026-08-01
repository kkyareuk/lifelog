import {state, active, save, replaceState, createCharacter, setActive, setActiveHome, updateCharacter, toggleChip, addRelationship, updateRelationship, setHomeImage, setHomeBackground, setPlaceImage, setCharacterImage, setWorldBackground, addPlace, movePlace, updatePlace, resetAll, cloneState, setHomeEditMode, updateHome, updateRoom, toggleFurniture, setHomeResidents, moveCharacter, addCatalogItem, updateCatalogItem, deleteCatalogItem, toggleFavorite, togglePlaceStock, setCharacterPane, addTown, switchTown, deleteTown} from "./state.js?v=20260801c";
import {eventFor, visibleTimeline} from "./simulation.js?v=20260801c";
import {renderApp, setAccountLabel} from "./views.js?v=20260801c";

let pendingImage=null;
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];

function render(){
  renderApp(state);
  bind();
  applyTheme();
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
  const auth=window.ParallelCityAuth;
  if(auth?.getInfo?.().user) await auth.upload({silent:true,reason:label});
  else showToast("저장되었습니다");
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
  $$("[data-roster],[data-person]").forEach(el=>el.onclick=()=>focusCharacter(el.dataset.roster||el.dataset.person));
  $$("[data-home-person]").forEach(el=>el.onclick=()=>focusHomeCharacter(el.dataset.homePerson));
  $("[data-all-sleep-home]")?.addEventListener("click",()=>focusHomeCharacter(state.activeId||state.order[0]));
  $$("[data-home-select]").forEach(el=>el.onclick=()=>{setActiveHome(el.dataset.homeSelect);render()});
  $("[data-home-edit]")?.addEventListener("click",async()=>{const was=state.homeEditMode;setHomeEditMode(!was);was?await explicitSave("집 편집 저장"):render()});
  $$("[data-home-name]").forEach(el=>el.oninput=()=>updateHome(el.dataset.homeId,{name:el.value.trim()||"이름 없는 집"}));
  $$("[data-room-name]").forEach(el=>el.oninput=()=>updateRoom(el.dataset.homeId,el.dataset.roomName,{name:el.value.trim()||"방"}));
  $$("[data-furniture]").forEach(el=>el.onclick=()=>{toggleFurniture(el.dataset.homeId,el.dataset.room,el.dataset.furniture);render()});
  $$("[data-home-resident]").forEach(el=>el.onclick=()=>{
    const homeId=el.dataset.homeId,id=el.dataset.homeResident;
    const residents=state.order.filter(cid=>state.characters[cid].homeId===homeId);
    const next=residents.includes(id)?residents.filter(cid=>cid!==id):[...residents,id];
    if(!next.length){alert("집에는 최소 한 명이 거주해야 해요.");return}
    setHomeResidents(homeId,next);render();
  });
  $$("[data-field]").forEach(el=>el.oninput=()=>{
    const numeric=["spiceTolerance","sweetPreference"].includes(el.dataset.field);
    updateCharacter(active().id,{[el.dataset.field]:numeric?Number(el.value):el.value},false);
    if(el.dataset.levels){
      const labels=el.dataset.levels==="spice"
        ?["안 매움","살짝 매콤","순한맛","신라면 맵기","매운맛","아주 매운맛"]
        :["안 달음","은은한 단맛","적당히 달콤","달콤함","아주 달콤함","극강의 단맛"];
      el.closest("label")?.querySelector("[data-range-label]")?.replaceChildren(document.createTextNode(labels[Number(el.value)]));
    }
  });
  $$("[data-color]").forEach(el=>el.oninput=()=>{updateCharacter(active().id,{theme:{...active().theme,[el.dataset.color]:el.value}},false);applyTheme()});
  $("[data-gradient]")?.addEventListener("change",e=>{updateCharacter(active().id,{theme:{...active().theme,gradient:e.target.checked}},false);applyTheme()});
  $$("[data-chip]").forEach(el=>el.onclick=()=>{toggleChip(active().id,el.dataset.chip,el.dataset.value);render()});
  $$("[data-favorite-kind]").forEach(el=>el.onclick=()=>{toggleFavorite(active().id,el.dataset.favoriteKind,el.dataset.favoriteId);render()});
  $$("[data-add-catalog]").forEach(el=>el.onclick=()=>{addCatalogItem(el.dataset.addCatalog,{name:"새 항목",category:"기타"});render()});
  $$("[data-catalog-field]").forEach(el=>el.onchange=()=>{const value=["spicy","sweet"].includes(el.dataset.catalogField)?Number(el.value):el.value;updateCatalogItem(el.dataset.kind,el.dataset.item,{[el.dataset.catalogField]:value});render()});
  $$("[data-delete-catalog]").forEach(el=>el.onclick=()=>{if(confirm("이 항목을 삭제할까요?")){deleteCatalogItem(el.dataset.kind,el.dataset.deleteCatalog);render()}});
  $$("[data-place-stock]").forEach(el=>el.onclick=()=>{togglePlaceStock(el.dataset.placeStock,el.dataset.itemId);render()});
  $("[data-save]")?.addEventListener("click",()=>explicitSave("캐릭터 저장"));
  $("[data-catalog-save]")?.addEventListener("click",()=>explicitSave("취향 사전 저장"));
  $("[data-town-save]")?.addEventListener("click",()=>explicitSave("마을 저장"));
  $$("[data-image]").forEach(el=>el.onclick=()=>pickImage(el.dataset.image,active().id));
  $$("[data-room-bg]").forEach(el=>el.onclick=()=>pickImage("room",el.dataset.homeId,el.dataset.room));
  $$("[data-home-bg]").forEach(el=>el.onclick=()=>pickImage("home",el.dataset.homeBg));
  $$("[data-place-image]").forEach(el=>el.onclick=()=>pickImage("place",el.dataset.placeImage));
  $$("[data-image-url]").forEach(el=>el.onclick=()=>useImageUrl(el.dataset.imageUrl,el.dataset.id,el.dataset.room||""));
  $$("[data-clear-room-bg]").forEach(el=>el.onclick=()=>{setHomeImage(el.dataset.homeId,el.dataset.room,"");render()});
  $$("[data-clear-home-bg]").forEach(el=>el.onclick=()=>{setHomeBackground(el.dataset.clearHomeBg,"");render()});
  $$("[data-clear-place-image]").forEach(el=>el.onclick=()=>{setPlaceImage(el.dataset.clearPlaceImage,"");render()});
  $$("[data-character-pane]").forEach(el=>el.onclick=()=>{setCharacterPane(el.dataset.characterPane);render()});
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
      const numeric=["servicePrice","imageScale","spicy","sweet"].includes(field);
      updatePlace(el.dataset.placeId,{[field]:numeric?Number(el.value):el.value},false);
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
  $$("[data-log-detail]").forEach(el=>el.onclick=()=>openLogDetail(Number(el.dataset.logDetail)));
  $("[data-world-bg]")?.addEventListener("change",e=>{setWorldBackground(e.target.value);render()});
  $("[data-world-name]")?.addEventListener("input",e=>{state.world.name=e.target.value;save()});
  $$("[data-town-select]").forEach(el=>el.onclick=()=>{switchTown(el.dataset.townSelect);render()});
  $("[data-add-town]")?.addEventListener("click",()=>{addTown();render()});
  $$("[data-delete-town]").forEach(el=>el.onclick=()=>{if(confirm("이 마을을 삭제할까요?")){deleteTown(el.dataset.deleteTown);render()}});
  $("[data-add-place]")?.addEventListener("click",()=>{addPlace();render()});
  $("[data-add-rel]")?.addEventListener("click",()=>openRelationDialog());
  $$("[data-edit-rel]").forEach(el=>el.onclick=()=>openRelationDialog(el.dataset.editRel));
  $("[data-reset]")?.addEventListener("click",()=>{if(confirm("모든 기기 저장 데이터를 지울까요?")){resetAll();render()}});
  if(state.activeTab==="town")bindPlaceDrag();
}

function openLogDetail(index){
  const c=active(), entry=visibleTimeline(c)[index];
  if(!entry)return;
  const place=state.world.places.find(p=>p.id===entry.placeId);
  const item=Object.values(state.catalog||{}).flat().find(x=>x.id===entry.itemId);
  const image=item?.image||place?.image||state.world.bg;
  const modal=$("#log-modal");
  modal.hidden=false;
  modal.innerHTML=`<div class="log-dialog"><button data-close-log aria-label="닫기">×</button><time>${entry.time}</time><h2>${entry.title}</h2><p>${entry.desc||""}</p>${image?`<img src="${image}" alt="">`:""}<small>${place?`📍 ${place.name}`:"🏠 집"}</small></div>`;
  modal.onclick=e=>{if(e.target===modal||e.target.closest("[data-close-log]"))modal.hidden=true};
}

function useImageUrl(type,id,room){
  const value=prompt("이미지 주소를 붙여 넣어 주세요 (https://...)","");
  if(!value)return;
  try{
    const url=new URL(value,location.href);
    if(!["http:","https:","data:"].includes(url.protocol))throw new Error();
    if(type==="room")setHomeImage(id,room,value);
    else if(type==="home")setHomeBackground(id,value);
    else if(type==="place")setPlaceImage(id,value);
    else setCharacterImage(id,type,value);
    render();
  }catch{alert("올바른 이미지 주소를 입력해 주세요.");}
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
    if(task.type==="room")setHomeImage(task.id,task.room,data);
    else if(task.type==="home")setHomeBackground(task.id,data);
    else if(task.type==="place")setPlaceImage(task.id,data);
    else setCharacterImage(task.id,task.type,data);
    render();
  }catch(err){
    console.error(err);
    alert("사진을 저장하지 못했어요. 다른 사진으로 다시 시도해 주세요.");
  }
};

function cropImage(file,type){
  const square=["icon","photo"].includes(type);
  const output=square?700:1400;
  const ratio=square?1:16/9;
  return new Promise((resolve,reject)=>{
    const url=URL.createObjectURL(file),img=new Image();
    img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error("image-load-failed"))};
    img.onload=()=>{
      const dialog=document.createElement("dialog");
      dialog.className="crop-dialog";
      dialog.innerHTML=`<form method="dialog"><div class="title"><h2>사진 자르기</h2><button value="cancel" aria-label="닫기">×</button></div><div class="crop-stage" style="aspect-ratio:${ratio}"><canvas></canvas></div><label>확대<input name="zoom" type="range" min="1" max="3" step=".01" value="1"></label><label>가로 위치<input name="x" type="range" min="-100" max="100" value="0"></label><label>세로 위치<input name="y" type="range" min="-100" max="100" value="0"></label><small>사진을 확대하고 위치를 움직여 화면에 보일 부분을 맞춰 주세요.</small><div class="crop-actions"><button value="cancel">취소</button><button class="primary" value="apply">이대로 자르기</button></div></form>`;
      document.body.append(dialog);
      const canvas=dialog.querySelector("canvas"),ctx=canvas.getContext("2d");
      canvas.width=output;canvas.height=Math.round(output/ratio);
      const draw=()=>{
        const zoom=Number(dialog.querySelector('[name="zoom"]').value);
        const x=Number(dialog.querySelector('[name="x"]').value)/100;
        const y=Number(dialog.querySelector('[name="y"]').value)/100;
        const cover=Math.max(canvas.width/img.width,canvas.height/img.height)*zoom;
        const w=img.width*cover,h=img.height*cover;
        const maxX=Math.max(0,(w-canvas.width)/2),maxY=Math.max(0,(h-canvas.height)/2);
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(img,(canvas.width-w)/2-x*maxX,(canvas.height-h)/2-y*maxY,w,h);
      };
      dialog.querySelectorAll('input[type="range"]').forEach(input=>input.oninput=draw);
      dialog.onclose=()=>{
        const applied=dialog.returnValue==="apply";
        const data=applied?canvas.toDataURL(type==="icon"?"image/png":"image/webp",type==="icon"?undefined:.78):null;
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

function openRelationDialog(id=""){
  if(state.order.length<2)return alert("캐릭터가 두 명 이상 필요해요.");
  const old=id?state.relationships[id]:null;
  const dialog=document.createElement("dialog");
  dialog.className="relation-dialog";
  const options=state.order.map(cid=>`<option value="${cid}">${state.characters[cid].name}</option>`).join("");
  dialog.innerHTML=`<form method="dialog"><h2>${old?"관계 편집":"관계 추가"}</h2>
    <label>첫 번째 캐릭터<select name="a">${options}</select></label>
    <label>두 번째 캐릭터<select name="b">${options}</select></label>
    <label>관계<select name="type">${["친구","절친","연인","부부","가족","짝사랑","라이벌","혐관"].map(x=>`<option>${x}</option>`).join("")}</select></label>
    <label>친밀도 <output name="intimacyOut">75</output><input type="range" name="intimacy" min="0" max="100" value="75"></label>
    <label>갈등도 <output name="conflictOut">20</output><input type="range" name="conflict" min="0" max="100" value="20"></label>
    <label class="cohabit"><input type="checkbox" name="cohabit"> 함께 살기</label>
    <p class="hint">함께 살기를 켜면 집과 반려동물만 공유해요. 취향·관심사·테마는 각자 그대로 유지됩니다.</p>
    <div><button value="cancel">취소</button><button class="primary" value="save">저장</button></div>
  </form>`;
  document.body.append(dialog);
  const f=dialog.querySelector("form");
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
      if(f.a.value===f.b.value)alert("서로 다른 캐릭터를 골라 주세요.");
      else{
        const data={a:f.a.value,b:f.b.value,type:f.type.value,cohabit:f.cohabit.checked,intimacy:Number(f.intimacy.value),conflict:Number(f.conflict.value)};
        old?updateRelationship(id,data):addRelationship(data);
        render();
      }
    }
    dialog.remove();
  };
  dialog.showModal();
}

function bindPlaceDrag(){
  $$(".town-edit .place").forEach(el=>el.onpointerdown=e=>{
    el.setPointerCapture(e.pointerId);
    el.onpointermove=ev=>{
      const box=el.parentElement.getBoundingClientRect();
      movePlace(el.dataset.place,
        Math.max(4,Math.min(96,(ev.clientX-box.left)/box.width*100)),
        Math.max(5,Math.min(95,(ev.clientY-box.top)/box.height*100)),false);
      const p=state.world.places.find(x=>x.id===el.dataset.place);
      el.style.left=p.x+"%";el.style.top=p.y+"%";
    };
    el.onpointerup=()=>{el.onpointermove=null;save()};
  });
}

window.ParallelCity={
  getState:cloneState,
  replaceState:x=>{replaceState(x);render()},
  setAccountStatus:t=>setAccountLabel(t),
  toast:showToast,
  mediaChanged:()=>render()
};

window.addEventListener("parallel-city-cloud-loaded",render);
setInterval(()=>{if(["observe","home"].includes(state.activeTab))render()},60000);
render();
import("./auth.js?v=20260801c").catch(error=>{
  console.warn("로그인 기능을 불러오지 못했지만 게임은 계속 실행됩니다.",error);
  setAccountLabel("Google 로그인");
});
