import {mapConcurrent} from './bounded-work.js?v=20260909dev305';

// Independent character histories can overlap. Keep the final order stable and
// never return a partial account when one read fails.
export async function readCloudCharacters(documents,{readDays,decode,limit=4,yieldWork=()=>new Promise(resolve=>setTimeout(resolve,0))}){
 const entries=await mapConcurrent(documents,limit,async snapshot=>{
  const data=snapshot.data()||{},character=decode(data.character||{});
  const id=String(data.characterId||character.id||snapshot.id),days={};
  const snapshots=await readDays(id);
  let deadline=performance.now()+8;
  for(const daySnapshot of snapshots.docs){
   const day=daySnapshot.data()||{};
   days[String(day.dateKey||daySnapshot.id)]=decode(day.day||{});
   if(performance.now()>deadline){await yieldWork();deadline=performance.now()+8;}
  }
  return [id,{...character,id:character.id||id,days}];
 });
 return Object.fromEntries(entries);
}
