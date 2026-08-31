const validTime=value=>/^([01]\d|2[0-3]):[0-5]\d$/.test(String(value||""));
export const minutesAt=time=>Number(time.slice(0,2))*60+Number(time.slice(3));
export function normalizeBuildingLighting(value={}){
  return {lightingMode:["schedule","always","off"].includes(value.lightingMode)?value.lightingMode:"schedule",lightOnTime:validTime(value.lightOnTime)?value.lightOnTime:"18:00",lightOffTime:validTime(value.lightOffTime)?value.lightOffTime:"06:00"};
}
export function buildingLightsOn(value,date=new Date()){
  const light=normalizeBuildingLighting(value);
  if(light.lightingMode!=="schedule")return light.lightingMode==="always";
  const start=minutesAt(light.lightOnTime),end=minutesAt(light.lightOffTime),now=date.getHours()*60+date.getMinutes();
  return start===end|| (start<end?now>=start&&now<end:now>=start||now<end);
}
export function townTimeAppearance(date=new Date()){
  const minute=date.getHours()*60+date.getMinutes();
  // Local wall-clock time, not simulated game time or geolocation/sunrise.
  const keys=[[0,.38,0],[300,.4,0],[360,.67,.15],[420,1,0],[990,1,0],[1080,.85,.32],[1140,.57,.2],[1200,.38,0],[1440,.38,0]];
  const index=keys.findIndex((entry,i)=>i<keys.length-1&&minute>=entry[0]&&minute<keys[i+1][0]);
  const a=keys[Math.max(0,index)],b=keys[Math.max(0,index)+1],ratio=(minute-a[0])/(b[0]-a[0]);
  const brightness=a[1]+(b[1]-a[1])*ratio,dusk=a[2]+(b[2]-a[2])*ratio;
  return {brightness,dusk,phase:minute<300||minute>=1200?"night":minute<420?"dawn":minute<990?"day":"sunset"};
}
const phaseNames={ko:{night:"밤",dawn:"새벽",day:"낮",sunset:"노을"},en:{night:"Night",dawn:"Dawn",day:"Day",sunset:"Sunset"},ja:{night:"夜",dawn:"夜明け",day:"昼",sunset:"夕焼け"}};
export function refreshTownLighting(root,date=new Date()){
  const appearance=townTimeAppearance(date);
  root.querySelectorAll(".town-environment").forEach(world=>{
    world.style.setProperty("--town-brightness",appearance.brightness.toFixed(3));
    world.style.setProperty("--town-dusk",appearance.dusk.toFixed(3));
    world.dataset.townPhase=appearance.phase;
    const lang=world.dataset.townLanguage||"ko",clock=world.querySelector(".town-clock");
    if(clock)clock.textContent=`${(phaseNames[lang]||phaseNames.ko)[appearance.phase]} · ${date.toLocaleTimeString(lang,{hour:"2-digit",minute:"2-digit",hour12:false})}`;
    world.querySelectorAll("[data-building-light]").forEach(art=>{
      art.dataset.lightsOn=String(buildingLightsOn(art.dataset,date));
    });
  });
}
let clockTimer=0;
export function scheduleTownLighting(root=document){
  clearTimeout(clockTimer);
  if(root.visibilityState==="hidden"||!root.querySelector(".town-environment"))return;
  refreshTownLighting(root);
  clockTimer=setTimeout(()=>scheduleTownLighting(root),60000-Date.now()%60000+30);
}
