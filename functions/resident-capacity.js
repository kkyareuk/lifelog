exports.limit=(group,member,uid)=>{
 const role=group.ownerUid===uid?'owner':member.role;
 const field=role==='operator'?'operatorCharacterLimit':['owner','manager'].includes(role)?'managerCharacterLimit':'memberCharacterLimit';
 return Math.max(1,Math.min(100,Number(group.rules?.[field]??(role==='operator'?group.rules?.managerCharacterLimit:undefined))||(['owner','manager','operator'].includes(role)?100:20)));
};
exports.pending=docs=>new Set(docs.filter(d=>{const p=d.data();return p.status==='pending'&&(p.kind==='admission'||p.kind==='create-resident')}).map(d=>d.data().sourceId)).size;
