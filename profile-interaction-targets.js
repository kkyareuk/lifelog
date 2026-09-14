// Repair only a known authored direct interaction, never arbitrary player text.
export function repairProfileInteractionTargets(world){
 const people=Object.values(world.characters||{}),names=new Map();
 for(const c of people){if(!names.has(c.name))names.set(c.name,[]);names.get(c.name).push(c.id)}
 for(const c of people)for(const day of Object.values(c.days||{}))for(const entry of day.entries||[]){
  if(!entry.profileScene||entry.withId)continue;
  const title=String(entry.title||''),match=title.match(/^(.*?)에게 말을 세 번 끊지 말라고 따지는 중$/)||title.match(/^Confronting (.*?) for interrupting three times$/)||title.match(/^(.*?)に三度も話を遮らないよう問い詰めるところ$/);
  const ids=match?names.get(match[1])||[]:[];if(ids.length!==1||ids[0]===c.id)continue;
  entry.withId=ids[0];entry.withIds=[ids[0]];
 }
 return world;
}
