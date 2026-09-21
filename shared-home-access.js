// Residency comes from the group's saved resident records, never profile text.
export const isHomeCohabitant=(s,homeId,uid)=>Boolean(uid&&s.residents?.some(r=>r.ownerUid===uid&&(Array.isArray(r.residences)?r.residences.some(v=>v.homeId===homeId):r.sharedHomeId===homeId)));
export const canEditSharedHome=(s,homeId,uid)=>Boolean(uid&&(s.group?.ownerUid===uid||s.members?.some(m=>(m.uid||m.id)===uid&&['owner','manager','operator'].includes(m.role))||s.homes?.some(h=>h.id===homeId&&h.ownerUid===uid)||isHomeCohabitant(s,homeId,uid)));
