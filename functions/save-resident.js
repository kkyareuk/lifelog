const fail=(message,status=400)=>{throw Object.assign(Error(message),{status})};
module.exports=({db,clock=Date.now})=>async(uid,input)=>db.runTransaction(async tx=>{
 for(const key of ['groupId','id'])if(typeof input[key]!=='string'||!input[key]||input[key].length>180||/[\/]/.test(input[key]))fail('invalid-id');
 const root=db.collection('groups').doc(input.groupId),ref=root.collection('residents').doc(input.id);
 const courtRef=root.collection('courtProfiles').doc(input.id);
 const [member,old,group,court]=await Promise.all([tx.get(root.collection('members').doc(uid)),tx.get(ref),tx.get(root),tx.get(courtRef)]);
 if(!member.exists||!old.exists||old.data().ownerUid!==uid)fail('character-owner-required',403);
 const profile=input.profile;if(!profile||Array.isArray(profile)||typeof profile.name!=='string'||!profile.name.trim()||profile.name.length>40||JSON.stringify(profile).length>120000)fail('invalid-profile');
 const clean={...profile,id:ref.id,homeId:old.data().sharedHomeId,townId:old.data().townId};
 for(const key of ['days','sharedScene','sharedContext','ownerUid','residences','__proto__','constructor','prototype'])delete clean[key];
 const previousCourt=court.data()?.ownerUid===uid?court.data():{};
 if(group.data()?.courtTheme==='court'){
  const content=require('./court-world-content'),ranks=group.data().courtRanks||content.ranks;
  const rankId=clean.courtRankId??previousCourt.rankId??'',rank=ranks.find(r=>r.id===rankId);
  const job=clean.courtJob||previousCourt.job||'none',faction=clean.courtFaction||previousCourt.faction||'neutral',trait=clean.courtTrait||previousCourt.trait||'courtesy';
  const awareness=Number(clean.courtAwareness??previousCourt.awareness??50),bio=clean.courtBackground??previousCourt.bio??'';
  if((rankId&&!rank)||!Object.hasOwn(content.jobs,job)||!['neutral','crown','reform'].includes(faction)||!['courtesy','honesty','warmth','privacy'].includes(trait)||![0,25,50,75,100].includes(awareness)||typeof bio!=='string'||bio.length>500)fail('court-invalid-profile');
  if(clean.courtJobTitle!==undefined&&(typeof clean.courtJobTitle!=='string'||clean.courtJobTitle.length>60))fail('court-invalid-profile');
  Object.assign(clean,{courtRankId:rankId,courtJob:job,courtFaction:faction,courtTrait:trait,courtAwareness:awareness,courtBackground:bio});
  tx.set(courtRef,{...previousCourt,ownerUid:uid,rankId,job,faction,trait,awareness,bio,role:previousCourt.role||'attendant',enabled:previousCourt.enabled===true,revision:Number(previousCourt.revision||0)+1});
 }
 tx.update(ref,{profileJson:JSON.stringify(clean),name:clean.name,job:clean.jobTitle||clean.job||'',icon:clean.icon||'',photo:clean.photo||'',updatedAt:clock()});tx.update(root,{lifeUpdatedAt:0});return {id:ref.id};
});
