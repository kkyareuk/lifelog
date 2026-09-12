const crypto=require('node:crypto');
const fail=(message,status=400)=>{throw Object.assign(Error(message),{status})};
const blocked=new Set(['__proto__','constructor','prototype','ownerUid','sharedScene','sharedContext','days','lifeJson','lifeSimulation','characterDirectives']);
function clean(value,depth=0){
 if(depth>24)fail('package-too-deep');
 if(Array.isArray(value)){if(value.length>1000)fail('package-too-large');return value.map(v=>clean(v,depth+1))}
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).filter(([k])=>!blocked.has(k)).map(([k,v])=>[k,clean(v,depth+1)]));
 if(typeof value==='string'&&/^(data:|blob:|local-media:)/i.test(value))fail('photo-upload-required');
 return value;
}
function validate(input){
 const p=clean(input);
 if(!p||p.version!==1||!['home','relationships','town'].includes(p.kind)||typeof p.name!=='string'||!p.name.trim())fail('invalid-package');
 if(Buffer.byteLength(JSON.stringify(p))>800000)fail('package-too-large');
 for(const key of ['characters','homes','relationships'])if(!p[key]||typeof p[key]!=='object'||Array.isArray(p[key]))fail('invalid-package');
 if(Object.keys(p.characters).length>200||Object.keys(p.homes).length>100||Object.keys(p.relationships).length>200)fail('package-too-large');
 for(const [id,c] of Object.entries(p.characters))if(!id||typeof c.name!=='string'||!c.name.trim())fail('invalid-character');
 for(const h of Object.values(p.homes))if(!h.rooms||Array.isArray(h.rooms)||Object.keys(h.rooms).length>50)fail('invalid-home');
 return p;
}
const scalar=new Set('id from to successorId a b teacherId parentId childId sourceId targetId characterId homeId sharedHomeId sourceHomeId townId workplaceId placeId visitHomeId ownerCharacterId partnerId'.split(' '));
const arrays=new Set('memberIds groupMembers participantIds withIds displayOrder ownerCharacterIds ownerIds characterIds assignedCharacterIds accessCharacterIds allowedCharacterIds'.split(' '));
function remap(v,map,key=''){
 if(Array.isArray(v))return v.map(x=>typeof x==='string'&&arrays.has(key)?map[x]||x:remap(x,map));
 if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[['characters','homes','relationships','characterViews','routines','monthlyRoutines','view-row'].includes(key)?map[k]||k:k,remap(x,map,key==='characterViews'?'view-row':k)]));
 return typeof v==='string'&&scalar.has(key)?map[v]||v:v;
}
module.exports=({db,clock=Date.now})=>({
 publishWorldCode:async(uid,input)=>{const pack=validate(input.package),code=crypto.randomBytes(9).toString('hex').toUpperCase();await db.runTransaction(async tx=>{const recent=await tx.get(db.collection('worldCodes').where('ownerUid','==',uid));if(recent.docs.filter(d=>d.data().createdAt>clock()-3600000).length>=20)fail('share-rate-limit',429);tx.create(db.collection('worldCodes').doc(code),{ownerUid:uid,package:pack,createdAt:clock()})});return {code}},
 readWorldCode:async(uid,input)=>{const code=String(input.code||'').replace(/[\s-]/g,'').toUpperCase();if(!/^[A-F0-9]{18}$/.test(code))fail('invalid-sharing-code');const doc=await db.collection('worldCodes').doc(code).get();if(!doc.exists)fail('sharing-code-missing',404);return {package:doc.data().package}},
 revokeWorldCode:async(uid,input)=>{const code=String(input.code||'').replace(/[\s-]/g,'').toUpperCase();if(!/^[A-F0-9]{18}$/.test(code))fail('invalid-sharing-code');await db.runTransaction(async tx=>{const ref=db.collection('worldCodes').doc(code),doc=await tx.get(ref);if(doc.exists){if(doc.data().ownerUid!==uid)fail('owner-required',403);tx.delete(ref)}});return {revoked:true}},
 migrateTown:async(uid,input)=>db.runTransaction(async tx=>{
  const safe=v=>{if(typeof v!=='string'||!v||v.length>180||/[\/\\]/.test(v))fail('invalid-id');return v};
  const gid=safe(input.groupId),tid=safe(input.townId),requestId=safe(input.requestId),pack=validate(input.package);if(pack.kind!=='town'||!pack.town?.id)fail('invalid-package');
  const root=db.collection('groups').doc(gid),user=db.collection('users').doc(uid),receipt=user.collection('characterTransfers').doc('world_'+requestId);
  const [old,g,core,residents,homes,slots,catalog]=await Promise.all([tx.get(receipt),tx.get(root),tx.get(user.collection('sync').doc('core')),tx.get(root.collection('residents')),tx.get(root.collection('homes')),require('./account-slots').usage(db,tx,uid),tx.get(root.collection('catalog'))]);
  if(old.exists){if(old.data().groupId!==gid||old.data().townId!==tid)fail('request-id-conflict',409);return {moved:true,alreadyCompleted:true}}
  if(!g.exists||g.data().ownerUid!==uid)fail('owner-required',403);
  const town=g.data().towns?.find(t=>t.id===tid);if(!town)fail('town-missing',404);
  if(residents.docs.some(d=>d.data().townId===tid)||homes.docs.some(d=>d.data().townId===tid)||(town.places||[]).length||(town.decorations||[]).length)fail('destination-town-not-empty',409);
  const order=core.data()?.state?.order||[],localIds=Array.isArray(order)?order:Object.values(order).find(Array.isArray)||[],ids=Object.keys(pack.characters);
  if(ids.some(id=>!localIds.includes(id)))fail('personal-character-missing',409);
  if(residents.docs.length+ids.length>200||ids.length+residents.docs.filter(d=>d.data().ownerUid===uid).length>100)fail('resident-limit',409);
  if(slots.characters+slots.personalCharacters>slots.characterLimit||slots.towns+slots.personalTowns>slots.townLimit)fail('slot-limit',409);
  const transfers=await Promise.all(ids.map(id=>tx.get(user.collection('characterTransfers').doc(safe(id)))));
  if(transfers.some(d=>d.exists&&d.data().location==='group'))fail('character-already-moved',409);
  const prefix='move_'+crypto.createHash('sha256').update(uid+requestId).digest('hex').slice(0,16)+'_',map={[pack.town.id]:tid};
  for(const [i,id] of [...ids,...Object.keys(pack.homes),...Object.keys(pack.relationships),...(pack.characterGroups||[]).map(x=>x.id),...(pack.town.places||[]).map(x=>x.id),...(pack.town.decorations||[]).map(x=>x.id)].entries())map[id]=prefix+i;
  const merged=Object.fromEntries(catalog.docs.map(d=>[d.id,d.data().items||[]]));for(const [kind,items] of Object.entries(pack.catalog||{})){merged[kind]||=[];for(const item of items){const old=merged[kind].find(x=>x.id===item.id);if(old&&JSON.stringify(old)!==JSON.stringify(item))fail('catalog-id-conflict');if(!old)merged[kind].push(item)}}if(Object.values(merged).reduce((n,items)=>n+items.length,0)>80)fail('catalog-limit');
  if(ids.some(id=>pack.characters[id].homeId&&!pack.homes[pack.characters[id].homeId]))fail('unmapped-home');
  const groups=pack.characterGroups||[],views=Object.entries(pack.characterViews||{}).flatMap(([a,row])=>Object.entries(row).filter(([b])=>ids.includes(a)&&ids.includes(b)).map(([b,v])=>({a,b,v})));
  if(ids.length*2+Object.keys(pack.homes).length+Object.keys(pack.relationships).length+groups.length+views.length+Object.keys(merged).length+5>450)fail('package-too-many-records');
  const relations=Object.values(pack.relationships);
  const participants=r=>r.groupMembers?.length?r.groupMembers:r.memberIds?.length?r.memberIds:[r.a,r.b].filter(Boolean);
  if(relations.some(r=>participants(r).some(id=>!ids.includes(id)))||groups.some(r=>(r.memberIds||[]).some(id=>!ids.includes(id))))fail('unmapped-character');
  slots.reserve();
  for(const [kind,items] of Object.entries(merged))tx.set(root.collection('catalog').doc(kind),{items,updatedAt:clock()});
  for(const [id,h] of Object.entries(pack.homes)){const layout=remap(h,map);tx.create(root.collection('homes').doc(map[id]),{ownerUid:uid,sourceHomeId:id,townId:tid,name:h.name||pack.name,layoutJson:JSON.stringify(layout),mapX:h.mapX??50,mapY:h.mapY??50,mapScale:h.mapScale??1,exteriorImage:h.exteriorImage||'',layoutRevision:0,visitPolicy:'members'})}
  ids.forEach((id,i)=>{const c=pack.characters[id],profile=remap(c,map),homeId=map[c.homeId]||'';tx.create(root.collection('residents').doc(map[id]),{ownerUid:uid,sourceCharacterId:id,sourceHomeId:c.homeId||'',sharedHomeId:homeId,...((c.residences||[]).some(r=>pack.homes[r.homeId])?{residences:(c.residences||[]).filter(r=>pack.homes[r.homeId]).map(r=>remap(r,map))}:{}),townId:tid,name:c.name,job:c.jobTitle||c.job||'',icon:c.icon||'',photo:c.photo||'',profileJson:JSON.stringify(profile),scheduleJson:JSON.stringify({routines:remap(pack.routines?.[id]||[],map),monthlyRoutines:remap(pack.monthlyRoutines?.[id]||[],map)}),independentCharacter:true,movedCharacter:true,joinedAt:clock()});tx.set(user.collection('characterTransfers').doc(id),{personalId:id,location:'group',groupId:gid,residentId:map[id],homeId:c.homeId||id,homeTownId:pack.town.id,revision:(transfers[i].data()?.revision||0)+1,updatedAt:clock()})});
  for(const [id,r] of Object.entries(pack.relationships))tx.create(root.collection('relationships').doc(map[id]),remap(r,map));
  for(const r of groups)tx.create(root.collection('characterGroups').doc(map[r.id]),remap(r,map));
  for(const {a,b,v} of views)tx.create(root.collection('perceptions').doc(map[a]+'_'+map[b]),{sourceId:map[a],targetId:map[b],viewJson:JSON.stringify(remap(v,map))});
  tx.update(root,{towns:g.data().towns.map(t=>t.id===tid?{...remap(pack.town,map),id:tid,slotOwnerUid:t.slotOwnerUid||g.data().ownerUid}:t),buildingRevision:(Number(g.data().buildingRevision)||0)+1,lifeUpdatedAt:0});
  tx.create(receipt,{kind:'world',personalId:'world:'+requestId,groupId:gid,townId:tid,sourceTownId:pack.town.id,homeIds:Object.keys(pack.homes),relationshipIds:Object.keys(pack.relationships),characterGroupIds:groups.map(g=>g.id),characterIds:ids,updatedAt:clock()});return {moved:true};
 })
});
module.exports.validate=validate;module.exports.remap=remap;
