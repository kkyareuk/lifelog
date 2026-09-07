let listening=false,token='';
const plugin=()=>window.Capacitor?.getPlatform?.()==='android'?window.Capacitor?.Plugins?.PushNotifications:null;
const account=()=>window.ParallelCityAuth?.getInfo?.()?.user?.uid||'';
async function enable(prompt=true){
 const api=plugin();if(!api)return false;
 let permission=await api.checkPermissions();if(permission.receive==='prompt'&&prompt)permission=await api.requestPermissions();
 if(permission.receive!=='granted')return false;
 if(!listening){
  listening=true;
  await api.addListener('registration',async result=>{token=result.value;if(account())await window.DrawerVillageGroups?.registerDevice({token,language:window.ParallelCity?.getState?.()?.uiLanguage||'ko'}).catch(()=>{})});
  await api.addListener('pushNotificationActionPerformed',event=>{const groupId=event.notification?.data?.groupId;if(account()&&groupId){window.DrawerVillageGroups?.select(groupId);location.hash='tab=relationship'}});
  await api.addListener('pushNotificationReceived',()=>window.DrawerVillageGroups?.refresh?.());
 }
 await api.createChannel({id:'relationships',name:'Relationships',importance:4,visibility:0});
 await api.register();return true;
}
async function disable(){
 if(token&&account())await window.DrawerVillageGroups?.unregisterDevice({token});
 token='';await plugin()?.unregister();
}
window.DrawerVillageGroupPush={enable,disable};
window.addEventListener('drawer-village-auth-busy',()=>{if(account())void enable(false).catch(()=>{})});
