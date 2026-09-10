import {isFamily,ROLE_OPTIONS,roleText,relativeRole,legacyRoleLinks,normalizeRoleLinks,relationshipReference} from './relationship-roles.js?v=20260909dev305';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function mountRelationshipRoles(form,old,getMembers,characters,uid,language='ko'){
 const t=(ko,en,ja)=>({ko,en,ja}[language]||ko),card=form.querySelector('.official-order-card'),list=card.querySelector('[data-official-order-list]');
 let links=old?legacyRoleLinks(old):[],reference=old?.referenceId||getMembers()[0],category=isFamily(old?.type)?'family':old?.type==='사제 관계'?'mentor':'';const drafts=new Map();
 const basis=document.createElement('label');basis.className='official-role-reference';list.before(basis);
 const relation=()=>({a:getMembers()[0],b:getMembers()[1],groupMembers:getMembers(),type:form.type.value,referenceId:reference,roleLinks:links});
 function decorate(){
  const next=isFamily(form.type.value)?'family':form.type.value==='사제 관계'?'mentor':'';if(next!==category){drafts.set(category,{links,reference});const saved=drafts.get(next);links=saved?.links||[];reference=saved?.reference||reference;category=next;}
  const enabled=!!next;card.hidden=false;basis.hidden=!enabled;if(!enabled){for(const row of list.children)row.querySelectorAll('[data-role-control]').forEach(el=>el.remove());return;}
  const ids=getMembers();reference=relationshipReference(relation(),characters,reference,uid)||ids[0];
  basis.innerHTML=`<span>👑 ${t('기준 캐릭터','Reference character','基準キャラクター')}</span><select data-role-reference>${ids.filter(id=>!uid||characters[id]?.ownerUid===uid).map(id=>`<option value="${esc(id)}" ${id===reference?'selected':''}>${esc(characters[id]?.name)}</option>`).join('')}</select>`;
  const selector=basis.querySelector('select');if(!selector.options.length)selector.innerHTML=`<option value="${esc(reference)}">${esc(characters[reference]?.name)}</option>`;
  selector.onchange=()=>{reference=selector.value;decorate()};
  for(const row of list.children){
   const id=row.dataset.officialOrderPerson;row.querySelectorAll('[data-role-control]').forEach(el=>el.remove());
   const name=row.querySelector(':scope > b');name.textContent=characters[id]?.name+(id===reference?' 👑':'');
   if(id===reference)continue;
   const value=relativeRole(relation(),reference,id,characters),details=document.createElement('span');details.dataset.roleControl='';details.className='official-role-inline';
   const options=ROLE_OPTIONS.filter(o=>form.type.value==='사제 관계'?['mentor','student'].includes(o.id):!['mentor','student'].includes(o.id));
   details.innerHTML=`<select data-member-role aria-label="${esc(characters[reference]?.name)} → ${esc(characters[id]?.name)}"><option value="">${t('역할 선택','Choose role','続柄を選択')}</option>${options.map(o=>`<option value="${o.id}" ${o.id===value.role?'selected':''}>${esc(o.label[language]||o.label.ko)}</option>`).join('')}</select>${isFamily(form.type.value)?`<label><input type="checkbox" data-role-blood ${value.blood!==false?'checked':''}><small>${t('혈연','By blood','血縁')}</small></label>`:''}`;
   row.querySelector('nav').append(details);
   const select=details.querySelector('select'),blood=details.querySelector('[data-role-blood]');
   const save=()=>{links=links.filter(link=>!([link.from,link.to].includes(reference)&&[link.from,link.to].includes(id)));if(select.value)links.push({from:reference,to:id,role:select.value,blood:!!blood?.checked});decorate()};
   select.onchange=save;if(blood)blood.onchange=save;
  }
 }
 return {decorate,read:()=>{const roleLinks=normalizeRoleLinks(relation()),teacher=roleLinks.find(link=>['mentor','student'].includes(link.role));const ids=getMembers();return {referenceId:reference,roleLinks,sourceRole:roleText(relativeRole(relation(),ids[1],ids[0],characters).role),targetRole:roleText(relativeRole(relation(),ids[0],ids[1],characters).role),teacherId:form.type.value==='사제 관계'&&teacher?(teacher.role==='mentor'?teacher.to:teacher.from):''}}};
}
