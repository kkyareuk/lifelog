import {homeMemberMenu} from './home-editor-ui.js?v=20260909dev305';
import {state,updateCharacter,save} from './state.js?v=20260909dev305';
import {buildSharedWorld} from './shared-world.js?v=20260909dev305';
import {careerCaption} from './salary.js';

export function showBuildingStaff(panel,{world,home,place,groupId,account,valid,refresh,toast,staffCopy}){
 const tr=(ko,en,ja)=>({ko,en,ja}[world.uiLanguage]||ko);
 const owned=c=>!groupId||c.ownerUid===account;
 function show(hiring=false){
  refresh();panel.hidden=false;
  const people=world.order.map(id=>world.characters[id]).filter(c=>c&&(hiring?owned(c)&&c.townId===home.townId&&c.workplaceId!==place.id:c.workplaceId===place.id));
  panel.innerHTML=homeMemberMenu(home,people,world.uiLanguage);
  const page=panel.firstElementChild;page.classList.add('open');
  page.querySelector('h2').textContent=hiring?tr('직원 고용','Hire staff','従業員を雇う'):tr('직원','Staff','従業員');
  page.querySelector('[data-close-home-feature]').onclick=()=>hiring?show():panel.hidden=true;
  page.querySelectorAll('.home-member-section').forEach((section,i)=>{if(i)section.remove()});
  page.querySelectorAll('.home-resident-remove,h3').forEach(n=>n.remove());
  const help=page.querySelector('.home-resident-help');help.textContent=hiring?tr('캐릭터를 선택하면 이 건물을 근무지로 지정해요. 기존 근무지가 있으면 변경돼요. 멀티에서는 내 캐릭터만 고용할 수 있어요.','Choose a character to assign this workplace, replacing their previous workplace. In multiplayer, you can assign only your own characters.','選んだ人物の職場をこの建物に変更します。マルチでは自分のキャラクターのみ雇えます。'):tr('이 건물에서 일하는 캐릭터예요.','Characters assigned to this workplace.','この建物で働くキャラクターです。');
  const add=page.querySelector('.home-member-add');add.removeAttribute('data-member-add');
  if(hiring)add.remove();else{add.querySelector('b').textContent=tr('직원 고용','Hire staff','従業員を雇う');add.onclick=()=>show(true)}
  for(const button of page.querySelectorAll('[data-member-id]')){
   button.removeAttribute('data-member-edit');const c=world.characters[button.dataset.memberId],caption=document.createElement('small');caption.textContent=careerCaption(world,c);button.append(caption);
   button.onclick=async()=>{
    if(!hiring){caption.textContent=staffCopy(c);return;}
    if(!valid())return;page.querySelectorAll('button').forEach(b=>b.disabled=true);
    try{
     if(groupId){const snapshot=window.DrawerVillageGroups.getSnapshot(),fresh=buildSharedWorld(snapshot,world.uiLanguage).characters[c.id];if(!fresh||!owned(fresh)||snapshot.activeGroupId!==groupId)throw Error('access');
      await window.DrawerVillageGroups.saveResident({groupId,id:c.id,profile:{...fresh,workplaceId:place.id}});
      if(valid()){const row=window.DrawerVillageGroups.getSnapshot().residents?.find(r=>r.id===c.id);if(row)row.profileJson=JSON.stringify({...JSON.parse(row.profileJson||'{}'),workplaceId:place.id});}
     }else{const previous=state.characters[c.id]?.workplaceId;updateCharacter(c.id,{workplaceId:place.id},false);if(!await save(true)){updateCharacter(c.id,{workplaceId:previous},false);throw Error('save')}}
     if(valid()){show();toast(tr('직원을 고용했어요. 근무 일정에 맞춰 출근해요.','Staff assigned. They will arrive for their scheduled shifts.','従業員を登録しました。勤務予定に合わせて出勤します。'))}
    }catch{toast(tr('고용 정보를 저장하지 못했어요. 다시 시도해 주세요.','Could not save the assignment. Please retry.','雇用情報を保存できませんでした。再試行してください。'));if(valid())show(true)}
   };
  }
 }
 show();
}
