const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status})};
const id=v=>{if(typeof v!=='string'||!v||v.length>180||/[\/\x00-\x1f]/.test(v))fail('invalid-id');return v};
const rows=s=>s.docs.map(d=>({id:d.id,...d.data()}));
function createSharedTownService({db,engine,clock=Date.now}){
  async function context(tx,groupId,uid){
    const ref=db.collection('groups').doc(id(groupId));
    const [g,m]=await Promise.all([tx.get(ref),tx.get(ref.collection('members').doc(uid))]);
    if(!g.exists||!m.exists)fail('group-membership-required',403);
    return {ref,group:{id:g.id,...g.data()},member:m.data()};
  }
  return {
    advance:async(uid,input)=>{
      const advance=await engine();
      return db.runTransaction(async tx=>{
        const {ref,group}=await context(tx,input.groupId,uid),now=clock();
        if(!input.command&&now-Number(group.lifeUpdatedAt||0)<60000)return {updated:false};
        const [r,h,relationships,declarations,catalog,perceptions]=await Promise.all([tx.get(ref.collection('residents')),tx.get(ref.collection('homes')),tx.get(ref.collection('relationships')),tx.get(ref.collection('declarations')),tx.get(ref.collection('catalog')),tx.get(ref.collection('perceptions'))]);
        const residents=rows(r);if(residents.length>200)fail('group-population-limit',409);
        if(input.command){
          const c=residents.find(r=>r.id===input.command.characterId);if(!c||c.ownerUid!==uid)fail('character-owner-required',403);
          if(!['wake','wash','meal','read','rest','walk','study','chores','talk','dine'].includes(input.command.kind))fail('invalid-command');
          if(['talk','dine'].includes(input.command.kind)&&!residents.some(r=>r.id===input.command.targetId&&r.id!==c.id&&r.townId===c.townId))fail('invalid-companion');
          if(now-Number(c.commandAt||0)<5000)fail('command-rate-limit',429);
        }
        const lives=advance({group,residents,homes:rows(h),relationships:rows(relationships),declarations:rows(declarations),catalog:rows(catalog),perceptions:rows(perceptions)},input.command?now:Math.floor(now/60000)*60000,input.command||null);
        for(const life of lives)tx.update(ref.collection('residents').doc(life.id),{lifeJson:life.lifeJson,...(input.command?.characterId===life.id?{commandAt:now}:{})});
        tx.update(ref,{lifeUpdatedAt:now});return {updated:true,count:lives.length};
      });
    },
    publishCatalog:async(uid,input)=>db.runTransaction(async tx=>{
      const {ref,member}=await context(tx,input.groupId,uid);
      if(!['owner','manager','operator'].includes(member.role))fail('groups/manager-required',403);
      const kinds=['food','drink','fashion','music','idol','book','movie','game','perfume','hobby','electronics','ingredient','weapon','animal','flower','misc'];
      if(!input.catalog||typeof input.catalog!=='object'||Array.isArray(input.catalog))fail('invalid-catalog');
      const existing=rows(await tx.get(ref.collection('catalog')));
      for(const kind of Object.keys(input.catalog)){
        const incoming=input.catalog[kind];if(!kinds.includes(kind)||!Array.isArray(incoming)||incoming.length>80)fail('catalog-limit');
        if(incoming.some(item=>!item||typeof item!=='object'||typeof item.id!=='string'||typeof item.name!=='string'||item.id.length>180||item.name.length>200))fail('invalid-catalog-item');
        const merged=new Map((existing.find(c=>c.id===kind)?.items||[]).map(item=>[item.id,item]));for(const item of incoming)merged.set(item.id,{...item,kind});const items=[...merged.values()];if(items.length>80)fail('catalog-limit',409);
        if(JSON.stringify(items).length>100000)fail('catalog-size-limit');
        tx.set(ref.collection('catalog').doc(kind),{items,updatedAt:clock()});
      }
      tx.update(ref,{lifeUpdatedAt:0});return {saved:true};
    }),
    saveBuilding:async(uid,input)=>db.runTransaction(async tx=>{
      const {ref,group,member}=await context(tx,input.groupId,uid);
      if(!['owner','manager','operator'].includes(member.role))fail('groups/manager-required',403);
      const towns=structuredClone(group.towns||[]),town=towns.find(t=>t.id===input.townId);if(!town)fail('town-missing',404);
      const revision=Number(group.buildingRevision)||0;if(Number(input.revision||0)!==revision)fail('groups/edit-conflict',409);
      town.places??=[];const key=id(input.id),old=town.places.find(p=>p.id===key);
      if(input.remove){if(!old)fail('building-missing',404);town.places=town.places.filter(p=>p.id!==key)}
      else{
        const name=String(input.name||'').trim().slice(0,60);if(!name)fail('name-required');
        const types=['음식점','카페','공원','상점','병원','직장','학교','도서관'];if(!types.includes(input.type)&&input.type!==old?.type)fail('building-type-invalid');
        if(!old&&town.places.length>=80)fail('building-limit',409);
        const place={...old,id:key,name,type:input.type,x:Math.min(95,Math.max(5,Number(input.x)||50)),y:Math.min(95,Math.max(5,Number(input.y)||50)),stock:old?.stock||[]};
        if(old)Object.assign(old,place);else town.places.push(place);
      }
      tx.update(ref,{towns,buildingRevision:revision+1,lifeUpdatedAt:0});return {saved:true};
    })
  };
}
module.exports={createSharedTownService};
