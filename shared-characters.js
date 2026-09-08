import {state,beginCharacterEditor,endCharacterEditor,characterEditorActive,emptyWorld,runIsolatedWorld,createCharacter} from './state.js?v=20260909dev289';
import {buildSharedWorld} from './shared-world.js?v=20260909dev289';
import {runBackgroundAction} from './background-actions.js?v=20260909dev289';
const t=(ko,en,ja)=>({ko,en,ja}[state.uiLanguage]||ko),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let session=null;
const drafts=new Map();
export function leaveSharedCharacterEditor(){
 if(session&&characterEditorActive())drafts.set(session.uid+':'+session.groupId,state);
 endCharacterEditor();session=null;
}
export function syncSharedCharacterEditor(){
 const s=window.DrawerVillageGroups?.getSnapshot?.(),uid=window.ParallelCityAuth?.getInfo?.()?.user?.uid;
 if(state.activeTab!=='character'||!s?.group||!s.activeGroupId||!uid){leaveSharedCharacterEditor();return}
 if(session?.uid===uid&&session.groupId===s.activeGroupId&&characterEditorActive()){const ids=(s.residents||[]).filter(r=>r.ownerUid===uid).map(r=>r.id);if(ids.length===state.order.length&&ids.every(id=>state.order.includes(id)))return;}
 leaveSharedCharacterEditor();
 const incoming=buildSharedWorld(s,state.uiLanguage),cached=drafts.get(uid+':'+s.activeGroupId);
 const world=cached||incoming;
 if(cached){world.characters=Object.fromEntries(Object.entries(incoming.characters).map(([id,c])=>[id,cached.characters[id]||c]));world.order=incoming.order;world.homes=incoming.homes;world.towns=incoming.towns;world.world=incoming.world;}
 const defaults=runIsolatedWorld(emptyWorld(),()=>{const id=createCharacter();return structuredClone(state.characters[id])});
 for(const id of world.order)world.characters[id]={...structuredClone(defaults),...world.characters[id],id};
 world.order=world.order.filter(id=>world.characters[id]?.ownerUid===uid);
 if(!world.order.includes(world.activeId))world.activeId=world.order[0];
 for(const key of ['uiLanguage','uiScale','uiFont','animationIntensity','ownerName','ownerPhoto'])world[key]=state[key];
 world.activeTab='character';world.characterSettingsView||='hub';
 beginCharacterEditor(world);session={uid,groupId:s.activeGroupId};
}
export function characterGroupSelector(){
 const s=window.DrawerVillageGroups?.getSnapshot?.()||{};
 return `<label class="character-group-selector">${t('캐릭터 그룹','Character group','キャラクターのグループ')}<select data-character-world><option value="">${t('내 마을','My town','自分の村')}</option>${(s.group&&!(s.groups||[]).some(g=>g.id===s.activeGroupId)?[...(s.groups||[]),{...s.group,id:s.activeGroupId}]:s.groups||[]).map(g=>`<option value="${esc(g.id)}" ${g.id===s.activeGroupId?'selected':''}>${esc(g.name)}</option>`).join('')}</select></label>`;
}
export function saveSharedCharacter(){
 if(!session||!characterEditorActive())return null;
 const {uid,groupId}=session,id=state.activeId,profile=structuredClone(state.characters[id]);
 if(!profile||profile.ownerUid!==uid)throw Error('Character owner required');
 return runBackgroundAction('resident-edit:'+groupId+':'+id,async()=>{
  if(window.ParallelCityAuth.getInfo().user?.uid!==uid)throw Error('Account changed');
  await window.DrawerVillageGroups.saveResident({groupId,id,profile});
 });
}
export function bindSharedCharacters(render){
 document.querySelectorAll('[data-new]').forEach(button=>{if(!session)return;const create=button.onclick;button.onclick=async()=>{leaveSharedCharacterEditor();await window.DrawerVillageGroups.select('');state.activeTab='character';create?.();render()}});
 document.querySelectorAll('[data-character-world]').forEach(select=>select.addEventListener('change',async e=>{const gid=e.target.value;leaveSharedCharacterEditor();await window.DrawerVillageGroups.select(gid);state.activeTab='character';render({force:true})}));
 // Character creation and deletion belong to group membership/slot operations.
 if(session)document.querySelectorAll('[data-delete-character]').forEach(b=>{b.onclick=()=>{const id=b.dataset.deleteCharacter,{groupId,uid}=session,world=state;if(!confirm(t('이 캐릭터를 영구 삭제할까요? 내 마을로 돌아오지 않으며 복구할 수 없습니다.','Permanently delete this character? It will not return to your town and cannot be recovered.','このキャラクターを完全に削除しますか？自分の村には戻らず、復元できません。')))return;void runBackgroundAction('resident-delete:'+groupId+':'+id,async()=>{if(window.ParallelCityAuth.getInfo().user?.uid!==uid)throw Error('Account changed');await window.DrawerVillageGroups.deleteResident({groupId,residentId:id});delete world.characters[id];world.order=world.order.filter(x=>x!==id);world.activeId=world.order[0]||'';render()})}});
}
export function openSharedCharacter(id,render){
 syncSharedCharacterEditor();if(state.order.includes(id)){state.activeId=id;render()}
}
