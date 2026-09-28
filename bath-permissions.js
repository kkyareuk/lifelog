import {isAdultAge} from './age-groups.js';
import {legacyRoleLinks} from './relationship-roles.js';

// Bath sharing uses both directional boundaries. A family bathing scene is
// caregiving, and never grants access to romantic contact actions.
export function bathPairKind(world,a,b){
 if(!a||!b||a.id===b.id)return '';
 const relations=Object.values(world.relationships||{}).filter(r=>r.temporalStatus!=='past');
 const child=['영아','유아','어린이'];
 const parentPair=relations.some(r=>legacyRoleLinks(r).some(link=>
   link.role==='child'&&((link.from===a.id&&link.to===b.id&&isAdultAge(a.ageGroup)&&child.includes(b.ageGroup))||(link.from===b.id&&link.to===a.id&&isAdultAge(b.ageGroup)&&child.includes(a.ageGroup)))||
   ['parent','mother','father'].includes(link.role)&&((link.from===a.id&&link.to===b.id&&child.includes(a.ageGroup)&&isAdultAge(b.ageGroup))||(link.from===b.id&&link.to===a.id&&child.includes(b.ageGroup)&&isAdultAge(a.ageGroup)))));
 if(parentPair)return 'family';
 if(!isAdultAge(a.ageGroup)||!isAdultAge(b.ageGroup))return '';
 const couple=relations.some(r=>['연인','약혼','부부'].includes(r.type)&&[r.a,r.b,...(r.groupMembers||[])].includes(a.id)&&[r.a,r.b,...(r.groupMembers||[])].includes(b.id));
 const allowed=(from,to)=>{
  const level=world.characterViews?.[from.id]?.[to.id]?.touchIntensity;
  return level?['성인 간 친밀한 접촉까지','성인 간 합의된 친밀한 접촉까지'].includes(level):couple;
 };
 return allowed(a,b)&&allowed(b,a)?'adults':'';
}
