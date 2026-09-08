const {usage,check}=require('./account-slots');
const fail=(message,status=400)=>{throw Object.assign(Error(message),{status})};
module.exports=({db,clock=Date.now})=>async(uid,input)=>db.runTransaction(async tx=>{
 for(const key of ['groupId','townId','id'])if(typeof input[key]!=='string'||!input[key]||input[key].length>180||/[\/]/.test(input[key]))fail('invalid-id');
 const root=db.collection('groups').doc(input.groupId),ref=root.collection('residents').doc(uid+'_'+input.id),homeRef=root.collection('homes').doc(uid+'_'+input.id);
 const [group,member,old,all,slots]=await Promise.all([tx.get(root),tx.get(root.collection('members').doc(uid)),tx.get(ref),tx.get(root.collection('residents')),usage(db,tx,uid)]);
 if(!group.exists||!member.exists)fail('group-membership-required',403);if(old.exists)return {id:ref.id,status:'accepted'};
 if(!group.data().towns?.some(t=>t.id===input.townId))fail('town-missing',404);check(slots,'characters');
 const role=member.data().role,rules=group.data().rules||{},limit=Math.max(1,Number(rules[role==='operator'?'operatorCharacterLimit':['owner','manager'].includes(role)?'managerCharacterLimit':'memberCharacterLimit'])||(['owner','manager','operator'].includes(role)?100:20));
 if(all.docs.length>=200||all.docs.filter(d=>d.data().ownerUid===uid).length>=limit)fail('resident-limit',409);
 const profile=input.profile,home=input.home;
 if(!profile||typeof profile!=='object'||Array.isArray(profile)||typeof profile.name!=='string'||!profile.name.trim()||profile.name.length>40||JSON.stringify(profile).length>120000||!home?.rooms||JSON.stringify(home).length>180000)fail('invalid-profile');
 const clean={...profile,id:ref.id,homeId:homeRef.id,townId:input.townId,days:{},createdAt:clock(),timelineResetAt:clock()};for(const key of ['sharedScene','sharedContext','ownerUid','residences'])delete clean[key];
 slots.reserve();
 tx.create(homeRef,{ownerUid:uid,sourceHomeId:input.id,townId:input.townId,name:profile.name+'의 집',layoutJson:JSON.stringify(home),mapX:50,mapY:50,layoutRevision:0,residentNames:[profile.name],visitPolicy:'members'});
 tx.create(ref,{ownerUid:uid,ownerName:member.data().displayName||'',sourceCharacterId:input.id,sourceHomeId:input.id,sharedHomeId:homeRef.id,independentCharacter:true,name:profile.name,job:profile.jobTitle||profile.job||'',townId:input.townId,profileJson:JSON.stringify(clean),scheduleJson:JSON.stringify(input.schedule||{}),icon:profile.icon||'',photo:profile.photo||'',joinedAt:clock(),updatedAt:clock()});
 tx.update(root,{lifeUpdatedAt:0});return {id:ref.id,status:'accepted'};
});
