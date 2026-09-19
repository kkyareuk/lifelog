// Only an ongoing marriage exempts seeing one's own spouse alone.
// A third participant or a former marriage does not inherit this exemption.
export function spousePrivacyExempt(relationships,observerId,otherId,scene){
 const participants=new Set([otherId,...(scene.withIds||[]),scene.withId].filter(Boolean));
 if([...participants].some(id=>id!==observerId&&id!==otherId))return false;
 return Object.values(relationships||{}).some(r=>r.type==='부부'&&r.temporalStatus!=='past'&&[r.a,r.b,...(r.memberIds||[]),...(r.groupMembers||[])].includes(observerId)&&[r.a,r.b,...(r.memberIds||[]),...(r.groupMembers||[])].includes(otherId));
}
