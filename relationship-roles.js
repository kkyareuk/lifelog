const words=(ko,en,ja)=>({ko,en,ja});
export const FAMILY_TYPES=['가족','선택한 가족','부모·자녀','형제·자매','조부모·손자녀','친척','그 외 가족','보호자·피보호자','유사가족','같은 가문'];
export const isFamily=type=>FAMILY_TYPES.includes(type);
export const ROLE_OPTIONS=[
 ['family','가족','Family','家族'],['parent','부모','Parent','親'],['father','아버지','Father','父'],['mother','어머니','Mother','母'],['child','자녀','Child','子'],['sibling','형제·자매','Sibling','きょうだい'],['cousin','사촌','Cousin','いとこ'],['uncle','삼촌','Uncle','おじ'],['aunt','이모·고모','Aunt','おば'],['maternalAunt','이모','Maternal aunt','母方のおば'],['paternalAunt','고모','Paternal aunt','父方のおば'],['nibling','조카','Niece / nephew','おい・めい'],['grandparent','조부모','Grandparent','祖父母'],['grandchild','손자녀','Grandchild','孫'],['relative','친척','Relative','親戚'],['mentor','스승','Mentor','師'],['student','제자','Student','弟子']
].map(([id,ko,en,ja])=>({id,label:words(ko,en,ja)}));
export const roleText=(id,language='ko')=>{const role=ROLE_OPTIONS.find(r=>r.id===id);return role?.label[language]||role?.label.ko||''};
const inverse={parent:'child',father:'child',mother:'child',child:'parent',sibling:'sibling',cousin:'cousin',uncle:'nibling',aunt:'nibling',maternalAunt:'nibling',paternalAunt:'nibling',nibling:'auntOrUncle',auntOrUncle:'nibling',grandparent:'grandchild',grandchild:'grandparent',family:'family',relative:'relative',mentor:'student',student:'mentor'};
const memberIds=r=>[...new Set([r.a,r.b,...(r.groupMembers||[]),...(r.displayOrder||[])].filter(Boolean))];
export function normalizeRoleLinks(r){
 const ids=memberIds(r),seen=new Set();return (Array.isArray(r.roleLinks)?r.roleLinks:[]).filter(link=>{if(!link||link.from===link.to||!ids.includes(link.from)||!ids.includes(link.to)||!ROLE_OPTIONS.some(o=>o.id===link.role&&(r.type==='사제 관계'?['mentor','student'].includes(o.id):isFamily(r.type)&&!['mentor','student'].includes(o.id)))||typeof link.blood!=='boolean')return false;const key=[link.from,link.to].sort().join(':');if(seen.has(key))return false;seen.add(key);return true}).map(({from,to,role,blood})=>({from,to,role,blood:!['mentor','student'].includes(role)&&blood}));
}
export function legacyRoleLinks(r){
 if(r.roleLinks)return normalizeRoleLinks(r);
 if(!['부모·자녀','형제·자매','조부모·손자녀','사제 관계'].includes(r.type)&&!ROLE_OPTIONS.some(o=>o.label.ko===r.targetRole))return [];
 const role=r.type==='부모·자녀'?'child':r.type==='형제·자매'?'sibling':r.type==='조부모·손자녀'?'grandchild':r.type==='사제 관계'?'student':'family';
 const from=r.type==='사제 관계'?(r.teacherId||r.a):(r.parentId||r.a),to=from===r.a?r.b:r.a;
 const explicit=ROLE_OPTIONS.find(o=>o.label.ko===r.targetRole)?.id;
 return [{from,to,role:explicit||role,blood:isFamily(r.type)&&r.kinship!=='nonblood'&&r.siblingKinshipByPair?.[[r.a,r.b].sort().join('~')]!=='nonblood'&&r.type!=='선택한 가족'}];
}
const generic=role=>['mother','father'].includes(role)?'parent':['maternalAunt','paternalAunt','aunt','uncle'].includes(role)?'auntOrUncle':role;
const compose={
 'parent/parent':'grandparent','child/child':'grandchild','parent/child':'sibling','sibling/parent':'parent','sibling/sibling':'sibling','parent/sibling':'auntOrUncle','sibling/child':'nibling','auntOrUncle/child':'cousin'
};
export function relativeRole(relation,from,to,characters={}){
 if(from===to)return {role:'self',blood:null};
 const links=legacyRoleLinks(relation),edges=[];
 for(const link of links){edges.push(link,{from:link.to,to:link.from,role:inverse[link.role]||'family',blood:link.blood})}
 const queue=[{id:from,role:null,blood:true,path:[from]}];
 while(queue.length){const current=queue.shift();for(const e of edges.filter(x=>x.from===current.id&&!current.path.includes(x.to))){const role=current.role?compose[generic(current.role)+'/'+generic(e.role)]:e.role;if(!role)continue;const value={id:e.to,role,blood:current.role&&['sibling/parent','sibling/sibling'].includes(generic(current.role)+'/'+generic(e.role))?null:current.blood===false||e.blood===false?false:current.blood===null?null:true,path:[...current.path,e.to]};if(e.to===to){if(value.role==='auntOrUncle')value.role=characters[to]?.gender==='남성'?'uncle':characters[to]?.gender==='여성'?'aunt':'relative';return {role:value.role,blood:value.blood}}if(value.path.length<5)queue.push(value)}}
 return {role:relation.type==='사제 관계'?'':'family',blood:null};
}
export function relationshipReference(relation,characters,activeId,uid){
 const ids=memberIds(relation).filter(id=>characters[id]);
 if(uid){if(ids.includes(activeId)&&characters[activeId]?.ownerUid===uid)return activeId;const own=ids.find(id=>characters[id]?.ownerUid===uid);if(own)return own}
 return ids.includes(relation.referenceId)?relation.referenceId:ids[0];
}
export function relationshipMemberName(relation,character,characters,referenceId,language='ko'){
 if(!isFamily(relation.type)&&relation.type!=='사제 관계')return character.name;
 if(character.id===referenceId)return character.name+' 👑';
 const label=roleText(relativeRole(relation,referenceId,character.id,characters).role,language);return character.name+(label?' ('+label+')':'');
}
