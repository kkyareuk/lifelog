let listening=false,token='',enabling=null;
const plugin=()=>window.Capacitor?.getPlatform?.()==='android'?window.Capacitor?.Plugins?.PushNotifications:null;
const account=()=>window.ParallelCityAuth?.getInfo?.()?.user?.uid||'';
function openPendingNotification(){const pending=window.DrawerVillageGroupPush.pending;if(!pending?.groupId||!account())return;window.DrawerVillageGroupPush.pending=null;window.DrawerVillageGroups?.select(pending.groupId);location.hash='tab=mailbox'}
async function enableNow(prompt=true){
 const api=plugin();if(!api)return false;
 let permission=await api.checkPermissions();if(['prompt','prompt-with-rationale'].includes(permission.receive)&&prompt)permission=await api.requestPermissions();
 if(permission.receive!=='granted')return false;
 if(!listening){
  listening=true;
  await api.addListener('registration',async result=>{token=result.value;if(account())await window.DrawerVillageGroups?.registerDevice({token,language:window.ParallelCity?.getState?.()?.uiLanguage||'ko'}).catch(()=>{})});
  await api.addListener('pushNotificationActionPerformed',event=>{const data=event.notification?.data;if(data?.groupId){window.DrawerVillageGroupPush.pending=data;openPendingNotification()}});
  await api.addListener('pushNotificationReceived',()=>window.DrawerVillageGroups?.refresh?.());
 }
 await api.createChannel({id:'relationships',name:'Relationships',importance:4,visibility:0});
 await api.register();return true;
}
function enable(prompt=true){if(enabling)return enabling;enabling=enableNow(prompt).finally(()=>enabling=null);return enabling}
async function disable(){
 if(token&&account())await window.DrawerVillageGroups?.unregisterDevice({token});
 token='';await plugin()?.unregister();
}
window.DrawerVillageGroupPush={enable,disable};
window.addEventListener('drawer-village-auth-busy',()=>{if(account()){if(token)void window.DrawerVillageGroups?.registerDevice({token,language:window.ParallelCity?.getState?.()?.uiLanguage||'ko'}).catch(()=>{});else void enable(false).catch(()=>{});openPendingNotification()}});
const firstLaunch=()=>void enable(true).catch(error=>console.warn('Notification setup',error.code||error.message));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',firstLaunch,{once:true});else firstLaunch();
