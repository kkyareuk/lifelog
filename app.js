import {state, active, save, replaceState, createCharacter, setActive, setActiveHome, updateCharacter, toggleChip, addRelationship, updateRelationship, setHomeImage, setPlaceImage, setCharacterImage, setWorldBackground, addPlace, movePlace, resetAll, cloneState} from "./state.js";
import {eventFor, charactersAtPlace, homeGroups} from "./simulation.js";
import {renderApp, setAccountLabel} from "./views.js";

let pendingImage=null;
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];

function render(){
  renderApp(state);
  bind();
  applyTheme();
}

function applyTheme(){
  const c=active();
  const primary=c?.theme?.primary||"#176b60";
  const secondary=c?.theme?.gradient?(c.theme.secondary||primary):primary;
  document.documentElement.style.setProperty("--p",primary);
  document.documentElement.style.setProperty("--s",secondary);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content",primary);
}

function bind(){
  $$("[data-tab]").forEach(el=>el.onclick=()=>{state.activeTab=el.dataset.tab;save();render()});
  $$("[data-new]").forEach(el=>el.onclick=()=>{createCharacter();render()});
  $$("[data-edit]").forEach(el=>el.onclick=()=>{setActive(el.dataset.edit);render()});
  $$("[data-roster],[data-person]").forEach(el=>el.onclick=()=>focusCharacter(el.dataset.roster||el.dataset.person));
  $$("[data-home-person]").forEach(el=>el.onclick=()=>focusHomeCharacter(el.dataset.homePerson));
  $$("[data-home-select]").forEach(el=>el.onclick=()=>{setActiveHome(el.dataset.homeSelect);render()});
  $$("[data-field]").forEach(el=>el.oninput=()=>updateCharacter(active().id,{[el.dataset.field]:el.value},false));
  $$("[data-color]").forEach(el=>el.oninput=()=>{updateCharacter(active().id,{theme:{...active().theme,[el.dataset.color]:el.value}},false);applyTheme()});
  $("[data-gradient]")?.addEventListener("change",e=>{updateCharacter(active().id,{theme:{...active().theme,gradient:e.target.checked}},false);applyTheme()});
  $$("[data-chip]").forEach(el=>el.onclick=()=>{toggleChip(active().id,el.dataset.chip,el.dataset.value);render()});
  $("[data-save]")?.addEventListener("click",()=>{save(true);render()});
  $$("[data-image]").forEach(el=>el.onclick=()=>pickImage(el.dataset.image,active().id));
  $$("[data-room-bg]").forEach(el=>el.onclick=()=>pickImage("room",el.dataset.homeId,el.dataset.room));
  $$("[data-place-image]").forEach(el=>el.onclick=()=>pickImage("place",el.dataset.placeImage));
  $$("[data-image-url]").forEach(el=>el.onclick=()=>useImageUrl(el.dataset.imageUrl,el.dataset.id,el.dataset.room||""));
  $$("[data-clear-room-bg]").forEach(el=>el.onclick=()=>{setHomeImage(el.dataset.homeId,el.dataset.room,"");render()});
  $$("[data-clear-place-image]").forEach(el=>el.onclick=()=>{setPlaceImage(el.dataset.clearPlaceImage,"");render()});
  $("#account")?.addEventListener("click",()=>window.ParallelCityAuth?.toggle());
  $("[data-world-bg]")?.addEventListener("change",e=>{setWorldBackground(e.target.value);render()});
  $("[data-world-name]")?.addEventListener("input",e=>{state.world.name=e.target.value;save()});
  $("[data-add-place]")?.addEventListener("click",()=>{addPlace();render()});
  $("[data-add-rel]")?.addEventListener("click",()=>openRelationDialog());
  $$("[data-edit-rel]").forEach(el=>el.onclick=()=>openRelationDialog(el.dataset.editRel));
  $("[data-reset]")?.addEventListener("click",()=>{if(confirm("모든 기기 저장 데이터를 지울까요?")){resetAll();render()}});
  if(state.activeTab==="town")bindPlaceDrag();
}

function useImageUrl(type,id,room){
  const value=prompt("이미지 주소를 붙여 넣어 주세요 (https://...)","");
  if(!value)return;
  try{
    const url=new URL(value,location.href);
    if(!["http:","https:","data:"].includes(url.protocol))throw new Error();
    if(type==="room")setHomeImage(id,room,value);
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
    const max=["room","place"].includes(task.type)?1400:task.type==="icon"?700:900;
    const mime=task.type==="icon"?"image/png":"image/webp";
    const data=await resizeImage(file,max,mime);
    if(task.type==="room")setHomeImage(task.id,task.room,data);
    else if(task.type==="place")setPlaceImage(task.id,data);
    else setCharacterImage(task.id,task.type,data);
    render();
  }catch(err){
    console.error(err);
    alert("사진을 저장하지 못했어요. 다른 사진으로 다시 시도해 주세요.");
  }
};

function resizeImage(file,max,mime){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onerror=reject;
    reader.onload=()=>{
      const img=new Image();
      img.onerror=reject;
      img.onload=()=>{
        const ratio=Math.min(1,max/Math.max(img.width,img.height));
        const canvas=document.createElement("canvas");
        canvas.width=Math.max(1,Math.round(img.width*ratio));
        canvas.height=Math.max(1,Math.round(img.height*ratio));
        canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);
        resolve(canvas.toDataURL(mime,mime==="image/png"?undefined:.72));
      };
      img.src=reader.result;
    };
    reader.readAsDataURL(file);
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
  mediaChanged:()=>render()
};

window.addEventListener("parallel-city-cloud-loaded",render);
setInterval(()=>{if(["observe","home"].includes(state.activeTab))render()},60000);
render();
