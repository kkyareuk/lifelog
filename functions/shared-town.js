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
    saveHomePlacement:async(uid,input)=>db.runTransaction(async tx=>{
      const {ref,group,member}=await context(tx,input.groupId,uid);
      if(!['owner','manager','operator'].includes(member.role))fail('groups/manager-required',403);
      const homeRef=ref.collection('homes').doc(id(input.id)),snap=await tx.get(homeRef);if(!snap.exists&&!input.create)fail('home-missing',404);
      if(input.create){if(snap.exists)fail('home-exists',409);const homes=await tx.get(ref.collection('homes'));if(homes.docs.length>=200)fail('home-limit',409);if(!group.towns?.some(t=>t.id===input.townId))fail('town-missing',404)}
      const revision=Number(group.buildingRevision)||0;if(Number(input.revision||0)!==revision)fail('groups/edit-conflict',409);
      const home=snap.exists?snap.data():{ownerUid:uid,sourceHomeId:input.id,townId:input.townId,name:'새 집',mapX:50,mapY:50,layoutJson:JSON.stringify({floorCount:1,rooms:{living:{name:'거실',type:'living',furniture:['소파','TV'],size:'보통 방',floor:1,x:0,y:0,w:2,h:2},bedroom:{name:'침실',type:'bedroom',furniture:['침대','옷장'],size:'보통 방',floor:1,x:2,y:0,w:2,h:2},kitchen:{name:'주방',type:'kitchen',furniture:['식탁','냉장고'],size:'보통 방',floor:1,x:0,y:2,w:2,h:2},bathroom:{name:'욕실',type:'bath',furniture:['세면대'],size:'보통 방',floor:1,x:2,y:2,w:2,h:2}}}),residentNames:[],visitPolicy:'members'},patch=input.patch||{},numbers={mapX:[5,95],mapY:[5,95],mapScale:[.1,4],mapZ:[-100,1000]};
      for(const [key,value] of Object.entries(patch)){
        if(numbers[key]){const [lo,hi]=numbers[key];if(!Number.isFinite(value)||value<lo||value>hi)fail('invalid-home-value')}
        else if(key==='mapFlipX'){if(typeof value!=='boolean')fail('invalid-home-value')}
        else if(['name','buildingSubtype','exteriorStyle','reputation','atmosphere','beautyLevel','lightingMode','lightOnTime','lightOffTime','iconPreset','exteriorImage'].includes(key)){if(typeof value!=='string'||value.length>2000||/^(data:|blob:)/i.test(value))fail('invalid-home-value')}
        else fail('invalid-home-field');
      }
      if(input.create)tx.set(homeRef,{...home,...patch});else tx.update(homeRef,patch);tx.update(ref,{buildingRevision:revision+1,lifeUpdatedAt:0});return {saved:true,revision:revision+1,home:{...home,...patch,id:input.id}};
    }),
    saveDecoration:async(uid,input)=>db.runTransaction(async tx=>{
      const {ref,group,member}=await context(tx,input.groupId,uid);
      if(!['owner','manager','operator'].includes(member.role))fail('groups/manager-required',403);
      const revision=Number(group.buildingRevision)||0;if(Number(input.revision||0)!==revision)fail('groups/edit-conflict',409);
      const towns=structuredClone(group.towns||[]),town=towns.find(t=>t.id===input.townId);if(!town)fail('town-missing',404);
      town.decorations??=[];const key=id(input.id),old=town.decorations.find(d=>d.id===key);
      if(input.remove){town.decorations=town.decorations.filter(d=>d.id!==key)}
      else {
        if(!old&&town.decorations.length>=200)fail('decoration-limit',409);
        const item={id:key,x:50,y:50,scale:1,...old},numbers={x:[5,95],y:[5,95],scale:[.1,4],mapZ:[-100,1000]};
        for(const [field,value] of Object.entries(input.patch||{})){
          if(numbers[field]){const [lo,hi]=numbers[field];if(!Number.isFinite(value)||value<lo||value>hi)fail('invalid-decoration');item[field]=value}
          else if(field==='flipX'){if(typeof value!=='boolean')fail('invalid-decoration');item[field]=value}
          else if(['kind','name','emoji'].includes(field)){if(typeof value!=='string'||value.length>100)fail('invalid-decoration');item[field]=value}
          else fail('invalid-decoration-field');
        }
        if(old)Object.assign(old,item);else town.decorations.push(item);
      }
      tx.update(ref,{towns,buildingRevision:revision+1,lifeUpdatedAt:0});return {saved:true,revision:revision+1,town};
    }),
    saveTown:async(uid,input)=>db.runTransaction(async tx=>{
      const {ref,group,member}=await context(tx,input.groupId,uid);
      if(!['owner','manager','operator'].includes(member.role))fail('groups/manager-required',403);
      const towns=structuredClone(group.towns||[]),town=towns.find(t=>t.id===input.townId);if(!town)fail('town-missing',404);
      const revision=Number(group.buildingRevision)||0;if(Number(input.revision||0)!==revision)fail('groups/edit-conflict',409);
      const fields=['name','townType','townSubtype','density','urbanization','reputation','fameLevel','size','terrain','description','era','bg','travelAllowed','transportModes'];
      for(const [key,value] of Object.entries(input.patch||{})){
        if(!fields.includes(key))fail('invalid-town-field');
        if(key==='travelAllowed'){if(typeof value!=='boolean')fail('invalid-value');town[key]=value}
        else if(key==='transportModes'){if(!Array.isArray(value)||value.length>20||value.some(v=>typeof v!=='string'||v.length>80))fail('invalid-value');town[key]=value}
        else {if(typeof value!=='string'||value.length>2000)fail('invalid-value');town[key]=value}
      }
      tx.update(ref,{towns,buildingRevision:revision+1,lifeUpdatedAt:0});return {saved:true,revision:revision+1,town};
    }),
    saveBuilding:async(uid,input)=>db.runTransaction(async tx=>{
      const {ref,group,member}=await context(tx,input.groupId,uid);
      if(!['owner','manager','operator'].includes(member.role))fail('groups/manager-required',403);
      const towns=structuredClone(group.towns||[]),town=towns.find(t=>t.id===input.townId);if(!town)fail('town-missing',404);
      const revision=Number(group.buildingRevision)||0;if(Number(input.revision||0)!==revision)fail('groups/edit-conflict',409);
      town.places??=[];const key=id(input.id),old=town.places.find(p=>p.id===key);
      if(input.remove){if(!old)fail('building-missing',404);town.places=town.places.filter(p=>p.id!==key)}
      else{
        const name=String(input.name||old?.name||'').trim().slice(0,60);if(!name)fail('name-required');
        input.type??=old?.type;
        const types=['음식점','카페','공원','상점','병원','직장','학교','도서관','공연장','옷가게','사무실','쇼핑몰','숙박','관공서','기타'];if(!types.includes(input.type)&&input.type!==old?.type)fail('building-type-invalid');
        if(!old&&town.places.length>=80)fail('building-limit',409);
        const place={...old,id:key,name,type:input.type,x:Math.min(95,Math.max(5,Number(input.x??old?.x)||50)),y:Math.min(95,Math.max(5,Number(input.y??old?.y)||50)),stock:old?.stock||[]};
        const strings=['name','subtype','art','image','photo','description','open','close','audience','atmosphere','priceRange','reputation','fameLevel','lightingMode','lightOnTime','lightOffTime','iconPreset','interiorImage'];
        const numbers={imageScale:[.1,4],zIndex:[-100,1000],mapZ:[-100,1000],capacity:[0,10000],spicy:[0,10],sweet:[0,10]};
        for(const [field,value] of Object.entries(input.patch||{})){
          if(strings.includes(field)){if(typeof value!=='string'||value.length>2000||/^(data:|blob:)/i.test(value))fail('invalid-building-value');place[field]=value}
          else if(numbers[field]){const [lo,hi]=numbers[field];if(typeof value!=='number'||!Number.isFinite(value)||value<lo||value>hi)fail('invalid-building-value');place[field]=value}
          else if(['stock','audiences'].includes(field)){if(!Array.isArray(value)||value.length>200||value.some(v=>typeof v!=='string'||v.length>180))fail('invalid-building-value');place[field]=value}
          else if(field==='flipX'){if(typeof value!=='boolean')fail('invalid-building-value');place[field]=value}
          else fail('invalid-building-field');
        }
        if(!place.name.trim())fail('name-required');
        if(old)Object.assign(old,place);else town.places.push(place);
      }
      tx.update(ref,{towns,buildingRevision:revision+1,lifeUpdatedAt:0});return {saved:true,revision:revision+1,town};
    })
  };
}
module.exports={createSharedTownService};
