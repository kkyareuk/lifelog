// Recheck canonical residency within the same transaction as the edit.
exports.isCohabitant=async(tx,ref,homeId,uid)=>{
 const residents=await tx.get(ref.collection('residents').where('ownerUid','==',uid));
 return residents.docs.some(d=>{const r=d.data();return r.ownerUid===uid&&(Array.isArray(r.residences)?r.residences.some(v=>v.homeId===homeId):r.sharedHomeId===homeId)});
};
