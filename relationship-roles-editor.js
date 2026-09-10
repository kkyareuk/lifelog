import {isFamily,ROLE_OPTIONS,roleText,relativeRole,legacyRoleLinks,normalizeRoleLinks,relationshipReference} from './relationship-roles.js?v=20260909dev305';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function mountRelationshipRoles(form,old,getMembers,characters,uid,language='ko'){
 const t=(ko,en,ja)=>({ko,en,ja}[language]||ko),card=form.querySelector('.official-order-card'),list=card.querySelector('[data-official-order-list]');
 let links=old?legacyRoleLinks(old):[],reference=old?.referenceId||getMembers()[0],category=isFamily(old?.type)?'family':old?.type==='사제 관계'?'mentor':'';const drafts=new Map();
 const basis=document.createElement('label');basis.className='official-role-reference';list.before(basis);
 const relation=()=>({a:getMembers()[0],b:getMembers()[1],groupMembers:getMembers(),type:form.type.value,referenceId:reference,roleLinks:links});
 function decorate(){
  const next=isFamily(form.type.value)?'family':form.type.value==='사제 관계'?'mentor':'';if(next!==category){drafts.set(category,{links,reference});const saved=drafts.get(next);links=saved?.links||[];reference=saved?.reference||reference;category=next;}
  const enabled=!!next;card.hidden=!enabled;if(!enabled)return;
  const ids=getMembers();reference=relationshipReference(relation(),characters,reference,uid)||ids[0];
  basis.innerHTML=`<span>👑 ${t('기준 캐릭터','Reference character','基準キャラクター')}</span><select data-role-reference>${ids.filter(id=>!uid||characters[id]?.ownerUid===uid).map(id=>`<option value="${esc(id)}" ${id===reference?'selected':''}>${esc(characters[id]?.name)}</option>`).join('')}</select>`;
  const selector=basis.querySelector('select');if(!selector.options.length)selector.innerHTML=`<option value="${esc(reference)}">${esc(characters[reference]?.name)}</option>`;
  selector.onchange=()=>{reference=selector.value;decorate()};
  for(const row of list.children){
   const id=row.dataset.officialOrderPerson;row.querySelectorAll('[data-role-control]').forEach(el=>el.remove());
   const name=row.querySelector(':scope > b');name.textContent=characters[id]?.name+(id===reference?' 👑':'');
   if(id===reference)continue;
   const value=relativeRole(relation(),reference,id,characters),details=document.createElement('details');details.dataset.roleControl='';details.className='official-role-options';
   const options=ROLE_OPTIONS.filter(o=>form.type.value==='사제 관계'?['mentor','student'].includes(o.id):!['mentor','student'].includes(o.id));
   details.innerHTML=`<summary>${t('역할 지정','Assign role','役割を指定')} · ${esc(roleText(value.role,language)||t('미설정','Unspecified','未設定'))}</summary><label>${esc(characters[reference]?.name)} → ${esc(characters[id]?.name)}<select data-member-role><option value="">${t('미설정','Unspecified','未設定')}</option>${options.map(o=>`<option value="${o.id}" ${o.id===value.role?'selected':''}>${esc(o.label[language]||o.label.ko)}</option>`).join('')}</select></label>${isFamily(form.type.value)?`<label><input type="checkbox" data-role-blood ${value.blood===true?'checked':''}>${t('혈연','Blood relation','血縁')} <small>${value.blood===null?t('미설정 · 선택하여 지정','Unspecified · select to set','未設定・選択して設定'):value.blood?t('혈연으로 연결됨','Connected by blood','血縁でつながっています'):t('비혈연으로 연결됨','Not connected by blood','非血縁でつながっています')}</small></label>`:''}`;
   row.append(details);
   const select=details.querySelector('select'),blood=details.querySelector('[data-role-blood]');
   const save=()=>{links=links.filter(link=>!([link.from,link.to].includes(reference)&&[link.from,link.to].includes(id)));if(select.value)links.push({from:reference,to:id,role:select.value,blood:!!blood?.checked});decorate()};
   select.onchange=()=>{if(blood&&value.blood===null)blood.checked=form.querySelector('[data-detail=origin]')?.value==='0';save()};if(blood)blood.onchange=save;
  }
 }
 return {decorate,read:()=>{const roleLinks=normalizeRoleLinks(relation()),teacher=roleLinks.find(link=>['mentor','student'].includes(link.role));const ids=getMembers();return {referenceId:reference,roleLinks,sourceRole:roleText(relativeRole(relation(),ids[1],ids[0],characters).role),targetRole:roleText(relativeRole(relation(),ids[0],ids[1],characters).role),teacherId:form.type.value==='사제 관계'&&teacher?(teacher.role==='mentor'?teacher.to:teacher.from):''}}};
}
