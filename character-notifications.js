const CHANNEL_ID="character-life";
const NOTIFICATION_KIND="drawer-village-character-question";
let listening=false;

const plugin=()=>window.Capacitor?.isNativePlatform?.()?window.Capacitor?.Plugins?.LocalNotifications:null;

export const characterNotificationsAvailable=()=>Boolean(plugin());

export async function characterNotificationPermission(){
  const notifications=plugin();
  if(!notifications)return "unavailable";
  try{return (await notifications.checkPermissions()).display||"prompt"}
  catch(error){console.warn("알림 권한 상태를 확인하지 못했습니다",error);return "prompt"}
}

export async function requestCharacterNotificationPermission(){
  const notifications=plugin();
  if(!notifications)return "unavailable";
  const current=await characterNotificationPermission();
  if(current==="granted")return current;
  try{return (await notifications.requestPermissions()).display||"denied"}
  catch(error){console.warn("알림 권한 요청을 완료하지 못했습니다",error);return "denied"}
}

export async function initializeCharacterNotifications(){
  const notifications=plugin();
  if(!notifications||listening)return Boolean(notifications);
  listening=true;
  try{
    await notifications.createChannel({
      id:CHANNEL_ID,
      name:"캐릭터의 생활 질문",
      description:"캐릭터가 하루 일정이나 선물 같은 선택을 물어보는 알림",
      importance:3,
      visibility:1,
      vibration:true,
      lights:true,
      lightColor:"#9C514A"
    });
  }catch(error){console.warn("캐릭터 알림 채널을 만들지 못했습니다",error)}
  await notifications.addListener("localNotificationActionPerformed",event=>{
    const extra=event?.notification?.extra||{};
    if(extra.kind!==NOTIFICATION_KIND)return;
    window.dispatchEvent(new CustomEvent("drawer-village-character-notification-open",{detail:extra}));
  });
  return true;
}

export async function replaceCharacterNotifications(items=[]){
  const notifications=plugin();
  if(!notifications)return false;
  const pending=await notifications.getPending().catch(()=>({notifications:[]}));
  const ours=(pending.notifications||[]).filter(item=>item?.extra?.kind===NOTIFICATION_KIND);
  if(ours.length)await notifications.cancel({notifications:ours.map(item=>({id:item.id}))});
  if(!items.length)return true;
  await notifications.schedule({notifications:items.map(item=>({
    id:item.id,
    title:item.title,
    body:item.body,
    largeBody:item.body,
    summaryText:item.summaryText||"서랍마을",
    schedule:{at:item.at,allowWhileIdle:true},
    channelId:CHANNEL_ID,
    smallIcon:"ic_stat_drawer_village",
    largeIcon:item.largeIcon||undefined,
    iconColor:"#9C514A",
    autoCancel:true,
    group:"drawer-village-character-life",
    extra:{...item.extra,kind:NOTIFICATION_KIND}
  }))});
  return true;
}

export const cancelCharacterNotifications=()=>replaceCharacterNotifications([]);

function loadImage(source){
  return new Promise((resolve,reject)=>{
    const image=new Image();
    if(/^https?:/i.test(source))image.crossOrigin="anonymous";
    image.onload=()=>resolve(image);
    image.onerror=reject;
    image.src=source;
  });
}

// Android의 작은 상태표시 아이콘은 단색 앱 아이콘만 허용한다. 대신 알림
// 본문 옆의 큰 아이콘에는 사용자가 등록한 캐릭터 그림을 작게 복사한다.
export async function characterNotificationLargeIcon(source){
  if(!source)return "";
  try{
    const image=await loadImage(source);
    const size=128,canvas=document.createElement("canvas"),context=canvas.getContext("2d");
    canvas.width=size;canvas.height=size;
    const scale=Math.min(size/image.naturalWidth,size/image.naturalHeight);
    const width=Math.max(1,image.naturalWidth*scale),height=Math.max(1,image.naturalHeight*scale);
    context.clearRect(0,0,size,size);
    context.drawImage(image,(size-width)/2,(size-height)/2,width,height);
    return canvas.toDataURL("image/png");
  }catch(error){
    console.warn("캐릭터 알림 아이콘을 준비하지 못해 앱 아이콘을 사용합니다",error);
    return "";
  }
}

