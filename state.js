const KEY="parallel-city-game-v4";
const oldKey="parallel-city-game-v2";
const uid=()=>crypto.randomUUID?.()||`${Date.now()}-${Math.random()}`;
const clone=x=>JSON.parse(JSON.stringify(x));
const rooms=()=>({
  living:{name:"거실",image:"",furniture:["소파","TV","책장"]},
  kitchen:{name:"주방",image:"",furniture:["냉장고","조리대","식탁"]},
  entry:{name:"현관",image:"",furniture:["신발장","전신거울"]},
  bath:{name:"욕실",image:"",furniture:["샤워부스","세면대"]},
  bedroom:{name:"침실",image:"",furniture:["침대","옷장"]},
  study:{name:"서재·취미방",image:"",furniture:["책상","컴퓨터"]}
});
const fresh=()=>({schema:5,activeTab:"character",activeId:null,activeHomeId:null,homeEditMode:false,lastSaved:0,characters:{},order:[],homes:{},relationships:{},routines:{},dailyPlans:{},world:{name:"평행마을",bg:"world-assets/cozy-town.png",places:[
  {id:"cafe",name:"달무리 카페",type:"카페",emoji:"☕",image:"",x:15,y:34,color:"#74c7bd"},
  {id:"food",name:"달무리 식당",type:"음식점",emoji:"🍽️",image:"",x:55,y:22,color:"#86ca7b"},
  {id:"office",name:"평행 오피스",type:"회사",emoji:"🏢",image:"",x:79,y:37,color:"#8c9df0"},
  {id:"clinic",name:"새봄 의원",type:"병원",emoji:"🩺",image:"",x:21,y:68,color:"#6db7e8"},
  {id:"park",name:"별꼬리 공원",type:"공원",emoji:"🌳",image:"",x:64,y:76,color:"#66c68a"}
]}});

function migrate(x){
  if(!x)return fresh();
  if(x.schema===5)return normalizeHomes(x);
  if(x.schema===4){
    x.schema=5;x.homeEditMode=false;
    return normalizeHomes(x);
  }
  if(x.schema===3){
    x.schema=4;x.dailyPlans=x.dailyPlans||{};x.activeHomeId=x.activeHomeId||null;
    (x.world?.places||[]).forEach(p=>p.image=p.image||"");
    x.schema=5;x.homeEditMode=false;return normalizeHomes(x);
  }
  if(x.schema===2){
    x.schema=3;
    Object.values(x.homes||{}).forEach(h=>{h.rooms=h.rooms||rooms()});
    x.schema=4;x.dailyPlans={};x.activeHomeId=null;
    (x.world?.places||[]).forEach(p=>p.image=p.image||"");
    x.schema=5;x.homeEditMode=false;return normalizeHomes(x);
  }
  return fresh();
}
function normalizeHomes(x){
  const defaults=rooms();
  Object.values(x.homes||{}).forEach(h=>{
    h.rooms=h.rooms||{};
    Object.entries(defaults).forEach(([key,value])=>{
      h.rooms[key]={...value,...(h.rooms[key]||{})};
      h.rooms[key].furniture=Array.isArray(h.rooms[key].furniture)?[...h.rooms[key].furniture]:[...value.furniture];
    });
    h.cleanliness=Number.isFinite(h.cleanliness)?h.cleanliness:100;
  });
  Object.values(x.characters||{}).forEach(c=>{
    c.tastes=Array.isArray(c.tastes)?[...c.tastes]:[];
    c.interests=Array.isArray(c.interests)?[...c.interests]:[];
    c.hobbies=Array.isArray(c.hobbies)?[...c.hobbies]:[];
    c.musicGenres=Array.isArray(c.musicGenres)?[...c.musicGenres]:[];
    c.foodTypes=Array.isArray(c.foodTypes)?[...c.foodTypes]:[];
    c.drinks=Array.isArray(c.drinks)?[...c.drinks]:[];
    c.income=c.income||"보통";
    c.theme={primary:"#176b60",secondary:"#6fd0ae",gradient:true,...(c.theme||{})};
  });
  return x;
}
function load(){
  try{return migrate(JSON.parse(localStorage.getItem(KEY)||localStorage.getItem("parallel-city-game-v3")||localStorage.getItem(oldKey)||"null"))}
  catch{return fresh()}
}

export let state=load();
let timer;
export const active=()=>state.characters[state.activeId];
export function save(immediate=false){
  clearTimeout(timer);
  const run=()=>{
    state.lastSaved=Date.now();
    try{
      localStorage.setItem(KEY,JSON.stringify(state));
    }catch(error){
      console.warn("기기 저장 공간이 부족해 사진은 계정 저장을 우선합니다.",error);
    }
    document.querySelector("#save-state")?.replaceChildren(document.createTextNode("기기에 저장됨"));
    window.dispatchEvent(new Event("parallel-city-saved"));
  };
  immediate?run():timer=setTimeout(run,140);
}
export function createCharacter(){
  const id=uid();
  state.characters[id]={id,name:"새 캐릭터",job:"무직",photo:"",icon:"",wake:"07:30",sleep:"00:30",income:"보통",theme:{primary:"#176b60",secondary:"#6fd0ae",gradient:true},tastes:[],interests:[],hobbies:[],musicGenres:[],foodTypes:[],drinks:[],homeId:id};
  state.order.push(id);
  state.homes[id]={id,name:"새 캐릭터의 집",rooms:rooms(),cleanliness:100};
  state.routines[id]=[];
  state.activeId=id;state.activeTab="character";save(true);
}
export function setActive(id){if(state.characters[id]){state.activeId=id;save()}}
export function moveCharacter(id,direction){
  const from=state.order.indexOf(id),to=from+direction;
  if(from<0||to<0||to>=state.order.length)return;
  [state.order[from],state.order[to]]=[state.order[to],state.order[from]];
  save(true);
}
export function updateCharacter(id,patch,persist=true){Object.assign(state.characters[id],patch);if(persist)save()}
export function toggleChip(id,key,value){
  const c=state.characters[id];
  const own=Array.isArray(c[key])?[...c[key]]:[];
  c[key]=own.includes(value)?own.filter(x=>x!==value):[...own,value];
  save(true);
}
export function setCharacterImage(id,type,data){state.characters[id][type]=data;save(true)}
export function setHomeImage(homeId,room,data){
  const h=state.homes[homeId];if(!h)return;
  h.rooms=h.rooms||rooms();h.rooms[room].image=data;save(true);
}
export function setHomeEditMode(value){state.homeEditMode=Boolean(value);save()}
export function updateHome(homeId,patch){
  const h=state.homes[homeId];if(!h)return;
  Object.assign(h,patch);save(true);
}
export function updateRoom(homeId,roomKey,patch){
  const h=state.homes[homeId];if(!h)return;
  h.rooms=h.rooms||rooms();
  h.rooms[roomKey]={...h.rooms[roomKey],...patch};save(true);
}
export function toggleFurniture(homeId,roomKey,item){
  const h=state.homes[homeId];if(!h)return;
  h.rooms=h.rooms||rooms();
  const room=h.rooms[roomKey],current=Array.isArray(room.furniture)?[...room.furniture]:[];
  room.furniture=current.includes(item)?current.filter(x=>x!==item):[...current,item];
  save(true);
}
export function setHomeResidents(homeId,ids){
  const chosen=new Set(ids.filter(id=>state.characters[id]));
  if(!state.homes[homeId])return;
  chosen.forEach(id=>state.characters[id].homeId=homeId);
  state.order.forEach(id=>{
    const c=state.characters[id];
    if(c.homeId===homeId&&!chosen.has(id)){
      c.homeId=c.id;
      if(!state.homes[c.id])state.homes[c.id]={id:c.id,name:`${c.name}의 집`,rooms:rooms(),cleanliness:100};
    }
  });
  state.activeHomeId=homeId;save(true);
}
export function setPlaceImage(placeId,data){const p=state.world.places.find(x=>x.id===placeId);if(p){p.image=data;save(true)}}
export function setActiveHome(id){if(state.homes[id]){state.activeHomeId=id;save()}}
export function addRelationship(data){const id=uid();state.relationships[id]={id,...data};applyCohabit(state.relationships[id]);save(true)}
export function updateRelationship(id,data){
  const relation=state.relationships[id];if(!relation)return;
  const wasCohabiting=Boolean(relation.cohabit);
  Object.assign(relation,data);
  if(relation.cohabit)applyCohabit(relation);
  else if(wasCohabiting){
    const b=state.characters[relation.b];
    const linked=Object.values(state.relationships).some(other=>
      other.id!==relation.id&&other.cohabit&&(other.a===relation.b||other.b===relation.b)
    );
    if(b&&!linked){
      b.homeId=b.id;
      if(!state.homes[b.id])state.homes[b.id]={id:b.id,name:`${b.name}의 집`,rooms:rooms(),cleanliness:100};
    }
  }
  save(true);
}
function applyCohabit(r){
  if(!r.cohabit)return;
  const a=state.characters[r.a],b=state.characters[r.b];if(!a||!b)return;
  const target=a.homeId||a.id,old=b.homeId||b.id;
  b.homeId=target;
  if(!state.homes[target])state.homes[target]={id:target,name:`${a.name}의 집`,rooms:rooms(),cleanliness:100};
  if(old!==target&&!state.order.some(id=>state.characters[id]?.homeId===old))delete state.homes[old];
}
export function setWorldBackground(bg){state.world.bg=bg;save(true)}
export function addPlace(){
  const name=prompt("건물 이름","새 건물");if(!name)return;
  state.world.places.push({id:uid(),name,type:prompt("종류","상점")||"상점",emoji:"🏬",image:"",x:50,y:50,color:"#8ecbc0"});save(true);
}
export function movePlace(id,x,y,persist=true){const p=state.world.places.find(p=>p.id===id);if(p){p.x=x;p.y=y;if(persist)save()}}
export function replaceState(next){state=migrate(clone(next));localStorage.setItem(KEY,JSON.stringify(state))}
export function resetAll(){
  state=fresh();
  localStorage.removeItem(KEY);
  localStorage.removeItem("parallel-city-game-v3");
  localStorage.removeItem(oldKey);
}
export const cloneState=()=>clone(state);
