import {state,saveDiscoveryPatch} from './state.js?v=20260909dev305';
import {growthCard,growthBadge,growthCopy} from './character-growth.js';

export function completeGrowthTask(id,task){
 if(!['action','routine'].includes(task)||state.sharedContext||window.DrawerVillageGroups?.getSnapshot?.()?.activeGroupId)return;
 const c=state.characters[id];if(!c||c.discovery?.growthCompleted?.[task]===true)return;
 saveDiscoveryPatch(id,{discovery:{...c.discovery,growthCompleted:{...c.discovery?.growthCompleted,[task]:true}}});
 refreshGrowth();
}
function refreshGrowth(){
 document.querySelectorAll('[data-growth-character]').forEach(card=>{
  const c=state.characters[card.dataset.growthCharacter];if(!c)return;
  card.outerHTML=growthCard(c,state.uiLanguage);
  const host=document.querySelector('[data-observed-character]');
  if(host?.dataset.observedCharacter===c.id)host.querySelectorAll('.character-level-badge').forEach(badge=>badge.outerHTML=growthBadge(c,state.uiLanguage));
 });
}
export function installCharacterGrowth(){
 window.addEventListener('drawer-tutorial',event=>{if(event.detail?.name==='question-success')refreshGrowth()});
 document.addEventListener('click',event=>{
  const button=event.target.closest('[data-growth-task]');if(!button)return;
  if(state.sharedContext||window.DrawerVillageGroups?.getSnapshot?.()?.activeGroupId)return;
  const id=button.dataset.growthId;if(!state.characters[id]||state.activeId!==id)return;
  const task=button.dataset.growthTask;
  if(task==='routine'){window.DrawerVillageNavigation?.go('routine');return}
  if(task==='action'){document.querySelector(`[data-character-command="${CSS.escape(id)}"]`)?.click();return}
  const question=document.querySelector('.discovery-rail-button');
  if(question?.disabled){const card=button.closest('.character-growth-card');let status=card.querySelector('[role=status]');if(!status){status=document.createElement('small');status.setAttribute('role','status');card.append(status)}status.textContent=(growthCopy[state.uiLanguage]||growthCopy.ko).wait;return}
  question?.click();
 });
}
