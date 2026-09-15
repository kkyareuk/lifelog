import {sharedSelection} from './shared-world.js?v=20260909dev305';
import {mt} from './mailbox-center.js?v=20260909dev305';
export function bindSharedHomeDeletion(root,s,render,toast,beforeDelete=async()=>{}){
 const groupId=s.activeGroupId,api=window.DrawerVillageGroups,uid=window.ParallelCityAuth?.getInfo?.()?.user?.uid;
 const allowed=home=>!!uid&&!!home&&(home.ownerUid===uid||s.group?.ownerUid===uid||s.members?.some(m=>(m.uid||m.id)===uid&&['owner','manager'].includes(m.role)));
 const busy=new Set();
 root.querySelectorAll('[data-delete-home]').forEach(b=>b.disabled=!allowed(s.homes?.find(h=>h.id===b.dataset.deleteHome)));
 const remove=(id,b)=>{
  const home=s.homes?.find(h=>h.id===id);if(!allowed(home)||busy.has(id))return;
  if(!confirm(mt('이 공유 집을 삭제할까요? 캐릭터와 개인 마을의 원본 집은 유지돼요.','Delete this shared home? Characters and the original home in the personal town will remain.','この共有の家を削除しますか？キャラクターと個人の町にある元の家は残ります。')))return;
  busy.add(id);b.disabled=true;
  (async()=>{await beforeDelete(id);const current=api.getSnapshot();if(current.activeGroupId!==groupId||window.ParallelCityAuth?.getInfo?.()?.user?.uid!==uid)throw Error(mt('그룹이나 계정이 바뀌었어요.','The group or account changed.','グループまたはアカウントが変わりました。'));await api.removeHome(id);const selection=sharedSelection(s);delete selection.homeDrafts?.[id];selection.homeEditMode=false;toast(mt('공유 집을 삭제했어요.','Shared home deleted.','共有の家を削除しました。'));render()})().catch(error=>toast(error.message)).finally(()=>{busy.delete(id);b.disabled=!allowed(home)});
 };
 root.addEventListener('click',e=>{const b=e.target.closest('[data-delete-home]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();remove(b.dataset.deleteHome,b)},true);
 return remove;
}
