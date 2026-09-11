// Account-scoped durable answer deltas; cleared only after a full save succeeds.
const KEY='drawer-village-answer-journal-v1';
export function writeAnswerDelta(storage,id,patch,at=Date.now()){
 const pending=JSON.parse(storage.getItem(KEY)||'{}');
 pending[id]={at,patch:{...pending[id]?.patch,...patch}};
 storage.setItem(KEY,JSON.stringify(pending));
}
export function replayAnswerDeltas(storage,world){
 try{const pending=JSON.parse(storage.getItem(KEY)||'{}');for(const [id,item] of Object.entries(pending)){
  if(world?.characters?.[id]&&item.at>Number(world.lastSaved||0)&&item.at>Number(world.gameResetAt||0))Object.assign(world.characters[id],item.patch);
 }}catch{}return world;
}
export function clearAnswerDeltas(storage){try{storage.removeItem(KEY)}catch{}}
