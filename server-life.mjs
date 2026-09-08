globalThis.localStorage??={getItem:()=>null,setItem(){},removeItem(){}};
globalThis.document??={querySelector:()=>null,addEventListener(){},activeElement:null};
globalThis.window??={addEventListener(){},dispatchEvent(){}};
process.env.TZ='Asia/Seoul';
const {directCharacterActivity,runIsolatedWorld}=await import('./state.js?v=20260909dev290');
const {buildSharedWorld}=await import('./shared-world.js?v=20260909dev290');
const {eventFor,withSimulationBatch}=await import('./simulation.js?v=20260909dev290');
export function advanceSharedLife(snapshot,now,command=null){
  const world=buildSharedWorld(snapshot);
  return runIsolatedWorld(world,()=>withSimulationBatch(()=>{
    const date=new Date(now),scenes={};
    if(command){const accepted=directCharacterActivity(command.characterId,command.kind,{targetId:command.targetId||"",topic:command.topic||"",subjectId:command.subjectId||"",positions:command.positions,giftSource:command.kind==="gift"?{id:"gift-"+now,interactionId:"gift-"+now,actorId:command.characterId,targetId:command.targetId,itemId:command.itemId,itemKind:command.itemKind,stamp:now}:null,now});if(!accepted)throw Object.assign(new Error('activity-location-required'),{code:'activity-location-required',status:400})}
    for(const id of [...world.order].sort())eventFor(world.characters[id],date);
    for(const id of world.order){
      scenes[id]=eventFor(world.characters[id],date);
      const announcement=(snapshot.declarations||[]).find(d=>d.until>now&&d.participantIds.includes(id));
      if(announcement){const other=announcement.participantIds.find(x=>x!==id);scenes[id]={...scenes[id],title:`${announcement.sourceName}와 ${announcement.targetName}가 ${announcement.type} 관계를 맺었다고 선언하는 중`,desc:'서로 수락한 관계를 함께 확인하고 있어요.',copy:{en:{title:`${announcement.sourceName} and ${announcement.targetName} are announcing their relationship`,desc:'They are celebrating the relationship they both accepted.'},ja:{title:`${announcement.sourceName}と${announcement.targetName}が関係を宣言しています`,desc:'互いに承認した関係を一緒に確かめています。'}},relationshipDeclaration:true,withId:other,withIds:[other],participantOrder:announcement.participantIds,groupInteraction:true,interactionId:announcement.id};
        const key=`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`,day=world.characters[id].days?.[key];if(day&&!day.entries.some(e=>e.interactionId===announcement.id))day.entries.push(scenes[id]);
      }
    }
    return world.order.map(id=>{
      const c=world.characters[id],days=Object.fromEntries(Object.entries(c.days||{}).sort(([a],[b])=>{const stamp=k=>{const [y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d).getTime()};return stamp(a)-stamp(b)}).slice(-2).map(([key,day])=>[key,{...day,entries:(day.entries||[]).slice(-80)}]));
      let json=JSON.stringify({scene:scenes[id],timelineResetAt:c.timelineResetAt||0,days,directive:world.characterDirectives?.[id]||null});
      if(Buffer.byteLength(json)>120000){for(const d of Object.values(days)){delete d.signature;d.entries=d.entries.slice(-30)}json=JSON.stringify({scene:scenes[id],timelineResetAt:c.timelineResetAt||0,days,directive:world.characterDirectives?.[id]||null})}
      if(Buffer.byteLength(json)>200000)throw new Error('Shared life exceeds document budget');
      return {id,lifeJson:json};
    });
  }));
}
