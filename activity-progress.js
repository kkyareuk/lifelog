export function activityTiming(world,c,scene={}){
 if(scene.activityStartedAt&&scene.activityEndsAt)return {start:scene.activityStartedAt,end:scene.activityEndsAt};
 const cooking=c.cooking?.active;if(cooking)return {start:cooking.startedAt,end:cooking.endsAt};
 const directive=world.characterDirectives?.[c.id];if(directive&&scene.manualDirectiveId===directive.id&&directive.endsAt>Date.now())return {start:Math.max(directive.startedAt,directive.journey?.arrivesAt||0),end:directive.endsAt};
 if(scene.recoveryStartedAt&&scene.recoveryEndsAt)return {start:scene.recoveryStartedAt,end:scene.recoveryEndsAt};
 return null;
}
export function activityProgressMarkup(world,c,scene){
 const timing=activityTiming(world,c,scene),now=Date.now();if(!timing||!Number.isFinite(timing.start)||timing.end<=timing.start||now<timing.start||now>=timing.end)return '';
 const value=Math.min(99,Math.floor(Math.max(0,(now-timing.start)/(timing.end-timing.start))*100)),label=({ko:'활동 진행률',en:'Activity progress',ja:'行動の進行度'})[world.uiLanguage]||'활동 진행률';
 return `<span class="character-activity-progress" role="progressbar" aria-label="${label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value}" data-activity-start="${timing.start}" data-activity-end="${timing.end}"><i style="width:${value}%"></i></span>`;
}
let timer=0;const completed=new Set();
export function syncActivityProgress(){
 clearTimeout(timer);const bars=[...document.querySelectorAll('[data-activity-end]')];if(!bars.length||document.hidden)return;
 const tick=()=>{const now=Date.now();let pending=false,ended=false;for(const bar of bars){if(!bar.isConnected)continue;const start=Number(bar.dataset.activityStart),end=Number(bar.dataset.activityEnd),value=Math.min(99,Math.floor(Math.max(0,(now-start)/(end-start))*100));bar.setAttribute('aria-valuenow',String(value));bar.firstElementChild.style.width=value+'%';if(now<end)pending=true;else {bar.hidden=true;if(!completed.has(end)){completed.add(end);ended=true;}}}
  if(completed.size>500)completed.delete(completed.values().next().value);
  if(ended){const s=window.DrawerVillageGroups?.getSnapshot?.();if(s?.activeGroupId)void window.DrawerVillageGroups.advanceLife(true).catch(()=>{}).finally(()=>window.dispatchEvent(new Event('drawer-money-updated')));else window.dispatchEvent(new Event('drawer-money-updated'));}
  if(pending)timer=setTimeout(tick,500);
 };tick();
}
if(globalThis.document)document.addEventListener('visibilitychange',()=>{if(document.hidden)clearTimeout(timer);else syncActivityProgress()});
