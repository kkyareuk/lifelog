export function sharedCapacity(s,uid){
 const member=s.members?.find(m=>(m.uid||m.id)===uid),role=s.group?.ownerUid===uid?'owner':member?.role||s.role||'member';
 const field=role==='operator'?'operatorCharacterLimit':['owner','manager'].includes(role)?'managerCharacterLimit':'memberCharacterLimit';
 const limit=Math.max(1,Math.min(100,Number(s.group?.rules?.[field]??(role==='operator'?s.group?.rules?.managerCharacterLimit:undefined))||(['owner','manager','operator'].includes(role)?100:20)));
 const used=(s.residents||[]).filter(r=>r.ownerUid===uid).length;
 const pending=new Set([...(s.outgoingProposals||[]),...(s.incomingProposals||[])].filter(p=>p.senderUid===uid&&p.status==='pending'&&['admission','create-resident'].includes(p.kind)).map(p=>p.sourceId)).size;
 return {limit,used,pending,remaining:Math.max(0,Math.min(limit-used-pending,200-(s.residents||[]).length))};
}
