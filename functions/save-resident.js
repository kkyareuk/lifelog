const fail=(message,status=400)=>{throw Object.assign(Error(message),{status})};
module.exports=({db,clock=Date.now})=>async(uid,input)=>db.runTransaction(async tx=>{
 for(const key of ['groupId','id'])if(typeof input[key]!=='string'||!input[key]||input[key].length>180||/[\/]/.test(input[key]))fail('invalid-id');
 const root=db.collection('groups').doc(input.groupId),ref=root.collection('residents').doc(input.id);
 const [member,old]=await Promise.all([tx.get(root.collection('members').doc(uid)),tx.get(ref)]);
 if(!member.exists||!old.exists||old.data().ownerUid!==uid)fail('character-owner-required',403);
 const profile=input.profile;if(!profile||Array.isArray(profile)||typeof profile.name!=='string'||!profile.name.trim()||profile.name.length>40||JSON.stringify(profile).length>120000)fail('invalid-profile');
 const clean={...profile,id:ref.id,homeId:old.data().sharedHomeId,townId:old.data().townId};
 for(const key of ['days','sharedScene','sharedContext','ownerUid','residences','__proto__','constructor','prototype'])delete clean[key];
 tx.update(ref,{profileJson:JSON.stringify(clean),name:clean.name,job:clean.jobTitle||clean.job||'',icon:clean.icon||'',photo:clean.photo||'',updatedAt:clock()});tx.update(root,{lifeUpdatedAt:0});return {id:ref.id};
});
