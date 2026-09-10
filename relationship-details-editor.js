import {relationshipInfo} from "./relationship-help.js?v=20260909dev305";
import {OFFICIAL_RELATIONSHIP_DETAILS,FIRST_MEETINGS,normalizeRelationshipDetails,detailText} from './official-relationship-details.js?v=20260909dev305';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function mountRelationshipDetails(form,old,language='ko'){
 const slot=form.querySelector('[data-relationship-details]'),drafts=new Map();let type=old?.type||'친구';
 drafts.set(type,normalizeRelationshipDetails(type,old?.details));
 const copy=({ko:['관계 배경','정하지 않음','기억에 남은 첫 만남','직접 선택한 사건만 회상에 사용해요. 현재의 감정은 각자의 시선과 관계 단계에 따라 달라져요.'],en:['Relationship background','Unspecified','A remembered first meeting','Only selected events enter memories. Present feelings depend on each perspective and the relationship stage.'],ja:['関係の背景','未設定','記憶に残る初対面','選んだ出来事だけを回想に使います。今の感情は各自の視線と関係段階で変わります。']}[language]||[]);
 const capture=()=>drafts.set(type,normalizeRelationshipDetails(type,Object.fromEntries([...slot.querySelectorAll('select')].map(el=>[el.dataset.detail,el.value]))));
 const render=()=>{if(slot.children.length)capture();type=form.type.value;const spec=OFFICIAL_RELATIONSHIP_DETAILS[type],value=drafts.get(type)||{};
  slot.replaceChildren();if(!spec)return;
  const fields=spec.fields.filter(f=>f.id==='origin');
  slot.innerHTML=`${fields.map(f=>`<div class="relationship-detail-row"><div class="relationship-field-heading"><label for="relationship-detail-${f.id}">${escape(copy[0])}</label>${relationshipInfo(f.id,language)}</div><select id="relationship-detail-${f.id}" data-detail="${f.id}"><option value="">${escape(copy[1])}</option>${f.options.map(o=>`<option value="${o.id}" ${value[f.id]===o.id?'selected':''}>${escape(detailText(o.label,language))}</option>`).join('')}</select></div>`).join('')}`;
 };
 form.type.addEventListener('change',render);render();return()=>{capture();return drafts.get(type)||{}};
}
